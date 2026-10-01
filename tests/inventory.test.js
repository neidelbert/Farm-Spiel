import test from "node:test";
import assert from "node:assert/strict";

import { InventorySystem } from "../src/systems/inventory.js";

function createState() {
  return {
    inventory: {
      scrap: 1,
      wheatSeed: 0,
    },
    silo: {
      capacity: 10,
      items: {
        wheat: 4,
      },
    },
    barn: {
      capacity: 4,
      items: {
        flour: 1,
        eggs: 2,
        milk: 0,
      },
    },
  };
}

test("InventorySystem reports quantities, used space and free space", () => {
  const inventory = new InventorySystem(createState());

  assert.equal(inventory.getQuantity("silo", "wheat"), 4);
  assert.equal(inventory.getUsed("silo"), 4);
  assert.equal(inventory.getCapacity("silo"), 10);
  assert.equal(inventory.getFreeSpace("silo"), 6);

  assert.equal(inventory.getUsed("barn"), 3);
  assert.equal(inventory.getFreeSpace("barn"), 1);
  assert.equal(inventory.getCapacity("inventory"), Infinity);
});

test("InventorySystem adds only when the complete amount fits", () => {
  const state = createState();
  const inventory = new InventorySystem(state);

  assert.equal(inventory.add("barn", "milk", 1), true);
  assert.equal(state.barn.items.milk, 1);
  assert.equal(inventory.getUsed("barn"), 4);

  assert.equal(inventory.add("barn", "milk", 1), false);
  assert.equal(state.barn.items.milk, 1);
  assert.equal(inventory.getUsed("barn"), 4);
});

test("InventorySystem removes items without allowing negative quantities", () => {
  const state = createState();
  const inventory = new InventorySystem(state);

  assert.equal(inventory.remove("silo", "wheat", 3), true);
  assert.equal(state.silo.items.wheat, 1);

  assert.equal(inventory.remove("silo", "wheat", 2), false);
  assert.equal(state.silo.items.wheat, 1);
});

test("InventorySystem removeMany is atomic", () => {
  const state = createState();
  const inventory = new InventorySystem(state);

  assert.equal(
    inventory.removeMany("barn", { flour: 1, eggs: 2 }),
    true,
  );
  assert.deepEqual(state.barn.items, { flour: 0, eggs: 0, milk: 0 });

  state.barn.items.flour = 1;
  state.barn.items.eggs = 1;

  assert.equal(
    inventory.removeMany("barn", { flour: 1, eggs: 2 }),
    false,
  );
  assert.deepEqual(state.barn.items, { flour: 1, eggs: 1, milk: 0 });
});

test("InventorySystem keeps general inventory unlimited", () => {
  const state = createState();
  const inventory = new InventorySystem(state);

  assert.equal(inventory.add("inventory", "wheatSeed", 5000), true);
  assert.equal(state.inventory.wheatSeed, 5000);
  assert.equal(inventory.getFreeSpace("inventory"), Infinity);
});

test("InventorySystem rejects invalid containers", () => {
  const inventory = new InventorySystem(createState());

  assert.throws(
    () => inventory.getQuantity("warehouse", "wheat"),
    /Unknown inventory container/,
  );
});
