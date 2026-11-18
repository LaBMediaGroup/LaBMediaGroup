// Water climbs the sloping glass on the loaded side as it drains on the
// other. The bulge crosses first; the run-up at the wall arrives later.
function liquidSegments(body,wall,leading = 0,trailing = 0) {
  const push = Math.max(0,body);
  const runUp = Math.max(0,wall);
  const backwash = Math.max(0,-body);
  const leftDrop = 25*push - 29*backwash;
  const rightDrop = -35*runUp + 21*Math.max(0,-wall);
  const leftX = 524 - leftDrop*64/105;
  const rightX = 691 + rightDrop*87/144;
  const shoulderX = 569 + 39*push - 9*backwash;
  const shoulderY = 307 + 19*push - 40*backwash - 13*leading;
  const controlX = 546+11*push+3*backwash;
  const controlY = 310+leftDrop-19*backwash;
  // Continue the quadratic's tangent into the cubic, even at peak slosh.
  const tangentY = 36*(shoulderY-controlY)/(shoulderX-controlX);
  const left = leftX+' '+(298+leftDrop);
  const shoulder = shoulderX+' '+shoulderY;
  const right = rightX+' '+(260+rightDrop);
  // Split the original cubic at its midpoint. Lift the midpoint and its
  // two adjacent handles together so the travelling crest stays smooth.
  const handleX = 638+14*push-24*backwash;
  const handleY = 231-28*runUp+51*backwash;
  const q0x = shoulderX+18, q0y = shoulderY+tangentY/2;
  const q1x = (shoulderX+36+handleX)/2, q1y = (shoulderY+tangentY+handleY)/2;
  const q2x = (handleX+rightX)/2, q2y = (handleY+260+rightDrop)/2;
  const drift = 19*trailing, lift = -23*trailing;
  const midInX = (q0x+q1x)/2+drift, midInY = (q0y+q1y)/2+lift;
  const midOutX = (q1x+q2x)/2+drift, midOutY = (q1y+q2y)/2+lift;
  const mid = (midInX+midOutX)/2+' '+(midInY+midOutY)/2;
  // Separate round caps keep the ink solid at macro scale.
  return [
    `M590 439 H472 Q438 439 460 403 L${left}`,
    `M${left} Q${controlX} ${controlY} ${shoulder}`,
    `M${shoulder} C${q0x} ${q0y} ${midInX} ${midInY} ${mid}`,
    `M${mid} C${midOutX} ${midOutY} ${q2x} ${q2y} ${right}`,
    `M${right} L778 404 Q798 440 766 440 L646 439 H590`
  ];
}

// This inset stays between the outer glass and the inner sidewalls.
const surfaceWindow = new Path2D('M565 204 H674 L785 383 H453 Z');

// Scroll, landing and link input all add momentum to this one surface.
export class BeakerWater {
  constructor(saved = {}) {
    for (const key of ['surge','velocity','front','wall']) {
      this[key] = Number.isFinite(saved[key]) ? Math.max(-15,Math.min(15,saved[key])) : 0;
    }
  }

  get energy() {
    return Math.abs(this.surge)+Math.abs(this.front)+Math.abs(this.wall)+Math.abs(this.velocity)/9;
  }

  get segments() {
    return liquidSegments(Math.tanh(this.surge),Math.tanh(this.wall),
      Math.tanh(2.4*(this.surge-this.front)),Math.tanh(3.2*(this.front-this.wall)));
  }

  rest() {
    this.surge = this.velocity = this.front = this.wall = 0;
  }

  nudge(direction, strength) {
    const headroom = Math.max(0,Math.min(1,1-direction*this.velocity/6));
    this.velocity += direction*strength*headroom;
  }

  step(elapsed, impulse = 0) {
    this.velocity = Math.max(-15,Math.min(15,this.velocity+impulse));
    let remaining = Math.min(elapsed,1);
    while (remaining > 0) {
      const dt = Math.min(remaining,1/120);
      this.velocity += (-72*this.surge - 7.8*this.velocity)*dt;
      this.surge += this.velocity*dt;
      this.front += (this.surge-this.front)*(1-Math.exp(-dt/.078));
      this.wall += (this.front-this.wall)*(1-Math.exp(-dt/.102));
      remaining -= dt;
    }
    if (impulse === 0 && this.energy < .006) this.rest();
  }

  repaintSurface(context) {
    context.save();
    context.clip(surfaceWindow);
    context.clearRect(390,0,460,498);
    context.strokeStyle = '#fff';
    context.lineWidth = 20;
    context.lineJoin = context.lineCap = 'round';
    this.stroke(context);
    context.restore();
  }

  stroke(context) {
    for (const segment of this.segments) context.stroke(new Path2D(segment));
  }
}
