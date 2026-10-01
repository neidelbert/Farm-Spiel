import test from "node:test";
import assert from "node:assert/strict";
import { FieldSystem } from "../src/systems/fields.js";
import { TimeSystems } from "../src/systems/timeSystems.js";
import { collectWorldEventIcons } from "../src/world/worldUi.js";
import { WorldInteractionCore } from "../src/world/interactions.js";

const field=(unlocked,status="prepared")=>({unlocked,status,crop:null,plantedAt:null,readyAt:null,harvestProgress:0,fertilized:false,fertilizedAt:null});

test("FieldSystem selects one modern field without touching siblings",()=>{const state={fields:{field1:field(true),field2:field(true),field3:field(false)}};const f2=new FieldSystem(state,"field2");assert.equal(f2.startSowing(),true);assert.equal(state.fields.field2.status,"sowing");assert.equal(state.fields.field1.status,"prepared");assert.equal(new FieldSystem(state,"field3").startSowing(),false);});

test("legacy single-field fixtures remain compatible",()=>{const state={field:{status:"prepared",crop:null,plantedAt:null,readyAt:null,harvestProgress:0,fertilized:false,fertilizedAt:null}};const fields=new FieldSystem(state);assert.equal(fields.isUnlocked(),true);assert.equal(fields.startSowing(),true);assert.equal(state.field.status,"sowing");});

test("TimeSystems advances each unlocked growing field independently",()=>{const now=100000;const state={lastSavedAt:now,world:{timeOfDay:.3,timeScale:1},fields:{field1:{...field(true,"growing"),crop:"wheat",plantedAt:1,readyAt:now},field2:{...field(true,"growing"),crop:"wheat",plantedAt:1,readyAt:now+1000},field3:field(false)},mill:{busy:false,readyAt:null,outputReady:0},chickens:{fed:false,readyAt:null,eggsReady:0},cows:{fed:false,readyAt:null,milkReady:0},construction:null,vehicles:[]};const events=[];new TimeSystems(state,{emit:(name,payload)=>events.push({name,payload})}).update(0,now);assert.equal(state.fields.field1.status,"ready");assert.equal(state.fields.field2.status,"growing");assert.deepEqual(events,[{name:"field:ready",payload:{fieldId:"field1"}}]);});

test("world event icons support modern fields and legacy field1",()=>{const rest={tutorialComplete:true,missionId:"tutorial_done",construction:null,mill:{unlocked:false,outputReady:0},chickens:{unlocked:false,fed:false,eggsReady:0},cows:{unlocked:false,fed:false,milkReady:0},garage:{level:1},bakery:{unlocked:false},barn:{items:{eggs:0,flour:0,milk:0}}};assert.deepEqual(collectWorldEventIcons({...rest,fields:{field1:{...field(true,"ready")},field2:{...field(true,"growing")},field3:field(false)}}),[{id:"field1",icon:"🌾"},{id:"field2",icon:"⏱"}]);assert.deepEqual(collectWorldEventIcons({...rest,field:{status:"ready"}}),[{id:"field1",icon:"🌾"}]);});

test("field2 and field3 receive real world hitboxes",()=>{const objects=["field1","field2","field3"].map((id,i)=>({id,x:100+i*120,y:200,width:100,height:80,anchor:[.5,.93],layer:3}));const fields=objects.map(({id,x,y})=>({id,x,y}));const core=new WorldInteractionCore({objects,fields});assert.equal(core.hitTest(220,180)?.id,"field2");assert.equal(core.hitTest(340,180)?.id,"field3");});
