import { CONFIG } from "../config.js";

export function createInitialState() {
  return {
    saveVersion: 1,
    gameVersion: CONFIG.version,
    lastSavedAt: Date.now(),
    level: 1,
    xp: 0,
    xpNeeded: 100,
    money: 0,
    missionId: "scrap_sale",
    missionStep: 0,
    tutorialComplete: false,
    achievements: { firstHarvest:false, firstEggs:false, tutorialDone:false },

    inventory: { scrap: 1, wheatSeed: 0 },
    silo: { level: 1, capacity: 40, items: { wheat: 0 } },
    barn: { level: 1, capacity: 30, items: { flour: 0, eggs: 0, milk: 0 } },
    garage: { level: 1 },

    machines: {
      tractor: false,
      tractorRestored: false,
      seeder: false,
      combine: true,
      combineRestored: false,
    },

    field: {
      status: "prepared",
      crop: null,
      plantedAt: null,
      readyAt: null,
      harvestProgress: 0,
    },

    mill: { unlocked: false, busy: false, readyAt: null, outputReady: 0 },
    bakery: { unlocked: false },

    chickens: { unlocked: false, count: 0, fed: false, readyAt: null, eggsReady: 0 },
    cows: { unlocked: false, count: 0, fed: false, readyAt: null, milkReady: 0 },

    construction: null,
    sideOrder: null,
    vehicles: [],

    world: {
      scrapVisible: true,
      weather: "sunny",
      timeOfDay: 0.36,
      timeScale: 1,
      debug: false,
    },

    settings: {
      dev: false,
    },
  };
}

export class SaveManager {
  load() {
    const raw = localStorage.getItem(CONFIG.saveKey);
    if (!raw) return createInitialState();

    try {
      const parsed = JSON.parse(raw);
      return migrateAndSanitize(parsed);
    } catch (error) {
      console.warn("Save defekt, Backup wird versucht.", error);
      const backup = localStorage.getItem(CONFIG.backupKey);
      if (backup) {
        try { return migrateAndSanitize(JSON.parse(backup)); } catch {}
      }
      return createInitialState();
    }
  }

  save(state) {
    const copy = structuredCloneSafe(state);
    copy.lastSavedAt = Date.now();

    const existing = localStorage.getItem(CONFIG.saveKey);
    if (existing) localStorage.setItem(CONFIG.backupKey, existing);
    localStorage.setItem(CONFIG.saveKey, JSON.stringify(copy));
    state.lastSavedAt = copy.lastSavedAt;
  }

  reset() {
    localStorage.removeItem(CONFIG.saveKey);
    localStorage.removeItem(CONFIG.backupKey);
  }
}

function migrateAndSanitize(input) {
  const base = createInitialState();
  const merged = deepMerge(base, input || {});
  merged.gameVersion = CONFIG.version;
  merged.saveVersion = 1;
  if (!Array.isArray(merged.vehicles)) merged.vehicles = [];
  return merged;
}

function deepMerge(base, extra) {
  if (Array.isArray(base)) return Array.isArray(extra) ? extra : base;
  if (base && typeof base === "object") {
    const out = { ...base };
    for (const [key, value] of Object.entries(extra || {})) {
      if (key in base && base[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
        out[key] = deepMerge(base[key], value);
      } else {
        out[key] = value;
      }
    }
    return out;
  }
  return extra ?? base;
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
