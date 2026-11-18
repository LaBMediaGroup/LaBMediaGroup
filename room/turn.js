(() => {
  if (window !== window.top) return;
  const link = document.querySelector('[data-turn]');
  const atWindow = link.dataset.turn === 'events';
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const resting = .105;
  const start = atWindow ? resting : 1;
  const end = atWindow ? 1 : resting;
  let position = start, drag, frame, locked = false, turning = false, offset = 0;
  function destination() {
    const url = new URL(atWindow ? '../events.html' : 'window.html',document.baseURI);
    const current = new URLSearchParams(location.search);
    for (const key of ['place','minute','date']) if(current.has(key)) url.searchParams.set(key,current.get(key));
    if(atWindow) url.searchParams.set('elevation',selectedElevation().toFixed(3));
    else url.hash = 'planner';
    return url.href;
  }
  const stage = document.createElement('div'), rig = document.createElement('div');
  stage.className = 'room-stage'; rig.className = 'room-rig';
  const live = document.createElement('iframe');
  live.title = atWindow ? 'Events wall' : 'Golden Hour window';
  live.inert = true; live.tabIndex = -1; live.setAttribute('aria-hidden','true');
  const side = document.createElement('div');
  side.className = atWindow ? 'room-board' : 'scene';
  side.append(live);
  let front;
  if(atWindow) {
    front = document.querySelector('.scene');
    front.before(stage); rig.append(front,side);
  } else {
    stage.classList.add('reverse-stage');
    document.body.prepend(stage);
    front = document.createElement('div'); front.className = 'room-board live-board';
    rig.append(side,front);
  }
  stage.append(rig);
  function prepare() {
    link.href = destination();
    if(live.getAttribute('src') !== link.href) live.src = link.href;
  }
  prepare();
  // Relight the existing wall document without reloading it during a scrub.
  if(atWindow) {
    document.addEventListener('input',()=>live.contentWindow?.postMessage({roomElevation:selectedElevation()},'*'));
    document.addEventListener('change',()=>live.contentWindow?.postMessage({roomElevation:selectedElevation()},'*'));
  }
  function paint(p) {
    position = Math.max(resting,Math.min(1,p));
    rig.style.setProperty('--yaw',position*90+'deg');
    stage.style.setProperty('--radius',innerWidth/2+'px');
    if(atWindow) document.body.style.setProperty('--room-controls',Math.max(0,1-(position-resting)*4));
  }
  function begin() {
    if(turning)return;
    turning=true;
    if(!atWindow){
      offset=scrollY;
      const surface=document.querySelector('.board-surface');
      document.body.style.minHeight=document.documentElement.scrollHeight+'px';
      front.append(surface);surface.style.transform='translateY(-'+offset+'px)';
      stage.classList.add('engaged');
    }
  }
  function reset(){
    if(!atWindow && turning){
      const surface=front.querySelector('.board-surface');
      if(surface){stage.after(surface);surface.style.transform=''}
      stage.classList.remove('engaged');document.body.style.minHeight='';scrollTo(0,offset);
    }
    turning=false;locked=false;paint(start);
  }
  function settle(target) {
    cancelAnimationFrame(frame);
    const from=position,time=performance.now(),duration=quiet.matches?0:190+320*Math.abs(target-from);
    const step=now=>{
      const t=duration?Math.min(1,(now-time)/duration):1;
      paint(from+(target-from)*(1-(1-t)**3));
      if(t<1)frame=requestAnimationFrame(step);
      else if(target===end)location.assign(destination());else reset();
    };
    frame=requestAnimationFrame(step);
  }
  const area=atWindow?stage:document;
  area.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0||locked||document.querySelector('dialog[open]')||e.target.closest('input,select,summary,a'))return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,active:false};
  });
  document.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y,distance=atWindow?-dx:dx;
    if(!drag.active){
      if(Math.abs(dy)>8 && Math.abs(dy)*1.6>=Math.abs(dx)){drag=null;return}
      if(distance<16||distance<Math.abs(dy)*1.8)return;
      drag.active=true;begin();stage.setPointerCapture(e.pointerId);
    }
    paint(start+(end-start)*distance/Math.min(680,innerWidth*.8));
  });
  let suppressClick=false;
  document.addEventListener('pointerup',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const active=drag.active;drag=null;
    if(!active)return;
    suppressClick=true;setTimeout(()=>suppressClick=false,0);
    locked=Math.abs(position-start)>.25;settle(locked?end:start);
  });
  document.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation()}},true);
  document.addEventListener('pointercancel',()=>{if(drag?.active)settle(start);drag=null});
  link.onclick=e=>{
    link.href=destination();
    if(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey||quiet.matches)return;
    e.preventDefault();if(!locked){locked=true;begin();settle(end)}
  };
  if(atWindow)side.onclick=()=>{if(!locked){locked=true;begin();settle(end)}};
  addEventListener('resize',()=>paint(position));
  addEventListener('pageshow',reset);paint(start);
})();
