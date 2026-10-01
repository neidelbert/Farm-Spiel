import { CROP_DEFINITIONS } from "../data/crops.js";

export class CropSystem {
  constructor(definitions = CROP_DEFINITIONS) {
    if (!definitions || typeof definitions !== "object" || Array.isArray(definitions)) {
      throw new Error("Crop definitions are missing.");
    }
    this.definitions = definitions;
  }

  has(cropId) {
    return typeof cropId === "string"
      && Object.prototype.hasOwnProperty.call(this.definitions, cropId);
  }

  get(cropId) {
    if (!this.has(cropId)) {
      throw new Error(`Unknown crop: ${cropId}`);
    }
    return this.definitions[cropId];
  }

  list() {
    return Object.values(this.definitions);
  }

  isUnlocked(cropId, level) {
    if (!this.has(cropId) || !Number.isInteger(level) || level < 1) return false;
    return level >= this.get(cropId).unlockLevel;
  }

  listUnlocked(level) {
    if (!Number.isInteger(level) || level < 1) return [];
    return this.list().filter((crop) => level >= crop.unlockLevel);
  }

  getSeedItem(cropId) {
    return this.get(cropId).seedItem;
  }

  getHarvestItem(cropId) {
    return this.get(cropId).harvestItem;
  }

  getStorage(cropId) {
    return this.get(cropId).storage;
  }

  getGrowthDuration(cropId) {
    return this.get(cropId).growthMs;
  }

  getYieldAmount(cropId) {
    return this.get(cropId).yield;
  }

  getFertilizerRules(cropId) {
    return this.get(cropId).fertilizer;
  }

  getVisualStages(cropId) {
    return this.get(cropId).visualStages;
  }
}
