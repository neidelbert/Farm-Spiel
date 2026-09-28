import { CONFIG } from "../config.js";
import { WORLD_OBJECTS, ROAD_PATHS } from "../data/worldData.js";

export class Renderer {
  constructor({ canvas, camera }) {
    this.canvas = canvas;
    this.camera = camera;
    this.ctx = canvas.getContext("2d", {alpha:false,desynchronized:true});
    if (!this.ctx) throw new Error("Canvas nicht verfügbar");
    this.dpr = 1;
    this.viewport = {width:1,height:1};
    this.fps = 60; this._frames = 0; this._fpsAt = performance.now();

    this.worldImage = new Image();
    this.worldImage.decoding = "async";
    this.worldLoaded = false;
    this.ready = new Promise((resolve,reject)=>{
      this.worldImage.addEventListener("load",()=>{ this.worldLoaded=true; resolve(); },{once:true});
      this.worldImage.addEventListener("error",()=>reject(new Error("Weltgrafik konnte nicht geladen werden.")),{once:true});
    });
    this.worldImage.src = CONFIG.world.image;
  }

  resize() {
    const r=this.canvas.getBoundingClientRect();
    this.dpr=Math.min(window.devicePixelRatio||1,2.5);
    this.canvas.width=Math.max(1,Math.round(r.width*this.dpr));
    this.canvas.height=Math.max(1,Math.round(r.height*this.dpr));
    this.viewport.width=r.width; this.viewport.height=r.height;
    this.camera.setViewport(r.width,r.height);
    this.ctx.imageSmoothingEnabled=true;
    this.ctx.imageSmoothingQuality="high";
  }

  render(state, now) {
    const ctx=this.ctx,v=this.viewport;
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    ctx.clearRect(0,0,v.width,v.height);
    ctx.fillStyle="#20372d";ctx.fillRect(0,0,v.width,v.height);

    ctx.save();
    ctx.translate(v.width/2,v.height/2);
    ctx.scale(this.camera.zoom,this.camera.zoom);
    ctx.translate(-this.camera.x,-this.camera.y);

    if(this.worldLoaded) ctx.drawImage(this.worldImage,0,0,CONFIG.world.width,CONFIG.world.height);
    else this.drawFallback(ctx);

    this.drawWaterLife(ctx,state,now);
    this.drawProgressionCovers(ctx,state,now);
    this.drawField(ctx,state,now);
    if(state.world.scrapVisible) this.drawScrap(ctx,now);
    if(state.construction) this.drawConstruction(ctx,state.construction,now);
    this.drawProductionFX(ctx,state,now);
    this.drawAnimals(ctx,state,now);
    this.drawVehicles(ctx,state,now);
    this.drawEventIcons(ctx,state,now);
    if(state.world.debug) this.drawDebug(ctx,state);
    ctx.restore();

    this.drawWeatherOverlay(ctx,state,now);
    this.measureFps();
  }

  drawFallback(ctx){
    const g=ctx.createLinearGradient(0,0,0,CONFIG.world.height);g.addColorStop(0,"#557955");g.addColorStop(1,"#79a765");
    ctx.fillStyle=g;ctx.fillRect(0,0,CONFIG.world.width,CONFIG.world.height);
  }

  // Tiny moving highlights make the painted water feel alive without expensive simulation.
  drawWaterLife(ctx,state,now){
    ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle="#efffff";ctx.lineWidth=1.3;ctx.lineCap="round";
    const t=(now/45)%120;
    const ripples=[[395,180,60],[430,255,52],[325,420,52],[270,580,45],[245,760,55],[430,865,58],[570,1000,52],[695,1170,55],[570,1390,80],[740,1495,70]];
    for(let i=0;i<ripples.length;i++){
      const [x,y,w]=ripples[i]; const off=(t+i*17)%w;
      ctx.beginPath();ctx.moveTo(x-w/2+off,y);ctx.quadraticCurveTo(x-w/2+off+10,y-3,x-w/2+off+20,y);ctx.stroke();
    }
    ctx.restore();
  }

