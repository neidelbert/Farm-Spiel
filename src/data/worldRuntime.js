import { MODULAR_WORLD } from "./modularWorld.js";

const objectById = new Map(MODULAR_WORLD.objects.map(object => [object.id, object]));
const fieldById = new Map(MODULAR_WORLD.fields.map(field => [field.id, field]));

function point(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error("World runtime point requires finite coordinates.");
  }
  return Object.freeze({ x, y });
}

function objectPoint(id) {
  const object = objectById.get(id);
  if (!object) throw new Error(`Missing modular world object: ${id}`);
  return point(object.x, object.y);
}

function fieldPoint(id) {
  const field = fieldById.get(id);
  if (!field) throw new Error(`Missing modular world field: ${id}`);
  return point(field.x, field.y);
}

function roadPoint(pathIndex, pointIndex) {
  const pair = MODULAR_WORLD.roads?.[pathIndex]?.[pointIndex];
  if (!Array.isArray(pair) || pair.length < 2) {
    throw new Error(`Missing modular road point: ${pathIndex}/${pointIndex}`);
  }
  return point(pair[0], pair[1]);
}

function cloneRoads(roads) {
  return Object.freeze(
    roads.map(path => Object.freeze(
      path.map(([x, y]) => Object.freeze([x, y])),
    )),
  );
}

export const WORLD_ROADS = cloneRoads(MODULAR_WORLD.roads);

export const RUNTIME_POINTS = Object.freeze({
  // Off-map entry used only for vehicle arrival/departure.
  spawn: point(2280, -120),

  // Main road anchors come directly from the modular road network.
  roadNorth: roadPoint(0, 0),
  mountainRoad: roadPoint(0, 1),
  millJunction: roadPoint(0, 2),
  farmEntry: roadPoint(0, 3),

  // Visible gameplay targets come from the same objects/fields as rendering.
  garage: objectPoint("garage"),
  silo: objectPoint("silo"),
  field: fieldPoint("field1"),
  coop: objectPoint("coop"),
  cowpen: objectPoint("cowpen"),
  bakery: objectPoint("bakery"),
  mill: objectPoint("mill"),

  // Road-node target used by village delivery routes.
  villageNorth: roadPoint(3, 3),
  harbor: roadPoint(4, 3),

  // Runtime-only staging points. They are defined here once instead of being
  // duplicated across Game, VehicleSystem and Renderer.
  loading: point(2040, 2590),
  fieldApproach: point(1450, 2490),
  siloApproach: point(1570, 2380),
  garageApproach: point(1700, 2600),
});

export const WORLD_RUNTIME = Object.freeze({
  points: RUNTIME_POINTS,
  roads: WORLD_ROADS,

  parking: Object.freeze({
    combine: point(1870, 2590),
  }),

  scrap: Object.freeze({
    pile: point(1550, 2430),
    crate: point(1520, 2410),
    barrel: point(1560, 2405),
  }),
});
