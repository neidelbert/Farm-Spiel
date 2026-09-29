import { POINTS } from "../data/worldData.js";

const DEFAULT_SPEEDS = {
  scrap_truck: 78,
  flatbed: 68,
  post_van: 88,
  delivery_van: 82,
  builder_van: 78,
  animal_transport: 70,
  tractor: 46,
  combine: 35,
};

export class VehicleSystem {
  constructor({ state, events }) {
    this.state = state;
    this.events = events;
  }

  spawn({ id, type, eventId, route, speed, label }) {
    const start = route[0] || POINTS.spawn;
    const vehicle = {
      id, type, label: label || type, eventId,
      x: start.x, y: start.y,
      route: route.map(p => ({...p})), routeIndex: 1,
      speed: speed || (DEFAULT_SPEEDS[type] || 72) * 3.2,
      waitingUntil: null, waitStartedAt: null, waitDuration: 0,
      currentTag: null, heading: 0,
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
          v.waitingUntil = null; v.waitStartedAt = null; v.waitDuration = 0; v.currentTag = null;
          if (tag) this.events.emit("vehicle:leaveWaypoint", { vehicle:v, tag });
          v.routeIndex += 1;
        }
        continue;
      }
      const target = v.route[v.routeIndex];
      if (!target) { this.finish(v); continue; }
      const dx = target.x - v.x, dy = target.y - v.y;
      const dist = Math.hypot(dx,dy);
      v.heading = Math.atan2(dy,dx);
      const step = v.speed * dt;
      if (dist <= Math.max(step, 1.5)) {
        v.x = target.x; v.y = target.y;
        if (target.tag) { v.currentTag = target.tag; this.events.emit("vehicle:arriveWaypoint", { vehicle:v, tag:target.tag }); }
        if (target.waitMs) {
          v.waitStartedAt = now; v.waitDuration = target.waitMs; v.waitingUntil = now + target.waitMs;
        } else {
          if (target.tag) this.events.emit("vehicle:leaveWaypoint", { vehicle:v, tag:target.tag });
          v.currentTag = null; v.routeIndex += 1;
        }
      } else {
        v.x += (dx/dist) * step; v.y += (dy/dist) * step;
      }
    }
  }

  finish(vehicle) {
    const index = this.state.vehicles.findIndex(v => v.id === vehicle.id);
    if (index >= 0) this.state.vehicles.splice(index,1);
    this.events.emit("vehicle:complete", vehicle);
  }
  hasEvent(eventId) { return this.state.vehicles.some(v => v.eventId === eventId); }
  waitProgress(vehicle) {
    if (!vehicle.waitingUntil || !vehicle.waitDuration) return 0;
    return Math.max(0, Math.min(1, (Date.now()-vehicle.waitStartedAt)/vehicle.waitDuration));
  }
}

export function routeTo(target, { tag, waitMs=0 } = {}) {
  const p=POINTS;
  const north=[p.spawn,p.roadNorth,p.mountainRoad,p.millJunction,p.farmEntry,p.loading].map(q=>({x:q.x,y:q.y}));
  let tail=[];
  if (near(target,p.loading)) tail=[];
  else if (near(target,p.coop)) tail=[{x:2260,y:2070},{x:p.coop.x,y:p.coop.y}];
  else if (near(target,p.cowpen)) tail=[{x:2400,y:2540},{x:p.cowpen.x,y:p.cowpen.y}];
  else if (near(target,p.bakery)) tail=[{x:1550,y:2780},{x:p.villageNorth.x,y:p.villageNorth.y},{x:p.bakery.x,y:p.bakery.y}];
  else if (near(target,p.harbor)) tail=[{x:1550,y:2780},{x:p.villageNorth.x,y:p.villageNorth.y},{x:1100,y:4060},{x:p.harbor.x,y:p.harbor.y}];
  else if (near(target,p.silo)) tail=[{...p.siloApproach},{x:p.silo.x,y:p.silo.y}];
  else if (near(target,p.garage)) tail=[{x:p.garage.x,y:p.garage.y}];
  else tail=[{x:target.x,y:target.y}];

  const outbound=[...north, ...tail];
  const destinationIndex=outbound.length-1;
  outbound[destinationIndex]={...outbound[destinationIndex],tag,waitMs};
  const back=outbound.slice(0,-1).reverse().map(q=>({x:q.x,y:q.y}));
  return [...outbound,...back,{x:p.spawn.x,y:p.spawn.y}];
}

export function farmMachineRoute(points) { return points.map(p=>({...p})); }
function near(a,b){ return Math.abs(a.x-b.x)<2 && Math.abs(a.y-b.y)<2; }