  drawProgressionCovers(ctx,state,now){
    // Before animal unlocks, gently turn the already-painted pens into quiet meadow reserves.
    if(!state.chickens.unlocked) this.coverPen(ctx,obj("coop"),"Hühner – später");
    if(!state.cows.unlocked) this.coverPen(ctx,obj("cowpen"),"Kuhweide – später");
  }

  coverPen(ctx,o,label){
    if(!o)return; const x=o.x-o.w/2,y=o.y-o.h/2;
    ctx.save();
    const g=ctx.createLinearGradient(x,y,x,y+o.h);g.addColorStop(0,"rgba(111,153,77,.93)");g.addColorStop(1,"rgba(83,132,67,.94)");
    ctx.fillStyle=g;roundRect(ctx,x,y,o.w,o.h,18);ctx.fill();
    ctx.strokeStyle="rgba(102,73,43,.78)";ctx.lineWidth=5;ctx.setLineDash([16,7]);roundRect(ctx,x+4,y+4,o.w-8,o.h-8,16);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle="rgba(255,255,230,.7)";ctx.font="700 12px -apple-system,sans-serif";ctx.textAlign="center";ctx.fillText(label,o.x,o.y+5);
    ctx.restore();
  }

  drawField(ctx,state,now){
    const f=obj("field1");if(!f)return;
    const x=f.x-f.w/2,y=f.y-f.h/2;
    const stage=cropStage(state,now);
    ctx.save();
    // Cover the reference crop so the real gameplay state owns the field.
    const soil=ctx.createLinearGradient(x,y,x,y+f.h);soil.addColorStop(0,"#8f5a2f");soil.addColorStop(1,"#6e4327");
    ctx.fillStyle=soil;roundRect(ctx,x,y,f.w,f.h,10);ctx.fill();
    ctx.strokeStyle="rgba(73,46,27,.58)";ctx.lineWidth=2;
    for(let yy=y+10;yy<y+f.h-6;yy+=10){ctx.beginPath();ctx.moveTo(x+8,yy);ctx.lineTo(x+f.w-8,yy);ctx.stroke();}

    if(stage>0){
      const cols=["#80a846","#74a342","#83aa43","#b6a33b","#d6b33e"];
      ctx.strokeStyle=cols[Math.min(cols.length-1,stage-1)];
      ctx.lineWidth=stage>=4?4:2.8;
      for(let yy=y+12;yy<y+f.h-7;yy+=9){
        const sway=Math.sin(now/500+yy*.08)*1.2;
        ctx.beginPath();ctx.moveTo(x+8,yy);ctx.lineTo(x+f.w-8+sway,yy);ctx.stroke();
      }
    }
    if(state.field.status==="harvesting"){
      const p=Math.max(0,Math.min(1,state.field.harvestProgress||.35));
      ctx.fillStyle="rgba(105,68,38,.92)";ctx.fillRect(x,y,f.w*p,f.h);
    }
    ctx.strokeStyle="rgba(54,40,24,.56)";ctx.lineWidth=3;roundRect(ctx,x,y,f.w,f.h,10);ctx.stroke();
    ctx.restore();
  }

