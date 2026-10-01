import test from "node:test";
import assert from "node:assert/strict";

import {
  MISSION_TEXT,
  TUTORIAL_FLOW,
  TUTORIAL_MISSION_IDS,
} from "../src/data/missions.js";
import { MissionSystem } from "../src/systems/missions.js";

const EXPECTED_FLOW = [
  ["scrap_sale", 1],
  ["friend_gift", 2],
  ["first_seed", 3],
  ["first_harvest", 4],
  ["first_order", 5],
  ["storage_upgrade", 6],
  ["miller_intro", 6],
  ["workshop_chickens", 7],
  ["eggs_baker", 8],
  ["cows_milk", 9],
  ["tutorial_done", 10],
];

function createState(overrides = {}) {
  return {
    level: 1,
    xp: 0,
    xpNeeded: 100,
    missionId: "scrap_sale",
    missionStep: 0,
    tutorialComplete: false,
    ...overrides,
  };
}

test("tutorial flow is explicit and covers levels 1 through 10", () => {
  assert.deepEqual(
    TUTORIAL_FLOW.map(entry => [entry.missionId, entry.level]),
    EXPECTED_FLOW,
  );
  assert.deepEqual(
    [...new Set(TUTORIAL_FLOW.map(entry => entry.level))],
    [1,2,3,4,5,6,7,8,9,10],
  );
});

test("every tutorial mission has matching mission text", () => {
  assert.deepEqual(
    [...TUTORIAL_MISSION_IDS].sort(),
    Object.keys(MISSION_TEXT).sort(),
  );
});

test("set rejects unknown missions and invalid steps without mutation", () => {
  const state = createState();
  const missions = new MissionSystem(state);
  const before = structuredClone(state);

  assert.equal(missions.set("missing", 0), false);
  assert.deepEqual(state, before);
  assert.equal(missions.set("first_seed", -1), false);
  assert.deepEqual(state, before);
});

test("same-level storage to miller transition is valid", () => {
  const state = createState({ level: 6, missionId: "storage_upgrade" });
  const missions = new MissionSystem(state);

  assert.equal(missions.canAdvanceTo(6, "miller_intro"), true);
  assert.equal(missions.advanceTo(6, "miller_intro"), true);
  assert.equal(state.level, 6);
  assert.equal(state.missionId, "miller_intro");
  assert.equal(state.missionStep, 0);
});

test("invalid level mission pair leaves progression unchanged", () => {
  const state = createState({ level: 5, missionId: "first_order", missionStep: 0.5 });
  const missions = new MissionSystem(state);
  const before = structuredClone(state);

  assert.equal(missions.advanceTo(8, "cows_milk"), false);
  assert.deepEqual(state, before);
});

test("tutorial completion is centralized at level 10", () => {
  const state = createState({ level: 9, missionId: "cows_milk", xp: 77, missionStep: 1 });
  const missions = new MissionSystem(state);

  assert.equal(missions.advanceTo(10, "tutorial_done"), true);
  assert.equal(state.level, 10);
  assert.equal(state.missionId, "tutorial_done");
  assert.equal(state.missionStep, 0);
  assert.equal(state.xp, 0);
  assert.equal(state.xpNeeded, 415);
  assert.equal(state.tutorialComplete, true);
});
