const WHEAT_VISUAL_STAGES = Object.freeze([
  Object.freeze({ maxProgress: 0.20, assetCatalogIndex: 134 }),
  Object.freeze({ maxProgress: 0.45, assetCatalogIndex: 135 }),
  Object.freeze({ maxProgress: 0.70, assetCatalogIndex: 136 }),
  Object.freeze({ maxProgress: 1.00, assetCatalogIndex: 137 }),
]);

const WHEAT_FERTILIZER = Object.freeze({
  unlockLevel: 4,
  growthMs: 2 * 60 * 1000,
  cutoffRemainingMs: 2 * 60 * 1000 + 20 * 1000,
});

export const CROP_DEFINITIONS = Object.freeze({
  wheat: Object.freeze({
    id: "wheat",
    name: "Weizen",
    seedItem: "wheatSeed",
    harvestItem: "wheat",
    storage: "silo",
    unlockLevel: 1,
    growthMs: 5 * 60 * 1000,
    yield: 10,
    fertilizer: WHEAT_FERTILIZER,
    visualStages: WHEAT_VISUAL_STAGES,
  }),
});
