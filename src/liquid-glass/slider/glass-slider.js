/*!
 * Liquid Glass — Slider
 * Mathematical Convex Dome Snell Refraction Engine (p = 3.25 superellipse)
 * Depends on: core/glass-engine.js
 */
(function () {
  'use strict';

  var RAIL_H = 14;
  var LENS_H = 45;
  var LENS_W = 68; // 3:2 aspect ratio
  var LENS_R = 22.5;

  var REST_SCALE = 0.60;
  var PRESS_SCALE = 1.0;
  var REST_W = 41; // Math.round(LENS_W * REST_SCALE)
  var REST_H = 27; // Math.round(LENS_H * REST_SCALE)

  var BEZEL = 0.417 * LENS_R;
  var PEAK = 1.178 * LENS_H;
  var REST_RATIO = 0.40;
  var PRESS_RATIO = 0.90;

  var REST_FILL = 1.0;
  var PRESS_FILL = 0.02;

  // Mathematical Convex Dome Raytracer (p = 3.25 superellipse)
  function superellipse(p) {
    return function (t) { return Math.pow(1 - Math.pow(1 - t, p), 1 / p); };
  }

  var CONVEX_HEIGHT = superellipse(3.25);
  var CONVEX_RELIEF = 1.608;
  var CONVEX_SLAB = 5.945;
  var PROFILE_SIZE = 128;
  var IOR = 1.5;

  var cachedProfile = null;
  function getConvexProfile() {
    if (cachedProfile) return cachedProfile;
    var shift = new Float32Array(PROFILE_SIZE);
    var a = 1 / IOR;
    var h = 1e-4;
    for (var i = 0; i < PROFILE_SIZE; i++) {
      var t = i / PROFILE_SIZE;
      var height = CONVEX_HEIGHT(t);
      var slope = (CONVEX_HEIGHT(t + h) - height) / h;
      var len = Math.hypot(slope, 1);
      var nx = -slope / len;
      var ny = -1 / len;
      var inside = 1 - a * a * (1 - ny * ny);
      if (inside < 0) continue;
      var k = a * ny + Math.sqrt(inside);
      var dirX = -k * nx;
      var dirY = a - k * ny;
      var depth = height * CONVEX_RELIEF + CONVEX_SLAB;
      shift[i] = dirY !== 0 ? dirX * (depth / dirY) : 0;
    }
    var edge = Math.abs(shift[0]) || 1;
    for (var j = 0; j < PROFILE_SIZE; j++) {
      shift[j] = Math.max(-1, Math.min(1, shift[j] / edge));
    }
    cachedProfile = shift;
    return shift;
  }

  var cachedMaps = null;
  function buildConvexLensMaps(dpr) {
    if (cachedMaps) return cachedMaps;
    var scaleFactor = Math.max(dpr || 1, 2) * 1.5;
    var W = Math.round(LENS_W * scaleFactor);
    var H = Math.round(LENS_H * scaleFactor);
    var R = LENS_R * scaleFactor;
    var B = BEZEL * scaleFactor;
    var innerW = W - R * 2;
    var innerH = H - R * 2;
    var shift = getConvexProfile();

    var dispCanvas = document.createElement('canvas');
    dispCanvas.width = W; dispCanvas.height = H;
    var dispCtx = dispCanvas.getContext('2d');
    var dispImg = dispCtx.createImageData(W, H);

    var specCanvas = document.createElement('canvas');
    specCanvas.width = W; specCanvas.height = H;
    var specCtx = specCanvas.getContext('2d');
    var specImg = specCtx.createImageData(W, H);

    // Fill displacement with neutral 128, 128
    for (var p = 0; p < W * H * 4; p += 4) {
      dispImg.data[p] = 128;
      dispImg.data[p + 1] = 128;
      dispImg.data[p + 2] = 0;
      dispImg.data[p + 3] = 255;
    }

    var rSq = R * R;
    var outerSq = (R + 1) * (R + 1);
    var innerSq = (R - B) * (R - B);
    var LIGHT_ANGLE = (-60 * Math.PI) / 180;

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
        var aa = sq < rSq ? 1 : Math.max(0, 1 - (dist - R));

        var profIdx = Math.min(((depth / B) * PROFILE_SIZE) | 0, PROFILE_SIZE - 1);
        var mag = shift[profIdx] || 0;

        // Smooth continuous scaling between curved caps and horizontal straight run:
        // On caps (|lx| -> R): 100% full meniscus flaring for rail entry and exit!
        // On straight run (lx -> 0): smooth 0.35x vertical dome bending without card tearing!
        var capFactor = Math.min(1, Math.abs(lx) / R);
        var vertScale = 0.35 + 0.65 * capFactor;
        var dispX = nx * mag;
        var dispY = ny * mag * vertScale;

        var idx = (y * W + x) * 4;
        dispImg.data[idx] = Math.round(128 - dispX * 127 * aa);
        dispImg.data[idx + 1] = Math.round(128 - dispY * 127 * aa);

        var theta = Math.atan2(ny, nx);
        var lit = Math.pow(Math.cos(theta - LIGHT_ANGLE), 2);
        var across = Math.abs(depth / scaleFactor - 0.5);
        var rim = across >= 1 ? 0 : Math.cos((Math.PI / 2) * across);
        var value = lit * rim * aa;
        specImg.data[idx] = Math.round(Math.sqrt(value) * 255);
        specImg.data[idx + 1] = Math.round(Math.sqrt(value) * 255);
        specImg.data[idx + 2] = Math.round(Math.sqrt(value) * 255);
        specImg.data[idx + 3] = Math.round(value * 255);
      }
    }

    dispCtx.putImageData(dispImg, 0, 0);
    specCtx.putImageData(specImg, 0, 0);

    cachedMaps = {
      displacement: dispCanvas.toDataURL(),
      specular: specCanvas.toDataURL()
    };
    return cachedMaps;
  }

  var sliderCounter = 0;

  function initSlider(el) {
    if (!window.LiquidGlass) {
      console.warn('[liquid-glass] glass-engine.js must load before glass-slider.js');
      return;
    }
    if (el.__lgSliderInit) return;
    el.__lgSliderInit = true;

    var filterId = 'lq-slider-filter-' + (++sliderCounter);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var maps = buildConvexLensMaps(dpr);

    // Inject SVG filter into DOM if not present
    var svgFilterContainer = document.getElementById('lg-slider-svg-filters');
    if (!svgFilterContainer) {
      svgFilterContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgFilterContainer.id = 'lg-slider-svg-filters';
      svgFilterContainer.setAttribute('aria-hidden', 'true');
      svgFilterContainer.style.position = 'absolute';
      svgFilterContainer.style.width = '0';
      svgFilterContainer.style.height = '0';
      svgFilterContainer.style.pointerEvents = 'none';
      document.body.appendChild(svgFilterContainer);
    }

    var filterDef = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filterDef.id = filterId;
    filterDef.setAttribute('color-interpolation-filters', 'sRGB');
    filterDef.setAttribute('x', '-30%');
    filterDef.setAttribute('y', '-30%');
    filterDef.setAttribute('width', '160%');
    filterDef.setAttribute('height', '160%');
    filterDef.innerHTML =
      '<feGaussianBlur in="SourceGraphic" stdDeviation="0.25" result="softened"/>' +
      '<feImage href="' + maps.displacement + '" x="0" y="0" width="' + LENS_W + '" height="' + LENS_H + '" preserveAspectRatio="none" result="map"/>' +
      '<feDisplacementMap id="' + filterId + '-disp" in="softened" in2="map" scale="' + (PEAK * REST_RATIO).toFixed(2) + '" xChannelSelector="R" yChannelSelector="G" result="bent"/>' +
      '<feColorMatrix in="bent" type="saturate" values="7" result="vivid"/>' +
      '<feImage href="' + maps.specular + '" x="0" y="0" width="' + LENS_W + '" height="' + LENS_H + '" preserveAspectRatio="none" result="rim"/>' +
      '<feComposite in="vivid" in2="rim" operator="in" result="colouredRim"/>' +
      '<feComponentTransfer in="rim" result="whiteRim">' +
      '  <feFuncA type="linear" slope="0.45"/>' +
      '</feComponentTransfer>' +
      '<feBlend in="colouredRim" in2="bent" result="withColour"/>' +
      '<feBlend in="whiteRim" in2="withColour"/>';
    svgFilterContainer.appendChild(filterDef);

    var dispEl = filterDef.querySelector('#' + filterId + '-disp');

    var thumb = el.querySelector('.lg-slider-thumb');
    var fill = el.querySelector('.lg-slider-fill');

    if (!thumb) {
      thumb = document.createElement('div');
      thumb.className = 'lg-slider-thumb';
      el.appendChild(thumb);
    }

    // Clear legacy SVG content if any
    var legacySvg = thumb.querySelector('.lg-slider-lens-svg');
    if (legacySvg) legacySvg.remove();

    var lens = thumb.querySelector('.lg-slider-lens');
    if (!lens) {
      lens = document.createElement('span');
      lens.className = 'lg-slider-lens';
      lens.setAttribute('aria-hidden', 'true');
      thumb.appendChild(lens);
    }

    // Apply native Chromium SVG backdrop-filter for authentic live refraction!
    lens.style.backdropFilter = 'url(#' + filterId + ')';
    lens.style.webkitBackdropFilter = 'url(#' + filterId + ')';

    var min = parseFloat(el.getAttribute('aria-valuemin')) || 0;
    var max = parseFloat(el.getAttribute('aria-valuemax')) || 100;
    var value = parseFloat(el.getAttribute('aria-valuenow'));
    if (isNaN(value)) value = (min + max) / 2;
    var step = parseFloat(el.getAttribute('data-lg-step')) || 1;

    function usableWidth() {
      return (el.clientWidth || 320) - REST_W;
    }

    function valueToPx(v) {
      var pct = (v - min) / (max - min);
      return Math.round(pct * usableWidth());
    }

    function pxToValue(px) {
      var w = usableWidth();
      if (w <= 0) return min;
      if (px <= 0) return min;
      if (px >= w) return max;
      var raw = min + (px / w) * (max - min);
      return Math.round(raw / step) * step;
    }

    var xSpring = new window.LiquidGlass.Spring(valueToPx(value), {
      stiffness: 420,
      damping: 32,
      onUpdate: function (x) {
        thumb.style.setProperty('--lg-slider-x', x.toFixed(2) + 'px');
        if (fill) {
          var W = el.clientWidth || 320;
          var uw = Math.max(1, W - REST_W);
          if (x <= 0.5) {
            fill.style.setProperty('--lg-slider-fill-width', '0px');
            fill.style.opacity = '0';
          } else if (x >= uw - 0.5) {
            fill.style.setProperty('--lg-slider-fill-width', W + 'px');
            fill.style.opacity = '1';
          } else {
            var center = x + REST_W / 2;
            var emergenceBlend = Math.min(1, x / 6.0);
            var completionBlend = Math.max(0, (x - (uw - REST_W / 2)) / (REST_W / 2));
            var fw = center * emergenceBlend + (W - center) * completionBlend;
            fill.style.setProperty('--lg-slider-fill-width', Math.min(W, Math.max(0, fw)).toFixed(2) + 'px');
            var op = Math.min(1, Math.max(0, (x - 0.5) / 3.0));
            fill.style.opacity = op.toFixed(3);
          }
        }

        var speed = Math.abs(xSpring.velocity || 0);
        var stretchTarget = Math.min(speed / 2400, 0.18);
        stretchSpring.target = stretchTarget;
      }
    });

    var stretchSpring = new window.LiquidGlass.Spring(0, {
      stiffness: 400,
      damping: 36,
      onUpdate: function (s) {
        lens.style.setProperty('--lg-slider-stretch-x', (1 + s).toFixed(3));
        lens.style.setProperty('--lg-slider-stretch-y', (1 - s * 0.45).toFixed(3));
      }
    });

    function getIsClear() {
      return thumb.getAttribute('data-lg-variant') === 'clear' ||
             el.getAttribute('data-lg-variant') === 'clear' ||
             el.getAttribute('data-lg-glass') === 'permanent' ||
             el.classList.contains('lg-permanent-glass') ||
             thumb.classList.contains('lg-permanent-glass');
    }

    var pressSpring = new window.LiquidGlass.Spring(getIsClear() ? 1 : 0, {
      stiffness: 2000,
      damping: 80,
      onUpdate: function (t) {
        var scale = REST_SCALE + (PRESS_SCALE - REST_SCALE) * t;
        lens.style.setProperty('--lg-slider-scale', scale.toFixed(3));
        var whiteOpacity = REST_FILL + (PRESS_FILL - REST_FILL) * t;
        lens.style.setProperty('--lg-slider-white-opacity', whiteOpacity.toFixed(3));

        var validT = isFinite(t) ? t : 0;
        var ratio = REST_RATIO + (PRESS_RATIO - REST_RATIO) * validT;
        if (dispEl) dispEl.setAttribute('scale', (PEAK * (isFinite(ratio) ? ratio : REST_RATIO)).toFixed(2));
      }
    });
    pressSpring.set(getIsClear() ? 1 : 0, true);

    if (typeof MutationObserver !== 'undefined') {
      var attrObs = new MutationObserver(function () {
        var clear = getIsClear();
        if (clear) {
          pressSpring.set(1);
        } else if (!dragging) {
          pressSpring.set(0);
        }
      });
      attrObs.observe(thumb, { attributes: true, attributeFilter: ['data-lg-variant', 'class'] });
      attrObs.observe(el, { attributes: true, attributeFilter: ['data-lg-variant', 'data-lg-glass', 'class'] });
    }

    function setValue(next, opts) {
      opts = opts || {};
      value = Math.min(Math.max(next, min), max);
      el.setAttribute('aria-valuenow', String(value));
      xSpring.set(valueToPx(value), opts.instant);
      if (!opts.silent) {
        el.dispatchEvent(new CustomEvent('lg:input', { detail: { value: value }, bubbles: true }));
      }
    }

    setValue(value, { instant: true, silent: true });

    // Pointer manipulation
    var dragging = false;
    function pxFromEvent(ev) {
      var rect = el.getBoundingClientRect();
      var relX = ev.clientX - rect.left;
      var uw = usableWidth();
      var px = relX - REST_W / 2;
      return Math.max(0, Math.min(uw, px));
    }

    el.addEventListener('pointerdown', function (ev) {
      if (el.getAttribute('aria-disabled') === 'true') return;
      dragging = true;
      try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      pressSpring.set(1);
      setValue(pxToValue(pxFromEvent(ev)));
      thumb.setAttribute('data-lg-interacting', 'true');
    });

    el.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      setValue(pxToValue(pxFromEvent(ev)));
    });

    function endDrag(ev) {
      if (!dragging) return;
      dragging = false;
      try { el.releasePointerCapture(ev.pointerId); } catch (e) {}
      if (!getIsClear()) pressSpring.set(0);
      thumb.removeAttribute('data-lg-interacting');
    }

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    // Keyboard navigation
    el.addEventListener('keydown', function (ev) {
      if (el.getAttribute('aria-disabled') === 'true') return;
      var handled = true;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') setValue(value + step);
      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') setValue(value - step);
      else if (ev.key === 'Home') setValue(min);
      else if (ev.key === 'End') setValue(max);
      else if (ev.key === 'PageUp') setValue(value + step * 10);
      else if (ev.key === 'PageDown') setValue(value - step * 10);
      else handled = false;
      if (handled) ev.preventDefault();
    });

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () { xSpring.set(valueToPx(value), true); }).observe(el);
    }
  }

  function initAll(root) {
    (root || document).querySelectorAll('.lg-slider').forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  window.LiquidGlassSlider = { init: initSlider, initAll: initAll };
})();
