import { CONFIG } from "./config.js";
import { EventBus } from "./core/eventBus.js";
import { SaveManager } from "./core/save.js";
import { Camera } from "./world/camera.js";
import { InputController } from "./world/input.js";
import { Renderer } from "./world/renderer.js?v=hof-20260929";
import { UI } from "./ui/ui.js";
import { Game } from "./Game.js";
import { MODULAR_WORLD } from "./data/modularWorld.js";
import { createWorldFocusDestinations } from "./world/worldUi.js";
import { getTutorialTarget } from "./systems/tutorialGuidance.js";

const canvas = document.querySelector("#game");
const ui = new UI();
const save = new SaveManager();
const state = save.load();
const events = new EventBus();

const camera = new Camera(
  CONFIG.camera,
  CONFIG.world.width,
  CONFIG.world.height,
);

const renderer = new Renderer({ canvas, camera });
renderer.resize();

const game = new Game({
  state,
  save,
  events,
  camera,
  renderer,
  ui,
});

const input = new InputController({
  canvas,
  camera,
  onTap: p => game.handleTap(p),
});

window.addEventListener("resize", () => renderer.resize(), { passive:true });
window.addEventListener("orientationchange", () => setTimeout(()=>renderer.resize(),100), { passive:true });

window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    save.save(state);
  } else {
    game.reconcileState();
  }
});

window.addEventListener("beforeunload", () => save.save(state));

document.querySelector("#menuBtn").addEventListener("click", () => ui.showMenu(true));
document.querySelector("#tutorialFocusBtn").addEventListener("click", () => {
  const target = getTutorialTarget(state);
  if (!target) return;
  const interaction = renderer.interactions.get(target.id);
  if (!interaction) return;
  camera.focusSmooth(interaction.x, interaction.y);
  ui.toast(`★ Ziel: ${target.label}`);
});

document.querySelectorAll("[data-menu]").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.menu;
    if (action === "resume" || action === "close") ui.showMenu(false);
    if (action === "save") {
      save.save(state);
      ui.toast("💾 Spielstand gespeichert.");
      ui.showMenu(false);
    }
    if (action === "dev") {
      state.settings.dev = !state.settings.dev;
      ui.updateHUD(state);
      save.save(state);
      ui.toast(state.settings.dev ? "DEV-Modus aktiviert." : "DEV-Modus deaktiviert.");
      ui.showMenu(false);
    }
    if (action === "reset") {
      const ok = window.confirm("Farm-Spiel wirklich komplett zurücksetzen?");
      if (ok) {
        save.reset();
        location.reload();
      }
    }
  });
});

document.querySelector("#devBadge").addEventListener("click", () => ui.showDev(true));
document.querySelector("#devClose").addEventListener("click", () => ui.showDev(false));
document.querySelectorAll("[data-dev]").forEach(btn => {
  btn.addEventListener("click", () => game.devAction(btn.dataset.dev));
});

events.on("vehicle:complete", v => {
  // Workshop delivery is the bridge from Level 7 to 8.
  if (v.eventId === "chicken_delivery") game.finalizeChickenDelivery();
});

setInterval(() => {
  if (!ui.el.devPanel.classList.contains("hidden")) {
    ui.setDevStats(game.devStats());
  }
}, 500);

window.addEventListener("error", e => {
  console.error("Farm-Spiel Fehler:", e.error || e.message);
  if (state.settings.dev) ui.toast(`⚠ ${e.message || "Unbekannter Fehler"}`,5000);
});

window.addEventListener("unhandledrejection", e => {
  console.error("Farm-Spiel Promise-Fehler:", e.reason);
  if (state.settings.dev) ui.toast("⚠ Ein Hintergrundfehler wurde abgefangen.",5000);
});

ui.setBoot(`Version ${CONFIG.version} · Spielwelt wird geladen …`);
ui.updateHUD(state);

async function startGame(){
  try { await renderer.ready; } catch(error) { console.warn(error); }
  game.start();
  ui.hideBoot();
  if (!state.tutorialComplete) {
    ui.toast("🏡 Tippe auf das Hofhaus – dein erster Auftrag wartet.",3600);
  } else {
    ui.toast("Willkommen zurück auf deinem Hof.");
  }
}
startGame();

// Expose a tiny read-only-ish handle for debugging in browser devtools.
window.FarmSpiel = { version: CONFIG.version, state, game, camera, renderer };

document.querySelectorAll("[data-focus]").forEach(button => {
  button.onclick = () => {
    const destinations = createWorldFocusDestinations(
      MODULAR_WORLD,
      window.innerWidth,
      window.innerHeight,
    );
    const target = destinations[button.dataset.focus];
    if (!target) return;
    camera.zoom = target.zoom;
    camera.focus(target.x, target.y);
  };
});
document.querySelectorAll("[data-zoom]").forEach(b=>b.onclick=()=>camera.zoomAt(innerWidth/2,innerHeight/2,camera.zoom*(b.dataset.zoom==="in"?1.25:.8)));
