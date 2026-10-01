import test from "node:test";
import assert from "node:assert/strict";

import {
  collectWorldEventIcons,
  createWorldFocusDestinations,
  getWorldEventIconPosition,
} from "../src/world/worldUi.js";

function state(overrides = {}) {
  const base = {
    tutorialComplete: true,
    missionId: "tutorial_done",
    construction: null,
    field: { status:"prepared" },
    mill: { unlocked:false, outputReady:0 },
    chickens: { unlocked:false, fed:false, eggsReady:0 },
    cows: { unlocked:false, fed:false, milkReady:0 },
    garage: { level:1 },
    bakery: { unlocked:false },
    barn: { items:{ eggs:0, flour:0, milk:0 } },
  };
  return {
    ...base,
    ...overrides,
    field:{...base.field,...(overrides.field||{})},
    mill:{...base.mill,...(overrides.mill||{})},
    chickens:{...base.chickens,...(overrides.chickens||{})},
    cows:{...base.cows,...(overrides.cows||{})},
    garage:{...base.garage,...(overrides.garage||{})},
    bakery:{...base.bakery,...(overrides.bakery||{})},
    barn:{...base.barn,...(overrides.barn||{}),items:{...base.barn.items,...(overrides.barn?.items||{})}},
  };
}

test("tutorial icon targets farmhouse through the world UI model", () => {
  assert.deepEqual(
    collectWorldEventIcons(state({tutorialComplete:false})),
    [{id:"farmhouse",icon:"!"}],
  );
});

test("ready and growing fields preserve their existing event icons", () => {
  assert.deepEqual(
    collectWorldEventIcons(state({field:{status:"ready"}})),
    [{id:"field1",icon:"🌾"}],
  );
  assert.deepEqual(
    collectWorldEventIcons(state({field:{status:"growing"}})),
    [{id:"field1",icon:"⏱"}],
  );
});

test("production and mission icon rules are preserved", () => {
  const icons=collectWorldEventIcons(state({
    missionId:"storage_upgrade",
    mill:{outputReady:2},
  }));
  assert.deepEqual(icons,[
    {id:"mill",icon:"📦"},
    {id:"silo",icon:"⬆"},
  ]);
});

test("event icon position is derived from interaction bounds", () => {
  const interactions={
    get(id){
      return id==="farmhouse"
        ? {bounds:{left:1500,right:1760,top:1932,bottom:2187}}
        : null;
    },
  };
  const p=getWorldEventIconPosition(interactions,"farmhouse",0);
  assert.deepEqual(p,{x:1630,y:1914});
});

test("missing interaction suppresses the event icon safely", () => {
  assert.equal(getWorldEventIconPosition({get:()=>null},"missing",0),null);
});

test("focus destinations use modular-world values for hof dorf and hafen", () => {
  const world={
    width:3200,
    height:5400,
    destinations:{
      hof:{x:1790,y:2170,zoom:.7},
      dorf:{x:820,y:3660,zoom:.7},
      hafen:{x:1750,y:4480,zoom:.65},
    },
  };
  const focus=createWorldFocusDestinations(world,390,844);

  assert.deepEqual(focus.hof,{x:1790,y:2170,zoom:.7});
  assert.deepEqual(focus.dorf,{x:820,y:3660,zoom:.7});
  assert.deepEqual(focus.hafen,{x:1750,y:4480,zoom:.65});
});

test("overview centers on world dimensions instead of a hard-coded camera point", () => {
  const world={width:3200,height:5400,destinations:{}};
  const focus=createWorldFocusDestinations(world,390,844);

  assert.equal(focus.overview.x,1600);
  assert.equal(focus.overview.y,2700);
  assert.equal(focus.overview.zoom,Math.min(390/3300,844/5550));
});

test("invalid named world destinations are ignored", () => {
  const world={
    width:3200,
    height:5400,
    destinations:{hof:{x:"bad",y:2170,zoom:.7}},
  };
  const focus=createWorldFocusDestinations(world,390,844);
  assert.equal("hof" in focus,false);
  assert.ok(focus.overview);
});

test("missing world dimensions are rejected", () => {
  assert.throws(
    ()=>createWorldFocusDestinations({destinations:{}},390,844),
    /World dimensions are required/,
  );
});
