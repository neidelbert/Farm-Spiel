# Farm-Spiel – AI Developer Rules

## Zweck
Diese Regeln gelten für jede KI und jeden automatisierten Entwicklungsweg, der am Repository `neidelbert/Farm-Spiel` arbeitet.

Aktueller Entwicklungszweig:
`develop`

Produktname:
**Farm-Spiel**

---

# Rollen

## Lukas
Product Owner / Game Director.

Lukas entscheidet über:
- Spielidee
- gewünschte Funktionen
- Prioritäten
- Spielerlebnis
- Freigaben

## ChatGPT
Lead Developer / Architektur / Review.

Aufgaben:
- bestehenden Repository-Stand analysieren
- Tickets planen und konkret ausarbeiten
- vollständige Dateiänderungen vorbereiten
- sichere Ticket-Payloads erzeugen
- Architektur und Scope prüfen
- Commits und Workflow-Ergebnisse prüfen
- technische Risiken identifizieren
- Abnahmekriterien festlegen
- Review durchführen
- nächste Schritte planen

ChatGPT darf ein Folgeticket erst nach abgeschlossenem Review freigeben.

## GitHub Ticket Installer
Der Workflow `.github/workflows/farm-ticket-installer.yml` ist der freigegebene Ausführungsweg für Ticket-Payloads.

Aufgaben:
- Payload autorisieren und validieren
- erwarteten `develop`-Base-SHA prüfen
- ausschließlich deklarierte Dateien schreiben oder löschen
- Datei-Hashes prüfen
- freigegebene automatische Prüfungen ausführen
- vorhandene Node-Tests vor dem Push ausführen
- exakt einen Commit erzeugen
- nicht erzwungen auf `develop` pushen

Der Installer entscheidet nicht über Features oder Ticket-Inhalte.

## iPhone-Kurzbefehl
Der Kurzbefehl ist Transport- und Startwerkzeug.

Er darf:
- Payload-Datei auswählen oder empfangen
- Dateiinhalt als Text lesen
- den freigegebenen GitHub-Workflow per REST API starten
- den resultierenden Workflow-Run öffnen oder anzeigen

Der Kurzbefehl enthält keine fachliche Entwicklungslogik und ersetzt keine Installer-Prüfung.

## Perplexity / andere KI-Werkzeuge
Optional für Recherche oder unabhängige Verifikation.

Sie sind nicht automatisch der ausführende Entwickler und dürfen keine freigegebenen ChatGPT-Dateien eigenmächtig umschreiben, erweitern oder rekonstruieren.

---

# wichtigste Regel
Immer nur das aktuell freigegebene Ticket bearbeiten.

Keine Features nebenbei.
Keine spontanen Verbesserungen.
Keine Erweiterung des Tickets ohne Freigabe.

Wenn ein anderes Problem entdeckt wird:
1. dokumentieren
2. nicht ungefragt beheben
3. im Abschlussbericht nennen

---

# Git-Regeln

`main`
ist die stabile öffentliche Version und enthält außerdem die freigegebene Installer-Infrastruktur.

`baseline/0.2.0`
ist die unveränderliche Rückfallebene vor dem 0.3-Core-Rebuild.

`develop`
ist die Entwicklungsbasis für 0.3.

Die Baseline darf niemals für normale Entwicklung verändert werden.
Kein Force-Push.
Keine History-Rewrites.
Keine ungeprüften Resets.
Gameplay-Tickets werden nicht direkt auf `main` entwickelt.

---

# Ticket-Regeln

Gameplay- und Produkt-Tickets:
`FS-001`
`FS-002`
`FS-003`
usw.

Werkzeug-, Test- und Infrastruktur-Tickets:
`TOOLS-001`
`TOOLS-002`
usw.

`TOOLS`-Tickets dürfen keine versteckten Gameplay-Änderungen enthalten.

Ein Ticket muss mindestens enthalten:
- Ausgangslage
- Ziel
- erlaubte Dateien
- verbotene Änderungen
- technische Anforderungen
- Tests
- Commit-Nachricht
- STOP-Regel

Ein Installer-Payload muss auf dem aktuellen erwarteten `develop`-SHA basieren.
Bei Base-SHA-Abweichung wird nicht weitergearbeitet; stattdessen wird ein neuer Payload erzeugt.

---

# Status-System
Erlaubte Ticketstatus:

`PLANNED`
Ticket existiert, ist aber noch nicht freigegeben.

`READY`
Ticket darf umgesetzt werden.

`IN_PROGRESS`
Umsetzung läuft.

`READY_FOR_REVIEW`
Umsetzung abgeschlossen, wartet auf Review.

`CHANGES_REQUESTED`
Review hat Nachbesserungen verlangt.

`APPROVED`
Ticket wurde erfolgreich geprüft.

`BLOCKED`
Ticket kann technisch aktuell nicht abgeschlossen werden.

---

# Test-Regel

Tests dürfen ausschließlich mit folgenden Ergebnissen dokumentiert werden:

`PASS`
tatsächlich ausgeführt und erfolgreich.

`FAIL`
tatsächlich ausgeführt und fehlgeschlagen.

`NOT TESTED`
nicht zuverlässig ausführbar.

Niemals einen Test als PASS bezeichnen, wenn er nicht wirklich ausgeführt wurde.

Vor einem Installer-Push müssen mindestens:
- Payload-/Scope-Prüfung
- JavaScript-Syntax
- JSON-Validierung
- vorhandene Node-Tests

erfolgreich durchlaufen.

Browser-, Touch- und visuelle Tests bleiben separat, solange sie nicht zuverlässig automatisiert sind.

---

# Architektur-Regeln

Keine Komplett-Rewrites ohne eigenes freigegebenes Ticket.
Bestehende funktionierende Systeme zuerst verstehen.
Dann möglichst kleine, kontrollierte Änderungen durchführen.

Neue Fachlogik wird nicht weiter ungeplant in `Game.js` eingebaut.
Sie gehört in das zuständige Domain-System; `Game.js` soll primär koordinieren.

Renderer und UI dürfen Zustand darstellen und Aktionen auslösen, aber keine neue fachliche Quelle der Wahrheit werden.

---

# Daten-Regel

Langfristig soll jede wichtige Information genau eine zentrale Quelle besitzen.
Nicht dieselben Werte unabhängig in mehreren Dateien pflegen.

---

# Gameplay-Regel

Missionen erklären Gameplay.
Missionen ersetzen Gameplay nicht.
Kernmechaniken müssen auch außerhalb einer Mission funktionieren.

---

# Stabilitätsregel

Priorität:
1. Stabilität
2. Gameplay
3. Save-System
4. Architektur
5. Mobile UX
6. Performance
7. Content
8. finale Grafik

---

# Abschlussbericht

Nach jedem Entwicklungsticket muss ein Report entstehen.

Report enthält:
- Ticket-ID
- Status
- Implementierungs-Commit
- veränderte Dateien
- neue Dateien
- Tests
- bekannte Probleme
- Risiken
- bewusst nicht umgesetzte Dinge

Danach STOP.
Kein nächstes Gameplay-Ticket selbstständig beginnen.

---

# Grundsatz

**Lieber eine kleine Funktion vollständig stabil als zehn Funktionen halb fertig.**
