/*!
 * Liquid Glass — geometry/sdf.js
 * ----------------------------------------------------------------------------
 * The canonical signed-distance-field math for this project, going forward.
 *
 * glass-engine.js (src/core/glass-engine.js) has its OWN private copy of
 * roundedBoxSDF — identical formula, same Inigo Quilez rounded-box
 * derivation. That copy is intentionally left in place rather than made to
 * `import` this file: glass-engine.js is a zero-build UMD script meant to
 * work from a bare <script> tag (see its own header comment), and turning
 * it into an ES module would break that guarantee for every existing
 * component. If you retune the rounded-box formula, retune it in BOTH
 * places — they must stay mathematically identical since the legacy SVG
 * lens and the new GPU renderer are meant to produce the same shape
 * response, just through different pipelines. A test in test/sdf-parity.
 * test.js checks the two copies agree numerically, precisely so this
 * doesn't silently drift.
 * ----------------------------------------------------------------------------
 */

/** Signed distance from (x,y) to a rounded box of half-size (bw,bh), corner radius r. Negative = inside. */
export function roundedBoxSDF(x, y, bw, bh, r) {
  r = Math.min(r, bw, bh);
  const qx = Math.abs(x) - bw + r;
  const qy = Math.abs(y) - bh + r;
  const outsideX = Math.max(qx, 0);
  const outsideY = Math.max(qy, 0);
  const outsideDist = Math.hypot(outsideX, outsideY);
  const insideDist = Math.min(Math.max(qx, qy), 0);
  return outsideDist + insideDist - r;
}

/** Signed distance from (x,y) to a circle of radius r at the origin. */
export function circleSDF(x, y, r) {
  return Math.hypot(x, y) - r;
}

function smoothstep(edge0, edge1, x) {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
export { smoothstep };

/**
 * Central-difference gradient of an SDF at (x, y), normalized to unit
 * length. For a true distance field this equals the outward surface
 * normal exactly on the boundary, and remains a very close approximation
 * a few pixels either side of it — which is the whole reason SDFs are
 * useful here: normal comes for free from the same function that gives
 * distance, no separate mesh/normal buffer needed.
 */
export function sdfGradient(sdf, x, y, eps = 0.5) {
  const dx = sdf(x + eps, y) - sdf(x - eps, y);
  const dy = sdf(x, y + eps) - sdf(x, y - eps);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/**
 * Approximate curvature at (x,y): the rate of change of the gradient
 * direction, sampled a small step apart. Near 0 on a flat edge, larger
 * near a tightly-curved corner or a small circle — used to let a future
 * material response vary "how lens-like" a given point should read
 * (tighter corners can justify a slightly stronger local response) without
 * hardcoding shape-specific logic into the renderer.
 */
export function sdfCurvature(sdf, x, y, eps = 1) {
  const g0 = sdfGradient(sdf, x, y, eps);
  const g1 = sdfGradient(sdf, x + eps, y, eps);
  const g2 = sdfGradient(sdf, x, y + eps, eps);
  const dgx = (g1.x - g0.x) / eps + (g2.x - g0.x) / eps;
  const dgy = (g1.y - g0.y) / eps + (g2.y - g0.y) / eps;
  return Math.hypot(dgx, dgy);
}
