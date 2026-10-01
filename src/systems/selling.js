const SALE_DEFINITIONS = Object.freeze({
  wheat: Object.freeze({
    id: "wheat",
    name: "Weizen",
    container: "silo",
    item: "wheat",
    amount: 5,
    rewardKey: "wheatSaleReward",
  }),
});

export class SellingSystem {
  constructor({ economy, inventory, definitions = SALE_DEFINITIONS }) {
    if (!economy || !inventory || !definitions || typeof definitions !== "object") {
      throw new Error("SellingSystem dependencies are missing.");
    }
    this.economy = economy;
    this.inventory = inventory;
    this.definitions = definitions;
  }

  has(saleId) {
    return typeof saleId === "string"
      && Object.prototype.hasOwnProperty.call(this.definitions, saleId);
  }

  getOffer(saleId) {
    if (!this.has(saleId)) {
      throw new Error(`Unknown sale: ${saleId}`);
    }

    const definition = this.definitions[saleId];
    return {
      ...definition,
      reward: this.economy.getValue(definition.rewardKey),
      available: this.inventory.getQuantity(definition.container, definition.item),
    };
  }

  canSell(saleId) {
    if (!this.has(saleId)) return false;
    const offer = this.getOffer(saleId);
    return this.inventory.has(offer.container, offer.item, offer.amount);
  }

  sell(saleId) {
    if (!this.canSell(saleId)) return false;

    const offer = this.getOffer(saleId);
    if (!this.inventory.remove(offer.container, offer.item, offer.amount)) {
      return false;
    }

    if (!this.economy.credit(offer.reward)) {
      this.inventory.add(offer.container, offer.item, offer.amount);
      return false;
    }

    return {
      saleId,
      item: offer.item,
      amount: offer.amount,
      reward: offer.reward,
      balance: this.economy.getBalance(),
    };
  }
}
