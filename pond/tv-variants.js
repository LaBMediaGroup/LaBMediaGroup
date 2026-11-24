// Six physical receivers in metres, resting on local Y=0, picture faces +Z.
// Dimensions, photographic references, and inferred construction in tv-variants-reference.md.
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const MODELS = [
  null,
  ['Sony PVM-14M2MDU', .346,.340,.431],
  ['GE 14T014UHF', .3302,.2667,.4572],
  ['Panasonic TR-005 Orbitel', .300,.250,.260],
  ['Philco 50T-1404', .4826,.48895,.4572],
  ['RCA Victor 14PD9033', .37465,.3429,.422275],
  ['Panasonic TH-21DR1', .576,.487,.389]
];

// Square-to-superellipse mapping keeps adjacent profile and face rings coincident.
function rounded(u,v,power) {
  const edge=Math.max(Math.abs(u),Math.abs(v));
  const norm=(Math.abs(u)**power+Math.abs(v)**power)**(1/power);
  return norm ? [u*edge/norm,v*edge/norm] : [0,0];
}
export function createTVVariant(T,index) {
  const [name,w,h,d]=MODELS[index];
  const group=new T.Group(), front=d/2;
  group.name=name;
  group.userData.dimensions={width:w,height:h,depth:d};
  const mats=new Map();
  function mat(color, metalness=0, roughness=.68) {
    const key=[color,metalness,roughness].join('/');
    if(!mats.has(key)) mats.set(key,new T.MeshStandardMaterial({color,roughness,metalness}));
    return mats.get(key);
  }
  const charcoal=mat(0x252a29), rubber=mat(0x171b18), nickel=mat(0xa49c87,.48,.38);
  function mesh(geo,material,x=0,y=0,z=0) {
    const m=new T.Mesh(geo,material);
    m.position.set(x,y,z);
    group.add(m);
    return m;
  }
  function box(x,y,z,width,height,depth,material) {
    return mesh(new T.BoxGeometry(width,height,depth),material,x,y,z);
  }
  function rod(a,b,radius,material,topRadius=radius) {
    const start=new T.Vector3(...a), delta=new T.Vector3(...b).sub(start);
    const m=mesh(new T.CylinderGeometry(topRadius,radius,delta.length(),12),material);
    m.position.copy(start).addScaledVector(delta,.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
    return m;
  }
  function ring(x,y,z,width,height,power) {
    const pts=[];
    const steps=16;
    for(let side=0;side<4;side++) for(let j=0;j<steps;j++) {
      const t=2*j/steps-1;
      const [u,v]=[[t,-1],[1,t],[-t,1],[-1,-t]][side];
      const [a,b]=rounded(u,v,power);
      pts.push([x+a*width/2,y+b*height/2,z]);
    }
    return pts;
  }
  // Join rings back-to-front. Metre-scaled UVs follow each rail around the shell.
  function shell(sections,material,capBack=false,capEnd=false) {
    const pos=[], uv=[], ids=[], n=sections[0].length;
    let longitudinal=0;
    for(let i=0;i<sections.length;i++) {
      if(i) longitudinal+=Math.hypot(...sections[i][0].map((a,k)=>a-sections[i-1][0][k]));
      let perimeter=0;
      for(let j=0;j<=n;j++) {
        const p=sections[i][j%n];
        if(j) perimeter+=Math.hypot(...p.map((a,k)=>a-sections[i][(j-1)%n][k]));
        pos.push(...p);uv.push(perimeter,longitudinal);
        if(i && j) {
          const c=i*(n+1)+j, a=c-n-2;
          ids.push(a,a+1,c,a,c,c-1);
        }
      }
    }
    if(capBack) for(let j=1;j<n-1;j++) ids.push(0,j+1,j);
    if(capEnd) {
      const start=(sections.length-1)*(n+1);
      for(let j=1;j<n-1;j++) ids.push(start,start+j,start+j+1);
    }
    const g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    g.setIndex(ids);g.computeVertexNormals();
    return mesh(g,material);
  }
  function casing(rows,material,cap=false) {
    const outer=rows.map(([z,width,height,y,p])=>ring(0,y,z,width,height,p));
    if(!cap) return shell(outer,material);
    const wall=index===4 ? .005 : .002;
    const inner=rows.map(([z,width,height,y,p],i)=>ring(0,y,z+(i===0?wall:0),width-2*wall,height-2*wall,p));
    return shell([...outer,...inner.reverse()],material,true,true);
  }
  let screen, knob, volumeControl;
  function face(cx,cy,sw,sh,z,p,curve,outer,material) {
    const lip=ring(cx,cy,z,sw,sh,p);
    const gasket=ring(cx,cy,z+.0015,sw+.005,sh+.005,p+.1);
    shell([outer,gasket],material);
    shell([gasket,lip],rubber);
    const grid=24, pos=[], uv=[], ids=[];
    for(let j=0;j<=grid;j++) for(let i=0;i<=grid;i++) {
      const u=2*i/grid-1,v=2*j/grid-1,[a,b]=rounded(u,v,p);
      pos.push(cx+a*sw/2,cy+b*sh/2,z+curve*(1-u*u)*(1-v*v));
      uv.push((a+1)*.5,(b+1)*.5);
      if(i&&j){const c=j*(grid+1)+i,q=c-grid-2;ids.push(q,q+1,c,q,c,c-1);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();
    screen=mesh(g,mat(0x1d2928,.08,.24));screen.name=name+' picture glass';
  }
  // Set-specific printed transfers, built from vectors so no source photo ships.
  function decal(width,height,draw,x,y,z,side=false) {
    const canvas=document.createElement('canvas');
    canvas.width=512;canvas.height=Math.max(16,Math.round(512*height/width));
    const ctx=canvas.getContext('2d');draw(ctx,canvas.width,canvas.height);
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
    const material=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:.08,roughness:.81,depthWrite:false});
    const m=mesh(new T.PlaneGeometry(width,height),material,x,y,z);
    if(side) m.rotation.y=Math.PI/2;
    return m;
  }
  function badge(text,x,y,z,width,height,ink='#d6cfb6') {
    decal(width,height,(c,W,H)=>{
      c.fillStyle=ink;c.font='600 '+Math.floor(H*.86)+'px Arial';c.textAlign='center';c.textBaseline='middle';
      c.fillText(text,W/2,H*.56,W*.98);
    },x,y,z);
  }
  function perforations(x,y,z,width,height,side=false) {
    decal(width,height,(c,W,H)=>{
      const pitch=Math.max(5,W/38);
      for(let yy=pitch/2; yy<H; yy+=pitch) for(let xx=pitch/2;xx<W;xx+=pitch){
        c.fillStyle='#999a85';c.fillRect(xx,yy+1,pitch*.53,pitch*.59);
        c.fillStyle='#202a28';c.fillRect(xx,yy,pitch*.55,pitch*.56);
      }
    },x,y,z,side);
  }
  function feet(width,depth,base=.006) {
    const supports=[];
    for(const x of [-width*.38,width*.38]) for(const z of [-depth*.34,depth*.34]){
      box(x,base/2,z,width*.09,base,depth*.105,rubber);supports.push([x,0,z]);
    }
    group.userData.supports=supports;
  }
  function sideDial(x,y,z,r,finish) {
    return rod([x-.005,y,z],[x+.005,y,z],r,finish);
  }
  function frontDial(x,y,z,r,finish) {
    return rod([x,y,z-.004],[x,y,z+.006],r,finish);
  }
  function handle(y,z0,z1,material,grip) {
    // Carry strap stowed along the top. Rivets and end plates restrain both ends.
    const strip=.020;
    const path=[[0,y,z0],[0,y+.008,z0+.022],[0,y+.010,(z0+z1)/2],[0,y+.007,z1-.025],[0,y,z1]];
    for(let i=1;i<path.length;i++){
      const a=new T.Vector3(...path[i-1]),b=new T.Vector3(...path[i]),offset=b.clone().sub(a);
      const m=box(0,0,0,strip,.003,offset.length(),grip);m.position.copy(a).lerp(b,.5);
      m.rotation.x=-Math.atan2(offset.y,offset.z);
    }
    for(const z of [z0,z1]) box(0,y,z,.032,.004,.014,material);
  }

  if(index===1) {
    const gray=mat(0xb9b8a3,.12), trim=mat(0x828578,.2);
    const base=.007, mid=(h+base)/2;
    casing([[-front,w*.88,h*.65,mid,15],[-front+.028,w*.88,h*.65,mid,15],[-front+.029,w,h-base,mid,24],[front-.022,w,h-base,mid,24],[front-.012,w-.003,h-base-.001,mid,24]],gray,true);
    const outside=ring(0,mid,front-.012,w-.003,h-base-.001,24);
    face(0,.196,.266,.200,front-.022,9,.010,outside,gray);
    shell([ring(0,.196,front-.010,.303,.231,12),ring(0,.196,front-.020,.269,.203,9)],trim);
    box(0,.042,front-.014,w*.91,.054,.013,gray);
    box(0,.317,front-.010,.031,.015,.003,trim);
    box(0,.317,front-.008,.023,.009,.002,mat(0x547163,.06));
    box(.101,.298,front-.010,.055,.011,.0018,trim);
    badge('TRINITRON',.101,.298,front-.0088,.049,.0054);
    badge('SONY',0,.077,front-.0061,.040,.008,'#393e39');
    // Six rotary controls at the right, the line input keys at the left.
    for(let i=0;i<6;i++) {
      const dial=frontDial(-.005+i*.022,.042,front-.006,.006,rubber);
      if(i===5) volumeControl=dial;
    }
    for(let i=0;i<4;i++) {
      const key=box(-.129+i*.021,.042,front-.005,.014,.010,.005,trim);
      if(i===0) knob=key;
    }
    box(.135,.041,front-.006,.012,.011,.004,trim);
    decal(.133,.009,(c,W,H)=>{
      c.fillStyle='#363f3c';c.font='bold '+Math.floor(H*.8)+'px Arial';c.textAlign='center';
      ['APT','BRIGHT','CHROMA','PHASE','CONT','VOL'].forEach((text,i)=>c.fillText(text,(i+.5)*W/6,H*.82,W/6-2));
    },.050,.056,front-.0064);
    for(const s of [-1,1]){
      const x=s*.152;
      rod([x,.021,front-.009],[x,.021,front],.003,nickel);
      rod([x,.021,front],[x,.061,front],.003,nickel);
      rod([x,.061,front],[x,.061,front-.010],.003,nickel);
    }
    perforations(w/2+.0002,h*.85,-.066,d*.46,.032,true);
    feet(w,d,base);
  } else if(index===2 || index===5) {
    const ge=index===2;
    const lacquer=mat(ge?0x469ba0:0x9b3030,.21,.42);
    const trim=mat(ge?0xc6c4aa:0xc5a36d,.32,.45);
    const base=.006, top=h-.012, cy=(top+base)/2, bodyH=top-base;
    const exp=ge?9:4.8;
    const rim=ring(0,cy,front-.005,w*.982,bodyH*.99,exp);
    casing([[-front,w*.92,bodyH*.92,cy,exp],[-front+.013,w*.973,bodyH*.98,cy,exp],[-front+.050,w*.981,bodyH,cy,exp],[front-.057,w,bodyH,cy,exp],[front-.010,w,bodyH,cy,exp],[front-.005,w*.982,bodyH*.99,cy,exp]],lacquer,true);
    const sw=w*(ge?.858:.847),sh=bodyH*(ge?.833:.79);
    face(0,cy,sw,sh,front-.010,ge?4.3:4.9,.006,rim,ge?lacquer:trim);
    if(ge) {
      // Cream inset panel wraps the side, leaving a turquoise lower sill.
      box(w*.494,cy+.018,-.025,.004,bodyH*.68,d*.64,mat(0xc4c2a6,.15));
      for(let i=0;i<4;i++) {
        const dial=sideDial(w*.498,.086+i*.035,-.012,.010,lacquer);
        if(i===0) volumeControl=dial;
      }
      for(let i=0;i<7;i++) box(w*.501,cy+.039-i*.007,-.108,.0015,.0035,.059,charcoal);
      knob=sideDial(w*.498,.038,-.083,.020,lacquer);
      badge('GENERAL ELECTRIC',0,.023,front-.003,.069,.0065);
    } else {
      // Gold sweep molding around an enamel cabinet with the carry strap above.
      casing([[front-.040,w*1.002,bodyH*1.005,cy,exp],[front-.036,w*1.002,bodyH*1.005,cy,exp]],trim);
      box(w*.492,.113,-.024,.004,.0026,d*.71,trim);
      knob=sideDial(w*.495,.230,-.080,.024,lacquer);
      sideDial(w*.493,.139,-.013,.009,lacquer);
      volumeControl=sideDial(w*.495,.092,-.013,.010,lacquer);
      sideDial(w*.482,.040,-.045,.012,charcoal);
    }
    handle(top-.001,-.083,.092,trim,ge?nickel:rubber);
    feet(w,d,base);
  } else if(index===3) {
    // Orbital sections widen toward the middle, then neck down onto the screen.
    const pearl=mat(0xbbbeb8,.39,.38);
    const cy=.146, bodyH=.193;
    const rows=[[-.130,.026,.020],[-.120,.120,.071],[-.097,.210,.132],[-.060,.271,.171],[-.016,.298,.192],[.029,.286,.183],[.065,.258,.167],[.095,.228,.149],[.112,.207,.138]];
    casing(rows.map(([z,width,height])=>[z,width,height,cy,3.0]),pearl,true);
    const visor=ring(0,cy,.114,.206,.138,3.7);
    shell([ring(0,cy,.112,.207,.138,3),visor],rubber);
    face(-.017,cy+.001,.126,.093,.123,3.7,.006,visor,mat(0x303638,.18,.34));
    badge('PANASONIC',-.010,.090,.118,.038,.005);
    for(let i=0;i<3;i++)box(.070,.163-i*.018,.117,.015,.008,.003,charcoal);
    knob=sideDial(.151,.145,-.006,.010,nickel);
    // The volume thumbwheel emerges from the opposite end of the equatorial belt.
    volumeControl=rod([-.129,.146,.065],[-.139,.146,.069],.011,charcoal);
    const deck=[[.0,0,.11],[-.096,0,-.058],[.096,0,-.058]];
    for(const [x,,z] of deck) {
      rod([0,.027,0],[x,.0025,z],.006,nickel,.0025);
      box(x,.0015,z,.007,.003,.008,rubber);
    }
    rod([0,.020,0],[0,.058,0],.010,nickel,.020);
    for(const x of [-.020,.020]) rod([x,.232,-.030],[x+.003,.250,-.036],.0016,nickel,.0011);
    // Two stubbed telescopic aerials and the black equatorial joint split the housing.
    for(const side of [-1,1]){
      const seam=rows.slice(1,-1).map(([z,width])=>[side*width/2,cy,z]);
      for(let j=1;j<seam.length;j++) rod(seam[j-1],seam[j],.0019,rubber);
    }
    group.userData.supports=deck;
  } else if(index===4) {
    const wood=mat(0x753e28,.04,.53),rail=mat(0x533022,.05),brass=mat(0xab8d55,.31,.48);
    // Mahogany-toned molded stiles and base rails with a separate brass escutcheon.
    const base=.008, mid=(h+base)/2, cy=.296;
    const main=ring(0,mid,front-.006,w-.006,h-base-.004,20);
    casing([[-front,w*.97,h-base-.005,mid,18],[-front+.008,w,h-base,mid,18],[front-.012,w,h-base,mid,18],[front-.006,w-.006,h-base-.004,mid,20]],wood,true);
    face(0,cy,.287,.220,front-.014,3.15,.008,main,wood);
    const bezel=ring(0,cy,front-.004,.344,.272,12);
    shell([bezel,ring(0,cy,front-.014,.288,.221,3.15)],brass);
    for(const s of [-1,1]){
      box(s*.224,.253,front-.002,.019,.441,.006,rail);
      box(s*.208,.249,front-.002,.004,.426,.005,wood);
    }
    box(0,.074,front-.003,.411,.096,.006,rail);
    for(let i=0;i<8;i++) box(0,.038+i*.010,front,.403,.004,.004,wood);
    volumeControl=frontDial(-.153,.052,front,.012,brass);
    for(const x of [-.100,.086])frontDial(x,.052,front-.003,.010,brass);
    knob=frontDial(.156,.061,front-.002,.029,rail);
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;box(.156+Math.sin(a)*.024,.061+Math.cos(a)*.024,front+.0044,.0022,.0028,.001,brass);
    }
    badge('PHILCO',0,.153,front-.003,.047,.007, '#ccb184');
    feet(w,d,base);
  } else {
    const silver=mat(0xa6a8a5,.20,.48), gray=mat(0x62696b,.14),base=.009;
    const cy=.276,mid=(h+base)/2;
    casing([[-front,.398,.367,.199,16],[-front+.018,.414,.378,.202,16],[-.095,.471,.413,.220,16],[.061,.558,.470,.245,22],[.067,w,h-base,mid,25],[front-.008,.5666,.4745,.247,25]],silver,true);
    const rim=ring(0,.247,front-.008,.5666,.4745,25);
    face(0,cy,.404,.303,front-.010,14,.003,rim,silver);
    shell([ring(0,cy,front-.005,.423,.320,20),ring(0,cy,front-.010,.405,.304,14)],gray);
    for(const sign of [-1,1])perforations(sign*.251,.261,front-.007,.035,.343);
    box(0,.063,front-.006,.160,.030,.005,gray);
    box(0,.069,front-.003,.151,.002,.001,rubber);
    // The lower left key bank carries input, volume –/+, and channel down/up.
    // The volume rocker exposes both sides through one set-level action.
    box(-.232,.069,front-.005,.021,.008,.005,gray);
    volumeControl=box(-.194,.069,front-.004,.042,.008,.006,gray);
    knob=box(-.145,.069,front-.004,.042,.008,.006,gray);
    badge('–    +',-.194,.081,front-.006,.042,.007,'#424746');
    badge('Panasonic',0,.102,front-.006,.059,.008,'#3b4142');
    feet(w,d,base);
  }

  // Build embedded surface maps on metre-scaled UVs. The subdued marbling runs
  // through the brown molded rails and stiles of the Philco cabinet.
  let grainMap,paintMap;
  function finishMap(wood) {
    if(wood && grainMap) return grainMap;
    if(!wood && paintMap) return paintMap;
    const size=256,cv=document.createElement('canvas');cv.width=cv.height=size;
    const ctx=cv.getContext('2d'),img=ctx.createImageData(size,size);
    let seed=17917;
    function noise(){seed=(Math.imul(seed,1103515245)+12345)>>>0;return seed/4294967296;}
    const fibers=Array.from({length:size},noise);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const u=x*Math.PI*2/size,v=y*Math.PI*2/size;
      let n=236+noise()*16+2*Math.sin(u*4+Math.sin(v*3));
      if(wood){
        const bend=2.5*Math.sin(u)+1.2*Math.cos(u*2+v*3);
        const line=Math.sin(32*v+bend+.8*Math.cos(9*v+u));
        n=234+4*line+5*Math.sin(5*v+bend)+3*fibers[(y+Math.round(bend)+size)%size]+noise()*5;
      }
      const a=4*(y*size+x);
      img.data[a]=n;img.data[a+1]=n;img.data[a+2]=n;img.data[a+3]=255;
    }
    ctx.putImageData(img,0,0);
    const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;
    tex.anisotropy=2;
    if(wood)grainMap=tex;else paintMap=tex;
    return tex;
  }
  // Bake static pieces together per finish; the glass and tuning control stay addressable.
  knob.material=knob.material.clone();
  volumeControl.material=volumeControl.material.clone();
  volumeControl.name=name+' volume control';
  // A contrasting stroke rotates with each shaft. The local +Y face is the
  // outward cap of front and side dials alike (rod() orients the cylinder).
  const rocker=index===6;
  if (!rocker) {
    const radius=volumeControl.geometry.parameters.radiusTop;
    const cap=volumeControl.geometry.parameters.height/2;
    const indicator=new T.Mesh(new T.BoxGeometry(radius*.18,.0008,radius*.67),mat(0xd8c9a2,.12).clone());
    indicator.position.set(0,cap+.00025,radius*.46);
    volumeControl.add(indicator);
  }
  const restRotation=volumeControl.quaternion.clone(), restZ=volumeControl.position.z;
  const axis=new T.Vector3(0,1,0), rotation=new T.Quaternion();
  function setVolumeState(active,level) {
    if(rocker) volumeControl.position.z=restZ-(active?.001:0);
    else volumeControl.quaternion.copy(restRotation).multiply(rotation.setFromAxisAngle(axis,-.7+(active?2.8*level:0)));
  }
  setVolumeState(false,0);
  group.updateMatrixWorld(true);
  const batches=new Map();
  for(const part of [...group.children]) {
    if(part===screen||part===knob||part===volumeControl) continue;
    const geo=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();
    geo.applyMatrix4(part.matrix);
    if (!part.material.transparent) {
      const isWood=index===4 && [0x753e28,0x533022].includes(part.material.color.getHex());
      if (!part.material.map) part.material.map=finishMap(isWood);
      const pos=geo.attributes.position, norms=geo.attributes.normal, coords=geo.attributes.uv;
      const colors=new Float32Array(pos.count*3);
      for(let i=0;i<pos.count;i++){
        const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
        const nx=Math.abs(norms.getX(i)),ny=Math.abs(norms.getY(i));
        const side=nx>ny && nx>Math.abs(norms.getZ(i));
        let u=side?y:x, v=side?z:(ny>.65?z:y);
        if(isWood && !side && Math.abs(x)>.20 && ny<.5) [u,v]=[v,u];
        coords.setXY(i,u,v);
        // Sparse neutral discoloration is strongest on the upper horizontal metal.
        const deposit=.09*Math.max(0,norms.getY(i))*(.6+.4*Math.sin(x*32+z*15));
        const sediment=.08*(1-Math.min(1,Math.max(0,y/.045)));
        colors.set([1-deposit*.7-sediment,1-deposit*.43-sediment*.8,1-deposit-sediment*1.1],i*3);
      }
      geo.setAttribute('color',new T.BufferAttribute(colors,3));
      part.material.vertexColors=true;
    }
    const list=batches.get(part.material)||[];
    list.push(geo);batches.set(part.material,list);
    part.geometry.dispose();group.remove(part);
  }
  for(const [material,geos] of batches) {
    const combined=mergeGeometries(geos);
    const body=mesh(combined,material);body.name=name+' cabinet';
    for(const geo of geos)geo.dispose();
  }
  knob.name=name+' tuning control';
  return {group,screen,knob,volumeControl,setVolumeState};
}
