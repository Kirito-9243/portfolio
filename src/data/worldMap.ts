export type Sea = {
  id: string;
  name: string;
  represents: string;
  description: string;
  color: string; // neon accent color for this sea
};

export type Island = {
  id: string;
  name: string;
  projectId: string; // links to projects.ts
  position: { x: number; y: number }; // % based position on the map
  isGrandLine: boolean;
};

export const seas: Sea[] = [
  {
    id: "east-blue",
    name: "East Blue",
    represents: "About Me",
    description: "Where every great story begins. Small, humble, and full of potential.",
    color: "#00d4ff",
  },
  {
    id: "west-blue",
    name: "West Blue",
    represents: "Education",
    description: "Structured, formal, the foundation everything else is built on.",
    color: "#a855f7",
  },
  {
    id: "north-blue",
    name: "North Blue",
    represents: "Skills",
    description: "Cold, sharp, technical. The arsenal I've built over the years.",
    color: "#3b82f6",
  },
  {
    id: "south-blue",
    name: "South Blue",
    represents: "Interests & Personality",
    description: "Who I am beyond the code. Anime, games, AI dreams, and the world I want to build.",
    color: "#f59e0b",
  },
  {
    id: "grand-line",
    name: "Grand Line",
    represents: "My Journey",
    description: "The path I've sailed. Every island a chapter. Every storm a lesson.",
    color: "#fbbf24",
  },
  {
    id: "new-world",
    name: "New World",
    represents: "What I'm Building Toward",
    description: "The next arc. FYP, Asuna AI, and everything still being forged.",
    color: "#ef4444",
  },
  {
    id: "calm-belt",
    name: "Calm Belt",
    represents: "The Mind",
    description: "Still on the surface. Alive underneath. The intelligence that connects everything.",
    color: "#1e293b",
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
