# Particle System Specification

> **Objective** — Deliver a flexible, GPU‑driven particle framework that handles everything from tiny hit‑sparks to sprawling corruption fog, while keeping CPU cost negligible and integrating cleanly with ECS and the Renderer.

---

## 1 – Guiding Principles
| Principle | Rationale |
|-----------|-----------|
| **GPU First** | Spawn & simulate on the GPU when possible to free CPU for AI and physics. |
| **Emitter‑as‑Data** | Emitter params live in ECS components or prefab JSON, no hard‑coded effects. |
| **Batch Everything** | One draw call per particle material, instanced geometry. |
| **Dynamic LOD** | Fade‑out or reduce spawn rate based on camera distance & settings. |
| **Zero‑GC Hot Path** | Buffers pooled; emitter structs reused. |

---

## 2 – Architecture Overview
```mermaid
graph LR
  subgraph CPU
    E[Emitter System (bitecs)] --> U[Uniform Upload]
  end
  subgraph GPU
    V[Vertex Shader (Spawn & Sim)] --> F[Fragment Shader]
    F --> B[Blend to HDR target]
  end
```

- **Emitter System** fills a *spawn ring buffer* (SSBO) each frame.
- **Vertex shader** uses **billboard quad** per instance; updates position, velocity, life via *GPU tick* (pseudo‑compute in VS).
- **Fragment shader** samples sprite sheet or procedural noise.

---

## 3 – Data Formats
### 3.1 Emitter Component
```ts
interface GPUParticleEmitter {
  maxParticles: 2048;
  rate: number;           // particles/sec
  life: [number, number]; // min, max ms
  speed: [number, number];
  size: [number, number]; // start, end px
  colorA: Vec4;           // start rgba
  colorB: Vec4;           // end rgba
  spriteRow: number;      // index in 4×4 sprite sheet
  flags: EmitterFlags;    // Additive, Soft, WorldSpace
}
```
Stored in ECS `Emitter` + `Transform` for world position.

### 3.2 Spawn Record (SSBO struct)
| Field | Type | Notes |
|-------|------|-------|
| `pos` | `vec3` | world position at spawn |
| `vel` | `vec3` | initial velocity |
| `life` | `float` | remaining life ms |
| `seed` | `uint` | random offset for shader noise |
| `params` | `uvec4` | packed emitter index & misc flags |

> **Ring buffer** of 65 k entries; atomic counter for write index.

---

## 4 – Shader Pipeline
1. **Vertex Shader**
   - Fetch spawn record via `gl_InstanceID`.
   - Age particle by `uTime - spawnTime`.
   - Integrate velocity (`vel += gravity * dt` optional).
   - Compute size & color via `mix()` of start/end over normalised lifetime.
   - Output quad vertices facing camera (view‑aligned billboard) with UVs into clip‑space.
2. **Fragment Shader**
   - Sample sprite sheet (RGBA8) or procedural noise.
   - Apply soft particle depth fade if `flags & SOFT`.
   - Output emissive HDR color; Renderer’s bloom pass catches highlights.

---

## 5 – Integration with Renderer
- **EffectComposer Pass Order**: particles render *after* opaque geometry but *before* bloom so bright sparks leak glow.
- Uses dedicated `THREE.ShaderMaterial` with `THREE.InstancedBufferGeometry` (quad of 4 verts × 6 indices).

---

## 6 – Emitter System (CPU/bitecs)
```ts
function EmitterSystem(world: IWorld, dt: number) {
  const qEmit = defineQuery([Emitter, Transform]);
  for (const eid of qEmit(world)) {
    const rate = Emitter.rate[eid];
    Emitter.accum[eid] += rate * dt; // accum fractional spawn count
    while (Emitter.accum[eid] >= 1) {
      spawnParticle(eid);
      Emitter.accum[eid] -= 1;
    }
  }
  return world;
}
```
`spawnParticle()` writes a record into GPU ring buffer via mapped `ArrayBuffer` (no WebGL bufferSubData per particle).

---

## 7 – Pooling & Memory
| Buffer | Size | Recycle |
|--------|------|---------|
| Spawn SSBO | 65 k × 32 B ≈ 2 MB | Ring buffer overwrite |
| Instance VBO | same count | Static; reused across scenes |
| CPU emitter pool | 4 k structs | Freed on scene unload |

---

## 8 – LOD & Performance
- **Distance fade**: if camera > LOD start, halve spawn rate; beyond LOD end, disable emitter.
- **Profile budget**: aim ≤ 0.8 ms GPU @ 1080p for 5 k live particles.
- **Quality settings**: `Low` halves maxParticles & disables soft‑particle fade.

---

## 9 – Authoring Workflow
1. Designer tweaks JSON prefab:
```jsonc
"muzzleFlash": {
  "rate": 0,
  "burst": 20,
  "life": [80,120],
  "speed": [0.1,0.3],
  "size": [6,1],
  "colorA": "#FFCC88",
  "colorB": "#883300",
  "spriteRow": 2,
  "flags": ["Additive"]
}
```
2. Hot‑reload via Vite HMR; emitter recreates with new params in‑game.

---

## 10 – Future Enhancements
1. **Compute‑shader sim** once WebGPU stable — offload spawn & physics fully.
2. **Light‑linked particles** — bright explosions generate transient point lights.
3. **Mesh particles** — small debris as GPU instanced meshes.
4. **Vector field turbulence** — sample 3‑D noise texture for swirling corruption.

---

*Last updated | 2025‑04‑19*
