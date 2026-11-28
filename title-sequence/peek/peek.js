/* Peek: the live field (world.js) seen from a fixed camera mark, with Labcoon at the place his brain says
   he is. For the homepage mockups' windows, keyholes and section backgrounds. See explore.html for params. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {buildPlaces, PLACES} from '/pond/labcoon-places.js?v=3';

const q = new URLSearchParams(location.search);
const LAT = 42.67, LON = -83.03;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const drift = q.get('drift') !== '0' && !reduce;
const wantCoon = q.get('coon') !== '0';
let shot = q.get('shot') || 'wide';
let scrollT = 0, scrollEase = 0;

const coon = {root: null, mixer: null, actions: {}, pos: new THREE.Vector3(7.15, 0, -1.72), yaw: -2.3, asleep: false, place: 'culvert'};
const hemi = new THREE.HemisphereLight(0xffffff, 0x555048, 1), sun = new THREE.DirectionalLight(0xffffff, 1.6);
const MOON = new THREE.Color(.55, .66, .95);

const W = LabWorld.explore(update);
const ground = W.ground;
const places = buildPlaces({THREE, ground, encode: displayEncode});
W.scene.add(places.group);
{ const [x, z] = PLACES.culvert.at, c = W.pond.center, a = new THREE.Vector2(c.x - x, c.y - z).normalize(); W.uniforms.uDrainAxis?.value.set(x, z, a.x, a.y); }

/* camera marks: [eye x, height above ground, z] looking at [x, height above ground, z] */
const P = (x, h, z) => new THREE.Vector3(x, Math.max(ground(x, z), -.02) + h, z);
const MARKS = {
  wide:    () => [P(17, 7.5, 13), P(1, 0, -10)],
  bank:    () => [P(-7.5, 1.35, -17.5), P(7.6, .35, -3.4)],
  culvert: () => [P(5.2, .42, .9), P(8.4, .28, -2.7)],
  water:   () => [P(-5, .32, -6.5), P(8, .25, -12)],
  top:     () => [P(.2, 38, -11.3), P(0, 0, -11.5)],
  oak:     () => [P(-2.5, .9, -6), P(4.6, 3.2, -15.5)],
  // from the land side of him, looking past him over the water
  coon:    () => { const c = W.pond.center, away = new THREE.Vector2(coon.pos.x - c.x, coon.pos.z - c.y).normalize().rotateAround(new THREE.Vector2(), .55), d = 2.1;
    const x = coon.pos.x + away.x * d, z = coon.pos.z + away.y * d; return [new THREE.Vector3(x, Math.max(ground(x, z), 0) + .72, z), coon.pos.clone().setY(coon.pos.y + .12)]; },
};
// ?scroll=1: one continuous move the parent page scrubs. High over the field, down the bank, skim the water, land by him.
const PATH = ['top', 'wide', 'bank', 'water', 'coon'];

const cam = W.camera, eye = new THREE.Vector3(), look = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
function markAt(name) { const [e, l] = MARKS[name](); return {e, l}; }
function placeCamera(t) {
  if (q.get('scroll') === '1') {
    const f = Math.min(PATH.length - 1.0001, Math.max(0, scrollEase * (PATH.length - 1))), i = Math.floor(f), k = f - i;
    const a = markAt(PATH[i]), b = markAt(PATH[i + 1]), s = k * k * (3 - 2 * k);
    eye.lerpVectors(a.e, b.e, s); look.lerpVectors(a.l, b.l, s);
  } else {
    const m = markAt(shot); eye.copy(m.e); look.copy(m.l);
  }
  if (drift) {      // a slow handheld drift: a few centimetres of sway and a small orbit
    const d = eye.distanceTo(look), side = tmpA.subVectors(look, eye).cross(cam.up).normalize();
    eye.addScaledVector(side, Math.sin(t * .11) * d * .045);
    eye.y += Math.sin(t * .17) * Math.min(.06, d * .01);
  }
  cam.position.copy(eye); cam.lookAt(look);
}

let last = performance.now() / 1000;
function update(dt) {
  const t = performance.now() / 1000;
  scrollEase += (scrollT - scrollEase) * Math.min(1, (dt || .016) * 5);
  placeCamera(t);
  if (coon.mixer) { coon.mixer.update(reduce ? 0 : Math.min(.05, dt || .016)); lightFromSky(); }
  last = t;
}

addEventListener('message', e => {
  const d = e.data || {};
  if (d.peek === 't') scrollT = Math.max(0, Math.min(1, +d.t || 0));
  if (d.peek === 'shot' && MARKS[d.shot]) shot = d.shot;
});

/* sky: the real sun over Shelby Twp (or ?at=HH:MM), a light breeze */
function liveSky() {
  let t = new Date();
  const at = q.get('at')?.match(/^(\d{1,2}):(\d{2})$/);
  if (at) { t = new Date(t); t.setHours(+at[1], +at[2], 0, 0); }
  const p = LaBSun.position(t, LAT, LON);
  LabWorld.setSun(p.elevation);
  LabWorld.setWind(+(q.get('wind') || 7), +(q.get('wind') || 7) + 4, 260, p.azimuth);
  LabWorld.setCloud(.35);
}
liveSky(); setInterval(liveSky, 60000);

