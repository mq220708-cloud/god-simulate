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
- Added custom pixel-block tree rendering for temperate, evergreen, and autumn forest tiles.
- Replaced city-level emoji markers with hand-drawn pixel building silhouettes whose forms change by city level.
- Main branch remains untouched; work is isolated on `big-update/pixel-art-worldbox-ui`.

## Non-negotiable art rule
A tree must look like a tree because its pixels were drawn for this game. A house must look like a house because its sprite was drawn for this game. Never substitute a pre-made icon or emoji.
