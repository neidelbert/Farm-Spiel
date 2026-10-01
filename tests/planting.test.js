import test from "node:test";
import assert from "node:assert/strict";

import { EconomySystem } from "../src/systems/economy.js";
import { InventorySystem } from "../src/systems/inventory.js";
import { FieldSystem } from "../src/systems/fields.js";
import { CropSystem } from "../src/systems/crops.js";
import { PlantingSystem } from "../src/systems/planting.js";

function createState(overrides = {}) {
  return {
    level: 3,
    money: 100,
    missionId: "tutorial_done",
    inventory: { scrap: 0, wheatSeed: 0 },
    silo: { capacity: 40, items: { wheat: 0 } },
    barn: { capacity: 30, items: { flour: 0, eggs: 0, milk: 0 } },
    field: { status: "prepared", crop: null, plantedAt: null, readyAt: null, harvestProgress: 0 },
    ...overrides,
  };
}

function createSystem(state = createState()) {
  const economy = new EconomySystem(state);
  const inventory = new InventorySystem(state);
  const fields = new FieldSystem(state);
  const crops = new CropSystem();
  return { state, economy, inventory, fields, crops, planting: new PlantingSystem({ state, economy, inventory, fields, crops }) };
}

test("wheat seed uses the canonical economy price", () => {
  const { planting } = createSystem();
  assert.equal(planting.getSeedPrice("wheat"), 10);
});

test("seed purchase is independent from mission state", () => {
  const { state, planting } = createSystem(createState({ missionId: "tutorial_done" }));
  assert.equal(planting.buySeed("wheat"), true);
  assert.equal(state.money, 90);
  assert.equal(state.missionId, "tutorial_done");
});

test("seed purchase rejects insufficient funds without mutation", () => {
  const { state, planting } = createSystem(createState({ money: 5 }));
  assert.equal(planting.buySeed("wheat"), false);
  assert.equal(state.money, 5);
});

test("delivered seed stacks instead of disappearing when seed already exists", () => {
  const { state, planting } = createSystem(createState({ inventory: { scrap: 0, wheatSeed: 2 } }));
  assert.equal(planting.receiveSeed("wheat", 1), true);
  assert.equal(state.inventory.wheatSeed, 3);
});

test("prepared field with seed can start sowing outside the tutorial", () => {
  const { state, planting } = createSystem(createState({
    missionId: "tutorial_done",
    inventory: { scrap: 0, wheatSeed: 1 },
  }));
  assert.equal(planting.canStartSowing("wheat"), true);
  assert.equal(planting.startSowing("wheat"), true);
  assert.equal(state.field.status, "sowing");
});

test("completing sowing consumes one seed and uses crop growth duration", () => {
  const { state, planting } = createSystem(createState({
    inventory: { scrap: 0, wheatSeed: 2 },
    field: { status: "sowing", crop: null, plantedAt: null, readyAt: null, harvestProgress: 0 },
  }));
  const plantedAt = 1_000_000;
  assert.equal(planting.completeSowing("wheat", plantedAt), true);
  assert.equal(state.inventory.wheatSeed, 1);
  assert.equal(state.field.status, "growing");
  assert.equal(state.field.crop, "wheat");
  assert.equal(state.field.plantedAt, plantedAt);
  assert.equal(state.field.readyAt, plantedAt + 5 * 60 * 1000);
});

test("sowing completion without seed leaves field unchanged", () => {
  const state = createState({
    inventory: { scrap: 0, wheatSeed: 0 },
    field: { status: "sowing", crop: null, plantedAt: null, readyAt: null, harvestProgress: 0 },
  });
  const before = structuredClone(state.field);
  const { planting } = createSystem(state);
  assert.equal(planting.completeSowing("wheat", 1_000_000), false);
  assert.deepEqual(state.field, before);
});

test("invalid or locked planting requests do not mutate state", () => {
  const state = createState({ level: 0, inventory: { scrap: 0, wheatSeed: 1 } });
  const { planting } = createSystem(state);
  assert.equal(planting.canBuySeed("wheat"), false);
  assert.equal(planting.startSowing("wheat"), false);
  assert.equal(state.field.status, "prepared");
  assert.throws(() => planting.getSeedPrice("corn"), /No seed price configured/);
});
