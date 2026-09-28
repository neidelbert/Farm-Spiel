export const CONFIG = Object.freeze({
  name: "Farm-Spiel",
  version: "0.1.0",
  saveKey: "farm-spiel-save-v1",
  backupKey: "farm-spiel-save-v1-backup",
  autosaveMs: 15000,

  world: {
    width: 2600,
    height: 4200,
  },

  camera: {
    startX: 1320,
    startY: 2100,
    startZoom: 0.72,
    minZoom: 0.42,
    maxZoom: 1.75,
    inertia: 7.5,
  },

  timings: {
    wheatGrowthMs: 4 * 60 * 1000,
    sowWaitMs: 12000,
    harvestWaitMs: 20000,
    unloadWaitMs: 4500,
    constructionMs: 30000,
    flourMs: 45000,
    eggsMs: 60000,
    milkMs: 75000,
  },

  economy: {
    scrapReward: 100,
    wheatSeedPrice: 10,
    wheatYield: 10,
    firstOrderReward: 35,
    siloUpgrade: 60,
    millerReward: 100,
    garageUpgrade: 100,
    bakerEggReward: 80,
    bakerMilkReward: 120,
  },
});
