export const CONFIG = Object.freeze({
  name: "Farm-Spiel",
  version: "0.1.0",
  build: "visual-reference-1",
  saveKey: "farm-spiel-save-v1",
  backupKey: "farm-spiel-save-v1-backup",
  autosaveMs: 15000,

  world: {
    width: 941,
    height: 1672,
    image: "./assets/world/master_world.webp",
  },

  camera: {
    startX: 500,
    startY: 650,
    startZoom: 1.05,
    minZoom: 0.52,
    maxZoom: 1.72,
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
