(() => {
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const home = document.querySelector('#directory');
  const mark = home?.querySelector('h1 img') ??
    document.querySelector('header img[src$="TheLaB-mark.png"]');
  const key = 'lab-logo-handoff';
  const enabled = () => !quiet.matches && !document.documentElement.classList.contains('motion-paused');
  const waterModule = new URL('beaker-water.js?v=2',document.currentScript.src).href;
  let drawing, animation = 0;
  let inactive = false;

  function stop() {
    cancelAnimationFrame(animation);
    drawing?.remove();
    drawing = null;
    document.documentElement.classList.remove('wave-arrival');
  }
  addEventListener('pagehide',()=>{ inactive = true; stop(); });
  addEventListener('pageshow',()=>{ inactive = false; });
  quiet.addEventListener('change',stop);

  if (home) {
    const links = [...document.querySelectorAll('nav a,footer a')];
    let lastLink, lastTime = -Infinity;
    let departing;
    function remember(link,direction,activate = false) {
      const handoff = {path:link.pathname,sign:direction,time:Date.now()};
      mark?.dispatchEvent(new CustomEvent('lab-wave-handoff',{detail:handoff}));
      if (activate && handoff.water && Object.values(handoff.water).every(value=>value === 0)) {
        // Keyboard activation can follow a long, already settled focus.
        mark.dispatchEvent(new CustomEvent('lab-nav-wave',{detail:{direction,touch:true}}));
        mark.dispatchEvent(new CustomEvent('lab-wave-handoff',{detail:handoff}));
      }
      try { sessionStorage.setItem(key,JSON.stringify(handoff)); } catch {}
    }
    // Some loads span several more painted frames after click. Capture the
    // visible crest again at the actual document swap when supported.
    addEventListener('pageswap',event=>{
      if (departing && event.activation?.entry?.url === departing.link.href) {
        remember(departing.link,departing.direction);
      }
    });
    addEventListener('pageshow',()=>{ departing?.link.classList.remove('departing'); departing = null; });
    links.forEach(link => {
      const direction = link.closest('section') === home.querySelector('nav section') ? 1 : -1;
      function prime(event) {
        if (!enabled() || document.documentElement.classList.contains('logo-in-flight')) return;
        const now = performance.now();
        // One touch can generate down, focus and click on the same link.
        if (lastLink === link && now-lastTime < 240) return;
        if (lastLink === link && event.type === 'pointerdown') {
          const state = {};
          mark?.dispatchEvent(new CustomEvent('lab-wave-handoff',{detail:state}));
          if (state.water && Math.abs(state.water.surge)+Math.abs(state.water.velocity)>.08) {
            lastTime = now;
            return;
          }
        }
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
        if (e.defaultPrevented || e.button !== 0 || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
        if (link.matches(".instrument-link")) link.classList.add("departing");
        if (link.matches('.instrument-link.wind')) {
          const {left,top,width,height} = link.querySelector('svg').getBoundingClientRect();
          try { sessionStorage.setItem('lab-wind-origin', JSON.stringify({
            x:left+width/2, y:top+height/2, time:Date.now()
          })); } catch {}
        }
        departing = {link,direction};
        remember(link,direction,true);
      });
    });
  } else {
    let handoff;
    try {
      handoff = JSON.parse(sessionStorage.getItem(key));
      sessionStorage.removeItem(key);
    } catch {}
    if (!enabled() || handoff?.path !== location.pathname || Date.now()-handoff.time>15000) return;
    if (!mark) return;
    document.documentElement.classList.add('wave-arrival');
    async function receive() {
      try {
        const {BeakerWater,mountWaterMark} = await import(waterModule);
        if (inactive || !enabled() || !mark.naturalWidth) { stop(); return; }
        const water = new BeakerWater(handoff.water);
        if (!handoff.water) water.nudge(handoff.sign === -1 ? -1 : 1,2.4);
        const elapsed = Math.max(0,(Date.now()-(handoff.frameTime ?? handoff.time))/1000);
        if (elapsed > 2) { stop(); return; }
        water.step(elapsed);
        if (!water.energy) { stop(); return; }
        drawing = mountWaterMark(mark);
        if (!drawing) { stop(); return; }
        let previous = performance.now();
        function draw(now) {
          water.step(Math.max(0,(now-previous)/1000));
          previous = now;
          if (!water.energy || !enabled()) { stop(); return; }
          drawing.draw(water);
          animation = requestAnimationFrame(draw);
        }
        draw(previous);
      } catch { stop(); }
    }
    if (mark.complete) receive();
    else {
      mark.addEventListener('load',receive,{once:true});
      mark.addEventListener('error',stop,{once:true});
    }
  }
})();
