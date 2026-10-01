import test from "node:test";
import assert from "node:assert/strict";

import { EconomySystem } from "../src/systems/economy.js";
import { InventorySystem } from "../src/systems/inventory.js";
import { SellingSystem } from "../src/systems/selling.js";

function createState(overrides = {}) {
  const base = {
    money: 0,
    inventory: { wheatSeed: 0 },
    silo: { capacity: 40, items: { wheat: 10 } },
    barn: { capacity: 30, items: { flour: 0, eggs: 0, milk: 0 } },
  };

  return {
    ...base,
    ...overrides,
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
  const economy = new EconomySystem(state);
  const inventory = new InventorySystem(state);
  const selling = new SellingSystem({ economy, inventory });
  return { state, economy, inventory, selling };
}

test("constructor rejects missing dependencies", () => {
  assert.throws(
    () => new SellingSystem({}),
    /SellingSystem dependencies are missing/,
  );
});

test("wheat offer preserves the existing 5 wheat for 35 F economy", () => {
  const { selling } = createSystem();
  assert.deepEqual(selling.getOffer("wheat"), {
    id: "wheat",
    name: "Weizen",
    container: "silo",
    item: "wheat",
    amount: 5,
    rewardKey: "wheatSaleReward",
    reward: 35,
    available: 10,
  });
});

test("sale availability depends on inventory, not mission state", () => {
  const state = createState({ missionId: "tutorial_done" });
  const { selling } = createSystem(state);
  assert.equal(selling.canSell("wheat"), true);
});

test("successful wheat sale removes five wheat and credits 35 F atomically", () => {
  const { state, selling } = createSystem();

  const result = selling.sell("wheat");

  assert.deepEqual(result, {
    saleId: "wheat",
    item: "wheat",
    amount: 5,
    reward: 35,
    balance: 35,
  });
  assert.equal(state.silo.items.wheat, 5);
  assert.equal(state.money, 35);
});

test("repeat sales work without a tutorial mission", () => {
  const state = createState({ money: 10, silo: { items: { wheat: 15 } } });
  const { selling } = createSystem(state);

  assert.ok(selling.sell("wheat"));
  assert.ok(selling.sell("wheat"));
  assert.ok(selling.sell("wheat"));

  assert.equal(state.silo.items.wheat, 0);
  assert.equal(state.money, 115);
});

test("insufficient wheat blocks sale without changing inventory or money", () => {
  const state = createState({ money: 20, silo: { items: { wheat: 4 } } });
  const before = structuredClone(state);
  const { selling } = createSystem(state);

  assert.equal(selling.canSell("wheat"), false);
  assert.equal(selling.sell("wheat"), false);
  assert.deepEqual(state, before);
});

test("exactly five wheat can be sold", () => {
  const state = createState({ silo: { items: { wheat: 5 } } });
  const { selling } = createSystem(state);

  assert.ok(selling.sell("wheat"));
  assert.equal(state.silo.items.wheat, 0);
  assert.equal(state.money, 35);
});

test("unknown sale IDs are rejected without fallback", () => {
  const { selling } = createSystem();
  assert.equal(selling.has("corn"), false);
  assert.equal(selling.canSell("corn"), false);
  assert.equal(selling.sell("corn"), false);
  assert.throws(() => selling.getOffer("corn"), /Unknown sale: corn/);
});

test("failed economy credit rolls inventory back", () => {
  const state = createState();
  const inventory = new InventorySystem(state);
  const economy = {
    getValue(key) {
      assert.equal(key, "wheatSaleReward");
      return 35;
    },
    credit() { return false; },
    getBalance() { return state.money; },
  };
  const selling = new SellingSystem({ economy, inventory });

  assert.equal(selling.sell("wheat"), false);
  assert.equal(state.silo.items.wheat, 10);
  assert.equal(state.money, 0);
});

test("offer reports current live silo quantity", () => {
  const { state, selling } = createSystem();
  assert.equal(selling.getOffer("wheat").available, 10);
  state.silo.items.wheat = 7;
  assert.equal(selling.getOffer("wheat").available, 7);
});
