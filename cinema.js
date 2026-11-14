/* An intentional, click-to-load screening room for the reel and every short. */
(()=>{'use strict';
const room=document.createElement('dialog');room.className='cinema-room';room.setAttribute('aria-labelledby','cinema-title');
room.innerHTML=`<div class="cinema-bar"><div><span class="cinema-kicker">THE LaB / PRIVATE SCREENING</span><h2 id="cinema-title"></h2></div><button class="cinema-exit">Leave theater ×</button></div><div class="cinema-stage"><div class="cinema-curtain curtain-left"></div><div class="cinema-curtain curtain-right"></div><div class="cinema-projector" aria-hidden="true"></div><div class="cinema-screen screen"></div></div><div class="cinema-bottom"><span>Settle in. The rest can wait.</span><div><button class="cinema-sound" aria-pressed="false">Entrance sound off</button><a class="cinema-youtube" target="_blank" rel="noopener">Watch on YouTube ↗</a></div></div><p class="cinema-help">Use the player’s fullscreen control for the biggest picture. Escape leaves the theater.</p>`;
const audience=document.createElement('div');audience.className='cinema-audience';audience.setAttribute('aria-hidden','true');
audience.innerHTML='<svg viewBox="0 0 1440 170" preserveAspectRatio="none">'+[[-30,20,.95],[140,5,1.05],[310,24,.9],[485,0,1.1],[675,27,.9],[860,10,1],[1050,26,.93],[1220,2,1.12],[1410,22,.96]].map(([x,y,z],i)=>`<g transform="translate(${x} ${y}) scale(${z})"><path class="seat-back" d="M-74 170V115Q-74 88-47 88H47Q74 88 74 115V170Z"/><path class="audience-person" d="M-59 153Q-62 108-30 99L-13 92V80Q-30 72-29 49Q-30 20-5 17Q25 12 30 44L28 62Q26 77 14 83V94L36 101Q65 111 64 153Z"/><path class="audience-rim" d="M-29 45Q-28 19-5 17Q20 13 28 36"/></g>`).join('')+'</svg>';room.append(audience);
document.body.append(room);let origin,sound=false,audio;let entranceAnimations=[];
const mount=room.querySelector('.cinema-screen');
function tone(){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();[130.81,196,261.63].forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.018,t+.07+i*.04);g.gain.exponentialRampToValueAtTime(.0001,t+.7);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.8);});}catch{}}
room.querySelector('.cinema-sound').onclick=e=>{sound=!sound;e.currentTarget.setAttribute('aria-pressed',String(sound));e.currentTarget.textContent=sound?'Entrance sound on':'Entrance sound off';tone();};
function open(id,title,button){origin=button;
 const fromWall=button.classList.contains('theater-watch');
 const panes=fromWall?[...document.querySelectorAll('.projection-wall .wing')].map(w=>({rect:w.getBoundingClientRect(),poster:w.querySelector('video').poster})):[];
 room.classList.toggle('from-film-wall',fromWall);
 document.querySelectorAll('.close-player:not([hidden])').forEach(b=>b.click());const reelClose=document.querySelector('.theater-close');if(reelClose&&!document.querySelector('.theater-controls').hidden)reelClose.click();
 document.querySelectorAll('video').forEach(v=>v.pause());
 room.querySelector('#cinema-title').textContent=title;room.querySelector('.cinema-youtube').href='https://www.youtube.com/watch?v='+id;
 const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1';frame.title=title+' — theater player';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';mount.replaceChildren(frame);
 document.body.classList.add('cinema-open');room.showModal();room.querySelector('.cinema-exit').focus();tone();
 if(fromWall&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('motion-paused')){
 panes.forEach(({rect,poster},i)=>{const pane=document.createElement('img');pane.className='cinema-wall-pane';pane.alt='';pane.src=poster;Object.assign(pane.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});room.append(pane);const side=i<3?-1:1;const motion=pane.animate([{transform:'perspective(900px) translate3d(0,0,0) rotateY(0)',opacity:1},{offset:.22,transform:`perspective(900px) translate3d(${side*18}px,-8px,60px) rotateY(${side*8}deg)`,opacity:1},{transform:`perspective(900px) translate3d(${side*(innerWidth+rect.width)}px,${-60-Math.abs(i-3)*20}px,-150px) rotateY(${side*65}deg)`,opacity:0}],{duration:1500,delay:Math.abs(i-3)*65,easing:'cubic-bezier(.65,0,.2,1)',fill:'forwards'});entranceAnimations.push(motion);motion.finished.then(()=>pane.remove()).catch(()=>pane.remove());});
 }

}
room.querySelector('.cinema-exit').onclick=()=>room.close();room.addEventListener('close',()=>{entranceAnimations.forEach(a=>a.cancel());entranceAnimations=[];room.querySelectorAll('.cinema-wall-pane').forEach(p=>p.remove());mount.replaceChildren();document.body.classList.remove('cinema-open');origin?.focus({preventScroll:true});dispatchEvent(new Event('scroll'));});
function button(id,title){const b=document.createElement('button');b.type='button';b.className='cinema-launch';b.textContent='↗ Enter theater';b.setAttribute('aria-label','Watch '+title+' in the theater');b.onclick=()=>open(id,title,b);return b;}
document.querySelectorAll('.watch[data-video]').forEach(w=>{const section=w.closest('section');section.querySelector('.player-meta')?.append(button(w.dataset.video,w.dataset.title));});
const reel=document.querySelector('.theater-watch')||document.querySelector('#watch-reel');reel?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open('UAFQ5KU-6Jg','2024 LaB Media reel',reel);},true);
})();
