/* Explore: walk the LaB field yourself, and find Labcoon pottering on the bank.
   Prototype (Nov 26 2026). The world is the homepage's own pond world (world.js);
   this module only takes the camera, adds a walker and Labcoon.

   Controls: WASD / arrows to walk (Shift runs), drag to look, click or tap the ground to
   walk there, click or tap Labcoon (or press F) to follow him, F / Esc to walk again. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {buildPlaces, PLACES} from './labcoon-places.js?v=2';
import {createHud} from './explore-hud.js?v=1';

const LAT = 42.67, LON = -83.03;
const q = new URLSearchParams(location.search);
const LIFE_SPEED = Math.min(8, Math.max(.25, +(q.get('speed') || 1)));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const perf = document.getElementById('perf'); if (q.has('debug')) perf.hidden = false;
let H = null;              // the HUD (explore-hud.js), made at boot

/* ---------------- walker ---------------- */
const SOLID = [[-7, -20, .3], [18.6, 10.8, .3]];   // the two poles inside the field; places add theirs
const EYE = 1.55, WALK = 1.35, RUN = 3.2;
const me = {pos: new THREE.Vector3(3.2, 0, 3.6), yaw: .55, pitch: -0.08, target: null, mode: 'walk'};
const keys = new Set();
let W, ground, depth, places, follow = {yaw: 0, dist: 1.35, h: .55};

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
function liveSky() {
  let t = new Date();
  const at = q.get('at')?.match(/^(\d{1,2}):(\d{2})$/);
  if (at) { t = new Date(t); t.setHours(+at[1], +at[2], 0, 0); }
  if (window.LaBSun) {
    const p = LaBSun.position(t, LAT, LON);
    LabWorld.setSun(p.elevation);
    LabWorld.setWind(+(q.get('wind') || 6), +(q.get('wind') || 6) + 4, 270, p.azimuth);
  }
  LabWorld.setCloud(.4);
}

/* ---------------- Labcoon ---------------- */
const coon = {root: null, mixer: null, actions: {}, current: null, pos: new THREE.Vector3(), yaw: 0,
  queue: [], task: null, swimming: false, irises: [], findHeld: false, bone: null, home: new THREE.Vector2()};
const WALK_SPEED = .21, CLIP_SPEED = .165;     // clip is authored for 0.165 m/s at rate 1
const cap = new THREE.Mesh(new THREE.CylinderGeometry(.0105, .0115, .006, 21),
  new THREE.MeshStandardMaterial({color: 0x8c0d0a, metalness: .85, roughness: .32}));
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
}
const MOON = new THREE.Color(.55, .66, .95), TMP2 = new THREE.Vector3();

