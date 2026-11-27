/* Scraps on the wind: paper bits and dry leaves that skip and tumble across the field near you when it gusts.
   They follow the live wind (uWind mph, uWindDir, uGustE), so a still night has none and a gusty one has plenty.
   fieldLitter(T, scene, {uniforms, ground, encode, reduced}).update(dt, camera) */
const KINDS = [
  {w: .09, h: .06, color: 0xf1ead8},          // a scrap of paper
  {w: .07, h: .05, color: 0xe9e1cc},
  {w: .055, h: .035, color: 0xb06a2c},        // dry oak leaves
  {w: .05, h: .034, color: 0x8a5a2b},
  {w: .045, h: .03, color: 0xc48a3a},
];
export function fieldLitter(T, scene, {uniforms: U, ground, encode: encodeIn, reduced = false, max = 14}) {
  const encode = m => (encodeIn?.(m), m);                  // the page's encoder edits in place and returns nothing
  const group = new T.Group(); group.name = 'Scraps on the wind'; scene.add(group);
  const geo = new T.PlaneGeometry(1, 1);
  const bits = [];
  let spawnIn = 0;
  function spawn(camera) {
    const k = Math.floor(Math.random() * KINDS.length), K = KINDS[k];
    const m = new T.Mesh(geo, encode(new T.MeshStandardMaterial({color: K.color, roughness: .9, side: T.DoubleSide, transparent: true}))); m.scale.set(K.w * 2, K.h * 2, 1);
    // start upwind of you, off to one side, so it crosses your view
    const wd = U.uWindDir.value, side = new T.Vector3(-wd.z, 0, wd.x), c = camera.position;
    const p = new T.Vector3().copy(c).addScaledVector(wd, -(2.5 + Math.random() * 3.5)).addScaledVector(side, (Math.random() - .5) * 6);
    p.y = ground(p.x, p.z) + .02;
    m.position.copy(p); m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    m.userData = {v: new T.Vector3(), spin: new T.Vector3((Math.random() - .5) * 9, (Math.random() - .5) * 7, (Math.random() - .5) * 9), age: 0, life: 6 + Math.random() * 5, lift: 0};
    group.add(m); bits.push(m);
  }
  function update(dt, camera) {
    if (reduced) return;
    const wind = U.uWind.value, gust = U.uGustE.value, wd = U.uWindDir.value;
    const strength = Math.max(0, (wind - 7) / 18);                 // nothing under ~7 mph
    spawnIn -= dt * strength * (1 + gust * 4);
    if (spawnIn <= 0 && bits.length < max && strength > 0) { spawn(camera); spawnIn = .6 + Math.random() * 1.4; }
    for (let i = bits.length - 1; i >= 0; i--) {
      const m = bits[i], d = m.userData; d.age += dt;
      const g = ground(m.position.x, m.position.z), air = m.position.y - g;
      const push = (.6 + wind * .09) * (.5 + gust);                // m/s along the wind
      d.v.x += (wd.x * push - d.v.x) * Math.min(1, dt * 1.8);
      d.v.z += (wd.z * push - d.v.z) * Math.min(1, dt * 1.8);
      if (air < .03 && Math.random() < dt * (1 + gust * 6)) d.v.y = .4 + Math.random() * .9 * (.4 + gust);   // a gust picks it up
      d.v.y -= dt * 1.6; if (air <= .004 && d.v.y < 0) { d.v.y = 0; d.v.x *= .9; d.v.z *= .9; }
      m.position.addScaledVector(d.v, dt); m.position.y = Math.max(m.position.y, g + .004);
      const tumble = air > .01 ? 1 : .15;
      m.rotation.x += d.spin.x * dt * tumble; m.rotation.y += d.spin.y * dt * tumble; m.rotation.z += d.spin.z * dt * tumble;
      const fade = Math.min(1, d.age / .6, (d.life - d.age) / 1.2);
      m.material.opacity = Math.max(0, fade);
      if (d.age > d.life || m.position.distanceTo(camera.position) > 22) { group.remove(m); m.material.dispose(); bits.splice(i, 1); }
    }
  }
  return {update, count: () => bits.length};
}