  drawScrap(ctx,now){
    const piles=[[548,631],[575,610],[526,652]];
    for(let i=0;i<piles.length;i++){
      const [x,y]=piles[i];ctx.save();ctx.translate(x,y);ctx.rotate((i-.5)*.15);
      ctx.fillStyle="rgba(0,0,0,.2)";ctx.beginPath();ctx.ellipse(4,16,25,9,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#6a6760";roundRect(ctx,-22,-10,44,23,5);ctx.fill();
      ctx.fillStyle="#9a6444";ctx.fillRect(-5,-27,11,31);
      ctx.strokeStyle="#424641";ctx.lineWidth=4;ctx.beginPath();ctx.arc(-18,14,8,0,Math.PI*2);ctx.arc(18,14,8,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    }
  }

  drawConstruction(ctx,c,now){
    const o=obj(c.building);if(!o)return;const x=o.x-o.w/2-8,y=o.y-o.h/2-12,w=o.w+16,h=o.h+24;
    ctx.save();
    ctx.fillStyle="rgba(255,183,64,.12)";roundRect(ctx,x,y,w,h,12);ctx.fill();
    ctx.strokeStyle="#d89938";ctx.lineWidth=4;ctx.setLineDash([8,6]);roundRect(ctx,x,y,w,h,12);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle="#a9743e";ctx.lineWidth=3;for(let xx=x+12;xx<x+w;xx+=22){ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+h);ctx.stroke();}
    ctx.font="20px sans-serif";ctx.textAlign="center";ctx.fillText("🔨",o.x,o.y-o.h/2-15-Math.sin(now/260)*2);
    ctx.restore();
  }

  drawProductionFX(ctx,state,now){
    if(state.mill.unlocked){
      // wheel over the painted mill wheel
      const x=117,y=493,r=38;ctx.save();ctx.translate(x,y);ctx.rotate(now/2200);
      ctx.strokeStyle="rgba(88,54,30,.92)";ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(r,0);ctx.stroke();}
      ctx.restore();
    }
    if(state.bakery.unlocked){
      const x=438,y=963;ctx.save();ctx.globalAlpha=.23+.08*Math.sin(now/600);ctx.fillStyle="#fff0ae";ctx.beginPath();ctx.arc(x,y,24,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }

  drawAnimals(ctx,state,now){
    if(state.chickens.unlocked){
      for(let i=0;i<state.chickens.count;i++){
        const t=now/900+i*1.7;drawChicken(ctx,735+(i%3)*34+Math.sin(t)*7,520+Math.floor(i/3)*35+Math.cos(t*.8)*5);
      }
    }
    if(state.cows.unlocked){
      for(let i=0;i<state.cows.count;i++){
        const t=now/1200+i*2.1;drawCow(ctx,700+i*55+Math.sin(t)*9,735+Math.cos(t*.7)*8);
      }
    }
  }

  drawVehicles(ctx,state,now){
    for(const v of state.vehicles){
      ctx.save();ctx.translate(v.x,v.y);ctx.rotate(v.heading||0);
      ctx.fillStyle="rgba(18,25,18,.27)";ctx.beginPath();ctx.ellipse(4,9,21,8,0,0,Math.PI*2);ctx.fill();
      if(v.type==="tractor") drawTractor(ctx,state.machines.tractorRestored);
      else if(v.type==="combine") drawCombine(ctx,state.machines.combineRestored);
      else drawRoadVehicle(ctx,v.type);
      ctx.restore();
      if(v.currentTag==="harvest"&&v.waitDuration){state.field.harvestProgress=Math.max(0,Math.min(1,(Date.now()-v.waitStartedAt)/v.waitDuration));}
    }
    if(state.machines.tractor&&!state.vehicles.some(v=>v.type==="tractor")){ctx.save();ctx.translate(600,646);drawTractor(ctx,state.machines.tractorRestored);ctx.restore();}
    if(state.level>=4&&!state.vehicles.some(v=>v.type==="combine")){ctx.save();ctx.translate(635,671);drawCombine(ctx,state.machines.combineRestored);ctx.restore();}
  }

  drawEventIcons(ctx,state,now){
    const icons=[];
    if(!state.tutorialComplete)icons.push(["farmhouse","!"]);
    if(state.field.status==="ready")icons.push(["field1","🌾"]);
    else if(state.field.status==="growing")icons.push(["field1","⏱"]);
    if(state.mill.outputReady>0)icons.push(["mill","📦"]);
    if(state.chickens.eggsReady>0)icons.push(["coop","🥚"]);else if(state.chickens.unlocked&&!state.chickens.fed&&state.missionId==="eggs_baker")icons.push(["coop","🌾"]);
    if(state.cows.milkReady>0)icons.push(["cowpen","🥛"]);else if(state.cows.unlocked&&!state.cows.fed&&state.missionId==="cows_milk")icons.push(["cowpen","🌾"]);
    if(state.missionId==="storage_upgrade"&&!state.construction)icons.push(["silo","⬆"]);
    if(state.missionId==="workshop_chickens"&&!state.construction&&state.garage.level<2)icons.push(["garage","⬆"]);
    if(state.missionId==="miller_intro"&&state.mill.unlocked)icons.push(["mill","⚙"]);
    if(state.missionId==="eggs_baker"&&state.bakery.unlocked&&state.barn.items.eggs>=2&&state.barn.items.flour>=1)icons.push(["bakery","!"]);
    if(state.missionId==="cows_milk"&&state.barn.items.milk>=1&&state.barn.items.flour>=1)icons.push(["bakery","!"]);
    for(const [id,icon] of icons){const o=obj(id);if(!o)continue;const y=o.y-o.h/2-18-Math.sin(now/350)*2;drawPin(ctx,o.x,y,icon);}
  }

  drawDebug(ctx,state){
    ctx.save();ctx.font="9px monospace";ctx.lineWidth=1;
    for(const o of WORLD_OBJECTS){ctx.strokeStyle="rgba(255,60,60,.85)";ctx.strokeRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h);ctx.fillStyle="#fff";ctx.fillText(o.id,o.x-o.w/2,o.y-o.h/2-3);}
    ctx.strokeStyle="rgba(255,230,40,.7)";ctx.lineWidth=2;for(const path of ROAD_PATHS){ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)ctx.lineTo(path[i][0],path[i][1]);ctx.stroke();}
    ctx.restore();
  }

