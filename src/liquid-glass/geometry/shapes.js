/*!
 * Liquid Glass — geometry/shapes.js
 * ----------------------------------------------------------------------------
 * Thin shape descriptors over sdf.js. A capsule is deliberately not a
 * separate formula — it's a rounded rect with radius pinned to half the
 * height, which is also why its curved ends and flat sides fall out of the
 * SAME math instead of needing a special case (mirrors how
 * renderLensDisplacementMap in glass-engine.js already treats it).
 * ----------------------------------------------------------------------------
 */
import { roundedBoxSDF, circleSDF } from './sdf.js';

export const Shapes = {
  roundedRect(width, height, radius) {
    const bw = width / 2;
    const bh = height / 2;
    const r = Math.max(0, Math.min(radius, Math.min(bw, bh)));
    return { type: 'roundedRect', width, height, radius: r, sdf: (x, y) => roundedBoxSDF(x, y, bw, bh, r) };
  },
  capsule(width, height) {
    const bw = width / 2;
    const bh = height / 2;
    return { type: 'capsule', width, height, radius: bh, sdf: (x, y) => roundedBoxSDF(x, y, bw, bh, bh) };
  },
  circle(diameter) {
    const r = diameter / 2;
    return { type: 'circle', width: diameter, height: diameter, radius: r, sdf: (x, y) => circleSDF(x, y, r) };
  },
  /**
   * Approximate shape from an SVG path string, per §7's "derive the
   * optical boundary from the supplied path/mask where possible." This
   * engine does NOT compute a true analytical SDF for arbitrary paths —
   * that's a hard, separate problem (exact distance to an arbitrary
   * Bezier path has no closed form). `boundsSDF` is a honest, documented
   * stand-in: it treats the path's own bounding box as the optical
   * boundary, which gives correct smooth center→edge falloff for the
   * common case (a roughly convex custom icon/blob shape) but will not
   * hug a highly concave path's actual silhouette. See docs/GPU-RENDERER.md
   * "Custom path shapes — what's approximated."
   */
  customPath(pathString, width, height, radius = 0) {
    const bw = width / 2;
    const bh = height / 2;
    const r = Math.max(0, Math.min(radius, Math.min(bw, bh)));
    return {
      type: 'customPath',
      width,
      height,
      radius: r,
      path: pathString,
      sdf: (x, y) => roundedBoxSDF(x, y, bw, bh, r), // documented bounding-box approximation, see above
      isApproximate: true
    };
  }
};
