/* The LaB world: one Michigan field under the real sky, one farm pond.
   - Sky: true sun elevation for Shelby Twp; the camera faces the sun's bearing.
   - Wind (live): wires bow and swing, the bare oak, stubble and cattails bend,
     clouds drift, leaves drift, and the pond roughens. Calm air = a mirror.
   - Scroll: the camera walks to the bank and tips down over the water. From then
     on the pond is the page's background: it reflects the sky, the wires and the
     branches overhead, and ripples whenever something on the page moves.

   Reference notes (realism pass, Nov 24 2026):
   - Pole: 40 ft Class 4 wood distribution pole, ~6 ft buried -> 10.4 m above
     grade; ~0.27 m diameter at grade, ~0.19 m at the top (ANSI O5.1 class
     circumferences 33 in / 23 in). 8 ft (2.44 m) crossarm, 3.5 x 4.5 in
     (89 x 114 mm), mounted ~0.3 m below the top, square ACROSS the line, held by
     two flat V-braces. Three pin insulators (porcelain, ~0.17 m) for the phases,
     a neutral on a stand-off bracket ~1.3 m below the arm, and a comms cable
     clamped to the pole ~5.5 m above grade (NESC clearance). Pole-mounted
     transformer can (~0.5 m dia, 0.8 m tall) every third pole, fed through a
     cutout from one phase. Rural spans ~40 m with ~1-2% sag.
   - Pond: a dug farm pond. The shoreline is where the water plane meets the
     terrain, not a cut-out. Shallow water shows the mud bottom; deep water is
     murky green-brown. November: dry cattails and reeds in the shallows, oak
     leaves floating, stubble field beyond.
   Exposes window.LabWorld. */
import * as THREE from 'three';
import {buildPoleCutout} from './pole-cutout.js';
import { createPondPort } from './pond-port.js?v=15';
import { buildOak } from './oak.js';
import { buildFieldStation } from './field-station.js?v=25';
import {pondCamera} from './pond-camera.js?v=19';
import {fieldStationCamera} from './station-camera.js?v=25';
import {fieldDrones} from './field-drones.js?v=24';
import {outdoorInstruments} from './outdoor-instruments.js?v=24';
import { buildFieldBird } from './field-bird.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const canvas = document.getElementById('world');
const small = Math.min(innerWidth, innerHeight) < 700;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
// Explore (free-roam) hands the lens to a walker instead of the scroll rail. Null on the homepage.
let exploreHook=null;
const EXPLORE_PAGE=/\/explore\.html$/.test(location.pathname);   // walkable: fill the field the scroll camera never faced
// Night floor: the homepage stages night as near-black; walking needs to see the ground, so Explore uses a cool moonlit floor.
const NIGHT_FLOOR=EXPLORE_PAGE?'vec3(.3,.35,.47)':'vec3(.1)';
// Explore adds moonlight as a cool diffuse term on the ground, stubble, reeds and corn (albedo × moon × night).
const MOON_ADD=EXPLORE_PAGE?'vec3(.68,.8,1.15)':'vec3(0.)';
// ...and a warm lantern pool round the visitor at night (about 5 m), so the ground at your feet reads.
const LAMP=a=>EXPLORE_PAGE?`${a}*vec3(1.,.84,.6)*1.5*uNight*exp(-pow(length(vW.xz-cameraPosition.xz)/5.,2.))`:'vec3(0.)';
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: false, powerPreference: 'high-performance' });
} catch (e) { document.documentElement.classList.add('no-world'); throw e; }
const DPR = Math.min(devicePixelRatio || 1, small ? 1.2 : 1.25);
renderer.setPixelRatio(DPR);
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // shaders author display values directly

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 5000);
const lin = (r, g, b) => new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace);

/* ---------------- shared state ---------------- */
const S = {
  el: 0.06, wind: 6, gust: 10, cloud: 0.5,
  dive: 0, diveT: 0, rise: 0, riseT: 0, under: 0, underT: 0, station:0,stationT:0,flight:0,flightT:0,inside:1,insideT:1,book:0,bookT:0,exitMix:0,exitT:0,shore:0,shoreRelease:0, ink: 0, inkT: 0, inkC: new THREE.Vector2(0, -12),
  px: 0, py: 0, pxT: 0, pyT: 0, t: 0
};
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function palette(el) {
  const day = ss(-0.12, 0.2, el), gold = ss(0.22, 0.02, el) * ss(-0.11, -0.01, el), night = ss(-0.06, -0.16, el);
  const zen = mix3([0.03, 0.042, 0.085], mix3([0.12, 0.15, 0.30], [0.20, 0.40, 0.74], ss(0.15, 0.6, el)), day);
  let hor = mix3([0.075, 0.085, 0.13], mix3([0.95, 0.55, 0.28], [0.74, 0.83, 0.92], ss(0.05, 0.45, el)), day);
  hor = mix3(hor, [0.85, 0.36, 0.18], gold * 0.55 * (1 - night));
  const sun = mix3([1, 0.45, 0.18], [1, 0.93, 0.82], ss(0.02, 0.5, el));
  return { day, gold, night, zen, hor, sun };
}
const U = {
  uFollowSubject: {value: new THREE.Vector4()},
  uDrainAxis: {value: new THREE.Vector4()},
  uT: { value: 0 }, uDay: { value: 1 }, uGold: { value: 0 }, uNight: { value: 0 }, uEl: { value: 0.1 },
  uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSunC: { value: new THREE.Color() },
  uSunDir: { value: new THREE.Vector3(0, 0.1, -1).normalize() },
  uWind: { value: 6 }, uWindAmp: { value: 0.2 }, uWindDir: { value: new THREE.Vector3(0.6, 0, -0.8) }, uGustE: { value: 0 },
  uCourseLight:{value:0},uCourseBake:{value:null},
  uLightning: {value:0}, uStrikeAngle: {value:0}, uRain: {value:0}, uCloud: { value: 0.5 }, uBreach: {value:new THREE.Vector2()}, uSplashAge: {value: 8}, uStarAge: {value: 8}
};
const NOISE = `
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n2(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return v;}
float fbm3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n2(p);p=p*2.1+3.7;a*=.5;}return v;}`;
const COMMON_U = `uniform float uT,uDay,uGold,uNight,uEl,uWind,uWindAmp,uGustE,uCloud,uSplashAge,uStarAge;uniform vec2 uBreach;uniform float uLightning,uStrikeAngle;uniform vec3 uZen,uHor,uSunC,uSunDir,uWindDir;
vec3 nightHorizon(vec3 ray){
  if(uNight<.001)return vec3(0.);
  vec2 bearing=normalize(uSunDir.xz+vec2(.0001));
  float toward=max(0.,dot(normalize(ray.xz+vec2(.0001)),bearing));
  float band=exp(-pow((ray.y-.12)/.16,2.));
  return vec3(.13,.18,.25)*pow(toward,8.)*band*uNight;
}`;
const FOG = `vec3 fogged(vec3 c,vec3 w,float k){float d=length(w-cameraPosition);return mix(c,uHor*mix(.55,.9,uDay),1.-exp(-d*k));}`;
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* ---------------- terrain: field, banks and the pond basin ---------------- */
const C = new THREE.Vector2(0, -11.5), R = new THREE.Vector2(12, 9);
const TREE = new THREE.Vector2(4.6, -15.5), SPIT_END = new THREE.Vector2(11, -18.5);
const EXT = 84, TN = 256; // terrain square (m) and height/depth texture size
function ih(x, z) { let h = Math.imul(x | 0, 374761393) + Math.imul(z | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967295; }
function vn(x, z) { const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = ih(ix, iz), b = ih(ix + 1, iz), c = ih(ix, iz + 1), d = ih(ix + 1, iz + 1); return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz; }
function fb(x, z) { let v = 0, a = 0.5; for (let i = 0; i < 4; i++) { v += a * vn(x, z); x = x * 2.03 + 17.1; z = z * 2.03 + 9.2; a *= 0.5; } return v; }
function segDist(px, pz, a, b) { const bx = b.x - a.x, bz = b.y - a.y, t = Math.max(0, Math.min(1, ((px - a.x) * bx + (pz - a.y) * bz) / (bx * bx + bz * bz))); return Math.hypot(px - a.x - bx * t, pz - a.y - bz * t); }
function pondMetric(x, z) {
  let pe = Math.hypot((x - C.x) / R.x, (z - C.y) / R.y) + (fb(x * 0.3, z * 0.3) - 0.5) * 0.3;
  const ds = segDist(x, z, TREE, SPIT_END); pe += 0.85 * Math.exp(-ds * ds / (2 * 1.9 * 1.9)); // a point of land the oak stands on
  return pe;
}
function H(x, z) {
  const pe = pondMetric(x, z);
  let h = -1.3 + 1.52 * ss(0.48, 1.22, pe) - .7 * (1 - ss(.45, .88, pe));                    // basin floor up to the bank
  h += (fb(x * 0.55 + 7, z * 0.55) - 0.5) * 0.08 * ss(0.95, 1.35, pe); // field microrelief
  h += 0.035 * Math.sin(x * 4.4 + fb(x * 0.2, z * 0.2) * 3) * ss(1.3, 1.7, pe); // plough furrows
  const edge = Math.max(Math.abs(x - C.x), Math.abs(z - C.y)) / (EXT / 2);
  return h + (0.2 - h) * ss(0.86, 0.99, edge);                 // meet the far field at 0.2 m
}
const depthData = new Uint8Array(TN * TN * 4);
for (let j = 0; j < TN; j++) for (let i = 0; i < TN; i++) {
  const x = C.x - EXT / 2 + (i + 0.5) / TN * EXT, z = C.y - EXT / 2 + (j + 0.5) / TN * EXT;
  const d = Math.max(0, Math.min(2, -H(x, z)));
  depthData[(j * TN + i) * 4] = Math.round(d / 2 * 255); depthData[(j * TN + i) * 4 + 3] = 255;
}
const depthTex = new THREE.DataTexture(depthData, TN, TN, THREE.RGBAFormat);
depthTex.magFilter = depthTex.minFilter = THREE.LinearFilter; depthTex.needsUpdate = true;

const terrainGeo = new THREE.PlaneGeometry(EXT, EXT, small ? 160 : 230, small ? 160 : 230).rotateX(-Math.PI / 2);
terrainGeo.translate(C.x, 0, C.y);
{ const p = terrainGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i))); terrainGeo.computeVertexNormals(); }
const terrain = new THREE.Mesh(terrainGeo, new THREE.ShaderMaterial({
  uniforms: U,
  vertexShader: `varying vec3 vW;varying vec3 vN;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normal;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader: COMMON_U + NOISE + FOG + `uniform float uCourseLight;uniform sampler2D uCourseBake;varying vec3 vW;varying vec3 vN;
  void main(){
    vec2 p=vW.xz;float h=vW.y;vec3 n=normalize(vN);
    // stubble field: dry straw over dark soil, rows of corn stubble
    float row=abs(fract(p.x*.7+n2(p*.05)*.6)-.5)*2.;
    vec3 soil=mix(vec3(.07,.055,.04),vec3(.12,.095,.065),fbm3(p*.9));
    vec3 straw=mix(vec3(.24,.19,.12),vec3(.38,.31,.2),fbm3(p*2.3+3.));
    vec3 field=mix(soil,straw,smoothstep(.35,.75,fbm3(p*1.7))*${EXPLORE_PAGE?'.62+.3':'.75'}+.15*smoothstep(.3,.8,row));
    // Short, alternating mower passes pick out the school grounds in the wider field.
    vec2 edge=abs(p-vec2(-1.55,7.85))-vec2(3.65,5.75);
    float cut=1.-smoothstep(-.25,.52,length(max(edge,0.))+min(max(edge.x,edge.y),0.)+.22*(row-.5));
    vec3 turf=mix(vec3(.24,.255,.135),vec3(.38,.38,.20),fbm3(p*3.));
    field=mix(field,turf*(.92+.08*cos(p.x*3.7)),cut);
    // the bank: wet mud near the water, darker and glossier the lower it gets
    vec3 mud=mix(vec3(.05,.04,.03),vec3(.1,.08,.055),fbm3(p*3.));
    float bank=1.-smoothstep(.05,.24,h);
    vec3 c=mix(field,mud,bank);
    float cornFar=step(p.y,-49.5)*step(abs(p.x),9.-p.y*.85);
    vec3 canopy=mix(vec3(.2,.155,.095),vec3(.4,.32,.2),fbm3(p*1.3))*mix(.7,1.1,smoothstep(.2,.8,abs(fract(p.y*1.3)-.5)*2.));
    c=mix(c,canopy,cornFar);
    c*=mix(1.,.55,smoothstep(.08,-.02,h)); // waterline darkening
    float dif=max(dot(n,normalize(uSunDir)),0.)*smoothstep(-.03,.04,uEl);
    vec3 amb=mix(uZen,uHor,.6)*.55;
    vec3 lit=c*(amb+uSunC*dif*(.55+.6*uGold));
    float wet=bank*pow(max(dot(reflect(normalize(vW-cameraPosition),n),normalize(uSunDir)),0.),40.)*.6;
    lit+=uSunC*wet*smoothstep(-.03,.04,uEl);
    lit*=mix(${NIGHT_FLOOR},vec3(1.),uDay);lit+=vec3(.008,.007,.006)*uNight;lit+=c*${MOON_ADD}*uNight*(.55+.45*max(n.y,0.));lit+=${LAMP('c')};
    vec2 courseUV=(p-vec2(-9.,0.))/vec2(16.,17.);
    if(uCourseLight>.001 && all(greaterThan(courseUV,vec2(0.))) && all(lessThan(courseUV,vec2(1.)))){
      float beam=texture2D(uCourseBake,courseUV).r;
      lit+=uCourseLight*beam*field*vec3(1.35,1.16,.92);
    }
    gl_FragColor=vec4(fogged(lit,vW,.012),1.);
  }`
}));
scene.add(terrain);
// far field beyond the terrain square, with a round hole the terrain fills
const farGround = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
  uniforms: U, transparent:true,
  vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader: COMMON_U + NOISE + FOG + `varying vec3 vW;void main(){
    if(length(vW.xz-vec2(0.,-11.5))<40.)discard;
    vec2 p=vW.xz;float row=abs(fract(p.x*.7+n2(p*.05)*.6)-.5)*2.;
    vec3 g=mix(vec3(.08,.065,.045),vec3(.2,.16,.1),fbm3(p*.08))*mix(.8,1.1,smoothstep(.2,.8,row));
    float road=smoothstep(2.,1.5,abs(p.x-p.y*.35+30.));g=mix(g,vec3(.16,.14,.11)+.05*n2(p*3.),road*.85);
    if(p.y<-49.5&&abs(p.x)<9.-p.y*.85)g=mix(vec3(.2,.155,.095),vec3(.4,.32,.2),fbm3(p*.9));
    g*=(mix(uZen,uHor,.6)*.55+uSunC*.5*smoothstep(-.03,.04,uEl))*1.4;
    g*=mix(${NIGHT_FLOOR},vec3(1.),uDay);
    float aerial=1.-smoothstep(145.,650.,length(p-cameraPosition.xz));
    gl_FragColor=vec4(fogged(g,vW,${EXPLORE_PAGE?'.0055':'.012'}),aerial);}`
}));
farGround.position.y = 0.19;
scene.add(farGround);

/* ---------------- sky dome ---------------- */
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 48, 24), new THREE.ShaderMaterial({
  uniforms: U, side: THREE.BackSide, depthWrite: false,
  vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;gl_Position.z=gl_Position.w*.99999;}`,
  fragmentShader: COMMON_U + NOISE + `varying vec3 vW;
  void main(){
    vec3 rd=normalize(vW-cameraPosition);float y=rd.y;
    float sd=max(dot(rd,uSunDir),0.);float up=smoothstep(-.02,.01,uEl);
    vec3 col=mix(uHor,uZen,pow(clamp(y,0.,1.),.55));
    col+=uSunC*pow(sd,6.)*(.25+.5*uGold)*smoothstep(-.14,0.,uEl);
    col+=uSunC*exp(-abs(y)*14.)*pow(sd,2.)*uGold*.6;
    col+=uSunC*smoothstep(.99982,.99992,sd)*2.2*up+uSunC*pow(sd,900.)*1.2*up;
    if(y>0.){vec2 sp=vec2(atan(rd.x,-rd.z),y)*260.;vec2 c=floor(sp);float hs=h1(c);vec2 o=vec2(h1(c+3.1),h1(c+7.7))*.8+.1;
      float st=step(.985,hs)*smoothstep(.09,0.,length(fract(sp)-o));
      col+=vec3(st)*uNight*(.5+.5*h1(c+1.))*smoothstep(0.,.2,y)*(.75+.25*sin(uT*1.7+hs*60.));
      col+=nightHorizon(rd);
      col+=vec3(.09,.05,.025)*uNight*exp(-y*9.)*(.6+.4*smoothstep(-.6,.6,rd.x));
      float t=900./max(y,.02);vec2 cp=(rd.xz*t)*.0011+uWindDir.xz*uT*${EXPLORE_PAGE?'.0027':'.0009'}*(2.+uWind);
      float cc=${EXPLORE_PAGE?'mix(fbm(cp),fbm(cp*1.17+vec2(uT*.0031,-uT*.0023)),.35)':'fbm(cp)'};float cov=mix(.7,.36,uCloud);float cm=smoothstep(cov,cov+.22,cc)*smoothstep(0.,.16,y);
      vec3 lit=mix(vec3(.05,.06,.09),mix(vec3(.55,.32,.28),vec3(.92,.92,.95),smoothstep(.1,.5,uEl)),uDay)+uSunC*pow(sd,4.)*uGold*1.2;
      col=mix(col,mix(lit*.45,lit,smoothstep(cov,cov+.5,cc)),cm*.9);}
    // One trail passes above the final heading as the night camera settles.
    if(uNight>.05 && uStarAge<1.2 && rd.z<0.){
      vec2 uv=rd.xy/max(.15,-rd.z);
      vec2 axis=normalize(vec2(.88,-.38));
      vec2 v=uv-(vec2(-.26,.93)+axis*uStarAge*.74);
      float along=dot(v,axis),width=abs(dot(v,vec2(-axis.y,axis.x)));
      float tail=smoothstep(-.20,0.,along)*(1.-smoothstep(-.001,.004,along));
      col+=vec3(.72,.84,.97)*tail*(1.-smoothstep(.0004,.0034,width))*uNight*smoothstep(0.,.12,uStarAge)*(1.-smoothstep(.72,1.15,uStarAge));
    }
    if(uLightning>.001 && rd.y>0.) {
      float az=atan(rd.x,-rd.z)-uStrikeAngle;
      float dx=atan(sin(az),cos(az));
      float bend=.018*sin(rd.y*52.+uStrikeAngle)+.006*sin(rd.y*171.);
      float bolt=(1.-smoothstep(.001,.006,abs(dx-bend)))*smoothstep(.017,.08,rd.y)*(1.-smoothstep(.22,.32,rd.y));
      float glow=exp(-dx*dx*1.7-(rd.y-.24)*(rd.y-.24)*8.);
      col+=uLightning*vec3(.56,.64,.82)*(.06+.52*glow+bolt);
    }
    gl_FragColor=vec4(col,1.);
  }`
}));
sky.renderOrder = -10;
scene.add(sky);

