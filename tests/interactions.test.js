import test from "node:test";
import assert from "node:assert/strict";

import { INTERACTIVE_WORLD_IDS, WorldInteractionCore } from "../src/world/interactions.js";

function baseObjects() {
  return [
    { id:"farmhouse", x:1630, y:2170, width:260, height:255, anchor:[0.5,0.93], layer:10, category:"building_farm" },
    { id:"silo", x:1830, y:2040, width:95, height:146, anchor:[0.5,0.93], layer:10, category:"building_farm" },
    { id:"field1", x:1270, y:2500, width:240, height:140, anchor:[0.5,0.93], layer:3, category:"field" },
    { id:"fishery", x:1390, y:4430, width:220, height:210, anchor:[0.5,0.93], layer:10, category:"harbor" },
    { id:"tree_1", x:1630, y:2170, width:500, height:700, anchor:[0.5,0.93], layer:10, category:"vegetation" },
  ];
}

function core(overrides = {}) {
  return new WorldInteractionCore({
    objects: baseObjects(),
    fields: [{ id:"field1", x:1280, y:2510 }],
    loading: { id:"loading", x:2040, y:2590, width:105, height:81, anchor:[0.5,0.93], layer:10 },
    harbor: { id:"harbor", x:1750, y:4480, width:380, height:240, anchor:[0.5,0.5], layer:0 },
    ...overrides,
  });
}

test("interactive IDs include gameplay buildings and landmarks but not decorative props", () => {
  assert.equal(INTERACTIVE_WORLD_IDS.includes("farmhouse"), true);
  assert.equal(INTERACTIVE_WORLD_IDS.includes("field1"), true);
  assert.equal(INTERACTIVE_WORLD_IDS.includes("lighthouse"), true);
  assert.equal(INTERACTIVE_WORLD_IDS.includes("tree_1"), false);
});

test("building interaction position comes from the rendered modular object", () => {
  const interactions = core();
  const farmhouse = interactions.get("farmhouse");

  assert.equal(farmhouse.x, 1630);
  assert.equal(farmhouse.y, 2170);
  assert.equal(farmhouse.w, 260);
  assert.equal(farmhouse.h, 255);
});

test("field1 uses the separately rendered field coordinates", () => {
  const interactions = core();
  const field = interactions.get("field1");

  assert.equal(field.x, 1280);
  assert.equal(field.y, 2510);
  assert.equal(field.w, 240);
  assert.equal(field.h, 140);
});

test("visual bounds respect the same sprite anchor convention as rendering", () => {
  const farmhouse = core().get("farmhouse");

  assert.equal(farmhouse.bounds.left, 1500);
  assert.equal(farmhouse.bounds.right, 1760);
  assert.ok(Math.abs(farmhouse.bounds.top - (2170 - 255 * 0.93)) < 1e-9);
  assert.ok(Math.abs(farmhouse.bounds.bottom - (2170 - 255 * 0.93 + 255)) < 1e-9);
});

test("hitTest resolves a visible building at its visual bounds", () => {
  const interactions = core();
  const farmhouse = interactions.get("farmhouse");
  const x = (farmhouse.bounds.left + farmhouse.bounds.right) / 2;
  const y = (farmhouse.bounds.top + farmhouse.bounds.bottom) / 2;

  assert.equal(interactions.hitTest(x, y)?.id, "farmhouse");
});

test("decorative objects are ignored even when they overlap a building", () => {
  const interactions = core();
  const farmhouse = interactions.get("farmhouse");

  assert.equal(interactions.hitTest(farmhouse.x, farmhouse.y)?.id, "farmhouse");
  assert.equal(interactions.get("tree_1"), null);
});

test("loading is an explicit special interaction at the rendered truck position", () => {
  const loading = core().get("loading");

  assert.equal(loading.x, 2040);
  assert.equal(loading.y, 2590);
  assert.equal(loading.kind, "special");
  assert.equal(core().hitTest(2040, 2570)?.id, "loading");
});

test("harbor is an explicit low-priority area interaction", () => {
  const harbor = core().get("harbor");

  assert.equal(harbor.kind, "area");
  assert.equal(harbor.layer, 0);
  assert.equal(core().hitTest(1750, 4480)?.id, "harbor");
});

test("higher visual layer wins when interaction bounds overlap", () => {
  const interactions = new WorldInteractionCore({
    objects: [
      { id:"field1", x:100, y:100, width:100, height:100, anchor:[0.5,0.5], layer:3 },
      { id:"farmhouse", x:100, y:100, width:100, height:100, anchor:[0.5,0.5], layer:10 },
    ],
    fields: [{ id:"field1", x:100, y:100 }],
  });

  assert.equal(interactions.hitTest(100, 100)?.id, "farmhouse");
});

test("later y-position wins for objects on the same layer", () => {
  const interactions = new WorldInteractionCore({
    objects: [
      { id:"farmhouse", x:100, y:110, width:100, height:100, anchor:[0.5,0.5], layer:10 },
      { id:"silo", x:100, y:120, width:100, height:100, anchor:[0.5,0.5], layer:10 },
    ],
  });

  assert.equal(interactions.hitTest(100, 115)?.id, "silo");
});

test("non-finite hit coordinates never select an object", () => {
  const interactions = core();

  assert.equal(interactions.hitTest(Number.NaN, 100), null);
  assert.equal(interactions.hitTest(100, Infinity), null);
});

test("invalid interaction source arrays are rejected", () => {
  assert.throws(
    () => new WorldInteractionCore({ objects: null, fields: [] }),
    /requires object and field arrays/,
  );
});
