/* The finds lying around the field: everything his brain has scattered tonight (keys, sea glass, bottle caps,
   twine, seeds…), each a little model at its place, so a visitor can spot things before he does. Shiny ones glint.
   makeFind(THREE, kind, color, encode) builds one model (also used for what he carries).
   fieldFinds(...).set(list) lays out [{kind, where, color, shine}]; .pick(ray) returns the find a tap hits. */
const COLOR = {copper: 0xb5652b, brown: 0x6b4a2e, purple: 0x6b3fa0, silver: 0xc9ccd1, black: 0x1c1c1c, blue: 0x2f6fc4, red: 0xb3261e,
  green: 0x3f8a4a, white: 0xeeeae2, gold: 0xd4a63a, brass: 0xc9a043, yellow: 0xe2c04a, orange: 0xe07a2c, pink: 0xe48aa6, clear: 0xcfe6e0, grey: 0x8c8f8c, gray: 0x8c8f8c, tan: 0xc8a477};
const METAL = /cap|key|penny|dime|spoon|bolt|bell|hoop|watch|tab|spike|nail|wire|lure|pick/;
const GLASS = /glass|marble|bead|reflector|ornament|bottle neck/;
function shapeOf(kind) {
  if (/bottle cap/.test(kind)) return 'cap';
  if (/penny|dime/.test(kind)) return 'coin';
  if (/key/.test(kind)) return 'key';
  if (/sea glass|ornament|reflector/.test(kind)) return 'shard';
  if (/marble|bead|acorn/.test(kind)) return 'ball';
  if (/bell/.test(kind)) return 'bell';
  if (/wheel|hoop|rubber band|twine|wire/.test(kind)) return 'ring';
  if (/bolt|spike|nail|twig|popsicle|clothespin|cork|spoon|lure|bottle neck/.test(kind)) return 'rod';
  if (/wrapper|cardboard|bark|tab|watch|pick|feather|helicopter/.test(kind)) return 'flat';
  if (/pinecone|corn/.test(kind)) return 'cone';
  if (/seed|kernel|fries|grubs/.test(kind)) return 'bits';
  return 'lump';                                         // apple core, crust, sandwich…
}
export function makeFind(T, kind, color, encode = m => m) {
  const shape = shapeOf(kind), c = COLOR[color] ?? (/key|brass|bell/.test(kind) ? COLOR.brass : /penny/.test(kind) ? COLOR.copper : /dime|spoon|tab|bolt|nail|spike|wire/.test(kind) ? COLOR.silver
    : /feather|blue/.test(kind) ? COLOR.blue : /red/.test(kind) ? COLOR.red : /glass/.test(kind) ? COLOR.green : /acorn|twig|bark|pinecone|cork|twine/.test(kind) ? COLOR.brown : COLOR.tan);
  const metal = METAL.test(kind), glass = GLASS.test(kind);
  const mat = encode(new T.MeshStandardMaterial({color: c, metalness: metal ? .8 : 0, roughness: metal ? .35 : glass ? .15 : .85,
    transparent: glass, opacity: glass ? .78 : 1, emissive: glass ? c : 0x000000, emissiveIntensity: glass ? .12 : 0}));
  const g = new T.Group(), add = (geo, x = 0, y = 0, z = 0, rx = 0, rz = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); return m; };
  switch (shape) {
    case 'cap': add(new T.CylinderGeometry(.0105, .0115, .006, 21), 0, .003); break;
    case 'coin': add(new T.CylinderGeometry(.0095, .0095, .0016, 20), 0, .0008); break;
    case 'key': add(new T.TorusGeometry(.009, .003, 6, 16), -.014, .003, 0, Math.PI / 2); add(new T.BoxGeometry(.03, .003, .005), .008, .0015); add(new T.BoxGeometry(.006, .003, .007), .02, .0015, .004); break;
    case 'shard': add(new T.DodecahedronGeometry(.011, 0), 0, .004).scale.set(1.2, .45, .9); break;
    case 'ball': add(new T.SphereGeometry(/acorn/.test(kind) ? .01 : .008, 14, 10), 0, .008); if (/acorn/.test(kind)) add(new T.SphereGeometry(.0105, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0, .012); break;
    case 'bell': add(new T.ConeGeometry(.011, .016, 16, 1, true), 0, .008); add(new T.SphereGeometry(.003, 8, 6), 0, .001); break;
    case 'ring': add(new T.TorusGeometry(/wheel/.test(kind) ? .014 : .012, /wheel/.test(kind) ? .005 : .0016, 8, 24), 0, .003, 0, Math.PI / 2); break;
    case 'rod': add(new T.CylinderGeometry(.003, .003, /spike|twig/.test(kind) ? .09 : /cork/.test(kind) ? .025 : .055, 8), 0, .003, 0, 0, Math.PI / 2); if (/cork/.test(kind)) g.scale.setScalar(2.2); break;
    case 'flat': add(new T.BoxGeometry(/feather/.test(kind) ? .07 : .035, .0012, /feather/.test(kind) ? .016 : .022), 0, .001); break;
    case 'cone': add(new T.ConeGeometry(/corn/.test(kind) ? .018 : .02, /corn/.test(kind) ? .11 : .05, 10), 0, .012, 0, 0, Math.PI / 2); break;
    case 'bits': for (let i = 0; i < 5; i++) add(new T.SphereGeometry(.004, 6, 5), Math.cos(i * 2.4) * .01, .003, Math.sin(i * 2.4) * .01).scale.set(1.5, .7, 1); break;
    default: add(new T.SphereGeometry(.022, 10, 8), 0, .012).scale.set(1.2, .7, 1);
  }
  g.userData = {kind, shiny: metal || glass};
  return g;
}

