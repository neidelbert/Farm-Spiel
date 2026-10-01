import test from "node:test";
import assert from "node:assert/strict";

import { MODULAR_WORLD } from "../src/data/modularWorld.js";
import { RUNTIME_POINTS, WORLD_ROADS, WORLD_RUNTIME } from "../src/data/worldRuntime.js";
import { routeTo } from "../src/systems/vehicles.js";

function object(id) {
  return MODULAR_WORLD.objects.find(item => item.id === id);
}

test("runtime building targets come from modular-world object positions", () => {
  for (const [runtimeKey, objectId] of [
    ["garage","garage"],
    ["silo","silo"],
    ["coop","coop"],
    ["cowpen","cowpen"],
    ["bakery","bakery"],
    ["mill","mill"],
  ]) {
    const source=object(objectId);
    assert.deepEqual(RUNTIME_POINTS[runtimeKey],{x:source.x,y:source.y});
  }
});

test("runtime field target comes from modular-world fields", () => {
  const field=MODULAR_WORLD.fields.find(item=>item.id==="field1");
  assert.deepEqual(RUNTIME_POINTS.field,{x:field.x,y:field.y});
});

test("main vehicle road anchors come from modular-world roads", () => {
  assert.deepEqual(RUNTIME_POINTS.roadNorth,{x:2280,y:730});
  assert.deepEqual(RUNTIME_POINTS.mountainRoad,{x:2390,y:1080});
  assert.deepEqual(RUNTIME_POINTS.millJunction,{x:2500,y:1430});
  assert.deepEqual(RUNTIME_POINTS.farmEntry,{x:2510,y:2050});
  assert.deepEqual(RUNTIME_POINTS.villageNorth,{x:1100,y:3500});
  assert.deepEqual(RUNTIME_POINTS.harbor,{x:1530,y:4490});
});

test("renderer road source is an immutable clone of modular-world roads", () => {
  assert.deepEqual(WORLD_ROADS,MODULAR_WORLD.roads);
  assert.equal(Object.isFrozen(WORLD_ROADS),true);
  assert.equal(Object.isFrozen(WORLD_ROADS[0]),true);
  assert.equal(Object.isFrozen(WORLD_ROADS[0][0]),true);
});

test("runtime-only staging points are centralized once", () => {
  assert.deepEqual(RUNTIME_POINTS.loading,{x:2040,y:2590});
  assert.deepEqual(WORLD_RUNTIME.parking.combine,{x:1870,y:2590});
  assert.deepEqual(WORLD_RUNTIME.scrap.pile,{x:1550,y:2430});
  assert.deepEqual(WORLD_RUNTIME.scrap.crate,{x:1520,y:2410});
  assert.deepEqual(WORLD_RUNTIME.scrap.barrel,{x:1560,y:2405});
});

test("routeTo silo ends its tagged outbound leg at the visible modular silo", () => {
  const route=routeTo(RUNTIME_POINTS.silo,{tag:"build_silo",waitMs:2500});
  const tagged=route.find(point=>point.tag==="build_silo");
  assert.deepEqual(tagged,{
    x:object("silo").x,
    y:object("silo").y,
    tag:"build_silo",
    waitMs:2500,
  });
});

test("routeTo coop ends its tagged outbound leg at the visible modular coop", () => {
  const route=routeTo(RUNTIME_POINTS.coop,{tag:"chickens_unload",waitMs:4000});
  const tagged=route.find(point=>point.tag==="chickens_unload");
  assert.deepEqual(tagged,{
    x:object("coop").x,
    y:object("coop").y,
    tag:"chickens_unload",
    waitMs:4000,
  });
});

test("routeTo bakery ends at the current modular bakery position", () => {
  const route=routeTo(RUNTIME_POINTS.bakery,{tag:"baker_delivery",waitMs:3000});
  const tagged=route.find(point=>point.tag==="baker_delivery");
  assert.deepEqual(tagged,{
    x:object("bakery").x,
    y:object("bakery").y,
    tag:"baker_delivery",
    waitMs:3000,
  });
});

test("vehicle routes still start and end at the centralized off-map spawn", () => {
  const route=routeTo(RUNTIME_POINTS.loading,{tag:"pickup",waitMs:1000});
  assert.deepEqual(route[0],RUNTIME_POINTS.spawn);
  assert.deepEqual(route.at(-1),RUNTIME_POINTS.spawn);
});
