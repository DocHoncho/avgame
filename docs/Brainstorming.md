# AVGame - Project Brainstorming

This document collects ideas and plans for a game currently codenamed **AVGame**. It's a concept that’s been rolling around for a while — a blend of twin-stick shooter mechanics with the depth and progression systems of an action RPG (ARPG). Think fast-paced action with satisfying movement and aiming, layered over stat progression, gear upgrades, and maybe even some build variety.

We'll be using this document to jot down features, style notes, gameplay systems, lore ideas, and anything else that helps flesh this thing out.

---

## Core Theme
The player takes the role of a kind of **autonomous agent**, a sentient or semi-sentient construct dispatched into an **ancient computer system**. This system has been compromised, overrun by a creeping, chaotic **corruption** — a kind of digital entropy or invasive force that has distorted the environment, data structures, and the logic that once governed it.

The game world is abstract, but with strong metaphorical undertones. Think decaying data cores, logic constructs gone rogue, and corrupted subsystems behaving like diseased biomes. The agent must navigate these environments, reclaim control, and possibly uncover what went wrong — or what deeper forces are at play.

---

## ARPG Element Mapping: Brainstorming

### HP (Health Points)
"HP" feels too on-the-nose and gamey. We want terminology that fits a system-level, digital aesthetic.

**Ideas:**
- **Integrity** – Suggests structural stability, degrades as you take damage.
- **Core Stability** – Evokes a sense of the agent’s underlying function deteriorating.
- **Signal Strength** – Could be a metaphor for the agent’s connection to the system, fading as it takes damage.
- **Data Cohesion** – Suggests the agent is losing coherency as it takes hits.

### Shield / Secondary Layer
A layered approach could work well — like in many ARPGs, there's often an initial buffer before you start taking real damage.

**Ideas for shield-like layer:**
- **Firewall** – A perfect metaphor, could degrade or even "burn out" if overwhelmed.
- **Packet Filter** – A lighter buffer that handles small-scale attacks.
- **Encryption Layer** – Could provide resistance or absorption.

Possibility: Firewall is the first layer (regen or recharge over time?), and Integrity is the core health that gets hit after.

---

## Interpretations of "Integrity" Damage

**1. Signal Degradation / Bitrot**
- Agent’s underlying code destabilizes due to exposure to corrupted data or viral anomalies.
- “Damage” = progressive loss of structural fidelity.

**2. Identity Fracturing**
- Damage breaks down the agent’s operational identity.
- Loss of cohesion in directives, potential for corruption-induced transformation.

**3. Memory Integrity / Stack Corruption**
- Core functions are stored in volatile memory.
- Damage disrupts state tracking and can cause instability or unpredictable behavior.

**4. Fragmentation**
- The agent is a fragmented entity in a corrupted filesystem.
- Damage = loss of “pieces” or the inability to recombine a complete self-image.

---

### Mana / Energy Equivalent
We’re avoiding a classic "mana" mechanic — no Diablo-style static pool + spell costs. Instead, we're leaning toward something more like **Path of Exile**, where:

- **Energy** (placeholder name) regenerates over time
- Regeneration rate and max capacity are influenced by **itemization**, **skills**, and **build choices**
- No universal spenders — different abilities may have different scaling or even alternative resource interactions

**Conceptual Names (WIP):**
- **Bandwidth** – Represents available throughput for high-energy actions
- **Processing Power** – Reflects temporary load the agent can handle
- **Execution Stack** – Each action is a subroutine, and this is how much you can queue/spend before needing recovery
- **Clock Cycles** – Evokes hard-limit timing, could be used for cooldown pacing too

**Design Notes:**
- Basic attacks are mostly **free** — in keeping with the twin-stick shooter feel.
- There may be a **heat buildup** system: basic attacks generate heat, which limits sustained fire or forces a brief cooldown/venting period.
- **Special attacks**, modules, or "skill gems" analogues draw from the **mana-like pool** (Bandwidth/Processing Power/etc.).
- Mods and gear can reduce energy cost, increase regen, or influence heat thresholds — supporting deep build customization.

---

### Basic Attacks
Being a twin-stick shooter at heart, most combat revolves around **projectile-based basic attacks**.

**Design Idea:**
- Each base weapon has **intrinsic projectile traits**:
  - **Projectile Count**
  - **Spread / Angle**
  - **Rate of Fire**
  - **Projectile Speed / Size / Damage**

