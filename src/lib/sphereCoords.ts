import * as THREE from "three";

export const SPHERE_RADIUS = 4;

/** Standard lat/long -> 3D position on a sphere of the given radius. */
export function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Converts the existing 0-100% positions already authored in worldMap.ts
 * into lat/long, so Phase 2's sea layout carries over to the sphere without
 * redefining a single coordinate. x maps directly to longitude, y to
 * latitude -- the same numbers, just reinterpreted.
 */
export function percentToLatLong(xPct: number, yPct: number): { lat: number; lon: number } {
  return {
    lon: (xPct / 100) * 360 - 180,
    lat: 90 - (yPct / 100) * 180,
  };
}
