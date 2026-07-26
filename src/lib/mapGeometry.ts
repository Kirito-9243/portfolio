import * as THREE from "three";

// Classic GLSL-style deterministic pseudo-random hash -- no noise library
// needed, and the same seed always produces the same coastline.
function hash(seed: number) {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
}

export type BlobOptions = {
  width: number;
  height: number;
  /** 0 = perfect ellipse, higher = wobblier coastline */
  irregularity?: number;
  /** vertices around the perimeter */
  points?: number;
  /** seed so each sea keeps a stable, unique shape across renders */
  seed?: number;
};

export type Point2D = { x: number; y: number };

/**
 * Raw wobbled perimeter points for an organic blob footprint. Shared by both
 * the flat canvas texture drawer and the 3D raised patch geometry, so a
 * given sea's coastline is identical in the texture and in the geometry
 * sitting on top of it.
 */
export function generateBlobPoints({
  width,
  height,
  irregularity = 0.16,
  points = 24,
  seed = 1,
}: BlobOptions): Point2D[] {
  const rx = width / 2;
  const ry = height / 2;
  const pts: Point2D[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = 1 + (hash(seed + i * 12.9898) - 0.5) * 2 * irregularity;
    pts.push({ x: Math.cos(angle) * rx * wobble, y: Math.sin(angle) * ry * wobble });
  }
  return pts;
}

/** Same blob, as a closed THREE.Shape for 3D extrusion. */
export function generateBlobShape(opts: BlobOptions): THREE.Shape {
  const pts = generateBlobPoints(opts);
  const shape = new THREE.Shape();
  pts.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, p.y) : shape.lineTo(p.x, p.y)));
  shape.closePath();
  return shape;
}