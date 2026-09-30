/*!
 * Liquid Glass — rendering/renderer.js
 * ----------------------------------------------------------------------------
 * One LiquidGlassRenderer owns one <canvas>/WebGL2 context and compiles the
 * shader program exactly once (in the constructor) — every subsequent
 * render() call reuses that program and the same static quad buffer, only
 * updating uniforms and re-uploading the backdrop texture. No per-frame
 * shader compilation, no per-frame buffer allocation (§23).
 *
 * KNOWN SCOPE LIMIT, stated plainly rather than glossed over: this
 * implementation gives each LiquidGlassGPU instance (rendering/compositor.js)
 * its own canvas + WebGL2 context + compiled program. For a handful of glass
 * surfaces on a page this is simple and fine; a page with many dozens of GPU
 * glass surfaces would benefit from ONE shared context/program rendering all
 * of them via viewport/scissor, which this version does not implement. See
 * docs/GPU-RENDERER.md "Known limitations."
 * ----------------------------------------------------------------------------
 */
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from './shaders.js';
import { QUALITY_FEATURES } from './quality.js';
import { specularSizeToShininess } from '../core/glass-material.js';

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('LiquidGlassRenderer: gl.createShader returned null (context lost or exhausted)');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || (gl.isContextLost() ? 'WebGL context lost' : 'Unknown compilation error');
    gl.deleteShader(shader);
    throw new Error(`LiquidGlassRenderer: shader compile failed — ${log}`);
  }
  return shader;
}

function linkProgram(gl, vsSource, fsSource) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`LiquidGlassRenderer: program link failed — ${log}`);
  }
  return program;
}

const UNIFORM_NAMES = [
  'u_backdrop', 'u_backdropUvOrigin', 'u_backdropUvScale', 'u_texelSize',
  'u_shapeSize', 'u_radius', 'u_shapeType',
  'u_refractionStrength', 'u_centerRefraction', 'u_edgeRefraction', 'u_edgeFalloff',
  'u_thickness', 'u_diffusionStrength', 'u_tint', 'u_tintAlpha',
  'u_fresnelStrength', 'u_fresnelExponent', 'u_specularStrength', 'u_shininess',
  'u_dispersionStrength', 'u_lightDir', 'u_ior',
  'u_enableRefraction', 'u_enableDiffusion', 'u_enableFresnel', 'u_enableSpecular', 'u_enableDispersion'
];

