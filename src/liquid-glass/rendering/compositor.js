/*!
 * Liquid Glass — rendering/compositor.js
 * ----------------------------------------------------------------------------
 * `LiquidGlassGPU` is the public entry point for the new GPU-texture path
 * (app-supplied canvas/video backdrops — see backdrop.js's file header for
 * when this is the right choice vs the existing `LiquidGlass.enhance()` DOM
 * path). It owns: a canvas positioned over the host element, a
 * LiquidGlassRenderer, and a rAF loop — because unlike backdrop-filter
 * (where the BROWSER re-samples every composited frame for free), here the
 * engine itself is the thing sampling the backdrop texture, so it has to
 * actually ask for a new frame continuously to stay live. That per-frame
 * cost is real and is the honest tradeoff for getting a true per-fragment
 * shader instead of the SVG filter-primitive approximation — see
 * docs/GPU-RENDERER.md.
 * ----------------------------------------------------------------------------
 */
import { detectCapabilities, watchAccessibilityPreferences } from '../core/glass-capabilities.js';
import { selectQuality, QUALITY_FEATURES } from './quality.js';
import { resolveMaterial, shadowStrengthToBoxShadow } from '../core/glass-material.js';
import { Shapes } from '../geometry/shapes.js';
import { LiquidGlassRenderer } from './renderer.js';
import { TextureBackdropSource } from './backdrop.js';

function makeShape(cfg) {
  if (cfg.type === 'capsule') return Shapes.capsule(cfg.width, cfg.height);
  if (cfg.type === 'circle') return Shapes.circle(cfg.width);
  if (cfg.type === 'customPath') return Shapes.customPath(cfg.path, cfg.width, cfg.height, cfg.radius);
  return Shapes.roundedRect(cfg.width, cfg.height, cfg.radius ?? Math.min(cfg.width, cfg.height) * 0.2);
}

function hexWithAlpha(hex, alpha) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Default backdropRect: assumes `host` and the backdrop source element are both normally-flowed DOM elements sharing the same coordinate space. Pass an explicit backdropRect (or a function) to the constructor if that assumption doesn't hold for a given layout. */
function computeBackdropRect(host, sourceEl) {
  const hostBox = host.getBoundingClientRect();
  const srcBox = sourceEl.getBoundingClientRect();
  return { x: hostBox.left - srcBox.left, y: hostBox.top - srcBox.top, width: hostBox.width, height: hostBox.height };
}

