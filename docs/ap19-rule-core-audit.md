# AP19.0 – DSA 4.1 Rule-Core Audit & Reuse-Matrix

Stand: 2026-09-14

## Ziel

Dieses Dokument legt fest, welche vorhandenen DSA-4.1-Regelimplementierungen für den künftigen HeldenMobil-Rule-Core verwendet werden und welche nicht. Es ist die technische und lizenzielle Grundlage für AP19.1.

Der neue Rule-Core entsteht **nur im isolierten `heldenmobil-lab`**. Das produktive `Heldenmobil` bleibt unverändert. Shared Maze erhält später ausschließlich versionierte Bridge-Verträge und keinen eigenen DSA-Regelmonolithen.

## Verbindliche Leitplanken

1. **Regelwahrheit kommt aus den DSA-4.1-Regelwerken.** Fremdcode ist Implementierungs- und Testreferenz, nicht Regelautorität.
2. **Vorhandenes funktionierendes HeldenMobil-Verhalten wird nicht blind ersetzt.** Eine fremde Implementierung muss nachweislich mindestens gleich korrekt und testbar sein.
3. **Nur reine Regelalgorithmen gehören in den Rule-Core.** Foundry-, WPF-, DOM-, Chat-, Actor- oder UI-Abhängigkeiten bleiben draußen.
4. **Kein Regeltext-/Datenbank-Scraping.** Lizenzierbarer Quellcode ist etwas anderes als urheberrechtlich geschützte Regeltexte, Tabellen, Illustrationen und Kompendiumsdaten.
5. **Jede übernommene oder adaptierte Implementierung bekommt Attribution.** Vor dem ersten übernommenen Code wird `THIRD_PARTY_NOTICES.md` verbindlich ergänzt.
6. **Unmodellierte Sonderfälle bleiben SL-bestätigt.** Ziel ist ein belastbarer Spieltischkern, kein vollständiger Nachbau aller DSA-4.1-Bände.

## Geprüfte Quellen

| Quelle | Lizenzstatus | Rolle in AP19 | Entscheidung |
| --- | --- | --- | --- |
| `Constructor0987/MeisterGeister` | MIT, verifiziert über `LICENSE.md` | umfangreichste Regel- und Regressionstest-Referenz | **portieren / Test-Orakel** |
| `GeanoFeeFoundry/geanos-gdsa-qol` | MIT, verifiziert über `LICENSE` | modernes JS, AT/PA, Manöver, AsP/MR-Workflows | **selektiv adaptieren / Referenz** |
| `Roll20/roll20-character-sheets/Das_Schwarze_Auge_4-1` | MIT auf Repository-Ebene, verifiziert über Root-`LICENSE` | dokumentierte Formeln und Gegenprüfung | **Referenz / Fixtures** |
| Foundry VTT DSA 4.1 Core | System vorhanden und aktiv gepflegt; Lizenz des Core-Repos in diesem Audit noch nicht separat verifiziert | Web-/Datenmodell- und Architekturvergleich | **nur Referenz bis Lizenzprüfung** |
| Foundry DSA 4.1 Importer | Apache-2.0, verifiziert | Import-/Heldendaten-Architekturvergleich | **Referenz** |
| Goody's DSA 4.1 Core | Distribution erlaubt, Modifikation/Sublicensing ausdrücklich untersagt | funktionale Vergleichsreferenz | **kein Code-Reuse** |

### Primärlinks

- MeisterGeister: https://github.com/Constructor0987/MeisterGeister
- Geano GDSA QoL: https://github.com/GeanoFeeFoundry/geanos-gdsa-qol
- Roll20 DSA 4.1 Sheet: https://github.com/Roll20/roll20-character-sheets/tree/master/Das_Schwarze_Auge_4-1
- Foundry DSA 4.1 System: https://gitlab.com/foundry-vtt-dsa/dsa-4.1-core/dsa-4.1-system
- Foundry DSA 4.1 Importer: https://gitlab.com/foundry-vtt-dsa/dsa-4.1-core/dsa-4.1-importer
- Goody's DSA 4.1 Core: https://github.com/Thegoodmen/Goodys-DSA-4.1-System

## Bestehender HeldenMobil-Stand

HeldenMobil besitzt bereits mehr Rule-Core-Vorarbeit als zunächst angenommen.

