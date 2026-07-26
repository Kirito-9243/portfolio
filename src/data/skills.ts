export type SkillCategory = {
  id: string;
  name: string;
  skills: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    id: "languages",
    name: "Languages",
    skills: ["Python", "C", "C++", "Java", "JavaScript", "TypeScript", "HTML", "CSS", "GLSL"],
  },
  {
    id: "frameworks",
    name: "Frameworks & Libraries",
    skills: ["React", "Next.js", "Express.js", "FastAPI", "Tailwind CSS", "Three.js", "Stable-Baselines3", "PettingZoo", "Gymnasium"],
  },
  {
    id: "ai-ml",
    name: "AI / ML",
    skills: ["PPO", "MARL", "Gemini API", "Local LLMs", "XTTS", "Agentic Systems", "RAG (learning)", "LangChain (learning)"],
  },
  {
    id: "devops",
    name: "DevOps & Tools",
    skills: ["Docker", "Git", "GitHub", "Conda", "CUDA", "Arch Linux", "Hyprland"],
  },
  {
    id: "game-dev",
    name: "Game Dev",
    skills: ["Unreal Engine 5", "Blueprints", "C++ UE integration"],
  },
];