const hash = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
export function fieldFinds(T, scene, {ground, dry, places, encode, reduced = false}) {
  const group = new T.Group(); group.name = 'Finds in the field'; scene.add(group);
  const glintTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const r = x.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,250,230,1)'); r.addColorStop(.25, 'rgba(255,240,200,.5)'); r.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = r; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  let key = '', items = [], t = 0;
  function set(list) {
    const next = JSON.stringify(list || []); if (next === key) return; key = next;
    for (const o of [...group.children]) group.remove(o);
    items = [];
    const count = {};
    for (const f of list || []) {
      const p = places[f.where]; if (!p) continue;
      const n = count[f.where] = (count[f.where] || 0) + 1, base = p.stand || p.at;
      let spot = null;
      for (let tries = 0; tries < 10 && !spot; tries++) {            // a dry spot near the place, the same every time
        const a = hash(f.where + f.kind + n + tries) * Math.PI * 2, r = .5 + hash(f.kind + n + tries) * 1.1;
        const x = base[0] + Math.cos(a) * r, z = base[1] + Math.sin(a) * r;
        if (dry(x, z, .05)) spot = [x, z];
      }
      if (!spot) continue;
      const m = makeFind(T, f.kind, f.color, encode); m.scale.multiplyScalar(1.8);   // a touch bigger than life, so you can spot it
      m.position.set(spot[0], ground(spot[0], spot[1]) + .002, spot[1]); m.rotation.y = hash(f.kind + n) * Math.PI * 2;
      m.userData.label = f.kind; group.add(m);
      if (f.shine > .45 || m.userData.shiny) {
        const s = new T.Sprite(new T.SpriteMaterial({map: glintTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0}));
        s.position.set(spot[0], m.position.y + .05, spot[1]); s.scale.setScalar(.16); s.userData.phase = hash(f.kind + n) * 6.28; group.add(s);
        m.userData.glint = s;
      }
      items.push(m);
    }
  }
  function tick(dt, night = 0) {
    t += dt;
    for (const m of items) { const s = m.userData.glint; if (!s) continue;
      const tw = reduced ? .5 : Math.max(0, Math.sin(t * 1.7 + s.userData.phase)) ** 6;
      s.material.opacity = (.25 + .75 * night) * tw; s.scale.setScalar(.1 + .1 * tw); }
  }
  function pick(ray) {
    let best = null;
    for (const m of items) { const d = ray.ray.distanceToPoint(m.position); if (d < .16 && (!best || d < best.d)) best = {d, m}; }
    return best ? best.m.userData.label : null;
  }
  return {set, tick, pick, count: () => items.length};
}
