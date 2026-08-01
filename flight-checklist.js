(function(){
  'use strict';
  if(document.getElementById('lab-flight-checklist'))return;

  var CHECK_KEY='lab-preflight';
  var UI_KEY='lab-flight-checklist-ui-v2';
  var groups=[
    {title:'Before you leave',items:[
      ['a1','Aircraft, controller and phone batteries charged'],
      ['a2','Props checked for nicks and hairline cracks, spares packed'],
      ['a3','Firmware current on aircraft, controller and app'],
      ['a4','Card in, formatted, with space to spare'],
      ['a5','Registration mark on the airframe, Remote ID broadcasting'],
      ['a6','Airspace checked, LAANC authorisation if controlled']
    ]},
    {title:'On site',items:[
      ['b1','Temporary flight restrictions checked for today'],
      ['b2','Wind and gusts read at altitude, not just at the launch point'],
      ['b3','Compass and IMU calibrated if the location moved significantly'],
      ['b4','Home point set and confirmed on the map'],
      ['b5','Return-to-home altitude above the tallest obstacle on site'],
      ['b6','Launch surface clear, flat and not loose gravel or sand']
    ]},
    {title:'Before the sticks move',items:[
      ['c1','Overflight path considered, bystanders accounted for'],
      ['c2','Visual observer briefed, if you are using one'],
      ['c3','Satellite lock acquired before takeoff, not during'],
      ['c4','Hover at ten feet, confirm it holds position cleanly'],
      ['c5','Landing battery percentage decided in advance'],
      ['c6','If night: anti-collision strobe fitted, on, and visually confirmed']
    ]}
  ];

  function read(key,fallback){
    try{var raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}
  }
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
  function esc(value){return String(value).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]})}

  var savedChecks=read(CHECK_KEY,[]);
  if(!Array.isArray(savedChecks))savedChecks=[];
  var savedUI=read(UI_KEY,{});
  var mode=savedUI.mode||'closed';

  var style=document.createElement('style');
  style.textContent='\
#lab-flight-checklist{--fc-w:min(400px,calc(100vw - 24px));position:fixed;z-index:9997;right:18px;bottom:18px;width:var(--fc-w);font-family:var(--f-body,Inter,sans-serif);color:var(--ink,#f4f1eb);filter:drop-shadow(0 20px 42px rgba(0,0,0,.48));}\
#lab-flight-checklist[data-mode="closed"]{display:none}\
.fc-panel{position:relative;display:flex;flex-direction:column;height:100%;max-height:calc(100vh - 16px);overflow:hidden;border:1px solid var(--line-2,rgba(255,255,255,.25));border-radius:10px;background:color-mix(in srgb,var(--paper,#111) 98%,transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}\
.fc-head{display:grid;grid-template-columns:1fr auto;flex:0 0 auto;gap:12px;align-items:center;min-height:58px;padding:9px 10px 9px 16px;border-bottom:1px solid var(--line-2,rgba(255,255,255,.16));background:linear-gradient(105deg,var(--accent-bg,rgba(230,111,60,.07)),transparent 48%);cursor:grab;touch-action:none;user-select:none}\
.fc-head:active{cursor:grabbing}.fc-title{margin:0;font:400 22px/1 var(--f-display,serif);letter-spacing:-.01em}.fc-title em{color:var(--accent,#e66f3c);font-style:italic}.fc-sub{display:block;margin-top:6px;font:8.5px/1.2 var(--f-mono,monospace);letter-spacing:.12em;text-transform:uppercase;color:color-mix(in srgb,var(--ink,#fff) 58%,transparent)}\
.fc-actions{display:flex;gap:5px}.fc-icon,.fc-text-btn{border:1px solid var(--line-2,rgba(255,255,255,.25));border-radius:6px;background:var(--paper-2,#181818);color:color-mix(in srgb,var(--ink,#fff) 70%,transparent);cursor:pointer}.fc-icon{width:34px;height:34px;font:13px var(--f-mono,monospace)}.fc-icon:hover,.fc-icon:focus-visible,.fc-text-btn:hover,.fc-text-btn:focus-visible{border-color:var(--accent,#e66f3c);color:var(--ink,#fff);outline:none}\
.fc-progress{flex:0 0 auto;height:3px;background:var(--line,rgba(255,255,255,.1))}.fc-progress span{display:block;height:100%;background:var(--accent,#e66f3c);box-shadow:0 0 10px var(--accent-dim,rgba(230,111,60,.45));transition:width .25s ease}.fc-body{flex:1 1 auto;min-height:0;max-height:min(62vh,570px);overflow:auto;padding:15px 17px 20px;scrollbar-color:var(--accent-dim,rgba(230,111,60,.45)) transparent}.fc-group{position:relative}.fc-group+.fc-group{margin-top:17px}.fc-group h3{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 6px;padding-bottom:8px;border-bottom:1px solid var(--line-2,rgba(255,255,255,.15));font:8.5px var(--f-mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--ink,#fff) 58%,transparent);transition:color .25s ease}.fc-group-state{letter-spacing:.08em;white-space:nowrap}.fc-group.is-complete h3,.fc-group.is-complete .fc-group-state{color:var(--good,var(--accent,#e66f3c))}.fc-group.is-complete:after{content:"";position:absolute;left:0;right:0;top:21px;height:1px;background:var(--good,var(--accent,#e66f3c));transform-origin:left}.fc-group.celebrate:after{animation:fc-section-done .65s ease both}.fc-group.celebrate{animation:fc-group-glow .9s ease}.fc-group.celebrate .fc-group-state{animation:fc-ready-pop .72s cubic-bezier(.2,.8,.2,1)}\
.fc-celebration{position:absolute;z-index:3;right:23px;top:10px;width:1px;height:1px;pointer-events:none}.fc-celebration i{--x:0px;--y:0px;--r:0deg;position:absolute;width:4px;height:4px;border-radius:1px;background:var(--accent,#e66f3c);opacity:0}.fc-celebration i:nth-child(2n){background:var(--good,var(--accent,#e66f3c));border-radius:50%}.fc-group.celebrate .fc-celebration i{animation:fc-spark .82s cubic-bezier(.15,.65,.25,1) both}.fc-celebration i:nth-child(1){--x:-30px;--y:-19px;--r:-50deg}.fc-celebration i:nth-child(2){--x:-17px;--y:20px;--r:35deg;animation-delay:.04s!important}.fc-celebration i:nth-child(3){--x:2px;--y:-25px;--r:70deg;animation-delay:.08s!important}.fc-celebration i:nth-child(4){--x:24px;--y:-15px;--r:110deg;animation-delay:.02s!important}.fc-celebration i:nth-child(5){--x:31px;--y:14px;--r:150deg;animation-delay:.09s!important}.fc-celebration i:nth-child(6){--x:5px;--y:24px;--r:190deg;animation-delay:.06s!important}\
.fc-item{display:grid;grid-template-columns:17px 1fr;gap:10px;align-items:start;padding:7px 0;color:color-mix(in srgb,var(--ink,#fff) 76%,transparent);font-size:12px;line-height:1.48;cursor:pointer}.fc-item input{position:absolute;opacity:0}.fc-box{width:15px;height:15px;margin-top:1px;border:1px solid color-mix(in srgb,var(--ink,#fff) 38%,transparent);border-radius:3px;position:relative}.fc-item input:focus-visible+.fc-box{outline:2px solid var(--accent,#e66f3c);outline-offset:2px}.fc-item input:checked+.fc-box{background:var(--accent,#e66f3c);border-color:var(--accent,#e66f3c)}.fc-item input:checked+.fc-box:after{content:"";position:absolute;left:4px;top:1px;width:4px;height:8px;border:solid var(--paper,#111);border-width:0 1.5px 1.5px 0;transform:rotate(45deg)}.fc-item input:checked~span:last-child{color:color-mix(in srgb,var(--ink,#fff) 56%,transparent);text-decoration:line-through}.fc-ready{display:none;margin:2px 0 16px;padding:14px 15px;border:1px solid var(--accent-dim,rgba(230,111,60,.5));border-left:2px solid var(--accent,#e66f3c);border-radius:7px;background:var(--accent-bg,rgba(230,111,60,.08))}.fc-ready strong{display:block;font:400 26px/1 var(--f-display,serif);color:var(--accent,#e66f3c)}.fc-ready span{display:block;margin-top:7px;font:8.5px/1.5 var(--f-mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:color-mix(in srgb,var(--ink,#fff) 68%,transparent)}#lab-flight-checklist[data-complete="true"] .fc-ready{display:block;animation:fc-ready-in .5s ease both}#lab-flight-checklist[data-complete="true"] .fc-panel{border-color:var(--accent-dim,rgba(230,111,60,.5))}.fc-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:15px;padding-top:12px;border-top:1px solid var(--line-2,rgba(255,255,255,.15))}.fc-text-btn{padding:7px 9px;font:8px var(--f-mono,monospace);letter-spacing:.1em;text-transform:uppercase}.fc-privacy{font:8px/1.4 var(--f-mono,monospace);color:color-mix(in srgb,var(--ink,#fff) 48%,transparent)}\
.fc-resize{position:absolute;z-index:5;right:3px;bottom:3px;width:24px;height:24px;padding:0;border:0;background:transparent;cursor:nwse-resize;touch-action:none}.fc-resize:before,.fc-resize:after{content:"";position:absolute;right:4px;bottom:4px;border-right:1px solid var(--accent,#e66f3c);border-bottom:1px solid var(--accent,#e66f3c);border-radius:0 0 6px 0;opacity:.58}.fc-resize:before{width:11px;height:11px}.fc-resize:after{width:6px;height:6px}.fc-resize:hover:before,.fc-resize:focus-visible:before,.fc-resize:hover:after,.fc-resize:focus-visible:after{opacity:1}.fc-resize:focus-visible{outline:1px solid var(--accent,#e66f3c);outline-offset:-2px;border-radius:6px}#lab-flight-checklist[data-resized="true"] .fc-body{max-height:none}\
#lab-flight-checklist[data-mode="minimized"]{width:min(282px,calc(100vw - 24px))!important;height:auto!important}#lab-flight-checklist[data-mode="minimized"] .fc-body,#lab-flight-checklist[data-mode="minimized"] .fc-progress,#lab-flight-checklist[data-mode="minimized"] .fc-resize{display:none}#lab-flight-checklist[data-mode="minimized"] .fc-head{min-height:48px;border-bottom:0;padding-block:7px}#lab-flight-checklist[data-mode="minimized"] .fc-title{font-size:18px}#lab-flight-checklist[data-mode="minimized"] [data-fc="print"]{display:none}\
@keyframes fc-section-done{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}@keyframes fc-ready-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}@keyframes fc-group-glow{0%,100%{background:transparent}35%{background:var(--accent-bg,rgba(230,111,60,.08))}}@keyframes fc-ready-pop{0%{opacity:.25;transform:scale(.74)}55%{transform:scale(1.14)}100%{opacity:1;transform:scale(1)}}@keyframes fc-spark{0%{opacity:0;transform:translate(0,0) rotate(0) scale(.4)}18%{opacity:1}100%{opacity:0;transform:translate(var(--x),var(--y)) rotate(var(--r)) scale(.75)}}\
@media(max-width:600px){#lab-flight-checklist{left:12px!important;right:12px!important;bottom:12px!important;top:auto!important;width:auto!important;height:auto!important}.fc-panel{height:auto;max-height:calc(100vh - 24px)}.fc-head{cursor:default}.fc-body{max-height:56vh!important}.fc-actions [data-fc="print"],.fc-resize{display:none}}\
@media(prefers-reduced-motion:reduce){.fc-progress span{transition:none}.fc-group.celebrate,.fc-group.celebrate:after,.fc-group.celebrate .fc-group-state,.fc-group.celebrate .fc-celebration i,.fc-ready{animation:none!important}}\
@media print{body.lab-print-checklist>*:not(#lab-flight-checklist){display:none!important}body.lab-print-checklist #lab-flight-checklist{position:static!important;width:100%!important;height:auto!important;filter:none!important;color:#111!important}body.lab-print-checklist .fc-panel{display:block!important;height:auto!important;max-height:none!important;border:1px solid #777!important;border-radius:0!important;background:#fff!important;backdrop-filter:none!important}body.lab-print-checklist .fc-head{cursor:default!important}body.lab-print-checklist .fc-actions,body.lab-print-checklist .fc-foot,body.lab-print-checklist .fc-progress,body.lab-print-checklist .fc-resize,body.lab-print-checklist .fc-celebration{display:none!important}body.lab-print-checklist .fc-body{display:block!important;max-height:none!important;overflow:visible!important}body.lab-print-checklist .fc-title,body.lab-print-checklist .fc-item{color:#111!important}body.lab-print-checklist .fc-group h3,body.lab-print-checklist .fc-sub{color:#555!important}body.lab-print-checklist .fc-item input:checked+.fc-box{background:#111!important;border-color:#111!important}body.lab-print-checklist .fc-item input:checked+.fc-box:after{border-color:#fff!important}}';
  document.head.appendChild(style);

  var groupHTML=groups.map(function(group,index){
    return '<section class="fc-group" data-fc-group="'+index+'"><span class="fc-celebration" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><h3><span>'+esc(group.title)+'</span><span class="fc-group-state" data-fc-group-state aria-live="polite">0 / '+group.items.length+'</span></h3>'+group.items.map(function(item){
      return '<label class="fc-item"><input type="checkbox" data-fc-check="'+item[0]+'"'+(savedChecks.indexOf(item[0])!==-1?' checked':'')+'><span class="fc-box" aria-hidden="true"></span><span>'+esc(item[1])+'</span></label>';
    }).join('')+'</section>';
  }).join('');

  var root=document.createElement('aside');
  root.id='lab-flight-checklist';
  root.dataset.mode=mode;
  root.setAttribute('aria-label','Flight checklist');
  root.innerHTML='<div class="fc-panel"><div class="fc-head" data-fc-drag><div><h2 class="fc-title">Flight <em>checklist.</em></h2><span class="fc-sub"><b data-fc-count>0</b><span data-fc-summary> of 18 ready · saved here</span></span></div><div class="fc-actions"><button class="fc-icon" type="button" data-fc="print" title="Save or print PDF" aria-label="Save or print checklist as PDF">PDF</button><button class="fc-icon" type="button" data-fc="minimize" title="Minimize" aria-label="Minimize checklist">—</button><button class="fc-icon" type="button" data-fc="close" title="Close" aria-label="Close checklist">×</button></div></div><div class="fc-progress"><span data-fc-fill></span></div><div class="fc-body"><div class="fc-ready" role="status" aria-live="polite"><strong>Go fly.</strong><span>Checklist complete · when weather, airspace and the site agree</span></div>'+groupHTML+'<div class="fc-foot"><span class="fc-privacy">Browser-only · not a regulatory document</span><button class="fc-text-btn" type="button" data-fc="reset">Reset</button></div></div><button class="fc-resize" type="button" data-fc-resize aria-label="Resize checklist" title="Drag to resize"></button></div>';
  document.body.appendChild(root);

  if(savedUI.x!=null&&savedUI.y!=null&&innerWidth>600){root.style.left=savedUI.x+'px';root.style.top=savedUI.y+'px';root.style.right='auto';root.style.bottom='auto'}
  if(savedUI.w>=340&&savedUI.h>=300&&innerWidth>600){root.style.width=Math.min(savedUI.w,innerWidth-16)+'px';root.style.height=Math.min(savedUI.h,innerHeight-16)+'px';root.dataset.resized='true'}
  var boxes=[].slice.call(root.querySelectorAll('[data-fc-check]'));
  var groupEls=[].slice.call(root.querySelectorAll('[data-fc-group]'));
  var reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  var wasComplete=savedChecks.length===boxes.length;
  var hydrated=false;
  function persistUI(){
    savedUI={mode:root.dataset.mode,x:parseFloat(root.style.left)||null,y:parseFloat(root.style.top)||null,w:parseFloat(root.style.width)||null,h:parseFloat(root.style.height)||null};
    write(UI_KEY,savedUI);
  }
  function sync(){
    var checked=boxes.filter(function(box){return box.checked});
    write(CHECK_KEY,checked.map(function(box){return box.dataset.fcCheck}));
    root.querySelector('[data-fc-count]').textContent=checked.length;
    root.querySelector('[data-fc-summary]').textContent=checked.length===boxes.length?' / '+boxes.length+' complete · saved here':' of '+boxes.length+' ready · saved here';
    root.querySelector('[data-fc-fill]').style.width=(checked.length/boxes.length*100)+'%';
    groupEls.forEach(function(group){
      var groupBoxes=[].slice.call(group.querySelectorAll('[data-fc-check]'));
      var count=groupBoxes.filter(function(box){return box.checked}).length;
      var complete=count===groupBoxes.length;
      var becameComplete=complete&&!group.classList.contains('is-complete');
      group.classList.toggle('is-complete',complete);
      group.querySelector('[data-fc-group-state]').textContent=complete?'Ready ✓':count+' / '+groupBoxes.length;
      if(!complete)group.classList.remove('celebrate');
      if(becameComplete&&hydrated&&!reduced){
        clearTimeout(group._celebrateTimer);group.classList.add('celebrate');
        group._celebrateTimer=setTimeout(function(){group.classList.remove('celebrate')},950);
      }
    });
    var complete=checked.length===boxes.length;
    root.dataset.complete=String(complete);
    if(complete&&!wasComplete){
      var body=root.querySelector('.fc-body');
      if(body)body.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
    }
    wasComplete=complete;
  }
  function reflectMode(){
    document.querySelectorAll('[data-open-flight-checklist]').forEach(function(trigger){trigger.setAttribute('aria-expanded',String(root.dataset.mode!=='closed'))});
  }
  function setMode(next){root.dataset.mode=next;reflectMode();persistUI()}
  boxes.forEach(function(box){box.addEventListener('change',sync)});
  root.addEventListener('click',function(event){
    var button=event.target.closest('[data-fc]');if(!button)return;
    var action=button.dataset.fc;
    if(action==='close')setMode('closed');
    if(action==='minimize')setMode(root.dataset.mode==='minimized'?'open':'minimized');
    if(action==='reset'){boxes.forEach(function(box){box.checked=false});sync()}
    if(action==='print'){document.body.classList.add('lab-print-checklist');window.print();setTimeout(function(){document.body.classList.remove('lab-print-checklist')},250)}
  });
  document.addEventListener('click',function(event){if(event.target.closest('[data-open-flight-checklist]'))setMode('open')});
  window.addEventListener('afterprint',function(){document.body.classList.remove('lab-print-checklist')});

  var drag=null,head=root.querySelector('[data-fc-drag]');
  head.addEventListener('pointerdown',function(event){
    if(innerWidth<=600||event.target.closest('button'))return;
    var rect=root.getBoundingClientRect();drag={dx:event.clientX-rect.left,dy:event.clientY-rect.top};head.setPointerCapture(event.pointerId);
  });
  head.addEventListener('pointermove',function(event){
    if(!drag)return;var x=Math.max(8,Math.min(innerWidth-root.offsetWidth-8,event.clientX-drag.dx));var y=Math.max(8,Math.min(innerHeight-root.offsetHeight-8,event.clientY-drag.dy));
    root.style.left=x+'px';root.style.top=y+'px';root.style.right='auto';root.style.bottom='auto';
  });
  head.addEventListener('pointerup',function(){if(drag){drag=null;persistUI()}});
  head.addEventListener('pointercancel',function(){if(drag){drag=null;persistUI()}});

  var resizeState=null,grip=root.querySelector('[data-fc-resize]');
  grip.addEventListener('pointerdown',function(event){
    if(innerWidth<=600)return;event.preventDefault();
    var rect=root.getBoundingClientRect();
    root.style.left=rect.left+'px';root.style.top=rect.top+'px';root.style.right='auto';root.style.bottom='auto';root.style.width=rect.width+'px';root.style.height=rect.height+'px';root.dataset.resized='true';
    resizeState={x:event.clientX,y:event.clientY,w:rect.width,h:rect.height};root.classList.add('is-resizing');grip.setPointerCapture(event.pointerId);
  });
  grip.addEventListener('pointermove',function(event){
    if(!resizeState)return;
    var left=parseFloat(root.style.left)||0,top=parseFloat(root.style.top)||0,maxW=Math.max(340,innerWidth-left-8),maxH=Math.max(300,innerHeight-top-8);
    root.style.width=Math.max(340,Math.min(maxW,resizeState.w+event.clientX-resizeState.x))+'px';
    root.style.height=Math.max(300,Math.min(maxH,resizeState.h+event.clientY-resizeState.y))+'px';
  });
  function finishResize(){if(!resizeState)return;resizeState=null;root.classList.remove('is-resizing');persistUI()}
  grip.addEventListener('pointerup',finishResize);grip.addEventListener('pointercancel',finishResize);
  window.addEventListener('resize',function(){
    if(innerWidth<=600){root.style.left='';root.style.top='';root.style.right='';root.style.bottom='';return}
    var rect=root.getBoundingClientRect();
    if(rect.right>innerWidth-8){root.style.left=Math.max(8,innerWidth-rect.width-8)+'px';root.style.right='auto'}
    if(rect.bottom>innerHeight-8){root.style.top=Math.max(8,innerHeight-rect.height-8)+'px';root.style.bottom='auto'}
  });
  reflectMode();
  sync();
  hydrated=true;
})();
