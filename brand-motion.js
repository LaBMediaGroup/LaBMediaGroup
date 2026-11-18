// Bend only the liquid stroke in the supplied wordmark. Each column comes
// from the original image, so the vessel and lettering keep their exact shape.
(() => {
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const home = document.querySelector('#directory');
  const mark = home?.querySelector('h1 img') ??
    document.querySelector('header img[src$="TheLaB-mark.png"]');
  const key = 'lab-logo-handoff';
  const enabled = () => !quiet.matches && !document.documentElement.classList.contains('motion-paused');
  let overlay;
  let animation = 0;
  let intro;
  let direction = 1;

  function restore() {
    cancelAnimationFrame(animation);
    animation = 0;
    overlay?.remove();
    overlay = null;
    if (mark) mark.style.removeProperty('opacity');
  }

  function ripple(sign, strength = 1, arrival = false) {
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
    const start = performance.now();
    function draw(now) {
      const t = Math.max(0,(now-start)/800);
      if (t >= 1 || !enabled()) { restore(); return; }
      if (arrival) {
        // Lift the flat mark into its resting place. A swipe finishes the
        // movement immediately, even on phones where the directory fits.
        const remaining = (1-t)**3;
        const lift = innerWidth <= 720 ? Math.min(86, innerHeight*.1) : 22;
        canvas.style.transform = 'translateY('+lift*remaining+'px) scale('+(1+.035*remaining)+')';
      }
      ctx.clearRect(0,0,1165,498);
      ctx.drawImage(mark,0,0,1165,498);
      const left = 533, width = 153, top = 225, height = 98;
      ctx.clearRect(left,top,width,height);
      for (let column=0; column<width; column++) {
        const x = column / (width-1);
        const envelope = Math.sin(Math.PI*x)**2 * Math.sin(Math.PI*t) * (1-t);
        const dy = strength * 24 * envelope * Math.sin(2*Math.PI*(x-sign*t*1.4));
        ctx.drawImage(mark,left+column,top,1,height,left+column,top+dy,1,height);
      }
      animation=requestAnimationFrame(draw);
    }
    draw(start);
  }

  function finishIntro() { intro?.finish(); intro = null; }
  function reset() { finishIntro(); restore(); }
  addEventListener('pagehide',reset);
  addEventListener('pageswap',reset);
  addEventListener('resize',reset,{passive:true});
  addEventListener('scroll',reset,{passive:true});
  addEventListener('touchmove',reset,{passive:true});
  quiet.addEventListener('change',reset);

  if (home) {
    const links = [...document.querySelectorAll('nav a,footer a')];
    links.forEach((link,index) => {
      function prime() {
        finishIntro();
        direction = index % 2 ? -1 : 1;
        ripple(direction);
      }
      link.addEventListener('pointerenter', e => { if(e.pointerType !== 'touch') prime(); });
      link.addEventListener('focus',prime);
      link.addEventListener('pointerdown',prime);
      link.addEventListener('click', e => {
        if (!enabled() || link.origin !== location.origin || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        try { sessionStorage.setItem(key,JSON.stringify({path:link.pathname,sign:direction,time:Date.now()})); } catch {}
      });
    });
    function arrive() {
      if (!enabled() || !mark.animate) return;
      const reload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
      // The directory is always live. A gesture settles its short entrance.
      intro = home.querySelector('nav').animate([
        {opacity:.45, transform:'translateY('+ (reload ? 6 : 14) +'px)'},
        {opacity:1, transform:'none'}
      ],{duration:reload ? 440 : 720,easing:'cubic-bezier(.16,1,.3,1)'});
      ripple(reload ? -1 : 1,1.5,true);
    }
    addEventListener('wheel',finishIntro,{passive:true});
    if (mark.complete) arrive(); else mark.addEventListener('load',arrive,{once:true});
  } else {
    let handoff;
    try {
      handoff = JSON.parse(sessionStorage.getItem(key));
      sessionStorage.removeItem(key);
    } catch {}
    if (!enabled() || handoff?.path !== location.pathname || Date.now()-handoff.time>15000) return;
    function receive() {
      const box = mark?.getBoundingClientRect();
      if (box?.width && box.bottom > 0 && box.top < innerHeight) ripple(handoff.sign,1.7);
      else {
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
