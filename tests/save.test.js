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

function activeVehicle(overrides = {}) {
  return {
    id: "post_1",
    type: "post_van",
    label: "Post",
    eventId: "seed_delivery",
    x: 100,
    y: 200,
    route: [
      { x: 100, y: 200 },
      { x: 300, y: 400, tag: "seed_delivery", waitMs: 3500 },
    ],
    routeIndex: 1,
    speed: 88,
    waitingUntil: null,
    waitStartedAt: null,
    waitDuration: 0,
    currentTag: null,
    heading: 0,
    ...overrides,
  };
}

test("new games use save schema version 3", () => {
  const state = createInitialState();
  assert.equal(CURRENT_SAVE_VERSION, 3);
  assert.equal(state.saveVersion, 3);
  assert.equal(state.gameVersion, CONFIG.version);
  assert.equal("visualVersion" in state.world, false);
});

test("legacy v1 save migrates through v2 to v3 and scales unmarked vehicle coordinates once", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 1,
    gameVersion: "0.2.0",
    level: 7,
    money: 321,
    missionId: "workshop_chickens",
    inventory: { wheatSeed: 3 },
    silo: { items: { wheat: 27 } },
    world: { weather: "sunny" },
    vehicles: [activeVehicle()],
  });

  assert.equal(migrated.saveVersion, 3);
  assert.equal(migrated.level, 7);
  assert.equal(migrated.money, 321);
  assert.equal(migrated.inventory.wheatSeed, 3);
  assert.equal(migrated.silo.items.wheat, 27);
  assert.equal(migrated.vehicles.length, 1);
  assert.equal(migrated.vehicles[0].x, 340);
  assert.equal(migrated.vehicles[0].y, 646);
  assert.equal(migrated.vehicles[0].speed, 281.6);
  assert.equal(migrated.vehicles[0].route[1].x, 1020);
  assert.equal(migrated.vehicles[0].route[1].y, 1292);
  assert.equal("visualVersion" in migrated.world, false);
});

test("v2 save already marked visualVersion 2 is not scaled again", () => {
  const vehicle = activeVehicle({ x: 340, y: 646, speed: 281.6 });
  vehicle.route = [
    { x: 340, y: 646 },
    { x: 1020, y: 1292, tag: "seed_delivery", waitMs: 3500 },
  ];

  const migrated = migrateAndSanitize({
    saveVersion: 2,
    world: { weather: "sunny", visualVersion: 2 },
    vehicles: [vehicle],
  });

  assert.equal(migrated.saveVersion, 3);
  assert.equal(migrated.vehicles[0].x, 340);
  assert.equal(migrated.vehicles[0].y, 646);
  assert.equal(migrated.vehicles[0].speed, 281.6);
  assert.equal(migrated.vehicles[0].route[1].x, 1020);
  assert.equal(migrated.vehicles[0].route[1].y, 1292);
  assert.equal("visualVersion" in migrated.world, false);
});

test("v2 save without visual marker receives the legacy coordinate migration", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 2,
    world: { weather: "sunny" },
    vehicles: [activeVehicle()],
  });

  assert.equal(migrated.vehicles[0].x, 340);
  assert.equal(migrated.vehicles[0].y, 646);
  assert.equal(migrated.vehicles[0].speed, 281.6);
  assert.equal(migrated.vehicles[0].route[0].x, 340);
  assert.equal(migrated.vehicles[0].route[0].y, 646);
});

test("v3 saves are idempotent and never rescale vehicles on repeated loads", () => {
  const input = createInitialState();
  input.vehicles = [activeVehicle({ x: 340, y: 646, speed: 281.6 })];
  input.vehicles[0].route = [
    { x: 340, y: 646 },
    { x: 1020, y: 1292, tag: "seed_delivery", waitMs: 3500 },
  ];

  const once = migrateAndSanitize(input);
  const twice = migrateAndSanitize(once);

  assert.equal(once.saveVersion, 3);
  assert.equal(twice.saveVersion, 3);
  assert.equal(twice.vehicles[0].x, 340);
  assert.equal(twice.vehicles[0].y, 646);
  assert.equal(twice.vehicles[0].speed, 281.6);
  assert.equal(twice.vehicles[0].route[1].x, 1020);
  assert.equal(twice.vehicles[0].route[1].y, 1292);
});

test("pre-versioned legacy saves are treated as v1 and reach v3", () => {
  const migrated = migrateAndSanitize({
    level: 4,
    money: 80,
    silo: { items: { wheat: 10 } },
  });

  assert.equal(migrated.saveVersion, 3);
  assert.equal(migrated.level, 4);
  assert.equal(migrated.money, 80);
  assert.equal(migrated.silo.items.wheat, 10);
});

test("future save versions are rejected instead of being silently downgraded", () => {
  assert.throws(
    () => migrateAndSanitize({ saveVersion: 4, level: 99 }),
    /Unsupported future save version: 4/,
  );
});

test("invalid save version values are rejected", () => {
  assert.throws(
    () => migrateAndSanitize({ saveVersion: "3", level: 3 }),
    /Invalid save version/,
  );
  assert.throws(
    () => migrateAndSanitize({ saveVersion: 0, level: 3 }),
    /Invalid save version/,
  );
});

