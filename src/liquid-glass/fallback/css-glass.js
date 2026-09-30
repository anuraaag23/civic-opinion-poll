/*!
 * Liquid Glass — fallback/css-glass.js
 * ----------------------------------------------------------------------------
 * The lowest DOM-backdrop tier: plain `backdrop-filter: blur()` + tint, no
 * lensing at all. This is what every non-Blink browser already gets today
 * via glass-tokens.css's `[data-lg-render="frosted"]` compensation block
 * (heavier blur, since there's no edge distortion doing any of the visual
 * separation work there) — nothing new is implemented here, this file is
 * the same documented marker pattern as fallback/svg-refraction.js, for
 * the GPU-texture path's LOW tier (rendering/quality.js) to point at when
 * it needs the equivalent "just blur it" behavior for a canvas/video
 * backdrop instead of a component's own CSS.
 * ----------------------------------------------------------------------------
 */

export const CSS_GLASS_TOKEN_SELECTOR = '[data-lg-render="frosted"]'; // glass-tokens.css §9

/** Builds the same shape of frosted style rendering/compositor.js applies for its own LOW tier, exposed here so any future integration doesn't need to re-derive it. */
export function frostedStyle({ diffusionStrength, tint, tintAlpha }) {
  return {
    backdropFilter: `blur(${diffusionStrength * 10 + 6}px)`,
    backgroundColor: tint,
    opacity: Math.max(tintAlpha, 0.18)
  };
}
