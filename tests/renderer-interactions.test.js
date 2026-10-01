import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/world/renderer.js", import.meta.url), "utf8");

test("renderer objectAt delegates to WorldInteractionCore", () => {
  assert.match(source, /this\.interactions\.hitTest\(x,y\)/);
});

test("renderer no longer imports legacy WORLD_OBJECTS for hit testing", () => {
  assert.doesNotMatch(source, /import\s*\{[^}]*WORLD_OBJECTS[^}]*\}\s*from\s*['"]\.\.\/data\/worldData\.js['"]/);
  assert.doesNotMatch(source, /\[\.\.\.WORLD_OBJECTS\]/);
});

test("construction and debug bounds use the interaction model", () => {
  assert.match(source, /this\.interactions\.get\(s\.construction\.building\)/);
  assert.match(source, /this\.interactions\.all\(\)/);
});
