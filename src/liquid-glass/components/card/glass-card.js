/*!
 * Liquid Glass — Sheet behavior (cards need no JS of their own — they're
 * just .lg-surface with padding, so LiquidGlass.autoInit already covers them)
 * Depends on: core/glass-engine.js (must load first)
 */
(function () {
  'use strict';

  function initSheet(scrim) {
    if (!window.LiquidGlass) {
      console.warn('[liquid-glass] glass-engine.js must load before glass-card.js');
      return;
    }
    if (scrim.__lgSheetInit) return;
    scrim.__lgSheetInit = true;

    var sheet = scrim.querySelector('.lg-sheet');
    var grabber = scrim.querySelector('.lg-sheet-grabber');

    // "Bouncy" preset for the open animation (a sheet arriving with a touch
    // of settle-wobble reads as more alive than a rigid ease-out), but a
    // tight "tracking" spring while the user is actively dragging it by the
    // grabber, so it never feels laggy under the finger.
    var ySpring = new window.LiquidGlass.Spring(100, {
      stiffness: 300,
      damping: 28,
      onUpdate: function (v) {
        sheet.style.setProperty('--lg-sheet-y', v.toFixed(2) + '%');
        var openness = 1 - v / 100;
        sheet.style.setProperty('--lg-sheet-scale', (0.92 + openness * 0.08).toFixed(3));
        sheet.style.setProperty('--lg-sheet-opacity', openness.toFixed(3));
      }
    });

    function open(instant) {
      scrim.setAttribute('data-lg-open', 'true');
      document.body.style.overflow = 'hidden';
      ySpring.set(0, instant);
      scrim.dispatchEvent(new CustomEvent('lg:open', { bubbles: true }));
    }

    function close(instant) {
      ySpring.set(100, instant);
      document.body.style.overflow = '';
      // Wait for the spring to finish before hiding the scrim from
      // interaction/hit-testing and firing the close event.
      var wasSpring = ySpring;
      var check = function () {
        if (wasSpring.settled) {
          scrim.setAttribute('data-lg-open', 'false');
          scrim.dispatchEvent(new CustomEvent('lg:close', { bubbles: true }));
        } else {
          requestAnimationFrame(check);
        }
      };
      if (instant) {
        scrim.setAttribute('data-lg-open', 'false');
        scrim.dispatchEvent(new CustomEvent('lg:close', { bubbles: true }));
      } else {
        requestAnimationFrame(check);
      }
    }

    scrim.addEventListener('click', function (ev) {
      if (ev.target === scrim) close();
    });

    // Auto-bind any close button inside the scrim
    scrim.querySelectorAll('[data-lg-dismiss="sheet"], .lg-sheet-close-btn, #close-sheet, #sheet-close-icon, #done-sheet').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        close();
      });
    });

    // ---- Drag-to-dismiss by the grabber ----
    if (grabber) {
      var dragging = false;
      var startY = 0;
      var startPercent = 0;

      grabber.addEventListener('pointerdown', function (ev) {
        dragging = true;
        startY = ev.clientY;
        startPercent = ySpring.value;
        grabber.setPointerCapture(ev.pointerId);
      });

      grabber.addEventListener('pointermove', function (ev) {
        if (!dragging) return;
        var deltaPercent = ((ev.clientY - startY) / sheet.clientHeight) * 100;
        ySpring.set(Math.max(0, startPercent + deltaPercent), true);
      });

      function endGrabDrag(ev) {
        if (!dragging) return;
        dragging = false;
        try { grabber.releasePointerCapture(ev.pointerId); } catch (e) { /* noop */ }
        if (ySpring.value > 24) close();
        else open();
      }
      grabber.addEventListener('pointerup', endGrabDrag);
      grabber.addEventListener('pointercancel', endGrabDrag);
    }

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && scrim.getAttribute('data-lg-open') === 'true') close();
    });

    scrim.__lgSheet = { open: open, close: close };
  }

  function initAll(root) {
    (root || document).querySelectorAll('.lg-sheet-scrim').forEach(initSheet);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  window.LiquidGlassSheet = { init: initSheet, initAll: initAll };
})();
