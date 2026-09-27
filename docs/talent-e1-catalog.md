# TALENT-E1: ordinary WdS talent catalog

`js/dsa41/talent-core.js` exports the frozen `ORDINARY_TALENTS` catalog.
`CORE_TALENTS` remains an alias to the same array. All existing lookup/resolution
functions keep their signatures and custom-catalog arguments.

## Coverage and source

Source: **Wege des Schwerts, DSA 4.1, 2nd edition 2011**, printed pp. 19–41
(talent descriptions), pp. 193–195 (inventory), pp. 13–14 (substitution rules).
The 105 entries match the ordinary five-group inventory, including 25 basic
and 80 special talents:

| Group constant | Value | Talents |
| --- | --- | ---: |
| `TALENT_GROUP.PHYSICAL` | `physical` | 18 |
| `TALENT_GROUP.SOCIAL` | `social` | 10 |
| `TALENT_GROUP.NATURE` | `nature` | 7 |
| `TALENT_GROUP.KNOWLEDGE` | `knowledge` | 23 |
| `TALENT_GROUP.CRAFT` | `craft` | 47 |

Every entry has `name`, `aliases`, `group`, the existing lowercase `type`
(`basic` / `special`), `defaultAttributes`, `encumbranceRule`,
`encumbranceVariants`, `substitutes` and `resolutionMode: 'TALENT'`.
`RESOLUTION_MODE.PROFICIENCY` and `.COMBAT` are reserved constants only.
The ordinary resolver rejects an explicitly different resolution mode.
Custom catalogs without this new field retain their existing behavior.

Aliases cover the prior `Sinnesschärfe` spelling, WdS abbreviations and existing
HeldenMobil name variants (e.g. `Brettspiel`, `Kristallzüchter`, `Geografie`,
`Heilkunde: Wunden`). Case and outer whitespace remain normalized by the
existing lookup; no fuzzy matching or inferred specialization is introduced.

`Sprachenkunde` is the ordinary knowledge talent about languages; it does not
add language/script proficiency handling. Individual languages, scripts, combat
talents, gifts and ritual/liturgy knowledge are outside this catalog.

## Resolution invariants

- Attribute precedence: explicit request `context.talent.attributeOverride`,
  then HLD `probe`, then catalog `defaultAttributes`. Advisory attributes do
  not become overrides. Situational alternative triples are not auto-selected.
- HLD `be` retains precedence over the catalog eBE formula.
- Every `TALENT` request accepts the existing numeric request modifier: positive
  values are difficulty, negative values are relief and zero is neutral. This
  external modifier is independent of catalog metadata and composes additively
  with any deterministic eBE.
- Negative basic TaW remains checkable. Missing basic values remain unavailable.
- Missing and negative special talents remain unsupported, before any dice;
  a specialization or possible substitute does not activate them.
- Listed WdS advancement prerequisites are not check gates. No AP, advancement,
  prerequisite-validation or accumulated-check subsystem is added.
- `EXTENDED` requests in the `dsa41-v1` provider are rejected before dice.
  Legacy checks, spells and liturgies keep their existing resolver paths.

## Encumbrance

`encumbranceRule` is the deterministic fallback formula consumed by the existing
parser (`null`, `BE`, `BE*2`, `BE-2`, `BE-3`, `BE-4`). `null` means that the
catalog applies no automatic eBE; it does not prohibit a situational modifier.

Conditional WdS formulas are recorded separately as frozen
`encumbranceVariants: [{rule, condition}]`; explanations without a fixed formula
use `encumbranceNote`. Neither is automatically applied. For example:

- Sinnenschärfe can be impaired up to BE; its established automatic fallback
  stays zero (p. 21; the overview also lists no fixed eBE).
- Fesseln/Entfesseln distinguishes tying from escaping; Fischen/Angeln depends
  on the particular fishing activity (p. 26).
- Überreden is an explicit HeldenMobil project-rule deviation from WdS:
  neither the situational BE-4 nor the BE*2 case for begging in visible armor
  is modeled or applied. Its Golden expectation is therefore
  `encumbranceRule: null` and `encumbranceVariants: []`.
- Schauspielerei, Sich Verkleiden, Wildnisleben and handwork require situational
  assessment. WdS pp. 32–33 provide no universal formula for handwork.

An explicit HLD eBE or external request modifier supplies a chosen situational
penalty using the existing contract. A requested specialization alone never
selects an eBE variant.

## Substitution metadata

Each substitute is `{talent, penalty, specialization?, condition?}`. `talent`
always refers to a canonical E1 entry. `specialization` describes a required
specialization of the replacement talent; `condition` preserves a restriction
such as escaping bonds or constructing crossbows. Source-listed alternatives
still require the GM to judge whether the application is appropriate.

`substitutionOptions` keeps its existing present-in-HLD filtering and only
reports candidates. It does not establish eligibility, select a substitute,
change the TaW, apply a substitution penalty, activate a talent or roll dice.
The provider preserves optional specialization/condition fields in result
metadata. Existing `{talent, penalty}` records remain unchanged.

Where WdS lists a possible alternative without specifying a numerical penalty
(Rechnen, Menschenkenntnis and Tierkunde for Kriegskunst, p. 28), `penalty` is
explicitly `null`, with an explanatory condition. It must not be read as zero;
the GM must supply a modifier if that alternative is explicitly requested.

The ordinary catalog intentionally omits references to the used language
(Schriftlicher Ausdruck), Ringen-PA (Fesseln/Entfesseln) and the Prophezeien gift
(Sternkunde). They are not E1 talents. The open-ended reference to suitable
subject-specific talents for Geschichtswissen is not expanded into invented
automatic alternatives.

## Source reconciliation

The detailed entries determine names and substitution penalties when the
compressed overview is incomplete:

- `Brett-/Kartenspiel` (p. 27), with overview `Brettspiel` as an alias.
- `Feuersteinbearbeitung`: KL/FF/FF (p. 35); the overview's `LK` is a typo.
- `Stellmacher`: Zimmermann +10 (p. 40), absent from the overview.
- Fesseln/Entfesseln includes the conditional Gaukeleien alternative from p. 26.
- `Steinschneider`/`Juwelier`, `Kristallzüchter` and `Fesseln` references resolve
  to their full canonical talent names.
- Fährtensuchen retains KL/IN/KO as its standard triple (p. 25). The alternative
  KL/IN/IN remains available through HLD `probe` or an explicit override.

## Verification

`node tests/talent-e1.mjs` keeps the behavioral/provider regression coverage.
`node tests/talent-e1-golden.mjs` adds a separate static Golden matrix sourced
from WdS rather than from the production catalog. It compares all 105 entries
for canonical name, aliases, group, basic/special type, default attribute triple,
eBE metadata, substitutes with penalties/specializations/conditions, stable
`talent.*` key and `resolutionMode: 'TALENT'`. The Golden test also mutates one
representative field of every protected metadata class and proves that the
comparison rejects each mutation.

Both suites are part of `npm test`, the complete HeldenMobil Lab CI command.
Shared Maze, deployment, languages/scripts, combat resolution and E2/E3/E4
are unchanged by this work.

