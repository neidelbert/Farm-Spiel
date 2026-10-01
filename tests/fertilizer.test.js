import test from "node:test";
import assert from "node:assert/strict";

import { EconomySystem } from "../src/systems/economy.js";
import { InventorySystem } from "../src/systems/inventory.js";
import { FieldSystem } from "../src/systems/fields.js";
import { CropSystem } from "../src/systems/crops.js";
import { FertilizerSystem } from "../src/systems/fertilizer.js";

function createState(overrides = {}) {
  const base = {
    level: 4,
    money: 100,
    inventory: { scrap: 0, wheatSeed: 0, fertilizer: 0 },
    silo: { capacity: 40, items: { wheat: 0 } },
    barn: { capacity: 30, items: { flour: 0, eggs: 0, milk: 0 } },
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: 1_000,
      readyAt: 301_000,
      harvestProgress: 0,
      fertilized: false,
      fertilizedAt: null,
    },
  };
  return {
    ...base,
    ...overrides,
    inventory: { ...base.inventory, ...(overrides.inventory || {}) },
    field: { ...base.field, ...(overrides.field || {}) },
    silo: { ...base.silo, ...(overrides.silo || {}), items: { ...base.silo.items, ...(overrides.silo?.items || {}) } },
    barn: { ...base.barn, ...(overrides.barn || {}), items: { ...base.barn.items, ...(overrides.barn?.items || {}) } },
  };
}

function createSystem(state = createState()) {
  const economy = new EconomySystem(state);
  const inventory = new InventorySystem(state);
  const fields = new FieldSystem(state);
  const crops = new CropSystem();
  const fertilizer = new FertilizerSystem({ state, economy, inventory, fields, crops });
  return { state, economy, inventory, fields, crops, fertilizer };
}

test("constructor rejects missing dependencies", () => {
  assert.throws(() => new FertilizerSystem({}), /FertilizerSystem dependencies are missing/);
});

test("wheat fertilizer is unlocked at level 4 with two sacks for 15 F", () => {
  const { fertilizer } = createSystem();
  assert.equal(fertilizer.isUnlocked("wheat"), true);
  assert.deepEqual(fertilizer.getOffer("wheat"), {
    cropId: "wheat",
    item: "fertilizer",
    packSize: 2,
    price: 15,
    unlockLevel: 4,
    available: 0,
  });
});

test("fertilizer stays locked before level 4", () => {
  const { fertilizer } = createSystem(createState({ level: 3 }));
  assert.equal(fertilizer.isUnlocked("wheat"), false);
  assert.equal(fertilizer.canBuyPack("wheat"), false);
  assert.equal(fertilizer.buyPack("wheat"), false);
});

test("buying one pack atomically spends 15 F and adds two sacks", () => {
  const state = createState({ money: 20 });
  const { fertilizer } = createSystem(state);
  const result = fertilizer.buyPack("wheat");

  assert.deepEqual(result, {
    item: "fertilizer",
    amount: 2,
    cost: 15,
    balance: 5,
  });
  assert.equal(state.money, 5);
  assert.equal(state.inventory.fertilizer, 2);
});

test("insufficient Farmercoins leave money and inventory unchanged", () => {
  const state = createState({ money: 14 });
  const before = structuredClone(state);
  const { fertilizer } = createSystem(state);

  assert.equal(fertilizer.buyPack("wheat"), false);
  assert.deepEqual(state, before);
});

test("one sack fertilizes a growing field and reduces remaining growth to two minutes", () => {
  const now = 10_000;
  const state = createState({
    inventory: { fertilizer: 1 },
    field: { plantedAt: now, readyAt: now + 5 * 60_000 },
  });
  const { fertilizer } = createSystem(state);

  const result = fertilizer.apply(now);

  assert.ok(result);
  assert.equal(state.inventory.fertilizer, 0);
  assert.equal(state.field.fertilized, true);
  assert.equal(state.field.fertilizedAt, now);
  assert.equal(state.field.readyAt, now + 2 * 60_000);
  assert.equal(result.remainingMs, 2 * 60_000);
});

test("fertilizing later leaves two minutes from application instead of instantly finishing", () => {
  const plantedAt = 1_000;
  const now = plantedAt + 60_000;
  const state = createState({
    inventory: { fertilizer: 1 },
    field: { plantedAt, readyAt: plantedAt + 5 * 60_000 },
  });
  const { fertilizer } = createSystem(state);

  const result = fertilizer.apply(now);

  assert.ok(result);
  assert.equal(state.field.readyAt, now + 2 * 60_000);
});

test("exactly 2:20 remaining is too late to fertilize", () => {
  const now = 50_000;
  const state = createState({
    inventory: { fertilizer: 1 },
    field: { readyAt: now + 140_000 },
  });
  const before = structuredClone(state.field);
  const { fertilizer } = createSystem(state);

  const status = fertilizer.getFieldStatus(now);
  assert.equal(status.reason, "too_late");
  assert.equal(status.canApply, false);
  assert.equal(fertilizer.apply(now), false);
  assert.deepEqual(state.field, before);
  assert.equal(state.inventory.fertilizer, 1);
});

test("2:20.001 remaining still allows fertilizer", () => {
  const now = 50_000;
  const state = createState({
    inventory: { fertilizer: 1 },
    field: { readyAt: now + 140_001 },
  });
  const { fertilizer } = createSystem(state);

  assert.equal(fertilizer.canApply(now), true);
  assert.ok(fertilizer.apply(now));
  assert.equal(state.field.readyAt, now + 120_000);
});

test("a field can only be fertilized once", () => {
  const now = 10_000;
  const state = createState({
    inventory: { fertilizer: 2 },
    field: { readyAt: now + 300_000 },
  });
  const { fertilizer } = createSystem(state);

  assert.ok(fertilizer.apply(now));
  assert.equal(fertilizer.apply(now + 1_000), false);
  assert.equal(state.inventory.fertilizer, 1);
});

test("non-growing fields cannot consume fertilizer", () => {
  const state = createState({
    inventory: { fertilizer: 1 },
    field: { status: "ready", readyAt: null },
  });
  const { fertilizer } = createSystem(state);

  assert.equal(fertilizer.apply(10_000), false);
  assert.equal(state.inventory.fertilizer, 1);
});

test("missing fertilizer blocks application without changing the timer", () => {
  const now = 10_000;
  const state = createState({
    inventory: { fertilizer: 0 },
    field: { readyAt: now + 300_000 },
  });
  const before = state.field.readyAt;
  const { fertilizer } = createSystem(state);

  assert.equal(fertilizer.apply(now), false);
  assert.equal(state.field.readyAt, before);
});

test("field reset clears fertilizer state for the next crop", () => {
  const state = createState({
    field: {
      status: "harvested",
      crop: "wheat",
      fertilized: true,
      fertilizedAt: 10_000,
      harvestProgress: 1,
    },
  });
  const { fields } = createSystem(state);

  assert.equal(fields.resetPrepared(), true);
  assert.equal(state.field.fertilized, false);
  assert.equal(state.field.fertilizedAt, null);
});
