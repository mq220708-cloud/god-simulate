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
The current inline application script passes a JavaScript syntax compilation check. The simulation facade passes isolated tick/count/error-recovery checks. The world-state codec passes isolated round-trip and legacy compatibility checks. The client effects adapter passes isolated event-routing and disposal checks. These are source-level checks only: the Node test files have not yet been run as a suite, and browser/device runtime testing is still required for render, simulation, save/load, and both existing modes; source syntax alone is not acceptance.


## P1-03 effects boundary
`ThanhGioiSimulationEffects` is a small DOM-free event bus. The legacy chronicle writer still mutates `W.log`, then emits a `notification` effect; the browser subscribes and displays it. Roleplay elimination now emits `roleplay-game-over` with a message; the browser adapter owns timer stop, speed-button state, and dialog presentation. This removes those two direct presentation paths from the simulation call chain, but does not yet make every function reachable from `step()` pure or server-ready. Other domain helpers may still call browser services directly and require a full dependency audit.


The roleplay ideology eligibility check now computes and records the pending choice in world state, then emits `ideology-choice-required` with a serializable list of choices and a reason string. The client adapter alone builds the dialog markup. The three currently supported event types (`notification`, `ideology-choice-required`, `roleplay-game-over`) are routed through `src/client/simulation-effects-adapter.js`, which receives injected callbacks and has an explicit `dispose()` lifecycle. Its tests cover dispatch, unknown event handling, and idempotent disposal. This removes the inline event subscriptions from the simulation section; it is not yet proof that every indirect helper or every simulation entry path is browser-independent.
