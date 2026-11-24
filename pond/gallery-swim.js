// A channel change starts from the last rendered pose, including midway
// through a previous swim. The eye and its sightline have separate timing.
export function gallerySwim(T,sets,basin,reduced){
  const v=()=>new T.Vector3();
  const lastEye=v(),lastLook=v(),startEye=v(),velocity=v(),departureVelocity=v();
  const finish=v(),inlet=v(),side=v(),direction=v();
  let startYaw=0,startPitch=0,targetYaw=0;
  const smooth=T.MathUtils.smoothstep,lerp=T.MathUtils.lerp;
  let selected=0,travel=0,from=0,to=0,start=0,duration=0,lastTime;

  function frameSet(set,aspect,fov,eye,look){
    const tan=Math.tan(fov*Math.PI/360);
    const distance=Math.max(set.width*.60/(tan*aspect),set.height*.69/tan,.28);
    side.set(set.forward.z,0,-set.forward.x);
    eye.copy(set.center).addScaledVector(set.forward,distance+.06)
      .addScaledVector(side,set.width*(aspect>1?.79:.69)*set.sideView);
    eye.y+=set.height*.55+distance*.085;
    look.copy(set.center);look.y+=set.height*.015;
  }

  function select(index,now){
    if(index===selected)return;
    const n=sets.length;
    from=travel;
    to=from+T.MathUtils.euclideanModulo(index-from+n/2,n)-n/2;
    selected=index;start=now;
    duration=(reduced || lastTime===undefined)?0:3250+Math.min(3,Math.abs(to-from))*360;
    startEye.copy(lastEye);
    direction.subVectors(lastLook,lastEye).normalize();
    startYaw=Math.atan2(direction.x,-direction.z);startPitch=Math.asin(direction.y);
    targetYaw=startYaw;
    departureVelocity.copy(velocity).clampLength(0,1.4);
  }

  function pose(aspect,fov,eye,look,now){
    const t=duration?T.MathUtils.clamp((now-start)/duration,0,1):1;
    const glide=smooth(t,.045,1);
    travel=lerp(from,to,glide);
    frameSet(sets[selected],aspect,fov,eye,look);
    if(t<1){
      finish.copy(eye);
      // Ease away from the faceplate into open water inside the ring,
      // clearing the cabinets even on a reverse or a multi-channel skip.
      const bend=Math.sin(Math.PI*t)**2;
      inlet.copy(basin);inlet.y=Math.min(-.45,Math.max(startEye.y,finish.y)+.57);
      eye.lerpVectors(startEye,finish,glide).lerp(inlet,.84*bend);
      eye.addScaledVector(departureVelocity,(duration/1000)*t*Math.exp(-12*t)*(1-t)**2);

      // Turn ahead of the dolly. Hold the destination in the frame as the
      // fish pass between the lens and its light, then close the distance.
      const range=eye.distanceTo(look);
      direction.subVectors(look,eye).normalize();
      const bearing=Math.atan2(direction.x,-direction.z);
      // Unwrap the destination bearing as the moving eye passes its back.
      // An interrupted shot can otherwise change its turn direction at 180°.
      const delta=bearing-targetYaw;
      targetYaw+=Math.atan2(Math.sin(delta),Math.cos(delta));
      const pan=smooth(t,.01,.45);
      const yaw=lerp(startYaw,targetYaw,pan),pitch=lerp(startPitch,Math.asin(direction.y),pan);
      direction.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
      look.copy(eye).addScaledVector(direction,range);
    }
    const dt=(now-lastTime)/1000;
    if(dt>0 && dt<.18 && t<1)velocity.subVectors(eye,lastEye).multiplyScalar(1/dt);
    else velocity.set(0,0,0);
    lastEye.copy(eye);lastLook.copy(look);lastTime=now;
  }
  return {select,pose,get travel(){return travel;}};
}
