/*!
 * Liquid Glass — core/glass-material.js
 * ----------------------------------------------------------------------------
 * §16/§17 material system. This does NOT replace glass-tokens.css — the
 * tokens file is still what every existing component (button, card,
 * segmented, slider, toggle, tabbar, header, control-buttons, checkbox/
 * radio) reads for its SVG-lens/CSS look, and stays exactly as-is (see
 * docs/GPU-RENDERER.md "Why two material systems coexist"). This file is
 * the parameter surface for the NEW GPU renderer (rendering/renderer.js),
 * expanded per §16 to add the params the old --lg-lens-* tokens didn't
 * have a slot for: separate center/edge refraction, real Fresnel exponent,
 * specular size, dispersion, shadow.
 *
 * Where a concept exists in BOTH systems (edge-only lensing, tint, blur),
 * the numbers were picked to read as the same material, not two different
 * ones — LiquidGlassMaterial.Standard's edgeRefraction/edgeFalloff are the
 * GPU-renderer equivalent of --lg-lens-strength/--lg-lens-edge-width, not
 * an unrelated new tuning.
 * ----------------------------------------------------------------------------
 */

export const MATERIAL_SCHEMA = {
  // --- refraction -----------------------------------------------------------
  refractionStrength: { default: 0.55, min: 0, max: 1, doc: 'Overall multiplier applied on top of centerRefraction/edgeRefraction. The single knob most integrations only ever need to touch.' },
  centerRefraction: { default: 0, min: 0, max: 1, doc: 'Displacement at the shape\u2019s optical center, before refractionStrength. 0 (the default, matching the existing SVG lens\u2019s "lensing, not magnification" behavior — see glass-tokens.css §4) means the middle of a large glass sheet stays flat; raised above 0 the whole surface reads more like a magnifying lens than an edge-lit pane. Deliberately NOT hardcoded to 0 — see §8: some materials (a small circular loupe, say) legitimately want center distortion.' },
  edgeRefraction: { default: 1, min: 0, max: 1, doc: 'Displacement at the shape\u2019s boundary, before refractionStrength. This is the GPU-renderer equivalent of the legacy engine\u2019s --lg-lens-strength.' },
  edgeFalloff: { default: 0.62, min: 0.05, max: 1, doc: 'Fraction of the shape\u2019s shorter half-axis over which the response ramps from centerRefraction to edgeRefraction. Equivalent to --lg-lens-edge-width in the legacy system — kept as the same default (0.62) so the two paths read as one material.' },

  // --- volume -----------------------------------------------------------------
  thickness: { default: 0.6, min: 0, max: 1, doc: 'Perceived glass volume. Feeds the surface-normal steepness (steeper normal at the edge = a "thicker"-reading lens), the specular surfaceScale, and edge attenuation together.' },

  // --- diffusion / tint ---------------------------------------------------------
  diffusionStrength: { default: 0.15, min: 0, max: 1, doc: 'Blur applied to the refracted sample. Supporting role only — §14: never the primary effect. Kept deliberately light, matching glass-tokens.css\u2019s own §2 comment that a heavy pre-blur was found (by rendering the real chain) to wash out lensing before it ever ran.' },
  tint: { default: '#ffffff', doc: 'Base material color.' },
  tintAlpha: { default: 0.12, min: 0, max: 1, doc: 'Tint opacity. Low by default — real Liquid Glass reads as clear first, frosted second (glass-tokens.css §3).' },

  // --- lighting -----------------------------------------------------------------
  fresnelStrength: { default: 0.35, min: 0, max: 1, doc: 'Edge brightness from the Fresnel term. Restrained by design — §11 explicitly forbids neon/glow edges.' },
  fresnelExponent: { default: 4.5, min: 1, max: 12, doc: 'Falloff sharpness of pow(1 - dot(V,N), exponent). Physically-plausible glass/water Fresnel sits roughly in the 3–6 range; pushed toward 12 reads as a much tighter, more artificial rim.' },
  specularStrength: { default: 0.3, min: 0, max: 1, doc: 'Highlight intensity.' },
  specularSize: { default: 0.4, min: 0, max: 1, doc: 'Highlight softness: 0 = tight hard hotspot, 1 = broad soft sheen. Converted internally to a Blinn-Phong shininess exponent — see specularSizeToShininess() below.' },

  dispersionStrength: { default: 0.05, min: 0, max: 0.3, doc: 'Per-channel displacement offset fraction. Capped at 0.3 by schema — beyond that it reads as glitch, not glass (§15).' },
  refractiveIndex: { default: 1.4, min: 1.001, max: 1.6, doc: 'IOR fed directly into a real refract() call in the shader (rendering/shaders.js) and into the Schlick Fresnel term. 1.33 \u2248 water, 1.45\u20131.5 \u2248 typical glass/acrylic. This is the actual physical parameter driving both refraction and Fresnel now — refractionStrength/fresnelStrength remain as artistic multipliers on top of it, not a replacement for it.' },

  shadowStrength: { default: 0.5, min: 0, max: 1, doc: 'Interpolates across the existing three elevation shadow tiers (glass-tokens.css §2, --lg-shadow-1/2/3) rather than inventing a fourth shadow system — see shadowStrengthToBoxShadow() below.' }
};

