# Thần Giới 2.0 — Big Update

## Art direction
- Pixel-art world inspired by the readable, miniature-world presentation of sandbox god games.
- Every world object must be original artwork rendered as pixel sprites or custom sprite sheets.
- Do not use emoji, icon fonts, icon libraries, stock icon packs, or generic glyphs as substitutes for trees, houses, castles, terrain objects, creatures, ships, or troops.
- Use a consistent top-down / slight three-quarter view, stepped silhouettes, limited palettes, and crisp pixel edges.
- UI controls should use custom-drawn miniature artwork; functional text labels remain text.

## Implementation principles
- Preserve the existing simulation, diplomacy, warfare, economy, technology, save/load, and world-generation systems.
- Separate rendering from simulation data so art changes do not alter game rules.
- Keep mobile touch controls, pinch zoom, and performance in mind.
- Build sprites in small milestones and verify each before replacing more of the current renderer.

## Milestones
1. **Sprite foundation:** custom tree species, rocks, terrain details, and city-building sprites.
2. **World objects:** individual house tiers, farms, workshops, walls, towers, castles, bridges, ports, and roads.
3. **Living world:** custom sprites and simple frame animation for people, animals, armies, ships, and environmental effects.
4. **World UI:** redesigned bottom tool palette with original miniature artwork, contextual selection panels, and minimap.
5. **Integration:** connect sprites to existing city levels, ownership, armies, construction, and simulation states.
6. **Optimization and QA:** sprite atlas batching, mobile performance, save/load regression tests, and visual checks.

## Current branch work
- Added a simplified 16×16 sprite atlas with 13 original sprites: four tree variants, palm, bush, flower, rock, hut, cottage, farm, watchtower, and castle.
- Compressed the atlas SVG from about 78 KB to about 19 KB by grouping pixels into color paths (76% smaller).
- Integrated the compact atlas into forest tiles and city-level building rendering; atlas sprites use crisp nearest-neighbor drawing and pixel primitives remain as a loading fallback.
- Added sparse, deterministic flower/bush sprites to suitable grassland tiles and small rock sprites to hills.
- Fixed atlas onload refresh so all atlas-backed terrain details are drawn after asynchronous image loading.
- Added original sprites for all 15 existing building types and replaced emoji construction markers on the map with crisp sprite rendering.
- Added custom pixel scaffolding for buildings under construction and a durability bar for damaged structures.
- Added 10 hand-authored 16×16 unit sprites for infantry, archers, cavalry, cannon, tanks, aircraft, ships, sailboats, migration groups, and missiles.
- Replaced emoji rendering in marching armies, mechanized units, migrating groups, naval transport, and sea trade with crisp sprite-atlas rendering and pixel-drawn fallbacks.
- Removed emoji city markers; city appearance now changes with city level.
- Main branch remains untouched; work is isolated on `big-update/pixel-art-worldbox-ui`.

## Non-negotiable art rule
A tree must look like a tree because its pixels were drawn for this game. A house must look like a house because its sprite was drawn for this game. Never substitute a pre-made icon or emoji.
