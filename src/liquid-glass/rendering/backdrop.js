/*!
 * Liquid Glass — rendering/backdrop.js
 * ----------------------------------------------------------------------------
 * §24's BackdropProvider. Two implementations, for two genuinely different
 * situations — read this file before deciding which one a new integration
 * needs, because picking wrong means "my glass doesn't refract" for a
 * reason that has nothing to do with a bug:
 *
 * DomBackdropSource   — for glass sitting over arbitrary page content
 *                        (the normal case: nav bars, cards, buttons over a
 *                        real webpage). This is a thin marker; the actual
 *                        work is glass-engine.js's existing
 *                        injectLensFilter/backdrop-filter path, UNCHANGED.
 *                        WebGL has no API to read "whatever the browser
 *                        composited behind this element" for arbitrary DOM
 *                        — backdrop-filter is a compositor-level feature
 *                        with no WebGL equivalent — so this path
 *                        deliberately does NOT attempt GPU rendering at
 *                        all, on any browser.
 *
 * TextureBackdropSource — for glass sitting over content the HOST APP
 *                        already renders itself: a <canvas>, a <video>, an
 *                        OffscreenCanvas, or a WebGLTexture handed over
 *                        directly (e.g. another render target in a larger
 *                        WebGL/Three.js scene). Re-uploads/reads the source
 *                        every frame — see `read()` — so it stays live even
 *                        though, unlike backdrop-filter, it is the ENGINE
 *                        doing the sampling work, not the browser
 *                        compositor doing it for free.
 *
 * A <canvas> or <video> element is, technically, still "arbitrary DOM
 * content" and backdrop-filter CAN already bend it via DomBackdropSource on
 * Chromium — TextureBackdropSource is not required to make that work. Use
 * it instead when: the host app wants the effect on non-Chromium browsers
 * too, wants a truer per-fragment shader (real reflect()-based specular,
 * real per-channel texture fetches for dispersion) instead of the SVG
 * filter-primitive approximation, or is already compositing the "backdrop"
 * as a GPU texture/render-target and would rather hand it over directly
 * than round-trip through the DOM at all.
 * ----------------------------------------------------------------------------
 */

export class DomBackdropSource {
  constructor() {
    this.kind = 'dom';
    this.isLive = true; // the browser compositor re-samples every frame at zero engine cost
    this.usesGPU = false; // by design — see file header
  }
}

export class TextureBackdropSource {
  /** @param {HTMLCanvasElement|HTMLVideoElement|OffscreenCanvas|ImageBitmap} source */
  constructor(source) {
    this.kind = 'texture';
    this.isLive = true;
    this.usesGPU = true;
    this.source = source;
    this._texture = null;
    this._gl = null;
  }

  /** Lazily creates (once) and returns the WebGL texture this source uploads into. Called by renderer.js during setup, not by application code. */
  ensureTexture(gl) {
    if (this._texture && this._gl === gl) return this._texture;
    this._gl = gl;
    this._texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return this._texture;
  }

  /**
   * Re-uploads the current frame of `source` into the texture. Cheap on the
   * GPU (a single texImage2D call) but not free — this is real per-frame
   * work the engine does, unlike DomBackdropSource, which is why the
   * distinction in the file header matters for anyone deciding between the
   * two rather than just picking whichever sounds more advanced.
   */
  read(gl) {
    const texture = this.ensureTexture(gl);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
    return texture;
  }

  dispose(gl) {
    if (this._texture && gl) gl.deleteTexture(this._texture);
    this._texture = null;
  }
}