// The far tree line meets the field at its actual elevation. Its silhouette
// follows the horizon from the bank, the waterline and the high ending camera.
const treeLine = new THREE.Mesh(new THREE.CylinderGeometry(155,155,12,160,1,true),new THREE.ShaderMaterial({
  uniforms:U,side:THREE.BackSide,
  vertexShader:`varying vec3 land;void main(){vec4 w=modelMatrix*vec4(position,1.);land=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:COMMON_U+NOISE+`varying vec3 land;void main(){
    float a=atan(land.x,-land.z);
    float canopy=1.5+4.3*fbm3(land.xz*.058)+1.25*n2(land.xz*.44)+.6*n2(land.xz*1.62);
    if(land.y>canopy) discard;
    float detail=fbm3(vec2(a*86.,land.y*.55));
    vec3 distant=mix(vec3(.018,.024,.023),uHor*.46, .31+.40*detail);
    float aerial=smoothstep(.045,.105,-normalize(land-cameraPosition).y);
    vec3 base=mix(distant*mix(.40,.94,uDay),uHor*mix(.55,.9,uDay)*.90,aerial*(1.-smoothstep(.15,3.,land.y))*.94);
    gl_FragColor=vec4(base,1.);
  }`
}));
treeLine.position.y=6.10; scene.add(treeLine);

/* ---------------- material for solid props, with optional wind sway ---------------- */
function propMat(base, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms: Object.assign({ uBase: { value: base }, uSpec: { value: opts.spec || 0 } }, U),
    vertexShader: COMMON_U + `attribute float flex;attribute float phase;varying vec3 vN;varying vec3 vW;
    void main(){
      vec3 p=position;
      #ifdef SWAY
      float sway=uWindAmp*(.65*sin(uT*1.05+phase*.7+p.y*.11)+.35*sin(uT*2.3+phase*1.9)+uGustE*.9);
      vec3 side=normalize(vec3(-uWindDir.z,0.,uWindDir.x));
      p+=uWindDir*flex*(uWindAmp*.55+sway)+side*flex*flex*uWindAmp*.35*sin(uT*4.1+phase*3.);
      #endif
      vec4 w=modelMatrix*vec4(p,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);
      gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: COMMON_U + NOISE + FOG + `uniform vec3 uBase;uniform float uSpec;varying vec3 vN;varying vec3 vW;
    void main(){
      vec3 n=normalize(vN);vec3 L=normalize(uSunDir);vec3 V=normalize(cameraPosition-vW);
      float dif=max(dot(n,L),0.)*smoothstep(-.03,.05,uEl);
      vec3 base=uBase;
      #ifdef GRAIN
      base*=.75+.5*n2(vec2(vW.y*40.,atan(n.x,n.z)*3.))*n2(vW.xz*9.+vW.y*.7); // weathered grain
      #endif
      vec3 amb=mix(uZen,uHor,.5)*.45;
      vec3 c=base*(amb+uSunC*dif*(.45+.8*uGold));
      c+=uSunC*base*2.*pow(1.-abs(dot(n,V)),3.)*uGold*.45;
      c+=uSunC*uSpec*pow(max(dot(reflect(-L,n),V),0.),30.)*smoothstep(-.03,.05,uEl);
      c*=mix(.25,1.,uDay);
      gl_FragColor=vec4(fogged(c,vW,.008),1.);}`,
    defines: Object.assign({}, opts.sway ? { SWAY: '' } : {}, opts.grain ? { GRAIN: '' } : {})
  });
}
function withFlex(g, flex = 0, phase = 0) {
  const n = g.attributes.position.count;
  g.setAttribute('flex', new THREE.BufferAttribute(new Float32Array(n).fill(flex), 1));
  g.setAttribute('phase', new THREE.BufferAttribute(new Float32Array(n).fill(phase), 1));
  if (g.attributes.uv) g.deleteAttribute('uv');
  return g.index ? g.toNonIndexed() : g;
}

/* ---------------- the bare oak on its point of land ---------------- */
const {group: tree, debug: oakDebug} = buildOak(THREE, {
  uniforms:U, terrain, x:TREE.x, z:TREE.y, reduced:reduce
});
scene.add(tree);
const jay = buildFieldBird(THREE,{tree,uniforms:U,reduced:reduce});
scene.add(jay.group);

// Interpolate the actual terrain triangle under each foundation sample.
function groundSurface(x,z) {
  const {widthSegments:n,heightSegments:m} = terrainGeo.parameters;
  const gx = (x-C.x+EXT/2)*n/EXT, gz = (z-C.y+EXT/2)*m/EXT;
  const ix=Math.floor(gx), iz=Math.floor(gz);
  if(ix<0 || iz<0 || ix>=n || iz>=m) return H(x,z);
  const u=gx-ix, v=gz-iz, a=iz*(n+1)+ix;
  const p=terrainGeo.attributes.position, b=p.getY(a+1), c=p.getY(a+n+1);
  return u+v<=1 ? (1-u-v)*p.getY(a)+u*b+v*c : (u+v-1)*p.getY(a+n+2)+(1-v)*b+(1-u)*c;
}
const station = buildFieldStation({THREE,height:groundSurface,uniforms:U});
scene.add(station.group);
const aircraft=fieldDrones(THREE,groundSurface,U,reduce);scene.add(aircraft.object,aircraft.course);
const instruments=outdoorInstruments(THREE,groundSurface,station,aircraft.course.material,reduce);
scene.add(instruments.group);
let activeTool='story',detailOpen=false,detailWeight=0,windSource='Sample wind',exploreDrones=true;   // Explore: Labcoon's brain grounds them in bad weather
const detailEye=new THREE.Vector3(),detailAim=new THREE.Vector3(),detailQ=new THREE.Quaternion();
U.uCourseBake.value=new THREE.TextureLoader().load(new URL('./img/course-beams.png',import.meta.url).href);
U.uCourseBake.value.flipY=false;
const stationCos=Math.cos(station.yaw), stationSin=Math.sin(station.yaw);
function onStationPad(x,z) {
  const dx=x-station.group.position.x, dz=z-station.group.position.z;
  return Math.abs(dx*stationCos-dz*stationSin)<station.padHalfWidth+.08 &&
    Math.abs(dx*stationSin+dz*stationCos)<station.padHalfDepth+.08;
}

/* ---------------- pole line ---------------- */
const lineDir = new THREE.Vector3(0.64, 0, 0.77).normalize();
const lineBase = new THREE.Vector3(-7, 0, -20);             // the pole you see beside the pond
const PHI = Math.atan2(lineDir.x, lineDir.z);                // local +Z runs along the line
const armDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), PHI); // crossarm, square across the line
const SPAN = 40, POLES = 9;
const HP = 10.4;                                             // above grade
const ARM_Y = HP - 0.35, ARM_TOP = ARM_Y + 0.057, INS_H = 0.17, ARM_Z = 0.14; // arm bolted to the pole's face
// attachment points in pole space (x across the line, y up)
const ATT = {
  a: new THREE.Vector3(-1.07, ARM_TOP + INS_H, ARM_Z), b: new THREE.Vector3(-0.36, ARM_TOP + INS_H, ARM_Z), c: new THREE.Vector3(1.07, ARM_TOP + INS_H, ARM_Z),
  n: new THREE.Vector3(0.36, ARM_Y - 1.3, 0), com: new THREE.Vector3(-0.13, 5.5, 0)
};
const insulatorGeo = new THREE.LatheGeometry([[0.0, 0], [0.028, 0], [0.03, 0.03], [0.062, 0.05], [0.058, 0.07], [0.034, 0.085], [0.052, 0.1], [0.05, 0.12], [0.03, 0.15], [0.026, 0.17], [0, 0.17]].map(([x, y]) => new THREE.Vector2(x, y)), 10);
const woodParts = [], porcelain = [], metal = [], staticLines = [];
const poleFrames = [], fuseParts = [];
for (let k = 0; k < POLES; k++) {
  const p = lineBase.clone().addScaledVector(lineDir, (k - (POLES - 2)) * SPAN);
  const gy = H(p.x, p.z);
  const M = new THREE.Matrix4().makeRotationY(PHI).premultiply(new THREE.Matrix4().makeTranslation(p.x, gy, p.z))
    .multiply(new THREE.Matrix4().makeRotationZ((rnd() - 0.5) * 0.025)); // a little lean, like real poles
  poleFrames.push(M);
  const pole = new THREE.CylinderGeometry(0.095, 0.135, HP + 0.3, 12, 6); pole.translate(0, (HP + 0.3) / 2 - 0.3, 0);
  const cap = new THREE.CylinderGeometry(0.0, 0.1, 0.06, 12); cap.translate(0, HP + 0.03, 0);       // weathered top cut
  const arm = new THREE.BoxGeometry(2.44, 0.114, 0.089); arm.translate(0, ARM_Y, ARM_Z);             // bolted to the face of the pole
  const braces = [-1, 1].map(s => { const b = new THREE.BoxGeometry(0.75, 0.035, 0.008); b.rotateZ(s * 0.62); b.translate(s * 0.3, ARM_Y - 0.24, 0.1); return b; });
  const bracket = new THREE.BoxGeometry(0.36, 0.05, 0.05); bracket.translate(0.18, ARM_Y - 1.3 - 0.06, 0);
  woodParts.push(...[pole, cap, arm].map(g => withFlex(g).applyMatrix4(M)));
  metal.push(...[...braces, bracket].map(g => withFlex(g).applyMatrix4(M)));
  // insulators: three pins on the arm, one on the neutral bracket
  [ATT.a, ATT.b, ATT.c].forEach(a => { const g = insulatorGeo.clone(); g.translate(a.x, ARM_TOP, ARM_Z); porcelain.push(withFlex(g).applyMatrix4(M)); });
  { const g = insulatorGeo.clone().scale(0.7, 0.7, 0.7); g.translate(ATT.n.x, ATT.n.y - 0.12, 0); porcelain.push(withFlex(g).applyMatrix4(M)); }
  { const g = new THREE.BoxGeometry(0.06, 0.1, 0.06); g.translate(ATT.com.x, ATT.com.y - 0.04, 0); metal.push(withFlex(g).applyMatrix4(M)); } // comms clamp
  // ground wire stapled down the pole
  staticLines.push([new THREE.Vector3(0.02, HP, -0.105), new THREE.Vector3(0.02, 0, -0.14)].map(v => v.applyMatrix4(M)));
  if (k % 3 === 1) { // pole-mounted transformer with a fused cutout tapped off phase C
    const can = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16); can.translate(0, ARM_Y - 2.6, -0.42);
    const lid = new THREE.CylinderGeometry(0.27, 0.27, 0.05, 16); lid.translate(0, ARM_Y - 2.18, -0.42);
    const bush = [-0.1, 0.1].map(x => { const b = new THREE.CylinderGeometry(0.025, 0.035, 0.16, 8); b.translate(x, ARM_Y - 2.08, -0.42); return b; });
    const hanger = new THREE.BoxGeometry(0.08, 0.6, 0.18); hanger.translate(0, ARM_Y - 2.5, -0.2);
    const fuse = buildPoleCutout(THREE, ARM_Y, ARM_Z, ATT.c, new THREE.Vector3(.1,ARM_Y-2,-.42));
    metal.push(...[can,lid,hanger,...fuse.steel].map(g => withFlex(g).applyMatrix4(M)));
    porcelain.push(...[...bush,...fuse.porcelain].map(g => withFlex(g).applyMatrix4(M)));
    fuseParts.push(...fuse.dark.map(g => withFlex(g).applyMatrix4(M)));
  }
}
scene.add(new THREE.Mesh(mergeGeometries(fuseParts), propMat(lin(.080,.066,.052), {spec:.16})));
scene.add(new THREE.Mesh(mergeGeometries(woodParts), propMat(lin(0.115, 0.095, 0.078), { grain: true })));
scene.add(new THREE.Mesh(mergeGeometries(porcelain), propMat(lin(0.42, 0.44, 0.42), { spec: 0.6 })));
scene.add(new THREE.Mesh(mergeGeometries(metal), propMat(lin(0.16, 0.17, 0.17), { spec: 0.35 })));
const lineMat = new THREE.ShaderMaterial({
  uniforms: U,
  vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader: COMMON_U + FOG + `varying vec3 vW;void main(){vec3 c=mix(vec3(.028,.025,.022),uSunC*.45,uGold*.22)*mix(.4,1.,uDay);gl_FragColor=vec4(fogged(c,vW,.006),1.);}`
});
{ const pts = []; staticLines.forEach(l => { for (let i = 0; i < l.length - 1; i++) pts.push(l[i], l[i + 1]); });
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lineMat)); }

