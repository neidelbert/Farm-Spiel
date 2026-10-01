# FS-017 – Camera Stabilization

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`df3ce739098fc1d811df465673bf5628cb223f36`

## Version
`0.3.0-dev`

## Ziel
Die mobile Kamera- und Touch-Steuerung stabilisieren, ohne Welt, Renderer oder Gameplay zu verändern.

## Was ändert sich im Spiel?
Ein Finger verschiebt die Karte frei und ohne Sprünge. Zwei Finger zoomen stufenlos und halten den Bildinhalt stabil unter den Fingern. Beim Wechsel zwischen Ein- und Zwei-Finger-Gesten springt die Kamera nicht mehr. An den Weltgrenzen stoppt die Trägheit sauber.

## Geänderte Source-Dateien
- `src/world/camera.js`
- `src/world/input.js`

## Neue Tests
- `tests/camera.test.js`
- `tests/input.test.js`

## Technische Anforderungen
- Ein-Finger-Pan bleibt frei und direkt.
- Zwei-Finger-Pinch nutzt inkrementelle Distanzänderungen statt dauerhaft die Startdistanz.
- Pinch-Zoom wird um den vorherigen Mittelpunkt verankert; danach wird der Mittelpunkt auf die neue Fingerposition verschoben.
- Zweiter Finger darf beim Aufsetzen keinen Kamerasprung verursachen.
- Nach dem Lösen eines Fingers wird der verbleibende Finger neu verankert.
- Dritter gleichzeitiger Pointer wird ignoriert, damit Pinch-Anker stabil bleiben.
- Pointer-Cancel erzeugt weder Tap noch Fling.
- Tap-Erkennung berücksichtigt die gesamte zurückgelegte Fingerstrecke, nicht nur Start- und Endpunkt.
- Fling-Geschwindigkeit wird leicht geglättet.
- Nach längerem Stillhalten vor Loslassen entsteht kein Fling.
- Große Frame-Gaps werden begrenzt, damit die Kamera nach Hängern nicht springt.
- Trägheit wird beim Erreichen einer Weltgrenze auf der betroffenen Achse gestoppt.
- Effektiver Minimalzoom wird an Viewport und Weltgröße angepasst, sodass keine Fläche außerhalb der Welt sichtbar werden muss.
- Bestehender Maximalzoom bleibt unverändert.
- `focus()` stoppt Trägheit und bleibt innerhalb der Welt.
- Bestehendes CSS `touch-action: none` bleibt unverändert.
- Keine Änderung an Weltgröße, Renderer, Objektpositionen, Gameplay, Economy oder Save-State.

## Bewusst nicht umgesetzt
- keine neue Kartenfläche
- keine Welt-/Map-Grafikänderung
- kein Edge-Fade
- keine Änderung an Objektpositionen
- keine neue Kamera-UI
- keine Gameplay- oder Save-Änderung

## Tests vor Payload
JavaScript-Syntax:
`PASS`
- `src/world/camera.js`
- `src/world/input.js`
- `tests/camera.test.js`
- `tests/input.test.js`

Kamera-/Input-Fokustests:
`PASS` – 15/15 Subtests

Vollständige Repository-Test-Suite:
`NOT TESTED` – wird vom GitHub Ticket Installer ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch auf echtem iPhone:
`NOT TESTED`

## Commit-Nachricht
`FS-017: Stabilize mobile camera gestures`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

Das Folgeticket darf erst nach separatem ChatGPT-Review gestartet werden.
