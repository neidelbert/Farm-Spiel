# Farm-Spiel – Task Control

## Aktiver Entwicklungsbranch
`develop`

## Aktuelle Version
`0.3.0-dev`

---

# Aktuelles Ticket
`FS-015` – Save/Visual Migration Cleanup

Status:
`READY_FOR_REVIEW`

Ausgangs-SHA:
`4ef2ef3a807e59f8114318a0658f6b395d708b69`

Hinweis:
Save/Visual Migration Cleanup ist für den Installer vorbereitet. Nach erfolgreichem Commit wartet FS-015 auf ChatGPT-Review.
Ein Folgeticket darf vorher nicht gestartet werden.

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

## `FS-007` – Field System Core
Status:
`APPROVED`

Implementierungs-Commit:
`90c88257f77ba6b97c98ef58cac2bcfa6da21880`

Review:
`APPROVED` by ChatGPT

## `FS-008` – Crop System
Status:
`APPROVED`

Erstimplementierung:
`974c7f296917b88ffa974be5ec22c4f9dc8f42ba`

Korrektur-Commit:
`bdecda772a65448cb7f8109ab59dc85d1718d337`

Review-Abschluss:
`aca0c62905c69a58f9b9fcc29c0a10cb0682cb3e`

Review:
`APPROVED` by ChatGPT

## `FS-009` – Planting Flow
Status:
`APPROVED`

Implementierungs-Commit:
`fce6174e8082422e5145036d6d024b02f1e0c76d`

Review-Abschluss:
`4083558069a87209ba9114f446c2eaa7cedbf453`

Review:
`APPROVED` by ChatGPT

## `FS-010` – Growth + Offline
Status:
`APPROVED`

Implementierungs-Commit:
`835f16b645f24c7f3f88e7f4ec1d94f2cf03edc7`

Review-Abschluss:
`46fbd9c002e0073fd590375ff3fdd64178f1366f`

Review:
`APPROVED` by ChatGPT

## `FS-011` – Harvest Core
Status:
`APPROVED`

Implementierungs-Commit:
`aacdfa225c138ba06aa966d415accee52ac1f82e`

Review-Abschluss:
`ffbbbeb78d38308914112b10ac93bd36d588c617`

Review:
`APPROVED` by ChatGPT

## `FS-012` – Selling Core
Status:
`APPROVED`

Implementierungs-Commit:
`cce69a1a16b0efec7e333a8c101945f3dbfdc543`

Review-Abschluss:
`31b3166191ad6114804bb61392b17db84f2fd258`

Review:
`APPROVED` by ChatGPT

## `FS-013` – Save Schema v2 / Migration Core
Status:
`APPROVED`

Implementierungs-Commit:
`06468f02f16aa24133987c4e0c9424f919212830`

Review-Abschluss:
`97521efe5c0bbbcf5e4dd347f9bde4ab1759f6c9`

Review:
`APPROVED` by ChatGPT

## `FS-014` – Save Migration Hardening
Status:
`APPROVED`

Implementierungs-Commit:
`b9479f9fb275f2b33dda952c349dc99a3a91f4c5`

Review-Abschluss:
`4ef2ef3a807e59f8114318a0658f6b395d708b69`

Review:
`APPROVED` by ChatGPT

---

# Geplante Reihenfolge
Nach FS-015 wird das nächste Ticket separat aus dem aktuellen Repository-Stand geplant.

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
