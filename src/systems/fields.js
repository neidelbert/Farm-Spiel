export const FIELD_STATUS = Object.freeze({
  PREPARED: "prepared",
  SOWING: "sowing",
  GROWING: "growing",
  READY: "ready",
  HARVEST_STARTING: "harvest_starting",
  HARVESTING: "harvesting",
  HARVESTED: "harvested",
});

export class FieldSystem {
  constructor(state) {
    if (!state?.field || typeof state.field !== "object" || Array.isArray(state.field)) {
      throw new Error("Field state is missing.");
    }
    this.state = state;
  }

  getField() {
    return this.state.field;
  }

  getStatus() {
    return this.state.field.status;
  }

  getCrop() {
    return this.state.field.crop ?? null;
  }

  is(status) {
    return this.getStatus() === status;
  }

  startSowing() {
    if (!this.is(FIELD_STATUS.PREPARED)) return false;
    this.state.field.status = FIELD_STATUS.SOWING;
    this.state.field.harvestProgress = 0;
    return true;
  }

  startGrowing({ crop, plantedAt, readyAt }) {
    if (!this.is(FIELD_STATUS.SOWING)) return false;
    if (typeof crop !== "string" || crop.length === 0) return false;
    if (!Number.isFinite(plantedAt) || !Number.isFinite(readyAt) || readyAt <= plantedAt) {
      return false;
    }

    this.state.field.status = FIELD_STATUS.GROWING;
    this.state.field.crop = crop;
    this.state.field.plantedAt = plantedAt;
    this.state.field.readyAt = readyAt;
    this.state.field.harvestProgress = 0;
    return true;
  }

  markReady() {
    if (!this.is(FIELD_STATUS.GROWING)) return false;
    this.state.field.status = FIELD_STATUS.READY;
    this.state.field.readyAt = null;
    return true;
  }

  startHarvest() {
    if (!this.is(FIELD_STATUS.READY)) return false;
    this.state.field.status = FIELD_STATUS.HARVEST_STARTING;
    return true;
  }

  markHarvesting() {
    if (!this.is(FIELD_STATUS.HARVEST_STARTING)) return false;
    this.state.field.status = FIELD_STATUS.HARVESTING;
    this.state.field.harvestProgress = 0;
    return true;
  }

  setHarvestProgress(progress) {
    if (!this.is(FIELD_STATUS.HARVESTING)) return false;
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) return false;
    this.state.field.harvestProgress = progress;
    return true;
  }

  markHarvested() {
    if (!this.is(FIELD_STATUS.HARVESTING)) return false;
    this.state.field.status = FIELD_STATUS.HARVESTED;
    this.state.field.harvestProgress = 1;
    return true;
  }

  resetPrepared() {
    if (!this.is(FIELD_STATUS.HARVESTED)) return false;
    this.state.field.status = FIELD_STATUS.PREPARED;
    this.state.field.crop = null;
    this.state.field.plantedAt = null;
    this.state.field.readyAt = null;
    this.state.field.harvestProgress = 0;
    return true;
  }
}
