import { Renderer as LegacyRenderer } from './legacyRenderer.js';
import { RUNTIME_POINTS as POINTS, WORLD_ROADS as ROAD_PATHS, WORLD_RUNTIME } from '../data/worldRuntime.js';
import { MODULAR_WORLD as WORLD } from '../data/modularWorld.js';
import { ASSET_CATALOG } from '../data/assetCatalog.js';
import { AssetLoader, ASSETS } from './assetLoader.js';
import { FarmPolish } from './farmPolish.js';
import { WorldInteractionCore } from './interactions.js';
import { collectWorldEventIcons, getWorldEventIconPosition } from './worldUi.js';
const ID=n=>ASSET_CATALOG.assets[n-1].id;
const VEHICLES={scrap_truck:179,flatbed:182,post_van:178,delivery_van:177,builder_van:181,animal_transport:180,tractor:170,combine:172};
export class Renderer extends LegacyRenderer {
 constructor(options){super(options);this.ready.catch(()=>{});this.loader=new AssetLoader();this.land=new Path2D(WORLD.land);this.river=new Path2D(WORLD.river);this.selected=null;this.lastTap=0;this.visibleCount=0;this.chunks=new Map();this.catalogId=ID;this.polish=new FarmPolish(this);
 const renderedWorldObjects=[];
 for(const original of [...WORLD.objects,...this.polish.extras,...this.polish.fences]){if(!this.polish.keep(original))continue;const o=this.polish.adjust(original);renderedWorldObjects.push(o);const k=Math.floor(o.x/400)+','+Math.floor(o.y/400);if(!this.chunks.has(k))this.chunks.set(k,[]);this.chunks.get(k).push(o);}
 this.interactions=new WorldInteractionCore({
  objects:renderedWorldObjects,
  fields:WORLD.fields,
  loading:{id:'loading',x:POINTS.loading.x,y:POINTS.loading.y,width:105,height:81,anchor:[.5,.93],layer:10},
  harbor:{id:'harbor',x:WORLD.destinations.hafen.x,y:WORLD.destinations.hafen.y,width:380,height:240,anchor:[.5,.5],layer:0},
 });
 this.ready=Promise.all([1,5,9,48,81,83,86,89,132,170,183].map(n=>this.loader.request(ID(n),512))).then(()=>{for(const n of [1,5,9,48]){const im=this.loader.get(ID(n),512);if(im){const p=this.ctx.createPattern(im,'repeat');if(p?.setTransform)p.setTransform(new DOMMatrix().scale(n===48?1:.65));this['pattern'+n]=p;}}});
 }
 render(s,now){const c=this.ctx,{width:w,height:h}=this.viewport,z=this.camera.zoom;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#158ba5';c.fillRect(0,0,w,h);c.save();c.translate(w/2,h/2);c.scale(z,z);c.translate(-this.camera.x,-this.camera.y);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 const box={l:this.camera.x-w/(2*z),r:this.camera.x+w/(2*z),t:this.camera.y-h/(2*z),b:this.camera.y+h/(2*z)};
 this.terrain(c,box,now);const objects=this.visible(box).filter(o=>this.show(o,s,z)).map(o=>({...o}));
 for(const f of WORLD.fields){const no=f.id==='field1'?fieldNo(s,now):f.id==='field2'?140:142;objects.push(this.sprite(ID(no),f.x,f.y,240,{id:f.id,layer:3}));}
 for(const v of s.vehicles){let n=VEHICLES[v.type]||177;if(v.type==='tractor'&&s.machines.tractorRestored)n=171;if(v.type==='combine'&&s.machines.combineRestored)n=173;objects.push(this.sprite(ID(n),v.x,v.y,v.type==='combine'?115:95,{layer:10,flip:Math.cos(v.heading)>0,id:v.id}));if(v.type==='tractor'&&v.eventId==='first_sow')objects.push(this.sprite(ID(174),v.x+60,v.y-10,70,{layer:10}));}
 if(s.machines.tractor&&!s.vehicles.some(v=>v.type==='tractor'))objects.push(this.sprite(ID(s.machines.tractorRestored?171:170),POINTS.garage.x,POINTS.garage.y,83,{layer:10}));
 if(s.level>=4&&!s.vehicles.some(v=>v.type==='combine')){const p=WORLD_RUNTIME.parking.combine;objects.push(this.sprite(ID(s.machines.combineRestored?173:172),p.x,p.y,110,{layer:10}));}
 if(!s.vehicles.some(v=>v.type==='scrap_truck'))objects.push(this.sprite(ID(183),POINTS.loading.x,POINTS.loading.y,105,{layer:10,id:'loading'}));
 for(const o of objects){if(o.id==='silo')o.asset=ID(s.silo.level>=3?88:s.silo.level>=2?87:86);if(o.id==='garage')o.asset=ID(s.garage.level>=3?91:s.garage.level>=2?90:89);if(o.id==='barn')o.asset=ID(s.barn.level>=3?85:s.barn.level>=2?84:83);}
 objects.sort((a,b)=>(a.layer||10)-(b.layer||10)||a.y-b.y);for(const o of objects)if(inBox(o,box))this.polish.drawShadow(c,o);this.visibleCount=0;for(const o of objects){if(!inBox(o,box))continue;this.drawSprite(c,o,now);this.visibleCount++;}
 if(s.construction){const o=this.interactions.get(s.construction.building);if(o){const b=o.bounds;c.save();c.strokeStyle='#ffdc81';c.lineWidth=5;c.setLineDash([10,8]);c.strokeRect(b.left-12,b.top-12,b.width+24,b.height+24);c.restore();}}
 if(s.world.scrapVisible){const p=WORLD_RUNTIME.scrap;this.drawSprite(c,this.sprite(ID(191),p.pile.x,p.pile.y,85),now);this.drawSprite(c,this.sprite(ID(189),p.crate.x,p.crate.y,38),now);this.drawSprite(c,this.sprite(ID(188),p.barrel.x,p.barrel.y,42),now);}
 this.drawEventIcons(c,s,now);if(this.selected&&now-this.lastTap<900){const b=this.selected.bounds;c.strokeStyle='#fff4b5';c.lineWidth=4/z;c.beginPath();c.ellipse((b.left+b.right)/2,b.bottom-6,Math.max(18,b.width*.42),18,0,0,Math.PI*2);c.stroke();}if(s.world.debug)this.drawInteractionDebug(c);c.restore();this.drawWeatherOverlay(c,s,now);this.measureFps();
 }
 terrain(c,b,now){c.fillStyle=this.pattern48||'#1ca7c1';c.fillRect(b.l,b.t,b.r-b.l,b.b-b.t);c.strokeStyle='#e0cf94';c.lineWidth=55;c.stroke(this.land);c.fillStyle=this.pattern1||'#98af4e';c.fill(this.land);c.save();c.clip(this.land);c.strokeStyle='#aaa977';c.lineWidth=190;c.stroke(this.river);c.strokeStyle='#5ececf';c.lineWidth=166;c.stroke(this.river);c.strokeStyle=this.pattern48||'#27b4d0';c.lineWidth=140;c.stroke(this.river);c.restore();
 c.fillStyle=this.pattern9||'#d1c4a5';c.beginPath();c.ellipse(790,3760,330,175,0,0,Math.PI*2);c.fill();c.lineJoin='round';c.lineCap='round';for(const p of ROAD_PATHS){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.save();c.strokeStyle='#aaa369';for(const [width,alpha]of [[70,.07],[62,.13],[54,.24]]){c.globalAlpha=alpha;c.lineWidth=width;c.stroke();}c.globalAlpha=1;c.strokeStyle=this.pattern5||'#d5b783';c.lineWidth=43;c.stroke();c.restore();}this.polish.drawGround(c,b);c.save();c.globalAlpha=.35;c.strokeStyle='#eeffff';c.lineWidth=3;const phase=(now/70)%65;for(const [x,y]of WORLD.riverPoints){if(x<b.l-100||x>b.r+100||y<b.t-100||y>b.b+100)continue;c.beginPath();c.moveTo(x-20,y+phase);c.quadraticCurveTo(x,y+phase+6,x+28,y+phase);c.stroke();}c.restore();
 }
 visible(b){const out=[];for(let y=Math.floor((b.t-500)/400);y<=Math.floor((b.b+500)/400);y++)for(let x=Math.floor((b.l-500)/400);x<=Math.floor((b.r+500)/400);x++)out.push(...(this.chunks.get(x+','+y)||[]));return out;}
 show(o,s,z){if(o.id.startsWith('field'))return false;if(o.category==='animal'){if(o.asset===ID(157)&&!s.chickens.unlocked)return false;if(o.asset===ID(162)&&!s.cows.unlocked)return false;}if(z<.25&&o.category==='prop')return false;if(z<.3&&o.width<45)return false;return true;}
 sprite(asset,x,y,width,extra={}){const a=ASSETS.get(asset);return {asset,x,y,width,height:width*a.height/a.width,anchor:[.5,.93],...extra};}
 drawSprite(c,o,now){if(o.fence){this.polish.drawFence(c,o);return;}const im=this.loader.get(o.asset,Math.ceil(o.width*this.camera.zoom*this.dpr));if(!im)return;const a=ASSETS.get(o.asset),height=o.width*a.height/a.width,ax=o.anchor?.[0]??.5,ay=o.anchor?.[1]??.93;let y=o.y;if(o.animated==='foam')y+=Math.sin(now/1300+o.x)*3;c.save();c.translate(o.x,y);if(o.flip)c.scale(-1,1);if(o.category==='animal'&&this.camera.zoom>.4)c.rotate(Math.sin(now/1500+o.x)*.012);c.drawImage(im,-o.width*ax,-height*ay,o.width,height);c.restore();}
 drawEventIcons(c,s,now){for(const {id,icon} of collectWorldEventIcons(s)){const p=getWorldEventIconPosition(this.interactions,id,now);if(!p)continue;drawWorldPin(c,p.x,p.y,icon);}}
 drawInteractionDebug(c){c.save();c.font='9px monospace';c.lineWidth=1;for(const o of this.interactions.all()){const b=o.bounds;c.strokeStyle=o.kind==='area'?'rgba(80,210,255,.85)':'rgba(255,60,60,.85)';c.strokeRect(b.left,b.top,b.width,b.height);c.fillStyle='#fff';c.fillText(o.id,b.left,b.top-3);}c.strokeStyle='rgba(255,230,40,.7)';c.lineWidth=2;for(const path of ROAD_PATHS){c.beginPath();c.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)c.lineTo(path[i][0],path[i][1]);c.stroke();}c.restore();}
 objectAt(x,y){const a=this.interactions.hitTest(x,y);this.selected=a;this.lastTap=Date.now();return a;}
}
function drawWorldPin(ctx,x,y,icon){ctx.save();ctx.font='14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(255,250,229,.97)';ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(40,50,35,.35)';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#29452f';ctx.fillText(icon,x,y+.5);ctx.restore();}
function inBox(o,b){return o.x+o.width/2>b.l&&o.x-o.width/2<b.r&&o.y+30>b.t&&o.y-o.height<b.b;}
function fieldNo(s,now){const f=s.field;if(f.status==='harvested')return 139;if(['ready','harvesting','harvest_starting'].includes(f.status))return 138;if(f.status==='sowing')return 133;if(f.status==='growing'){const p=(now-f.plantedAt)/Math.max(1,f.readyAt-f.plantedAt);return p<.2?134:p<.45?135:p<.7?136:137;}return f.status==='prepared'?132:131;}
