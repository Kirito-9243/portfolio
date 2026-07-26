import { seas } from "@/data/worldMap";
import { generateBlobPoints } from "./mapGeometry";

const TEX_WIDTH = 2048;
const TEX_HEIGHT = 1024;

/**
 * Draws the whole map onto a canvas and returns it for use as a
 * THREE.CanvasTexture. An equirectangular texture is just the same 0-100%
 * grid worldMap.ts already uses, stretched to TEX_WIDTH x TEX_HEIGHT --
 * no lat/long math needed here, only in sphereCoords.ts for the 3D patches
 * that sit on top of this texture.
 */
export function generateMapTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_WIDTH;
  canvas.height = TEX_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // ocean base
  ctx.fillStyle = "#0d232e";
  ctx.fillRect(0, 0, TEX_WIDTH, TEX_HEIGHT);

  // subtle vignette toward the poles so they don't read as flat-cut edges
  const grad = ctx.createLinearGradient(0, 0, 0, TEX_HEIGHT);
  grad.addColorStop(0, "rgba(0,0,0,0.4)");
  grad.addColorStop(0.18, "rgba(0,0,0,0)");
  grad.addColorStop(0.82, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX_WIDTH, TEX_HEIGHT);

  seas.forEach((sea, i) => {
    if (sea.id === "calm-belt") return; // ambient layer, painted in Phase 4 instead

    const cx = (sea.position.x / 100) * TEX_WIDTH;
    const cy = (sea.position.y / 100) * TEX_HEIGHT;
    const w = (sea.size.width / 100) * TEX_WIDTH;
    const h = (sea.size.height / 100) * TEX_HEIGHT;
    const pts = generateBlobPoints({ width: w, height: h, seed: i + 1 });

    ctx.beginPath();
    pts.forEach((p, idx) => {
      const x = cx + p.x;
      const y = cy + p.y;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = sea.color;
    ctx.fill();
  });

  return canvas;
}