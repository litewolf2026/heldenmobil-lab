# Third-Party Notices

Stand: 2026-09-14

This repository uses external open-source projects as implementation and regression references for the isolated DSA 4.1 Rule Core. Official DSA 4.1 rulebooks remain the authority for rule behavior. Rulebook prose, tables, illustrations, compendium data and other copyrighted content are not copied into runtime code.

## MeisterGeister

- Project: `Constructor0987/MeisterGeister`
- Repository: https://github.com/Constructor0987/MeisterGeister
- Reference basis: commit `b8994d3bc06892d3775b68e8783892d422ffb1a7`
- License: MIT
- Used for: algorithm comparison and numeric regression/test vectors, especially `MeisterGeister_Tests/Probe_Tests.cs` and `MeisterGeister_Tests/Kampf_Tests.cs`.
- Adaptation boundary: no WPF/UI/object-graph code is imported. Selected numeric fixtures are re-expressed as small JavaScript regression cases.

## Geano's GDSA QoL

- Project: `GeanoFeeFoundry/geanos-gdsa-qol`
- Repository: https://github.com/GeanoFeeFoundry/geanos-gdsa-qol
- Reference basis: commit `74f0abec138839c0a51d1326f8265a5557b214bf`
- License: MIT
- Used for: workflow and behavior reference for combat maneuvers and magic/resource flows, especially `scripts/active-sf.js`, `scripts/asp-tracker.js` and related pure ideas.
- Adaptation boundary: Foundry Actor, Chat, DOM, Dialog, Effect and target-management code is not copied into the Rule Core. Maneuvers are represented as declarative modifiers/results and checked against the official DSA rules.

## Roll20 DSA 4.1 Character Sheet

- Project: `Roll20/roll20-character-sheets/Das_Schwarze_Auge_4-1`
- Repository: https://github.com/Roll20/roll20-character-sheets
- License: MIT at repository level
- Used for: independent formula and edge-case cross-checks.
- Adaptation boundary: reference/fixtures only unless a later change explicitly documents code adaptation.

## Foundry DSA 4.1 / Goody references

Foundry DSA 4.1 is currently architecture/data-model reference only where the relevant Core repository license has not been separately verified. Goody's DSA 4.1 Core is behavior-reference only because its license does not permit the modifications required by this project.

## DSA rulebooks

The user-supplied DSA 4.1 rulebooks are used to verify rule behavior. Only algorithms, short numeric examples needed as regression fixtures, and source references are encoded. The project does not redistribute rulebook text, tables, artwork or compendium content.
