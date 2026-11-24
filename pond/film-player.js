/* One decoder feeds both the phosphor screen and the production sheet. */
window.createFilmPlayer = function createFilmPlayer(films, options) {
  'use strict';
  const section = document.getElementById('films');
  const canvas = document.getElementById('filmPicture');
  const ctx = canvas.getContext('2d', { alpha: false });
  const fallback = document.getElementById('filmFallback');
  const details = document.getElementById('filmDetails');
  const title = document.getElementById('filmTitle');
  const status = document.getElementById('filmStatus');
  const playButton = document.getElementById('filmPlay');
  const soundButton = document.getElementById('filmSound');
  const volumePanel = document.getElementById('filmVolumePanel');
  const volumeSlider = document.getElementById('filmVolume');
  const level = document.getElementById('filmLevel');
  const video = document.createElement('video');
  video.className = 'film-decoder';
  video.muted = video.defaultMuted = true;
  video.loop = video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-hidden', 'true');
  section.append(video);

  const poster = new Image();
  const width = canvas.width;
  const height = canvas.height;
  const vignette = ctx.createRadialGradient(320, 228, 112, 320, 232, 410);
  vignette.addColorStop(0, 'rgba(0,12,10,0)');
  vignette.addColorStop(1, 'rgba(0,12,10,.53)');
  const lowerThird = ctx.createLinearGradient(0, 306, 0, 480);
  lowerThird.addColorStop(0, 'rgba(3,11,9,0)');
  lowerThird.addColorStop(0.5, 'rgba(3,11,9,.78)');
  lowerThird.addColorStop(1, 'rgba(3,11,9,.84)');
  const snow = document.createElement('canvas');
  snow.width = 128;
  snow.height = 96;
  const snowCtx = snow.getContext('2d');
  const grain = snowCtx.createImageData(snow.width, snow.height);
  for (let p = 0; p < grain.data.length; p += 4) {
    const luma = Math.floor(22 + Math.random() * 158);
    grain.data.set([luma, luma + 6, luma + 1, 255], p);
  }
  snowCtx.putImageData(grain, 0, 0);

  let index = 0, channelLoaded = false, inView = false, inSheet = false;
  let prefersPlayback = !options.reducedMotion, frame = 0, lastDraw = -Infinity;
  let tunedAt = -Infinity, volumeReadoutUntil = 0, boundWorld;
  let lastAudibleVolume = Number(volumeSlider.value) / 100;
  let audioContext, speakerGain, soundChosen=false;
  const previewButton=document.getElementById('filmPreview');
  const viewer=window.createFilmViewer(options.world,()=>{syncPlayback();requestDraw();},options.captureReturn);
  video.volume = lastAudibleVolume;

  // On systems that reserve native volume for the device buttons, adjust a
  // same-origin Web Audio gain. Connect it only after a visitor's gesture.
  function setLevel(value) {
    video.volume = value;
    if (!speakerGain && Math.abs(video.volume - value) > .005) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) {
        audioContext = new Context();
        speakerGain = audioContext.createGain();
        audioContext.createMediaElementSource(video).connect(speakerGain);
        speakerGain.connect(audioContext.destination);
      }
    }
    if (speakerGain) {
      speakerGain.gain.value = value;
      if (audioContext.state !== 'running') audioContext.resume().catch(() => {});
    }
  }
  function syncSound() {
    const value = speakerGain ? speakerGain.gain.value : video.volume;
    if (value > 0) lastAudibleVolume = value;
    const audible = !video.muted && value > 0;
    canvas.filmAudible = audible;
    canvas.filmVolume = audible ? value : 0;
    const percent = Math.round(value * 100);
    volumeSlider.value = String(audible ? percent : 0);
    level.value = volumeSlider.value + '%';
    soundButton.setAttribute('aria-pressed', String(audible));
    soundButton.title = audible ? 'Mute TV' : 'Turn TV sound on';
    volumeSlider.setAttribute('aria-valuetext', level.value);
  }
  function showVolume() {
    syncSound();
    volumePanel.hidden = false;
    volumeReadoutUntil = performance.now() + 1300;
    requestDraw();
  }
  function toggleSound() {
    soundChosen=true;
    const enable = soundButton.getAttribute('aria-pressed') !== 'true';
    if (enable) setLevel(lastAudibleVolume);
    video.muted = !enable;
    showVolume();
  }
  soundButton.addEventListener('click', toggleSound);
  function adjustVolume(value) {
    soundChosen=true;
    setLevel(value);
    video.muted = value === 0;
    showVolume();
  }
  volumeSlider.addEventListener('input', () => adjustVolume(Number(volumeSlider.value) / 100));
  video.addEventListener('volumechange', syncSound);
  canvas.frameRevision = 0;

  function current() { return films[index]; }
  function channelNumber() { return String(index + 3).padStart(2, '0'); }
  function syncLabels() {
    const film = current();
    canvas.channelIndex = index;
    title.textContent = film.title;
    document.getElementById('filmSurface').hidden=index!==films.length-1;
    document.getElementById('filmNext').setAttribute('aria-label',index===films.length-1?'Surface to Contact':'Next television');
    document.getElementById('filmPrev').setAttribute('aria-label',index===0?'Return to pond reflection':'Previous television');
    status.textContent = 'Channel ' + channelNumber() + ', ' + film.title + ', ' + film.year;
    details.setAttribute('aria-label','Production sheet for '+film.title);
    fallback.setAttribute('aria-label','Watch '+film.title+', full film');
    playButton.setAttribute('aria-label','Watch '+film.title+', full film');
    previewButton.setAttribute('aria-label',prefersPlayback?'Pause gallery preview':'Play gallery preview');
    previewButton.title=previewButton.getAttribute('aria-label');
    previewButton.textContent=prefersPlayback?'Ⅱ':'▷';
  }
  function bindWorld() {
    const world = options.world();
    if (!world || !world.setFilmSource || world === boundWorld) return;
    world.setFilmSource(canvas,films);
    boundWorld = world;
    section.classList.add('has-tv');
  }
  function loadChannel() {
    const film = current();
    tunedAt = performance.now();
    video.poster = film.img;
    poster.src = film.img;
    video.src = film.vid;
    channelLoaded = true;
  }
  function fitMedia(source, sw, sh, cover) {
    const scale = (cover ? Math.max : Math.min)(width / sw, height / sh);
    const w = sw * scale, h = sh * scale;
    ctx.drawImage(source, (width - w) / 2, (height - h) / 2, w, h);
  }
  function osdText(text, x, y, font, color) {
    ctx.font = font;
    ctx.shadowColor = '#052b21';
    ctx.shadowBlur = 4;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y, width - 2 * x);
    ctx.shadowBlur = 0;
  }
  function draw(now) {
    const elapsed = now - tunedAt, film = current();
    ctx.fillStyle = '#0b1614';
    ctx.fillRect(0, 0, width, height);
    if (video.readyState >= 2 && video.videoWidth && (prefersPlayback || video.currentTime > 0)) {
      fitMedia(video, video.videoWidth, video.videoHeight, false);
    } else if (poster.complete && poster.naturalWidth) {
      fitMedia(poster, poster.naturalWidth, poster.naturalHeight, true);
    }
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0,9,6,.10)';
    for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 1);

    if (!options.reducedMotion && elapsed < 430) {
      const t = elapsed / 430;
      ctx.save();
      ctx.globalAlpha = 0.63 * (1 - t);
      if (Math.floor(elapsed / 44) % 2) {
        ctx.translate(width, height);
        ctx.scale(-1, -1);
      }
      ctx.drawImage(snow, 0, 0, width, height);
      ctx.restore();
      ctx.fillStyle = 'rgba(150,208,179,' + (0.36 * (1 - t)) + ')';
      ctx.fillRect(0, t * (height + 52) - 52, width, 48);
    }

    osdText('CH ' + channelNumber(), 34, 62, 'bold 32px monospace', '#c2f7c7');
    if (elapsed < 5600 || options.reducedMotion || !prefersPlayback) {
      ctx.fillStyle = lowerThird;
      ctx.fillRect(0, 306, width, height - 306);
      const type = Math.max(0, Math.floor((elapsed - 200) / 46));
      const words = options.reducedMotion ? film.title : film.title.slice(0, type);
      osdText(words, 34, 388, 'bold 40px monospace', '#f2f3dc');
      // Alternate the festival and award once while the title is visible.
      const fact = film.cred[Math.min(film.cred.length - 1, elapsed > 3000 ? 1 : 0)][1];
      osdText(film.year + ' / ' + fact, 35, 429, 'bold 22px monospace', '#bee2c7');
    }
    if (now < volumeReadoutUntil) {
      osdText(video.muted ? 'MUTE' : 'VOL ' + volumeSlider.value, 34, 106, 'bold 27px monospace', '#c2f7c7');
    }
    canvas.drawnStation=index;
    canvas.frameRevision++;
  }
  function animate(now) {
    frame = 0;
    if (!inView || inSheet || viewer.open || document.hidden) return;
    if (now - lastDraw >= 1000 / 24) {
      lastDraw = now;
      draw(now);
    }
    if (now < volumeReadoutUntil + 64 || (prefersPlayback && !video.paused) || (!options.reducedMotion && now - tunedAt < 5700)) {
      frame = requestAnimationFrame(animate);
    }
  }
  function requestDraw() {
    if (frame || !inView || inSheet || viewer.open || document.hidden) return;
    lastDraw = -Infinity;
    frame = requestAnimationFrame(animate);
  }
  function syncPlayback() {
    if (viewer.open || document.hidden || (!inView && !inSheet)) {
      video.pause();
      cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    if (!channelLoaded) loadChannel();
    if (prefersPlayback) {
      video.play().then(requestDraw).catch(error => {
        // Failed autoplay leaves the poster and an explicit play affordance.
        if (error.name === 'NotAllowedError' && video.paused && !document.hidden && inView && prefersPlayback) {
          prefersPlayback = false;
          syncLabels();
        }
        requestDraw();
      });
    } else video.pause();
    requestDraw();
  }
  poster.addEventListener('load', requestDraw);
  video.addEventListener('loadeddata', requestDraw);
  video.addEventListener('playing', requestDraw);
  function visit(destination) {
    if (destination === index) return;
    index = destination;
    channelLoaded=false;
    if(inView || inSheet)loadChannel();
    syncLabels();
    if(inView)options.onTune();
    syncPlayback();
  }
  function change(direction) { options.seek(index+direction); }
  function open(origin) {
    if (!origin) details.focus({ preventScroll: true });
    options.onDetails(current(), origin);
  }
  details.addEventListener('click', () => open(details));
  document.getElementById('filmPrev').addEventListener('click', () => change(-1));
  document.getElementById('filmNext').addEventListener('click', () => change(1));
  function watch(trigger) {
    clearHover();
    video.pause();
    cancelAnimationFrame(frame);frame=0;
    viewer.openFilm(current(),trigger||playButton,lastAudibleVolume,soundChosen && video.muted);
  }
  playButton.addEventListener('click',()=>watch(playButton));
  previewButton.addEventListener('click', () => {
    prefersPlayback = !prefersPlayback;
    syncLabels();
    syncPlayback();
  });
  let gesture = null, skipClick = false;
  let hoverFrame=0, hoverX=0, hoverY=0;
  function clearHover() {
    cancelAnimationFrame(hoverFrame);
    hoverFrame=0;
    section.style.cursor='';
    section.removeAttribute('title');
  }
  section.addEventListener('pointerleave', clearHover);
  section.addEventListener('pointermove', event => {
    if (event.pointerType!=='mouse' || gesture) return;
    if (!event.target.matches('#films,.film-frame')) { clearHover(); return; }
    hoverX=event.clientX; hoverY=event.clientY;
    if (hoverFrame) return;
    hoverFrame=requestAnimationFrame(()=>{
      hoverFrame=0;
      const part=options.world()?.pickFilm?.(hoverX,hoverY);
      const hint=part==='volume' ? 'Click to mute or unmute. Drag to adjust volume.' :
        part==='knob' ? 'Next television' : part==='screen' ? 'Watch full film' :
        Number.isInteger(part?.station) ? 'Visit this television' : '';
      section.style.cursor=hint ? (part==='volume' ? 'ew-resize' : 'pointer') : '';
      if (hint) section.title=hint; else section.removeAttribute('title');
    });
  });
  section.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('.film-bar')) return;
    const dial = options.world()?.pickFilm?.(event.clientX,event.clientY) === 'volume';
    gesture = { id:event.pointerId, x:event.clientX, y:event.clientY, dial, level:canvas.filmVolume, adjusting:false };
    skipClick = false;
  });
  section.addEventListener('pointermove', event => {
    if (!gesture?.dial || event.pointerId !== gesture.id) return;
    const dx=event.clientX-gesture.x, dy=event.clientY-gesture.y;
    if (!gesture.adjusting) {
      if (Math.abs(dx)<7 || Math.abs(dx)<Math.abs(dy)*1.3) return;
      gesture.adjusting=true;
      section.setPointerCapture(event.pointerId);
    }
    const value=Math.max(0,Math.min(1,gesture.level+dx/160));
    adjustVolume(Math.round(value*20)/20);
  });
  section.addEventListener('pointercancel', () => { gesture = null; });
  section.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    const adjusted=gesture.adjusting;
    gesture = null;
    if (adjusted) { skipClick=true; return; }
    skipClick = Math.hypot(dx, dy) > 12;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) change(dx < 0 ? 1 : -1);
  });
  section.addEventListener('click', event => {
    if (event.target.closest('.film-bar')) return;
    if (skipClick && event.detail !== 0) { skipClick = false; return; }
    const target = event.target.closest('.film-fallback') ? 'screen' :
      options.world()?.pickFilm?.(event.clientX, event.clientY);
    if (Number.isInteger(target?.station)) options.seek(target.station);
    else if (target === 'screen') watch(event.target.closest('.film-fallback') || playButton);
    else if (target === 'knob') change(1);
    else if (target === 'volume') toggleSound();
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input,textarea,select') || document.querySelector('dialog[open]')) return;
    const box = section.getBoundingClientRect();
    if (box.top > innerHeight * 0.5 || box.bottom < innerHeight * 0.5) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      change(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('labworld:ready', bindWorld);
  syncLabels();
  syncSound();
  bindWorld();
  return {
    visit,
    get watching(){return viewer.open;},
    setInView(visible) {
      if (visible === inView) return;
      inView = visible;
      if (!inView) volumePanel.hidden = true;
      syncPlayback();
    },
    presentIn(container) {
      inSheet = true;
      video.classList.remove('film-decoder');
      video.removeAttribute('aria-hidden');
      video.controls = true;
      container.replaceChildren(video);
      syncPlayback();
    },
    leaveSheet() {
      if (!inSheet) return;
      inSheet = false;
      prefersPlayback = !video.paused;
      video.pause();
      video.controls = false;
      syncLabels();
      syncSound();
      video.classList.add('film-decoder');
      video.setAttribute('aria-hidden', 'true');
      section.append(video);
      syncPlayback();
    }
  };
};
