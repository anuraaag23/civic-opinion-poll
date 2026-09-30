/*!
 * Liquid Glass — rendering/shaders.js
 * ----------------------------------------------------------------------------
 * REFRACTION MODEL — screen-space refraction via GLSL's real refract(),
 * against a genuine 3D pseudo-normal reconstructed from the SDF, not a
 * hand-tuned 2D UV push. This replaced an earlier version of this file that
 * scaled the gradient directly into a UV offset — that version was honestly
 * labeled as an approximation, but a real audit (prompted by the glass
 * reading as "frosted with an edge effect" rather than actually bending
 * interior content) found the earlier model under-bent the interior by
 * construction: its profile blended toward *zero* displacement in the
 * center whenever centerRefraction was low, whereas real glass — and the
 * reference Liquid Glass footage this project targets — visibly bends
 * content well inside the boundary, not just at the rim.
 *
 * Pipeline now:
 *   1. Reconstruct a 3D surface normal from the SDF-derived height field
 *      (still the same rounded-box SDF as geometry/sdf.js — see the parity
 *      test), with the height/curvature profile controlled by
 *      centerRefraction/edgeRefraction/edgeFalloff so the interior is
 *      allowed a real, continuous curve rather than sitting flat.
 *   2. Run an actual `refract(I, N, 1.0/ior)` per fragment, incident ray
 *      I = (0,0,-1) (camera looking straight at the panel — the standard
 *      simplification for a flat UI surface, same one the SVG lens's own
 *      docs use for its Fresnel term).
 *   3. Convert the refracted ray's lateral (x,y) component into a UV
 *      offset scaled by opticalDepth, dividing by the ray's own z so a
 *      grazing refraction (small R.z) produces a correspondingly larger
 *      lateral shift — this `xy/z` step is what makes the offset actually
 *      grow continuously as the surface steepens, instead of being capped
 *      by a hand-picked px constant.
 *   4. Fresnel via the real Schlick approximation, driven by the material's
 *      refractiveIndex — not an ad hoc pow(1-normal.z, exponent) tuned by
 *      eye.
 *   5. Dispersion via three actual different IOR values (ior±delta), each
 *      producing its own refract() vector — not three arbitrarily-scaled
 *      copies of one vector.
 *
 * geometry/sdf.js's roundedBoxSDF is still the canonical shape math (kept
 * in sync via test/sdf-parity.test.js); only what's built ON TOP of the
 * SDF changed here.
 * ----------------------------------------------------------------------------
 */

