import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {deerPosition,darnerPosition} from './wildlife/wildlife-motion.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

function darner(encode,reduced){
  const bug=new THREE.Group(),segments=[];
  function oval(x,y,z,sx,sy,sz,color){
    const g=new THREE.SphereGeometry(1,10,7).scale(sx,sy,sz).translate(x,y,z);
    const c=new THREE.Color(color),rgb=[];
    for(let i=0;i<g.attributes.position.count;i++)rgb.push(c.r,c.g,c.b);
    g.setAttribute('color',new THREE.Float32BufferAttribute(rgb,3));segments.push(g);
  }
  oval(0,0,.019,.0055,.0065,.011,0x648e40);
  for(const side of [-1,1])oval(side*.0034,.003,.029,.004,.0038,.0045,0x596d39);
  for(let i=0;i<9;i++)oval(0,0,.009-i*.0054,.0029-i*.00013,.0028-i*.00012,.0046, i<3?0x368993:0x547c89);
  const cuticle=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5});encode(cuticle);
  bug.add(new THREE.Mesh(mergeGeometries(segments),cuticle));
  const vein=new THREE.LineBasicMaterial({color:0x526458,transparent:true,opacity:.42});
  const legs=[];
  for(const side of [-1,1])for(let i=0;i<3;i++){
    legs.push(0,-.002,.026-i*.004,side*.004,-.005,.024-i*.004,side*.004,-.005,.024-i*.004,side*.002,-.007,.017-i*.004);
  }
  const legGeo=new THREE.BufferGeometry();legGeo.setAttribute('position',new THREE.Float32BufferAttribute(legs,3));
  bug.add(new THREE.LineSegments(legGeo,new THREE.LineBasicMaterial({color:0x393c2f})));
  const wings=[];
  const membrane=new THREE.MeshBasicMaterial({color:0xc5d7d0,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false});
  const blur=membrane.clone();blur.opacity=.072;
  const sample=new THREE.Object3D();sample.rotation.order='ZYX';
  for(const side of [-1,1]){
    for(const front of [true,false]){
      const hinge=new THREE.Group(), blade=new THREE.Group();
      blade.rotation.order='ZYX';
      const shape=new THREE.Shape(),dz=front?.019:.010;
      shape.moveTo(.002,0);shape.quadraticCurveTo(.019,.005,.044,front?.007:.000);
      shape.quadraticCurveTo(.051,front?.006:-.001,.043,front?.001:-.007);
      shape.quadraticCurveTo(.016,front?-.005:-.012,.002,-.003);
      hinge.position.set(.002*side,.003,dz);bug.add(hinge);
      const g=new THREE.ShapeGeometry(shape,5).rotateX(Math.PI/2).translate(-.002,0,0).scale(side,1,1);
      blade.add(new THREE.Mesh(g,membrane));hinge.add(blade);
      const trail=new THREE.InstancedMesh(g,blur,3);
      trail.instanceMatrix.setUsage(THREE.DynamicDrawUsage);trail.frustumCulled=false;hinge.add(trail);
      const tip=front?.004:-.003,points=[.002*side,.0032,dz,.044*side,.0032,dz+tip];
      for(let j=1;j<6;j++){
        const u=j/7,x=.002+.042*u,y=dz+tip*u;
        points.push(x*side,.0032,y,(x+.0037)*side,.0032,y-.0045*Math.sin(u*Math.PI));
      }
      const veins=new THREE.BufferGeometry();veins.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
      veins.translate(-hinge.position.x,-hinge.position.y,-hinge.position.z);
      blade.add(new THREE.LineSegments(veins,vein));
      wings.push({blade,trail,front,side});
    }
  }
  function pose(rotation,phase,wing) {
    const stroke=Math.sin(phase);
    rotation.z=wing.side*((wing.front?.08:.18)+.55*stroke);
    rotation.y=wing.side*((wing.front?-.08:.12)+.27*stroke);
    rotation.x=.37+.49*Math.tanh(2*Math.cos(phase));
  }
  function flutter(t,dt,dart) {
    // Seconds of exposure, capped at about half a wingbeat to retain the reversing edges.
    const shutter=Math.min(.014,dt*.68);
    const phaseAt=s=>2*Math.PI*34.7*s+.85*Math.sin(3.2*s)+.23*Math.sin(7.7*s);
    const phase=reduced?.7:phaseAt(t),lag=Math.PI*(1-.75*dart);
    for(const wing of wings) {
      const offset=wing.front?0:lag;
      pose(wing.blade.rotation,phase+offset,wing);
      wing.trail.visible=!reduced && shutter>.0025;
      if(!wing.trail.visible)continue;
      for(let i=0;i<wing.trail.count;i++) {
        pose(sample.rotation,phaseAt(t-shutter*(i+1)/wing.trail.count)+offset,wing);
        sample.updateMatrix();wing.trail.setMatrixAt(i,sample.matrix);
      }
      wing.trail.instanceMatrix.needsUpdate=true;
    }
  }
  bug.name='Common green darner';bug.visible=false;
  return {bug,flutter};
}