  drawWeatherOverlay(ctx,state,now){
    const {width,height}=this.viewport;const td=state.world.timeOfDay;
    if(isNight(td)){const strength=td>.78&&td<.95?.36:.23;ctx.fillStyle=`rgba(15,28,62,${strength})`;ctx.fillRect(0,0,width,height);}else if(td>.67&&td<.78){ctx.fillStyle="rgba(255,141,57,.075)";ctx.fillRect(0,0,width,height);}
    // Light translucent clouds: per design, never a heavy obstruction.
    ctx.save();ctx.globalAlpha=.055;for(let i=0;i<3;i++){const x=((now*.015+i*430)%(width+520))-260;const y=120+i*190;drawCloud(ctx,x,y,105+i*18);}ctx.restore();
    // Occasional small bird silhouettes.
    const cycle=(now/1000)%24;if(cycle<8){ctx.save();ctx.globalAlpha=.42;ctx.strokeStyle="#1f3324";ctx.lineWidth=1.4;for(let i=0;i<2;i++){const x=(cycle/8)*(width+140)-70-i*45,y=180+i*24+Math.sin(cycle+i)*7;drawBird(ctx,x,y,8);}ctx.restore();}
    if(state.world.weather==="rain"){ctx.save();ctx.strokeStyle="rgba(215,235,245,.42)";ctx.lineWidth=1.2;for(let i=0;i<75;i++){const x=(i*97+now*.42)%(width+80)-40;const y=(i*173+now*.75)%(height+80)-40;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-6,y+17);ctx.stroke();}ctx.fillStyle="rgba(50,70,88,.10)";ctx.fillRect(0,0,width,height);ctx.restore();}
    if(state.world.weather==="fog"){ctx.fillStyle="rgba(235,240,224,.22)";ctx.fillRect(0,0,width,height);}
  }

  objectAt(x,y){return [...WORLD_OBJECTS].reverse().find(o=>x>=o.x-o.w/2&&x<=o.x+o.w/2&&y>=o.y-o.h/2&&y<=o.y+o.h/2)||null;}
  measureFps(){this._frames++;const n=performance.now();if(n-this._fpsAt>=1000){this.fps=Math.round(this._frames*1000/(n-this._fpsAt));this._frames=0;this._fpsAt=n;}}
}

