# TALENT-E2: language and script proficiency

TALENT-E2 adds the WdS language/script catalog without turning it into a normal
3W20 talent resolver. Requests continue to use `check.kind: talent`; stable
namespaced keys plus `resolutionMode: PROFICIENCY` select the separate
`proficiency-core.js` path.

## Catalog

Source: **Wege des Schwerts, DSA 4.1, 2nd edition 2011**, language/script rules
on printed pp. 30-32 and the appendix tables on printed pp. 196-197.

The registry contains 37 language definitions and 25 script definitions.
The WdS paired rows `Amulashtra (modern/historisch) 11/17` and
`Isdira / Asdharia 15/18` are represented as distinct canonical entries so
the stable keys match actual HLD abilities. Known HeldenSoftware spellings
such as `Urtulamidya`, `Alt-Imperial/Aureliani`,
`Gimaril-Glyphen` and `(Alt-)Imperiale Zeichen` are exact aliases only;
there is no fuzzy matching.

`Lesen/Schreiben Isdira/Asdharia` is a compatibility HLD form and projects
to both canonical script abilities in a snapshot. WdS-only special complexity
notes are retained as metadata where useful; the normal resolver uses the
canonical numeric complexity.

## Resolution

Language operations:

- `IDENTIFY`: 1
- `BASIC_COMMUNICATION`: 2
- `SIMPLE_SENTENCES`: 4
- `COMMON_GRAMMAR`: ceil(complexity / 3)
- `NATIVE_LIKE`: ceil(complexity / 2)

Script operations:

- `LETTER_RECOGNITION`: 1
- `SHORT_TEXT`: ceil(complexity / 3)
- `EVERYDAY_TEXT`: ceil(complexity / 2)
- `FULL_SCRIPT_MASTERY`: complexity

No dice are rolled. The HLD TaW stays the effective value. The scalar request
modifier changes the required threshold instead: positive values make the
requirement harder, negative values easier.

Missing operation, definition or hero proficiency fails closed before dice.
Sprachenkunde remains an ordinary E1 knowledge talent; E2 does not implement
learning/AP prerequisites or automatically couple reading a script to
understanding a language.

## UI and bridge

Recognized HLD language/script rows are not registered as normal 3W20 click
targets in HeldenMobil. HeroSnapshotV1 exposes them inside `talents` as
abilities with stable key, TaW, `attributes: []` and catalog complexity.
The public check kind remains `talent`; no Bridge V1 check-kind expansion was
needed.

Shared Maze, combat talents and TALENT-E3/E4 are unchanged.
