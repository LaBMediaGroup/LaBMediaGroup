/* LaB Media rebuild v2 · page motion.
   Scroll drives the camera (dive), the tiles (stand up out of the water) and the
   ink (the ending). The work deck and shoreline share one vertical scroll route.
   Everything that lands or leaves drops a ripple into the pond. */
(function () {
  'use strict';
  var LAT = 42.67, LON = -83.03;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = function () { return document.documentElement.classList.contains('no-world') ? null : window.LabWorld; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- the work ---------- */
  var P = [
    { type: 'Website', id: 'ballcap', title: 'Ballcap Productions', year: '2026', img: '/pond/img/ballcap.jpg', vid: '/pond/img/clips/ballcap.mp4', w: '#382d26', tag: 'Film studio', live: true,
      line: 'Step into the tunnel from Scattered, watch the films, and see how the crew made them.',
      cred: [['Studio', 'Ballcap Productions'], ['Built', 'Film chapters, screening room and behind-the-scenes archive']],
      links: [['Visit Ballcap Productions ↗', 'https://bcp.labmedia.work/']] },
    { type: 'Website', id: 'splitbone', title: 'Splitbone', year: '2026', img: '/pond/img/splitbone-home.jpg', vid: '/pond/img/clips/splitbone.mp4', w: '#4a2614', tag: 'Redesign pitch',
      line: 'A recording studio you can walk through: a 3D tour of the garage, real rates, booking.',
      cred: [['Client', 'Splitbone Studios · St. Clair County, MI'], ['Built', '3D room, baked light, booking flow'], ['Status', 'Pitched, not live']],
      links: [['Walk through it ↗', 'https://splitbone-room.labmedia.work']] },
    { type: 'Website', id: 'sweetbabe', title: 'Sweet Babe', year: '2026', img: '/pond/img/sweetbabe.jpg', vid: '/pond/img/clips/sweetbabe.mp4', w: '#3a340a', tag: 'Live', live: true,
      line: 'Booking for Kyle’s live acoustic act. The record spins; a few taps send a date straight to Kyle.',
      cred: [['Client', 'Kyle Keaser · Metro Detroit'], ['Built', 'Booking flow, venues, show alerts, sound'], ['Status', 'Live']],
      links: [['Visit the site ↗', 'https://sweetbabemusic.com']] },
    { type: 'Website', id: 'sideways', title: 'Sideways', year: '2026', img: '/pond/img/sideways.jpg', vid: '/pond/img/clips/sideways.mp4', w: '#5a4a1c', tag: 'Redesign demo',
      line: 'Al and Joe’s hand-drawn animation shop, finally moving like their work.',
      cred: [['Client', 'Sideways Studio · Metro Detroit'], ['Built', 'Film-in-letters wordmark, character cameos'], ['Status', 'Demo']],
      links: [['See the demo ↗', 'https://ssa.labmedia.work']] },
    { type: 'Film', id: 'gone', title: 'Gone', year: '2026', img: '/images/gone/gone-poster.jpg', vid: '/pond/film-clips/gone.mp4', full: '/pond/film-full/gone.mp4', w: '#16202b', tag: 'Sci-fi',
      line: 'One building. No way out.', cred: [['Festival', 'Horror Film Roulette XIII'], ['Premiere', 'Senate Theater, Detroit']], links: [['Behind the film ↗', '/portfolio.html']] },
    { type: 'Film', id: 'scattered', title: 'Scattered', year: '2026', img: '/assets/scattered-still.webp', vid: '/pond/film-clips/scattered.mp4', full: '/videos/scattered-48hfp-2026.mp4', w: '#2a1d14', tag: '48 hours',
      line: 'Shot and cut in a weekend. Uploaded with six minutes left.', cred: [['Festival', 'Detroit 48HFP 2026'], ['Awards', 'Best Use of Character · 3rd Best Film']], links: [['Watch ↗', 'https://www.youtube.com/watch?v=bwmKomu0xPo']] },
    { type: 'Film', id: 'trail', title: 'Trail Dead', year: '2025', img: '/assets/trail.webp', vid: '/pond/film-clips/trail.mp4', full: '/pond/film-full/trail.mp4', w: '#14231a', tag: 'Horror',
      line: 'A bike ride, and a camera that seems to be haunted.', cred: [['Festival', 'Horror Film Roulette 2025'], ['Award', 'Best Editing']], links: [['Watch ↗', 'https://www.youtube.com/watch?v=rtEs8chuDlM']] },
    { type: 'Film', id: 'lookout', title: 'Lookout', year: '2025', img: '/assets/lookout.webp', vid: '/pond/film-clips/lookout.mp4', full: '/pond/film-full/lookout.mp4', w: '#2b2218', tag: 'Comedy',
      line: 'Joining the gym was easy. Cancelling is another story.', cred: [['Festival', 'The Comedy Roll 2025'], ['Result', 'Top 25']], links: [['Watch ↗', 'https://www.youtube.com/watch?v=G0zfFWwQuZA']] },
    { type: 'Film', id: 'boy', title: 'It’s a Boy', year: '2026', img: '/images/itsaboy/poster.jpg', vid: '/pond/film-clips/boy.mp4', full: '/pond/film-full/boy.mp4', w: '#2a2a16', tag: 'Comedy',
      line: 'Thirteen crew, four days, more footage than time.', cred: [['Festival', 'The Comedy Roll 2026'], ['Directed', 'Bobby & Al']], links: [['Watch ↗', 'https://www.youtube.com/watch?v=BsIad5S8bQc']] },
    { type: 'Film', id: 'moz', title: 'MOZ Interiors', year: '2024', img: '/assets/selected-work/moz-interior-v3.jpg', vid: '/pond/film-clips/moz.mp4', full: '/pond/film-full/moz.mp4', w: '#2d261d', tag: 'Brand film',
      line: 'A Detroit-designed space, filmed in one day.', cred: [['Client', 'MOZ Interiors']], links: [['Watch ↗', 'https://www.youtube.com/watch?v=HtF4L9RpkaU']] },
    { type: 'Film', id: 'brass', title: 'Anthony Brass', year: '2024', img: '/assets/hero-v4/AnthonyBrass-Paintingclip.jpg', vid: '/pond/film-clips/brass.mp4', full: '/pond/film-full/brass.mp4', w: '#1c2328', tag: 'Artist film',
      line: 'A painter’s home studio, in his own words.', cred: [['Subject', 'Anthony Brass']], links: [['Watch ↗', 'https://www.youtube.com/watch?v=CPvxM8GrCg8']] }
  ];

  var websites = P.filter(function (project) { return project.type === 'Website'; });
  var films = P.filter(function (project) { return project.type === 'Film'; });

  /* ---------- tiny animation helpers ---------- */
  var eOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  function ripple(el, s, r, at) {
    if (!W() || !el) return;
    var b = el.getBoundingClientRect();
    W().drop(b.left + b.width * (at ? at[0] : 0.5), b.top + b.height * (at ? at[1] : 0.5), s, r);
  }
  function splitText(el) {
    var words = el.textContent.split(' ');
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = words.map(function (w) {
      return '<span class="w" aria-hidden="true">' + w.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    el.querySelectorAll('.ch').forEach(function (c, i) { c.style.transitionDelay = (i * 0.028) + 's'; });
  }


  /* ---------- sound: off until asked, synthesised, quiet ----------
     Beds: wind in the field (follows the live wind and gusts), a faint 60 Hz
     line hum near the poles, water lapping once you're over the pond.
     Hits: water plip, TV tuning, whoosh, a low bloop for the ink. */
  var SND = (function () {
    var ctx = null, on = false, master, windG, windF, humG, waterG, waterF, nb = null;
    function noise(sec, brown) {
      var b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0), last = 0;
      for (var i = 0; i < d.length; i++) { var w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
      return b;
    }
    function bed(buf, type, f, q) { var s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; var fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7; var g = ctx.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(master); s.start(); return [g, fl]; }
    function start() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      nb = noise(2, false);
      var w = bed(noise(6, true), 'bandpass', 420, 0.5); windG = w[0]; windF = w[1];
      var wa = bed(noise(5, true), 'lowpass', 520, 0.8); waterG = wa[0]; waterF = wa[1];
      humG = ctx.createGain(); humG.gain.value = 0; humG.connect(master);
      [60, 120, 180].forEach(function (f, i) { var o = ctx.createOscillator(); o.frequency.value = f; var g = ctx.createGain(); g.gain.value = [1, .5, .2][i]; o.connect(g); g.connect(humG); o.start(); });
      (function tick() {
        if (ctx && on) {
          var t = ctx.currentTime, lw = W(), dive = lw ? lw.dive : 0, gust = lw ? lw.gust : 0, mph = sceneMph;
          var lvl = Math.min(1, (mph + gust * 8) / 26);
          var wet = lw ? lw.immersion : 0;
          windG.gain.setTargetAtTime((0.015 + lvl * 0.11) * (1 - dive * 0.6) * (1-wet*.95), t, 0.4);
          windF.frequency.setTargetAtTime(280 + lvl * 520 + gust * 200, t, 0.5);
          humG.gain.setTargetAtTime(0.0035 * (1 - dive), t, 0.5);
          waterG.gain.setTargetAtTime(dive * (0.03 + 0.025 * Math.sin(t * 0.9) + 0.015 * Math.sin(t * 2.3)), t, 0.3);
          waterF.frequency.setTargetAtTime((380 + 220 * Math.sin(t * 0.7))*(1-.64*wet), t, 0.3);
        }
        setTimeout(tick, 120);
      })();
    }
    function burst(dur, type, f0, f1, gain, q) {
      if (!on) return; var t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = nb; s.loop = true;
      var fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(.04, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }
    return {
      toggle: function () { if (!ctx) start(); on = !on; if (ctx.state === 'suspended') ctx.resume(); master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.25); return on; },
      get on() { return on; },
      plip: function (s) { if (!on) return; s = s || .5; var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.setValueAtTime(700 + Math.random() * 400, t); o.frequency.exponentialRampToValueAtTime(240, t + 0.09);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06 * s, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2); burst(0.18, 'bandpass', 2400, 900, 0.025 * s, 1.2); },
      crinkle: function () { if (!on) return; for (var i = 0; i < 4; i++) setTimeout(function () { burst(0.05, 'bandpass', 3800 + Math.random() * 1500, 3000, 0.05, 2); }, i * 60 + Math.random() * 40); },
      splash: function () { if(on){burst(.15,'bandpass',3200,1150,.16,.55);burst(.36,'lowpass',850,170,.14,.8);} },
      whoosh: function () { burst(0.55, 'bandpass', 500, 2200, 0.05, .8); },
      bloop: function () { if (!on) return; var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.5); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.9); burst(0.6, 'lowpass', 900, 200, 0.04, .7); }
    };
  })();
  addEventListener('lab-pond-impact',()=>SND.splash());
  addEventListener('lab-pond-breach',()=>SND.whoosh());
  var sndBtn = $('#snd');
  try { if (localStorage.getItem('lab-sound') === '1') sndBtn.dataset.want = '1'; } catch (e) {}
  // if sound was on last visit, turn it back on at the first tap (phones only unlock audio on a click)
  if (sndBtn.dataset.want) addEventListener('click', function first(e) { removeEventListener('click', first, true); if (!SND.on && e.target !== sndBtn) sndBtn.click(); }, true);
  sndBtn.addEventListener('click', function () { var o = SND.toggle(); sndBtn.setAttribute('aria-pressed', String(o)); try { localStorage.setItem('lab-sound', o ? '1' : '0'); } catch (e) {} if (o) SND.plip(.6); });

  /* ---------- loader ---------- */
  var loader = $('#loader'), brandMark = $('.loader-mark'), done = false;
  function finishLoader() {
    if (done) return;
    done = true;
    var dock = !reduce && !location.hash && brandMark.animate;
    function reveal() {
      $('.hero h1').classList.add('in');
      loader.classList.add('leaving');
      if (!dock) { loader.classList.add('done'); return; }
      var source = brandMark.getBoundingClientRect(), target = $('.mark img').getBoundingClientRect();
      var move = brandMark.animate([
        {transform:'none'},
        {transform:'translate('+(target.left-source.left)+'px,'+(target.top-source.top)+'px) scale('+target.width/source.width+')'}
      ], {duration:520,easing:'cubic-bezier(.35,0,.16,1)',fill:'forwards'});
      move.onfinish = move.oncancel = function () { loader.classList.add('done'); };
    }
    var exposure = dock && brandImage.getAnimations && brandImage.getAnimations()[0];
    if (exposure) exposure.finished.then(reveal,reveal);
    else reveal();
  }
  var sceneReady = W() || document.documentElement.classList.contains('no-world') ? Promise.resolve() :
    new Promise(function(resolve){ addEventListener('labworld:ready',resolve,{once:true}); });
  addEventListener('labworld:unavailable',finishLoader);
  var brandImage = brandMark.querySelector('img');
  var brandReady = brandImage.decode ? brandImage.decode().catch(function(){}) : Promise.resolve();
  Promise.all([sceneReady,brandReady]).then(finishLoader);
  setTimeout(finishLoader,3500);
  splitText($('.hero h1'));
  splitText($('.make h2'));

  /* ---------- live sky + wind ---------- */
  var wx = null, sunAz = 230, sampleWind = false;
  var previewWind = false, previewTimer, windFrame, sceneMph = 6;
  var demoButton = $('#windDemo');
  var AT = location.search.match(/[?&]at=(\d{1,2}):(\d{2})/);
  var WIND = location.search.match(/[?&]wind=(\d+)/);
  const detroitDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Detroit',year:'numeric',month:'2-digit',day:'2-digit'});
  const detroitClock=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Detroit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function ymd(d) { return detroitDate.format(d); }
  function now() {
    const current=new Date();
    if(!AT)return current;
    const noon=new Date(ymd(current)+'T16:00:00Z');
    const [h,m]=detroitClock.format(noon).split(':').map(Number);
    return new Date(+noon+((Number(AT[1])-h)*60+Number(AT[2])-m)*60000);
  }
  var fieldTools=window.createFieldTools({world:W,now:now,dayKey:ymd,live:live,lat:LAT,lon:LON,reduced:reduce,onShuffle:()=>SND.crinkle()});
  function compass(deg) { return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(((deg % 360) + 360) % 360 / 45) % 8]; }
  function live() {
    if (!window.LaBSun) return;
    var t = now(), pos = LaBSun.position(t, LAT, LON);
    var light = pos.elevation>6 ? 'Daylight' : pos.elevation>-.833 ? 'Golden hour' : pos.elevation>-6 ? 'Blue hour' : 'Night';
    $('#fieldLight').textContent=t.toLocaleTimeString('en-US',{timeZone:'America/Detroit',hour:'numeric',minute:'2-digit'})+' · '+light;
    sunAz = pos.azimuth;
    if (!fieldTools.setLive(pos) && W()) W().setSun(pos.elevation);
  }
  function updateWind(animate) {
    var data = wx || {wind:6,gust:10,dir:270,cloud:.4};
    var mph = previewWind ? 30 : data.wind;
    $('#tWind').textContent = previewWind || wx ? Math.round(mph) : '—';
    $('#windBearing').textContent = previewWind || wx ? compass(data.dir) : '';
    var status = previewWind ? 'Wind preview' : !wx ? 'Getting local wind…' :
      sampleWind ? 'Sample conditions' : 'Current · gusts '+Math.round(data.gust)+' mph';
    var fieldStatus = $('#windStatus');
    if (fieldStatus.textContent !== status) fieldStatus.textContent = status;
    demoButton.textContent = previewWind ? 'End preview' : 'Preview 30 mph wind';
    demoButton.setAttribute('aria-pressed',String(previewWind));
    if (!W()) return;
    demoButton.hidden = reduce;
    W().setCloud(data.cloud);
    cancelAnimationFrame(windFrame);
    var start = performance.now(), from = sceneMph;
    function apply(time) {
      var f = animate ? clamp((time-start)/550,0,1) : 1;
      sceneMph = from + (mph-from)*f*f*(3-2*f);
      W().setWind(sceneMph,previewWind ? sceneMph : Math.max(sceneMph,data.gust),data.dir,sunAz);
      if (f<1) windFrame=requestAnimationFrame(apply);
    }
    apply(start);
  }
  function endPreview() {
    clearTimeout(previewTimer);
    if (!previewWind) return;
    previewWind = false;
    updateWind(true);
  }
  demoButton.addEventListener('click',function(){
    if (previewWind) { endPreview(); return; }
    previewWind = true;
    updateWind(true);
    previewTimer = setTimeout(endPreview,7000);
  });
  function weather() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.67&longitude=-83.03&current=wind_speed_10m,wind_gusts_10m,wind_direction_10m,cloud_cover&wind_speed_unit=mph&timezone=auto')
      .then(function (r) { if (!r.ok) throw Error('Weather unavailable'); return r.json(); })
      .then(function (j) {
        var c = j.current;
        if (!c || ![c.wind_speed_10m,c.wind_gusts_10m,c.wind_direction_10m].every(Number.isFinite)) throw Error('Wind unavailable');
        wx = {wind:c.wind_speed_10m,gust:c.wind_gusts_10m,dir:c.wind_direction_10m,cloud:(c.cloud_cover ?? 40)/100};
        sampleWind = !!WIND;
        if (WIND) { wx.wind = +WIND[1]; wx.gust = wx.wind*1.5; }
        updateWind(false);
      }).catch(function () {
        sampleWind = true;
        var speed = WIND ? +WIND[1] : 6;
        wx = {wind:speed,gust:WIND ? speed*1.5 : 10,dir:270,cloud:.4};
        updateWind(false);
      });
  }
  live(); weather(); updateWind(false);
  setInterval(live,30000); setInterval(weather,600000);
  addEventListener('labworld:ready',function(){live();updateWind(false);fieldTools.syncWorld();});

  /* ---------- scroll: dive, tiles, ink ---------- */
  var hero = $('.hero-in'), windInstrument = $('.wind-instrument'), cue = $('.cue'), toolsSection=$('#tools'), workSection=$('#work'), filmFrame=$('.film-frame');
  var make = $('#make'), mkH = $('#mk');
  const toolFrame=toolsSection.querySelector('.station-frame');
  const ascentSpace=$('.pond-ascent'), opening=$('.opening'), invitation=$('.enter-field');
  const browse=$('#browseChapters'), chapterLinks=[...document.querySelectorAll('#chapters a, .hud .cta')];
  const setMenu=open=>browse.setAttribute('aria-expanded',String(open));
  browse.addEventListener('click',()=>setMenu(browse.getAttribute('aria-expanded')!=='true'));
  document.addEventListener('click',event=>{if(!event.target.closest('.chapter-nav') || event.target.closest('#chapters a'))setMenu(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && browse.getAttribute('aria-expanded')==='true'){setMenu(false);browse.focus();}});
  let currentChapter='';
  function markChapter(hash){
    if(hash===currentChapter)return;
    currentChapter=hash;
    for(const a of chapterLinks){
      if(a.hash===hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
    }
  }
  function phase(value,from,to){
    const t=clamp((value-from)/(to-from),0,1);
    return t*t*(3-2*t);
  }
  function openingLayer(el,opacity,dy){
    el.style.opacity=String(opacity);
    el.style.transform=reduce?'none':'translateY('+dy+'px)';
    el.inert=opacity<.08;
  }

  let wantedUnder=0,leavingFilms=false;
  function filmApproach(rendered){
    const visible=Math.min(wantedUnder,rendered);
    const fade=leavingFilms?clamp((visible-.70)/.29,0,1):clamp((visible-.80)/.19,0,1);
    filmFrame.style.opacity=String(fade);
    if(filmFrame.inert!==(fade<.08))filmFrame.inert=fade<.08;
    filmPlayer.setInView(visible>.65);
  }
  function ascentSpan(vh){return ascentSpace.offsetHeight ? vh*.12+ascentSpace.offsetHeight : vh*.77;}
  function onScroll() {
    var vh = workFrame.offsetHeight, y = scrollY;
    var filmRect = filmSection.getBoundingClientRect();
    var under = Math.min(
      clamp((vh * 1.48 - filmRect.top) / (vh * 1.44), 0, 1),
      clamp((filmRect.bottom - vh * 0.08) / (vh * 0.76), 0, 1)
    );
    const exiting=filmRect.top < -1;
    wantedUnder=under;leavingFilms=exiting;
    if (W()) W().setUnder(under,exiting,filmRect.top>vh*1.62);
    filmApproach(!W() || document.documentElement.classList.contains('no-film-world')?under:W().under);
    var workRect = workSection.getBoundingClientRect();
    var deckVisible = under <= 0.35 && workRect.top < vh && workRect.bottom > 0;
    if (deckVisible !== deckInView) {
      deckInView = deckVisible;
      syncCardVideo();
    }
    const step=siteStep();
    const siteTravel=clamp(-workRect.top/step,0,websites.length-1);
    const release=clamp((-workRect.top-(websites.length-1)*step)/vh,0,1);
    if(workRect.top<vh && workRect.bottom>0)showSites(siteTravel,release);
    const toolRect=toolsSection.getBoundingClientRect();
    const arrival=clamp((vh-toolRect.top)/vh,0,1);
    const departure=clamp((vh-toolRect.bottom)/(vh*.86),0,1);
    const presence=arrival*(1-departure);

    var dive=clamp((vh*1.45-workRect.top)/(vh*1.12),0,1);
    const sunCarry=arrival*(1-dive*dive*(3-2*dive));
    fieldTools.setPresence(presence,sunCarry);
    const stationProgress=fieldTools.journey(toolRect);
    const escort=clamp((vh-toolRect.bottom)/Math.max(1,workRect.top-toolRect.bottom+vh),0,1);
    toolFrame.style.opacity=String(1-phase(escort,0,.20));
    toolFrame.inert=escort>.20;
    if (W()) {
      W().setFieldEscort(phase(stationProgress,.865,.96),escort);
      W().setStation(arrival);
      W().setDive(dive);
      W().setShore(siteTravel/Math.max(1,websites.length-1),release);
    }
    const span=Math.max(1,opening.offsetHeight-hero.parentElement.offsetHeight);
    const p=y/span, intro=phase(p,.05,.36), wind=phase(p,.23,.50);
    const exit=1-phase(p,.81,1.06);
    openingLayer(invitation,1-phase(p,.035,.20),-10*intro);
    openingLayer(hero,intro*exit,18*(1-intro)-12*(1-exit));
    openingLayer(windInstrument,wind*exit,12*(1-wind));
    openingLayer(cue,wind*exit,8*(1-wind));
    opening.style.setProperty('--field-shade',String(intro*exit));
    W()?.setFieldRead?.(phase(p,0,.80));
    if(previewWind && exit<.2)endPreview();
    const contactTop=make.getBoundingClientRect().top;
    markChapter(contactTop<vh*.75?'#make':filmRect.top<vh*.65?'#films':workRect.top<vh*.65?'#work':toolRect.top<vh*.65?'#tools':'#top');
    // One ascent starts as the last screen leaves and ends with the inquiry.
    const rise=exiting ? clamp((vh*.97-filmRect.bottom)/ascentSpan(vh),0,1) : 0;
    if(W()) W().setRise(rise);
    if(rise>.80 || make.getBoundingClientRect().top<vh)mkH.classList.add('in');
  }
  // Keep the browser's native drag and wheel response. A fling may coast
  // as far as the next reading mark. A new gesture can leave immediately.
  let gesture=null,lastWheel=-Infinity;
  // A tall sticky section is a free-panning snap area in CSS. Give its
  // entrance a point-sized target, so a fling lands at the start of the shot.
  for(const section of [opening,workSection,$('#films'),make]){
    const mark=document.createElement('span');mark.className='chapter-stop';
    mark.setAttribute('aria-hidden','true');section.prepend(mark);
  }
  const scrollMarks=()=>[...document.querySelectorAll('.chapter-stop,#wind,.scroll-stop,.site-stop')];
  function releaseStops(){
    document.documentElement.classList.remove('settle-touch');
    gesture?.landing?.classList.remove('touch-landing');
    gesture=null;
  }
  function armStops(event){
    const target=event.target;
    if(target.closest?.('dialog') || document.querySelector('dialog[open]')){releaseStops();return;}
    const wheel=event.type==='wheel',now=performance.now();
    if(wheel && (event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY)))return;
    const dir=wheel?Math.sign(event.deltaY):0;
    if(wheel && gesture && gesture.wheel && now-lastWheel<180 && dir===gesture.dir){lastWheel=now;return;}
    if(wheel)lastWheel=now;
    const y=scrollY;
    releaseStops();
    const marks=scrollMarks().map(el=>({el,top:y+el.getBoundingClientRect().top}));
    const lower=marks.findLast(mark=>mark.top<y-6),upper=marks.find(mark=>mark.top>y+6);
    gesture={wheel,dir,start:y,lower:lower?.top??0,upper:upper?.top??Infinity};
    if(!wheel){
      const touch=event.touches[0];
      Object.assign(gesture,{x:touch.clientX,y:touch.clientY,lastY:touch.clientY,time:event.timeStamp,lowerMark:lower?.el,upperMark:upper?.el});
    }
  }
  addEventListener('touchstart',e=>{
    if(e.touches.length===1)armStops(e);else releaseStops();
  },{passive:true});
  addEventListener('touchmove',e=>{
    if(!gesture || gesture.wheel || e.touches.length!==1)return;
    const finger=e.touches[0],dy=gesture.y-finger.clientY,dx=gesture.x-finger.clientX;
    const speed=(gesture.lastY-finger.clientY)/Math.max(1,e.timeStamp-gesture.time);
    gesture.lastY=finger.clientY;gesture.time=e.timeStamp;
    gesture.speed=Math.abs(dy)>24 && Math.abs(dy)>1.3*Math.abs(dx)?speed:0;
  },{passive:true});
  addEventListener('touchend',e=>{
    if(!gesture || gesture.wheel || e.timeStamp-gesture.time>110 || Math.abs(scrollY-gesture.start)<10)return;
    const speed=gesture.speed||0;
    if(Math.abs(speed)<.65)return;
    const landing=speed>0?gesture.upperMark:gesture.lowerMark;
    if(!landing || Math.abs(landing.getBoundingClientRect().top)>Math.abs(speed)*400)return;
    // The user's finger is up. Give a flick that would coast past a stop
    // one native landing point. Slow travel never changes the scroll position.
    gesture.landing=landing;
    landing.classList.add('touch-landing');
    document.documentElement.classList.add('settle-touch');
  },{passive:true});
  addEventListener('touchcancel',releaseStops,{passive:true});
  addEventListener('wheel',event=>{
    if(event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    // An overflow panel gets its normal wheel travel until it reaches an edge.
    for(let el=event.target;el instanceof HTMLElement && el!==document.body;el=el.parentElement){
      if(el.scrollHeight<=el.clientHeight+1 || !/auto|scroll/.test(getComputedStyle(el).overflowY))continue;
      if(event.deltaY<0?el.scrollTop>1:el.scrollTop+el.clientHeight<el.scrollHeight-1){releaseStops();return;}
    }
    armStops(event);
    if(!gesture || !event.cancelable)return;
    const units=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
    const proposed=scrollY+event.deltaY*units,limit=clamp(proposed,gesture.lower,gesture.upper);
    if(Math.abs(proposed-limit)>1){
      event.preventDefault();
      scrollTo({top:limit,behavior:'instant'});
    }
  },{passive:false});
  function boundCoast(){
    if(!gesture?.wheel)return;
    const y=scrollY,limit=clamp(y,gesture.lower,gesture.upper);
    if(Math.abs(y-limit)>1){
      scrollTo({top:limit,behavior:'instant'});
    }
  }
  addEventListener('scroll',boundCoast,{passive:true});
  addEventListener('scrollend',()=>{
    if(!gesture?.wheel)return;
    const y=scrollY,travel=y-gesture.start;
    if(Math.abs(travel)<8)return;
    const next=travel>0?gesture.upper:gesture.lower;
    if(Math.abs(next-y)>1 && Math.abs(next-y)<=Math.min(64,innerHeight*.08))
      scrollTo({top:next,behavior:reduce?'instant':'smooth'});
  },{passive:true});
  document.addEventListener('click',releaseStops,true);
  addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')releaseStops();},true);
  for(const type of ['keydown','popstate','hashchange','orientationchange'])addEventListener(type,releaseStops,true);
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* the pointer leaves a wake on the water */
  var lastDrop = 0;
  addEventListener('pointermove', function (e) {
    if(e.pointerType==='touch')return;
    if (W()) W().setPointer((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
    var t = performance.now();
    if (t - lastDrop < 45 || !W() || W().dive < 0.95 || e.target.closest('.films,.card,.tile,.slate,.hud,.sheet,.me-in')) return;
    lastDrop = t; W().drop(e.clientX, e.clientY, e.pointerType === 'mouse' ? 0.006 : 0.012, 0.12);
  }, { passive: true });
  addEventListener('pointerdown', function (e) {
    if (!W() || W().dive < 0.95 || e.target.closest('.films,.card,.tile,.slate,.hud,.sheet,.me-in,button,a,input')) return;
    W().drop(e.clientX, e.clientY, 0.03, 0.3); SND.plip(.4);
  });

  /* ---------- website previews skim over the pond ---------- */
  var stage = $('#stage'), previousSite = $('#prev'), nextSite = $('#next');
  const workFrame=workSection.querySelector('.work-frame');
  workSection.style.setProperty('--site-legs',String(websites.length-1));
  const siteMarks=websites.map((project,i)=>{
    if(!i)return workSection;
    const mark=document.createElement('span');mark.className='site-stop';mark.dataset.site=project.id;
    mark.setAttribute('aria-hidden','true');mark.style.setProperty('--stop',i);workSection.append(mark);return mark;
  });
  const reflection=document.createElement('span');reflection.className='site-stop reflection';
  reflection.setAttribute('aria-hidden','true');workSection.append(reflection);
  const siteStep=()=>siteMarks[1]?.offsetTop||workFrame.offsetHeight;
  var cards = [], idx = -1, position = -1, deckInView = false;
  var pointer = null, suppressClick = false;
  $('#deckAll').textContent = String(websites.length).padStart(2, '0');

  function buildCard(project, index) {
    var card = document.createElement('article');
    card.className = 'card site';
    card.innerHTML =
      '<button class="body" type="button" aria-haspopup="dialog">' +
        '<img alt="" draggable="false" src="' + project.img + '">' +
        '<video muted loop playsinline preload="none" src="' + project.vid + '"></video>' +
      '</button><div class="cap"><h3>' + project.title + '</h3>' +
        '<p class="micro">' + project.type + ' · ' + project.year + '<br>' +
        '<span class="' + (project.live ? 'tag-live' : '') + '">' + project.tag + '</span></p></div>';
    card._button = card.querySelector('button');
    card._video = card.querySelector('video');
    card._button.setAttribute('aria-label', 'Open ' + project.title + ' project details');
    card._button.addEventListener('click', function (e) {
      if (suppressClick && e.detail !== 0) { suppressClick = false; return; }
      if (index !== idx) seekSite(index);
      else openSheet(project, card._button);
    });
    stage.appendChild(card);
    return card;
  }

  function syncCardVideo() {
    cards.forEach(function (card, i) {
      var video = card._video;
      if (i !== idx || reduce || !deckInView || document.hidden || sheet.open) {
        video.pause();
      } else {
        video.play().then(function () { video.classList.add('on'); }).catch(function () {});
      }
    });
  }
  document.addEventListener('visibilitychange', syncCardVideo);

  function paintDeck() {
    var spacing = innerWidth * (innerWidth < 641 ? .80 : .65);
    cards.forEach(function (card, i) {
      var offset = i - position, distance = Math.abs(offset);
      var angle = Math.min(distance, 1) * Math.PI / 2;
      var bank = Math.sin(angle);
      // Lower the outside edge near mid-travel, where it throws a wake.
      var dip = Math.sin(angle * 2);
      var side = Math.sign(offset);
      // Park the next site beside the active card so the oak and glint
      // stay clear on the right. Keep the full banked sweep during travel.
      var tuck=innerWidth<641?1:1-.80*bank*bank*bank;
      var x = offset * spacing * tuck;
      var y = innerHeight * (.033 * bank + .063 * dip);
      var depth = -275 * bank;
      var pitch = 55 * bank + 17 * dip;
      var yaw = -side * 26 * bank;
      var roll = side * (7 * bank + 10 * dip);
      card.style.transform = 'translate3d(' + x + 'px,' + y + 'px,' + depth +
        'px) rotateY(' + yaw + 'deg) rotateZ(' + roll + 'deg) rotateX(' + pitch + 'deg)';
      card.style.zIndex = String(10 - Math.round(distance * 4));
      card.style.visibility = distance > 1.55 ? 'hidden' : '';
      card.style.setProperty('--caption', String(clamp(1 - distance * 3.3, 0, 1)));
    });
  }

  function showSites(raw,release){
    if(!cards.length)cards=websites.map(buildCard);
    // A short plateau on either side of each stop keeps a caption readable
    // during a small thumb adjustment. Between them the pose follows the finger.
    const leg=Math.floor(raw),nextPosition=reduce?Math.round(raw):leg+phase(raw-leg,.12,.88);
    if(position!==nextPosition){position=nextPosition;paintDeck();}
    const active=Math.round(raw);
    if(idx!==active)selectSite(active);
    const opacity=1-phase(release,.08,.72);
    workFrame.style.opacity=String(opacity);
    workFrame.inert=opacity<.05;
  }
  function seekSite(index){
    releaseStops();
    const mark=siteMarks[clamp(index,0,siteMarks.length-1)];
    scrollTo({top:scrollY+mark.getBoundingClientRect().top,behavior:reduce?'instant':'smooth'});
  }
  function selectSite(next) {
    var moveFocus = cards.some(function (card) { return card._button === document.activeElement; });
    idx = clamp(next, 0, websites.length - 1);
    $('#deckNow').textContent = String(idx + 1).padStart(2, '0');
    cards.forEach(function (card, i) {
      card.classList.toggle('open', i === idx);
      card._button.tabIndex = i === idx ? 0 : -1;
    });
    previousSite.setAttribute('aria-disabled', String(idx === 0));
    nextSite.setAttribute('aria-disabled', String(idx === websites.length - 1));
    if (moveFocus) cards[idx]._button.focus({ preventScroll: true });
    syncCardVideo();
  }
  function stepSite(direction){seekSite(idx+direction);}
  previousSite.onclick = function () { stepSite(-1); };
  nextSite.onclick = function () { stepSite(1); };
  addEventListener('resize', function () { if (cards.length) paintDeck(); });
  addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || $('#sheet').open || e.target.closest('input,textarea')) return;
    var r = $('#work').getBoundingClientRect();
    if (r.top > innerHeight * .5 || r.bottom < innerHeight * .5) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      stepSite(e.key === 'ArrowRight' ? 1 : -1);
    }
  });

  stage.addEventListener('pointerdown', function (e) {
    if (!e.isPrimary || e.button !== 0 || !e.target.closest('.body')) return;
    pointer = { id:e.pointerId, x:e.clientX, y:e.clientY, index:idx, startY:scrollY, time:e.timeStamp, pulling:false };
    suppressClick = false;
  });
  stage.addEventListener('pointermove', function (e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    var dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
    if (!pointer.pulling) {
      if (Math.max(Math.abs(dx),Math.abs(dy)) < 7) return;
      if (Math.abs(dy) >= Math.abs(dx)) { pointer = null; suppressClick = true; return; }
      pointer.pulling = true;
      releaseStops();
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('pulling');
    }
    const span=siteStep(),start=scrollY+workSection.getBoundingClientRect().top;
    const y=pointer.startY-dx/Math.max(160,innerWidth*.62)*span;
    scrollTo({top:clamp(y,start,start+span*(siteMarks.length-1)),behavior:'instant'});
  });
  function release(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    var pull = pointer;
    pointer = null;
    if (!pull.pulling) return;
    stage.classList.remove('pulling');
    suppressClick = true;
    if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    var dx = e.clientX - pull.x;
    var advance = e.type === 'pointerup' && (Math.abs(dx) > Math.min(75,innerWidth * .12) ||
      (Math.abs(dx) > 14 && Math.abs(dx) / Math.max(1,e.timeStamp-pull.time) > .55));
    seekSite(advance ? pull.index - Math.sign(dx) : pull.index);
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  var wheelX = 0, wheelAt = 0, wheelStepped = false;
  $('#work').addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || e.ctrlKey) return;
    var time = performance.now();
    if (time - wheelAt > 180) { wheelX = 0; wheelStepped = false; }
    wheelAt = time;
    e.preventDefault();
    wheelX += e.deltaX;
    if (!wheelStepped && Math.abs(wheelX) > 45) {
      stepSite(Math.sign(wheelX));
      wheelStepped = true;
    }
  }, { passive: false });

  /* ---------- production sheet: grows out of the card ---------- */
  var sheet = $('#sheet');
  function openSheet(p, origin) {
    var isFilm = p.type === 'Film';
    sheet.dataset.kind = p.type;
    sheet.style.setProperty('--w', p.w);
    if (isFilm) filmPlayer.presentIn($('#sMedia'));
    else $('#sMedia').innerHTML = p.vid && !reduce ? '<video autoplay muted loop playsinline poster="' + p.img + '" src="' + p.vid + '"></video>' : '<img src="' + p.img + '" alt="">';
    $('#sKick').textContent = p.type + ' · ' + p.year + ' · ' + p.tag;
    $('#sTitle').textContent = p.title;
    $('#sLine').textContent = p.line;
    $('#sCred').innerHTML = p.cred.map(function (c) { return '<dt>' + c[0] + '</dt><dd>' + c[1] + '</dd>'; }).join('');
    $('#sAct').innerHTML = p.links.map(function (l) { return '<a href="' + l[1] + '"' + (/^https?:/.test(l[1]) ? ' target="_blank" rel="noopener"' : '') + '>' + l[0] + '</a>'; }).join('') +
      (isFilm ? '<a href="#make" data-close>Build yours</a>' : '<a href="#make" data-close>One like this?</a>');
    sheet.showModal();
    syncCardVideo();
    if (origin && !reduce && sheet.animate) {
      var a = origin.getBoundingClientRect(), b = sheet.getBoundingClientRect();
      sheet.animate([
        { transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')', transformOrigin: '0 0', borderRadius: '40px' },
        { transform: 'none', transformOrigin: '0 0', borderRadius: '24px' }
      ], { duration: 650, easing: 'cubic-bezier(.2,.75,.1,1)' });
    }
    if (!isFilm) ripple(origin, 0.03, 0.6);
  }
  $('#sX').onclick = function () { sheet.close(); };
  sheet.addEventListener('click', function (e) { if (e.target === sheet || e.target.closest('[data-close]')) sheet.close(); });
  sheet.addEventListener('close', function () {
    filmPlayer.leaveSheet();
    $('#sMedia').replaceChildren();
    syncCardVideo();
  });

  // Scroll remains the shot clock, so reversing the wheel retraces the same
  // path. The last cabinet also offers a hands-free ride to the form.
  let ascentFrame=0;
  function cancelAscent(){cancelAnimationFrame(ascentFrame);ascentFrame=0;}
  for(const type of ['wheel','touchstart','pointerdown','keydown','popstate','resize'])
    addEventListener(type,cancelAscent,{passive:true});
  $('#filmSurface').addEventListener('click',event=>{
    if(event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
       reduce || !ascentSpace.offsetHeight || !W())return;
    event.preventDefault();cancelAscent();
    const start=scrollY, distance=make.getBoundingClientRect().top, begin=performance.now();
    if(location.hash!=='#make')history.pushState(null,'','#make');
    // Give most of the ride to the water and oak, even when the link was
    // clicked at the very top of the sticky gallery. Adjacent scroll segments
    // have the same velocity at their shared endpoint.
    const lip=filmSection.getBoundingClientRect().bottom-innerHeight*.97;
    const departure=clamp(lip,0,distance), landing=clamp(lip+ascentSpan(innerHeight),departure,distance);
    const pace=(landing-departure)/.66;
    const firstSpeed=Math.min(pace,departure/.14), lastSpeed=Math.min(pace,(distance-landing)/.2);
    function segment(a,b,t,duration,v0,v1){
      const u=t/duration, h=1-u;
      return a+(b-a)*u*u*(3-2*u)+duration*u*h*(v0*h-v1*u);
    }
    function glide(now){
      const t=Math.min(1,(now-begin)/8600);
      let offset;
      if(t<.14)offset=segment(0,departure,t,.14,0,firstSpeed);
      else if(t<.80)offset=segment(departure,landing,t-.14,.66,firstSpeed,lastSpeed);
      else offset=segment(landing,distance,t-.80,.20,lastSpeed,0);
      scrollTo({top:start+offset,behavior:'instant'});
      if(t<1){ascentFrame=requestAnimationFrame(glide);return;}
      ascentFrame=0;
      mkH.focus({preventScroll:true});
    }
    ascentFrame=requestAnimationFrame(glide);
  });

  var filmSection = $('#films');
  var filmPlayer = window.createFilmPlayer(films, {
    reducedMotion: reduce,
    world: W,
    onTune: function () { SND.crinkle(); },
    onDetails: function (film, origin) { openSheet(film, origin); }
  });
  function bindFilmApproach(){W()?.bindFilmApproach(filmApproach);onScroll();}
  if(W())bindFilmApproach();
  addEventListener('labworld:ready',bindFilmApproach);

  /* Website inquiries use the existing LaB contact Worker. */
  var inquiry = $('#slate'), submitInquiry = inquiry.querySelector('[type=submit]');
  inquiry.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (submitInquiry.disabled || !inquiry.reportValidity()) return;
    var fields = new FormData(inquiry);
    var kind = inquiry.querySelector('[name=kind]:checked').nextElementSibling.textContent;
    var payload = {
      name: fields.get('name').trim(),
      email: fields.get('email').trim(),
      message: 'Website inquiry · ' + kind + '\n\n' + fields.get('idea').trim(),
      company: fields.get('company')
    };
    submitInquiry.disabled = true;
    $('#contactFallback').hidden = true;
    $('#msg').textContent = 'Sending…';
    try {
      var response = await fetch(inquiry.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      });
      var result = await response.json();
      if (!response.ok || result.ok !== true) {
        $('#msg').textContent = result.error || 'Please try again.';
        $('#contactFallback').hidden = false;
        return;
      }
      inquiry.reset();
      $('#msg').textContent = 'Message sent. Thanks for reaching out.';
      SND.plip(.45);
    } catch (error) {
      $('#msg').textContent = 'Couldn’t reach the mailer. Your draft is still here.';
      $('#contactFallback').hidden = false;
    } finally {
      submitInquiry.disabled = false;
    }
  });

  onScroll();
})();
