import { MISSION_TEXT } from "../data/missions.js";

export class MissionSystem {
  constructor(state) { this.state = state; }

  current() {
    return MISSION_TEXT[this.state.missionId] || MISSION_TEXT.tutorial_done;
  }

  set(id, step=0) {
    this.state.missionId = id;
    this.state.missionStep = step;
  }

  levelUp(level, nextMission, xp=100) {
    this.state.xp += xp;
    this.state.level = level;
    this.state.xpNeeded = Math.max(100, Math.round(100 + (level-1)*35));
    this.state.xp = 0;
    this.set(nextMission,0);
  }
}
