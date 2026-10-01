export class InputController {
  constructor({ canvas, camera, onTap }) {
    this.canvas = canvas;
    this.camera = camera;
    this.onTap = onTap;

    this.pointers = new Map();
    this.lastSingle = null;
    this.downPoint = null;
    this.downTime = 0;
    this.lastMoveTime = 0;
    this.singleTravel = 0;
    this.velocity = { x: 0, y: 0 };

    this.pinchDistance = 0;
    this.pinchMid = null;
    this.pinchActive = false;

    this.down = this.handleDown.bind(this);
    this.move = this.handleMove.bind(this);
    this.up = this.handleUp.bind(this);
    this.cancel = this.handleCancel.bind(this);

    canvas.addEventListener("pointerdown", this.down, { passive: false });
    canvas.addEventListener("pointermove", this.move, { passive: false });
    canvas.addEventListener("pointerup", this.up, { passive: false });
    canvas.addEventListener("pointercancel", this.cancel, { passive: false });
    canvas.addEventListener("contextmenu", e => e.preventDefault());
  }

  point(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  handleDown(e) {
    e.preventDefault();

    // Two fingers are enough for all supported gestures. Ignore extras instead
    // of allowing a third pointer to reshuffle pinch anchors.
    if (this.pointers.size >= 2) return;

    this.canvas.setPointerCapture?.(e.pointerId);
    const p = this.point(e);
    this.pointers.set(e.pointerId, p);
    this.camera.stop();

    if (this.pointers.size === 1) {
      this.beginSingle(p, true);
      return;
    }

    this.beginPinch();
  }

  handleMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    e.preventDefault();

    const p = this.point(e);
    this.pointers.set(e.pointerId, p);

    if (this.pointers.size === 1 && !this.pinchActive) {
      this.moveSingle(p);
      return;
    }

    if (this.pointers.size === 2) {
      this.movePinch();
    }
  }

  handleUp(e) {
    if (!this.pointers.has(e.pointerId)) return;
    e.preventDefault();

    const upPoint = this.point(e);
    const wasPinching = this.pinchActive;
    this.pointers.delete(e.pointerId);
    this.canvas.releasePointerCapture?.(e.pointerId);

    if (this.pointers.size === 0) {
      if (!wasPinching) this.finishSingle(upPoint);
      this.resetGesture();
      return;
    }

    if (this.pointers.size === 1) {
      const [remaining] = this.pointers.values();
      // Re-anchor after pinch so the remaining finger can continue panning
      // without inheriting stale midpoint/distance data.
      this.pinchActive = false;
      this.pinchMid = null;
      this.pinchDistance = 0;
      this.beginSingle(remaining, false);
    }
  }

  handleCancel(e) {
    if (!this.pointers.has(e.pointerId)) return;
    e.preventDefault();

    this.pointers.delete(e.pointerId);
    this.canvas.releasePointerCapture?.(e.pointerId);
    this.camera.stop();

    if (this.pointers.size === 1) {
      const [remaining] = this.pointers.values();
      this.pinchActive = false;
      this.pinchMid = null;
      this.pinchDistance = 0;
      this.beginSingle(remaining, false);
      return;
    }

    if (this.pointers.size === 0) this.resetGesture();
  }

  beginSingle(point, allowTap) {
    const now = performance.now();
    this.lastSingle = point;
    this.downPoint = allowTap ? point : null;
    this.downTime = now;
    this.lastMoveTime = now;
    this.singleTravel = 0;
    this.velocity = { x: 0, y: 0 };
  }

  moveSingle(point) {
    const now = performance.now();
    if (this.lastSingle) {
      const dx = point.x - this.lastSingle.x;
      const dy = point.y - this.lastSingle.y;

      this.camera.panScreen(dx, dy);
      this.singleTravel += Math.hypot(dx, dy);

      const dt = Math.max(0.008, Math.min(0.08, (now - this.lastMoveTime) / 1000));
      const instantX = dx / dt;
      const instantY = dy / dt;

      // Light smoothing prevents one noisy final touch sample from causing a
      // large fling after the finger is released.
      this.velocity = {
        x: this.velocity.x * 0.65 + instantX * 0.35,
        y: this.velocity.y * 0.65 + instantY * 0.35,
      };
    }

    this.lastSingle = point;
    this.lastMoveTime = now;
  }

  finishSingle(upPoint) {
    const held = performance.now() - this.downTime;
    const tap = this.downPoint
      && this.singleTravel < 12
      && distance(this.downPoint, upPoint) < 12
      && held < 500;

    if (tap) {
      this.onTap?.(upPoint);
      return;
    }

    // Do not fling if the user held still before releasing.
    if (this.lastSingle && performance.now() - this.lastMoveTime <= 90) {
      this.camera.setVelocityScreen(this.velocity.x * 0.20, this.velocity.y * 0.20);
    }
  }

  beginPinch() {
    const [a, b] = [...this.pointers.values()];
    this.pinchDistance = Math.max(1, distance(a, b));
    this.pinchMid = midpoint(a, b);
    this.pinchActive = true;

    // Once a second finger appears, the gesture can no longer become a tap.
    this.downPoint = null;
    this.singleTravel = 0;
    this.velocity = { x: 0, y: 0 };
  }

  movePinch() {
    const [a, b] = [...this.pointers.values()];
    const nextDistance = Math.max(1, distance(a, b));
    const nextMid = midpoint(a, b);

    if (!this.pinchActive || !this.pinchMid || this.pinchDistance <= 0) {
      this.pinchDistance = nextDistance;
      this.pinchMid = nextMid;
      this.pinchActive = true;
      return;
    }

    const ratio = nextDistance / this.pinchDistance;

    // Apply zoom around the previous midpoint first, then move that anchored
    // world point to the new midpoint. This avoids pinch drift and jumps.
    this.camera.zoomAt(
      this.pinchMid.x,
      this.pinchMid.y,
      this.camera.zoom * ratio,
    );
    this.camera.panScreen(
      nextMid.x - this.pinchMid.x,
      nextMid.y - this.pinchMid.y,
    );

    this.pinchDistance = nextDistance;
    this.pinchMid = nextMid;
  }

  resetGesture() {
    this.lastSingle = null;
    this.downPoint = null;
    this.singleTravel = 0;
    this.velocity = { x: 0, y: 0 };
    this.pinchDistance = 0;
    this.pinchMid = null;
    this.pinchActive = false;
  }
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
