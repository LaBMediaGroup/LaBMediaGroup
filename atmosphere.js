/* Atmosphere: native controls, progressive motion, and opt-in sound. */
(()=>{'use strict';
const isHome=!!document.querySelector('#hero-video');
if(!document.querySelector('.appearance')){
 const old=document.querySelector('.theme');if(!old)return;
 const template=document.createElement('template');template.innerHTML="<details class=\"appearance site-appearance\"><summary aria-label=\"Change appearance\">\u25d0</summary><div class=\"palette-panel\"><div class=\"palette-heading\"><span class=\"micro\">Set the atmosphere</span><strong>A different light.</strong><p>Same LaB. Your kind of room.</p></div><div class=\"palette-options\" role=\"group\" aria-label=\"Colour palette\"><button class=\"palette-choice\" data-palette=\"dark\" aria-pressed=\"false\"><span class=\"palette-swatch swatch-dark\" aria-hidden=\"true\"></span><span>After hours<small>Lights low. Ideas on.</small></span><span class=\"palette-check\" aria-hidden=\"true\">\u2713</span></button><button class=\"palette-choice\" data-palette=\"light\" aria-pressed=\"false\"><span class=\"palette-swatch swatch-light\" aria-hidden=\"true\"></span><span>Daylight<small>A little room to breathe.</small></span><span class=\"palette-check\" aria-hidden=\"true\">\u2713</span></button><button class=\"palette-choice\" data-palette=\"sepia\" aria-pressed=\"false\"><span class=\"palette-swatch swatch-sepia\" aria-hidden=\"true\"></span><span>Paper<small>Notes in the margins.</small></span><span class=\"palette-check\" aria-hidden=\"true\">\u2713</span></button><button class=\"palette-choice\" data-palette=\"timber\" aria-pressed=\"false\"><span class=\"palette-swatch swatch-timber\" aria-hidden=\"true\"></span><span>Timber<small>Warm wood. Late nights.</small></span><span class=\"palette-check\" aria-hidden=\"true\">\u2713</span></button><button class=\"palette-choice\" data-palette=\"forest\" aria-pressed=\"false\"><span class=\"palette-swatch swatch-forest\" aria-hidden=\"true\"></span><span>Forest<small>Out of the noise.</small></span><span class=\"palette-check\" aria-hidden=\"true\">\u2713</span></button></div><div class=\"palette-utilities\"><button id=\"motion\" aria-pressed=\"false\">Pause motion</button><button data-sound-toggle aria-pressed=\"false\">UI sounds off · try</button></div></div></details>";
 old.after(template.content);old.style.setProperty('display','none','important');
 document.querySelectorAll('.mobile-theme').forEach(e=>e.style.setProperty('display','none','important'));
 if(!document.querySelector('.theater'))document.querySelector('.site-appearance #motion')?.remove();
}
const root=document.documentElement, panel=document.querySelector('.appearance'), choices=[...document.querySelectorAll('[data-palette]')], reduce=matchMedia('(prefers-reduced-motion: reduce)');
const quiet=()=>reduce.matches||root.classList.contains('motion-paused');
let transition, sound=false, audio;
function chime(type='tap'){
 if(!sound)return;
 try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const now=audio.currentTime;
 [0,1].forEach(i=>{const tone=audio.createOscillator(),gain=audio.createGain();tone.type='sine';tone.frequency.setValueAtTime((type==='palette'?330:440)*(i?1.5:1),now);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.025,now+.012+i*.045);gain.gain.exponentialRampToValueAtTime(.0001,now+.24+i*.08);tone.connect(gain).connect(audio.destination);tone.start(now);tone.stop(now+.36);});}catch{}
}
function mark(){document.querySelectorAll('[data-theme-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeSet===(root.dataset.theme||'dark'))));document.querySelectorAll('.mobile-theme').forEach(s=>s.value=root.dataset.theme||'dark');choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===(root.dataset.theme||'dark'))));}mark();
choices.forEach(b=>b.addEventListener('click',async()=>{
 const theme=b.dataset.palette;if((root.dataset.theme||'dark')===theme)return;
 chime('palette');const box=b.querySelector('.palette-swatch').getBoundingClientRect(),x=box.left+box.width/2,y=box.top+box.height/2,r=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
 const apply=()=>{root.dataset.theme=theme;mark();try{localStorage.setItem('lab-theme-v2',theme);}catch{}};
 if(quiet()||!document.startViewTransition){apply();return;}
 transition?.skipTransition();root.classList.add('palette-spilling');
 const current=transition=document.startViewTransition(apply);
 try{await current.ready;await root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${r}px at ${x}px ${y}px)`]},{duration:850,easing:'cubic-bezier(.2,.7,.15,1)',pseudoElement:'::view-transition-new(root)'}).finished;}catch{}finally{if(transition===current){root.classList.remove('palette-spilling');transition=null;}}
}));
panel.addEventListener('toggle',()=>{if(panel.open)chime();});
document.addEventListener('pointerdown',e=>{if(panel.open&&!panel.contains(e.target))panel.open=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.open){panel.open=false;panel.querySelector('summary').focus();}});
document.querySelector('[data-sound-toggle]').onclick=e=>{sound=!sound;e.currentTarget.setAttribute('aria-pressed',String(sound));e.currentTarget.textContent=sound?'UI sounds on':'UI sounds off · try' ;chime();};
document.querySelectorAll('#roll,[role=tab],[data-ratio],#watch-reel,[data-project]').forEach(b=>b.addEventListener('click',()=>chime()));
if(!isHome){
 const motion=document.querySelector('#motion');if(!motion)return;motion.setAttribute('aria-pressed',String(reduce.matches));motion.textContent=reduce.matches?'Resume motion':'Pause motion';
 motion.onclick=()=>{const pause=!root.classList.contains('motion-paused');root.classList.toggle('motion-paused',pause);motion.setAttribute('aria-pressed',String(pause));motion.textContent=pause?'Resume motion':'Pause motion';if(pause)document.querySelectorAll('video').forEach(v=>v.pause());document.dispatchEvent(new CustomEvent('lab-motion-change',{detail:{paused:pause}}));};
 if(reduce.matches)root.classList.add('motion-paused');
 return;
}
})();
