// CHANCE C710143EB, closed Type C cutout. Dimensions are metres in pole space.
// See pole-cutout-reference.md for the catalogue photos, dimensions and estimates.
export function buildPoleCutout(THREE, armY, armZ, phase, bushing) {
  const steel = [], porcelain = [], dark = [];
  const front = armZ + .089 / 2;
  const p = (x,y,z) => new THREE.Vector3(.55+x,armY+y,front+z);
  const up = new THREE.Vector3(0,1,0);

  function align(geometry,a,b) {
    const axis=b.clone().sub(a).normalize(), middle=a.clone().lerp(b,.5);
    geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,axis));
    geometry.translate(middle.x,middle.y,middle.z);
    return geometry;
  }
  function rod(list,a,b,radius,sides=10) {
    list.push(align(new THREE.CylinderGeometry(radius,radius,a.distanceTo(b),sides),a,b));
  }
  function strap(a,b,width,thickness) {
    steel.push(align(new THREE.BoxGeometry(width,a.distanceTo(b),thickness),a,b));
  }
  function ring(center,radius,section) {
    const g=new THREE.TorusGeometry(radius,section,5,16);
    g.translate(center.x,center.y,center.z);
    steel.push(g);
  }

  // The bent strap bears against the crossarm face and reaches out to the
  // centre collar. The bolt, front nut and rear washer share one axis.
  const armBack=-.089;
  const mount=p(0,0,0), elbow=p(0,-.171,.004), band=p(.010,-.206,.184);
  strap(p(0,.035,.003),elbow,.046,.008);
  strap(elbow,band,.043,.009);
  rod(steel,p(0,0,armBack-.013),p(0,0,.018),.008);
  rod(steel,p(0,0,armBack-.005),p(0,0,armBack),.023);
  rod(steel,p(0,0,.007),p(0,0,.02),.016,6);

  // Two banks of porcelain sheds meet at the unshedded mounting waist.
  const lower=p(.035,-.325,.183), upper=p(-.014,-.087,.201);
  const length=lower.distanceTo(upper), points=[];
  const profile=(y,r)=>points.push(new THREE.Vector2(r,y-length/2));
  profile(0,.020);
  for(const t of [.07,.16,.25,.34,.62,.71,.80,.89]){
    const y=t*length;
    profile(y,.022);profile(y+.003,.039);profile(y+.008,.041);profile(y+.015,.022);
  }
  profile(length,.020);
  porcelain.push(align(new THREE.LatheGeometry(points,16),lower,upper));
  const collarBottom=lower.clone().lerp(upper,.43), collarTop=lower.clone().lerp(upper,.58);
  rod(steel,collarBottom,collarTop,.028);
  rod(steel,band,lower.clone().lerp(upper,.5),.012);

  // Top contact hood, lower trunnion and pull ring stay separate from the
  // porcelain, leaving daylight between the fuse barrel and the support.
  const hinge=p(-.049,-.369,.187), cap=p(-.151,-.063,.206);
  const upperEye=p(-.013,-.050,.202), lowerEye=p(.057,-.338,.190);
  strap(upper,cap,.032,.032);
  strap(lower,hinge,.036,.025);
  rod(steel,hinge.clone().add(new THREE.Vector3(0,0,-.022)),hinge.clone().add(new THREE.Vector3(0,0,.022)),.016);
  rod(dark,hinge,cap,.016);
  rod(steel,hinge,hinge.clone().lerp(cap,.115),.020);
  rod(steel,cap.clone().lerp(hinge,.115),cap,.020);
  const pull=cap.clone().add(new THREE.Vector3(-.031,-.023,.004));
  rod(steel,cap,pull.clone().add(new THREE.Vector3(.019,.008,0)),.006);
  ring(pull,.019,.0045);

  function terminal(base,center) {
    rod(steel,base,center,.010);
    // The cable passes through the eye; the clamp shoulder grips its end.
    ring(center,.009,.004);
    const grip=center.clone().add(new THREE.Vector3(0,-.005,0));
    rod(steel,grip.clone().add(new THREE.Vector3(-.009,0,0)),grip.clone().add(new THREE.Vector3(.009,0,0)),.0065);
  }
  terminal(upper,upperEye);
  terminal(lower,lowerEye);

  // The endpoint objects also position the metal. Pole rotation and lean are
  // applied to these geometries together after the jumpers are constructed.
  const leads=[
    [phase,p(.43,.27,.065),p(.30,.245,.17),p(.09,.10,.202),upperEye],
    [lowerEye,p(.13,-.40,.21),p(.19,-.76,.10),p(.07,-1.25,-.33),
      p(-.23,-1.70,-.56),bushing]
  ];
  for(const path of leads){
    const curve=new THREE.CatmullRomCurve3(path);
    dark.push(new THREE.TubeGeometry(curve,22,.0055,6,false));
  }
  return {steel,porcelain,dark,anchors:{mount,upperEye,lowerEye,phase,bushing},leads};
}
