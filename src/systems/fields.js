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
  constructor(state, fieldId = "field1") {
    const modern = state?.fields && typeof state.fields === "object" && !Array.isArray(state.fields);
    const legacy = fieldId === "field1" && state?.field && typeof state.field === "object" && !Array.isArray(state.field);
    if (!modern && !legacy) throw new Error("Field state is missing.");
    if (modern && (!state.fields[fieldId] || typeof state.fields[fieldId] !== "object" || Array.isArray(state.fields[fieldId]))) {
      throw new Error(`Field state is missing: ${fieldId}`);
    }
    this.state = state;
    this.fieldId = fieldId;
    this.legacy = !modern;
  }

  getFieldId() {
    return this.fieldId;
  }

  getField() {
    return this.legacy ? this.state.field : this.state.fields[this.fieldId];
  }

  isUnlocked() {
    const field = this.getField();
    return this.legacy ? true : field.unlocked === true;
  }

  getStatus() {
    return this.getField().status;
  }

  getCrop() {
    return this.getField().crop ?? null;
  }

  is(status) {
    return this.getStatus() === status;
  }

  startSowing() {
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.PREPARED)) return false;
    const field = this.getField();
    field.status = FIELD_STATUS.SOWING;
    field.harvestProgress = 0;
    field.fertilized = false;
    field.fertilizedAt = null;
    return true;
  }

  startGrowing({ crop, plantedAt, readyAt }) {
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.SOWING)) return false;
    if (typeof crop !== "string" || crop.length === 0) return false;
    if (!Number.isFinite(plantedAt) || !Number.isFinite(readyAt) || readyAt <= plantedAt) {
      return false;
    }

    const field = this.getField();
    field.status = FIELD_STATUS.GROWING;
    field.crop = crop;
    field.plantedAt = plantedAt;
    field.readyAt = readyAt;
    field.harvestProgress = 0;
    field.fertilized = false;
    field.fertilizedAt = null;
    return true;
  }

  applyFertilizer({ appliedAt, readyAt }) {
    const field = this.getField();
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.GROWING) || field.fertilized === true) return false;
    if (!Number.isFinite(appliedAt) || !Number.isFinite(readyAt) || readyAt <= appliedAt) {
      return false;
    }
    if (!Number.isFinite(field.readyAt) || readyAt >= field.readyAt) return false;

    field.fertilized = true;
    field.fertilizedAt = appliedAt;
    field.readyAt = readyAt;
    return true;
  }

  markReady() {
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.GROWING)) return false;
    const field = this.getField();
    field.status = FIELD_STATUS.READY;
    field.readyAt = null;
    return true;
  }

  startHarvest() {
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.READY)) return false;
    this.getField().status = FIELD_STATUS.HARVEST_STARTING;
    return true;
  }

  markHarvesting() {
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.HARVEST_STARTING)) return false;
    const field = this.getField();
    field.status = FIELD_STATUS.HARVESTING;
    field.harvestProgress = 0;
    return true;
  }

  setHarvestProgress(progress) {
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.HARVESTING)) return false;
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) return false;
    this.getField().harvestProgress = progress;
    return true;
  }

  markHarvested() {
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.HARVESTING)) return false;
    const field = this.getField();
    field.status = FIELD_STATUS.HARVESTED;
    field.harvestProgress = 1;
    return true;
  }

  resetPrepared() {
    if (!this.isUnlocked() || !this.is(FIELD_STATUS.HARVESTED)) return false;
    const field = this.getField();
    field.status = FIELD_STATUS.PREPARED;
    field.crop = null;
    field.plantedAt = null;
    field.readyAt = null;
    field.harvestProgress = 0;
    field.fertilized = false;
    field.fertilizedAt = null;
    return true;
  }
}
