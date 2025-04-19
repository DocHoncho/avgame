# Renderer Architecture

> **Purpose** Provide a clear, implementation‑ready spec for AVGame’s rendering layer so contributors (or a future you) never wonder *“where does this draw call belong?”*.

---

## 1 – Design Goals
| Goal | Why it matters |
|------|----------------|
| **Deterministic 60 FPS on mid‑range GPUs** (GTX 1060 / RX 580) | Ensures playability on average hardware and Steam Deck‑class devices |
| **Distinct "Tron‑noir" aesthetic** | Edge glow + deep shadows + emissive corruption define the game’s identity |
| **Isometric readability** | Fixed 3⁄4 camera angle keeps combat legible even with flashy effects |
| **Extensible effect stack** | New corruption variants, boss‑specific shaders, temporary screen filters |
| **Editor live‑preview** | Level designers see final lighting/shaders without a build step |

---

## 2 – High‑Level Pipeline
```mermaid
graph TD
    subgraph CPU
        A(Game Logic / ECS) -->|Frame data| B(Render Queue)
    end
    subgraph GPU
        C[Geometry Pass] --> D[Lighting & Emissive Pass]
        D --> E[Post‑FX Pass]
        E --> F[HUD / UI (Vue)]
    end
    B -->|Command buffers| C
```

1. **ECS systems** push renderable components into a frame‑local **Render Queue**.
2. **Three.js** executes **geometry pass** using *instanced meshes* for tiles + dynamic meshes for characters.
3. A forward+ lighting & emissive pass applies:
   - Per‑tile static light probes
   - Per‑pixel edge‑glow in screen‑space (cheap, single‑tap blur)
4. **Post‑FX stack** (Three.js `EffectComposer`): bloom → CRT vignette → color grade LUT.
5. Vue HUD renders last into a separate canvas layer for crisp text.

---

## 3 – Camera System
- **Angle:** 35° elevation, 45° azimuth (classic ARPG look).
- **Orbit:** Players may rotate in 90° steps; camera animates via slerp over 0.25 s.
- **Safe‑area framing:** Horizontal pan within ±3 tiles keeps player center‑weighted.

```ts
interface IsoCameraOptions {
  elevationDeg: 35;
  distance: number; // auto‑solved from FOV + vertical fit
  snapAngles: 90;   // degrees per rotate
}
```

---

## 4 – Tile Rendering
### 4.1 Coordinate System
```
+X → east
+Z → south
Y  → up (metric units; 1 tile = 1 m)
```

### 4.2 Instancing Strategy
| Asset Type | How | Rationale |
|------------|-----|-----------|
| **Floor & wall tiles** | **THREE.InstancedMesh** (≤ 10 k instances / draw) | 50–100× fewer draw calls |
| **Decor props** | *Merged static geometry* per chunk (16×16 tiles) | Only one VBO update when editing levels |
| **Corruption overlays** | Instanced quads with vertex‑animated UVs | Cheap GPU animation |

### 4.3 Culling
- **Frustum culling**: automatic via Three.js + custom horizon plane for iso angle.
- **Occlusion**: simple **2‑D tile blockers**; tiles behind opaque walls are skipped at queue build.

---

## 5 – Materials & Shaders
### 5.1 Unified Material Set
| Material | Usage | Notes |
|----------|-------|-------|
| `MatTileBase` | floors/walls | Accepts corruption overlay via UV2
| `MatGlowEdge` | props/characters | Sample object‑space fresnel for outline
| `MatCorrupt` | corruption mesh | Pulsating emissive, noise‑masked alpha

### 5.2 Shared ShaderChunks
```glsl
// edgeGlow.glsl
float edgeGlow(vec3 n, vec3 v) {
  return pow(1.0 - dot(normalize(n), normalize(v)), 2.0);
}
```

- Included via `onBeforeCompile` so materials stay hot‑reloadable.
- **Noise textures** baked to KTX2 (BC7 / ASTC depending on platform).

---

## 6 – Post‑Processing Stack
| Order | Effect | Implementation |
|-------|--------|----------------|
| 1 | **Bloom** | Unreal‑style, mip‑cascade threshold ≈ 1.1 |
| 2 | **Chromatic aberration** | Lightweight full‑screen quad |
| 3 | **CRT vignette & scanlines** (toggle) | Texture‑based overlay |
| 4 | **Color L U T** | 3‑D LUT (32³) via `lutPass` |

`EffectComposer` is created **once**; passes enabled/disabled via bitmask flags for minimal re‑allocs.

---

## 7 – Performance Budget
| Phase | ms (budget) | Notes |
|-------|-------------|-------|
| CPU → build queue | 1.0 ms | instancing math + culling |
| Draw + lighting | 4.5 ms | aiming for ≥ 180 FPS GPU headroom |
| Post‑FX | 1.0 ms | scalable bloom iterations |
| HUD | 0.5 ms | separate canvas |
| **Total** | **7.0 ms** | ≈144 FPS ceiling; headroom for spikes |

---

## 8 – Integration Points
- **AssetManager** delivers ready → GPU meshes & textures.
- **ECS** owns the `Renderable` component; renderer reads but never mutates game state.
- **DebugTools** may inject a `WireframePass` for hit‑box overlay.

---

## 9 – Dev‑Time Conveniences
- **Hot shader reload** via `vite-plugin-glsl`
- **Render doc overlay** (F‑12) dumps `GPUFrameProfiler` stats
- **`window.__renderer`** export for quick console experiments

---

## 10 – Roadmap / Nice‑to‑Haves
1. Screen‑space **reflections** on shiny floors (prototype done).
2. **GPU‑driven occlusion** culling (Visibility Buffer).
3. **WebGPU** backend toggle once Three.js stabilises.
4. Optional **ray‑marched volumetric fog** for boss arenas.

---

*Last updated | 2025‑04‑19*

