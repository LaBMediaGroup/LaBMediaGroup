// Bluegill, 0.16–0.18 m; painted turtle, 0.15 m carapace. The source plate,
// measured ranges and placement decisions are in pond-life-refs.md.
import { mergeGeometries } from './vendor/three/addons/utils/BufferGeometryUtils.js';

function bluegill(THREE) {
  // Cross sections follow the USFWS plate from snout to caudal peduncle.
  // The two flanks share the authored lateral UVs. Fins meet the body along their roots.
  const profile = [
    [207,357,374,1], [220,347,393,15], [250,330,418,36], [280,304,442,52],
    [320,261,458,67], [370,229,474,75], [430,211,492,81], [490,204,503,82],
    [550,206,508,76], [600,216,505,66], [650,229,490,58], [700,258,464,48],
    [750,296,404,37], [805,315,396,26], [850,306,400,17], [868,312,396,8]
  ];
  const unit = 0.18 / 780;
  const xyz = [], uv = [], indices = [], appendages = [];
  function point(px, py, z, tx=px, ty=py, side=0, flex=0, ray=0) {
    xyz.push((px - 595) * unit, (361 - py) * unit, z * unit);
    uv.push(tx / 1200, 1 - ty / 791);
    appendages.push([side,flex,ray]);
    return xyz.length / 3 - 1;
  }
  const steps = 16;
  profile.forEach(([x, top, bottom, depth], row) => {
    for (let j=0; j<steps; j++) {
      const t = j * 2 * Math.PI / steps;
      point(x, (top + bottom) / 2 + Math.cos(t) * (bottom - top) / 2, Math.sin(t) * depth);
      if (row > 0) {
        const a = (row - 1) * steps + j, b = (row - 1) * steps + (j + 1) % steps;
        indices.push(a, a + steps, b, b, a + steps, b + steps);
      }
    }
  });
  const caps = [point(205,365,0), point(869,354,0)];
  for (let j=0; j<steps; j++) {
    const k = (j+1) % steps, last = (profile.length-1) * steps;
    indices.push(caps[0], j, k, caps[1], last+k, last+j);
  }
  function fin(root, outline) {
    const center = point(...root, 0);
    const rim = outline.map(([x,y]) => point(x, y, 0));
    for (let j=1; j<rim.length; j++) indices.push(center, rim[j-1], rim[j]);
  }
  fin([855,350], [[844,308],[878,301],[928,275],[961,263],[968,274],[966,298],[950,333],[944,351],[957,369],[975,405],[978,428],[966,430],[918,416],[861,396]]);
  fin([556,221], [[409,224],[436,187],[441,203],[474,158],[468,184],[493,155],[494,170],[515,153],[513,171],[540,152],[537,173],[563,157],[558,178],[585,164],[580,180],[605,171],[606,181],[629,169],[644,169],[678,156],[713,152],[741,159],[759,175],[768,197],[772,219],[768,240],[754,268],[704,277],[679,253]]);
  fin([624,475], [[585,499],[625,524],[660,527],[702,525],[745,509],[773,483],[783,456],[782,427],[759,418],[714,416],[676,446]]);
  fin([448,487], [[415,490],[428,525],[451,575],[456,561],[470,579],[470,569],[506,604],[512,611],[504,574],[510,565],[496,531],[477,505]]);
  // Ten rays form a cupped, pointed fin with its basal articulation tucked
  // under the operculum. Give both sides a separate outstroke and recovery.
  for (const side of [-1,1]) {
    const base=xyz.length/3, rays=10, span=5;
    for(let ray=0;ray<=rays;ray++) {
      const v=ray/rays;
      const distalX=442+125*Math.pow(v,.8)+42*Math.sin(Math.PI*v);
      const distalY=439-91*Math.pow(v,1.55)+7*Math.sin(Math.PI*v);
      for(let row=0;row<=span;row++) {
        const u=row/span;
        const px=386+7*v+(distalX-386-7*v)*u;
        const py=412-9*v+(distalY-412+9*v)*u;
        const depth=74+10*Math.sin(Math.PI*u)+16*u+4*Math.sin(v*Math.PI);
        point(px,py,side*depth,px-365,py-321,side,u,v);
        if(ray && row){
          const k=base+ray*(span+1)+row;
          indices.push(k-span-2,k-span-1,k,k-span-2,k,k-1);
        }
      }
    }
    // A convex cornea sits on the orbital rim of the reference plate.
    const centerX=267,centerY=350;
    const eyeBase=xyz.length/3;
    for(let ring=0;ring<=3;ring++) for(let j=0;j<16;j++){
      const r=ring/3,a=j*Math.PI/8;
      const x=centerX+16*r*Math.cos(a),y=centerY+16*r*Math.sin(a);
      const t=(x-250)/30;
      const width=36+16*t, top=330-26*t, bottom=418+24*t;
      const depth=width*Math.sqrt(Math.max(0,1-((2*y-top-bottom)/(bottom-top))**2));
      point(x,y,side*(depth+1.6+8*(1-r*r)));
      if(ring){const k=eyeBase+ring*16+j,next=eyeBase+ring*16+(j+1)%16;indices.push(k-16,k,next,k-16,next,next-16);}
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(xyz,3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const poses=Array.from({length:6},()=>[]);
  for(let i=0;i<appendages.length;i++) {
    const [side,flex,ray]=appendages[i];
    const x=xyz[3*i],y=xyz[3*i+1];
    const tail=THREE.MathUtils.smoothstep(x,-.056,.088);
    const envelope=.021*tail*tail;
    // Two spatial quadratures give an unbroken travelling wave along the spine.
    poses[0].push(0,0,envelope*Math.cos(36*x+3*y));
    poses[1].push(0,0,envelope*Math.sin(36*x+3*y));
    for(const direction of [-1,1]){
      const weight=side===direction ? flex : 0;
      const root=direction===-1?2:4;
      poses[root].push(-.018*weight*(.65+ray*.35),.005*weight,
                       side*.032*weight*(.68+.32*ray));
      poses[root+1].push(.002*weight,weight*(.010*ray-.004),
                         side*.005*weight*Math.sin(Math.PI*ray));
    }
  }
  geo.morphTargetsRelative=true;
  geo.morphAttributes.position=poses.map(points=>new THREE.Float32BufferAttribute(points,3));
  return geo;
}

function restOnMud(THREE, object, x, z, floorHeight, burial = 0) {
  // Place actual mesh vertices against the sampled mud, including a slope.
  object.position.set(x,0,z);
  object.updateMatrixWorld(true);
  const p = new THREE.Vector3();
  let lowest = Infinity;
  object.traverse(child => {
    if (!child.isMesh) return;
    const positions = child.geometry.attributes.position;
    for (let i=0; i<positions.count; i++) {
      p.fromBufferAttribute(positions,i).applyMatrix4(child.matrixWorld);
      lowest = Math.min(lowest, p.y - floorHeight(p.x,p.z));
    }
  });
  object.position.y = -lowest - burial;
}

function paintedTurtle(THREE) {
  const turtle=new THREE.Group(), limbs=[];
  let parts=[];
  const skin=new THREE.Color('#343d2e'), gold=new THREE.Color('#d5c16b');
  const shell=new THREE.Color('#4c4d39'), red=new THREE.Color('#97503b');
  const seam=new THREE.Color('#36362a'), tmp=new THREE.Color();
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.58,side:THREE.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vSkin;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSkin=position;');
    shader.fragmentShader='varying vec3 vSkin;\n'+shader.fragmentShader.replace('#include <color_fragment>',`
      #include <color_fragment>
      vec2 p=(vSkin.xz+vSkin.y*.48)*670.;
      vec2 i=floor(p), f=fract(p);f=f*f*(3.-2.*f);
      vec4 h=fract(sin(mod(i.x+i.y*57.+vec4(0.,1.,57.,58.),1234.))*13758.545);
      float grain=mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);
      diffuseColor.rgb*=.85+.27*grain;
    `);
  };
  function mount(name,pivot,parent=turtle) {
    const g=mergeGeometries(parts);
    g.translate(-pivot[0],-pivot[1],-pivot[2]);
    const mesh=new THREE.Mesh(g,material);
    mesh.name=name;mesh.position.set(...pivot);parent.add(mesh);parts=[];
    return mesh;
  }
  function paint(g,pigment) {
    const pos=g.attributes.position, colors=[];
    for(let i=0;i<pos.count;i++) {
      const color=pigment(pos.getX(i),pos.getY(i),pos.getZ(i));
      colors.push(color.r,color.g,color.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    g.deleteAttribute('uv');
  }
  function lobe(position,radii,rotation,pigment,nx=24,ny=14,lowerScale=1) {
    const g=new THREE.SphereGeometry(1,nx,ny);
    paint(g,pigment);
    const pos=g.attributes.position;
    if(lowerScale!==1) {
      for(let i=0;i<pos.count;i++) if(pos.getY(i)<0) pos.setY(i,pos.getY(i)*lowerScale);
      g.computeVertexNormals();
    }
    g.scale(...radii);g.rotateY(rotation);g.translate(...position);parts.push(g);
  }
  function stroke(points,radius,color) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const g=new THREE.TubeGeometry(curve,Math.max(6,points.length*3),radius,5,false);
    paint(g,()=>color);parts.push(g);
  }
  // Five central vertebral scutes, with staggered costals and a thin marginal rim.
  const scutes = [];
  for (let i=-2; i<=2; i++) scutes.push([i*.39,0]);
  for (const s of [-1,1]) for (let i=0;i<4;i++) scutes.push([i*.43-.645,s*.59]);
  lobe([0,.025,0],[.075,.031,.053],0,(x,y,z) => {
    if (y < -.08) return seam;
    const angle = Math.atan2(z,x);
    if (y < .28) return tmp.copy(shell).lerp(red,Math.max(0,Math.cos(23*angle + 3*y)) * .85);
    let first = Infinity, second = Infinity;
    for (const [cx,cz] of scutes) {
      const d = (x-cx)**2 + .57*(z-cz)**2;
      if (d < first) {second=first; first=d;} else second=Math.min(second,d);
    }
    const gap = second-first;
    const abrasion=.055*Math.sin(43*x+8*z)*Math.cos(18*z-4*x);
    const growth=.072*Math.cos(Math.sqrt(first)*91);
    return tmp.copy(shell).multiplyScalar(.91+.12*Math.sin(15*x+7*z)+abrasion+growth).lerp(seam,Math.max(0,1-gap/.037)*.55);
  },60,28,.40);
  // Raised scute lips remain continuous around the domed shell.
  function suture(points) {
    const line=points.map(([x,z])=>new THREE.Vector3(.075*x, .025+.031*Math.sqrt(Math.max(.001,1-x*x-z*z))+.00017, .053*z));
    const curve=new THREE.CatmullRomCurve3(line);
    const g=new THREE.TubeGeometry(curve,line.length*2,.00031,4,false);
    g.deleteAttribute('uv');
    const colors=[];
    for(let i=0;i<g.attributes.position.count;i++) colors.push(seam.r,seam.g,seam.b);
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    parts.push(g);
  }
  for(const sign of [-1,1]) {
    const side=[[-.94,.07],[-.75,.33],[-.57,.27],[-.40,.36],[-.23,.29],[0,.37],[.20,.29],[.37,.36],[.55,.25],[.75,.30],[.94,.07]];
    suture(side.map(([x,z])=>[x,sign*z]));
    for(const [x,z] of side.filter((v,i)=>[2,4,6,8].includes(i))) {
      const reach=Math.sqrt(1-x*x);
      suture([[x,sign*z],[x+.04,sign*(z+.1)],[x+.07,sign*reach*.72],[x+.07,sign*reach*.86]]);
    }
  }
  for(const x of [-.75,-.40,0,.37,.75]) suture([[x,.30],[x-.04,.16],[x-.055,0],[x-.04,-.16],[x,-.30]]);
  const rim=[];
  for(let i=0;i<=56;i++){const a=i/56*Math.PI*2;rim.push([.92*Math.cos(a),.92*Math.sin(a)]);}
  suture(rim);
  // Low plastron, bilateral bridges and a tapered tail remain with the rigid shell.
  const plastron=new THREE.Color('#927447');
  lobe([0,.017,0],[.066,.011,.042],0,()=>plastron,32,14,.55);
  for(const side of [-1,1]){
    lobe([0,.020,side*.042],[.042,.007,.007],0,()=>red);
  }
  lobe([.071,.020,0],[.020,.005,.005],-.11,()=>skin,18,10);
  const carapace=mount('Carapace, bridges and plastron',[0,0,0]);
  const scuteFinish=material.clone();scuteFinish.onBeforeCompile=material.onBeforeCompile;
  scuteFinish.roughness=.39;carapace.material=scuteFinish;

  // The neck enters the front opening. The maxilla overhangs a separate lower
  // jaw; the mouth seam, nostrils and small lateral eyes follow the actual head.
  const vertebra=[-.046,.026,0];
  const neckProfile=[
    [-.041,.025,.009,.009],[-.052,.025,.013,.012],[-.065,.025,.0121,.0105],
    [-.076,.026,.0116,.0105],[-.082,.028,.0135,.0116],[-.089,.029,.0146,.0124],
    [-.096,.030,.0143,.0120],[-.103,.029,.0136,.0101],[-.109,.027,.0115,.0087],
    [-.114,.027,.0081,.0068],[-.1175,.0265,.0058,.0047],[-.120,.0265,.0015,.0018]
  ];
  const skinVertices=[],pigment=[],headFaces=[],slices=60;
  const jawColor=new THREE.Color('#777762'),eyeColor=new THREE.Color('#252719');
  for(let j=0;j<=(neckProfile.length-1)*6;j++){
    const base=Math.min(neckProfile.length-2,Math.floor(j/6)),v=j/6-base;
    const row=neckProfile[base].map((n,k)=>THREE.MathUtils.lerp(n,neckProfile[base+1][k],v));
    const [x,mid,width,height]=row;
    const length=(-.041-x)/.079;
    for(let k=0;k<slices;k++){
      const a=k/slices*Math.PI*2, z=Math.sin(a), y=Math.cos(a);
      const side=Math.abs(z);
      skinVertices.push(x,mid+height*y,width*z);
      const postEye=.18+.39*Math.sin(length*6.7-.7)+.13*Math.cos(length*13);
      const cheek=-.32+.18*Math.cos(length*6+.8);
      const chin=-.70+.08*Math.sin(length*14);
      const stripe=(line,thickness)=>Math.exp(-((y-line)**2)/(thickness*thickness));
      const sideMask=THREE.MathUtils.smoothstep(side,.40,.88);
      const temple=(stripe(postEye,.12)*(.73+.27*Math.cos(length*16))+
                  stripe(cheek,.105)+stripe(chin,.075)*.8)*sideMask;
      const darkLip=stripe(-.18+.11*Math.cos(length*7),.06)*THREE.MathUtils.smoothstep(length,.65,.84)*sideMask;
      tmp.copy(skin).lerp(jawColor,Math.max(0,-y)*.51).lerp(gold,Math.min(.91,temple)).lerp(seam,darkLip*.85);
      pigment.push(tmp.r,tmp.g,tmp.b);
      if(j){const i=j*slices+k,n=j*slices+(k+1)%slices;headFaces.push(i-slices,i,n,n,n-slices,i-slices);}
    }
  }
  for(const ring of [0,(neckProfile.length-1)*6]){
    const row=neckProfile[ring/6], index=skinVertices.length/3;
    skinVertices.push(row[0],row[1],0);pigment.push(skin.r,skin.g,skin.b);
    for(let k=0;k<slices;k++){
      const a=ring*slices+k,b=ring*slices+(k+1)%slices;
      if(ring) headFaces.push(index,b,a); else headFaces.push(index,a,b);
    }
  }
  const head=new THREE.BufferGeometry();
  head.setIndex(headFaces);head.setAttribute('position',new THREE.Float32BufferAttribute(skinVertices,3));
  head.setAttribute('color',new THREE.Float32BufferAttribute(pigment,3));head.computeVertexNormals();parts.push(head);
  for(const side of [-1,1]){
    lobe([-.102,.032,side*.0126],[.0038,.0029,.00165],0,()=>jawColor,20,12);
    lobe([-.1025,.032,side*.0141],[.0028,.0021,.00085],0,()=>gold,20,12);
    lobe([-.103,.032,side*.0148],[.0019,.00165,.00050],0,()=>eyeColor,16,10);
    lobe([-.1157,.0308,side*.0049],[.00135,.00085,.00080],0,()=>eyeColor,12,8);
  }
  const neck=mount('Articulated head and neck',vertebra);

  // Build each upper limb from its shoulder/hip, then turn the web at its wrist.
  // Coordinates below are body-local before the pivot offset is removed.
  const palmColor=(x,y,z)=>tmp.copy(skin).lerp(red,.15+.28*Math.max(0,Math.cos(7*x+3*z)));
  for(const front of [true,false]) for(const side of [-1,1]){
    const origin=[front?-.045:.043,.024,side*.030];
    const elbow=[front?-.034:.057,.016,side*(front?.049:.046)];
    const wrist=[front?-.052:.067,.008,side*(front?.061:.055)];
    function muscle(a,b,width){
      const start=new THREE.Vector3(...a),delta=new THREE.Vector3(...b).sub(start);
      const g=new THREE.SphereGeometry(1,18,12);
      paint(g,(x,y,z)=>tmp.copy(skin).lerp(red,Math.max(0,Math.cos(12*y+1.2*x+z)-.38)*.85));
      g.scale(delta.length()*.63,width*.72,width);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),delta.clone().normalize()));
      start.addScaledVector(delta,.5);g.translate(start.x,start.y,start.z);parts.push(g);
    }
    muscle(origin,elbow,.008);muscle(elbow,wrist,.0065);
    const limb=mount((front?'Forelimb ':'Hindlimb ')+side,origin);
    const length=front?.018:.025, spread=front?.009:.014, sign=front?-1:1;
    const [wx,wy,wz]=wrist;
    // Five distal rays and membrane between them give the hindfoot its wide paddle.
    const verts=[wx,wy,wz], faces=[],c=new THREE.Color('#4e5037'), colors=[c.r,c.g,c.b];
    for(let digit=0;digit<5;digit++){
      const t=digit/4,dx=sign*length*(.68+.32*Math.sin(t*Math.PI));
      const dz=side*spread*(t*2-1)+side*.004;
      const tip=[wx+dx,wy-.003+.0005*t,wz+dz];
      stroke([wrist,[wx+dx*.52,wy-.001,wz+dz*.43],tip],front?.00135:.0018,skin);
      stroke([tip,[tip[0]+sign*.0025,tip[1]-.0007,tip[2]],[tip[0]+sign*.0036,tip[1]-.0012,tip[2]]],.00052,gold);
      verts.push(wx+dx*.88,wy-.002,wz+dz*.88);colors.push(c.r,c.g,c.b);
      if(digit) faces.push(0,digit,digit+1);
    }
    const web=new THREE.BufferGeometry();
    web.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    web.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));web.setIndex(faces);web.computeVertexNormals();
    parts.push(web);
    lobe([wx+sign*.003,wy,wz],[.008,.0035,spread*.65],0,palmColor,14,8);
    const foot=mount((front?'Forefoot ':'Hindfoot ')+side,wrist);
    limb.attach(foot);
    limbs.push({limb,foot,front,side});
  }
  function pose(time,swim,turn=0) {
    // Row in diagonal pairs, feather the web on recovery, and let a stroke
    // finish before the next reach. A resting turtle occasionally surveys the shelf.
    const p=time*2.35+.22*Math.sin(time*.51);
    const breathe=.5+.5*Math.sin(time*1.07);
    neck.position.x=vertebra[0]-.0035*breathe-.007*swim;
    neck.rotation.y=.11*Math.sin(time*.35+.9)+turn*.12*swim;
    neck.rotation.z=-.095-.095*Math.sin(time*.23)-.055*breathe;
    for(const {limb,foot,front,side} of limbs){
      const phase=p+((front && side<0)||(!front && side>0)?Math.PI:0);
      const flap=Math.sin(phase+.32*Math.sin(phase));
      const reach=1+turn*side*.16;
      // The contralateral hind foot and forefoot retract together. Each web
      // turns edge-on for recovery. Rest holds three supports while one flexes.
      const restLift=front && side===1 ? .12*Math.max(0,Math.sin(time*.68)) : 0;
      limb.rotation.y=side*(front?-1:1)*(swim*(.19+.71*flap)*reach);
      limb.rotation.x=side*(-restLift*(1-swim)+swim*(.29+.17*Math.cos(phase)));
      foot.rotation.x=side*swim*(.23+.48*Math.cos(phase-.60));
      foot.rotation.z=(front?-1:1)*swim*.19*Math.sin(phase-.55);
    }
  }
  pose(0,0);
  return {group:turtle,pose};
}

