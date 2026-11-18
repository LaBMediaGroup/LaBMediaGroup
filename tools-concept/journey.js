// Native scrolling supplies the timeline. The existing tabs own tool state.
(() => {
  const stage = document.querySelector('main#tools');
  if (!stage) return;
  const frame = document.querySelector('#frame');
  const light = document.querySelector('#light');
  const frameTab = document.querySelector('#tab-frame');
  const lightTab = document.querySelector('#tab-light');
  const motion = document.querySelector('#motion');
  const disc = document.querySelector('#sun');
  let lastScene = 'light';
  let pending = false;
  let manual = false;
  const track = document.createElement('div');
  track.className = 'scene-track';
  stage.before(track);
  track.append(stage);
  const portal = document.createElement('div');
  portal.className = 'sun-portal';
  portal.setAttribute('aria-hidden', 'true');
  stage.querySelector('.surface').append(portal);
  const film = frame.querySelector('video');
  const opening = film.cloneNode(false);
  opening.removeAttribute('class');
  opening.removeAttribute('src');
  opening.muted = true;
  portal.append(opening);
  const sceneTabs = stage.querySelector('[role=tablist]');
  let syncing = false;
  function select(tab) {
    syncing = true;
    tab.click();
    syncing = false;
  }
  function clearPortal() {
    portal.hidden = true;
    opening.pause();
    stage.classList.remove('traveling');
  }
  function update() {
    pending = false;
    if (manual || motion.getAttribute('aria-pressed') === 'true') {
      clearPortal();
      return;
    }
    const distance = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const progress = Math.max(0, Math.min(1, -track.getBoundingClientRect().top / distance));
    const destination = progress >= .98 ? 'frame' : 'light';
    if (destination !== lastScene) {
      stage.classList.add('scroll-cut');
      if (destination === 'frame' && opening.readyState >= 2) {
        const matchTime = opening.currentTime;
        if (film.readyState >= 1) film.currentTime = matchTime;
        else film.addEventListener('loadedmetadata', () => { film.currentTime = matchTime; }, { once: true });
      }
      select(destination === 'frame' ? frameTab : lightTab);
      stage.classList.remove('scroll-cut');
      lastScene = destination;
    }
    if (progress <= .005 || progress >= .98 || light.hidden) { clearPortal(); return; }
    portal.hidden = false;
    stage.classList.add('traveling');
    const bounds = stage.getBoundingClientRect();
    const sun = disc.getBoundingClientRect();
    const x = sun.left + sun.width / 2 - bounds.left;
    const y = sun.top + sun.height / 2 - bounds.top;
    const radius = Math.hypot(Math.max(x, bounds.width-x), Math.max(y, bounds.height-y));
    const t = progress / .98;
    portal.style.clipPath = 'circle(' + (sun.width/2 + radius*t*t) + 'px at ' + x + 'px ' + y + 'px)';
    portal.style.opacity = Math.min(1, t*7);
    if (!opening.hasAttribute('src')) opening.src = film.dataset.src;
    if (opening.paused && !document.hidden) opening.play().catch(() => {});
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  function takeControl() {
    if (syncing) return;
    manual = true;
    clearPortal();
    // Collapse the travel distance once the visitor explicitly picks a tool.
    track.classList.add('direct');
  }
  sceneTabs.addEventListener('click', takeControl);
  sceneTabs.addEventListener('keydown', e => { if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Home','End'].includes(e.key)) takeControl(); });
  motion.addEventListener('click', schedule);
  new MutationObserver(schedule).observe(motion,{attributes:true,attributeFilter:['aria-pressed']});
  document.addEventListener('visibilitychange', () => document.hidden ? opening.pause() : schedule());
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  update();
})();

// A small, keyboard-operable scroll cue also gives touch users a direct jump.
(() => {
  const track = document.querySelector('.scene-track');
  if (!track) return;
  const cue = document.createElement('button');
  cue.className = 'scene-next';
  cue.type = 'button';
  cue.setAttribute('aria-label','Scroll to the interior framing tool');
  cue.textContent = '↓';
  track.querySelector('main').append(cue);
  cue.onclick = () => {
    const stage = track.querySelector('main');
    scrollTo({top:track.getBoundingClientRect().bottom + scrollY - stage.offsetHeight,behavior:'smooth'});
  };
})();
