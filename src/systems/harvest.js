export class HarvestSystem {
  constructor({ state, inventory, fields, crops }) {
    if (!state || !inventory || !fields || !crops) {
      throw new Error("HarvestSystem dependencies are missing.");
    }
    this.state = state;
    this.inventory = inventory;
    this.fields = fields;
    this.crops = crops;
  }

  getPlan() {
    const cropId = this.fields.getCrop();
    if (!cropId || !this.crops.has(cropId)) return null;

    const yieldAmount = this.crops.getYieldAmount(cropId);
    const harvestItem = this.crops.getHarvestItem(cropId);
    const storage = this.crops.getStorage(cropId);
    const freeSpace = this.inventory.getFreeSpace(storage);

    return {
      cropId,
      yieldAmount,
      harvestItem,
      storage,
      freeSpace,
      machineAvailable: this.state.machines?.combine === true,
      storageFits: this.inventory.canAdd(storage, yieldAmount),
    };
  }

  canStartHarvest() {
    const plan = this.getPlan();
    return this.fields.is("ready")
      && plan !== null
      && plan.machineAvailable
      && plan.storageFits;
  }

  startHarvest() {
    if (!this.canStartHarvest()) return false;
    return this.fields.startHarvest();
  }

  markHarvesting() {
    return this.fields.markHarvesting();
  }

  finishCutting() {
    return this.fields.markHarvested();
  }

  canStoreHarvest() {
    const plan = this.getPlan();
    return this.fields.is("harvested")
      && plan !== null
      && plan.storageFits;
  }

  storeHarvest() {
    if (!this.canStoreHarvest()) return false;

    const plan = this.getPlan();
    if (!this.inventory.add(plan.storage, plan.harvestItem, plan.yieldAmount)) {
      return false;
    }

    if (this.fields.resetPrepared()) return true;

    this.inventory.remove(plan.storage, plan.harvestItem, plan.yieldAmount);
    return false;
  }
}
