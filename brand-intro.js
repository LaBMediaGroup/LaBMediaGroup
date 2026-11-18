// Native scroll pulls the camera back from the left shoulder of the printed A.
// The last frame uses the exact rendered rectangle of the everyday wordmark.
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
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const pixels = Math.round(width*ratio), rows = Math.round(height*ratio);
    if (canvas.width !== pixels || canvas.height !== rows) {
      canvas.width = pixels;
      canvas.height = rows;
    }
    context.setTransform(ratio,0,0,ratio,0,0);
    context.clearRect(0,0,width,height);
    const target = image.getBoundingClientRect();
    const endScale = target.width/1165;
    const portraitScale = Math.min(width*.59/432,height*.56/498);
    const closeScale = Math.max(width/95,height/73);
    const pull = smooth(p/.63);
    const dock = smooth((p-.56)/.39);
    const scale = scaleBetween(scaleBetween(closeScale,portraitScale,pull),endScale,dock);
    // Travel from the sloping contour to the centre of the whole beaker.
    const pivotX = mix(537,622,pull), pivotY = mix(220,249,pull);
    const centreX = mix(mix(width*.82,width*.5,pull),target.left+622*endScale,dock);
    const centreY = mix(mix(height*.48,height*.44,pull),target.top+249*endScale,dock);
    const x = centreX-pivotX*scale, y = centreY-pivotY*scale;
    const reveal = smooth((p-.76)/.22);
    root.style.setProperty('--directory-in',String(smooth((p-.83)/.15)));
    context.imageSmoothingQuality = 'high';
    // Clear gutters at x=390 and x=850 isolate the beaker without a redraw.
    function drawStrip(left,end) {
      context.drawImage(image,left,0,end-left,498,x+left*scale,y,(end-left)*scale,498*scale);
    }
    drawStrip(390,850);
    context.globalAlpha = reveal;
    drawStrip(0,390);
    drawStrip(850,1165);
    context.globalAlpha = 1;
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
