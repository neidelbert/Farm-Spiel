import test from "node:test";
import assert from "node:assert/strict";

import { getTutorialObjective, getTutorialTarget } from "../src/systems/tutorialGuidance.js";

function state(overrides = {}) {
  const base = {
    tutorialComplete: false,
    missionId: "scrap_sale",
    missionStep: 0,
    garage: { level: 1 },
    cows: { unlocked: false },
    barn: { items: { eggs: 0, flour: 0, milk: 0 } },
  };
  return {
    ...base,
    ...overrides,
    garage: { ...base.garage, ...(overrides.garage || {}) },
    cows: { ...base.cows, ...(overrides.cows || {}) },
    barn: {
      ...base.barn,
      ...(overrides.barn || {}),
      items: { ...base.barn.items, ...(overrides.barn?.items || {}) },
    },
  };
}

test("completed tutorial has no guidance target", () => {
  assert.equal(getTutorialTarget(state({ tutorialComplete: true })), null);
});

test("opening missions move guidance from the hof to the loading area once started", () => {
  assert.deepEqual(getTutorialTarget(state({ missionId: "scrap_sale" })), { id:"farmhouse", label:"Hof" });
  assert.deepEqual(getTutorialTarget(state({ missionId: "scrap_sale", missionStep:.5 })), { id:"loading", label:"Zufahrt" });
  assert.deepEqual(getTutorialTarget(state({ missionId: "friend_gift", missionStep:.5 })), { id:"loading", label:"Zufahrt" });
});

test("first seed guidance follows catalog delivery and field steps", () => {
  assert.deepEqual(getTutorialTarget(state({ missionId:"first_seed", missionStep:0 })), { id:"farmhouse", label:"Hofkatalog" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"first_seed", missionStep:.5 })), { id:"loading", label:"Lieferung" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"first_seed", missionStep:1 })), { id:"field1", label:"Feld 1" });
});

test("fixed core missions point to their real world interaction", () => {
  assert.deepEqual(getTutorialTarget(state({ missionId:"first_harvest" })), { id:"field1", label:"Feld 1" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"first_order" })), { id:"loading", label:"Verkauf" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"storage_upgrade" })), { id:"silo", label:"Silo" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"miller_intro", missionStep:1 })), { id:"mill", label:"Mühle" });
});

test("workshop guidance moves to chickens after the workshop is upgraded", () => {
  assert.deepEqual(getTutorialTarget(state({ missionId:"workshop_chickens" })), { id:"garage", label:"Werkstatt" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"workshop_chickens", garage:{level:2} })), { id:"coop", label:"Hühner" });
});

test("egg mission routes from chickens to mill to baker as requirements are met", () => {
  assert.deepEqual(getTutorialTarget(state({ missionId:"eggs_baker" })), { id:"coop", label:"Hühner" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"eggs_baker", barn:{items:{eggs:2}} })), { id:"mill", label:"Mühle" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"eggs_baker", barn:{items:{eggs:2,flour:1}} })), { id:"bakery", label:"Bäcker" });
});

test("cow mission guides delivery cowpen flour and baker stages", () => {
  assert.deepEqual(getTutorialTarget(state({ missionId:"cows_milk" })), { id:"farmhouse", label:"Hof" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"cows_milk", missionStep:.5 })), { id:"cowpen", label:"Kuhweide" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"cows_milk", missionStep:1, cows:{unlocked:true} })), { id:"cowpen", label:"Kuhweide" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"cows_milk", cows:{unlocked:true}, barn:{items:{milk:1}} })), { id:"mill", label:"Mühle" });
  assert.deepEqual(getTutorialTarget(state({ missionId:"cows_milk", cows:{unlocked:true}, barn:{items:{milk:1,flour:1}} })), { id:"bakery", label:"Bäcker" });
});

test("unknown mission fails closed without a marker", () => {
  assert.equal(getTutorialTarget(state({ missionId:"unknown" })), null);
});

test("objective exposes the current mission title and goal", () => {
  assert.deepEqual(getTutorialObjective(state({ missionId:"first_seed" })), {
    title:"Die erste Saat",
    step:"Bestelle Weizensaat und säe dein erstes Feld mit dem Traktor.",
  });
});

test("objective follows mission changes automatically", () => {
  assert.deepEqual(getTutorialObjective(state({ missionId:"storage_upgrade" })), {
    title:"Mehr Platz",
    step:"Verbessere das Silo auf Level 2. Ein Handwerkerfahrzeug baut es sichtbar aus.",
  });
});

test("objective is hidden for completed or unknown tutorial states", () => {
  assert.equal(getTutorialObjective(state({ tutorialComplete:true })), null);
  assert.equal(getTutorialObjective(state({ missionId:"unknown" })), null);
});