function hexToRgb01(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function lightDirFromAngles(azimuthDeg, elevationDeg) {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  return [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
}

export class LiquidGlassRenderer {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    // preserveDrawingBuffer:true costs a little GPU-side copy per frame,
    // but without it, reading this canvas back via drawImage/toDataURL
    // from outside its own render call can return a blank buffer (a
    // well-known WebGL gotcha) — real integrators screenshotting or
    // compositing this canvas elsewhere need that to work reliably.
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('LiquidGlassRenderer: WebGL2 is not available in this context.');
    this.gl = gl;

    this.program = linkProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    this.uniforms = {};
    for (const name of UNIFORM_NAMES) this.uniforms[name] = gl.getUniformLocation(this.program, name);

    // Static fullscreen-quad buffer, created once, reused every frame.
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.lightAzimuth = 235;
    this.lightElevation = 55;
    this._disposed = false;
  }

  resize(cssWidth, cssHeight, dpr = 1) {
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  /**
   * Draws one frame.
   * @param {import('./backdrop.js').TextureBackdropSource} backdropSource
   * @param {ReturnType<import('../geometry/shapes.js').Shapes[keyof typeof import('../geometry/shapes.js').Shapes]>} shape
   * @param {ReturnType<import('../core/glass-material.js').resolveMaterial>} material
   * @param {string} quality  a QualityTier value
   * @param {{x:number,y:number,width:number,height:number}} backdropRect  where this glass sits within backdropSource's own pixel space
   * @param {object} [featureOverrides]  DEBUG-ONLY: per-call overrides merged on top of QUALITY_FEATURES[quality] — see compositor.js setDebugFeatureOverrides()
   */
  render(backdropSource, shape, material, quality, backdropRect, featureOverrides) {
    const gl = this.gl;
    const features = featureOverrides ? { ...QUALITY_FEATURES[quality], ...featureOverrides } : QUALITY_FEATURES[quality];
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!features.useGPU) return; // LOW/FALLBACK: compositor.js handles the CSS-only presentation instead — nothing to draw here

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    const texture = backdropSource.read(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.uniforms.u_backdrop, 0);

    const srcW = backdropSource.source.videoWidth || backdropSource.source.width || 1;
    const srcH = backdropSource.source.videoHeight || backdropSource.source.height || 1;
    gl.uniform2f(this.uniforms.u_backdropUvOrigin, backdropRect.x / srcW, backdropRect.y / srcH);
    gl.uniform2f(this.uniforms.u_backdropUvScale, backdropRect.width / srcW, backdropRect.height / srcH);
    gl.uniform2f(this.uniforms.u_texelSize, 1 / srcW, 1 / srcH);

    gl.uniform2f(this.uniforms.u_shapeSize, shape.width, shape.height);
    gl.uniform1f(this.uniforms.u_radius, shape.radius || 0);
    gl.uniform1i(this.uniforms.u_shapeType, shape.type === 'circle' ? 1 : 0);

    gl.uniform1f(this.uniforms.u_refractionStrength, material.refractionStrength);
    gl.uniform1f(this.uniforms.u_centerRefraction, material.centerRefraction);
    gl.uniform1f(this.uniforms.u_edgeRefraction, material.edgeRefraction);
    gl.uniform1f(this.uniforms.u_edgeFalloff, material.edgeFalloff);
    gl.uniform1f(this.uniforms.u_thickness, material.thickness);
    gl.uniform1f(this.uniforms.u_diffusionStrength, material.diffusionStrength);
    gl.uniform3fv(this.uniforms.u_tint, hexToRgb01(material.tint));
    gl.uniform1f(this.uniforms.u_tintAlpha, material.tintAlpha);
    gl.uniform1f(this.uniforms.u_fresnelStrength, material.fresnelStrength);
    gl.uniform1f(this.uniforms.u_fresnelExponent, material.fresnelExponent);
    gl.uniform1f(this.uniforms.u_specularStrength, material.specularStrength);
    gl.uniform1f(this.uniforms.u_shininess, specularSizeToShininess(material.specularSize));
    gl.uniform1f(this.uniforms.u_dispersionStrength, material.dispersionStrength * features.dispersionScale);
    gl.uniform3fv(this.uniforms.u_lightDir, lightDirFromAngles(this.lightAzimuth, this.lightElevation));
    gl.uniform1f(this.uniforms.u_ior, material.refractiveIndex);

    gl.uniform1i(this.uniforms.u_enableRefraction, features.refraction ? 1 : 0);
    gl.uniform1i(this.uniforms.u_enableDiffusion, features.diffusion ? 1 : 0);
    gl.uniform1i(this.uniforms.u_enableFresnel, features.fresnel ? 1 : 0);
    gl.uniform1i(this.uniforms.u_enableSpecular, features.specular ? 1 : 0);
    // features.dispersionScale is the *tier's* multiplier (1/0.4/0 across
    // FULL/HIGH/MEDIUM+); features.dispersion is the separate boolean a
    // debug-override merge (see compositor.js setDebugFeatureOverrides)
    // patches in on top. Checking dispersionScale alone here was a real
    // bug caught by test/visual-verify.mjs: it made the debug lab's
    // Dispersion checkbox silently do nothing, because no
    // QUALITY_FEATURES tier ever defines a `dispersion` key for the
    // override to shadow.
    const dispersionOn = features.dispersion !== false && features.dispersionScale > 0;
    gl.uniform1i(this.uniforms.u_enableDispersion, dispersionOn ? 1 : 0);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  dispose() {
    if (this._disposed) return;
    const gl = this.gl;
    gl.deleteProgram(this.program);
    gl.deleteBuffer(this.quadBuffer);
    gl.deleteVertexArray(this.vao);
    // Deleting GL objects above frees THEIR memory, but the WebGL2 CONTEXT
    // itself — the scarce resource browsers hard-cap per page (Chrome desktop
    // ~16, many mobile GPUs/WebViews meaningfully lower) — stays allocated
    // until the canvas is GC'd, which doesn't happen on any predictable
    // schedule. compositor.js tears a renderer down every time its glass
    // surface scrolls off-screen (see LiquidGlassGPU's IntersectionObserver),
    // specifically so that context can be handed back immediately for
    // whatever comes on-screen next — losing the context explicitly here is
    // what actually makes that handoff work instead of just leaking. Without
    // this, a page with more glass surfaces than the browser's context cap
    // (this project's own GPU showcase alone creates ~9) starts silently
    // losing its OLDEST contexts once the cap is hit — "WARNING: Too many
    // active WebGL contexts. Oldest context will be lost." in devtools — and
    // every surface using a lost context stops rendering (or renders
    // garbage) with no error thrown, which is what the visible "broken/blown
    // -up shapes near the tab bar" bug traced back to.
    const loseCtx = gl.getExtension('WEBGL_lose_context');
    if (loseCtx) loseCtx.loseContext();
    this._disposed = true;
  }
}
