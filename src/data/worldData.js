export const POINTS = Object.freeze({
  spawn: { x: 930, y: -24 },
  roadNorth: { x: 884, y: 150 },
  mountainRoad: { x: 804, y: 272 },
  millJunction: { x: 666, y: 420 },
  farmEntry: { x: 630, y: 565 },
  loading: { x: 602, y: 676 },
  garage: { x: 607, y: 650 },
  silo: { x: 583, y: 515 },
  field: { x: 321, y: 690 },
  coop: { x: 794, y: 526 },
  cowpen: { x: 761, y: 735 },
  villageNorth: { x: 594, y: 886 },
  bakery: { x: 444, y: 1040 },
  harbor: { x: 502, y: 1378 },
});

export const WORLD_OBJECTS = Object.freeze([
  { id: "mine", x: 760, y: 105, w: 300, h: 190 },
  { id: "sawmill", x: 182, y: 300, w: 290, h: 210 },
  { id: "mill", x: 171, y: 500, w: 260, h: 230 },

  { id: "loading", x: POINTS.loading.x, y: POINTS.loading.y, w: 190, h: 130 },
  { id: "barn", x: 681, y: 562, w: 230, h: 195 },
  { id: "farmhouse", x: 493, y: 548, w: 260, h: 210 },
  { id: "garage", x: POINTS.garage.x, y: POINTS.garage.y, w: 250, h: 180 },
  { id: "silo", x: POINTS.silo.x, y: POINTS.silo.y, w: 115, h: 190 },
  { id: "field1", x: POINTS.field.x, y: POINTS.field.y, w: 255, h: 175 },
  { id: "coop", x: POINTS.coop.x, y: POINTS.coop.y, w: 250, h: 170 },
  { id: "cowpen", x: POINTS.cowpen.x, y: POINTS.cowpen.y, w: 300, h: 220 },

  { id: "market", x: 298, y: 1040, w: 280, h: 220 },
  { id: "church", x: 161, y: 983, w: 220, h: 270 },
  { id: "bakery", x: POINTS.bakery.x, y: POINTS.bakery.y, w: 200, h: 185 },

  { id: "fishery", x: 278, y: 1371, w: 330, h: 230 },
  { id: "harbor", x: POINTS.harbor.x, y: POINTS.harbor.y, w: 520, h: 340 },
  { id: "lighthouse", x: 820, y: 1350, w: 180, h: 300 },
]);

export const ROAD_PATHS = Object.freeze([
  // Northern outside-world road down into the valley.
  [[930,-24],[900,82],[884,150],[834,220],[804,272],[744,335],[666,420],[630,565],[602,676]],
  // Farm loop and field access.
  [[602,676],[640,625],[607,650],[560,720],[430,720],[321,690]],
  [[602,676],[680,615],[794,526]],
  [[602,676],[710,690],[761,735]],
  // Mill / forest routes.
  [[666,420],[520,430],[370,448],[171,500]],
  [[520,430],[390,350],[182,300]],
  // Mine branch.
  [[884,150],[810,135],[760,105]],
  // Village / bakery.
  [[602,676],[610,790],[594,886],[520,960],[444,1040]],
  [[594,886],[430,955],[298,1040]],
  // Coast.
  [[594,886],[610,1040],[610,1180],[590,1280],[502,1378]],
  [[590,1280],[410,1320],[278,1371]],
  [[502,1378],[670,1370],[820,1350]],
]);
