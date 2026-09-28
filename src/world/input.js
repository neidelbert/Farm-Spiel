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
    this.velocity = {x:0,y:0};
    this.pinchDistance = 0;
    this.pinchZoom = camera.zoom;
    this.pinchMid = null;

    this.down = this.handleDown.bind(this);
    this.move = this.handleMove.bind(this);
    this.up = this.handleUp.bind(this);

    canvas.addEventListener("pointerdown", this.down, {passive:false});
    canvas.addEventListener("pointermove", this.move, {passive:false});
    canvas.addEventListener("pointerup", this.up, {passive:false});
    canvas.addEventListener("pointercancel", this.up, {passive:false});
    canvas.addEventListener("contextmenu", e => e.preventDefault());
  }

  point(e) {
    const r = this.canvas.getBoundingClientRect();
    return {x:e.clientX-r.left, y:e.clientY-r.top};
  }

  handleDown(e) {
    e.preventDefault();
    this.canvas.setPointerCapture?.(e.pointerId);
    const p = this.point(e);
    this.pointers.set(e.pointerId, p);
    this.camera.stop();

    if (this.pointers.size === 1) {
      this.lastSingle = p;
      this.downPoint = p;
      this.downTime = performance.now();
      this.lastMoveTime = this.downTime;
      this.velocity = {x:0,y:0};
    } else if (this.pointers.size === 2) {
      const [a,b] = [...this.pointers.values()];
      this.pinchDistance = distance(a,b);
      this.pinchZoom = this.camera.zoom;
      this.pinchMid = midpoint(a,b);
      this.downPoint = null;
    }
  }

  handleMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    e.preventDefault();
    const p = this.point(e);
    this.pointers.set(e.pointerId,p);

    if (this.pointers.size === 1) {
      const now = performance.now();
      if (this.lastSingle) {
        const dx = p.x-this.lastSingle.x, dy = p.y-this.lastSingle.y;
        this.camera.panScreen(dx,dy);
        const dt = Math.max(8, now-this.lastMoveTime)/1000;
        this.velocity = {x:dx/dt,y:dy/dt};
      }
      this.lastSingle = p;
      this.lastMoveTime = now;
    } else {
      const [a,b] = [...this.pointers.values()].slice(0,2);
      const d = Math.max(1,distance(a,b));
      const mid = midpoint(a,b);
      if (this.pinchMid) this.camera.panScreen(mid.x-this.pinchMid.x, mid.y-this.pinchMid.y);
      this.camera.zoomAt(mid.x,mid.y,this.pinchZoom*(d/Math.max(1,this.pinchDistance)));
      this.pinchMid = mid;
    }
  }

  handleUp(e) {
    if (!this.pointers.has(e.pointerId)) return;
    e.preventDefault();
    const upPoint = this.point(e);
    this.pointers.delete(e.pointerId);
    this.canvas.releasePointerCapture?.(e.pointerId);

    if (this.pointers.size === 0) {
      const moved = this.downPoint ? distance(this.downPoint,upPoint) : 999;
      const held = performance.now()-this.downTime;
      if (this.downPoint && moved < 12 && held < 500) {
        this.onTap?.(upPoint);
      } else if (this.lastSingle) {
        this.camera.setVelocityScreen(this.velocity.x*0.20,this.velocity.y*0.20);
      }
      this.lastSingle = null; this.pinchMid = null; this.downPoint = null;
      return;
    }

    if (this.pointers.size === 1) {
      const [remaining] = this.pointers.values();
      this.lastSingle = remaining;
      this.downPoint = null;
      this.lastMoveTime = performance.now();
      this.velocity = {x:0,y:0};
      this.pinchMid = null;
    }
  }
}
function distance(a,b){ return Math.hypot(b.x-a.x,b.y-a.y); }
function midpoint(a,b){ return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}; }
