/*!
 * Liquid Glass — src/index.js
 * ----------------------------------------------------------------------------
 * ES-module entry point for the NEW pieces added in this pass: the GPU
 * renderer, the expanded material system, and shared geometry.
 *
 * core/glass-engine.js (Spring, injectLensFilter, pressable — everything
 * the 9 DOM components use) is deliberately NOT re-exported from here. It
 * is a zero-build UMD script loaded via a plain <script> tag, exactly as
 * before (see index.html / standalone-demo.html) — importing it here would
 * either break that zero-build guarantee or require bundling, neither of
 * which this pass changes. See docs/GPU-RENDERER.md "Why two entry points."
 * ----------------------------------------------------------------------------
 */
import { LiquidGlassGPU } from './rendering/compositor.js';
import { LiquidGlassMaterial, resolveMaterial, MATERIAL_SCHEMA, specularSizeToShininess, shadowStrengthToBoxShadow } from './core/glass-material.js';
import { detectCapabilities, watchAccessibilityPreferences } from './core/glass-capabilities.js';
import { QualityTier, selectQuality, QUALITY_FEATURES } from './rendering/quality.js';
import { Shapes } from './geometry/shapes.js';
import { DomBackdropSource, TextureBackdropSource } from './rendering/backdrop.js';

export {
  LiquidGlassGPU,
  LiquidGlassMaterial, resolveMaterial, MATERIAL_SCHEMA, specularSizeToShininess, shadowStrengthToBoxShadow,
  detectCapabilities, watchAccessibilityPreferences,
  QualityTier, selectQuality, QUALITY_FEATURES,
  Shapes,
  DomBackdropSource, TextureBackdropSource
};

if (typeof window !== 'undefined') {
  window.LiquidGlassGPU = LiquidGlassGPU;
  window.LiquidGlassMaterial = LiquidGlassMaterial;
}