test("unknown root and nested fields are removed", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 3,
    level: 3,
    hackedRoot: "remove-me",
    silo: {
      level: 1,
      capacity: 40,
      items: { wheat: 5, corn: 999 },
      hiddenOverflow: 99,
    },
    world: {
      weather: "sunny",
      visualVersion: 2,
      hiddenFlag: true,
    },
  });

  assert.equal("hackedRoot" in migrated, false);
  assert.equal("hiddenOverflow" in migrated.silo, false);
  assert.equal("corn" in migrated.silo.items, false);
  assert.equal("hiddenFlag" in migrated.world, false);
  assert.equal("visualVersion" in migrated.world, false);
});

test("invalid primitive types fall back to safe defaults", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 3,
    level: "10",
    money: -50,
    tutorialComplete: "yes",
    settings: { dev: "true" },
    machines: { combine: "yes" },
    silo: { capacity: 0, items: { wheat: -4 } },
  });

  assert.equal(migrated.level, 1);
  assert.equal(migrated.money, 0);
  assert.equal(migrated.tutorialComplete, false);
  assert.equal(migrated.settings.dev, false);
  assert.equal(migrated.machines.combine, true);
  assert.equal(migrated.silo.capacity, 40);
  assert.equal(migrated.silo.items.wheat, 0);
});

test("field and world values are clamped or reset to valid ranges", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 3,
    field: {
      status: "teleporting",
      crop: 123,
      plantedAt: -5,
      readyAt: Number.NaN,
      harvestProgress: 9,
    },
    world: {
      weather: "storm",
      timeOfDay: 4,
      timeScale: 0,
    },
  });

  assert.equal(migrated.field.status, "prepared");
  assert.equal(migrated.field.crop, null);
  assert.equal(migrated.field.plantedAt, null);
  assert.equal(migrated.field.readyAt, null);
  assert.equal(migrated.field.harvestProgress, 1);
  assert.equal(migrated.world.weather, "sunny");
  assert.equal(migrated.world.timeOfDay, 1);
  assert.equal(migrated.world.timeScale, 1);
});

test("malformed vehicles are removed but valid active vehicles survive", () => {
  const valid = activeVehicle({ unknownVehicleField: "drop" });

  const migrated = migrateAndSanitize({
    saveVersion: 3,
    vehicles: [
      valid,
      { id: "broken", type: "post_van", eventId: "x", x: 0, y: 0, speed: 0, route: [] },
      "not-a-vehicle",
    ],
  });

  assert.equal(migrated.vehicles.length, 1);
  assert.equal(migrated.vehicles[0].id, "post_1");
  assert.equal("unknownVehicleField" in migrated.vehicles[0], false);
});

test("invalid vehicle route point invalidates the whole vehicle", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 3,
    vehicles: [{
      ...activeVehicle(),
      route: [{ x: 100, y: 200 }, { x: "bad", y: 400 }],
    }],
  });

  assert.deepEqual(migrated.vehicles, []);
});

test("construction and sideOrder accept only objects or null", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 3,
    construction: "broken",
    sideOrder: 123,
  });

  assert.equal(migrated.construction, null);
  assert.equal(migrated.sideOrder, null);
});

test("SaveManager.save writes schema v3 without the old visual marker", () => {
  const oldPrimary = JSON.stringify({ saveVersion: 2, level: 3, money: 50, world: { visualVersion: 2 } });
  const store = installLocalStorage({ [CONFIG.saveKey]: oldPrimary });
  const manager = new SaveManager();
  const state = createInitialState();

  state.level = 8;
  state.money = 400;
  state.unknownRoot = "drop";
  state.silo.items.wheat = -10;
  state.world.visualVersion = 2;

  manager.save(state);

  const saved = JSON.parse(store.get(CONFIG.saveKey));
  assert.equal(saved.saveVersion, 3);
  assert.equal(saved.level, 8);
  assert.equal(saved.money, 400);
  assert.equal(saved.silo.items.wheat, 0);
  assert.equal("visualVersion" in saved.world, false);
  assert.equal("visualVersion" in state.world, false);
  assert.equal("unknownRoot" in saved, false);
  assert.equal(store.get(CONFIG.backupKey), oldPrimary);
});

test("SaveManager.load falls back to backup when primary uses unsupported future schema", () => {
  installLocalStorage({
    [CONFIG.saveKey]: JSON.stringify({ saveVersion: 99, level: 99 }),
    [CONFIG.backupKey]: JSON.stringify({ saveVersion: 2, level: 6, money: 210, world: { visualVersion: 2 } }),
  });

  const manager = new SaveManager();
  const state = manager.load();

  assert.equal(state.saveVersion, 3);
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

  assert.equal(state.saveVersion, 3);
  assert.equal(state.level, 1);
  assert.equal(state.money, 0);
});


test("schema v3 adds fertilizer defaults to older current saves", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 3,
    level: 4,
    inventory: { scrap: 0, wheatSeed: 1 },
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: 1000,
      readyAt: 301000,
      harvestProgress: 0,
    },
  });

  assert.equal(migrated.inventory.fertilizer, 0);
  assert.equal(migrated.field.fertilized, false);
  assert.equal(migrated.field.fertilizedAt, null);
});

test("schema v3 preserves valid fertilizer inventory and field application state", () => {
  const migrated = migrateAndSanitize({
    saveVersion: 3,
    level: 4,
    inventory: { scrap: 0, wheatSeed: 0, fertilizer: 3 },
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: 1000,
      readyAt: 121000,
      harvestProgress: 0,
      fertilized: true,
      fertilizedAt: 1000,
    },
  });

  assert.equal(migrated.inventory.fertilizer, 3);
  assert.equal(migrated.field.fertilized, true);
  assert.equal(migrated.field.fertilizedAt, 1000);
});
