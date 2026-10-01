const SEED_PRICE_KEYS = Object.freeze({
  wheat: "wheatSeedPrice",
});

export class PlantingSystem {
  constructor({ state, economy, inventory, fields, crops }) {
    if (!state || !economy || !inventory || !fields || !crops) {
      throw new Error("PlantingSystem dependencies are missing.");
    }
    this.state = state;
    this.economy = economy;
    this.inventory = inventory;
    this.fields = fields;
    this.crops = crops;
  }

  getSeedPrice(cropId) {
    const key = SEED_PRICE_KEYS[cropId];
    if (!key) throw new Error(`No seed price configured for crop: ${cropId}`);
    return this.economy.getValue(key);
  }

  canBuySeed(cropId) {
    if (!this.crops.isUnlocked(cropId, this.state.level)) return false;
    return this.economy.canAfford(this.getSeedPrice(cropId));
  }

  buySeed(cropId) {
    if (!this.canBuySeed(cropId)) return false;
    return this.economy.spend(this.getSeedPrice(cropId));
  }

  receiveSeed(cropId, amount = 1) {
    if (!this.crops.has(cropId) || !Number.isInteger(amount) || amount <= 0) return false;
    return this.inventory.add("inventory", this.crops.getSeedItem(cropId), amount);
  }

  canStartSowing(cropId) {
    if (!this.crops.isUnlocked(cropId, this.state.level)) return false;
    return this.fields.is("prepared")
      && this.inventory.has("inventory", this.crops.getSeedItem(cropId), 1);
  }

  startSowing(cropId) {
    if (!this.canStartSowing(cropId)) return false;
    return this.fields.startSowing();
  }

  completeSowing(cropId, plantedAt = Date.now()) {
    if (!this.crops.isUnlocked(cropId, this.state.level)) return false;
    if (!this.fields.is("sowing") || !Number.isFinite(plantedAt)) return false;

    const seedItem = this.crops.getSeedItem(cropId);
    if (!this.inventory.has("inventory", seedItem, 1)) return false;

    const readyAt = plantedAt + this.crops.getGrowthDuration(cropId);
    if (!this.inventory.remove("inventory", seedItem, 1)) return false;

    if (this.fields.startGrowing({ crop: cropId, plantedAt, readyAt })) return true;

    this.inventory.add("inventory", seedItem, 1);
    return false;
  }
}
