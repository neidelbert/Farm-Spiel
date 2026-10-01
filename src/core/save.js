import { CONFIG } from "../config.js";
import { FIELD_DEFINITIONS, FIELD_IDS } from "../data/fields.js";

export const CURRENT_SAVE_VERSION = 4;

const FIELD_STATUSES = new Set([
  "prepared",
  "sowing",
  "growing",
  "ready",
  "harvest_starting",
  "harvesting",
  "harvested",
]);

const WEATHER_VALUES = new Set(["sunny", "rain", "fog"]);

const LEGACY_VISUAL_SCALE = Object.freeze({
  x: 3.4,
  y: 3.23,
  speed: 3.2,
});

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

    inventory: { scrap: 1, wheatSeed: 0, fertilizer: 0 },
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

    fields: Object.fromEntries(
      FIELD_IDS.map(fieldId => [
        fieldId,
        createFieldState(FIELD_DEFINITIONS[fieldId].unlockedAtStart),
      ]),
    ),

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
  2: migrateV2ToV3,
  3: migrateV3ToV4,
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
    const copy = sanitizeState(structuredCloneSafe(state));
    copy.saveVersion = CURRENT_SAVE_VERSION;
    copy.gameVersion = CONFIG.version;
    copy.lastSavedAt = Date.now();

    const existing = localStorage.getItem(CONFIG.saveKey);
    if (existing) localStorage.setItem(CONFIG.backupKey, existing);
    localStorage.setItem(CONFIG.saveKey, JSON.stringify(copy));

    syncState(state, copy);
  }

  reset() {
    localStorage.removeItem(CONFIG.saveKey);
    localStorage.removeItem(CONFIG.backupKey);
  }
}

