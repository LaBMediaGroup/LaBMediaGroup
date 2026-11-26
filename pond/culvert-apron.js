// Reference: Michigan 4–8 in quarry limestone. Dimensions and placement in field-props.md.
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';

// Both finishes use metre-scale position so a fracture has continuous grain across its faces.
export function bankFinish(T, color, encode, soil = false) {
  const mat = new T.MeshStandardMaterial({color, roughness: .94, vertexColors: !soil});
  mat.name = soil ? 'Culvert earth' : 'Quarried limestone';
  mat.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 vBankPoint;\n' + shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nvBankPoint=(modelMatrix*vec4(position,1.)).xyz;');
    shader.fragmentShader = `varying vec3 vBankPoint;
      float bankHash(vec3 p) {
        p=fract(p*.3183099+vec3(.11,.27,.39)); p*=17.;
        return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
      }
      float bankNoise(vec3 p) {
        vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        vec2 k=vec2(0.,1.);
        return mix(mix(mix(bankHash(i),bankHash(i+k.yxx),f.x),mix(bankHash(i+k.xyx),bankHash(i+k.yyx),f.x),f.y),
                   mix(mix(bankHash(i+k.xxy),bankHash(i+k.yxy),f.x),mix(bankHash(i+k.xyy),bankHash(i+1.),f.x),f.y),f.z);
      }\n` + shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        float mottle=bankNoise(vBankPoint*13.);
        float grit=(bankNoise(vBankPoint*410.)-.5)*(1.-smoothstep(.001,.004,length(fwidth(vBankPoint))));
        float grain=bankNoise(vBankPoint*94.)-.5;
        diffuseColor.rgb*=.72+.55*mottle+.44*grain+.76*grit;
        diffuseColor.rgb*=mix(vec3(1.),vec3(1.13,.93,.77),smoothstep(.55,.83,mottle));
      `).replace('#include <normal_fragment_maps>', `
        #include <normal_fragment_maps>
        vec3 rx=cross(dFdy(vViewPosition),normal), ry=cross(normal,dFdx(vViewPosition));
        float det=dot(dFdx(vViewPosition),rx), relief=.0016*grain+.00042*grit;
        normal=normalize(max(abs(det),1.e-12)*normal+sign(det)*(rx*dFdx(relief)+ry*dFdy(relief)));
      `);
  };
  encode(mat); return mat;
}

function scanMaps(T,name,period) {
  const loader=new T.TextureLoader();
  function load(channel) {
    const tex=loader.load(new URL('./img/culvert/'+name+'-'+channel+'.webp',import.meta.url).href);
    tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.setScalar(1/period);tex.anisotropy=4;
    return tex;
  }
  const map=load('diff');map.colorSpace=T.SRGBColorSpace;
  return {map,normalMap:load('nor_gl')};
}

function gravelBed(T,ground,mouth,yaw,encode){
  const g=new T.PlaneGeometry(1,1,20,28).rotateX(-Math.PI/2);
  const p=g.attributes.position,uv=g.attributes.uv,rgba=[],v=new T.Vector3(),up=new T.Vector3(0,1,0);
  for(let i=0;i<p.count;i++){
    const u=p.getX(i)*2,t=p.getZ(i)+.5;
    const grit=Math.sin(t*32+u*3)*.019+Math.sin(t*65-u)*.012;
    v.set(u*(.34+.40*t+grit),0,.20+t*1.13).applyAxisAngle(up,yaw).add(mouth);
    const edge=Math.min((1-Math.abs(u))/.23,t/.09,(1-t)/.14);
    p.setXYZ(i,v.x,ground(v.x,v.z)+.004,v.z);uv.setXY(i,v.x,v.z);
    rgba.push(1,1,1,T.MathUtils.smoothstep(edge,0,1));
  }
  g.setAttribute('color',new T.Float32BufferAttribute(rgba,4));g.computeVertexNormals();
  const mat=new T.MeshStandardMaterial({...scanMaps(T,'bed',1.65),color:0x99968d,roughness:1,
    transparent:true,depthWrite:false,vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1});
  mat.name='Damp gravel bedding';encode(mat);
  const bed=new T.Mesh(g,mat);bed.name='Culvert gravel bedding';return bed;
}

export function culvertApron(T, ground, mouth, yaw, encode) {
  let seed = 419;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const pieces = [], up = new T.Vector3(0,1,0);
  const palette = [0x8d8a80, 0x787b77, 0x969184, 0x76746b, 0x929490];
  // Stagger the rows down the spillway. Smaller spalls sit in the gaps.
  for (let row=0; row<7; row++) {
    const count=4+Math.floor(row*.5);
    for (let col=0; col<count; col++) {
      const x=(col-(count-1)*.5+(random()-.5)*.38)*.147;
      const z=.31+row*.121+(random()-.5)*.055;
      const size=.132+random()*.07;
      placeStone(x,z,size);
      placeStone(x+.069,z+.056,.049+random()*.052);
      if(random()<.60)placeStone(x-.052,z+.052,.023+random()*.032);
    }
  }
  function placeStone(x,z,size) {
    const planes=[];
    for (let k=0;k<10;k++) {
      const ny=1-2*(k+.32+random()*.36)/10, a=k*2.39996+random()*.68, ring=Math.sqrt(1-ny*ny);
      planes.push([new T.Vector3(Math.cos(a)*ring,ny,Math.sin(a)*ring),.55+random()*.27]);
    }
    // Intersect the fracture planes explicitly. Shared polygon edges stay straight
    // under magnification; a narrow chipped bevel catches light along the arris.
    const faces=planes.map(()=>[]), corners=[], eps=.00001;
    for(let a=0;a<planes.length;a++)for(let b=a+1;b<planes.length;b++)for(let c=b+1;c<planes.length;c++){
      const [na,da]=planes[a], [nb,db]=planes[b], [nc,dc]=planes[c];
      const cross=new T.Vector3().crossVectors(nb,nc), den=na.dot(cross);
      if(Math.abs(den)<eps)continue;
      const pt=cross.multiplyScalar(da).addScaledVector(new T.Vector3().crossVectors(nc,na),db)
        .addScaledVector(new T.Vector3().crossVectors(na,nb),dc).divideScalar(den);
      if(planes.some(([n,d])=>n.dot(pt)>d+eps))continue;
      const id=corners.push(pt)-1;
      for(const f of [a,b,c])faces[f].push(id);
    }
    const points=[], seams=new Map(), tips=corners.map(()=>[]);
    const emit=(a,b,c)=>points.push(...a.toArray(),...b.toArray(),...c.toArray());
    function triangle(a,b,c){
      const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);
      emit(a,ab,ca);emit(ab,b,bc);emit(bc,c,ca);emit(ab,bc,ca);
    }
    for(const [i,face] of faces.entries()){
      if(face.length<3)continue;
      const n=planes[i][0], centre=new T.Vector3();
      for(const id of face)centre.add(corners[id]);centre.divideScalar(face.length);
      const u=corners[face[0]].clone().sub(centre).normalize(),v=new T.Vector3().crossVectors(n,u);
      const angle=id=>{const r=corners[id].clone().sub(centre);return Math.atan2(r.dot(v),r.dot(u));};
      face.sort((a,b)=>angle(a)-angle(b));
      const inset=face.map(id=>corners[id].clone().lerp(centre,.08).addScaledVector(n,.006));
      for(let j=1;j<face.length-1;j++)triangle(inset[0],inset[j],inset[j+1]);
      for(let j=0;j<face.length;j++){
        const k=(j+1)%face.length,a=face[j],b=face[k],key=Math.min(a,b)+','+Math.max(a,b);
        const p=inset[j],q=inset[k],other=seams.get(key);
        if(other){triangle(q,p,other[1]);triangle(other[1],other[0],q);}else seams.set(key,[p,q]);
        tips[a].push(p);
      }
    }
    for(let i=0;i<tips.length;i++){
      const [a,b,c]=tips[i];if(!c)continue;
      const outward=b.clone().sub(a).cross(c.clone().sub(a)).dot(corners[i])>0;
      if(outward)triangle(a,b,c);else triangle(a,c,b);
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(points,3));
    const tint=new T.Color(palette[Math.floor(random()*palette.length)]),colors=[];
    const verts=geo.attributes.position;
    for(let i=0;i<verts.count;i++){
      const x=verts.getX(i),y=verts.getY(i),z=verts.getZ(i);
      const irregular=1+.028*Math.sin(4*x+2*z)*Math.cos(5*y-z)+.016*Math.sin(8*z+x-3*y);
      verts.setXYZ(i,x*irregular,y*irregular,z*irregular);
    }
    geo.scale(1,.48+random()*.39,.71+random()*.34);geo.computeBoundingBox();
    const p=geo.attributes.position,low=geo.boundingBox.min.y,height=geo.boundingBox.max.y-low;
    for(let i=0;i<p.count;i++){
      const t=(p.getY(i)-low)/height, shade=.68+.32*Math.min(1,t*1.9);
      colors.push(tint.r*shade,tint.g*shade,tint.b*shade);
    }
    const scale=size/(geo.boundingBox.max.x-geo.boundingBox.min.x);
    geo.scale(scale,scale,scale);geo.rotateY(random()*Math.PI);
    geo.computeBoundingBox();
    const pos=new T.Vector3(x,0,z).applyAxisAngle(up,yaw).add(mouth);
    // Seat the underside into the actual terrain triangles.
    geo.translate(pos.x,ground(pos.x,pos.z)-geo.boundingBox.min.y-size*.18,pos.z);
    geo.computeVertexNormals();geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    const uv=[], n=geo.attributes.normal;
    for(let j=0;j<p.count;j+=3){
      const ax=Math.abs(n.getX(j)),ay=Math.abs(n.getY(j)),az=Math.abs(n.getZ(j));
      for(let k=j;k<j+3;k++){
        if(ay>=ax&&ay>=az)uv.push(p.getX(k),p.getZ(k));
        else if(ax>=az)uv.push(p.getZ(k),p.getY(k));
        else uv.push(p.getX(k),p.getY(k));
      }
    }
    geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));pieces.push(geo);
  }
  const mesh=new T.Mesh(mergeGeometries(pieces),bankFinish(T,0xffffff,encode));
  Object.assign(mesh.material,scanMaps(T,'stone',.90));
  mesh.material.normalScale.set(.8,.8);
  mesh.name='Culvert limestone apron';
  for(const g of pieces) g.dispose();
  const group=new T.Group();group.add(mesh,gravelBed(T,ground,mouth,yaw,encode));return group;
}
