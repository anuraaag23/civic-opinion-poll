/*!
 * Liquid Glass — Bottom Tab Bar (Dock)
 * 1:1 Liqui Design TabBar Architecture (https://liqui.design)
 *
 * Features:
 * - 58px capsule dock (r=29px, padding 6px) with optical crystal clarity
 * - 46px selection pill (r=23px) equipped with Snell's Law vector displacement lens
 * - Dual-mode pill optics:
 *     Rest (scale 1.0, fill 1.0, mapScale 2.1): soft highlight with subtle rim refraction
 *     Pressed (scale 1.16, fill 0.08, mapScale 14.7): swells 16% inside 58px dock,
 *     thinning fill to uncover deep backdrop refraction under the finger
 * - Lateral momentum physics with velocity-dependent squash & stretch (STRETCH_MAX=0.20, STRETCH_SPEED=2600)
 * - Immediate anticipatory press tracking on pointerdown (anticipates destination before click commits)
 * - Sinking press interaction: touched tab contents sink 10% under finger
 * - Icon bounce springs (k=340, c=15)
 * - High-contrast adaptive typography (Apple Blue #007aff active, #636366 inactive)
 * - Support for notification badges and expandable search button
 */
(function () {
  'use strict';

  var tabbarCounter = 0;

  /* -------------------------------------------------------------------------- */
  /* Optics & Displacement Map Kernel for Tab Bar Pill Lens                     */
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
  var pillMapCache = {};

  function buildPillMaps(width, height, radius, bezel, dpr) {
    var key = Math.round(width) + 'x' + Math.round(height) + '@' + dpr;
    if (pillMapCache[key]) return pillMapCache[key];
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
      new Uint32Array(disp.data.buffer).fill(0xff008080);

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

      var maps = { displacement: toPng(disp), specular: toPng(spec) };
      pillMapCache[key] = maps;
      return maps;
    } catch (e) {
      return null;
    }
  }

  function injectPillFilter(id, maps, w, h, initialScale) {
    if (!maps || typeof document === 'undefined') return;
    var filterId = 'lq-tabpill-filter-' + id;
    var existing = document.getElementById(filterId);
    if (existing) {
      existing.remove(); // Rebuild when width changes on layout
    }

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
      '<feGaussianBlur in="SourceGraphic" stdDeviation="0" result="softened"/>' +
      '<feImage href="' + maps.displacement + '" x="0" y="0" width="' + w + '" height="' + h + '" result="map"/>' +
      '<feDisplacementMap id="pillScaleEl_' + id + '" in="softened" in2="map" scale="' + initialScale + '" xChannelSelector="R" yChannelSelector="G" result="bent"/>' +
      '<feColorMatrix in="bent" type="saturate" values="5" result="vivid"/>' +
      '<feImage href="' + maps.specular + '" x="0" y="0" width="' + w + '" height="' + h + '" result="rim"/>' +
      '<feComposite in="vivid" in2="rim" operator="in" result="colouredRim"/>' +
      '<feComponentTransfer in="rim" result="whiteRim">' +
      '  <feFuncA type="linear" slope="0.42"/>' +
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
    this.stiffness = opts.stiffness != null ? opts.stiffness : 520;
    this.damping = opts.damping != null ? opts.damping : 40;
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
  /* Dock Initialization                                                        */
  /* -------------------------------------------------------------------------- */

  var ITEM_H = 46;
  var PILL_BEZEL_RATIO = 0.413;
  var PILL_PEAK_RATIO = 0.3196;
  var REST_RATIO = 0.14;
  var PRESS_RATIO = 1.0;
  var PRESS_SCALE = 1.16;
  var STRETCH_MAX = 0.20;
  var STRETCH_SPEED = 2600;

  function initTabbar(el) {
    if (el.__lgTabbarInit) return;
    el.__lgTabbarInit = true;

    var id = ++tabbarCounter;

    if (!el.getAttribute('data-lg-tab-mode')) el.setAttribute('data-lg-tab-mode', 'all-icons');

    var tabs = Array.prototype.slice.call(el.querySelectorAll('.lg-tab'));
    var indicator = el.querySelector('.lg-tabbar-indicator');

    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'lg-tabbar-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      el.insertBefore(indicator, el.firstChild);
    }

    // Wrap tab contents in .lg-tab-content if not already present
    tabs.forEach(function (tab) {
      if (!tab.querySelector('.lg-tab-content')) {
        var wrap = document.createElement('span');
        wrap.className = 'lg-tab-content';
        while (tab.firstChild) {
          wrap.appendChild(tab.firstChild);
        }
        tab.appendChild(wrap);
      }
    });

    var selectedIndex = 0;
    tabs.forEach(function (tab, i) {
      if (tab.getAttribute('aria-current') === 'page') selectedIndex = i;
    });

    function measureTab(tab) {
      if (!tab) return { x: 6, w: 68 };
      var tRect = tab.getBoundingClientRect();
      var bRect = el.getBoundingClientRect();
      var x = tRect.left - bRect.left;
      var w = tRect.width;
      if (w <= 0 || isNaN(w)) {
        x = tab.offsetLeft || 6;
        w = tab.offsetWidth || 68;
      }
      return { x: x, w: w };
    }

    var initialTab = tabs[selectedIndex] || tabs[0];
    var mInit = measureTab(initialTab);
    var initX = mInit.x;
    var initW = mInit.w;

    // Springs
    var xSpring = new Spring(initX, { stiffness: 520, damping: 40 });
    var wSpring = new Spring(initW, { stiffness: 520, damping: 40 });
    var stretchSpring = new Spring(0, { stiffness: 520, damping: 44 });
    var pressSpring = new Spring(0, { stiffness: 900, damping: 46 });

    var springs = [xSpring, wSpring, stretchSpring, pressSpring];
    var rafId = 0;
    var lastTime = 0;
    var lastFilterWidth = 0;
    var currentFilterId = null;

    function ensurePillFilter(w) {
      var roundedW = Math.round(w);
      if (Math.abs(roundedW - lastFilterWidth) < 2 && currentFilterId) return;
      lastFilterWidth = roundedW;
      var dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2, 3);
      var maps = buildPillMaps(roundedW, ITEM_H, ITEM_H / 2, PILL_BEZEL_RATIO * (ITEM_H / 2), dpr);
      if (maps) {
        currentFilterId = injectPillFilter(id, maps, roundedW, ITEM_H, ITEM_H * PILL_PEAK_RATIO * REST_RATIO);
        indicator.style.setProperty('--lg-tabpill-filter', 'url(#' + currentFilterId + ')');
      }
    }

    ensurePillFilter(initW);

    function animLoop(now) {
      if (!lastTime) lastTime = now;
      var dt = Math.min((now - lastTime) / 1000, 1 / 20);
      lastTime = now;

      // Update springs
      var allSettled = true;
      for (var i = 0; i < springs.length; i++) {
        springs[i].step(dt);
        if (!springs[i].settled && !springs[i].held) allSettled = false;
      }

      // Calculate fluid stretch from velocity
      var speed = Math.abs(xSpring.velocity || 0);
      stretchSpring.target = Math.min(speed / STRETCH_SPEED, STRETCH_MAX);

      syncIndicator();

      if (!allSettled) {
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

    function syncIndicator() {
      if (!indicator) return;

      var s = stretchSpring.value;
      var pressVal = pressSpring.value;
      var swell = 1 + (PRESS_SCALE - 1) * pressVal; // 1.0 -> 1.16
      var scaleX = (1 + s) * swell;
      var scaleY = (1 - s * 0.45) * swell;

      indicator.style.setProperty('--lg-tabbar-indicator-scale-x', scaleX.toFixed(3));
      indicator.style.setProperty('--lg-tabbar-indicator-scale-y', scaleY.toFixed(3));
      indicator.style.setProperty('--lg-tabbar-indicator-x', xSpring.value.toFixed(2) + 'px');
      indicator.style.setProperty('--lg-tabbar-indicator-width', wSpring.value.toFixed(2) + 'px');

      // Thin background fill on press to reveal the displacement lens (1.0 -> 0.08)
      var fill = Math.max(0.08, Math.min(1.0, 1.0 - 0.92 * pressVal));
      indicator.style.setProperty('--lg-tabbar-indicator-fill', fill.toFixed(3));

      // Apply SVG filter directly to guarantee hardware acceleration
      if (currentFilterId) {
        var filterUrl = 'url(#' + currentFilterId + ')';
        indicator.style.setProperty('--lg-tabpill-filter', filterUrl);
        indicator.style.backdropFilter = filterUrl;
        indicator.style.webkitBackdropFilter = filterUrl;
      }

      // Dynamic scale of feDisplacementMap
      var pillScaleEl = document.getElementById('pillScaleEl_' + id);
      if (pillScaleEl) {
        var peak = ITEM_H * PILL_PEAK_RATIO;
        var mapScale = peak * (REST_RATIO + (PRESS_RATIO - REST_RATIO) * pressVal);
        pillScaleEl.setAttribute('scale', mapScale.toFixed(2));
      }
    }

    function moveIndicatorTo(index, instant) {
      if (!indicator || !tabs[index]) return;
      var m = measureTab(tabs[index]);
      var targetX = m.x;
      var targetW = m.w;

      ensurePillFilter(targetW);

      if (instant) {
        xSpring.set(targetX, true);
        wSpring.set(targetW, true);
        stretchSpring.set(0, true);
        pressSpring.set(0, true);
        syncIndicator();
        return;
      }

      xSpring.set(targetX);
      wSpring.set(targetW);
      wakeAnimation();
    }

    // Icon bounce springs
    var iconScales = tabs.map(function (tab) {
      var icon = tab.querySelector('.lg-tab-icon');
      if (!icon) return null;
      var s = new Spring(1, { stiffness: 340, damping: 15 });
      return s;
    });

    // Touch, Hold, and Swipe Gesture Engine
    var isHolding = false;
    var currentHoveredIndex = selectedIndex;
    var pointerStartPos = { x: 0, y: 0 };
    var hasDragged = false;
    var activePointerId = null;

    function getTabIndexAtPoint(clientX, clientY) {
      if (!tabs.length) return -1;
      var bRect = el.getBoundingClientRect();
      // Allow finger to move within a generous touch zone above and below the dock
      if (clientY < bRect.top - 80 || clientY > bRect.bottom + 80) {
        return -1;
      }
      // If clientX is far outside the dock horizontally (> 60px beyond edges)
      if (clientX < bRect.left - 60 || clientX > bRect.right + 60) {
        return -1;
      }
      // Clamp horizontally to dock bounds
      var clampedX = Math.max(bRect.left, Math.min(bRect.right, clientX));
      var closest = 0;
      var minDist = Infinity;
      for (var j = 0; j < tabs.length; j++) {
        var tr = tabs[j].getBoundingClientRect();
        var center = (tr.left + tr.right) / 2;
        var dist = Math.abs(clampedX - center);
        if (dist < minDist) {
          minDist = dist;
          closest = j;
        }
      }
      return closest;
    }

    function setTabSunk(index, sunk) {
      tabs.forEach(function (t, idx) {
        var content = t.querySelector('.lg-tab-content');
        if (content) {
          content.style.setProperty('--lg-tab-sink', (sunk && idx === index) ? '0.90' : '1');
        }
      });
    }

    function selectTab(index, animate) {
      if (index < 0 || index >= tabs.length) return;
      selectedIndex = index;
      currentHoveredIndex = index;
      tabs.forEach(function (t, idx) {
        if (idx === index) {
          t.setAttribute('aria-current', 'page');
        } else {
          t.removeAttribute('aria-current');
        }
      });
      moveIndicatorTo(index, !animate);

      // Icon bounce spring
      if (iconScales[index]) {
        iconScales[index].set(1.18);
        setTimeout(function () {
          if (iconScales[index]) iconScales[index].set(1.0);
        }, 80);
      }

      el.dispatchEvent(new CustomEvent('lg:change', {
        detail: { index: index, value: tabs[index].getAttribute('data-lg-value') || tabs[index].textContent.trim() },
        bubbles: true
      }));
    }

    function onPointerDown(e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isHolding = true;
      hasDragged = false;
      activePointerId = e.pointerId;
      pointerStartPos.x = e.clientX;
      pointerStartPos.y = e.clientY;

      if (e.pointerId != null && el.setPointerCapture) {
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
      }

      var tabIndex = getTabIndexAtPoint(e.clientX, e.clientY);
      if (tabIndex === -1) {
        var targetTab = e.target.closest('.lg-tab');
        if (targetTab) tabIndex = tabs.indexOf(targetTab);
      }

      if (tabIndex !== -1) {
        currentHoveredIndex = tabIndex;
        moveIndicatorTo(tabIndex);
        setTabSunk(tabIndex, true);
      }

      pressSpring.set(1); // Swell pill to 1.16x, thin fill to 0.08, open Snell refraction lens
      wakeAnimation();

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerCancel);
    }

    function onPointerMove(e) {
      if (!isHolding) return;
      if (activePointerId != null && e.pointerId !== activePointerId) return;

      var dx = Math.abs(e.clientX - pointerStartPos.x);
      var dy = Math.abs(e.clientY - pointerStartPos.y);
      if (dx > 4 || dy > 4) {
        hasDragged = true;
        if (e.cancelable) e.preventDefault();
      }

      // Swipe / Drag tracking: dynamically glide pill under finger to whatever tab is hovered
      var tabIndex = getTabIndexAtPoint(e.clientX, e.clientY);
      if (tabIndex !== -1 && tabIndex !== currentHoveredIndex) {
        currentHoveredIndex = tabIndex;
        moveIndicatorTo(tabIndex);
        setTabSunk(tabIndex, true);
        wakeAnimation();
      }
    }

    function onPointerUp(e) {
      if (!isHolding) return;
      if (activePointerId != null && e.pointerId !== activePointerId) return;
      isHolding = false;
      pressSpring.set(0);
      setTabSunk(-1, false);
      wakeAnimation();

      if (activePointerId != null && el.releasePointerCapture) {
        try { el.releasePointerCapture(activePointerId); } catch (err) {}
      }
      activePointerId = null;

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);

      var tabIndex = getTabIndexAtPoint(e.clientX, e.clientY);
      if (tabIndex !== -1) {
        selectTab(tabIndex, true);
      } else if (!hasDragged && currentHoveredIndex !== -1) {
        selectTab(currentHoveredIndex, true);
      } else {
        // Released outside tolerance: return to previously selected tab
        moveIndicatorTo(selectedIndex);
      }
    }

    function onPointerCancel(e) {
      if (!isHolding) return;
      if (activePointerId != null && e.pointerId !== activePointerId) return;
      isHolding = false;
      pressSpring.set(0);
      setTabSunk(-1, false);
      wakeAnimation();

      if (activePointerId != null && el.releasePointerCapture) {
        try { el.releasePointerCapture(activePointerId); } catch (err) {}
      }
      activePointerId = null;

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);

      moveIndicatorTo(selectedIndex);
    }

    el.addEventListener('pointerdown', onPointerDown);

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function (e) {
        if (e.detail === 0) { // Keyboard accessibility trigger
          selectTab(i, true);
        }
      });
    });

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () { moveIndicatorTo(selectedIndex, true); }).observe(el);
    }

    moveIndicatorTo(selectedIndex, true);
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(function () {
        moveIndicatorTo(selectedIndex, true);
      });
    }

    // Scroll-responsive compacting
    var targetSelector = el.getAttribute('data-lg-scroll-target');
    var isFloat = el.getAttribute('data-lg-float') === 'true' || !!(el.closest && el.closest('[data-lg-float="true"]'));
    var scrollTarget = targetSelector ? document.querySelector(targetSelector) : (isFloat ? window : null);
    if (scrollTarget) {
      var DOWN_THRESHOLD = 8;
      var UP_THRESHOLD = 4;
      var TOP_GUARD = 24;
      var lastY = getScrollY(scrollTarget);
      var compact = false;
      var ticking = false;

      function getScrollY(target) {
        return target === window ? (window.scrollY || document.documentElement.scrollTop) : target.scrollTop;
      }

      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = getScrollY(scrollTarget);
          var delta = y - lastY;
          if (y <= TOP_GUARD) {
            setCompact(false);
          } else if (delta > DOWN_THRESHOLD) {
            setCompact(true);
          } else if (delta < -UP_THRESHOLD) {
            setCompact(false);
          }
          lastY = y;
          ticking = false;
        });
      }

      function setCompact(next) {
        if (next === compact) return;
        compact = next;
        el.setAttribute('data-lg-compact', String(compact));
        setTimeout(function() { moveIndicatorTo(selectedIndex, true); }, 150);
      }

      scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    }

    el.__lgTabbar = {
      selectTab: selectTab,
      setGlassMode: function (mode) {
        el.setAttribute('data-lg-glass', mode);
        var row = el.closest('.lg-tabbar-row');
        if (row) row.setAttribute('data-lg-glass', mode);
      },
      destroy: function () {
        if (scrollTarget) scrollTarget.removeEventListener('scroll', onScroll);
      }
    };
  }

  function initSearchRow(row) {
    if (row.__lgSearchInit) return;
    row.__lgSearchInit = true;

    var searchBtn = row.querySelector('.lg-tabbar-search-btn') || row.querySelector('.lg-tabbar-search');
    var searchField = row.querySelector('.lg-tabbar-search-field');
    var input = row.querySelector('.lg-search-input');
    var cancelBtn = row.querySelector('.lg-search-cancel');

    if (!searchBtn || !searchField) return;

    function openSearch() {
      row.setAttribute('data-search-open', 'true');
      if (input) {
        setTimeout(function () { input.focus(); }, 120);
      }
    }

    function closeSearch() {
      row.removeAttribute('data-search-open');
      if (input) {
        input.value = '';
        input.blur();
      }
      if (searchBtn) searchBtn.focus();
    }

    searchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      openSearch();
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeSearch();
      });
    }

    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.stopPropagation();
          closeSearch();
        }
      });
    }
  }

  function initAll(root) {
    var scope = root || document;
    scope.querySelectorAll('.lg-tabbar').forEach(initTabbar);
    scope.querySelectorAll('.lg-tabbar-row').forEach(initSearchRow);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  function setGlassMode(mode, scope) {
    var root = scope || document;
    root.querySelectorAll('.lg-tabbar, .lg-tabbar-row, .lg-tabbar-search').forEach(function (node) {
      node.setAttribute('data-lg-glass', mode);
    });
  }

  window.LiquidGlassTabbar = {
    init: initTabbar,
    initSearchRow: initSearchRow,
    initAll: initAll,
    setGlassMode: setGlassMode
  };
})();
