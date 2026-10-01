import { MISSION_TEXT } from "../data/missions.js";

export function getTutorialObjective(state) {
  if (!state || state.tutorialComplete === true) return null;
  const mission = MISSION_TEXT[state.missionId];
  if (!mission) return null;
  return Object.freeze({ title: mission.title, step: mission.goal });
}

export function getTutorialTarget(state) {
  if (!state || state.tutorialComplete === true) return null;

  const step = Number.isFinite(state.missionStep) ? state.missionStep : 0;
  const barnItems = state.barn?.items || {};

  switch (state.missionId) {
    case "scrap_sale":
    case "friend_gift":
      return marker(step > 0 ? "loading" : "farmhouse", step > 0 ? "Zufahrt" : "Hof");

    case "first_seed":
      if (step === 0) return marker("farmhouse", "Hofkatalog");
      if (step < 1) return marker("loading", "Lieferung");
      return marker("field1", "Feld 1");

    case "first_harvest":
      return marker("field1", "Feld 1");

    case "first_order":
      return marker("loading", "Verkauf");

    case "storage_upgrade":
      return marker("silo", "Silo");

    case "miller_intro":
      return step < 1
        ? marker("farmhouse", "Hof")
        : marker("mill", "Mühle");

    case "workshop_chickens":
      return state.garage?.level >= 2
        ? marker("coop", "Hühner")
        : marker("garage", "Werkstatt");

    case "eggs_baker":
      if ((barnItems.eggs ?? 0) < 2) return marker("coop", "Hühner");
      if ((barnItems.flour ?? 0) < 1) return marker("mill", "Mühle");
      return marker("bakery", "Bäcker");

    case "cows_milk":
      if (state.cows?.unlocked !== true) {
        return step > 0 ? marker("cowpen", "Kuhweide") : marker("farmhouse", "Hof");
      }
      if ((barnItems.milk ?? 0) < 1) return marker("cowpen", "Kuhweide");
      if ((barnItems.flour ?? 0) < 1) return marker("mill", "Mühle");
      return marker("bakery", "Bäcker");

    default:
      return null;
  }
}

function marker(id, label) {
  return Object.freeze({ id, label });
}
