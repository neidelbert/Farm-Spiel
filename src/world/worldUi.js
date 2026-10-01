import { FIELD_IDS } from "../data/fields.js";
import { getTutorialTarget } from "../systems/tutorialGuidance.js";

export function collectWorldEventIcons(state) {
  const icons = [];
  const tutorialTarget = getTutorialTarget(state);
  if (tutorialTarget) icons.push({ ...tutorialTarget, icon:"★", kind:"tutorial" });

  for (const fieldId of FIELD_IDS) {
    const field = state.fields?.[fieldId] ?? (fieldId === "field1" ? state.field : null);
    if (!field || ("unlocked" in field && field.unlocked !== true)) continue;
    if (field.status === "ready") icons.push({ id:fieldId, icon:"🌾" });
    else if (field.status === "growing") icons.push({ id:fieldId, icon:"⏱" });
  }

  if (state.mill.outputReady > 0) icons.push({ id:"mill", icon:"📦" });

  if (state.chickens.eggsReady > 0) {
    icons.push({ id:"coop", icon:"🥚" });
  } else if (state.chickens.unlocked && !state.chickens.fed && state.missionId === "eggs_baker") {
    icons.push({ id:"coop", icon:"🌾" });
  }

  if (state.cows.milkReady > 0) {
    icons.push({ id:"cowpen", icon:"🥛" });
  } else if (state.cows.unlocked && !state.cows.fed && state.missionId === "cows_milk") {
    icons.push({ id:"cowpen", icon:"🌾" });
  }

  if (state.missionId === "storage_upgrade" && !state.construction) {
    icons.push({ id:"silo", icon:"⬆" });
  }
  if (state.missionId === "workshop_chickens" && !state.construction && state.garage.level < 2) {
    icons.push({ id:"garage", icon:"⬆" });
  }
  if (state.missionId === "miller_intro" && state.mill.unlocked) {
    icons.push({ id:"mill", icon:"⚙" });
  }
  if (
    state.missionId === "eggs_baker"
    && state.bakery.unlocked
    && state.barn.items.eggs >= 2
    && state.barn.items.flour >= 1
  ) {
    icons.push({ id:"bakery", icon:"!" });
  }
  if (
    state.missionId === "cows_milk"
    && state.barn.items.milk >= 1
    && state.barn.items.flour >= 1
  ) {
    icons.push({ id:"bakery", icon:"!" });
  }

  return icons;
}

export function getWorldEventIconPosition(interactions, id, now = 0) {
  const target = interactions?.get?.(id);
  if (!target?.bounds) return null;

  const bounds = target.bounds;
  return {
    x: (bounds.left + bounds.right) / 2,
    y: bounds.top - 18 - Math.sin(now / 350) * 2,
  };
}

export function createWorldFocusDestinations(world, viewportWidth, viewportHeight) {
  if (!world || !Number.isFinite(world.width) || !Number.isFinite(world.height)) {
    throw new Error("World dimensions are required for focus destinations.");
  }

  const source = world.destinations || {};
  const result = {};

  for (const key of ["hof", "dorf", "hafen"]) {
    const destination = source[key];
    if (!isDestination(destination)) continue;
    result[key] = Object.freeze({
      x: destination.x,
      y: destination.y,
      zoom: destination.zoom,
    });
  }

  const width = positiveFinite(viewportWidth, 1);
  const height = positiveFinite(viewportHeight, 1);
  result.overview = Object.freeze({
    x: world.width / 2,
    y: world.height / 2,
    zoom: Math.min(
      width / (world.width + 100),
      height / (world.height + 150),
    ),
  });

  return Object.freeze(result);
}

function isDestination(value) {
  return Boolean(value)
    && Number.isFinite(value.x)
    && Number.isFinite(value.y)
    && Number.isFinite(value.zoom)
    && value.zoom > 0;
}

function positiveFinite(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
