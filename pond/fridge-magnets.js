import {badgeOutline,letterOutlines} from './fridge-forms.js';

// The original four field magnets are from the studio-room prototype.
// The separate alphabet is modeled after Quercetti 05461. See fridge-magnets-reference.md.
export function buildFridgeMagnets(T,door,uniforms) {
  const face=.1025, v=(x,y,z)=>new T.Vector3(x,y,z);
  const localToWorld=p=>door.localToWorld(p);
  const shader=new T.ShaderMaterial({
    uniforms,
    vertexShader:`
      varying vec3 n,pos,base;
      void main(){vec4 q=vec4(position,1.); n=normal; base=vec3(1.);
        #ifdef USE_INSTANCING
          q=instanceMatrix*q; n=normalize(mat3(instanceMatrix)*n);
        #endif
        #ifdef USE_INSTANCING_COLOR
          base=instanceColor;
        #endif
        pos=q.xyz;gl_Position=projectionMatrix*modelViewMatrix*q;
      }`,
    fragmentShader:`uniform float uDay,uEl;varying vec3 n,pos,base;
      void main(){vec3 N=normalize(n);float day=smoothstep(-.18,.22,uEl);
        vec3 lamp=normalize(vec3(2.06,1.71,.98)-pos);
        float wrap=.56+.30*max(0.,dot(lamp,N))+.22*day;
        float gloss=pow(max(dot(N,normalize(vec3(-.24,.46,.92))),0.),14.);
        float glint=pow(max(dot(N,normalize(vec3(.65,.65,.15))),0.),22.);
        vec3 lit=base*vec3(1.,.958,.9)*wrap+vec3(.27,.25,.21)*(gloss+glint*.78);
        gl_FragColor=vec4(lit,1.);}`
  });
  const chrome=new T.ShaderMaterial({uniforms,
    vertexShader:`varying vec3 nw,viewRay,lp;void main(){
      vec4 w=modelMatrix*vec4(position,1.);nw=normalize(mat3(modelMatrix)*normal);
      lp=position;viewRay=normalize(w.xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform float uDay;varying vec3 nw,viewRay,lp;
      void main(){vec3 r=reflect(normalize(viewRay),normalize(nw));
        float band=smoothstep(-.10,.16,r.y+.50*r.x+.40*lp.y);
        float window=exp(-pow((r.y-.31*r.x+.16)*5.0,2.));
        vec3 c=mix(vec3(.22,.246,.244),vec3(.86,.87,.86),band)+vec3(.33,.30,.24)*window;
        gl_FragColor=vec4(c*(.74+.26*uDay),1.);}`});
  function relief(contours,depth,bevel,scale=1){
    const path=new T.ShapePath();
    for(const ring of contours){
      for(let i=0;i<ring.length;i+=2){
        const x=ring[i]*.001*scale,y=ring[i+1]*.001*scale;
        if(!i)path.moveTo(x,y);else path.lineTo(x,y);
      }
      path.currentPath.closePath();
    }
    return new T.ExtrudeGeometry(path.toShapes(false),{
      depth,bevelEnabled:true,bevelSegments:2,bevelSize:bevel,bevelThickness:bevel,curveSegments:4
    });
  }
  const badge=new T.Mesh(relief(badgeOutline,.00095,.00028,.12),chrome);
  badge.position.set(-.060,1.455-.12*498/1165/2,face+.00028);
  badge.name='Original LaB chrome badge';door.add(badge);
  const shadowMaterial=new T.ShaderMaterial({
    transparent:true,opacity:.28,depthWrite:false,
    vertexShader:`void main(){vec4 p=instanceMatrix*vec4(position,1.);
      float h=max(0.,p.z-.1025);p.xy-=vec2(.62,.78)*h;p.z=.10257+h*.002;
      gl_Position=projectionMatrix*modelViewMatrix*p;}`,
    fragmentShader:`void main(){gl_FragColor=vec4(.055,.047,.036,.32);}`
  });
  const pickMeshes=[],keepers=[],props=[];
  const finishes={
    red:[.79,.15,.11],amber:[.98,.67,.12],brass:[.76,.60,.24],blue:[.16,.43,.77],brown:[.18,.13,.09],
    pinned:[.97,.75,.31]
  };
  const material=rgb=>new T.ShaderMaterial({uniforms:{...uniforms,colour:{value:new T.Vector3(...rgb)}},
    vertexShader:`varying vec3 n;void main(){n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform vec3 colour;uniform float uDay;varying vec3 n;void main(){
      float directional=max(dot(normalize(n),normalize(vec3(.32,.67,.9))),0.);
      vec3 c=colour*(.48+.18*uDay+.32*directional)+vec3(.19,.17,.14)*pow(directional,16.);
      gl_FragColor=vec4(c,1.);}`});
  const mats=Object.fromEntries(Object.entries(finishes).map(([k,c])=>[k,material(c)]));
  // Same primitive dimensions and colour assignments as studio.js makeProp().
  const fields=[['place','red'],['character','amber'],['object','brass'],['twist','blue']];
  fields.forEach(([field,finish],i)=>{
    const g=new T.Group();g.position.set(-.186+.124*i,1.047,face);
    g.scale.setScalar(1.18);g.rotation.z=[-.044,.035,-.094,.072][i];g.name=field+' magnet';door.add(g);
    const part=(geometry,x,y,z,mat=mats[finish])=>{
      const mesh=new T.Mesh(geometry,mat);mesh.position.set(x,y,z);
      mesh.userData.field=field;g.add(mesh);pickMeshes.push(mesh);return mesh;
    };
    if(field==='place'){
      part(new T.BoxGeometry(.046,.03,.016),0,-.008,.008);
      part(new T.ConeGeometry(.036,.024,4),0,.019,.008).rotation.y=Math.PI/4;
      part(new T.BoxGeometry(.01,.016,.004),.008,-.015,.017,mats.brown);
    }else if(field==='character'){
      part(new T.SphereGeometry(.011,16,12),0,.02,.01);
      part(new T.CylinderGeometry(.009,.016,.028,16),0,-.006,.01);
    }else if(field==='object'){
      part(new T.TorusGeometry(.012,.004,10,24),-.022,0,.006);
      part(new T.BoxGeometry(.04,.006,.006),.01,0,.006);
      part(new T.BoxGeometry(.006,.01,.006),.024,-.007,.006);
      part(new T.BoxGeometry(.006,.008,.006),.014,-.006,.006);
    }else{
      const star=new T.Shape();
      for(let j=0;j<10;j++){const a=Math.PI/2+j*Math.PI/5,r=j%2?.010:.024;
        if(j)star.lineTo(Math.cos(a)*r,Math.sin(a)*r);else star.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
      star.closePath();
      part(new T.ExtrudeGeometry(star,{depth:.009,bevelEnabled:true,bevelSize:.0015,bevelThickness:.0015,bevelSegments:1}),0,0,.0015);
    }
    // Preserve the source sculpture's proportions and seat its rear magnet on the enamel.
    let back=Infinity;
    for(const part of g.children){
      part.updateMatrix();part.geometry.computeBoundingBox();
      back=Math.min(back,part.geometry.boundingBox.clone().applyMatrix4(part.matrix).min.z);
    }
    for(const part of g.children)part.position.z+=.0012-back;
    const seat={place:[0,-.008,0],character:[0,-.006,-.006],object:[.010,0,.003],twist:[0,0,0]}[field];
    const depth=Math.max(.0012,seat[2]+.0012-back+.001);
    const pad=part(new T.CylinderGeometry(field==='object'?.0026:.007,field==='object'?.0026:.007,depth,12),
      seat[0],seat[1],depth/2,mats.brown);
    pad.rotation.x=Math.PI/2;
    props.push({g,field});
  });
  const palette=[
    [.88,.16,.12],[.99,.73,.12],[.22,.69,.26],[.16,.44,.91],[.98,.43,.095],[.62,.32,.80]
  ];
  const glyphs=new Map(), banks=new Map(), pen=new T.Object3D();
  let words=[],letters=[],lastKey='',lastField=null,lastText='',started=-50,moving=false;
  function form(char){
    if(!glyphs.has(char)){
      const rings=letterOutlines[char]||letterOutlines['?'];
      const geometry=relief(rings,.103,.023);
      geometry.computeBoundingBox();
      const bounds=geometry.boundingBox;
      geometry.translate(-bounds.min.x,-.5,.023); // bevel underside rests at Z=0
      glyphs.set(char,{geometry,width:bounds.max.x-bounds.min.x});
    }
    return glyphs.get(char);
  }
  const clean=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/…/g,'...');
  const unitWidth=text=>[...text].reduce((sum,char,i)=>sum+form(char).width+(i?.14:0),0);
  function fit(tokens){
    const fieldWidth=.515,fieldHeight=.267;
    const w=tokens.map(t=>unitWidth(t.display));
    let size=Math.min(.048,fieldWidth/Math.max(...w,1));
    for(let pass=0;pass<35;pass++){
      const rows=[];let row=[],used=0;
      for(let i=0;i<tokens.length;i++){
        const width=w[i]*size;
        if(row.length && used+size*.60+width>fieldWidth){rows.push({row,used});row=[];used=0;}
        if(row.length)used+=size*.60;
        row.push({i,x:used,width});used+=width;
      }
      if(row.length)rows.push({row,used});
      if((rows.length-1)*size*1.46+size<=fieldHeight||pass===34){
        return rows.flatMap(({row,used},r)=>row.map(o=>({...o,x:o.x-used/2,y:1.366-r*size*1.46,size})));
      }
      size*=.905;
    }
  }
  function occupied(w){
    return {i:w.index,x:w.left,y:w.y,size:w.h,width:w.width};
  }
  function fitAroundPins(tokens,locks,natural){
    const fixed=new Map(locks.map(w=>[w.index,occupied(w)]));
    const unit=tokens.map(t=>unitWidth(t.display));
    const byHeight=[...new Set(locks.map(w=>w.y))].sort((a,b)=>b-a);
    const top=1.398,bottom=1.095,edge=.2575;
    function freeSpans(h){
      // Keep a baseline alongside each locked row. Fill the vertical space
      // between those rows with additional non-overlapping lines.
      const step=h*1.48,levels=[];
      for(const y of byHeight){
        if(!levels.length||levels.at(-1)-y>=step-1e-8)levels.push(y);
      }
      const rows=[];
      let ceiling=top-h*.63;
      for(const base of levels){
        for(let y=ceiling;y>=base+step-1e-8;y-=step)rows.push(y);
        rows.push(base);ceiling=base-step;
      }
      for(let y=ceiling;y>=bottom+h*.63;y-=step)rows.push(y);
      const spans=[];
      for(const y of rows){
        const obstacles=locks.filter(w=>Math.abs(w.y-y)<.63*(w.h+h)+.003)
          .map(w=>[w.left-.004-h*.22,w.left+w.width+.004+h*.22]).sort((a,b)=>a[0]-b[0]);
        let left=-edge;
        for(const [a,b] of obstacles){
          if(a>left)spans.push({left,right:Math.min(a,edge),y});
          left=Math.max(left,b);
        }
        if(left<edge)spans.push({left,right:edge,y});
      }
      return spans;
    }
    function inOrder(slot,i,h){
      return locks.every(w=>{
        const sameRow=Math.abs(slot.y-w.y)<.63*(w.h+h)+.003;
        const before=sameRow ? slot.x+slot.width<=w.left : slot.y>w.y;
        return i<w.index ? before : !before;
      });
    }
    function pack(h,ordered){
      const plan=freeSpans(h),out=[];let cursor=0;
      for(let i=0;i<tokens.length;i++){
        if(fixed.has(i)){out.push(fixed.get(i));continue;}
        const width=unit[i]*h;
        while(cursor<plan.length){
          const line=plan[cursor],slot={i,x:line.left,y:line.y,size:h,width};
          if(slot.x+width<=line.right+1e-9 && (!ordered||inOrder(slot,i,h))){
            out.push(slot);line.left+=width+h*.50;break;
          }
          cursor++;
        }
        if(cursor===plan.length)return null;
      }
      return out;
    }
    const preferred=Math.min(natural[0].size,...locks.map(w=>w.h));
    // Keep the sentence in reading order whenever that leaves practical letter sizes.
    for(let h=preferred;h>=preferred*.67;h*=.90){
      const plan=pack(h,true);if(plan)return plan;
    }
    // A word fixed to the top-left corner can leave no earlier reading space.
    // Keep every free word and fill the remaining spans in their original order.
    let h=preferred;
    for(let pass=0;pass<32;pass++,h*=.86){
      const plan=pack(h,false);if(plan)return plan;
    }
    // A nearly filled door can leave only narrow, disjoint gaps. The small
    // clear band below the manufacturer's badge still fits a final line.
    const bottomOfBand=Math.max(top,...locks.map(w=>w.y+w.h*.63));
    const free=tokens.filter(t=>!fixed.has(t.index));
    const total=free.reduce((sum,t)=>sum+unit[t.index]+.5,0);
    h=Math.min(edge*2/total,(1.426-bottomOfBand)/1.5);
    let left=-total*h/2;
    return tokens.map(t=>{
      if(fixed.has(t.index))return fixed.get(t.index);
      const slot={i:t.index,x:left,y:bottomOfBand+h*.76,size:h,width:unit[t.index]*h};
      left+=slot.width+.5*h;return slot;
    });
  }
  const pinGeo=new T.BoxGeometry(1,1,1),pinCap=new T.SphereGeometry(1,8,6);
  const pinGroup=new T.Group();pinGroup.name='Brass word keepers';door.add(pinGroup);
  function addPins(pinned){
    for(const m of keepers)pinGroup.remove(m);keepers.length=0;
    for(const w of words)if(pinned.has(w.index)){
      const rail=new T.Mesh(pinGeo,mats.pinned);
      rail.scale.set(w.width+.003,.0023,.0021);
      rail.position.set(w.x,w.y-w.h*.61,face+.00105);
      pinGroup.add(rail);keepers.push(rail);
      for(const dir of [-1,1]){
        const cap=new T.Mesh(pinCap,mats.brass);
        cap.scale.set(.0024,.0024,.0015);
        cap.position.copy(rail.position);cap.position.x+=dir*w.width*.48;cap.position.z+=.0012;
        pinGroup.add(cap);keepers.push(cap);
      }
    }
  }
  function allocate(counts){
    for(const bank of banks.values()){bank.mesh.count=0;bank.shadow.count=0;bank.ids.length=0;}
    for(const [char,count] of counts){
      let bank=banks.get(char);
      if(!bank||bank.capacity<count){
        if(bank){
          door.remove(bank.mesh,bank.shadow);
          const i=pickMeshes.indexOf(bank.mesh);if(i>=0)pickMeshes.splice(i,1);
          bank.mesh.dispose();bank.shadow.dispose();
        }
        const capacity=Math.max(count,bank?.capacity*2||4);
        const mesh=new T.InstancedMesh(form(char).geometry,shader,capacity);
        mesh.name='Molded '+char+' magnets';mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
        mesh.boundingSphere=new T.Sphere(v(0,1.23,.13),.46);mesh.count=0;
        const shadow=new T.InstancedMesh(form(char).geometry,shadowMaterial,capacity);
        shadow.instanceMatrix=mesh.instanceMatrix;shadow.count=0;shadow.boundingSphere=mesh.boundingSphere;
        shadow.name=char+' contact shade';
        bank={mesh,shadow,capacity,ids:[]};mesh.userData.wordIndices=bank.ids;banks.set(char,bank);door.add(mesh,shadow);pickMeshes.push(mesh);
      }
    }
  }
  function place(t){
    for(const l of letters){
      const travel=l.held?0:1-Math.min(1,Math.max(0,(t-l.delay)/.47));
      const ease=travel*travel;
      pen.position.set(l.x+l.dx*ease,l.y+l.dy*ease,face+ease*l.lift);
      pen.rotation.set(ease*l.tilt,ease*l.tilt*.55,l.rz+ease*l.spin);
      pen.scale.setScalar(l.size);pen.updateMatrix();
      const bank=banks.get(l.char);bank.mesh.setMatrixAt(l.instance,pen.matrix);
    }
    for(const bank of banks.values())if(bank.mesh.count)bank.mesh.instanceMatrix.needsUpdate=true;
  }
  function update(){
    if(!moving)return;
    const t=uniforms.uT.value-started;place(t);
    if(t>=.72)moving=false;
  }
  function setStory(text,label='',animate=true,pinnedIndices=[]){
    if(typeof text!=='string'||!text.trim())return;
    const pinSet=new Set(pinnedIndices||[]);
    const key=JSON.stringify([text,label,[...pinSet].sort((a,b)=>a-b)]);
    if(key===lastKey&&!animate)return;
    lastKey=key;
    const tokens=text.trim().split(/\s+/).map((s,index)=>({text:s,display:clean(s),index}));
    const sameField=label===lastField, sameLine=sameField&&text===lastText;
    const locks=sameField?words.filter(w=>pinSet.has(w.index)&&tokens[w.index]?.text===w.text):[];
    let layout;
    if(sameLine)layout=words.map(occupied);
    else{
      const natural=fit(tokens);
      layout=locks.length?fitAroundPins(tokens,locks,natural):natural;
    }
    lastField=label;lastText=text;
    const counts=new Map();words=[];letters=[];
    for(const slot of layout){
      const token=tokens[slot.i],h=slot.size;
      const id=token.index,held=pinSet.has(id);
      const word={index:id,text:token.text,left:slot.x,x:slot.x+slot.width/2,y:slot.y,h,width:slot.width};
      words.push(word);
      let x=slot.x;
      const forms=[...token.display];
      const locations=forms.map(c=>{const start=x;x+=(form(c).width+.14)*h;return start;});
      const spinOffset=forms.length>1?1+(id*7+forms.length)%Math.max(1,forms.length-1):0;
      forms.forEach((char,j)=>{
        const width=form(char).width*h;
        const size=h*(1+.008*Math.sin(j*4.5+id)),k=j+id*19;
        const slot=counts.get(char)||0;counts.set(char,slot+1);
        // Physical letters exchange places within a word, arc away and settle flat.
        letters.push({char,id,ordinal:j,instance:slot,x:locations[j],y:word.y+.00065*Math.sin(k*9.43),size,
          rz:.024*Math.sin(k*2.3),held,dx:locations[(j+spinOffset)%forms.length]-locations[j]+.14*width*Math.sin(k),
          dy:.034*Math.sin(k*6.29+id*.64),lift:.013+.022*(.5+.5*Math.cos(k*1.7)),
          spin:.50*Math.sin(k*2.4),tilt:.22*Math.cos(k*1.8),delay:(k*.137%1)*.18});
      });
    }
    allocate(counts);
    for(const item of letters){
      const bank=banks.get(item.char);bank.ids[item.instance]=item.id;bank.mesh.count++;bank.shadow.count++;
      const color=palette[(item.char.charCodeAt(0)*7+item.id*3+item.ordinal)%palette.length];
      bank.mesh.setColorAt(item.instance,new T.Color().setRGB(...color));
    }
    for(const b of banks.values())if(b.mesh.count&&b.mesh.instanceColor)b.mesh.instanceColor.needsUpdate=true;
    addPins(pinSet);moving=!!animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
    started=uniforms.uT.value;place(moving?0:1);
  }
  function wordAnchors(){
    return words.map(w=>{
      const point=(x,y)=>localToWorld(v(x,y,face+.009));
      const l=w.x-w.width/2,r=w.x+w.width/2,t=w.y+w.h*.61,b=w.y-w.h*.62;
      return {index:w.index,text:w.text,point:point(w.x,w.y),left:point(l,w.y),right:point(r,w.y),
        corners:[point(l,t),point(r,t),point(r,b),point(l,b)]};
    });
  }
  function controlCorners(portrait=window.innerWidth<window.innerHeight){
    const bottom=portrait?.678:.757;
    return [[-.264,.913],[.264,.913],[.264,bottom],[-.264,bottom]].map(([x,y])=>localToWorld(v(x,y,.112)));
  }
  function fieldAnchors(){
    return props.map(({field,g})=>({field,point:g.localToWorld(v(0,0,.015))}));
  }
  function hit(intersection){
    const object=intersection.object;
    if(object.userData.field)return 'field:'+object.userData.field;
    const ids=object.userData.wordIndices;
    if(ids&&intersection.instanceId!==undefined)return 'word:'+ids[intersection.instanceId];
    const p=door.worldToLocal(intersection.point.clone());
    if(Math.abs(p.z-face)>.020)return null;
    for(const w of words)if(Math.abs(p.x-w.x)<w.width/2+.002 && Math.abs(p.y-w.y)<w.h*.61)return 'word:'+w.index;
    for(const {field,g} of props)if(Math.abs(p.x-g.position.x)<.035 && Math.abs(p.y-g.position.y)<.035)return 'field:'+field;
    return null;
  }
  setStory('The fridge quit at lunch.','',false);
  return {setStory,update,wordAnchors,controlCorners,fieldAnchors,pickMeshes,hit};
}