export class LiquidGlassGPU {
  /**
   * @param {HTMLElement} host  element the glass canvas is layered over
   * @param {{ shape: object, material?: object, source: HTMLCanvasElement|HTMLVideoElement, backdropRect?: object|Function, quality?: string }} config
   */
  constructor(host, config) {
    if (!host) throw new Error('LiquidGlassGPU: a host element is required.');
    if (!config || !config.source) throw new Error('LiquidGlassGPU: config.source (a canvas or video element) is required — this is the GPU-texture path, see backdrop.js for when to use it vs LiquidGlass.enhance().');

    this.host = host;
    this.capabilities = detectCapabilities();
    this.qualityOverride = config.quality || null;
    this.material = resolveMaterial(config.material || {});
    this.shape = makeShape(config.shape);
    this.backdropSource = new TextureBackdropSource(config.source);
    this._backdropRectFn = typeof config.backdropRect === 'function' ? config.backdropRect : config.backdropRect ? () => config.backdropRect : () => computeBackdropRect(this.host, config.source);

    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
    const hostStyle = getComputedStyle(host);
    if (hostStyle.position === 'static') host.style.position = 'relative';
    host.appendChild(this.canvas);

    this.overlay = document.createElement('div'); // used for the LOW/FALLBACK, non-WebGL presentation only
    Object.assign(this.overlay.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
    host.appendChild(this.overlay);

    this._syncGeometry();
    this._quality = null;
    this._renderer = null;
    this._raf = null;
    this._disposed = false;

    this._resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this._syncGeometry()) : null;
    if (this._resizeObserver) this._resizeObserver.observe(host);

    this._unwatchAccessibility = watchAccessibilityPreferences(this.capabilities, () => this._syncQuality());

    // Each instance owns a real WebGL2 context, and browsers hard-cap how
    // many of those one page can hold at once (desktop Chrome ~16; several
    // mobile GPUs/WebViews cap noticeably lower) — a page with more glass
    // surfaces than that cap starts silently losing its OLDEST contexts,
    // and every surface stuck with a lost context stops rendering correctly
    // with no error thrown. Rather than raising the scope to one shared
    // context for every surface (a real architectural change — see
    // docs/GPU-RENDERER.md "Known limitations" — deliberately not done
    // here), each instance now only actually HOLDS a context while its own
    // host is at or near the viewport: an IntersectionObserver creates the
    // renderer (and its context) on entry and disposes it — freeing the
    // context immediately via WEBGL_lose_context, see renderer.js — on
    // exit. A page with 9 glass surfaces spread down its length this way
    // never holds more than the few genuinely visible at once, regardless
    // of how many exist in total. Falls back to always-on (the old
    // behavior) if IntersectionObserver isn't available.
    if (typeof IntersectionObserver !== 'undefined') {
      // IntersectionObserver's own callback is always asynchronous — it
      // never fires within the constructor's own synchronous run, even for
      // an element already on-screen. Deferring the FIRST _syncQuality()
      // call to that callback left `.quality` (and anything read off it
      // synchronously right after construction, like this project's own
      // GPU-status readout) reading null for a frame. A synchronous rect
      // check here gives the same immediate quality this class always had;
      // the observer takes over from there for every real change (scrolling
      // on/off screen), which is the part that actually needs to be async.
      const r = host.getBoundingClientRect();
      const margin = 200;
      const hasSize = r.width > 0 || r.height > 0;
      this._visible = hasSize && r.bottom > -margin && r.right > -margin &&
        r.top < (window.innerHeight || 0) + margin && r.left < (window.innerWidth || 0) + margin;
      this._intersectionObserver = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        const rBox = entry.boundingClientRect;
        const entryHasSize = rBox.width > 0 || rBox.height > 0;
        this._visible = entry.isIntersecting && entryHasSize;
        this._syncQuality();
      }, { rootMargin: '200px' });
      this._intersectionObserver.observe(host);
    } else {
      const r = host.getBoundingClientRect();
      this._visible = r.width > 0 || r.height > 0;
      this._intersectionObserver = null;
    }
    this._syncQuality();
    this._startLoop();
  }

  setMaterial(material) {
    this.material = resolveMaterial(material);
    this._applyOverlayStyle();
  }

  setQuality(tier) {
    this.qualityOverride = tier;
    this._syncQuality();
  }

  setDebugFeatureOverrides(overrides) {
    this._debugFeatureOverrides = overrides || null;
  }

  /**
   * Springs the host element to a new (x, y) position using the SAME
   * Spring class glass-engine.js's own DOM components use
   * (`window.LiquidGlass.Spring` — see glass-engine.js §2), not a
   * reimplementation. This is what makes "the selected capsule moves with
   * real spring physics and the optical surface follows it continuously"
   * true rather than aspirational: every intermediate frame during the
   * spring's motion calls `_syncGeometry()`, which re-reads the host's
   * new position and feeds it to the shader as a normal geometry update —
   * there is no separate "move" code path in the renderer at all, motion
   * is just geometry changing every frame like any resize would.
   * Falls back to an instant jump if glass-engine.js hasn't been loaded
   * (this module works standalone without it — see docs/GPU-RENDERER.md).
   */
  moveTo(x, y, opts = {}) {
    if (!this._posSprings) {
      const SpringCtor = typeof window !== 'undefined' && window.LiquidGlass && window.LiquidGlass.Spring;
      const startX = this.host.offsetLeft;
      const startY = this.host.offsetTop;
      const onUpdate = () => {
        this.host.style.left = `${this._posSprings.x.value}px`;
        this.host.style.top = `${this._posSprings.y.value}px`;
        this._syncGeometry();
      };
      if (SpringCtor) {
        this._posSprings = {
          x: new SpringCtor(startX, { stiffness: opts.stiffness ?? 300, damping: opts.damping ?? 26, onUpdate }),
          y: new SpringCtor(startY, { stiffness: opts.stiffness ?? 300, damping: opts.damping ?? 26, onUpdate })
        };
      } else {
        // No engine Spring available — degrade to instant positioning rather than silently doing nothing.
        this._posSprings = {
          x: { value: startX, set: (v) => { this._posSprings.x.value = v; onUpdate(); } },
          y: { value: startY, set: (v) => { this._posSprings.y.value = v; onUpdate(); } }
        };
      }
    }
    this._posSprings.x.set(x);
    this._posSprings.y.set(y);
  }

  get quality() {
    return this._quality;
  }

  _syncGeometry() {
    const rect = this.host.getBoundingClientRect();
    this.shape = makeShape({ ...shapeConfig(this.shape), width: rect.width || this.shape.width, height: rect.height || this.shape.height });
    if (this._renderer) this._renderer.resize(rect.width, rect.height, window.devicePixelRatio || 1);
    const r = this.shape.radius ?? 0;
    this.host.style.borderRadius = `${r}px`;
    this.canvas.style.borderRadius = `${r}px`;
    this.overlay.style.borderRadius = `${r}px`;
    this.overlay.style.overflow = 'hidden';
  }

  _syncQuality() {
    const quality = selectQuality(this.capabilities, { forceQuality: this.qualityOverride });
    this._quality = quality;
    const features = QUALITY_FEATURES[quality];
    // Off-screen (see the IntersectionObserver in the constructor): never
    // hold a live WebGL context for a surface nobody can see, regardless of
    // what tier this device would otherwise render at.
    const wantsGPU = features.useGPU && this._visible !== false;

    if (wantsGPU) {
      if (!this._renderer) {
        try {
          this._renderer = new LiquidGlassRenderer(this.canvas);
          this._syncGeometry();
        } catch (e) {
          console.warn('[liquid-glass] GPU renderer creation failed, falling back to CSS overlay:', e);
          this._renderer = null;
        }
      }
      if (this._renderer) {
        this.canvas.style.display = '';
        this.overlay.style.display = 'none';
      } else {
        this.canvas.style.display = 'none';
        this.overlay.style.display = '';
        this._applyOverlayStyle(quality);
      }
    } else {
      if (this._renderer) {
        this._renderer.dispose();
        this._renderer = null;
      }
      this.canvas.style.display = 'none';
      // Off-screen: skip even the cheap CSS overlay presentation — nothing
      // is visible to a viewer anyway, so there's nothing worth paying a
      // backdrop-filter for. On-screen but non-GPU-capable (features.useGPU
      // false): show it, same as before.
      this.overlay.style.display = features.useGPU ? 'none' : '';
      if (!features.useGPU) this._applyOverlayStyle(quality);
    }
    this.host.style.boxShadow = shadowStrengthToBoxShadow(this.material.shadowStrength);
  }

  _applyOverlayStyle(quality = this._quality) {
    const s = this.overlay.style;
    if (quality === 'fallback') {
      s.backdropFilter = 'none';
      s.background = hexWithAlpha(this.material.tint, Math.max(this.material.tintAlpha, 0.24));
    } else {
      // LOW: plain CSS blur of whatever is live behind the overlay (the
      // backdrop source element included, since it's real DOM content) —
      // genuine, universally-supported blur, no lensing. See quality.js.
      const blurPx = this.material.diffusionStrength * 10 + 6;
      s.backdropFilter = `blur(${blurPx}px)`;
      s.background = hexWithAlpha(this.material.tint, Math.max(this.material.tintAlpha, 0.18));
    }
  }

  _startLoop() {
    const tick = () => {
      if (this._disposed) return;
      // this._quality is still null for one or two frames on a fresh
      // IntersectionObserver-gated instance — its first callback (which
      // calls _syncQuality()) hasn't necessarily fired yet by the time this
      // loop's first tick runs, since both are scheduled independently.
      const features = this._quality ? QUALITY_FEATURES[this._quality] : null;
      if (features && features.useGPU && this._renderer) {
        this._renderer.render(this.backdropSource, this.shape, this.material, this._quality, this._backdropRectFn(), this._debugFeatureOverrides);
      }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  destroy() {
    this._disposed = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    if (this._intersectionObserver) this._intersectionObserver.disconnect();
    if (this._unwatchAccessibility) this._unwatchAccessibility();
    if (this._renderer) this._renderer.dispose();
    if (this.backdropSource) this.backdropSource.dispose(this._renderer && this._renderer.gl);
    this.canvas.remove();
    this.overlay.remove();
  }
}

function shapeConfig(shape) {
  return { type: shape.type, width: shape.width, height: shape.height, radius: shape.radius, path: shape.path };
}