function defaults() {
  const out = {};
  for (const [k, s] of Object.entries(MATERIAL_SCHEMA)) out[k] = s.default;
  return out;
}

export function resolveMaterial(overrides = {}) {
  const resolved = defaults();
  for (const [key, value] of Object.entries(overrides)) {
    if (!(key in MATERIAL_SCHEMA)) {
      throw new Error(`LiquidGlassMaterial: unknown parameter "${key}". Valid: ${Object.keys(MATERIAL_SCHEMA).join(', ')}`);
    }
    const spec = MATERIAL_SCHEMA[key];
    resolved[key] = typeof value === 'number' && spec.min !== undefined ? Math.min(spec.max, Math.max(spec.min, value)) : value;
  }
  return Object.freeze(resolved);
}

/** specularSize (0=tight..1=broad) -> Blinn-Phong shininess exponent (64=tight..4=broad). Inverted on purpose: "size" should grow as the visual highlight grows, which means the exponent shrinks. */
export function specularSizeToShininess(specularSize) {
  return 64 + (4 - 64) * specularSize;
}

/** Interpolates shadowStrength (0..1) across the three existing --lg-shadow-N tiers instead of inventing new shadow math. Returns a CSS box-shadow string. */
export function shadowStrengthToBoxShadow(shadowStrength) {
  const tiers = [
    { t: 0, shadow: 'none' },
    { t: 0.35, shadow: '0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.10)' }, // --lg-shadow-1
    { t: 0.7, shadow: '0 2px 6px rgba(0,0,0,0.10), 0 10px 28px rgba(0,0,0,0.16)' }, // --lg-shadow-2
    { t: 1, shadow: '0 6px 16px rgba(0,0,0,0.14), 0 20px 48px rgba(0,0,0,0.22)' } // --lg-shadow-3
  ];
  for (let i = 1; i < tiers.length; i++) {
    if (shadowStrength <= tiers[i].t) return tiers[i - 1].t === 0 && shadowStrength === 0 ? 'none' : tiers[i].shadow;
  }
  return tiers[tiers.length - 1].shadow;
}

/**
 * Presets — every one just resolveMaterial({...}), same renderer, no
 * bespoke path (§17). Clear/Frosted/Strong/Subtle numbers were picked to
 * match the *feel* of the equivalent existing CSS variants
 * ([data-lg-tinted-glass] etc. in glass-surface.css) as closely as two
 * different rendering techniques reasonably can.
 *
 * centerRefraction is intentionally NON-zero in every preset below, even
 * though the schema's own neutral default (MATERIAL_SCHEMA.centerRefraction,
 * used when you call resolveMaterial() with no overrides at all) stays 0.
 * A real audit found the glass reading as "frosted with only an edge
 * effect" specifically because every preset previously inherited that
 * neutral 0 — matching the legacy SVG lens's edge-only philosophy by
 * accident rather than by choice. Real glass, and the reference footage
 * this project targets, visibly bends content well inside the boundary.
 * See rendering/shaders.js for how centerRefraction now drives an actual
 * refract()-based interior curve instead of a flat interior.
 */
export const LiquidGlassMaterial = {
  Standard: resolveMaterial({ centerRefraction: 0.22 }),
  Clear: resolveMaterial({ diffusionStrength: 0.04, tintAlpha: 0.04, refractionStrength: 0.65, fresnelStrength: 0.3, centerRefraction: 0.32, refractiveIndex: 1.45 }),
  Frosted: resolveMaterial({ diffusionStrength: 0.4, tintAlpha: 0.24, refractionStrength: 0.28, dispersionStrength: 0.015, shadowStrength: 0.7, centerRefraction: 0.12 }),
  Strong: resolveMaterial({ thickness: 0.9, refractionStrength: 0.8, specularStrength: 0.45, fresnelStrength: 0.5, dispersionStrength: 0.1, shadowStrength: 0.85, centerRefraction: 0.4, refractiveIndex: 1.5 }),
  Subtle: resolveMaterial({ thickness: 0.35, refractionStrength: 0.3, specularStrength: 0.15, fresnelStrength: 0.2, tintAlpha: 0.06, shadowStrength: 0.3, centerRefraction: 0.15 }),
  custom: resolveMaterial
};
