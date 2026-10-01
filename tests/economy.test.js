import test from "node:test";
import assert from "node:assert/strict";

import { EconomySystem } from "../src/systems/economy.js";

test("EconomySystem reads the current balance and canonical values", () => {
  const state = { money: 100 };
  const economy = new EconomySystem(state);

  assert.equal(economy.getBalance(), 100);
  assert.equal(economy.getValue("wheatSeedPrice"), 10);
  assert.equal(economy.getValue("scrapReward"), 100);
});

test("EconomySystem spends atomically and rejects overdrafts", () => {
  const state = { money: 100 };
  const economy = new EconomySystem(state);

  assert.equal(economy.canAfford(60), true);
  assert.equal(economy.spend(60), true);
  assert.equal(state.money, 40);

  assert.equal(economy.spend(41), false);
  assert.equal(state.money, 40);
});

test("EconomySystem credits valid amounts and rejects invalid values", () => {
  const state = { money: 25 };
  const economy = new EconomySystem(state);

  assert.equal(economy.credit(35), true);
  assert.equal(state.money, 60);

  assert.equal(economy.credit(-1), false);
  assert.equal(economy.spend(Number.NaN), false);
  assert.equal(state.money, 60);
});

test("EconomySystem rejects unknown economy keys", () => {
  const economy = new EconomySystem({ money: 0 });

  assert.throws(
    () => economy.getValue("notARealEconomyKey"),
    /Unknown or invalid economy value/,
  );
});
