/*!
 * Liquid Glass — Toggle Component
 * 1:1 Liqui Design Switch Architecture (https://liqui.design)
 *
 * Geometry & Optics:
 * - Track: 72x30px capsule, neutral 47% mid-gray off / Apple green (#34c759) on
 * - Thumb Layout Box: 65x41px, r=20.5px, left=-9.7px, top=15px (translateY: -50%)
 * - Dual-Mode Operation:
 *     Rest (scale 0.65, fill 1.0): pristine solid white pill cleanly nested inside track (1.675px margins)
 *     Interactive / Swollen (scale 0.90..1.0, fill 0.10): swells past track bounds, thinning white fill
 *     to reveal the underlying liquid glass displacement lens
 * - Vector Snell's Law Displacement Map: LIP profile (convex rim + concave dish + flat middle window)
 * - Directional Specular Map (-60° rim lighting) with 6x saturated wet edge
 * - Direct-manipulation pointer tracking along TRAVEL=26.4px with rubber-band physics & spring loop
 */
(function () {
  'use strict';

  var toggleCounter = 0;

  /* -------------------------------------------------------------------------- */
  /* Optics & Displacement Map Kernel                                           */
  /* -------------------------------------------------------------------------- */

  var PROFILE_SIZE = 128;
  var IOR = 1.5;

  function superellipse(p) {
    return function (t) { return Math.pow(1 - Math.pow(1 - t, p), 1 / p); };
  }
  var squircle = superellipse(4);
  function circle(t) { return Math.sqrt(1 - (1 - t) * (1 - t)); }
  function smootherstep(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

  var LIP_SURFACE = {
    id: 'lip',
    height: function (t) {
      var k = smootherstep(t);
      return squircle(t * 2) * (1 - k) + (1 - circle(t) + 0.1) * k;
    },
    relief: 2.776,
    slab: 6.776
  };

  var cachedProfileShift = null;
  function getLensProfile(surface) {
    if (cachedProfileShift) return cachedProfileShift;
    var shift = new Float32Array(PROFILE_SIZE);
    var a = 1 / IOR;
    for (var i = 0; i < PROFILE_SIZE; i++) {
      var t = i / PROFILE_SIZE;
      var h = 1e-4;
      var height = surface.height(t);
      var slope = (surface.height(t + h) - height) / h;
      var len = Math.hypot(slope, 1);
      var nx = -slope / len;
      var ny = -1 / len;
      var inside = 1 - a * a * (1 - ny * ny);
      if (inside < 0) continue;
      var k = a * ny + Math.sqrt(inside);
      var dirX = -k * nx;
      var dirY = a - k * ny;
      var depth = height * surface.relief + surface.slab;
      shift[i] = dirY !== 0 ? dirX * (depth / dirY) : 0;
    }
    var edge = Math.abs(shift[0]) || 1;
    for (var j = 0; j < PROFILE_SIZE; j++) {
      shift[j] = Math.max(-1, Math.min(1, shift[j] / edge));
    }
    cachedProfileShift = shift;
    return shift;
  }

  var LIGHT_ANGLE = (-60 * Math.PI) / 180;
  var cachedMaps = null;

  function buildLensMaps(width, height, radius, bezel, dpr) {
    if (cachedMaps) return cachedMaps;
    if (typeof document === 'undefined') return null;

    try {
      var W = Math.round(width * dpr);
      var H = Math.round(height * dpr);
      var R = radius * dpr;
      var B = bezel * dpr;
      var innerW = W - R * 2;
      var innerH = H - R * 2;
      var shift = getLensProfile(LIP_SURFACE);

      var disp = new ImageData(W, H);
      var spec = new ImageData(W, H);
      new Uint32Array(disp.data.buffer).fill(0xff008080); // Neutral displacement (128, 128)

      var rSq = R * R;
      var outerSq = (R + 1) * (R + 1);
      var innerSq = (R - B) * (R - B);

      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          var lx = x < R ? x - R : x >= W - R ? x - R - innerW : 0;
          var ly = y < R ? y - R : y >= H - R ? y - R - innerH : 0;
          var sq = lx * lx + ly * ly;
          if (sq > outerSq || sq < innerSq) continue;

          var dist = Math.sqrt(sq) || 1e-6;
          var depth = R - dist;
          var nx = lx / dist;
          var ny = ly / dist;
          var aa = sq < rSq ? 1 : 1 - (dist - R);

          var i = (y * W + x) * 4;
          var idx = Math.min(((depth / B) * PROFILE_SIZE) | 0, PROFILE_SIZE - 1);
          var mag = shift[idx] != null ? shift[idx] : 0;

          disp.data[i] = 128 - nx * mag * 127 * aa;
          disp.data[i + 1] = 128 - ny * mag * 127 * aa;
          disp.data[i + 2] = 0;
          disp.data[i + 3] = 255;

          var theta = Math.atan2(ny, nx);
          var lit = Math.pow(Math.cos(theta - LIGHT_ANGLE), 2);
          var across = Math.abs(depth / dpr - 0.5);
          var rim = across >= 1 ? 0 : Math.cos((Math.PI / 2) * across);
          var val = lit * rim * aa;

          spec.data[i] = spec.data[i + 1] = spec.data[i + 2] = Math.sqrt(val) * 255;
          spec.data[i + 3] = val * 255;
        }
      }

      function toPng(img) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.putImageData(img, 0, 0);
        return canvas.toDataURL();
      }

      cachedMaps = { displacement: toPng(disp), specular: toPng(spec) };
      return cachedMaps;
    } catch (e) {
      return null;
    }
  }

  function injectFilterDefs(id, maps, w, h, initialScale) {
    if (!maps || typeof document === 'undefined') return;
    var filterId = 'lq-switch-filter-' + id;
    if (document.getElementById(filterId)) return filterId;

    var container = document.getElementById('lg-global-lens-svg-container');
    if (!container) {
      container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      container.id = 'lg-global-lens-svg-container';
      container.setAttribute('aria-hidden', 'true');
      container.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
      document.body.appendChild(container);
    }

    var defs = container.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      container.appendChild(defs);
    }

    var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.id = filterId;
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    filter.innerHTML =
      '<feGaussianBlur in="SourceGraphic" stdDeviation="0.09" result="softened"/>' +
      '<feImage href="' + maps.displacement + '" x="0" y="0" width="' + w + '" height="' + h + '" result="map"/>' +
      '<feDisplacementMap id="scaleEl_' + id + '" in="softened" in2="map" scale="' + initialScale + '" xChannelSelector="R" yChannelSelector="G" result="bent"/>' +
      '<feColorMatrix in="bent" type="saturate" values="6" result="vivid"/>' +
      '<feImage href="' + maps.specular + '" x="0" y="0" width="' + w + '" height="' + h + '" result="rim"/>' +
      '<feComposite in="vivid" in2="rim" operator="in" result="colouredRim"/>' +
      '<feComponentTransfer in="rim" result="whiteRim">' +
      '  <feFuncA type="linear" slope="0.5"/>' +
      '</feComponentTransfer>' +
      '<feBlend in="colouredRim" in2="bent" result="withColour"/>' +
      '<feBlend in="whiteRim" in2="withColour"/>';

    defs.appendChild(filter);
    return filterId;
  }

  /* -------------------------------------------------------------------------- */
  /* Physics Springs                                                            */
  /* -------------------------------------------------------------------------- */

  function Spring(initial, opts) {
    opts = opts || {};
    this.value = initial || 0;
    this.target = initial || 0;
    this.velocity = 0;
    this.stiffness = opts.stiffness != null ? opts.stiffness : 1000;
    this.damping = opts.damping != null ? opts.damping : 80;
    this.settled = true;
    this.held = false;
  }
  Spring.prototype.set = function (target, instant) {
    this.target = target;
    if (instant) {
      this.value = target;
      this.velocity = 0;
      this.settled = true;
      return;
    }
    this.settled = false;
  };
  Spring.prototype.step = function (dt) {
    if (this.settled || this.held) return;
    var d = this.value - this.target;
    var f = -this.stiffness * d - this.damping * this.velocity;
    this.velocity += f * dt;
    this.value += this.velocity * dt;
    if (Math.abs(this.velocity) < 0.001 && Math.abs(this.value - this.target) < 0.001) {
      this.value = this.target;
      this.velocity = 0;
      this.settled = true;
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Component Initialization                                                    */
  /* -------------------------------------------------------------------------- */

  var TRAVEL = 26.4;
  var OVERDRAG = 22;
  var PEAK = 13.10;
  var REST_RATIO = 0.40;
  var PRESS_RATIO = 0.90;

  function initToggle(el) {
    if (el.__lgToggleInit) return;
    el.__lgToggleInit = true;

    var id = ++toggleCounter;

    var track = el.querySelector('.lg-toggle-track');
    if (!track) {
      track = document.createElement('span');
      track.className = 'lg-toggle-track';
      el.appendChild(track);
    }
    var trackAccent = track.querySelector('.lg-toggle-track-accent');
    if (!trackAccent) {
      trackAccent = document.createElement('span');
      trackAccent.className = 'lg-toggle-track-accent';
      track.appendChild(trackAccent);
    }

    var thumb = el.querySelector('.lg-toggle-thumb');
    if (!thumb) {
      thumb = document.createElement('span');
      thumb.className = 'lg-toggle-thumb';
      el.appendChild(thumb);
    }

    // Clean up any legacy bevel SVG or extra DOM elements inside thumb
    var legacySvg = thumb.querySelector('.lg-toggle-bevel-svg');
    if (legacySvg) legacySvg.remove();

    // Generate lens displacement maps and filter
    var dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2, 3);
    var maps = buildLensMaps(65, 41, 20.5, 8.46, dpr);
    var filterId = maps ? injectFilterDefs(id, maps, 65, 41, PEAK * REST_RATIO) : null;
    if (filterId) {
      thumb.style.setProperty('--lg-toggle-filter', 'url(#' + filterId + ')');
    }

    var checked = el.getAttribute('aria-checked') === 'true';

    function isHeroGlass() {
      return thumb.getAttribute('data-lg-variant') === 'clear' ||
        el.classList.contains('lg-permanent-glass') ||
        el.getAttribute('data-lg-variant') === 'clear';
    }

    // Springs:
    // posSpring: travel position (0 = OFF, 1 = ON)
    // pressSpring: swell factor (0 = resting white pill, 1 = swollen liquid glass)
    // tintSpring: track color flip
    var posSpring = new Spring(checked ? 1 : 0, { stiffness: 1000, damping: 80 });
    var pressSpring = new Spring(isHeroGlass() ? 1 : 0, { stiffness: 2000, damping: 80 });
    var tintSpring = new Spring(checked ? 1 : 0, { stiffness: 1000, damping: 80 });

    var springs = [posSpring, pressSpring, tintSpring];
    var rafId = 0;
    var lastTime = 0;

    function animLoop(now) {
      if (!lastTime) lastTime = now;
      var dt = Math.min((now - lastTime) / 1000, 1 / 20);
      lastTime = now;

      var allSettled = true;
      for (var i = 0; i < springs.length; i++) {
        springs[i].step(dt);
        if (!springs[i].settled && !springs[i].held) allSettled = false;
      }

      syncStyle();

      if (!allSettled || posSpring.held) {
        rafId = requestAnimationFrame(animLoop);
      } else {
        rafId = 0;
        lastTime = 0;
      }
    }

    function wakeAnimation() {
      if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(animLoop);
      }
    }

    function syncStyle() {
      var p = posSpring.value;
      var s = pressSpring.value;
      var t = tintSpring.value;

      // Position: translate along straight travel run
      var tx = p * TRAVEL;
      // Scale: 0.65 at rest (fits completely inside track) -> 0.90..1.0 swollen (past track)
      var maxScale = isHeroGlass() ? 1.0 : 0.90;
      var scale = 0.65 + (maxScale - 0.65) * s;
      // Fill: 1.0 at rest (opaque white pill) -> 0.10 swollen (revealing liquid glass)
      var whiteOp = Math.max(0.10, 1.0 - 0.90 * s);

      thumb.style.setProperty('--lg-toggle-x', tx.toFixed(2) + 'px');
      thumb.style.setProperty('--lg-toggle-scale', scale.toFixed(3));
      thumb.style.setProperty('--lg-toggle-white-opacity', whiteOp.toFixed(3));

      // Dynamic scale of feDisplacementMap
      var scaleEl = document.getElementById('scaleEl_' + id);
      if (scaleEl) {
        var mapScale = PEAK * (REST_RATIO + (PRESS_RATIO - REST_RATIO) * s);
        scaleEl.setAttribute('scale', mapScale.toFixed(2));
      }

      // Track accent opacity
      trackAccent.style.opacity = t.toFixed(3);

      // Drag shadow telling
      var shadow = (posSpring.held || dragging)
        ? '0 4px 22px rgba(0,0,0,0.15), inset 0.89px 3.13px 10.74px rgba(0,0,0,0.09), inset -0.89px -3.13px 10.74px rgba(255,255,255,0.09)'
        : '0 4px 22px rgba(0, 0, 0, 0.10)';
      thumb.style.setProperty('--lg-toggle-shadow', shadow);
    }

    // Set initial layout
    posSpring.set(checked ? 1 : 0, true);
    pressSpring.set(isHeroGlass() ? 1 : 0, true);
    tintSpring.set(checked ? 1 : 0, true);
    syncStyle();

    function setChecked(next, opts) {
      opts = opts || {};
      checked = !!next;
      el.setAttribute('aria-checked', String(checked));
      posSpring.set(checked ? 1 : 0, opts.instant);
      tintSpring.set(checked ? 1 : 0, opts.instant);
      wakeAnimation();
      if (!opts.silent) {
        el.dispatchEvent(new CustomEvent('lg:change', { detail: { checked: checked }, bubbles: true }));
      }
    }

    // Direct Manipulation Pointer / Drag Handling
    var dragging = false;
    var dragMoved = false;
    var pointerStartX = 0;
    var valueAtDragStart = 0;
    var MOVE_THRESHOLD = 3;

    el.addEventListener('pointerdown', function (ev) {
      if (el.getAttribute('data-lg-disabled') === 'true') return;
      dragging = true;
      dragMoved = false;
      pointerStartX = ev.clientX;
      valueAtDragStart = posSpring.value;
      try { el.setPointerCapture(ev.pointerId); } catch (e) {}

      pressSpring.set(1);
      wakeAnimation();
    });

    el.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var dx = ev.clientX - pointerStartX;
      if (Math.abs(dx) > MOVE_THRESHOLD) {
        dragMoved = true;
        posSpring.held = true;
      }
      if (dragMoved) {
        var raw = valueAtDragStart + dx / TRAVEL;
        var over = raw < 0 ? -raw : raw > 1 ? raw - 1 : 0;
        posSpring.value = Math.min(1, Math.max(0, raw)) + Math.sign(raw) * (over / OVERDRAG);
        tintSpring.set(posSpring.value > 0.5 ? 1 : 0);
        syncStyle();
      }
    });

    function endInteraction(ev) {
      if (!dragging) return;
      dragging = false;
      posSpring.held = false;
      try { el.releasePointerCapture(ev.pointerId); } catch (e) {}

      if (dragMoved) {
        setChecked(posSpring.value > 0.5);
      }

      if (!isHeroGlass()) {
        pressSpring.set(0);
      }
      wakeAnimation();
    }

    el.addEventListener('pointerup', endInteraction);
    el.addEventListener('pointercancel', endInteraction);

    el.addEventListener('click', function () {
      if (el.getAttribute('data-lg-disabled') === 'true') return;
      if (dragMoved) {
        dragMoved = false;
        return;
      }
      setChecked(!checked);
      if (!isHeroGlass()) {
        pressSpring.set(1, true);
        pressSpring.set(0);
        wakeAnimation();
      }
    });

    // Keyboard support
    el.addEventListener('keydown', function (ev) {
      if (el.getAttribute('data-lg-disabled') === 'true') return;
      if (ev.key === ' ' || ev.key === 'Enter') {
        ev.preventDefault();
        setChecked(!checked);
        if (!isHeroGlass()) {
          pressSpring.set(1, true);
          pressSpring.set(0);
          wakeAnimation();
        }
      }
    });

    // Observe data-lg-variant changes (for Hero Glass switcher)
    if (typeof MutationObserver !== 'undefined') {
      var obs = new MutationObserver(function () {
        var hero = isHeroGlass();
        pressSpring.set(hero ? 1 : 0);
        wakeAnimation();
      });
      obs.observe(thumb, { attributes: true, attributeFilter: ['data-lg-variant'] });
      obs.observe(el, { attributes: true, attributeFilter: ['class', 'data-lg-variant'] });
    }

    // Public API
    el.__lgToggle = {
      get checked() { return checked; },
      set: function (next, instant) { setChecked(next, { instant: instant, silent: true }); },
      setHold: function (hold) { pressSpring.set(hold ? 1 : 0); wakeAnimation(); },
      sync: syncStyle
    };
  }

  function initAll(root) {
    (root || document).querySelectorAll('.lg-toggle').forEach(initToggle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  window.LiquidGlassToggle = { init: initToggle, initAll: initAll };
})();
