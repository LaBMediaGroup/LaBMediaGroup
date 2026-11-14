/* Film-first gallery; production archives open only when requested. */
(()=>{'use strict';
const films=[...document.querySelectorAll('section.scattered,section.commission')];if(!films.length)return;
const gallery=document.createElement('section');gallery.className='film-gallery';gallery.setAttribute('aria-label','Films');gallery.id='film-gallery';
const host=document.createElement('div');host.className='film-detail-host';
const index=document.querySelector('.index-line');index.after(gallery,host);index.hidden=true;
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('motion-paused');
let active=null,opener=null;
function hide(){if(!active)return;active.hidden=true;active.querySelectorAll('video').forEach(v=>v.pause());active=null;document.querySelectorAll('.film-notes-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));}
function show(section,button){hide();active=section;opener=button;section.hidden=false;button?.setAttribute('aria-expanded','true');if(!calm())section.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});section.scrollIntoView({behavior:calm()?'auto':'smooth',block:'start'});dispatchEvent(new Event('resize'));dispatchEvent(new Event('scroll'));section.querySelector('.film-notes-close').focus({preventScroll:true});}
films.forEach(section=>{const watch=section.querySelector('.watch'),source=section.querySelector('.screen img'),title=watch.dataset.title;
const card=document.createElement('article');card.className='film-tile';const image=document.createElement('img');image.src=source.src;image.alt=source.alt;image.loading='lazy';
const visual=document.createElement('button');visual.type='button';visual.className='film-tile-play';visual.dataset.cinema=watch.dataset.video;visual.dataset.title=title;visual.setAttribute('aria-label','Watch '+title+' in the theater');visual.append(image);const play=document.createElement('span');play.className='film-play-symbol';play.textContent='▷';play.setAttribute('aria-hidden','true');visual.append(play);
const bottom=document.createElement('div');bottom.className='film-tile-caption';const heading=document.createElement('h2');heading.textContent=title;const notes=document.createElement('button');notes.type='button';notes.className='film-notes-toggle';notes.textContent='Behind the film ↗';notes.setAttribute('aria-label','Behind the film: '+title);notes.setAttribute('aria-expanded','false');notes.setAttribute('aria-controls',section.id);notes.onclick=()=>show(section,notes);bottom.append(heading,notes);card.append(visual,bottom);gallery.append(card);
const close=document.createElement('button');close.type='button';close.className='film-notes-close';close.textContent='Back to all films ×';close.onclick=async()=>{if(!calm())await section.animate([{opacity:1},{opacity:0}],{duration:220}).finished;hide();history.replaceState(null,'',location.pathname+location.search);opener?.focus({preventScroll:true});card.scrollIntoView({behavior:calm()?'auto':'smooth',block:'center'});};section.prepend(close);host.append(section);section.hidden=true;
});
document.querySelector('.commissions .section-rule').hidden=true;document.querySelector('.commission-grid').hidden=true;
function hash(){const section=films.find(s=>'#'+s.id===location.hash);if(section)show(section,gallery.querySelector('[aria-controls="'+section.id+'"]'));}
addEventListener('hashchange',hash);hash();dispatchEvent(new Event('scroll'));
})();