export function floorLitter(THREE, floorHeight, patch) {
  const pieces = [];
  let state=patch?.seed ?? 61993;
  const rand = () => ((state=Math.imul(state,1664525)+1013904223>>>0)/4294967296);
  function tinted(g,color,kind) {
    const c=new THREE.Color(color), values=[];
    for(let i=0;i<g.attributes.position.count;i++) values.push(c.r,c.g,c.b);
    g.setAttribute('color',new THREE.Float32BufferAttribute(values,3));
    g.setAttribute('kind',new THREE.Float32BufferAttribute(new Array(g.attributes.position.count).fill(kind),1));
    pieces.push(g.index ? g.toNonIndexed() : g);
  }
  // Four opposing lobe pairs with a pointed terminal lobe; each leaf follows the
  // bed at its own vertices, with slightly curled margins above a buried midrib.
  const outline = [[0,0],[.12,.19],[.19,.13],[.28,.34],[.34,.23],[.45,.46],[.50,.29],[.65,.40],[.62,.23],[.78,.29],[.75,.13],[.88,.14],[1,0]];
  function leaf(cx,cz,angle,length) {
    const cs=Math.cos(angle),sn=Math.sin(angle), pts=[], cols=[], uv=[];
    const c=new THREE.Color().setHSL(.068+rand()*.015,.27+rand()*.19,.032+rand()*.055);
    function v(t,w,light) {
      const x=cx + length*((t-.5)*cs-w*sn), z=cz + length*((t-.5)*sn+w*cs);
      pts.push(x,floorHeight(x,z)-.0013+.006*Math.abs(w)+.003*Math.sin(t*Math.PI),z);
      cols.push(c.r*light,c.g*light,c.b*light);uv.push(t,w);
    }
    for (const side of [-1,1]) for (let i=1;i<outline.length;i++) {
      const [a,aw]=outline[i-1], [b,bw]=outline[i];
      v(a,0,1.23);v(a,aw*side,.88);v(b,bw*side,.91);
      v(a,0,1.23);v(b,bw*side,.91);v(b,0,1.2);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setAttribute('kind',new THREE.Float32BufferAttribute(new Array(pts.length/3).fill(0),1));
    g.computeVertexNormals();pieces.push(g);
  }
  for (let i=0;i<22;i++) {
    const x=(i%2?1:-1)*(.57+rand()*.80), z=-.8+rand()*1.7;
    if (!patch || patch.clear(x,z)) leaf(x,z,rand()*6.28,.11+rand()*.067);
  }
  // Waterworn cobbles with individual asymmetry, each sunk to its widest flank.
  for(let i=0;i<16;i++) {
    const x=(i%2?1:-1)*(.78+rand()*.85), z=-.9+rand()*1.9, width=.06+rand()*.13;
    if (patch && !patch.clear(x,z)) continue;
    // Keep the twig fork and the turtle’s resting pocket clear of solid cobbles.
    if ((x < 1.30 && x > .53 && z > -.44 && z < .61) || Math.hypot((x+.92)/.50,(z-.07)/.49)<1) continue;
    const g=new THREE.IcosahedronGeometry(1,1), p=g.attributes.position;
    for(let j=0;j<p.count;j++){
      const a=p.getX(j),b=p.getY(j),c=p.getZ(j);
      const variation=1+.09*Math.sin(a*5+c*3)*Math.cos(b*4);
      p.setXYZ(j,a*variation+.07*b,b*variation,c*variation);
    }
    g.scale(width*.5,width*.32,width*(.31+rand()*.14));g.rotateY(rand()*6.28);
    g.translate(x,floorHeight(x,z)+width*.035,z);
    tinted(g,new THREE.Color().setHSL(.075+rand()*.09,.08+rand()*.08,.038+rand()*.075),1);
  }
  const up=new THREE.Vector3(0,1,0);
  const grounded=(x,z,dy)=>new THREE.Vector3(x,floorHeight(x,z)+dy,z);
  function twig(a,b,r0,r1) {
    const axis=b.clone().sub(a);
    const g=new THREE.CylinderGeometry(r1,r0,axis.length(),7);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,axis.normalize()));
    const mid=a.clone().lerp(b,.5);g.translate(mid.x,mid.y,mid.z);
    tinted(g,'#65584a',2);
  }
  if (!patch) {
    const a=grounded(.65,.22,.009), b=grounded(.87,.05,.023), c=grounded(1,-.08,.019), d=grounded(1.14,-.32,.009);
    twig(a,b,.018,.014);twig(b,c,.014,.011);twig(c,d,.011,.006);
    const fork=grounded(.86,.25,.014);
    twig(b,fork,.009,.006);twig(fork,grounded(.92,.48,.004),.006,.002);
    twig(c,grounded(1.20,.09,.004),.007,.002);
  }
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.vertexShader='attribute float kind; varying float vKind; varying vec2 vPigment; varying vec3 vBed;\n'+shader.vertexShader.replace('#include <begin_vertex>',`
      #include <begin_vertex>
      vKind=kind; vPigment=uv; vBed=position;
    `);
    shader.fragmentShader=`
      varying float vKind; varying vec2 vPigment; varying vec3 vBed;
      float grain(vec2 p) {
        vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        vec4 cell=mod(vec4(i.x+i.y*57.0)+vec4(0.,1.,57.,58.),999.0);
        vec4 h=fract(sin(cell*12.9898)*43758.5453);
        return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);
      }
    `+shader.fragmentShader.replace('#include <color_fragment>',`
      #include <color_fragment>
      float detail=grain((vBed.xz+vBed.y)*130.);
      if(vKind < .5){
        float rib=1.-smoothstep(.003,.014,abs(vPigment.y));
        float vein=1.-smoothstep(.0,.055,abs(fract((vPigment.x-abs(vPigment.y)*.56)*5.8)-.5));
        diffuseColor.rgb *= .72+.30*detail+.34*rib+.16*vein;
      }else if(vKind < 1.5){
        diffuseColor.rgb *= .70+.33*detail+.20*grain(vBed.xz*560.);
      }else{
        float furrows=grain(vec2(vPigment.x*26.,vPigment.y*6.));
        diffuseColor.rgb *= .60+.51*furrows+.17*detail;
      }
    `);
  };
  return new THREE.Mesh(mergeGeometries(pieces),material);
}

