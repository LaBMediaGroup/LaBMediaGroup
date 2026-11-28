/* Labcoon on the page: the real Explore model (pond/labcoon/labcoon_v07.glb, 38 clips) drawn into a small
   transparent canvas, so he can walk along the page edge, peek out of a section or sleep in a corner.
   Needs the site's importmap for 'three'. The GLB (5 MB) loads once per page and is cloned per sticker.

   const c = await coonSticker(canvas, {clip: 'walk', yaw: Math.PI / 2, height: .5, fit: 1});
   c.play('sleep_curl', {fade: .4, once: false, rate: 1}); c.yaw(rad); c.pause(); c.resume();
   Clips: walk trot idle sniff look_back wash fish beg pry draw sleep sleep_curl settle_curl wake wake_stretch
          sleepy_yawn nap_ear_twitch shake moon hold_find pick_up set_down swim climb dive … */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const GLB = '/pond/labcoon/labcoon_v07.glb?v=rest2';
let source = null;           // Promise<gltf>, shared by every sticker on the page
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function load(renderer) {
  if (source) return source;
  const loader = new GLTFLoader();
  const ktx = new KTX2Loader().setTranscoderPath('/pond/vendor/three/addons/libs/basis/').detectSupport(renderer);
  loader.setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder);
  source = loader.loadAsync(GLB);
  return source;
}

export async function coonSticker(canvas, opts = {}) {
  const o = {clip: 'idle', yaw: Math.PI * .5, height: .42, fit: 1, pitch: .12, fov: 22, light: 'day', ...opts};
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, premultipliedAlpha: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov, 1, .01, 50);

  const gltf = await load(renderer);
  const root = SkeletonUtils.clone(gltf.scene);
  const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose();
  scene.environment = env; scene.environmentIntensity = .35;
  const teeth = [];
  root.traverse(m => {
    if (!m.isMesh) return;
    m.frustumCulled = false;
    const mat = m.material = m.material.clone();
    if (mat.transparent && /fur|fibres|hair|strand/i.test(mat.name)) { mat.alphaTest = .025; mat.opacity = .55; mat.depthWrite = false; mat.color.multiplyScalar(.7); }
    if (mat.name.startsWith('Iris')) { mat.color.multiplyScalar(1.6); mat.roughness = .18; }
    if (mat.name.startsWith('Corneal')) { mat.roughness = .05; mat.metalness = 0; mat.opacity = .07; mat.color.setRGB(0, 0, 0); }
    if (mat.name.startsWith('Lip')) mat.color.setRGB(.34, .32, .3);
    if (m.name.startsWith('Tooth')) teeth.push(m);
  });
  const pivot = new THREE.Group(); pivot.add(root); scene.add(pivot);

  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x4a4238, 1.5);
  const key = new THREE.DirectionalLight(0xffefd8, 2.4); key.position.set(1.5, 2.5, 2);
  const rim = new THREE.DirectionalLight(0xbcd2ff, 1.6); rim.position.set(-2, 1.6, -2.2);
  scene.add(hemi, key, rim);
  if (o.light === 'night') { hemi.color.set(0x8fa3d6); hemi.intensity = 1.1; key.color.set(0xb7c6ff); key.intensity = 1.4; rim.intensity = 2.4; }

  const mixer = new THREE.AnimationMixer(root), actions = {};
  for (const clip of gltf.animations) actions[clip.name.replace(/^Labcoon_/, '')] = mixer.clipAction(clip);
  let current = null, clipName = '';
  function play(name, {fade = .35, once = false, rate = 1} = {}) {
    const a = actions[name]; if (!a) return null;
    if (current === a) { a.setEffectiveTimeScale(rate); return a; }
    a.reset().setEffectiveTimeScale(rate).setEffectiveWeight(1);
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity); a.clampWhenFinished = once;
    if (current) a.crossFadeFrom(current, fade, false);
    a.play(); current = a; clipName = name;
    for (const t of teeth) t.visible = /yawn|^wake$|grumble/.test(name);
    return a;
  }

  // frame him from his rest pose: centre the body, then pull the camera back to fit
  const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
  root.position.set(-mid.x, -box.min.y, -mid.z);
  const span = Math.max(size.x, size.z, size.y) * o.fit;
  function frame() {
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const dist = span / (2 * Math.tan(THREE.MathUtils.degToRad(o.fov) / 2)) / Math.min(1, camera.aspect) * 1.05;
    camera.position.set(0, size.y * o.height + Math.sin(o.pitch) * dist, Math.cos(o.pitch) * dist);
    camera.lookAt(0, size.y * o.height, 0); camera.updateProjectionMatrix();
  }
  frame(); new ResizeObserver(frame).observe(canvas);
  pivot.rotation.y = o.yaw; play(o.clip);

  var api = {
    speed: 1, play, actions, mixer, get clip() { return clipName; },
    yaw(r) { pivot.rotation.y = r; },
    pause() { running = false; }, resume() { if (!running) { running = true; last = performance.now(); loop(); } },
    onFinished(fn) { mixer.addEventListener('finished', fn); },
    canvas
  };
  let running = true, visible = true, last = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { last = performance.now(); loop(); } }).observe(canvas);
  function loop() {
    if (!running || !visible || document.hidden) return;
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    mixer.update(reduce ? 0 : dt * api.speed); renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); loop(); } });
  mixer.update(.01); renderer.render(scene, camera); loop();

  canvas.dataset.coon = 'ready'; canvas.dispatchEvent(new Event('coon:ready'));
  return api;
}
