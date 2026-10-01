export const INTERACTIVE_WORLD_IDS = Object.freeze([
  "farmhouse",
  "field1",
  "field2",
  "field3",
  "silo",
  "barn",
  "garage",
  "mill",
  "coop",
  "cowpen",
  "bakery",
  "mine",
  "sawmill",
  "church",
  "market",
  "fishery",
  "lighthouse",
]);

export class WorldInteractionCore {
  constructor({ objects = [], fields = [], loading = null, harbor = null } = {}) {
    if (!Array.isArray(objects) || !Array.isArray(fields)) {
      throw new Error("WorldInteractionCore requires object and field arrays.");
    }

    const objectsById = new Map();
    for (const object of objects) {
      if (object && typeof object.id === "string" && !objectsById.has(object.id)) {
        objectsById.set(object.id, object);
      }
    }

    const fieldById = new Map();
    for (const field of fields) {
      if (field && typeof field.id === "string" && !fieldById.has(field.id)) {
        fieldById.set(field.id, field);
      }
    }

    const items = [];
    for (const id of INTERACTIVE_WORLD_IDS) {
      const source = objectsById.get(id);
      if (!source) continue;

      if (id.startsWith("field")) {
        const renderedField = fieldById.get(id);
        items.push(toInteraction({
          ...source,
          x: finiteOr(renderedField?.x, source.x),
          y: finiteOr(renderedField?.y, source.y),
        }, "object"));
      } else {
        items.push(toInteraction(source, "object"));
      }
    }

    if (loading) items.push(toInteraction(loading, "special"));
    if (harbor) items.push(toInteraction(harbor, "area"));

    this.items = Object.freeze(items);
    this.byId = new Map(items.map(item => [item.id, item]));
  }

  get(id) {
    return this.byId.get(id) ?? null;
  }

  all() {
    return [...this.items];
  }

  hitTest(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

    const hits = this.items.filter(item => contains(item.bounds, x, y));
    hits.sort((a, b) =>
      b.layer - a.layer
      || b.y - a.y
      || area(a.bounds) - area(b.bounds)
      || a.id.localeCompare(b.id)
    );
    return hits[0] ?? null;
  }
}

function toInteraction(source, kind) {
  if (!source || typeof source.id !== "string" || source.id.length === 0) {
    throw new Error("Interaction source requires an id.");
  }

  const x = finiteRequired(source.x, `${source.id}.x`);
  const y = finiteRequired(source.y, `${source.id}.y`);
  const width = positiveRequired(source.width ?? source.w, `${source.id}.width`);
  const height = positiveRequired(source.height ?? source.h, `${source.id}.height`);
  const anchor = normalizeAnchor(source.anchor, kind === "area" ? [0.5, 0.5] : [0.5, 0.93]);
  const left = x - width * anchor[0];
  const top = y - height * anchor[1];
  const bounds = Object.freeze({
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  });

  return Object.freeze({
    id: source.id,
    x,
    y,
    w: width,
    h: height,
    width,
    height,
    anchor: Object.freeze(anchor),
    layer: Number.isFinite(source.layer) ? source.layer : (kind === "area" ? 0 : 10),
    kind,
    bounds,
  });
}

function normalizeAnchor(anchor, fallback) {
  if (!Array.isArray(anchor) || anchor.length < 2) return [...fallback];
  const x = Number.isFinite(anchor[0]) ? anchor[0] : fallback[0];
  const y = Number.isFinite(anchor[1]) ? anchor[1] : fallback[1];
  return [x, y];
}

function contains(bounds, x, y) {
  return x >= bounds.left
    && x <= bounds.right
    && y >= bounds.top
    && y <= bounds.bottom;
}

function area(bounds) {
  return bounds.width * bounds.height;
}

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function finiteRequired(value, label) {
  if (!Number.isFinite(value)) throw new Error(`Invalid interaction coordinate: ${label}`);
  return value;
}

function positiveRequired(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid interaction size: ${label}`);
  }
  return value;
}
