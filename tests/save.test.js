import test from "node:test";
import assert from "node:assert/strict";

import { CONFIG } from "../src/config.js";
import {
  CURRENT_SAVE_VERSION,
  SaveManager,
  createInitialState,
  migrateAndSanitize,
} from "../src/core/save.js";

function installLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
  return store;
}

test("new games use save schema version 2", () => {
  const state = createInitialState();
  assert.equal(CURRENT_SAVE_VERSION, 2);
  assert.equal(state.saveVersion, 2);
  assert.equal(state.gameVersion, CONFIG.version);
});

test("legacy v1 save migrates to v2 while preserving player progress", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 1,
    gameVersion: "0.2.0",
    level: 7,
    money: 321,
    missionId: "workshop_chickens",
    missionStep: 1,
    inventory: { scrap: 0, wheatSeed: 3 },
    silo: { level: 2, capacity: 60, items: { wheat: 27 } },
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: 1000,
      readyAt: 301000,
      harvestProgress: 0,
    },
    vehicles: [{ id: "delivery_1", route: [{ x: 10, y: 20 }] }],
  });

  assert.equal(migrated.saveVersion, 2);
  assert.equal(migrated.gameVersion, CONFIG.version);
  assert.equal(migrated.level, 7);
  assert.equal(migrated.money, 321);
  assert.equal(migrated.missionId, "workshop_chickens");
  assert.equal(migrated.inventory.wheatSeed, 3);
  assert.equal(migrated.silo.items.wheat, 27);
  assert.equal(migrated.field.status, "growing");
  assert.equal(migrated.field.readyAt, 301000);
  assert.equal(migrated.vehicles.length, 1);
});

test("pre-versioned legacy saves are treated as schema v1", () => {
  const migrated = migrateAndSanitize({
    level: 4,
    money: 80,
    silo: { items: { wheat: 10 } },
  });

  assert.equal(migrated.saveVersion, 2);
  assert.equal(migrated.level, 4);
  assert.equal(migrated.money, 80);
  assert.equal(migrated.silo.items.wheat, 10);
});

test("current v2 save can be loaded repeatedly without changing progress", () => {
  const input = createInitialState();
  input.level = 9;
  input.money = 555;
  input.inventory.wheatSeed = 2;

  const once = migrateAndSanitize(input);
  const twice = migrateAndSanitize(once);

  assert.equal(once.saveVersion, 2);
  assert.equal(twice.saveVersion, 2);
  assert.equal(twice.level, 9);
  assert.equal(twice.money, 555);
  assert.equal(twice.inventory.wheatSeed, 2);
});

test("future save versions are rejected instead of being silently downgraded", () => {
  assert.throws(
    () => migrateAndSanitize({ saveVersion: 3, level: 99 }),
    /Unsupported future save version: 3/,
  );
});

test("invalid save version values are rejected", () => {
  assert.throws(
    () => migrateAndSanitize({ saveVersion: "2", level: 3 }),
    /Invalid save version/,
  );
  assert.throws(
    () => migrateAndSanitize({ saveVersion: 0, level: 3 }),
    /Invalid save version/,
  );
});

test("SaveManager.save always writes the current schema and preserves previous save as backup", () => {
  const oldPrimary = JSON.stringify({ saveVersion: 1, level: 3, money: 50 });
  const store = installLocalStorage({ [CONFIG.saveKey]: oldPrimary });
  const manager = new SaveManager();
  const state = createInitialState();
  state.saveVersion = 1;
  state.level = 8;
  state.money = 400;

  manager.save(state);

  const saved = JSON.parse(store.get(CONFIG.saveKey));
  assert.equal(saved.saveVersion, 2);
  assert.equal(saved.level, 8);
  assert.equal(saved.money, 400);
  assert.equal(state.saveVersion, 2);
  assert.equal(store.get(CONFIG.backupKey), oldPrimary);
});

test("SaveManager.load falls back to backup when primary uses unsupported future schema", () => {
  installLocalStorage({
    [CONFIG.saveKey]: JSON.stringify({ saveVersion: 99, level: 99 }),
    [CONFIG.backupKey]: JSON.stringify({ saveVersion: 1, level: 6, money: 210 }),
  });

  const manager = new SaveManager();
  const state = manager.load();

  assert.equal(state.saveVersion, 2);
  assert.equal(state.level, 6);
  assert.equal(state.money, 210);
});

test("SaveManager.load falls back to a new game when both save slots are unusable", () => {
  installLocalStorage({
    [CONFIG.saveKey]: "{broken-json",
    [CONFIG.backupKey]: JSON.stringify({ saveVersion: 42, level: 42 }),
  });

  const manager = new SaveManager();
  const state = manager.load();

  assert.equal(state.saveVersion, 2);
  assert.equal(state.level, 1);
  assert.equal(state.money, 0);
});
