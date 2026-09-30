/*!
 * Liquid Glass — fallback/svg-refraction.js
 * ----------------------------------------------------------------------------
 * §26/§37: "keep SVG as fallback" for arbitrary live DOM backdrops. The
 * actual implementation is NOT here and is not moved here — it's
 * core/glass-engine.js's existing injectLensFilter/renderLensDisplacementMap
 * (unchanged, still the primary path for the 9 existing components). This
 * file exists only as the documented seam §37 asked for: an ES-module-
 * reachable marker that says, explicitly, "this tier == the legacy SVG
 * lens," for anything in rendering/ that needs to reason about which
 * rendering path is active without reaching into the UMD global.
 *
 * If glass-engine.js's public API shape ever changes, update the reference
 * below — this file is intentionally a thin pointer, not a copy, so there
 * is exactly one implementation of the SVG lens to keep correct.
 * ----------------------------------------------------------------------------
 */

export const SVG_REFRACTION_SOURCE = '../core/glass-engine.js';

/** True when window.LiquidGlass (the UMD engine) is loaded and reports it can actually render the lens — i.e. this fallback tier will show real refraction, not just blur. Mirrors glass-engine.js capabilities.canRefract. */
export function isSvgRefractionActive() {
  return typeof window !== 'undefined' && !!window.LiquidGlass && !!window.LiquidGlass.capabilities && !!window.LiquidGlass.capabilities.canRefract;
}
