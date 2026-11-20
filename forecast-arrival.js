// The tile travels in viewport coordinates. Only the measured breeze turns it.
(() => {
  let origin;
  try {
    origin = JSON.parse(sessionStorage.getItem('lab-wind-origin'));
    sessionStorage.removeItem('lab-wind-origin');
  } catch {}
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const paused = () => quiet.matches || document.documentElement.classList.contains('motion-paused');
  if (!origin || Date.now()-origin.time > 10000 || location.hash !== '#wxSceneStage' || paused()) return;
  const lines = document.querySelector('#forecastWind');
  let weather;
  let landed = false;
  function release() {
    if (!landed || paused() || !weather) return;
    const speed = weather.wind_speed_10m, from = weather.wind_direction_10m;
    if (!Number.isFinite(speed) || !Number.isFinite(from) || speed <= 0) return;
    // CSS angles start east. Forecast bearings start north and name the source.
    const angle = (from + 270) % 360 - 180;
    const radians = angle * Math.PI / 180;
    const strength = Math.min(speed / 24, 1);
    const travel = 8 + 58 * strength;
    const turn = 'rotate('+angle+'deg)';
    const flow = 'translate('+Math.cos(radians)*travel+'px,'+Math.sin(radians)*travel+'px) '+turn;
    lines.hidden = false;
    lines.animate([
      {transform:'scale(.94,1.05)',opacity:.65},
      {transform:turn+' scale(1.08,.95)',offset:.42,opacity:.9},
      {transform:flow+' scale('+(1+strength*.55)+',.8)',opacity:0}
    ],{duration:490-170*strength,easing:'ease-out'}).onfinish = () => { lines.hidden = true; };
  }
  addEventListener('lab:forecast-wind',e => { weather=e.detail; release(); },{once:true});
  function arrive() {
    if (paused()) return;
    lines.hidden = false;
    const box = lines.getBoundingClientRect();
    const traveler = lines.cloneNode(true);
    traveler.removeAttribute('id');
    Object.assign(traveler.style, {
      position:'fixed', left:box.left+'px', top:box.top+'px', zIndex:100,
      pointerEvents:'none', color:getComputedStyle(lines).color, overflow:'visible'
    });
    document.body.append(traveler);
    lines.hidden = true;
    const dx = origin.x-box.left-box.width/2, dy = origin.y-box.top-box.height/2;
    traveler.animate([
      {transform:'translate('+dx+'px,'+dy+'px) scale(.84,1.14)'},
      {transform:'translate('+dx*.46+'px,'+(dy*.4-18)+'px) rotate(-9deg) scale(1.28,.78)',offset:.42},
      {transform:'translate(0,0) scale(.94,1.05)'}
    ],{duration:240,easing:'cubic-bezier(.18,.7,.3,1)'}).onfinish = () => {
      lines.hidden = true;
      traveler.remove();
      landed = true;
      release();
    };
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#wxSceneStage').scrollIntoView({behavior:'instant',block:'start'});
    requestAnimationFrame(arrive);
  },{once:true});
})();
