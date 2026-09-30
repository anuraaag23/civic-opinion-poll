/*!
 * Liquid Glass — Checkbox / Radio behavior
 * Depends on: core/glass-engine.js (must load first)
 */
(function () {
  'use strict';

  function initMark(input) {
    if (!window.LiquidGlass) {
      console.warn('[liquid-glass] glass-engine.js must load before glass-checkbox-radio.js');
      return;
    }
    if (input.__lgMarkInit) return;
    input.__lgMarkInit = true;

    var mark = input.nextElementSibling;
    if (!mark || !(mark.classList.contains('lg-radio-mark') || mark.classList.contains('lg-checkbox-mark'))) return;

    var scaleSpring = new window.LiquidGlass.Spring(input.checked ? 1 : 0, {
      stiffness: 420,
      damping: 22,
      onUpdate: function (v) { mark.style.setProperty('--lg-mark-scale', v.toFixed(3)); }
    });

    input.addEventListener('change', function () {
      if (input.type === 'radio' && input.name) {
        // Any other radio in the same group needs to animate back to 0 —
        // native radio semantics only fire `change` on the newly-checked
        // input, not on the ones it un-checked.
        document.querySelectorAll('input[type="radio"][name="' + CSS.escape(input.name) + '"]').forEach(function (sibling) {
          if (sibling !== input && sibling.__lgSpring) sibling.__lgSpring.set(0);
        });
      }
      scaleSpring.set(input.checked ? 1 : 0);
    });

    input.__lgSpring = scaleSpring;
  }

  function initList(list) {
    if (list.__lgListInit) return;
    list.__lgListInit = true;
    // Click / cursor touch bulge effect removed per user specification
  }

  function initAll(root) {
    (root || document).querySelectorAll('.lg-list-input').forEach(initMark);
    (root || document).querySelectorAll('.lg-list').forEach(initList);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  window.LiquidGlassListControls = { init: initMark, initList: initList, initAll: initAll };
})();
