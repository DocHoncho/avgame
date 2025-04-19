# Entity‑Component‑System (ECS) Specification

> **Goal** Deliver a blazing‑fast, data‑oriented runtime that separates *what an entity is* (components) from *what it does* (systems), while staying ergonomic in TypeScript.

---

## 1 – Core Principles
| Principle | Detail |
|-----------|--------|
| **Data‑Oriented** | Components stored in *struct‑of‑arrays* `Float32Array`/`Uint32Array` blocks for cache‑friendly iteration. |
| **Deterministic Order** | Systems execute in a fixed pipeline each frame; no hidden race conditions. |
| **Zero‑GC Hot Path** | Component pools & freelists; no new allocations during gameplay. |
| **Modularity** | Features toggle by adding/removing systems; no coupling hacks. |
| **Event‑Driven** | Systems communicate via ring‑buffer event bus (`TypedEvent<id,payload>`). |

---

## 2 – Implementation Choice
| Option | Pros | Cons |
|--------|------|------|
| **bitecs** | 2 k LOC, SoA layout, TS types, blazing fast | lacks hierarchical prefabs, minimal dev‑tools |
| **ecsy** | official Mozilla demo heritage, inspector | AoS layout → slower; GC heavy |
| **Custom (~400 LOC)** | tailor‑made API, minimal deps | maintenance overhead |

**Decision:** **bitecs** (MIT) as base; extend with our own *PrefabLoader* & inspector overlay.

---

## 3 – Component Schema

| Component | Storage | Purpose |
|-----------|---------|---------|
| **Transform** | `Float32Array x,y,z; Float32Array rotY` | World position + heading |
| **Velocity** | `Float32Array dx,dy,dz` | Movement vector |
| **SpriteAnim** | `Uint16Array frame; Uint16Array timer` | UI/HUD effects |
| **Renderable** | `Uint32 meshId; Uint32 materialId` | Lookup into AssetManager |
| **Collider** | `Float32 radius; Uint8 flags` | Circle/capsule collision & bitmask |
| **Health** | `Uint16 current,max` | Integrity (HP) |
| **Energy** | `Uint16 current,max; Uint16 regen` | Ability resource |
| **StatusEffect** | `Uint32 bitmask; Uint16[] timers` | Poison, burn, slow |
| **AIState** | `Uint8 state; Uint16 cooldown` | Simple FSM for mobs |
| **Projectile** | `Uint16 sourceId; Uint16 damage` | Hit‐scan & travel |
| **Lifetime** | `Uint16 ms` | Auto‑despawn particles |
| **NetworkSync** _(future)_ | `Uint32 snapshotTick` | Multiplayer interpolation |

*Components stored in shared `ArrayBuffer` pools; all numeric for WebAssembly compatibility down the road.*

---

## 4 – System Pipeline
```mermaid
graph LR
  subgraph Frame(dt)
    A[InputSystem] --> B[StateMachine Sync]
    B --> C[AI System]
    C --> D[Physics & Collision]
    D --> E[Combat Resolver]
    E --> F[Status Effect Tick]
    F --> G[Projectile Update]
    G --> H[Render Queue Build]
  end
```

*All systems receive `(world, dt)` and operate only on components they declare.*

### Execution Rules
1. **Fixed Tick**: 60 Hz (16.666 ms); multiple updates per render if lagging.
2. **Read → Write Discipline**: systems may mutate only their declared components.
3. **Deferred Destruction**: entities flagged in `world.toDelete[]` and purged post‑frame.

---

## 5 – Event Bus
```ts
interface Event<T extends number, P> { id: T; payload: P; }
// Pre‑allocated ring buffer (size 1024)
world.events.push({ id: EVT.HIT, payload: { target, dmg } });
```
Systems poll `world.events`; consumers clear their events index after handling to avoid GC.

---

## 6 – Prefabs & Spawners
```jsonc
// plasmaBolt.prefab.json
{
  "components": {
    "Transform": { "x":0, "y":1, "z":0 },
    "Velocity":   { "dx":0, "dy":0, "dz":30 },
    "Renderable": { "meshId":"boltMesh", "materialId":"glowMat" },
    "Projectile": { "damage": 15, "sourceId": "$PLAYER" },
    "Lifetime":   { "ms": 2000 }
  }
}
```
Prefab loader maps string keys → numeric asset IDs via AssetManager, then *hydrates* entities in bitecs world.

---

## 7 – Memory Management
| Pool | Size | Notes |
|------|------|-------|
| **Entity IDs** | 65 k (Uint16) | wrap‑around safe with generation counter |
| **Component pools** | chunked 1 k entities | Grows by doubling; freed chunks recycled on scene unload |
| **Event buffer** | 1024 events | overwrite oldest when full (telemetry warns) |

Avoids V8 heap churn; all gameplay allocs happen at scene load time.

---

## 8 – Debugging Tools
- **bitecs‑inspector overlay** (shows archetype count, components per entity).
- `window.world` reference in dev builds for console inspection.
- **Highlight query**: press `Alt+Q`, type `Renderable & !Health` → outlines all scenery props.

---

## 9 – Integration Points
| Subsystem | Interaction |
|-----------|------------|
| **StateMachine** | Spawns or destroys ECS worlds on session enter/exit. |
| **Physics** | ColliderComponent feeds broad‑phase; collision events posted back to bus. |
| **Renderer** | RenderQueueSystem scans entities with `Renderable`, `Transform`. |
| **Audio** | AudioSystem listens for `Event<EVT.HIT>` etc., plays SFX pools. |
| **Networking (future)** | NetworkSyncSystem serializes deltas to server. |

---

## 10 – Roadmap
1. **Scripting hooks**: expose `onSpawn`, `onHit` as Lua/WASM callbacks.
2. **Threaded workers**: move AI or path‑finding to WebWorker, sync via SharedArrayBuffer.
3. **Replay/rollback**: record event stream; rewind deterministically for netcode.
4. **ECS compression**: pack low‑bit fields (e.g., flags) into shared `Uint32` for memory savings.

---

*Last updated | 2025‑04‑19*