// wires: every conductor starts and ends on its own insulator or clamp
const WIRE_PTS = small ? 30 : 48;
const wires = [];
const kinds = [['a', 0.85, 1.0], ['b', 0.82, 1.0], ['c', 0.88, 1.0], ['n', 0.95, 0.85], ['com', 1.35, 0.6]];
for (let k = 0; k < POLES - 1; k++) {
  kinds.forEach(([key, sag, heavy]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(WIRE_PTS * 3), 3));
    const line = new THREE.Line(g, lineMat); line.frustumCulled = false; scene.add(line);
    wires.push({ line, a: ATT[key].clone().applyMatrix4(poleFrames[k]), b: ATT[key].clone().applyMatrix4(poleFrames[k + 1]), sag: sag * (0.9 + rnd() * 0.2), heavy, ph: rnd() * 6.28, ph2: rnd() * 6.28 });
  });
}
const tmp = new THREE.Vector3();
function updateWires(t, amp, gustE) {
  const crossWind = THREE.MathUtils.clamp(U.uWindDir.value.dot(armDir), -1, 1);
  for (const w of wires) {
    const arr = w.line.geometry.attributes.position.array;
    const swing = amp * w.heavy * (0.62 * Math.sin(t * 1.9 + w.ph) + 0.28 * Math.sin(t * 4.3 + w.ph2) + gustE * 0.8);
    const bow = amp * 0.9 * crossWind * w.heavy, bounce = amp * 0.12 * Math.sin(t * 2.6 + w.ph2);
    for (let i = 0; i < WIRE_PTS; i++) {
      const s = i / (WIRE_PTS - 1), prof = 4 * s * (1 - s);
      tmp.lerpVectors(w.a, w.b, s);
      tmp.y -= w.sag * prof + bounce * prof;
      tmp.addScaledVector(armDir, (bow + swing) * prof);
      arr[i * 3] = tmp.x; arr[i * 3 + 1] = tmp.y; arr[i * 3 + 2] = tmp.z;
    }
    w.line.geometry.attributes.position.needsUpdate = true;
  }
}

/* ---------------- stubble and cattails ---------------- */
// Cut only foreground vegetation covering the followed animal. The vertex stage discards
// whole blades/clumps together; the little opening has irregular edges as the wind blows.
const followFoliage = EXPLORE_PAGE ? `uniform vec4 uFollowSubject,uDrainAxis;
  bool coversLabcoon(vec3 base) {
    vec2 local=base.xz-uDrainAxis.xy, axis=uDrainAxis.zw;
    float along=dot(local,axis), across=abs(dot(local,vec2(axis.y,-axis.x)));
    if(dot(axis,axis)>.5 && along>-.72 && along<1.18 && across<.41+.12*along)return true;
    vec2 segment=uFollowSubject.xz-cameraPosition.xz;
    float t=dot(base.xz-cameraPosition.xz,segment)/max(dot(segment,segment),.0001);
    vec2 offset=base.xz-cameraPosition.xz-clamp(t,0.,1.)*segment;
    return uFollowSubject.w>.5 && t>-.18 && t<1.20 && length(offset)<mix(.17,.46,clamp(t,0.,1.));
  }` : '';
const clearFollowLeaf = EXPLORE_PAGE ? 'if(coversLabcoon(b.xyz)) gl_Position=vec4(2.,2.,2.,1.);' : '';

