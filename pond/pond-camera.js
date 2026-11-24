// The oak and its reflection share a frame at the website stop. The same
// sightline crosses the surface on the approach to the first television.
export function pondCamera(T, tree) {
  const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
  const overlook=v(-7.2,1.48,-3.95), contact=v(-2.32,0,-7.82);
  const aim=v(),direction=v(),dryOrigin=v(),returnEye=v();
  const matrix=new T.Matrix4(),up=v(0,1,0);
  const rotation=new T.Quaternion(),returnView=new T.Quaternion();
  const smooth=T.MathUtils.smoothstep;
  function face(eye,target,q){matrix.lookAt(eye,target,up);return q.setFromRotationMatrix(matrix);}
  function frameOverlook(camera,q){
    const portrait=camera.aspect<1;
    // Leave room for the work on the left; the narrower screen stacks it below the crown.
    aim.set(tree.x-(portrait?.9:4.8),portrait?1.8:2.85,tree.y);
    return face(overlook,aim,q);
  }
  function enter(camera,p,stroke,exitMix,roomEye,roomLook,sun,reduced){
    dryOrigin.copy(camera.position);
    returnEye.copy(dryOrigin).lerp(roomEye,smooth(p,0,1));
    face(roomEye,roomLook,rotation);
    returnView.copy(camera.quaternion).slerp(rotation,smooth(p,0,1));
    if(reduced){
      camera.position.copy(returnEye);camera.quaternion.slerp(rotation,smooth(p,.32,.98));return;
    }
    const t=smooth(p,.075,1), crossing=.41;
    // Two quadratic segments share the surface knot and a forward tangent.
    // Both sides use the same displaced waterline and world coordinates.
    const dx=roomEye.x-dryOrigin.x,dz=roomEye.z-dryOrigin.z;
    let a,b,c,u;
    if(t<crossing){
      a=dryOrigin;b=aim.copy(contact).addScaledVector(direction.set(dx,0,dz),-crossing*.46);
      c=contact;u=t/crossing;
    }else{
      a=contact;b=aim.copy(contact).addScaledVector(direction.set(dx,0,dz),(1-crossing)*.46);
      c=roomEye;u=(t-crossing)/(1-crossing);
    }
    const h=1-u;
    camera.position.set(h*h*a.x+2*h*u*b.x+u*u*c.x,0,h*h*a.z+2*h*u*b.z+u*u*c.z);
    const air=T.MathUtils.lerp(dryOrigin.y,.24,smooth(p,.10,.47));
    const wet=T.MathUtils.lerp(-.36,roomEye.y,smooth(p,.46,1));
    const impact=smooth(stroke,0,1);
    camera.position.y=T.MathUtils.lerp(air,wet,impact);
    // Catch the horizon glint, then tilt along its rippled stripe. At the
    // surface the eye still has forward motion. Let the glass pull it level.
    direction.subVectors(contact,dryOrigin);direction.y=0;direction.normalize();
    const tilt=T.MathUtils.lerp(Math.max(.065,Math.min(.26,sun.y)),.95,smooth(p,.13,.475));
    aim.copy(camera.position).addScaledVector(direction,Math.cos(tilt));aim.y-=Math.sin(tilt);
    camera.quaternion.slerp(face(camera.position,aim,rotation),smooth(p,.05,.35));
    const acquisition=impact*(.81+.19*smooth(p,.46,.84));
    camera.quaternion.slerp(face(camera.position,roomLook,rotation),acquisition);
    camera.position.lerp(returnEye,exitMix);camera.quaternion.slerp(returnView,exitMix);
  }
  // The first two knots belong to the live cabinet. The rest climb through
  // one patch of open water on the west side of the oak's spit.
  const breach=v(-1.85,0,-10.4);
  const climb=new T.CatmullRomCurve3([
    v(),v(),v(),breach,v(-1.65,.88,-10.42),v(-1.32,3.55,-10.18),
    v(-1.65,7.4,-10.27),v(-3.65,10.15,-8.2),v(-6.4,11.25,-3.4)
  ],false,'catmullrom',.4);
  const windowDir=v(),oakAim=v(),farAim=v(),windowRotation=new T.Quaternion();
  function leave(camera,p,eye,look,sun){
    climb.points[0].copy(eye);
    climb.points[1].copy(eye).lerp(breach,.095);
    climb.points[2].copy(eye).lerp(breach,.60);
    climb.points[2].y=-.50;
    const t=smooth(p,0,1);
    climb.getPoint(t,camera.position);
    // Sight the daylight through Snell's window. After dark the opening
    // reflects the brighter horizon sky, with a steeper upward sightline.
    const scale=sun.y>0 ? 1/1.333 : .67;
    windowDir.set(sun.x*scale,0,sun.z*scale);
    windowDir.y=Math.sqrt(Math.max(.001,1-windowDir.lengthSq()));
    aim.copy(camera.position).add(windowDir);
    face(camera.position,aim,windowRotation);
    face(eye,look,camera.quaternion);
    camera.quaternion.slerp(windowRotation,smooth(p,.005,.220));
    // Track the trunk upward, pass the crown, then open onto the landscape.
    oakAim.set(tree.x,2.4+5.4*smooth(p,.45,.78),tree.y);
    const portrait=camera.aspect<1;
    farAim.set(tree.x-(portrait?1.8:6),5.8,tree.y-6);
    oakAim.lerp(farAim,smooth(p,.73,.99));
    camera.quaternion.slerp(face(camera.position,oakAim,rotation),smooth(p,.325,.57));
  }
  return {overlook,contact,breach,frameOverlook,enter,leave};
}
