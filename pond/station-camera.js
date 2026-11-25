// The front elevation stays in view from the bank to the sill. The two
// indoor shots share the same doorway and diverge only inside the walls.
export function fieldStationCamera(T,station) {
  const group=station.group;
  group.updateMatrixWorld(true);
  const v=(...xyz)=>new T.Vector3(...xyz);
  const local=(x,y,z)=>group.localToWorld(v(x,y,z));
  const smooth=(a,b,x)=>{const n=T.MathUtils.clamp((x-a)/(b-a),0,1);return n*n*(3-2*n);};
  const eye=v(),aim=v(),other=v(),outside=v(),q=new T.Quaternion(),matrix=new T.Matrix4();
  const doorLook=local(-.25,1.57,.35);
  const jamb=local(-.49,1.56,1.25), landing=local(-.49,1.72,3.10);
  const innerAim=v(),rails=new Map();
  const exitEye=v(),angles=v(),direction=v();
  const exitRotation=new T.Quaternion(),secondRotation=new T.Quaternion();
  const baseEye=v(),baseRotation=new T.Quaternion();
  function bearings(from,to){
    const dir=to.clone().sub(from).normalize();
    return v(Math.atan2(dir.x,dir.z),Math.asin(dir.y),0);
  }
  function unwrap(angle,from){return from+Math.atan2(Math.sin(angle-from),Math.cos(angle-from));}
  let lastAspect=0;
  function paths(camera,tool){
    if(camera.aspect!==lastAspect){rails.clear();lastAspect=camera.aspect;}
    if(rails.has(tool))return rails.get(tool);
    const portrait=camera.aspect<.85, pose=station.bench.pose(tool,portrait);
    const p=v(...pose.eye),focus=v(...pose.look);
    // Cropping and perspective both change with aspect. Stand farther back
    // on a phone so the eaves, both doors and the shoreline fit in the reveal.
    const pullback=portrait?2.5:0;
    const wide=local(6.6+pullback,3.45,8.4+pullback);
    const side=local(2.25,2.4,6.15+pullback*.35);
    // One spline crosses the landing and sill. Its tangent carries through the
    // open doors while the gaze transfers from the opening to the fridge.
    const threshold=tool==='story'&&portrait?local(-.59,1.51,1.14):local(-.46,1.62,.70);
    const walk=new T.CatmullRomCurve3([wide,side,landing,local(-.49,1.64,1.45),threshold,p],false,'centripetal');
    // Lift off the instrument with space behind the bench. The third mark
    // faces the open doors from inside; the turn to the sun starts outside.
    // Pull straight up and back from the actual page pose before turning.
    // This keeps the page edge and doorway in frame as the bench recedes.
    const bookLift=p.clone().add(v(0,.29,0)).addScaledVector(v(0,0,1).applyQuaternion(group.quaternion),.16);
    const marks=[p,tool==='book'?bookLift:local(-.59,1.50,.48),local(tool==='book'?.15:-.18,1.65,tool==='book'?.02:.34),
      local(-.42,1.62,.48),local(-.48,1.68,1.76),local(.12,1.72,3.05),
      local(2.5,1.84,3.76),local(4.55,1.85,3.60)];
    const sights=[focus,tool==='book'?focus.clone().lerp(jamb,.45):local(-1.05,1.30,.90),local(-.51,1.70,1.40),
      local(-.48,1.70,2.75),local(-.17,1.68,4.26),local(2.15,1.83,4.38),
      marks[6].clone().add(v(3,.20,-1.25)),marks[7].clone().add(v(2.2,.14,-2.8))];
    const headings=marks.map((m,i)=>bearings(m,sights[i]));
    for(let i=1;i<headings.length;i++)headings[i].x=unwrap(headings[i].x,headings[i-1].x);
    const exit=new T.CatmullRomCurve3(marks,false,'centripetal');
    const gaze=new T.CatmullRomCurve3(headings,false,'catmullrom',.42);
    const path={wide,walk,focus,exit,gaze};rails.set(tool,path);return path;
  }
  function outbound(path,t,flight,rotation){
    path.exit.getPoint(t,exitEye);path.gaze.getPoint(t,angles);
    // The evening planner is centered on a 47-degree field bearing. Hold
    // that landscape composition as the slider moves the sun across it.
    const outside=smooth(.68,1,t);
    angles.x=T.MathUtils.lerp(angles.x,unwrap(Math.PI-T.MathUtils.degToRad(47),angles.x),outside);
    angles.y=T.MathUtils.lerp(angles.y,.075,outside)-Math.atan2(flight,23);
    exitEye.x+=flight*.24;exitEye.y+=flight;exitEye.z-=flight*.22;
    direction.set(Math.sin(angles.x)*Math.cos(angles.y),Math.sin(angles.y),Math.cos(angles.x)*Math.cos(angles.y)).add(exitEye);
    matrix.lookAt(exitEye,direction,vUp);rotation.setFromRotationMatrix(matrix);
  }
  const vUp=v(0,1,0);
  return function position(camera,w,interior,book,board,flight,descent,pondEye,pondRotation) {
    if(w<=.00001 || descent>=1)return;
    baseEye.copy(camera.position);baseRotation.copy(camera.quaternion);
    const story=paths(camera,'story'),notebook=paths(camera,'book');
    if(w<.28){
      // First turn toward the roof while lifting along the shoreline.
      const s=smooth(0,.28,w);
      eye.copy(camera.position).lerp(story.wide,s);eye.y+=.43*Math.sin(Math.PI*s);
      camera.position.copy(eye);
      matrix.lookAt(eye,doorLook,camera.up);q.setFromRotationMatrix(matrix);
      camera.quaternion.slerp(q,smooth(0,.23,w));
      return;
    }
    const step=smooth(.28,1,w);
    story.walk.getPoint(step,eye);
    if(book>0)eye.lerp(notebook.walk.getPoint(step,other),book);
    aim.copy(doorLook).lerp(jamb,.35*smooth(.30,.60,w));
    const walked=smooth(.62,.98,w);
    innerAim.copy(story.focus).lerp(notebook.focus,book);
    if(board>.0001){
      const pose=station.eventWall.pose(camera);
      eye.lerp(pose.eye,board*walked);innerAim.lerp(pose.aim,board);
    }
    aim.lerp(innerAim,walked);
    camera.position.copy(eye);matrix.lookAt(eye,aim,camera.up);camera.quaternion.setFromRotationMatrix(matrix);
    const t=1-Math.pow(1-smooth(0,1,1-interior),1.25);
    if(t>0){
      outbound(story,t,flight,exitRotation);outside.copy(exitEye);
      outbound(notebook,t,flight,secondRotation);
      const weight=smooth(.28,.98,w)*smooth(0,.10,t);
      camera.position.lerp(outside.lerp(exitEye,book),weight);
      camera.quaternion.slerp(exitRotation.slerp(secondRotation,book),weight);
    }
    // From the field continue forward and tilt down to the existing pond
    // shot. Never run the shed entrance backwards on the way to the water.
    if(descent>0){
      // The portrait opening begins well inland. Aim directly for the pond
      // from here and skim low over the near shore before the website shot.
      baseEye.lerp(pondEye,w);baseRotation.slerp(pondRotation,w);
      camera.position.lerp(baseEye,descent);
      camera.position.y-=.92*w*Math.sin(Math.PI*descent);
      camera.quaternion.slerp(baseRotation,descent);
    }
  };
}
