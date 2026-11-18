(() => {
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const home = document.querySelector('#directory');
  const mark = home?.querySelector('h1 img') ??
    document.querySelector('header img[src$="TheLaB-mark.png"]');
  const key = 'lab-logo-handoff';
  const enabled = () => !quiet.matches && !document.documentElement.classList.contains('motion-paused');
  const waterModule = new URL('beaker-water.js',document.currentScript.src).href;
  let overlay;
  let animation = 0;

  function restore() {
    cancelAnimationFrame(animation);
    animation = 0;
    overlay?.remove();
    overlay = null;
    if (mark) mark.style.removeProperty('opacity');
  }

  function resumeWater(water) {
    if (!enabled() || !mark?.naturalWidth) return;
    restore();
    const box = mark.getBoundingClientRect();
    if (!box.width || box.bottom < 0 || box.top > innerHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1165;
    canvas.height = 498;
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position:'fixed', pointerEvents:'none', zIndex:'100',
      left:box.left+'px', top:box.top+'px', width:box.width+'px', height:box.height+'px',
      filter:getComputedStyle(mark).filter
    });
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    document.body.append(canvas);
    overlay = canvas;
    mark.style.opacity = '0';
    let previous = performance.now();
    function draw(now) {
      water.step(Math.max(0,(now-previous)/1000));
      previous = now;
      if (!water.energy || !enabled()) { restore(); return; }
      ctx.clearRect(0,0,1165,498);
      ctx.drawImage(mark,0,0,1165,498);
      water.repaintSurface(ctx);
      animation=requestAnimationFrame(draw);
    }
    draw(previous);
  }

  function reset() { restore(); }
  addEventListener('pagehide',reset);
  addEventListener('pageswap',reset);
  addEventListener('resize',reset,{passive:true});
  addEventListener('scroll',reset,{passive:true});
  addEventListener('touchmove',reset,{passive:true});
  quiet.addEventListener('change',reset);

  if (home) {
    const links = [...document.querySelectorAll('nav a,footer a')];
    let lastLink, lastTime = -Infinity;
    links.forEach(link => {
      const direction = link.closest('section') === home.querySelector('nav section') ? 1 : -1;
      function prime(event) {
        if (!enabled() || document.documentElement.classList.contains('logo-in-flight')) return;
        const now = performance.now();
        // One touch can generate down, focus and click on the same link.
        if (lastLink === link && now-lastTime < 240) return;
        lastLink = link;
        lastTime = now;
        mark?.dispatchEvent(new CustomEvent('lab-nav-wave',{detail:{
          direction, touch:event.pointerType === 'touch'
        }}));
      }
      link.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') prime(e); });
      link.addEventListener('focus',prime);
      link.addEventListener('pointerdown',prime);
      link.addEventListener('click', e => {
        if (!enabled() || link.origin !== location.origin || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const handoff = {path:link.pathname,sign:direction,time:Date.now()};
        mark?.dispatchEvent(new CustomEvent('lab-wave-handoff',{detail:handoff}));
        try { sessionStorage.setItem(key,JSON.stringify(handoff)); } catch {}
      });
    });
  } else {
    let handoff;
    try {
      handoff = JSON.parse(sessionStorage.getItem(key));
      sessionStorage.removeItem(key);
    } catch {}
    if (!enabled() || handoff?.path !== location.pathname || Date.now()-handoff.time>15000) return;
    async function receive() {
      const box = mark?.getBoundingClientRect();
      if (box?.width && box.bottom > 0 && box.top < innerHeight) {
        try {
          const {BeakerWater} = await import(waterModule);
          const water = new BeakerWater(handoff.water);
          if (!handoff.water) water.nudge(handoff.sign === -1 ? -1 : 1,2.4);
          resumeWater(water);
        } catch { /* The static mark remains available offline. */ }
      } else {
        // Deep links can land below the masthead. Carry the beat to the
        // destination itself, including the anchored planner and viewfinder.
        const target = document.getElementById(location.hash.slice(1)) ?? document.querySelector('main h1,h1');
        target?.animate?.([{opacity:.72},{opacity:1}],{duration:450,easing:'ease-out'});
      }
    }
    if (mark && !mark.complete) mark.addEventListener('load',receive,{once:true});
    else receive();
  }
})();
