// Visual-only composition: existing fields, buildings, routes and saves remain unchanged.
export const BRIDGE_OVERRIDES=Object.freeze({
  steinbruecke_28:Object.freeze({x:745,y:1352}),
  steinbruecke_31:Object.freeze({x:1181,y:3412})
});
const SCENES=[
  ['millbank',[[763,2369],[764,2423],[799,2693],[773,2210],[776,2762],[795,2560],[425,2687],[396,2621],[704,2501],[783,1746],[377,2562],[706,2366],[696,2227],[608,2135],[419,1614],[348,1667],[354,2750],[668,2420]],['reeds_01','bush_flower_white_01','grass_tuft_01']],
  ['village',[[831,3566],[875,3319],[1272,3783],[721,3972],[829,4030],[643,3306],[258,3597],[773,3937],[793,3420],[108,3716],[1202,3631],[1189,3818],[222,3784],[951,3415],[744,3348],[408,3430],[1289,3868],[894,3372],[1002,3483],[770,3521],[1295,3974],[821,3943],[829,3496],[576,3338],[511,3358],[1218,3857],[873,3591],[1223,3966]],['bush_flower_pink_01','flowers_wild_01','grass_tuft_02','prop_bench_01']],
  ['mountain',[[1440,1166],[2203,1259],[1251,923],[1623,1259],[1686,1249],[1228,757],[1713,1202],[1774,1249],[2261,1268],[1217,1028],[2031,1278],[1259,701],[2002,835],[2237,647]],['rock_single_small_01','bush_green_01','flowers_wild_02']]
];
const SIZES={reeds_01:[32,32],bush_flower_white_01:[44,38],grass_tuft_01:[25,20],bush_flower_pink_01:[44,38],flowers_wild_01:[27,24],grass_tuft_02:[25,20],prop_bench_01:[46,32],rock_single_small_01:[49,45],bush_green_01:[51,42],flowers_wild_02:[27,24]};
function pineVariant(id){let hash=0;for(let i=0;i<id.length;i++)hash=(hash*31+id.charCodeAt(i))>>>0;return hash%9===0?'tree_pine_medium_01':hash%13===0?'tree_pine_wide_01':null;}
export function composeVisualObjects(objects){
  const result=objects.map(object=>{
    const position=BRIDGE_OVERRIDES[object.id];
    if(position)return {...object,x:position.x,y:position.y};
    if(object.asset==='tree_pine_tall_01'){const asset=pineVariant(object.id);if(asset)return {...object,asset};}
    return object;
  });
  for(const [zone,positions,assets] of SCENES)positions.forEach(([x,y],i)=>{
    const asset=assets[i%assets.length],[width,height]=SIZES[asset];
    result.push({id:`visual_${zone}_${i}`,asset,x,y,width,height,anchor:[.5,.93],footprint:[width*.64,height*.28],layer:9,category:'prop'});
  });
  return result;
}
export function traceSmoothRoad(ctx,points){
  if(!points.length)return false;
  ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length-1;i++){
    const prev=points[i-1],curr=points[i],next=points[i+1];
    const inLength=Math.hypot(curr[0]-prev[0],curr[1]-prev[1]);
    const outLength=Math.hypot(next[0]-curr[0],next[1]-curr[1]);
    if(!inLength||!outLength){ctx.lineTo(curr[0],curr[1]);continue;}
    const radius=Math.min(28,inLength/4,outLength/4);
    const beforeX=curr[0]-(curr[0]-prev[0])*radius/inLength;
    const beforeY=curr[1]-(curr[1]-prev[1])*radius/inLength;
    const afterX=curr[0]+(next[0]-curr[0])*radius/outLength;
    const afterY=curr[1]+(next[1]-curr[1])*radius/outLength;
    ctx.lineTo(beforeX,beforeY);ctx.quadraticCurveTo(curr[0],curr[1],afterX,afterY);
  }
  if(points.length>1)ctx.lineTo(points.at(-1)[0],points.at(-1)[1]);
  return true;
}