async function loadLabcoon() {
  const loader = new GLTFLoader();
  const ktx = new KTX2Loader().setTranscoderPath('/pond/vendor/three/addons/libs/basis/').detectSupport(W.renderer);
  loader.setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync('/pond/labcoon/labcoon_v07.glb');
  const root = gltf.scene, coats = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    const mat = o.material;
    if (mat?.name.includes('underfur')) coats.push(o);
    if (mat?.transparent && /fur|fibres|hair|strand/i.test(mat.name)) {
      mat.alphaTest = .025; mat.opacity = .52; mat.depthWrite = false; mat.color.multiplyScalar(.74);
    }
    if (mat?.name.startsWith('Iris')) { mat.emissive = new THREE.Color(.62, .78, .32); mat.emissiveIntensity = 0; coon.irises.push(mat); }
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
  nightIndex = Math.floor(Math.random() * Math.max(1, NIGHT.length));
  play('idle'); nextTask(performance.now() / 1000);
}
function play(name, {once = false, rate = 1, fade = .28} = {}) {
  const a = coon.actions[name];
  if (!a) return null;
  if (coon.current === a && !once) { a.setEffectiveTimeScale(rate); return a; }
  a.reset().setEffectiveTimeScale(rate).setEffectiveWeight(1);
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
function routeTo(target) {
  const from = new THREE.Vector2(coon.pos.x, coon.pos.z);
  if (clearLine(from, target)) return [target];
  const c = W.pond.center, ang = v => Math.atan2(v.y - c.y, v.x - c.x);
  const i0 = Math.round(((ang(from) / (Math.PI * 2)) * 36 + 36)) % 36, i1 = Math.round(((ang(target) / (Math.PI * 2)) * 36 + 36)) % 36;
  const fwd = (i1 - i0 + 36) % 36, dir = fwd <= 18 ? 1 : -1, steps = dir > 0 ? fwd : 36 - fwd, path = [];
  for (let s = 0; s <= steps; s++) path.push(ring[(i0 + dir * s + 36) % 36].clone());
  path.push(target); return path;
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
  switch (e.move) {
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
    case 'check_mail': faceAt('mailbox'); clip('beg'); idle(1.5); break;
    case 'pry_lid': case 'dig_in': faceAt('trash_can'); clip('pry'); break;
    case 'draw': case 'hand_paint': faceAt('art_shed'); clip('draw'); break;
    case 'nap': clip('sleep', {loops: 3}); clip('wake'); break;
    case 'explore': for (let i = 0; i < 2; i++) T.push({type: 'wander'}); clip('sniff'); break;
    case 'sniff': case 'stash': case 'write_on_board': clip('sniff'); idle(1.5); break;
    case 'eat': case 'eat_here': clip('sniff'); idle(2); break;
    default: idle(2.5);
  }
  return T;
}
function nextEvent(now) {
  if (!NIGHT.length) { coon.queue.push({type: 'wander'}, {type: 'idle', secs: 2}); return; }
  const e = NIGHT[nightIndex++ % NIGHT.length];
  coon.queue.push(...plan(e));
  coon.hud = e.hud || {mood: 'content', place: e.arg || coon.hud?.place || 'culvert', needs: coon.hud?.needs || {hunger: .4, energy: .7, joy: .55, boredom: .3, curiosity: .6}, plan: [], step: 0};
  coon.mood = coon.hud.mood;
  H?.set({...coon.hud, asleep: false}, e.time + ' · ' + e.text);
}
function nextTask(now) {
  if (!coon.queue.length) nextEvent(now);
  coon.task = coon.queue.shift(); startTask(coon.task, now);
}
function taskDone() { const now = performance.now() / 1000; coon.task = null; nextTask(now); }
function startTask(k, now) {
  k.turns = 0;
  if (k.type === 'idle') { k.until = now + k.secs / LIFE_SPEED; play(coon.swimming ? 'swim' : 'idle'); }
  else if (k.type === 'face') { k.target = k.yaw(); }
  coon.asleep = k.type === 'clip' && /^(sleep|nap_)/.test(k.name);   // asleep while a sleep clip plays
  if (coon.hud) H?.set({...coon.hud, asleep: coon.asleep});
  if (k.type === 'clip') {
    if (coon.swimming) { k.until = now + 2 / LIFE_SPEED; return; }       // nothing but paddling while afloat
    k.clip = play(k.name, {once: !k.loops, fade: k.name === 'set_down' || k.name === 'hold_find' ? .12 : .28});
    if (!k.clip) taskDone();
  }
  else if (k.type === 'find') { findSomething(); k.clip = coon.current; }
  else if (k.type === 'wander') {
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2, d = .8 + Math.random() * 2.2, p = new THREE.Vector2(coon.pos.x + Math.cos(a) * d, coon.pos.z + Math.sin(a) * d);
      if (dry(p.x, p.y, .07) && clearLine(new THREE.Vector2(coon.pos.x, coon.pos.z), p)) { k.path = [p]; break; }
    }
    if (!k.path) k.path = []; k.walk = true;
  }
  else if (k.type === 'walk') { const to = typeof k.to === 'function' ? k.to() : k.to; k.path = routeTo(to); k.walk = true; }
  else if (k.type === 'swim') {
    const to = k.to(); k.path = [to]; k.walk = true; coon.swimming = true; play('swim', {fade: .4});   // stays afloat until the bank (out) or the target
  }
}
function findSomething() {
  coon.findHeld = false;
  const f = new THREE.Vector3(Math.sin(coon.yaw), 0, Math.cos(coon.yaw));
  findSpot.copy(coon.pos).addScaledVector(f, .210); findSpot.y = ground(findSpot.x, findSpot.z) + .003;
  cap.position.copy(findSpot); cap.rotation.set(0, coon.yaw, 0); cap.visible = true;
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
canvas.addEventListener('pointerdown', e => { drag = {x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId}; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
  const s = coarse ? .006 : .0042;
  if (me.mode === 'follow') { follow.yaw -= dx * s; follow.h = THREE.MathUtils.clamp(follow.h + dy * .002, .15, 1.3); }
  else { me.yaw -= dx * s; me.pitch = THREE.MathUtils.clamp(me.pitch - dy * s, -1.1, .9); }
});
canvas.addEventListener('pointerup', e => {
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
    const back = new THREE.Vector3(Math.sin(follow.yaw), 0, Math.cos(follow.yaw)).multiplyScalar(-2.2).add(coon.pos);
    if (!blocked(back.x, back.z)) me.pos.set(back.x, 0, back.z);
    me.yaw = Math.atan2(-(coon.pos.x - me.pos.x), -(coon.pos.z - me.pos.z)); me.pitch = -.35;
  } else if (coon.root) { me.mode = 'follow'; follow.yaw = coon.yaw + Math.PI * .85; }
  H?.following(me.mode === 'follow');
}

/* ---------------- talking to Labcoon ----------------
   Tap him: asleep, three taps wake him the way the brain plans it (an ear flick, a yawn and roll,
   then up and grumbly). Awake, a small sheet lets you say hi (5 a day). Replies here are an
   offline preview; live, the Worker passes the line to his brain and filters both ways. */
let bubbleUntil = 0;
function tapLabcoon() {
  if (!coon.root) return;
  if (coon.asleep) {
    coon.wakeTaps = (coon.wakeTaps || 0) + 1;
    const n = coon.wakeTaps;
    coon.queue = coon.queue.filter(k => !(k.type === 'clip' && k.name === 'wake'));
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
function sayHi() {
  const list = REPLIES[coon.mood] || REPLIES.content, now = performance.now() / 1000;
  H.sheet(null); H.bubble(list[Math.floor(Math.random() * list.length)]); bubbleUntil = now + 5.5;
  const yaw = faceTo(me.pos.x, me.pos.z);                                   // he looks round at you
  if (!coon.task?.walk && !coon.asleep) coon.yaw = yaw;
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
const camPos = new THREE.Vector3(), look = new THREE.Vector3(), fwd = new THREE.Vector3(), side = new THREE.Vector3();
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
    fwd.set(-Math.sin(me.yaw), 0, -Math.cos(me.yaw)); side.set(-fwd.z, 0, fwd.x);
    let move = new THREE.Vector3().addScaledVector(fwd, f).addScaledVector(side, s);
    if (me.target && !f && !s) {
      const dx = me.target.x - me.pos.x, dz = me.target.y - me.pos.z, d = Math.hypot(dx, dz);
      if (d < .15) me.target = null;
      else { move.set(dx / d, 0, dz / d); const want = Math.atan2(-dx, -dz); me.yaw += ((want - me.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 3); }
    }
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar((keys.has('shift') ? RUN : WALK) * dt);
      if (!blocked(me.pos.x + move.x, me.pos.z + move.z)) me.pos.add(move);
      else if (!blocked(me.pos.x + move.x, me.pos.z)) me.pos.x += move.x;       // slide along the shore
      else if (!blocked(me.pos.x, me.pos.z + move.z)) me.pos.z += move.z;
      else me.target = null;
    }
    camPos.set(me.pos.x, ground(me.pos.x, me.pos.z) + EYE, me.pos.z);
    look.set(-Math.sin(me.yaw) * Math.cos(me.pitch), Math.sin(me.pitch), -Math.cos(me.yaw) * Math.cos(me.pitch)).add(camPos);
  } else {
    // third person: stay behind and above Labcoon, ease round when he turns
    if (!drag) follow.yaw += (((coon.yaw + Math.PI) - follow.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * .6);
    const tx = coon.pos.x - Math.sin(follow.yaw + Math.PI) * follow.dist, tz = coon.pos.z - Math.cos(follow.yaw + Math.PI) * follow.dist;
    camPos.set(tx, Math.max(ground(tx, tz) + .12, coon.pos.y + follow.h), tz);
    look.set(coon.pos.x, coon.pos.y + .17, coon.pos.z);
  }
  if (first || reduce) { camera.position.copy(camPos); first = false; }
  else camera.position.lerp(camPos, 1 - Math.pow(.0005, dt));
  camera.lookAt(look);
  updateLabcoon(dt * LIFE_SPEED, now);   // ?speed=4 runs Labcoon's night faster for review
  marker.material.opacity = Math.max(0, marker.material.opacity - dt * .9);
  if (H && coon.root) {
    H.mapDots(me, coon.pos);
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
W.scene.add(marker);
places = buildPlaces({THREE, ground, encode: displayEncode});
W.scene.add(places.group); SOLID.push(...places.colliders);
H = createHud({places: PLACES, ground, pond: W.pond, onTakeMe: takeMeTo, onFollow: () => toggleFollow(), onSayHi: sayHi});
me.pos.y = ground(me.pos.x, me.pos.z);
liveSky(); setInterval(liveSky, 60000);
loadLabcoon().then(() => document.documentElement.classList.add('labcoon-ready'))
  .catch(err => { console.error(err); say('Labcoon could not load: ' + err.message); });
window.LabExplore = {me, coon, world: W, follow: toggleFollow, tapAt, get perf() { return perf?.textContent; }};
