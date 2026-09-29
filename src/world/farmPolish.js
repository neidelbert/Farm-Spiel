// Authored courtyard pass. Coordinates remain compatible with existing gameplay.
// This layer reuses catalog images; it adds no buildings or production fields.
export const FARM_PENS = [
 {id:'chicken',points:[[2130,2150],[2370,2120],[2410,2300],[2170,2330]],gate:3},
 {id:'sheep',points:[[2440,2250],[2700,2250],[2790,2500],[2530,2500]],gate:1},
 {id:'cow',points:[[2105,2460],[2335,2460],[2390,2740],[2160,2740]],gate:3},
 {id:'rabbit',points:[[2080,2870],[2320,2870],[2410,3080],[2170,3080]],gate:3},
];
const PROPS = {
 schubkarre_1108:[1485,2140], kiste_1090:[1505,2160], fass_1091:[1480,2115], saatgutsack_1092:[1519,2170],
 kiste_1093:[2070,2250], fass_1094:[2075,2220], saatgutsack_1095:[2096,2260],
 kiste_1096:[1872,2490], fass_1097:[1878,2456], saatgutsack_1098:[1900,2502], strohballen_1110:[2045,2310],
};
export class FarmPolish {
 constructor(renderer){this.renderer=renderer;this.ground=null;this.bounds={x:1100,y:1850,w:1700,h:1300};this.extras=[];this.fences=[];this.prepare();}
 prepare(){const r=this.renderer;let serial=0;const add=(no,x,y,w,category='vegetation')=>this.extras.push(r.sprite(r.catalogId(no),x,y,w,{id:'hof-detail-'+serial++,category,layer:10}));
 // Low planting bands hug the foundations and leave entrances open.
 const beds=[[[1488,2110],[1505,2155],[1530,2187]],[[1700,2155],[1744,2132],[1760,2093]],[[1790,2041],[1845,2072],[1885,2054]],[[2040,2204],[2070,2245],[2050,2280]],[[1660,2470],[1700,2510]],[[1810,2485],[1845,2465]]];
 for(const band of beds)for(let i=0;i<band.length;i++){const [x,y]=band[i];add(70,x,y,26+i%2*8);add(i%2?75:76,x+12,y+9,21);add(73,x-14,y+5,17);}
 // Orchard roots and field margins, not the open construction reserve.
 for(const [x,y]of [[1420,2190],[2040,2230],[1530,2580],[2040,2980]]){add(73,x-25,y+7,26);add(75,x+22,y+9,27);}
 for(const [x,y]of [[1150,2480],[1210,2525],[1320,2530],[1392,2716],[1510,2728],[1540,2848],[1730,2850]]){add(73,x,y,18);add(76,x+11,y+4,17);}
 for(const [x,y]of [[1480,2222],[1510,2245],[1550,2262],[1610,2295],[1600,2340],[1590,2400],[1575,2450],[1610,2515],[1660,2550],[1820,2558],[1880,2525],[1920,2335],[2010,2345],[2090,2280],[2100,2225]]){add(73,x,y,22);if(serial%2)add(75,x+13,y+3,19);}
 for(const pen of FARM_PENS){for(let edge=0;edge<4;edge++){const a=pen.points[edge],b=pen.points[(edge+1)%4],length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(length/52);for(let j=0;j<count;j++){const t0=j/count,t1=(j+1)/count,p=[a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0],q=[a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1];const gate=edge===pen.gate&&j===Math.floor(count/2);this.fences.push({id:`hof-fence-${pen.id}-${edge}-${j}`,asset:r.catalogId(198),x:(p[0]+q[0])/2,y:Math.max(p[1],q[1]),width:80,height:85,layer:10,category:'fence',fence:{a:p,b:q,gate}});}}
 }
 }
 adjust(o){if(/^kuh_/.test(o.id))return {...o,x:o.x-80};const p=PROPS[o.id];return p?{...o,x:p[0],y:p[1]}:o;}
 keep(o){return !(o.id.startsWith('zaun_')||o.id==='tor_1111');}
 buildGround(){const {x,y,w,h}=this.bounds;const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.translate(-x,-y);const r=this.renderer;
 const patch=(path,fill,feather=14)=>{c.save();c.lineJoin='round';for(let n=feather;n>0;n-=2){c.globalAlpha=.045;c.lineWidth=n*2;c.strokeStyle=fill;c.stroke(path);}c.globalAlpha=.88;c.fillStyle=fill;c.fill(path);c.restore();};
 // A continuous compact working yard, with clear grass reserve around it.
 const yard=new Path2D('M 1465 2150 C 1450 2070 1570 2080 1650 2110 C 1740 2140 1790 2110 1900 2150 C 2050 2160 2110 2230 2070 2310 C 2020 2350 1880 2310 1840 2390 C 1870 2450 1900 2520 1800 2555 C 1720 2580 1600 2540 1590 2480 C 1570 2390 1640 2330 1600 2280 C 1550 2240 1470 2240 1465 2150 Z');
 patch(yard,r.pattern5||'#d0b080',20);
 for(const [px,py,rx,ry]of [[1630,2155,143,52],[1935,2240,140,58],[1750,2490,129,47],[1830,2040,65,32]]){const p=new Path2D();p.ellipse(px,py,rx,ry,0,0,Math.PI*2);patch(p,r.pattern5||'#d0b080',12);}
 // Small stone apron at the farmhouse entrance.
 const apron=new Path2D('M1540 2148 L1645 2143 L1687 2180 L1580 2215 L1515 2185 Z');patch(apron,r.pattern9||'#c9bda2',3);
 for(const pen of FARM_PENS){const p=new Path2D();pen.points.forEach(([px,py],i)=>i?p.lineTo(px,py):p.moveTo(px,py));p.closePath();c.save();c.globalAlpha=pen.id==='chicken'?.68:.27;c.fillStyle=r.pattern5||'#c8b07a';c.fill(p);c.restore();}
 // Fixed seeded surface detail is baked once, never randomised every frame.
 let seed=7129;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<1000;i++){const px=1430+rnd()*700,py=2080+rnd()*510;if(!c.isPointInPath(yard,px-x,py-y))continue;const size=.7+rnd()*2;c.fillStyle=i%3?'rgba(87,73,47,.13)':'rgba(255,241,199,.35)';c.beginPath();c.ellipse(px,py,size*1.7,size,0,0,Math.PI*2);c.fill();}
 // Worn wheel tracks at the workshop and loading bay.
 c.save();c.strokeStyle='rgba(111,89,53,.16)';c.lineWidth=3;for(const dx of [-11,11]){c.beginPath();c.moveTo(1720+dx,2520);c.bezierCurveTo(1660+dx,2500,1650+dx,2430,1680+dx,2330);c.stroke();}c.restore();
 this.ground=canvas;
 }
 drawGround(c,b){const p=this.bounds;if(b.r<p.x||b.l>p.x+p.w||b.b<p.y||b.t>p.y+p.h)return;if(!this.ground)this.buildGround();c.drawImage(this.ground,p.x,p.y);}
 drawShadow(c,o){const b=this.bounds;if(this.renderer.camera.zoom<.4||o.x<b.x||o.x>b.x+b.w||o.y<b.y||o.y>b.y+b.h)return;if(o.category!=='building_farm'&&o.category!=='vegetation'&&o.category!=='animal')return;if(o.category==='vegetation'&&o.width<70)return;const width=o.width*.43,ry=o.width*.12;c.save();c.translate(o.x+o.width*.08,o.y-o.width*.015);c.scale(1,ry/width);const g=c.createRadialGradient(0,0,0,0,0,width);g.addColorStop(0,'rgba(44,52,22,.22)');g.addColorStop(.65,'rgba(44,52,22,.10)');g.addColorStop(1,'rgba(44,52,22,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,width,0,Math.PI*2);c.fill();c.restore();}
 drawFence(c,o){const {a,b,gate}=o.fence;const im=this.renderer.loader.get(o.asset,192);if(!im)return;
 // Transform the original rail between its two post feet. Shared endpoints
 // join adjacent segments without shrinking, stretching gaps or floating posts.
 const iw=im.width,ih=im.height,sourceDX=iw*.68,sourceDY=ih*.25,sy=31/(ih*.60),dx=b[0]-a[0],dy=b[1]-a[1];
 if(Math.abs(dx)<.01){ // Side edges: solid rails follow depth, with upright posts.
  c.save();c.lineCap='round';c.strokeStyle='#76502c';c.lineWidth=6;for(const lift of [12,24]){c.beginPath();c.moveTo(a[0],a[1]-lift);c.lineTo(b[0],b[1]-lift);c.stroke();c.strokeStyle='#c3995f';c.lineWidth=3;c.stroke();c.strokeStyle='#76502c';c.lineWidth=6;}for(const p of [a,b]){c.fillStyle='#855b32';c.fillRect(p[0]-4,p[1]-34,8,35);c.fillStyle='#ceaa71';c.fillRect(p[0]-4,p[1]-34,3,33);}if(gate){c.strokeStyle='#d2b07a';c.lineWidth=3;c.beginPath();c.moveTo(a[0]+3,a[1]-28);c.lineTo(b[0]+3,b[1]-7);c.stroke();}c.restore();return;}
 const sx=dx/sourceDX,sh=(dy-sy*sourceDY)/sourceDX;c.save();c.transform(sx,sh,0,sy,a[0]-sx*iw*.16,a[1]-sh*iw*.16-sy*ih*.64);c.drawImage(im,0,0);c.restore();if(gate){c.save();c.strokeStyle="#d1ac72";c.lineWidth=3;c.beginPath();c.moveTo(a[0],a[1]-25);c.lineTo(b[0],b[1]-8);c.stroke();c.restore();}
 }
}
