# AVGame – Implementation Plan (Rev‑A 2025‑04‑19)

> **Purpose** Road‑map the order of work so the Agent (and humans) know *exactly* what comes next and why. Phases are incremental vertical slices; each ends with something playable/testable.

---

## Phase 0 – Bootstrap ✅
| Deliverable | Notes |
|-------------|-------|
| **Repo scaffold** | Vite + TypeScript + Vue + Vitest config + ESLint/Prettier |
| **Dev Quality Gates** | CI lint / test / type‑check, Husky pre‑commit hooks |
| **AssetManager stub** | `load(url)` + progress bar with hard‑coded asset list |

---

## Phase 1 – Renderer Slice ✅
> *Goal:* render a rotating isometric test map at 60 FPS.

1. **Renderer Core** (see `Renderer.md`)
   - Three.js scene + `IsoCamera` helper.
   - Instanced tile grid (16 × 16 test chunk).
   - Edge‑glow & emissive bloom shaders.
2. **Game Loop**
   - Fixed‑tick `update(dt)` + interpolated render.
   - Dev overlay FPS & frame‑ms.
3. **StateMachine Skeleton** (see `StateManagement.md`)
   - `AppRoot` → `MainMenu` → `Session.Loading` → `Playing`.

**Exit criteria**: Map spins; resize works; `P` pauses via FSM.

---

## Phase 2 – Input & Agent Prototype
> *Goal:* move a capsule around the grid without snapping.

1. **Input System**
   - WASD / game‑pad axes.
   - Mouse world‑ray utility for aim.
2. **Physics & Continuous Collision** (see `GridSystem.md` §4)
   - Capsule vs. merged AABB colliders.
3. **ECS Integration**
   - bitecs world with `Transform`, `Velocity`, `Collider`, `Renderable`.
4. **Camera Follow & Snap Rotation**.

**Exit criteria**: Player moves & slides along walls in the test chunk.

---

## Phase 3 – Grid System & Level Assembly
> *Goal:* walk seamlessly through a stitched level of 4 rooms.

1. **GridSystem Implementation**
   - Tile flags, LOS ray, A* path‑find.
   - Room‑prefab loader; doorway stitching.
2. **Chunk Streaming**
   - Load next 32×32 tile chunk on proximity; unload last.
3. **Collider Builder** (rect merge).

**Exit criteria**: Random seed generates rooms; player cannot exit level bounds; FPS stable.

---

## Phase 4 – ECS Feature Pack & State Sync
> *Goal:* solid data pipeline for future mechanics.

1. **Component Pools Finalised** (see `ECS.md`).
2. **System Pipeline Ordering** documented & enforced tests.
3. **Event Bus** with ring buffer + inspector overlay.
4. **Save/Load middleware** hooked into FSM.

**Exit criteria**: Spawn/despawn ±500 dummy entities ≤ 2 ms CPU/frame.

---

## Phase 5 – Combat Vertical Slice
> *Goal:* shoot things, deal damage, see numbers fly.

1. **Projectile System** — pooled bolts/hitscan, spawn via click.
2. **CombatSystem**   (see `CombatSystem.md`)
   - Fixed‑point math engine.
   - Global `ModTable`; support +% dmg vs. corrupted.
3. **Status Effects & Cooldowns** — burn DOT & overheating.
4. **Hit FX & numbers** — small particle burst, floating text.

**Exit criteria**: Dummy enemies take damage, burn, and die; crit chance visible.

---

## Phase 6 – HUD & Menus
> *Goal:* all moment‑to‑moment UI present.

1. **Vue HUD** — health, energy, heat.
2. **Pause / Settings menus** — under FSM `Session.Paused`.
3. **Mod Inspector** — hover enemy shows active modifiers.

**Exit criteria**: Play 5 minutes without needing dev tools.

---

## Phase 7 – Effects & Polish Pass I
- Particle system GPU instancing.
- Post‑FX stack complete (bloom, CRT vignette).
- Basic SFX & adaptive music stub.

---

## Phase 8 – Editor Toolkit Alpha
- In‑engine tile/prop painting.
- Test play‑mode toggle.
- Export room prefab JSON.

---

## Phase 9 – Optimization & QA Pass
- Renderer profiling; shader pre‑compile.
- Memory leak hunt; GC metrics.
- Combat math fuzz tests.
- Automated regression scenes.

---

## Phase 10 – Stretch / Future Work
- Multiplayer lock‑step prototype.
- WebGPU backend toggle.
- Steam Deck perf certification.

---

## Phase Exit Checklist
1. **All acceptance tests green** (unit, integration, perf budget).
2. **Doc updates** (relevant subsystem .md files note changes).
3. **CI build succeeds** release artifact.
4. **Playtest sign‑off** by at least one human & one AI agent.

---

## Current Focus
1. **Phase 3: GridSystem Implementation** — Tile flags, LOS ray, A* path-finding, and room-prefab loader with doorway stitching.

Stay narrow, get visible results, iterate fast.
