/*!
 * Liquid Glass — Control Buttons behavior
 * Depends on: core/glass-engine.js (must load first)
 */
(function () {
  'use strict';

  // ---- Control Center–style grid: plain active/inactive toggle -----------
  function initControlGrid(el) {
    if (el.__lgControlGridInit) return;
    el.__lgControlGridInit = true;
    el.querySelectorAll('.lg-control-btn').forEach(function (btn) {
      if (!btn.hasAttribute('data-lg-active')) btn.setAttribute('data-lg-active', 'false');
      btn.addEventListener('click', function () {
        var active = btn.getAttribute('data-lg-active') === 'true';
        btn.setAttribute('data-lg-active', String(!active));
      });
    });
  }

  // ---- Goo merge group -----------------------------------------------------
  // Each button is genuinely draggable; LiquidGlass.createGlassContainer()
  // watches live proximity between them (via pointermove + ResizeObserver)
  // and turns the goo filter on/off by itself the moment their gap crosses
  // `spacing` — nothing here manually decides when to merge.
  function initGooGroup(el) {
    if (!window.LiquidGlass) {
      console.warn('[liquid-glass] glass-engine.js must load before glass-control-buttons.js');
      return;
    }
    if (el.__lgGooInit) return;
    el.__lgGooInit = true;

    var buttons = Array.prototype.slice.call(el.querySelectorAll('.lg-goo-btn'));
    if (buttons.length < 2) return;

    var container = window.LiquidGlass.createGlassContainer(el, {
      memberSelector: '.lg-goo-btn',
      spacing: 26,
      gooStrength: 10
    });

    // Lay out on a diagonal at rest so there's obvious room to drag them
    // together; each button gets its own "tracking" spring (see
    // DESIGN-PHYSICS-SPEC.md's preset table) so dragging feels like direct
    // manipulation with only the slightest catch-up lag.
    var springs = buttons.map(function (btn, i) {
      // Explicit, not a formula: the first two sit close enough together
      // that a shared data-lg-union actually reads as one committed shape
      // at rest (a goo filter can't visually bridge a gap wider than its
      // own blur radius just because data-lg-merging says to); the third
      // starts far off specifically so there's something left to drag.
      var HOME_POSITIONS = [{ x: 0, y: 10 }, { x: 26, y: 10 }, { x: 150, y: 30 }];
      var homeX = (HOME_POSITIONS[i] || { x: i * 70 }).x;
      var homeY = (HOME_POSITIONS[i] || { y: i * 60 }).y;
      var sx = new window.LiquidGlass.Spring(homeX, {
        stiffness: 500, damping: 34,
        onUpdate: function (v) { btn.style.setProperty('--lg-goo-x', v.toFixed(2) + 'px'); container.refresh(); }
      });
      var sy = new window.LiquidGlass.Spring(homeY, {
        stiffness: 500, damping: 34,
        onUpdate: function (v) { btn.style.setProperty('--lg-goo-y', v.toFixed(2) + 'px'); }
      });
      sx.set(homeX, true);
      sy.set(homeY, true);
      return { sx: sx, sy: sy, homeX: homeX, homeY: homeY };
    });

    buttons.forEach(function (btn, i) {
      var s = springs[i];
      var dragging = false, startClientX = 0, startClientY = 0, startX = 0, startY = 0;

      btn.addEventListener('pointerdown', function (ev) {
        dragging = true;
        startClientX = ev.clientX; startClientY = ev.clientY;
        startX = s.sx.value; startY = s.sy.value;
        btn.setPointerCapture(ev.pointerId);
      });
      btn.addEventListener('pointermove', function (ev) {
        if (!dragging) return;
        s.sx.set(startX + (ev.clientX - startClientX), true);
        s.sy.set(startY + (ev.clientY - startClientY), true);
        // No explicit container.refresh() here: s.sx's own onUpdate above
        // already calls it, and this same pointermove event also bubbles
        // up to the container's own listener (wired in
        // createGlassContainer) — a third call here was pure redundant
        // layout work on every single pointer move during a drag.
      });
      function endDrag(ev) {
        if (!dragging) return;
        dragging = false;
        try { btn.releasePointerCapture(ev.pointerId); } catch (e) { /* noop */ }
        // Springs back to its lane on release — merging is judged live
        // while dragging, so letting go always resolves back to "apart".
        s.sx.set(s.homeX);
        s.sy.set(s.homeY);
      }
      btn.addEventListener('pointerup', endDrag);
      btn.addEventListener('pointercancel', endDrag);
    });

    el.__lgGooGroup = container;
  }

  function initAll(root) {
    root = root || document;
    root.querySelectorAll('.lg-control-grid').forEach(initControlGrid);
    root.querySelectorAll('.lg-goo-group').forEach(initGooGroup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  window.LiquidGlassControlButtons = { initAll: initAll, initControlGrid: initControlGrid, initGooGroup: initGooGroup };
})();
