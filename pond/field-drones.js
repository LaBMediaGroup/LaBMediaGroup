// Display models follow DJI's published flying envelopes. See field-props.md.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {raceCourse} from './race-course.js?v=21';
export function fieldDrones(T,ground,uniforms,reduced){
  const V=(x,y,z)=>new T.Vector3(x,y,z), object=new T.Group();
  const light=new T.ShaderMaterial({vertexColors:true,side:T.DoubleSide,uniforms,
    vertexShader:`varying vec3 n,c,viewDir;
      void main(){n=mat3(modelMatrix)*normal;c=color;viewDir=cameraPosition-(modelMatrix*vec4(position,1.)).xyz;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform vec3 uSunDir,uSunC;uniform float uDay;varying vec3 n,c,viewDir;
      void main(){vec3 N=normalize(n),V=normalize(viewDir),L=normalize(uSunDir);
        float rim=pow(1.-abs(dot(N,V)),2.5);
        float gloss=pow(max(0.,dot(normalize(V+L),N)),23.);
        vec3 body=c*(.66+.16*N.y+.39*max(dot(N,L),0.));
        gl_FragColor=vec4((body+rim*vec3(.08,.10,.11)+.27*uSunC*gloss)*(.71+.29*uDay),1.);}`});
  function build(fpv){
    const fixed=[],blades=[],rotors=[];
    const gray=fpv?[.40,.41,.42]:[.76,.78,.78],dark=fpv?[.19,.20,.21]:[.105,.12,.13],glass=[.13,.23,.29];
    function part(g,p,color,rot=null,dest=fixed){
      if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');
      if(rot)g.applyQuaternion(rot);
      g.translate(...p);const tint=new Float32Array(g.attributes.position.count*3);
      for(let i=0;i<tint.length;i+=3)tint.set(color,i);g.setAttribute('color',new T.BufferAttribute(tint,3));dest.push(g);
    }
    function shell(x,y,z,rx,ry,rz,color){part(new T.SphereGeometry(1,16,10).scale(rx,ry,rz),[x,y,z],color);}
    function strut(a,b,r,color){
      const from=V(...a),to=V(...b),axis=to.clone().sub(from);
      part(new T.CylinderGeometry(r,r*1.12,axis.length(),7),from.lerp(to,.5).toArray(),color,new T.Quaternion().setFromUnitVectors(V(0,1,0),axis.normalize()));
    }
    const craft=new T.Group();craft.name=fpv?'DJI Avata 2':'DJI Mini 4 Pro';
    shell(0,.004,0,fpv?.018:.038,fpv?.026:.031,fpv?.085:.076,gray);
    shell(0,fpv?.024:.017,.019,fpv?.018:.034,.018,fpv?.063:.055,fpv?dark:[.64,.66,.66]);
    const camZ=fpv?-.077:-.064,camY=fpv?.003:-.022;
    for(const s of [-1,1]){
      strut([s*(fpv?.012:.025),.012,-.036],[s*(fpv?.014:.020),camY,camZ],fpv?.003:.005,dark);
      if(!fpv)shell(s*.026,.020,-.052,.010,.010,.013,glass);
    }
    shell(0,camY,camZ,.019,.016,.013,dark);shell(0,camY,camZ-.012,.010,.010,.003,glass);
    for(const xSign of [-1,1])for(const zSign of [-1,1]){
      const x=xSign*(fpv?.0595:.1179),z=zSign*(fpv?.046:.079),y=fpv?0:.005,r=fpv?.0415:.070;
      strut([xSign*.021,.001,zSign*.035],[x,y,z],fpv?.0034:.006,gray);
      part(new T.CylinderGeometry(fpv?.009:.012,fpv?.008:.011,.015,12),[x,y+.003,z],dark);
      if(fpv){
        part(new T.CylinderGeometry(.0465,.044,.023,36,1,true),[x,-.003,z],dark);
        const flat=new T.Quaternion().setFromAxisAngle(V(1,0,0),Math.PI/2);
        part(new T.TorusGeometry(.045,.0016,5,36),[x,.009,z],gray,flat);
        for(let j=0;j<3;j++){const a=j*2*Math.PI/3;strut([x,-.007,z],[x+Math.sin(a)*.045,-.009,z+Math.cos(a)*.045],.0015,dark);}
      }else if(zSign<0)strut([x,y,z],[x-.004*xSign,-.066,z-.003],.0049,gray);
      const rotor=new T.Group();rotor.position.set(x,y+.013,z);rotor.userData.sign=xSign*zSign;rotors.push(rotor);
      const bladeCount=fpv?3:2;blades.length=0;
      for(let i=0;i<bladeCount;i++){
        const a=2*Math.PI*i/bladeCount;
        const blade=new T.SphereGeometry(1,8,4).scale(r*.10,.0016,r*.49).translate(.002,0,r*.49).rotateY(a);
        part(blade,[0,0,0],dark,null,blades);
      }
      rotor.add(new T.Mesh(mergeGeometries(blades),light));craft.add(rotor);
    }
    craft.add(new T.Mesh(mergeGeometries(fixed),light));object.add(craft);
    return {craft,rotors};
  }
  const mini=build(false),avata=build(true), course=raceCourse(T,ground,light);
  const center=V(-1.65,ground(-1.65,8),8);
  const overview=V(-5.9,ground(-5.9,17)+6.4,17);
  const cameraRail=new T.CatmullRomCurve3([overview.clone(),V(-5.7,4.6,12),V(-4.3,2.2,5),
    V(-5.65,1.95,-.7),V(-7.22,2.06,-3.40),V(-6.13,1.43,-4.94),V(-7.2,1.48,-3.95)],false,'centripetal');
  const lap=course.lap,exitDistance=.84,gateExit=lap.getPointAt(exitDistance);
  const outbound=gateExit.clone().addScaledVector(lap.getTangentAt(exitDistance),1.35);
  outbound.y+=.20;
  const route=new T.CatmullRomCurve3([gateExit,outbound,V(-2.7,1.65,.50),
    V(-5.6,1.7,-2.8),V(-4.75,1.22,-5.05),V(-3.4,.91,-6.59),V(0,1,0)],false,'centripetal');
  let time=0,lapDistance=.11;
  const rider=V(0,0,0),railEye=V(0,0,0),tangent=V(0,0,0),ahead=V(0,0,0),target=V(0,0,0);
  const attitude=new T.Quaternion(),bankRotation=new T.Euler(),sight=new T.Matrix4(),up=V(0,1,0);
  const smooth=(a,b,p)=>T.MathUtils.smoothstep(p,a,b);
  let chaseAspect=0;
  function follow(camera,acquire,progress,height,overlook,overlookRotation){
    if(!object.visible || !acquire)return;
    const p=progress;
    if(chaseAspect!==camera.aspect){
      chaseAspect=camera.aspect;
      const slope=Math.tan(T.MathUtils.degToRad(camera.fov/2));
      // Left-of-centre on the desktop deck, centred in the portrait stack.
      const x=innerWidth<641?0:-.55, y=innerWidth<641?-.05:.07;
      route.points.at(-1).set(x*slope*camera.aspect,y*slope,-1).multiplyScalar(3.9)
        .applyQuaternion(overlookRotation).add(overlook);
      route.updateArcLengths();
    }
    const join=smooth(0,.30,p),settle=smooth(.7,1,p);
    // Bank up from Golden Hour into a held wide. Frame the dry course above
    // the instrument card; the camera operator can change altitude independently.
    const narrow=camera.aspect<.85,altitude=height*(1-smooth(0,.55,p));
    cameraRail.getPointAt(p,railEye);
    railEye.y+=altitude;
    if(narrow){railEye.x+=2.4*(1-join);railEye.z+=3.8*(1-join); }
    camera.position.lerp(railEye,acquire);
    if(p>0){
      // Finish on the gate line before peeling off. A crossfade between two
      // world positions could send the aircraft sideways through a hoop.
      const exitBeat=.32;
      if(p<exitBeat){
        const distance=(lapDistance+((exitDistance-lapDistance+1)%1)*p/exitBeat)%1;
        lap.getPointAt(distance,rider);lap.getTangentAt(distance,tangent);lap.getTangentAt((distance+.018)%1,ahead);
      }else{
        const leg=(p-exitBeat)/(1-exitBeat);
        route.getPointAt(leg,rider);route.getTangentAt(leg,tangent);route.getTangentAt(Math.min(1,leg+.035),ahead);
      }
      avata.craft.position.copy(rider);
      const bankAngle=T.MathUtils.clamp(5*(ahead.x*tangent.z-ahead.z*tangent.x),-.66,.66);
      attitude.setFromEuler(bankRotation.set(Math.asin(T.MathUtils.clamp(tangent.y,-.65,.65)),
        Math.atan2(-tangent.x,-tangent.z),bankAngle,'YXZ'));
      avata.craft.quaternion.slerp(attitude,join);
    }
    target.copy(center);
    target.z+=narrow?2.1:.8;
    if(narrow)target.x-=.45;
    target.lerp(avata.craft.position,join);
    sight.lookAt(camera.position,target,up);attitude.setFromRotationMatrix(sight);
    camera.quaternion.slerp(attitude,acquire*(1-settle));
    if(settle)camera.quaternion.slerp(overlookRotation,settle);
  }
  object.visible=false;
  return {object,course:course.mesh,follow,update(dt,visible,progress){
    object.visible=visible;if(!visible)return;
    if(!reduced)time+=dt;
    if(!reduced && progress<.0001)lapDistance=(lapDistance+dt*.086)%1;
    const t=lapDistance;
    course.lap.getPointAt(t,avata.craft.position);
    course.lap.getTangentAt(t,tangent);course.lap.getTangentAt((t+.018)%1,ahead);
    const roll=T.MathUtils.clamp((ahead.x*tangent.z-ahead.z*tangent.x)*1.5,-.52,.52);
    avata.craft.rotation.set(-.07,Math.atan2(-tangent.x,-tangent.z),roll,'YXZ');
    const a=time*.26;
    mini.craft.position.set(center.x+2.2*Math.sin(a),center.y+2.85+.22*Math.sin(a*2),center.z+4*Math.cos(a));
    mini.craft.rotation.set(-.04,Math.atan2(-2.2*Math.cos(a),4*Math.sin(a)),.085,'YXZ');
    for(const {rotors} of [mini,avata])for(const rotor of rotors)rotor.rotation.y=time*42*rotor.userData.sign;
  },inspect(camera){return [mini,avata].map(({craft})=>({name:craft.name,position:craft.position.toArray(),ndc:craft.position.clone().project(camera).toArray(),visible:object.visible}));}};
}
