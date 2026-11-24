// The jay is authored in metres, facing +X. Its feet and oak share a wind clock.
export function buildFieldBird(T, {tree, uniforms: U, reduced = false}) {
  const vec = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const up = vec(0, 1, 0);
  const branch = tree.children[0];
  tree.updateWorldMatrix(true, true);
  // Outer, pond-facing scaffold. Pick two real bark triangles under the foot pads.
  const middle = branch.localToWorld(vec(-1.1875, 6.8591, -.1875));
  const across = vec(.9942, 0, .1076).normalize();
  const forward = up.clone().cross(across);
  const ray = new T.Raycaster();
  const pos = branch.geometry.attributes.position;
  const anchor = branch.geometry.attributes.anchor;
  function barkPoint(x, z) {
    const origin = middle.clone().addScaledVector(forward, x).addScaledVector(across, z);
    origin.y += .095;
    ray.set(origin, vec(0, -1, 0));
    ray.far = .18;
    const hit = ray.intersectObject(branch, false)[0];
    if (!hit) return null;
    const local = branch.worldToLocal(hit.point.clone());
    const ids = [hit.face.a, hit.face.b, hit.face.c];
    const corners = ids.map(i => vec().fromBufferAttribute(pos, i));
    const weights = T.Triangle.getBarycoord(local, ...corners, vec()).toArray();
    const samples = ids.map((i, j) => {
      const p = vec().fromBufferAttribute(anchor, i);
      const reach = Math.hypot(p.x, p.z), h = clamp((p.y - .75) / 7.6);
      return {w: weights[j], phase: p.x * .48 + p.z * .31 + p.y * .23,
        flex: h*h*(.10+.046*reach) + smooth(.7,4.8,reach)*.25*smooth(.35,1.4,p.y)};
    });
    return {local, samples};
  }
  const padSpacing = .023;
  const grips = [-1, 1].map(s => barkPoint(0, s * padSpacing / 2));
  const group = new T.Group();
  group.name = 'Blue jay / front oak limb';
  if (grips.some(g => !g)) {
    group.visible = false;
    return {group, update() {}, inspect: () => ({state:'perch unavailable'})};
  }
  const gripWorld = [vec(), vec()];
  function posed(g, out) {
    out.copy(g.local);
    if (!reduced) {
      const t = U.uT.value, d = U.uWindDir.value, amp = Math.min(U.uWindAmp.value, .77);
      for (const {w, phase, flex} of g.samples) {
        const wave = .42+.44*Math.sin(t*1.15+phase)+.16*Math.sin(t*2.15+phase*1.8)+U.uGustE.value*.50;
        const side = .17*Math.sin(t*2.28+phase);
        out.x += (d.x*wave - d.z*side)*flex*amp*w;
        out.z += (d.z*wave + d.x*side)*flex*amp*w;
      }
    }
    return branch.localToWorld(out);
  }
  const rigid = new T.Group(), body = new T.Group(), head = new T.Group();
  const tail = new T.Group(), shoulder = [], shank = [];
  group.add(rigid); rigid.add(body); body.add(head, tail);
  head.position.set(.044,.093,0); tail.position.set(-.048,.060,0);
  const colorCache = new Map();
  const col = c => {
    if (!colorCache.has(c)) colorCache.set(c, new T.Color(c).toArray());
    return colorCache.get(c);
  };
  const material = () => new T.ShaderMaterial({
    uniforms: {...U, spread: {value: 0}}, side:T.DoubleSide,
    vertexShader: `attribute vec3 color,openPosition,openNormal;uniform float spread;
      varying vec3 fc,fn,wp;
      void main(){vec3 p=mix(position,openPosition,spread);
        fn=mat3(modelMatrix)*mix(normal,openNormal,spread);fc=color;
        vec4 w=modelMatrix*vec4(p,1.);wp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `uniform vec3 uSunDir,uHor,uZen,uSunC;uniform float uDay,uEl;
      varying vec3 fc,fn,wp;
      void main(){vec3 n=normalize(fn);float sun=max(dot(n,normalize(uSunDir)),0.)*smoothstep(-.035,.06,uEl);
        vec3 sky=mix(uHor,uZen,.36)*.39+vec3(.48,.49,.51);
        vec3 c=fc*(sky*(.80+.20*n.y)+uSunC*sun*.65)*mix(.071,1.,uDay);
        c=pow(max(c,vec3(0.)),vec3(.4545));
        gl_FragColor=vec4(mix(c,uHor*mix(.55,.90,uDay),1.-exp(-length(wp-cameraPosition)*.008)),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const plumage = material();
  // Merge each rigid anatomical unit into one draw; alternate wing poses keep identical topology.
  function batch(parent, label, mat=plumage) {
    const p=[], q=[], colors=[], indices=[];
    return {
      vertex(a, c, b=a) { p.push(...a); q.push(...b); colors.push(...col(c)); return p.length/3-1; },
      tri(a,b,c){indices.push(a,b,c);},
      finish(){
        const geometry=new T.BufferGeometry(), open=new T.BufferGeometry();
        geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));
        geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
        geometry.setIndex(indices); geometry.computeVertexNormals();
        open.setAttribute('position',new T.Float32BufferAttribute(q,3));
        open.setIndex(indices);open.computeVertexNormals();
        geometry.setAttribute('openPosition',open.attributes.position);
        geometry.setAttribute('openNormal',open.attributes.normal);
        const mesh=new T.Mesh(geometry,mat);mesh.name=label;mesh.frustumCulled=false;parent.add(mesh);
        return mesh;
      }
    };
  }
  function loft(b, sections, tint, sides=22) {
    const faces=[];
    for (const [i,[x,y,ry,rz,z=0]] of sections.entries()) {
      const ring=[];
      for (let j=0;j<sides;j++) {
        const a=2*Math.PI*j/sides, sy=Math.sin(a), sz=Math.cos(a);
        ring.push(b.vertex([x,y+sy*ry,z+sz*rz],tint(x,sy,sz,i)));
      }
      if(i) for(let j=0;j<sides;j++){const k=(j+1)%sides;b.tri(faces[j],ring[j],ring[k]);b.tri(faces[j],ring[k],faces[k]);}
      faces.splice(0,faces.length,...ring);
    }
  }
  function tube(b,pts,radii,color) {
    const rings=[];
    for(let i=0;i<pts.length;i++){
      const p=vec(...pts[i]), tangent=vec(...pts[Math.min(i+1,pts.length-1)]).sub(vec(...pts[Math.max(0,i-1)])).normalize();
      const a=tangent.clone().cross(Math.abs(tangent.y)>.85 ? vec(1,0,0) : up).normalize(), c=tangent.clone().cross(a);
      const ring=[];
      for(let j=0;j<8;j++){
        const t=j*Math.PI/4;
        ring.push(b.vertex(p.clone().addScaledVector(a,radii[i]*Math.cos(t)).addScaledVector(c,radii[i]*Math.sin(t)).toArray(),color));
      }
      if(i)for(let j=0;j<8;j++){const k=(j+1)%8;b.tri(rings[j],rings[k],ring[k]);b.tri(rings[j],ring[k],ring[j]);}
      rings.splice(0,rings.length,...ring);
    }
  }
  // Overlapping convex vanes, with a raised rachis and pigment across individual barbs.
  function feather(b, closed, opened, tint, width, widthOpen=width) {
    const last=[];
    const shape=(spec,t,v,w)=>{
      const [r,e,acrossV,lift]=spec;
      const breadth=Math.pow(Math.max(0,Math.sin(Math.PI*Math.pow(t,.83))),.61);
      return r.map((x,i)=>x+(e[i]-x)*t+acrossV[i]*v*w*breadth+lift[i]*(1-v*v)*breadth*.0019);
    };
    for(let j=0;j<=32;j++){
      const t=j/32, row=[];
      for(const v of [-1,-.12,0,.15,1]){
        row.push(b.vertex(shape(closed,t,v,width),tint(t,v),shape(opened,t,v,widthOpen)));
      }
      if(j)for(let k=0;k<4;k++){b.tri(last[k],last[k+1],row[k+1]);b.tri(last[k],row[k+1],row[k]);}
      last.splice(0,last.length,...row);
    }
  }
  const torso=batch(body,'Mantle, breast and gorget');
  loft(torso,[
    [-.077,.051,.002,.002],[-.061,.057,.014,.014],[-.044,.065,.023,.022],
    [-.019,.069,.030,.029],[.009,.072,.034,.032],[.025,.075,.033,.030],[.030,.077,.032,.030],[.034,.079,.031,.029],
    [.043,.085,.024,.023],[.050,.091,.012,.014],[.051,.093,.003,.003]
  ],(x,y)=>x>.029&&x<.043&&y<.63&&y>-.75?'#303741':y>.57?'#587f9c':y>.17?'#7891a1':y>-.48?'#b8c0c0':'#deded3');
  for(const s of [-1,1]){
    loft(torso,[[-.019,.048,.002,.003,.012*s],[-.012,.044,.008,.007,.012*s],[-.005,.039,.009,.007,.011*s],[.001,.041,.006,.005,.010*s],[.005,.045,.002,.002,.010*s]],()=>'#bdc1b8',12);
  }
  torso.finish();
  const face=batch(head,'Crest, bridle, cheeks, eyes and bill');
  loft(face,[[-.033,.001,.003,.003],[-.027,.006,.016,.015],[-.017,.009,.024,.021],[-.005,.010,.026,.024],
    [.008,.010,.023,.023],[.019,.008,.019,.018],[.027,.005,.012,.012],[.030,.005,.005,.005]],
    (x,y,z)=> y>.52?'#5f88ad':y>.28?'#7396b4':(x<-.018&&y<.07)||(x>.008&&y>.00&&y<.23)?'#252b39':y<-.77&&x<-.004?'#333b45':'#e1e2db',28);
  for(let i=-4;i<=4;i++){
    const s=i/4;
    const spec=[[-.001,.024,s*.010],[-.037+.010*Math.abs(s),.044-.013*Math.abs(s),s*.012],[0,0,1],[0,1,0]];
    feather(face,spec,spec,(t,v)=>Math.abs(v)<.1?'#60798e':t>.91?'#516882':'#7095b6',.0045);
  }
  for(const s of [-1,1]){
    tube(face,[[-.018,.005,.017*s],[-.007,.012,.023*s],[.004,.016,.023*s],[.018,.014,.018*s],[.027,.009,.011*s]],
      [.0027,.0035,.0031,.0026,.0015],'#263143');
    const eyeX=.009, eyeY=.014, eyeZ=.023*s;
    loft(face,[[eyeX-.004,eyeY,.0003,.0003,eyeZ],[eyeX-.002,eyeY,.0033,.0023,eyeZ],[eyeX,eyeY,.0039,.0029,eyeZ],[eyeX+.0027,eyeY,.0028,.002,eyeZ],[eyeX+.004,eyeY,.0003,.0003,eyeZ]],()=>'#10151a',12);
    loft(face,[[eyeX+.0003,eyeY+.0012,.0001,.0001,eyeZ+.0031*s],[eyeX+.0011,eyeY+.0012,.0010,.0007,eyeZ+.0031*s],[eyeX+.0019,eyeY+.0012,.0001,.0001,eyeZ+.0031*s]],()=>'#a6b5bc',8);
  }
  loft(face,[[.020,.006,.009,.010],[.030,.006,.0075,.0078],[.042,.004,.0046,.0045],[.053,.000,.00035,.0004]],
    (x,y)=>y>.24?'#37414a':y>-.05?'#1a2028':'#292c30',16);
  face.finish();
  const fanMat=material(), rectrices=batch(tail,'Barred rectrices',fanMat);
  for(let i=-5;i<=5;i++){
    const s=i/5, outer=Math.abs(s);
    const root=[0,.003-.0016*outer, s*.009], tip=[-.125+.015*outer,-.026-.003*outer,s*.019];
    const closed=[root,tip,[0,0,1],[0,1,0]], opened=[root,[tip[0]+.012*outer,-.018,s*.062],[0,0,1],[0,1,0]];
    feather(rectrices,closed,opened,(t,v)=>outer>.49&&t>.94?'#dfdfd4':t>.20&&((t*8+.18*outer)%1)<.19?'#27394e':Math.abs(v)<.1?'#465c72':'#64859b',.0058,.010);
  }
  rectrices.finish();
  for(const s of [-1,1]){
    const pivot=new T.Group();pivot.position.set(.009,.082,s*.022);body.add(pivot);
    const mat=material(), wing=batch(pivot,'Coverts, secondaries and primaries',mat);
    // A continuous vaulted leading edge connects the shoulder, elbow and wrist.
    const sections=[[0,.015,-.032,.002],[.18,.022,-.047,.022],[.45,.021,-.055,.047],[.74,.013,-.049,.077],[1,-.009,-.033,.106]];
    let previous=[];
    for(const [v,front,back,z] of sections){
      const row=[];
      for(let k=0;k<6;k++){
        const h=k/5;
        const folded=[.012-v*.063-h*.033,.002+.008*Math.sin(h*Math.PI)-.013*h-.003*v,s*(.004+.010*Math.sin(v*Math.PI*.75)+.003*h)];
        const extended=[front+(back-front)*h,.002+.007*Math.sin(h*Math.PI)-.005*v,s*z];
        row.push(wing.vertex(folded,k===0?'#7693a7':k<3?'#6388a7':'#4c7392',extended));
      }
      if(previous.length)for(let k=0;k<5;k++){wing.tri(previous[k],previous[k+1],row[k]);wing.tri(previous[k+1],row[k+1],row[k]);}
      previous=row;
    }
    // Emit inner flight feathers before shorter coverts, keeping the leading edge continuous.
    for(let row=0;row<3;row++){
      const N=row===0?15:11;
      for(let i=0;i<N;i++){
        const f=i/(N-1), isFlight=row===0, reach=isFlight?1:row===1?.63:.38;
        const r=[.008-.050*f,.001-.003*f+.002*row,s*(.003+.003*f+.0013*row)];
        const tip=[r[0]-(.122-.081*f)*reach,-(.024+.004*Math.sin(f*Math.PI))*reach,s*(.018-.010*f+.002*row)];
        const openRoot=[.004-.029*f,.001+.0018*row,s*(.007+.062*(1-f))];
        const openTip=[-.029-.057*Math.sin(f*Math.PI*.72),-.005,s*(openRoot[2]*s+(.104-.042*f)*reach)];
        const closed=[r,tip,[.12,.85,s*.48],[0,.3,s*.8]];
        const opened=[openRoot,openTip,[1,.02,s*.21],[0,1,0]];
        feather(wing,closed,opened,(t,v)=>{
          if(row===1 && t>.74 && f>.19 && f<.9)return '#e3e6df';
          if(isFlight && f>.45&&t>.88)return '#ced6d1';
          if(t>.24 && (t*(isFlight?6:4)+f*.38)%1<.18)return '#293c52';
          if(Math.abs(v)<.10)return '#3a5268';
          if(isFlight && f<.32)return '#3f5369';
          return row===2?'#6b91aa':row===1?'#537f9e':'#567b96';
        },isFlight?.0049:.0068,isFlight?.012:.011);
      }
    }
    wing.finish();shoulder.push({s,pivot,mat});
  }
  for(const [j,s] of [-1,1].entries()){
    const foot=new T.Group(), b=batch(foot,'Tarsus and anisodactyl grip');
    tube(b,[[-.005,.034,0],[-.003,.018,.0005*s],[0,.002,0]],[.0038,.0024,.0022],'#4d5052');
    for(const [side,extent] of [[-1,.019],[0,.024],[1,.019],[0,-.020]]){
      const nodes=[[0,.002,0],[extent*.47,.0008,side*.0033],[extent*.87,-.0052,side*.0049],[extent,-.011,side*.0061]];
      tube(b,nodes,[.0018,.0015,.00115,.0009],'#55585a');
      tube(b,[nodes[3],[extent*.99,-.015,side*.0066],[extent*.82,-.0175,side*.0065]],[.001,.0007,.00012],'#2b3136');
    }
    b.finish();rigid.add(foot);shank.push(foot);
  }
  const sideAxis=vec(), faceAxis=vec(), matrix=new T.Matrix4();
  let clock=0, state='waiting', visit=0, phase=0;
  function update(dt, visible=true) {
    if(!visible){group.visible=false;return;}
    clock+=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.10));
    const cycle=53, t=reduced?10:clock%cycle;
    visit=Math.floor(clock/cycle);
    const arrival=5.6, leave=18+(visit%3)*2;
    group.visible=reduced||(t>.70&&t<leave+3.15);
    state=t<=.70?'waiting':t<arrival?'approach':t<leave?'perched':t<leave+3.15?'departure':'away';
    phase=t;
    if(!group.visible)return;
    grips.forEach((g,i)=>posed(g,gripWorld[i]));
    group.position.copy(gripWorld[0]).lerp(gripWorld[1],.5);
    sideAxis.copy(gripWorld[1]).sub(gripWorld[0]);sideAxis.y=0;sideAxis.normalize();
    faceAxis.crossVectors(up,sideAxis).normalize();matrix.makeBasis(faceAxis,up,sideAxis);group.quaternion.setFromRotationMatrix(matrix);
    let spread=0, stroke=0, pitch=0, bank=0, lift=0, fan=0, tuck=0;
    rigid.position.set(0,0,0);rigid.rotation.set(0,0,0);
    if(!reduced && t<arrival){
      const rem=arrival-t, u=clamp(rem/(arrival-.70)), stride=Math.sin(2*Math.PI*(t*3.18+.16*Math.sin(t*2.1)));
      // Finish with little forward travel, legs reaching below the centre of mass as wings brake.
      const brake=1-smooth(.1,1.08,rem), settle=smooth(0,.28,rem);
      rigid.position.set(-9.2*Math.pow(u,1.53),1.40*u+1.4*u*u+.094*Math.sin(u*Math.PI*2)*u,1.5*u*u);
      bank=-.25*Math.sin(Math.PI*u);pitch=.43*brake*settle-.13*u;
      spread=(.42+.58*smooth(0,.34,rem))*(.96+.04*stride);stroke=(.18+stride*.78)*(1-brake)+brake*(.60+.67*settle);
      fan=.84*brake+.18*(1-brake);tuck=smooth(.08,.86,rem);
    }else if(!reduced && t>=leave){
      const s=t-leave,u=clamp(s/3.15), flap=Math.sin(2*Math.PI*(3.7*s-.21*s*s));
      rigid.position.set(5.92*Math.pow(u,1.34),2.8*u+1.12*Math.sin(u*Math.PI*.86),6.10*Math.pow(u,1.34));
      spread=smooth(0,.25,s);stroke=.24+flap*.88;fan=(1-smooth(.18,.9,s))*.69+.11;
      pitch=.30*(1-u);bank=-.30*Math.sin(Math.PI*u);rigid.rotation.y=-.8*smooth(0,.46,s);tuck=smooth(.12,.52,s);
    }else if(!reduced){
      const land=t-arrival, crouch=.011*Math.sin(Math.PI*clamp(land/.32));
      lift=-crouch+.001*Math.sin(2.2*t);
      spread=.40*(1-smooth(0,.43,land));stroke=.60*(1-smooth(.07,.46,land));
      fan=.84*(1-smooth(0,.38,land));pitch=.05*Math.sin(land*11)*Math.exp(-land*5);
    }
    rigid.rotation.x=bank;body.position.y=lift;body.rotation.z=pitch;
    body.rotation.y=reduced?.48:state==='perched'?.48*smooth(arrival+.25,arrival+1.1,t)*(1-smooth(leave-.8,leave-.2,t)):0;
    for(const wing of shoulder){
      wing.mat.uniforms.spread.value=spread;
      wing.pivot.rotation.x=-wing.s*stroke*spread;
    }
    tail.rotation.z=-pitch*.54+(reduced?0:.023*Math.sin(.83*t));fanMat.uniforms.spread.value=fan;
    const look=reduced?.20:(smooth(6.90,7.09,t)-smooth(8.50,8.67,t))*.58-(smooth(9.60,9.76,t)-smooth(12.7,12.95,t))*.71
      +(smooth(13.8,14.02,t)-smooth(15.05,15.24,t))*.36;
    head.rotation.y=look+(!reduced&&state==='perched'?.046*Math.sin(t*1.9):0);
    head.rotation.z=(!reduced&&state==='perched'?-.12*(smooth(10.0,10.3,t)-smooth(11.0,11.19,t)):0)-pitch*.43;
    for(let i=0;i<shank.length;i++){
      const s=i?1:-1;
      shank[i].position.set(-tuck*.020,gripWorld[i].y-group.position.y+tuck*.029,0);
      shank[i].position.z=s*Math.hypot(gripWorld[1].x-gripWorld[0].x,gripWorld[1].z-gripWorld[0].z)*.5;
      shank[i].rotation.z=-tuck*.83;
    }
  }
  update(0,true);
  return {group,update,inspect(){return {state,clock,phase,visit,grips:gripWorld.map(p=>p.toArray()),localGrips:grips.map(g=>g.local.toArray()),
    position:rigid.getWorldPosition(vec()).toArray(),head:head.getWorldPosition(vec()).toArray(),spread:shoulder[0].mat.uniforms.spread.value};}};
}
