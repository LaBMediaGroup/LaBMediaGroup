// Display models follow DJI's published flying envelopes. See field-props.md.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export function fieldDrones(T,station,uniforms,reduced){
  const V=(x,y,z)=>new T.Vector3(x,y,z), object=new T.Group();
  const light=new T.ShaderMaterial({vertexColors:true,uniforms,
    vertexShader:'varying vec3 n,c; void main(){n=mat3(modelMatrix)*normal;c=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 uSunDir;uniform float uDay;varying vec3 n,c;void main(){vec3 N=normalize(n);float k=.59+.16*N.y+.43*max(dot(N,uSunDir),0.);gl_FragColor=vec4(c*k*(.71+.29*uDay),1.);}'});
  function build(fpv){
    const fixed=[],blades=[],rotors=[];
    const gray=fpv?[.40,.41,.42]:[.76,.78,.78],dark=[.105,.12,.13],glass=[.13,.23,.29];
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
  const mini=build(false),avata=build(true),forward=V(2.2,0,-2.8).normalize(),right=V(-forward.z,0,forward.x);
  const bank=station.group.localToWorld(V(4.55,1.85,3.60)), velocity=V(0,0,0);
  let time=0;
  function fly(model,x,y,z,dx,dz,roll,pitch){
    const a=model.craft;a.position.copy(bank).addScaledVector(right,x).addScaledVector(forward,z);a.position.y+=y;
    velocity.copy(right).multiplyScalar(dx).addScaledVector(forward,dz);
    a.rotation.order='YXZ';a.rotation.set(pitch,Math.atan2(-velocity.x,-velocity.z),roll,'YXZ');
    for(const rotor of model.rotors)rotor.rotation.y=time*42*rotor.userData.sign;
  }
  object.visible=false;
  return {object,update(dt,visible,height){
    object.visible=visible;if(!visible)return;
    if(!reduced)time+=dt;
    const a=time*.30+.7,b=time*.69+2.20;
    // Independent circuits over the bank. Both paths keep their metre scale
    // as the operator raises the field camera for the aerial view.
    const lift=height*.91,back=height*.40,side=height*.05;
    function circuit(model,phase,radius,spread,near,depth,y,climb,offset,bankAngle,pitch){
      const sin=Math.sin(phase),cos=Math.cos(phase),far=(1-cos)/2;
      const width=radius+spread*far;
      const dx=width*cos+.5*spread*sin*sin, dz=depth*far*sin;
      fly(model,side+offset+width*sin,y+lift+climb*far+.06*Math.sin(phase*2),near+back+depth*far*far,
        dx,dz,-bankAngle*cos,pitch);
    }
    circuit(mini,a,.32,.75,1.72,4.2,.33,.65,-.08,.10,-.05);
    circuit(avata,b,.47,2.1,2.14,8.1,.54,1.85,.06,.48,-.13);
  },inspect(camera){return [mini,avata].map(({craft})=>({name:craft.name,position:craft.position.toArray(),ndc:craft.position.clone().project(camera).toArray(),visible:object.visible}));}};
}
