/*!
 * Liquid Glass — Button behavior
 * Depends on: core/glass-engine.js (must load first)
 *
 * A button needs nothing beyond what LiquidGlass.enhance() already wires up
 * (press physics, pointer-tracked highlight, sized lens filter) — its only
 * extra job is respecting `disabled`. This file also doubles as the
 * reference pattern for "how to enhance an element added after page load",
 * since LiquidGlass's own auto-init only sees what exists at DOMContentLoaded.
 */
(function () {
  'use strict';

  function initButton(el) {
    if (!window.LiquidGlass) {
      console.warn('[liquid-glass] glass-engine.js must load before glass-button.js');
      return;
    }
    window.LiquidGlass.enhance(el, {
      pressOptions: {
        isDisabled: function () {
          return el.disabled === true || el.getAttribute('data-lg-disabled') === 'true';
        }
      }
    });
  }

  function initAll(root) {
    (root || document).querySelectorAll('.lg-button').forEach(initButton);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  window.LiquidGlassButton = { init: initButton, initAll: initAll };
})();
