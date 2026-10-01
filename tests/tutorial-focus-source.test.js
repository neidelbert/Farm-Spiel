import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
const ui = readFileSync(new URL("../src/ui/ui.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("tutorial quick-focus button exists and starts hidden", () => {
  assert.ok(html.includes('id="tutorialFocusBtn"'));
  assert.ok(html.includes('class="tutorial-focus hidden"'));
});

test("main resolves the current tutorial target and starts smooth camera focus", () => {
  assert.ok(main.includes('getTutorialTarget(state)'));
  assert.ok(main.includes('renderer.interactions.get(target.id)'));
  assert.ok(main.includes('camera.focusSmooth(interaction.x, interaction.y)'));
});

test("HUD hides the quick-focus control after tutorial completion", () => {
  assert.ok(ui.includes('tutorialFocus: document.querySelector("#tutorialFocusBtn")'));
  assert.ok(ui.includes('this.el.tutorialFocus?.classList.toggle("hidden", state.tutorialComplete === true);'));
});
