# AVGame – Implementation Progress

> **Purpose:** Track the progress of implementation against the phases defined in the Implementation Plan. This document serves as a living record of completed work, current focus, and upcoming tasks.
>
> **IMPORTANT:** This document should be updated regularly as tasks are started, completed, or modified. Refer to [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on keeping this document up-to-date.

---

## Completed Phases

### Phase 0 – Bootstrap ✅
| Deliverable | Status | Notes |
|-------------|--------|-------|
| **Repo scaffold** | ✅ Complete | Vite + TypeScript + Vue + Vitest config + ESLint/Prettier |
| **Dev Quality Gates** | ✅ Complete | ESLint/Prettier config with Husky pre-commit hooks |
| **AssetManager stub** | ✅ Complete | Basic implementation with progress tracking and mock assets |

### Phase 1 – Renderer Slice ✅
| Task | Status | Notes |
|------|--------|-------|
| **Renderer Core** | ✅ Complete | Three.js scene + IsoCamera helper + Instanced tile grid (16×16 test chunk) |
| **Game Loop** | ✅ Complete | Fixed-tick update(dt) + interpolated render + Dev overlay FPS & frame-ms |
| **StateMachine Skeleton** | ✅ Complete | XState implementation with AppRoot → MainMenu → Session.Loading → Playing |

---

## Current Focus

### Phase 2 – Input & Agent Prototype 🔄
| Task | Status | Notes |
|------|--------|-------|
| **Input System** | ✅ Complete | WASD / arrow keys movement, key mapping system |
| **Mouse world-ray utility** | ✅ Complete | Implemented WorldRay class with plane intersection |
| **Player Movement** | ✅ Complete | Basic player capsule with physics-based movement |
| **Aim Indicator** | ✅ Complete | Visual indicator showing aim direction |
| **Camera Follow & Rotation** | ✅ Complete | Camera follows player + middle mouse button for free rotation |
| **Physics & Continuous Collision** | ✅ Complete | Basic physics with capsule vs. AABB collision detection and sliding |
| **World Layout** | ✅ Complete | Simple square room with wall perimeter instead of checkerboard pattern |
| **ECS Integration** | ⏳ Planned | Will implement after collision system |

---

## Upcoming Phases

### Phase 3 – Grid System & Level Assembly ⏳
> *Goal:* walk seamlessly through a stitched level of 4 rooms.

### Phase 4 – ECS Feature Pack & State Sync ⏳
> *Goal:* solid data pipeline for future mechanics.

### Phase 5 – Combat Vertical Slice ⏳
> *Goal:* shoot things, deal damage, see numbers fly.

### Phase 6 – HUD & Menus ⏳
> *Goal:* all moment-to-moment UI present.

---

## Technical Debt & Improvements

| Item | Priority | Description |
|------|----------|-------------|
| Unit Tests | Medium | Add tests for core components (Renderer, AssetManager, GameLoop) |
| Documentation | Low | Add JSDoc comments to all public methods |
| Asset Pipeline | Low | Replace mock assets with actual asset loading |

---

## Notes & Decisions

- **2025-04-19:** Initial project setup completed with Phase 0 and Phase 1 implementation
- **2025-04-19:** Decided to use XState for state management due to its robust features and dev tools
- **2025-04-19:** Updated world layout to use a simple square room with walls instead of offset checkerboard pattern
- **2025-04-19:** Improved movement system with camera-relative controls and faster movement speed
- **2025-04-19:** Changed default camera orientation to point north for better navigation
- **2025-04-19:** Fixed movement controls to ensure W always moves in the direction the camera is facing
- **2025-04-19:** Added compass indicator to DevOverlay to show camera orientation
- **2025-04-19:** Fixed camera-relative movement to properly align with camera direction
- **2025-04-19:** Added axis helper and improved compass indicator for better debugging
- **2025-04-19:** Fixed coordinate system to use North (-Z), East (+X), South (+Z), West (-X)
- **2025-04-19:** Improved DevOverlay layout with player coordinates and repositioned elements
- **2025-04-19:** Fixed movement controls to properly align with camera direction
- **2025-04-19:** Simplified camera system by locking to North (-Z) orientation
- **2025-04-19:** Fixed movement direction and standardized on X/Z coordinates
- **2025-04-19:** Added frame rate limiter to lock game at 60 FPS using the setTimeout + requestAnimationFrame pattern
- **2025-04-19:** Added camera rotation with middle mouse button
- **2025-04-19:** Updated player movement to be relative to camera direction (W always moves forward in camera direction)
- **2025-04-19:** Fixed middle mouse button camera rotation and removed Q/E key rotation in favor of free rotation
- **2025-04-19:** Implemented collision detection system with capsule vs. AABB collisions and sliding
- **2025-04-20:** Improved collision system to handle corner cases and added debug visualization (toggle with C key)
- **2025-04-20:** Enhanced test room with two chambers connected by a doorway and added standalone obstacle tiles

---

*Last updated: 2025-04-20*
