(function(){
  'use strict';
  if(!window.LaBSun)return;

  var REDUCED=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  var state={lat:42.67,lon:-83.03,label:'Shelby Township, MI',timeZone:'America/Detroit',day:null,wind:7,gust:11};
  var $=function(id){return document.getElementById(id)};
  var dateInput=$('sunDate'), slider=$('timeSlider'), stage=$('sunStage'), orb=$('sunOrb'), moon=$('moonOrb');
  var phaseVal=$('phaseVal'), tempVal=$('tempVal'), elevVal=$('elevVal'), azimVal=$('azimVal');
  var advice=$('advicePhrase'), adviceA11y=$('adviceA11y'), timeVal=$('timeVal'), skyTime=$('skyTime'), dateLabel=$('dateLabel'), locationLabel=$('locationLabel');
  var adviceTimer=null,lastAdviceKey='';

  var phaseCopy={
    'night':{
      label:'Night',temp:'Practical light',
      notes:[
        'Let darkness stay dark. Build the frame around the light that is already there.',
        'Scout the practicals first. A window, a porch light, or one good pool can carry the scene.',
        'Fast glass buys exposure. Restraint buys atmosphere.',
        'Protect the highlights and give the shadows permission to disappear.',
        'Night rewards one deliberate source more than five nervous ones.'
      ],
      best:'Fast glass · practicals · controlled pools of light'
    },
    'blue-dawn':{
      label:'Dawn Blue Hour',temp:'8,500–11,000K',
      notes:[
        'The world is still asleep. Start with the frame that needs the empty street.',
        'Expose for the blue and let windows carry the warmth.',
        'Silhouettes read cleanest before the horizon turns bright.',
        'Hold the cool sky. The color separation is the shot.'
      ],
      best:'City texture · silhouettes · quiet establishing shots'
    },
    'golden-morning':{
      label:'Morning Golden Hour',temp:'2,800–4,200K',
      notes:[
        'The first warm edge is here. Put it behind the subject and let it draw the shape.',
        'Low, clean light; cool world behind it. This is the quiet version of gold.',
        'Turn faces just off-axis. Keep the softness and find the catchlight.',
        'The shadows are long and the air is calm. Move before either one changes.'
      ],
      best:'Skin tone · rim light · long shadows · calm air'
    },
    'daylight':{
      label:'Daylight',temp:'5,200–5,800K',
      notes:[
        'The soft window has closed. Find open shade before you build more light.',
        'Hard light is not a problem if the frame admits that it is hard.',
        'Watch the eyes. Top light tells on a face before it tells on the meter.',
        'Diffusion for people; contrast for architecture. Choose what the sun is doing for you.',
        'The sun is high. Scout now, then save the hero setup for the falling light.',
        'Use the shadow line as composition, not something to apologize for.'
      ],
      best:'Architecture · controlled contrast · scouting'
    },
    'golden-evening':{
      label:'Evening Golden Hour',temp:'2,600–4,000K',
      notes:[
        'The warmth is arriving. Set the wide frame before the light becomes precious.',
        'Backlight the face and let the flare live at the edge, not the center.',
        'This is the hero window. Shoot the move while the shadows still have length.',
        'The light is going faster than it looks. Protect the setup you cannot fake later.'
      ],
      best:'Hero exteriors · flare · movement · warm skin tone'
    },
    'blue-dusk':{
      label:'Dusk Blue Hour',temp:'8,500–11,000K',
      notes:[
        'Do not wrap at sunset. The richest color separation happens just after it.',
        'The sky is cooling while the practicals wake up. Let both stay visible.',
        'Hold the silhouette and wait for the windows to become part of the frame.',
        'One last setup. Make it the one that needs the sky.'
      ],
      best:'Practical lights · skyline · windows · silhouettes'
    }
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
    var progress=clamp((value-range[0])/span,0,.9999);
    var index=Math.min(copy.notes.length-1,Math.floor(progress*copy.notes.length));
    return {key:phase+':'+index,text:copy.notes[index]};
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
    var y=clamp(84-((pos.elevation+8)/(Math.max(12,state.day.maxElevation)+8))*70,10,88);

    stage.dataset.phase=phase;
    stage.dataset.sun=pos.elevation>=-.8&&phase!=='night'?'visible':'hidden';
    orb.style.left=x+'%';orb.style.top=y+'%';
    if(moon&&phase==='night'){
      var dusk=minutes(state.day.civilDusk),dawn=minutes(state.day.civilDawn);
      var nightSpan=(1440-dusk)+dawn;
      var nightProgress=value>=dusk?(value-dusk)/nightSpan:(1440-dusk+value)/nightSpan;
      nightProgress=clamp(nightProgress,0,1);
      moon.style.left=clamp(92-nightProgress*82,6,94)+'%';
      moon.style.top=(78-Math.sin(nightProgress*Math.PI)*60)+'%';
    }
    timeVal.textContent=fmtMinutes(value);
    skyTime.textContent=timeVal.textContent;
    phaseVal.textContent=copy.label;
    $('lightVal').textContent=phase==='night'?'Artificial':(phase.indexOf('blue')===0?'Mixed':'Natural');
    tempVal.innerHTML=kelvin?kelvin.toLocaleString()+'<small>K est.</small>':'<span>Practical</span>';
    elevVal.innerHTML=(pos.elevation>=0?'+':'')+pos.elevation.toFixed(1)+'<small>°</small>';
    azimVal.innerHTML=Math.round(pos.azimuth)+'<small>° '+LaBSun.direction(pos.azimuth)+'</small>';
    rollAdvice(adviceChoice(value,phase,copy),copy.notes);
    $('bestFor').textContent=copy.best;
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
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(state.lat)+'&longitude='+encodeURIComponent(state.lon)+'&current=wind_speed_10m,wind_gusts_10m&wind_speed_unit=mph&timezone=auto')
      .then(function(response){return response.json()})
      .then(function(data){
        if(request!==windRequest||!data||!data.current)return;
        state.wind=Math.round(Number(data.current.wind_speed_10m)||0);
        state.gust=Math.round(Number(data.current.wind_gusts_10m)||state.wind);
        if(readout)readout.textContent='Current wind '+state.wind+' · gust '+state.gust+' mph';
        window.dispatchEvent(new Event('lab:sun-wind'));
      }).catch(function(){if(readout)readout.textContent='Treetops using a light breeze'});
  }

  function initNatureScene(){
    var canvas=$('sunNatureCanvas');if(!canvas)return;
    var context=canvas.getContext('2d'),buffer=document.createElement('canvas'),paint=buffer.getContext('2d');
    var width=0,height=0,bw=0,bh=0,bit=4,time=0,visible=true,raf=null;
    var birds=[
      {x:.08,y:.24,s:.00021,p:0,z:1},
      {x:.17,y:.18,s:.00016,p:2.2,z:1},
      {x:.62,y:.29,s:.00023,p:4.1,z:1.7},
      {x:.72,y:.22,s:.00018,p:1.3,z:1}
    ];
    function pixel(x,y,w,h,color){paint.fillStyle=color;paint.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
    function resize(){
      var rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
      width=Math.round(rect.width);height=Math.round(rect.height);var dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);
      bit=width<520?3:4;bw=Math.ceil(width/bit);bh=Math.ceil(height/bit);buffer.width=bw;buffer.height=bh;draw();
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
    function draw(){
      raf=null;if(!width||!height)return;
      if(!REDUCED)time+=.0167;
      paint.clearRect(0,0,bw,bh);
      var phase=stage.dataset.phase||'daylight';
      var night=phase==='night',wind=clamp(state.wind/24,0,.9),headroom=clamp((state.gust-state.wind)/16,0,1);
      var gust=(Math.sin(time*.7)+Math.sin(time*1.83+1.2))*.14*headroom;
      var bend=wind+gust,base=bh+3;
      treeTip(Math.round(bw*.11),base,Math.round(bh*.25),Math.round(bw*.038),bend*.75,night?.86:.72);
      treeTip(Math.round(bw*.50),base,Math.round(bh*.18),Math.round(bw*.032),bend*1.05,night?.8:.66);
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
      if(visible&&!REDUCED)raf=requestAnimationFrame(draw);
    }
    if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);
    if(window.IntersectionObserver)new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(visible&&!raf)raf=requestAnimationFrame(draw)},{threshold:0}).observe(canvas);
    window.addEventListener('lab:sun-wind',draw);slider.addEventListener('input',draw);resize();
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

  var queryDate='';
  try{queryDate=new URL(location.href).searchParams.get('date')||''}catch(e){}
  dateInput.value=/^\d{4}-\d{2}-\d{2}$/.test(queryDate)?queryDate:iso(new Date(),state.timeZone);
  if(REDUCED)stage.classList.add('reduced-motion');
  renderDay(false);
  refreshWind();
  initNatureScene();
})();
