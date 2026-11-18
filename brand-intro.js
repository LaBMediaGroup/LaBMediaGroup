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
  const outline = 'M675.5 81 V173 L814 401 C840 445 825 471 777 471 H463 C420 471 406 446 428 402 L567.5 173 V81';
  const rim = new Path2D('M548 24 H693 C733 24 733 80.5 693 80.5 H548 C506 80.5 506 24 548 24 Z');
  const ticks = new Path2D('M568 109 H601 M568 137 H593 M568 165 H605');
  const liquid = 'M646 439 L766 440 Q798 440 778 404 L691 260 C638 231 605 306 569 307 Q546 310 524 298 L460 403 Q438 439 472 439 H590';
  function measuredPath(data) {
    const guide = document.createElementNS('http://www.w3.org/2000/svg','path');
    guide.setAttribute('d',data);
    return guide;
  }
  const rail = measuredPath(outline);
  const vessel = new Path2D(outline);
  const ink = new Path2D(liquid);
  const inkLength = measuredPath(liquid).getTotalLength();

  let ticket = 0;
  let active = false;
  const listeners = new AbortController();

  function render() {
    ticket = 0;
    const distance = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const p = clamp(scrollY/distance);
    const flying = p < .999;
    root.classList.toggle('logo-in-flight', flying);
    canvas.hidden = !flying;
    if (!flying) return;

    const width = document.documentElement.clientWidth;
    const height = innerHeight;
    const mobile = width <= 720;
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
    const travel = beat(p,0,.39);
    const pull = beat(p,.29,.61);
    const dock = beat(p,mobile ? .79 : .74,.96);
    const point = rail.getPointAtLength(mix(280,525,travel));
    const scale = scaleBetween(scaleBetween(closeScale,portraitScale,pull),endScale,dock);

    // Bank through the rounded heel, then crane away from the baseline.
    // With the pull complete the entire silhouette holds still through the next beat.
    const bank = (.16 - .54*travel)*(1-pull);
    const pivotX = mix(point.x,622,pull), pivotY = mix(point.y,247,pull);
    const framedX = mix(width*(.82-.22*travel),width*.5,pull);
    const framedY = mix(height*(.50+.13*travel),height*.48,pull);
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
    const fill = beat(p,.18,.59);
    if (fill > 0) {
      context.lineWidth = 20;
      if (fill < 1) context.setLineDash([inkLength*fill,inkLength+2]);
      context.stroke(ink);
      context.setLineDash([]);
    }

    // The print takes over at display size. Reveal the letters from the A outward.
    const letters = beat(p,.86,.985);
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
    root.style.setProperty('--directory-in',String(beat(p,.905,.988)));
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
      scrollTo({top:track.offsetHeight-stage.offsetHeight,behavior:'smooth'});
    },options);
    reduced.addEventListener('change',leave,options);
    addEventListener('pagehide',leave,options);
  }
  if (image.complete) start();
  else image.addEventListener('load',start,{once:true});
})();
