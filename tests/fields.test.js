import test from "node:test";
import assert from "node:assert/strict";

import { FIELD_STATUS, FieldSystem } from "../src/systems/fields.js";

function createState(overrides = {}) {
  return {
    field: {
      status: FIELD_STATUS.PREPARED,
      crop: null,
      plantedAt: null,
      readyAt: null,
      harvestProgress: 0,
      fertilized: false,
      fertilizedAt: null,
      ...overrides,
    },
  };
}

test("constructor rejects missing field state", () => {
  assert.throws(() => new FieldSystem({}), /Field state is missing/);
});

test("reads the existing legacy field state without changing it", () => {
  const state = createState({ crop: "wheat" });
  const fields = new FieldSystem(state);

  assert.equal(fields.getField(), state.field);
  assert.equal(fields.getStatus(), FIELD_STATUS.PREPARED);
  assert.equal(fields.getCrop(), "wheat");
});

test("prepared field can enter sowing exactly once", () => {
  const state = createState();
  const fields = new FieldSystem(state);

  assert.equal(fields.startSowing(), true);
  assert.equal(state.field.status, FIELD_STATUS.SOWING);
  assert.equal(state.field.fertilized, false);
  assert.equal(state.field.fertilizedAt, null);
  assert.equal(fields.startSowing(), false);
});

test("startGrowing rejects invalid crop and timestamps without mutation", () => {
  const state = createState({ status: FIELD_STATUS.SOWING });
  const fields = new FieldSystem(state);
  const before = structuredClone(state.field);

  assert.equal(fields.startGrowing({ crop: "", plantedAt: 1000, readyAt: 2000 }), false);
  assert.deepEqual(state.field, before);

  assert.equal(fields.startGrowing({ crop: "wheat", plantedAt: 2000, readyAt: 1000 }), false);
  assert.deepEqual(state.field, before);
});

test("sowing field can enter growing with explicit crop and timestamps", () => {
  const state = createState({ status: FIELD_STATUS.SOWING, fertilized: true, fertilizedAt: 500 });
  const fields = new FieldSystem(state);

  assert.equal(fields.startGrowing({ crop: "wheat", plantedAt: 1000, readyAt: 5000 }), true);
  assert.equal(state.field.status, FIELD_STATUS.GROWING);
  assert.equal(state.field.crop, "wheat");
  assert.equal(state.field.plantedAt, 1000);
  assert.equal(state.field.readyAt, 5000);
  assert.equal(state.field.harvestProgress, 0);
  assert.equal(state.field.fertilized, false);
  assert.equal(state.field.fertilizedAt, null);
});

test("growing field can become ready and clears readyAt", () => {
  const state = createState({
    status: FIELD_STATUS.GROWING,
    crop: "wheat",
    plantedAt: 1000,
    readyAt: 5000,
  });
  const fields = new FieldSystem(state);

  assert.equal(fields.markReady(), true);
  assert.equal(state.field.status, FIELD_STATUS.READY);
  assert.equal(state.field.readyAt, null);
  assert.equal(state.field.crop, "wheat");
});

test("harvest lifecycle only follows ready -> starting -> harvesting -> harvested", () => {
  const state = createState({ status: FIELD_STATUS.READY, crop: "wheat" });
  const fields = new FieldSystem(state);

  assert.equal(fields.markHarvesting(), false);
  assert.equal(fields.startHarvest(), true);
  assert.equal(state.field.status, FIELD_STATUS.HARVEST_STARTING);
  assert.equal(fields.markHarvested(), false);
  assert.equal(fields.markHarvesting(), true);
  assert.equal(state.field.status, FIELD_STATUS.HARVESTING);
  assert.equal(fields.markHarvested(), true);
  assert.equal(state.field.status, FIELD_STATUS.HARVESTED);
  assert.equal(state.field.harvestProgress, 1);
});

test("harvest progress accepts only finite values from zero to one while harvesting", () => {
  const state = createState({ status: FIELD_STATUS.HARVESTING, crop: "wheat" });
  const fields = new FieldSystem(state);

  assert.equal(fields.setHarvestProgress(0.5), true);
  assert.equal(state.field.harvestProgress, 0.5);

  assert.equal(fields.setHarvestProgress(-0.1), false);
  assert.equal(fields.setHarvestProgress(1.1), false);
  assert.equal(fields.setHarvestProgress(Number.NaN), false);
  assert.equal(state.field.harvestProgress, 0.5);
});

test("resetPrepared clears cycle data only after harvest", () => {
  const state = createState({
    status: FIELD_STATUS.HARVESTED,
    crop: "wheat",
    plantedAt: 1000,
    readyAt: null,
    harvestProgress: 1,
    fertilized: true,
    fertilizedAt: 1100,
  });
  const fields = new FieldSystem(state);

  assert.equal(fields.resetPrepared(), true);
  assert.deepEqual(state.field, {
    status: FIELD_STATUS.PREPARED,
    crop: null,
    plantedAt: null,
    readyAt: null,
    harvestProgress: 0,
    fertilized: false,
    fertilizedAt: null,
  });
});

test("invalid transition leaves field state unchanged", () => {
  const state = createState({ status: FIELD_STATUS.PREPARED });
  const fields = new FieldSystem(state);
  const before = structuredClone(state.field);

  assert.equal(fields.markReady(), false);
  assert.equal(fields.startHarvest(), false);
  assert.equal(fields.markHarvesting(), false);
  assert.equal(fields.markHarvested(), false);
  assert.equal(fields.resetPrepared(), false);
  assert.deepEqual(state.field, before);
});
