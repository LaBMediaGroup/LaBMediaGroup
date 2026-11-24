// Neighboring cabinets share a reversible swim inside the ring. Travel is
// expressed in television stops, so pausing a swipe holds the exact pose.
export function gallerySwim(T,sets,basin){
  const fromEye=new T.Vector3(),toEye=new T.Vector3(),bend=new T.Vector3();
  const outgoing=new T.Vector3(),incoming=new T.Vector3();
  const smooth=T.MathUtils.smoothstep,lerp=T.MathUtils.lerp;

  function frameSet(set,aspect,fov,eye){
    const tan=Math.tan(fov*Math.PI/360);
    const distance=Math.max(set.width*.69/(tan*aspect),set.height*.82/tan,.34);
    eye.copy(set.faceCenter).addScaledVector(set.faceNormal,distance+.07);
  }

  return function pose(travel,aspect,fov,eye,look){
    const index=Math.floor(travel),fraction=travel-index;
    const from=sets[index],to=sets[Math.min(index+1,sets.length-1)];
    frameSet(from,aspect,fov,fromEye);
    if(fraction===0){eye.copy(fromEye);look.copy(from.faceCenter);return;}
    frameSet(to,aspect,fov,toEye);
    bend.copy(basin);bend.y=Math.min(-.44,Math.max(fromEye.y,toEye.y)+.44);
    // Pull back from the old screen, take the inside arc, then approach
    // the next faceplate on its normal. The end poses also start the dive-out.
    eye.lerpVectors(fromEye,toEye,fraction).lerp(bend,.67*Math.sin(Math.PI*fraction)**2);
    outgoing.subVectors(from.faceCenter,eye).normalize();
    incoming.subVectors(to.faceCenter,eye).normalize();
    const turn=smooth(fraction,.025,.64);
    const yaw=Math.atan2(outgoing.x,-outgoing.z),endYaw=Math.atan2(incoming.x,-incoming.z);
    const heading=yaw+turn*Math.atan2(Math.sin(endYaw-yaw),Math.cos(endYaw-yaw));
    const pitch=lerp(Math.asin(outgoing.y),Math.asin(incoming.y),turn);
    look.set(Math.sin(heading)*Math.cos(pitch),Math.sin(pitch),-Math.cos(heading)*Math.cos(pitch)).add(eye);
  };
}
