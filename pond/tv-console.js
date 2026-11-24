// 1978 Zenith 25-inch ChromaColor II, Visual Alchemy item 2700.
// Overall 0.8382 × 0.5334 × 0.635 m (W × H × D). See tv-reference.md.
export function createTelevision(THREE) {
  const group = new THREE.Group();
  group.name = 'Zenith wood console';
  const batches = new Map();
  const material = (color, roughness, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const trim = material(0x82765b, .57, .38);
  const bezel = material(0x514c3e, .72, .17);
  const dark = material(0x211f1a, .8);
  const nickel = material(0xb2ac93, .54, .56);
  const grille = material(0x493524, .88);
  const back = material(0x433d2d, .87);
  const walnut = material(0xffffff, .8);
  const crown = material(0xffffff, .94);
  let seed = 15293;
  function noise() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function paintedMap(width, height, painter) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    painter(canvas.getContext('2d'));
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 2;
    return texture;
  }
  // A one-metre walnut repeat. The sides have vertical cathedral grain,
  // the rails run horizontally. Pigment deposits gather on the top only.
  function veneer(sediment) {
    const n = 384;
    const tex = paintedMap(n, n, ctx => {
      const pixels = ctx.createImageData(n, n);
      const fibre = Array.from({length:n}, () => noise());
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const u = x / n * Math.PI * 2, v = y / n * Math.PI * 2;
          const bend = 2.9 * Math.cos(u) + .85 * Math.sin(2*u + v) + .4 * Math.sin(3*u);
          const growth = Math.sin(19*v + bend + 1.4 * Math.sin(3*v + .7*Math.cos(u)));
          const value = 7*growth + 9*Math.pow(Math.max(0,growth),8) +
            4*Math.sin(55*v + 3*bend) + 7*fibre[(y + Math.round(bend) + n) % n] + 5*noise();
          const patch = sediment ? Math.max(0, .4 + .31*Math.sin(3*u+v) + .18*Math.sin(5*v-u) + .12*Math.sin(8*u+6*v)) : 0;
          const silt = patch * (.6 + .4*noise());
          const k = (y*n+x)*4;
          pixels.data[k] = 83 + value + 19*silt;
          pixels.data[k+1] = 51 + value*.72 + 40*silt;
          pixels.data[k+2] = 31 + value*.5 + 24*silt;
          pixels.data[k+3] = 255;
        }
      }
      ctx.putImageData(pixels, 0, 0);
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
  walnut.map = veneer(false);
  crown.map = veneer(true);

  // Batch the static geometry by finish. Keep the tube glass and main knob
  // separate for the channel shader, pointer picking and mechanical rotation.
  function append(geometry, mat, x, y, z) {
    geometry.translate(x, y, z);
    const geo = geometry.index ? geometry.toNonIndexed() : geometry;
    const bucket = batches.get(mat) || {position:[], normal:[], uv:[]};
    for (const key of Object.keys(bucket)) {
      const attr = geo.getAttribute(key);
      for (const value of attr.array) bucket[key].push(value);
    }
    batches.set(mat, bucket);
    geo.dispose();
    if (geo !== geometry) geometry.dispose();
  }
  function board(x, y, z, w, h, d, mat, vertical = false) {
    const geo = new THREE.BoxGeometry(w, h, d);
    if (mat === walnut || mat === crown) {
      const {position, normal, uv} = geo.attributes;
      for (let i = 0; i < position.count; i++) {
        const a = position.getX(i)+x, b = position.getY(i)+y, c = position.getZ(i)+z;
        let u = Math.abs(normal.getX(i)) > .5 ? c : a;
        let v = Math.abs(normal.getY(i)) > .5 ? c : b;
        if (vertical && Math.abs(normal.getY(i)) < .5) [u,v] = [v,u];
        uv.setXY(i, u+.22, v+.31);
      }
    }
    append(geo, mat, x, y, z);
  }

  const sideX = .397, sideTop = .521, sideBottom = .021;
  const front = .301, rear = -.234;
  const caseDepth = front - rear, midZ = (front + rear) / 2;
  board(0, .0105, midZ-.004, .785, .021, .511, dark);
  board(0, .032, midZ, .810, .022, caseDepth, walnut);
  board(0, .040, front+.003, .802, .010, .013, walnut);
  for (const sign of [-1,1]) {
    board(sign*sideX, (sideTop+sideBottom)/2, midZ, .018, sideTop-sideBottom, caseDepth, walnut, true);
    board(sign*.384,.278,.300, .008,.471,.012, walnut,true);
  }
  board(0,.514,midZ, .797,.015,caseDepth,walnut);
  board(0,.5272,.0295, .8382,.0124,.565,crown);
  board(0,.5187,.0295, .825,.0046,.552,walnut);
  board(0,.276,-.228,.78,.466,.012,back);
  // Sloped neck cap projects behind the rear hardboard cover.
  function rearCap() {
    const verts = [], indices = [], uvs = [];
    const zs = [-.234,-.25,-.312,-.3175], widths = [.28,.28,.18,.17], heights = [.17,.17,.086,.081];
    for (let k=0; k<zs.length; k++) {
      for (const [sx,sy] of [[-1,-1],[-1,1],[1,1],[1,-1]]) {
        verts.push(-.062+sx*widths[k]/2, .27+sy*heights[k]/2, zs[k]);
        uvs.push((sx+1)/2,(sy+1)/2);
      }
      if(k) for(let j=0;j<4;j++) {
        const a=(k-1)*4+j, b=(k-1)*4+(j+1)%4;
        indices.push(a,b,b+4,a,b+4,a+4);
      }
    }
    indices.push(12,13,14,12,14,15);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }
  append(rearCap(),back,0,0,0);
  for(let i=0;i<26;i++) board(-.338+i*.026,.425,-.235,.014,.036,.003,dark);

  board(0,.501,.294,.78,.016,.014,walnut);
  board(0,.046,.295,.78,.013,.014,walnut);
  board(-.377,.272,.294,.025,.444,.014,walnut,true);
  board(.225,.272,.294,.008,.444,.014,walnut,true);
  board(.384,.272,.294,.018,.444,.014,walnut,true);

  const cx=-.071, cy=.272, hw=.254, hh=.1905;
  const widthAt = t => hw - .011*t*t - .022*Math.pow(Math.abs(t),14);
  const heightAt = s => hh - .005*s*s - .012*Math.pow(Math.abs(s),14);
  function glassPoint(s,t) {
    return [cx+s*widthAt(t), cy+t*heightAt(s), .282+.019*(1-s*s)*(1-t*t)];
  }
  function faceGeometry(points,uvs,indices) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }
  const vertices=[],uvs=[],faces=[];
  const cols=32,rows=24;
  for(let j=0;j<=rows;j++) for(let i=0;i<=cols;i++) {
    const u=i/cols,v=j/rows;
    vertices.push(...glassPoint(2*u-1,2*v-1));
    uvs.push(u,v);
    if(i && j) {
      const d=j*(cols+1)+i, a=d-cols-2;
      faces.push(a,a+1,d,a,d,d-1);
    }
  }
  const screen = new THREE.Mesh(faceGeometry(vertices,uvs,faces),material(0x263731,.23,.08));
  screen.name='Convex CRT picture glass';
  group.add(screen);

  // Follow the glass edge precisely. The wide moulded bezel recedes into
  // the corner around it, then meets the narrow metal flange at the front.
  const perimeter=[];
  for(let i=0;i<cols;i++) perimeter.push([i/cols*2-1,-1]);
  for(let j=0;j<rows;j++) perimeter.push([1,j/rows*2-1]);
  for(let i=0;i<cols;i++) perimeter.push([1-i/cols*2,1]);
  for(let j=0;j<rows;j++) perimeter.push([-1,1-j/rows*2]);
  function rim(inner,outer,mat) {
    const v=[],uv=[],idx=[];
    for(let i=0;i<perimeter.length;i++) {
      const [s,t]=perimeter[i];
      v.push(...inner(s,t),...outer(s,t));
      uv.push(i/perimeter.length,0,i/perimeter.length,1);
      const a=i*2,b=(a+2)%(perimeter.length*2);
      idx.push(a,a+1,b+1,a,b+1,b);
    }
    append(faceGeometry(v,uv,idx),mat,0,0,0);
  }
  const lip=(s,t)=>[cx+s*(widthAt(t)+.004),cy+t*(heightAt(s)+.004),.285];
  const mould=(s,t)=>[cx+s*.285,cy+t*.212,.303];
  const flange=(s,t)=>[cx+s*.290,cy+t*.218,.307];
  const rail=(s,t)=>[cx+s*.294,cy+t*.222,.301];
  rim(glassPoint,lip,dark);
  rim(lip,mould,bezel);
  rim(mould,flange,trim);
  rim(flange,rail,walnut);
  // An inset radio-style escutcheon, a separate vertical bank of controls,
  // and vertical speaker louvers beneath the two tuners.
  board(.304,.273,.283,.153,.443,.032,walnut,true);
  board(.301,.383,.301,.131,.222,.004,trim);
  board(.292,.383,.304,.096,.212,.003,dark);
  board(.356,.383,.302,.020,.211,.004,bezel);
  board(.303,.157,.299,.143,.202,.006,grille);
  board(.303,.157,.302,.132,.192,.003,dark);
  for(let i=0;i<25;i++) board(.240+i*.0052,.157,.305,.0022,.19,.006,grille);
  for(let i=0;i<3;i++) board(.303,.095+i*.061,.306,.133,.002,.004,grille);
  const panel = paintedMap(180,400,ctx=>{
    ctx.fillStyle='#231f19'; ctx.fillRect(0,0,180,400);
    ctx.textAlign='center'; ctx.fillStyle='#d1c7a9';
    ctx.font='italic bold 21px Georgia'; ctx.fillText('Chromacolor',90,28);
    ctx.font='10px sans-serif'; ctx.fillText('SOLID STATE  II',90,44);
    for(const [y,label] of [[143,'VHF'],[303,'UHF']]){
      ctx.fillStyle='#c5ba9e'; ctx.font='11px monospace'; ctx.fillText(label,90,y+54);
      for(let i=0;i<13;i++) {
        const a=(i/12*1.55+.73)*Math.PI;
        ctx.beginPath();
        ctx.strokeStyle='#a69c85'; ctx.lineWidth=i%3===0?2.5:1.1;
        ctx.moveTo(90+Math.cos(a)*37,y+Math.sin(a)*37);
        ctx.lineTo(90+Math.cos(a)*42,y+Math.sin(a)*42);
        ctx.stroke();
      }
    }
  });
  const face = new THREE.PlaneGeometry(.096,.211);
  append(face,new THREE.MeshStandardMaterial({map:panel,roughness:.86}),.292,.383,.306);
  for(let i=0;i<3;i++){
    board(.355,.455-i*.061,.306,.012,.027,.005,dark);
    board(.355,.455-i*.061,.310,.008,.017,.005,i===0?trim:nickel);
  }
  // The independent volume slider is below the upper row of switches.
  // Both ends of its stroke stay on the right-hand escutcheon.
  const volumeControl = new THREE.Mesh(new THREE.BoxGeometry(.019,.008,.008),nickel.clone());
  volumeControl.name = 'Volume slider';
  volumeControl.position.set(.355,.290,.309);
  group.add(volumeControl);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(.004,.041,.002),dark.clone());
  slot.position.set(.355,.303,.305);
  group.add(slot);
  function setVolumeState(active,level) {
    volumeControl.position.y = .290 + (active ? .026*level : 0);
  }
  function disk(radius,depth,count) {
    const geo = new THREE.CylinderGeometry(radius,radius,depth,count);
    geo.rotateX(Math.PI/2);
    return geo;
  }
  const knob = new THREE.Group();
  knob.name='VHF channel selector';
  knob.position.set(.292,.413,.306);
  group.add(knob);
  for(const [k,y] of [[0,.413],[1,.328]]) {
    append(disk(.024,.005,32),nickel,.292,y,.308);
    const centerZ=.312,faceZ=.315;
    if(k===0){
      const grip = new THREE.Mesh(disk(.020,.006,32),dark.clone());
      grip.position.z=centerZ-.306;
      knob.add(grip);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(.007,.034,.005),nickel.clone());
      bar.position.z=faceZ-.306;
      knob.add(bar);
    } else {
      append(disk(.019,.006,32),dark,.292,y,centerZ);
      const bar = new THREE.BoxGeometry(.007,.032,.005);
      bar.rotateZ(.67);
      append(bar,nickel,.292,y,faceZ);
    }
  }
  // The same 24-ray, 55 mm ambient accessibility bake as the GLB.
  // Each pair is a run length and a linear grayscale vertex value.
  const bakedFinishes = [
    'AeQB/AHIAvwByAHMAfwB4AL8AeABsAG4AbQCuAG0Bv8B1AH8AdgC/AHYAdwB/AHUAvwB1AK0AdQBtAHQA9QBtAHUArQB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQB0AHUAdAB1AG4AdQCuAHUAbgB1AK4AdQBtAHUAbQC1AG0BrgG/wK0AdQBtAHQAdQB0AHUAbgB1AK4AdQBuAHUArgB1AG0AdQBtALUAbQGuAb/ArQB1AG0AdAB1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQB0AHUAdAB1AG4AdQCuAHUAbgB1AK4AdQBtAHUAbQC1AG0BrgG/wK0AdQBtAHQAdQB0AHUAbgB1AK4AdQBuAHUArgB1AG0AdQBtALUAbQGuAb/ArQB1AG0AdAB1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQB0AHUAdAB1AG4AdQCuAHUAbgB1AK4AdQBtAHUAbQC1AG0BrgG/wK0AdQBtAHQAdQB0AHUAbgB1AK4AdQBuAHUArgB1AG0AdQBtALUAbQGuAb/ArQB1AG0AdAB1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQB0AHUAdAB1AG4AdQCuAHUAbgB1AK4AdQBtAHUAbQC1AG0BrgG/wK0AdQBtAHQAdQB0AHUAbgB1AK4AdQBuAHUArgB1AG0AdQBtALUAbQGuAb/ArQB1AG0AdAB1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQB0AHUAdAB1AG4AdQCuAHUAbgB1AK4AdQBtAHUAbQC1AG0BrgG/wK0AdQBtAHQAdQB0AHUAbgB1AK4AdQBuAHUArgB1AG0AdQBtALUAbQGuAb/ArQB1AG0AdAB1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQB0AHUAdAB1AG4AdQCuAHUAbgB1AK4AdQBtAHUAbQC1AG0BrgG/wK0AdQBtAHQAdQB0AHUAbgB1AK4AdQBuAHUArgB1AG0AdQBtALUAbQGuAb/ArQB1AG0AdAB1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQB0AHUAdAB1AG4AdQCuAHUAbgB1AK4AdQBtAHUAbQC1AG0BrgG/wK0AdQBtAHQAdQB0AHUAbgB1AK4AdQBuAHUArgB1AG0AdQBtALUAbQGuAb/ArQB1AG0AdAB1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQB0AHUAdAB1AG4AdQCuAHUAbgB1AK4AdQBtAHUAbQC1AG0BrgG/wK0AdQBtAHQAdQB0AHUAbgB1AK4AdQBuAHUArgB1AG0AdQBtALUAbQGuAb/ArQB1AG0AdAB1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8CtAHUAbQC1AHQAdQBuAHUArgB1AG4AdQCuAHUAbQB1AG0AtQBtAa4Bv8B/AH/A/wC+AL8AfgB/AL4AvwB+AH8AvgB/CH4AvQC+AH0AfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AH4AfwB8AH8AvQC/AH0AfwC9AL8AfQB/AL0AvwB9AH8AvgC/AH4AfwC9AH8AfgB9AH4AvQC+AH0AfgC8AH4AfwB8AH8AvQB/AH4AfQN+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+ALsAvgB7AH4AuwC+AHsAfgC7AH4AfQB7AH0AuwC9AHsAfQC7AL0AewB9ALsAvQB7AH0AuwC9AHsAfQC7AL0AewB9ALsAvQB7AH0AuwC9AHsAfQC7AH0AfgB7AH4AuwC+AHsAfgC7AL4AewB+ALwAvgB8AH4AvAC+AHwFvgB/AH4AfwC8AH8AfgB8AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAB+AH0AfAB9ALwAvQB8AH0AvAC9AHwAfQC8AL0AfAB9ALwAvQB8AH0AvAC9AHwAfQC7AL0AewB9ALsAvQB7AH0AuwC9AHsAfQC7AL0AewB9ALsAvQB7AH0AuwC9AHsAfQC7AL0AewB9ALwAvQB8AH0AvAC9AHwAfQC8AL0AfAB9ALwAvQB8AH0AvAC9AHwAfQC8AL0AfAB9ALwAvQB8AH0AvAB9AH4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+AL0AfgB/AH0AfwC+AL8AfgK/AH4AfwN+AL0AvgB9AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwAfgC8AL4AfAB+ALwAvgB8AH4AvAC+AHwFvgB/AH4AfwC+AH8Af8B+AH/AvwC/wH8Af8B/ALUAZwB1AScAdABnALQAZgB1AGYAtQBmAHYAZgB1AKYAdQG/wacAcwByAGYAcgEmAHIAZgCyAGYAdABmALQAZgBwAGYAcACmAHAAfAB7AH4AewC+AKUAZgBlAKYAtwBlAHcBJQB2AGUAtgBmAHYAZgB2AHcAZgB2AGYAdwCmAHcAfwB/wH8Av8B/AaQAtwBlAHcBJQB1AGUAdgB1AGYAdgBmAHYAdwBmAHYAZgB3AKYAdwB+AH/AfwC/wH8BpAC3AGUAdwElAHYAZQB1AHYAZgB2AGYAdgB3AGYAdwBmAHcApgB3AH8Af8B/AL/AfwGkAHoAZgB5AKYAuQBmAHkApgC5AGYAegCmALoAZgB5AKYAuQBmAHkApgC5AGYAeQCmALkAZgB5AKYAuQBmAHkApgC5AGYAeQCmALkAZgB5AKYAuQBmAHkApgC5AGYAeQCmALkAZgB5AKYAuQBmAHgApgC4AGYAeACmALgAZgB4AKYAuABmAHgApgC4AGYAeACmALgAZgB4AKYAuABmAHgApgC4AGYAeACmALgAZgB4AKYAuABmAHgApgC4AGYAeACmALgAZgB4AKYAuABmAHgApgC4AGYAeACmALgAZgB4AKYAuABmAHgApgC4AGYAegCmALoAZgB6AKYAugBmAHoApgB6AL/AZgB/wH8AZgB/AH4AZgC+AGYAfgB/AGYAvwBmAL8AZgC/AGYAfwB/wGYAv8BmAL/AZgC/wGYAv8BmAL/AZgC/wGYAv8BmAL/AZgC/wGYAf8B+AGYAvgBmAH4AfwBmAH8Af8BmAL/AZgC/wGYAv8BmAL/AZgC/wGYAv8BmAL/AZgC/wGYAv8BmAL/ApgCnAKYAZwCmAGcApgBnAKYAZwCmAGcApgBnAKYAZwCmAGcApgBnAKYAZwCmAGcApgBnAKYAZwCmAKcAZgxnA==',
    'AcwB7AHQAewB6AHQAcwB7AHQAuwC0AHoAdwB6AHYAdwB/wH4AfwB+AL8AewB/wHsAv8B7Ab/AvgBnAH4ApwCoAH8AaAC/AG4AegBtALoAbQB9AGoAfQCqAH0Bv8BtAO4AbQBuATwAfQB8AHIAf8B4AL/AeABtAG4AcQBuAHIAcQB/wP4AfAB+AHYAf8B2AH/AfwB2AHgAf8B1AL/AdQB0AGgAawBoAGcAawBqAGYAcwBmAGgAcwBtAGsAZwCrAGcAaQBwAGkAcABmAGkAfwBnAH8AZwBoAH8AbABnAHIAZwB1AHIAdAB/wHoAv8B6AH0AewB6AHsAfwB6AG8AcABuAHAAbQBuAH4AewB/AHsAvwB2AH8AdwB/AH/AtwB/wHkAv8B5AHQAaABpAGgAZgBpAGwAZwBzAGcAaQBzAGcAawBwAKsAcABpAGYAaABmAHEAaAB/AGgAfwCoAH8AegBtAGwAbQBmAGwAagB4AGsAeAB0AKsAeABrAHgAdABrAS4AbQBuAHgAdgB1ALYAdQBpAH4AagC+AGoAawB9AGsAfQB8AGsAewB9AHYAfQB8AHYAeQB9AHYAfQB8AHYBrAB9AH4AfAC+AHwAcQB9AHsAfQB8AHsAdgB9AHgAfQB8AHgAdgB5AGkAeQB3AGkAagBwAHcAcAB6AHcAaQB2AGkAtgBpAHYAbgB3AG4AcwC3AHgAdgC4AHYAaQBvAGkAbwBwAGkAcgBoAGYAaABsAGYAbwBsAHIAbABoAHIAbgBvAGgAbwBuAGgAZwBrAGcAawBsAGcAdgBpAHgAaQBqAHgAZQBsAG4ArABuAHIAaAB0AGgAcAB0AG4AbwB6AK8AegB0AHYAdQB2AHQAdQB0AGgAZwCoAGcAdgBlAHwApQB8AHkAdwBvAHcAbgBvAHcAaQBvAKkAbwBwAHEAcgBxAGgAcgB0AHcAcQB3AHgAcQBnAGgAZwCoAGcAewBlAH8ApQB/AGoAbwB2AG8AdQB2AHkAdwBuAHcAbABuAHIAagBwAGoAaABwAHEAegBsAHoAdgBsAGcAaABzAGgAaQBzAHwAZQB7AGUAeAB7AHAAbwBrAG8AbABrAHoApgB6AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC4AKYAeABmALgApgB4AGYAuACmAHgAZgC8AGYAdwB8AHcAuwB3AHYAewB2ALsAtgB7AHYAuwC2AHsAdgC7ALYAewB2ALsAtgB7AHYAuwC2AHsAdgC7ALYAewB2ALsAtgB7AHYAuwC2AHsAdgC8AHYAeAB8AHgAvQB4AHoAfQB6AL0AegB5AH0AeQC9AHkAeAB9AHgAvQC4AH0AeAC8ALgAfAB4AL0AuAB9AHgAvQC4AH0AeAC9ALgAfQB4AL0AuAB9AHgAvAC4AHwAeAC9ALgAfQB4AL0AuAB9AHgAvQB4AHoAfQB6AL0AegB4AH0AeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAuAB8AHgAvAC4AHwAeAC8ALgAfAB4ALwAeAB2AHwAdgC8ALYAfAB2ALwAtgB8AHYAvAC2AHwAdgC8ALYAfAB2ALwAtgB8AHYAvAC2AHwAdgC8ALYAfAB2ALwAtgB8AHYAvAC2AHwAdgC8ALYAfAB2ALwAtgB8AHYAvAC2AHwAdgC8ALYAfAB2ALwAtgB8AHYAvAC2AHwAdgC8ALYAfAB2ALwAtgB8AHYAvAC2AHwAdgC8ALYAfAB2ALwAtgB8AHYAvAC2AHwAdgC8ALYAfAB2ALwAdgBmAHwAZgB6AGcAZgBqAGYAqgB6AHgAagB4AGYAagBuAGoAbQBqAGcAbQBlAGsAZQCrAGUApgBlAGYApQB1AHQAewB0AHkAew=',
    'Ev8C/AH4AvwB+Az/',
    'AagBrAGgAawBpAGgAZgBnAGkAZwBqAGkAZgBoAGYAqABmAG0AaQBtAKkAbQBpAGsAaQBrAGoAaQB7AH/AewC/wHsAdgB3AH/AdgB/wH8AdwB4AH8AdwB/AH/AeAB5AH8AeAC/AHkAdgB/AHkA/wC/wH8A/8B/AT/AvwB/wH8Av8C/AH/Afwg/w==',
    'Af8B+AP/AvwC/wH8Af8C/AL/AfwB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL0Av8B9AH/AvQC/wH0Af8C9AL/AfQB/wL0Av8B9AH/AvQC/wH0Af8C9AL/AfQB/wL0Av8B9AH/AvAC/wHwAf8C8AL/AfAB/wLwAv8B8AH/AvQC/wH0Af8C9AL/AfQB/wL0Av8B9AH/AvQC/wH0Af8C9AL/AfQB/wL0Av8B9AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C/AL/AfwB/wL8Av8B/AH/AvwB/wH4AfwB+AL8AfgB/wH8Af8C/AL/AfwB/wL8Av8B/AH/AvwC/wH8Af8C/AL/AfwB/wL8Av8B/AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL8Av8B/AH/AvwC/wH8Af8C/AL/AfwB/wL8Av8B/AH/AvwC/wH8Af8C/AL/AfwB/wL8Af8B8AH8AfAC/wHwAfwB/wH8Av8B/AP/AvgC/wH4Af8C+AL/AfgB/wL0Av8B9AH/AvQC/wH0Af8C9AL/AfQB/wL0Av8B9AH/AvAC/wHwAf8C8AL/AfAB/wLwAv8B8AH/AvAC/wHwAf8C8AL/AfAB/wLwAv8B8AH/AvAC/wHwAf8C8AL/AfAB/wLwAv8B8AH/AvAC/wHwAf8C8AL/AfAB/wLwAv8B8AH/AvAC/wHwAf8C8AL/AfAB/wLwAv8B8AH/AvAC/wHwAf8C9AL/AfQB/wL0Av8B9AH/AvQC/wH0Af8C9AL/AfQB/wL0Av8B9AH/AvgC/wH4Af8C/AH/BvwB+AH8AfgC/wH4AfwB/xD8Af8B/AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL4Av8B+AH/AvgC/wH4Af8C+AL/AfgB/wL8Af8B+AH8AfgC/wL4Af8B+AL/AvgB/wH4Af8C0AGQAdACkAKgAcgBoAHEAcgBmAHIAZgCyAGYAcwBnAHQAZwBmAHQAvwB/wH8Av8GlA==',
    'AfAC/AHwAfwC+AH8Af8B+K//AvwB/wH4AfwK+AH8AfgB/AL4AvwB+Ar8Af8B/AH/AvwC/wH8T/8C/AH/EvwB+AH8BPgB/AH4AfwC+AL8AfgE/AH/AfwB/wL8Av8B/Kb/AfwB/wH8AvgB/AH/AfgB/wLwAv8B8Hz/AfwB/w38AfAByAPQAcwB0AHIAdgB0AHYAcgB0AHAAcgBxAHIAsQB0AHMAdABzAHUAdAB/wH8Af8B/AL/AZgB2AGcAdgB1AGcAugBmAHoBJgB4AGYAuABmAHgAZgC4AGYAeQBmAHkApgB5Ab/BJgBnAGY',
    'AbABrAGQAawCkAKYAcABmAG4AcABvAHIAbQByAHEArQBmAGwApgBsAH4AfAB+ALwAfgBwAGwAcgBsAG4AcgC1AHQAdQBvAHQAcgB2AHcAdgC3AG8AeABwALgAcAB1AHkAdQB5AHMAdQG/waUAtQB2AHUAcgB2AHQAbgB2AG4AdAB2AG4AeABwALgAcAB1AHMAdQBzAHcAdQG/waUAtQBxAHUAbABxAG8AcgB2AHIAdAB2AHAAeABvALgAbwB1AHEAdQBxAHMAdQG/waUAtQB0AHUAbwB0AHUAbgB1AG4AdAB1AG8AeABvALgAbwB1AHEAdQCxAHUBv8GlALUAcQB1AG4AcQB1AHEAdQBxAHQAdQBwAHgAbwC4AG8AdQBzAHUAcwByAHUBv8GlALUAdwB1AHIAdwB1AG4AdgBuAHQAdgBwAHgAcgC4AHIAdQB0AHUAdABzAHUBv8GlALUAcgB1AHAAcgB0AHAAdgBwAHQAdgBsAHgAcAC4AHAAdQByAHUAcgB4AHUBv8GlALUAcgB1AG4AcgB1AG0AdgBtAHQAdgByAHgAcgC4AHIAdQBzAHUAswB1Ab/BpQC1AHIAdQBuAHIAdABwAHYAcAB0AHYAcwB4AHIAuAByAHUAcAB1AHAAcgB1Ab/BpQC1AHMAdQBtAHMAdQBsAHYAbAB0AHYAcgB4AG8AuABvAHUAdwB1AHcAdAB1Ab/BpQC1AHEAdQBuAHEAcgBuAHYAbgB0ALYAeAB0ALgAdAB1AHEAdQBxAHMAdQG/waUAtQBxAHUAbQBxAHUAbgB2AG4AdAB2AHQAeAByALgAcgB1AHMAdQBzAHYAdQG/waUAtQB0AHUAbQB0AHUAbgB2AG4AdAB2AHMAeAB3ALgAdwB1AHQAdQB0AHMAdQG/waUBNQBtAHUAdgBtAHYAbQB0AHYAcwB4AHIAuAByAHUAcwB1ALMAdQG/waUAtQB0AHUAbQB0AHYAbgB2AG4AdAB2AHIBeAB1AHMAdQBzAHQAdQG/waUAtQB5AHUAcAB5AHYAcAB2AHAAdAB2AHMAeABzALgAcwB1AHIAdQByAHMAdQG/waUBNQBuAHUAdwBwAHYAcAB0AHYAdAB4AHIAuAByAHUAcgB1AHIAbgB1Ab/BpQC1AHIAdQBtAHIAdwBuAHYAbgB0AHYAdAB4AHAAuABwAHUAcQB1AHEAbwB1Ab/BpQE1AG0AdQB4AGwAdgBsAHQAdgBxAHgAcAC4AHAAdQBzAHUAcwBxAHUBv8GlALUAdgB1AG8AdgB0AG4AdgBuAHQAdgBwAHgAdAC4AHQAdQByAHUAcgB0AHUBv8GlALUAcQB1AHAAcQB3AHEAdgBxAHQAdgB0AHgAdgC4AHYAdQB3AHUAdwBzAHUBv8GlALUAeAB1AG0AeAByAG4AdgBuAHQAdgBzAHcAdgC3AHYAdQByAHUAcgBzAHUBv8GlAHQAdQB0AHUAbgB0AHAAbgB2AG4AdAB2AHEAdwB5ALcAeQB1AHEAdQBxAHYAdQG/waUAdAD1AG0AdQB0AHEAdgBxAHQAdgB0AXcAdQBxAHUAcQB2AHUBv8GlATYAcAB2AHgAbgB2AG4AdAC2AHcAcgB3AHgAcgB1AHEAdQBxAHAAdQG/waUAtwBzAHcBMwB3AHMAtwBwAHUAbwB1AHYAbwB2AG8AdQBvAHAAdQG/waYAtwBzAHcBMwB3AHMAtwBwAHUAbwB1AHYAbwB2AG8AdQBvAHAAdQG/waYAtwBzAHcBMwB3AHMAtwBwAHUAbwB1AHYAbwB2AG8AdQBvAHAAdQG/waY',
    'Bv8=',
    'AugBmAHoBJgB4AGYAuABmAHgAZgC4AGYAeQBmAHkApgB5Ab/BJgBnAGYAugBmAHoBJgB4AGYAuABmAHgAZgC4AGYAeQBmAHkApgB5Ab/BJgBnAGYAdgB4AHYAeABvALYAbwB2AG8AdwC2APcAdQC3AHUAdgB1AHkAtgB5AHYAeQB0ALYAdAB2ALQAtgB0AHcAdAE3AHYAdwB4ALYAeAB3AHgAcAC3AHAAdwBwAHYAtwB2AHcAdgB6ALcAegB3AHoAdgC3AHYAdwB2AHQAtwB0AHYAdAB4ALYAeAB2AHgAdQC2AHUAdgB1AHQAtgB0AHYAdAG2AHEAtgBxAHYAcQM2AHcAtgB3AHYAdwB0ALYAdAB2AHQAcwC2AHMAdgBzAbYAcgC2AHIAdgByAHUAtgB1AHYAdQB0ALYAdAB2AHQAdwC2AHcAdgB3AbYAcQC2AHEAdgBxAHQAtgB0AHYAdAB4AHYAfQB8AGYAfAB9AGYAfQB8AGYAvABmAHwAfQBmAH0AfgBmAH4AfQBmAH0AfABmALwAZgB8AH0AZgC9AGYAvQBmAH0AfABmAHwAfQBmAL0AZgB9AHwAZgB8AH0AZgB9AH4AZgC+AGYAfgB9AGYAfQB8AGYAfAB9AGYAvQBmAL0AZgB9AH4AZgC+AGYAvgBmAH4AfQBmAL0AZgB9AH4AZgC+AGYAfgB9GGYAdwByAHcAcgB0ALcAdAB3AHQBtwB2ALcAdgB3AHYAcgC3AHIAdwByAHAAtwBwAHYAcAByALYAcgB2AHIAcwC2AHMAdgBzAG8AtgBvAHcAbwBxALcAcQB2AHEAdQC2AHUAdwB1AHMAtwBzAHcAcwB1ALcAdQB2ALUAtgB1AHYAdQB0ALYAdAB2ALQAtgB0AHYAtAC2AHQAdgB0AHkAtgB5AHYAeQB0ALYAdAB2ALQAtgB0AHYAdAG2AHgAtgB4AHYAuAC2AHgAdgB4AbYAcAC2AHAAdgBwAHgAtgB4AHYAeAB3ALYAdwB2AHcAcgC2AHIAdgByAHQAtgB0AHYAtAC2AHQAdwC0ALcAdAB3AHQBtwByAHcAfgB/AGYAfwB+AGYAvgBmAH4AfQBmAH0AfgBmAL4AZgC+AGYAfgB9AGYAvQBmAL0AZgC9AGYAfQB+AGYAfgB/AGYAvwBmAH8AfgBmAH4AfQBmAL0AZgB9AH4AZgC+AGYAvgBmAH4AfQBmAL0AZgB9AH4AZgC+AGYAfgB/AGYAvwBmAH8AfgBmAH4AfQBmAH0AfgBmAL4AZgC+AGYAvhhmALgAZwB4AScAdwBnALcAZgB5AGYAuQBmAHoAZgB6AKYAegG/waY'
  ];
  let finishIndex = 0;
  for (const [mat,attrs] of batches) {
    const geometry = new THREE.BufferGeometry();
    for (const [key,data] of Object.entries(attrs))
      geometry.setAttribute(key,new THREE.Float32BufferAttribute(data,key==='uv'?2:3));
    const runs = atob(bakedFinishes[finishIndex++]);
    const colors = new Uint8Array(attrs.position.length);
    let offset = 0;
    for (let i = 0; i < runs.length; i += 2) {
      const end = offset + runs.charCodeAt(i)*3;
      colors.fill(runs.charCodeAt(i+1), offset, end);
      offset = end;
    }
    mat.vertexColors = true;
    geometry.setAttribute('color', new THREE.Uint8BufferAttribute(colors,3,true));
    geometry.computeBoundingSphere();
    const mesh=new THREE.Mesh(geometry,mat);
    mesh.name='Cabinet · '+([walnut,crown,dark,bezel,trim,nickel,grille,back].indexOf(mat)+1);
    group.add(mesh);
  }
  return {group,screen,knob,volumeControl,setVolumeState};
}
