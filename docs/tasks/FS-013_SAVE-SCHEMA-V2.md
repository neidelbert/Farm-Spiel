# FS-013 – Save Schema v2 / Migration Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`31b3166191ad6114804bb61392b17db84f2fd258`

## Version
`0.3.0-dev`

## Ziel
Das bisherige implizite Save-Merging durch ein echtes versioniertes Save-Schema mit kontrollierter schrittweiser Migration ersetzen. Bestehende Spielstände aus Schema v1 müssen ohne Verlust des Spielerfortschritts auf Schema v2 geladen werden können.

## Was ändert sich im Spiel?
Für den Spieler ändert sich sichtbar fast nichts: vorhandene Spielstände werden beim Laden kontrolliert auf Save-Schema v2 angehoben, sodass spätere Updates sicherer auf bestehenden Spielständen aufbauen können.

## Geänderte Source-Dateien
- `src/core/save.js`

## Neue Tests
- `tests/save.test.js`

## Technische Anforderungen
- Zentrale Konstante `CURRENT_SAVE_VERSION = 2`.
- Neue Spielstände starten mit `saveVersion: 2`.
- Bestehende Save-v1-Spielstände werden explizit über eine Migration `v1 -> v2` geführt.
- Alte Spielstände ohne `saveVersion` werden als Legacy-v1 behandelt.
- Migrationen laufen schrittweise und müssen die Version tatsächlich erhöhen.
- Zukünftige, vom aktuellen Spiel unbekannte Save-Versionen dürfen nicht still auf v2 heruntergestuft werden.
- Ungültige Save-Versionen werden nicht still akzeptiert.
- Nach Migration wird weiterhin der aktuelle Default-State ergänzt, damit neue Felder vorhanden sind.
- Spielerfortschritt wie Level, Farmercoins, Mission, Inventar, Feldstatus und Fahrzeuge bleibt beim v1→v2-Laden erhalten.
- `SaveManager.save()` schreibt immer die aktuelle Save-Version und Game-Version.
- Der bestehende Backup-Mechanismus bleibt erhalten.
- Ist der Hauptsave inkompatibel, wird das Backup versucht.
- Sind Hauptsave und Backup unbrauchbar, wird kontrolliert ein neuer Spielstand erzeugt.
- Der bestehende LocalStorage-Key `farm-spiel-save-v1` wird bewusst noch nicht geändert, damit vorhandene iPhone-Spielstände weiterhin gefunden werden.
- Die bisherige Visual-Migration in `main.js` bleibt in FS-013 unverändert; ihre Zentralisierung gehört zu FS-015.

## Bewusst nicht umgesetzt
- keine strikte Entfernung unbekannter Save-Felder
- keine tiefe Typvalidierung aller Gameplay-Felder
- keine automatische Reparatur beliebig beschädigter Werte
- keine Änderung des LocalStorage-Keys
- keine Verschiebung der Visual-Migration aus `main.js`
- keine Gameplay-, Economy-, Feld-, Verkaufs- oder Renderer-Änderung

## Tests
Vor dem Payload lokal reproduziert:
- JavaScript-Syntax `src/core/save.js`: `PASS`
- JavaScript-Syntax `tests/save.test.js`: `PASS`
- Save-Migration-Core: 9/9 `PASS`

Die vollständige vorhandene Node-Test-Suite muss durch den Installer erneut ausgeführt werden.

Vollständige Repository-Test-Suite vor Installer:
`NOT TESTED`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-013: Introduce save schema v2 migrations`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

FS-014 darf erst nach separatem ChatGPT-Review von FS-013 gestartet werden.
