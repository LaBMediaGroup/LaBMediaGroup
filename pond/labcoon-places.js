import {bankFinish, culvertApron} from './culvert-apron.js';
import { shedComputer } from './shed-computer.js';
/* Labcoon's places in the field (Explore prototype, Nov 26 2026).

   The brain names these places (labmedia-raccoon/brain/lib/world.js PLACES). Here they get real
   spots on the pond world's terrain, sampled from the actual shoreline:
   - culvert: his home. An 18 in (0.457 m) corrugated steel field drain (2-2/3 x 1/2 in corrugation,
     68 mm pitch) coming out of the north-east bank above the waterline, with riprap round the mouth.
   - washing_rock: a flat granite fieldstone, half in the shallows on the east shore.
   - art_shed: a raccoon-sized scrap lean-to on the north bank: pallet back, two posts,
     corrugated roof, a crate desk, drawings pinned up.
   - lane: a farm two-track on the west side, past the shed (gravel ruts ~0.4 m wide, ~1.6 m apart).
   - trash_can: a 20 gal galvanized can by the lane (about 0.60 m tall, 0.50 m across, ribbed,
     lid with a bail handle).
   - mailbox: a rural T1-size mailbox (about 0.48 m long, 0.165 m wide, 0.22 m high) on a 4x4 post,
     floor about 1.1 m up (USPS 41-45 in), facing the lane, a bit dented.
   Everything samples its own ground height. Each place has a walk spot for Labcoon and a
   collision circle for the walker. */
// The places themselves come from the shared map, pond/labcoon/places.json, a synced copy of
// labmedia-raccoon/brain/lib/places.json (tests/places-sync.cjs keeps them identical).
export const MAP = await (await fetch(new URL('./labcoon/places.json', import.meta.url))).json();
export const PLACES = MAP.places;

