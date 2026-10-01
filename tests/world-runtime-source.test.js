import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game=readFileSync(new URL("../src/Game.js",import.meta.url),"utf8");
const vehicles=readFileSync(new URL("../src/systems/vehicles.js",import.meta.url),"utf8");
const renderer=readFileSync(new URL("../src/world/renderer.js",import.meta.url),"utf8");

test("current Game uses centralized runtime points instead of worldData POINTS", () => {
  assert.match(game,/RUNTIME_POINTS as POINTS/);
  assert.doesNotMatch(game,/data\/worldData\.js/);
});

test("VehicleSystem uses centralized runtime points instead of worldData POINTS", () => {
  assert.match(vehicles,/RUNTIME_POINTS as POINTS/);
  assert.doesNotMatch(vehicles,/data\/worldData\.js/);
});

test("current renderer uses runtime points and modular roads instead of worldData imports", () => {
  assert.match(renderer,/WORLD_ROADS as ROAD_PATHS/);
  assert.match(renderer,/WORLD_RUNTIME/);
  assert.doesNotMatch(renderer,/data\/worldData\.js/);
});

test("renderer machine and scrap hard-coded coordinates are removed", () => {
  assert.doesNotMatch(renderer,/\),1870,2590,110/);
  assert.doesNotMatch(renderer,/ID\(191\),1550,2430/);
  assert.doesNotMatch(renderer,/ID\(189\),1520,2410/);
  assert.doesNotMatch(renderer,/ID\(188\),1560,2405/);
  assert.match(renderer,/WORLD_RUNTIME\.parking\.combine/);
  assert.match(renderer,/WORLD_RUNTIME\.scrap/);
});
