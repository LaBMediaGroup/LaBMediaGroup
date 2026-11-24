'use strict';
// Tool controls on the bank. The planner and scene share the same solar calculation.
window.createFieldTools = function ({world,now,dayKey,live,lat,lon,reduced,onShuffle}) {
  const get=id=>document.getElementById(id);
  const section=get('tools'), tabs=[...section.querySelectorAll('[role=tab]')];
  const clock=get('sunClock'),play=get('sunPlay'),reset=get('sunReset');
  const timeFormat=new Intl.DateTimeFormat('en-US',{timeZone:'America/Detroit',hour:'numeric',minute:'2-digit'});
  const format=date=>timeFormat.format(date);
  let active='story', presence=0, solar=null, selected=null, animation=0, livePosition=null;
  let releaseFrame=0,lastSun=null,exit=0,carry=0,following=false;
  const ease=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
  const fridge=window.createStoryFridge({get,world,onShuffle});
  const surfaces=window.createStationSurfaces(section,world,()=>active);
  const chooser=get('chooseTool');
  function menu(open){chooser.setAttribute('aria-expanded',String(open));}
  chooser.addEventListener('click',()=>menu(chooser.getAttribute('aria-expanded')!=='true'));
  section.addEventListener('keydown',e=>{if(e.key==='Escape' && chooser.getAttribute('aria-expanded')==='true'){menu(false);chooser.focus();}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.tool-picker'))menu(false);});
  function solarDay() {
    const key=dayKey(now());
    if(solar?.key===key) return solar;
    if (!window.LaBSun) return null;
    const times=LaBSun.getDay(key,lat,lon);
    if(!times) return null;
    const start=+times.eveningGoldenStart-55*60000, end=+times.civilDusk;
    const midBearing=(LaBSun.position(new Date(start),lat,lon).azimuth+LaBSun.position(new Date(end),lat,lon).azimuth)/2;
    solar={key,times,start,end,midBearing};
    get('sunEarly').textContent=format(start);get('sunLate').textContent=format(end);
    return solar;
  }
  function pondHeading(pos) {
    const d=solarDay();
    if(!d || !pos || (active!=='sun' && active!=='flight'))return 11.46;
    const turn=((pos.azimuth-d.midBearing+47-11.46+540)%360)-180;
    return 11.46+turn*(active==='sun'?carry:presence);
  }
  function idle() {
    const d=solarDay();
    if(!d) return;
    get('sunWindow').textContent='Evening window '+format(d.times.eveningGoldenStart)+' – '+format(d.times.sunset);
    get('sunTime').textContent=format(now());
    get('sunBearing').textContent=livePosition?LaBSun.direction(livePosition.azimuth)+' · '+Math.round(livePosition.azimuth)+'°':'';

    get('sunPhase').textContent='Shelby Township · Live';
    clock.value=Math.max(0,Math.min(1000,Math.round((+now()-d.start)/(d.end-d.start)*1000)));
    clock.setAttribute('aria-valuetext','Live field, '+format(now()));
  }
  function stopPlay() {
    cancelAnimationFrame(animation);animation=0;
    play.textContent=reduced ? 'Show sunset' : 'Play sunset';
  }
  function writeLight(pos,weight){
    const offset=pos.azimuth-solarDay().midBearing+47;
    lastSun=[livePosition.elevation+(pos.elevation-livePosition.elevation)*weight,11.46+(offset-11.46)*weight];
    world()?.setSun(...lastSun);
  }
  function followExit(){
    const d=solarDay();if(!d || !livePosition)return;
    // Begin before the evening window so the field has a visible arc before
    // the sun meets the trees. The same clock drives the disc and reflection.
    const t=ease(.63,.995,exit);
    const preview=d.start+((+d.times.sunset-11*60000)-d.start)*t;
    if(active==='sun' && following){
      selected=preview;renderSun();
    }else if(active==='book' && !reduced){
      writeLight(LaBSun.position(new Date(preview),lat,lon),carry*ease(.18,.67,exit));
    }
  }
  function revealPanel(){
    section.toggleAttribute('data-looking-up',active==='sun' && following && exit<.67);
  }
  function setExit(value,light,underwater=false){
    exit=value;carry=light;
    revealPanel();
    if(selected!==null && light<.0001 && !underwater){clearSun();return;}
    if((active==='sun' && following) || active==='book')followExit();
    else if(selected!==null)renderSun();
    else if(active==='sun' && livePosition && !releaseFrame)world()?.setSun(livePosition.elevation,pondHeading(livePosition));
  }
  function renderSun() {
    const d=solarDay();
    if(selected===null || !d || !livePosition) return;
    const pos=LaBSun.position(new Date(selected),lat,lon);
    const phase=selected<+d.times.eveningGoldenStart?'Afternoon':selected<+d.times.sunset?'Golden hour':'Blue hour';
    get('sunPhase').textContent=phase+' preview';
    get('sunTime').textContent=format(selected);
    clock.value=Math.round((selected-d.start)/(d.end-d.start)*1000);
    clock.setAttribute('aria-valuetext',format(selected)+', '+phase);
    get('sunBearing').textContent=LaBSun.direction(pos.azimuth)+' · '+Math.round(pos.azimuth)+'°';
    reset.hidden=false;
    // Center the local evening arc on the station shot. The angular travel and
    // elevation come from the planner, with a smooth return to the live field.
    cancelAnimationFrame(releaseFrame);releaseFrame=0;
    writeLight(pos,carry*(following?ease(.18,.67,exit):1));
  }
  function clearSun() {
    const from=lastSun;following=false;revealPanel();
    stopPlay();selected=null;lastSun=null;reset.hidden=true;idle();
    cancelAnimationFrame(releaseFrame);releaseFrame=0;
    if(!from || !presence || reduced || document.hidden){live();return;}
    const start=performance.now();
    function release(t) {
      const u=Math.max(0,Math.min(1,(t-start)/650)), f=u*u*(3-2*u);
      world()?.setSun(from[0]+(livePosition.elevation-from[0])*f,from[1]+(pondHeading(livePosition)-from[1])*f);
      releaseFrame=u<1 ? requestAnimationFrame(release) : 0;
    }
    release(start);
  }
  clock.addEventListener('input',()=>{
    following=false;revealPanel();
    const d=solarDay();if(!d)return;
    stopPlay();selected=d.start+(d.end-d.start)*clock.valueAsNumber/1000;renderSun();
  });
  play.addEventListener('click',()=>{
    following=false;revealPanel();
    const d=solarDay();if(!d)return;
    if(animation) { stopPlay();return; }
    if(reduced) {selected=+d.times.sunset;renderSun();return;}
    const from=selected===null||selected>=d.end-60000?d.start:selected;
    const start=performance.now(),duration=9000*(d.end-from)/(d.end-d.start);
    play.textContent='Pause sunset';
    function frame(t) {
      const amount=Math.min(1,(t-start)/duration);
      selected=from+(d.end-from)*amount;renderSun();
      if(amount<1) animation=requestAnimationFrame(frame); else stopPlay();
    }
    frame(start);
  });
  reset.addEventListener('click',clearSun);
  const height=get('flightHeight');
  let flying=0;
  function stopFlight(){cancelAnimationFrame(flying);flying=0;get('flyShot').textContent=reduced?'Show aerial view':'Fly the reveal';}
  function flight() {
    const unavailable=document.documentElement.classList.contains('no-world');
    height.disabled=unavailable;get('flyShot').disabled=unavailable;
    get('flightNote').textContent=unavailable?'Open the simulator guide below.':height.valueAsNumber<3?'Start at eye level on the bank.':height.valueAsNumber<10?'Climb past the reeds and reveal the water.':'Hold the wide shot over the pond.';
    get('flightReadout').textContent=unavailable?'3D unavailable':(1.62+height.valueAsNumber).toFixed(1)+' m';
    height.setAttribute('aria-valuetext',get('flightReadout').textContent);
    world()?.setFieldTool(active,active==='flight'?height.valueAsNumber:0);
  }
  height.addEventListener('input',()=>{stopFlight();flight();});
  get('flyShot').addEventListener('click',()=>{
    if(flying){stopFlight();return;}
    if(reduced){height.value=height.valueAsNumber>=15.9?0:16;flight();return;}
    const start=performance.now(),from=height.valueAsNumber,to=from>=15.9?0:16;
    const duration=Math.max(750,Math.abs(to-from)*245);
    function step(t){
      const u=Math.min(1,(t-start)/duration);
      height.value=from+(to-from)*u*u*(3-2*u);flight();
      if(u<1){get('flyShot').textContent='Hold position';flying=requestAnimationFrame(step);}else stopFlight();
    }
    step(start);
  });
  const loaded=new Map();
  function load(file) {
    if(!loaded.has(file)) loaded.set(file,new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src='../'+file+'.js';s.onload=resolve;
      s.onerror=()=>{loaded.delete(file);reject(Error(file));};document.head.append(s);
    }));
    return loaded.get(file);
  }
  let bookIndex=0,eventIndex=0,engine,bookItem=null,bookDetail='';
  function kit() {try{const k=JSON.parse(localStorage.getItem('lab-kit')||'[]');return Array.isArray(k)?k:[];}catch{return [];}}
  function kitKey(item){return (item.id||item.name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
  function paintSave(){if(!bookItem)return;const saved=kit().includes(kitKey(bookItem));get('bookSave').setAttribute('aria-pressed',String(saved));get('bookSave').textContent=saved?'Saved to my kit':'Save to my kit';}
  get('bookSave').addEventListener('click',()=>{
    if(!bookItem)return;const key=kitKey(bookItem),previous=kit(),next=previous.includes(key)?previous.filter(k=>k!==key):previous.concat(key);
    try{localStorage.setItem('lab-kit',JSON.stringify(next));paintSave();}catch{get('bookSave').textContent='Storage unavailable';}
  });
  addEventListener('storage',e=>{if(e.key==='lab-kit')paintSave();});
  function notebook(direction=0) {
    if(active!=='book')return;
    const entries=(window.LaBResources||[]).filter(item=>item.category===get('bookTopic').value);
    if(!entries.length)return;
    bookIndex=(bookIndex%entries.length+entries.length)%entries.length;
    const item=entries[bookIndex],name=get('bookName');
    name.textContent=item.name;name.href=item.url;name.target='_blank';name.rel='noopener';
    bookItem=item;bookDetail=item.desc||'';paintSave();get('bookDesc').textContent=bookDetail;
    world()?.setNotebookPage?.(item.name,get('bookTopic').selectedOptions[0].textContent,bookDetail,typeof direction==='number'?direction:0);
    get('bookPrev').disabled=get('bookNext').disabled=entries.length<2;
  }
  get('bookTopic').addEventListener('change',()=>{bookIndex=0;notebook()});
  function turnPage(direction){bookIndex+=direction;notebook(direction);}
  get('bookNext').addEventListener('click',()=>turnPage(1));
  get('bookPrev').addEventListener('click',()=>turnPage(-1));
  function events() {
    const today=dayKey(new Date()),all=window.SPOTLIGHT||[];
    const upcoming=all.filter(e=>(e.until||e.date)>=today).sort((a,b)=>a.date.localeCompare(b.date));
    const past=all.filter(e=>(e.until||e.date)<today).sort((a,b)=>b.date.localeCompare(a.date));
    const list=upcoming.concat(past);
    if(!list.length){get('eventDate').textContent='No dated listings';get('eventNext').disabled=true;return;}
    const entry=list[eventIndex%list.length],name=get('eventName');
    name.textContent=entry.title.replace(/<[^>]*>/g,'');name.href='../events.html#event-'+entry.id;
    const date=new Date(entry.date+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'America/Detroit',month:'short',day:'numeric',year:'numeric'});
    get('eventDate').textContent=((entry.until||entry.date)<today?'From the archive':'On the calendar')+' · '+date;
    get('eventWhere').textContent=entry.where||entry.venue||entry.by||'';
    if(active==='events')world()?.setNotebookPage?.(name.textContent,'Michigan events',get('eventDate').textContent);
    get('eventNext').disabled=list.length<2;
  }
  get('eventNext').addEventListener('click',()=>{eventIndex++;events()});
  get('fieldAsk').addEventListener('submit',async e=>{
    e.preventDefault();
    const query=get('fieldQuery').value.trim();if(!query)return;
    const box=get('fieldAnswer');box.hidden=false;box.textContent='Searching the index…';
    try {
      await Promise.all(['assistant-core','assistant-data','gear-data','resources-data','spotlight-data'].map(load));
      engine??=LaBAssistantCore.createEngine({knowledge:window.LAB_ASSISTANT_KNOWLEDGE,resources:window.LaBResources,gearData:window.gearData,spotlight:window.SPOTLIGHT});
      if(get('fieldQuery').value.trim()!==query)return;
      const answer=engine.ask(query);
      box.textContent=answer.answer;
      if(active==='ask')world()?.setNotebookPage?.(query,'Ask the LaB',answer.answer);
      if(answer.sources?.length) {
        const link=document.createElement('a'),source=answer.sources[0];
        link.href=new URL(source.url,new URL('../',document.baseURI));link.textContent=source.title+' ↗';box.append(document.createElement('br'),link);
      }
    }catch{box.textContent='The index is unavailable. Open the assistant below.';}
  });
  function select(tab,focus=false) {
    const wasOpen=chooser.getAttribute('aria-expanded')==='true';
    const bounds=section.getBoundingClientRect();
    if(bounds.top>innerHeight*.09 || bounds.bottom<innerHeight*.86)section.scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});
    const prior=active;
    active=tab.dataset.tool;menu(false);
    const pond=active==='sun'||active==='flight';
    section.dataset.place=pond?'pond':'shed';section.dataset.instrument=active;
    get('choicePlace').textContent=pond?'Over the pond':'Inside the shed';
    get('choiceName').textContent=tab.textContent;
    if(active!=='flight')stopFlight();
    if(active==='story')fridge.refresh();
    if(active==='sun' && selected===null && presence>.5){
      const d=solarDay();
      if(d){
        following=!reduced && !!world() && prior!=='flight' && exit<.98;
        if(following)followExit();else{selected=+d.times.eveningGoldenStart;renderSun();}
      }
    }
    if(active==='ask')world()?.setNotebookPage?.(get('fieldQuery').value||'Ask the LaB','Index',get('fieldAnswer').textContent);

    if(selected!==null && active!=='sun') clearSun();
    revealPanel();
    tabs.forEach(item=>{
      const current=item===tab;item.setAttribute('aria-selected',String(current));item.tabIndex=current?0:-1;
      get(item.getAttribute('aria-controls')).hidden=!current;
    });
    if(wasOpen && chooser.offsetWidth)chooser.focus({preventScroll:true});else if(focus)tab.focus({preventScroll:true});
    flight();
    if(livePosition && selected===null && !releaseFrame)world()?.setSun(livePosition.elevation,pondHeading(livePosition));
    if(active==='book')load('resources-data').then(notebook).catch(()=>{get('bookDesc').textContent='Open the notebook to browse its resources.'});
    if(active==='events')load('spotlight-data').then(events).catch(()=>{get('eventWhere').textContent='Open Michigan events to browse listings.'});
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',e=>{
      const keys={ArrowLeft:(i+tabs.length-1)%tabs.length,ArrowRight:(i+1)%tabs.length,Home:0,End:tabs.length-1};
      if(keys[e.key]!==undefined){e.preventDefault();select(tabs[keys[e.key]],true);}
    });
  });
  let pageGesture=null,ignoreClickUntil=0;
  function pageSide(hit){return hit==='book:prev'||hit==='book:next';}
  section.addEventListener('pointerdown',e=>{
    if(!e.isPrimary || active!=='book' || e.target.closest('button,a,input,select'))return;
    if(pageSide(world()?.pickStation?.(e.clientX,e.clientY)))pageGesture={id:e.pointerId,x:e.clientX,y:e.clientY};
  });
  section.addEventListener('pointercancel',()=>{pageGesture=null;});
  section.addEventListener('pointerup',e=>{
    if(!pageGesture||pageGesture.id!==e.pointerId)return;
    const dx=e.clientX-pageGesture.x,dy=e.clientY-pageGesture.y;pageGesture=null;
    if(Math.abs(dx)>32 && Math.abs(dx)>Math.abs(dy)*1.4){
      ignoreClickUntil=performance.now()+450;turnPage(dx<0?1:-1);
    }
  });
  section.addEventListener('click',e=>{
    if(e.target.closest('button,a,input,select,.tool-picker')||presence<.6||performance.now()<ignoreClickUntil)return;
    const hit=world()?.pickStation?.(e.clientX,e.clientY);
    if(typeof hit!=='string')return;
    if(hit.startsWith('word:') && active==='story')fridge.toggleWord(Number(hit.slice(5)));
    else if(hit.startsWith('field:') && active==='story')fridge.pickField(hit.slice(6));
    else if(hit==='story' && active!=='story')select(get('tab-story'));
    else if(pageSide(hit)){if(active==='book')turnPage(hit==='book:next'?1:-1);else select(get('tab-book'));}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopPlay();stopFlight();}});

  stopPlay();stopFlight();idle();flight();surfaces.connect();world()?.bindFieldExit(setExit);
  return {
    setLive(pos){livePosition=pos;if(active==='book' && exit>0 && carry>0 && !reduced){followExit();return true;}if(selected!==null){renderSun();return true;}idle();if(releaseFrame)return true;
      if(presence>0 && (active==='sun'||active==='flight')){world()?.setSun(pos.elevation,pondHeading(pos));return true;}return false;},
    setPresence(value,light){
      if(!world())setExit(exit,light);
      if(value===presence)return;
      presence=value;
      if(active==='flight' && livePosition && !releaseFrame)world()?.setSun(livePosition.elevation,pondHeading(livePosition));
      if(value===0){menu(false);stopFlight();height.value=0;flight();}
    },
    syncWorld(){world()?.bindFieldExit(setExit);surfaces.connect();flight();fridge.refresh();if(active==='book')notebook();if(selected!==null)renderSun();}
  };
};
