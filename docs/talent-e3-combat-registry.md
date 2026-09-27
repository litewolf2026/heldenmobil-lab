# TALENT-E3: canonical combat talent registry

TALENT-E3 adds a single WdS source of truth for the 27 DSA 4.1 combat talents.
It does not add another combat resolver. Existing AT/PA/FK, weapon, armor and
maneuver calculations stay in the existing combat modules.

Each definition has a stable `combat.*` key, canonical WdS name, exact aliases,
combat class, BASIC/SPECIAL type, advancement column, eBE rule, canonical
substitution references, specialization availability and
`resolutionMode: COMBAT`.

The registry replaces duplicated rule metadata in `app.js`. HeldenMobil derives
combat eBE from the registry; UI abbreviations remain presentation-only.
Substitution links and specialization availability are metadata only. E3 does
not automatically derive combat talents, select substitutes, add maneuvers or
change AP/advancement logic.

HeroSnapshotV1 preserves the existing combat structure and enriches recognized
combatTalent rows with canonical metadata. Unknown/additional HLD combat names
remain untouched.

A namespaced `combat.*` key sent through `CheckRequestV1 kind: talent`
fails closed with no dice. Execution remains the responsibility of the existing
combat action path.
