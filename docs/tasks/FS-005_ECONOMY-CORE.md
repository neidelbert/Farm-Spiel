# FS-005 – Economy Core

## Status
`APPROVED`

## Ausgangs-SHA
`abd34c2ab3aadcef797d0087f017d10688e84fd5`

## Version
`0.3.0-dev`

## Ziel
Farmercoin-Zugriffe des aktuellen Cores in ein kleines zentrales `EconomySystem` überführen, ohne Tutorial-, Save-, Vehicle- oder Gameplay-Abläufe außerhalb des freigegebenen Economy-Scopes umzubauen.

## Geänderte Source-Dateien
- `src/systems/economy.js` – neu
- `src/Game.js`
- `index.html`

## EconomySystem API
- `getBalance()`
- `getValue(key)`
- `canAfford(amount)`
- `spend(amount)`
- `credit(amount)`

Persistenter Farmercoin-Wert bleibt:

`state.money`

Kein Save-Schema und keine Save-Version wurden geändert.

## Integrierte Economy-Flows
- Weizensaat: Preisprüfung und Abbuchung
- Schrottverkauf: Gutschrift
- erster Auftrag: Gutschrift
- Silo-Upgrade: Preisprüfung und Abbuchung
- Werkstatt-Upgrade: Preisprüfung und Abbuchung
- Müller: Gutschrift
- Bäcker Eier: Gutschrift
- Bäcker Milch: Gutschrift
- DEV-Farmercoins: Gutschrift über EconomySystem
- sichtbare Dollar-Währungsangaben der berührten Runtime-Oberfläche auf `F` umgestellt

## Bewusst nicht verändert
- Save-Schema / `state.money`
- Inventory-System
- Feldsystem
- Crop-System
- Wachstum / Offline-Zeit
- Dünger
- Harvest-Reset
- wiederholbarer Verkauf
- Event-ID-Drift
- Missionstruktur
- Renderer
- Kamera
- Welt
- Assets

FS-006 wurde nach dem Review freigegeben.

## Tests
Vor Übergabe von ChatGPT lokal vorgesehen/ausgeführt:
- JavaScript-Syntax `Game.js`: PASS
- JavaScript-Syntax `economy.js`: PASS
- EconomySystem gezielte Tests: PASS
- Browser: NOT TESTED
- Gameplay: NOT TESTED
- vollständige Integration: NOT TESTED

## Review
`APPROVED`

Implementierungs-Commit:
`16b3966eb5404fae6224ed3d6b292c63b9e71d6f`

Review:
`APPROVED` by ChatGPT.

## STOP
FS-006 darf nicht automatisch begonnen werden.
