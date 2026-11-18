// Cycles bakes include both direct and indirect light. Interpolate nearby sun directions.
const plates = new Map();
function plate(azimuth,elevation) {
  const key = azimuth+'-'+elevation;
  if (!plates.has(key)) {
    const img = new Image(); plates.set(key,img);
    img.onload = () => draw(performance.now());
    img.src = 'light/sun-'+key+'.webp';
  }
  return plates.get(key);
}
function bracket(value,steps) {
  const high = steps.findIndex(step => step >= value);
  if(high < 0) return [[steps.at(-1),1]];
  if(high === 0 || steps[high] === value) return [[steps[high],1]];
  const lo=steps[high-1],hi=steps[high],t=(value-lo)/(hi-lo);
  return [[lo,1-t],[hi,t]];
}
const blended = document.createElement("canvas");
blended.width=1120;blended.height=700;
const blendContext=blended.getContext("2d");
let previousBlend="";
function drawPhotographicRoom(ctx,w,h,now,sun,still) {
  const scale=Math.max(w/1120,h/700), elevation=sun.elevation;
  const face=Math.max(0,Math.cos((sun.azimuth-225)*Math.PI/180));
  const day=clamp(elevation/6)*clamp(face*4);
  const layers=[[plate(225,0),1-day]];
  if(day>0) for(const [az,a] of bracket(sun.azimuth,[155,190,225,260,295]))
    for(const [el,b] of bracket(elevation,[6,22,48])) layers.push([plate(az,el),a*b*day]);
  ctx.save();ctx.translate((w-1120*scale)/2,(h-700*scale)/2);ctx.scale(scale,scale);
  const ready=layers.filter(([img,w])=>img.naturalWidth && w>0);
  const stamp=ready.map(([img,w])=>img.src+':'+w).join('|');
  if(ready.length && stamp!==previousBlend){
    let sum=0;
    for(const [img,weight] of ready){
      sum+=weight;blendContext.globalAlpha=weight/sum;
      blendContext.drawImage(img,0,0);
    }
    previousBlend=stamp;
  }
  ctx.drawImage(blended,0,0);
  if(!still && previousBlend){
    for(const [lo,hi] of [[287,453],[466,671],[687,822]]) {
      for(let y=126;y<335;y+=5){
        const gust=Math.sin(now*.00085+y*.007)*Math.sin((y-126)*Math.PI/209)*1.25;
        ctx.drawImage(blended,lo+2,y,hi-lo-4,5,lo+2+gust,y,hi-lo-4,5);
      }
    }
  }
  if(elevation<3){ctx.fillStyle='rgba(9,17,30,'+(.86*clamp((3-elevation)/16))+')';ctx.fillRect(0,0,1120,700)}
  ctx.restore();return true;
}
// The planner also listens for the original plate pair's load events.
const roomPlate=plate(225,0),forestPlate=roomPlate;
