// Use the same solar elevation on both sides of the doorway.
function roomLight(elevation) {
  const unit = value => Math.min(1,Math.max(0,value));
  const blue = unit((5-elevation)/10);
  const day = unit((elevation-5)/17);
  return {blue,late:1-blue-day,turn:day};
}
function selectedElevation() {
  if(typeof sun!=='undefined' && sun) return sun.elevation;
  const value=new URLSearchParams(location.search).get('elevation');
  const elevation=value===null?22:Number(value);
  return Number.isFinite(elevation)?elevation:22;
}
function lightImages(degree) {
  const layers=Object.entries(roomLight(selectedElevation())).filter(([,weight])=>weight>0);
  const frame=document.createElement('div');
  frame.style.cssText='position:absolute;inset:0;opacity:0';
  let sum=0;
  const images=layers.map(([name,weight])=>{
    const img=new Image();sum+=weight;
    img.src=new URL('light/'+name+'-'+degree+'.webp',location.href);
    img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:'+weight/sum;
    frame.append(img);return img;
  });
  return {frame,images};
}
if(document.querySelector('.paper')) {
  function apply(elevation){
  const weights=roomLight(elevation);
  for(const [name,weight] of Object.entries(weights))document.documentElement.style.setProperty('--'+name,weight);
  document.documentElement.style.setProperty('--wall-exposure',String(1-.22*weights.late-.48*weights.blue));
  }
  apply(selectedElevation());
  addEventListener('message',e=>{
    if(e.source===parent && Number.isFinite(e.data?.roomElevation))apply(e.data.roomElevation);
  });
}
