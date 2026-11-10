# Phase 1 — Simulation Engine extraction

## Baseline
- Base: `main`, Thần Giới v1.6.3.
- Entry point: `index.html` (single inline application script).
- Phase 1 branch: `multiplayer-foundation`.
- No Multiplayer UI, Socket.IO, server, or database is introduced in this phase.

## P1-01 dependency audit

### Runtime state
The current simulation state is held in top-level lexical variables in the inline script:
- World/map: `W`, `T`, `O`, `X`, `RV`, `N`, `H`, `C`, `CFG`.
- Supporting simulation data: `CD`, `BL`, `RD`, `LK`, `SH`, `FX`, `DQ`, `VER`, and rendering caches.
- Time/render lifecycle: `tm`, `renderBusy`, `renderRequested`, `renderResumeSpeed`.

### Simulation domain (must become DOM-independent)
- Population/economy: `step`, `updateEconomy`, `upkeep`, `migrate`, `expand`, `fillTerritoryHoles`.
- Civilization/technology: `makeCivilization`, `ensureCivilizations`, `civilizationTick`, `invent`, `share`, `foundIdeology`.
- Politics/social: `updateFactions`, `secede`, `rebel`, `reign`, `enact`, `die`.
- Military/diplomacy: `war`, `peace`, `navalBattle`, `remoteWar`, `alliance`, `take`, `relocate`.
- World events: `disaster`, `randDis`, `event`, `voyage`, `expedition`.

These functions currently share globals and helper functions; extraction must preserve call order and mutation semantics before attempting server execution.

### Presentation and browser-only domain
- Rendering: `tile`, `tileDetail`, `tileMicroDetail`, `renderChunk`, `renderT`, `paint`, `draw`, `drawArmies`, `drawShips`, `drawTrade`, `drawRoads`.
- UI: `ui`, `card`, `detail`, `roleplayDashboard`, `roleplayControls`, `showRoleplaySetup`, `showMainMenu`.
- Browser integration: `$`, `notify`, `toast`, event handlers, canvas creation, `requestAnimationFrame`, timers, `localStorage`.

### Coupling findings
1. `step()` is the central simulation tick and currently calls simulation systems that also emit logs/notifications or interact with UI state.
2. Many domain functions directly call `log`, `notify`, `toast`, or read global DOM-backed selections. Those effects need an adapter/event boundary; replacing them all at once is unsafe.
3. `run()` owns both the simulation timer and UI refresh (`draw()`, `ui(true)`). The eventual engine API should expose a single-tick operation while the browser host retains scheduling and rendering.
4. Save/load currently serializes map arrays and world/supporting state in one localStorage object. This is the safest first integration seam for a versioned world-state contract.
5. Rendering and simulation both read the same map arrays. State ownership must be clarified before moving the arrays into a new module.
6. Randomness is used in world generation, simulation, and UI setup. Server-authoritative randomness is a later multiplayer stage; phase 1 must not silently change random outcomes.

## P1-02 first boundary
Introduce a small, DOM-free world-state codec with a versioned envelope and legacy-save compatibility. Initially it wraps the existing state rather than relocating globals. This creates a stable serialization boundary without changing simulation behavior.

## Safe extraction order
1. World-state serialization contract and legacy compatibility.
2. Move pure state helpers and explicit world snapshot creation.
3. Separate tick execution from browser scheduling/UI refresh.
4. Introduce a simulation context for effects (chronicle, notification, UI prompts).
5. Extract renderer only after simulation reads/writes are inventoried.
6. Add action-command facade and regression tests.
7. Keep the existing free/roleplay entry points as compatibility adapters.

## Non-goals in phase 1
- No Multiplayer lobby or player ownership UI.
- No Socket.IO/WebSocket dependency.
- No server deployment or database.
- No changes to gameplay balance, historical pace, technologies, warfare, diplomacy, map generation, or existing modes.

## Progress on this branch

- [x] P1-01 dependency audit documented.
- [x] P1-02 initial versioned world-state codec added at `src/shared/world-state.js`.
- [x] Existing save/load path routed through the codec.
- [x] Legacy v1.6.x unwrapped save objects remain readable.
- [x] Codec tests added at `tests/world-state.test.js`.
- [ ] P1-02 full state ownership extraction (the live globals remain in `index.html`).
- [ ] P1-03 DOM-independent simulation tick.
- [ ] P1-04 renderer extraction.
- [ ] P1-05 command facade.
- [ ] P1-06 complete save/load normalization and migration coverage.
- [ ] P1-07 regression testing in browser for free and roleplay modes.

## Verification notes
The current inline application script passes a JavaScript syntax compilation check. The codec has also passed isolated round-trip, legacy compatibility, and schema-version checks. These are source-level checks only: browser/device runtime testing is still required for render, simulation, save/load, and both existing modes; source syntax alone is not acceptance.
