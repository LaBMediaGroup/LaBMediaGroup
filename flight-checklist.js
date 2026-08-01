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
#lab-flight-checklist{--fc-w:min(370px,calc(100vw - 24px));position:fixed;z-index:9997;right:18px;bottom:18px;width:var(--fc-w);font-family:var(--f-body,Inter,sans-serif);color:var(--ink,#f4f1eb);filter:drop-shadow(0 18px 34px rgba(0,0,0,.3));}\
#lab-flight-checklist[data-mode="closed"]{display:none}\
.fc-panel{overflow:hidden;border:1px solid var(--line-2,rgba(255,255,255,.2));background:color-mix(in srgb,var(--paper,#111) 94%,transparent);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}\
.fc-head{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;min-height:54px;padding:8px 9px 8px 15px;border-bottom:1px solid var(--line,rgba(255,255,255,.1));cursor:grab;touch-action:none;user-select:none}\
.fc-head:active{cursor:grabbing}.fc-title{margin:0;font:400 20px/1 var(--f-display,serif);letter-spacing:-.01em}.fc-title em{color:var(--accent,#e66f3c);font-style:italic}.fc-sub{display:block;margin-top:5px;font:8px/1.2 var(--f-mono,monospace);letter-spacing:.13em;text-transform:uppercase;color:var(--faint,#aaa)}\
.fc-actions{display:flex;gap:4px}.fc-icon,.fc-text-btn{border:1px solid var(--line-2,rgba(255,255,255,.2));background:var(--paper-2,#181818);color:var(--dim,#bbb);cursor:pointer}.fc-icon{width:32px;height:32px;font:13px var(--f-mono,monospace)}.fc-icon:hover,.fc-icon:focus-visible,.fc-text-btn:hover,.fc-text-btn:focus-visible{border-color:var(--accent,#e66f3c);color:var(--ink,#fff);outline:none}\
.fc-progress{height:2px;background:var(--line,rgba(255,255,255,.1))}.fc-progress span{display:block;height:100%;background:var(--accent,#e66f3c);transition:width .25s ease}.fc-body{max-height:min(62vh,570px);overflow:auto;padding:12px 15px 16px}.fc-group{position:relative}.fc-group+.fc-group{margin-top:14px}.fc-group h3{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 5px;padding-bottom:6px;border-bottom:1px solid var(--line,rgba(255,255,255,.1));font:8px var(--f-mono,monospace);letter-spacing:.15em;text-transform:uppercase;color:var(--faint,#aaa);transition:color .25s ease}.fc-group-state{letter-spacing:.08em;white-space:nowrap}.fc-group.is-complete h3,.fc-group.is-complete .fc-group-state{color:var(--good,var(--accent,#e66f3c))}.fc-group.is-complete:after{content:"";position:absolute;left:0;right:0;top:19px;height:1px;background:var(--good,var(--accent,#e66f3c));transform-origin:left;animation:fc-section-done .55s ease both}\
.fc-item{display:grid;grid-template-columns:15px 1fr;gap:9px;align-items:start;padding:6px 0;color:var(--dim,#bbb);font-size:11px;line-height:1.45;cursor:pointer}.fc-item input{position:absolute;opacity:0}.fc-box{width:13px;height:13px;margin-top:1px;border:1px solid var(--line-2,rgba(255,255,255,.2));position:relative}.fc-item input:focus-visible+.fc-box{outline:2px solid var(--accent,#e66f3c);outline-offset:2px}.fc-item input:checked+.fc-box{background:var(--accent,#e66f3c);border-color:var(--accent,#e66f3c)}.fc-item input:checked+.fc-box:after{content:"";position:absolute;left:3px;top:0;width:4px;height:8px;border:solid var(--paper,#111);border-width:0 1.5px 1.5px 0;transform:rotate(45deg)}.fc-item input:checked~span:last-child{color:var(--faint,#888);text-decoration:line-through}.fc-ready{display:none;margin:2px 0 14px;padding:13px 14px;border:1px solid var(--accent-dim,rgba(230,111,60,.5));border-left:2px solid var(--accent,#e66f3c);background:var(--accent-bg,rgba(230,111,60,.08))}.fc-ready strong{display:block;font:400 24px/1 var(--f-display,serif);color:var(--accent,#e66f3c)}.fc-ready span{display:block;margin-top:6px;font:8px/1.5 var(--f-mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--dim,#bbb)}#lab-flight-checklist[data-complete="true"] .fc-ready{display:block;animation:fc-ready-in .5s ease both}#lab-flight-checklist[data-complete="true"] .fc-panel{border-color:var(--accent-dim,rgba(230,111,60,.5))}.fc-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:13px;padding-top:11px;border-top:1px solid var(--line,rgba(255,255,255,.1))}.fc-text-btn{padding:7px 9px;font:8px var(--f-mono,monospace);letter-spacing:.1em;text-transform:uppercase}.fc-privacy{font:8px/1.4 var(--f-mono,monospace);color:var(--faint,#888)}\
#lab-flight-checklist[data-mode="minimized"]{width:min(270px,calc(100vw - 24px))}#lab-flight-checklist[data-mode="minimized"] .fc-body,#lab-flight-checklist[data-mode="minimized"] .fc-progress{display:none}#lab-flight-checklist[data-mode="minimized"] .fc-head{min-height:46px;border-bottom:0;padding-block:6px}#lab-flight-checklist[data-mode="minimized"] .fc-title{font-size:17px}#lab-flight-checklist[data-mode="minimized"] [data-fc="print"]{display:none}\
@keyframes fc-section-done{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}@keyframes fc-ready-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}\
@media(max-width:600px){#lab-flight-checklist{left:12px!important;right:12px!important;bottom:12px!important;top:auto!important;width:auto!important}.fc-head{cursor:default}.fc-body{max-height:56vh}.fc-actions [data-fc="print"]{display:none}}\
@media(prefers-reduced-motion:reduce){.fc-progress span{transition:none}.fc-group.is-complete:after,.fc-ready{animation:none!important}}\
@media print{body.lab-print-checklist>*:not(#lab-flight-checklist){display:none!important}body.lab-print-checklist #lab-flight-checklist{position:static!important;width:100%!important;filter:none!important;color:#111!important}body.lab-print-checklist .fc-panel{display:block!important;border:1px solid #777!important;background:#fff!important;backdrop-filter:none!important}body.lab-print-checklist .fc-head{cursor:default!important}body.lab-print-checklist .fc-actions,body.lab-print-checklist .fc-foot,body.lab-print-checklist .fc-progress{display:none!important}body.lab-print-checklist .fc-body{display:block!important;max-height:none!important;overflow:visible!important}body.lab-print-checklist .fc-title,body.lab-print-checklist .fc-item{color:#111!important}body.lab-print-checklist .fc-group h3,body.lab-print-checklist .fc-sub{color:#555!important}body.lab-print-checklist .fc-item input:checked+.fc-box{background:#111!important;border-color:#111!important}body.lab-print-checklist .fc-item input:checked+.fc-box:after{border-color:#fff!important}}';
  document.head.appendChild(style);

  var groupHTML=groups.map(function(group,index){
    return '<section class="fc-group" data-fc-group="'+index+'"><h3><span>'+esc(group.title)+'</span><span class="fc-group-state" data-fc-group-state>0 / '+group.items.length+'</span></h3>'+group.items.map(function(item){
      return '<label class="fc-item"><input type="checkbox" data-fc-check="'+item[0]+'"'+(savedChecks.indexOf(item[0])!==-1?' checked':'')+'><span class="fc-box" aria-hidden="true"></span><span>'+esc(item[1])+'</span></label>';
    }).join('')+'</section>';
  }).join('');

  var root=document.createElement('aside');
  root.id='lab-flight-checklist';
  root.dataset.mode=mode;
  root.setAttribute('aria-label','Flight checklist');
  root.innerHTML='<div class="fc-panel"><div class="fc-head" data-fc-drag><div><h2 class="fc-title">Flight <em>checklist.</em></h2><span class="fc-sub"><b data-fc-count>0</b><span data-fc-summary> of 18 ready · saved here</span></span></div><div class="fc-actions"><button class="fc-icon" type="button" data-fc="print" title="Save or print PDF" aria-label="Save or print checklist as PDF">PDF</button><button class="fc-icon" type="button" data-fc="minimize" title="Minimize" aria-label="Minimize checklist">—</button><button class="fc-icon" type="button" data-fc="close" title="Close" aria-label="Close checklist">×</button></div></div><div class="fc-progress"><span data-fc-fill></span></div><div class="fc-body"><div class="fc-ready" role="status" aria-live="polite"><strong>Go fly.</strong><span>Checklist complete · when weather, airspace and the site agree</span></div>'+groupHTML+'<div class="fc-foot"><span class="fc-privacy">Browser-only · not a regulatory document</span><button class="fc-text-btn" type="button" data-fc="reset">Reset</button></div></div></div>';
  document.body.appendChild(root);

  if(savedUI.x!=null&&savedUI.y!=null&&innerWidth>600){root.style.left=savedUI.x+'px';root.style.top=savedUI.y+'px';root.style.right='auto';root.style.bottom='auto'}
  var boxes=[].slice.call(root.querySelectorAll('[data-fc-check]'));
  var groupEls=[].slice.call(root.querySelectorAll('[data-fc-group]'));
  var reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  var wasComplete=savedChecks.length===boxes.length;
  function persistUI(){write(UI_KEY,{mode:root.dataset.mode,x:parseFloat(root.style.left)||null,y:parseFloat(root.style.top)||null})}
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
      group.classList.toggle('is-complete',complete);
      group.querySelector('[data-fc-group-state]').textContent=complete?'Ready ✓':count+' / '+groupBoxes.length;
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
  window.addEventListener('resize',function(){if(innerWidth<=600){root.style.left='';root.style.top='';root.style.right='';root.style.bottom=''}});
  reflectMode();
  sync();
})();