export function migrateAndSanitize(input) {
  if (!isPlainObject(input)) {
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

  return sanitizeState(working);
}

function migrateV1ToV2(input) {
  return {
    ...input,
    saveVersion: 2,
  };
}

function migrateV2ToV3(input) {
  const world = isPlainObject(input.world) ? { ...input.world } : {};
  const alreadyVisualMigrated = world.visualVersion === 2;
  delete world.visualVersion;

  return {
    ...input,
    saveVersion: 3,
    world,
    vehicles: alreadyVisualMigrated
      ? structuredCloneSafe(Array.isArray(input.vehicles) ? input.vehicles : [])
      : migrateLegacyVehicleCoordinates(input.vehicles),
  };
}

function migrateV3ToV4(input) {
  const legacyField = isPlainObject(input.field) ? input.field : {};
  const migrated = {
    ...input,
    saveVersion: 4,
    fields: {
      field1: { ...createFieldState(true), ...legacyField, unlocked: true },
      field2: createFieldState(false),
      field3: createFieldState(false),
    },
  };
  delete migrated.field;
  return migrated;
}

function createFieldState(unlocked) {
  return {
    unlocked: unlocked === true,
    status: "prepared",
    crop: null,
    plantedAt: null,
    readyAt: null,
    harvestProgress: 0,
    fertilized: false,
    fertilizedAt: null,
  };
}

function migrateLegacyVehicleCoordinates(vehicles) {
  if (!Array.isArray(vehicles)) return [];
  return vehicles.map(vehicle => {
    if (!isPlainObject(vehicle)) return vehicle;

    const migrated = { ...vehicle };
    if (Number.isFinite(vehicle.x)) migrated.x = vehicle.x * LEGACY_VISUAL_SCALE.x;
    if (Number.isFinite(vehicle.y)) migrated.y = vehicle.y * LEGACY_VISUAL_SCALE.y;
    if (Number.isFinite(vehicle.speed)) migrated.speed = vehicle.speed * LEGACY_VISUAL_SCALE.speed;

    if (Array.isArray(vehicle.route)) {
      migrated.route = vehicle.route.map(point => {
        if (!isPlainObject(point)) return point;
        return {
          ...point,
          x: Number.isFinite(point.x) ? point.x * LEGACY_VISUAL_SCALE.x : point.x,
          y: Number.isFinite(point.y) ? point.y * LEGACY_VISUAL_SCALE.y : point.y,
        };
      });
    }

    return migrated;
  });
}

function sanitizeState(input) {
  const base = createInitialState();
  const out = sanitizeTemplate(base, input);
  out.saveVersion = CURRENT_SAVE_VERSION;
  out.gameVersion = CONFIG.version;

  out.lastSavedAt = finiteNonNegative(input.lastSavedAt, base.lastSavedAt);
  out.level = integerAtLeast(input.level, 1, base.level);
  out.xp = finiteNonNegative(input.xp, base.xp);
  out.xpNeeded = positiveFinite(input.xpNeeded, base.xpNeeded);
  out.money = finiteNonNegative(input.money, base.money);
  out.missionStep = finiteNonNegative(input.missionStep, base.missionStep);

  out.inventory.scrap = integerNonNegative(input.inventory?.scrap, base.inventory.scrap);
  out.inventory.wheatSeed = integerNonNegative(input.inventory?.wheatSeed, base.inventory.wheatSeed);
  out.inventory.fertilizer = integerNonNegative(input.inventory?.fertilizer, base.inventory.fertilizer);

  out.silo.level = integerAtLeast(input.silo?.level, 1, base.silo.level);
  out.silo.capacity = integerAtLeast(input.silo?.capacity, 1, base.silo.capacity);
  out.silo.items.wheat = integerNonNegative(input.silo?.items?.wheat, base.silo.items.wheat);

  out.barn.level = integerAtLeast(input.barn?.level, 1, base.barn.level);
  out.barn.capacity = integerAtLeast(input.barn?.capacity, 1, base.barn.capacity);
  out.barn.items.flour = integerNonNegative(input.barn?.items?.flour, base.barn.items.flour);
  out.barn.items.eggs = integerNonNegative(input.barn?.items?.eggs, base.barn.items.eggs);
  out.barn.items.milk = integerNonNegative(input.barn?.items?.milk, base.barn.items.milk);

  out.garage.level = integerAtLeast(input.garage?.level, 1, base.garage.level);

  for (const fieldId of FIELD_IDS) {
    out.fields[fieldId] = sanitizeFieldState(
      input.fields?.[fieldId],
      base.fields[fieldId],
      FIELD_DEFINITIONS[fieldId].unlockedAtStart,
    );
  }

  out.mill.readyAt = nullableFiniteNonNegative(input.mill?.readyAt);
  out.mill.outputReady = integerNonNegative(input.mill?.outputReady, base.mill.outputReady);

  out.chickens.count = integerNonNegative(input.chickens?.count, base.chickens.count);
  out.chickens.readyAt = nullableFiniteNonNegative(input.chickens?.readyAt);
  out.chickens.eggsReady = integerNonNegative(input.chickens?.eggsReady, base.chickens.eggsReady);

  out.cows.count = integerNonNegative(input.cows?.count, base.cows.count);
  out.cows.readyAt = nullableFiniteNonNegative(input.cows?.readyAt);
  out.cows.milkReady = integerNonNegative(input.cows?.milkReady, base.cows.milkReady);

  out.world.weather = WEATHER_VALUES.has(input.world?.weather)
    ? input.world.weather
    : base.world.weather;
  out.world.timeOfDay = clampFinite(input.world?.timeOfDay, 0, 1, base.world.timeOfDay);
  out.world.timeScale = positiveFinite(input.world?.timeScale, base.world.timeScale);

  out.construction = sanitizeNullableObject(input.construction);
  out.sideOrder = sanitizeNullableObject(input.sideOrder);
  out.vehicles = sanitizeVehicles(input.vehicles);

  return out;
}

function sanitizeFieldState(value, base, unlockedAtStart) {
  const input = isPlainObject(value) ? value : {};
  const out = sanitizeTemplate(base, input);
  out.unlocked = unlockedAtStart === true;
  out.status = FIELD_STATUSES.has(input.status) ? input.status : base.status;
  out.crop = input.crop === null || typeof input.crop === "string" ? input.crop : base.crop;
  out.plantedAt = nullableFiniteNonNegative(input.plantedAt);
  out.readyAt = nullableFiniteNonNegative(input.readyAt);
  out.harvestProgress = clampFinite(input.harvestProgress, 0, 1, base.harvestProgress);
  out.fertilized = typeof input.fertilized === "boolean" ? input.fertilized : base.fertilized;
  out.fertilizedAt = nullableFiniteNonNegative(input.fertilizedAt);
  return out;
}

function sanitizeTemplate(base, extra) {
  if (Array.isArray(base)) return Array.isArray(extra) ? structuredCloneSafe(extra) : [];

  if (isPlainObject(base)) {
    const source = isPlainObject(extra) ? extra : {};
    const out = {};
    for (const key of Object.keys(base)) {
      out[key] = sanitizeTemplate(base[key], source[key]);
    }
    return out;
  }

  if (typeof base === "boolean") return typeof extra === "boolean" ? extra : base;
  if (typeof base === "string") return typeof extra === "string" ? extra : base;
  if (typeof base === "number") return Number.isFinite(extra) ? extra : base;
  if (base === null) return extra === null || extra === undefined ? null : extra;

  return base;
}

function sanitizeVehicles(value) {
  if (!Array.isArray(value)) return [];
  return value.map(sanitizeVehicle).filter(Boolean);
}

function sanitizeVehicle(vehicle) {
  if (!isPlainObject(vehicle)) return null;
  if (typeof vehicle.id !== "string" || vehicle.id.length === 0) return null;
  if (typeof vehicle.type !== "string" || vehicle.type.length === 0) return null;
  if (typeof vehicle.eventId !== "string" || vehicle.eventId.length === 0) return null;
  if (!Number.isFinite(vehicle.x) || !Number.isFinite(vehicle.y)) return null;
  if (!Number.isFinite(vehicle.speed) || vehicle.speed <= 0) return null;
  if (!Array.isArray(vehicle.route) || vehicle.route.length === 0) return null;

  const route = vehicle.route.map(sanitizeRoutePoint).filter(Boolean);
  if (route.length !== vehicle.route.length || route.length === 0) return null;

  const routeIndex = Number.isInteger(vehicle.routeIndex) && vehicle.routeIndex >= 0
    ? Math.min(vehicle.routeIndex, route.length)
    : 1;

  return {
    id: vehicle.id,
    type: vehicle.type,
    label: typeof vehicle.label === "string" ? vehicle.label : vehicle.type,
    eventId: vehicle.eventId,
    x: vehicle.x,
    y: vehicle.y,
    route,
    routeIndex,
    speed: vehicle.speed,
    waitingUntil: nullableFiniteNonNegative(vehicle.waitingUntil),
    waitStartedAt: nullableFiniteNonNegative(vehicle.waitStartedAt),
    waitDuration: finiteNonNegative(vehicle.waitDuration, 0),
    currentTag: vehicle.currentTag === null || typeof vehicle.currentTag === "string"
      ? vehicle.currentTag
      : null,
    heading: Number.isFinite(vehicle.heading) ? vehicle.heading : 0,
  };
}

function sanitizeRoutePoint(point) {
  if (!isPlainObject(point) || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    return null;
  }

  const out = { x: point.x, y: point.y };
  if (typeof point.tag === "string" && point.tag.length > 0) out.tag = point.tag;
  if (Number.isFinite(point.waitMs) && point.waitMs > 0) out.waitMs = point.waitMs;
  return out;
}

function sanitizeNullableObject(value) {
  return value === null || value === undefined
    ? null
    : isPlainObject(value)
      ? structuredCloneSafe(value)
      : null;
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

function syncState(target, source) {
  for (const key of Object.keys(target)) {
    if (!(key in source)) delete target[key];
  }
  for (const [key, value] of Object.entries(source)) {
    target[key] = structuredCloneSafe(value);
  }
}

function finiteNonNegative(value, fallback) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function integerNonNegative(value, fallback) {
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function integerAtLeast(value, min, fallback) {
  return Number.isInteger(value) && value >= min ? value : fallback;
}

function positiveFinite(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function nullableFiniteNonNegative(value) {
  return value === null || value === undefined
    ? null
    : Number.isFinite(value) && value >= 0
      ? value
      : null;
}

function clampFinite(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
