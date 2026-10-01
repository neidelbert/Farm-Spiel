import test from "node:test";
import assert from "node:assert/strict";

import { Camera } from "../src/world/camera.js";

function camera(overrides = {}) {
  const c = new Camera({
    startX: 500,
    startY: 1000,
    startZoom: 0.5,
    minZoom: 0.1,
    maxZoom: 2,
    inertia: 7.5,
    ...overrides,
  }, 1000, 2000);
  c.setViewport(400, 800);
  return c;
}

test("responsive minimum zoom never exposes space outside the world", () => {
  const c = camera({ startZoom: 0.1 });
  assert.equal(c.getEffectiveMinZoom(), 0.4);
  assert.equal(c.zoom, 0.4);
  assert.equal(c.y, 1000);
});

test("pan clamps the visible viewport inside world bounds", () => {
  const c = camera();
  c.panScreen(100000, 100000);

  const halfW = c.viewportWidth / (2 * c.zoom);
  const halfH = c.viewportHeight / (2 * c.zoom);
  assert.equal(c.x, halfW);
  assert.equal(c.y, halfH);

  c.panScreen(-100000, -100000);
  assert.equal(c.x, c.worldWidth - halfW);
  assert.equal(c.y, c.worldHeight - halfH);
});

test("zoomAt preserves the world point under the gesture anchor away from edges", () => {
  const c = new Camera({
    startX: 1000,
    startY: 1000,
    startZoom: 1,
    minZoom: 0.1,
    maxZoom: 3,
    inertia: 7.5,
  }, 3000, 3000);
  c.setViewport(400, 800);

  const before = c.screenToWorld(300, 250);
  c.zoomAt(300, 250, 1.5);
  const after = c.screenToWorld(300, 250);

  assert.ok(Math.abs(before.x - after.x) < 1e-9);
  assert.ok(Math.abs(before.y - after.y) < 1e-9);
});

test("zoom cannot go below the viewport-safe minimum", () => {
  const c = camera();
  c.zoomAt(200, 400, 0.001);
  assert.equal(c.zoom, 0.4);
});

test("inertia stops when it reaches a hard world edge", () => {
  const c = camera();
  c.focus(500, 1000);
  c.vx = -100000;
  c.vy = -100000;
  c.update(0.05);

  const halfW = c.viewportWidth / (2 * c.zoom);
  const halfH = c.viewportHeight / (2 * c.zoom);
  assert.equal(c.x, halfW);
  assert.equal(c.y, halfH);
  assert.equal(c.vx, 0);
  assert.equal(c.vy, 0);
});

test("large frame gaps are capped to prevent camera jumps", () => {
  const c = camera();
  c.vx = 100;
  c.vy = 0;
  const start = c.x;

  c.update(5);

  assert.ok(c.x - start <= 5.000001);
});

test("focus stops inertia and stays inside valid bounds", () => {
  const c = camera();
  c.vx = 500;
  c.vy = 500;

  c.focus(-1000, 99999);

  const halfW = c.viewportWidth / (2 * c.zoom);
  const halfH = c.viewportHeight / (2 * c.zoom);
  assert.equal(c.x, halfW);
  assert.equal(c.y, c.worldHeight - halfH);
  assert.equal(c.vx, 0);
  assert.equal(c.vy, 0);
});
