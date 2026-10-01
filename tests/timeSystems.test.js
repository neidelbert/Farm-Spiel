import test from "node:test";
import assert from "node:assert/strict";

import { CONFIG } from "../src/config.js";
import { TimeSystems } from "../src/systems/timeSystems.js";

const HOUR = 60 * 60 * 1000;

function createState(overrides = {}) {
  const base = {
    lastSavedAt: 1_000_000,
    world: { timeOfDay: 0.36, timeScale: 1 },
    field: {
      status: "prepared",
      crop: null,
      plantedAt: null,
      readyAt: null,
      harvestProgress: 0,
    },
    mill: { busy: false, readyAt: null, outputReady: 0 },
    chickens: { fed: false, readyAt: null, eggsReady: 0 },
    cows: { fed: false, readyAt: null, milkReady: 0 },
    construction: null,
    vehicles: [],
  };
  return {
    ...base,
    ...overrides,
    world: { ...base.world, ...(overrides.world || {}) },
    field: { ...base.field, ...(overrides.field || {}) },
    mill: { ...base.mill, ...(overrides.mill || {}) },
    chickens: { ...base.chickens, ...(overrides.chickens || {}) },
    cows: { ...base.cows, ...(overrides.cows || {}) },
  };
}

function createEvents() {
  const emitted = [];
  return {
    emitted,
    emit(name, payload) { emitted.push({ name, payload }); },
  };
}

test("offline cap is exactly 24 hours", () => {
  const time = new TimeSystems(createState(), createEvents());
  assert.equal(time.getOfflineCapMs(), 24 * HOUR);
  assert.equal(CONFIG.timings.offlineCapMs, 24 * HOUR);
});

test("field growth completes at its absolute ready timestamp", () => {
  const events = createEvents();
  const state = createState({
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: 1_000_000,
      readyAt: 1_300_000,
      harvestProgress: 0,
    },
  });
  const time = new TimeSystems(state, events);

  time.update(0, 1_299_999);
  assert.equal(state.field.status, "growing");

  time.update(0, 1_300_000);
  assert.equal(state.field.status, "ready");
  assert.equal(state.field.readyAt, null);
  assert.equal(events.emitted.filter(e => e.name === "field:ready").length, 1);
});

test("offline progress below the cap completes eligible timers", () => {
  const savedAt = 1_000_000;
  const now = savedAt + 2 * HOUR;
  const events = createEvents();
  const state = createState({
    lastSavedAt: savedAt,
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: savedAt,
      readyAt: savedAt + 5 * 60 * 1000,
      harvestProgress: 0,
    },
    mill: { busy: true, readyAt: savedAt + 30_000, outputReady: 0 },
    chickens: { fed: true, readyAt: savedAt + 60_000, eggsReady: 0 },
    cows: { fed: true, readyAt: savedAt + 75_000, milkReady: 0 },
    construction: { building: "silo", startAt: savedAt, endAt: savedAt + 30_000 },
  });
  const time = new TimeSystems(state, events);
  const result = time.reconcileOffline(now);

  assert.equal(result.capped, false);
  assert.equal(result.appliedElapsedMs, 2 * HOUR);
  assert.equal(state.field.status, "ready");
  assert.equal(state.mill.busy, false);
  assert.equal(state.mill.outputReady, 2);
  assert.equal(state.chickens.eggsReady, 4);
  assert.equal(state.cows.milkReady, 2);
  assert.equal(state.construction, null);
});

test("offline progress beyond 24 hours is capped and unfinished timers are rebased", () => {
  const savedAt = 1_000_000;
  const now = savedAt + 72 * HOUR;
  const state = createState({
    lastSavedAt: savedAt,
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: savedAt,
      readyAt: savedAt + 30 * HOUR,
      harvestProgress: 0,
    },
  });
  const time = new TimeSystems(state, createEvents());
  const result = time.reconcileOffline(now);

  assert.equal(result.capped, true);
  assert.equal(result.appliedElapsedMs, 24 * HOUR);
  assert.equal(state.field.status, "growing");
  assert.equal(state.field.readyAt - now, 6 * HOUR);
  assert.equal(state.field.plantedAt, savedAt + 48 * HOUR);
  assert.equal(state.lastSavedAt, now);
});

