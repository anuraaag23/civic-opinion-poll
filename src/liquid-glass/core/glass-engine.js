/*!
 * Liquid Glass — Core Engine
 * ----------------------------------------------------------------------------
 * Framework-agnostic. Zero dependencies. Works from a <script> tag or an ES
 * module import. Every component file in ../components/* is built on top of
 * the four things this file exports on the `LiquidGlass` global (and as named
 * ES module exports):
 *
 *   LiquidGlass.capabilities      — real feature/engine detection, computed once
 *   LiquidGlass.Spring            — a damped-harmonic-oscillator spring, RAF-driven
 *   LiquidGlass.injectLensFilter  — builds a per-element SVG lens/refraction filter
 *   LiquidGlass.pressable         — wires pointerdown/hold/up physics onto any element
 *
 * Read /docs/DESIGN-PHYSICS-SPEC.md for *why* each piece works the way it
 * does — this file is the "what", that doc is the "why".
 * ----------------------------------------------------------------------------
 */
(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.LiquidGlass = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ==========================================================================
  // 1. CAPABILITY DETECTION
  // ==========================================================================
  // backdrop-filter: url(#svgFilter) is the only way on the open web to bend
  // REAL page content that sits behind an element (as opposed to content you
  // drew yourself into a canvas/WebGL texture). As of this writing only
  // Chromium-family engines (Chrome, Edge, Arc, Brave, Opera) actually render
  // the SVG-filter half of that value — Safari and Firefox parse the syntax
  // without erroring, but silently skip the distortion and keep only the
  // blur (WebKit bug 245510, reopened as bug 313914 in 2026 — still open).
  // CSS.supports() can't tell the two situations apart because both engines
  // accept the syntax; we sniff the ENGINE instead, via a Blink-only API,
  // and fall back to "frosted-only" (blur + tint + shine, no lensing)
  // everywhere else. A page can always override the guess with
  // documentElement.dataset.lgRender = 'refractive' | 'frosted'.
  function detectCapabilities() {
    var hasBackdrop =
      typeof CSS !== 'undefined' &&
      (CSS.supports('backdrop-filter', 'blur(1px)') ||
        CSS.supports('-webkit-backdrop-filter', 'blur(1px)'));

    var isBlinkEngine =
      typeof window !== 'undefined' &&
      (('chrome' in window && !!window.chrome) ||
        (typeof CSS !== 'undefined' && CSS.supports('background', 'paint(x)')));

    var reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var reduceTransparency =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-transparency: reduce)').matches;

    var increaseContrast =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-contrast: more)').matches;

    return {
      hasBackdropFilter: hasBackdrop,
      /** true only on engines that actually render feDisplacementMap through backdrop-filter */
      canRefract: hasBackdrop && isBlinkEngine,
      prefersReducedMotion: reduceMotion,
      prefersReducedTransparency: reduceTransparency,
      prefersIncreasedContrast: increaseContrast
    };
  }

  var capabilities = detectCapabilities();

  // Keep the accessibility flags live — a user can flip either setting
  // mid-session, and glass-tokens.css reacts instantly to these attributes.
  function watchAccessibilityMedia() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    var root = document.documentElement;

    function applyFrom(mq, attr) {
      if (mq.matches) root.setAttribute(attr, '');
      else root.removeAttribute(attr);
    }

    var motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var transparencyMq = window.matchMedia('(prefers-reduced-transparency: reduce)');
    var contrastMq = window.matchMedia('(prefers-contrast: more)');
    applyFrom(motionMq, 'data-lg-reduce-motion');
    applyFrom(transparencyMq, 'data-lg-reduce-transparency');
    applyFrom(contrastMq, 'data-lg-increase-contrast');

    var onMotion = function () { applyFrom(motionMq, 'data-lg-reduce-motion'); capabilities.prefersReducedMotion = motionMq.matches; };
    var onTransparency = function () { applyFrom(transparencyMq, 'data-lg-reduce-transparency'); capabilities.prefersReducedTransparency = transparencyMq.matches; };
    var onContrast = function () { applyFrom(contrastMq, 'data-lg-increase-contrast'); capabilities.prefersIncreasedContrast = contrastMq.matches; };

    (motionMq.addEventListener ? motionMq.addEventListener.bind(motionMq) : motionMq.addListener.bind(motionMq))('change', onMotion);
    (transparencyMq.addEventListener ? transparencyMq.addEventListener.bind(transparencyMq) : transparencyMq.addListener.bind(transparencyMq))('change', onTransparency);
    (contrastMq.addEventListener ? contrastMq.addEventListener.bind(contrastMq) : contrastMq.addListener.bind(contrastMq))('change', onContrast);
  }

  // Flags the document once with which render path is active, so
  // glass-tokens.css can compensate with a slightly stronger base blur on
  // engines that will never show the lensing distortion (there's no
  // refraction to "soften" the edge on those engines otherwise).
  function markRenderMode() {
    var root = document.documentElement;
    if (root.getAttribute('data-lg-render')) return; // page already forced a mode
    root.setAttribute('data-lg-render', capabilities.canRefract ? 'refractive' : 'frosted');
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        watchAccessibilityMedia();
        markRenderMode();
      });
    } else {
      watchAccessibilityMedia();
      markRenderMode();
    }
  }

  // ==========================================================================
  // 2. SPRING PHYSICS
  // ==========================================================================
  // A textbook damped harmonic oscillator (F = -k·x - c·v), the same model
  // real spring-based animation systems use under the hood. Parameterized by
  // stiffness/damping/mass rather than duration/easing because that's the
  // only parameterization that can genuinely OVERSHOOT and wobble — which
  // Apple's own segmented-control indicator visibly does on camera. A single
  // shared requestAnimationFrame loop drives every live Spring instance so
  // that having many glass controls on one page costs one rAF callback, not
  // one per control.
  var activeSprings = new Set();
  var rafHandle = null;
  var lastTick = 0;

  function tick(now) {
    if (lastTick === 0) lastTick = now;
    var dt = Math.min((now - lastTick) / 1000, 1 / 30); // clamp so a dropped/backgrounded tab can't produce a huge dt jump
    lastTick = now;

    activeSprings.forEach(function (spring) {
      spring._advance(dt);
      if (spring.settled) activeSprings.delete(spring);
    });

    if (activeSprings.size > 0) {
      rafHandle = requestAnimationFrame(tick);
    } else {
      rafHandle = null;
      lastTick = 0;
    }
  }

  function ensureLoopRunning() {
    if (rafHandle === null) {
      rafHandle = requestAnimationFrame(tick);
    }
  }

  /**
   * @param {number} initial   starting value
   * @param {object} opts
   * @param {number} opts.stiffness
   * @param {number} opts.damping
   * @param {number} opts.mass
   * @param {number} opts.restVelocity  velocity below which the spring can be considered stopped
   * @param {number} opts.restDelta     distance-to-target below which the spring can be considered stopped
   * @param {(value:number)=>void} opts.onUpdate  called every frame the spring is moving
   * @param {()=>void} opts.onSettle    called once when the spring comes to rest
   */
  function Spring(initial, opts) {
    opts = opts || {};
    this.value = initial || 0;
    this.velocity = 0;
    this.target = initial || 0;
    this.stiffness = opts.stiffness != null ? opts.stiffness : 300;
    this.damping = opts.damping != null ? opts.damping : 26;
    this.mass = opts.mass != null ? opts.mass : 1;
    this.restVelocity = opts.restVelocity != null ? opts.restVelocity : 0.005;
    this.restDelta = opts.restDelta != null ? opts.restDelta : 0.005;
    this.onUpdate = opts.onUpdate || null;
    this.onSettle = opts.onSettle || null;
    this.settled = true;
  }

  Spring.prototype._advance = function (dt) {
    // Reduced-motion: snap instead of oscillate. The material itself
    // (blur/tint/lensing) is untouched — only the MOTION is simplified,
    // matching how Apple's own accessibility setting behaves.
    if (capabilities.prefersReducedMotion) {
      this.value = this.target;
      this.velocity = 0;
      this.settled = true;
      if (this.onUpdate) this.onUpdate(this.value);
      if (this.onSettle) this.onSettle();
      return;
    }

    var displacement = this.value - this.target;
    var springForce = -this.stiffness * displacement;
    var dampingForce = -this.damping * this.velocity;
    var acceleration = (springForce + dampingForce) / this.mass;

    this.velocity += acceleration * dt;
    this.value += this.velocity * dt;

    if (Math.abs(this.velocity) < this.restVelocity && Math.abs(this.value - this.target) < this.restDelta) {
      this.value = this.target;
      this.velocity = 0;
      this.settled = true;
      if (this.onUpdate) this.onUpdate(this.value);
      if (this.onSettle) this.onSettle();
      return;
    }

    if (this.onUpdate) this.onUpdate(this.value);
  };

  /** Retarget the spring. Set instant:true to teleport with zero velocity (no animation). */
  Spring.prototype.set = function (target, instant) {
    this.target = target;
    if (instant) {
      this.value = target;
      this.velocity = 0;
      this.settled = true;
      if (this.onUpdate) this.onUpdate(this.value);
      return;
    }
    this.settled = false;
    activeSprings.add(this);
    ensureLoopRunning();
  };

  /** Nudge the spring's current velocity — used for "throw" gestures (fast drag release). */
  Spring.prototype.addVelocity = function (deltaV) {
    this.velocity += deltaV;
    this.settled = false;
    activeSprings.add(this);
    ensureLoopRunning();
  };

  /** How energetically this spring is currently moving, normalized to roughly 0–1.
   *  Components use this to drive material response (Apple's material visibly
   *  "energizes" — brighter highlight, slightly stronger lensing — while a
   *  glass shape is mid-motion, not just at its start/end states). */
  Spring.prototype.getMotionEnergy = function () {
    // 9 is an empirical normalization constant: peak velocities observed from
    // stepping this exact spring model at the "bouncy" preset land around
    // 8–12 units/s, so 9 maps that peak to ≈1.0 without needing per-instance tuning.
    return Math.min(Math.abs(this.velocity) / 9, 1);
  };

  // ==========================================================================
  // 3. LENS / REFRACTION FILTER
  // ==========================================================================
  // Builds a per-element SVG <filter> whose displacement map is generated on
  // a <canvas>, not with feTurbulence noise — a procedural rounded-box
  // signed-distance-field gives a genuine LENS (zero distortion in the flat
  // center, rising smoothly toward the edge) rather than an all-over noisy
  // wobble. Applied to an element via:
  //   backdrop-filter: blur(Xpx) url(#<filterId>);
  // Falls back to plain blur automatically on engines that can't render the
  // url() half (see capabilities.canRefract above) — the CSS still includes
  // the url() reference for browsers that DO support it, and non-Blink
  // engines simply ignore the reference and keep the blur.

  var _filterHost = null; // one shared, hidden <svg> holding every generated <filter>
  var _filterCount = 0;

  function ensureFilterHost() {
    if (_filterHost && document.body.contains(_filterHost)) return _filterHost;
    _filterHost = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    _filterHost.setAttribute('aria-hidden', 'true');
    _filterHost.setAttribute(
      'style',
      'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;'
    );
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    _filterHost.appendChild(defs);
    (document.body || document.documentElement).appendChild(_filterHost);
    return _filterHost;
  }

  /** Signed distance from point (x,y) to a rounded box of half-size (bw,bh) and corner radius r.
   *  Negative = inside. Standard rounded-box SDF (Inigo Quilez's formulation). */
  function roundedBoxSDF(x, y, bw, bh, r) {
    var qx = Math.abs(x) - bw + r;
    var qy = Math.abs(y) - bh + r;
    var outsideX = Math.max(qx, 0);
    var outsideY = Math.max(qy, 0);
    var outsideDist = Math.sqrt(outsideX * outsideX + outsideY * outsideY);
    var insideDist = Math.min(Math.max(qx, qy), 0);
    return outsideDist + insideDist - r;
  }

  function smoothstep(edge0, edge1, x) {
    var t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
    return t * t * (3 - 2 * t);
  }

  /**
   * Renders a displacement map (as a data: URL) for a lens the size of
   * (width x height) with the given corner radius.
   *
   * Encoding: R = 128 + dx·127, G = 128 + dy·127 (128 = no displacement).
   * `dx`/`dy` here are the pure, strength-INDEPENDENT unit-circle-scaled
   * edge factor — this image only ever encodes SHAPE (which direction,
   * how much of the shape's own edge falloff), never magnitude. Magnitude
   * is `strength` alone, applied exactly once, by the caller, as
   * feDisplacementMap's own `scale` attribute (injectLensFilter, below) —
   * that split is what the SVG spec's `scale` parameter is actually for.
   *
   * This function used to also multiply `strength` into dx/dy here, on
   * top of injectLensFilter passing the SAME `strength` again as `scale` —
   * real double-counting, found by rendering the actual filter chain with
   * rsvg-convert against a known vertical line and measuring its pixel
   * shift directly: strength=36 (the shipped default) was producing ONLY
   * ~5px of real, on-screen bend, not the ~36px "peak pixel displacement"
   * this function's own doc comment (and glass-tokens.css's) claimed —
   * because actual displacement = scale·(R/255 − 0.5), so baking strength
   * into R *and* passing it again as scale makes the real effect scale
   * with strength², not strength. Removing the first application (this
   * fix) makes `strength` finally do what its name says: linearly control
   * the bend, with the true achievable peak at a given strength capped at
   * strength/2 (the ±0.5 range an 8-bit-centered-at-128 channel can ever
   * represent, confirmed empirically at ~0.4–0.44× strength once the
   * displacement map's own Gaussian pre-blur is in the chain too, not
   * exactly 0.5× — see glass-tokens.css §4 for the re-measured, re-tuned
   * constants this shipped with). This silent 7×-ish undershoot is the
   * single most likely reason every earlier pass at this project kept
   * reading as "not enough bending" despite genuinely correct edge-only
   * SDF falloff shape underneath it the whole time.
   *
   * Direction at each pixel points OUTWARD from the shape's center, so
   * feDisplacementMap (which samples the SOURCE from an offset position)
   * pulls in content from just beyond the edge — this reads as the boundary
   * "gathering" whatever passes under it, matching the compression visible
   * at the pill edge in Apple's own reference footage. Flip `strength`
   * negative for the opposite (outward bulge / magnify) look — both are
   * legitimate lens behaviors, this is a tunable, not a fixed constant.
   *
   * @param {number} width
   * @param {number} height
   * @param {number} radius
   * @param {number} edgeWidthFraction  0–1, how deep the bend reaches inward, relative to min(width,height)/2
   * @param {number} strength           feDisplacementMap `scale` value; real peak on-screen displacement at the edge is ≈0.4–0.5× this (see above), not a 1:1 px value
   */
  function renderLensDisplacementMap(width, height, radius, edgeWidthFraction, strength) {
    var w = Math.max(1, Math.round(width));
    var h = Math.max(1, Math.round(height));
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    var img = ctx.createImageData(w, h);
    var data = img.data;

    var halfW = w / 2;
    var halfH = h / 2;
    var r = Math.min(radius, Math.min(halfW, halfH));

    // Edge width is computed per-axis, not from a single min(halfW,halfH)
    // shared in every direction. A single shared value looks fine on
    // roughly-square shapes but was verified (rendered, not assumed) to
    // leave a wide/short shape's long axis almost completely flat — the
    // edge zone was deep enough relative to the SHORT side to look right
    // there, but shallow relative to the LONG side, so a 300×100 card
    // bent visibly at top/bottom and barely at all along its actual
    // width. See DESIGN-PHYSICS-SPEC.md → "Anisotropic edge width".
    var edgeWidthX = Math.max(2, halfW * edgeWidthFraction);
    var edgeWidthY = Math.max(2, halfH * edgeWidthFraction);
    var edgeWidthIso = Math.max(2, Math.min(halfW, halfH) * edgeWidthFraction);

    for (var py = 0; py < h; py++) {
      var y = py + 0.5 - halfH;
      for (var px = 0; px < w; px++) {
        var x = px + 0.5 - halfW;

        // Isotropic term: correct near rounded corners, where the nearest
        // boundary genuinely curves in both axes at once.
        var distIso = -roundedBoxSDF(x, y, halfW, halfH, r);
        var edgeFactorIso = 1 - smoothstep(0, edgeWidthIso, Math.max(distIso, 0));

        // Per-axis terms: correct along a flat edge, where the nearest
        // boundary is a straight line and the relevant reference size is
        // THAT axis's own half-extent, not whichever axis is shorter.
        var distFromLR = halfW - Math.abs(x); // distance in from the nearest left/right edge
        var distFromTB = halfH - Math.abs(y); // distance in from the nearest top/bottom edge
        var edgeFactorX = 1 - smoothstep(0, edgeWidthX, Math.max(distFromLR, 0));
        var edgeFactorY = 1 - smoothstep(0, edgeWidthY, Math.max(distFromTB, 0));

        var edgeFactor = Math.max(edgeFactorIso, Math.max(edgeFactorX, edgeFactorY));

        var len = Math.sqrt(x * x + y * y) || 1;
        // Strength-independent: this is SHAPE only (§ comment above).
        // strength is applied exactly once, downstream, as feDisplacementMap's
        // own `scale` attribute (injectLensFilter) — not here too.
        var dx = (x / len) * edgeFactor;
        var dy = (y / len) * edgeFactor;

        var i = (py * w + px) * 4;
        data[i] = Math.max(0, Math.min(255, 128 + dx * 127));
        data[i + 1] = Math.max(0, Math.min(255, 128 + dy * 127));
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL('image/png');
  }

  /**
   * Creates (or replaces) an SVG <filter> sized for a specific element and
   * returns its id. Call again on resize — filters are cheap to rebuild and
   * MUST match the element's current pixel size or the lens will look
   * stretched.
   *
   * @param {HTMLElement} el
   * @param {object} opts  { radius, edgeWidthFraction, strength, blur, id }
   * @returns {string} the filter's id, e.g. "lg-lens-3"
   */
  function injectLensFilter(el, opts) {
    opts = opts || {};
    var rect = el.getBoundingClientRect();
    var width = Math.max(1, rect.width);
    var height = Math.max(1, rect.height);
    var cs = getComputedStyle(el);
    var radius = opts.radius != null ? opts.radius : parseFloat(cs.borderRadius) || 0;
    // Falls back to the shared --lg-lens-* tokens (glass-tokens.css §4)
    // before falling back again to a hardcoded number — so retuning the
    // tokens file actually changes every un-overridden surface's lensing,
    // instead of those tokens sitting there unused while every component
    // quietly keeps its own hardcoded number.
    var tokenEdgeWidth = parseFloat(cs.getPropertyValue('--lg-lens-edge-width'));
    var tokenStrength = parseFloat(cs.getPropertyValue('--lg-lens-strength'));
    var edgeWidthFraction = opts.edgeWidthFraction != null ? opts.edgeWidthFraction : (isNaN(tokenEdgeWidth) ? 0.62 : tokenEdgeWidth);
    var rawStrength = opts.strength != null ? opts.strength : (isNaN(tokenStrength) ? 50 : tokenStrength);
    var strength = isFinite(rawStrength) ? Number(rawStrength) : 50;
    var blur = opts.blur != null ? opts.blur : 1;

    var host = ensureFilterHost();
    var defs = host.querySelector('defs');
    var id = opts.id || el.getAttribute('data-lg-filter-id') || 'lg-lens-' + ++_filterCount;
    el.setAttribute('data-lg-filter-id', id);

    var existing = defs.querySelector('#' + id);
    if (existing) existing.remove();

    var mapDataUrl = renderLensDisplacementMap(width, height, radius, edgeWidthFraction, strength);

    var svgNS = 'http://www.w3.org/2000/svg';
    var filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '-30%');
    filter.setAttribute('y', '-30%');
    filter.setAttribute('width', '160%');
    filter.setAttribute('height', '160%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    var feImage = document.createElementNS(svgNS, 'feImage');
    feImage.setAttribute('href', mapDataUrl);
    feImage.setAttribute('x', '0');
    feImage.setAttribute('y', '0');
    feImage.setAttribute('width', String(width));
    feImage.setAttribute('height', String(height));
    feImage.setAttribute('result', 'map');
    filter.appendChild(feImage);

    if (blur > 0) {
      var feBlur = document.createElementNS(svgNS, 'feGaussianBlur');
      feBlur.setAttribute('in', 'map');
      feBlur.setAttribute('stdDeviation', String(blur));
      feBlur.setAttribute('result', 'mapBlurred');
      filter.appendChild(feBlur);
    }

    var dispersion = opts.dispersion != null ? opts.dispersion : true;
    var mapSource = blur > 0 ? 'mapBlurred' : 'map';

    if (dispersion && strength > 10) {
      // Physical chromatic dispersion: 3 separate displacement channels
      // Red bends least, Green medium, Blue most
      var dispR = document.createElementNS(svgNS, 'feDisplacementMap');
      dispR.setAttribute('in', 'SourceGraphic');
      dispR.setAttribute('in2', mapSource);
      dispR.setAttribute('scale', String(strength * 0.93));
      dispR.setAttribute('xChannelSelector', 'R');
      dispR.setAttribute('yChannelSelector', 'G');
      dispR.setAttribute('result', 'dispR');
      filter.appendChild(dispR);

      var matR = document.createElementNS(svgNS, 'feColorMatrix');
      matR.setAttribute('in', 'dispR');
      matR.setAttribute('type', 'matrix');
      matR.setAttribute('values', '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0');
      matR.setAttribute('result', 'redOnly');
      filter.appendChild(matR);

      var dispG = document.createElementNS(svgNS, 'feDisplacementMap');
      dispG.setAttribute('in', 'SourceGraphic');
      dispG.setAttribute('in2', mapSource);
      dispG.setAttribute('scale', String(strength * 1.00));
      dispG.setAttribute('xChannelSelector', 'R');
      dispG.setAttribute('yChannelSelector', 'G');
      dispG.setAttribute('result', 'dispG');
      filter.appendChild(dispG);

      var matG = document.createElementNS(svgNS, 'feColorMatrix');
      matG.setAttribute('in', 'dispG');
      matG.setAttribute('type', 'matrix');
      matG.setAttribute('values', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0');
      matG.setAttribute('result', 'greenOnly');
      filter.appendChild(matG);

      var dispB = document.createElementNS(svgNS, 'feDisplacementMap');
      dispB.setAttribute('in', 'SourceGraphic');
      dispB.setAttribute('in2', mapSource);
      dispB.setAttribute('scale', String(strength * 1.07));
      dispB.setAttribute('xChannelSelector', 'R');
      dispB.setAttribute('yChannelSelector', 'G');
      dispB.setAttribute('result', 'dispB');
      filter.appendChild(dispB);

      var matB = document.createElementNS(svgNS, 'feColorMatrix');
      matB.setAttribute('in', 'dispB');
      matB.setAttribute('type', 'matrix');
      matB.setAttribute('values', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0');
      matB.setAttribute('result', 'blueOnly');
      filter.appendChild(matB);

      var blendRG = document.createElementNS(svgNS, 'feBlend');
      blendRG.setAttribute('in', 'redOnly');
      blendRG.setAttribute('in2', 'greenOnly');
      blendRG.setAttribute('mode', 'screen');
      blendRG.setAttribute('result', 'blendRG');
      filter.appendChild(blendRG);

      var blendRGB = document.createElementNS(svgNS, 'feBlend');
      blendRGB.setAttribute('in', 'blendRG');
      blendRGB.setAttribute('in2', 'blueOnly');
      blendRGB.setAttribute('mode', 'screen');
      filter.appendChild(blendRGB);
    } else {
      var feDisp = document.createElementNS(svgNS, 'feDisplacementMap');
      feDisp.setAttribute('in', 'SourceGraphic');
      feDisp.setAttribute('in2', mapSource);
      feDisp.setAttribute('scale', String(strength));
      feDisp.setAttribute('xChannelSelector', 'R');
      feDisp.setAttribute('yChannelSelector', 'G');
      filter.appendChild(feDisp);
    }

    defs.appendChild(filter);
    return id;
  }

  /** Keeps an element's lens filter in sync with its size. Call once per element; cleans up on demand. */
  function observeLensSize(el, opts) {
    injectLensFilter(el, opts);
    if (typeof ResizeObserver === 'undefined') return function () {};
    var ro = new ResizeObserver(function () {
      injectLensFilter(el, Object.assign({}, opts, { id: el.getAttribute('data-lg-filter-id') }));
    });
    ro.observe(el);
    return function disconnect() { ro.disconnect(); };
  }

  // ==========================================================================
  // 4. PRESS / HOLD PHYSICS
  // ==========================================================================
  // Wires the interaction model every component shares: an immediate settle
  // on press, a promotion to a "held" (lifted) state past a threshold, and a
  // spring release back to rest — plus the custom events a host app hooks
  // into for its own behavior (e.g. opening a context menu on long-press).
  //
  // Dispatches on `el`: lg:pressstart, lg:pressend, lg:longpress
  function pressable(el, options) {
    options = options || {};
    var holdThreshold = options.holdThresholdMs != null ? options.holdThresholdMs : 450;
    var pressScale = options.pressScale != null ? options.pressScale : 0.96;
    var holdScale = options.holdScale != null ? options.holdScale : 1.04;
    var disabled = function () { return options.isDisabled ? options.isDisabled() : false; };

    var scaleSpring = new Spring(1, {
      stiffness: 420,
      damping: 24,
      onUpdate: function (v) {
        el.style.setProperty('--lg-press-transform-scale', v.toFixed(4));
      }
    });

    var holdTimer = null;
    var isDown = false;

    function onDown(ev) {
      if (disabled()) return;
      isDown = true;
      el.setAttribute('data-lg-state', 'pressed');
      scaleSpring.set(pressScale);
      el.dispatchEvent(new CustomEvent('lg:pressstart', { detail: { originalEvent: ev } }));

      holdTimer = setTimeout(function () {
        if (!isDown) return;
        el.setAttribute('data-lg-state', 'held');
        scaleSpring.set(holdScale);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(10); } catch (e) { /* vibration API may be blocked; non-fatal */ }
        }
        el.dispatchEvent(new CustomEvent('lg:longpress', { detail: { originalEvent: ev } }));
      }, holdThreshold);
    }

    function onUp(ev) {
      if (!isDown) return;
      isDown = false;
      clearTimeout(holdTimer);
      el.setAttribute('data-lg-state', 'rest');
      scaleSpring.set(1);
      el.dispatchEvent(new CustomEvent('lg:pressend', { detail: { originalEvent: ev } }));
    }

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', function (ev) {
      // Only release on leave if the pointer isn't captured (i.e. not mid-drag elsewhere)
      if (isDown && !el.hasPointerCapture?.(ev.pointerId)) onUp(ev);
    });

    return {
      destroy: function () {
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        clearTimeout(holdTimer);
      }
    };
  }

  // ==========================================================================
  // 5. POINTER-TRACKED SPECULAR HIGHLIGHT
  // ==========================================================================
  // "Instantly flexing and energizing with light" (Apple's own description of
  // the material's motion) — the highlight gradient's origin follows the
  // pointer across a glass surface rather than sitting static, so the
  // element feels like it is genuinely reflecting an environment. Sets two
  // CSS custom properties the component stylesheets already read:
  // --lg-hl-x / --lg-hl-y, each 0–100 (percent).
  function trackSpecular(el) {
    function onMove(ev) {
      var rect = el.getBoundingClientRect();
      var x = ((ev.clientX - rect.left) / rect.width) * 100;
      var y = ((ev.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--lg-hl-x', x.toFixed(1));
      el.style.setProperty('--lg-hl-y', y.toFixed(1));
    }
    function onLeave() {
      el.style.setProperty('--lg-hl-x', '50');
      el.style.setProperty('--lg-hl-y', '20');
    }
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    onLeave();
    return {
      destroy: function () {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      }
    };
  }

  // ==========================================================================
  // 5b. TOUCH BULGE — a small floating lens that tracks the pointer across a
  //     larger flat glass panel (e.g. a list of options), instead of lensing
  //     the whole panel uniformly.
  // ==========================================================================
  // Reference footage of the target design (a glass options list) shows
  // touching one row producing a bright, localized bulge of light exactly
  // under the finger — distinct from the panel's own flat tint/blur, and
  // distinct from trackSpecular() above (which only nudges an existing
  // highlight's CENTER within an element that's already glass). Here the
  // host panel doesn't need to be glass at all: a real SVG lens (enhance())
  // is dynamically positioned to follow the finger, then faded out
  // entirely at rest so the panel reads as flat content the rest of the
  // time — only touching it reveals the glass.
  function attachTouchBulge(container, opts) {
    opts = opts || {};
    var size = opts.size || 64;

    var bulge = document.createElement('span');
    bulge.className = 'lg-touch-bulge lg-surface';
    bulge.setAttribute('aria-hidden', 'true');
    bulge.style.width = size + 'px';
    bulge.style.height = size + 'px';
    container.appendChild(bulge);

    // The bulge's position:absolute needs the container to actually BE its
    // positioning context — most panels this attaches to already are
    // (glass panels are typically position:relative for their own
    // ::before/::after layers), but don't silently rely on that holding.
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    // Three springs, all JS-driven every frame (matching how every other
    // animated value in this file works, e.g. the toggle's
    // --lg-toggle-stretch) rather than a CSS transition on `transform` —
    // a transition there would also catch the position updates during
    // pointermove and turn 1:1 finger-tracking into laggy, mushy follow.
    var xSpring = new Spring(0, { stiffness: 500, damping: 32, onUpdate: function (v) { bulge.style.setProperty('--lg-bulge-x', v.toFixed(1) + 'px'); } });
    var ySpring = new Spring(0, { stiffness: 500, damping: 32, onUpdate: function (v) { bulge.style.setProperty('--lg-bulge-y', v.toFixed(1) + 'px'); } });
    var scaleSpring = new Spring(0, { stiffness: 380, damping: 22, onUpdate: function (v) { bulge.style.setProperty('--lg-bulge-scale', v.toFixed(3)); } });

    var visible = false;
    function moveTo(clientX, clientY, instant) {
      var rect = container.getBoundingClientRect();
      xSpring.set(clientX - rect.left, instant);
      ySpring.set(clientY - rect.top, instant);
    }
    function show(ev) {
      var first = !visible;
      visible = true;
      bulge.setAttribute('data-lg-visible', 'true');
      moveTo(ev.clientX, ev.clientY, first); // teleport to the initial touch point, spring-follow from there
      scaleSpring.set(1);
    }
    function hide() {
      if (!visible) return;
      visible = false;
      bulge.removeAttribute('data-lg-visible');
      scaleSpring.set(0);
    }

    container.addEventListener('pointerdown', show);
    container.addEventListener('pointermove', function (ev) { if (visible) moveTo(ev.clientX, ev.clientY); });
    container.addEventListener('pointerup', hide);
    container.addEventListener('pointercancel', hide);
    container.addEventListener('pointerleave', hide);

    enhance(bulge, {
      strength: 45,
      edgeWidthFraction: 0.9,
      press: false // the bulge itself isn't a pressable target — it's a passive overlay riding on top of real, clickable content
    });

    return {
      destroy: function () {
        container.removeEventListener('pointerdown', show);
        hide();
        bulge.remove();
      }
    };
  }

  // ==========================================================================
  // 6. GOO / MERGE FILTER (for groups of glass elements that fuse together)
  // ==========================================================================
  // The classic "gooey" SVG technique: blur a group's alpha channel, then
  // sharpen the alpha back up with a steep contrast curve. Two blurred,
  // overlapping shapes fuse into one continuous silhouette wherever they're
  // close enough for their blur halos to overlap; separated shapes are
  // unaffected. This is what makes Apple's glass elements visually merge and
  // split (seen in the reference stills as two pills briefly becoming one
  // blob) — apply to a CONTAINER of several glass elements, not to a single
  // element alone.
  function injectGooFilter(strength) {
    strength = strength || 12;
    var host = ensureFilterHost();
    var defs = host.querySelector('defs');
    var id = 'lg-goo-' + Math.round(strength);
    if (defs.querySelector('#' + id)) return id;

    var svgNS = 'http://www.w3.org/2000/svg';
    var filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');

    var blur = document.createElementNS(svgNS, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', String(strength));
    blur.setAttribute('result', 'blurred');
    filter.appendChild(blur);

    var matrix = document.createElementNS(svgNS, 'feColorMatrix');
    matrix.setAttribute('in', 'blurred');
    matrix.setAttribute('mode', 'matrix');
    // Steepens the alpha channel so ~0.5 alpha (where two blur halos overlap)
    // snaps toward 1, and low alpha snaps toward 0 — a soft blob becomes a
    // hard-edged, fused silhouette again.
    matrix.setAttribute(
      'values',
      '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10'
    );
    matrix.setAttribute('result', 'goo');
    filter.appendChild(matrix);

    var composite = document.createElementNS(svgNS, 'feComposite');
    composite.setAttribute('in', 'SourceGraphic');
    composite.setAttribute('in2', 'goo');
    composite.setAttribute('operator', 'atop');
    filter.appendChild(composite);

    defs.appendChild(filter);
    return id;
  }

  // ==========================================================================
  // 7. AUTO-INIT — wires the shared plumbing onto any .lg-surface
  // ==========================================================================
  // Every glass element wants the same three things: a lens filter sized to
  // itself, a pointer-tracked specular highlight, and (unless it opts out)
  // press/hold physics. Component-specific files (glass-toggle.js,
  // glass-slider.js, ...) call LiquidGlass.enhance() themselves for elements
  // with EXTRA behavior beyond this, so they never have to re-wire the
  // shared part. Plain informational surfaces (a header bar, a card) can
  // skip press physics with data-lg-no-press.
  var enhanced = new WeakSet();

  function enhance(el, opts) {
    if (!el || enhanced.has(el)) return;
    enhanced.add(el);
    opts = opts || {};

    observeLensSize(el, {
      radius: opts.radius,
      edgeWidthFraction: opts.edgeWidthFraction,
      strength: opts.strength,
      blur: opts.blur
    });
    el.style.setProperty(
      '--lg-lens-filter',
      'url(#' + el.getAttribute('data-lg-filter-id') + ')'
    );

    trackSpecular(el);

    if (el.getAttribute('data-lg-no-press') !== 'true' && opts.press !== false) {
      pressable(el, opts.pressOptions);
    }
  }

  function autoInit(root) {
    root = root || document;
    var els = root.querySelectorAll('.lg-surface');
    for (var i = 0; i < els.length; i++) enhance(els[i]);
  }

  // Deliberately deferred one macrotask past DOMContentLoaded, not called
  // straight from the listener — found via jsdom (this sandbox still has no
  // real browser to load the actual page in) that toggle.js/slider.js/
  // segmented.js each register their OWN DOMContentLoaded listener too, to
  // call enhance(el, {strength: ...}) with their own specific, real-size-
  // tuned numbers. glass-engine.js is the first <script> tag on the page
  // (everything else requires window.LiquidGlass to already exist), so ITS
  // listener was always being registered — and firing — first. Since
  // enhance() only runs once per element (the `enhanced` Set guard a few
  // lines up), this generic pass was reaching every .lg-surface, including
  // toggle/slider/segmented's own thumbs, and claiming them with the plain
  // token default BEFORE those components' own, more specific calls ever
  // got a turn — silently discarding their strength/edgeWidthFraction on
  // every load. Not a hypothetical: traced it directly, via jsdom executing
  // the real script tags in the real page and inspecting which call reached
  // each thumb first. A plain setTimeout(fn, 0) here is enough — it pushes
  // this scan to the task queue, which only runs once every listener still
  // queued for THIS DOMContentLoaded dispatch (all of them, since every
  // component's own listener was registered synchronously while the page
  // was still parsing, same as this one) has already run, so their
  // enhance() calls now win the race and this pass only ever picks up
  // whatever they didn't already claim.
  function deferredAutoInit() {
    setTimeout(function () { autoInit(document); }, 0);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', deferredAutoInit);
    } else {
      deferredAutoInit();
    }
  }

  // ==========================================================================
  // 8. GLASS EFFECT CONTAINER — proximity-based auto merge/split
  // ==========================================================================
  // Apple's real spec for this (SwiftUI's GlassEffectContainer(spacing:)):
  // views inside the container blend their shapes together automatically
  // once they're closer than `spacing` apart, and split apart again once
  // they move farther than that — this is NOT something a developer
  // triggers by hand, it's a continuous proximity check. This is what
  // actually produces the "liquid" merging seen in the reference stills,
  // and it generalizes past exactly two elements to any number of glass
  // members placed inside a container.
  //
  // Members trade live backdrop refraction for reliable shape-fusion for as
  // long as they're inside the container — same reasoning as the standalone
  // goo group in glass-control-buttons.js, just generalized: see
  // DESIGN-PHYSICS-SPEC.md → "The goo/merge filter".
  function rectGap(a, b) {
    var dx = Math.max(a.left > b.right ? a.left - b.right : 0, b.left > a.right ? b.left - a.right : 0);
    var dy = Math.max(a.top > b.bottom ? a.top - b.bottom : 0, b.top > a.bottom ? b.top - a.bottom : 0);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function createGlassContainer(el, opts) {
    opts = opts || {};
    var spacing = opts.spacing != null ? opts.spacing : 40;
    var gooId = injectGooFilter(opts.gooStrength != null ? opts.gooStrength : 14);
    el.classList.add('lg-effect-container');
    el.style.setProperty('--lg-container-goo-filter', 'url(#' + gooId + ')');

    function members() {
      var selector = opts.memberSelector || ':scope > .lg-glass-member';
      return Array.prototype.slice.call(el.querySelectorAll(selector));
    }

    // glassEffectUnion equivalent: members sharing a non-empty
    // data-lg-union value are ALWAYS treated as merged, independent of
    // distance — a persistent group at rest, not just a proximity effect.
    // Apple's real API (glassEffectUnion(id:namespace:)) commits several
    // views to rendering as one shape even when nothing is moving; a
    // plain proximity check alone can never produce that, since two
    // members placed far apart with nothing between them would never
    // cross `spacing`.
    function hasForcedUnion(els) {
      var seen = {};
      for (var i = 0; i < els.length; i++) {
        var id = els[i].getAttribute('data-lg-union');
        if (!id) continue;
        if (seen[id]) return true;
        seen[id] = true;
      }
      return false;
    }

    function refresh() {
      var els = members();
      var merging = hasForcedUnion(els);
      for (var i = 0; i < els.length && !merging; i++) {
        for (var j = i + 1; j < els.length && !merging; j++) {
          if (rectGap(els[i].getBoundingClientRect(), els[j].getBoundingClientRect()) <= spacing) {
            merging = true;
          }
        }
      }
      var wasMerging = el.getAttribute('data-lg-merging') === 'true';
      el.setAttribute('data-lg-merging', String(merging));
      if (merging !== wasMerging) {
        el.dispatchEvent(new CustomEvent('lg:merge', { detail: { merged: merging }, bubbles: true }));
      }
      return merging;
    }

    // Layout changes (a member resizing, or the container itself resizing)
    // and pointer movement (dragging a member around) are the two ways
    // proximity actually changes in practice; a host app can also call
    // .refresh() itself right after it moves something programmatically.
    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refresh) : null;
    if (ro) { ro.observe(el); members().forEach(function (m) { ro.observe(m); }); }
    el.addEventListener('pointermove', refresh);

    refresh();
    return { refresh: refresh, destroy: function () { if (ro) ro.disconnect(); el.removeEventListener('pointermove', refresh); } };
  }

  // ==========================================================================
  // 9. TILT PARALLAX — device orientation, the web equivalent of Apple's own
  // note that Liquid Glass "reacts to the device's movement with animations
  // that suggest the movement of a drop of liquid"
  // ==========================================================================
  // iOS Safari requires a user gesture before it will even ask permission
  // for motion data — call enableTiltParallax() from a click handler, not on
  // page load. Everywhere else (Android Chrome, desktop), permission isn't
  // needed and this just starts working. Writes --lg-tilt-x/--lg-tilt-y
  // (roughly -1..1) on the given root so CSS can blend them into the
  // specular highlight position alongside the pointer-tracked one.
  function enableTiltParallax(root, opts) {
    root = root || document.documentElement;
    opts = opts || {};
    var maxDegrees = opts.maxDegrees != null ? opts.maxDegrees : 24;

    function onOrientation(ev) {
      if (ev.beta == null || ev.gamma == null) return;
      var x = Math.max(-1, Math.min(1, ev.gamma / maxDegrees));
      var y = Math.max(-1, Math.min(1, (ev.beta - 45) / maxDegrees)); // ~45°: a phone held up, not flat on a table
      root.style.setProperty('--lg-tilt-x', x.toFixed(3));
      root.style.setProperty('--lg-tilt-y', y.toFixed(3));
      // On a touch device there's no hover pointer to drive the specular
      // highlight (trackSpecular's pointermove never fires), so tilt
      // becomes the highlight's position source instead — this is the
      // mobile equivalent of "energizing with light" on interaction.
      root.style.setProperty('--lg-hl-x', (50 + x * 40).toFixed(1));
      root.style.setProperty('--lg-hl-y', (30 + y * 30).toFixed(1));
    }

    function start() {
      window.addEventListener('deviceorientation', onOrientation);
      return true;
    }

    var DOE = typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : null;
    if (DOE && typeof DOE.requestPermission === 'function') {
      // iOS 13+: must be called from within a user gesture (the caller's click handler).
      return DOE.requestPermission().then(function (state) {
        if (state === 'granted') return start();
        return false;
      }).catch(function () { return false; });
    }
    if (DOE) return Promise.resolve(start());
    return Promise.resolve(false); // no device-orientation support at all — not an error, just inert
  }

  // ==========================================================================
  // 10. AMBIENT LIGHT/DARK ADAPTATION (Regular variant only)
  // ==========================================================================
  // Apple's own description of the Regular variant is specific: "When on
  // top of light content, the glass lightens and foreground elements...
  // darken. And while on top of dark content, the inverse applies" — a
  // PER-ELEMENT adaptation to whatever's actually behind it, independent
  // of the page's overall light/dark theme. (Clear explicitly does NOT do
  // this — "the clear variant does not have any adaptive behaviors" —
  // see glass-surface.css, which only applies these rules outside
  // [data-lg-variant="clear"].)
  //
  // True per-pixel sampling isn't practical here (see the ambient-tint
  // reasoning in DESIGN-PHYSICS-SPEC.md) — this computes real WCAG
  // relative luminance from whatever color an author declares as a
  // region's ambient tint, and flips a companion attribute CSS branches
  // on. The math is exact; the input (the declared tint) is the
  // approximation, same trade-off as the ambient-tint highlight itself.
  function relativeLuminance(colorStr) {
    var probe = document.createElement('span');
    probe.style.color = colorStr;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    var resolved = getComputedStyle(probe).color; // browser normalizes to "rgb(r, g, b)"
    document.body.removeChild(probe);
    var nums = resolved.match(/[\d.]+/g);
    if (!nums || nums.length < 3) return 1; // couldn't parse — default to "light" rather than guess dark
    function channel(c) {
      c = c / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * channel(+nums[0]) + 0.7152 * channel(+nums[1]) + 0.0722 * channel(+nums[2]);
  }

  /**
   * Sets --lg-ambient-tint AND computes+applies the light/dark companion
   * attribute glass-surface.css keys off, in one call — use this instead
   * of setting the custom property directly whenever the tint represents
   * a real background color you want Regular-variant glass to adapt to.
   */
  function setAmbientTint(el, colorStr) {
    el.style.setProperty('--lg-ambient-tint', colorStr);
    var luminance = relativeLuminance(colorStr);
    el.setAttribute('data-lg-ambient-light', String(luminance > 0.5));
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================
  return {
    capabilities: capabilities,
    Spring: Spring,
    pressable: pressable,
    trackSpecular: trackSpecular,
    attachTouchBulge: attachTouchBulge,
    injectLensFilter: injectLensFilter,
    observeLensSize: observeLensSize,
    injectGooFilter: injectGooFilter,
    createGlassContainer: createGlassContainer,
    enableTiltParallax: enableTiltParallax,
    setAmbientTint: setAmbientTint,
    enhance: enhance,
    autoInit: autoInit,
    _internal: { renderLensDisplacementMap: renderLensDisplacementMap, roundedBoxSDF: roundedBoxSDF, rectGap: rectGap, relativeLuminance: relativeLuminance }
  };
});