const ownerWildlife=async()=>{const r=await fetch('http://127.0.0.1:5437/wildlife',{cache:'no-store',signal:AbortSignal.timeout(9000)});if(!r.ok)throw Error();return r.json();};
// load(): the owner's Mac reads its private reader; visitors read the live service's /field.
export function fieldWildlife(world,encode,reduced=false,load=ownerWildlife){
  const group=new THREE.Group();group.name='Field wildlife';world.scene.add(group);
  const insect=darner(encode,reduced);group.add(insect.bug);
  const deer=[];let visit=null,loading=false,template=null,lastRefresh=0,contactAt=0;
  const point=new THREE.Vector3();
  async function refresh(){
    if(loading)return;loading=true;lastRefresh=Date.now();
    try{
      const next=await load();
      if(next)visit=next;
      if(visit?.herd.length && !template){
        template=await new GLTFLoader().loadAsync('/pond/wildlife/deer.glb?v=2');
        template.scene.traverse(o=>{
          if(!o.isMesh)return;
          const m=o.material;
          if(m.name==='Main')m.color.setRGB(.215,.15,.10);
          if(m.name==='Main_Dark')m.color.setRGB(.12,.082,.057);
          m.metalness=0;m.roughness=.96;encode(m);
        });
      }
    }catch{/* A field without a current encounter is quiet. */}finally{loading=false;}
  }
  function deerAt(i){
    if(deer[i])return deer[i];
    const root=clone(template.scene);root.name='Grazing doe '+(i+1);root.scale.setScalar(.4*(1-i*.055));
    const mixer=new THREE.AnimationMixer(root),actions={},feet=[];
    for(const clip of template.animations)actions[clip.name]=mixer.clipAction(clip);
    root.traverse(o=>{if(o.isSkinnedMesh){o.frustumCulled=false;if(o.material.name==='Hooves')feet.push(o);}});
    group.add(root);return deer[i]={root,mixer,actions,feet,playing:null,offset:0};
  }
  const floor=(x,z)=>Math.abs(x)>42||Math.abs(z+11.5)>42?.19:world.ground(x,z);
  refresh();
  return (dt,now=Date.now())=>{
    if(now-lastRefresh>(visit?.herd.length || visit?.insect ? 1800 : 12000))refresh();
    const contacts=now-contactAt>=90;if(contacts)contactAt=now;
    for(let i=0;i<Math.max(deer.length,visit?.herd.length||0);i++){
      const h=visit?.herd[i];
      if(!template||!h||now<h.enter||now>=h.exit){if(deer[i])deer[i].root.visible=false;continue;}
      const d=deerAt(i),r=d.root;r.visible=true;
      const [x,z]=deerPosition(h,now);
      const returning=now>=h.leave, home=h.home || h.from;
      const turnHome=now>=h.leave-(h.fleeing?700:1150);
      const direction=turnHome ? [home[0]-h.to[0],home[1]-h.to[1]] : [h.to[0]-h.from[0],h.to[1]-h.from[1]];
      if (direction[0] || direction[1]) {
        const heading=Math.atan2(direction[0],direction[1]), diff=heading-r.rotation.y;
        r.rotation.y+=Math.atan2(Math.sin(diff),Math.cos(diff))*(d.playing ? 1-Math.exp(-dt*6) : 1);
      }
      const pause=(now-h.graze)*.001+i*7;
      const name=returning && h.fleeing?'Gallop':returning || now<h.graze?'Walk':h.fleeing || now<h.alertUntil || pause%19>15?'Idle':'Eating';
      if(d.playing!==name){
        const next=d.actions[name];next.reset();next.time=(Math.max(0,pause)+i*.8)%next.getClip().duration;next.play();
        if(d.playing)next.crossFadeFrom(d.actions[d.playing],.4,false);d.playing=name;
      }
      d.mixer.update(dt);
      // From posed hoof measurements at scale .4. Keep the gallop's suspension phase.
      const lift=name==='Gallop'?.0452*r.scale.x/.4:d.offset;
      r.position.set(x,floor(x,z)+lift,z);
      if(contacts && name!=='Gallop' && d.feet.length){
        r.updateWorldMatrix(true,true);let gap=Infinity;
        for(const foot of d.feet){
          foot.skeleton.update();
          for(let k=0;k<foot.geometry.attributes.position.count;k++){
            foot.getVertexPosition(k,point).applyMatrix4(foot.matrixWorld);
            gap=Math.min(gap,point.y-floor(point.x,point.z));
          }
        }
        if(Number.isFinite(gap)){d.offset-=gap;r.position.y-=gap;}
      }
    }
    const b=insect.bug,f=visit?.insect;b.visible=!!f && now>=f.start&&now<f.end;
    if(b.visible){
      const t=(now-f.start)*.001,pos=darnerPosition(f,now),next=darnerPosition(f,Math.min(f.end-1,now+16));
      b.position.set(...pos);
      b.rotation.y=Math.atan2(next[0]-pos[0],next[2]-pos[2]);
      const elapsed=now-(f.response?.at ?? 0);
      const dart=f.response?.kind==='dart' && elapsed>=0 ? 1-THREE.MathUtils.smoothstep(elapsed,160,720) : 0;
      insect.flutter(t,dt,dart);
    }
  };
}
