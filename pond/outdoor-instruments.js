// Field instruments in metres. See field-props.md for the assembly references.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function outdoorInstruments(T,ground,station,bodyMaterial,reduced){
  const v=(x,y,z)=>new T.Vector3(x,y,z),up=v(0,1,0),group=new T.Group();
  // Reuse the field's sun-responsive shader with solid vertex tints.
  function mesh(parent,geo,color,xyz){
    const rgb=new Float32Array(geo.attributes.position.count*3);
    for(let i=0;i<rgb.length;i+=3)rgb.set(color,i);
    geo.setAttribute('color',new T.BufferAttribute(rgb,3));
    const m=new T.Mesh(geo,bodyMaterial);m.position.set(...xyz);parent.add(m);return m;
  }
  const black=[.085,.095,.10],metal=[.47,.49,.48],rubber=[.105,.11,.105];
  function box(parent,xyz,w,h,d,color){return mesh(parent,new T.BoxGeometry(w,h,d),color,xyz);}
  function rod(parent,a,b,r,color){
    const axis=b.clone().sub(a);const m=mesh(parent,new T.CylinderGeometry(r,r,axis.length(),10),color,a.clone().lerp(b,.5).toArray());
    m.quaternion.setFromUnitVectors(up,axis.normalize());return m;
  }
  function canvasFace(width,height){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const texture=new T.CanvasTexture(canvas);texture.minFilter=T.LinearFilter;
    return {ctx:canvas.getContext('2d'),texture};
  }
  const mast=new T.Group();mast.position.set(-2.8,ground(-2.8,14.1),14.1);mast.rotation.y=-.12;group.add(mast);
  rod(mast,v(0,-.08,0),v(0,1.49,0),.020,metal);
  box(mast,[0,1.36,0],.075,.20,.065,rubber);
  rod(mast,v(0,1.39,0),v(.27,1.65,0),.014,metal);
  rod(mast,v(.27,1.65,0),v(.38,1.65,0),.014,metal);
  rod(mast,v(.38,1.52,0),v(.38,1.74,0),.022,rubber);
  const cups=new T.Group();cups.position.set(.38,1.52,0);mast.add(cups);
  for(let i=0;i<3;i++){
    const arm=new T.Group();arm.rotation.y=i*Math.PI*2/3;cups.add(arm);
    rod(arm,v(0,0,0),v(.1,0,0),.005,black);
    const cup=mesh(arm,new T.SphereGeometry(.038,12,7,0,Math.PI),black,[.102,0,0]);
    cup.rotation.y=Math.PI;
  }
  const vane=new T.Group();vane.position.set(.38,1.72,0);mast.add(vane);
  rod(vane,v(0,0,-.13),v(0,0,.17),.005,black);box(vane,[0,.025,.135],.004,.064,.11,black);
  const sign=canvasFace(512,256);
  box(mast,[0,.97,.036],.62,.31,.034,rubber);
  const board=new T.Mesh(new T.PlaneGeometry(.60,.295),new T.MeshBasicMaterial({map:sign.texture,toneMapped:false}));
  board.position.set(0,.97,.054);mast.add(board);
  let prior='',lesson=null,editing=false;
  function wind(dt,mph,direction,verdict,sample){
    if(!reduced)cups.rotation.y=(cups.rotation.y+dt*Math.min(18,mph*.83))%(2*Math.PI);
    if(direction.lengthSq())vane.rotation.y=Math.atan2(direction.x,direction.z)-mast.rotation.y;
    const speed=Math.round(mph),key=lesson?lesson.title:[speed,verdict,sample,editing].join('|');if(prior===key)return;prior=key;
    const c=sign.ctx;c.fillStyle='#182724';c.fillRect(0,0,512,256);
    if(lesson){
      c.fillStyle='#ebe2ca';c.fillRect(0,0,512,256);c.fillStyle='#68452b';c.font='bold 24px monospace';c.fillText('PILOT GUIDE   '+lesson.step,20,41);
      c.fillStyle='#213b30';c.font='bold 39px sans-serif';c.fillText(lesson.title,20,99,472);
      c.font='24px sans-serif';c.fillText(lesson.note,20,147,472);sign.texture.needsUpdate=true;return;
    }
    c.fillStyle='#e8c28d';c.font='600 29px monospace';c.fillText(sample.toUpperCase()+(editing?' · '+verdict:''),24,46,465);
    c.fillStyle='#fff1cd';c.font='bold 85px sans-serif';c.fillText(speed+' mph',20,148);
    c.fillStyle=verdict==='HOLD'?'#ffb484':'#c4e1ca';c.font='bold 42px monospace';if(!editing)c.fillText(verdict,24,216);sign.texture.needsUpdate=true;
  }

  const rig=new T.Group(),base=station.group.localToWorld(v(4.55,1.85,3.60));
  const forward=v(.731,0,-.682),side=v(.682,0,.731);
  rig.position.copy(base).addScaledVector(forward,.82).addScaledVector(side,.23);
  rig.rotation.y=Math.atan2(-forward.x,-forward.z);group.add(rig);
  const head=-.28;
  for(let i=0;i<3;i++){
    const a=i*2*Math.PI/3,foot=v(Math.cos(a)*.49,0,Math.sin(a)*.49);
    const world=foot.clone().applyAxisAngle(up,rig.rotation.y).add(rig.position);
    foot.y=ground(world.x,world.z)-rig.position.y+.014;
    const seat=v(Math.cos(a)*.05,head-.08,Math.sin(a)*.05);
    const knee=seat.clone().lerp(foot,.53),cross=v(-Math.sin(a)*.013,0,Math.cos(a)*.013);
    for(const k of [-1,1])rod(rig,seat.clone().addScaledVector(cross,k),knee.clone().addScaledVector(cross,k),.009,metal);
    rod(rig,knee,foot,.011,black);rod(rig,knee,v(0,knee.y-.07,0),.006,metal);
    box(rig,foot.toArray(),.046,.028,.054,rubber);
  }
  rod(rig,v(0,head-.10,0),v(0,head,0),.044,black);
  rod(rig,v(-.032,head-.038,.008),v(-.069,head-.103,.216),.008,black);
  box(rig,[0,head+.009,0],.071,.018,.076,metal);
  const bodyY=head+.066;
  // The camera's rear shoulders, rubber grip and recessed bezel are
  // readable at the operator close-up. The front axis points to local -Z.
  function rounded(x,y,z,w,h,d,r,color){
    const sh=new T.Shape(),l=-w/2,b=-h/2;
    sh.moveTo(l+r,b);sh.lineTo(-l-r,b);sh.quadraticCurveTo(-l,b,-l,b+r);
    sh.lineTo(-l,-b-r);sh.quadraticCurveTo(-l,-b,-l-r,-b);sh.lineTo(l+r,-b);
    sh.quadraticCurveTo(l,-b,l,-b-r);sh.lineTo(l,b+r);sh.quadraticCurveTo(l,b,l+r,b);
    const g=new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.001,bevelSize:.0015,bevelSegments:2,curveSegments:4});
    return mesh(rig,g,color,[x,y,z-d/2]);
  }
  rounded(0,bodyY,-.003,.173,.091,.063,.015,[.16,.17,.174]);
  rounded(.068,bodyY,-.012,.038,.083,.079,.014,rubber);
  rounded(-.013,bodyY,.030,.126,.074,.006,.006,[.105,.117,.123]);
  for(let i=0;i<6;i++){
    const y=bodyY+.029-i*.011;
    rounded(.060,y,.031,.011,.007,.003,.0018,[.23,.23,.22]);
    box(rig,[.060,y,.034],.0033,.0008,.0003,[.73,.74,.72]);
  }
  for(let i=0;i<8;i++)box(rig,[.079,bodyY-.031+i*.008,.027],.006,.0018,.004,[.14,.14,.14]);
  rod(rig,v(-.012,bodyY,-.02),v(-.012,bodyY,-.135),.033,black);
  for(const z of [-.09,-.11,-.13])rod(rig,v(-.012,bodyY,z),v(-.012,bodyY,z-.004),.035,rubber);
  box(rig,[.061,bodyY+.05,-.015],.014,.006,.012,[.53,.12,.1]);
  const target=new T.WebGLRenderTarget(256,144,{depthBuffer:true});
  const lcd=new T.Mesh(new T.PlaneGeometry(.111,.0625),new T.MeshBasicMaterial({map:target.texture,toneMapped:false}));
  lcd.position.set(-.013,bodyY,.0345);rig.add(lcd);
  // One draw each for the fixed mast, camera rig, wind cups and vane.
  // The rotating assemblies retain their original pivots.
  group.updateMatrixWorld(true);
  function batch(parent,exclude=[]){
    const inverse=parent.matrixWorld.clone().invert(),parts=[],remove=[];
    function collect(node){
      if(exclude.includes(node))return;
      if(node.isMesh && node.material===bodyMaterial){
        const source=node.geometry,geom=source.index?source.toNonIndexed():source.clone();
        geom.deleteAttribute('uv');geom.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,node.matrixWorld));
        parts.push(geom);remove.push(node);
      }else node.children.forEach(collect);
    }
    parent.children.forEach(collect);
    for(const part of remove){part.removeFromParent();part.geometry.dispose();}
    const combined=mergeGeometries(parts);parent.add(new T.Mesh(combined,bodyMaterial));
    parts.forEach(part=>part.dispose());
  }
  batch(cups);batch(vane);batch(mast,[cups,vane]);batch(rig);
  const shot=new T.PerspectiveCamera(45,16/9,.08,2500);rig.localToWorld(shot.position.set(-.012,bodyY,-.14));
  shot.lookAt(shot.position.clone().add(forward).addScaledVector(up,.075));
  let last=-Infinity;
  function expose(renderer,scene,time,active){
    if(!active){last=-Infinity;return;}
    if(time-last<.12)return;last=time;
    const old=renderer.getRenderTarget();rig.visible=false;
    renderer.setRenderTarget(target);renderer.render(scene,shot);renderer.setRenderTarget(old);rig.visible=true;
  }
  return {group,wind,expose,rig,board,lcd,setLesson(value){lesson=value;},editWind(value){editing=value;}};
}
