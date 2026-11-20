// A regular link owns navigation, including Back, modified clicks and no-script use.
(() => {
  const key = 'lab-tool-surface';
  const quiet = () => matchMedia('(prefers-reduced-motion:reduce)').matches ||
    document.documentElement.classList.contains('motion-paused');
  document.addEventListener('click', e => {
    const link = e.target.closest('.instrument-link,.instrument-dock a,.tool-go');
    if (!link || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || quiet()) return;
    link.classList.add('opening-tile');
    const r = link.getBoundingClientRect();
    const entry = {path:link.pathname,t:Date.now(),x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height};
    try {sessionStorage.setItem(key,JSON.stringify(entry));} catch {}
  });
  addEventListener('pageshow',()=>document.querySelectorAll('.opening-tile').forEach(el=>el.classList.remove('opening-tile')));
  if (!document.body.dataset.instrument) return;
  let entry;
  try {entry=JSON.parse(sessionStorage.getItem(key));sessionStorage.removeItem(key);} catch {}
  if (!entry || quiet() || entry.path!==location.pathname || Date.now()-entry.t>10000) return;
  const root=document.documentElement;
  root.style.setProperty('--tile-x',entry.x+'px');
  root.style.setProperty('--tile-y',entry.y+'px');
  root.style.setProperty('--tile-radius',Math.min(entry.w,entry.h)/2+'px');
  root.classList.add('tool-opening');
  // Browsers without cross-document snapshots reveal the actual controls in place.
  if (!('onpagereveal' in window)) {
    requestAnimationFrame(() => {
      const main=document.querySelector('main'), rect=main.getBoundingClientRect();
      const at=' at '+(entry.x-rect.x)+'px '+(entry.y-rect.y)+'px)';
      main.animate([{clipPath:'circle('+Math.min(entry.w,entry.h)/2+'px'+at},
        {clipPath:'circle('+Math.hypot(innerWidth,innerHeight)+'px'+at}],{duration:260,easing:'ease-out'});
    });
  }
  addEventListener('pageshow',()=>setTimeout(()=>root.classList.remove('tool-opening'),700),{once:true});
})();