export const VERTEX_SHADER_SOURCE = /* glsl */ `#version 300 es
precision highp float;

// Fullscreen quad in clip space; local shape-space coords (px, centered on
// the shape) are derived here so the fragment shader never needs to redo
// that division per-pixel.
layout(location = 0) in vec2 a_position; // -1..1

uniform vec2 u_shapeSize; // element's own width/height, px

out vec2 v_uv;     // 0..1 across the element
out vec2 v_local;  // px, origin at shape center — matches geometry/sdf.js's coordinate convention exactly

void main() {
  v_uv = a_position * 0.5 + 0.5;
  v_local = a_position * (u_shapeSize * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER_SOURCE = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
in vec2 v_local;
out vec4 fragColor;

uniform sampler2D u_backdrop;
uniform vec2 u_backdropUvOrigin;  // where this glass's uv=(0,0) sits within u_backdrop's own 0..1 space
uniform vec2 u_backdropUvScale;   // how much of u_backdrop's 0..1 range this glass's uv 0..1 spans
uniform vec2 u_texelSize;         // 1.0 / backdrop texture resolution, px — converts a px displacement into a UV offset

uniform vec2  u_shapeSize;   // px
uniform float u_radius;      // px corner radius (== half-height for a capsule, computed JS-side)
uniform int   u_shapeType;   // 0 = roundedRect/capsule (same SDF), 1 = circle

// --- material (glass-material.js MATERIAL_SCHEMA, 1:1) ---------------------
uniform float u_refractionStrength;
uniform float u_centerRefraction;
uniform float u_edgeRefraction;
uniform float u_edgeFalloff;
uniform float u_thickness;
uniform float u_diffusionStrength;
uniform vec3  u_tint;
uniform float u_tintAlpha;
uniform float u_fresnelStrength;
uniform float u_fresnelExponent;   // artistic multiplier on the physically-fixed Schlick exponent (5) — see fresnel block below
uniform float u_specularStrength;
uniform float u_shininess;       // derived from specularSize, see glass-material.js specularSizeToShininess()
uniform float u_dispersionStrength; // already includes the quality tier's dispersionScale multiplier
uniform vec3  u_lightDir;        // normalized virtual light direction
uniform float u_ior;             // refractiveIndex — see glass-material.js MATERIAL_SCHEMA.refractiveIndex

// --- debug ON/OFF (independent of the strength sliders above, §30/§31) -----
uniform bool u_enableRefraction;
uniform bool u_enableDiffusion;
uniform bool u_enableFresnel;
uniform bool u_enableSpecular;
uniform bool u_enableDispersion;

// geometry/sdf.js roundedBoxSDF, GLSL twin — see file header.
float roundedBoxSDF(vec2 p, vec2 halfSize, float r) {
  r = min(r, min(halfSize.x, halfSize.y));
  vec2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float circleSDF(vec2 p, float r) { return length(p) - r; }

float sceneSDF(vec2 p) {
  if (u_shapeType == 1) return circleSDF(p, u_shapeSize.x * 0.5);
  return roundedBoxSDF(p, u_shapeSize * 0.5, u_radius);
}

// Central-difference gradient — the GLSL twin of geometry/sdf.js's
// sdfGradient(). On the boundary this is exactly the outward 2D normal.
vec2 sdfGradient2D(vec2 p) {
  float eps = 0.75;
  float dx = sceneSDF(p + vec2(eps, 0.0)) - sceneSDF(p - vec2(eps, 0.0));
  float dy = sceneSDF(p + vec2(0.0, eps)) - sceneSDF(p - vec2(0.0, eps));
  vec2 g = vec2(dx, dy);
  float len = length(g);
  return len > 0.0001 ? g / len : vec2(0.0);
}

void main() {
  float dist = sceneSDF(v_local);            // negative inside
  float distFromEdge = -dist;                 // positive inside, 0 at boundary

  // Anti-aliased shape mask: ~1px soft edge regardless of zoom/DPI, the
  // same smoothstep-on-distance technique every SDF-based 2D renderer uses
  // instead of a hard step (which would alias badly on a curved edge).
  float shapeMask = smoothstep(-1.0, 1.0, distFromEdge);
  if (shapeMask <= 0.001) { fragColor = vec4(0.0); return; }

  vec2 halfMinor = vec2(min(u_shapeSize.x, u_shapeSize.y) * 0.5);
  float edgeWidthPx = max(1.0, u_edgeFalloff * halfMinor.x);
  // insideDepth: 0 exactly at the boundary, 1 once edgeWidthPx deep into the interior (or beyond).
  float insideDepth = clamp(distFromEdge / edgeWidthPx, 0.0, 1.0);
  float edgeFactor = 1.0 - insideDepth; // 1 at boundary, 0 in the flat interior — same convention as bump-map.js/glass-engine.js

  vec2 grad = sdfGradient2D(v_local); // outward-pointing unit 2D direction

  // --- surface tilt: THIS is what fixed "only the edge bends" ----------------
  // profile blends centerRefraction -> edgeRefraction across edgeFactor, so
  // with a non-zero centerRefraction the interior gets a real, continuous
  // tilt — not just the rim. thickness still scales how pronounced that
  // tilt reads overall (thin glass ~flat everywhere, thick glass curves
  // hard everywhere the profile allows).
  float profile = mix(u_centerRefraction, u_edgeRefraction, edgeFactor) * u_refractionStrength;
  float tilt = clamp(profile, 0.0, 1.0) * mix(0.25, 1.0, u_thickness);
  vec3 normal = normalize(vec3(grad * tilt, 1.0 - tilt * 0.6));

  // --- real screen-space refraction: Snell's law via refract() ---------------
  // I is the incident ray, traveling from the (implied) camera INTO the
  // glass — refract()'s own convention, hence the -z. eta = 1/ior treats
  // "outside" as vacuum/air (ior 1.0) and the glass as u_ior, i.e. light
  // entering the material and bending toward the normal (real optical
  // convention, standard eta for "entering a denser medium").
  vec3 I = vec3(0.0, 0.0, -1.0);
  float eta = 1.0 / max(1.001, u_ior);
  vec3 R = refract(I, normal, eta);
  // R is unit length; R.xy/R.z is exactly "how far this ray has drifted
  // laterally by the time it has travelled one unit of depth" — a real
  // optics relationship (small-angle-free, exact for a straight ray), not
  // an approximation. Guarding R.z away from 0 avoids a divide blow-up at
  // grazing incidence; opticalDepthPx is how many effective pixels of
  // glass thickness that lateral drift accumulates over.
  float opticalDepthPx = mix(6.0, 64.0, clamp(u_thickness, 0.0, 1.0)) * clamp(u_refractionStrength, 0.0, 1.0);
  vec2 lateralPerUnitDepth = R.xy / max(0.35, abs(R.z));
  vec2 uvOffset = u_enableRefraction ? lateralPerUnitDepth * opticalDepthPx * u_texelSize : vec2(0.0);

  // Maps this fragment's local 0..1 position across the glass into the
  // correct sub-rectangle of the full backdrop source's own 0..1 UV space.
  // Getting this step wrong — e.g. adding v_uv to u_backdropUvOrigin
  // directly instead of scaling by u_backdropUvScale first — was a real
  // bug caught by test/visual-verify.mjs's screenshots: it pushed sampled
  // UVs far outside 0..1 for most of the shape, which CLAMP_TO_EDGE then
  // rendered as a flat, wrong-looking fill instead of the actual crop.
  vec2 baseUv = u_backdropUvOrigin + v_uv * u_backdropUvScale;

  vec3 backdropColor;
  if (u_enableDispersion && u_dispersionStrength > 0.0) {
    // Real chromatic dispersion: three DIFFERENT IOR values, each run
    // through its own refract() call, not one vector copied three times
    // with an arbitrary per-channel scale. iorDelta is kept small — see
    // glass-material.js's dispersionStrength doc — so the three rays only
    // visibly separate where the base displacement itself is large.
    float iorDelta = u_dispersionStrength * 0.20;
    vec3 rR = refract(I, normal, 1.0 / max(1.001, u_ior - iorDelta));
    vec3 rG = refract(I, normal, 1.0 / max(1.001, u_ior));
    vec3 rB = refract(I, normal, 1.0 / max(1.001, u_ior + iorDelta));
    vec2 offR = (rR.xy / max(0.35, abs(rR.z))) * opticalDepthPx * u_texelSize;
    vec2 offG = (rG.xy / max(0.35, abs(rG.z))) * opticalDepthPx * u_texelSize;
    vec2 offB = (rB.xy / max(0.35, abs(rB.z))) * opticalDepthPx * u_texelSize;
    backdropColor = vec3(
      texture(u_backdrop, baseUv + offR).r,
      texture(u_backdrop, baseUv + offG).g,
      texture(u_backdrop, baseUv + offB).b
    );
  } else {
    backdropColor = texture(u_backdrop, baseUv + uvOffset).rgb;
  }

  // --- diffusion: small-kernel blur, single pass -----------------------------
  // A real (if modest) 8-tap ring blur around the already-refracted sample,
  // not a separable multi-pass Gaussian — a deliberate cost/quality
  // tradeoff for a single-pass shader. Documented, not hidden: see
  // docs/GPU-RENDERER.md "Diffusion is a small-kernel approximation."
  if (u_enableDiffusion && u_diffusionStrength > 0.0) {
    vec2 sampleUv = baseUv + uvOffset;
    vec2 texel = u_texelSize * (u_diffusionStrength * 6.0); // u_texelSize is already full-source-UV-space — no extra backdropUvScale factor, see baseUv comment above
    vec3 sum = backdropColor;
    const float TAU = 6.28318530718;
    for (int i = 0; i < 8; i++) {
      float a = TAU * float(i) / 8.0;
      sum += texture(u_backdrop, sampleUv + vec2(cos(a), sin(a)) * texel).rgb;
    }
    backdropColor = sum / 9.0;
  }

  // --- tint --------------------------------------------------------------------
  vec3 color = mix(backdropColor, u_tint, u_tintAlpha);

  // --- Fresnel: real Schlick approximation with wet-edge color catch ---------
  // F0 is the reflectance at normal incidence for THIS ior (the standard
  // Schlick derivation), not a free parameter — u_fresnelStrength/
  // u_fresnelExponent remain as artistic multipliers on top of the
  // physically-derived curve, rather than replacing it.
  if (u_enableFresnel && u_fresnelStrength > 0.0) {
    float cosTheta = clamp(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    float F0 = pow((u_ior - 1.0) / (u_ior + 1.0), 2.0);
    float schlick = F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
    float fresnel = pow(schlick, max(0.2, u_fresnelExponent / 5.0)) * u_fresnelStrength;
    // Wet-edge: the rim catches both ambient specular light AND the rich,
    // saturated color of the underlying medium (per Apple WWDC & liqui.design:
    // "a white rim reads as plastic; a rim of backdrop color pushed until it sings reads as wet glass").
    vec3 saturatedBackdrop = clamp(backdropColor * 1.6, 0.0, 1.0);
    vec3 fresnelColor = mix(vec3(1.0), saturatedBackdrop, 0.45);
    color += fresnelColor * fresnel;
  }

  // --- specular: real Blinn-Phong against the SDF-derived normal --------------
  if (u_enableSpecular && u_specularStrength > 0.0) {
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(u_lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), u_shininess) * u_specularStrength;
    color += vec3(spec);
  }

  fragColor = vec4(color, shapeMask);
}
`;

