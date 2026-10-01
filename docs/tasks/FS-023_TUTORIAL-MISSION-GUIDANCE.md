# FS-023 – Tutorial Mission Guidance

## Status
`APPROVED`

## Ausgangs-SHA
`d72584ec0a647acd6a430d87faf0907420270c7e`

## Ziel
Das aktuelle Tutorialziel als eindeutigen Weltmarker sichtbar machen, ohne Gameplay oder Wirtschaft zu verändern.

## Im Spiel
Über dem aktuell wichtigen Feld oder Gebäude erscheint ein gut sichtbarer, pulsierender Stern mit kurzer Bezeichnung wie `Feld 1`, `Silo`, `Mühle`, `Werkstatt`, `Hühner` oder `Bäcker`. Der Marker wandert mit dem Tutorialfortschritt automatisch zum nächsten relevanten Ort.

## Technik
- Neue reine Zielauflösung in `TutorialGuidance`.
- Missionsschritte und vorhandene Spielzustände bestimmen den Zielort.
- Tutorialmarker bleibt unabhängig vom Zoom gut lesbar.
- Bestehende Produktions-/Feld-Eventicons bleiben erhalten.
- Kein automatisches Kameraspringen und keine Änderung an Spieleraktionen.
- Keine Änderung an Preisen, Erträgen, Timern, Save-Schema oder Freischaltungen.

## Tests
Lokaler FS-023-Fokus: `PASS` – 10/10.
Vollständige Repository-Suite: `PASS` – 177/177 Tests, 21 Testdateien.
Browser / Gerät / Touch: `NOT TESTED`.

## Commit
`FS-023: Add tutorial world guidance`

## STOP
Nach erfolgreichem Commit: `READY_FOR_REVIEW`.

## Review
`APPROVED` by ChatGPT

Implementierungs-Commit:
`2ec0e91105263767729d540a65ad7203a2c29206`

Commit-Struktur, Zielauflösung, World-UI-Integration, Renderer-Kompatibilität und Regressionstests geprüft.
Browser / Gerät / Touch bleibt `NOT TESTED`.
