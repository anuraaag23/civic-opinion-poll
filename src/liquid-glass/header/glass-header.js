/*!
 * Liquid Glass — Header behavior
 * Depends on: core/glass-engine.js (must load first)
 */
(function () {
  'use strict';

  function clamp01(v) { return Math.min(Math.max(v, 0), 1); }

  function initHeader(el) {
    if (!window.LiquidGlass) {
      console.warn('[liquid-glass] glass-engine.js must load before glass-header.js');
      return;
    }
    if (el.__lgHeaderInit) return;
    el.__lgHeaderInit = true;

    var material = el.querySelector('.lg-header-material');
    if (material) window.LiquidGlass.enhance(material, { press: false });

    var targetSelector = el.getAttribute('data-lg-scroll-target');
    var scrollTarget = targetSelector ? document.querySelector(targetSelector) : window;
    if (!scrollTarget) return;

    var fadeDistance = parseFloat(el.getAttribute('data-lg-fade-distance')) || 50;
    var ticking = false;

    function getScrollY() {
      return scrollTarget === window ? (window.scrollY || document.documentElement.scrollTop) : scrollTarget.scrollTop;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var progress = clamp01(getScrollY() / fadeDistance);
        el.style.setProperty('--lg-header-progress', progress.toFixed(3));
        ticking = false;
      });
    }

    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set correct initial state if the page loads already scrolled

    el.__lgHeader = {
      destroy: function () { scrollTarget.removeEventListener('scroll', onScroll); }
    };
  }

  function initAll(root) {
    (root || document).querySelectorAll('.lg-header').forEach(initHeader);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  window.LiquidGlassHeader = { init: initHeader, initAll: initAll };
})();
