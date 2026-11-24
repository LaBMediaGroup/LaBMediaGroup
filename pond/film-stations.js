// One cabinet per film. The camera travels inside the ring so the visitor
// approaches each faceplate from inside the circle.
import * as THREE from 'three';
import {gallerySwim} from './gallery-swim.js?v=14';
import { createTelevision } from './tv-console.js';
import { createTVVariant } from './tv-variants.js';

const count = 7;
const radius = 2.34;
const startZ = -12.8;
const step = Math.PI * 2 / count;
const yawOffsets = [-.105,.13,-.19,.1,-.08,.21,-.12];
export const footprints = Array.from({length:count}, (_,i) =>
  new THREE.Vector2(radius*Math.sin(i*step),startZ+radius*(1-Math.cos(i*step))));

function supportPoints(group) {
  const points = new Map(), point = new THREE.Vector3();
  group.updateMatrixWorld(true);
  group.traverse(mesh => {
    if (!mesh.isMesh) return;
    const p = mesh.geometry.attributes.position;
    for (let i=0;i<p.count;i++) {
      point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
      if (Math.abs(point.y)>.0015) continue;
      const key = Math.round(point.x*1000)+','+Math.round(point.z*1000);
      if (!points.has(key)) points.set(key,point.clone());
    }
  });
  return [...points.values()];
}