const bendGLSL = `float bendAmt(float f,vec3 base){return f*f*(uWindAmp*1.5*(.6+.4*sin(uT*2.4+base.x*.7+base.z*.43)+uGustE*.6)+.04);}`;
{
  const N = EXPLORE_PAGE ? (small ? 6500 : 15000) : small ? 2600 : 6000;
  // corn-stalk stubble and dry foxtail: narrow blades that taper to a point
  const blade = new THREE.PlaneGeometry(0.014, 0.4, 1, 4); blade.translate(0, 0.2, 0);
  { const p = blade.attributes.position; for (let v = 0; v < p.count; v++) { const f = p.getY(v) / 0.4; p.setX(v, p.getX(v) * (1 - f * 0.92)); } }
  const grass = new THREE.InstancedMesh(blade, new THREE.ShaderMaterial({
    uniforms: U, side: THREE.DoubleSide,
    vertexShader: COMMON_U + followFoliage + bendGLSL + `varying float vH;varying vec3 vW;
      void main(){vH=uv.y;vec4 b=instanceMatrix*vec4(0.,0.,0.,1.);float bend=bendAmt(uv.y,b.xyz);
        vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);w.xyz+=uWindDir*bend;w.y-=bend*.25;vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;${clearFollowLeaf}}`,
    fragmentShader: COMMON_U + FOG + `varying float vH;varying vec3 vW;
      void main(){vec3 c=mix(vec3(.11,.085,.05),vec3(.36,.29,.18),vH);vec3 a0=c;c*=mix(${NIGHT_FLOOR}*.85,vec3(1.),uDay);c+=a0*${MOON_ADD}*uNight*(.5+.5*vH);c+=${LAMP('a0')};c+=uSunC*vH*uGold*.3;gl_FragColor=vec4(fogged(c,vW,.02),1.);}`
  }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  let placed = 0, guard = 0;
  while (placed < N && guard++ < N * 10) {
    const r = 1 + Math.pow(rnd(), EXPLORE_PAGE ? 1.15 : 1.6) * (EXPLORE_PAGE ? 40 : 26), a = rnd() * Math.PI * 2;
    pos.set(Math.sin(a) * r, 0, 2 - Math.cos(a) * r);
    const h = H(pos.x, pos.z); if (h < 0.1 || onStationPad(pos.x,pos.z)) continue;
    pos.y = h - 0.02;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (rnd() - 0.5) * 0.5));
    const s = 0.6 + rnd() * 0.9;
    const cut=Math.abs(pos.x+1.55)<3.7 && Math.abs(pos.z-7.85)<5.8;
    sc.set(s, s * (0.7 + rnd() * 0.8)*(cut?.12:1), s);
    m.compose(pos, q, sc); grass.setMatrixAt(placed++, m);
  }
  grass.count = placed; grass.frustumCulled = false; scene.add(grass);
}
{ // cattail clumps in the shallows: curved leaves, a stem and the brown head (Typha latifolia, ~1.2-2 m)
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.PlaneGeometry(0.022, 1.25, 1, 6); g.translate(0, 0.625, 0);
    const p = g.attributes.position;
    for (let v = 0; v < p.count; v++) { const f = p.getY(v) / 1.25; p.setZ(v, p.getZ(v) + f * f * 0.28); p.setX(v, p.getX(v) * (1 - f * 0.85)); }
    g.rotateY(i / 4 * Math.PI * 2 + 0.4); g.scale(1, 0.8 + (i % 2) * 0.35, 1); parts.push(g);
  }
  const stem = new THREE.CylinderGeometry(0.004, 0.006, 1.45, 4); stem.translate(0, 0.725, 0); parts.push(stem);
  const head = new THREE.CylinderGeometry(0.02, 0.02, 0.17, 8); head.translate(0, 1.36, 0); parts.push(head);
  const tip = new THREE.CylinderGeometry(0.0, 0.004, 0.12, 4); tip.translate(0, 1.5, 0); parts.push(tip);
  const clump = mergeGeometries(parts.map((g, i) => {
    g = g.index ? g.toNonIndexed() : g; if (g.attributes.uv) g.deleteAttribute('uv');
    g.setAttribute('part', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(i < 4 ? 0 : i === 5 ? 2 : 1), 1));
    return g;
  }));
  const N = small ? 260 : 520;
  const reeds = new THREE.InstancedMesh(clump, new THREE.ShaderMaterial({
    uniforms: U, side: THREE.DoubleSide,
    vertexShader: COMMON_U + followFoliage + bendGLSL + `attribute float part;varying float vH;varying float vP;varying vec3 vW;varying vec3 vN;
      void main(){vH=position.y/1.5;vP=part;vec4 b=instanceMatrix*vec4(0.,0.,0.,1.);float bend=bendAmt(vH,b.xyz)*.9;
        vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);w.xyz+=uWindDir*bend;w.y-=bend*.2;vW=w.xyz;vN=normalize(mat3(instanceMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;${clearFollowLeaf}}`,
    fragmentShader: COMMON_U + FOG + `varying float vH;varying float vP;varying vec3 vW;varying vec3 vN;
      void main(){vec3 c=vP<.5?mix(vec3(.16,.12,.07),vec3(.45,.37,.22),vH):vP<1.5?vec3(.3,.25,.15):vec3(.17,.09,.045);vec3 a0=c;
        float dif=abs(dot(normalize(vN),normalize(uSunDir)))*smoothstep(-.03,.05,uEl);
        c*=(mix(uZen,uHor,.6)*.6+uSunC*dif*.7);c+=uSunC*vH*uGold*.12;c*=mix(${NIGHT_FLOOR},vec3(1.),uDay);c+=a0*${MOON_ADD}*uNight;c+=${LAMP('a0')};gl_FragColor=vec4(fogged(c,vW,.012),1.);}`
  }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  let placed = 0, guard = 0;
  while (placed < N && guard++ < N * 60) {
    const a = rnd() * Math.PI * 2, r = 0.75 + rnd() * 0.45;
    pos.set(C.x + Math.cos(a) * R.x * r, 0, C.y + Math.sin(a) * R.y * r);
    const h = H(pos.x, pos.z); if (h > 0.06 || h < -0.3 || onStationPad(pos.x,pos.z)) continue;
    if (Math.abs(pos.x) < 4.5 && pos.z > -16 && pos.z < -9) continue; // keep open water under the dive
    if (fb(pos.x * 0.4, pos.z * 0.4) < 0.45) continue;               // reeds grow in patches
    pos.y = h;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (rnd() - 0.5) * 0.25));
    const s = 0.8 + rnd() * 0.45; sc.set(s, s, s);
    m.compose(pos, q, sc); reeds.setMatrixAt(placed++, m);
  }
  reeds.count = placed; reeds.frustumCulled = false; scene.add(reeds);
}

/* ---------------- standing corn beyond the pond ----------------
   Unharvested field corn in late November (Zea mays, dry-down): stalks
   2.2-2.8 m, rows 30 in (0.76 m) apart, ~0.22 m between plants, leaves dried
   tan and drooping, one ear hanging at ~1.1 m in its husk, tassel on top.
   Only planted where the camera can see it (a wedge across the far bank). */
