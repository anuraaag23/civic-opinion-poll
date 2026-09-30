/*!
 * Liquid Glass — Segmented Control behavior
 * Depends on: core/glass-engine.js (must load first)
 */
(function () {
  'use strict';

  function initSegmented(el) {
    if (!window.LiquidGlass) {
      console.warn('[liquid-glass] glass-engine.js must load before glass-segmented.js');
      return;
    }
    if (el.__lgSegInit) return;
    el.__lgSegInit = true;

    var indicator = el.querySelector('.lg-segmented-indicator');
    var items = Array.prototype.slice.call(el.querySelectorAll('.lg-segmented-item'));
    el.setAttribute('role', el.getAttribute('role') || 'tablist');

    var selectedIndex = items.findIndex(function (it) { return it.getAttribute('aria-selected') === 'true'; });
    if (selectedIndex === -1) selectedIndex = 0;

    // "Bouncy" preset (glass-tokens.css §5): low damping relative to
    // stiffness, so each spring visibly overshoots its target before
    // settling.
    //
    // LEFT and RIGHT EDGE springs, not x/width — found this distinction
    // matters by actually simulating both against Apple's own reference
    // footage (the "adopting-liquid-glass" segmented-control clip): the
    // real indicator doesn't slide as a fixed-width shape, it stretches to
    // visibly bridge BOTH the old and new segment before contracting onto
    // the new one, like a liquid blob whose leading edge reaches for its
    // target while its trailing edge is still caught on the old one.
    // Synchronized x/width springs (both retargeted at the same instant,
    // which is what this used to do) can't produce that on their own —
    // simulated it directly, same stiffness/damping/mass as here, and the
    // combined span only ever reached about 385px for a transition between
    // two ~340–380px-wide segments 720px apart. Staggering which edge
    // retargets when — the leading edge (whichever one is headed toward
    // the new selection) immediately, the trailing edge after a short
    // delay via moveTo() below — reached ~656px in the same simulation,
    // briefly spanning nearly the full control, matching the reference
    // footage's actual look far more closely than any amount of retuning
    // a synchronized model's overshoot ever could.
    var leftSpring = new window.LiquidGlass.Spring(0, {
      stiffness: 260,
      damping: 16,
      onUpdate: updateFromEdges
    });
    var rightSpring = new window.LiquidGlass.Spring(0, {
      stiffness: 260,
      damping: 16,
      onUpdate: updateFromEdges
    });

    function updateFromEdges() {
      var left = leftSpring.value;
      var width = Math.max(0, rightSpring.value - left);
      indicator.style.setProperty('--lg-seg-x', left.toFixed(2) + 'px');
      indicator.style.setProperty('--lg-seg-width', width.toFixed(2) + 'px');
      var energy = Math.max(leftSpring.getMotionEnergy(), rightSpring.getMotionEnergy());
      indicator.style.setProperty('--lg-seg-puff', (1 + energy * 0.14).toFixed(3));
    }

    window.LiquidGlass.enhance(indicator, {
      // Was 22, tuned before the strength² bug fix (glass-tokens.css §4) —
      // re-measured post-fix; matches the slider thumb's own re-tune since
      // both are similarly-proportioned wide pills.
      strength: 40,
      edgeWidthFraction: 0.6,
      press: false
    });

    function measure(item) {
      // offsetLeft/Width are relative to the nearest positioned ancestor,
      // which is .lg-segmented itself (position: relative) — no extra
      // math needed to account for the container's own padding.
      return { x: item.offsetLeft, width: item.offsetWidth };
    }

    var trailTimer = null;

    function moveTo(index, instant) {
      var m = measure(items[index]);
      var newLeft = m.x;
      var newRight = m.x + m.width;

      if (trailTimer) { clearTimeout(trailTimer); trailTimer = null; }

      if (instant) {
        leftSpring.set(newLeft, true);
        rightSpring.set(newRight, true);
        return;
      }

      // Whichever edge is headed TOWARD the new selection leads (retargets
      // now); the edge still anchored to the old one trails (retargets
      // once the leading edge has had a moment to pull away) — see the
      // spring setup above for why this staggering, not the delay amount
      // itself, is what actually produces the stretch. 90ms was picked by
      // comparing the same simulation's peak-width-vs-time curve against
      // the reference footage's own timing; short enough that the trailing
      // edge is still clearly "catching up" rather than moving together
      // with the leading one, long enough that the leading edge has
      // visibly detached first rather than the two starting together.
      if (newLeft < leftSpring.value) {
        leftSpring.set(newLeft);
        trailTimer = setTimeout(function () { rightSpring.set(newRight); trailTimer = null; }, 90);
      } else {
        rightSpring.set(newRight);
        trailTimer = setTimeout(function () { leftSpring.set(newLeft); trailTimer = null; }, 90);
      }
    }

    function select(index, opts) {
      opts = opts || {};
      if (index === selectedIndex && !opts.force) return;
      items[selectedIndex] && items[selectedIndex].setAttribute('aria-selected', 'false');
      selectedIndex = index;
      items[selectedIndex].setAttribute('aria-selected', 'true');
      moveTo(index, opts.instant);
      if (!opts.silent) {
        el.dispatchEvent(new CustomEvent('lg:change', {
          detail: { index: index, value: items[index].getAttribute('data-lg-value') || items[index].textContent.trim() },
          bubbles: true
        }));
      }
    }

    items.forEach(function (item, i) {
      item.setAttribute('role', item.getAttribute('role') || 'tab');
      item.setAttribute('tabindex', i === selectedIndex ? '0' : '-1');
      item.addEventListener('click', function () {
        if (el.getAttribute('data-lg-disabled') === 'true') return;
        select(i);
        item.focus();
      });
      item.addEventListener('keydown', function (ev) {
        var next = null;
        if (ev.key === 'ArrowRight') next = (i + 1) % items.length;
        else if (ev.key === 'ArrowLeft') next = (i - 1 + items.length) % items.length;
        else if (ev.key === 'Home') next = 0;
        else if (ev.key === 'End') next = items.length - 1;
        if (next !== null) {
          ev.preventDefault();
          items[i].setAttribute('tabindex', '-1');
          items[next].setAttribute('tabindex', '0');
          select(next);
          items[next].focus();
        }
      });
    });

    // Initial placement is instant — the overshoot is for CHANGES in
    // selection, not for the control's first paint.
    moveTo(selectedIndex, true);

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () { moveTo(selectedIndex, true); }).observe(el);
    }

    el.__lgSegmented = {
      get selectedIndex() { return selectedIndex; },
      select: function (index) { select(index, { silent: true }); }
    };
  }

  function initAll(root) {
    (root || document).querySelectorAll('.lg-segmented').forEach(initSegmented);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  window.LiquidGlassSegmented = { init: initSegmented, initAll: initAll };
})();
