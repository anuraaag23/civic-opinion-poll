/*!
 * Liquid Glass — rendering/quality.js
 * ----------------------------------------------------------------------------
 * IMPORTANT SCOPE NOTE: this quality ladder governs the NEW GPU renderer
 * only, which only ever applies to app-SUPPLIED texture backdrops (a
 * canvas/video/offscreen render target the host app hands the engine
 * directly — see rendering/backdrop.js). The 9 existing DOM components
 * (button, card, segmented, slider, toggle, tabbar, header, control-
 * buttons, checkbox/radio) sit over arbitrary live page content, which
 * WebGL has no API to read — that case is, and remains, entirely governed
 * by glass-engine.js's own capabilities.canRefract / data-lg-render
 * mechanism, completely unchanged by anything in this file. See
 * docs/GPU-RENDERER.md "Why there are two capability systems."
 * ----------------------------------------------------------------------------
 */

export const QualityTier = Object.freeze({
  FULL: 'full',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  FALLBACK: 'fallback'
});

/** What each tier turns on. renderer.js reads this; it never branches on the tier name itself. */
export const QUALITY_FEATURES = {
  [QualityTier.FULL]: { useGPU: true, refraction: true, dispersionScale: 1, specular: true, fresnel: true, diffusion: true },
  [QualityTier.HIGH]: { useGPU: true, refraction: true, dispersionScale: 0.4, specular: true, fresnel: true, diffusion: true },
  [QualityTier.MEDIUM]: { useGPU: true, refraction: true, dispersionScale: 0, specular: false, fresnel: true, diffusion: true },
  [QualityTier.LOW]: { useGPU: false, refraction: false, dispersionScale: 0, specular: false, fresnel: false, diffusion: true }, // plain CSS-composited texture: blur + tint, no shader at all
  [QualityTier.FALLBACK]: { useGPU: false, refraction: false, dispersionScale: 0, specular: false, fresnel: false, diffusion: false } // flat translucent panel, respects reduced-transparency/contrast
};

/**
 * @param {ReturnType<import('../core/glass-capabilities.js').detectCapabilities>} capabilities
 * @param {{ forceQuality?: string }} [options]
 */
export function selectQuality(capabilities, options = {}) {
  if (options.forceQuality) {
    if (!(options.forceQuality in QUALITY_FEATURES)) throw new Error(`selectQuality: unknown forced tier "${options.forceQuality}"`);
    return options.forceQuality;
  }
  if (capabilities.prefersReducedTransparency || capabilities.prefersIncreasedContrast) return QualityTier.FALLBACK;
  if (!capabilities.hasWebGL2) return QualityTier.LOW;
  return QualityTier.FULL;
}
