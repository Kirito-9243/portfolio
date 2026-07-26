# ⚔️ Kirito's Portfolio — Log In

> *"I'd rather be a pirate than join the Navy."*
> A portfolio that doesn't just show what I've built — it shows the world I'm trying to create.

---

## 🚀 Getting Started

**Prerequisites:** Node.js 20.9+ (check with `node --version`)

```bash
npm install
npm run dev
```

**Heads up on what you'll actually see right now:** `/` still shows the *previous* architecture — a rotating sphere with the One Piece seas painted on as a texture. That's mid-supersession as of this README. The real Phase 1 (below) replaces it with the holographic-globe landing page. `/character-test` is the current working proof that the *next* architecture's core mechanism — a real animated character, arrow-key movement, camera follow — already works.

### Actual stack installed

| Layer | Package | Version |
|---|---|---|
| Framework | `next` | 16.2.10 |
| UI | `react` / `react-dom` | 19.2.4 |
| Styling | `tailwindcss` | v4 (CSS-first `@theme`, no config file) |
| 3D | `three` | 0.185.1 |
| 3D (React) | `@react-three/fiber` | 9.6.1 |
| 3D helpers | `@react-three/drei` | 10.7.7 |
| Animation | `gsap` | 3.15.0 (`ScrollTrigger` included but likely unneeded now — see Concept) |
| Animation | `framer-motion` | 12.42.2 |

**Not installed yet, likely needed soon:** `@pixiv/three-vrm` (if the character ends up as a VRoid/VRM avatar — see **Character Asset** below) or a Mixamo-oriented FBX pipeline if not. Neither is committed to yet.

---

## 🧭 The Concept

This project has pivoted twice. Worth knowing both, briefly, since old code and data from each pass still exist in the repo:

1. **First pass:** a flat, tilted 2.5D One Piece-style map. Reworked into a true sphere after realizing "earth, but the map is One Piece" meant an actual rotating globe.
2. **Second pass (current target):** compared the sphere against real reference images and realized matching them exactly would mean either reproducing actual copyrighted map art or hitting a hard ceiling on procedural-generation quality. Pivoted to a fundamentally different, more ambitious structure — a gamified 3rd-person world instead of a navigable map.

**Current target architecture:**

1. **Landing** — the sphere survives, but reimagined as an abstract holographic globe (wireframe/glow, not a painted map) with a title and an "Enter World" button. Clicking it plays an SAO *Link Start*-inspired transition into the main experience.
2. **The World** — a gamified, 3rd-person 3D space. The character is me, controlled with arrow keys, walking around an open area.
3. **The Tower (Aincrad)** — the *only* walkable building. Walking up to it and interacting enters a floor-by-floor interior — 6 floors, 6 projects, each floor's name is the project title, with info and links scattered spatially around the floor rather than shown as a static card.
4. **Status Menu** — a toggleable overlay (not a walkable space) covering About Me, Skills, Achievements (certifications), and Titles. Titles display above the character's head, like an equipped title in an MMO.

No other buildings — everything that isn't a project lives in the status menu instead of the 3D world.

**What this pivot changes:**
- The scroll-driven camera journey and scroll-glitch transition (both prototyped and confirmed working in the previous architecture) are very likely dead — navigation is now character movement, not scrolling. Not deleted yet in case any of that logic is reusable elsewhere, but not the plan anymore.
- The sea → section color mapping (`src/data/worldMap.ts`) survives, repurposed as the status menu's tab theming instead of describing walkable regions.
- The "does the map need to look exactly like reference One Piece art" copyright tension is resolved by not needing it to look like a map at all anymore — the landing globe is abstract.

---

## 🧑‍🎤 Character Asset

Needs to exist before Phase 2 can really start. Not yet decided/created.

**What Mixamo actually is:** a library of generic pre-rigged characters, plus an auto-rigger that takes a mesh you already have and rigs it. It cannot generate a likeness from scratch — that's a separate step.

