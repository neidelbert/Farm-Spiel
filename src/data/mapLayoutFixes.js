// Phase 1: align visual bridge sprites with the existing vehicle road crossings.
// This does not mutate the saved world data or create fields/buildings.
export const BRIDGE_OVERRIDES=Object.freeze({
  steinbruecke_28:Object.freeze({x:745,y:1352}),
  steinbruecke_31:Object.freeze({x:1181,y:3412})
});

export function composeVisualObjects(objects){
  return objects.map(object=>{
    const position=BRIDGE_OVERRIDES[object.id];
    return position?{...object,x:position.x,y:position.y}:object;
  });
}

export function traceSmoothRoad(ctx,points){
  if(!points.length)return false;
  ctx.beginPath();
  ctx.moveTo(points[0][0],points[0][1]);
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
    ctx.lineTo(beforeX,beforeY);
    ctx.quadraticCurveTo(curr[0],curr[1],afterX,afterY);
  }
  if(points.length>1)ctx.lineTo(points.at(-1)[0],points.at(-1)[1]);
  return true;
}
