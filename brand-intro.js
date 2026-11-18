import { BeakerWater, mountWaterMark } from './beaker-water.js?v=2';

(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const image = document.querySelector('#directory h1 img');
  const track = document.querySelector('.brand-track');
  const stage = document.querySelector('.brand-stage');
  if (!image || !track || !stage || reduced.matches) return;
  let journey = !location.hash && performance.getEntriesByType('navigation')[0]?.type !== 'back_forward';

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.className = 'brand-screen';
  canvas.setAttribute('aria-hidden','true');
  const clamp = value => Math.max(0, Math.min(1, value));
  function smooth(value) {
    const t = clamp(value);
    return t*t*(3-2*t);
  }
  const mix = (a,b,t) => a+(b-a)*t;
  const scaleBetween = (a,b,t) => a*Math.pow(b/a,t);
  const beat = (p, from, to) => smooth((p-from)/(to-from));

  // Traced in the production wordmark's 1165 × 498 coordinate system.
  // Sample the same cubic contour for the camera rail and the visible ink.
  const approach = 'M567.5 81 V173 L428 402 C406 446 420 471 463 471 H590';
  const outline = approach + ' H777 C825 471 840 445 814 401 L675.5 173 V81';
  const rim = new Path2D('M548 24 H693 C733 24 733 80.5 693 80.5 H548 C506 80.5 506 24 548 24 Z');
  const ticks = new Path2D('M568 109 H601 M568 137 H593 M568 165 H605');
  function measuredPath(data) {
    const guide = document.createElementNS('http://www.w3.org/2000/svg','path');
    guide.setAttribute('d',data);
    return guide;
  }
  const rail = measuredPath(approach);
  const railLength = rail.getTotalLength();
  const vessel = new Path2D(outline);
  // Turn directly from the foot into the inner stroke. Both pieces share
  // the point (590,439); the inner loop returns to it before the handoff.
  const turnIn = 'M590 471 C613 471 613 439 590 439';
  const bridge = new Path2D(turnIn);
  const bridgeLength = measuredPath(turnIn).getTotalLength();
  const water = new BeakerWater();
  const restingSegments = water.segments;
  const ink = restingSegments.map(data => ({
    path: new Path2D(data),
    length: measuredPath(data).getTotalLength()
  }));
  const innerRail = measuredPath([turnIn,...restingSegments].join(' '));
  const penLength = innerRail.getTotalLength();

  function drawRestingLiquid(remaining) {
    for (const segment of ink) {
      if (remaining <= 0) break;
      if (remaining < segment.length) {
        context.setLineDash([remaining,penLength+2]);
        context.stroke(segment.path);
        context.setLineDash([]);
        break;
      }
      context.stroke(segment.path);
      remaining -= segment.length;
    }
  }

  let previousTime = performance.now();
  let shown = null;
  let previousDrive = null;

  let liveMark;
  let ticket = 0;
  let active = false;
  const listeners = new AbortController();

  function render(now = performance.now()) {
    ticket = 0;
    const distance = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const width = document.documentElement.clientWidth;
    const height = innerHeight;
    const mobile = width <= 720;
    const sloshEnd = mobile ? .716 : .67;
    const requested = journey ? clamp(scrollY/distance) : 1;
    const dt = Math.min(.05,Math.max(0,(now-previousTime)/1000));
    previousTime = now;
    const last = shown ?? requested;
    const gap = requested-last;
    // Limit the photographed travel in both directions, particularly while
    // rounding the heel on a wide screen. Native scroll and tap remain direct.
    const travelRate = mobile ? 1.45 : mix(.22,1.1,beat(last,.30,.52));
    const rate = mix(travelRate,.56,beat(last,.43,.70));
    const step = Math.min(Math.abs(gap)*(1-Math.exp(-dt/(mobile ? .045 : .085))),rate*dt);
    const p = Math.abs(gap)<.0002 ? requested : last+Math.sign(gap)*step;
    shown = p;

    const dockStart = mobile ? .810 : .782;
    const dock = beat(p,dockStart,.97);
    const dockDelta = dock-beat(last,dockStart,.97);
    // The same water receives a small second impulse from the moving vessel.
    // Acceleration loads one wall; braking lets the surface sweep back.
    const roll = beat(p,sloshEnd+.014,dockStart);
    const rollDelta = roll-beat(last,sloshEnd+.014,dockStart);
    const rollImpulse = rollDelta*(mobile ? 3.6 : 6.2);
    const landingImpulse = dockDelta*(mobile ? 4.5 : 7.5)*(1-2*dock);
    // Read the gesture independently of the camera easing. A deliberate
    // wheel flick can send a lively wave even on the slower desktop rail.
    const drive = p < .465 ? .465 : Math.max(.465,Math.min(sloshEnd,requested));
    const delta = (drive-(previousDrive ?? drive))*distance;
    previousDrive = drive;
    if (p < .465) water.rest();
    else {
      const speed = Math.abs(delta)/(height*Math.max(dt,1/120));
      water.step(dt,82*delta/height*clamp(speed/1.8)+rollImpulse+landingImpulse);
    }
    const moving = water.energy > 0;
    if (moving || p !== requested) schedule();
    const flying = p < .97;
    root.classList.toggle('logo-in-flight', flying);
    root.classList.toggle('liquid-landing', !flying && moving);
    canvas.hidden = !flying;
    if (!flying && moving) {
      liveMark ??= mountWaterMark(image);
      liveMark?.draw(water);
    } else if (liveMark) {
      liveMark.remove();
      liveMark = null;
    }
    if (canvas.hidden) return;
    if (!canvas.isConnected) stage.append(canvas);

    const ratio = Math.min(devicePixelRatio || 1, 3);
    const pixels = Math.round(width*ratio), rows = Math.round(height*ratio);
    if (canvas.width !== pixels || canvas.height !== rows) {
      canvas.width = pixels;
      canvas.height = rows;
    }
    context.setTransform(ratio,0,0,ratio,0,0);
    context.clearRect(0,0,width,height);

    const target = image.getBoundingClientRect();
    const endScale = target.width/1165;
    const portraitScale = Math.min(width*(mobile ? .68 : .48)/430,height*.6/468);
    const closeScale = Math.min(width*.25/20,height*.23/20);
    const turn = beat(p,0,.207);
    const transfer = beat(p,.178,.266);
    const draw = beat(p,.197,.465);
    const crestFrame = beat(p,.331,.439);
    const pull = beat(p,sloshEnd+.014,mobile ? .819 : .79);

    // Track the pen into the surface, then lock both camera axes and the
    // lens while the walls and waterline show the full outward and return flow.
    const outer = rail.getPointAtLength(mix(mobile ? 278 : 309,railLength,turn));
    const tip = innerRail.getPointAtLength(penLength*draw);
    const focusX = mix(mix(outer.x,tip.x,transfer),608,crestFrame);
    const focusY = mix(mix(outer.y,tip.y,transfer),281,crestFrame);
    const pivotX = mix(focusX,622,pull), pivotY = mix(focusY,247,pull);
    const trackingScale = mobile
      ? scaleBetween(closeScale,portraitScale*3.6,beat(p,.166,.30))
      : scaleBetween(closeScale*.74,portraitScale*2.55,beat(p,.025,.30));
    const crestScale = Math.min(width*.78/175,height*.82/165);
    const lens = scaleBetween(trackingScale,crestScale,crestFrame);
    const scale = scaleBetween(scaleBetween(lens,portraitScale,pull),endScale,dock);
    const bank = mix(mix(-.12,.27,turn),-.08,transfer)*(1-crestFrame)*(mobile ? 1 : .28);
    const framedX = width*mix(mix(.52,.44,turn),.5,crestFrame);
    const framedY = height*mix(mix(.48,.58,turn),.48,crestFrame);
    const x = mix(framedX,target.left+622*endScale,dock);
    const y = mix(framedY,target.top+247*endScale,dock);
    context.translate(x,y);
    context.rotate(bank);
    context.scale(scale,scale);
    context.translate(-pivotX,-pivotY);

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#fff';
    context.lineWidth = 20.5;
    context.stroke(vessel);
    context.stroke(rim);
    context.lineWidth = 14;
    context.stroke(ticks);
    if (draw > 0) {
      context.lineWidth = 20;
      const length = penLength*draw;
      if (p < .443) {
        context.globalAlpha = 1-beat(p,.36,.443);
        if (length < bridgeLength) context.setLineDash([length,penLength+2]);
        context.stroke(bridge);
        context.globalAlpha = 1;
        context.setLineDash([]);
      }
      if (moving && draw === 1) {
        water.stroke(context);
      } else {
        drawRestingLiquid(draw === 1 ? Infinity : length-bridgeLength);
      }
    }

    // The print takes over at display size. Reveal the letters from the A outward.
    const letters = beat(p,.875,.97);
    if (letters > 0) {
      const left = 390*(1-letters);
      const right = 315*letters;
      context.drawImage(image,left,0,390-left,498,left,0,390-left,498);
      context.drawImage(image,850,0,right,498,850,0,right,498);
    }
    root.style.setProperty('--directory-in',String(beat(p,.898,.97)));
  }

  function schedule() { if (active && !ticket) ticket=requestAnimationFrame(render); }
  function skipIntro() {
    journey = false;
    shown = 1;
    previousDrive = null;
    water.rest();
    cancelAnimationFrame(ticket);
    ticket = 0;
    root.classList.remove('logo-journey','logo-in-flight','liquid-landing');
    root.style.removeProperty('--directory-in');
    canvas.remove();
    liveMark?.remove();
    liveMark = null;
  }
  function leave() {
    active = false;
    listeners.abort();
    skipIntro();
  }
  function start() {
    if (!image.naturalWidth || reduced.matches) return;
    active = true;
    if (document.activeElement?.closest('a')) journey = false;
    root.classList.toggle('logo-journey',journey);
    render();
    const options = {passive:true,signal:listeners.signal};
    addEventListener('scroll',schedule,options);
    addEventListener('resize',schedule,options);
    image.addEventListener('lab-nav-wave',event=>{
      if (root.classList.contains('logo-in-flight') || reduced.matches) return;
      const {direction,touch} = event.detail;
      const impulse = touch || innerWidth <= 720 ? 2.4 : 4.7;
      // Add to the landing wave in place. Rapidly crossing links should
      // never pump a docked mark up to a full-screen flick.
      const now = performance.now();
      if (water.energy) water.step(Math.max(0,(now-previousTime)/1000));
      previousTime = now;
      water.nudge(direction,impulse);
      schedule();
    },options);
    image.addEventListener('lab-wave-handoff',event=>{
      event.detail.water = {...water};
      // Timestamp the drawn frame rather than the later click event.
      event.detail.frameTime = performance.timeOrigin+previousTime;
    },options);
    document.addEventListener('keydown',event=>{
      if (event.key === 'Tab' && root.classList.contains('logo-in-flight')) skipIntro();
    },options);
    document.addEventListener('focusin',event=>{
      if (event.target.closest('a') && root.classList.contains('logo-in-flight')) skipIntro();
    },options);
    stage.addEventListener('click',event=>{
      if (event.target.closest('a') || !root.classList.contains('logo-in-flight')) return;
      skipIntro();
    },options);
    reduced.addEventListener('change',leave,options);
    addEventListener('pagehide',event=>{
      if (event.persisted) skipIntro();
      else leave();
    },options);
  }
  if (image.complete) start();
  else image.addEventListener('load',start,{once:true});
})();