**Examples:**
- One weapon might shoot a single, medium-sized projectile at a steady rate.
- Another could shoot **two smaller projectiles in parallel**, slower, but with slightly reduced damage per projectile.
- Yet another might have a **wide spread** with short-range burst potential — good for close-quarters or crowd control.

These base traits can then be modified by:
- **Items / Mods** that affect projectile count, spread, or even curve
- **Support systems** that alter projectile behavior (e.g. chaining, piercing, fragmentation)
- Potential synergy with heat buildup or special attack charge mechanics

Goal is to make basic attacks feel diverse and customizable without being strictly resource-gated.

---

### Archetype System
Instead of traditional classes (e.g. Diablo-style melee/caster/rogue) or a massive freeform web (like PoE), AVGame will feature a more **streamlined, modular archetype system**.

**Design Philosophy:**
- No rigid class structure — players aren’t locked into predefined roles
- But not completely open-ended either — we avoid excessive complexity or analysis paralysis
- Archetypes will act as **specialization frameworks** that influence available gear, mods, or passive effects

**Potential Archetype Themes (early concepts):**
- **Control / Status** – Focus on slowing, stunning, disrupting enemies
- **Corruption / Damage over Time** – Debuffs, damage spread, rot/decay effects
- **Burst / Direct Damage** – Front-loaded power, short cooldown nukes, high crit potential
- **Mobility / Avoidance** – Evade, phase, relocate quickly — possible energy-based movement tools
- **Summoning / Constructs** – Deployable subroutines, minions, or automated defenses

These could be chosen at initialization or unlocked through milestones, missions, or installed firmware modules.

**Goal:**
- Let players lean into a role without being locked into it
- Encourage hybrid playstyles and experimentation
- Tie archetypes into the lore (e.g. “Optimization Protocols,” “Entropy Algorithms,” etc.)

---

### Equipment System (Early Concepts)
Given the agent is a digital construct in an abstract system, traditional RPG equipment slots (helmet, boots, etc.) feel out of place. We're exploring alternative metaphors for gear:

**Possibility 1: Modular Hardware**
- **Core Module** – affects overall stats/archetype
- **I/O Ports** – weapons or active ability slots
- **Cooling Unit** – heat or energy regen
- **Signal Array** – movement/vision/utility

**Possibility 2: Software Stack**
- **Runtime Kernel** – base chassis
- **Combat Drivers** – weapons or projectile mods
- **Firmware Plugins** – passive effects
- **Encryption Keys** – special skills or unlockable traits

**Possibility 3: Data Schematic / Circuit Design**
- Each item is a "node" on a logic tree/grid
- Placement and interconnection matter more than categories

**Likely Direction:**
- We'll probably adopt a more **streamlined and thematic version of traditional gear**:
  - 2–3 core equipment slots (e.g. Weapon Module, Defense Matrix, Utility Slot)
  - + Several slots for **abilities**, **support routines**, or **passives**
- Visual metaphor may still lean toward a “modular software construct” rather than medieval-style loot

---

### Core Attributes (Stat System)
Most ARPGs boil stats down to STR, DEX, and INT — but AVGame's setting and mechanics make those a poor fit.

We're rethinking the attribute system around digital metaphors that reinforce gameplay roles while fitting the world.

**Key Goals:**
- Avoid derivative melee/ranged/magic distinctions
- Enable specialization without pigeonholing
- Create intuitive ties between flavor and function

**Conceptual Attributes (WIP):**

- **Throughput** – Governs raw data flow: affects energy regen rate, cooldown reduction, possibly projectile speed or reloads.
- **Stability** – Represents resistance to disruption: influences Integrity max, resistance to corruption, or stagger/interrupt protection.
- **Latency** – Low latency = higher agility: affects move speed, dodge cooldown, maybe heat dissipation.

**Alternate/Optional Stats:**
- **Entropy** – Ties into corruption-based effects or chaos damage types; may also influence risk/reward from unstable systems.
- **Compilation** – Reflects build complexity or multi-threaded operation: maybe more passive slots, support modules, or concurrent effects.

These stats could scale weapons, skills, mods, or certain gear types. For example, a high-Latency (agility) build might favor low-damage, high-rate-of-fire weapons and evade-heavy combat. A Stability-heavy agent might shrug off status effects or use tanky loadouts.

Still open to refinement, combination, or discovering emergent stat systems through gameplay design.

