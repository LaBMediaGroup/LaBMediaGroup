/* Explore: walk the LaB field yourself, and find Labcoon pottering on the bank.
   Prototype (Nov 26 2026). The world is the homepage's own pond world (world.js);
   this module only takes the camera, adds a walker and Labcoon.

   Controls: WASD / arrows to walk (Shift runs), drag to look, click or tap the ground to
   walk there, click or tap Labcoon (or press F) to follow him, F / Esc to walk again. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';

const LAT = 42.67, LON = -83.03;
const q = new URLSearchParams(location.search);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const hud = document.getElementById('hud'), act = document.getElementById('labcoonDoing'), perf = document.getElementById('perf');

/* ---------------- walker ---------------- */
const EYE = 1.55, WALK = 1.35, RUN = 3.2;
const me = {pos: new THREE.Vector3(0, 0, 4.2), yaw: 0, pitch: -0.08, target: null, mode: 'walk'};
const keys = new Set();
let W, ground, depth, follow = {yaw: 0, dist: 1.35, h: .55};

function dry(x, z, margin = .04) {            // ground above the water line, inside the field
  if (Math.abs(x - W.pond.center.x) > W.extent / 2 - 3 || Math.abs(z - W.pond.center.y) > W.extent / 2 - 3) return false;
  return ground(x, z) > margin;
}
function blocked(x, z) {
  if (!dry(x, z, -.02)) return true;
  if (Math.hypot(x - W.oak.x, z - W.oak.y) < .55) return true;     // the oak's trunk
  if (W.onShed(x, z)) return true;                                  // the shed and its pad (no walking in yet)
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
  state: 'idle', until: 0, path: null, find: null, findHeld: false, bone: null, home: new THREE.Vector2(), loops: 0};
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
}

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
    if (mat) displayEncode(mat);
  });
  for (const c of coats) addFur(c);
  coon.root = root; W.scene.add(root, hemi, sun, sun.target, cap); cap.visible = false;
  coon.mixer = new THREE.AnimationMixer(root);
  for (const clip of gltf.animations) coon.actions[clip.name.replace(/^Labcoon_/, '')] = coon.mixer.clipAction(clip);
  coon.bone = root.getObjectByName('interaction_target');
  coon.mixer.addEventListener('finished', e => onClipEnd(e.action));
  coon.mixer.addEventListener('loop', e => {           // two turns of the hold loop, then set it down
    if (e.action === coon.actions.hold_find && coon.state === 'hold' && ++coon.loops >= 2) {
      coon.state = 'drop'; play('set_down', {once: true, fade: .12}); say('putting it down');
    }
  });
  // home: the first dry stretch of bank between the walker and the pond
  for (let z = 1.5; z > -4; z -= .1) if (dry(.9, z, .08) && !dry(.9, z - .8, .02)) { coon.home.set(.9, z + .6); break; }
  coon.pos.set(coon.home.x, ground(coon.home.x, coon.home.y), coon.home.y); coon.yaw = Math.PI * .8;
  play('idle'); think(0);
}
function play(name, {once = false, rate = 1, fade = .28} = {}) {
  const a = coon.actions[name];
  if (!a) return;
  a.reset().setEffectiveTimeScale(rate).setEffectiveWeight(1);
  a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity); a.clampWhenFinished = once;
  if (coon.current && coon.current !== a) a.crossFadeFrom(coon.current, fade, false);
  a.play(); coon.current = a; coon.clip = name;
}
const say = text => { if (act) act.textContent = text; };

/* What Labcoon does next: wander along the bank, stop and sniff, and now and then find
   a bottle cap, pick it up, turn it over at his chest and put it down again. */