**Options for getting an actual custom character:**
- **VRoid Studio** (free, Pixiv) — anime-style avatar editor, sliders for face/hair/body/outfit, no modeling skill needed. Exports `.vrm`, loads into Three.js via `@pixiv/three-vrm`, actively maintained pipeline. Strong thematic fit given the whole project is anime-rooted. Current front-runner.
- **Mixamo's generic library** — fastest path, zero customization, fine as a placeholder (this is what `/character-test` currently uses — Three.js's own public "Soldier" demo model).
- **Custom Blender model** — full control, real time/skill investment.
- ~~Ready Player Me~~ — was the obvious "photo-to-avatar" option, **shut down January 31, 2026** after being acquired by Netflix. No longer usable. (A replacement, MetaPerson by Avatar SDK, exists but hasn't been evaluated here.)

---

## 🌍 The World — target structure

### Status Menu tabs (repurposing the old sea→section mapping)

| Tab | Color | Represents |
|---|---|---|
| About Me | `#3f8fa3` (East Blue) | Where every great story begins |
| Education | `#7a6a95` (West Blue) | Structured, formal, the foundation |
| Skills | `#4a6f9e` (North Blue) | Cold, sharp, technical mastery |
| Interests | `#b8874a` (South Blue) | Who I am beyond the code |
| Achievements | `#d4a94f` (Grand Line gold) | Certifications |
| Titles | `#8c4438` (New World rust) | Currently displayed above the character's head |

### Aincrad — floor ↔ project mapping

| Floor | Project | Stack | Status |
|---|---|---|---|
| 1 | Event Management Website | React, SQL, JS | ✅ Complete |
| 10 | Gov. Accessibility Extension | JS, TTS, STT, Browser APIs | ✅ Complete |
| 25 | Club Management DBMS | MySQL, JWT, React, Tailwind | ✅ Complete |
| 50 | HN Pulse API | FastAPI, Docker, Python | ✅ Complete |
| 75 | Crisis Training Simulator FYP | Python, PPO, PettingZoo, Gemini, FastAPI, Unreal Engine | 🔄 In Progress |
| 100 | Asuna AI | XTTS, Local LLM, Python, Agentic Systems | 🔄 In Progress |

Each floor: what I built and why, tech stack, the challenge, what I learned, GitHub + live links — scattered as interactive props around the floor space, not a static card. (Data already exists in `src/data/projects.ts`; floor numbering there predates this pivot, still usable.)

---

## 🎨 Visual Identity

Unchanged by this pivot — still the moody, map-rooted palette from the previous phase.

| Role | Color |
|---|---|
| Void / base | `#060f13` |
| Ocean-ish surface tone | `#0d232e` |
| East Blue | `#3f8fa3` |
| West Blue | `#7a6a95` |
| North Blue | `#4a6f9e` |
| South Blue | `#b8874a` |
| Grand Line gold | `#d4a94f` |
| New World rust | `#8c4438` |
| Parchment (text/UI accent) | `#e4d9bc` |

Typography: `Pirata One` (display) + `Rajdhani` (UI/body), both wired as Tailwind tokens.

---

## 📚 Reference & Design Research

Joseph Santamaria's portfolio ([joseph-san.com](https://joseph-san.com), [Codrops case study](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)) — three months of focused development, three weeks of polish, three earlier full versions discarded first, per his own write-up. Informed the color/mood direction. His signature scroll-glitch transition is probably moot now given navigation is no longer scroll-based, but the lesson about iterating hard before landing on a final version still stands — this project is on its second full architectural pivot for the same reason.

Two reference images of an actual painted/illustrated One Piece globe were also examined directly (not reproduced) — confirmed that matching them exactly would need real illustrated artwork, not procedural generation, and that getting too close to the specific reference (canonical place names, that exact composition) would cross from "inspired by the same structure" into replicating specific copyrighted work. This — combined with the ceiling on procedural art quality — is a big part of why this pivot happened instead of continuing to chase that look.

---

## ⚙️ Tech Stack — status by piece

| Piece | Tech | Status |
|---|---|---|
| Holographic landing globe | Three.js, custom shader/wireframe material | 📋 planned (Phase 1) |
| Enter World / Link Start transition | GSAP timeline, full-screen shader or overlay | 📋 planned (Phase 1) |
| Character loading + animation | `useGLTF` + `useAnimations` (drei), `AnimationMixer` under the hood | ✅ proven in `/character-test` |
| Character controller (arrow keys, facing, camera follow) | Custom, `useFrame`-driven | ✅ proven in `/character-test` |
| Real character asset | VRoid → `@pixiv/three-vrm`, or Mixamo FBX pipeline | 📋 not decided/created |
| Tower proximity + enter trigger | Custom distance check | 📋 planned (Phase 3) |
| Floor system + scattered interactive props | Reuses the `Html`-tooltip pattern already proven 3× (seas, sphere-test, scroll-test) | 📋 planned (Phase 4) |
| Status menu overlay | Plain React/Tailwind UI | 📋 planned (Phase 5) |
| Scroll-driven camera journey | GSAP `ScrollTrigger` + `CatmullRomCurve3` | 🧪 proven in `/scroll-test`, likely obsolete now |
| Scroll-glitch transition | postprocessing shader | ❌ never started, likely obsolete now |
| Hosting | Vercel + custom domain | 📋 planned |

---

## 📁 Project Structure (current, actual)

```
portfolio/
├── public/
│   └── models/
│       └── Soldier.glb           # Three.js's public demo character — proof-of-concept only,
│                                  # gets replaced by the real asset once decided
├── src/
│   ├── app/
│   │   ├── page.tsx               # ⚠ shows the OLD sphere-as-map architecture, superseded,
│   │   │                          # will be rebuilt as the holographic-globe landing in Phase 1
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── character-test/        # ✅ validated: real rigged model, animation blending,
│   │   │   └── page.tsx           # arrow-key movement, camera follow. Foundation for Phase 2.
│   │   ├── sphere-test/           # ⚠ stale — old palette, superseded concept
│   │   │   └── page.tsx
│   │   └── scroll-test/           # ⚠ stale — validated a mechanism (scroll-driven camera +
│   │       └── page.tsx           # click-to-scroll) that this pivot likely no longer needs
│   ├── components/
│   │   ├── map/                   # ⚠ current live implementation of the OLD architecture
│   │   │   ├── WorldMap.tsx       # (sphere + interactive sea regions). Superseded by the
│   │   │   └── SeaPatch.tsx       # pivot, not yet removed.
│   │   ├── aincrad/                # empty — becomes the floor-by-floor interior (Phase 4)
│   │   └── ui/                    # empty — becomes the status menu (Phase 5)
│   ├── data/
│   │   ├── worldMap.ts            # sea color/meaning data — RENDERING is superseded, but
│   │   │                          # the data itself is reused for status menu tab styling
│   │   ├── projects.ts            # project content for floors — still fully relevant
│   │   └── skills.ts              # still fully relevant
│   └── lib/
│       ├── sphereCoords.ts        # lat/long <-> 3D — useful if the landing globe keeps any
│       │                          # positioned elements, otherwise mostly superseded
│       ├── mapGeometry.ts         # procedural blob-shape generator — superseded for the map,
│       │                          # possibly reusable for other organic shapes later
│       └── mapTexture.ts          # paints the map texture — superseded, unless the new
│                                  # holographic globe wants a generated grid/wireframe texture
└── README.md
```

---

## 🚢 Build Phases

- [x] **Phase 0** — Vision locked, repo initialized
- [x] **Phase 1 (old)** — Next.js scaffolded, R3F/Drei/Three/GSAP/Framer Motion installed
- [x] **Phase 2 (old)** — Sphere + procedural map texture + interactive seas — superseded by the pivot, but the build/verify discipline it established (screenshot everything, don't assume) carries forward
- [x] **Mechanism validation** — scroll-driven camera journey ✅, click-to-scroll ✅, rigged character + animation blending + arrow-key movement + camera follow ✅ — all proven via real working prototypes before committing

**Current plan, restarting numbering for the new architecture:**

- [ ] **Phase 1** — Landing: holographic globe, title, Enter World button, Link Start transition
- [ ] **Phase 2** — Character asset finalized + integrated, open world ground/environment
- [ ] **Phase 3** — Aincrad tower exterior + entry trigger
- [ ] **Phase 4** — Floor-by-floor interior, 6 floors, scattered project info
- [ ] **Phase 5** — Status menu (About/Skills/Achievements/Titles) + title-above-head display
- [ ] **Phase 6** — Polish: atmosphere, performance, mobile fallback, accessibility fallback
- [ ] **Phase 7** — Deployment + custom domain

---

*The journey to Laugh Tale is long. But that's the point.*