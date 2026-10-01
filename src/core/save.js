import { CONFIG } from "../config.js";

export const CURRENT_SAVE_VERSION = 2;

export function createInitialState() {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
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

const MIGRATIONS = Object.freeze({
  1: migrateV1ToV2,
});

export class SaveManager {
  load() {
    const primary = readStoredSave(CONFIG.saveKey);
    if (primary !== null) {
      try {
        return migrateAndSanitize(primary);
      } catch (error) {
        console.warn("Save defekt oder inkompatibel, Backup wird versucht.", error);
      }
    }

    const backup = readStoredSave(CONFIG.backupKey);
    if (backup !== null) {
      try {
        return migrateAndSanitize(backup);
      } catch (error) {
        console.warn("Backup defekt oder inkompatibel.", error);
      }
    }

    return createInitialState();
  }

  save(state) {
    const copy = structuredCloneSafe(state);
    copy.saveVersion = CURRENT_SAVE_VERSION;
    copy.gameVersion = CONFIG.version;
    copy.lastSavedAt = Date.now();

    const existing = localStorage.getItem(CONFIG.saveKey);
    if (existing) localStorage.setItem(CONFIG.backupKey, existing);
    localStorage.setItem(CONFIG.saveKey, JSON.stringify(copy));

    state.saveVersion = copy.saveVersion;
    state.gameVersion = copy.gameVersion;
    state.lastSavedAt = copy.lastSavedAt;
  }

  reset() {
    localStorage.removeItem(CONFIG.saveKey);
    localStorage.removeItem(CONFIG.backupKey);
  }
}

export function migrateAndSanitize(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Save payload must be an object.");
  }

  let working = structuredCloneSafe(input);
  let version = getSaveVersion(working);

  if (version > CURRENT_SAVE_VERSION) {
    throw new Error(`Unsupported future save version: ${version}`);
  }

  while (version < CURRENT_SAVE_VERSION) {
    const migration = MIGRATIONS[version];
    if (typeof migration !== "function") {
      throw new Error(`Missing save migration from version ${version}.`);
    }

    working = migration(working);
    const nextVersion = getSaveVersion(working);
    if (nextVersion <= version) {
      throw new Error(`Save migration ${version} did not advance the schema.`);
    }
    version = nextVersion;
  }

  const base = createInitialState();
  const merged = deepMerge(base, working);
  merged.gameVersion = CONFIG.version;
  merged.saveVersion = CURRENT_SAVE_VERSION;
  if (!Array.isArray(merged.vehicles)) merged.vehicles = [];
  return merged;
}

function migrateV1ToV2(input) {
  return {
    ...input,
    saveVersion: 2,
  };
}

function getSaveVersion(input) {
  if (input.saveVersion === undefined || input.saveVersion === null) return 1;
  if (!Number.isInteger(input.saveVersion) || input.saveVersion < 1) {
    throw new Error(`Invalid save version: ${input.saveVersion}`);
  }
  return input.saveVersion;
}

function readStoredSave(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Save-Slot ${key} enthält ungültiges JSON.`, error);
    return null;
  }
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
