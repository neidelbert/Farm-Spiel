export class FertilizerSystem {
  constructor({ state, economy, inventory, fields, crops }) {
    if (!state || !economy || !inventory || !fields || !crops) {
      throw new Error("FertilizerSystem dependencies are missing.");
    }
    this.state = state;
    this.economy = economy;
    this.inventory = inventory;
    this.fields = fields;
    this.crops = crops;
  }

  getRules(cropId) {
    if (!this.crops.has(cropId)) throw new Error(`Unknown crop: ${cropId}`);
    const rules = this.crops.getFertilizerRules(cropId);
    if (!rules || typeof rules !== "object") {
      throw new Error(`No fertilizer rules configured for crop: ${cropId}`);
    }
    return rules;
  }

  isUnlocked(cropId) {
    const rules = this.getRules(cropId);
    return Number.isInteger(this.state.level) && this.state.level >= rules.unlockLevel;
  }

  getOffer(cropId) {
    const rules = this.getRules(cropId);
    return {
      cropId,
      item: rules.item,
      packSize: rules.packSize,
      price: this.economy.getValue(rules.priceKey),
      unlockLevel: rules.unlockLevel,
      available: this.inventory.getQuantity("inventory", rules.item),
    };
  }

  canBuyPack(cropId) {
    if (!this.isUnlocked(cropId)) return false;
    const offer = this.getOffer(cropId);
    return this.economy.canAfford(offer.price);
  }

  buyPack(cropId) {
    if (!this.canBuyPack(cropId)) return false;
    const offer = this.getOffer(cropId);

    if (!this.economy.spend(offer.price)) return false;
    if (this.inventory.add("inventory", offer.item, offer.packSize)) {
      return {
        item: offer.item,
        amount: offer.packSize,
        cost: offer.price,
        balance: this.economy.getBalance(),
      };
    }

    this.economy.credit(offer.price);
    return false;
  }

  getFieldStatus(now = Date.now()) {
    const cropId = this.fields.getCrop();
    if (!cropId || !this.crops.has(cropId)) {
      return {
        cropId: null,
        unlocked: false,
        fertilized: false,
        available: 0,
        remainingMs: 0,
        cutoffRemainingMs: 0,
        canApply: false,
        reason: "no_crop",
      };
    }

    const rules = this.getRules(cropId);
    const remainingMs = Number.isFinite(this.state.field.readyAt)
      ? Math.max(0, this.state.field.readyAt - now)
      : 0;
    const available = this.inventory.getQuantity("inventory", rules.item);
    const unlocked = this.isUnlocked(cropId);
    const fertilized = this.state.field.fertilized === true;

    let reason = "ready";
    if (!unlocked) reason = "locked";
    else if (!this.fields.is("growing")) reason = "not_growing";
    else if (fertilized) reason = "already_fertilized";
    else if (!Number.isFinite(this.state.field.readyAt)) reason = "no_timer";
    else if (remainingMs <= rules.cutoffRemainingMs) reason = "too_late";
    else if (available < 1) reason = "no_fertilizer";

    return {
      cropId,
      unlocked,
      fertilized,
      available,
      remainingMs,
      cutoffRemainingMs: rules.cutoffRemainingMs,
      canApply: reason === "ready",
      reason,
    };
  }

  canApply(now = Date.now()) {
    return this.getFieldStatus(now).canApply;
  }

  apply(now = Date.now()) {
    const status = this.getFieldStatus(now);
    if (!status.canApply) return false;

    const rules = this.getRules(status.cropId);
    const oldReadyAt = this.state.field.readyAt;
    const newReadyAt = Math.min(oldReadyAt, now + rules.growthMs);

    if (!this.inventory.remove("inventory", rules.item, 1)) return false;

    if (!this.fields.applyFertilizer({ appliedAt: now, readyAt: newReadyAt })) {
      this.inventory.add("inventory", rules.item, 1);
      return false;
    }

    return {
      cropId: status.cropId,
      item: rules.item,
      consumed: 1,
      appliedAt: now,
      oldReadyAt,
      readyAt: newReadyAt,
      remainingMs: Math.max(0, newReadyAt - now),
    };
  }
}
