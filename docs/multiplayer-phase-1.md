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
- [x] Transitional live-world context added at `src/shared/world-context.js`; generation and load attach the current live state references, and save reads through the context. This is a compatibility bridge, not yet a relocation of ownership away from legacy globals. Context validation, accessors, and revision tracking have isolated tests at `tests/world-context.test.js`.
- [x] P1-03 initial simulation execution boundary added; browser scheduler now invokes the DOM-free engine facade. The legacy `step()` callback still uses shared globals and must be progressively made DOM-independent.
- [x] First simulation-effects seam added at `src/shared/simulation-effects.js`; important chronicle notifications, roleplay game-over, and roleplay ideology-choice prompts emit typed events.
- [x] Browser effect handling extracted to `src/client/simulation-effects-adapter.js`; the inline app now injects presentation callbacks instead of registering separate event listeners in the simulation section. Adapter disposal and event routing tests added at `tests/simulation-effects-adapter.test.js`. `W.log` and roleplay pending state remain simulation state, while notification DOM, game-over presentation, and ideology-choice dialog rendering stay in the client.
- [ ] P1-04 renderer extraction.
- [ ] P1-05 command facade.
- [ ] P1-06 complete save/load normalization and migration coverage.
- [ ] P1-07 regression testing in browser for free and roleplay modes.

## P1-03 implementation detail
`src/shared/simulation-engine.js` provides a DOM-free tick boundary with re-entrancy protection and successful-tick counting. The browser timer now calls this facade, while drawing and UI refresh remain in the browser host. The injected legacy `step()` still has indirect browser/UI side effects through downstream functions (for example game-over handling and chronicles); therefore P1-03 is an initial seam, not yet a fully DOM-independent simulation.

## Verification notes
The current inline application script passes a JavaScript syntax compilation check. The simulation facade passes isolated tick/count/error-recovery checks. The world-state codec passes isolated round-trip and legacy compatibility checks. The client effects adapter passes isolated event-routing and disposal checks. The transitional world context passes isolated attach/read/write/revision and validation checks. The inline app now passes a syntax compilation check after context integration; generation/load attachment points and save-path usage were source-verified. These are source-level checks only: the Node test files have not yet been run as a suite, and browser/device runtime testing is still required for render, simulation, save/load, and both existing modes; source syntax alone is not acceptance.


## P1-03 effects boundary
`ThanhGioiSimulationEffects` is a small DOM-free event bus. The legacy chronicle writer still mutates `W.log`, then emits a `notification` effect; the browser subscribes and displays it. Roleplay elimination now emits `roleplay-game-over` with a message; the browser adapter owns timer stop, speed-button state, and dialog presentation. This removes those two direct presentation paths from the simulation call chain, but does not yet make every function reachable from `step()` pure or server-ready. Other domain helpers may still call browser services directly and require a full dependency audit.


The roleplay ideology eligibility check now computes and records the pending choice in world state, then emits `ideology-choice-required` with a serializable list of choices and a reason string. The client adapter alone builds the dialog markup. The three currently supported event types (`notification`, `ideology-choice-required`, `roleplay-game-over`) are routed through `src/client/simulation-effects-adapter.js`, which receives injected callbacks and has an explicit `dispose()` lifecycle. Its tests cover dispatch, unknown event handling, and idempotent disposal. This removes the inline event subscriptions from the simulation section; it is not yet proof that every indirect helper or every simulation entry path is browser-independent.


## P1-02 transitional world context
`ThanhGioiWorldContext` now provides a DOM-free API (`attach`, `getState`, `read`, `write`, `getRevision`) around the current live world references. A newly generated world and a successfully loaded save attach their current map arrays, configuration, world object, and supporting collections. The existing save action obtains these references from the context before passing plain arrays into the versioned codec. This creates one explicit seam for the next migration step while preserving the legacy globals and their mutation behavior. It does not yet make the context the sole owner: existing simulation functions still read and mutate the globals directly, and any future code path that replaces a referenced top-level collection must reattach it. The context module is intentionally transitional; do not treat this as multiplayer/server readiness.


### Kingdom lookup migration seam

- Added `getKingdom(id)` to the DOM-free world context. The legacy `K(id)` accessor now resolves kingdom records through this context once a world has been attached, with a guarded pre-attachment fallback for startup compatibility.
- This moves a high-frequency read path behind the context without changing the kingdom objects or their mutation semantics. The broader simulation still reads and writes many legacy globals directly; this is an incremental seam, not complete state ownership extraction.
- Added context tests for valid, zero, and invalid kingdom identifiers. Browser gameplay regression remains required.


### Living-kingdom collection migration seam

- Added `getKingdoms()` and `getLivingKingdoms()` to the world context. The latter returns the current living kingdom records from the attached world.
- Routed the living-kingdom count, faction membership, remote diplomacy scan, world-conquest check, roleplay initialization, roleplay country picker, and kingdom-list UI through the context accessor.
- The returned collection is a live-world-derived array of the existing kingdom objects; this does not clone records or change simulation mutations. Other code paths still access `W.ks` directly and remain future migration work.


### Map and resource access migration seam

- The world context now exposes validated oil-resource accessors: `getResource`, `setResource`, and `adjustResource`. Mutations increment the context revision and reject invalid tile indices or non-finite amounts.
- Economy extraction and the roleplay oil-site summary now read/update deposits through these methods instead of directly indexing `W.oil`.
- Terrain fertility and terrain-name helpers now obtain terrain, variant, and river arrays from the attached world context, retaining a guarded fallback during pre-world startup.
- Other map/render/gameplay code still uses legacy arrays directly; this is a staged migration and not yet a server-authoritative map command layer.


### Territory ownership mutation seam

- Added `getOwner(index)` and validated `setOwner(index, kingdomId)` to the DOM-free world context. Owner writes increment the context revision; invalid tile indices and negative/non-integer kingdom IDs are rejected.
- Routed the combat occupation write and overseas-colony founding/adjacent-claim writes through `setOwner`, with pre-attachment fallbacks retained for startup compatibility.
- This is a narrow first migration of runtime ownership mutations. Other territory writes (including initial map generation, divine terrain actions, rebellion/succession, death cleanup, and AI expansion) remain to be migrated deliberately; direct `O` access still exists throughout the legacy simulation.
