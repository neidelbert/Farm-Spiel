import { POINTS } from "../data/worldData.js";

const DEFAULT_SPEEDS = {
  scrap_truck: 210,
  flatbed: 185,
  post_van: 235,
  delivery_van: 220,
  builder_van: 210,
  animal_transport: 190,
  tractor: 125,
  combine: 95,
};

export class VehicleSystem {
  constructor({ state, events }) {
    this.state = state;
    this.events = events;
  }

  spawn({ id, type, eventId, route, speed, label }) {
    const start = route[0] || POINTS.spawn;
    const vehicle = {
      id,
      type,
      label: label || type,
      eventId,
      x: start.x,
      y: start.y,
      route: route.map(p => ({...p})),
      routeIndex: 1,
      speed: speed || DEFAULT_SPEEDS[type] || 180,
      waitingUntil: null,
      waitStartedAt: null,
      waitDuration: 0,
      currentTag: null,
      heading: 0,
    };
    this.state.vehicles.push(vehicle);
    this.events.emit("vehicle:spawn", vehicle);
    return vehicle;
  }

  update(dt, now) {
    for (const v of [...this.state.vehicles]) {
      if (v.waitingUntil) {
        if (now >= v.waitingUntil) {
          const tag = v.currentTag;
          v.waitingUntil = null;
          v.waitStartedAt = null;
          v.waitDuration = 0;
          v.currentTag = null;
          if (tag) this.events.emit("vehicle:leaveWaypoint", { vehicle:v, tag });
          v.routeIndex += 1;
        }
        continue;
      }

      const target = v.route[v.routeIndex];
      if (!target) {
        this.finish(v);
        continue;
      }

      const dx = target.x - v.x;
      const dy = target.y - v.y;
      const dist = Math.hypot(dx,dy);
      v.heading = Math.atan2(dy,dx);
      const step = v.speed * dt;

      if (dist <= Math.max(step, 4)) {
        v.x = target.x;
        v.y = target.y;
        if (target.tag) {
          v.currentTag = target.tag;
          this.events.emit("vehicle:arriveWaypoint", { vehicle:v, tag:target.tag });
        }

        if (target.waitMs) {
          v.waitStartedAt = now;
          v.waitDuration = target.waitMs;
          v.waitingUntil = now + target.waitMs;
        } else {
          if (target.tag) this.events.emit("vehicle:leaveWaypoint", { vehicle:v, tag:target.tag });
          v.currentTag = null;
          v.routeIndex += 1;
        }
      } else {
        v.x += (dx/dist) * step;
        v.y += (dy/dist) * step;
      }
    }
  }

  finish(vehicle) {
    const index = this.state.vehicles.findIndex(v => v.id === vehicle.id);
    if (index >= 0) this.state.vehicles.splice(index,1);
    this.events.emit("vehicle:complete", vehicle);
  }

  hasEvent(eventId) {
    return this.state.vehicles.some(v => v.eventId === eventId);
  }

  waitProgress(vehicle) {
    if (!vehicle.waitingUntil || !vehicle.waitDuration) return 0;
    return Math.max(0, Math.min(1, (Date.now()-vehicle.waitStartedAt)/vehicle.waitDuration));
  }
}

export function routeTo(target, { tag, waitMs=0 } = {}) {
  const p = POINTS;
  const common = [
    {x:p.spawn.x,y:p.spawn.y},
    {x:p.roadNorth.x,y:p.roadNorth.y},
    {x:p.millJunction.x,y:p.millJunction.y},
    {x:p.loading.x,y:p.loading.y},
  ];

  const targetPoint = {...target, tag, waitMs};
  if (target.x === p.loading.x && target.y === p.loading.y) {
    return [...common.slice(0,-1), targetPoint, ...common.slice(0,-1).reverse(), {x:p.spawn.x,y:p.spawn.y}];
  }

  return [...common, targetPoint, ...common.reverse(), {x:p.spawn.x,y:p.spawn.y}];
}

export function farmMachineRoute(points) {
  return points.map(p => ({...p}));
}
