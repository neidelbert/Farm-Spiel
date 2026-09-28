export class Camera {
  constructor(config, worldWidth, worldHeight) {
    this.x = config.startX;
    this.y = config.startY;
    this.zoom = config.startZoom;
    this.minZoom = config.minZoom;
    this.maxZoom = config.maxZoom;
    this.inertia = config.inertia;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.viewportWidth = 1;
    this.viewportHeight = 1;
    this.vx = 0;
    this.vy = 0;
  }

  setViewport(w, h) {
    this.viewportWidth = Math.max(1, w);
    this.viewportHeight = Math.max(1, h);
    this.clamp();
  }

  panScreen(dx, dy) {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
    this.clamp();
  }

  setVelocityScreen(vx, vy) {
    this.vx = -vx / this.zoom;
    this.vy = -vy / this.zoom;
  }

  stop() { this.vx = this.vy = 0; }

  update(dt) {
    if (Math.abs(this.vx) < 4) this.vx = 0;
    if (Math.abs(this.vy) < 4) this.vy = 0;
    if (!this.vx && !this.vy) return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    const d = Math.exp(-this.inertia * dt);
    this.vx *= d;
    this.vy *= d;
    this.clamp();
  }

  zoomAt(screenX, screenY, target) {
    const next = clamp(target, this.minZoom, this.maxZoom);
    if (Math.abs(next - this.zoom) < 0.0001) return;
    const before = this.screenToWorld(screenX, screenY);
    this.zoom = next;
    const after = this.screenToWorld(screenX, screenY);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
    this.clamp();
  }

  screenToWorld(x, y) {
    return {
      x: this.x + (x - this.viewportWidth / 2) / this.zoom,
      y: this.y + (y - this.viewportHeight / 2) / this.zoom,
    };
  }

  worldToScreen(x, y) {
    return {
      x: (x - this.x) * this.zoom + this.viewportWidth / 2,
      y: (y - this.y) * this.zoom + this.viewportHeight / 2,
    };
  }

  focus(x, y) {
    this.x = x; this.y = y; this.stop(); this.clamp();
  }

  clamp() {
    const hw = this.viewportWidth / (2 * this.zoom);
    const hh = this.viewportHeight / (2 * this.zoom);
    this.x = hw * 2 >= this.worldWidth ? this.worldWidth / 2 : clamp(this.x, hw, this.worldWidth - hw);
    this.y = hh * 2 >= this.worldHeight ? this.worldHeight / 2 : clamp(this.y, hh, this.worldHeight - hh);
  }
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
