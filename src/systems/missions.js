import { MISSION_TEXT, TUTORIAL_FLOW } from "../data/missions.js";

const LEVEL_BY_MISSION = new Map(
  TUTORIAL_FLOW.map(entry => [entry.missionId, entry.level]),
);

export class MissionSystem {
  constructor(state) { this.state = state; }

  has(id) {
    return typeof id === "string"
      && Object.prototype.hasOwnProperty.call(MISSION_TEXT, id);
  }

  current() {
    return MISSION_TEXT[this.state.missionId] || MISSION_TEXT.tutorial_done;
  }

  set(id, step = 0) {
    if (!this.has(id) || !Number.isFinite(step) || step < 0) return false;
    this.state.missionId = id;
    this.state.missionStep = step;
    return true;
  }

  getExpectedLevel(id) {
    return LEVEL_BY_MISSION.get(id) ?? null;
  }

  canAdvanceTo(level, missionId) {
    return Number.isInteger(level)
      && level >= 1
      && this.getExpectedLevel(missionId) === level;
  }

  advanceTo(level, missionId) {
    if (!this.canAdvanceTo(level, missionId)) return false;
    this.state.level = level;
    this.state.xp = 0;
    this.state.xpNeeded = Math.max(100, Math.round(100 + (level - 1) * 35));
    if (!this.set(missionId, 0)) return false;
    if (missionId === "tutorial_done") this.state.tutorialComplete = true;
    return true;
  }

  levelUp(level, nextMission) {
    return this.advanceTo(level, nextMission);
  }
}
