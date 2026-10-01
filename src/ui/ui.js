import { CONFIG } from "../config.js";

export class UI {
  constructor() {
    this.el = {
      level: document.querySelector("#hudLevel"),
      xp: document.querySelector("#hudXp"),
      money: document.querySelector("#hudMoney"),
      tutorialFocus: document.querySelector("#tutorialFocusBtn"),
      menuBtn: document.querySelector("#menuBtn"),
      sheet: document.querySelector("#sheet"),
      sheetEyebrow: document.querySelector("#sheetEyebrow"),
      sheetTitle: document.querySelector("#sheetTitle"),
      sheetBody: document.querySelector("#sheetBody"),
      sheetActions: document.querySelector("#sheetActions"),
      sheetClose: document.querySelector("#sheetClose"),
      menu: document.querySelector("#menu"),
      version: document.querySelector("#versionLabel"),
      toast: document.querySelector("#toastRoot"),
      boot: document.querySelector("#boot"),
      bootText: document.querySelector("#bootText"),
      devBadge: document.querySelector("#devBadge"),
      devPanel: document.querySelector("#devPanel"),
      devClose: document.querySelector("#devClose"),
      devStats: document.querySelector("#devStats"),
    };
    this.el.version.textContent = CONFIG.version;
    this.handlers = {};
    this.el.sheetClose.addEventListener("click", () => this.closeSheet());
  }

  bind(name, fn) { this.handlers[name] = fn; }

  updateHUD(state) {
    this.el.level.textContent = String(state.level);
    this.el.money.textContent = new Intl.NumberFormat("de-DE").format(state.money);
    const pct = Math.max(0,Math.min(100,(state.xp/state.xpNeeded)*100));
    this.el.xp.style.width = `${pct}%`;
    this.el.devBadge.classList.toggle("hidden", !state.settings.dev);
    this.el.tutorialFocus?.classList.toggle("hidden", state.tutorialComplete === true);
  }

  panel({eyebrow="",title,body="",actions=[]}) {
    this.el.sheetEyebrow.textContent = eyebrow;
    this.el.sheetTitle.textContent = title;
    this.el.sheetBody.innerHTML = body;
    this.el.sheetActions.innerHTML = "";
    for (const a of actions) {
      const b = document.createElement("button");
      b.textContent = a.label;
      if (a.secondary) b.classList.add("secondary");
      b.disabled = !!a.disabled;
      b.addEventListener("click", () => a.onClick?.());
      this.el.sheetActions.appendChild(b);
    }
    this.el.sheet.classList.remove("hidden");
  }

  closeSheet() { this.el.sheet.classList.add("hidden"); }

  toast(message, ms=2600) {
    const d = document.createElement("div");
    d.className = "toast";
    d.textContent = message;
    this.el.toast.appendChild(d);
    window.setTimeout(()=>d.remove(),ms);
  }

  showMenu(show=true) { this.el.menu.classList.toggle("hidden",!show); }
  showDev(show=true) { this.el.devPanel.classList.toggle("hidden",!show); }
  setBoot(text) { this.el.bootText.textContent = text; }
  hideBoot() { this.el.boot.classList.add("hidden"); }

  setDevStats(text) { this.el.devStats.textContent = text; }
}
