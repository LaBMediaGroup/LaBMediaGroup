(function(){
  'use strict';
  if(!window.LaBSun)return;

  var REDUCED=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  var state={lat:42.67,lon:-83.03,label:'Shelby Township, MI',timeZone:'America/Detroit',day:null,wind:7,gust:11,cloud:0,cloudOverride:null,weatherReady:false};
  var $=function(id){return document.getElementById(id)};
  var dateInput=$('sunDate'), slider=$('timeSlider'), stage=$('sunStage'), orb=$('sunOrb'), moon=$('moonOrb'), moonFace=$('moonFace');
  var phaseVal=$('phaseVal'), tempVal=$('tempVal'), elevVal=$('elevVal'), azimVal=$('azimVal');
  var advice=$('advicePhrase'), adviceA11y=$('adviceA11y'), timeVal=$('timeVal'), skyTime=$('skyTime'), dateLabel=$('dateLabel'), locationLabel=$('locationLabel'), moonPhaseLabel=$('moonPhaseLabel');
  var adviceTimer=null,lastAdviceKey='';

  var phaseCopy={
    'night':{
      label:'Night',temp:'Practical light',
      notes:[
        'Let darkness stay dark. Build the frame around the light that is already there.',
        'Scout the practicals first. A window, a porch light, or one good pool can carry the scene.',
        'Let the brightest practical choose the blocking, then simplify everything around it.',
        'Fast glass buys exposure. Restraint buys atmosphere.',
        'Protect the highlights and give the shadows permission to disappear.',
        'Night rewards one deliberate source more than five nervous ones.',
        'Use the dark as negative space. The frame does not need light everywhere.'
      ],
      preDawnNotes:[
        'The night is quietest now. Take the empty frame before the first blue arrives.',
        'Streetlights still own the palette. Let their color stay honest.',
        'Build the silhouette now; dawn will begin separating the edges soon.',
        'Keep the setup small and ready to turn toward the brightening horizon.',
        'Practical light is fading in importance. Watch the ambient level between takes.',
        'Blue hour is close. Finish the night insert and prepare the wider frame.'
      ],
      best:'Fast glass · practicals · controlled pools of light'
    },
    'blue-dawn':{
      label:'Dawn Blue Hour',temp:'8,500–11,000K',
      notes:[
        'The world is still asleep. Start with the frame that needs the empty street.',
        'The first color is barely there. Give the sky room before it announces itself.',
        'Expose for the blue and let windows carry the warmth.',
        'Silhouettes read cleanest before the horizon turns bright.',
        'Hold the cool sky. The color separation is the shot.',
        'Faces are beginning to separate from the shadows. Save the close-up for this edge.'
      ],
      best:'City texture · silhouettes · quiet establishing shots'
    },
    'golden-morning':{
      label:'Morning Golden Hour',temp:'2,800–4,200K',
      notes:[
        'The first warm edge is here. Put it behind the subject and let it draw the shape.',
        'Low, clean light; cool world behind it. This is the quiet version of gold.',
        'Rake the light across texture now. Every surface has more depth at this angle.',
        'Turn faces just off-axis. Keep the softness and find the catchlight.',
        'The shadows are long and the air is calm. Move before either one changes.',
        'The gold is thinning. Finish the backlit frame before the light turns ordinary.'
      ],
      best:'Skin tone · rim light · long shadows · calm air'
    },
    'daylight':{
      label:'Daylight',temp:'5,200–5,800K',
      notes:[
        'The soft window has closed. Find open shade before you build more light.',
        'Morning still has direction. Use the side light before it climbs overhead.',
        'Hard light is not a problem if the frame admits that it is hard.',
        'Watch the eyes. Top light tells on a face before it tells on the meter.',
        'Diffusion for people; contrast for architecture. Choose what the sun is doing for you.',
        'The sun is high. Scout now, then save the hero setup for the falling light.',
        'At the top of the arc, simplify the palette and let clean geometry do the work.',
        'Use the shadow line as composition, not something to apologize for.',
        'The light has started leaning again. Look for depth returning to the background.',
        'Golden hour is next. Lock the blocking now so the good light belongs to the take.'
      ],
      best:'Architecture · controlled contrast · scouting'
    },
    'golden-evening':{
      label:'Evening Golden Hour',temp:'2,600–4,000K',
      notes:[
        'The warmth is arriving. Set the wide frame before the light becomes precious.',
        'The light is beginning to rake. Turn texture toward it and let the shadows stretch.',
        'Backlight the face and let the flare live at the edge, not the center.',
        'This is the hero window. Shoot the move while the shadows still have length.',
        'Warmth is peaking now. Favor skin, glass, and anything that can hold the edge.',
        'The light is going faster than it looks. Protect the setup you cannot fake later.',
        'The sun is nearly gone. Take the silhouette before the scene becomes blue.'
      ],
      best:'Hero exteriors · flare · movement · warm skin tone'
    },
    'blue-dusk':{
      label:'Dusk Blue Hour',temp:'8,500–11,000K',
      notes:[
        'Do not wrap at sunset. The richest color separation happens just after it.',
        'The sky is cooling while the practicals wake up. Let both stay visible.',
        'Balance for the sky, then bring the practicals up only enough to belong.',
        'Hold the silhouette and wait for the windows to become part of the frame.',
        'The blue is deepening. Glass, chrome, and wet pavement will keep it alive.',
        'One last setup. Make it the one that needs the sky.'
      ],
      best:'Practical lights · skyline · windows · silhouettes'
    }
  };
  var cloudNotes={
    golden:[
      'The solar window is golden, but the cloud deck has turned it into a soft source. Expose for faces, not flare.',
      'Golden hour is geometric right now; the visible light is cool and heavily diffused.',
      'Use the even sky as a giant source. Watch the horizon for one brief warm break.',
      'The low sun still gives direction, but the clouds have removed the hard edge. Look for quiet separation.'
    ],
    daylight:[
      'The cloud deck is doing the diffusion. Build shape with blocking and background tone.',
      'Soft overhead light is holding contrast down. Use color and depth to separate the subject.',
      'The sky is one broad source now. Faces will stay even; reflective surfaces need the attention.',
      'Overcast light buys continuity. Spend it on coverage that would reveal changing sun.'
    ],
    blue:[
      'The cloud layer is deepening the blue. Let practicals provide the warmth the horizon cannot.',
      'Twilight is heavily diffused tonight. Protect the cool ambience and create your own warm edge.',
      'The sky is muted, but the exposure is even. Use windows and practicals for separation.'
    ]
  };

  function pad(n){return String(n).padStart(2,'0')}
  function zoneParts(date,timeZone){
    var out={};
    new Intl.DateTimeFormat('en-US',{timeZone:timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})
      .formatToParts(date).forEach(function(part){if(part.type!=='literal')out[part.type]=Number(part.value)});
    return out;
  }
  function iso(date,timeZone){
    var p=zoneParts(date,timeZone);
    return p.year+'-'+pad(p.month)+'-'+pad(p.day);
  }
  function calendarDate(value){
    var p=String(value).split('-').map(Number);
    return new Date(Date.UTC(p[0],p[1]-1,p[2],12,0,0));
  }
  function onSelectedDate(minutes){
    var p=dateInput.value.split('-').map(Number);
    var desired=Date.UTC(p[0],p[1]-1,p[2],Math.floor(minutes/60),minutes%60,0);
    var stamp=desired;
    /* Convert a wall-clock time in the selected location into a real UTC
       instant. A second pass handles daylight-saving offsets at the edge. */
    for(var i=0;i<2;i++){
      var seen=zoneParts(new Date(stamp),state.timeZone);
      stamp+=desired-Date.UTC(seen.year,seen.month-1,seen.day,seen.hour,seen.minute,seen.second);
    }
    return new Date(stamp);
  }
  function minutes(date){var p=zoneParts(date,state.timeZone);return p.hour*60+p.minute}
  function fmt(date){return date?date.toLocaleTimeString([],{hour:'numeric',minute:'2-digit',timeZone:state.timeZone}):'—'}
  function fmtMinutes(value){
    var d=onSelectedDate(value);
    return fmt(d);
  }
  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function duration(mins){
    var h=Math.floor(mins/60),m=mins%60;
    return (h?h+'h ':'')+m+'m';
  }
  function isToday(){return dateInput.value===iso(new Date(),state.timeZone)}

  function cloudCover(){
    if(!isToday())return 0;
    if(Number.isFinite(state.cloudOverride))return clamp(state.cloudOverride,0,100);
    return state.weatherReady?clamp(state.cloud,0,100):0;
  }
  function cloudCharacter(value){
    if(value>=85)return 'Overcast now';
    if(value>=60)return 'Heavily filtered now';
    if(value>=30)return 'Broken cloud now';
    if(value>=12)return 'Light cloud now';
    return 'Clear now';
  }
  function cloudTransmission(){return clamp(1-cloudCover()/100*.92,.08,1)}

  function drawMoonPhase(info){
    if(!moonFace||!info)return;
    var ctx=moonFace.getContext('2d'),size=40,radius=18,cx=20,cy=20;
    var angle=info.fraction*Math.PI*2,sunX=Math.sin(angle),sunZ=-Math.cos(angle);
    ctx.clearRect(0,0,size,size);
    function litAt(x,y){
      var nx=(x+.5-cx)/radius,ny=(y+.5-cy)/radius,rr=nx*nx+ny*ny;
      if(rr>1)return null;
      return nx*sunX-Math.sqrt(Math.max(0,1-rr))*Math.cos(angle)>0;
    }
    for(var y=0;y<size;y++)for(var x=0;x<size;x++){
      var lit=litAt(x,y);if(lit===null)continue;
      ctx.fillStyle=lit?'#d7e0ea':'#273247';
      ctx.fillRect(x,y,1,1);
    }
    [[14,13,2],[25,18,2],[18,27,1],[28,28,1]].forEach(function(crater){
      for(var py=-crater[2];py<=crater[2];py++)for(var px=-crater[2];px<=crater[2];px++){
        if(px*px+py*py>crater[2]*crater[2])continue;
        var x=crater[0]+px,y=crater[1]+py;if(litAt(x,y)!==true)continue;
        ctx.fillStyle='rgba(91,107,132,.38)';ctx.fillRect(x,y,1,1);
      }
    });
  }

  function placeMoon(value,moment){
    if(!moon||!window.LaBSun.moonPhase||!window.LaBSun.moonArc)return;
    var info=LaBSun.moonPhase(moment),solarNoon=minutes(state.day.solarNoon);
    /* Approximate the moon's daily arc from its phase offset relative to the
       sun. It is intentionally a visual planner cue, not a rise/set ephemeris. */
    var arc=LaBSun.moonArc(value,solarNoon,info.fraction);
    var visible=arc.aboveHorizon&&info.illumination>.018;
    moon.style.left=(4+arc.progress*92)+'%';
    moon.style.top=(89-Math.sin(arc.progress*Math.PI)*61)+'%';
    moon.style.setProperty('--moon-opacity',(arc.edgeOpacity*cloudTransmission()).toFixed(3));
    stage.dataset.moon=visible?'visible':'hidden';
    drawMoonPhase(info);
    if(moonPhaseLabel){
      moonPhaseLabel.hidden=!visible;
      moonPhaseLabel.textContent=info.label+' · '+Math.round(info.illumination*100)+'% moon';
    }
  }

  function colorTemperature(elevation,phase){
    if(phase==='night')return null;
    if(phase.indexOf('blue')===0)return Math.round(9000+Math.abs(elevation)*280);
    if(phase.indexOf('golden')===0)return Math.round(clamp(2850+Math.max(0,elevation)*210,2850,4300));
    return Math.round(clamp(5000+elevation*20,5200,5800));
  }

  function phaseRange(id,start,end,target){
    var button=$(id),time=button&&button.querySelector('.phase-time');
    if(!button||!time)return;
    time.textContent=fmt(start)+' – '+fmt(end);
    button.dataset.minute=String(minutes(target||new Date((start.getTime()+end.getTime())/2)));
  }

  function adviceWindow(phase,value){
    var day=state.day;
    if(phase==='blue-dawn')return [minutes(day.civilDawn),minutes(day.sunrise)];
    if(phase==='golden-morning')return [minutes(day.sunrise),minutes(day.morningGoldenEnd)];
    if(phase==='daylight')return [minutes(day.morningGoldenEnd),minutes(day.eveningGoldenStart)];
    if(phase==='golden-evening')return [minutes(day.eveningGoldenStart),minutes(day.sunset)];
    if(phase==='blue-dusk')return [minutes(day.sunset),minutes(day.civilDusk)];
    return value<minutes(day.civilDawn)
      ? [0,minutes(day.civilDawn)]
      : [minutes(day.civilDusk),1439];
  }

  function adviceChoice(value,phase,copy){
    var range=adviceWindow(phase,value),span=Math.max(1,range[1]-range[0]);
    var beforeDawn=phase==='night'&&value<minutes(state.day.civilDawn);
    var clouds=cloudCover(),cloudPool=clouds>=60?(phase.indexOf('golden')===0?cloudNotes.golden:(phase==='daylight'?cloudNotes.daylight:(phase.indexOf('blue')===0?cloudNotes.blue:null))):null;
    var pool=cloudPool||(beforeDawn?copy.preDawnNotes:copy.notes);
    var progress=clamp((value-range[0])/span,0,.9999);
    var index=Math.min(pool.length-1,Math.floor(progress*pool.length));
    return {key:phase+':'+(cloudPool?'cloud:':(beforeDawn?'pre:':'post:'))+index,text:pool[index],pool:pool};
  }

  function paintAdvice(text,accentEnding){
    while(advice.firstChild)advice.removeChild(advice.firstChild);
    advice.appendChild(document.createTextNode('“'));
    var words=String(text).trim().split(/\s+/),tail=accentEnding?Math.min(3,Math.max(2,Math.floor(words.length/5))):0;
    if(tail&&words.length>tail){
      advice.appendChild(document.createTextNode(words.slice(0,-tail).join(' ')+' '));
      var ending=document.createElement('em');ending.className='advice-accent';ending.textContent=words.slice(-tail).join(' ');advice.appendChild(ending);
    }else advice.appendChild(document.createTextNode(words.join(' ')));
    advice.appendChild(document.createTextNode('”'));
  }

  function rollAdvice(choice,pool){
    if(choice.key===lastAdviceKey)return;
    lastAdviceKey=choice.key;
    if(adviceTimer){clearInterval(adviceTimer);adviceTimer=null;}
    var settle=function(){
      advice.classList.remove('spin');
      paintAdvice(choice.text,true);
      adviceA11y.textContent=choice.text;
    };
    if(REDUCED){settle();return;}
    advice.classList.add('spin');
    var frame=0;
    adviceTimer=setInterval(function(){
      paintAdvice(pool[(Math.random()*pool.length)|0],false);
      if(++frame>=7){clearInterval(adviceTimer);adviceTimer=null;settle();}
    },55);
  }

  function renderDay(preserveTime){
    state.day=LaBSun.getDay(dateInput.value,state.lat,state.lon);
    if(!state.day){
      $('plannerStatus').textContent='Solar windows are unavailable at this latitude on this date.';
      return;
    }

    var d=calendarDate(dateInput.value);
    dateLabel.textContent=d.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric',timeZone:'UTC'});
    locationLabel.textContent=state.label+' · '+Math.abs(state.lat).toFixed(2)+'°'+(state.lat>=0?'N':'S');
    $('sunriseVal').textContent=fmt(state.day.sunrise);
    $('sunsetVal').textContent=fmt(state.day.sunset);
    $('daylightVal').textContent=duration(state.day.daylightMinutes);
    $('noonVal').textContent=fmt(state.day.solarNoon);
    $('maxElevVal').textContent=Math.round(state.day.maxElevation)+'°';

    phaseRange('dawnBlue',state.day.civilDawn,state.day.sunrise);
    phaseRange('morningGold',state.day.sunrise,state.day.morningGoldenEnd);
    phaseRange('eveningGold',state.day.eveningGoldenStart,state.day.sunset);
    phaseRange('duskBlue',state.day.sunset,state.day.civilDusk);

    if(!preserveTime){
      slider.value=isToday()
        ? String(minutes(new Date()))
        : String(minutes(new Date((state.day.eveningGoldenStart.getTime()+state.day.sunset.getTime())/2)));
    }
    renderTime(Number(slider.value));
    $('plannerStatus').textContent='Solar windows calculated locally · times shown in '+state.timeZone+'. No location or date leaves this browser.';
    try{
      var url=new URL(location.href);url.searchParams.set('date',dateInput.value);
      history.replaceState(null,'',url.pathname+'?'+url.searchParams.toString());
    }catch(e){}
  }

  function renderTime(value){
    if(!state.day)return;
    var moment=onSelectedDate(value),pos=LaBSun.position(moment,state.lat,state.lon);
    var phase=LaBSun.phaseAt(moment,state.day),copy=phaseCopy[phase];
    var kelvin=colorTemperature(pos.elevation,phase);
    var x=clamp((pos.azimuth-70)/220*100,3,97);
    var horizonY=89;
    var y=pos.elevation>=0
      ? horizonY-clamp(pos.elevation/Math.max(12,state.day.maxElevation),0,1)*77
      : horizonY+clamp(-pos.elevation/6,0,1)*10;
    var sunOpacity=clamp((pos.elevation+2.2)/2.2,0,1);
    var clouds=cloudCover(),transmission=cloudTransmission();
    if(kelvin&&clouds>0)kelvin=Math.round(kelvin+(6500-kelvin)*(clouds/100*.82));

    stage.dataset.phase=phase;
    stage.dataset.sun=sunOpacity>.01?'visible':'hidden';
    stage.dataset.cloud=cloudCharacter(clouds).toLowerCase().replace(/\s+/g,'-');
    stage.dataset.cloudCover=String(Math.round(clouds));
    stage.dataset.cloudTransmission=transmission.toFixed(3);
    stage.style.setProperty('--cloud-opacity',(clouds/100*.95).toFixed(3));
    orb.style.setProperty('--sun-opacity',(sunOpacity*transmission).toFixed(3));
    orb.style.left=x+'%';orb.style.top=y+'%';
    placeMoon(value,moment);
    timeVal.textContent=fmtMinutes(value);
    skyTime.textContent=timeVal.textContent;
    phaseVal.textContent=copy.label+(state.weatherReady&&isToday()?' · '+cloudCharacter(clouds):'');
    $('lightVal').textContent=phase==='night'?'Artificial':(clouds>=85?'Diffused':(clouds>=60?'Filtered':(phase.indexOf('blue')===0?'Mixed':'Natural')));
    tempVal.innerHTML=kelvin?kelvin.toLocaleString()+'<small>K est.</small>':'<span>Practical</span>';
    elevVal.innerHTML=(pos.elevation>=0?'+':'')+pos.elevation.toFixed(1)+'<small>°</small>';
    azimVal.innerHTML=Math.round(pos.azimuth)+'<small>° '+LaBSun.direction(pos.azimuth)+'</small>';
    var choice=adviceChoice(value,phase,copy);
    rollAdvice(choice,choice.pool);
    $('bestFor').textContent=clouds>=60?'Soft faces · continuity · muted contrast':copy.best;
    $('selectedMoment').textContent=dateLabel.textContent+' · '+timeVal.textContent;

    document.querySelectorAll('.phase-card').forEach(function(button){
      var start=Number(button.dataset.minute||-1),active=Math.abs(start-value)<45;
      button.classList.toggle('is-near',active);
    });
  }

  function shiftDate(days){
    var d=calendarDate(dateInput.value);d.setUTCDate(d.getUTCDate()+days);dateInput.value=iso(d,'UTC');renderDay(false);
  }

  function copyPlan(){
    if(!state.day)return;
    var text=[
      'LaB light plan · '+dateLabel.textContent,
      state.label,
      'Dawn blue: '+fmt(state.day.civilDawn)+' – '+fmt(state.day.sunrise),
      'Morning gold: '+fmt(state.day.sunrise)+' – '+fmt(state.day.morningGoldenEnd),
      'Evening gold: '+fmt(state.day.eveningGoldenStart)+' – '+fmt(state.day.sunset),
      'Dusk blue: '+fmt(state.day.sunset)+' – '+fmt(state.day.civilDusk),
      'Daylight: '+duration(state.day.daylightMinutes)+' · Solar noon: '+fmt(state.day.solarNoon)
    ].join('\n');
    var done=function(){
      $('copyPlan').textContent='Copied';
      setTimeout(function(){$('copyPlan').textContent='Copy day plan'},1600);
    };
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done).catch(function(){});
  }

  var windRequest=0;
  function refreshWind(){
    var request=++windRequest,readout=$('sunWind');
    if(readout)readout.textContent='Checking current wind';
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(state.lat)+'&longitude='+encodeURIComponent(state.lon)+'&current=wind_speed_10m,wind_gusts_10m,cloud_cover&wind_speed_unit=mph&timezone=auto')
      .then(function(response){return response.json()})
      .then(function(data){
        if(request!==windRequest||!data||!data.current)return;
        state.wind=Math.round(Number(data.current.wind_speed_10m)||0);
        state.gust=Math.round(Number(data.current.wind_gusts_10m)||state.wind);
        state.cloud=clamp(Math.round(Number(data.current.cloud_cover)||0),0,100);
        state.weatherReady=true;
        if(readout)readout.textContent='Current wind '+state.wind+' · gust '+state.gust+' mph · cloud '+Math.round(cloudCover())+'%';
        renderTime(Number(slider.value));
        window.dispatchEvent(new Event('lab:sun-wind'));
      }).catch(function(){if(readout)readout.textContent='Treetops using a light breeze'});
  }

  function initNatureScene(){
    var canvas=$('sunNatureCanvas');if(!canvas)return;
    var context=canvas.getContext('2d'),buffer=document.createElement('canvas'),paint=buffer.getContext('2d');
    var width=0,height=0,bw=0,bh=0,bit=4,time=0,lastFrame=0,visible=true,raf=null;
    var birds=[
      {x:.08,y:.24,s:.00021,p:0,z:1},
      {x:.17,y:.18,s:.00016,p:2.2,z:1},
      {x:.62,y:.29,s:.00023,p:4.1,z:1.7},
      {x:.72,y:.22,s:.00018,p:1.3,z:1}
    ];
    /* The night shift. Bats are faster than the birds and do not hold a line,
       so their height is two sine waves fighting each other rather than one
       gentle one. The owl is the opposite: one of it, slow, mostly gliding,
       crossing well above the treeline. */
    var bats=[
      {x:.21,y:.30,s:.00036,p:.6,z:1},
      {x:.47,y:.23,s:.00043,p:2.9,z:1},
      {x:.74,y:.34,s:.00039,p:5.0,z:1}
    ];
    var owl={x:-.14,y:.19,s:.00013,p:1.1,z:2};
    function pixel(x,y,w,h,color){paint.fillStyle=color;paint.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
    function resize(){
      var rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
      width=Math.round(rect.width);height=Math.round(rect.height);var dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);
      bit=width<520?3:4;bw=Math.ceil(width/bit);bh=Math.ceil(height/bit);buffer.width=bw;buffer.height=bh;requestDraw();
    }
    function treeTip(cx,baseY,treeH,maxHalf,bend,opacity){
      var apex=baseY-treeH,color='rgba(5,10,13,'+opacity+')',shade='rgba(5,10,13,'+(opacity*.54)+')';
      for(var y=apex;y<=baseY;y++){
        var f=(y-apex)/treeH,half=0;
        [[0,.52,.55],[.24,.78,.8],[.52,1,1]].forEach(function(tier){
          if(f>=tier[0]&&f<=tier[1])half=Math.max(half,Math.round(maxHalf*tier[2]*(f-tier[0])/(tier[1]-tier[0])));
        });
        var shear=Math.round(bend*Math.pow(1-f,2)*6*(.75+.25*Math.sin(time*1.7+f*4)));
        pixel(cx-half+shear,y,half*2+1,1,((y-apex)%4===0)?shade:color);
      }
    }
    function requestDraw(){
      if(!width||!height)return;
      if(REDUCED){draw();return;}
      if(visible&&!raf)raf=requestAnimationFrame(draw);
    }
    function draw(stamp){
      raf=null;if(!width||!height)return;
      if(!REDUCED){
        var elapsed=lastFrame?clamp((stamp-lastFrame)/1000,0,.05):1/60;
        time+=elapsed;lastFrame=stamp;
      }
      paint.clearRect(0,0,bw,bh);
      var phase=stage.dataset.phase||'daylight';
      var night=phase==='night',wind=clamp(state.wind/24,0,.9),headroom=clamp((state.gust-state.wind)/16,0,1);
      var gust=(Math.sin(time*.7)+Math.sin(time*1.83+1.2))*.14*headroom;
      var bend=wind+gust,base=bh+3;
      treeTip(Math.round(bw*.11),base,Math.round(bh*.25),Math.round(bw*.038),bend*.75,night?.86:.72);
      treeTip(Math.round(bw*.50),base,Math.round(bh*.18),Math.round(bw*.032),bend*1.05,night?.8:.66);
      treeTip(Math.round(bw*.68),base,Math.round(bh*.26),Math.round(bw*.040),bend*.98,night?.84:.69);
      treeTip(Math.round(bw*.78),base,Math.round(bh*.40),Math.round(bw*.056),bend*.82,night?.94:.80);
      treeTip(Math.round(bw*.88),base,Math.round(bh*.32),Math.round(bw*.045),bend*.9,night?.9:.76);
      if(!night&&state.wind<22){
        var birdColor='rgba(6,10,13,.68)';
        birds.forEach(function(bird){
          if(!REDUCED)bird.x+=bird.s*(1+wind*1.35);
          if(bird.x>1.08)bird.x=-.08;
          var size=Math.max(1,Math.round(bird.z)),x=Math.round(bird.x*bw);
          var y=Math.round((bird.y+Math.sin(time*.72+bird.p)*.006)*bh);
          var flap=Math.sin(time*4.4+bird.p)>-.15?-1:1;
          pixel(x-size*3,y+flap*size,size*2,size,birdColor);
          pixel(x-size,y,size*2,size,birdColor);
          pixel(x+size,y+flap*size,size*2,size,birdColor);
        });
      }
      if(night&&state.wind<18){
        /* The night sky is not one colour, so neither is the night shift. On a
           clear night it drops to near-black and a dark silhouette vanishes,
           so the fliers catch moonlight and read pale. Under a full deck the
           same sky lifts to a grey that pale wings disappear into, so they go
           back to being silhouettes. Cross-fade between the two on cloud. */
        var deck=clamp(cloudCover()/100,0,1);
        var nightColor=deck>.55
          ? 'rgba(18,26,38,'+(.42+deck*.30).toFixed(2)+')'
          : 'rgba(201,214,234,'+(.52-deck*.16).toFixed(2)+')';
        bats.forEach(function(bat){
          if(!REDUCED)bat.x+=bat.s*(1+wind*1.1);
          if(bat.x>1.08)bat.x=-.08;
          var bs=Math.max(1,Math.round(bat.z)),bx=Math.round(bat.x*bw);
          var by=Math.round((bat.y+Math.sin(time*2.4+bat.p)*.03+Math.sin(time*5.9+bat.p*2)*.013)*bh);
          // wings are held above the body and beat roughly three times a second
          var bf=Math.sin(time*13+bat.p)>0?bs:0;
          pixel(bx-bs*3,by-bf,bs*2,bs,nightColor);
          pixel(bx-bs,by,bs*2,bs,nightColor);
          pixel(bx+bs,by-bf,bs*2,bs,nightColor);
        });
        if(!REDUCED)owl.x+=owl.s*(1+wind*.55);
        if(owl.x>1.2)owl.x=-.2;
        var os=Math.max(1,Math.round(owl.z)),ox=Math.round(owl.x*bw);
        var oy=Math.round((owl.y+Math.sin(time*.38+owl.p)*.012)*bh);
        // mostly a glide, with a slow beat every few seconds
        var of=Math.sin(time*1.6)>.62?os:0;
        pixel(ox-os*4,oy-of,os*3,os,nightColor);
        pixel(ox-os,oy-1,os*3,os+1,nightColor);
        pixel(ox+os*2,oy-of,os*3,os,nightColor);
      }
      if(state.wind>5){
        var lines=Math.min(9,Math.round(state.wind/2.4));
        for(var i=0;i<lines;i++){
          var drift=((time*(.045+i*.004)+i*.137)%1)*bw;
          var streak=Math.max(4,Math.round(state.wind/3)+(i%3));
          pixel(drift,Math.round(bh*(.13+(i*.119)%0.56)),streak,1,'rgba(255,255,255,.15)');
          if(drift+streak>bw)pixel(drift-bw,Math.round(bh*(.13+(i*.119)%0.56)),streak,1,'rgba(255,255,255,.15)');
        }
      }
      context.clearRect(0,0,width,height);context.imageSmoothingEnabled=false;context.drawImage(buffer,0,0,bw,bh,0,0,bw*bit,bh*bit);
      if(visible&&!REDUCED&&!raf)raf=requestAnimationFrame(draw);
    }
    if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);
    if(window.IntersectionObserver)new IntersectionObserver(function(entries){
      visible=entries[0].isIntersecting;
      if(!visible&&raf){cancelAnimationFrame(raf);raf=null;lastFrame=0;}
      else if(visible)requestDraw();
    },{threshold:0}).observe(canvas);
    window.addEventListener('lab:sun-wind',requestDraw);slider.addEventListener('input',requestDraw);resize();
  }

  dateInput.addEventListener('change',function(){renderDay(false)});
  slider.addEventListener('input',function(){renderTime(Number(this.value))});
  $('prevDay').addEventListener('click',function(){shiftDate(-1)});
  $('nextDay').addEventListener('click',function(){shiftDate(1)});
  $('todayBtn').addEventListener('click',function(){dateInput.value=iso(new Date(),state.timeZone);renderDay(false)});
  $('copyPlan').addEventListener('click',copyPlan);
  document.querySelectorAll('.phase-card').forEach(function(button){
    button.addEventListener('click',function(){slider.value=this.dataset.minute;renderTime(Number(slider.value))});
  });
  $('shelbyBtn').addEventListener('click',function(){
    state.lat=42.67;state.lon=-83.03;state.label='Shelby Township, MI';state.timeZone='America/Detroit';renderDay(true);refreshWind();
  });
  $('locateBtn').addEventListener('click',function(){
    if(!navigator.geolocation){$('plannerStatus').textContent='Location is not available in this browser.';return;}
    $('plannerStatus').textContent='Waiting for location permission…';
    navigator.geolocation.getCurrentPosition(function(pos){
      state.lat=pos.coords.latitude;state.lon=pos.coords.longitude;state.label='Current location';
      state.timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';renderDay(true);refreshWind();
    },function(){
      $('plannerStatus').textContent='Location was not shared. Shelby Township remains selected.';
    },{enableHighAccuracy:false,timeout:8000,maximumAge:600000});
  });

  var queryDate='',queryCloud='';
  try{var queryParams=new URL(location.href).searchParams;queryDate=queryParams.get('date')||'';queryCloud=queryParams.get('cloud')||''}catch(e){}
  dateInput.value=/^\d{4}-\d{2}-\d{2}$/.test(queryDate)?queryDate:iso(new Date(),state.timeZone);
  if(REDUCED)stage.classList.add('reduced-motion');
  if(queryCloud!==''&&Number.isFinite(Number(queryCloud))){state.cloudOverride=clamp(Number(queryCloud),0,100);state.weatherReady=true}
  window.labSunSetCloud=function(value){state.cloudOverride=clamp(Number(value)||0,0,100);state.weatherReady=true;renderTime(Number(slider.value));window.dispatchEvent(new Event('lab:sun-wind'))};
  renderDay(false);
  refreshWind();
  initNatureScene();
})();
