/**
 * Classic GLSL-style deterministic pseudo-random hash, returns [0, 1).
 * Same input always produces the same output -- pure, so it's safe to call
 * during render/useMemo (unlike Math.random(), which React's hook-purity
 * linting correctly flags as impure). Used anywhere something needs to
 * *look* randomized without actually being random.
 */
export function hash(seed: number): number {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
}
