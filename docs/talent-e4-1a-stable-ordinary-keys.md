# TALENT-E4.1a – Stable Ordinary Talent Keys

E4.1a gives every one of the 105 ordinary E1 talents an explicit stable
technical identity in the `talent.*` namespace.

The key is stored directly in the catalog definition. It is not generated from
the display name at runtime. Canonical names and existing aliases remain valid
lookup inputs, so HLD data stays name-based and requires no migration.

Examples:

- `Sinnenschärfe` / `Sinnesschärfe` -> `talent.sinnenschaerfe`
- `Schlösser Knacken` -> `talent.schloesser-knacken`
- `Körperbeherrschung` -> `talent.koerperbeherrschung`
- `Götter/Kulte` -> `talent.goetter-kulte`

For known E1 talents, `HeroSnapshotV1.talents[*].key` now exposes the stable
key while `name` remains the canonical human-readable talent name. Unknown
legacy HLD rows keep their existing name as key/name.

A DSA41 `CheckRequestV1` may address an ordinary talent by stable key,
canonical name, or exact existing alias. All routes use the same existing
TALENT resolver. No talent mechanics, HLD parser behavior, E2 proficiency
semantics, E3 combat semantics, AP rules, substitutions, or EXTENDED checks are
added here.

Shared Maze is intentionally untouched; E4.1b consumes these keys later.
