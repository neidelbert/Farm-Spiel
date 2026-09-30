# Farm-Spiel – Task Control

## Aktiver Entwicklungsbranch
`develop`

## Aktuelle Version
`0.3.0-dev`

---

# Aktuelles Ticket
Kein Implementierungsticket aktiv.

Nächster geplanter Schritt:
`FS-007` – Field System Core

Status:
`PLANNED`

FS-007 ist noch nicht freigegeben und darf erst nach separater Vorbereitung gestartet werden.

---

# Abgeschlossene Tickets

## `FS-001` – Stable Baseline
Status:
`APPROVED`

Commit:
`aa2269b4175383f0cae3b590cf97cd4f6d195da2`

Baseline:
`5e6dc7757ab95d5aa7344d1b61e30f16a65407ab`

## `FS-002` – AI Development System
Status:
`APPROVED`

Implementierungs-Commit:
`cc49e8d4202660515ae8339b2ee32e728c4c08e1`

Review-Commit:
`be8b3af156f5dcb4143c170f01e1fc82b43aff0f`

Review:
`APPROVED` by ChatGPT

## `FS-003` – State Audit
Status:
`APPROVED`

Implementierungs-Commit:
`c9d99b1bd2b682b8e268d54fb2e939bb901c0779`

Review:
`APPROVED` by ChatGPT

## `FS-004` – Event ID Audit
Status:
`APPROVED`

Implementierungs-Commit:
`53511b7efab5cdf67b78696cd1591a94a55e4798`

Review:
`APPROVED` by ChatGPT

## `FS-005` – Economy Core
Status:
`APPROVED`

Implementierungs-Commit:
`16b3966eb5404fae6224ed3d6b292c63b9e71d6f`

Review:
`APPROVED` by ChatGPT

## `FS-006` – Inventory Core
Status:
`APPROVED`

Implementierungs-Commit:
`239288df3a6d5da642b5730076b8f0fc35a6bc49`

Review:
`APPROVED` by ChatGPT

---

# Geplante Reihenfolge
- `FS-007` – Field System Core
- `FS-008` – Crop System
- `FS-009` – Planting Flow
- `FS-010` – Growth + Offline
- `FS-011` – Harvest Core
- `FS-012` – Selling Core

---

# Regel
Es darf immer nur ein Ticket den Status:
`READY`
oder
`IN_PROGRESS`
haben.

Ein Ticket mit:
`READY_FOR_REVIEW`
darf nicht selbstständig als `APPROVED` betrachtet werden.

Kein KI-Werkzeug und kein Automationsweg darf ein `PLANNED`-Ticket selbstständig starten.

Nach Umsetzung:
`READY_FOR_REVIEW`

Nach ChatGPT-Review:
`APPROVED`
oder:
`CHANGES_REQUESTED`