### Bereits rein bzw. fast rein gekapselt

`js/combat-core.js` enthält heute:

- `combatEbe(talent, be, combatMeta)`
- `adjustCombatForBE(at, pa, ebe)`
- `finalDamage(tp, tpkk, kk)` für TP/KK
- `zoneFromD20(r)`

Diese Funktionen bleiben Ausgangspunkt und werden in AP19.1 nicht unnötig neu erfunden.

### Noch im UI-Monolithen

`js/app.js` enthält bereits strukturierte 3W20-Requests über `rollPayloadForThreePart(...)` und eine tatsächliche `check3`-Auswertung für Talent-, Zauber- und Liturgieproben.

Wichtige Beobachtung: Die vorhandene HeldenMobil-Logik behandelt einen **negativen effektiven TaW/ZfW** bereits nach der DSA-4.1-Regel: Der negative Wert senkt jede der drei geprüften Eigenschaften. Diese Logik ist damit in diesem Punkt korrekter als Geanos kompakte `rollTalentProbe()`-Implementierung.

Außerdem erzwingt HeldenMobil bei einer gelungenen offenen 3W20-Probe mindestens 1 TaP*/ZfP*. Das entspricht der Regel für offene Talentproben und den MeisterGeister-Regressionstests.

## Reuse-Matrix

Legende:

- **BEHALTEN/REFACTOR** – vorhandene HeldenMobil-Logik in reines Modul ziehen.
- **PORTIEREN** – fremde, lizenzkompatible Kernlogik sinngemäß nach JavaScript übertragen und attribuieren.
- **ADAPTIEREN** – kleine lizenzkompatible Teile übernehmen, aber von Framework-Abhängigkeiten befreien.
- **REFERENZ** – Verhalten/Testfall vergleichen, keinen Laufzeitcode übernehmen.
- **SELBST BAUEN** – anhand der offiziellen Regel und Tests eine neue reine Implementierung erstellen.

