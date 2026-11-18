(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const image = document.querySelector('#directory h1 img');
  const track = document.querySelector('.brand-track');
  const stage = document.querySelector('.brand-stage');
  if (!image || !track || !stage || reduced.matches || location.hash ||
      performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;

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
  // Water climbs the sloping glass on the loaded side as it drains on the
  // other. The bulge crosses first; the run-up at the wall arrives later.
  function liquidContour(body,wall) {
    const push = Math.max(0,body);
    const runUp = Math.max(0,wall);
    const backwash = Math.max(0,-body);
    const leftDrop = 25*push - 29*backwash;
    const rightDrop = -35*runUp + 21*Math.max(0,-wall);
    const leftX = 524 - leftDrop*64/105;
    const rightX = 691 + rightDrop*87/144;
    const shoulderX = 569 + 39*push - 9*backwash;
    const shoulderY = 307 + 19*push - 40*backwash;
    return `H472 Q438 439 460 403 L${leftX} ${298+leftDrop}
      Q${546+11*push+3*backwash} ${310+leftDrop-19*backwash} ${shoulderX} ${shoulderY}
      C${shoulderX+36} ${shoulderY-1-19*push+8*backwash}
       ${638+14*push-24*backwash} ${231-28*runUp+51*backwash} ${rightX} ${260+rightDrop}
      L778 404 Q798 440 766 440 L646 439 H590`;
  }
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
  const liquid = liquidContour(0,0);
  const ink = new Path2D('M590 439 '+liquid+' Z');
  const innerRail = measuredPath(turnIn+' '+liquid);
  const penLength = innerRail.getTotalLength();

  let surge = 0, velocity = 0, wall = 0;
  let previousY = scrollY, previousTime = performance.now();
  let shown = null;

  function advanceWater(delta, elapsed, height) {
    // Weight displacement by speed: the same distance over a longer gesture
    // delivers a smaller impulse. Use viewport units across device sizes.
    const speed = Math.abs(delta)/(height*Math.max(elapsed,1/120));
    velocity += 72*delta/height*clamp(speed/1.8);
    velocity = Math.max(-15,Math.min(15,velocity));

    // Integrate in small steps even on a low refresh-rate screen. The wall
    // follows the body with a slight lag, then the return stroke loses energy.
    let remaining = Math.min(elapsed,1);
    while (remaining > 0) {
      const dt = Math.min(remaining,1/120);
      velocity += (-76*surge - 8.6*velocity)*dt;
      surge += velocity*dt;
      wall += (surge-wall)*(1-Math.exp(-dt/.075));
      remaining -= dt;
    }
    if (delta === 0 && Math.abs(surge)+Math.abs(wall)+Math.abs(velocity)/9 < .006) {
      surge = velocity = wall = 0;
    }
  }

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
    const requested = clamp(scrollY/distance);
    const dt = Math.max(0,(now-previousTime)/1000);
    const withinCrest = y => Math.max(distance*.465, Math.min(distance*sloshEnd,y));
    const delta = withinCrest(scrollY)-withinCrest(previousY);
    // After an idle interval, only the new input belongs to this frame.
    if (requested < .465) surge = velocity = wall = 0;
    else advanceWater(delta,delta ? Math.min(dt,.05) : dt,height);
    previousY = scrollY;
    previousTime = now;

    const moving = surge !== 0 || velocity !== 0 || wall !== 0;
    const goal = moving ? Math.min(requested,sloshEnd) : requested;
    // When a flick outruns the crest, allow the water to finish. Catch up
    // continuously afterwards without taking control of native scrolling.
    const p = shown === null ? goal : Math.min(goal,shown+Math.max(.012,dt*1.45));
    shown = p;
    if (moving || p < goal) schedule();
    const flying = p < .999;
    root.classList.toggle('logo-in-flight', flying);
    canvas.hidden = !flying;
    if (!flying) return;

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
    const dock = beat(p,mobile ? .884 : .86,.97);

    // Track the pen into the surface, then lock both camera axes and the
    // lens while the walls and waterline show the full outward and return flow.
    const outer = rail.getPointAtLength(mix(278,railLength,turn));
    const tip = innerRail.getPointAtLength(penLength*draw);
    const focusX = mix(mix(outer.x,tip.x,transfer),608,crestFrame);
    const focusY = mix(mix(outer.y,tip.y,transfer),281,crestFrame);
    const pivotX = mix(focusX,622,pull), pivotY = mix(focusY,247,pull);
    const trackingScale = scaleBetween(closeScale,portraitScale*3.6,beat(p,.166,.30));
    const crestScale = Math.min(width*.78/175,height*.82/165);
    const lens = scaleBetween(trackingScale,crestScale,crestFrame);
    const scale = scaleBetween(scaleBetween(lens,portraitScale,pull),endScale,dock);
    const bank = mix(mix(-.12,.27,turn),-.08,transfer)*(1-crestFrame);
    const framedX = width*mix(mix(.52,.44,turn),.5,crestFrame);
    const framedY = height*mix(mix(.48,.58,turn),.48,crestFrame);
    const x = mix(framedX,target.left+622*endScale,dock);
    const y = mix(framedY,target.top+247*endScale,dock) - height*.035*Math.sin(Math.PI*dock);
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
      if (length > bridgeLength) {
        if (draw < 1) context.setLineDash([length-bridgeLength,penLength+2]);
        const contour = moving && draw === 1
          ? new Path2D('M590 439 '+liquidContour(Math.tanh(surge),Math.tanh(wall))+' Z')
          : ink;
        context.stroke(contour);
      }
      context.setLineDash([]);
    }

    // The print takes over at display size. Reveal the letters from the A outward.
    const letters = beat(p,.908,.985);
    if (letters > 0) {
      const left = 390*(1-letters);
      const right = 315*letters;
      context.drawImage(image,left,0,390-left,498,left,0,390-left,498);
      context.drawImage(image,850,0,right,498,850,0,right,498);
    }
    const print = beat(p,.95,.989);
    if (print > 0) {
      context.fillStyle = '#101311';
      context.globalAlpha = print;
      context.fillRect(390,0,460,498);
      context.drawImage(image,390,0,460,498,390,0,460,498);
      context.globalAlpha = 1;
    }
    root.style.setProperty('--directory-in',String(beat(p,.928,.988)));
  }

  function schedule() { if (active && !ticket) ticket=requestAnimationFrame(render); }
  function leave() {
    active = false;
    listeners.abort();
    cancelAnimationFrame(ticket);
    root.classList.remove('logo-journey','logo-in-flight');
    root.style.removeProperty('--directory-in');
    canvas.remove();
  }
  function start() {
    if (!image.naturalWidth || reduced.matches || document.activeElement?.closest('a')) return;
    active = true;
    root.classList.add('logo-journey');
    stage.append(canvas);
    render();
    const options = {passive:true,signal:listeners.signal};
    addEventListener('scroll',schedule,options);
    addEventListener('resize',schedule,options);
    document.addEventListener('keydown',event=>{
      if (event.key === 'Tab' && root.classList.contains('logo-in-flight')) leave();
    },options);
    document.addEventListener('focusin',event=>{
      if (event.target.closest('a') && root.classList.contains('logo-in-flight')) leave();
    },options);
    stage.addEventListener('click',event=>{
      if (event.target.closest('a') || !root.classList.contains('logo-in-flight')) return;
      leave();
    },options);
    reduced.addEventListener('change',leave,options);
    addEventListener('pagehide',leave,options);
  }
  if (image.complete) start();
  else image.addEventListener('load',start,{once:true});
})();
