// Quercus macrocarpa. A short bole, staggered scaffold limbs and ridged
// grey-brown bark follow the photographed bur oaks in oak-reference.md.
// Geometry is in metres. Each union shares its centre of motion with its parent.
export function buildOak(THREE, {uniforms, terrain, x, z, reduced = false}) {
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const group = new THREE.Group();
  group.name = 'Bur oak on pond bank';
  const ray = new THREE.Raycaster(v(0, 30, 0), v(0, -1, 0));
  terrain.updateWorldMatrix(true, false);
  function ground(dx, dz) {
    ray.ray.origin.set(x + dx, 30, z + dz);
    return ray.intersectObject(terrain, false)[0].point.y;
  }
  const baseY = ground(0, 0);
  group.position.set(x, baseY, z);

  let seed = 3519;
  function random() { seed = seed * 16807 % 2147483647; return seed / 2147483647; }
  const positions = [], anchors = [], uvs = [], indices = [], diameters = [];
  const junctions = [], roots = [];
  const tau = 2 * Math.PI;
  // Parallel-transported rings. The intervening faces share vertices at every
  // bend. The first ring of a side limb sits inside a ring of the parent.
  function limb(points, radii, sides, parent, socket) {
    const first = positions.length / 3;
    let along = random() * 2;
    let right;
    const roll = random() * tau;
    for (let j = 0; j < points.length; j++) {
      const c = points[j], radius = radii[j];
      const tangent = points[Math.min(j + 1, points.length - 1)].clone()
        .sub(points[Math.max(0, j - 1)]).normalize();
      if (j) along += c.distanceTo(points[j-1]);
      if (!right) right = (Math.abs(tangent.z) < .85 ? v(0,0,1) : v(1,0,0)).cross(tangent).normalize();
      else right.addScaledVector(tangent, -right.dot(tangent)).normalize();
      const around = tangent.clone().cross(right);
      for (let k = 0; k <= sides; k++) {
        const angle = k * tau / sides;
        const uneven = 1 + .044 * Math.cos(3*angle + roll) + .029 * Math.sin(5*angle + roll + j*.19);
        const local = c.clone().addScaledVector(right, radius*uneven*Math.cos(angle))
          .addScaledVector(around, radius*uneven*Math.sin(angle));
        positions.push(local.x,local.y,local.z); anchors.push(c.x,c.y,c.z);
        // A metre along each limb is a UV unit. Circumferential density follows taper.
        uvs.push(k / sides * tau * radius, along);
        diameters.push(2 * radius);
        if (j && k < sides) {
          const b = first + j * (sides + 1) + k, a = b - sides - 1;
          indices.push(a, a+1, b, a+1, b+1, b);
        }
      }
    }
    const end = first + (points.length - 1) * (sides + 1);
    for (let k=1;k<sides-1;k++) indices.push(end, end+k, end+k+1);
    if (parent) junctions.push([parent.first + socket*(parent.sides + 1), first]);
    return {points, radii, first, sides};
  }

  const trunk = limb([
    v(0,-.23,0),v(-.02,.10,.01),v(.015,.49,.01),v(.075,1.36,.01),
    v(.10,1.90,-.015),v(.02,2.42,-.07),v(-.12,2.96,-.08),v(-.17,3.58,.025),
    v(-.02,4.17,.13),v(.15,4.78,.16),v(.11,5.38,.18),v(.28,6.0,.21),
    v(.44,6.54,.10),v(.37,7.12,.18),v(.51,7.69,.10),v(.40,8.16,.08)
  ],[.53,.49,.35,.30,.29,.277,.258,.233,.198,.159,.122,.090,.060,.038,.020,.004],24);

  // Low, asymmetric buttresses meet the irregular terrain under the tree.
  for (let i=0;i<6;i++) {
    const angle = i*tau/6 + (random()-.5)*.43;
    const reach = .74 + random()*.34;
    const dx = reach*Math.cos(angle), dz = reach*Math.sin(angle);
    const at = f => ground(dx*f, dz*f) - baseY;
    const endY = at(1) - .078;
    roots.push(limb([trunk.points[2],v(dx*.28,at(.28)+.23,dz*.28),
      v(dx*.53,at(.53)+.067,dz*.53),v(dx*.78,at(.78)+.004,dz*.78),
      v(dx,endY,dz)],[.203,.166,.115,.063,.024],10,trunk,2));
  }

  // A scaffold limb sweeps out first. Its smaller laterals progressively turn up.
  // These directions and irregular branch spacings are authored for the pond tree.
  function grow(parent, socket, direction, length, radius, depth, sweep) {
    const origin = parent.points[socket];
    const perpendicular = v(-direction.z,0,direction.x).normalize();
    const lateralStretch = 1.17;
    const bend = (random()-.5)*length*.38, kink = (random()-.5)*length*.17;
    const ts = [0,.20,.42,.65,.84,1];
    const points = ts.map(t => origin.clone().addScaledVector(direction, length*t)
      .addScaledVector(perpendicular, bend*Math.sin(t*Math.PI)+kink*Math.sin(t*tau))
      .addScaledVector(v(0,1,0), sweep*length*t*t));
    for (const p of points) {
      p.x = origin.x + (p.x-origin.x)*lateralStretch;
      p.z = origin.z + (p.z-origin.z)*lateralStretch;
    }
    const radii = [.98,.91,.75,.54,.32,.045].map(f => Math.max(.0013,radius*f));
    const sides = radius>.12 ? 13 : radius>.054 ? 9 : radius>.021 ? 7 : 4;
    const stem = limb(points,radii,sides,parent,socket);
    if (!depth) return;

    const handed = random()<.5 ? -1 : 1;
    for (const i of [1,2,3,4]) {
      if (depth===1 && (i===1 || i===3)) continue;
      if (i===1 && random()<.43) continue;
      const tangent = points[i+1].clone().sub(points[i-1]).normalize();
      const side = v(-tangent.z,0,tangent.x);
      if(side.lengthSq()<.001) side.set(1,0,0);
      side.normalize();
      const sign = handed * (i%2 ? 1 : -1);
      const az = .36 + random()*.48;
      const childDirection = tangent.multiplyScalar(.74 + random()*.2)
        .addScaledVector(side, sign*az);
      childDirection.y += (.12+random()*.44) * (i===2 && depth>2 ? -.36 : 1);
      if (childDirection.y>.98) childDirection.y*=.88;
      childDirection.normalize();
      const size = i===4 ? .38 : i===3 ? .50 : .57;
      const thickness = radius * (i===4 ? .25 : i===3 ? .42 : .51);
      grow(stem,i,childDirection,length*size*(.83+random()*.33),thickness,depth-1,.06+random()*.15);
    }
  }
  for (const [socket, azimuth, elevation, length, radius, sweep] of [
    [4, 3.40,.11,3.43,.188,.20], [5,.18,.18,3.54,.175,.27], [6,1.94,.20,3.32,.159,.23], [6,5.34,-.045,2.76,.103,.40],
    [7,4.76,.28,3.20,.156,.26], [8,2.84,.40,3.04,.143,.24], [9,5.72,.38,3.0,.119,.23], [9,1.35,.34,2.20,.080,.32],
    [10,.88,.52,2.67,.093,.22], [11,3.92,.56,2.35,.066,.22],
    [12,2.0,.67,1.80,.045,.18], [13,5.8,.70,1.19,.027,.19],
    [14,3.3,.65,.78,.013,.17]
  ]) {
    const horizontal = Math.sqrt(1-elevation*elevation);
    grow(trunk,socket,v(Math.cos(azimuth)*horizontal,elevation,Math.sin(azimuth)*horizontal),
      length,radius,radius>.06 ? 4 : radius>.02 ? 3 : 2,sweep);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('anchor', new THREE.Float32BufferAttribute(anchors,3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2));
  geo.setAttribute('barkWidth', new THREE.Float32BufferAttribute(diameters,1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  geo.boundingSphere.radius += .9;
  const material = new THREE.ShaderMaterial({
    uniforms: {...uniforms, oakMotion:{value:reduced ? 0 : 1}},
    vertexShader: `
      attribute vec3 anchor; attribute float barkWidth;
      uniform float uT,uWindAmp,uGustE,oakMotion;uniform vec3 uWindDir;
      varying vec3 vNorm,vW; varying vec2 vBark; varying float vWidth;
      void main(){
        // One continuous field, evaluated on the ring centre. At a fork both
        // parent and child see exactly the same anchor, time, gust and phase.
        float h=clamp((anchor.y-.75)/7.6,0.,1.);
        float reach=length(anchor.xz);
        float flex=h*h*(.10+.046*reach)+smoothstep(.7,4.8,reach)*.25*smoothstep(.35,1.4,anchor.y);
        float phase=dot(anchor.xz,vec2(.48,.31))+anchor.y*.23;
        float wave=.42+.44*sin(uT*1.15+phase)+.16*sin(uT*2.15+phase*1.8)+uGustE*.50;
        vec3 side=vec3(-uWindDir.z,0.,uWindDir.x);
        vec3 drift=(uWindDir*wave+side*.17*sin(uT*2.28+phase))*flex*min(uWindAmp,.77)*oakMotion;
        // Keep the finest bare twig silhouettes contiguous when they project
        // below a pixel. Their geometric diameter still controls close views.
        vec3 radial=position-anchor;
        float radius=max(length(radial),.0001);
        float viewDepth=max(0.,-(modelViewMatrix*vec4(anchor,1.)).z);
        float silhouetteRadius=max(radius,min(.018,viewDepth*.00064));
        vec4 w=modelMatrix*vec4(anchor+radial*(silhouetteRadius/radius)+drift,1.);
        vW=w.xyz; vNorm=normalize(mat3(modelMatrix)*normal);
        vBark=uv; vWidth=barkWidth; gl_Position=projectionMatrix*viewMatrix*w;
      }`,
    fragmentShader: `
      uniform float uDay,uGold,uEl;uniform vec3 uZen,uHor,uSunDir,uSunC;
      varying vec3 vNorm,vW;varying vec2 vBark;varying float vWidth;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
      void main(){
        vec2 metres=vBark;float mature=smoothstep(.025,.23,vWidth);
        float wander=(noise(vec2(metres.x*3.,metres.y*2.8))-.5)*.073;
        vec2 bark=vec2((metres.x+wander)*35.,metres.y*3.1);
        float grain=noise(bark),plates=noise(vec2(bark.x*1.7,bark.y*.78));
        float coarse=noise(vec2(bark.x*.36,bark.y*.80));
        float grooves=smoothstep(.23,.58,grain*.75+plates*.25);
        float fissure=noise(vec2(bark.x*.65,bark.y*3.75+coarse*5.));
        float scurf=noise(vec2(bark.x*5.5,bark.y*24.));
        float relief=.61+.29*grooves+.29*plates+.14*scurf-.19*(1.-smoothstep(.18,.37,fissure));
        vec3 wood=mix(vec3(.159,.128,.102),vec3(.36,.325,.281)*relief,mature);
        vec3 n=normalize(vNorm);
        float direct=max(dot(n,normalize(uSunDir)),0.)*smoothstep(-.035,.06,uEl);
        vec3 skylight=mix(uZen,uHor,.63)*.54+vec3(.104,.113,.119)*uDay;
        vec3 color=wood*(skylight + uSunC*direct*(.54+.35*uGold));
        color*=mix(.24,1.,uDay);
        gl_FragColor=vec4(mix(color,uHor*mix(.55,.9,uDay),1.-exp(-length(vW-cameraPosition)*.008)),1.);
      }`
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.name='Bur oak bark, limbs and twigs';
  group.add(mesh);
  function debug() {
    const anchor = geo.attributes.anchor;
    let maximumGap = 0;
    for (const [parent, child] of junctions) {
      const a = new THREE.Vector3().fromBufferAttribute(anchor,parent);
      maximumGap=Math.max(maximumGap,a.distanceTo(new THREE.Vector3().fromBufferAttribute(anchor,child)));
    }
    const bounds=geo.boundingBox.getSize(new THREE.Vector3());
    const rootDepths=roots.map(root => {
      const firstTip=root.first+(root.points.length-1)*(root.sides+1);
      let cover=Infinity;
      for (let j=0;j<root.sides;j++) {
        const pt=new THREE.Vector3().fromBufferAttribute(geo.attributes.position,firstTip+j);
        cover=Math.min(cover,ground(pt.x,pt.z)-baseY-pt.y);
      }
      return cover;
    });
    return {unions:junctions.length, maximumAnchorGapM:maximumGap, rootTipDepthsM:rootDepths,
      heightM:geo.boundingBox.max.y, widthM:bounds.x, depthM:bounds.z, triangles:indices.length/3};
  }
  return {group,debug};
}