| Regelbereich | HeldenMobil heute | Beste externe Quelle | Entscheidung AP19.1 | Konkrete Quelle / Begründung | Pflicht-Regressionen |
| --- | --- | --- | --- | --- | --- |
| Zufallswürfel / Dice API | UI-nahe Würfelfunktionen | Geano `scripts/roll-engine.js` | **SELBST BAUEN**, Geano Referenz | kleine injizierbare Dice-API, damit alle Regeltests deterministisch laufen | W20/W6-Grenzen, injizierte Würfe, keine DOM-Abhängigkeit |
| Eigenschaftsprobe W20 | vorhanden | Geano `rollStat()` + WdS | **REFACTOR** | simpel und bereits benötigt; Modifikator-Semantik zentral vereinheitlichen | Wert 10 mit 10 Erfolg, 11 Misserfolg; positive Erschwernis senkt Zielwert |
| 3W20 Talentprobe | in `app.js`, bereits brauchbar | MeisterGeister `Logic/General/Probe.cs`, `Probe_Tests.cs`; Roll20 `formulas.md` | **BEHALTEN/REFACTOR + MeisterGeister-Fixtures** | MeisterGeister hat umfangreiche TaW-/Modifikatorfälle; Roll20 bestätigt Negativwert-Logik | TaW 0; positiver TaW; Erschwernis; Erleichterung; negativer effektiver TaW; min. 1 TaP*; Doppel-/Dreifach-1/20 |
| 3W20 Zauberprobe | generischer `check3` vorhanden | WdZ + MeisterGeister `ZauberProbe`; Roll20 | **auf gemeinsamen Check-Core aufsetzen** | Zauberprobe benutzt dieselbe 3W20-Grundmechanik, benötigt aber eigene Kontextmodifikatoren/Kosten | negativer ZfW; MR als Zuschlag VOR der Probe; Doppel-/Dreifach-1/20; ZfP*-Cap |
| Liturgie-/Ritualkenntnisprobe | generischer `check3` vorhanden | aktuelles HM + spätere WdG-Prüfung | **REFACTOR, vorerst minimal** | gleiche technische 3W20-Engine, aber keine pauschale Vollautomatisierung aller karmalen Sonderregeln | LkW-Probe + Modifikator + Ergebnisvertrag |
| Kritischer Erfolg / Patzer bei 3W20 | vorhanden | MeisterGeister `Probe.cs`; Roll20 | **BEHALTEN/REFACTOR** | zwei 1en/20en und drei 1en/20en als getrennte Resultatklasse modellieren | 2×1, 3×1, 2×20, 3×20; normale Würfe unverändert |
| AT / PA Grundwurf | bisher überwiegend UI-W20 | Geano `rollD20Attack/Defense`; WdS | **ADAPTIEREN** | kleine JS-Funktionen sind gut trennbar; Bestätigungswurf als expliziter zweiter Schritt | AT≤Ziel, PA≤Ziel, 1/20, Modifikatoren, bestätigter/unbestätigter Krit/Patzer |
| AT-/PA-Patzer und glückliche Aktionen | nicht als Core modelliert | Geano + WdS | **ADAPTIEREN + OFFIZIELL KORRIGIEREN** | Geanos Flow ist brauchbar, Regelentscheidung kommt aus WdS | 1 muss bestätigt werden; AT-20 verfehlt immer; bestätigter Patzer getrennt von bloßem Fehlschlag |
| eBE und AT/PA-Abzug | `combatEbe`, `adjustCombatForBE` | eigenes Modul + WdS | **BEHALTEN** | vorhandene reine Logik deckt Kernfall ab | ungerade eBE: größerer Abzug auf PA; eBE ≤0 ohne Abzug |
| TP/KK | `finalDamage()` | eigenes Modul + MeisterGeister `TPKKTests` | **BEHALTEN + Fixtures ergänzen** | MeisterGeister besitzt klare Schwellen-/Schritt-Regressionen | unter Schwelle, Schwelle, mehrere Schritte über Schwelle |
| TP → RS → SP | nicht als eigenständiger Core-Schritt | WdS; Geano Damage-Flow nur Referenz | **SELBST BAUEN** | `SP = max(0, TP - RS)` muss reine Funktion sein; Foundry-Targetcode ist ungeeignet | RS 0; RS < TP; RS = TP; RS > TP; direkte SP umgehen RS |
| TP(A) / SP(A) | nicht sauber gekapselt | WdS | **SELBST BAUEN, optionaler Regelblock** | muss von normalem TP/SP getrennt bleiben | RS-Abzug, AU-Verlust, halbe SP(A) als echte SP |
| Wundschwellen / Wundanzahl | UI-/Statusdaten vorhanden, kein vollständiger Core | WdS; MeisterGeister als Vergleich | **SELBST BAUEN + MG-Gegenprobe** | Schwellen hängen von KO, Eisern/Glasknochen und Angriffsmodifikator ab | KO/2, >KO, >1,5×KO; ±2 WS; kumulative Modifikatoren |
| Wundfolgen | manuell verwaltet | WdS; MeisterGeister | **SELBST BAUEN als Modifier-Layer, nicht automatisch persistieren** | HeldenMobil soll Werte berechnen können, aber bestehende manuelle Wundverwaltung nicht heimlich überschreiben | pro Wunde AT/PA/FK/INI-Basis/GE/GS; Ignorieren als explizite Option |
| Niedrige LE/AU | teilweise Statusanzeige | WdS | **SELBST BAUEN als Modifier-Layer** | zentraler Kontextmodifikator verhindert verstreute Sonderlogik | LE <1/2, <1/3, <1/4; kumulativ mit AU; Kampfrausch/Blutrausch später als Capability |
| Trefferzonen | `zoneFromD20()` vorhanden | eigenes Modul + WdS | **BEHALTEN**, später erweitern | Zuordnung ist bereits rein; zonenspezifische Wundfolgen bleiben separater Layer | 1..20 vollständig und ohne Lücken |
| Initiative-Grundablauf | UI vorhanden, kein Rule-Core-Orchestrator | MeisterGeister `Kampf_Tests.cs` | **REFERENZ / später AP23** | Reihenfolge und Aktionsökonomie gehören zum Encounter-Orchestrator, nicht in AP19.1-Basis | Sortierung, Gleichstandspolitik explizit, keine Foundry/WPF-Abhängigkeit |
| Wuchtschlag | noch nicht als Core | Geano `active-sf.js` + WdS | **ADAPTIEREN, aber regelgetrieben neu schneiden** | Manöver soll nur Modifikatoren/Effekte liefern, nicht selbst UI/Actor verändern | Ansage-Grenzen; AT-Erschwernis; TP-Bonus; mit/ohne SF; misslungene Ansage |
| Finte | noch nicht als Core | Geano `active-sf.js` + WdS | **ADAPTIEREN** | als `CombatModifier` modellieren, der gegnerische PA beeinflusst | Ansage, PA-Erschwernis, Kombination mit anderem Manöver |
| Gezielter Stich / Todesstoß | noch nicht | Geano + WdS | **REFERENZ → später ADAPTIEREN** | starke Wechselwirkung mit RS/Wundschwelle; erst nach Damage/Wound-Core | RS/WS-Modifikation, Voraussetzungen, Kombinationen |
| Hammerschlag / Niederwerfen / Doppelangriff | noch nicht | Geano + MeisterGeister | **REFERENZ → AP23-Ausbau** | nicht nötig für ersten Rule-Core-Durchstich | jeweils isolierte Manöver-Fixtures vor Aktivierung |
| Zauberkosten bei Erfolg/Misserfolg | noch nicht als Core | WdZ; Geano `asp-tracker.js` | **SELBST BAUEN, Geano als Flow-Referenz** | WdZ: Erfolg volle Kosten; Misserfolg üblicherweise Hälfte, Hexe Drittel; aufrunden. Geano mischt Regel und HTML-Parsing, daher nicht direkt übernehmen | gerade/ungerade Kosten; Fehlschlag; Hexe; Mindest-/Sonderkosten separat |
| MR bei Zaubern | noch nicht zentral | WdZ; Geano `mr-tracker.js` | **SELBST BAUEN – Geano NICHT übernehmen** | offizielles DSA: MR ist Zuschlag auf die Zauberprobe. Geano zieht MR erst nach erfolgreicher Probe von ZfP* ab; das ist für unseren Core nicht regelgleich | MR 0; MR < ZfW; MR > ZfW erzeugt negativen effektiven ZfW und erschwert alle drei Teilproben |
| AsP/KaP Ressourcenmutation | Companion-/Statussystem vorhanden | Geano `asp-tracker.js` | **ADAPTIEREN als Transaktionsmuster, nicht als Regelquelle** | ResourceDelta muss Ergebnis einer Regelentscheidung sein, nicht DOM/Chattext auswerten | Kostenberechnung getrennt von Persistenz; niemals unter 0; Vorschau → Bestätigung → Commit |
| Zauber-/Liturgieeffekte | noch weitgehend Anzeige/Handarbeit | Liber Cantiones/WdZ; Foundry/Geano als UX-Referenz | **NICHT in AP19.1 vollautomatisieren** | spell-specific Effekte gehören später AP24; Rule-Core liefert Probe, Kosten und generische Effects | erst Testzauber in AP24 |
| Zustände/Buffs/Debuffs | teilweise Companion-Status | MeisterGeister / Geano Effects | **SELBST BAUEN als generisches Modifier-Modell** | fremde Framework-Effektmodelle nicht importieren | Quelle, Dauer, Zielwert, Stapelregel, Entfernen ohne Seiteneffekte |
| Fernkampf | noch kein eigener Rule-Core | WdS, MeisterGeister | **späterer Slice** | nicht erforderlich für AP19.1-MVP, aber Schnittstellen dürfen ihn nicht verhindern | Modifikatoren/Entfernung/Ladezeit erst nach Nahkampf-Grundkern |