function obj(id){return WORLD_OBJECTS.find(o=>o.id===id);}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);}
function cropStage(state,now){const f=state.field;if(f.status==="prepared"||f.status==="harvested")return 0;if(f.status==="ready"||f.status==="harvesting"||f.status==="harvest_starting")return 5;if(f.status!=="growing"||!f.plantedAt)return f.status==="sowing"?1:0;const total=(f.readyAt||now)-f.plantedAt;const p=total<=0?1:(now-f.plantedAt)/total;if(p<.2)return 1;if(p<.5)return 2;if(p<.8)return 3;if(p<1)return 4;return 5;}
function isNight(t){return t>.76||t<.18;}
function drawPin(ctx,x,y,icon){ctx.save();ctx.font="14px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="rgba(255,250,229,.97)";ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(40,50,35,.35)";ctx.lineWidth=1.5;ctx.stroke();ctx.fillText(icon,x,y+.5);ctx.restore();}
function drawCloud(ctx,x,y,s){ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,s*.3,0,Math.PI*2);ctx.arc(x+s*.25,y-s*.08,s*.38,0,Math.PI*2);ctx.arc(x+s*.55,y,s*.28,0,Math.PI*2);ctx.fill();}
function drawBird(ctx,x,y,s){ctx.beginPath();ctx.arc(x-s*.45,y,s*.45,Math.PI,Math.PI*2);ctx.arc(x+s*.45,y,s*.45,Math.PI,Math.PI*2);ctx.stroke();}
function drawRoadVehicle(ctx,type){
  const colors={scrap_truck:"#766653",flatbed:"#8e5c43",post_van:"#dfbd42",delivery_van:"#e7eee5",builder_van:"#e0a343",animal_transport:"#9d8264"};
  ctx.fillStyle=colors[type]||"#8e9b8e";roundRect(ctx,-17,-8,34,16,4);ctx.fill();ctx.fillStyle="#364943";ctx.fillRect(-14,-6,10,6);ctx.fillStyle="#252b28";ctx.beginPath();ctx.arc(-11,9,4,0,Math.PI*2);ctx.arc(11,9,4,0,Math.PI*2);ctx.fill();
  if(type==="animal_transport"){ctx.strokeStyle="#56483b";ctx.lineWidth=1.5;for(let x=-7;x<=10;x+=6){ctx.beginPath();ctx.moveTo(x,-7);ctx.lineTo(x,6);ctx.stroke();}}
}
function drawTractor(ctx,restored){ctx.fillStyle=restored?"#d63e2f":"#8c5d43";roundRect(ctx,-14,-8,24,14,3);ctx.fill();ctx.fillStyle="#e4c85f";ctx.fillRect(-2,-14,10,8);ctx.fillStyle="#252c29";ctx.beginPath();ctx.arc(-10,8,6,0,Math.PI*2);ctx.arc(10,7,4.5,0,Math.PI*2);ctx.fill();}
function drawCombine(ctx,restored){ctx.fillStyle=restored?"#d9b333":"#8f7150";roundRect(ctx,-18,-9,31,19,3);ctx.fill();ctx.fillStyle="#42554d";ctx.fillRect(-3,-15,12,9);ctx.strokeStyle="#514333";ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(12,-10);ctx.lineTo(23,-15);ctx.moveTo(12,10);ctx.lineTo(23,15);ctx.stroke();ctx.fillStyle="#252a27";ctx.beginPath();ctx.arc(-11,11,6,0,Math.PI*2);ctx.arc(9,11,5,0,Math.PI*2);ctx.fill();}
function drawChicken(ctx,x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle="#fff1cd";ctx.beginPath();ctx.ellipse(0,0,5,3.7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#c64f3b";ctx.beginPath();ctx.arc(4,-3,2,0,Math.PI*2);ctx.fill();ctx.restore();}
function drawCow(ctx,x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle="#f2eadb";ctx.beginPath();ctx.ellipse(0,0,11,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#54483e";ctx.beginPath();ctx.arc(-4,-1,2.6,0,Math.PI*2);ctx.arc(4,2,2.2,0,Math.PI*2);ctx.fill();ctx.restore();}
