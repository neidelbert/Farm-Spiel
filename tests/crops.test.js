import test from "node:test";
import assert from "node:assert/strict";

import { CROP_DEFINITIONS } from "../src/data/crops.js";
import { CropSystem } from "../src/systems/crops.js";

test("default crop catalog contains only the current wheat crop", () => {
  const crops = new CropSystem();
  assert.deepEqual(crops.list().map((crop) => crop.id), ["wheat"]);
});

test("wheat keeps the existing seed, harvest and storage IDs", () => {
  const crops = new CropSystem();
  assert.equal(crops.getSeedItem("wheat"), "wheatSeed");
  assert.equal(crops.getHarvestItem("wheat"), "wheat");
  assert.equal(crops.getStorage("wheat"), "silo");
});

test("wheat is unlocked from level one", () => {
  const crops = new CropSystem();
  assert.equal(crops.isUnlocked("wheat", 1), true);
  assert.equal(crops.isUnlocked("wheat", 10), true);
});

test("invalid levels never unlock crops", () => {
  const crops = new CropSystem();
  assert.equal(crops.isUnlocked("wheat", 0), false);
  assert.equal(crops.isUnlocked("wheat", 1.5), false);
  assert.equal(crops.isUnlocked("wheat", Number.NaN), false);
});

test("unknown crop IDs are reported without silent fallback", () => {
  const crops = new CropSystem();
  assert.equal(crops.has("corn"), false);
  assert.throws(() => crops.get("corn"), /Unknown crop: corn/);
});

test("listUnlocked respects per-crop unlock levels", () => {
  const definitions = Object.freeze({
    wheat: CROP_DEFINITIONS.wheat,
    carrot: Object.freeze({
      ...CROP_DEFINITIONS.wheat,
      id: "carrot",
      name: "Karotte",
      seedItem: "carrotSeed",
      harvestItem: "carrot",
      unlockLevel: 10,
    }),
  });
  const crops = new CropSystem(definitions);
  assert.deepEqual(crops.listUnlocked(1).map((crop) => crop.id), ["wheat"]);
  assert.deepEqual(crops.listUnlocked(10).map((crop) => crop.id), ["wheat", "carrot"]);
});

test("wheat centralizes the target five-minute growth duration", () => {
  const crops = new CropSystem();
  assert.equal(crops.getGrowthDuration("wheat"), 5 * 60 * 1000);
});

test("wheat centralizes the existing harvest yield", () => {
  const crops = new CropSystem();
  assert.equal(crops.getYieldAmount("wheat"), 10);
});

test("wheat centralizes fertilizer rules", () => {
  const rules = new CropSystem().getFertilizerRules("wheat");
  assert.deepEqual(rules, {
    item: "fertilizer",
    packSize: 2,
    priceKey: "fertilizerPackPrice",
    unlockLevel: 4,
    growthMs: 2 * 60 * 1000,
    cutoffRemainingMs: 2 * 60 * 1000 + 20 * 1000,
  });
});

test("wheat centralizes four ordered growing visual stages", () => {
  const stages = new CropSystem().getVisualStages("wheat");
  assert.deepEqual(stages.map((stage) => stage.maxProgress), [0.20, 0.45, 0.70, 1.00]);
  assert.deepEqual(stages.map((stage) => stage.assetCatalogIndex), [134, 135, 136, 137]);
});

test("crop definitions and nested rules remain immutable", () => {
  assert.equal(Object.isFrozen(CROP_DEFINITIONS), true);
  assert.equal(Object.isFrozen(CROP_DEFINITIONS.wheat), true);
  assert.equal(Object.isFrozen(CROP_DEFINITIONS.wheat.fertilizer), true);
  assert.equal(Object.isFrozen(CROP_DEFINITIONS.wheat.visualStages), true);
  assert.equal(Object.isFrozen(CROP_DEFINITIONS.wheat.visualStages[0]), true);
});

test("constructor rejects an invalid crop catalog", () => {
  assert.throws(() => new CropSystem(null), /Crop definitions are missing/);
  assert.throws(() => new CropSystem([]), /Crop definitions are missing/);
});