## Drei zentrale Audit-Funde

### 1. Der HeldenMobil-3W20-Kern ist erhaltenswert

Die aktuelle `check3`-Logik muss aus `app.js` heraus, aber nicht ersetzt werden. Sie deckt bereits den wichtigsten Stolperstein korrekt ab: Fällt TaW/ZfW nach Modifikatoren unter 0, wird der negative Betrag auf **jede** der drei Eigenschaften angewandt.

Das entspricht WdS/WdZ und den MeisterGeister-Tests. Geanos `rollTalentProbe()` summiert dagegen lediglich Defizite gegen die unveränderten Eigenschaften und verrechnet anschließend `TaW + modifier`; diese kompakte Variante bildet negative effektive Werte nicht regelgleich ab.

**Folge:** AP19.1 extrahiert und testet unsere Logik; Geano ist hierfür nicht die Implementierungsbasis.

### 2. Geanos MR-Tracker ist für unseren Rule-Core fachlich ungeeignet

`scripts/mr-tracker.js` nimmt eine bereits erfolgreiche Zauberprobe und zieht anschließend MR von den erzielten ZfP* ab. Die offizielle DSA-4.1-Regel behandelt MR dagegen als **Erschwernis der Zauberprobe selbst**.

Das ist nicht nur eine Darstellungsfrage: Wenn MR den effektiven ZfW unter 0 drückt, müssen alle drei Teilproben entsprechend erschwert werden. Eine nachträgliche Subtraktion der ZfP* kann andere Ergebnisse erzeugen.

