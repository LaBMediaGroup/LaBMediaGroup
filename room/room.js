'use strict';
const $=s=>document.querySelector(s), canvas=$('canvas'),ctx=canvas.getContext('2d'),range=$('#scrub'),date=$('[type=date]'),place=$('select'),tile=$('.tile'),panel=$('.panel'),back=$('#back'),quiet=matchMedia('(prefers-reduced-motion: reduce)');
const places=[[42.67,-83.03,'America/Detroit'],[45.52,-122.68,'America/Los_Angeles'],[69.65,18.96,'Europe/Oslo']];
const params=new URLSearchParams(location.search);
place.selectedIndex=Math.max(0,Math.min(2,Number(params.get('place'))||0));
function localDate(d){return new Intl.DateTimeFormat('sv-SE',{timeZone:places[place.selectedIndex][2],year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
date.value=params.get('date')||localDate(new Date());if(!date.value)date.value=localDate(new Date());
let start,sun,frame=0,last=0;
function midnight(day){const guess=Date.parse(day+'T00:00Z');let t=guess;for(let i=0;i<3;i++){const f=new Intl.DateTimeFormat('sv-SE',{timeZone:places[place.selectedIndex][2],dateStyle:'short',timeStyle:'medium',hourCycle:'h23'}).format(new Date(t));t+=guess-Date.parse(f.replace(' ','T')+'Z')}return t}
function clock(d){return d?new Intl.DateTimeFormat('en-US',{timeZone:places[place.selectedIndex][2],hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(d):'—'}
function day(initial){if(!date.value)return;const [lat,lon]=places[place.selectedIndex];start=midnight(date.value);const tomorrow=new Date(Date.parse(date.value+'T12:00Z')+86400000).toISOString().slice(0,10);range.max=(midnight(tomorrow)-start)/60000-1;
const events=[[-6,true],[-.833,true],[6,true],[6,false],[-.833,false],[-6,false]].map(([a,r])=>LaBSun.event(date.value,lat,lon,a,r));
const [dawn,rise,am,pm,set,dusk]=events;
$('.events').textContent=rise&&set?'Sunrise '+clock(rise)+' · AM gold until '+clock(am)+' · PM gold from '+clock(pm)+' · Sunset '+clock(set)+' · Blue hour '+clock(dawn)+'–sunrise / sunset–'+clock(dusk):'No sunrise/sunset crossing today · '+(LaBSun.position(new Date(start+12*3600000),lat,lon).elevation>0?'Polar daylight':'Polar night')+' · Civil dawn '+clock(dawn)+' / dusk '+clock(dusk);
range.value=initial&&params.has('minute')?params.get('minute'):pm?Math.round((pm-start)/60000)+5:720;update()}
function update(){const d=new Date(start+Number(range.value)*60000);sun=LaBSun.position(d,...places[place.selectedIndex].slice(0,2));$('output').value=clock(d);range.setAttribute('aria-valuetext',clock(d));$('#angle').textContent=Math.round(sun.azimuth)+'° az · '+Math.round(sun.elevation)+'° elev';if(location.hash==='#planner'){const u=new URL(location.href);u.search=new URLSearchParams({date:date.value,place:place.selectedIndex,minute:range.value});history.replaceState(null,'',u)}draw(performance.now())}
const clamp=x=>Math.max(0,Math.min(1,x)),rad=Math.PI/180;
function blend(a,b,t){return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*clamp(t))).join(',')+')'}
let seed=19;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
const trees=Array.from({length:88},(_,i)=>({x:random()*1.6-.3,y:.72+random()*.29,h:.18+random()*.58,phase:random()*7,depth:i/88,branches:Array.from({length:23},()=>[random(),random()])}));
function draw(now){if(!ctx||!sun)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;const dpr=Math.min(devicePixelRatio,1.5);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);
if(drawPhotographicRoom(ctx,w,h,now,sun,quiet.matches))return;
const f=Math.min(w/5.9,h/3.65),cx=w*.5,cy=h*(w<600?.31:.38),P=(x,y,z=0)=>[cx+x*f*4/(4-z),cy+(1.65-y)*f*4/(4-z)];
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
const elev=sun.elevation,l=clamp((elev+13)/38),daylight=clamp((elev+10)/16),gold=daylight*clamp((24-elev)/18);
ctx.fillStyle=blend([26,32,39],[149,132,105],l);ctx.fillRect(0,0,w,h);
const floorY=P(0,0)[1];const floor=ctx.createLinearGradient(0,floorY,0,h);floor.addColorStop(0,blend([23,27,26],[112,88,65],l));floor.addColorStop(1,blend([12,16,17],[67,52,42],l));ctx.fillStyle=floor;ctx.fillRect(0,floorY,w,h-floorY);
for(let i=-12;i<=12;i++){poly([P(i*.44,0),P(i*.44+.009,0),P(i*.44+.009,0,3.7),P(i*.44,0,3.7)],'#12171236')}
const L=-2,R=2,B=.65,T=2.85,[x,y]=P(L,T),ww=4*f,hh=(T-B)*f;
const sky=ctx.createLinearGradient(0,y,0,y+hh);sky.addColorStop(0,blend([24,39,61],[129,173,183],daylight));sky.addColorStop(1,blend([75,77,99],[255,209,149],gold+.27*daylight));ctx.fillStyle=sky;ctx.fillRect(x,y,ww,hh);ctx.save();ctx.beginPath();ctx.rect(x,y,ww,hh);ctx.clip();
const az=(sun.azimuth-225)*rad,face=Math.cos(az),sx=x+ww*(.5+Math.sin(az)*.67),sy=y+hh*(.76-Math.sin(elev*rad)*1.35);
if(elev>0&&face>0){const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,ww*.32);glow.addColorStop(0,'#fff7cfdf');glow.addColorStop(1,'#ffd89000');ctx.fillStyle=glow;ctx.fillRect(x,y,ww,hh);ctx.fillStyle='#fff4cc';ctx.beginPath();ctx.arc(sx,sy,f*.052,0,7);ctx.fill()}
for(const t of trees){const base=x+t.x*ww,foot=y+t.y*hh,H=t.h*hh*(.52+t.depth*.65),sway=quiet.matches?0:Math.sin(now*.0008+t.phase)*H*.016;const pts=[[base+sway,foot-H]];for(const side of [1,-1]){for(let i=0;i<23;i++){const j=side===1?i:22-i,k=(j+1)/24,br=t.branches[j],stem=base+sway*(1-k)**2;pts.push([stem+side*H*k*(.115+br[0]*.07),foot-H*(1-k)+H*.025],[stem+side*H*k*.075,foot-H*(1-k)+H*.01])}if(side===1)pts.push([base,foot])}poly(pts,blend([54,65,68],[16,32,28],t.depth+.2*(1-daylight)))}
ctx.restore();
function wood(a,b,c,d){const z=.18;poly([P(a,d,z),P(b,d,z),P(b,c,z),P(a,c,z)],blend([45,42,36],[142,102,66],l+.15));poly([P(b,d),P(b,d,z),P(b,c,z),P(b,c)],'#44392f');poly([P(a,c),P(b,c),P(b,c,z),P(a,c,z)],'#322f28')}
wood(L-.11,L,B-.1,T+.1);wood(R,R+.11,B-.1,T+.1);wood(L,R,T,T+.1);wood(-.034,.034,B,T);wood(L,R,2.25,2.29);wood(L-.15,R+.15,B-.09,B);
if(elev>.1&&face>.02){ctx.save();ctx.beginPath();ctx.rect(0,floorY,w,h-floorY);ctx.clip();const slope=Math.tan(elev*rad)/face;
for(const [a,b] of [[L,-.034],[.034,R]])for(const [c,d] of [[B,2.25],[2.29,T]]){const lo=c/slope,hi=Math.min(3.85,d/slope);if(lo>=hi)continue;const hit=(u,z)=>P(u-z*Math.tan(az),0,z);poly([hit(a,lo),hit(b,lo),hit(b,hi),hit(a,hi)],'rgba(255,212,137,'+(.16+.3*face)+')')}ctx.restore()}
// A deep timber window seat catches grazing light before it reaches the floor.
const seat=.56, depth=.86;
poly([P(-2.18,seat),P(2.18,seat),P(2.18,seat,depth),P(-2.18,seat,depth)],blend([49,46,43],[159,117,80],daylight*.76));
poly([P(-2.18,seat,depth),P(2.18,seat,depth),P(2.18,.07,depth),P(-2.18,.07,depth)],blend([34,34,33],[87,66,50],daylight*.7));
if(elev>.1&&face>.02){ctx.save();ctx.beginPath();[P(-2.18,seat),P(2.18,seat),P(2.18,seat,depth),P(-2.18,seat,depth)].forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
for(const [a,b] of [[L,-.034],[.034,R]]){const slope=Math.tan(elev*rad)/face,z0=(B-seat)/slope,z1=Math.min(depth,(T-seat)/slope);if(z0<z1){const point=(u,z)=>P(u-z*Math.tan(az),seat,z);poly([point(a,z0),point(b,z0),point(b,z1),point(a,z1)],'#ffdf9b9c')}}ctx.restore()}
// At low angles the projected light reaches the opposite wall beyond the visible floor.
const shade=ctx.createRadialGradient(cx,cy,f,cx,cy,Math.max(w,h)*.8);shade.addColorStop(0,'#0c120e00');shade.addColorStop(1,'#090d105e');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h)}
function tick(t){if(t-last>50){draw(t);last=t}frame=requestAnimationFrame(tick)}
function animate(){cancelAnimationFrame(frame);draw(performance.now());if(!quiet.matches&&!document.hidden)frame=requestAnimationFrame(tick)}
function route(){const open=location.hash==='#planner';document.body.classList.toggle('open',open);panel.hidden=back.hidden=!open;update();if(open)range.focus({preventScroll:true});else tile.focus({preventScroll:true})}
back.onclick=()=>{location.hash=''};onhashchange=route;range.oninput=update;place.onchange=()=>day(false);date.onchange=()=>day(false);new ResizeObserver(()=>draw(performance.now())).observe(canvas);quiet.addEventListener('change',animate);document.addEventListener('visibilitychange',animate);day(true);route();animate();

roomPlate.onload=forestPlate.onload=()=>draw(performance.now());