const corn = (() => {
  const parts = [];
  const tag = (g, part, tipFn) => {
    g = g.index ? g.toNonIndexed() : g; if (g.attributes.uv) g.deleteAttribute('uv');
    const n = g.attributes.position.count, pa = new Float32Array(n).fill(part), tp = new Float32Array(n);
    for (let i = 0; i < n; i++) tp[i] = tipFn ? tipFn(g.attributes.position, i) : 0;
    g.setAttribute('part', new THREE.BufferAttribute(pa, 1)); g.setAttribute('tip', new THREE.BufferAttribute(tp, 1));
    return g;
  };
  const stalk = new THREE.CylinderGeometry(0.009, 0.016, 2.4, 4, 3); stalk.translate(0, 1.2, 0); parts.push(tag(stalk, 0));
  for (let i = 0; i < 6; i++) { // leaves alternate up the stalk, arch out and droop
    const L = 0.62 + (i < 3 ? 0.12 : -0.05 * (i - 3)), y0 = 0.45 + i * 0.3;
    const g = new THREE.PlaneGeometry(0.07, L, 1, 4); g.translate(0, L / 2, 0);
    const p = g.attributes.position;
    for (let v = 0; v < p.count; v++) {
      const f = p.getY(v) / L, wdt = 1 - f * 0.9;
      const ang = 0.5 + f * 1.9; // rises then curls down as it dries
      p.setX(v, p.getX(v) * wdt + (v % 2 ? 0.006 : -0.006) * f); // a little twist
      p.setZ(v, Math.sin(ang) * f * L * 0.9);
      p.setY(v, Math.cos(ang) * f * L * 0.55 + f * 0.12);
    }
    g.rotateY(i * 2.6 + 0.3); g.translate(0, y0, 0);
    parts.push(tag(g, 1, (pp, v) => Math.min(1, Math.hypot(pp.getX(v), pp.getZ(v)) / (L * 0.8))));
  }
  const ear = new THREE.CylinderGeometry(0.022, 0.03, 0.24, 6); ear.translate(0, -0.12, 0); ear.rotateZ(2.4); ear.translate(0.03, 1.12, 0); parts.push(tag(ear, 2));
  const tassel = new THREE.ConeGeometry(0.06, 0.34, 4, 1, true); tassel.translate(0, 2.55, 0); parts.push(tag(tassel, 3));
  const geo = mergeGeometries(parts);
  // where it grows
  const pts = [], spacing = EXPLORE_PAGE ? (small ? 0.5 : 0.32) : small ? 0.3 : 0.22, rowGap = 0.76, rowAng = 0.12;
  const ca = Math.cos(rowAng), sa = Math.sin(rowAng);
  for (let rz = EXPLORE_PAGE ? 44 : -24; rz > (EXPLORE_PAGE ? -56 : -50); rz -= rowGap) {
    for (let rx = -48; rx < 48; rx += spacing) {
      const x = rx * ca - rz * sa + (rnd() - 0.5) * 0.06, z = rx * sa + rz * ca + (rnd() - 0.5) * 0.05;
      if (EXPLORE_PAGE) {
        // Explore walks all the way round: a ring of corn from the clearing out to the
        // terrain edge, thinning raggedly at its inner edge, with the farm lane cut through it.
        if (Math.abs(x - C.x) > EXT / 2 - .6 || Math.abs(z - C.y) > EXT / 2 - .6) continue;
        const e = Math.hypot(x / 27, (z + 8) / 25);
        if (e < 1 || (e < 1.14 && rnd() > (e - 1) / .14)) continue;
        if (Math.abs(x + 17.4) < 2.3) continue;
        // An unplanted field margin opens toward the eastern woods between the rows.
        if(x>20 && Math.abs(z+11.2+.04*(x-20))<5.4+1.1*Math.sin(x*.21))continue;
      } else if (Math.abs(x) > 9 + (-z) * 0.85) continue;           // outside the view: don't plant
      if (pondMetric(x, z) < 1.42 || H(x, z) < 0.12) continue;      // keep back from the bank
      if (segDist(x, z, TREE, SPIT_END) < 4) continue;
      if (rnd() < 0.05) continue;                                   // gaps where plants failed
      pts.push(x, z);
    }
  }
  const N = pts.length / 2, mesh = new THREE.InstancedMesh(geo, new THREE.ShaderMaterial({
    uniforms: U, side: THREE.DoubleSide,
    vertexShader: COMMON_U + `attribute float part;attribute float tip;varying float vP;varying float vH;varying float vTip;varying vec3 vW;varying vec3 vN;
      void main(){vP=part;vTip=tip;vec4 b=instanceMatrix*vec4(0.,0.,0.,1.);
        vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);
        float f=clamp((w.y-b.y)/2.5,0.,1.);vH=f;
        float ph=b.x*.37+b.z*.29;
        float sway=uWindAmp*(1.1*(.55+.45*sin(uT*1.6+ph))+uGustE*.9)+.02;   // whole plants rock from the root
        w.xyz+=uWindDir*f*f*sway*1.3;w.y-=f*f*sway*.25;
        vec3 side=normalize(vec3(-uWindDir.z,0.,uWindDir.x));
        w.xyz+=(side*sin(uT*6.3+ph*3.+position.y*4.)+vec3(0.,1.,0.)*cos(uT*5.1+ph*2.))*tip*tip*uWindAmp*.12; // dry leaves flap
        vW=w.xyz;vN=normalize(mat3(instanceMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: COMMON_U + NOISE + FOG + `varying float vP;varying float vH;varying float vTip;varying vec3 vW;varying vec3 vN;
      void main(){
        float v=h1(floor(vW.xz*4.));
        vec3 c=vP<.5?mix(vec3(.2,.16,.1),vec3(.34,.27,.17),vH):vP<1.5?mix(vec3(.3,.24,.15),vec3(.48,.4,.27),v)*mix(.85,1.1,vTip):vP<2.5?vec3(.42,.36,.24):vec3(.38,.28,.16);
        vec3 n=normalize(vN);vec3 L=normalize(uSunDir);vec3 V=normalize(cameraPosition-vW);
        float up=smoothstep(-.03,.05,uEl);
        float dif=abs(dot(n,L))*up;
        float back=pow(max(dot(-V,L),0.),5.)*up*(vP>.5&&vP<1.5?1.:.35); // low sun shining through dry leaves
        vec3 a0=c;
        c=c*(mix(uZen,uHor,.6)*.55+uSunC*dif*.6)+c*uSunC*back*(.6+uGold);
        c*=mix(.45,1.,vH);                                   // darker down inside the rows
        c*=mix(${NIGHT_FLOOR},vec3(1.),uDay);c+=a0*${MOON_ADD}*uNight*mix(.45,1.,vH);c+=${LAMP('a0')};
        gl_FragColor=vec4(fogged(c,vW,.012),1.);}`
  }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const x = pts[i * 2], z = pts[i * 2 + 1];
    pos.set(x, H(x, z) - 0.03, z);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(rnd() - 0.5, 0, rnd() - 0.5).normalize(), (rnd() - 0.5) * 0.12));
    const s = 0.9 + rnd() * 0.22; sc.set(s, s, s);
    m.compose(pos, q, sc); mesh.setMatrixAt(i, m);
  }
  mesh.frustumCulled = false; scene.add(mesh);
  return { mesh, count: N };
})();

/* ---------------- ripple simulation (pond surface) ---------------- */
const SIM = small ? 256 : 384, SIM_SIZE = 11, SIM_Z = -13.2;
const simOpts = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping };
let simA = new THREE.WebGLRenderTarget(SIM, SIM, simOpts), simB = new THREE.WebGLRenderTarget(SIM, SIM, simOpts);
const simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), simScene = new THREE.Scene(), simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
simScene.add(simQuad);
const quadVS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const stepMat = new THREE.ShaderMaterial({
  uniforms: { tex: { value: null }, texel: { value: new THREE.Vector2(1 / SIM, 1 / SIM) }, damp: { value: 0.993 } }, vertexShader: quadVS,
  fragmentShader: `uniform sampler2D tex;uniform vec2 texel;uniform float damp;varying vec2 vUv;
    void main(){vec4 i=texture2D(tex,vUv);
      float avg=(texture2D(tex,vUv-vec2(texel.x,0.)).r+texture2D(tex,vUv+vec2(texel.x,0.)).r+texture2D(tex,vUv-vec2(0.,texel.y)).r+texture2D(tex,vUv+vec2(0.,texel.y)).r)*.25;
      i.g+=(avg-i.r)*2.;i.g*=damp;i.r+=i.g;float e=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));i.r*=smoothstep(0.,.04,e);gl_FragColor=i;}`
});
const dropMat = new THREE.ShaderMaterial({
  uniforms: { tex: { value: null }, c: { value: new THREE.Vector2() }, r: { value: 0.03 }, s: { value: 0.02 } }, vertexShader: quadVS,
  fragmentShader: `uniform sampler2D tex;uniform vec2 c;uniform float r,s;varying vec2 vUv;
    void main(){vec4 i=texture2D(tex,vUv);float d=max(0.,1.-length(c-vUv)/r);d=.5-cos(d*3.14159)*.5;i.r+=d*s;gl_FragColor=i;}`
});
function simPass(mat) { mat.uniforms.tex.value = simA.texture; simQuad.material = mat; renderer.setRenderTarget(simB); renderer.render(simScene, simCam); const t = simA; simA = simB; simB = t; }
const drops = [];

/* ---------------- floating oak leaves (drift with the wind, bob on ripples) ---------------- */
const leaves = (() => {
  const N = small ? 40 : 70;
  const g = new THREE.PlaneGeometry(0.11, 0.08).rotateX(-Math.PI / 2);
  const mesh = new THREE.InstancedMesh(g, new THREE.ShaderMaterial({
    uniforms: Object.assign({ tSim: { value: null }, uInk: { value: 0 } }, U), transparent: false,
    vertexShader: COMMON_U + `uniform sampler2D tSim;attribute float seed;varying vec2 vUv;varying float vS;varying vec3 vW;
      void main(){vUv=uv;vS=seed;
        vec4 b=instanceMatrix*vec4(0.,0.,0.,1.);
        vec2 drift=uWindDir.xz*uT*(.02+uWind*.0035);
        vec2 box=vec2(9.,7.);vec2 c=vec2(0.,-13.2);
        vec2 pos=c+mod(b.xz-c+drift+box*.5,box)-box*.5;
        float a=seed*6.28+uT*.05*(seed-.5);mat2 R=mat2(cos(a),-sin(a),sin(a),cos(a));
        vec3 lp=position;lp.xz=R*lp.xz*(.8+seed*.6);
        vec2 su=(pos-vec2(0.,${SIM_Z.toFixed(1)}))/${SIM_SIZE.toFixed(1)}+.5;float hh=texture2D(tSim,su).r;
        vec4 w=vec4(pos.x+lp.x,.004+hh*.02+lp.y,pos.y+lp.z,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: COMMON_U + `uniform float uInk;varying vec2 vUv;varying float vS;varying vec3 vW;
      void main(){if(vS<uInk*1.6)discard;vec2 p=vUv*2.-1.;float ang=atan(p.y,p.x);
        float r=.62+.2*cos(ang*7.+vS*3.)+.1*cos(ang*2.);       // lobed oak leaf
        if(length(p*vec2(1.,1.25))>r)discard;
        vec3 c=mix(vec3(.22,.1,.04),vec3(.36,.2,.07),vS)*(.75+.25*smoothstep(.0,.06,abs(p.y)));
        c*=mix(uZen,uHor,.5)*.6+uSunC*.6*smoothstep(-.03,.05,uEl);c*=mix(.12,1.,uDay);
        gl_FragColor=vec4(c,1.);}`
  }), N);
  const seeds = new Float32Array(N), m = new THREE.Matrix4();
  for (let i = 0; i < N; i++) { m.makeTranslation((rnd() - 0.5) * 9, 0, -13.2 + (rnd() - 0.5) * 7); mesh.setMatrixAt(i, m); seeds[i] = rnd(); }
  g.setAttribute('seed', new THREE.InstancedBufferAttribute(seeds, 1));
  mesh.frustumCulled = false; mesh.renderOrder = 3;
  scene.add(mesh);
  return mesh;
})();