**Folge:** MR wird in AP19.1 als normaler `CheckModifier` vor dem Würfeln modelliert. Geanos Code wird dafür nicht übernommen.

### 3. MeisterGeister ist vor allem wegen seiner Tests Gold wert

`Logic/General/Probe.cs` besitzt einen ausgereiften generischen Probenalgorithmus. Noch wertvoller für uns ist `MeisterGeister_Tests/Probe_Tests.cs`: Dort sind konkrete Erwartungswerte für TaW 0, positive/negative TaW, Erschwernisse, Erleichterungen und kritische Ergebnisse festgehalten.

`MeisterGeister_Tests/Kampf_Tests.cs` liefert zusätzlich u. a. TP/KK- und Initiative-Beispiele.

**Folge:** Wir portieren nicht den C#-Objektgraphen. Wir übertragen ausgewählte Testvektoren als JS-Fixtures und implementieren den kleineren browserunabhängigen Kern dagegen.

## Zielarchitektur AP19.1

Vorgesehen ist folgende Modulgrenze:

```text
js/dsa41/
  dice-core.js
  check-core.js
  combat-core.js
  damage-core.js
  wound-core.js
  maneuver-core.js
  modifier-core.js
  magic-core.js
```

### `dice-core.js`

- W20/W6 und Formelauswertung,
- injizierbare RNG-/Fixture-Quelle,
- keine DOM-Ausgabe.

### `check-core.js`

- Eigenschaftsprobe,
- generische 3W20-Probe,
- Talent/ZfW/LkW nur als semantische Labels,
- Modifikatoren,
- TaP*/ZfP*/LkP*,
- Krit/Patzer.

### `combat-core.js`

Das bestehende `js/combat-core.js` wird schrittweise integriert statt dupliziert:

- eBE,
- AT/PA-Zielwerte,
- TP/KK,
- Trefferzone,
- reine Kampfwertberechnung.

### `damage-core.js`

- TP/RS/SP,
- direkte SP,
- TP(A)/SP(A) als optionaler Regelpfad,
- keine Persistenz.

### `wound-core.js`

- Wundschwellen,
- Wundanzahl pro Treffer,
- berechnete Wundmodifikatoren,
- keine automatische Manipulation des Companion-Spielstands.

### `maneuver-core.js`

Ein Manöver liefert ausschließlich deklarative Änderungen, z. B.:

```js
{
  attackModifier: -4,
  defenseModifier: 0,
  damageBonus: 4,
  woundThresholdModifier: 0,
  resourceCosts: { AuP: 1 },
  followUps: []
}
```

UI, Zielauswahl und Persistenz liegen außerhalb des Rule-Cores.

### `modifier-core.js`

Zentrale, nachvollziehbare Modifikator-Pipeline für:

- Situation,
- niedrige LE/AU,
- Wunden,
- BE/eBE,
- MR,
- aufrechterhaltene Zauber,
- Manöver,
- SL-Modifikator.

Jeder Modifikator trägt Quelle und Begründung; keine versteckten Zahlen in UI-Code.

### `magic-core.js`

AP19.1 bleibt bewusst klein:

- Zauberprobe über `check-core`,
- MR als Check-Modifikator,
- AsP-Kosten bei Erfolg/Misserfolg,
- ResourceDelta-Vorschau.

Konkrete Spruchwirkungen bleiben AP24.

## Teststrategie AP19.1

### A. Offizielle Regel-Fixtures

Aus den vorhandenen Regelwerken werden **nur Zahlenfälle/Erwartungen**, keine längeren Regeltexte übernommen.

Pflichtquellen:

