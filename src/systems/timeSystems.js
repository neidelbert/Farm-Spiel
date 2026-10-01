import { CONFIG } from "../config.js";
import { FIELD_IDS } from "../data/fields.js";
import { FieldSystem } from "./fields.js";

const DEFAULT_OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;

export class TimeSystems {
  constructor(state, events) {
    if (!state || !events || typeof events.emit !== "function") {
      throw new Error("TimeSystems dependencies are missing.");
    }
    this.state = state;
    this.events = events;
    this.fields = state.fields
      ? FIELD_IDS.filter(fieldId => state.fields[fieldId]).map(fieldId => new FieldSystem(state, fieldId))
      : [new FieldSystem(state)];
  }

  update(dt = 0, now = Date.now()) {
    const s = this.state;
    const safeDt = Number.isFinite(dt) && dt > 0 ? dt : 0;
    const scale = Number.isFinite(s.world?.timeScale) && s.world.timeScale > 0 ? s.world.timeScale : 1;

    const extraScaledMs = safeDt * 1000 * (scale - 1);
    if (extraScaledMs !== 0) {
      this.#shiftDomainTimers(-extraScaledMs);
      this.#shiftVehicleWaits(-extraScaledMs);
    }

    if (!Number.isFinite(s.world.timeOfDay)) s.world.timeOfDay = 0;
    s.world.timeOfDay = (s.world.timeOfDay + safeDt * scale / (40 * 60)) % 1;

    for (const fields of this.fields) {
      const field = fields.getField();
      if (fields.isUnlocked()
        && fields.is("growing")
        && Number.isFinite(field.readyAt)
        && now >= field.readyAt) {
        if (fields.markReady()) this.events.emit("field:ready", { fieldId: fields.getFieldId() });
      }
    }

    if (s.mill.busy && Number.isFinite(s.mill.readyAt) && now >= s.mill.readyAt) {
      s.mill.busy = false;
      s.mill.readyAt = null;
      s.mill.outputReady += 2;
      this.events.emit("mill:ready");
    }

    if (s.chickens.fed && Number.isFinite(s.chickens.readyAt) && now >= s.chickens.readyAt) {
      s.chickens.fed = false;
      s.chickens.readyAt = null;
      s.chickens.eggsReady += 4;
      this.events.emit("chickens:ready");
    }

    if (s.cows.fed && Number.isFinite(s.cows.readyAt) && now >= s.cows.readyAt) {
      s.cows.fed = false;
      s.cows.readyAt = null;
      s.cows.milkReady += 2;
      this.events.emit("cows:ready");
    }

    if (s.construction && Number.isFinite(s.construction.endAt) && now >= s.construction.endAt) {
      const finished = s.construction;
      s.construction = null;
      this.events.emit("construction:complete", finished);
    }
  }

  reconcileOffline(now = Date.now()) {
    const safeNow = Number.isFinite(now) ? now : Date.now();
    const savedAt = Number.isFinite(this.state.lastSavedAt) ? Math.min(this.state.lastSavedAt, safeNow) : safeNow;
    const actualElapsedMs = Math.max(0, safeNow - savedAt);
    const appliedElapsedMs = Math.min(actualElapsedMs, this.getOfflineCapMs());
    const skippedElapsedMs = actualElapsedMs - appliedElapsedMs;

    if (skippedElapsedMs > 0) this.#shiftDomainTimers(skippedElapsedMs);
    if (actualElapsedMs > 0) this.#shiftVehicleWaits(actualElapsedMs);

    this.update(0, safeNow);
    this.state.lastSavedAt = safeNow;

    return { actualElapsedMs, appliedElapsedMs, capped: skippedElapsedMs > 0, vehiclePolicy: "paused" };
  }

  getOfflineCapMs() {
    const configured = CONFIG.timings?.offlineCapMs;
    return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_OFFLINE_CAP_MS;
  }

  forceFinishAll(now = Date.now()) {
    const safeNow = Number.isFinite(now) ? now : Date.now();
    const s = this.state;
    for (const fields of this.fields) {
      if (fields.isUnlocked() && fields.is("growing")) fields.getField().readyAt = safeNow - 1;
    }
    if (s.mill.busy) s.mill.readyAt = safeNow - 1;
    if (s.chickens.fed) s.chickens.readyAt = safeNow - 1;
    if (s.cows.fed) s.cows.readyAt = safeNow - 1;
    if (s.construction) s.construction.endAt = safeNow - 1;
    this.update(0, safeNow);
  }

  #shiftDomainTimers(deltaMs) {
    if (!Number.isFinite(deltaMs) || deltaMs === 0) return;
    const s = this.state;

    for (const fields of this.fields) {
      if (!fields.isUnlocked() || !fields.is("growing")) continue;
      const field = fields.getField();
      shiftTimestamp(field, "plantedAt", deltaMs);
      shiftTimestamp(field, "readyAt", deltaMs);
    }

    if (s.mill.busy) shiftTimestamp(s.mill, "readyAt", deltaMs);
    if (s.chickens.fed) shiftTimestamp(s.chickens, "readyAt", deltaMs);
    if (s.cows.fed) shiftTimestamp(s.cows, "readyAt", deltaMs);

    if (s.construction) {
      shiftTimestamp(s.construction, "startAt", deltaMs);
      shiftTimestamp(s.construction, "endAt", deltaMs);
    }
  }

  #shiftVehicleWaits(deltaMs) {
    if (!Number.isFinite(deltaMs) || deltaMs === 0 || !Array.isArray(this.state.vehicles)) return;
    for (const vehicle of this.state.vehicles) {
      if (!Number.isFinite(vehicle?.waitingUntil)) continue;
      shiftTimestamp(vehicle, "waitStartedAt", deltaMs);
      shiftTimestamp(vehicle, "waitingUntil", deltaMs);
    }
  }
}

function shiftTimestamp(owner, key, deltaMs) {
  if (owner && Number.isFinite(owner[key])) owner[key] += deltaMs;
}
