import test from "node:test";
import assert from "node:assert/strict";

import { InventorySystem } from "../src/systems/inventory.js";
import { FieldSystem } from "../src/systems/fields.js";
import { CropSystem } from "../src/systems/crops.js";
import { HarvestSystem } from "../src/systems/harvest.js";

function createState(overrides = {}) {
  const base = {
    missionId: "tutorial_done",
    machines: { combine: true },
    field: {
      status: "ready",
      crop: "wheat",
      plantedAt: 1_000,
      readyAt: null,
      harvestProgress: 0,
    },
    inventory: { wheatSeed: 0 },
    silo: { capacity: 40, items: { wheat: 0 } },
    barn: { capacity: 30, items: { flour: 0, eggs: 0, milk: 0 } },
  };

  return {
    ...base,
    ...overrides,
    machines: { ...base.machines, ...(overrides.machines || {}) },
    field: { ...base.field, ...(overrides.field || {}) },
    silo: {
      ...base.silo,
      ...(overrides.silo || {}),
      items: { ...base.silo.items, ...(overrides.silo?.items || {}) },
    },
    barn: {
      ...base.barn,
      ...(overrides.barn || {}),
      items: { ...base.barn.items, ...(overrides.barn?.items || {}) },
    },
  };
}

function createSystem(state = createState()) {
  const inventory = new InventorySystem(state);
  const fields = new FieldSystem(state);
  const crops = new CropSystem();
  const harvest = new HarvestSystem({ state, inventory, fields, crops });
  return { state, inventory, fields, crops, harvest };
}

test("constructor rejects missing dependencies", () => {
  assert.throws(
    () => new HarvestSystem({}),
    /HarvestSystem dependencies are missing/,
  );
});

test("harvest plan uses the central crop yield, item and storage", () => {
  const { harvest } = createSystem();
  assert.deepEqual(harvest.getPlan(), {
    cropId: "wheat",
    yieldAmount: 10,
    harvestItem: "wheat",
    storage: "silo",
    freeSpace: 40,
    machineAvailable: true,
    storageFits: true,
  });
});

test("ready wheat can be harvested outside the tutorial mission", () => {
  const { state, harvest } = createSystem(createState({ missionId: "tutorial_done" }));
  assert.equal(harvest.canStartHarvest(), true);
  assert.equal(harvest.startHarvest(), true);
  assert.equal(state.field.status, "harvest_starting");
  assert.equal(state.missionId, "tutorial_done");
});

test("missing combine blocks harvest without mutating the field", () => {
  const state = createState({ machines: { combine: false } });
  const before = structuredClone(state.field);
  const { harvest } = createSystem(state);

  assert.equal(harvest.canStartHarvest(), false);
  assert.equal(harvest.startHarvest(), false);
  assert.deepEqual(state.field, before);
});

test("insufficient silo capacity blocks harvest without losing crop", () => {
  const state = createState({
    silo: { capacity: 40, items: { wheat: 31 } },
  });
  const before = structuredClone(state.field);
  const { harvest } = createSystem(state);

  assert.equal(harvest.getPlan().freeSpace, 9);
  assert.equal(harvest.getPlan().storageFits, false);
  assert.equal(harvest.startHarvest(), false);
  assert.deepEqual(state.field, before);
  assert.equal(state.silo.items.wheat, 31);
});

test("harvest lifecycle uses FieldSystem transitions", () => {
  const { state, harvest } = createSystem();

  assert.equal(harvest.startHarvest(), true);
  assert.equal(state.field.status, "harvest_starting");

  assert.equal(harvest.markHarvesting(), true);
  assert.equal(state.field.status, "harvesting");

  assert.equal(harvest.finishCutting(), true);
  assert.equal(state.field.status, "harvested");
  assert.equal(state.field.harvestProgress, 1);
});

test("successful storage adds full yield and resets field for replanting", () => {
  const state = createState({
    field: { status: "harvested" },
    silo: { capacity: 40, items: { wheat: 12 } },
  });
  const { harvest } = createSystem(state);

  assert.equal(harvest.storeHarvest(), true);
  assert.equal(state.silo.items.wheat, 22);
  assert.deepEqual(state.field, {
    status: "prepared",
    crop: null,
    plantedAt: null,
    readyAt: null,
    harvestProgress: 0,
  });
});

test("storage becoming full after cutting keeps harvested crop recoverable", () => {
  const state = createState({
    field: { status: "harvested" },
    silo: { capacity: 40, items: { wheat: 35 } },
  });
  const before = structuredClone(state.field);
  const { harvest } = createSystem(state);

  assert.equal(harvest.canStoreHarvest(), false);
  assert.equal(harvest.storeHarvest(), false);
  assert.equal(state.silo.items.wheat, 35);
  assert.deepEqual(state.field, before);
});

test("exactly enough silo space accepts the complete harvest", () => {
  const state = createState({
    field: { status: "harvested" },
    silo: { capacity: 40, items: { wheat: 30 } },
  });
  const { harvest } = createSystem(state);

  assert.equal(harvest.canStoreHarvest(), true);
  assert.equal(harvest.storeHarvest(), true);
  assert.equal(state.silo.items.wheat, 40);
  assert.equal(state.field.status, "prepared");
});

test("unknown field crop cannot start or store a harvest", () => {
  const state = createState({ field: { crop: "corn" } });
  const before = structuredClone(state.field);
  const { harvest } = createSystem(state);

  assert.equal(harvest.getPlan(), null);
  assert.equal(harvest.canStartHarvest(), false);
  assert.equal(harvest.startHarvest(), false);
  assert.deepEqual(state.field, before);
});
