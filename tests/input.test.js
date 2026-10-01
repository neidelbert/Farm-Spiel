import test from "node:test";
import assert from "node:assert/strict";

import { Camera } from "../src/world/camera.js";
import { InputController } from "../src/world/input.js";

function makeCanvas() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, handler) { listeners.set(type, handler); },
    setPointerCapture() {},
    releasePointerCapture() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 800 }; },
  };
}

function event(pointerId, x, y, type = "pointermove") {
  return {
    pointerId,
    clientX: x,
    clientY: y,
    type,
    preventDefault() {},
  };
}

function setup(onTap = () => {}) {
  const camera = new Camera({
    startX: 1000,
    startY: 1500,
    startZoom: 1,
    minZoom: 0.1,
    maxZoom: 3,
    inertia: 7.5,
  }, 3000, 3000);
  camera.setViewport(400, 800);
  const canvas = makeCanvas();
  const input = new InputController({ canvas, camera, onTap });
  return { camera, canvas, input };
}

test("second finger down does not move or zoom the camera", () => {
  const { camera, input } = setup();
  input.handleDown(event(1, 100, 300, "pointerdown"));
  const before = { x: camera.x, y: camera.y, zoom: camera.zoom };

  input.handleDown(event(2, 200, 300, "pointerdown"));

  assert.deepEqual({ x: camera.x, y: camera.y, zoom: camera.zoom }, before);
});

test("pinch zoom is incremental instead of repeatedly using the first distance", () => {
  const { camera, input } = setup();
  input.handleDown(event(1, 100, 300, "pointerdown"));
  input.handleDown(event(2, 200, 300, "pointerdown"));

  input.handleMove(event(2, 220, 300));
  assert.ok(Math.abs(camera.zoom - 1.2) < 1e-9);

  input.handleMove(event(2, 244, 300));
  assert.ok(Math.abs(camera.zoom - 1.44) < 1e-9);
});

test("pinch midpoint movement pans smoothly while zooming", () => {
  const { camera, input } = setup();
  input.handleDown(event(1, 100, 300, "pointerdown"));
  input.handleDown(event(2, 200, 300, "pointerdown"));

  const anchorBefore = camera.screenToWorld(150, 300);
  input.handleMove(event(1, 120, 320));
  input.handleMove(event(2, 220, 320));
  const anchorAfter = camera.screenToWorld(170, 320);

  assert.ok(Math.abs(anchorBefore.x - anchorAfter.x) < 1e-7);
  assert.ok(Math.abs(anchorBefore.y - anchorAfter.y) < 1e-7);
});

test("lifting one finger after pinch reanchors the remaining finger without jump", () => {
  const { camera, input } = setup();
  input.handleDown(event(1, 100, 300, "pointerdown"));
  input.handleDown(event(2, 200, 300, "pointerdown"));
  input.handleMove(event(2, 220, 300));

  input.handleUp(event(2, 220, 300, "pointerup"));
  const beforeX = camera.x;
  const zoom = camera.zoom;

  input.handleMove(event(1, 110, 300));

  assert.ok(Math.abs(camera.x - (beforeX - 10 / zoom)) < 1e-7);
});

test("dragging away and back does not accidentally fire a tap", () => {
  let taps = 0;
  const { input } = setup(() => taps++);

  input.handleDown(event(1, 100, 300, "pointerdown"));
  input.handleMove(event(1, 140, 300));
  input.handleMove(event(1, 100, 300));
  input.handleUp(event(1, 100, 300, "pointerup"));

  assert.equal(taps, 0);
});

test("a short unmoved press still fires a tap", () => {
  let taps = 0;
  const { input } = setup(() => taps++);

  input.handleDown(event(1, 100, 300, "pointerdown"));
  input.handleUp(event(1, 100, 300, "pointerup"));

  assert.equal(taps, 1);
});

test("third simultaneous pointer is ignored instead of destabilizing pinch anchors", () => {
  const { input } = setup();

  input.handleDown(event(1, 100, 300, "pointerdown"));
  input.handleDown(event(2, 200, 300, "pointerdown"));
  input.handleDown(event(3, 250, 300, "pointerdown"));

  assert.equal(input.pointers.size, 2);
  assert.equal(input.pointers.has(3), false);
});

test("pointer cancel stops inertia and does not create a tap", () => {
  let taps = 0;
  const { camera, input } = setup(() => taps++);

  input.handleDown(event(1, 100, 300, "pointerdown"));
  camera.vx = 100;
  camera.vy = 100;
  input.handleCancel(event(1, 100, 300, "pointercancel"));

  assert.equal(camera.vx, 0);
  assert.equal(camera.vy, 0);
  assert.equal(taps, 0);
  assert.equal(input.pointers.size, 0);
});
