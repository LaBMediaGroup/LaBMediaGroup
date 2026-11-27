/* Explore: walk the LaB field yourself, and find Labcoon pottering on the bank.
   Prototype (Nov 26 2026). The world is the homepage's own pond world (world.js);
   this module only takes the camera, adds a walker and Labcoon.

   Controls: WASD / arrows to walk (Shift runs), drag to look, click or tap the ground to
   walk there, click or tap Labcoon (or press F) to follow him, F / Esc to walk again. */
import * as THREE from 'three';
import {fieldSteps} from './wildlife/wildlife-motion.js?v=2';
import {fieldWildlife} from './field-wildlife.js?v=5';
import {precipitation} from './precipitation.js?v=4';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {buildPlaces, PLACES} from './labcoon-places.js?v=3';
import {createHud} from './explore-hud.js?v=27';
import {makeFind, fieldFinds} from './field-finds.js?v=2';
import {field as fieldSound, sfx, coon as coonSound} from './explore-audio.js?v=4';
import {fieldLitter} from './field-litter.js?v=2';

const LAT = 42.67, LON = -83.03;
const q = new URLSearchParams(location.search);
const LIFE_SPEED = Math.min(8, Math.max(.25, +(q.get('speed') || 1)));
// Live: ?live=<service base> (local dev: http://<mac>:8788/api/labcoon). Without it, a replayed brain night.
// On labmedia.work (GitHub Pages) the service is its own Worker at labcoon-api.labmedia.work; ?live= (empty) forces
// the replay. If the service is missing or down, startLive fails and the page falls back to the replayed night.
const LIVE_BASE = q.has('live') ? q.get('live') : /(^|\.)labmedia\.work$/.test(location.hostname) ? 'https://labcoon-api.labmedia.work/api/labcoon' : '';
const VID = (() => { try { let v = localStorage.getItem('labcoon-vid'); if (!v) { v = crypto.randomUUID().replace(/-/g, '').slice(0, 24); localStorage.setItem('labcoon-vid', v); } return v; } catch { return 'anon' + Math.random().toString(36).slice(2, 14); } })();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const perf = document.getElementById('perf'); if (q.has('debug')) perf.hidden = false;
let H = null;              // the HUD (explore-hud.js), made at boot

/* ---------------- walker ---------------- */
const SOLID = [[-7, -20, .3], [18.6, 10.8, .3]];   // the two poles inside the field; places add theirs
const EYE = 1.55, WALK = 1.35, RUN = 3.2;
const me = {pos: new THREE.Vector3(3.2, 0, 3.6), yaw: .55, pitch: -0.08, target: null, mode: 'walk'};
const keys = new Set();
let W, ground, depth, places, follow = {yaw: 0, dist: 1.35, h: .45, hold: 0, side: 1};

function dry(x, z, margin = .04) {            // ground above the water line, inside the field
  if (Math.abs(x - W.pond.center.x) > W.extent / 2 - 3 || Math.abs(z - W.pond.center.y) > W.extent / 2 - 3) return false;
  return ground(x, z) > margin;
}
function blocked(x, z) {
  if (!dry(x, z, -.02)) return true;
  if (Math.hypot(x - W.oak.x, z - W.oak.y) < .55) return true;     // the oak's trunk
  if (W.onShed(x, z)) return true;                                  // the shed and its pad (no walking in yet)
  for (const [cx, cz, r] of SOLID) if (Math.hypot(x - cx, z - cz) < r) return true;
  return false;
}

/* ---------------- sun and wind ---------------- */
const localField = ['127.0.0.1','localhost'].includes(location.hostname) && location.port==='5430';
// Visitors get the same observed weather and wildlife paths through the live service (numbers only).
const remoteField = !localField && !!LIVE_BASE;
let fieldCache = null, fieldAt = 0;                  // one /field read per 30 s, shared by weather, wildlife and finds
async function getField() { if (!fieldCache || Date.now() - fieldAt > 30000) { fieldAt = Date.now(); fieldCache = await api('/field'); } return fieldCache; }
let observedWeather=null, updatePrecipitation, updateWildlife, finds=null, litter=null;
const windNow=()=>q.has('wind')?Number(q.get('wind')):observedWeather?.wind??6;
const gustNow=()=>q.has('wind')?windNow()+4:observedWeather?.gust??windNow();
async function refreshFieldWeather() {
  try {
    if(localField){
      const r=await fetch('http://127.0.0.1:5437/weather',{cache:'no-store',signal:AbortSignal.timeout(8500)});
      if(r.ok) observedWeather=await r.json();
    } else { const f=await getField(); if(f.weather) observedWeather=f.weather; finds?.set(f.finds); }
    if(localField && LIVE_BASE) getField().then(f=>finds?.set(f.finds)).catch(()=>{});
  } catch { /* Allow a local reader restart without blinking the weather off. */ }
  if(!(observedWeather?.observedAt>=Date.now()-7200000)) observedWeather=null;
  liveSky();
}
function liveSky() {
  let t = new Date();
  const at = q.get('at')?.match(/^(\d{1,2}):(\d{2})$/);
  if (at) { t = new Date(t); t.setHours(+at[1], +at[2], 0, 0); }
  if (window.LaBSun) {
    const p = LaBSun.position(t, LAT, LON);
    LabWorld.setSun(p.elevation);
    LabWorld.setWind(windNow(), gustNow(), observedWeather?.dir??270, p.azimuth);
    H?.clock(t.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}), p.elevation < -2);
  }
  LabWorld.setCloud(observedWeather?.cloud??.4);
}

/* ---------------- Labcoon ---------------- */
const coon = {root: null, mixer: null, actions: {}, current: null, pos: new THREE.Vector3(), yaw: 0,
  queue: [], task: null, swimming: false, irises: [], envMats: [], teeth: [], findHeld: false, bone: null, home: new THREE.Vector2()};
const WALK_SPEED = .21, CLIP_SPEED = .165;     // clip is authored for 0.165 m/s at rate 1
const cap = new THREE.Group(); let capKind = '';                // what he's holding, modelled by kind (a red cap until we know)
function setHeld(kind) {
  kind = kind || 'red bottle cap'; if (kind === capKind) return; capKind = kind;
  cap.clear(); cap.add(makeFind(THREE, kind, null, displayEncode));
}
const findSpot = new THREE.Vector3();