test("a short crop still becomes ready after a very long absence", () => {
  const savedAt = 1_000_000;
  const now = savedAt + 72 * HOUR;
  const state = createState({
    lastSavedAt: savedAt,
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: savedAt,
      readyAt: savedAt + 5 * 60 * 1000,
      harvestProgress: 0,
    },
  });
  const time = new TimeSystems(state, createEvents());
  time.reconcileOffline(now);
  assert.equal(state.field.status, "ready");
});

test("vehicles do not travel or finish waypoint waits while offline", () => {
  const savedAt = 1_000_000;
  const now = savedAt + 5 * HOUR;
  const state = createState({
    lastSavedAt: savedAt,
    vehicles: [{
      id: "post_1",
      x: 100,
      y: 200,
      route: [{ x: 100, y: 200 }, { x: 300, y: 400 }],
      routeIndex: 1,
      waitingUntil: savedAt + 5_000,
      waitStartedAt: savedAt,
      waitDuration: 5_000,
      currentTag: "seed_delivery",
    }],
  });
  const time = new TimeSystems(state, createEvents());
  const result = time.reconcileOffline(now);

  assert.equal(result.vehiclePolicy, "paused");
  assert.equal(state.vehicles[0].x, 100);
  assert.equal(state.vehicles[0].y, 200);
  assert.equal(state.vehicles[0].routeIndex, 1);
  assert.equal(state.vehicles[0].waitStartedAt, now);
  assert.equal(state.vehicles[0].waitingUntil, now + 5_000);
});

test("DEV timeScale accelerates absolute field and production timers consistently", () => {
  const now = 1_000_000;
  const state = createState({
    world: { timeScale: 20, timeOfDay: 0.36 },
    field: {
      status: "growing",
      crop: "wheat",
      plantedAt: now,
      readyAt: now + 300_000,
      harvestProgress: 0,
    },
    mill: { busy: true, readyAt: now + 45_000, outputReady: 0 },
    chickens: { fed: true, readyAt: now + 60_000, eggsReady: 0 },
    cows: { fed: true, readyAt: now + 75_000, milkReady: 0 },
    construction: { building: "silo", startAt: now, endAt: now + 30_000 },
    vehicles: [{
      waitingUntil: now + 10_000,
      waitStartedAt: now,
      waitDuration: 10_000,
    }],
  });
  const time = new TimeSystems(state, createEvents());

  time.update(1, now + 1_000);

  assert.equal(state.field.plantedAt, now - 19_000);
  assert.equal(state.field.readyAt, now + 281_000);
  assert.equal(state.mill.readyAt, now + 26_000);
  assert.equal(state.chickens.readyAt, now + 41_000);
  assert.equal(state.cows.readyAt, now + 56_000);
  assert.equal(state.construction.startAt, now - 19_000);
  assert.equal(state.construction.endAt, now + 11_000);
  assert.equal(state.vehicles[0].waitStartedAt, now - 19_000);
  assert.equal(state.vehicles[0].waitingUntil, now - 9_000);
});

test("forceFinishAll completes active domain timers without moving vehicles", () => {
  const now = 1_000_000;
  const events = createEvents();
  const state = createState({
    field: { status: "growing", crop: "wheat", plantedAt: now - 1_000, readyAt: now + HOUR, harvestProgress: 0 },
    mill: { busy: true, readyAt: now + HOUR, outputReady: 0 },
    chickens: { fed: true, readyAt: now + HOUR, eggsReady: 0 },
    cows: { fed: true, readyAt: now + HOUR, milkReady: 0 },
    construction: { building: "garage", startAt: now, endAt: now + HOUR },
    vehicles: [{ x: 50, y: 60, waitingUntil: now + HOUR, waitStartedAt: now, waitDuration: HOUR }],
  });
  const time = new TimeSystems(state, events);

  time.forceFinishAll(now);

  assert.equal(state.field.status, "ready");
  assert.equal(state.mill.busy, false);
  assert.equal(state.chickens.fed, false);
  assert.equal(state.cows.fed, false);
  assert.equal(state.construction, null);
  assert.equal(state.vehicles[0].x, 50);
  assert.equal(state.vehicles[0].y, 60);
  assert.equal(state.vehicles[0].waitingUntil, now + HOUR);
});
