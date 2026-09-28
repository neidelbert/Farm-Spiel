import { WORLD_OBJECTS, ROAD_PATHS } from "../data/worldData.js";

export class Renderer {
  constructor({ canvas, camera }) {
    this.canvas = canvas;
    this.camera = camera;
    this.ctx = canvas.getContext("2d", {alpha:false,desynchronized:true});
    if (!this.ctx) throw new Error("Canvas nicht verfügbar");
    this.dpr = 1;
    this.viewport = {width:1,height:1};
    this.fps = 60;
    this._frames = 0;
    this._fpsAt = performance.now();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1,Math.round(r.width*this.dpr));
    this.canvas.height = Math.max(1,Math.round(r.height*this.dpr));
    this.viewport.width = r.width;
    this.viewport.height = r.height;
    this.camera.setViewport(r.width,r.height);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
  }

  render(state, now) {
    const ctx = this.ctx, v = this.viewport;
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    ctx.clearRect(0,0,v.width,v.height);
    ctx.fillStyle="#243828";
    ctx.fillRect(0,0,v.width,v.height);

    ctx.save();
    ctx.translate(v.width/2,v.height/2);
    ctx.scale(this.camera.zoom,this.camera.zoom);
    ctx.translate(-this.camera.x,-this.camera.y);

    this.drawGround(ctx,state);
    this.drawWater(ctx,state,now);
    this.drawRoads(ctx);
    this.drawZones(ctx,state);
    this.drawFields(ctx,state,now);
    this.drawBuildings(ctx,state,now);
    this.drawAnimals(ctx,state,now);
    this.drawVehicles(ctx,state,now);
    this.drawEventIcons(ctx,state,now);
    if (state.world.debug) this.drawDebug(ctx,state);
    ctx.restore();

    this.drawWeatherOverlay(ctx,state,now);
    this.measureFps();
  }

  drawGround(ctx,state) {
    const w=2600,h=4200;
    ctx.fillStyle="#84a968"; ctx.fillRect(0,0,w,h);

    const g=ctx.createLinearGradient(0,0,w,0);
    g.addColorStop(0,"rgba(44,82,54,.36)");
    g.addColorStop(.2,"rgba(114,157,92,.08)");
    g.addColorStop(.5,"rgba(199,209,135,.12)");
    g.addColorStop(.8,"rgba(114,157,92,.08)");
    g.addColorStop(1,"rgba(44,82,54,.36)");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

    // Mountain band
    ctx.fillStyle="#6e7965";
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,0); ctx.lineTo(w,650);
    ctx.bezierCurveTo(2200,520,1900,700,1550,575);
    ctx.bezierCurveTo(1120,450,620,710,0,560); ctx.closePath(); ctx.fill();

    // Mountain faces
    for (const m of [[180,300,330],[650,250,390],[1150,250,420],[1720,260,420],[2200,250,360]]) {
      const [x,y,s]=m;
      ctx.fillStyle="#77846f"; ctx.beginPath(); ctx.moveTo(x-s/2,y+s*.7);ctx.lineTo(x,y-s*.5);ctx.lineTo(x+s/2,y+s*.7);ctx.closePath();ctx.fill();
      ctx.fillStyle="#66725f";ctx.beginPath();ctx.moveTo(x,y-s*.5);ctx.lineTo(x+s/2,y+s*.7);ctx.lineTo(x+s*.12,y+s*.35);ctx.closePath();ctx.fill();
    }

    // Coast
    ctx.fillStyle="#d9c89d"; ctx.fillRect(0,3480,w,720);
    ctx.fillStyle="#66acba"; ctx.fillRect(0,3790,w,410);

    // Farm meadow variation
    ctx.fillStyle="rgba(210,224,155,.12)";
    roundRect(ctx,580,1500,1500,1450,180); ctx.fill();

    // subtle dots/flowers - deterministic
    ctx.fillStyle="rgba(255,239,174,.55)";
    for(let i=0;i<90;i++){
      const x=(i*211)%2500+40, y=700+((i*383)%2700);
      if(y>1500&&y<3000 && i%3===0) continue;
      ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();
    }
  }

  drawWater(ctx,state,now) {
    ctx.save();
    ctx.lineCap="round";ctx.lineJoin="round";
    ctx.strokeStyle="#70bed0";ctx.lineWidth=105;
    ctx.beginPath();
    ctx.moveTo(1650,300);
    ctx.bezierCurveTo(1540,680,1430,900,1460,1190);
    ctx.bezierCurveTo(1500,1500,1120,1850,1120,2220);
    ctx.bezierCurveTo(1110,2650,1180,3040,1360,3420);
    ctx.bezierCurveTo(1450,3610,1390,3750,1370,3880);
    ctx.stroke();
    ctx.strokeStyle="rgba(237,253,255,.38)";ctx.lineWidth=6;
    ctx.setLineDash([35,65]);
    ctx.lineDashOffset=-(now/35)%100;
    ctx.stroke(); ctx.setLineDash([]);

    // Waterfall
    const grad=ctx.createLinearGradient(1600,270,1500,650);
    grad.addColorStop(0,"rgba(238,253,255,.9)");
    grad.addColorStop(1,"rgba(113,190,207,.4)");
    ctx.strokeStyle=grad;ctx.lineWidth=34;
    ctx.beginPath();ctx.moveTo(1650,260);ctx.bezierCurveTo(1600,390,1560,490,1530,620);ctx.stroke();
    ctx.restore();
  }

  drawRoads(ctx) {
    ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
    for(const path of ROAD_PATHS){
      ctx.strokeStyle="rgba(92,72,45,.13)";ctx.lineWidth=66;
      strokePath(ctx,path);
      ctx.strokeStyle="#d6bd86";ctx.lineWidth=54;strokePath(ctx,path);
      ctx.strokeStyle="rgba(255,239,190,.28)";ctx.lineWidth=4;ctx.setLineDash([28,34]);strokePath(ctx,path);ctx.setLineDash([]);
    }
    ctx.restore();
  }

  drawZones(ctx,state) {
    // forest clusters
    for(let i=0;i<48;i++){
      const x=160+((i*149)%760), y=520+((i*271)%1000);
      this.drawTree(ctx,x,y,38+(i%5)*7, i%3===0);
    }
    // farm smaller trees
    for(const [x,y] of [[560,1610],[530,1850],[2070,1710],[2150,2060],[600,2780],[2160,2970],[680,3010]]){
      this.drawTree(ctx,x,y,42,false);
    }
    // lighthouse rocks
    ctx.fillStyle="#897f6e";
    for(const [x,y,r] of [[2080,3930,55],[2240,3970,65],[2150,4050,80]]){ctx.beginPath();ctx.ellipse(x,y,r,r*.55,-.2,0,Math.PI*2);ctx.fill();}
  }

  drawTree(ctx,x,y,s,pine) {
    ctx.save();
    ctx.fillStyle="rgba(25,45,28,.18)";ctx.beginPath();ctx.ellipse(x+9,y+17,s*.55,s*.3,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#684f35";ctx.fillRect(x-4,y-s*.1,8,s*.55);
    if(pine){
      ctx.fillStyle="#315f43";
      for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x,y-s*.8+k*s*.23);ctx.lineTo(x-s*.48+k*2,y+s*.15+k*s*.1);ctx.lineTo(x+s*.48-k*2,y+s*.15+k*s*.1);ctx.closePath();ctx.fill();}
    }else{
      ctx.fillStyle="#477b43";ctx.beginPath();ctx.arc(x,y-s*.35,s*.46,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="rgba(113,154,72,.7)";ctx.beginPath();ctx.arc(x-s*.16,y-s*.48,s*.25,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  drawFields(ctx,state,now) {
    const f = obj("field1");
    const x=f.x-f.w/2,y=f.y-f.h/2;
    ctx.save();
    ctx.fillStyle="rgba(49,38,25,.18)";roundRect(ctx,x+13,y+18,f.w,f.h,26);ctx.fill();
    ctx.fillStyle=state.field.status==="prepared"||state.field.status==="harvested"?"#8b6542":"#8e6d42";
    roundRect(ctx,x,y,f.w,f.h,24);ctx.fill();
    ctx.save(); roundRect(ctx,x,y,f.w,f.h,24); ctx.clip();

    const stage = cropStage(state,now);
    if(stage>0){
      const colors=["#8ab95c","#77ad4b","#91b950","#c5b34a","#d8bd4b"];
      ctx.strokeStyle=colors[Math.min(colors.length-1,stage-1)];
      ctx.lineWidth=stage>=4?8:5;
      for(let yy=y+28;yy<y+f.h-18;yy+=28){
        ctx.beginPath();ctx.moveTo(x+16,yy);ctx.lineTo(x+f.w-16,yy);ctx.stroke();
        if(stage>=3){
          ctx.fillStyle=colors[Math.min(colors.length-1,stage-1)];
          for(let xx=x+28;xx<x+f.w-20;xx+=40){ctx.beginPath();ctx.arc(xx,yy-5,4+stage,0,Math.PI*2);ctx.fill();}
        }
      }
    }else{
      ctx.strokeStyle="rgba(63,42,27,.42)";ctx.lineWidth=3;
      for(let yy=y+24;yy<y+f.h;yy+=24){ctx.beginPath();ctx.moveTo(x+15,yy);ctx.lineTo(x+f.w-15,yy);ctx.stroke();}
    }

    if(state.field.status==="harvesting"){
      ctx.fillStyle="rgba(123,88,55,.75)";
      ctx.fillRect(x,y,f.w*(state.field.harvestProgress||.35),f.h);
    }
    ctx.restore();ctx.restore();
  }

  drawBuildings(ctx,state,now) {
    this.drawBuilding(ctx,obj("farmhouse"),"#f0e0bd","#b45643",state,"🏡");
    this.drawBuilding(ctx,obj("barn"),"#b86e43","#763b32",state,"");
    this.drawBuilding(ctx,obj("garage"),state.garage.level>=2?"#d6d3bd":"#a9997e",state.garage.level>=2?"#526957":"#755f4b",state,"");
    this.drawSilo(ctx,obj("silo"),state.silo.level);
    this.drawBuilding(ctx,obj("mill"),"#d9c99e","#8e4a3c",state,"");
    this.drawBuilding(ctx,obj("sawmill"),"#9a7952","#5f4938",state,"");
    this.drawMine(ctx,obj("mine"));
    this.drawBuilding(ctx,obj("church"),"#e5dcc8","#8d4c3f",state,"");
    this.drawMarket(ctx,obj("market"));
    this.drawBuilding(ctx,obj("bakery"),state.bakery.unlocked?"#e7c69b":"#bbb1a0","#a45e42",state,"");
    this.drawBuilding(ctx,obj("fishery"),"#a88360","#5c493c",state,"");
    this.drawHarbor(ctx,obj("harbor"));
    this.drawLighthouse(ctx,obj("lighthouse"),state,now);
    this.drawLoading(ctx,obj("loading"));

    if(state.world.scrapVisible) this.drawScrap(ctx);
    if(state.construction) this.drawConstruction(ctx,state.construction);
  }

  drawBuilding(ctx,o,wall,roof,state,emoji) {
    const x=o.x-o.w/2,y=o.y-o.h/2;
    ctx.save();
    ctx.fillStyle="rgba(27,39,28,.22)";roundRect(ctx,x+18,y+22,o.w,o.h,22);ctx.fill();
    ctx.fillStyle=wall;roundRect(ctx,x,y+40,o.w,o.h-40,18);ctx.fill();
    ctx.fillStyle="rgba(0,0,0,.10)";ctx.beginPath();ctx.moveTo(x+o.w,y+45);ctx.lineTo(x+o.w,y+o.h-18);ctx.lineTo(x+o.w-34,y+o.h);ctx.lineTo(x+o.w-34,y+64);ctx.closePath();ctx.fill();
    ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-15,y+55);ctx.lineTo(x+o.w*.5,y-18);ctx.lineTo(x+o.w+15,y+55);ctx.lineTo(x+o.w-24,y+82);ctx.lineTo(x+o.w*.5,y+18);ctx.lineTo(x+24,y+82);ctx.closePath();ctx.fill();
    ctx.fillStyle="#5a4432";ctx.fillRect(o.x-26,y+o.h-76,52,58);
    if(emoji){ctx.font="28px sans-serif";ctx.fillText(emoji,o.x-14,y+o.h-90);}
    ctx.restore();
  }

  drawSilo(ctx,o,level){
    ctx.save();const x=o.x,y=o.y;
    ctx.fillStyle="rgba(30,40,30,.22)";ctx.beginPath();ctx.ellipse(x+13,y+92,90,40,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=level>=2?"#d8d3bd":"#b8b3a1";ctx.fillRect(x-72,y-90,144,170);
    ctx.fillStyle=level>=2?"#d9aa4b":"#88775f";ctx.beginPath();ctx.moveTo(x-82,y-90);ctx.lineTo(x,y-160);ctx.lineTo(x+82,y-90);ctx.closePath();ctx.fill();
    ctx.fillStyle="#685c4c";ctx.fillRect(x-18,y+24,36,56);ctx.restore();
  }

  drawMine(ctx,o){
    ctx.save();ctx.fillStyle="#71695d";ctx.beginPath();ctx.ellipse(o.x,o.y+40,190,120,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#3f423d";ctx.beginPath();ctx.arc(o.x,o.y+55,80,Math.PI,0);ctx.lineTo(o.x+80,o.y+110);ctx.lineTo(o.x-80,o.y+110);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#8e7152";ctx.lineWidth=15;ctx.strokeRect(o.x-90,o.y+35,180,105);ctx.restore();
  }

  drawMarket(ctx,o){ this.drawBuilding(ctx,o,"#d6c8a7","#a55b43",null,""); }

  drawHarbor(ctx,o){
    ctx.save();ctx.fillStyle="#8d6846";for(let i=0;i<5;i++)ctx.fillRect(o.x-o.w/2+i*110,o.y-20,80,230);
    ctx.fillStyle="#7b583d";ctx.fillRect(o.x-o.w/2,o.y-15,o.w,55);ctx.restore();
  }

  drawLighthouse(ctx,o,state,now){
    ctx.save();ctx.fillStyle="rgba(30,40,30,.25)";ctx.beginPath();ctx.ellipse(o.x+15,o.y+120,90,30,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f0eadc";ctx.beginPath();ctx.moveTo(o.x-40,o.y+130);ctx.lineTo(o.x-25,o.y-90);ctx.lineTo(o.x+25,o.y-90);ctx.lineTo(o.x+40,o.y+130);ctx.closePath();ctx.fill();
    ctx.fillStyle="#b94e45";ctx.fillRect(o.x-34,o.y-25,68,38);ctx.fillRect(o.x-27,o.y-92,54,34);
    ctx.fillStyle="#493c32";ctx.beginPath();ctx.moveTo(o.x-45,o.y-92);ctx.lineTo(o.x,o.y-135);ctx.lineTo(o.x+45,o.y-92);ctx.closePath();ctx.fill();
    if(isNight(state.world.timeOfDay)){
      ctx.save();ctx.translate(o.x,o.y-108);ctx.rotate(now/1500);
      const g=ctx.createLinearGradient(0,0,260,0);g.addColorStop(0,"rgba(255,245,166,.52)");g.addColorStop(1,"rgba(255,245,166,0)");
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(260,-55);ctx.lineTo(260,55);ctx.lineTo(0,10);ctx.closePath();ctx.fill();ctx.restore();
    }
    ctx.restore();
  }

  drawLoading(ctx,o){
    ctx.save();ctx.fillStyle="#b8aa8a";roundRect(ctx,o.x-o.w/2,o.y-o.h/2,o.w,o.h,24);ctx.fill();
    ctx.strokeStyle="rgba(90,75,52,.3)";ctx.lineWidth=5;ctx.setLineDash([20,15]);roundRect(ctx,o.x-o.w/2+20,o.y-o.h/2+20,o.w-40,o.h-40,18);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  }

  drawScrap(ctx){
    for(const [x,y] of [[790,1720],[930,1660],[720,1870]]){
      ctx.save();ctx.translate(x,y);ctx.fillStyle="#6b665e";ctx.fillRect(-35,-20,70,40);ctx.fillStyle="#9b6749";ctx.fillRect(-12,-45,25,55);ctx.strokeStyle="#4d4b47";ctx.lineWidth=8;ctx.beginPath();ctx.arc(-30,28,17,0,Math.PI*2);ctx.arc(30,28,17,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }

  drawConstruction(ctx,c){
    const o=obj(c.building); if(!o)return;
    const x=o.x-o.w/2-22,y=o.y-o.h/2-28,w=o.w+44,h=o.h+55;
    ctx.save();ctx.strokeStyle="#d59d36";ctx.lineWidth=9;ctx.setLineDash([18,12]);ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
    ctx.fillStyle="#b08048";for(let i=0;i<4;i++)ctx.fillRect(x+i*w/3-5,y,10,h);
    ctx.font="34px sans-serif";ctx.fillText("🔨",o.x-17,y-15);ctx.restore();
  }

  drawAnimals(ctx,state,now){
    if(state.chickens.unlocked){
      this.drawPen(ctx,obj("coop"),"#d6bd86");
      for(let i=0;i<state.chickens.count;i++){
        const t=now/900+i*1.7;const x=1690+(i%3)*70+Math.sin(t)*18,y=2380+Math.floor(i/3)*90+Math.cos(t*.8)*12;
        drawChicken(ctx,x,y);
      }
    }
    if(state.cows.unlocked){
      this.drawPen(ctx,obj("cowpen"),"#d1c08d");
      for(let i=0;i<state.cows.count;i++){
        const t=now/1200+i*2.1;drawCow(ctx,1810+i*150+Math.sin(t)*22,2780+Math.cos(t*.7)*24);
      }
    }
  }

  drawPen(ctx,o,color){
    ctx.save();ctx.fillStyle="rgba(195,190,120,.18)";roundRect(ctx,o.x-o.w/2,o.y-o.h/2,o.w,o.h,28);ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=8;ctx.setLineDash([32,16]);roundRect(ctx,o.x-o.w/2,o.y-o.h/2,o.w,o.h,28);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  }

  drawVehicles(ctx,state,now){
    for(const v of state.vehicles){
      ctx.save();ctx.translate(v.x,v.y);ctx.rotate(v.heading||0);
      ctx.fillStyle="rgba(20,30,20,.23)";ctx.beginPath();ctx.ellipse(10,20,52,22,0,0,Math.PI*2);ctx.fill();
      if(v.type==="tractor") drawTractor(ctx,state.machines.tractorRestored);
      else if(v.type==="combine") drawCombine(ctx,state.machines.combineRestored);
      else drawRoadVehicle(ctx,v.type);
      ctx.restore();

      if(v.currentTag==="harvest" && v.waitDuration){
        state.field.harvestProgress=Math.max(0,Math.min(1,(Date.now()-v.waitStartedAt)/v.waitDuration));
      }
    }
    // Visible parked machines
    if(state.machines.tractor && !state.vehicles.some(v=>v.type==="tractor")) {
      ctx.save();ctx.translate(1570,2110);drawTractor(ctx,state.machines.tractorRestored);ctx.restore();
    }
    if(state.level>=4 && !state.vehicles.some(v=>v.type==="combine")) {
      ctx.save();ctx.translate(1700,2140);drawCombine(ctx,state.machines.combineRestored);ctx.restore();
    }
  }

  drawEventIcons(ctx,state,now){
    const icons=[];
    if(!state.tutorialComplete) icons.push(["farmhouse","!"]);
    if(state.field.status==="ready") icons.push(["field1","🌾"]);
    if(state.field.status==="growing") icons.push(["field1","⏱"]);
    if(state.mill.outputReady>0) icons.push(["mill","📦"]);
    if(state.chickens.eggsReady>0) icons.push(["coop","🥚"]);
    else if(state.chickens.unlocked&&!state.chickens.fed&&state.missionId==="eggs_baker") icons.push(["coop","🌾"]);
    if(state.cows.milkReady>0) icons.push(["cowpen","🥛"]);
    else if(state.cows.unlocked&&!state.cows.fed&&state.missionId==="cows_milk") icons.push(["cowpen","🌾"]);
    if(state.missionId==="storage_upgrade"&&!state.construction) icons.push(["silo","⬆"]);
    if(state.missionId==="workshop_chickens"&&!state.construction&&state.garage.level<2) icons.push(["garage","⬆"]);
    if(state.missionId==="miller_intro" && state.mill.unlocked) icons.push(["mill","⚙"]);
    if(state.missionId==="eggs_baker" && state.bakery.unlocked && state.barn.items.eggs>=2 && state.barn.items.flour>=1) icons.push(["bakery","!"]);
    if(state.missionId==="cows_milk" && state.barn.items.milk>=1 && state.barn.items.flour>=1) icons.push(["bakery","!"]);

    for(const [id,icon] of icons){
      const o=obj(id); if(!o)continue;
      const y=o.y-o.h/2-48-Math.sin(now/350)*5;
      ctx.save();ctx.font="30px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle="rgba(255,250,229,.95)";ctx.beginPath();ctx.arc(o.x,y,27,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="rgba(55,65,50,.24)";ctx.lineWidth=3;ctx.stroke();ctx.fillText(icon,o.x,y+1);ctx.restore();
    }
  }

  drawDebug(ctx,state){
    ctx.save();ctx.font="16px monospace";ctx.lineWidth=3;
    for(const o of WORLD_OBJECTS){ctx.strokeStyle="rgba(255,50,50,.7)";ctx.strokeRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h);ctx.fillStyle="#fff";ctx.fillText(o.id,o.x-o.w/2,o.y-o.h/2-6);}
    for(const v of state.vehicles){ctx.fillStyle="#ff4";ctx.fillText(`${v.type}:${v.routeIndex}`,v.x+25,v.y-25);}
    ctx.restore();
  }

  drawWeatherOverlay(ctx,state,now){
    const {width,height}=this.viewport;
    const td=state.world.timeOfDay;
    if(isNight(td)){
      const strength=td>.78&&td<.95?.38:.25;
      ctx.fillStyle=`rgba(20,35,65,${strength})`;ctx.fillRect(0,0,width,height);
    } else if(td>.67&&td<.78){
      ctx.fillStyle="rgba(255,145,65,.08)";ctx.fillRect(0,0,width,height);
    }

    // Clouds are always subtle
    ctx.save();ctx.globalAlpha=.10;
    for(let i=0;i<3;i++){
      const x=((now*.018+i*420)%(width+500))-250;
      const y=130+i*170;
      drawCloud(ctx,x,y,100+i*20);
    }
    ctx.restore();

    if(state.world.weather==="rain"){
      ctx.save();ctx.strokeStyle="rgba(215,235,245,.42)";ctx.lineWidth=1.4;
      for(let i=0;i<90;i++){
        const x=(i*97 + now*.45)% (width+80)-40;
        const y=(i*173 + now*.8)% (height+80)-40;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7,y+19);ctx.stroke();
      }
      ctx.fillStyle="rgba(55,75,90,.12)";ctx.fillRect(0,0,width,height);ctx.restore();
    }
    if(state.world.weather==="fog"){
      ctx.fillStyle="rgba(235,240,224,.24)";ctx.fillRect(0,0,width,height);
    }
  }

  objectAt(x,y){
    // prioritize smaller/interactive objects
    const sorted=[...WORLD_OBJECTS].reverse();
    return sorted.find(o=>x>=o.x-o.w/2&&x<=o.x+o.w/2&&y>=o.y-o.h/2&&y<=o.y+o.h/2)||null;
  }

  measureFps(){
    this._frames++;
    const n=performance.now();
    if(n-this._fpsAt>=1000){this.fps=Math.round(this._frames*1000/(n-this._fpsAt));this._frames=0;this._fpsAt=n;}
  }
}

function obj(id){return WORLD_OBJECTS.find(o=>o.id===id);}
function strokePath(ctx,path){ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)ctx.lineTo(path[i][0],path[i][1]);ctx.stroke();}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):(ctx.rect(x,y,w,h));}

function cropStage(state,now){
  const f=state.field;
  if(f.status==="prepared"||f.status==="harvested")return 0;
  if(f.status==="ready"||f.status==="harvesting")return 5;
  if(f.status!=="growing"||!f.plantedAt)return 1;
  const total=(f.readyAt||now)-f.plantedAt;
  const p=total<=0?1:(now-f.plantedAt)/total;
  if(p<.2)return 1;if(p<.5)return 2;if(p<.8)return 3;if(p<1)return 4;return 5;
}
function isNight(t){return t>.76||t<.18;}
function drawCloud(ctx,x,y,s){
  ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,s*.3,0,Math.PI*2);ctx.arc(x+s*.25,y-s*.08,s*.38,0,Math.PI*2);ctx.arc(x+s*.55,y,s*.28,0,Math.PI*2);ctx.fill();
}
function drawRoadVehicle(ctx,type){
  const colors={scrap_truck:"#8d6b4f",flatbed:"#855842",post_van:"#e7c554",delivery_van:"#d7e1d2",builder_van:"#e0a343",animal_transport:"#9d8264"};
  ctx.fillStyle=colors[type]||"#89978a";roundRect(ctx,-43,-22,86,44,10);ctx.fill();
  ctx.fillStyle="#46564d";ctx.fillRect(-34,-17,30,18);
  ctx.fillStyle="#343936";ctx.beginPath();ctx.arc(-27,25,12,0,Math.PI*2);ctx.arc(28,25,12,0,Math.PI*2);ctx.fill();
  if(type==="animal_transport"){ctx.strokeStyle="#5b4b3d";ctx.lineWidth=4;for(let x=-20;x<=28;x+=16){ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x,18);ctx.stroke();}}
}
function drawTractor(ctx,restored){
  ctx.fillStyle=restored?"#4b874a":"#8c6048";roundRect(ctx,-38,-22,65,39,8);ctx.fill();
  ctx.fillStyle="#d3c067";ctx.fillRect(-4,-38,30,24);
  ctx.fillStyle="#2f3a33";ctx.beginPath();ctx.arc(-27,23,18,0,Math.PI*2);ctx.arc(27,20,13,0,Math.PI*2);ctx.fill();
}
function drawCombine(ctx,restored){
  ctx.fillStyle=restored?"#c7a844":"#8f7251";roundRect(ctx,-48,-25,85,52,9);ctx.fill();
  ctx.fillStyle="#4a574e";ctx.fillRect(-5,-43,35,26);
  ctx.strokeStyle="#514333";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(35,-30);ctx.lineTo(60,-45);ctx.moveTo(35,30);ctx.lineTo(60,45);ctx.stroke();
  ctx.fillStyle="#2f3431";ctx.beginPath();ctx.arc(-30,30,18,0,Math.PI*2);ctx.arc(25,30,16,0,Math.PI*2);ctx.fill();
}
function drawChicken(ctx,x,y){
  ctx.save();ctx.translate(x,y);ctx.fillStyle="#f3e9cc";ctx.beginPath();ctx.ellipse(0,0,14,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#b94d3f";ctx.beginPath();ctx.arc(10,-8,5,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawCow(ctx,x,y){
  ctx.save();ctx.translate(x,y);ctx.fillStyle="#f0e7d8";ctx.beginPath();ctx.ellipse(0,0,30,17,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#5f5246";ctx.beginPath();ctx.arc(-10,-3,7,0,Math.PI*2);ctx.arc(8,5,6,0,Math.PI*2);ctx.fill();ctx.restore();
}
