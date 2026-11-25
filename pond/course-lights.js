// Fixture dimensions and light bake are documented in field-props.md.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function courseLights(T,ground,frame,lap,uniforms){
  const bodies=[],emitters=[],V=(x,y,z)=>new T.Vector3(x,y,z);
  const dark=[.12,.13,.12],metal=[.64,.65,.61],red=[.52,.12,.07];
  const warm=[1,.83,.60],amber=[1,.42,.12];
  const coat=(g,color,parts)=>{
    if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');
    const c=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<c.length;i+=3)c.set(color,i);
    g.setAttribute('color',new T.BufferAttribute(c,3));parts.push(g);
  };
  const up=V(0,1,0);
  function rod(a,b,r,color,parts=bodies){
    const delta=b.clone().sub(a);
    const g=new T.CylinderGeometry(r,r,delta.length(),8);
    g.applyQuaternion(new T.Quaternion().setFromUnitVectors(up,delta.normalize()));
    coat(g.translate(...a.clone().lerp(b,.5).toArray()),color,parts);
  }
  const lamps=[];
  for(const [x,z,tx,tz] of [[-6.1,10.9,-2.1,8.4],[2.7,4.4,-1.6,7.3]]){
    const y=ground(x,z),base=V(x,y,z),at=h=>base.clone().addScaledVector(up,h);
    for(let i=0;i<3;i++){
      const ang=i*Math.PI*2/3+.2,fx=x+.29*Math.cos(ang),fz=z+.29*Math.sin(ang);
      rod(V(fx,ground(fx,fz)-.007,fz),at(.39),.025,dark);
    }
    rod(at(.15),at(.49),.053,red);rod(at(.46),at(1.03),.037,metal);
    rod(at(.76),at(.86),.048,red);rod(at(1.02),at(1.63),.023,metal);
    const head=at(1.65),dir=V(tx,ground(tx,tz),tz).sub(head).normalize();
    const q=new T.Quaternion().setFromUnitVectors(V(0,0,1),dir);
    function face(w,h,d,offset,tint,parts){
      coat(new T.BoxGeometry(w,h,d).applyQuaternion(q).translate(...head.clone().addScaledVector(dir,offset).toArray()),tint,parts);
    }
    face(.145,.149,.09,0,dark,bodies);face(.108,.111,.006,.046,warm,emitters);
    lamps.push({head:head.clone().addScaledVector(dir,.055),dir});
  }
  for(const [index,ring] of [[0,false],[5,false],[9,false],[1,true],[2,true],[3,true],[7,true]]){
    const t=index/12,center=lap.getPoint(t),tangent=lap.getTangent(t);
    const yaw=Math.atan2(tangent.x,tangent.z),color=ring?amber:warm;
    if(ring){
      coat(new T.TorusGeometry(.270,.014,6,56).rotateY(yaw).translate(...center.toArray()),color,emitters);
    }else{
      const side=V(Math.cos(yaw),0,-Math.sin(yaw)),normal=V(Math.sin(yaw),0,Math.cos(yaw));
      const a=center.clone().addScaledVector(side,-.758).addScaledVector(normal,.017),b=a.clone().addScaledVector(side,1.516);
      a.y+=.68;b.y+=.68;
      for(const top of [a,b]){const foot=top.clone();foot.y=ground(foot.x,foot.z)+.04;rod(foot,top,.012,color,emitters);}
      rod(a,b,.012,color,emitters);
    }
  }
  const hardware=new T.Mesh(mergeGeometries(bodies),frame.material);frame.add(hardware);
  const material=new T.ShaderMaterial({uniforms,vertexColors:true,
    vertexShader:'varying vec3 c;void main(){c=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float uCourseLight;varying vec3 c;void main(){gl_FragColor=vec4(mix(c*.40,c,uCourseLight),1.);}'});
  frame.add(new T.Mesh(mergeGeometries(emitters),material));
  return lamps;
}

export function aircraftGlow(T,craft,fpv){
  const size=48,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const r=Math.hypot((x+.5)/size-.5,(y+.5)/size-.5)*2,i=(y*size+x)*4;
    data.set([255,255,255,Math.round(255*(Math.exp(-7*r*r)-Math.exp(-7))*Math.max(0,1-r))],i);
  }
  const map=new T.DataTexture(data,size,size);map.magFilter=T.LinearFilter;map.needsUpdate=true;
  const mat=new T.SpriteMaterial({map,color:fpv?0xffab58:0xc7ffe2,transparent:true,blending:T.AdditiveBlending,depthWrite:false});
  const positions=fpv?[[0,.024,.071]]:[[-.116,.014,.077],[.116,.014,.077]];
  for(const xyz of positions){const s=new T.Sprite(mat);s.position.set(...xyz);s.scale.setScalar(fpv?.27:.22);craft.add(s);}
  return mat;
}

// Short exposure of the course beacon. Clear its history on a jump or reversal.
export function beaconTrail(T,group,uniforms){
  const n=12,xyz=new Float32Array(n*3),age=Float32Array.from({length:n},(_,i)=>1-i/n);
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.BufferAttribute(xyz,3).setUsage(T.DynamicDrawUsage));
  geo.setAttribute('strength',new T.BufferAttribute(age,1));
  const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:'attribute float strength;varying float a;void main(){a=strength;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(42./max(.4,-p.z),1.5,8.)*(.6+.4*a);gl_Position=projectionMatrix*p;}',
    fragmentShader:'uniform float uCourseLight;varying float a;void main(){float r=length(2.*gl_PointCoord-1.);gl_FragColor=vec4(1.,.49,.16,.57*a*a*uCourseLight*(1.-smoothstep(0.,1.,r)));}'});
  const points=new T.Points(geo,material);points.frustumCulled=false;group.add(points);
  let last=-1,prevProgress=0;
  return function trace(time,position,progress){
    if(time-last<.030)return;
    const reset=last<0 || time-last>.3 || Math.abs(progress-prevProgress)>.08 ||
      Math.hypot(xyz[0]-position.x,xyz[1]-position.y,xyz[2]-position.z)>1.05;
    if(reset){for(let i=0;i<n;i++)position.toArray(xyz,3*i);}
    else{xyz.copyWithin(3,0,-3);position.toArray(xyz);}
    geo.attributes.position.needsUpdate=true;last=time;prevProgress=progress;
  };
}
