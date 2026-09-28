export const POINTS = Object.freeze({
  spawn: { x: 1320, y: -120 },
  roadNorth: { x: 1320, y: 470 },
  millJunction: { x: 1250, y: 1220 },
  loading: { x: 1310, y: 1680 },
  garage: { x: 1640, y: 1980 },
  silo: { x: 880, y: 2220 },
  field: { x: 1240, y: 2500 },
  coop: { x: 1780, y: 2420 },
  cowpen: { x: 1900, y: 2820 },
  bakery: { x: 1660, y: 3210 },
});

export const WORLD_OBJECTS = Object.freeze([
  { id: "mine", x: 1850, y: 420, w: 360, h: 250 },
  { id: "sawmill", x: 520, y: 920, w: 280, h: 210 },
  { id: "mill", x: 920, y: 1280, w: 270, h: 220 },

  { id: "loading", x: POINTS.loading.x, y: POINTS.loading.y, w: 340, h: 190 },
  { id: "barn", x: 860, y: 1920, w: 300, h: 235 },
  { id: "farmhouse", x: 1260, y: 1940, w: 310, h: 230 },
  { id: "garage", x: POINTS.garage.x, y: POINTS.garage.y, w: 320, h: 225 },
  { id: "silo", x: POINTS.silo.x, y: POINTS.silo.y, w: 210, h: 280 },
  { id: "field1", x: POINTS.field.x, y: POINTS.field.y, w: 610, h: 430 },
  { id: "coop", x: POINTS.coop.x, y: POINTS.coop.y, w: 390, h: 300 },
  { id: "cowpen", x: POINTS.cowpen.x, y: POINTS.cowpen.y, w: 560, h: 360 },

  { id: "market", x: 1110, y: 3190, w: 310, h: 220 },
  { id: "church", x: 1360, y: 3060, w: 250, h: 300 },
  { id: "bakery", x: POINTS.bakery.x, y: POINTS.bakery.y, w: 280, h: 220 },

  { id: "fishery", x: 760, y: 3600, w: 290, h: 210 },
  { id: "harbor", x: 1390, y: 3820, w: 560, h: 300 },
  { id: "lighthouse", x: 2200, y: 3910, w: 220, h: 330 },
]);

export const ROAD_PATHS = Object.freeze([
  // Main valley road from the outside world through farm and village to the coast.
  [[1320,-100],[1320,420],[1260,900],[1250,1220],[1310,1680],[1390,2060],[1440,2580],[1430,3010],[1390,3420],[1390,3820]],

  // Farm service loop.
  [[1310,1680],[1120,1800],[860,1920],[880,2220],[1080,2320],[1240,2500]],
  [[1310,1680],[1500,1790],[1640,1980],[1550,2200],[1240,2500]],
  [[1640,1980],[1780,2420],[1900,2820],[1660,3210]],

  // Mill / forest branches.
  [[1250,1220],[1040,1260],[920,1280]],
  [[1100,1080],[820,980],[520,920]],

  // Mountain / mine branch.
  [[1320,470],[1550,460],[1850,420]],

  // Village roads.
  [[1430,3010],[1360,3060],[1110,3190]],
  [[1430,3010],[1570,3090],[1660,3210]],

  // Coastal connections.
  [[1390,3420],[1080,3500],[760,3600]],
  [[1390,3420],[1390,3820]],
  [[1390,3820],[1770,3880],[2200,3910]],
]);
