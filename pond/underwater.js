// The film room uses the same basin, surface height and ripple texture as the field.
// Units are metres. The console front faces +Z. See tv- and pond-life reference notes.
import * as THREE from 'three';
import { createFilmStations, footprints } from './film-stations.js?v=20';
import { createPondLife, floorLitter } from './pond-life.js?v=18';

const vertex = `
varying vec3 point;
void main() {
  vec4 p = modelMatrix * vec4(position, 1.);
  point = p.xyz;
  gl_Position = projectionMatrix * viewMatrix * p;
}`;
const caustics = `
float caustic(vec2 p, float t) {
  p += .21 * vec2(sin(2.6*p.y + .39*t), sin(2.1*p.x - .32*t));
  float a = sin(4.3*p.x + 1.7*p.y + .35*t);
  float b = cos(3.7*p.y - 2.1*p.x - .29*t);
  return pow(max(0., 1.-abs(a+b)*2.2), 5.);
}`;
const centerZ = -12.8;
export function buildFilmRoom({ height, uniforms, simSize, simZ, reduced }) {
  const scene = new THREE.Scene();
  const fogColor = new THREE.Color();
  scene.fog = new THREE.FogExp2(fogColor, .35);
  scene.background = new THREE.Color();
  const bedY = height(0, centerZ);
  // Concentrate triangles near the cabinet. Fine sediment is banked against the
  // buried side and rear. Props sample the actual rendered triangles below.
  const cells = 96;
  const grid = Array.from({length:cells+1}, (_, i) => {
    const t = 2*i/cells-1;
    return .7*t + 17*t*t*t;
  });
  const terrainGeo = new THREE.PlaneGeometry(1,1,cells,cells).rotateX(-Math.PI/2);
  const points = terrainGeo.attributes.position;
  const elevations = new Float32Array(points.count);
  for (let j=0;j<=cells;j++) for (let i=0;i<=cells;i++) {
    const x=grid[i], z=grid[j], at=j*(cells+1)+i;
    const bank = .12*Math.exp(-((x-.32)**2/.05+(z+.05)**2/.14))
      + .09*Math.exp(-(x*x/.20+(z+.23)**2/.065));
    const ripple = .004*Math.sin(x*17+z*6)*Math.sin(z*13)*Math.exp(-.3*(x*x+z*z));
    elevations[at] = height(x, centerZ+z) + bank + ripple;
    points.setXYZ(at,x,elevations[at],centerZ+z);
  }
  function interval(v) {
    let lo=0, hi=cells;
    while (hi-lo>1) {
      const mid=(lo+hi)>>1;
      if (grid[mid]<=v) lo=mid; else hi=mid;
    }
    return lo;
  }
  function localBed(x,z) {
    const i=interval(x), j=interval(z), at=j*(cells+1)+i;
    const u=(x-grid[i])/(grid[i+1]-grid[i]), v=(z-grid[j])/(grid[j+1]-grid[j]);
    const a=elevations[at], b=elevations[at+cells+1], c=elevations[at+cells+2], d=elevations[at+1];
    return (u+v<=1 ? a*(1-u-v)+b*v+d*u : c*(u+v-1)+d*(1-v)+b*(1-u)) - bedY;
  }
  const ringCenter = footprints.reduce((z, foot) => z + foot.y, 0) / footprints.length;
  const life = createPondLife(THREE, localBed, {centerZ:ringCenter-centerZ, reduced});
  life.group.position.set(0, bedY, centerZ);
  scene.add(life.group);

  const ground=(x,z)=>bedY+localBed(x,z-centerZ);
  const stations=createFilmStations(scene,ground,reduced);
  // Small deposits between the later cabinets use separate seeds and the same
  // triangle sampler as the cabinet feet. Keep solid debris clear of the cases.
  for (const i of [2,3,5]) {
    const f=footprints[i];
    const litter=floorLitter(THREE,(x,z)=>ground(f.x+x,f.y+z)-bedY,{
      seed:1987*i, clear:(x,z)=>footprints.every(p=>Math.hypot(p.x-f.x-x,p.y-f.y-z)>.68)
    });
    litter.position.set(f.x,bedY,f.y); scene.add(litter);
  }
  const key = new THREE.DirectionalLight(0xe5dfb3, 2.);
  const ambient = new THREE.HemisphereLight(0xc5e6db, 0x9c8a68, 1.);
  const first=stations.sets[0];
  key.position.set(first.foot.x-1.6,2.6,first.foot.y+1.4);
  key.target.position.copy(first.center);
  scene.add(key,key.target,ambient);
  const shared = {
    clock: {value: 0}, daylight: uniforms.uDay, night:uniforms.uNight, tint: {value: fogColor},
    sunC: uniforms.uSunC, zenith:uniforms.uZen, horizon:uniforms.uHor, sun:uniforms.uSunDir, clouds:uniforms.uCloud, ripple: {value: null}, wind: uniforms.uWind,
    cabinets:{value:stations.sets.map(s=>new THREE.Vector4(s.foot.x,s.foot.y,s.width,s.height))},
    spills:{value:stations.sets.map(tv=>new THREE.Vector3(tv.center.x+tv.forward.x*tv.width*.26,
      tv.center.z+tv.forward.z*tv.width*.26,tv.width))}
  };
  // A short path through suspended sediment scatters the phosphor light
  // ahead of the glass. Sample its picture; the bed already has its own spill.
  const phosphorHaze=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
    uniforms:{picture:{value:null},strength:{value:0}},
    vertexShader:`varying vec2 st;
      void main(){st=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 st;uniform sampler2D picture;uniform float strength;
      void main(){
        vec2 xy=(st-.5)*2.;float r=dot(xy,xy);
        vec3 frame=(texture2D(picture,vec2(.32,.42)).rgb+texture2D(picture,vec2(.62,.32)).rgb
                   +texture2D(picture,vec2(.55,.66)).rgb+texture2D(picture,vec2(.42,.55)).rgb)*.25;
        float emission=dot(frame,vec3(.22,.69,.09));
        float haze=exp(-4.2*r)*(1.-smoothstep(.64,1.,r));
        gl_FragColor=vec4(mix(vec3(.36,.84,.76),sqrt(frame),.35),haze*strength*(.22+1.15*sqrt(emission)));
      }`
  }));
  // Each lit glass has a persistent, depth-tested pool in the water.
  // A small portable and the console become readable at different distances.
  const glows=stations.sets.map((tv,i)=>{
    const haze=i===0?phosphorHaze:new THREE.Mesh(phosphorHaze.geometry,phosphorHaze.material.clone());
    haze.renderOrder=2;
    haze.position.copy(tv.faceCenter).addScaledVector(tv.faceNormal,Math.min(.14,tv.width*.12));
    tv.screen.getWorldQuaternion(haze.quaternion);
    haze.scale.set(tv.glassSize.x*3.8,tv.glassSize.y*3.9,1);
    scene.add(haze);return haze;
  });
  const toViewer=new THREE.Vector3();
  function scatterFromGlass(tv,haze,camera){
    toViewer.subVectors(camera.position,tv.faceCenter);
    const distance=toViewer.length(),facing=toViewer.normalize().dot(tv.faceNormal);
    const tan=Math.tan(camera.fov*Math.PI/360);
    const restingDistance=Math.max(tv.width*.60/(tan*camera.aspect),tv.height*.69/tan,.28)+tv.width*.34;
    const strength=THREE.MathUtils.smoothstep(distance,restingDistance,restingDistance+1.05)
      *THREE.MathUtils.smoothstep(facing,.04,.68)*Math.exp(-.08*Math.max(0,distance-3.));
    const map=tv.screen.material.map;
    haze.visible=!!map && strength>.008;
    if(haze.visible){haze.material.uniforms.picture.value=map;haze.material.uniforms.strength.value=strength;}
  }
  // Each receiver casts one elliptical pool on the bed in front of its glass.
  const bed = new THREE.Mesh(terrainGeo, new THREE.ShaderMaterial({
    uniforms: shared, vertexShader: vertex,
    fragmentShader: caustics + `
      varying vec3 point; uniform vec3 tint; uniform float clock,daylight; uniform vec4 cabinets[7];uniform vec3 spills[7];
      float hash(vec2 v){ return fract(sin(dot(v,vec2(127.1,311.7)))*43758.545); }
      float noise(vec2 v){vec2 i=floor(v),f=fract(v);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
      void main(){
        vec2 p=point.xz;
        float sediment=.52*noise(p*5.)+.26*noise(p*20.)+.15*noise(p*96.)+.07*noise(p*280.);
        vec3 mud=mix(vec3(.042,.054,.042), vec3(.31,.26,.16),sediment);
        float contact=0.,spill=0.;
        for (int i=0;i<7;i++){
          vec2 front=(p-spills[i].xy)/spills[i].z*2.7;
          spill+=exp(-dot(front,front));
          vec2 offset=(p-cabinets[i].xy)/cabinets[i].z;
          contact=max(contact,exp(-8.*dot(offset,offset)));
        }
        float ray=caustic(p,clock);
        mud*= (.45+.61*daylight)*(1.-.63*contact)*(1.+.33*daylight*ray);
        mud+=vec3(.028,.092,.067)*spill;
        float d=length(point-cameraPosition);gl_FragColor=vec4(mix(tint,mud,exp(-d*.26)),1.);
      }`
  }));
  scene.add(bed);
  for (const tv of stations.sets) tv.group.traverse(obj => {
    if (!obj.isMesh || obj === tv.screen) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (!m.isMeshStandardMaterial || m.userData.pondProjection) continue;
      m.userData.pondProjection = true;
      const original = m.onBeforeCompile;
      m.onBeforeCompile = function(shader, renderer) {
        original.call(this, shader, renderer);
        shader.uniforms.roomTime = shared.clock;
        shader.uniforms.daylight = shared.daylight;
        shader.vertexShader = 'varying vec3 roomPoint;\n' + shader.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nroomPoint=(modelMatrix*vec4(transformed,1.)).xyz;');
        shader.fragmentShader = 'varying vec3 roomPoint; uniform float roomTime,daylight;\n' + caustics + '\n' + shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb*=1.+.17*daylight*caustic(roomPoint.xz+roomPoint.y*.38,roomTime);');
      };
    }
  });

  // Critical angle at a water–air boundary: asin(1/1.333) ≈ 48.6 degrees.
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(30, 26).rotateX(-Math.PI/2),
    new THREE.ShaderMaterial({side: THREE.BackSide, uniforms: shared, vertexShader: vertex,
      fragmentShader: `
        varying vec3 point; uniform vec3 tint,sunC,zenith,horizon,sun;
        uniform float clock,daylight,night,wind,clouds; uniform sampler2D ripple;
        float hash(vec2 p){return fract(sin(dot(p,vec2(71.27,153.73)))*23781.54);}
        float noise(vec2 p){vec2 f=fract(p),i=floor(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
        void main(){
          vec2 st=(point.xz-vec2(0.,${simZ.toFixed(2)}))/${simSize.toFixed(2)}+.5;
          float d=.003;
          vec2 slope=vec2(texture2D(ripple,st+vec2(d,0)).r-texture2D(ripple,st-vec2(d,0)).r,texture2D(ripple,st+vec2(0,d)).r-texture2D(ripple,st-vec2(0,d)).r)*8.;
          slope+=vec2(cos(point.z*3.2+clock*.72),sin(point.x*3.7+point.z*2.-clock*.51))*(.012+.002*min(wind,25.));
          vec3 rd=normalize(point-cameraPosition);
          slope+=.009*vec2(sin(point.x*19.+clock*1.2)*sin(point.z*12.),cos(point.z*15.-clock*.9));
          vec3 normal=normalize(vec3(slope.x,1.,slope.y));
          float mu=dot(rd,normal);
          float windowLight=smoothstep(.646,.68,mu);
          // Outside Snell's window the surface returns a view of the bed.
          // Sample the reflected ray's projected silt and its additional optical path.
          vec3 returnRay=reflect(rd,normal);
          float bottomDistance=1.97/max(.065,-returnRay.y);
          vec2 bottom=point.xz+returnRay.xz*bottomDistance;
          float grain=.64*noise(bottom*5.)+.36*noise(bottom*26.);
          vec3 reflected=mix(tint,mix(vec3(.046,.055,.043),vec3(.23,.20,.13),grain)*(.44+.62*daylight),exp(-bottomDistance*.29));
          vec3 above=refract(rd,-normal,1.333);
          vec3 sky=mix(horizon,zenith,pow(max(0.,above.y),.55));
          vec2 cp=above.xz/max(.07,above.y)*1.6+clock*.008;
          float cover=.65*noise(cp)+.25*noise(cp*2.1)+.10*noise(cp*4.3);
          sky=mix(sky,mix(horizon,vec3(.83,.86,.79),.38),smoothstep(.71-clouds*.28,.85-clouds*.26,cover)*daylight);
          if(night>.01 && above.y>0.){
            // Carry the sky dome's warm horizon glow and cool cloud bases
            // through the refracted window after sunset.
            sky+=vec3(.09,.05,.025)*night*exp(-above.y*9.)*(.6+.4*smoothstep(-.6,.6,above.x));
            float cloud=smoothstep(.68-clouds*.26,.85-clouds*.26,cover);
            sky=mix(sky,vec3(.05,.06,.09),night*cloud*.75);
          }
          float disc=max(0.,dot(above,sun));
          sky+=sunC*(pow(disc,170.)*.65+smoothstep(.9996,.99994,disc))*daylight;
          sky*=vec3(.73,.88,.84);
          // Near the critical angle the low sun breaks into glints. Scatter
          // their light into the water immediately below the moving interface.
          vec2 horizontal=sun.xz/1.333;
          vec3 shaft=vec3(horizontal.x,sqrt(1.-dot(horizontal,horizontal)),horizontal.y);
          float forward=max(0.,dot(rd,shaft));
          float lit=smoothstep(-.035,.045,sun.y);
          float flicker=.58+.42*noise(point.xz*12.+slope*14.+clock*.24);
          vec3 scatter=sunC*lit*flicker*(.32*pow(forward,13.)+.77*pow(forward,90.));
          gl_FragColor=vec4(mix(tint,mix(reflected,sky,windowLight),exp(-.22*length(point-cameraPosition)))+scatter,1.);
        }`}));
  ceiling.position.z = centerZ;
  scene.add(ceiling);

  // Vertical veils attenuate smoothly at the surface, bed and lateral edges.
  const shafts = new THREE.Group();
  const shaftMat = new THREE.ShaderMaterial({uniforms:shared, vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 v;uniform float clock,daylight;void main(){float x=v.x+.035*sin(v.y*3.+clock*.28);float band=pow(max(0.,1.-abs(x-.5)*2.),2.);float vertical=smoothstep(0.,.28,v.y)*(1.-smoothstep(.94,1.,v.y));gl_FragColor=vec4(.63,.81,.68,band*vertical*daylight*.085);}`,
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  for (const [x,z,w] of [[-1.1,-.4,.34],[-.72,-.5,.14],[.95,-.68,.4],[1.28,-.64,.09],[-1.7,-1.42,.55]]) {
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(w,2.5),shaftMat);
    shaft.position.set(x,-1.04,centerZ+z); shaft.rotation.z=-.24;
    shafts.add(shaft);
  }
  for (const [x,z,w] of [[2.8,1.2,.19],[-2.7,1.8,.32],[.7,5.7,.44],[-1.,5.2,.18],[1.8,3.9,.23]]) {
    const shaft=new THREE.Mesh(new THREE.PlaneGeometry(w,2.55),shaftMat);
    shaft.position.set(x,-1.05,centerZ+z); shaft.rotation.set(0,x*.53,-.24);
    shafts.add(shaft);
  }
  scene.add(shafts);

  const particles = new Float32Array(700*3);
  let seed=41;
  const random=()=> (seed=seed*16807%2147483647)/2147483647;
  for(let i=0;i<particles.length;i+=3){
    particles[i]=(random()-.5)*6.8; particles[i+1]=-1.98+random()*1.96; particles[i+2]=centerZ-2.2+random()*9.0;
  }
  const scatter=new THREE.BufferGeometry();
  scatter.setAttribute('position',new THREE.BufferAttribute(particles,3));
  const dust=new THREE.Points(scatter,new THREE.ShaderMaterial({
    uniforms:shared,transparent:true,depthWrite:false,
    vertexShader:`uniform float clock;varying float a;void main(){vec3 p=position;p.x+=.055*sin(clock*.22+p.y*3.);p.y+=.024*sin(clock*.27+p.z*4.);vec4 v=modelViewMatrix*vec4(p,1.);a=.19*smoothstep(.16,.65,-v.z)*exp(.27*v.z);gl_Position=projectionMatrix*v;gl_PointSize=clamp(1.55/max(.4,-v.z),1.,3.);}`,
    fragmentShader:`varying float a;void main(){float r=length(gl_PointCoord-.5); gl_FragColor=vec4(.72,.77,.64,a*(1.-smoothstep(.17,.5,r)));}`
  }));
  scene.add(dust);
  const bubbleGeo=new THREE.SphereGeometry(.004,8,6);
  const bubble=new THREE.Mesh(bubbleGeo,new THREE.MeshBasicMaterial({color:0xadbfb5,wireframe:true,transparent:true,opacity:.30}));
  scene.add(bubble);

  // Air carried down by the housing peels off near its shoulder and rises
  // through the water in world space. Emission requires downward travel.
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),
    new THREE.ShaderMaterial({transparent:true, depthWrite:false,
      vertexShader:`varying vec3 N,V;void main(){
        vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);
        N=normalize(mat3(modelMatrix*instanceMatrix)*normal);
        V=cameraPosition-w.xyz; gl_Position=projectionMatrix*viewMatrix*w;
      }`,
      fragmentShader:`varying vec3 N,V;void main(){
        float rim=pow(1.-max(dot(normalize(N),normalize(V)),0.),2.3);
        float sky=pow(max(dot(normalize(N),normalize(vec3(-.38,.73,.48))),0.),14.);
        gl_FragColor=vec4(mix(vec3(.21,.34,.31),vec3(.83,.91,.84),sky),rim*.57+sky*.71);
      }`}),20);
  bubbles.frustumCulled=false;
  scene.add(bubbles);
  const droplets=Array.from({length:20},()=>({p:new THREE.Vector3(),r:0,age:5}));
  const particle=new THREE.Object3D(), right=new THREE.Vector3(), heading=new THREE.Vector3();
  let lastTime=0,lastHeight=0,nextBubble=0,accumulated=0;
  function updateBubbles(t,camera) {
    const dt=Math.min(.06,t-lastTime),y=camera.position.y;
    lastTime=t;
    if (y<-.045 && y>-.94 && lastHeight>y && !reduced) {
      accumulated+=Math.min(.10,lastHeight-y);
      camera.getWorldDirection(heading);right.setFromMatrixColumn(camera.matrixWorld,0);
      while(accumulated>.052) {
        accumulated-=.052;
        const bubble=droplets[nextBubble++ % droplets.length];
        bubble.age=0; bubble.r=.0028+random()*.006;
        bubble.p.copy(camera.position).addScaledVector(heading,.32+random()*.22)
          .addScaledVector(right,(nextBubble%3===0?-1:1)*(.065+random()*.12));
        bubble.p.y-=random()*.052;
      }
    } else if(y>-.045) accumulated=0;
    lastHeight=y;
    let n=0;
    for (const drop of droplets) {
      drop.age+=dt;
      if (drop.age>1.45 || drop.p.y>-.009) continue;
      drop.p.y+=dt*(.18+drop.r*9);drop.p.x+=Math.sin(drop.age*6.+drop.r*270)*dt*.023;
      particle.position.copy(drop.p);particle.scale.set(drop.r,drop.r*.91,drop.r);
      particle.updateMatrix();bubbles.setMatrixAt(n++,particle.matrix);
    }
    bubbles.count=n;bubbles.instanceMatrix.needsUpdate=!!n;
  }

  let wildlifeTime=0, previousVisitFrame;
  function update(t,sim,camera) {
    // Give a first-time visitor the same encounter after any length of time on
    // shore. Continue the animals' motion from where it stopped on resurfacing.
    if (previousVisitFrame !== undefined && t-previousVisitFrame <= .1 && !reduced) {
      wildlifeTime += t-previousVisitFrame;
    }
    previousVisitFrame=t;
    updateBubbles(t,camera);
    const day=uniforms.uDay.value;
    shared.clock.value=reduced ? 0 : t;
    shared.ripple.value=sim;
    fogColor.setRGB(.031+.037*day,.064+.083*day,.062+.056*day);
    scene.background.copy(fogColor).convertSRGBToLinear();
    scene.fog.color.copy(scene.background);
    ambient.intensity=.78+day*.85;
    key.intensity=.53+day*1.8;
    life.update(wildlifeTime,camera.position);
    const age=t%9;
    bubble.visible=!reduced && age<3;
    bubble.position.set(.31+.012*Math.sin(age*5),stations.sets[0].center.y+.19+age*.46,centerZ+.06);
    stations.update();
    for(let i=0;i<glows.length;i++)scatterFromGlass(stations.sets[i],glows[i],camera);

  }
  return {scene,update,stations, setSource:stations.setSource,
    pick:stations.pick,cameraPose:stations.cameraPose};
}
