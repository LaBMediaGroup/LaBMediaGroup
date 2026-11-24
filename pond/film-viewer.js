/* A feature uses its complete release. The gallery loop keeps its own decoder and time. */
window.createFilmViewer = function createFilmViewer(world, resumeGallery) {
  'use strict';
  const get = id => document.getElementById(id);
  const dialog = get('filmViewer'), stage = get('featureStage'), video = get('featureFilm');
  const clock = get('featureClock'), seek = get('featureSeek'), play = get('featurePlay');
  const mute = get('featureSound'), gain = get('featureGain'), full = get('featureFullscreen');
  const problem = get('featureProblem'), external = get('featureExternal');
  let origin, film, returnFromHistory = false, ownsHistory = false;
  let userVolume, userMuted, hasOpened = false;
  let bufferedURL, fetching, requestedTime = null;
  let audioContext, speakerGain;

  function positionLabel(seconds) {
    seconds = Math.floor(Math.max(0, Number.isFinite(seconds) ? seconds : 0));
    return Math.floor(seconds/60) + ':' + String(seconds%60).padStart(2,'0');
  }
  function paintTime() {
    const duration = video.duration, valid = Number.isFinite(duration) && duration > 0;
    seek.disabled = !valid;
    if (valid) {
      seek.max = String(Math.ceil(duration));
      seek.value = String(Math.floor(requestedTime ?? video.currentTime));
      seek.setAttribute('aria-valuetext', positionLabel(video.currentTime) + ' of ' + positionLabel(duration));
    }
    clock.textContent = positionLabel(video.currentTime) + ' / ' + (valid ? positionLabel(duration) : '–:––');
  }
  function updatePlay() {
    play.textContent = video.ended ? 'Replay' : video.paused ? 'Play' : 'Pause';
    play.setAttribute('aria-label', play.textContent + ' film');
  }
  function showSound() {
    const level = speakerGain ? speakerGain.gain.value : video.volume;
    gain.value = String(Math.round((video.muted ? 0 : level) * 100));
    gain.setAttribute('aria-valuetext',gain.value+'%');
    mute.textContent = video.muted || level===0 ? 'Unmute' : 'Mute';
    mute.setAttribute('aria-label',mute.textContent+' film');
  }
  function setLevel(value) {
    video.volume = value;
    if (!speakerGain && Math.abs(video.volume-value)>.005) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        audioContext = new Ctx();
        speakerGain = audioContext.createGain();
        audioContext.createMediaElementSource(video).connect(speakerGain);
        speakerGain.connect(audioContext.destination);
      }
    }
    if (speakerGain) {
      speakerGain.gain.value = value;
      if (audioContext.state !== 'running') audioContext.resume().catch(()=>{});
    }
  }
  function start() {
    if (video.ended) video.currentTime=0;
    video.play().catch(updatePlay);
  }
  function toggle() { if (video.paused) start(); else video.pause(); }
  function showProblem() {
    if (dialog.open && video.error) problem.hidden=false;
  }
  play.addEventListener('click',toggle);
  // Some file servers return a full 200 response to Range requests. When the
  // visitor seeks on one of these, finish buffering this film into a seekable URL.
  async function seekTo(seconds) {
    if (!dialog.open || !Number.isFinite(video.duration)) return;
    const target = Math.min(seconds,video.duration);
    requestedTime=target;
    if (fetching) return;
    let canSeek=Boolean(bufferedURL);
    for(let i=0;i<video.seekable.length;i++) {
      if(target >= video.seekable.start(i) && target <= video.seekable.end(i))canSeek=true;
    }
    if(canSeek || target===0) {
      video.currentTime=target; requestedTime=null; return;
    }
    const ctl=new AbortController();fetching=ctl;
    const resume=!video.paused;
    get('featureNotice').textContent='Buffering film for seeking…';
    try{
      // A paused, partially cached media request can hold Chrome's cache entry
      // open. Give the full-file read its own URL so it can finish immediately.
      const source=new URL(film.full,document.baseURI);
      source.searchParams.set('buffer','1');
      const response=await fetch(source,{signal:ctl.signal,cache:'no-store'});
      if(!response.ok)throw Error('Film unavailable');
      const blob=await response.blob();
      if(!dialog.open || ctl.signal.aborted)return;
      const sourceURL=URL.createObjectURL(blob);
      bufferedURL=sourceURL;
      video.addEventListener('loadedmetadata',()=>{
        if(!dialog.open||bufferedURL!==sourceURL)return;
        video.currentTime=Math.min(requestedTime??target,video.duration);requestedTime=null;
        if(resume)start();
      },{once:true,signal:ctl.signal});
      video.src=bufferedURL;
    }catch{
      if(!ctl.signal.aborted){requestedTime=null;problem.hidden=false;}
    }finally{
      if(fetching===ctl){fetching=null;get('featureNotice').textContent='';}
    }
  }
  seek.addEventListener('input',()=>{if(!seek.disabled)seekTo(Number(seek.value));});
  mute.addEventListener('click',()=>{
    const silenced=video.muted||Number(gain.value)===0;
    if(silenced) setLevel(userVolume||.65);
    video.muted=!silenced;userMuted=video.muted;showSound();
  });
  gain.addEventListener('input',()=>{
    const val=Number(gain.value)/100;
    if(val>0) userVolume=val;
    setLevel(val);video.muted=val===0;userMuted=video.muted;showSound();
  });
  for(const event of ['loadedmetadata','durationchange','timeupdate','seeked']) video.addEventListener(event,paintTime);
  for(const event of ['play','pause','playing','ended']) video.addEventListener(event,updatePlay);
  video.addEventListener('volumechange',showSound);
  video.addEventListener('error',showProblem);
  video.addEventListener('playing',()=>{problem.hidden=true;});
  get('featureRetry').addEventListener('click',()=>{problem.hidden=true;video.load();start();});

  function fullscreenElement(){return document.fullscreenElement || document.webkitFullscreenElement;}
  function updateFullscreen(){full.textContent = fullscreenElement() ? 'Exit fullscreen' : 'Fullscreen';}
  full.addEventListener('click',async()=>{
    try {
      if (fullscreenElement()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else document.webkitExitFullscreen();
      } else if (stage.requestFullscreen) await stage.requestFullscreen();
      else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch {
      if (video.webkitEnterFullscreen) {
        try { video.webkitEnterFullscreen(); } catch { /* A platform may reserve fullscreen. */ }
      }
    }
  });
  document.addEventListener('fullscreenchange',updateFullscreen);
  document.addEventListener('webkitfullscreenchange',updateFullscreen);
  full.hidden = !stage.requestFullscreen && !stage.webkitRequestFullscreen && !video.webkitEnterFullscreen;
  function close() {
    if (!dialog.open) return;
    if (fullscreenElement()) {
      if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
      else document.webkitExitFullscreen?.();
    }
    dialog.close();
  }
  get('filmBack').addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('keydown',e=>{
    if(e.code==='Space' && !e.target.closest('button,input,a')){e.preventDefault();toggle();}
  });
  window.addEventListener('popstate',()=>{
    if(dialog.open && !history.state?.labFeature) {returnFromHistory=true;close();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&dialog.open)video.pause();});
  dialog.addEventListener('close',()=>{
    fetching?.abort();fetching=null;requestedTime=null;get('featureNotice').textContent='';
    video.pause();world()?.setFilmFeature?.(null);
    video.removeAttribute('src');video.load();
    if(bufferedURL){URL.revokeObjectURL(bufferedURL);bufferedURL=null;}
    document.documentElement.classList.remove('film-watching');
    if(ownsHistory && !returnFromHistory && history.state?.labFeature===film.id)history.back();
    returnFromHistory=ownsHistory=false;
    (origin?.isConnected&&!origin.hidden?origin:get('filmPlay')).focus({preventScroll:true});
    resumeGallery();
  });
  return {
    get open(){return dialog.open;},
    openFilm(item,trigger,previewLevel,previewMuted){
      if(dialog.open)return;
      film=item;origin=trigger;problem.hidden=true;
      const online=item.links.find(([label,url])=>/watch/i.test(label)&&/^https?:/.test(url));
      external.hidden=!online;
      if(online)external.href=online[1];else external.removeAttribute('href');
      get('featureTitle').textContent=item.title;
      video.setAttribute('aria-label',item.title+', full film');
      video.poster=item.img;video.src=item.full;
      if(!hasOpened){userVolume=previewLevel||.65;userMuted=previewMuted;hasOpened=true;}
      video.muted=Boolean(userMuted);setLevel(userVolume);showSound();updatePlay();paintTime();updateFullscreen();
      stage.classList.toggle('flat',!world()?.setFilmFeature?.(video));
      document.documentElement.classList.add('film-watching');
      dialog.showModal();
      get('filmBack').focus({preventScroll:true});
      try{
        history.pushState({...history.state,labFeature:item.id},'');ownsHistory=true;
      }catch{ownsHistory=false;}
      start();
    }
  };
};
