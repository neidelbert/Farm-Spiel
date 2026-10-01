# Farm-Spiel – Automatisierung

## Ziel
Der Entwicklungsweg soll vom iPhone aus mit möglichst wenigen manuellen Schritten funktionieren, ohne kostenpflichtigen Dienst.

## Freigegebener Weg

1. ChatGPT analysiert `develop`, erstellt die vollständigen Änderungen und erzeugt genau einen komprimierten Payload.
2. Der iPhone-Kurzbefehl liest den Payload als Text.
3. Der Kurzbefehl startet den GitHub-Workflow über die GitHub REST API.
4. Der Installer validiert Payload, Base-SHA, Dateipfade und Hashes.
5. Der Installer führt statische Prüfungen und vorhandene Node-Tests aus.
6. Nur bei Erfolg wird exakt ein Commit auf `develop` gepusht.
7. ChatGPT prüft den resultierenden Workflow-Run und Commit.

## Ticketarten

Gameplay-/Produktentwicklung:
- `FS-###`

Werkzeuge, Tests, Dokumentation und Entwicklungsinfrastruktur:
- `TOOLS-###`

`TOOLS`-Tickets dürfen Gameplay nicht still verändern.

## GitHub-Branches

- `main`: stabile öffentliche Version und Installer-Infrastruktur
- `develop`: aktive 0.3-Entwicklung
- `baseline/0.2.0`: unveränderliche Rückfallebene

## iPhone-Direktstart per API

Der Kurzbefehl kann den manuellen Schritt
`GitHub öffnen → Payload einfügen → Workflow ausführen`
ersetzen.

REST-Endpunkt:

`POST https://api.github.com/repos/neidelbert/Farm-Spiel/actions/workflows/farm-ticket-installer.yml/dispatches`

Request Body:

```json
{
  "ref": "main",
  "inputs": {
    "payload": "<PayloadText>"
  }
}
```

Empfohlene Header:

- `Accept: application/vnd.github+json`
- `Authorization: Bearer <TOKEN>`
- `X-GitHub-Api-Version: 2026-03-10`

Für diesen Direktstart soll ein Fine-Grained Personal Access Token ausschließlich für
`neidelbert/Farm-Spiel`
mit Repository-Berechtigung
`Actions: Read and write`
verwendet werden.

Kein Token gehört in GitHub-Dateien, Payloads, Issues oder Chat-Nachrichten.

## Token-Sicherheitsregel

Der Direktstart-Token kann Workflows auslösen.
Er ist deshalb wie ein Passwort zu behandeln.

Empfohlen:
- nur dieses eine Repository
- nur benötigte Berechtigungen
- Ablaufdatum statt dauerhaftem Token
- bei Verlust sofort widerrufen
- nicht in Screenshots oder Chat einfügen

## Fallback

Wenn der API-Kurzbefehl nicht funktioniert, bleibt der bereits getestete manuelle Weg gültig:

Payload-Datei
→ Kurzbefehl liest Text
→ GitHub Actions öffnen
→ Payload einfügen
→ Workflow starten.

## Installer-Sicherheitsregeln

Der Installer:
- akzeptiert nur den Repository-Owner als Actor
- akzeptiert beim manuellen/API-Start nur `main` als Workflow-Ref
- arbeitet ausschließlich auf `develop`
- prüft den erwarteten `develop`-SHA
- verbietet `.git/**` und `.github/**` im Payload
- prüft jede geschriebene Datei per SHA-256
- erlaubt keine beliebigen Shell-Kommandos aus dem Payload
- prüft den exakten geänderten Dateisatz
- führt Tests vor dem Push aus
- speichert Checkout-Zugangsdaten nicht für den Testschritt
- verwendet das Schreib-Token erst im getrennten Push-Schritt
- verwendet keinen Force-Push

## Große Grafikdateien

Der Text-Payload ist für Code, JSON, Dokumentation und kleine Dateien gedacht.
Bereits komprimierte große Binärassets wie WebP sollten später über einen getrennten Asset-Workflow oder einen kontrollierten Git-Blob-Upload verarbeitet werden.

Große Assets werden nicht in normale Gameplay-Tickets gequetscht.
