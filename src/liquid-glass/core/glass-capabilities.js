/*!
 * Liquid Glass — core/glass-capabilities.js
 * ----------------------------------------------------------------------------
 * glass-engine.js (UMD, §1 of that file) has its own private
 * detectCapabilities() with the identical backdrop-filter/Blink-engine
 * logic — kept there, not imported from here, because glass-engine.js is
 * meant to work from a bare <script> tag with zero build step (its own
 * header says so), and importing an ES module would break that. This copy
 * exists so the new ES-module rendering/ code (renderer.js, backdrop.js)
 * doesn't need to depend on the global `window.LiquidGlass` UMD object to
 * ask "can I refract?" — it's the same detection, reachable the ES-module
 * way. test/capabilities-parity.test.js checks both copies' non-DOM logic
 * agree; if you change the Blink sniff or the backdrop-filter check, change
 * it in both files.
 *
 * The one genuinely NEW check here, not present in glass-engine.js, is
 * `hasWebGL2` — glass-engine.js has never needed to know about WebGL
 * because the legacy path is pure SVG/CSS. The GPU renderer does.
 * ----------------------------------------------------------------------------
 */

export function detectCapabilities() {
  const hasCSS = typeof CSS !== 'undefined' && typeof CSS.supports === 'function';
  const hasBackdropFilter =
    hasCSS && (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'));

  const isBlinkEngine =
    typeof window !== 'undefined' && (('chrome' in window && !!window.chrome) || (hasCSS && CSS.supports('background', 'paint(x)')));

  const canRefract = hasBackdropFilter && isBlinkEngine; // true only where the SVG-lens (legacy) path will actually bend anything

  const hasWebGL2 = detectWebGL2();

  const mq = (query) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query) : null);
  const motionMQ = mq('(prefers-reduced-motion: reduce)');
  const transparencyMQ = mq('(prefers-reduced-transparency: reduce)');
  const contrastMQ = mq('(prefers-contrast: more)');

  return {
    hasBackdropFilter,
    isBlinkEngine,
    canRefract,
    hasWebGL2,
    prefersReducedMotion: !!(motionMQ && motionMQ.matches),
    prefersReducedTransparency: !!(transparencyMQ && transparencyMQ.matches),
    prefersIncreasedContrast: !!(contrastMQ && contrastMQ.matches),
    _mediaQueries: { motionMQ, transparencyMQ, contrastMQ }
  };
}

function detectWebGL2() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return !!gl;
  } catch {
    return false;
  }
}

/** Mirrors glass-engine.js's watchAccessibilityMedia() but for callers using the ES-module capabilities object instead of the UMD global. Returns an unsubscribe function. */
export function watchAccessibilityPreferences(capabilities, onChange) {
  const { motionMQ, transparencyMQ, contrastMQ } = capabilities._mediaQueries;
  const subs = [];
  function bind(mql, key) {
    if (!mql) return;
    const handler = () => {
      capabilities[key] = mql.matches;
      if (onChange) onChange(capabilities);
    };
    const add = mql.addEventListener ? mql.addEventListener.bind(mql) : mql.addListener.bind(mql);
    const remove = mql.removeEventListener ? mql.removeEventListener.bind(mql) : mql.removeListener.bind(mql);
    add('change', handler);
    subs.push(() => remove('change', handler));
  }
  bind(motionMQ, 'prefersReducedMotion');
  bind(transparencyMQ, 'prefersReducedTransparency');
  bind(contrastMQ, 'prefersIncreasedContrast');
  return () => subs.forEach((u) => u());
}
