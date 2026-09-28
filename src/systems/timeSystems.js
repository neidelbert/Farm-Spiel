import { CONFIG } from "../config.js";

export class TimeSystems {
  constructor(state, events) {
    this.state = state;
    this.events = events;
  }

  update(dt, now) {
    const s = this.state;
    const scale = s.world.timeScale || 1;

    s.world.timeOfDay = (s.world.timeOfDay + dt * scale / (40 * 60)) % 1;

    if (s.field.status === "growing" && s.field.readyAt && now >= s.field.readyAt) {
      s.field.status = "ready";
      s.field.readyAt = null;
      this.events.emit("field:ready");
    }

    if (s.mill.busy && s.mill.readyAt && now >= s.mill.readyAt) {
      s.mill.busy = false;
      s.mill.readyAt = null;
      s.mill.outputReady += 2;
      this.events.emit("mill:ready");
    }

    if (s.chickens.fed && s.chickens.readyAt && now >= s.chickens.readyAt) {
      s.chickens.fed = false;
      s.chickens.readyAt = null;
      s.chickens.eggsReady += 4;
      this.events.emit("chickens:ready");
    }

    if (s.cows.fed && s.cows.readyAt && now >= s.cows.readyAt) {
      s.cows.fed = false;
      s.cows.readyAt = null;
      s.cows.milkReady += 2;
      this.events.emit("cows:ready");
    }

    if (s.construction && s.construction.endAt && now >= s.construction.endAt) {
      const finished = s.construction;
      s.construction = null;
      this.events.emit("construction:complete", finished);
    }
  }

  reconcileOffline(now=Date.now()) {
    this.update(0, now);
  }

  forceFinishAll() {
    const now = Date.now();
    const s = this.state;
    if (s.field.status === "growing") s.field.readyAt = now-1;
    if (s.mill.busy) s.mill.readyAt = now-1;
    if (s.chickens.fed) s.chickens.readyAt = now-1;
    if (s.cows.fed) s.cows.readyAt = now-1;
    if (s.construction) s.construction.endAt = now-1;
    this.update(0,now);
  }
}
