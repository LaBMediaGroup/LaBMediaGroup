// The refrigerator uses the signed production loft export. See fridge-magnets-reference.md.
import {createNotebookTurn} from './notebook-turn.js';
import {buildFridgeMagnets} from './fridge-magnets.js?v=16';
import {fridgeStudy} from './fridge-study.js';

export function buildFieldBench({THREE:T, uniforms:U, group, floor, placement, box, add, cylinder}) {
  const V = (x,y,z) => new T.Vector3(x,y,z);
  const timber=[.54,.38,.23], steel=[.105,.11,.10], nickel=[.50,.51,.47];
  const paper=[.76,.73,.64], cover=[.40,.275,.15], wood=0, metal=1, paperKind=5;
  const desktop=floor+.816;
  const wall=placement(1.51,desktop,-.10,0,-Math.PI/2);
  const fridge=placement(-.73,floor+.002,-.51), light=V(1.33,1.98,.54);
  const point=(a,b,c,frame)=>V(a,b,c).applyMatrix4(frame);
  function rail(a,b,width,depth,tint,kind,frame){
    const start=V(...a),end=V(...b),dir=end.clone().sub(start);
    const transform=new T.Matrix4().compose(start.lerp(end,.5),new T.Quaternion().setFromUnitVectors(V(0,1,0),dir.clone().normalize()),V(1,1,1));
    add(new T.BoxGeometry(width,dir.length(),depth),transform.premultiply(frame),tint,kind,'y');
  }
  // Steel channels, lock braces, hinge pins, fasteners and a ledger secured to framing.
  box(0,-.109,.024,1.219,.219,.064,timber,wood,'x',wall,.79);
  for(const x of [-.404,.404]){
    box(x,-.117,.066,.041,.197,.014,steel,metal,'y',wall);
    box(x,-.041,.239,.038,.019,.359,steel,metal,'z',wall);
    rail([x,-.19,.076],[x,-.041,.388],.017,.013,steel,metal,wall);
    for(const y of [-.184,-.077]) cylinder(x,y,.077,.005,.005,.012,nickel,metal,wall,Math.PI/2);
    for(const [y,z] of [[-.18,.081],[-.040,.383]]) {
      const pivot=placement(x,y,z,0,0,Math.PI/2,wall);
      cylinder(0,0,0,.0065,.0065,.046,nickel,metal,pivot);
    }
  }
  // The top is laminated from long hardwood staves with a continuous front edge.
  for(let j=0;j<9;j++) box(0,-.015,.044+(j+.5)*.508/9,1.219,.030,.508/9+.0002,timber,wood,'x',wall);
  const book=placement(-.012,.0003,.317,0,.045,0,wall);
  const cards=placement(-.31,.0002,.236,0,-.177,0,wall);
  for(let i=0;i<4;i++) box(i*.0014,i*.00048+.00025,0,.127,.00048,.0762,paper,paperKind,'x',cards);
  // A sharpened, used No. 2 pencil lies flat on one hexagonal face beside the book.
  const pencil=placement(.143,.0035,.330,Math.PI/2,-.21,0,wall);
  function pencilPart(y,r1,r2,h,tint,segments,kind) {
    const g=new T.CylinderGeometry(r1,r2,h,segments);
    add(g,placement(0,y,0,0,Math.PI/6,0,pencil),tint,kind,'y');
  }
  pencilPart(0,.0037,.0037,.128,timber,6,wood);
  pencilPart(.069,.00375,.00375,.010,nickel,12,metal);
  pencilPart(.077,.00345,.00345,.006,[.63,.59,.48],12,paperKind);
  pencilPart(-.069,.0037,.00085,.010,[.69,.52,.33],6,wood);
  pencilPart(-.076,.00085,0,.004,[.05,.05,.05],8,metal);

  // An identical caged practical is mounted inside the gable beside the window.
  const fixture=placement(1.51,light.y,light.z,0,-Math.PI/2);
  cylinder(0,.08,.035,.054,.054,.062,nickel,metal,fixture,Math.PI/2);
  box(0,.09,.097,.036,.031,.145,nickel,metal,'z',fixture);
  cylinder(0,.075,.18,.043,.051,.038,nickel,metal,fixture);
  const lampFrame=placement(0,0,.18,0,0,0,fixture);
  const globe=new T.LatheGeometry([[.001,-.077],[.029,-.072],[.039,-.054],[.040,.058],[.001,.060]].map(([a,b])=>new T.Vector2(a,b)),16);
  add(globe,lampFrame,[.88,.78,.61],4);
  for(const yy of [-.064,-.027,.013,.052]) add(new T.TorusGeometry(.047,.003,5,16),placement(0,yy,0,Math.PI/2,0,0,lampFrame),nickel,metal);
  for(let i=0;i<6;i++) cylinder(.047*Math.sin(i*Math.PI/3),-.004,.047*Math.cos(i*Math.PI/3),.003,.003,.141,nickel,metal,lampFrame);

  const decode = raw => Uint8Array.from(atob(raw),ch=>ch.charCodeAt(0));
  const vertices = new Int16Array(decode(fridgeStudy.vertices).buffer);
  const indices = new Uint16Array(decode(fridgeStudy.indices).buffer);
  const pos=[], norm=[], tint=[], finish=[];
  // Source material values have been transformed to display space for this site's custom shaders.
  const finishes=[[.495,.642,.644],[.065,.075,.071],[.78,.80,.79]];
  for(let i=0;i<vertices.length;i+=7){
    pos.push(...[vertices[i],vertices[i+1],vertices[i+2]].map(v=>v/16000));
    norm.push(...[vertices[i+3],vertices[i+4],vertices[i+5]].map(v=>v/32767));
    const k=vertices[i+6];tint.push(...finishes[k]);finish.push(k);
  }
  const original=new T.BufferGeometry();
  original.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  original.setAttribute('normal',new T.Float32BufferAttribute(norm,3));
  original.setAttribute('color',new T.Float32BufferAttribute(tint,3));
  original.setAttribute('finish',new T.Float32BufferAttribute(finish,1));
  original.setIndex(new T.BufferAttribute(indices,1));
  const fridgeFrame=new T.Group(); fridgeFrame.name='Original refrigerator, story magnets';
  fridgeFrame.applyMatrix4(fridge);group.add(fridgeFrame);
  const shaderLight=`
    uniform float uEl,uDay;
    uniform vec3 uHor;
    vec3 indoor(vec3 local,vec3 n){
      vec3 toLamp=vec3(1.33,1.98,.54)-local;
      float strength=1./(.62+dot(toLamp,toLamp));
      float incidence=max(dot(normalize(toLamp),n),0.);
      float day=smoothstep(-.20,.20,uEl);
      float bounce=.29+.36*day;
      return mix(vec3(.79,.76,.69),uHor*.27+vec3(.85),day)*bounce
        +vec3(1.,.78,.52)*(.13+.93*strength*(.28+.72*incidence));
    }`;
  const shellMat=new T.ShaderMaterial({uniforms:U,vertexColors:true,
    vertexShader:`attribute float finish; varying vec3 v,n,base,eyeVec;varying float f;
      void main(){v=position;n=normal;base=color;f=finish;
        eyeVec=transpose(mat3(modelMatrix))*(cameraPosition-(modelMatrix*vec4(position,1.)).xyz);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:shaderLight+`varying vec3 v,n,base,eyeVec;varying float f;
      void main(){vec3 N=normalize(n),P=v+vec3(-.73,.275,-.51);
        vec3 lit=base*indoor(P,N);float spec=clamp(1.-abs(N.y-.48-N.x*.24)*5.4,0.,1.);
        lit+=mix(vec3(.034,.031,.023),vec3(.29,.25,.18),step(1.5,f))*spec;
        vec3 r=reflect(-normalize(eyeVec),N);
        vec2 opening=P.xy+r.xy*(1.219-P.z)/max(.01,r.z);
        float outdoor=smoothstep(-1.34,-1.18,opening.x)*(1.-smoothstep(.24,.36,opening.x))
          *smoothstep(.24,.33,opening.y)*(1.-smoothstep(2.07,2.19,opening.y))*smoothstep(.05,.24,r.z);
        if(f>1.5){
          float silver=smoothstep(-.32,.09,r.y+.22*r.x);
          float shine=exp(-pow((r.y+.38*r.x-.14)*7.,2.));
          lit=mix(vec3(.15,.16,.15),vec3(.66,.67,.63),silver)+vec3(.24,.25,.24)*outdoor;
          lit+=vec3(.43,.40,.33)*shine;lit*=.70+.30*uDay;
        }
        if(f<.5){
          lit+=vec3(.082,.096,.118)*outdoor*(.35+.65*uDay);
          float edge=pow(1.-abs(N.z),1.6);
          float window=.5+.5*tanh(5.*(v.x+.05)+.80*(v.y-1.));
          lit*=.93+.06*window;
          lit+=vec3(.07,.082,.072)*(edge+window*(.55+.45*smoothstep(.55,1.45,v.y)))*(.55+.45*uDay);
        }
        gl_FragColor=vec4(lit,1.);}`});
  const shell=new T.Mesh(original,shellMat);shell.name='Evaluated enamel, gasket and nickel pull';fridgeFrame.add(shell);

  function makeCanvas(width,height){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const texture=new T.CanvasTexture(canvas);texture.anisotropy=4;
    return {ctx:canvas.getContext('2d'),texture};
  }
  const notebookInk=makeCanvas(1024,768);
  const stampInk=makeCanvas(512,256);
  const bookFrame=new T.Group();bookFrame.applyMatrix4(book);group.add(bookFrame);
  const cardFrame=new T.Group();cardFrame.applyMatrix4(cards);group.add(cardFrame);
  function paperMaterial(texture,transform){
    return new T.ShaderMaterial({uniforms:{...U,ink:{value:texture},localFrame:{value:transform}},
      vertexShader:`uniform mat4 localFrame;varying vec2 tc;varying vec3 p,n;void main(){
        tc=uv;p=(localFrame*vec4(position,1.)).xyz;n=mat3(localFrame)*normal;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:shaderLight+`uniform sampler2D ink;varying vec2 tc;varying vec3 p,n;void main(){
        vec3 base=texture2D(ink,tc).rgb;gl_FragColor=vec4(base*min(indoor(p,normalize(n)),vec3(.95,.93,.88)),1.);}`,
      side:T.DoubleSide});
  }
  function spread(width,depth,lift,thickness,radius,slices=16){
    const vertices=[],uv=[],indices=[];
    const across=[0,.006,.018,.038,.065,.16,.34,.5,.66,.84,.935,.962,.982,.994,1];
    const bands=across.length-1;
    for(let j=0;j<=bands;j++)for(let i=0;i<=slices;i++){
      const u=i/slices,v=across[j];
      const edge=Math.abs((v-.5)*depth),d=Math.max(0,edge-(depth/2-radius));
      const trim=radius-Math.sqrt(Math.max(0,radius*radius-d*d));
      const x=(u-.5)*(width-2*trim),t=Math.min(1,Math.abs(x)/.09);
      const y=thickness+lift*(.11+Math.sin(Math.PI*t)**1.4*.87);
      vertices.push(x,y,(.5-v)*depth);uv.push(u,v);
    }
    for(let j=0;j<bands;j++)for(let i=0;i<slices;i++){
      const a=j*(slices+1)+i,b=a+1,d=a+slices+1;
      indices.push(a,b,d,b,d+1,d);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  add(spread(.182,.144,.0038,.0006,.01),book,cover,paperKind,'x');
  for(let k=0;k<4;k++) add(spread(.178-k*.00016,.140-k*.00009,.006,.001+.00055*k,.0095),book,paper,paperKind,'x');
  const pages=new T.Mesh(spread(.1772,.1396,.006,.0035,.0095,32),paperMaterial(notebookInk.texture,book));
  pages.name='Open, inked resource notebook';bookFrame.add(pages);
  for(const z of [-.052,0,.052]) cylinder(0,.00448,z,.00037,.00037,.0065,nickel,metal,book,Math.PI/2);
  const cardGeo=new T.PlaneGeometry(.127,.0762).rotateX(-Math.PI/2);
  cardGeo.translate(.0042,.00220,0);
  const inkCard=new T.Mesh(cardGeo,paperMaterial(stampInk.texture,cards));cardFrame.add(inkCard);
  const cardCtx=stampInk.ctx;
  cardCtx.fillStyle='#e9dfc8';cardCtx.fillRect(0,0,512,256);
  cardCtx.strokeStyle='#a0acac';
  for(let i=1;i<9;i++){cardCtx.beginPath();cardCtx.moveTo(0,32+i*24);cardCtx.lineTo(512,32+i*24);cardCtx.stroke();}
  cardCtx.fillStyle='#676459';cardCtx.font='italic 27px Georgia';cardCtx.fillText('pond / sound notes',26,66);cardCtx.font='italic 20px Georgia';
  cardCtx.fillText('reed line at dusk',34,120);cardCtx.fillText('pick up room tone',39,167);
  stampInk.texture.needsUpdate=true;

  function wrap(ctx,text,maxWidth){
    const lines=[];let line='';
    for(const word of String(text).trim().split(/\s+/)){
      if(line && ctx.measureText(line+' '+word).width>maxWidth){lines.push(line);line='';}
      line+=(line?' ':'')+word;
    }
    if(line)lines.push(line);return lines;
  }
  function fitText(ctx,text,x,y,width,height,size,minimum){
    let lines,lineHeight;
    for(;size>=minimum;size-=2){
      ctx.font='italic '+size+'px Georgia';lineHeight=Math.round(size*1.14);
      lines=wrap(ctx,text,width);
      if(lines.length*lineHeight<=height || size<minimum+2)break;
    }
    const capacity=Math.max(1,Math.floor(height/lineHeight));
    if(lines.length>capacity){
      lines=lines.slice(0,capacity);
      let end=lines[capacity-1];
      while(end.length && ctx.measureText(end+'…').width>width)end=end.slice(0,-1);
      lines[capacity-1]=end+'…';
    }
    lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight,width));
  }
  function paintBook(ctx,title,category,detail){
    ctx.fillStyle='#f5edd9';ctx.fillRect(0,0,1024,768);
    ctx.strokeStyle='#d7c9ae';ctx.lineWidth=1.4;
    for(let x=14;x<1024;x+=27){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,768);ctx.stroke();}
    for(let y=15;y<768;y+=26){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1024,y);ctx.stroke();}
    const crease=ctx.createLinearGradient(475,0,551,0);
    crease.addColorStop(0,'#43392800');crease.addColorStop(.5,'#43392835');crease.addColorStop(1,'#43392800');
    ctx.fillStyle=crease;ctx.fillRect(475,0,76,768);
    if(category==='Ask the LaB')return; // Search and response are live ink controls on these pages.
    ctx.fillStyle='#834434';ctx.font='600 27px Georgia';ctx.fillText('FIELD INDEX',38,118);
    ctx.fillStyle='#6e604f';fitText(ctx,category||'Production resources',39,169,418,70,31,24);
    ctx.strokeStyle='#9a8d77';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(39,208);ctx.lineTo(421,207);ctx.stroke();
    ctx.fillStyle='#38382e';fitText(ctx,title||'Location notes',39,280,422,300,62,36);
    ctx.fillStyle='#4d473c';fitText(ctx,detail||'Record a description and keep the source at hand.',552,137,430,438,43,28);
  }
  const notebook=createNotebookTurn(T,bookFrame,pages,notebookInk,makeCanvas,paintBook);
  function setNotebook(title,category='',detail='',direction=0){
    notebook.set(title,category,detail,direction,U.uT.value);
  }
  setNotebook('Production sound','Sound','Note the noise floor before the first take.');
  const doorMagnets=buildFridgeMagnets(T,fridgeFrame,U);
  function update(){
    notebook.update(U.uT.value);
    doorMagnets.update();
  }
  function asWorld(local){return group.localToWorld(V(...local)).toArray();}
  const frame=(eye,look)=>({eye:asWorld(eye),look:asWorld(look)});
  function pose(tool,portrait=false){
    if(tool==='book'){
      const aspect=window.innerWidth/window.innerHeight;
      const tangent=Math.tan((window.innerHeight>window.innerWidth?62:48)*Math.PI/360);
      const distance=Math.max(.210/(2*tangent),.185/(1.78*tangent*aspect));
      const center=portrait ? 0 : -.012;
      const look=bookFrame.localToWorld(V(0,.005,center));
      const eye=bookFrame.localToWorld(V(0,.005+distance*.971,center+distance*.239));
      return {eye:eye.toArray(),look:look.toArray()};
    }
    if(portrait){
      // Keep the signed door below both navigation rows on short phones.
      const topRoom=T.MathUtils.clamp((740-innerHeight)/180,0,1);
      return frame([-.73,1.43,1.27+.06*topRoom],[-.73,1.15+.19*topRoom,-.407]);
    }
    return frame([-.74,1.46,.54],[-.73,1.398,-.407]);
  }
  function path(tool,portrait=false){
    return [frame([-.52,1.79,2.78],[-.48,1.46,.15]),
      frame([-.49,1.72,1.23],[-.53,1.46,-.42]),
      frame([-.46,1.65,.64],tool==='book'?[.88,1.25,-.15]:[-.73,1.46,-.42]),
      pose(tool,portrait)];
  }
  function hit(raycaster){
    const shellAndBench=group.getObjectByName('Timber, standing seams, hardware and foundation');
    const surfaces=[pages,shell,...doorMagnets.pickMeshes];if(notebook.sheet.visible)surfaces.push(notebook.sheet);if(shellAndBench)surfaces.push(shellAndBench);
    const hits=raycaster.intersectObjects(surfaces,false);
    if(!hits.length)return null;
    const h=hits[0];
    if(h.object===pages||h.object===notebook.sheet)return notebook.hit(h.point);
    if(h.object===shellAndBench){
      // Cover edges, paper edges and three exposed staples also turn the page.
      const pt=bookFrame.worldToLocal(h.point.clone());
      if(Math.abs(pt.x)<=.091 && Math.abs(pt.z)<=.072 && pt.y>=0 && pt.y<.014)return pt.x<0?'book:prev':'book:next';
      return null;
    }
    if(h.object===shell && (h.face.normal.z<=.65 || fridgeFrame.worldToLocal(h.point.clone()).z<.08))return null;
    return doorMagnets.hit(h)||(h.object===shell?'story':null);
  }
  return {setStory:doorMagnets.setStory,wordAnchors:doorMagnets.wordAnchors,fieldAnchors:doorMagnets.fieldAnchors,controlCorners:doorMagnets.controlCorners,setNotebook,bookControlsAnchors:notebook.anchors,get turningPage(){return notebook.sheet.visible;},update,pose,path,hit,light};
}
