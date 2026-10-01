import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const renderer = readFileSync(new URL("../src/world/renderer.js", import.meta.url),"utf8");
const main = readFileSync(new URL("../src/main.js", import.meta.url),"utf8");

test("current renderer overrides legacy event icons with interaction-based positions", () => {
  assert.match(renderer,/drawEventIcons\(c,s,now\).*collectWorldEventIcons\(s\).*getWorldEventIconPosition\(this\.interactions,id,now\)/s);
});

test("current renderer does not use WORLD_OBJECTS for its event-icon override", () => {
  const start=renderer.indexOf("drawEventIcons(c,s,now)");
  const end=renderer.indexOf("drawInteractionDebug",start);
  const method=renderer.slice(start,end);
  assert.doesNotMatch(method,/WORLD_OBJECTS|obj\(/);
});

test("main focus buttons use MODULAR_WORLD destinations", () => {
  assert.match(main,/import \{ MODULAR_WORLD \} from "\.\/data\/modularWorld\.js"/);
  assert.match(main,/createWorldFocusDestinations\(\s*MODULAR_WORLD,/);
});

test("old hard-coded focus destination table is gone", () => {
  assert.doesNotMatch(main,/hof:\[1710,2220,.72\]/);
  assert.doesNotMatch(main,/dorf:\[800,3650,.65\]/);
  assert.doesNotMatch(main,/hafen:\[1800,4440,.6\]/);
});