/* ---------------- the pond surface ---------------- */
const reflRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
const mirrorCam = new THREE.PerspectiveCamera();
const texMat = new THREE.Matrix4();
const water = new THREE.Mesh(new THREE.PlaneGeometry(64, 64, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
  uniforms: Object.assign({
    tRefl: { value: reflRT.texture }, tSim: { value: null }, tDepth: { value: depthTex }, texMat: { value: texMat },
    uSimTexel: { value: new THREE.Vector2(1 / SIM, 1 / SIM) },
    entryAge:{value:9},entryOrigin:{value:new THREE.Vector2()},
    uInk: { value: 0 }, uInkC: { value: S.inkC }, uAccent: { value: lin(0xe8 / 255, 0x76 / 255, 0x3a / 255) }
  }, U),
  vertexShader: `uniform mat4 texMat;varying vec4 vR;varying vec3 vW;void main(){vR=texMat*vec4(position,1.);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader: COMMON_U + NOISE + FOG + `uniform sampler2D tRefl,tSim,tDepth;uniform vec2 uSimTexel,entryOrigin;uniform float entryAge,uInk;uniform vec2 uInkC;uniform vec3 uAccent;varying vec4 vR;varying vec3 vW;
  uniform float uRain;
  vec2 wave(vec2 p,vec2 d,float k,float sp,float a){float ph=dot(p,d)*k-uT*sp;return d*cos(ph)*a*k;}
  void main(){
    vec2 p=vW.xz;
    float depth=texture2D(tDepth,(p-vec2(${(C.x - EXT / 2).toFixed(2)},${(C.y - EXT / 2).toFixed(2)}))/${EXT.toFixed(1)}).r*2.;
    float dist=length(vW-cameraPosition);
    // ripples from the page
    vec2 su=(p-vec2(0.,${SIM_Z.toFixed(1)}))/${SIM_SIZE.toFixed(1)}+.5;vec2 g=vec2(0.);
    if(su.x>0.&&su.x<1.&&su.y>0.&&su.y<1.){
      float hl=texture2D(tSim,su-vec2(uSimTexel.x,0.)).r,hr=texture2D(tSim,su+vec2(uSimTexel.x,0.)).r;
      float hd=texture2D(tSim,su-vec2(0.,uSimTexel.y)).r,hu=texture2D(tSim,su+vec2(0.,uSimTexel.y)).r;
      g=vec2(hr-hl,hu-hd)*9.;}
    // wind: a mirror when calm; cat's-paw patches and capillary chop when it blows
    vec2 wd=normalize(uWindDir.xz+vec2(1e-4)),wp=vec2(-wd.y,wd.x);
    float wnd=clamp(uWind/20.,0.,1.);
    float paw=smoothstep(.38,.78,fbm3(p*.22-wd*uT*.5))*(.35+.65*wnd)+uGustE*.4*wnd;
    float rough=(.03+wnd*.9)*(.35+paw);
    float shelter=smoothstep(.0,.6,depth); // calmer in the shallows by the reeds
    vec2 wv=wave(p,wd,2.1,2.0,.05)+wave(p,normalize(wd+wp*.6),3.7,2.8,.035)+wave(p,normalize(wd-wp*.5),6.3,3.9,.02)+wave(p,normalize(wd+wp*1.3),11.,5.4,.012);
    g+=wv*rough*shelter*.6;
    g+=(vec2(n2(p*14.+uT*.9),n2(p*14.-uT*.8))-.5)*.03*rough*shelter;  // capillary chop
    g+=(vec2(n2(p*3.+uT*.12),n2(p*3.1-uT*.1))-.5)*.006;               // slow swell, never a perfect mirror
    g*=1./(1.+dist*.025);
    if(uRain>.005 && dist<15.) {
      vec2 cell=floor(p*3.3), offset=fract(p*3.3)-.5;
      offset-=.23*vec2(sin(dot(cell,vec2(12.8,4.1))),cos(dot(cell,vec2(7.3,23.2))));
      float t=fract(uT*1.6+n2(cell*2.3)), r=length(offset);
      float ring=1.-smoothstep(.012,.065,abs(r-t*.26));
      g+=uRain*.24*ring*(1.-t)*offset/max(r,.01)*(1.-smoothstep(6.,15.,dist));
    }
    // The breach sends a short-lived radial crest through the existing ripples.
    vec2 radial=p-uBreach; float radius=length(radial);
    float ring=radius-(.14+uSplashAge*1.45);
    float envelope=1.-smoothstep(0.,1.75,uSplashAge);
    float crest=exp(-ring*ring*95.)*envelope;
    g+=radial/max(.01,radius)*crest*sin(ring*23.)*.85;
    // Dome entry sends a train of short, expanding crests across the surface.
    vec2 hit=p-entryOrigin;float hR=length(hit),front=hR-(.065+entryAge*.78);
    float packet=exp(-pow((front+.047)/.105,2.))*(1.-smoothstep(.34,1.16,entryAge));
    g+=hit/max(.012,hR)*cos(64.*front)*packet*.43;
    vec3 n=normalize(vec3(-g.x,1.,-g.y));
    vec3 V=normalize(cameraPosition-vW);
    // reflection, softened by roughness
    vec4 r=vR;r.xy+=n.xz*r.w*.055;
    float bl=(.002+rough*.006)*r.w;
    vec3 refl=(texture2DProj(tRefl,r).rgb*2.+texture2DProj(tRefl,r+vec4(bl,0.,0.,0.)).rgb+texture2DProj(tRefl,r-vec4(bl,0.,0.,0.)).rgb+texture2DProj(tRefl,r+vec4(0.,bl*1.6,0.,0.)).rgb)/5.;
    float cosT=max(dot(V,n),0.);
    float fres=.02+.98*pow(1.-cosT,5.);
    float rw=mix(.32,1.,fres); // pond water: some reflection even looking down
    // into the water: murky green-brown, the mud bottom showing through the shallows
    float light=mix(.12,1.,uDay);
    vec3 murk=vec3(.03,.038,.026)*light*(mix(uZen,uHor,.5)*1.3+uSunC*.25*smoothstep(-.03,.05,uEl));
    vec3 bottom=mix(vec3(.06,.045,.03),vec3(.1,.08,.05),fbm3(p*2.5))*light*(mix(uZen,uHor,.6)*.8+uSunC*.5*smoothstep(-.03,.05,uEl));
    float path=depth/max(cosT,.15);
    vec3 trans=exp(-path*vec3(3.2,2.4,2.0));
    vec3 below=mix(murk,bottom,trans);
    vec3 col=mix(below,refl*.92,rw)+vec3(.43,.53,.50)*crest*.27;
    // sun glitter: many small facets on the chop, a path toward the sun
    vec3 L=normalize(uSunDir);vec3 H2=normalize(L+V);
    float nh=max(dot(n,H2),0.);
    float glit=(pow(nh,900.)*8.+pow(nh,160.)*1.2*rough)*mix(1.,.35,smoothstep(.15,.45,uEl));
    // Below grazing incidence the smooth mirror gives way to scattered,
    // sun-facing capillary crests. Break the band into short moving facets.
    vec2 solarAxis=normalize(L.xz+vec2(.0001)),crossAxis=vec2(-solarAxis.y,solarAxis.x);
    float alignment=max(0.,dot(-normalize(V.xz+vec2(.0001)),solarAxis));
    vec2 run=vec2(dot(p,crossAxis),dot(p,solarAxis));
    float crestNoise=n2(run*vec2(9.,14.)-vec2(uT*.16,uT*.42));
    float phase=run.y*105.+3.2*sin(run.x*13.4+run.y*6.1)+crestNoise*4.-uT*2.8;
    float breakup=n2(run*vec2(39.,26.)+vec2(uT*.23,-uT*.31));
    float facets=pow(.5+.5*cos(phase),9.)*smoothstep(.45,.79,crestNoise)*smoothstep(.30,.82,breakup);
    float resolved=1.-smoothstep(.55,2.6,fwidth(phase));
    glit+=pow(alignment,72.)*mix(.012,facets,resolved)*1.24*shelter*smoothstep(.13,.52,dist)
         *smoothstep(.04,.30,V.y)*(1.-smoothstep(.74,.98,V.y));
    col+=uSunC*glit*smoothstep(-.02,.03,uEl)*(.6+.4*uGold);
    // The strip of open night sky is also visible in the water. Tiny facets
    // break up its grazing reflection between the darker silhouettes.
    vec3 reflectedSky=reflect(-V,n);
    col+=nightHorizon(reflectedSky)*(.11+.54*mix(.05,facets,resolved))*
         smoothstep(.025,.16,reflectedSky.y)*shelter;
    // shoreline: a thin darker meniscus and floating scum where it meets the bank
    col*=mix(.75,1.,smoothstep(.0,.04,depth));
    // the orange ink spreading from a drop
    float d=length(p-uInkC);float edge=uInk*7.+(fbm3(p*1.6+uT*.15)-.5)*1.3*uInk;
    float ink=smoothstep(edge,edge-.9,d)*smoothstep(0.,.05,uInk);
    vec3 inkC=uAccent*(.86+.28*fres)+refl*.06+(n.x+n.z)*.5*uAccent;
    col=mix(col,inkC,ink)+packet*pow(max(0.,cos(front*64.)),5.)*vec3(.11,.16,.14);
    gl_FragColor=vec4(fogged(col,vW,.008),1.);
  }`
}));
water.position.set(C.x, 0, C.y);
water.renderOrder = 2;
scene.add(water);

const reflPlane = new THREE.Plane(), clip = new THREE.Vector4(), qv = new THREE.Vector4();
const nrm = new THREE.Vector3(0, 1, 0), wpos = new THREE.Vector3(), cpos = new THREE.Vector3(), rot = new THREE.Matrix4(), look = new THREE.Vector3(), view = new THREE.Vector3(), target = new THREE.Vector3();
function renderReflection() {
  cpos.setFromMatrixPosition(camera.matrixWorld);
  rot.extractRotation(camera.matrixWorld);
  look.set(0, 0, -1).applyMatrix4(rot).add(cpos);
  wpos.set(0, 0, 0);
  view.subVectors(wpos, cpos).reflect(nrm).negate().add(wpos);
  target.subVectors(wpos, look).reflect(nrm).negate().add(wpos);
  mirrorCam.position.copy(view);
  mirrorCam.up.set(0, 1, 0).applyMatrix4(rot).reflect(nrm);
  mirrorCam.lookAt(target);
  mirrorCam.far = camera.far; mirrorCam.near = camera.near;
  mirrorCam.updateMatrixWorld();
  mirrorCam.projectionMatrix.copy(camera.projectionMatrix);
  texMat.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
  texMat.multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse).multiply(water.matrixWorld);
  reflPlane.setFromNormalAndCoplanarPoint(nrm, wpos).applyMatrix4(mirrorCam.matrixWorldInverse);
  clip.set(reflPlane.normal.x, reflPlane.normal.y, reflPlane.normal.z, reflPlane.constant);
  const pm = mirrorCam.projectionMatrix.elements;
  qv.x = (Math.sign(clip.x) + pm[8]) / pm[0]; qv.y = (Math.sign(clip.y) + pm[9]) / pm[5]; qv.z = -1; qv.w = (1 + pm[10]) / pm[14];
  clip.multiplyScalar(2 / clip.dot(qv));
  pm[2] = clip.x; pm[6] = clip.y; pm[10] = clip.z + 1 - 0.003; pm[14] = clip.w;
  water.visible = false; leaves.visible = false;
  renderer.setRenderTarget(reflRT); renderer.clear(); renderer.render(scene, mirrorCam);
  renderer.setRenderTarget(null);
  water.visible = true; leaves.visible = true;
}

/* ---------------- camera: stand on the bank, then tip over the water ---------------- */
const pondShot=pondCamera(THREE,TREE);
const standPos=new THREE.Vector3(),diveBase=pondShot.overlook;

const qStand = new THREE.Quaternion(), qDive = new THREE.Quaternion(), qTmp = new THREE.Quaternion(), m4 = new THREE.Matrix4();
const hubEye=new THREE.Vector3(),hubLook=new THREE.Vector3(-4,.5,-5);
const hubQ=new THREE.Quaternion(),hubCamera=camera.clone();
const hubPlaces=[[-13.1,2.65,-4.4],[-7.2,1.2,-3.95],[2,.05,-12],[-1.8,1,8]];
function poseQuats() {
  const portrait = innerHeight > innerWidth;
  // Step back on a narrow screen so both wind indicators fit in the shot.
  const standZ=portrait ? THREE.MathUtils.clamp(7.7/camera.aspect-2.5,2,20) : 1.8;
  standPos.set(0,H(0,standZ)+1.62,standZ);
  m4.lookAt(standPos, new THREE.Vector3(portrait ? 1.6 : .2, portrait ? 2.7 : 6.4, portrait ? -32 : -40), new THREE.Vector3(0, 1, 0)); qStand.setFromRotationMatrix(m4);
  pondShot.frameOverlook(camera,qDive);

  camera.fov = portrait ? 62 : 48; camera.updateProjectionMatrix();
  const distance=THREE.MathUtils.clamp(19/camera.aspect,18,54);
  hubEye.set(6+distance*.23,8+distance*.32,8+distance*.76);
  hubCamera.copy(camera);hubCamera.position.copy(hubEye);hubCamera.lookAt(hubLook);hubCamera.updateMatrixWorld();
  hubQ.copy(hubCamera.quaternion);
}
poseQuats();
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const mid = new THREE.Vector3(0, 3.3, -5.5), pa = new THREE.Vector3(), pb = new THREE.Vector3();
let reportFilmApproach,reportedUnder=-1;
let filmTravel=0;
let room, loadingRoom, filmCanvas, filmList, starArmed=true;
const port=createPondPort(scene,pondShot.contact);
let crossingLatched=false, forwardCross=false, immersionStroke=0, previousEyeHeight=3;
const entryDirection=new THREE.Vector3();
const roomPos=new THREE.Vector3(0,-1.4,-11.6), roomTarget=new THREE.Vector3(0,-1.4,-10);
function prepareFilmRoom() {
  if (!loadingRoom) loadingRoom = import('./underwater.js?v=21').then(({buildFilmRoom}) => {
    room = buildFilmRoom({height:H, uniforms:U, simSize:SIM_SIZE, simZ:SIM_Z, reduced:reduce});
    port.impact.attach(room.scene);
    if (filmCanvas) room.setSource(filmCanvas,filmList);
    room.stations.setTravel(filmTravel);
  }).catch(error => {
    document.documentElement.classList.add('no-film-world');
    console.warn('Film room unavailable', error);
    reportFilmApproach?.(S.underT);
  });
}
const stationCamera=fieldStationCamera(THREE,station);
let renderStationControls=null,stationRevision=0,fieldExitListener=null;
let hubWeight=0;
const windEye=new THREE.Vector3(),windSight=new THREE.Vector3(),windRotation=new THREE.Quaternion();
const flightFrom=new THREE.Vector3(),flightRotation=new THREE.Quaternion(),flightAim=new THREE.Vector3();
let landmarkBlend=1,landmarkPlace=0,landmarkLight=0;
function approachLandmark(t){
  landmarkBlend=t;
  landmarkLight=1-ss(.12,.91,t);
  setSun(fieldSun,fieldBearing);
}
let fieldRead=0,board=0,boardTarget=0;
let acquire=0,acquireTarget=0,escort=0,escortTarget=0;
let reportedExit=-1,reportedLight=-1;
const screenPoint=new THREE.Vector3();
function viewportPoint(point){
  screenPoint.copy(point).project(camera);
  return {x:(screenPoint.x+1)*innerWidth/2,y:(1-screenPoint.y)*innerHeight/2};
}
function placeCamera() {
  const finishExit=!reduce && S.station>.85 && S.underT<.01 && S.riseT<.01;
  const d=ease(finishExit?Math.min(S.dive,ss(.66,1,1-S.inside)):S.dive);
  const exit=1-S.inside,light=S.station*(1-ss(.62,.99,S.under))*(1-ss(.03,.65,S.rise));
  if(fieldExitListener && (Math.abs(exit-reportedExit)>1e-7 || Math.abs(light-reportedLight)>1e-7)){
    reportedExit=exit;reportedLight=light;fieldExitListener(exit,light,S.under>.6 && S.exitMix<.1);
  }
  pa.copy(standPos).lerp(mid, d); pb.copy(mid).lerp(diveBase, d);
  camera.position.copy(pa.lerp(pb, d));
  qTmp.slerpQuaternions(qStand, qDive, ss(0.15, 1, S.dive));
  camera.quaternion.copy(qTmp);
  const bankStep=reduce?0:fieldRead*(1-d)*(1-ss(0,.28,S.station));
  camera.translateZ(-bankStep*.76);
  camera.rotateY(-bankStep*.035);
  // Slide around the near bank to the station. Its pose becomes the start
  // of the pond approach, so leaving the tools never sends us back to the hero.
  stationCamera(camera,S.station,S.inside,S.book,board,S.flight,d,diveBase,qDive);
  const after = reduce ? 0 : ss(0.85, 1, S.dive) * (1 - S.rise);
  camera.position.x += (S.px * 0.35 + Math.sin(S.t * 0.13) * 0.12) * after;
  camera.position.y += (S.py * 0.12 + Math.sin(S.t * 0.21) * 0.05) * after;
  aircraft.follow(camera,acquire,escort,S.flight,diveBase,qDive);
  if(!reduce)pondShot.shore(camera,S.shore,S.shoreRelease,U.uSunDir.value);
  if (S.rise>.00001 && S.exitT) {
    room?.cameraPose(camera.aspect,camera.fov,roomPos,roomTarget);
    pondShot.leave(camera,reduce ? (S.rise<.25 ? 0 : 1) : S.rise,roomPos,roomTarget,U.uSunDir.value);
  } else if(room && filmTravel>0 && S.underT>=.9999){
    // After the entry, the scroll rail owns the lens in both directions.
    // Coming back from the breach must not replay the first TV's dive.
    room.cameraPose(camera.aspect,camera.fov,roomPos,roomTarget);
    camera.position.copy(roomPos);camera.lookAt(roomTarget);
  } else if (room && S.under > .0001) {
    room.cameraPose(camera.aspect,camera.fov,roomPos,roomTarget);
    pondShot.enter(camera,S.under,immersionStroke,S.exitMix,roomPos,roomTarget,U.uSunDir.value,reduce);
  }
  if(hubWeight>0){
    // Descend on the field side of the wires. Turn into the span before
    // leveling at the familiar wind reading, in either scroll direction.
    const t=1-hubWeight,h=1-t;
    windEye.set(hubEye.x+1.4,standPos.y+4.8,standPos.z+4.5);
    camera.position.multiplyScalar(t*t).addScaledVector(windEye,2*t*h).addScaledVector(hubEye,h*h);
    windSight.copy(lineBase);windSight.y=H(lineBase.x,lineBase.z)+ARM_Y;
    m4.lookAt(camera.position,windSight,camera.up);windRotation.setFromRotationMatrix(m4);
    camera.quaternion.slerpQuaternions(hubQ,qTmp.copy(camera.quaternion),ss(0,1,t));
    camera.quaternion.slerp(windRotation,.54*Math.sin(Math.PI*t)**2);
  }
  if(detailWeight>.001 && (activeTool==='flight'||activeTool==='sun')){
    const isMeter=activeTool==='flight',object=isMeter?instruments.board:instruments.lcd;
    object.getWorldPosition(detailAim);
    object.getWorldQuaternion(detailQ);
    const fit=(isMeter?.63:.127)/Math.min(1,camera.aspect);
    detailEye.set(isMeter?.035:.012,fit*.12,fit*(isMeter?1.04:camera.aspect<.85?1.19:1.63)).applyQuaternion(detailQ).add(detailAim);
    m4.lookAt(detailEye,detailAim,camera.up);detailQ.setFromRotationMatrix(m4);
    const blend=detailWeight*(1-escort)*(1-S.under)*S.station;
    camera.position.lerp(detailEye,blend);camera.quaternion.slerp(detailQ,blend);
  }
  if(landmarkBlend<1){
    // The destination camera stays on its own rail. Approach it from above
    // and frame the actual landmark before matching its exact position and lens.
    const t=landmarkBlend,h=1-t;
    const spot=hubPlaces[landmarkPlace];
    windEye.set(flightFrom.x*.26+camera.position.x*.74,Math.max(camera.position.y+2.7,flightFrom.y*.86),
      flightFrom.z*.42+camera.position.z*.58);
    camera.position.multiplyScalar(t*t).addScaledVector(windEye,2*t*h).addScaledVector(flightFrom,h*h);
    flightAim.set(...spot);
    m4.lookAt(camera.position,flightAim,camera.up);windRotation.setFromRotationMatrix(m4);
    camera.quaternion.slerpQuaternions(flightRotation,qTmp.copy(camera.quaternion),t);
    camera.quaternion.slerp(windRotation,.8*Math.sin(Math.PI*t)**2);
  }
  room?.stations.focusCamera(camera);
  camera.updateMatrixWorld();
}

/* ---------------- loop ---------------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function screenToWater(x, y) {
  ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.ray.intersectPlane(waterPlane, hit) ? hit.clone() : null;
}
let gustPhase = 0, last = performance.now(), running = false, visible = true;
/* auto quality: if frames run slow for a couple of seconds, step down (never back up) */
const QL = { level: 0, buf: [], refl: small ? 0.5 : 0.6, skipRefl: false, odd: false };
function applyQuality(lv) {
  QL.level = lv;
  if (lv >= 1) QL.refl = (small ? 0.5 : 0.6) * 0.65;
  if (lv >= 2) { renderer.setPixelRatio(DPR * 0.72); corn.mesh.count = Math.floor(corn.count * 0.55); }
  if (lv >= 3) { renderer.setPixelRatio(Math.min(1, DPR * 0.6)); QL.skipRefl = true; }
  resize();
}
function watchFrames(ms) {
  if (S.t < (small ? 1 : 3) || QL.level >= 3) return;
  QL.buf.push(ms);
  const samples=small?36:90;
  if (QL.buf.length >= samples) { // Ignore isolated stalls.
    const med = QL.buf.sort((a, b) => a - b)[samples/2]; QL.buf = [];
    if (med > 24) applyQuality(QL.level + 1);
  }
}
function frame(now) {
  running = false;
  if (!visible) return;
  watchFrames(now - last);
  // The pond simulation takes short steps. Camera travel keeps wall-clock
  // timing on phones that paint fewer than twenty frames per second.
  const cameraDt=Math.min(.16,(now-last)/1000);
  const dt=Math.min(.05,cameraDt); last=now;
  S.t += dt;
  U.uSplashAge.value += dt; U.uStarAge.value += dt;
  const k = 1 - Math.pow(0.0015, dt);
  const cameraK=reduce ? 1 : 1-Math.pow(.0015,cameraDt);
  // A wheel flick or anchor jump still passes the wide exterior and sill.
  const gap=S.stationT-S.station;
  const approachStep=cameraDt/(gap>0?1.85:1.4);
  S.station+=reduce?gap:THREE.MathUtils.clamp(gap*cameraK,-approachStep,approachStep);
  S.flight+=(S.flightT-S.flight)*cameraK;
  detailWeight+=((detailOpen?1:0)-detailWeight)*cameraK;
  // Follow the scroll sample within a few frames. Anchor jumps still pass
  // through the doorway, while a paused swipe holds its exact composition.
  const travelStep=reduce?1:cameraDt/1.55;
  S.inside+=THREE.MathUtils.clamp((S.insideT-S.inside)*cameraK,-travelStep,travelStep);
  S.book+=(S.bookT-S.book)*cameraK;
  board+=(boardTarget-board)*cameraK;
  acquire+=(acquireTarget-acquire)*cameraK;escort+=(escortTarget-escort)*cameraK;

  S.exitMix+=(S.exitT-S.exitMix)*cameraK;
  S.dive += (S.diveT - S.dive) * cameraK; S.rise = S.riseT; S.ink += (S.inkT - S.ink) * (1 - Math.pow(0.05, dt));
  if(room){
    const gap=S.underT-S.under;
    // A fast wheel or the dive link still passes the reflection and the lit
    // screen. The upper limit only applies on the approach side of the films.
    const limit=S.exitT?1:cameraDt/1.05;
    S.under+=reduce?gap:THREE.MathUtils.clamp(gap*cameraK,-limit,limit);
  }
  if (S.rise > .72 && starArmed && !reduce && U.uNight.value>.05) { U.uStarAge.value=0; starArmed=false; }
  if (S.rise < .02) starArmed=true;
  S.px += (S.pxT - S.px) * (1 - Math.pow(0.02, dt)); S.py += (S.pyT - S.py) * (1 - Math.pow(0.02, dt));
  gustPhase += dt * (0.2 + S.wind * 0.01);
  const gustiness = Math.max(0, (S.gust - S.wind) / Math.max(S.wind, 3));
  const burst = Math.max(0, Math.sin(gustPhase) * Math.sin(gustPhase * 0.37 + 1.3));
  const gustE = Math.min(1.5, gustiness * burst * 1.4);
  const amp = 0.012 + S.wind * 0.016;
  U.uT.value = S.t; U.uWindAmp.value = amp; U.uGustE.value = gustE; U.uWind.value = S.wind + (S.gust - S.wind) * burst * 0.6;
  station.bench?.update?.();
  jay.update(dt,S.el>-.105 && S.under<.15 && S.rise<.15 && S.dive<.72);
  if(room && !reduce){
    if(S.under>=.45)forwardCross=true;
    else if(S.under<=.32)forwardCross=false;
    const move=cameraDt/(forwardCross ? .45 : .56);
    immersionStroke=THREE.MathUtils.clamp(immersionStroke+(forwardCross?move:-move),0,1);
  }
  // The course and its drones belong to the south field: keep them out of the opening shot.
  aircraft.course.visible=aircraft.object.visible=!!exploreHook||landmarkBlend<1||hubWeight>.05||S.station>.5||S.flight>.01;
  U.uCourseLight.value=aircraft.course.visible?1-ss(-.10,-.035,U.uEl.value):0;
  aircraft.update(cameraDt,exploreHook ? exploreDrones : S.station>.85 && S.inside<.22 && escort<.993 && S.under<.05 && S.rise<.05,escort,S.wind>=18);
  instruments.wind(dt,S.wind,U.uWindDir.value,S.wind>=18?'HOLD':'COURSE OPEN',windSource);
  if(exploreHook)exploreHook(cameraDt,camera);else placeCamera();
  if(room && reportFilmApproach && reportedUnder!==S.under){reportedUnder=S.under;reportFilmApproach(S.under);}
  if(renderStationControls)renderStationControls(S.station);
  const submerged = !!room && camera.position.y < 0;
  const splitting = !!room && !reduce && (S.under>.0001 || S.rise>.00001) && Math.abs(camera.position.y)<.118;
  const eyeHeight=camera.position.y;
  if(room && !reduce && !crossingLatched && S.exitMix<.1 && forwardCross &&
     previousEyeHeight>.105 && eyeHeight<=.105) {
    crossingLatched=true;
    camera.getWorldDirection(entryDirection);
    port.impact.trigger(S.t,camera.position,entryDirection);
    const center=port.impact.origin;
    water.material.uniforms.entryOrigin.value.set(center.x,center.z);
    drops.push({uv:new THREE.Vector2(center.x/SIM_SIZE+.5,(center.z-SIM_Z)/SIM_SIZE+.5),r:.27/SIM_SIZE,s:.12});
    window.dispatchEvent(new Event('lab-pond-impact'));
  }
  if(reduce || S.exitMix>.25 || (!forwardCross && eyeHeight>.14))port.impact.clear();
  if(eyeHeight>.22 && !forwardCross)crossingLatched=false;
  if(room && !reduce && S.exitT && S.rise>.1 && previousEyeHeight<=0 && eyeHeight>0){
    U.uBreach.value.set(camera.position.x,camera.position.z);
    U.uSplashAge.value=0;
    drops.push({uv:new THREE.Vector2(camera.position.x/SIM_SIZE+.5,(camera.position.z-SIM_Z)/SIM_SIZE+.5),r:.34/SIM_SIZE,s:.095});
    window.dispatchEvent(new Event('lab-pond-breach'));
  }
  previousEyeHeight=eyeHeight;
  port.update(S.t,U.uDay.value,U.uWind.value,S.dive>.62 && S.rise<.25);
  water.material.uniforms.entryAge.value=port.impact.clock.value;
  if (!submerged || splitting) updateWires(S.t, amp, gustE);
  sky.position.copy(camera.position);
  for (const d of drops.splice(0)) { dropMat.uniforms.c.value.copy(d.uv); dropMat.uniforms.r.value = d.r; dropMat.uniforms.s.value = d.s; simPass(dropMat); }
  simPass(stepMat); simPass(stepMat);
  renderer.setRenderTarget(null);
  water.material.uniforms.tSim.value = simA.texture; leaves.material.uniforms.tSim.value = simA.texture;
  water.material.uniforms.uInk.value = S.ink; leaves.material.uniforms.uInk.value = S.ink;
  QL.odd = !QL.odd;
  const outputSpace = submerged || splitting ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
  if (renderer.outputColorSpace !== outputSpace) renderer.outputColorSpace = outputSpace;
  if (splitting) {
    room.update(S.t,simA.texture,camera);
    port.render(renderer,camera,scene,room.scene,renderReflection,S.t,U.uWind.value);
  } else if (submerged) {
    room.update(S.t, simA.texture,camera);
    renderer.render(room.scene, camera);
  } else {
    if (!QL.skipRefl || QL.odd) renderReflection();
    instruments.expose(renderer,scene,S.t,activeTool==='sun' && S.station>.95 && S.inside<.4 && S.dive<.1 && acquire<.85);
    renderer.render(scene, camera);
  }
  port.wetFilm(renderer, U.uSplashAge.value);
  loop();
}
function loop() { if (!running) { running = true; requestAnimationFrame(frame); } }
function resize() {
  canvas.style.height=innerHeight+"px";
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight; poseQuats();
  const pr = renderer.getPixelRatio();
  port.resize(innerWidth*pr*.85,innerHeight*pr*.85);
  reflRT.setSize(Math.round(innerWidth * pr * QL.refl), Math.round(innerHeight * pr * QL.refl));
}
let resizeTimer,renderWidth=innerWidth;
addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  if(!small || innerWidth!==renderWidth){renderWidth=innerWidth;resize();return;}
  resizeTimer=setTimeout(resize,140);
});
resize();
canvas.addEventListener('webglcontextlost',event=>{
  event.preventDefault();visible=false;
  document.documentElement.classList.add('no-world');
  dispatchEvent(new Event('labworld:unavailable'));
});
canvas.addEventListener('webglcontextrestored',()=>{
  document.documentElement.classList.remove('no-world');resize();visible=!document.hidden;last=performance.now();loop();
  dispatchEvent(new Event('labworld:ready'));
});
document.addEventListener('visibilitychange', () => {
  visible=!document.hidden && !renderer.getContext().isContextLost();
  if(visible){last=performance.now();loop();}
  else port.impact.clear();
});

let fieldSun=.06,fieldBearing=.2;
function setSun(elRad,off=.2) {
  fieldSun=elRad;fieldBearing=off;
  // The opening is a staged establishing shot. Keep the cables and eaves
  // silhouetted against civil twilight, then return to field time at the sill.
  const exterior=(1-ss(.68,.98,S.stationT))*(1-ss(0,.10,S.diveT))*(1-ss(0,.10,S.riseT));
  elRad+=Math.max(0,-.032-elRad)*exterior;
  elRad+=Math.max(0,.105-elRad)*Math.max(hubWeight,landmarkLight);
  S.el = elRad; const p = palette(elRad);
  U.uEl.value = elRad; U.uDay.value = p.day; U.uGold.value = p.gold; U.uNight.value = p.night;
  U.uZen.value.setRGB(...p.zen, THREE.LinearSRGBColorSpace); U.uHor.value.setRGB(...p.hor, THREE.LinearSRGBColorSpace); U.uSunC.value.setRGB(...p.sun, THREE.LinearSRGBColorSpace);
  U.uSunDir.value.set(Math.sin(off) * Math.cos(elRad), Math.sin(elRad), -Math.cos(off) * Math.cos(elRad)).normalize();
  renderer.setClearColor(lin(...p.hor));
}
setSun(0.06);

window.LabWorld = {
  // Free-roam: the hook is called every frame with (dt, camera) and owns the camera.
  explore(hook){
    exploreHook=hook;S.stationT=S.station=1;S.insideT=S.inside=1;
    return {THREE,scene,camera,renderer,ground:groundSurface,depth:(x,z)=>-H(x,z),station,pond:{center:C,radius:R},extent:EXT,oak:TREE,uniforms:U,onShed:onStationPad};
  },
  setSun(elDeg,offsetDeg=11.46) { setSun(elDeg*Math.PI/180,offsetDeg*Math.PI/180); },
  setStation(weight) { if(weight!==S.stationT){S.stationT=weight;setSun(fieldSun,fieldBearing);} },
  setFieldEscort(acquisition,progress){acquireTarget=acquisition;escortTarget=progress;},
  hubPoints(){return hubPlaces.map(xyz=>{
    const v=new THREE.Vector3(...xyz).project(hubCamera);
    return {x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};
  });},
  beginLandmark(place){
    landmarkPlace=place;
    flightFrom.copy(camera.position);flightRotation.copy(camera.quaternion);
    if(place===2)prepareFilmRoom();
    approachLandmark(0);
  },
  approachLandmark,
  setHubOverview(weight){if(weight!==hubWeight){hubWeight=weight;setSun(fieldSun,fieldBearing);}},
  setFieldRead(value){fieldRead=value;},
  setStationJourney(book,outside,wallWeight){boardTarget=wallWeight;S.bookT=book;S.insideT=1-outside;},
  bindFieldExit(callback){fieldExitListener=callback;reportedLight=-1;},
  setWindEditing(edit){instruments.editWind(edit);},
  setCourseLesson(value){instruments.setLesson(value);},
  instrumentCorners(){
    if(detailWeight<.04 || !detailOpen || escort>.01)return null;
    const meter=activeTool==='flight',surface=meter?instruments.board:instruments.lcd;
    const w=meter?.30:.0555,h=meter?.1475:.03125;
    return [[-w,h],[w,h],[w,-h],[-w,-h]].map(([x,y])=>
      viewportPoint(surface.localToWorld(new THREE.Vector3(x,y,.0003))));
  },
  setWindSource(value){windSource=value;},
  setDronesFlying(on){exploreDrones=!!on;},
  setInstrumentDetail(open){detailOpen=open;},
  instrumentPoint(){
    if(detailOpen||detailWeight>.12||S.station<.98||S.inside>.08||escort>.015||S.under>.01)return null;
    const item=activeTool==='sun' && acquire<.05?instruments.lcd:activeTool==='flight' && acquire>.97?instruments.board:null;
    if(!item)return null;item.getWorldPosition(screenPoint);screenPoint.project(camera);
    return screenPoint.z>0 && screenPoint.z<1?{x:(screenPoint.x+1)*innerWidth/2,y:(1-screenPoint.y)*innerHeight/2}:null;
  },
  setFieldTool(tool,height) {
    if(activeTool!==tool){detailOpen=false;detailWeight=0;}
    activeTool=tool;
    S.flightT=height;
  },
  setStoryLine(text,label,animate,pins=[]){station.bench?.setStory(text,label,animate&&!reduce,pins);stationRevision++;},
  setNotebookPage(title,category,detail,direction=0){station.bench?.setNotebook(title,category,detail,direction);},
  bindStationControls(render){renderStationControls=render;},
  stationSurface(tool,previousKey,previousRevision){
    if(S.station<.94 || S.inside<.88 || S.dive>.055 || S.under>.01)return null;
    const bench=station.bench,isStory=tool==='story';
    if(tool==='events'){if(board<.94)return null;}
    else if(board>.10 || !bench || (isStory?S.book>.12:(tool!=='book' && tool!=='ask') || S.book<.88))return null;
    const turning=!isStory && bench.turningPage;
    const key=tool+'|'+Number(turning)+'|'+innerWidth+','+innerHeight+'|'+camera.matrixWorld.elements.map(n=>Math.round(n*10000)).join(',');
    if(key===previousKey && previousRevision===stationRevision)return {unchanged:true};
    const corners=tool==='events'?station.eventWall.corners():isStory?bench.controlCorners?.():bench.bookControlsAnchors?.();if(!corners)return null;
    const anchors=isStory?(bench.wordAnchors?.()||[]).map(a=>{
      const p=viewportPoint(a.point);
      const box=(a.corners||[]).map(viewportPoint);
      return {...p,index:a.index,width:box.length?Math.max(...box.map(v=>v.x))-Math.min(...box.map(v=>v.x)):22,
        height:box.length?Math.max(...box.map(v=>v.y))-Math.min(...box.map(v=>v.y)):16};
    }):[];
    return {corners:corners.map(viewportPoint),anchors,key,turning,revision:stationRevision};
  },
  pickStation(x,y){
    if(S.inside<.5 || S.station<.65 || S.dive>.18 || S.under>.05)return null;
    ndc.set(x/innerWidth*2-1,1-y/innerHeight*2);ray.setFromCamera(ndc,camera);
    return station.bench?.hit(ray)??null;
  },
  setWind(mph, gust, fromDeg, sunAzDeg) {
    S.wind = mph; S.gust = Math.max(mph, gust || mph);
    const to = ((fromDeg + 180 - sunAzDeg + 11.5) * Math.PI) / 180;
    U.uWindDir.value.set(Math.sin(to), 0, -Math.cos(to)).normalize();
  },
  setCloud(c) { S.cloud = c; U.uCloud.value = c; },
  setDive(p) { S.diveT = Math.max(0, Math.min(1, p)); },
  setShore(progress,release){S.shore=progress;S.shoreRelease=release;},
  bindFilmApproach(fn){reportFilmApproach=fn;reportedUnder=-1;},
  setUnder(p,exiting=false,outside=false) {
    // A return to an earlier chapter can skip the entire pond approach.
    if(outside && !p){S.under=0;immersionStroke=0;forwardCross=false;}
    S.exitT=exiting?1:0;
    S.underT = THREE.MathUtils.clamp(p,0,1);
    if (p>0 || S.diveT>.86) prepareFilmRoom();
  },
  setFilmSource(canvas,films) { filmCanvas=canvas; filmList=films; if(room) room.setSource(canvas,films); },
  setFilmFeature(media) { if(!room)return false; room.stations.setFeature(media); return true; },
  setFilmTravel(position){filmTravel=position;room?.stations.setTravel(position);},
  get filmTravel() {return room?.stations.travel;},
  pickFilm(x,y) { return room && camera.position.y<0 ? room.pick(x,y,camera) : null; },
  get under() { return S.under; },
  get immersion() { return 1-ss(-.19,.15,camera.position.y); },
  setRise(p) {
    if (!room && p===1) S.rise=1;
    S.riseT=THREE.MathUtils.clamp(p,0,1);
  },
  setPointer(x, y) { S.pxT = x; S.pyT = y; },
  setInk(p, sx, sy) { S.inkT = p; if (sx != null) { const h = screenToWater(sx, sy); if (h) S.inkC.set(h.x, h.z); } },
  drop(sx, sy, strength = 0.02, radius = 0.25) {
    if (reduce) return;
    const h = screenToWater(sx, sy); if (!h) return;
    const u = h.x / SIM_SIZE + 0.5, v = (h.z - SIM_Z) / SIM_SIZE + 0.5;
    if (u < 0 || u > 1 || v < 0 || v > 1) return;
    drops.push({ uv: new THREE.Vector2(u, v), r: radius / SIM_SIZE, s: strength });
  },
  get dive() { return S.dive; },
  get gust() { return U.uGustE.value; },
  get quality() { return QL.level; },
  // checks: every wire end sits on its insulator, and the crossarm runs across the line
  _debug() {
    const ends = wires.slice(0, 5).map(w => ({ a: w.a.toArray().map(v => +v.toFixed(3)), b: w.b.toArray().map(v => +v.toFixed(3)) }));
    return { sunDirection:U.uSunDir.value.toArray(),station:S.station,inside:S.inside,book:S.book,board,escort,acquire,flight:S.flight,aircraft:aircraft.inspect(camera), immersed: !!room && camera.position.y < 0, camera: camera.position.toArray(),rotation:camera.quaternion.toArray(),shore:S.shore,shoreRelease:S.shoreRelease, roomCenter: room?.stations.current.center.toArray(), stations:room?.stations.inspect(camera), oak:oakDebug(), bird:jay.inspect(), armDotLine: +armDir.dot(lineDir).toFixed(4), ends, standY: +standPos.y.toFixed(2), treeY: +tree.position.y.toFixed(2), depthAtDive: +(-H(0, -12.5)).toFixed(2), corn: corn.count };
  },
  _cam(pos, look) { S.diveT = S.dive = 0; placeCamera = () => { camera.position.set(...pos); camera.lookAt(...look); camera.updateMatrixWorld(); }; }
};
{ const qm = location.search.match(/[?&]quality=(\d)/); if (qm) applyQuality(+qm[1]); }
loop();
window.dispatchEvent(new Event('labworld:ready'));