/* Labcoon, at his live place doing the clip that fits it */
function displayEncode(mat) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev?.call(mat, shader, r);
    shader.fragmentShader = shader.fragmentShader.replace('#include <colorspace_fragment>',
      'gl_FragColor.rgb = gl_FragColor.rgb * (2.51 * gl_FragColor.rgb + .03) / (gl_FragColor.rgb * (2.43 * gl_FragColor.rgb + .59) + .14);\n' +
      'gl_FragColor.rgb = pow(clamp(gl_FragColor.rgb, 0., 1.), vec3(1. / 2.2));');
  };
  mat.toneMapped = false; mat.customProgramCacheKey = () => 'lab-display-' + (mat.name || ''); mat.needsUpdate = true;
}
function lightFromSky() {
  const U = W.uniforms, day = U.uDay.value, gold = U.uGold.value, night = U.uNight.value;
  sun.position.copy(U.uSunDir.value).multiplyScalar(10).add(coon.pos); sun.target.position.copy(coon.pos);
  sun.color.copy(U.uSunC.value); sun.intensity = U.uSunDir.value.y > 0 ? 1.2 + 1.2 * day : 0;
  hemi.color.copy(U.uZen.value).lerp(new THREE.Color(1, 1, 1), .35); hemi.groundColor.setRGB(.32, .28, .22);
  hemi.intensity = .25 + 1.1 * day + .45 * gold - .1 * night;
  if (night > .05) {
    hemi.color.lerp(MOON, night * .8); hemi.intensity += .3 * night;
    if (U.uSunDir.value.y <= 0) { sun.color.copy(MOON); sun.intensity = 1.1 * night; sun.position.set(coon.pos.x - Math.sin(coon.yaw) * 4, coon.pos.y + 6, coon.pos.z - Math.cos(coon.yaw) * 4); }
  }
}
const CLIP = {washing_rock: 'wash', cattails: 'fish', art_shed: 'draw', mailbox: 'beg', trash_can: 'pry', pond_middle: 'swim', oak: 'look_back', bird_feeder: 'look_back'};
async function addLabcoon(now) {
  const loader = new GLTFLoader();
  loader.setKTX2Loader(new KTX2Loader().setTranscoderPath('/pond/vendor/three/addons/libs/basis/').detectSupport(W.renderer)).setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync('/pond/labcoon/labcoon_v07.glb?v=rest2');
  const root = gltf.scene, pm = new THREE.PMREMGenerator(W.renderer), env = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose();
  root.traverse(o => {
    if (!o.isMesh) return; o.frustumCulled = false; const mat = o.material;
    if (mat?.transparent && /fur|fibres|hair|strand/i.test(mat.name)) { mat.alphaTest = .025; mat.opacity = .52; mat.depthWrite = false; mat.color.multiplyScalar(.74); }
    if (mat?.name.startsWith('Corneal')) { mat.roughness = .05; mat.opacity = .07; mat.color.setRGB(0, 0, 0); }
    if (/^(Corneal|Iris|Rhinarium)/.test(mat?.name || '')) { mat.envMap = env; mat.envMapIntensity = .45; }
    if (o.name.startsWith('Tooth')) o.visible = false;
    if (mat) displayEncode(mat);
  });
  const p = PLACES[now.place] || PLACES.culvert, spot = now.asleep ? PLACES.culvert.stand : (p.stand || p.at);
  coon.pos.set(spot[0], Math.max(ground(spot[0], spot[1]), p.water ? -.055 : -1), spot[1]);
  const face = (now.asleep ? PLACES.culvert.at : p.at) || [W.pond.center.x, W.pond.center.y];
  coon.yaw = Math.atan2(face[0] - spot[0], face[1] - spot[1]);
  if (now.asleep) { coon.yaw += Math.PI; coon.pos.lerp(new THREE.Vector3(PLACES.culvert.at[0], coon.pos.y, PLACES.culvert.at[1]), .55); coon.pos.y = ground(coon.pos.x, coon.pos.z); }
  root.position.copy(coon.pos); root.rotation.y = coon.yaw;
  coon.root = root; coon.mixer = new THREE.AnimationMixer(root);
  for (const clip of gltf.animations) coon.actions[clip.name.replace(/^Labcoon_/, '')] = coon.mixer.clipAction(clip);
  const name = now.asleep ? 'sleep_curl' : CLIP[now.place] || 'sniff';
  (coon.actions[name] || coon.actions.idle).play();
  W.scene.add(root, hemi, sun, sun.target);
}

const ready = () => { document.documentElement.classList.add('ready'); parent.postMessage({peek: 'ready'}, '*'); };
if (wantCoon && window.LabcoonLive) {
  LabcoonLive.get().then(now => { if (q.get('place')) now.place = q.get('place'); coon.asleep = now.asleep; coon.place = now.place; parent.postMessage({peek: 'state', now}, '*'); return addLabcoon(now); })
    .then(() => setTimeout(ready, 250)).catch(err => { console.warn('peek: no Labcoon', err); ready(); });
} else setTimeout(ready, 400);
window.Peek = {coon, marks: MARKS, setShot: s => (shot = s), set t(v) { scrollT = v; }, world: W};
