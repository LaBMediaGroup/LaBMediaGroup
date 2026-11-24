// The boards, roof panels and openings are cut in metres. See field-station-reference.md.
import {buildEventWall} from './event-wall.js?v=17';
import {buildFieldBench} from './field-bench.js?v=16';

export function buildFieldStation({ THREE, height, uniforms, x = -13.1, z = -4.4, yaw = -.15 }) {
  const group = new THREE.Group();
  group.name = 'Saltbox field station';
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const worldXZ = (a, b) => [x + c * a + s * b, z - s * a + c * b];
  const ground = (a, b) => height(...worldXZ(a, b));
  const padWidth = 1.79, padDepth = 1.51, shoulder = .25;
  let base = -Infinity;
  for (let i = 0; i <= 16; i++) for (let j = 0; j <= 12; j++) {
    base = Math.max(base, ground(padWidth * (i / 8 - 1), padDepth * (j / 6 - 1)));
  }
  base += .105;
  group.position.set(x, base, z);
  group.rotation.y = yaw;

  const position = [], normal = [], uv = [], color = [], surface = [];
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const axis = { x: V(1,0,0), y: V(0,1,0), z: V(0,0,1) };
  const wood = 0, metal = 1, glazing = 2, gravel = 3, bulb = 4;
  const pine = [.49,.40,.305], casing = [.61,.49,.36], door = [.45,.335,.231];
  const painted = [.16,.255,.22], zinc = [.29,.32,.31], iron = [.075,.074,.065];
  const glass = [.09,.13,.13], stone = [.26,.24,.205];
  const identity = new THREE.Matrix4();
  let sequence = 0;
  const numbers = n => { const value = Math.sin(n * 43.739 + 9.41) * 24518.87; return value - Math.floor(value); };
  function add(geometry, frame, tint, kind, grain = 'y', shade = 1) {
    const geo = geometry.index ? geometry.toNonIndexed() : geometry;
    const p = geo.getAttribute('position'), n = geo.getAttribute('normal');
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(frame);
    const offset = numbers(++sequence) * 28, tone = shade * (kind === wood ? .93 + numbers(sequence + 107) * .14 : 1);
    const a = new THREE.Vector3(), b = new THREE.Vector3(), cross = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(n, i);
      let g = axis[grain];
      if (Math.abs(g.dot(b)) > .97) g = grain === 'y' ? axis.z : axis.y;
      cross.crossVectors(b, g).normalize();
      const u=a.dot(cross)+offset, v=a.dot(g)+offset*.37;
      a.applyMatrix4(frame); b.applyMatrix3(normalMatrix).normalize();
      if (kind === gravel) uv.push(a.x,a.z);
      else uv.push(u,v);
      position.push(a.x,a.y,a.z); normal.push(b.x,b.y,b.z);
      color.push(...tint.map(v => v * tone)); surface.push(kind);
    }
    if (geo !== geometry) geo.dispose();
    geometry.dispose();
  }
  function placement(px,py,pz,rx = 0,ry = 0,rz = 0,parent = identity) {
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
    return m.premultiply(new THREE.Matrix4().makeTranslation(px,py,pz)).premultiply(parent);
  }
  function box(px,py,pz,w,h,d,tint,kind = wood,grain = 'y',parent = identity,shade = 1) {
    add(new THREE.BoxGeometry(w,h,d), placement(px,py,pz,0,0,0,parent), tint, kind, grain, shade);
  }
  function cylinder(px,py,pz,top,bottom,h,tint,kind,parent = identity,rx = 0) {
    add(new THREE.CylinderGeometry(top,bottom,h,12),placement(px,py,pz,rx,0,0,parent),tint,kind);
  }
  function poly(vertices, faces, tint, kind, grain = 'y', frame = identity, shade = 1) {
    const data = [];
    for (const face of faces) for (let i=1; i<face.length-1; i++) {
      for (const k of [face[0],face[i],face[i+1]]) data.push(...vertices[k]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(data,3)); geo.computeVertexNormals();
    add(geo,frame,tint,kind,grain,shade);
  }
  // Solid six-faced cladding or sheet with its top edge cut along the rake.
  function board(lo,hi,bottom,topL,topR,thickness,tint,frame,shade = 1) {
    const q = thickness / 2;
    poly([[lo,bottom,q],[hi,bottom,q],[hi,topR,q],[lo,topL,q],
          [lo,bottom,-q],[hi,bottom,-q],[hi,topR,-q],[lo,topL,-q]],
      [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]],tint,wood,'y',frame,shade);
  }
  const outer = [[-1,-1],[-1,1],[1,1],[1,-1]];
  const padRings = [];
  // The shoulders feather into the bank. Slightly clipped corners and a loose
  // edge of stone retain the shape of compacted crushed gravel at the shoreline.
  for (let side = 0; side < 4; side++) {
    const [ax,az]=outer[side],[bx,bz]=outer[(side+1)%4];
    for(let j=0;j<18;j++){
      const t=(j+.5)/18,a=ax+(bx-ax)*t,b=az+(bz-az)*t;
      const variance=numbers(side*18+j+201);
      const ring=(inset,level)=>{
        const px=a*(padWidth+inset),pz=b*(padDepth+inset);
        const y=ground(px,pz)-base;
        return [px,level===0?0:level===1?Math.min(-.026,y*.21):y-.035,pz];
      };
      padRings.push([ring(-.052+variance*.043,0),ring(.043+variance*.048,1),ring(.135+variance*.115,2)]);
    }
  }
  for(let i=0;i<padRings.length;i++){
    const a=padRings[i], b=padRings[(i+1)%padRings.length];
    poly([[0,0,0],a[0],b[0]],[[0,1,2]],stone,gravel);
    for(let j=0;j<2;j++)poly([a[j],a[j+1],b[j+1],b[j]],[[0,1,2,3]],stone,gravel);
    const seedPoint=a[0],sx=seedPoint[0],sz=seedPoint[2];
    const rock=new THREE.IcosahedronGeometry(1,0);
    const radius=.009+numbers(i+728)*.017;
    const vertex=placement(sx,-.003,sz,0,numbers(i+307)*6,0);
    vertex.scale(V(radius*1.25,radius*.64,radius*.93));
    add(rock,vertex,stone,gravel);
  }

  const W = 3.048, D = 2.438, floor = .102 + .152 + .019;
  const front = 2.108, rear = 1.803, ridgeZ = .609, ridge = front + D/2 - ridgeZ;
  const roofY = pz => ridge - (pz > ridgeZ ? pz-ridgeZ : (ridgeZ-pz)*.5);
  const frontFrame = placement(0,floor,D/2), backFrame = placement(0,floor,-D/2,0,Math.PI);
  const rightFrame = placement(W/2,floor,0,0,Math.PI/2), leftFrame = placement(-W/2,floor,0,0,-Math.PI/2);
  for (const beam of [-.78,.78]) box(0,.051,beam,W,.102,.152,door,wood,'x',identity,.68);
  for (let j = 0; j <= 5; j++) box(-W/2+.019+j*(W-.038)/5,.178,0,.038,.152,D-.076,pine,wood,'z',identity,.70);
  for(const side of [-1,1]) box(0,.178,side*(D/2-.019),W,.152,.038,pine,wood,'x',identity,.72);
  box(0,floor-.0095,0,W,.019,D,pine,wood,'x');
  const mainDoor = [-1.27,.305,.005,1.862], frontWindow = [.657,1.356,1.046,1.7];
  const endWindow = [-.365,.365,.985,1.684];
  function wall(span,top,frame,openings,count,breakAt) {
    let widths = [-span/2,span/2,...openings.flatMap(o => [o[0],o[1]])];
    for (let i=1;i<count;i++) widths.push((i/count-.5)*span);
    if (typeof breakAt === 'number') widths.push(breakAt);
    widths = [...new Set(widths)].sort((a,b)=>a-b);
    for (let i=1;i<widths.length;i++) {
      const a=widths[i-1], b=widths[i], mid=(a+b)/2;
      const opening = openings.find(o=>mid>o[0] && mid<o[1]);
      const sections = opening ? [[0,opening[2],opening[2]],[opening[3],top(a),top(b)]] : [[0,top(a),top(b)]];
      for (const [lo,h1,h2] of sections) if (Math.min(h1,h2)-lo > .002) {
        board(a,b,lo,h1,h2,.026,pine,frame);
      }
    }
    for (let i=1;i<count;i++) {
      const a=(i/count-.5)*span;
      const nearTrim = openings.some(o=>Math.min(Math.abs(a-o[0]),Math.abs(a-o[1]))<.04);
      if(nearTrim) continue;
      const opening = openings.find(o=>a>o[0] && a<o[1]);
      const sections = opening ? [[0,opening[2]],[opening[3],top(a)]] : [[0,top(a)]];
      for(const [lo,hi] of sections) if(hi-lo>.045) box(a,(lo+hi)/2,.018,.034,hi-lo,.016,casing,wood,'y',frame,.91);
    }
  }
  wall(W,()=>front,frontFrame,[mainDoor,frontWindow],16);
  wall(W,()=>rear,backFrame,[],16);
  const ventX=-.56, ventY=2.20;
  wall(D,a=>roofY(-a),rightFrame,[endWindow,[ventX-.16,ventX+.16,ventY-.102,ventY+.102]],13,-ridgeZ);
  wall(D,a=>roofY(a),leftFrame,[],13,ridgeZ);
  for (const [frame,span,a,b] of [[frontFrame,W,front,front],[backFrame,W,rear,rear],[rightFrame,D,front,rear],[leftFrame,D,rear,front]]) {
    box(-span/2+.032,a/2,.023,.064,a,.027,casing,wood,'y',frame);
    box(span/2-.032,b/2,.023,.064,b,.027,casing,wood,'y',frame);
  }
  // Each door leaf has a narrow reveal, inner backing, painted iron strap and pintle.
  const [dl,dr,db,dt] = mainDoor, leafW = (dr-dl)/2, center = (dl+dr)/2;
  for (const [leaf,sign] of [[dl,1],[center,-1]]) {
    const mid = leaf+leafW/2;
    const hingeAt = sign===1 ? leaf+.011 : leaf+leafW-.011;
    const hinge=placement(hingeAt,0,.050,0,sign===1?-1.96:1.97,0,frontFrame);
    const leafFrame=placement(-hingeAt,0,-.050,0,0,0,hinge);
    box(mid,dt/2,-.004,leafW-.006,dt,.038,door,wood,'y',leafFrame,.65);
    for(let i=0;i<5;i++) box(leaf+(i+.5)*leafW/5,dt/2,.024,leafW/5-.003,dt-.008,.025,door,wood,'y',leafFrame);
    box(mid,.059,.044,leafW-.011,.095,.022,casing,wood,'x',leafFrame,.85);
    for(const y of [.19,.92,1.68]) box(mid,y,-.038,leafW-.011,.067,.035,casing,wood,'x',leafFrame,.76);
    const brace=placement(mid,.94,-.042,0,0,sign*.396,leafFrame);
    box(0,0,0,.061,1.60,.035,pine,wood,'y',brace,.83);
    if(sign===1) box(center-.03,.96,.051,.11,.043,.027,iron,metal,'x',leafFrame);
    if(sign===-1) box(center+.058,.924,.072,.018,.065,.018,zinc,metal,'y',leafFrame);
    for(const y of [.29,1.55]) {
      box(hingeAt-sign*.035,y,.044,.085,.036,.024,iron,metal,'x',frontFrame);
      const frame = placement(hingeAt,y,.053,0,sign===1?0:Math.PI,0,leafFrame);
      const end=.32, a=.025,b=.009;
      poly([[0,-a,0],[end,-b,0],[end+.024,0,0],[end,b,0],[0,a,0]],[[0,1,2,3,4]],iron,metal,'x',frame);
      for(const dx of [.055,.245]) cylinder(hingeAt+sign*dx,y,.055,.008,.008,.008,zinc,metal,leafFrame,Math.PI/2);
      cylinder(hingeAt,y,.050,.014,.014,.08,iron,metal,leafFrame);
    }
  }
  for(const xx of [dl-.03,dr+.03]) box(xx,dt/2,.029,.068,dt,.055,casing,wood,'y',frontFrame);
  box(center,dt+.035,.028,dr-dl+.136,.07,.056,casing,wood,'x',frontFrame);
  function windowUnit(opening,frame,tilt) {
    const [l,r,b,t]=opening, mid=(l+r)/2, w=r-l, h=t-b;
    for(const px of [l-.027,r+.027]) box(px,(b+t)/2,.027,.06,h+.11,.073,casing,wood,'y',frame);
    box(mid,t+.029,.034,w+.13,.059,.093,casing,wood,'x',frame);
    box(mid,b-.027,.048,w+.15,.055,.132,casing,wood,'x',frame);
    const sash=placement(mid,t,.046,-tilt,0,0,frame);
    box(0,-h/2,.002,w-.012,h-.012,.01,glass,glazing,'y',sash);
    for(const u of [-.5,.5]) box(u*(w-.035),-h/2,.014,.035,h,.034,casing,wood,'y',sash);
    for(const v of [-.017,h/2,h-.017]) box(0,-v,.015,w,Math.abs(v-h/2)<.01?.019:.034,.034,casing,wood,'x',sash);
    for(const u of [-1,1]) box(u*w/6,-h/2,.014,.018,h-.05,.03,casing,wood,'y',sash);
    if (tilt) {
      for(const side of [-1,1]) {
        box(side*w*.32,-.012,.033,.056,.024,.012,iron,metal,'x',sash);
        const arm=placement(mid+side*(w/2-.028),b+.04,.05,Math.PI/2-tilt/2,0,0,frame);
        box(0,.043,0,.012,.102,.012,zinc,metal,'y',arm);
      }
    }
  }
  windowUnit(frontWindow,frontFrame,.15); windowUnit(endWindow,rightFrame,0);
  // Gable vent penetrates the cladding surface; a dark recessed throat backs the slats.
  box(ventX,ventY,-.002,.322,.205,.027,iron,metal,'x',rightFrame);
  for (const k of [-1,1]) {
    box(ventX+k*.172,ventY,.05,.028,.248,.055,casing,wood,'y',rightFrame);
    box(ventX,ventY+k*.11,.05,.37,.026,.055,casing,wood,'x',rightFrame);
  }
  for(let i=0;i<4;i++) {
    const frame = placement(ventX,ventY-.071+i*.046,.054,-.45,0,0,rightFrame);
    box(0,0,0,.316,.038,.025,pine,wood,'x',frame,.89);
  }
  // Post-and-beam plates carry the rafters directly above the skidded deck.
  for (const [wallZ,wallHeight] of [[D/2,front],[-D/2,rear]]) {
    const postZ=wallZ-Math.sign(wallZ)*.051;
    for(const side of [-1,1]) box(side*(W/2-.051),floor+(wallHeight-.095)/2,postZ,.102,wallHeight-.095,.102,door,wood,'y');
    box(0,floor+wallHeight-.045,postZ,W,.101,.102,pine,wood,'x');
  }
  // Two roof sheets meet on the common ridge axis. Ribs run down the pitch.
  const halfRoof = 1.702, ridgeH = floor+ridge+.083;
  for(const [end,slope] of [[1.4985,1],[-1.4985,-.5]]) {
    const angle=Math.atan(slope), len=Math.abs(end-ridgeZ)*Math.hypot(1,slope);
    const centerZ=(end+ridgeZ)/2, centerY=ridgeH-Math.abs(end-ridgeZ)*Math.abs(slope)/2;
    const plane=placement(0,centerY,centerZ,angle);
    for (let j=0;j<=5;j++) {
      const rafterX=(j/5-.5)*(W-.045);
      box(rafterX,-.104,0,.045,.107,len-.012,pine,wood,'z',plane,.72);
    }
    box(0,-.035,0,halfRoof*2,.062,len,pine,wood,'z',plane,.72);
    box(0,.004,0,halfRoof*2,.017,len,painted,metal,'z',plane);
    for(let j=0;j<=16;j++) {
      const px=(j/16-.5)*(2*halfRoof-.025);
      const ribFrame=placement(px,.012,0,0,0,0,plane);
      const u=.016,v=.006,k=.017,h=len/2;
      poly([[-u,0,-h],[u,0,-h],[v,k,-h],[-v,k,-h],[-u,0,h],[u,0,h],[v,k,h],[-v,k,h]],
        [[0,4,7,3],[3,7,6,2],[2,6,5,1],[0,3,2,1],[4,5,6,7]],painted,metal,'z',ribFrame);
    }
    for(const side of [-1,1]) box(side*(halfRoof-.019),-.077,0,.039,.108,len,casing,wood,'z',plane);
    box(0,-.078,(end>ridgeZ?1:-1)*(len/2-.019),halfRoof*2,.116,.038,casing,wood,'x',plane);
    const capLength=.115;
    box(0,.027,(end>ridgeZ?-1:1)*(len/2-capLength/2),halfRoof*2+.015,.019,capLength,painted,metal,'x',plane);
  }
  // Weatherproof wall bracket. The dusk light originates inside this guarded globe.
  const lampX=.474, lampY=1.72, lampZ=.155;
  cylinder(lampX,lampY+.089,.045,.052,.052,.05,zinc,metal,frontFrame,Math.PI/2);
  box(lampX,lampY+.103,.101,.033,.031,.121,zinc,metal,'z',frontFrame);
  cylinder(lampX,lampY+.077,lampZ,.04,.051,.039,zinc,metal,frontFrame);
  const globe=placement(lampX,lampY-.006,lampZ,0,0,0,frontFrame);
  const shell=new THREE.LatheGeometry([[.001,-.082],[.028,-.077],[.039,-.057],[.040,.060],[.001,.062]].map(([a,b])=>new THREE.Vector2(a,b)),16);
  add(shell,globe,[.63,.62,.52],bulb);
  for(const yy of [-.066,-.031,.009,.051]){
    add(new THREE.TorusGeometry(.048,.003,5,16),placement(0,yy,0,Math.PI/2,0,0,globe),zinc,metal);
  }
  for(let i=0;i<6;i++) cylinder(Math.sin(i*Math.PI/3)*.047,-.006,Math.cos(i*Math.PI/3)*.047,.003,.003,.145,zinc,metal,globe);

  // The reciprocal side of each plank is visible from the interior. Wall studs
  // and the board floor catch light from the open front and the workbench lamp.
  for(const side of [-1,1])for(const pz of [-.83,.7]){
    box(side*(W/2-.044),floor+.97,pz,.068,1.94,.083,door,wood,'y');
  }
  for(const px of [-1.04,-.43,.23,.89])box(px,floor+.86,-D/2+.038,.079,1.72,.063,door,wood,'y');
  for(let j=0;j<15;j++)box((j+.5)*W/15-W/2,floor+.001,0,W/15-.002,.002,D-.022,pine,wood,'z',identity,.80);
  const bench=buildFieldBench({THREE,uniforms,group,floor,placement,box,add,cylinder});
  const eventWall=buildEventWall({THREE,group,placement,box,add,cylinder,uniforms});
  const geometry = new THREE.BufferGeometry();
  for (const [key,data,size] of [['position',position,3],['normal',normal,3],['uv',uv,2],['color',color,3],['surface',surface,1]]) {
    geometry.setAttribute(key,new THREE.Float32BufferAttribute(data,size));
  }
  geometry.computeBoundingSphere();
  const localLamp = V(lampX,floor+lampY-.006,D/2+lampZ);
  const material = new THREE.ShaderMaterial({
    uniforms: {...uniforms, stationLamp:{value:localLamp}, benchLamp:{value:bench.light}},
    side:THREE.DoubleSide, vertexColors:true,
    vertexShader: `
      attribute float surface;
      varying vec3 w,n,col,p;
      varying vec2 tex;
      varying float kind,insideEye;
      void main(){
        vec3 localEye=transpose(mat3(modelMatrix))*(cameraPosition-modelMatrix[3].xyz);
        insideEye=step(abs(localEye.x),1.51)*step(abs(localEye.z),1.214)*step(localEye.y,2.70);
        p=position; vec4 world=modelMatrix*vec4(p,1.); w=world.xyz;
        n=normalize(mat3(modelMatrix)*normal); tex=uv; col=color; kind=surface;
        gl_Position=projectionMatrix*viewMatrix*world;
      }`,
    fragmentShader: `
      uniform vec3 uZen,uHor,uSunC,uSunDir,stationLamp,benchLamp;
      uniform float uDay,uGold,uNight,uEl;
      varying vec3 w,n,col,p;
      varying vec2 tex;
      varying float kind,insideEye;
      float hash(vec2 p){return fract(sin(dot(p,vec2(17.13,85.7)))*17923.248);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
      void main(){
        vec3 N=normalize(n), V=normalize(cameraPosition-w), L=normalize(uSunDir), base=col;
        if(kind>1.5 && kind<2.5 && insideEye>.5) discard;
        float direct=max(dot(N,L),0.)*smoothstep(-.04,.06,uEl);
        float daylight=smoothstep(-.23,.13,uEl);
        if(kind<.5){
          float wobble=noise(tex*vec2(7.,3.))*.009;
          vec2 fiber=vec2(tex.x+wobble,tex.y);
          float detail=1.-smoothstep(.002,.018,fwidth(tex.x));
          vec2 cell=floor(tex*vec2(5.,1.25));
          vec2 center=vec2(.24+.51*hash(cell+2.7),.16+.64*hash(cell-6.1));
          vec2 eye=(fract(tex*vec2(5.,1.25))-center)*vec2(5.2,8.6);
          float knot=exp(-dot(eye,eye)*2.3)*smoothstep(.72,.96,hash(cell));
          fiber.x+=knot*.018;
          float rings=noise(fiber*vec2(105.,2.3));
          float strands=noise(fiber*vec2(380.,9.));
          base*=.90+(.37*rings+.12*strands-.19)*detail+.13*noise(tex*vec2(11.,.82))-.26*knot;
          base*=mix(.78,1.,smoothstep(.28,.62,p.y));
          if(abs(p.y-1.089)<.032 && p.x>.94 && p.x<1.52 && abs(p.z+.10)<.615){
            base=mix(col,vec3(.46,.365,.271),.58)*(.95+.070*rings+.035*strands);
          }
        } else if(kind>2.5 && kind<3.5){
          float grain=noise(p.xz*64.);
          base*=mix(1.,.75+.53*grain,1.-smoothstep(.006,.033,fwidth(p.x)+fwidth(p.z)));
          base*=mix(.52,1.,smoothstep(.0,.26,max(abs(p.x)-1.50,abs(p.z)-1.16)));
        }
        float overhang=1.;
        if(kind<2.5 && N.y<.3 && p.y<2.39 && abs(p.z)>1.19)
          overhang=mix(1.,.72,smoothstep(2.12,2.39,p.y));
        vec3 ambient=(mix(uZen,uHor,.62)*.77+.165*daylight)*(.84+.16*N.y);
        vec3 lit=base*(ambient+uSunC*direct*(.67+.56*uGold))*overhang;
        lit*=mix(.23,1.,uDay); lit+=base*.031*uNight;
        if(kind>.5 && kind<2.5){
          vec3 R=reflect(-V,N); float highlight=pow(max(dot(R,L),0.),kind<1.5?36.:110.);
          lit+=uSunC*highlight*(kind<1.5?.17:.60)*daylight;
          if(kind<1.5 && N.y>.40 && p.y>2.){
            float reflectance=.075+.08*pow(1.-max(dot(V,N),0.),2.);
            lit+=mix(uHor,uZen,smoothstep(.0,.80,R.y))*reflectance*daylight;
          }
          if(kind>1.5){
            vec3 reflection=mix(uHor*.68,uZen*.85,smoothstep(.0,.72,R.y));
            if(R.y<.04) reflection=mix(vec3(.065,.072,.05),uHor*.64,smoothstep(-.14,.04,R.y));
            float stand=.028+.036*noise(vec2(atan(R.x,R.z)*46.,1.))+.018*noise(vec2(atan(R.x,R.z)*190.,1.));
            reflection=mix(reflection,vec3(.075,.084,.063)*(.45+.55*daylight),1.-smoothstep(stand-.02,stand+.012,R.y));
            lit=mix(lit,reflection,.39+.57*pow(1.-max(dot(V,N),0.),4.));
          }
        }
        float afterDark=1.-smoothstep(-.10,.13,uEl);
        float lampDistance=distance(p,stationLamp);
        if(p.z>1.16 && kind<3.5)
          lit+=base*vec3(1.,.55,.23)*afterDark*.16/(.2+lampDistance*lampDistance)*(1.-smoothstep(1.22,1.36,p.z));
        bool interior=p.x>-1.526 && p.x<1.526 && abs(p.z)<1.222 && p.y<2.80;
        if(interior && (insideEye>.5 || p.z<.75)){
          vec3 delta=benchLamp-p;
          float localLight=(.26+1.38/(.52+dot(delta,delta)))*(.52+.48*max(dot(N,normalize(delta)),0.));
          lit=mix(lit,base*(vec3(.27+.18*daylight)+vec3(.85,.68,.50)*localLight),.86);
        }
        // Contact under the stationery and under the refrigerator.
        if(abs(p.y-1.089)<.003 && p.x>.94 && p.x<1.52){
          vec2 b=abs(p.xz-vec2(1.193,-.112))-vec2(.064,.083);
          float bookShadow=1.-smoothstep(-.002,.014,max(b.x,b.y));
          vec2 c=abs(p.xz-vec2(1.274,-.41))-vec2(.038,.061);
          float cardShadow=1.-smoothstep(-.001,.009,max(c.x,c.y));
          lit*=1.-.27*max(bookShadow,cardShadow);
        }
        if(abs(p.y-.275)<.012){
          vec2 footprint=abs(p.xz-vec2(-.73,-.77))-vec2(.289,.366);
          lit*=.50+.50*smoothstep(-.020,.071,max(footprint.x,footprint.y));
        }
        if(kind>3.5 && kind<4.5)lit=mix(lit,vec3(1.,.80,.51),distance(p,benchLamp)<.3?.96:afterDark*.96);
        float fog=1.-exp(-length(w-cameraPosition)*.008);
        gl_FragColor=vec4(mix(lit,uHor*mix(.55,.9,uDay),fog),1.);
      }`
  });
  const mesh = new THREE.Mesh(geometry,material);
  mesh.name = 'Timber, standing seams, hardware and foundation';
  group.add(mesh);
  return {group, bench, eventWall, padHalfWidth:padWidth+shoulder, padHalfDepth:padDepth+shoulder, yaw};
}
