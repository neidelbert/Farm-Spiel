# FS-013 – Development Report

## Ticket
`FS-013` – Save Schema v2 / Migration Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`31b3166191ad6114804bb61392b17db84f2fd258`

## Ergebnis-SHA / Implementierungs-Commit
`PENDING_INSTALLER_RESULT`

Der exakte Commit-SHA wird erst vom freigegebenen GitHub Ticket Installer erzeugt und im Review ergänzt.

## Ergebnis
Das Save-System besitzt nun einen echten versionierten Migrationskern statt die Save-Version bei jedem Laden pauschal auf 1 zurückzusetzen.

Neu:
- `tests/save.test.js`
- `docs/tasks/FS-013_SAVE-SCHEMA-V2.md`
- `docs/reports/FS-013_REPORT.md`

Aktualisiert:
- `src/core/save.js`
- `docs/TASKS.md`

## Was ändert sich im Spiel?
Bestehende Spielstände werden kontrolliert auf Save-Schema v2 migriert. Der sichtbare Spielfortschritt soll dabei unverändert bleiben.

## Wichtige Änderungen
- `CURRENT_SAVE_VERSION` ist jetzt 2.
- `createInitialState()` erzeugt Save-v2-Spielstände.
- Ein expliziter Migrationspfad `v1 -> v2` wurde eingeführt.
- Spielstände ohne Versionsnummer werden als Legacy-v1 behandelt.
- Migrationen müssen ihre Version schrittweise erhöhen.
- Future-Saves werden nicht still heruntergestuft.
- `SaveManager.save()` schreibt immer die aktuelle Save- und Game-Version.
- Hauptsave und Backup werden unabhängig durch den Migrationskern geladen.
- Bestehender Backup-Mechanismus bleibt erhalten.
- Der LocalStorage-Key bleibt absichtlich unverändert.
- Visual-Migration bleibt bis FS-015 in `main.js`.

## Tests vor Installer-Ausführung
JavaScript-Syntax `src/core/save.js`:
`PASS`

JavaScript-Syntax `tests/save.test.js`:
`PASS`

Save-Migration-Core:
`PASS` – 9/9 Subtests

Vollständige vorhandene Repository-Test-Suite:
`NOT TESTED` – wird durch den Installer erneut ausgeführt.

GitHub Ticket Installer:
`NOT TESTED`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Probleme / Risiken
- Deep-Merge akzeptiert weiterhin zusätzliche unbekannte Felder; die strengere Save-Bereinigung gehört zu FS-014.
- Die Visual-Migration lebt weiterhin außerhalb des Save-Managers; das gehört zu FS-015.
- Der LocalStorage-Key enthält weiterhin `v1`, obwohl das interne Schema nun v2 ist. Er bleibt aus Kompatibilitätsgründen vorerst bestehen.

## Bewusst nicht umgesetzt
- keine vollständige Save-Härtung
- keine Visual-Migration-Zentralisierung
- keine Key-Migration
- keine Gameplay-Änderung

## Abschluss
Nach erfolgreichem Installer-Run wartet FS-013 auf ChatGPT-Review.
FS-014 wurde nicht begonnen.
