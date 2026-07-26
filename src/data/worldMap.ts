export type Sea = {
  id: string;
  name: string;
  represents: string;
  description: string;
  color: string; // this sea's accent color in the map/UI palette
  /** center position as a % of the map: x 0-100 (left→right), y 0-100 (top→bottom) */
  position: { x: number; y: number };
  /** footprint size as a % of the map — used both for the canvas texture (src/lib/mapTexture.ts) and the 3D patch geometry (src/lib/sphereCoords.ts) */
  size: { width: number; height: number };
};

export type Island = {
  id: string;
  name: string;
  projectId: string; // links to projects.ts
  position: { x: number; y: number }; // % based position on the map
  isGrandLine: boolean;
};

// Layout logic: East Blue (right, "origin") -> Grand Line (center spine, the
// islands already defined below sit inside it at y:48) -> New World (left,
// "the horizon"). North/South Blue sit above/below as standalone facets that
// aren't part of the sequential journey. All ranges below are checked to only
// touch at intentional borders (e.g. Grand Line meets New World at x:17),
// never overlap unintentionally.
export const seas: Sea[] = [
  {
    id: "east-blue",
    name: "East Blue",
    represents: "About Me",
    description: "Where every great story begins. Small, humble, and full of potential.",
    color: "#3f8fa3",
    position: { x: 83, y: 50 },
    size: { width: 24, height: 34 },
  },
  {
    id: "west-blue",
    name: "West Blue",
    represents: "Education",
    description: "Structured, formal, the foundation everything else is built on.",
    color: "#7a6a95",
    position: { x: 9, y: 85 },
    size: { width: 16, height: 20 },
  },
  {
    id: "north-blue",
    name: "North Blue",
    represents: "Skills",
    description: "Cold, sharp, technical. The arsenal I've built over the years.",
    color: "#4a6f9e",
    position: { x: 46, y: 15 },
    size: { width: 50, height: 20 },
  },
  {
    id: "south-blue",
    name: "South Blue",
    represents: "Interests & Personality",
    description: "Who I am beyond the code. Anime, games, AI dreams, and the world I want to build.",
    color: "#b8874a",
    position: { x: 46, y: 85 },
    size: { width: 50, height: 20 },
  },
  {
    id: "grand-line",
    name: "Grand Line",
    represents: "My Journey",
    description: "The path I've sailed. Every island a chapter. Every storm a lesson.",
    color: "#d4a94f",
    position: { x: 43, y: 50 },
    size: { width: 52, height: 16 },
  },
  {
    id: "new-world",
    name: "New World",
    represents: "What I'm Building Toward",
    description: "The next arc. FYP, Asuna AI, and everything still being forged.",
    color: "#8c4438",
    position: { x: 9, y: 50 },
    size: { width: 16, height: 28 },
  },
  {
    id: "calm-belt",
    name: "Calm Belt",
    represents: "The Mind",
    description: "Still on the surface. Alive underneath. The intelligence that connects everything.",
    color: "#0a1c24",
    // Mirrors Grand Line's own footprint on purpose — Phase 2 uses these
    // numbers to draw two faint bands flanking the Grand Line (see
    // CalmBeltHint in WorldMap.tsx) rather than giving it its own blob.
    // It becomes the real particle layer in Phase 4.
    position: { x: 43, y: 50 },
    size: { width: 52, height: 16 },
  },
];

export const islands: Island[] = [
  {
    id: "island-of-dawn",
    name: "Island of Dawn",
    projectId: "floor-1",
    position: { x: 62, y: 48 },
    isGrandLine: true,
  },
  {
    id: "whisper-isle",
    name: "Whisper Isle",
    projectId: "floor-10",
    position: { x: 55, y: 48 },
    isGrandLine: true,
  },
  {
    id: "ironhold",
    name: "Ironhold",
    projectId: "floor-25",
    position: { x: 48, y: 48 },
    isGrandLine: true,
  },
  {
    id: "signal-rock",
    name: "Signal Rock",
    projectId: "floor-50",
    position: { x: 40, y: 48 },
    isGrandLine: true,
  },
  {
    id: "stormwatch",
    name: "Stormwatch",
    projectId: "floor-75",
    position: { x: 32, y: 48 },
    isGrandLine: true,
  },
  {
    id: "unknown",
    name: "???",
    projectId: "floor-100",
    position: { x: 20, y: 48 },
    isGrandLine: true,
  },
];