// The world's shaders write display values straight to a linear target; give the
// standard materials the same display transform so Labcoon sits in the same light.
function displayEncode(mat) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev?.call(mat, shader, r);
    shader.fragmentShader = shader.fragmentShader.replace('#include <colorspace_fragment>',
      'gl_FragColor.rgb = gl_FragColor.rgb * (2.51 * gl_FragColor.rgb + .03) / (gl_FragColor.rgb * (2.43 * gl_FragColor.rgb + .59) + .14);\n' +
      'gl_FragColor.rgb = pow(clamp(gl_FragColor.rgb, 0., 1.), vec3(1. / 2.2));');
  };
  mat.toneMapped = false;
  mat.customProgramCacheKey = () => 'lab-display-' + (prev ? 'fur' : 'base') + (mat.name || '');
  mat.needsUpdate = true;
}
function addFur(coat) {     // the reviewer's shell fur, fewer layers on touch screens
  const layers = coarse ? 4 : 7;
  for (let i = 1; i <= layers; i++) {
    const height = i / layers, mat = coat.material.clone();
    mat.name = 'Short fur ' + i;
    mat.onBeforeCompile = shader => {
      shader.uniforms.shellHeight = {value: height};
      shader.vertexShader = 'uniform float shellHeight; varying vec3 vFurPoint;\n' + shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vFurPoint=position;
        float bare=1.-smoothstep(.25,.29,abs(position.z));
        transformed+=normal*(.0027*shellHeight*bare);`);
      shader.fragmentShader = 'uniform float shellHeight; varying vec3 vFurPoint;\n' + shader.fragmentShader.replace('#include <alphatest_fragment>', `
        #include <alphatest_fragment>
        vec3 cell=floor(vFurPoint*1200.+vec3(shellHeight*0.65,0.,0.));
        float fiber=fract(sin(dot(cell,vec3(12.9898,78.233,37.719)))*43758.5453);
        if(fiber<.41+.53*shellHeight) discard;
        diffuseColor.rgb*=.91+.13*shellHeight;`);
    };
    displayEncode(mat);
    const shell = new THREE.SkinnedMesh(coat.geometry, mat);
    shell.position.copy(coat.position); shell.rotation.copy(coat.rotation); shell.scale.copy(coat.scale);
    shell.bindMode = coat.bindMode; shell.bind(coat.skeleton, coat.bindMatrix);
    shell.frustumCulled = false; shell.renderOrder = 1; coat.parent.add(shell);
  }
}

const hemi = new THREE.HemisphereLight(0xffffff, 0x555048, 1), sun = new THREE.DirectionalLight(0xffffff, 1.6);
function lightFromSky() {
  const U = W.uniforms, day = U.uDay.value, gold = U.uGold.value, night = U.uNight.value;
  sun.position.copy(U.uSunDir.value).multiplyScalar(10).add(coon.pos); sun.target.position.copy(coon.pos);
  sun.color.copy(U.uSunC.value); sun.intensity = Math.max(0, U.uSunDir.value.y) > 0 ? 1.2 + 1.2 * day : 0;
  hemi.color.copy(U.uZen.value).lerp(new THREE.Color(1, 1, 1), .35); hemi.groundColor.setRGB(.32, .28, .22);
  hemi.intensity = .25 + 1.1 * day + .45 * gold - .1 * night;
  // at night: a cool moonlit fill and a rim from high behind him, so his outline reads on the field
  if (night > .05) {
    hemi.color.lerp(MOON, night * .8); hemi.intensity += .22 * night;
    if (U.uSunDir.value.y <= 0) { sun.color.copy(MOON); sun.intensity = .95 * night; sun.position.set(coon.pos.x - Math.sin(coon.yaw) * 4, coon.pos.y + 6, coon.pos.z - Math.cos(coon.yaw) * 4); }
  }
  // eyeshine: a raccoon's tapetum throws light back green-gold when he faces you in the dark
  const toCam = TMP2.copy(W.camera.position).sub(coon.pos).setY(0).normalize();
  const facing = Math.max(0, toCam.x * Math.sin(coon.yaw) + toCam.z * Math.cos(coon.yaw));
  const glow = night * Math.pow(facing, 3) * (coon.asleep ? 0 : 1);
  for (const m of coon.irises) m.emissiveIntensity = glow * 2.2;
  const envK = .25 + .75 * day;
  for (const m of coon.envMats) m.envMapIntensity = (m.name.startsWith('Corneal') ? .55 : m.name.startsWith('Iris') ? .3 : .45) * envK;
  const open = /yawn|^wake$|grumble/.test(coon.clip || '');                 // teeth only when the mouth is open
  for (const o of coon.teeth) o.visible = open;
}
const MOON = new THREE.Color(.55, .66, .95), TMP2 = new THREE.Vector3();

async function loadLabcoon() {
  const loader = new GLTFLoader();
  const ktx = new KTX2Loader().setTranscoderPath('/pond/vendor/three/addons/libs/basis/').detectSupport(W.renderer);
  loader.setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync('/pond/labcoon/labcoon_v07.glb?v=rest2');
  const root = gltf.scene, coats = [];
  // a small reflection environment for Labcoon's own materials: catchlights in his eyes and on his nose
  const pm = new THREE.PMREMGenerator(W.renderer), env = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose();
  root.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    const mat = o.material;
    if (mat?.name.includes('underfur')) coats.push(o);
    if (mat?.transparent && /fur|fibres|hair|strand/i.test(mat.name)) {
      mat.alphaTest = .025; mat.opacity = .52; mat.depthWrite = false; mat.color.multiplyScalar(.74);
    }
    if (mat?.name.startsWith('Iris')) { mat.emissive = new THREE.Color(.62, .78, .32); mat.emissiveIntensity = 0; coon.irises.push(mat); mat.color.multiplyScalar(1.6); mat.roughness = .18; }
    if (mat?.name.startsWith('Corneal')) { mat.roughness = .05; mat.metalness = 0; mat.opacity = .07; mat.color.setRGB(0, 0, 0); }
    if (mat?.name.startsWith('Rhinarium') || mat?.name.startsWith('Lip and nostril')) mat.roughness = Math.min(mat.roughness, .32);
    if (mat?.name.startsWith('Lip')) mat.color.setRGB(.34, .32, .3);             // the web fur is thinner than Blender's: keep the lip line from drawing a frown
    if (/^(Corneal|Iris|Rhinarium)/.test(mat?.name || '')) { mat.envMap = env; coon.envMats.push(mat); }
    if (o.name.startsWith('Tooth')) coon.teeth.push(o);
    if (mat) displayEncode(mat);
  });
  for (const c of coats) addFur(c);
  coon.root = root; W.scene.add(root, hemi, sun, sun.target, cap); cap.visible = false;
  coon.mixer = new THREE.AnimationMixer(root);
  for (const clip of gltf.animations) coon.actions[clip.name.replace(/^Labcoon_/, '')] = coon.mixer.clipAction(clip);
  coon.bone = root.getObjectByName('interaction_target');
  coon.mixer.addEventListener('finished', e => { if (coon.task?.clip === e.action) taskDone(); });
  coon.mixer.addEventListener('loop', e => { if (coon.task?.clip === e.action && coon.task.loops && ++coon.task.turns >= coon.task.loops) taskDone(); });
  buildRing();
  // every place's stand spot must be dry ground: nudge any that the shoreline sampling put in the water
  for (const [name, p] of Object.entries(PLACES)) {
    if (!p.stand || p.water) continue;
    let [x, z] = p.stand;
    if (dry(x, z, .06)) continue;
    let best = null;
    for (let r = .1; r < 3 && !best; r += .1) for (let a = 0; a < 6.28; a += .26) { const X = x + Math.cos(a) * r, Z = z + Math.sin(a) * r; if (dry(X, Z, .08)) { best = [X, Z]; break; } }
    if (best) { console.info('Explore: moved', name, 'stand to dry ground', best.map(v => +v.toFixed(2))); p.stand = best; }
  }
  // home is the culvert on the north-east bank
  coon.home.set(...PLACES.culvert.stand);
  coon.pos.set(coon.home.x, ground(coon.home.x, coon.home.y), coon.home.y); coon.yaw = -Math.PI * .75;
  try { NIGHT = await (await fetch('/pond/labcoon/night.json')).json(); } catch { NIGHT = []; }
  if (LIVE_BASE) { try { await startLive(); return; } catch (err) { console.warn('Explore: live service unreachable, replaying a night instead.', err.message); } }
  nightIndex = Math.floor(Math.random() * Math.max(1, NIGHT.length));
  play('idle'); nextTask(performance.now() / 1000);
}
function play(name, {once = false, rate = 1, fade = .28, reverse = false} = {}) {
  const a = coon.actions[name];
  if (!a) return null;
  if (coon.current === a && !once) { a.setEffectiveTimeScale(rate); return a; }
  a.reset().setEffectiveTimeScale(reverse ? -rate : rate).setEffectiveWeight(1);
  if (reverse) a.time = a.getClip().duration;
  a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity); a.clampWhenFinished = once;
  if (coon.current && coon.current !== a) a.crossFadeFrom(coon.current, fade, false);
  a.play(); coon.current = a; coon.clip = name; return a;
}
const say = text => H?.set(null, text);

/* ---------------- what Labcoon does ----------------
   His night comes from the brain: a replay of a simulated night (pond/labcoon/night.json, made from
   brain/sim.js output: move + place + his own first sentence). Each event becomes a few tasks:
   walk or trot along a route that goes round the pond, then the clip that fits the move.
   Live, the brain service will send the same events. */
let NIGHT = [], nightIndex = 0;
const TROT_SPEED = .58, TROT_RATE = .58 / .291, SWIM_SPEED = .2, WATER_Y = -.055;
const ring = [];            // walkable points round the pond, used to go the long way round on foot
function buildRing() {
  const c = W.pond.center;
  for (let k = 0; k < 36; k++) {
    const a = k / 36 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    let s = 1; while (s < 1.8 && !dry(c.x + ca * (W.pond.radius.x + 2.2) * s, c.y + sa * (W.pond.radius.y + 2.6) * s, .08)) s += .04;
    ring.push(new THREE.Vector2(c.x + ca * (W.pond.radius.x + 2.2) * s, c.y + sa * (W.pond.radius.y + 2.6) * s));
  }
}
const clearLine = (a, b, wet = false) => {
  const n = Math.ceil(a.distanceTo(b) / .4);
  for (let i = 1; i < n; i++) { const x = a.x + (b.x - a.x) * i / n, z = a.y + (b.y - a.y) * i / n; if (wet ? dry(x, z, .02) : !dry(x, z, .04)) return false; }
  return true;
};
function shoreRoute(target) {
  const from = new THREE.Vector2(coon.pos.x, coon.pos.z);
  if (clearLine(from, target)) return [target];
  const c = W.pond.center, ang = v => Math.atan2(v.y - c.y, v.x - c.x);
  const i0 = Math.round(((ang(from) / (Math.PI * 2)) * 36 + 36)) % 36, i1 = Math.round(((ang(target) / (Math.PI * 2)) * 36 + 36)) % 36;
  const fwd = (i1 - i0 + 36) % 36, dir = fwd <= 18 ? 1 : -1, steps = dir > 0 ? fwd : 36 - fwd, path = [];
  for (let s = 0; s <= steps; s++) path.push(ring[(i0 + dir * s + 36) % 36].clone());
  path.push(target); return path;
}
// Walk round the culvert foundation on the dry bank. This also applies to journeys
// whose endpoints are somewhere else but whose straight approach cuts through home.
function routeTo(target) {
  const route=[], centre=new THREE.Vector2(...PLACES.culvert.at);
  let prev=new THREE.Vector2(coon.pos.x,coon.pos.z);
  const clearance=1.57, ringRadius=1.96;
  const clears=(a,b)=>{
    const edge=b.clone().sub(a), t=THREE.MathUtils.clamp(centre.clone().sub(a).dot(edge)/(edge.lengthSq()||1),0,1);
    return a.clone().addScaledVector(edge,t).distanceTo(centre)>=clearance;
  };
  for(const end of shoreRoute(target)){
    if(!clears(prev,end)){
      const nodes=[prev,end];
      for(let j=0;j<24;j++){
        const angle=j*Math.PI/12, point=centre.clone().add(new THREE.Vector2(Math.cos(angle),Math.sin(angle)).multiplyScalar(ringRadius));
        if(dry(point.x,point.y,.045)) nodes.push(point);
      }
      const cost=nodes.map(()=>Infinity), parent=[], visited=new Set();cost[0]=0;
      for(;;){
        let k=-1;
        for(let j=0;j<nodes.length;j++) if(!visited.has(j)&&Number.isFinite(cost[j])&&(k<0||cost[j]<cost[k]))k=j;
        if(k<0||k===1)break;
        visited.add(k);
        for(let j=1;j<nodes.length;j++){
          const c=cost[k]+nodes[k].distanceTo(nodes[j]);
          if(c<cost[j]&&clears(nodes[k],nodes[j])&&clearLine(nodes[k],nodes[j])){
            cost[j]=c;parent[j]=k;
          }
        }
      }
      if(parent[1]===undefined){
        // A shoreline waypoint can itself be inside the foundation. Skip it and
        // solve from our last safe point to the next waypoint.
        continue;
      }
      const detour=[];
      for(let k=parent[1];k>0;k=parent[k])detour.unshift(nodes[k]);
      route.push(...detour);
    }
    route.push(end);prev=end;
  }
  return route;
}
function shorePoint(toward) {
  // On land: the last dry spot before the water, heading for `toward`.
  // Afloat: the first dry spot on the way to `toward` (where he climbs out).
  const from = new THREE.Vector2(coon.pos.x, coon.pos.z), d = toward.clone().sub(from), L = d.length(); d.normalize();
  const afloat = !dry(from.x, from.y, .02);
  let last = from.clone();
  for (let s = 0; s < L; s += .1) {
    const p = from.clone().addScaledVector(d, s), ok = dry(p.x, p.y, .03);
    if (afloat && ok) return p.addScaledVector(d, .25);
    if (!afloat && !ok) return last;
    last = p;
  }
  return toward.clone();
}
const placeXZ = name => { const p = PLACES[name]; return p && new THREE.Vector2(...(p.stand || p.at)); };
const pondCentre = () => new THREE.Vector2(W.pond.center.x, W.pond.center.y);
const faceTo = (x, z) => Math.atan2(x - coon.pos.x, z - coon.pos.z);
function plan(e) {
  const T = [], idle = s => T.push({type: 'idle', secs: s}), clip = (name, extra = {}) => T.push({type: 'clip', name, ...extra});
  const faceWater = () => T.push({type: 'face', yaw: () => faceTo(W.pond.center.x, W.pond.center.y)});
  const faceAt = name => T.push({type: 'face', yaw: () => faceTo(...PLACES[name].at)});
  if (!e.move && e.animation) {                       // brain events that are just a clip (an ear flick, waking up)
    clip(e.animation.replace(/^Labcoon_/, ''));
    for (const n of e.then || []) clip(n.replace(/^Labcoon_/, ''), /sleep/.test(n) ? {loops: 99} : {});
    return T;
  }
  switch (e.move) {
    case 'approach_wildlife': {
      const bank=placeXZ(e.hud?.place), offset=fieldSteps[e.arg];
      if (bank && offset) {
        T.push({type:'walk',to:bank.clone().add(new THREE.Vector2(...offset))});
        idle(4.5); T.push({type:'walk',to:bank});
      }
      break;
    }
    case 'drop': clip('set_down'); break;
    case 'walk_to': {
      const p = placeXZ(e.arg);
      if (!p || PLACES[e.arg]?.water) { idle(2); break; }
      if (coon.swimming) T.push({type: 'swim', to: () => shorePoint(p), out: true});
      T.push({type: 'walk', to: p}); idle(1.2); break;
    }
    case 'swim_to': case 'row_out':
      if (!coon.swimming) T.push({type: 'walk', to: () => shorePoint(pondCentre())});
      T.push({type: 'swim', to: () => pondCentre().add(new THREE.Vector2((Math.random() - .5) * 3, (Math.random() - .5) * 3))}); idle(3); break;
    case 'surface': case 'dive': case 'lie_back_in_boat': idle(4); break;
    case 'sit_and_watch': faceWater(); if (/moon|star/.test(e.arg)) clip('moon'); idle(6); break;
    case 'hold_up_to_moon': T.push({type: 'find'}); clip('moon'); clip('set_down'); break;
    case 'pick_up': case 'take_from_stash': case 'build_sculpture':
      T.push({type: 'find'}); clip('hold_find', {loops: 1}); clip('set_down'); break;
    case 'wash': faceWater(); clip('wash'); break;
    case 'watch_fish': faceWater(); clip('look_back'); idle(4); break;
    case 'swat_at_fish': faceWater(); clip('fish'); break;
    case 'journal_question': clip('draw'); idle(2); break;
    case 'inspect_computer': case 'look_up_question': {
      const [x,z]=PLACES.art_shed.at, desk=new THREE.Vector2(x-.20,z+.12);
      T.push({type:'walk',to:new THREE.Vector2(desk.x,desk.y-.39)});
      T.push({type:'face',yaw:()=>faceTo(desk.x,desk.y)});
      clip(e.move==='inspect_computer'?'sniff':'beg'); idle(4); break;
    }
    case 'swap': faceAt('picnic_table'); clip('wash'); clip('hold_find',{loops:1}); clip('set_down'); break;
    case 'check_mail': faceAt('mailbox'); clip('beg'); idle(1.5); break;
    case 'pry_lid': case 'dig_in': faceAt('trash_can'); clip('pry'); break;
    case 'draw': case 'hand_paint': faceAt('art_shed'); clip('draw'); break;
    case 'draw_in_mud': faceWater(); clip('wash'); clip('sniff'); break;                      // scratching at the mud with a stick
    case 'play_ocarina': case 'play_tin_whistle': case 'play_thumb_piano': case 'play_toy_xylophone': case 'play_harmonica':
      clip('beg'); idle(3); break;                                                             // sits up and plays
    case 'nap': clip('sleep', {loops: liveOn ? 1 : 3}); if (!liveOn) clip('wake'); break;
    case 'explore': for (let i = 0; i < 2; i++) T.push({type: 'wander'}); clip('sniff'); break;
    case 'sniff': case 'stash': case 'write_on_board': clip('sniff'); idle(1.5); break;
    case 'eat': case 'eat_here': clip('sniff'); idle(2); break;
    default: idle(2.5);
  }
  return T;
}
let liveQueue = [], liveOn = false, liveLast = 0, liveAsleep = false;
let restingStyle = null, lastStyle = Math.random() < .5 ? 'curl' : 'sprawl';
function nextEvent(now) {
  let e;
  if (liveOn) {
    if (!liveQueue.length) { coon.queue.push(liveAsleep ? {type: 'clip', name: 'sleep', loops: 1} : {type: 'idle', secs: 1.5}); return; }
    e = liveQueue.shift();
  } else {
    if (!NIGHT.length) { coon.queue.push({type: 'wander'}, {type: 'idle', secs: 2}); return; }
    e = NIGHT[nightIndex++ % NIGHT.length];
  }
  coon.queue.push(...plan(e));
  if (e.song?.notes) { const d = me.mode === 'follow' ? 1.5 : Math.hypot(me.pos.x - coon.pos.x, me.pos.z - coon.pos.z); H?.heard(e.song, Math.max(0, .34 * (1.1 - d / 22))); }   // his tunes carry, softer from afar
  coon.hud = e.hud || {mood: 'content', place: e.arg || coon.hud?.place || 'culvert', needs: coon.hud?.needs || {hunger: .4, energy: .7, joy: .55, boredom: .3, curiosity: .6}, plan: [], step: 0};
  coon.mood = coon.hud.mood;
  H?.set({...coon.hud, asleep: liveOn ? !!coon.hud.asleep : false}, e.time + ' · ' + e.text);
}
/* ---------------- live: everyone sees the same raccoon ----------------
   Arriving, he's placed where the brain says he is; then new events arrive every 3 s and become the
   same tasks as the replay. If we fall behind (a backgrounded tab), he jumps ahead to stay true. */
/* The bot check (Cloudflare Turnstile, invisible): off until Bobby makes a widget for labmedia.work and pastes its
   public site key here; the Worker's TURNSTILE_SECRET switches the check on at the other end. Visitors only see a
   challenge if Cloudflare isn't sure they're a person. Tokens are single use, so each send gets a fresh one. */
const TURNSTILE_SITEKEY = '';
let turnstileReady = null, turnstileId = null;
function humanToken() {
  if (!TURNSTILE_SITEKEY || !/(^|\.)labmedia\.work$/.test(location.hostname)) return Promise.resolve(undefined);
  turnstileReady ||= new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true;
    s.onload = () => ok(); s.onerror = no; document.head.appendChild(s);
  });
  return turnstileReady.then(() => new Promise(resolve => {
    const box = document.getElementById('turnstileBox') || Object.assign(document.createElement('div'), {id: 'turnstileBox', className: 'turnstile-box pe'});
    if (!box.isConnected) document.getElementById('hud2').appendChild(box);
    const done = token => resolve(token);
    if (turnstileId == null) turnstileId = turnstile.render(box, {sitekey: TURNSTILE_SITEKEY, appearance: 'interaction-only', execution: 'execute', callback: done, 'error-callback': () => resolve(undefined)});
    else { turnstile.reset(turnstileId); }
    turnstile.execute(turnstileId, {callback: done});
  })).catch(() => undefined);
}
async function api(path, body) {
  if (body && (path === '/hi' || path === '/mail')) body = {...body, token: await humanToken()};
  const r = await fetch(LIVE_BASE + path, body ? {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({vid: VID, ...body})} : {});
  const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error || 'Labcoon is out of reach.'), {status: r.status}); return j;
}
function placeAt(name) {
  const p = PLACES[name]; if (!p) return;
  if (p.water) { coon.pos.set(W.pond.center.x, WATER_Y, W.pond.center.y); coon.swimming = true; return; }   // afloat in the middle
  if (!p.stand) return; coon.pos.set(p.stand[0], ground(p.stand[0], p.stand[1]), p.stand[1]); coon.swimming = false;
}
async function startLive() {
  const s = await api('/state');
  liveOn = true; liveAsleep = !!s.asleep; liveLast = s.events.at(-1)?.id || 0;
  const hud = s.state?.hud || s.events.at(-1)?.hud;
  if (hud) { coon.hud = {...hud, asleep: s.asleep}; coon.mood = hud.mood; placeAt(hud.place); }
  LabWorld.setDronesFlying?.(hud?.drones !== false);       // the pilots stay home in bad weather
  H?.set(coon.hud, s.events.at(-1) ? s.events.at(-1).time + ' · ' + s.events.at(-1).text : 'He’s around somewhere.');
  coon.queue = [s.asleep ? {type: 'clip', name: 'sleep', loops: 1, joinSleeping: true} : {type: 'idle', secs: 1}]; taskDone();
  setInterval(pollLive, 3000);
}
async function pollLive() {
  try {
    const r = await api('/events?since=' + liveLast);
    liveAsleep = !!r.asleep;
    for (const e of r.events) { liveLast = e.id; liveQueue.push(e); }
    if (liveQueue.length > 4) {                         // fell behind: jump to the newest state
      const newest = liveQueue.at(-1); liveQueue = [newest];
      if (newest.hud?.place) placeAt(newest.hud.place); coon.queue = []; taskDone();
    }
    if (r.hud) { LabWorld.setDronesFlying?.(r.hud.drones !== false); coon.hud = {...coon.hud, ...r.hud, asleep: r.asleep}; coon.mood = r.hud.mood; if (!coon.task?.walk) H?.set(coon.hud); }
    if (/^sleep_(curl|sprawl)$/.test(coon.clip) && (!liveAsleep || liveQueue.length)) {
      coon.queue = [];
      if (!liveAsleep && !liveQueue.some(e=>e.animation==='Labcoon_wake')) coon.queue.push({type:'clip',name:'wake'});
      taskDone();
    }
    if (r.asleep !== !!coon.asleep && !liveQueue.length && coon.task?.type === 'idle') { coon.queue = []; taskDone(); }
  } catch {}
}
function nextTask(now) {
  if (!coon.queue.length) nextEvent(now);
  let next = coon.queue.shift();
  if (next.type === 'clip' && next.name === 'sleep' && coon.actions.sleep_curl && coon.actions.sleep_sprawl) {
    const entering = !restingStyle;
    const afterReaction = ['nap_ear_twitch','nap_yawn_roll'].includes(coon.clip);
    if (entering) {
      if (!afterReaction) lastStyle = lastStyle === 'curl' ? 'sprawl' : 'curl';
      restingStyle = lastStyle;
    }
    next = {...next, name:'sleep_' + restingStyle, loops:liveOn ? 1 : next.loops || 1, napPart:true};
    if (entering && !next.joinSleeping) {
      const settle = {type:'clip',name:'settle_' + restingStyle,napPart:true};
      coon.queue.unshift(next);
      if (afterReaction || coon.clip === 'sleepy_yawn') next = settle;
      else { coon.queue.unshift(settle); next = {type:'clip',name:'nap_lie_down',napPart:true}; }
    }
  } else if (restingStyle && !next.napPart) {
    // The original yawn, ear flick and planted wake all start on the same flank.
    // Return through the matched bridge before handing them the skeleton.
    coon.queue.unshift(next);
    if (!(next.type === 'clip' && ['wake','nap_ear_twitch','nap_yawn_roll'].includes(next.name))) {
      coon.queue.unshift({type:'clip', name:'wake'});
    }
    next = {type:'clip',name:'settle_' + restingStyle, reverse:true, napPart:true};
    restingStyle = null;
  }
  coon.task = next; startTask(next, now);
}
function taskDone() { const now = performance.now() / 1000; coon.task = null; nextTask(now); }
function startTask(k, now) {
  k.turns = 0;
  if (k.type === 'idle') { k.until = now + k.secs / LIFE_SPEED; play(coon.swimming ? 'swim' : 'idle'); }
  else if (k.type === 'face') { k.target = k.yaw(); }
  coon.asleep = k.type === 'clip' && /^(sleep|nap_|settle_)/.test(k.name);   // asleep while a sleep clip plays
  if (coon.hud) H?.set({...coon.hud, asleep: coon.asleep});
  if (k.type === 'clip') {
    if (coon.swimming) { k.until = now + 2 / LIFE_SPEED; return; }       // nothing but paddling while afloat
    k.clip = play(k.name, {once: !k.loops, reverse: !!k.reverse, fade: k.name === 'set_down' || k.name === 'hold_find' ? .12 : .28});
    if (!k.clip) taskDone();
  }
  else if (k.type === 'find') { findSomething(); k.clip = coon.current; }
  else if (k.type === 'wander') {
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2, d = .8 + Math.random() * 2.2, p = new THREE.Vector2(coon.pos.x + Math.cos(a) * d, coon.pos.z + Math.sin(a) * d);
      if (dry(p.x,p.y,.07) && Math.hypot(p.x-PLACES.culvert.at[0],p.y-PLACES.culvert.at[1])>1.6) {
        const route=routeTo(p);
        if(route.length && route.at(-1).equals(p)) { k.path=route; break; }
      }
    }
    if (!k.path) k.path = []; k.walk = true;
  }
  else if (k.type === 'walk') { const to = typeof k.to === 'function' ? k.to() : k.to; k.path = routeTo(to); k.walk = true; }
  else if (k.type === 'swim') {
    const to = k.to(); k.path = [to]; k.walk = true; coon.swimming = true; play('swim', {fade: .4}); coonSound('splash', hisDistance());   // stays afloat until the bank (out) or the target
  }
}
function findSomething() {
  coon.findHeld = false;
  const f = new THREE.Vector3(Math.sin(coon.yaw), 0, Math.cos(coon.yaw));
  findSpot.copy(coon.pos).addScaledVector(f, .210); findSpot.y = ground(findSpot.x, findSpot.z) + .003;
  setHeld(coon.hud?.holding); cap.position.copy(findSpot); cap.rotation.set(0, coon.yaw, 0); cap.visible = true;
  play('pick_up', {once: true, fade: .35});
}
const TMP = new THREE.Vector3();
function steer(dt, target, speed) {
  const dx = target.x - coon.pos.x, dz = target.y - coon.pos.z, d = Math.hypot(dx, dz);
  const turn = ((Math.atan2(dx, dz) - coon.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  coon.yaw += THREE.MathUtils.clamp(turn, -2.4 * dt, 2.4 * dt);
  const step = Math.min(d, speed * dt * Math.max(0, Math.cos(turn)));
  coon.pos.x += Math.sin(coon.yaw) * step; coon.pos.z += Math.cos(coon.yaw) * step;
  return d < .08;
}
function updateLabcoon(dt, now) {
  if (!coon.root) return;
  coon.mixer.update(dt);
  const k = coon.task;
  if (k?.walk) {
    if (!k.path.length) taskDone();
    else {
      let left = 0, prev = new THREE.Vector2(coon.pos.x, coon.pos.z); for (const p of k.path) { left += prev.distanceTo(p); prev = p; }
      const swim = k.type === 'swim', trot = !swim && left > 5;
      if (swim) play('swim'); else if (trot) play('trot', {rate: TROT_RATE}); else play('walk', {rate: WALK_SPEED / CLIP_SPEED});
      if (steer(dt, k.path[0], swim ? SWIM_SPEED : trot ? TROT_SPEED : WALK_SPEED)) {
        k.path.shift();
        if (!k.path.length) { if (k.out) coon.swimming = false; taskDone(); }
      }
    }
  } else if (k?.type === 'face') {
    const turn = ((k.target - coon.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    coon.yaw += THREE.MathUtils.clamp(turn, -2 * dt, 2 * dt);
    if (Math.abs(turn) < .05) taskDone();
  } else if (k?.until && now > k.until) taskDone();

  coon.pos.y = coon.swimming ? WATER_Y : ground(coon.pos.x, coon.pos.z);
  coon.root.position.copy(coon.pos); coon.root.rotation.set(0, coon.yaw, 0);
  // the cap rides interaction_target from the grip (27/24 s) until the release (35/24 s)
  const t = coon.current?.time ?? 0, c = coon.clip;
  const held = c === 'hold_find' || c === 'moon' || c === 'pick_up' && t >= 27 / 24 || c === 'set_down' && t < 35 / 24;
  if (cap.visible && held && coon.bone) {
    coon.bone.getWorldPosition(TMP); cap.position.copy(TMP); cap.position.y = Math.max(TMP.y, ground(TMP.x, TMP.z) + .003);
  } else if (c === 'set_down' && !held && !coon.findHeld) {
    coon.findHeld = true; cap.position.y = ground(cap.position.x, cap.position.z) + .003;
  }
  lightFromSky();
}

/* ---------------- input ---------------- */
addEventListener('keydown', e => {
  if (e.target.closest?.('input,textarea')) return;
  const k = e.key.toLowerCase();
  if (k === 'f' || (k === 'escape' && me.mode === 'follow')) { toggleFollow(); return; }
  keys.add(k); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  me.target = null;
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());
const canvas = document.getElementById('world');
let drag = null;
/* A floating thumb stick: a touch that starts in the lower-left of the screen walks (push further to run);
   anywhere else still drags to look, and a quick tap still walks you to that spot. */
const joy = {id: null, x0: 0, y0: 0, f: 0, s: 0, el: null};
function joyZone(x, y) { return coarse && x < innerWidth * .5 && y > innerHeight * .42; }
function joyShow(x, y, dx = 0, dy = 0) {
  if (!joy.el) { joy.el = document.createElement('div'); joy.el.className = 'joy'; joy.el.innerHTML = '<i></i>'; document.body.appendChild(joy.el); }
  joy.el.style.left = x + 'px'; joy.el.style.top = y + 'px'; joy.el.firstChild.style.transform = `translate(${dx}px,${dy}px)`; joy.el.classList.add('on');
}
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  if (joy.id == null && me.mode === 'walk' && joyZone(e.clientX, e.clientY)) { joy.id = e.pointerId; joy.x0 = e.clientX; joy.y0 = e.clientY; joy.moved = 0; me.target = null; joyShow(joy.x0, joy.y0); return; }
  drag = {x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId};
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId === joy.id) {
    let dx = e.clientX - joy.x0, dy = e.clientY - joy.y0; const R = 52, d = Math.hypot(dx, dy); joy.moved = Math.max(joy.moved, d);
    if (d > R) { dx *= R / d; dy *= R / d; }
    joy.s = dx / R; joy.f = -dy / R; joyShow(joy.x0, joy.y0, dx, dy); return;
  }
  if (!drag || drag.id !== e.pointerId) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
  const s = coarse ? .006 : .0042;
  if (me.mode === 'follow') { follow.yaw -= dx * s; follow.h = THREE.MathUtils.clamp(follow.h + dy * .002, .15, 1.3); }
  else { me.yaw -= dx * s; me.pitch = THREE.MathUtils.clamp(me.pitch - dy * s, -1.1, .9); }
});
const joyEnd = e => {
  if (e.pointerId !== joy.id) return false;
  const tap = joy.moved < 8; joy.id = null; joy.f = joy.s = 0; joy.el?.classList.remove('on');
  if (tap && e.type === 'pointerup') tapAt(e.clientX, e.clientY);
  return true;
};
canvas.addEventListener('pointercancel', joyEnd);
canvas.addEventListener('pointerup', e => {
  if (joyEnd(e)) return;
  if (!drag || drag.id !== e.pointerId) return;
  const tap = drag.moved < 8; drag = null;
  if (tap) tapAt(e.clientX, e.clientY);
});
canvas.addEventListener('wheel', e => { if (me.mode === 'follow') { follow.dist = THREE.MathUtils.clamp(follow.dist * (1 + e.deltaY * .001), .6, 4); e.preventDefault(); } }, {passive: false});

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function tapAt(x, y) {
  ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, W.camera);
  if (coon.root) {      // Labcoon is small: forgive the tap by 25 cm
    const c = coon.pos.clone().setY(coon.pos.y + .16);
    if (ray.ray.distanceToPoint(c) < .28) { tapLabcoon(); return; }
  }
  const found = finds?.pick(ray);
  if (found) {                                              // tap a find: say what it is
    const what = (/s$/.test(found) && !/glass|bolt|cross/.test(found) ? 'Some ' : /^[aeiou]/.test(found) ? 'An ' : 'A ') + found;
    H?.bubble(what + '. He hasn’t found it yet.', x, y); sfx('pick'); clearTimeout(tapAt.t); tapAt.t = setTimeout(() => H?.bubble(null), 2600); return;
  }
  H?.sheet(null);
  if (me.mode === 'follow') return;
  const o = ray.ray.origin, d = ray.ray.direction;           // march to the terrain
  for (let s = .3; s < 70; s *= 1.04) {
    const x = o.x + d.x * s, y = o.y + d.y * s, z = o.z + d.z * s;
    if (y <= Math.max(ground(x, z), 0)) {
      if (!blocked(x, z)) { me.target = new THREE.Vector2(x, z); flashMarker(x, z); }
      return;
    }
  }
}
const marker = new THREE.Mesh(new THREE.RingGeometry(.12, .16, 32).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({color: 0xffe2a8, transparent: true, opacity: 0, depthWrite: false}));
function flashMarker(x, z) { marker.position.set(x, ground(x, z) + .02, z); marker.material.opacity = .9; }
function toggleFollow() {
  if (me.mode === 'follow') {
    me.mode = 'walk';
    const back = new THREE.Vector3(Math.sin(follow.yaw), 0, Math.cos(follow.yaw)).multiplyScalar(2.2).add(coon.pos);
    if (!blocked(back.x, back.z)) me.pos.set(back.x, 0, back.z);
    me.yaw = Math.atan2(-(coon.pos.x - me.pos.x), -(coon.pos.z - me.pos.z)); me.pitch = -.35;
  } else if (coon.root) { me.mode = 'follow'; follow.yaw = coon.yaw + .95; follow.hold = 0; }
  H?.following(me.mode === 'follow');
}

/* ---------------- talking to Labcoon ----------------
   Tap him: asleep, three taps wake him the way the brain plans it (an ear flick, a yawn and roll,
   then up and grumbly). Awake, a small sheet lets you say hi (5 a day). Replies here are an
   offline preview; live, the Worker passes the line to his brain and filters both ways. */
let bubbleUntil = 0;
function hisDistance() { return me.mode === 'follow' ? 1.5 : Math.hypot(me.pos.x - coon.pos.x, me.pos.z - coon.pos.z); }
function tapLabcoon() {
  if (!coon.root) return;
  coonSound(coon.asleep || coon.hud?.asleep ? 'huff' : 'chitter', hisDistance());
  if (liveOn && (coon.asleep || coon.hud?.asleep)) {
    api('/tap', {}).then(() => H.sheet('You poke him. Give him a second…', false)).catch(e => H.sheet(e.message, false));
    return;
  }
  if (coon.asleep) {
    coon.wakeTaps = (coon.wakeTaps || 0) + 1;
    const n = coon.wakeTaps;
    coon.queue = coon.queue.filter(k => !(k.type === 'clip' && (k.name === 'wake' || k.napPart)));
    if (n < 3) coon.queue.unshift({type: 'clip', name: n === 1 ? 'nap_ear_twitch' : 'nap_yawn_roll'}, {type: 'clip', name: 'sleep', loops: 2}, {type: 'clip', name: 'wake'});
    else { coon.queue.unshift({type: 'clip', name: 'wake'}, {type: 'clip', name: 'wake_grumble'}); coon.wakeTaps = 0; coon.mood = 'grumbly (just woken)'; }
    H.sheet(n < 3 ? (n === 1 ? 'His ear flicks. Still asleep. (1 of 3)' : 'A big yawn, and he rolls over. (2 of 3)') : 'He’s up. Not thrilled about it.', false);
    if (n >= 3) { H.set({...coon.hud, asleep: false, mood: 'grumbly (just woken)', thought: 'mm. what. who poked me'}); }
    taskDone();
    return;
  }
  H.sheet(`Labcoon is ${coon.mood || 'content'}. ${me.mode === 'follow' ? '' : 'Follow him from the button up top.'}`, true);
}
const REPLIES = {
  content: ['oh. hi. the water’s flat tonight.', 'hello. i was about to check the rock.', 'hi. you can stay. don’t step on my stuff.'],
  delighted: ['HI. look at this. no, look.', 'hello hello. good night for finding things.', 'oh you’re here. everything is shiny tonight.'],
  hungry: ['hi. do you have a crust. no? ok.', 'hello. i’m thinking about the trash can.'],
  sleepy: ['mm. hi.', 'hello… later. tired.'],
  bored: ['finally. someone. tell me something.', 'hi. nothing has happened for an hour.'],
  nosy: ['what’s in your pockets', 'hi. what’s that noise past the corn, do you know'],
  'grumbly (just woken)': ['…what. hi. what.', 'you woke me. hi. fine.'],
};
async function sayHi(text) {
  let reply = null;
  if (liveOn) {
    H.sheet(null); H.bubble('…'); bubbleUntil = performance.now() / 1000 + 25;
    try {
      const {id} = await api('/hi', {text});
      for (let i = 0; i < 24; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const r = await api('/hi/' + id);
        if (r.reply) { H.bubble(r.reply); bubbleUntil = performance.now() / 1000 + Math.max(5, r.reply.length / 12); reply = r.reply; break; }
      }
    } catch (e) { H.bubble(null); bubbleUntil = 0; H.sheet(e.message, false); }
    if (!coon.task?.walk && !coon.asleep) coon.yaw = faceTo(me.pos.x, me.pos.z);
    return reply;
  }
  const list = REPLIES[coon.mood] || REPLIES.content, now = performance.now() / 1000;
  reply = list[Math.floor(Math.random() * list.length)];
  H.sheet(null); H.bubble(reply); bubbleUntil = now + 5.5;
  const yaw = faceTo(me.pos.x, me.pos.z);                                   // he looks round at you
  if (!coon.task?.walk && !coon.asleep) coon.yaw = yaw;
  return reply;
}
function walkToHim() {                               // walk over, stopping a couple of metres off, facing him; far away, hop there
  if (!coon.root) return;
  if (me.mode === 'follow') toggleFollow();
  const dx = coon.pos.x - me.pos.x, dz = coon.pos.z - me.pos.z, d = Math.hypot(dx, dz);
  if (d > 30) return takeMeTo('labcoon');
  if (d < 2.4) { me.yaw = Math.atan2(-dx, -dz); return; }
  const x = coon.pos.x - dx / d * 2, z = coon.pos.z - dz / d * 2;
  for (let i = 1; i <= 24; i++) {                    // water or a solid in the way: hop there instead of stalling at the bank
    const k = i / 24; if (blocked(me.pos.x + (x - me.pos.x) * k, me.pos.z + (z - me.pos.z) * k)) return takeMeTo('labcoon');
  }
  me.target = new THREE.Vector2(x, z); me.hurry = d > 8; flashMarker(x, z);   // trot when he's a way off
}
function takeMeTo(k) {
  let target, look;
  if (k === 'labcoon') { target = new THREE.Vector2(coon.pos.x, coon.pos.z); look = target; }
  else if (k === 'the_shed') { target = new THREE.Vector2(-13.1, -4.4); look = target; }
  else { const p = PLACES[k]; if (!p) return; target = new THREE.Vector2(...p.at); look = target; }
  if (me.mode === 'follow') toggleFollow();
  let best = null;                                   // a dry, open spot 2.6 m away, the side nearest to you
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const x = target.x + Math.cos(a) * 2.6, z = target.y + Math.sin(a) * 2.6;
    if (blocked(x, z) || !dry(x, z, .08)) continue;
    const d = Math.hypot(x - me.pos.x, z - me.pos.z); if (!best || d < best.d) best = {x, z, d};
  }
  if (!best) return;
  me.pos.set(best.x, 0, best.z); me.target = null;
  me.yaw = Math.atan2(-(look.x - best.x), -(look.y - best.z)); me.pitch = -.3;
}

/* ---------------- per frame ---------------- */
const lastStep = new THREE.Vector3(), camPos = new THREE.Vector3(), look = new THREE.Vector3(), fwd = new THREE.Vector3(), side = new THREE.Vector3();
// Static prop bounds reject distant meshes before triangle tests. Check both ends
// of his silhouette so a clear ray to the middle cannot hide his face behind a bank.
const cameraMeshes=[], sightRay=new THREE.Raycaster(), focusPoint=new THREE.Vector3(), sightDir=new THREE.Vector3();
function clearShot(lens) {
  for(const dz of [-.25,.24]){
    focusPoint.set(coon.pos.x+dz*Math.sin(coon.yaw),coon.pos.y+.17,coon.pos.z+dz*Math.cos(coon.yaw));
    const length=sightDir.subVectors(focusPoint,lens).length();
    sightRay.set(lens,sightDir.normalize()); sightRay.far=length;
    for(const {mesh,bounds} of cameraMeshes){
      if(bounds.distanceToPoint(lens)>length || !sightRay.ray.intersectsBox(bounds))continue;
      if(bounds.containsPoint(lens)||sightRay.intersectObject(mesh,false).length)return false;
    }
    for(let i=1;i<=5;i++){
      const t=i/6,x=lens.x+(focusPoint.x-lens.x)*t,z=lens.z+(focusPoint.z-lens.z)*t;
      if(ground(x,z)+.035>lens.y+(focusPoint.y-lens.y)*t)return false;
    }
  }
  return true;
}
let frames = [], first = true;
function update(dt, camera) {
  const now = performance.now() / 1000;
  frames.push(dt); if (frames.length > 90) frames.shift();
  if (me.mode === 'walk') {
    let f = 0, s = 0;
    if (keys.has('w') || keys.has('arrowup')) f += 1;
    if (keys.has('s') || keys.has('arrowdown')) f -= 1;
    if (keys.has('a')) s -= 1; if (keys.has('d')) s += 1;
    if (keys.has('arrowleft')) me.yaw += 1.8 * dt; if (keys.has('arrowright')) me.yaw -= 1.8 * dt;
    const stick = Math.hypot(joy.f, joy.s); if (stick > .12) { f += joy.f; s += joy.s; }
    fwd.set(-Math.sin(me.yaw), 0, -Math.cos(me.yaw)); side.set(-fwd.z, 0, fwd.x);
    let move = new THREE.Vector3().addScaledVector(fwd, f).addScaledVector(side, s);
    if (me.target && !f && !s) {
      const dx = me.target.x - me.pos.x, dz = me.target.y - me.pos.z, d = Math.hypot(dx, dz);
      if (d < .15) { me.target = null; me.hurry = false; }
      else { move.set(dx / d, 0, dz / d); const want = Math.atan2(-dx, -dz); me.yaw += ((want - me.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 3); }
    }
    if (move.lengthSq() > 0) {
      const pace = keys.has('shift') || stick > .92 || (me.hurry && me.target && !f && !s) ? RUN : stick > .12 ? WALK * Math.min(1, .45 + stick) : WALK;
      move.normalize().multiplyScalar(pace * dt);
      if (!blocked(me.pos.x + move.x, me.pos.z + move.z)) me.pos.add(move);
      else if (!blocked(me.pos.x + move.x, me.pos.z)) me.pos.x += move.x;       // slide along the shore
      else if (!blocked(me.pos.x, me.pos.z + move.z)) me.pos.z += move.z;
      else me.target = null;
    }
    camPos.set(me.pos.x, ground(me.pos.x, me.pos.z) + EYE, me.pos.z);
    look.set(-Math.sin(me.yaw) * Math.cos(me.pitch), Math.sin(me.pitch), -Math.cos(me.yaw) * Math.cos(me.pitch)).add(camPos);
  } else {
    // third person: stay behind and above Labcoon, ease round when he turns
    // Show all of him: walking, the camera leads from a front three-quarter (you see his face coming);
    // stopped, it circles him slowly. A drag takes over for a few seconds.
    if (drag) follow.hold = now + 4;
    else if (now > follow.hold) {
      if (coon.task?.walk) {
        const want = coon.yaw + follow.side * .95;                        // ahead of him, off to one side
        follow.yaw += ((want - follow.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * .9);
      } else { follow.yaw += .18 * dt; follow.side = Math.sin(follow.yaw - coon.yaw) >= 0 ? 1 : -1; }
    }
    const frameDistance=Math.max(follow.dist,.95/Math.min(1,camera.aspect));
    const frameHeight=follow.h+.05*Math.sin(now*.4);
    for(const [angle,rise] of [[0,0],[0,.38],[.52,.22],[-.52,.22],[1.05,.38],[-1.05,.38],[2,.48],[-2,.48],[Math.PI,.6],[0,1.65]]){
      const x=coon.pos.x+Math.sin(follow.yaw+angle)*frameDistance, z=coon.pos.z+Math.cos(follow.yaw+angle)*frameDistance;
      camPos.set(x,Math.max(ground(x,z)+.22,coon.pos.y+frameHeight+rise),z);
      if(clearShot(camPos))break;
    }
    look.set(coon.pos.x, coon.pos.y + .17, coon.pos.z);
  }
  if (first || reduce) { camera.position.copy(camPos); first = false; }
  else camera.position.lerp(camPos, 1 - Math.pow(.0005, dt));
  if(me.mode==='follow'&&!clearShot(camera.position))camera.position.copy(camPos);
  W.uniforms.uFollowSubject.value.set(coon.pos.x,coon.pos.y,coon.pos.z,me.mode==='follow'?1:0);
  camera.lookAt(look);
  if (!reduce) {                                         // the camera breathes a little, like someone standing in a field
    camera.rotateX(Math.sin(now * .53 + 1) * .0045); camera.rotateZ(Math.sin(now * .31) * .0035);
    camera.position.y += Math.sin(now * 1.05) * .0012;
  }
  updatePrecipitation?.(dt,observedWeather);
  updateWildlife?.(dt);
  finds?.tick(dt, W.uniforms.uNight.value);
  litter?.update(dt, camera);
  if (coon.task?.walk) {                                  // his paws (or paddling) when he's on the move
    coon.stepT = (coon.stepT || 0) + dt * (coon.swimming ? 1.6 : 3.2);
    if (coon.stepT > 1) { coon.stepT = 0; coonSound(coon.swimming ? 'paddle' : 'step', hisDistance()); }
  }
  if (coon.hud?.holding) setHeld(coon.hud.holding);
  updateLabcoon(dt * LIFE_SPEED, now);   // ?speed=4 runs Labcoon's night faster for review
  marker.material.opacity = Math.max(0, marker.material.opacity - dt * .9);
  // the field's sound: wind, night or day, how near the water and the poles are, and your steps
  { const U = W.uniforms, x = me.mode === 'follow' ? coon.pos.x : me.pos.x, z = me.mode === 'follow' ? coon.pos.z : me.pos.z;
    const shore = Math.hypot(x / 12, (z + 11.5) / 9), pole = Math.max(0, 1 - Math.min(Math.hypot(x + 7, z + 20), Math.hypot(x - 18.6, z - 10.8)) / 9);
    const moved = Math.hypot(me.pos.x - lastStep.x, me.pos.z - lastStep.z) / Math.max(dt, 1e-3); lastStep.copy(me.pos);
    fieldSound(dt, {wind: windNow(), gust: gustNow(), night: U.uNight.value, day: U.uDay.value, water: Math.max(0, Math.min(1, 1.7 - shore)), pole,
      walking: me.mode === 'walk' ? Math.min(1, moved / WALK) : 0}); }
  if (H && coon.root) {
    H.mapDots(me, coon.pos);
    // find Labcoon: when he's off-screen (or behind you), his face waits at the matching screen edge
    const v = coon.pos.clone(); v.y += .2; v.project(camera);
    const behind = v.z > 1, onScreen = !behind && Math.abs(v.x) < .92 && Math.abs(v.y) < .86;
    if (onScreen || me.mode === 'follow') H.finder(null);
    else {
      let dx = behind ? -v.x : v.x, dy = behind ? -v.y : v.y; if (Math.abs(dx) < 1e-3 && Math.abs(dy) < 1e-3) dx = 1;
      const top = 120, bottom = 150, side = 44, cx = innerWidth / 2, cy = innerHeight / 2;
      const kx = (cx - side) / Math.abs(dx || 1e-6), ky = ((dy > 0 ? cy - top : cy - bottom)) / Math.abs(dy || 1e-6), k = Math.min(kx, ky);
      H.finder(cx + dx * k, cy - dy * k, Math.atan2(-dy, dx));
    }
    if (bubbleUntil) {
      if (now > bubbleUntil) { H.bubble(null); bubbleUntil = 0; }
      else { const v = coon.pos.clone(); v.y += .42; v.project(camera); H.bubble(undefined, (v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight - 8); }
    }
  }
  if (perf && frames.length > 30) {
    const sorted = [...frames].sort((a, b) => a - b), med = sorted[sorted.length >> 1] * 1000;
    perf.textContent = med.toFixed(1) + ' ms · ' + Math.round(1000 / med) + ' fps';
  }
}

/* ---------------- boot ---------------- */
W = LabWorld.explore(update);
ground = W.ground; depth = W.depth;
if(localField||remoteField){updatePrecipitation=precipitation(W,reduce);updateWildlife=fieldWildlife(W,displayEncode,reduce,localField?undefined:async()=>(await getField()).wildlife);}
W.scene.add(marker);
places = buildPlaces({THREE, ground, encode: displayEncode});
W.scene.add(places.group); SOLID.push(...places.colliders);
const [drainX,drainZ]=PLACES.culvert.at;
const drainAxis=new THREE.Vector2(W.pond.center.x-drainX,W.pond.center.y-drainZ).normalize();
W.uniforms.uDrainAxis.value.set(drainX,drainZ,drainAxis.x,drainAxis.y);
places.group.updateWorldMatrix(true,true);
places.group.traverse(mesh=>{
  if(!mesh.isMesh || mesh.geometry.type==='PlaneGeometry' && mesh.geometry.parameters?.height===82)return;
  cameraMeshes.push({mesh,bounds:new THREE.Box3().setFromObject(mesh)});
});
litter = fieldLitter(THREE, W.scene, {uniforms: W.uniforms, ground, encode: displayEncode, reduced: reduce});
finds = LIVE_BASE ? fieldFinds(THREE, W.scene, {ground, dry, places: PLACES, encode: displayEncode, reduced: reduce}) : null;
H = createHud({places: PLACES, ground, pond: W.pond, onTakeMe: takeMeTo, onWalkTo: walkToHim, onFollow: () => toggleFollow(), onSayHi: sayHi, live: !!LIVE_BASE, api: LIVE_BASE ? api : null,
  onGame: r => { if (liveOn) api('/game', r).catch(() => {}); }});   // results reach his brain; he'll think about them later
me.pos.y = ground(me.pos.x, me.pos.z);
liveSky(); setInterval(liveSky, 60000);
if(localField||remoteField){
  refreshFieldWeather();
  setInterval(refreshFieldWeather,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshFieldWeather();});
}
loadLabcoon().then(() => {
  document.documentElement.classList.add('labcoon-ready');
  const l = document.getElementById('loading'); if (!l) return;
  document.getElementById('loadCoon').style.left = 'calc(100% - 54px)';
  const enter = () => { try { localStorage.setItem('labcoon-intro-seen', '1'); } catch {} l.classList.add('gone'); setTimeout(() => l.remove(), 700); };
  // The intro waits for a first visitor's tap (which also wakes the sound); returning visitors walk straight in.
  let seen = false; try { seen = !!localStorage.getItem('labcoon-intro-seen'); } catch {}
  const force = q.get('intro') === '1', skip = q.has('journal') || q.get('intro') === '0' || (navigator.webdriver && !force);
  if ((seen || skip) && !force) { setTimeout(enter, 450); return; }
  const go = document.getElementById('introGo'), line = document.getElementById('loadingText');
  if (line) line.textContent = 'He’s ready when you are.';
  if (go) { go.disabled = false; go.focus(); go.addEventListener('click', enter, {once: true}); }
  document.getElementById('introJournal')?.addEventListener('click', () => { try { localStorage.setItem('labcoon-intro-seen', '1'); } catch {} });
})
  .catch(err => { console.error(err); say('Labcoon could not load: ' + err.message); });
window.LabExplore = {me, coon, world: W, get live() { return liveOn; }, follow: toggleFollow, followCam: follow, tapAt, get perf() { return perf?.textContent; }};