- Wege des Schwertes, insbesondere Talentprobe, offene Probe, Kampfgrundlagen, TP/RS/SP, Wunden, Kampfmanöver, Krit/Patzer.
- Wege der Zauberei, insbesondere Zauberprobe, negative effektive ZfP, MR, AsP-Kosten.
- Liber Cantiones nur für konkrete spätere Zauber-Fixtures.

### B. MeisterGeister-Fixtures

Aus `Probe_Tests.cs` mindestens:

- TaW 0 / Mod 0 / Werte 10-10-10 / Würfe 10-10-10 → gelungen, mindestens 1 TaP*.
- TaW 4 / Werte 10-10-10 / Würfe 4-12-8 → 2 TaP*.
- TaW -2 / Werte 10-10-10 / Würfe 10-10-10 → misslungen.
- TaW -2 / Werte 10-10-10 / Würfe 7-7-6 → gelungen.
- TaW 0 / Mod +2 / Werte 10-10-10 / Würfe 6-8-8 → gelungen.
- starke Erleichterung + Doppel-1 → glücklicher Erfolg.

Aus `Kampf_Tests.cs` mindestens die vorhandenen TP/KK-Schwellenfälle.

### C. Differentialtests

Für die Grundprobe sollen zwei unabhängige Referenzen übereinstimmen:

1. offizieller Regel-Fall,
2. MeisterGeister- oder Roll20-Erwartung,
3. unser JS-Core.

Bei Abweichungen gewinnt nicht automatisch die Fremdsoftware, sondern die offizielle Regelquelle.

## Lizenz-/Attributionsplan

Vor dem ersten übernommenen Code aus MIT-/Apache-Projekten wird `THIRD_PARTY_NOTICES.md` angelegt.

Mindestens festzuhalten:

- Projektname und Repository-URL,
- verwendete Commit-/Tag-Basis,
- Lizenz,
- Copyright-Hinweis,
- welche Datei/Funktion adaptiert wurde,
- welche Änderungen wir vorgenommen haben.

**Nicht übernehmen:** Regelbuchtext, Tabellen, Grafiken, Logos, Kompendiumsdaten oder andere Inhalte, deren Nutzbarkeit nicht durch die jeweilige Softwarelizenz gedeckt ist.

Goody's DSA 4.1 Core bleibt wegen des ausdrücklichen Änderungsverbots vollständig auf **Verhaltensvergleich / Referenz** beschränkt.

## AP19.1 – empfohlene Implementierungsreihenfolge

1. `dice-core.js` + deterministische Fixtures.
2. `check-core.js`: vorhandene HeldenMobil-3W20-Logik extrahieren.
3. MeisterGeister-/WdS-/WdZ-Regressionen gegen `check-core`.
4. bestehendes `combat-core.js` unter `dsa41/` integrieren bzw. kompatibel kapseln.
5. `damage-core.js`: TP → RS → SP und direkte SP.
6. `wound-core.js`: Schwellen und Modifier.
7. AT/PA-Krit-/Patzerfluss.
8. `maneuver-core.js`: zuerst Wuchtschlag + Finte.
9. `magic-core.js`: MR vor Probe + AsP-Kosten/ResourceDelta.
10. Erst danach Bridge-Vertrag AP19.2 festzurren.

## Done-Gate AP19.0

AP19.0 gilt als abgeschlossen, wenn:

- [x] aktuelle HeldenMobil-Regellogik inventarisiert ist,
- [x] MeisterGeister geprüft und Lizenz verifiziert ist,
- [x] Geano GDSA QoL geprüft und Lizenz verifiziert ist,
- [x] Roll20 DSA 4.1 Formeln geprüft und Repository-Lizenz verifiziert ist,
- [x] Foundry DSA 4.1 als Architektur-/Datenmodellquelle eingeordnet ist,
- [x] Goody aufgrund seiner Lizenz aus Code-Reuse ausgeschlossen ist,
- [x] offizielle WdS-/WdZ-Regeln gegen kritische Fremdimplementierungen gegengeprüft sind,
- [x] pro Kernbereich `BEHALTEN / PORTIEREN / ADAPTIEREN / REFERENZ / SELBST BAUEN` festgelegt ist,
- [x] AP19.1-Modul- und Testplan festgelegt ist,
- [ ] Review/PR dieses Audits abgeschlossen ist.

Nach Merge dieses Dokuments kann AP19.1 ohne erneute Grundsatzentscheidung beginnen.
