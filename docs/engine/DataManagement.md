# Data Management Specification

> **Mission** — Define how every byte—models, maps, saves, settings—flows from disk/CDN into memory and back again, in a way that is fast, versionable, and future‑proof for mods and multiplayer.

---

## 1 – Strategic Goals
| Goal | Why |
|------|-----|
| **Build‑time optimization** | Shrink download, enable long‑term caching via hashed filenames. |
| **Runtime flexibility** | AssetManager handles streaming & variant selection on the fly. |
| **Deterministic saves** | Exact reproduction for replays, rollback netcode, bug reports. |
| **Migration‑ready** | Versioned formats + transform scripts keep old saves compatible. |
| **Mod friendliness** | Loose files in `/mods` override or extend base manifest. |

---

## 2 – Build‑Time Asset Pipeline (Vite)
### 2.1 Plugins & Steps
| Step | Plugin / Tool | Output |
|------|---------------|--------|
| Gather assets | `vite-plugin-glob-input` | virtual entry for `/assets/**/*` |
| Texture compress | `vite-plugin-ktx2` | KTX2 (BC7/ASTC) in `dist/textures/` |
| GLTF transform | `gltf-pipeline` CLI | mesh quantisation + Draco 14 | .glb |
| Audio re‑encode | `exa-ogg` script | OGG Vorbis @ ~160 kbps |
| Hash & copy | Vite default | `/assets/[hash][ext]` |
| Manifest emit | Custom plugin | `asset‑manifest.json` (logical → hashed) |

### 2.2 Asset Manifest Example
```jsonc
{
  "player.glb": "assets/0f4e231.glb",
  "tileset.ktx2": "assets/a8b3dd0.ktx2",
  "bolt.ogg": "assets/7c91e1f.ogg"
}
```
- Multiple variants per key (`tileset.ktx2` vs `tileset.webp`) resolved at runtime based on feature detection.

---

## 3 – Runtime Asset Management
*See `AssetManager` in Renderer & Grid docs—here we expand the service tier.*

### 3.1 API Surface
```ts
assetManager.preload(group: string[]): Promise<void>;
assetManager.load<T>(id: string): Promise<T>; // ref‑counted
assetManager.release(id: string): void;
assetManager.setBase(url: string): void;     // switch to CDN
```

### 3.2 Concurrency Queue
- Max 4 concurrent XHR/Fetch by default.
- Priority levels: **Critical** (UI, first person view) > **High** (near chunk) > **Background**.

### 3.3 Group Tags
- Manifest supports `"tags": ["level1","boss"]` to bulk‑preload.

### 3.4 Variant Resolver
```ts
if (gpu.supportsBC7) pick(".ktx2");
else if (gpu.supportsASTC) pick("_astc.ktx2");
else pick(".webp");
```

---

## 4 – Level & Room Data Formats
### 4.1 Room Prefab (recap)
- JSON schema in `GridSystem.md` §6.
- Stored under `assets/rooms/{biome}/{id}.room.json`.

### 4.2 Compiled Level Pack
For release builds, room JSONs are **packed** into a binary blob to reduce HTTP chatter:
| Field | Type | Desc |
|-------|------|------|
| Header | `u32 magic 'AVLV'` | id |
| Version | `u16` | format version |
| RoomCount | `u16` | |
| RoomOffsets[] | `u32` | byte offsets |
| …rooms | zstd‑compressed JSON | |

`LevelLoader` maps chunk id → offset; decompresses on demand via `fflate`.

---

## 5 – Save / Load System
### 5.1 Data Layers
| Layer | Storage | Size | Frequency |
|-------|---------|------|-----------|
| **Settings** | `localStorage` | < 4 KB | on change |
| **Quick Save** | IndexedDB `saves/store` | 10–50 KB | on demand / checkpoints |
| **World Snapshot** | `indexedDB+zstd` | 0.5‑2 MB | on level exit |
| **Replays** | IndexedDB `replays/` | ~100 KB/min | opt‑in |

### 5.2 Snapshot Schema (MsgPack)
```
root → {
  version: 3,
  rngSeed: u32,
  player: { stats, inventory, pos },
  world: {
    levelId, timePlayed, corruptionState[], lootDropped[]
  }
}
```
Compressed with Zstd level 6 (~40 % size of JSON).

### 5.3 Versioning & Migration
- Each snapshot embeds `version`.
- On load, `migrators[]` transform older → latest in sequence.
- Failing migrator marks save as *legacy*; UI informs player.

### 5.4 Cloud Sync (Future)
- Upload encrypted zstd blob to Steam Cloud or Firebase.
- Conflict resolution: newest `modifiedAt` wins; keep two latest versions.

---

## 6 – Telemetry & Logging
| Channel | What | Retention |
|---------|------|-----------|
| **Crash Dump** | stack trace, last 200 events, hardware info | on crash only |
| **Analytics (opt‑in)** | level time, deaths, options | 90 days |
| **Log File** | console.log mirror | per session |

Logs gzip’d and dropped in IndexedDB; share via *Export Debug Bundle*.

---

## 7 – Data Validation & Tools
- **JSON Schema** definitions for room, manifest, audio manifests.
- `pnpm validate` task runs AJV against `/assets/**.json`.
- Editor warns on invalid prefab before save.

---

## 8 – Performance Targets
| Operation | Budget |
|-----------|--------|
| Preload 50 MB on SSD | ≤ 2 s |
| Asset lookup (hash map) | O(1) avg ≤ 0.01 ms |
| Save snapshot | ≤ 50 ms frame‑spill |
| Load snapshot | ≤ 300 ms before ready screen |

---

## 9 – Future Enhancements
1. **Patch diff system** — deliver only changed asset blobs (BSDiff style).
2. **Encrypted archives** — simple XOR obfuscation for spoiler‑free .pak.
3. **Mod loader** — `/mods/{name}/manifest.json` merges at runtime; Hash collision detection.
4. **WASM asset decoders** for faster zstd & Draco.

---

*Last updated | 2025‑04‑19*

