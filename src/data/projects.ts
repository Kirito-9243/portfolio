export type Project = {
  id: string;
  floor: number;
  islandName: string;
  title: string;
  catchyPhrase: string;
  description: string;
  stack: string[];
  challenge: string;
  learned: string;
  github?: string;
  live?: string;
  status: "complete" | "in-progress";
};

export const projects: Project[] = [
  {
    id: "floor-1",
    floor: 1,
    islandName: "Island of Dawn",
    title: "Event Management Website",
    catchyPhrase: "Where the chaos got organized.",
    description: "",
    stack: ["React", "SQL", "JavaScript", "CSS"],
    challenge: "",
    learned: "",
    status: "complete",
  },
  {
    id: "floor-10",
    floor: 10,
    islandName: "Whisper Isle",
    title: "Government Form Accessibility Extension",
    catchyPhrase: "Because the web forgot some people exist.",
    description: "",
    stack: ["JavaScript", "TTS", "STT", "Browser APIs"],
    challenge: "",
    learned: "",
    status: "complete",
  },
  {
    id: "floor-25",
    floor: 25,
    islandName: "Ironhold",
    title: "Club Management DBMS",
    catchyPhrase: "Structure behind the scenes of everything.",
    description: "",
    stack: ["MySQL", "JWT", "React", "Tailwind", "Express.js"],
    challenge: "",
    learned: "",
    status: "complete",
  },
  {
    id: "floor-50",
    floor: 50,
    islandName: "Signal Rock",
    title: "HN Pulse API",
    catchyPhrase: "The internet's heartbeat, containerized.",
    description: "",
    stack: ["FastAPI", "Docker", "Python"],
    challenge: "",
    learned: "",
    status: "complete",
  },
  {
    id: "floor-75",
    floor: 75,
    islandName: "Stormwatch",
    title: "Crisis Training Simulator",
    catchyPhrase: "Teaching machines to handle what humans fear.",
    description: "",
    stack: ["Python", "PPO", "PettingZoo", "Gemini", "FastAPI", "Unreal Engine"],
    challenge: "",
    learned: "",
    status: "in-progress",
  },
  {
    id: "floor-100",
    floor: 100,
    islandName: "???",
    title: "Asuna AI",
    catchyPhrase: "Still being built. Like all good things.",
    description: "",
    stack: ["XTTS", "Local LLM", "Python", "Agentic Systems"],
    challenge: "",
    learned: "",
    status: "in-progress",
  },
];