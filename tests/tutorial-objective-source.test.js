import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const ui = readFileSync(new URL("../src/ui/ui.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles/main.css", import.meta.url), "utf8");

test("tutorial objective card exists hidden by default", () => {
  assert.ok(html.includes('id="tutorialObjective"'));
  assert.ok(html.includes('class="tutorial-objective hidden"'));
  assert.ok(html.includes('id="tutorialObjectiveTitle"'));
  assert.ok(html.includes('id="tutorialObjectiveStep"'));
});

test("HUD resolves and renders the current tutorial objective", () => {
  assert.ok(ui.includes('getTutorialObjective(state)'));
  assert.ok(ui.includes('tutorialObjective?.classList.toggle("hidden", !objective)'));
  assert.ok(ui.includes('tutorialObjectiveTitle.textContent = objective.title'));
  assert.ok(ui.includes('tutorialObjectiveStep.textContent = objective.step'));
});

test("objective card stays compact and non-interactive over the world", () => {
  assert.ok(css.includes('.tutorial-objective {'));
  assert.ok(css.includes('pointer-events: none'));
  assert.ok(css.includes('-webkit-line-clamp: 2'));
});