export function createPondLife(THREE, floorHeight, {centerZ=2.34,reduced=false}={}) {
  const group=new THREE.Group();
  group.name='Pond wildlife and oak litter';
  const litter=floorLitter(THREE,floorHeight);
  litter.name='Settled oak leaves, branch and cobbles';
  group.add(litter);
  const turtle=paintedTurtle(THREE);
  turtle.group.name='Painted turtle';
  const turtlePath=new THREE.CatmullRomCurve3([
    [-.72,.23],[-.84,.32],[-1.01,.31],[-1.15,.18],[-1.17,-.04],
    [-1.05,-.17],[-.87,-.18],[-.72,-.065],[-.67,.09]
  ].map(([x,z])=>new THREE.Vector3(x,0,z)),true);
  const nose=new THREE.Vector3(),location=new THREE.Vector3();
  const home=turtlePath.getPointAt(0),initialHeading=turtlePath.getTangentAt(0);
  turtle.group.rotation.y=Math.atan2(initialHeading.z,-initialHeading.x);
  restOnMud(THREE,turtle.group,home.x,home.z,floorHeight,.0015);
  const planted=turtle.group.position.y-floorHeight(home.x,home.z);
  group.add(turtle.group);

  const map=new THREE.TextureLoader().load(new URL('./pond-life-fins.webp',import.meta.url).href);
  map.colorSpace=THREE.SRGBColorSpace;
  const shape=bluegill(THREE);
  const fishMaterial=new THREE.MeshStandardMaterial({map,color:0xe8eddb,roughness:.47,side:THREE.DoubleSide});
  // Each fish occupies a distinct depth band and a slightly different stretch
  // of the outer bank. They arrive and leave under their own timing on any stop.
  const fish=[
    {angle:.016,rate:.036,depth:.48,radius:.57,scale:1.04},
    {angle:1.78,rate:-.047,depth:.71,radius:.67,scale:.91},
    {angle:4.16,rate:.029,depth:.27,radius:.73,scale:.97}
  ];
  // A loose shoal feeds on the inner margin of the cabinet ring. These
  // tracks run on pond time and continue through every channel change.
  const followers=[.23,0,.51,.19,0,.27,0];
  for(let i=0;i<followers.length;i++){
    const angle=(i+.32+.12*Math.sin(i*2.3))*2*Math.PI/7;
    fish.push({angle,rate:.052,depth:.55+.11*Math.sin(2.7*i),radius:-.85+.085*Math.cos(2*i),
      scale:.87+.10*Math.cos(1.8*i),inner:true});
    if(followers[i])fish.push({angle:angle+followers[i],rate:.052,depth:.65+.07*Math.cos(i),
      radius:-.68,scale:.89,inner:true});
  }
  const swimmers=fish.map((track,i)=>{
    const mesh=new THREE.Mesh(shape,fishMaterial);
    mesh.name='Bluegill '+(i+1);mesh.scale.setScalar(track.scale);mesh.rotation.order='YXZ';
    group.add(mesh);return {...track,mesh};
  });
  function position(track,time,out,lens) {
    const {angle,rate,depth,radius}=track;
    const a=angle+rate*time+.091*Math.sin(time*.18+angle)+.019*Math.sin(time*.57-angle);
    const r=centerZ+radius+.10*Math.sin(a*3+angle)+.045*Math.sin(time*.29+angle);
    const x=r*Math.sin(a),z=centerZ-r*Math.cos(a);
    out.set(x,floorHeight(x,z)+depth+.045*Math.sin(time*.21+2*angle)+.022*Math.sin(2*a),z);
    if(track.inner && lens && !reduced){
      // Lift around the approaching housing without changing tracks or
      // resetting the tail beat. Local habitat coordinates are in metres.
      const gap=Math.hypot(x-lens.x,z-lens.z);
      const dodge=1-THREE.MathUtils.smoothstep(gap,.12,.65);
      const sameDepth=1-THREE.MathUtils.smoothstep(Math.abs(lens.y-out.y),.34,.74);
      out.y+=dodge*sameDepth*Math.min(.54,Math.max(0,lens.y+.26-out.y));
    }
    return out;
  }
  const localLens=new THREE.Vector3();
  const past=new THREE.Vector3(),future=new THREE.Vector3(),direction=new THREE.Vector3();
  function update(clock,cameraPosition) {
    // Freeze at a composed rest pose when the room requests reduced motion.
    const t=reduced?0:clock;
    const lens=cameraPosition?localLens.copy(cameraPosition).sub(group.position):null;
    for(const f of swimmers) {
      position(f,t,f.mesh.position,lens);
      position(f,t-.13,past,lens);position(f,t+.13,future,lens);
      direction.subVectors(future,past).divideScalar(.26);
      const speed=direction.length();
      const headingIn=Math.atan2(f.mesh.position.z-past.z,f.mesh.position.x-past.x);
      const headingOut=Math.atan2(future.z-f.mesh.position.z,future.x-f.mesh.position.x);
      const turn=THREE.MathUtils.clamp(Math.sin(headingOut-headingIn)*17,-1,1);
      const phase=t*(5.8+f.depth)+f.angle+.38*Math.sin(t*.83+f.angle);
      const glide=.55+.45*Math.cos(t*.79+f.angle);
      const stroke=THREE.MathUtils.smoothstep(speed,.035,.13)*(.62+.38*glide);
      const bend=THREE.MathUtils.smoothstep(speed,.083,.18)*(.24+.76*glide);
      f.mesh.rotation.set(.105*Math.sin(t*.44+f.angle)+.08*stroke*Math.sin(phase),
        Math.atan2(direction.z,-direction.x),-Math.asin(THREE.MathUtils.clamp(direction.y/speed,-.7,.7)),'YXZ');
      const w=f.mesh.morphTargetInfluences;
      w[0]=bend*Math.sin(phase)+turn*.11;w[1]=-bend*Math.cos(phase);
      const balance=.17*Math.sin(t*.31+f.angle)+.44*turn;
      for(let side=0;side<2;side++) {
        const p=phase*.78+(side?balance:-balance);
        w[2+2*side]=(.54+.42*Math.sin(p))*(.68+.32*stroke)*(1+(side?1:-1)*.17*turn);
        w[3+2*side]=Math.cos(p)*(.64+.36*stroke);
      }
    }
    const cycle=t%81;
    const moving=THREE.MathUtils.smoothstep(cycle,10,70);
    const progress=moving-.0022*Math.sin(moving*Math.PI*42);
    const swim=Math.min(THREE.MathUtils.smoothstep(cycle,9,15),1-THREE.MathUtils.smoothstep(cycle,66,71));
    turtlePath.getPointAt(progress,location);turtlePath.getTangentAt(progress,nose);
    turtlePath.getTangentAt((progress+.035)%1,future);
    const turn=THREE.MathUtils.clamp((nose.x*future.z-nose.z*future.x)*3,-1,1);
    const lift=.15*swim+.008*swim*Math.sin(t*.28);
    turtle.group.position.set(location.x,floorHeight(location.x,location.z)+planted+lift,location.z);
    turtle.group.rotation.set(swim*(.022*Math.sin(t*2.35)+.065*turn),Math.atan2(nose.z,-nose.x),
      swim*.035*Math.sin(t*.49),'YXZ');
    turtle.pose(t,swim,turn);
  }
  update(0);
  return {group,update};
}
