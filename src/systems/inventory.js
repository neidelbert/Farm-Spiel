export class InventorySystem {
  constructor(state) {
    this.state = state;
  }

  getQuantity(container, item) {
    const items = this.#getItems(container);
    const value = items[item];
    return Number.isInteger(value) && value >= 0 ? value : 0;
  }

  getUsed(container) {
    return Object.values(this.#getItems(container)).reduce(
      (sum, value) => sum + (Number.isInteger(value) && value > 0 ? value : 0),
      0,
    );
  }

  getCapacity(container) {
    const capacity = this.#getCapacityValue(container);
    return capacity === null ? Infinity : capacity;
  }

  getFreeSpace(container) {
    const capacity = this.getCapacity(container);
    return capacity === Infinity
      ? Infinity
      : Math.max(0, capacity - this.getUsed(container));
  }

  has(container, item, amount = 1) {
    return this.#isValidAmount(amount, true)
      && this.getQuantity(container, item) >= amount;
  }

  hasAll(container, requirements) {
    const entries = this.#requirements(requirements);
    return entries !== null
      && entries.length > 0
      && entries.every(([item, amount]) => this.has(container, item, amount));
  }

  canAdd(container, amount = 1) {
    return this.#isValidAmount(amount, true)
      && this.getFreeSpace(container) >= amount;
  }

  add(container, item, amount = 1) {
    if (!this.#isValidItem(item)
      || !this.#isValidAmount(amount)
      || !this.canAdd(container, amount)) {
      return false;
    }

    const items = this.#getItems(container);
    items[item] = this.getQuantity(container, item) + amount;
    return true;
  }

  remove(container, item, amount = 1) {
    if (!this.#isValidItem(item)
      || !this.#isValidAmount(amount)
      || !this.has(container, item, amount)) {
      return false;
    }

    const items = this.#getItems(container);
    items[item] = this.getQuantity(container, item) - amount;
    return true;
  }

  removeMany(container, requirements) {
    const entries = this.#requirements(requirements);
    if (entries === null
      || entries.length === 0
      || !entries.every(([item, amount]) => this.has(container, item, amount))) {
      return false;
    }

    const items = this.#getItems(container);
    for (const [item, amount] of entries) {
      items[item] = this.getQuantity(container, item) - amount;
    }
    return true;
  }

  #getItems(container) {
    switch (container) {
      case "inventory":
        if (!this.state.inventory || typeof this.state.inventory !== "object") {
          throw new Error("Inventory container is missing.");
        }
        return this.state.inventory;
      case "silo":
        if (!this.state.silo?.items || typeof this.state.silo.items !== "object") {
          throw new Error("Silo container is missing.");
        }
        return this.state.silo.items;
      case "barn":
        if (!this.state.barn?.items || typeof this.state.barn.items !== "object") {
          throw new Error("Barn container is missing.");
        }
        return this.state.barn.items;
      default:
        throw new Error(`Unknown inventory container: ${container}`);
    }
  }

  #getCapacityValue(container) {
    if (container === "inventory") return null;

    const owner = container === "silo"
      ? this.state.silo
      : container === "barn"
        ? this.state.barn
        : null;

    if (!owner) {
      this.#getItems(container);
    }

    const capacity = owner?.capacity;
    return Number.isInteger(capacity) && capacity >= 0 ? capacity : 0;
  }

  #requirements(requirements) {
    if (!requirements || typeof requirements !== "object" || Array.isArray(requirements)) {
      return null;
    }

    const entries = Object.entries(requirements);
    if (!entries.every(([item, amount]) =>
      this.#isValidItem(item) && this.#isValidAmount(amount))) {
      return null;
    }

    return entries;
  }

  #isValidItem(item) {
    return typeof item === "string" && item.length > 0;
  }

  #isValidAmount(amount, allowZero = false) {
    return Number.isInteger(amount) && (allowZero ? amount >= 0 : amount > 0);
  }
}