function phosphor(texture) {
  const mat = new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
  mat.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      vec2 q=vMapUv*2.-1.;
      vec2 tubeUv=clamp(.5+.5*q*(.983+.012*dot(q,q)),.001,.999);
      vec2 fringe=.00085*q;
      vec3 phosphor=vec3(texture2D(map,tubeUv+fringe).r,texture2D(map,tubeUv).g,texture2D(map,tubeUv-fringe).b);
      float edge=pow(clamp(dot(q,q)*.5,0.,1.),2.);
      diffuseColor.rgb=phosphor*vec3(.95,1.,.97)+vec3(.0018,.005,.004)*(1.+edge);
    `);
  };
  return mat;
}

function standbyPicture(film) {
  const canvas=document.createElement('canvas');
  canvas.width=256; canvas.height=192;
  const ctx=canvas.getContext('2d');
  const map=new THREE.CanvasTexture(canvas);
  map.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map,color:0xaebbaa,toneMapped:false});
  function draw(image) {
    ctx.fillStyle='#111b19'; ctx.fillRect(0,0,256,192);
    if (image) {
      const scale=Math.min(256/image.width,170/image.height);
      const w=image.width*scale, h=image.height*scale;
      ctx.globalAlpha=.75; ctx.drawImage(image,(256-w)/2,(170-h)/2,w,h); ctx.globalAlpha=1;
    }
    ctx.fillStyle='#c4dfca'; ctx.font='bold 16px monospace';
    ctx.fillText(film.title,12,177,234);
    map.needsUpdate=true;
  }
  draw(null);
  const image=new Image();
  image.onload=()=>draw(image);
  image.src=film.img;
  return material;
}

export function createFilmStations(scene, ground, reduced) {
  const point=new THREE.Vector3(), size=new THREE.Vector3();
  const sets=footprints.map((foot,i)=>{
    const tv=i===0 ? createTelevision(THREE) : createTVVariant(THREE,i);
    const contacts=supportPoints(tv.group);
    if (!contacts.length) throw Error('Missing support geometry on television '+i);
    const box=new THREE.Box3().setFromObject(tv.group);
    box.getSize(size);
    const yaw=-step*i+yawOffsets[i];
    tv.group.rotation.set(i===0?-.034:Math.sin(i*3)*.024, yaw, i===0?-.047:Math.cos(i*2)*.027,'YXZ');
    tv.group.position.set(foot.x,0,foot.y);
    tv.group.updateMatrixWorld(true);
    let rest=Infinity;
    for (const p of contacts) {
      point.copy(p).applyMatrix4(tv.group.matrixWorld);
      rest=Math.min(rest,ground(point.x,point.z)-point.y);
    }
    tv.group.position.y=rest-(i===0?.019:Math.min(.013,size.y*.016));
    scene.add(tv.group); tv.group.updateMatrixWorld(true);
    const glass = tv.screen.geometry;
    glass.computeBoundingBox();
    const faceCenter = glass.boundingBox.getCenter(new THREE.Vector3());
    faceCenter.z = glass.boundingBox.max.z;
    tv.screen.localToWorld(faceCenter);
    const orientation = tv.screen.getWorldQuaternion(new THREE.Quaternion());
    const faceNormal = new THREE.Vector3(0,0,1).applyQuaternion(orientation);
    const faceUp = new THREE.Vector3(0,1,0).applyQuaternion(orientation);
    const glassSize = glass.boundingBox.getSize(new THREE.Vector3()).multiply(tv.screen.getWorldScale(new THREE.Vector3()));
    const center=new THREE.Box3().setFromObject(tv.screen).getCenter(new THREE.Vector3());
    // A slight offset toward the case center keeps controls alongside the picture.
    center.x=THREE.MathUtils.lerp(center.x,foot.x,.56);
    center.z=THREE.MathUtils.lerp(center.z,foot.y,.18);
    const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
    // Orbitel has controls on opposite sides of its curved equator.
    const sideView=i===3 ? .23 : 1;
    return {...tv,contacts,center,foot,forward,sideView,faceCenter,faceNormal,faceUp,glassSize,width:size.x,height:Math.min(size.y,size.x*1.1),standby:tv.screen.material};
  });
  const swim=gallerySwim(THREE,sets,new THREE.Vector3(0,0,startZ+radius),reduced);
  let selected=0;
  let liveCanvas, liveMat, revision=-1, lastAudible, lastVolume;
  function select(index) {
    if (!Number.isInteger(index) || !sets[index] || index===selected) return;
    const departed=sets[selected];
    departed.screen.material=departed.standby;
    departed.setVolumeState(false,0);
    lastAudible=undefined;
    selected=index;
    swim.select(index,performance.now());
    revision=-1;
  }
  function setSource(canvas,films) {
    if (liveCanvas===canvas) return;
    for(const [i,film] of films.entries()) {
      const set=sets[i];
      if (!set) continue;
      set.standby=standbyPicture(film);
      set.screen.material=set.standby;
    }
    liveCanvas=canvas;
    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace; texture.generateMipmaps=false; texture.minFilter=THREE.LinearFilter;
    liveMat=phosphor(texture);
    select(canvas.channelIndex||0);
  }
  let focusSet=sets[0];
  let feature = null, featureMat = null, focusStart = 0, focusFrom = 0, focusTo = 0;
  const focusMatrix = new THREE.Matrix4(), focusRotation = new THREE.Quaternion(), focusEye = new THREE.Vector3();
  const filmFit = {value:new THREE.Vector2(1,1)};
  function focusAmount() {
    const t = reduced ? 1 : THREE.MathUtils.clamp((performance.now()-focusStart)/650,0,1);
    return THREE.MathUtils.lerp(focusFrom,focusTo,t*t*(3-2*t));
  }
  function setFeature(media) {
    if (media === feature) return;
    focusFrom = focusAmount(); focusTo = media ? 1 : 0; focusStart = performance.now();
    if (featureMat) {
      focusSet.screen.material = liveMat || focusSet.standby;
      featureMat.map.dispose(); featureMat.dispose(); featureMat = null; revision = -1;
    }
    feature = media;
    if (!media) return;
    focusSet=sets[selected];
    const texture = new THREE.VideoTexture(media);
    texture.colorSpace = THREE.SRGBColorSpace;
    featureMat = new THREE.MeshBasicMaterial({map:texture,toneMapped:false,fog:false});
    featureMat.onBeforeCompile = shader => {
      shader.uniforms.filmFit = filmFit;
      shader.fragmentShader = 'uniform vec2 filmFit;\n' + shader.fragmentShader.replace('#include <map_fragment>', [
        'vec2 filmUv = (vMapUv - .5) * filmFit + .5;',
        THREE.ShaderChunk.map_fragment.replaceAll('vMapUv','filmUv'),
        'if(any(lessThan(filmUv,vec2(0.))) || any(greaterThan(filmUv,vec2(1.)))) diffuseColor.rgb = vec3(.003);'
      ].join('\n'));
    };
    sets[selected].screen.material = featureMat;
  }
  function focusCamera(camera) {
    const t=focusAmount();
    if(t<=0) return;
    const set=focusSet, tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const distance=Math.max(.11,set.glassSize.x/(2*tan*camera.aspect*.86),set.glassSize.y/(2*tan*.69));
    focusEye.copy(set.faceCenter).addScaledVector(set.faceNormal,distance);
    focusMatrix.lookAt(focusEye,set.faceCenter,set.faceUp);
    focusRotation.setFromRotationMatrix(focusMatrix);
    camera.position.lerp(focusEye,t);
    camera.quaternion.slerp(focusRotation,t);
  }
  function update() {
    if (!liveCanvas) return;
    const audible=Boolean(liveCanvas.filmAudible), level=liveCanvas.filmVolume ?? 0;
    if (audible!==lastAudible || level!==lastVolume) {
      sets[selected].setVolumeState(audible,level);
      lastAudible=audible; lastVolume=level;
    }
    if (feature) {
      const glass = sets[selected].glassSize;
      const relativeAspect = feature.videoWidth && feature.videoHeight ? feature.videoWidth / feature.videoHeight / (glass.x/glass.y) : 1;
      filmFit.value.set(Math.max(1,1/relativeAspect), Math.max(1,relativeAspect));
      return;
    }
    if (liveCanvas.drawnStation!==selected || revision===liveCanvas.frameRevision) return;
    revision=liveCanvas.frameRevision;
    liveMat.map.needsUpdate=true;
    sets[selected].screen.material=liveMat;
  }
  function cameraPose(aspect,fov,pos,look){
    swim.pose(aspect,fov,pos,look,performance.now());
  }
  const ray=new THREE.Raycaster(), pointer=new THREE.Vector2();
  const targets=sets.map(set=>set.group);
  function exactPick(x,y,camera) {
    pointer.set(2*x/innerWidth-1,1-2*y/innerHeight);
    ray.setFromCamera(pointer,camera);
    const hit=ray.intersectObjects(targets,true)[0];
    if (!hit) return null;
    for(let obj=hit.object;obj;obj=obj.parent) {
      for(let i=0;i<sets.length;i++) {
        const set=sets[i];
        if (obj===set.screen || obj===set.knob || obj===set.volumeControl) {
          if (i!==selected) return {station:i};
          return obj===set.screen?'screen':obj===set.knob?'knob':'volume';
        }
      }
    }
    return null;
  }
  function samplePixel(object,camera) {
    if(object.geometry?.type==='CylinderGeometry') {
      // A side-mounted dial's center can be behind its own mounting plate.
      point.set(0,object.geometry.parameters.height/2,0).applyMatrix4(object.matrixWorld);
    } else new THREE.Box3().setFromObject(object).getCenter(point);
    point.project(camera);
    return [(point.x+1)*innerWidth/2,(1-point.y)*innerHeight/2];
  }
  function pick(x,y,camera) {
    const hit=exactPick(x,y,camera);
    if (hit) return hit;
    // Give small dials a fingertip-sized target on touchscreens. An exact hit
    // wins, including the glass; assistance only reaches verified visible grips.
    const set=sets[selected];
    let nearest=matchMedia('(pointer: coarse)').matches?22:7, result=null;
    for (const [control,action] of [[set.knob,'knob'],[set.volumeControl,'volume']]) {
      const pixel=samplePixel(control,camera);
      const distance=Math.hypot(pixel[0]-x,pixel[1]-y);
      if (distance<nearest && exactPick(pixel[0],pixel[1],camera)===action) {
        nearest=distance;
        result=action;
      }
    }
    return result;
  }
  function bedClearance(object) {
    let clearance=Infinity;
    object.traverse(mesh=>{
      if(!mesh.isMesh) return;
      const p=mesh.geometry.attributes.position;
      for(let i=0;i<p.count;i++) {
        point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
        clearance=Math.min(clearance,point.y-ground(point.x,point.z));
      }
    });
    return clearance;
  }
  function inspect(camera) {
    scene.updateMatrixWorld(true);
    return sets.map(set=>{
      let minFoot=Infinity,maxFoot=-Infinity;
      for(const p of set.contacts) {
        point.copy(p).applyMatrix4(set.group.matrixWorld);
        const depth=ground(point.x,point.z)-point.y;
        minFoot=Math.min(minFoot,depth);maxFoot=Math.max(maxFoot,depth);
      }
      return {model:set.group.name,center:set.center.toArray(), screenPixel:samplePixel(set.screen,camera),knobPixel:samplePixel(set.knob,camera),volumePixel:samplePixel(set.volumeControl,camera),minFootingBurial:minFoot,maxFootingBurial:maxFoot,screenClearance:bedClearance(set.screen),volumeClearance:bedClearance(set.volumeControl)};
    });
  }
  return {sets,select,setSource,setFeature,focusCamera,update,cameraPose,pick,inspect,
    get current(){return sets[selected];},get travel(){return swim.travel;},get selected(){return selected;}};
}