export function buildPlaces({THREE, ground, encode}) {
  const group = new THREE.Group(), colliders = [];
  const std = (color, rough = .8, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); encode(m); return m; };
  const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const at = (x, z, lift = 0) => new THREE.Vector3(x, ground(x, z) + lift, z);
  const add = (mesh, pos, yaw = 0) => { mesh.position.copy(pos); mesh.rotation.y = yaw; group.add(mesh); return mesh; };
  const lump = (r, sx, sy, sz, rough = .9, color = 0x6f6a62) => {     // a field stone
    const seedA = rnd() * 6.28;
    const g = new THREE.IcosahedronGeometry(r, 4), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i), n = 1 + .07 * (Math.sin(v.x / r * 5.1 + seedA) + Math.sin(v.z / r * 4.3 + v.y / r * 3.7 + seedA * 2));   // position-based so shared corners stay closed
      v.multiplyScalar(n * .5 + .5 + Math.sin(v.x * 9 + v.z * 7) * .03); v.set(v.x * sx, Math.max(v.y * sy, -r * sy * .45), v.z * sz); p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); return new THREE.Mesh(g, std(color, rough));
  };

  /* culvert */
  {
    const [x, z] = PLACES.culvert.at, yaw = Math.atan2(-(0 - x), -(-11.5 - z)) + Math.PI;   // mouth faces the pond
    const R = .2285, L = 1.1, pitch = .068, seg = Math.round(L / pitch * 6);
    const g = new THREE.CylinderGeometry(R, R, L, 28, seg, true); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), k = 1 + (.0127 / R) * .5 * Math.sin((y + L / 2) / pitch * Math.PI * 2);
      p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k);
    }
    g.computeVertexNormals(); g.rotateX(Math.PI / 2); g.translate(0, 0, -L / 2 + .35);   // 0.35 m sticks out of the bank
    const steel = std(0x8d8f8a, .55, .75, {side: THREE.DoubleSide});
    const pipe = new THREE.Mesh(g, steel);
    const mouth = at(x, z); mouth.y = Math.max(mouth.y, .05) + R - .03;
    add(pipe, mouth, yaw); pipe.rotation.x = -.06;
    const dark = new THREE.Mesh(new THREE.CircleGeometry(R * .97, 24), std(0x050505, 1));
    dark.position.set(0, 0, -.035); pipe.add(dark);                                         // the inside goes black
    const rust = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.004, R * 1.004, .3, 28, 1, true, Math.PI * .65, Math.PI * .7), std(0x5a3a22, .9, .2, {side: THREE.DoubleSide}));
    rust.rotation.x = Math.PI / 2; rust.position.z = .2; pipe.add(rust);                    // waterline staining on the lower lip
    group.add(culvertApron(THREE, ground, mouth, yaw, encode));
    // the pipe runs under a low earth berm (field drains come out of the bank, not lie on it)
    const bermG = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), bp = bermG.attributes.position;
    const back = new THREE.Vector3(0, 0, -.80).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const toe = at(mouth.x + back.x, mouth.z + back.z);
    for (let i=0; i<bp.count; i++) {
      const x=bp.getX(i), y=bp.getY(i), z=bp.getZ(i);
      const ripple=.032*Math.sin(x*8+z*3)*Math.cos(z*7);
      const v=new THREE.Vector3(x*(.95+ripple),0,z*((z>0?.64:.85)+ripple));
      const world=v.clone().applyAxisAngle(new THREE.Vector3(0,1,0),yaw).add(toe);
      bp.setXYZ(i,v.x,ground(world.x,world.z)-toe.y-.025+y*(.52+ripple),v.z);
    }
    bermG.computeVertexNormals();
    const berm = new THREE.Mesh(bermG, bankFinish(THREE,0x645340,encode,true));
    berm.name='Culvert earth bank';
    add(berm,toe,yaw);
    colliders.push([x, z, .45], [mouth.x + back.x, mouth.z + back.z, .8]);
  }
  /* washing rock */
  {
    const [x, z] = PLACES.washing_rock.at;
    const rock = lump(.36, 1.05, .42, .78, .75, 0x7a766c);
    add(rock, new THREE.Vector3(x, Math.max(ground(x, z), -.08) + .03, z), 1.1);
    colliders.push([x, z, .42]);
  }
  /* farm lane: two gravel ruts down the west side, through the corn */
  {
    const mat = std(0x4b443b, 1);
    for (const lx of [-18.2, -16.6]) {
      const n = 120, g = new THREE.PlaneGeometry(.42, 82, 1, n).rotateX(-Math.PI / 2), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const X = lx + p.getX(i) + Math.sin(p.getZ(i) * .09) * .35, Z = p.getZ(i) - 11.5;
        p.setXYZ(i, X, ground(X, Z) + .006, Z);
      }
      g.computeVertexNormals(); group.add(new THREE.Mesh(g, mat));
    }
  }
  /* trash can */
  {
    const [x, z] = PLACES.trash_can.at, pts = [];
    const H = .6, R0 = .23, R1 = .25;
    for (let i = 0; i <= 40; i++) { const t = i / 40, y = t * H; let r = R0 + (R1 - R0) * t; if (i % 8 === 4) r += .008; pts.push(new THREE.Vector2(r, y)); }
    pts.push(new THREE.Vector2(.262, H), new THREE.Vector2(.262, H + .012));
    const galv = std(0xa4a7a3, .45, .8, {side: THREE.DoubleSide});
    const can = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), galv);
    const base = at(x, z); add(can, base, .4); can.rotation.z = .02;
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(.24, .268, .05, 32), galv); lid.position.y = H + .03; can.add(lid);
    const bail = new THREE.Mesh(new THREE.TorusGeometry(.06, .006, 6, 16, Math.PI), galv); bail.position.y = H + .056; can.add(bail);
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(.045, .006, 6, 12, Math.PI), galv); h.position.set(s * .245, H * .82, 0); h.rotation.set(0, Math.PI / 2, Math.PI / 2 * s); can.add(h); }
    colliders.push([x, z, .36]);
  }
  /* mailbox on its post, facing the lane, a little dented */
  {
    const [x, z] = PLACES.mailbox.at, yaw = -Math.PI / 2;
    const post = new THREE.Mesh(new THREE.BoxGeometry(.089, 1.25, .089), std(0x6a5a48, .95));
    const foot = at(x, z); add(post, foot.clone().add(new THREE.Vector3(0, .5, 0)), yaw);
    const shape = new THREE.Shape(); const w = .165, hb = .12;
    shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(w / 2, hb); shape.absarc(0, hb, w / 2, 0, Math.PI, false); shape.lineTo(-w / 2, 0);
    const g = new THREE.ExtrudeGeometry(shape, {depth: .48, bevelEnabled: false, curveSegments: 12}); g.translate(0, 0, -.24);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const dz = p.getZ(i) - .05, dy = p.getY(i) - .17; if (p.getX(i) > .07) p.setX(i, p.getX(i) - .014 * Math.exp(-(dz * dz + dy * dy) / .004)); }
    g.computeVertexNormals();
    const box = new THREE.Mesh(g, std(0x8a8c88, .5, .7)); box.position.set(0, .64, .12); post.add(box);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(.006, .16, .05), std(0xb3241c, .6)); flag.position.set(.09, .76, .02); flag.rotation.x = -.2; post.add(flag);
    colliders.push([x, z, .25]);
  }
  /* the art shed: a raccoon-sized lean-to from scrap */
  {
    const [x, z] = PLACES.art_shed.at, yaw = Math.PI;      // open side faces the pond
    const shed = new THREE.Group(); add(shed, at(x, z), yaw);
    const wood = std(0x9b8361, .92), grey = std(0x6d6658, .95);
    for (let i = 0; i < 7; i++) {                          // pallet back: slats on stringers
      const s = new THREE.Mesh(new THREE.BoxGeometry(1.2, .085, .02), i % 2 ? wood : grey); s.position.set(0, .06 + i * .13, -.4); s.rotation.z = (rnd() - .5) * .02; shed.add(s);
    }
    for (const sx of [-.55, 0, .55]) { const st = new THREE.Mesh(new THREE.BoxGeometry(.09, .95, .04), grey); st.position.set(sx, .47, -.43); shed.add(st); }
    for (const sx of [-.58, .58]) { const post = new THREE.Mesh(new THREE.BoxGeometry(.05, .62, .05), wood); post.position.set(sx, .31, .38); shed.add(post); }
    const roofG = new THREE.PlaneGeometry(1.36, .98, 48, 1), rp = roofG.attributes.position;
    for (let i = 0; i < rp.count; i++) rp.setZ(i, .012 * Math.sin(rp.getX(i) / .076 * Math.PI * 2));
    roofG.computeVertexNormals();
    const roof = new THREE.Mesh(roofG, std(0x7e8279, .5, .65, {side: THREE.DoubleSide}));
    roof.position.set(0, .8, -.02); roof.rotation.x = -Math.PI / 2 + .36; shed.add(roof);
    const crate = new THREE.Mesh(new THREE.BoxGeometry(.4, .26, .3), wood); crate.position.set(.2, .13, -.12); shed.add(crate);
    const computer = shedComputer(THREE,std); computer.position.set(.2,.26,-.12); shed.add(computer);
    // drawings pinned to the pallet: pencil scribbles on paper, a different one each sheet
    for (let i = 0; i < 3; i++) {
      const c = document.createElement('canvas'); c.width = 96; c.height = 128; const k = c.getContext('2d');
      k.fillStyle = '#f2ede1'; k.fillRect(0, 0, 96, 128); k.strokeStyle = i === 1 ? '#3b5a7a' : '#4a4038'; k.lineWidth = 2;
      k.beginPath(); let px = 20 + rnd() * 50, py = 30 + rnd() * 60; k.moveTo(px, py);
      for (let s = 0; s < 14; s++) { px = Math.min(86, Math.max(10, px + (rnd() - .5) * 34)); py = Math.min(118, Math.max(10, py + (rnd() - .5) * 34)); k.quadraticCurveTo(px + 9, py - 7, px, py); }
      k.stroke();
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(.15, .2), std(0xffffff, .95, 0, {map: tex}));
      sheet.position.set(-.38 + i * .3, .5 + (i % 2) * .12, -.385); sheet.rotation.z = (rnd() - .5) * .15; shed.add(sheet);
    }
    colliders.push([x, z - .05, .78]);
  }
  /* picnic table and bird feeder: places the brain discovers later */
  {
    const [x, z] = PLACES.picnic_table.at, wood = std(0x8c7356, .9), t = new THREE.Group(); add(t, at(x, z), .3);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.83, .05, .74), wood); top.position.y = .76; t.add(top);
    for (const s of [-1, 1]) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.83, .04, .25), wood); seat.position.set(0, .45, s * .55); t.add(seat);
      for (const e of [-.7, .7]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.05, .85, .1), wood); leg.position.set(e, .38, s * .3); leg.rotation.x = -s * .52; t.add(leg); }
    }
    colliders.push([x, z, 1.05]);
    const [bx, bz] = PLACES.bird_feeder.at, pole = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1.7, 8), std(0x2f302c, .5, .6));
    add(pole, at(bx, bz, .85));
    const hopper = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, .22, 6), std(0x6b5a44, .8)); hopper.position.y = .92; pole.add(hopper);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(.13, .08, 6), std(0x3e4a3c, .6)); cap.position.y = 1.07; pole.add(cap);
    colliders.push([bx, bz, .15]);
  }
  return {group, colliders};
}
