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
    this.focusTarget = null;
  }

  getEffectiveMinZoom() {
    const fitX = this.viewportWidth / Math.max(1, this.worldWidth);
    const fitY = this.viewportHeight / Math.max(1, this.worldHeight);
    return Math.min(this.maxZoom, Math.max(this.minZoom, fitX, fitY));
  }

  setViewport(w, h) {
    if (!Number.isFinite(w) || !Number.isFinite(h)) return;
    this.viewportWidth = Math.max(1, w);
    this.viewportHeight = Math.max(1, h);
    this.zoom = clamp(this.zoom, this.getEffectiveMinZoom(), this.maxZoom);
    this.clamp();
  }

  panScreen(dx, dy) {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
    this.focusTarget = null;
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
    this.clamp();
  }

  setVelocityScreen(vx, vy) {
    if (!Number.isFinite(vx) || !Number.isFinite(vy)) {
      this.stop();
      return;
    }
    this.vx = -vx / this.zoom;
    this.vy = -vy / this.zoom;
  }

  stop() {
    this.vx = 0;
    this.vy = 0;
    this.focusTarget = null;
  }

  update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;

    if (this.focusTarget) {
      const step = Math.min(dt, 0.05);
      const dx = this.focusTarget.x - this.x;
      const dy = this.focusTarget.y - this.y;
      if (Math.hypot(dx, dy) < 1) {
        this.x = this.focusTarget.x;
        this.y = this.focusTarget.y;
        this.focusTarget = null;
        this.clamp();
        return;
      }
      const blend = 1 - Math.exp(-8 * step);
      this.x += dx * blend;
      this.y += dy * blend;
      this.clamp();
      return;
    }

    if (Math.abs(this.vx) < 4) this.vx = 0;
    if (Math.abs(this.vy) < 4) this.vy = 0;
    if (!this.vx && !this.vy) return;

    // Limit single-frame movement after a slow frame or tab hiccup.
    const step = Math.min(dt, 0.05);
    this.x += this.vx * step;
    this.y += this.vy * step;

    const damping = Math.exp(-this.inertia * step);
    this.vx *= damping;
    this.vy *= damping;
    this.clamp();
  }

  zoomAt(screenX, screenY, target) {
    if (!Number.isFinite(screenX) || !Number.isFinite(screenY) || !Number.isFinite(target)) {
      return;
    }
    this.focusTarget = null;

    const next = clamp(target, this.getEffectiveMinZoom(), this.maxZoom);
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

  focusSmooth(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;

    const halfWidth = this.viewportWidth / (2 * this.zoom);
    const halfHeight = this.viewportHeight / (2 * this.zoom);
    const minX = halfWidth;
    const maxX = this.worldWidth - halfWidth;
    const minY = halfHeight;
    const maxY = this.worldHeight - halfHeight;

    this.focusTarget = {
      x: minX >= maxX ? this.worldWidth / 2 : clamp(x, minX, maxX),
      y: minY >= maxY ? this.worldHeight / 2 : clamp(y, minY, maxY),
    };
    this.vx = 0;
    this.vy = 0;
    return true;
  }

  focus(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.x = x;
    this.y = y;
    this.stop();
    this.clamp();
  }

  clamp() {
    this.zoom = clamp(this.zoom, this.getEffectiveMinZoom(), this.maxZoom);

    const halfWidth = this.viewportWidth / (2 * this.zoom);
    const halfHeight = this.viewportHeight / (2 * this.zoom);

    const minX = halfWidth;
    const maxX = this.worldWidth - halfWidth;
    const minY = halfHeight;
    const maxY = this.worldHeight - halfHeight;

    const oldX = this.x;
    const oldY = this.y;

    this.x = minX >= maxX
      ? this.worldWidth / 2
      : clamp(this.x, minX, maxX);

    this.y = minY >= maxY
      ? this.worldHeight / 2
      : clamp(this.y, minY, maxY);

    // Do not keep invisible inertia pushing into a hard world boundary.
    if (this.x !== oldX) {
      if ((this.x <= minX && this.vx < 0) || (this.x >= maxX && this.vx > 0)) {
        this.vx = 0;
      }
    }
    if (this.y !== oldY) {
      if ((this.y <= minY && this.vy < 0) || (this.y >= maxY && this.vy > 0)) {
        this.vy = 0;
      }
    }
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