function think(now) {
  const r = Math.random();
  if (coon.state === 'walk' || coon.state === 'idle' && r < .45) return wander(now);
  if (r < .7) { coon.state = 'sniff'; play('sniff', {once: true}); say('sniffing the grass'); return; }
  findSomething();
}
function wander(now) {
  for (let i = 0; i < 30; i++) {
    const a = Math.random() * Math.PI * 2, d = .8 + Math.random() * 2.4;
    const x = coon.home.x + Math.cos(a) * d * 1.4, z = coon.home.y + Math.sin(a) * d * .7;
    let ok = dry(x, z, .07);
    for (let s = 1; ok && s < 6; s++) ok = dry(coon.pos.x + (x - coon.pos.x) * s / 6, coon.pos.z + (z - coon.pos.z) * s / 6, .05);
    if (!ok) continue;
    coon.path = new THREE.Vector2(x, z); coon.state = 'walk';
    play('walk', {rate: WALK_SPEED / CLIP_SPEED}); say('pottering along the bank'); return;
  }
  coon.state = 'idle'; coon.until = now + 2; play('idle');
}
function findSomething() {
  coon.state = 'pick'; coon.findHeld = false;
  const f = new THREE.Vector3(Math.sin(coon.yaw), 0, Math.cos(coon.yaw));
  findSpot.copy(coon.pos).addScaledVector(f, .210); findSpot.y = ground(findSpot.x, findSpot.z) + .003;
  cap.position.copy(findSpot); cap.rotation.set(0, coon.yaw, 0); cap.visible = true;
  play('pick_up', {once: true, fade: .35}); say('found a bottle cap');
}
function onClipEnd(a) {
  const name = a.getClip().name.replace(/^Labcoon_/, '');
  const now = performance.now() / 1000;
  if (name === 'sniff') { coon.state = 'idle'; coon.until = now + 1 + Math.random() * 2; play('idle'); }
  else if (name === 'pick_up') { coon.state = 'hold'; coon.loops = 0; play('hold_find', {fade: .12}); say('turning it over in his paws'); }
  else if (name === 'set_down') { coon.state = 'idle'; coon.until = now + 2 + Math.random() * 3; play('idle', {fade: .4}); say('leaving it for later'); }
}
const TMP = new THREE.Vector3();
function updateLabcoon(dt, now) {
  if (!coon.root) return;
  coon.mixer.update(dt);
  if (coon.state === 'walk') {
    const dx = coon.path.x - coon.pos.x, dz = coon.path.y - coon.pos.z, d = Math.hypot(dx, dz);
    const want = Math.atan2(dx, dz);
    let turn = ((want - coon.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    coon.yaw += THREE.MathUtils.clamp(turn, -2.2 * dt, 2.2 * dt);
    const step = Math.min(d, WALK_SPEED * dt * Math.max(0, Math.cos(turn)));
    coon.pos.x += Math.sin(coon.yaw) * step; coon.pos.z += Math.cos(coon.yaw) * step;
    if (d < .06) { coon.state = 'idle'; coon.until = now + .8 + Math.random() * 2.5; play('idle'); say('looking around'); }
  } else if (coon.state === 'idle' && now > coon.until) think(now);

  coon.pos.y = ground(coon.pos.x, coon.pos.z);
  coon.root.position.copy(coon.pos); coon.root.rotation.set(0, coon.yaw, 0);
  // the cap rides interaction_target from the grip (27/24 s) until the release (35/24 s)
  const t = coon.current?.time ?? 0;
  const held = coon.state === 'hold' || coon.state === 'pick' && t >= 27 / 24 || coon.state === 'drop' && t < 35 / 24;
  if (cap.visible && held && coon.bone) {
    coon.bone.getWorldPosition(TMP); cap.position.copy(TMP); cap.position.y = Math.max(TMP.y, ground(TMP.x, TMP.z) + .003);
  } else if (coon.state === 'drop' && !held && !coon.findHeld) {
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
document.getElementById('followBtn')?.addEventListener('click', () => toggleFollow());

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function tapAt(x, y) {
  ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, W.camera);
  if (coon.root) {      // Labcoon is small: forgive the tap by 25 cm
    const c = coon.pos.clone().setY(coon.pos.y + .16);
    if (ray.ray.distanceToPoint(c) < .25 && me.mode !== 'follow') { toggleFollow(); return; }
  }
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
  hud?.classList.toggle('following', me.mode === 'follow');
  const b = document.getElementById('followBtn'); if (b) b.textContent = me.mode === 'follow' ? 'Walk' : 'Follow Labcoon';
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
  updateLabcoon(dt, now);
  marker.material.opacity = Math.max(0, marker.material.opacity - dt * .9);
  if (perf && frames.length > 30) {
    const sorted = [...frames].sort((a, b) => a - b), med = sorted[sorted.length >> 1] * 1000;
    perf.textContent = med.toFixed(1) + ' ms · ' + Math.round(1000 / med) + ' fps';
  }
}

/* ---------------- boot ---------------- */
W = LabWorld.explore(update);
ground = W.ground; depth = W.depth;
W.scene.add(marker);
me.pos.y = ground(me.pos.x, me.pos.z);
liveSky(); setInterval(liveSky, 60000);
loadLabcoon().then(() => document.documentElement.classList.add('labcoon-ready'))
  .catch(err => { console.error(err); say('Labcoon could not load: ' + err.message); });
window.LabExplore = {me, coon, world: W, follow: toggleFollow, tapAt, get perf() { return perf?.textContent; }};
