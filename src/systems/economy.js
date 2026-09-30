import { CONFIG } from "../config.js";

export class EconomySystem {
  constructor(state) {
    this.state = state;
  }

  getBalance() {
    return Number.isFinite(this.state.money) ? this.state.money : 0;
  }

  getValue(key) {
    const value = CONFIG.economy?.[key];
    if (!Number.isFinite(value)) {
      throw new Error(`Unknown or invalid economy value: ${key}`);
    }
    return value;
  }

  canAfford(amount) {
    return this.#isValidAmount(amount)
      && Number.isFinite(this.state.money)
      && this.state.money >= amount;
  }

  spend(amount) {
    if (!this.canAfford(amount)) return false;
    this.state.money -= amount;
    return true;
  }

  credit(amount) {
    if (!this.#isValidAmount(amount) || !Number.isFinite(this.state.money)) return false;
    this.state.money += amount;
    return true;
  }

  #isValidAmount(amount) {
    return typeof amount === "number" && Number.isFinite(amount) && amount >= 0;
  }
}
