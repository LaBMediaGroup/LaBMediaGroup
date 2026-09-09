/* Project galleries: original asset identities keep saved Kit photos working. */
(() => {
'use strict';
const projects=window.LaBGalleries || [], key='lab-favs-v1';
if(!projects.length)return;
const dialog=document.createElement('dialog');dialog.className='project-viewer';dialog.setAttribute('aria-label','Project gallery');
dialog.innerHTML=`<header class="pg-head"><div><h2></h2><p class="pg-note"></p></div><button class="pg-close" aria-label="Close gallery">Close ×</button></header><div class="pg-tools"><label>Gallery <select aria-label="Gallery group"></select></label><span class="pg-count" aria-live="polite"></span></div><div class="pg-stage"></div><p class="pg-caption"></p><footer class="pg-controls"><button class="pg-prev" aria-label="Previous photo or clip">←</button><button class="pg-save" aria-pressed="false">♡ Keep photo</button><button class="pg-next" aria-label="Next photo or clip">→</button><button class="pg-browse" aria-expanded="false">All thumbnails</button></footer><div class="pg-thumbs" hidden></div>`;
document.body.append(dialog);
const q=s=>dialog.querySelector(s),stage=q('.pg-stage'),select=q('select'),save=q('.pg-save');
let project,items=[],index=0,last=null,oldOverflow='',touch=null;
const read=()=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
const flatten=p=>p.groups.flatMap(g=>g.items.map(i=>({...i,group:g.name,note:g.note})));
function saved(){save.setAttribute('aria-pressed',String(read().some(f=>f.src===items[index].src)));save.textContent=save.getAttribute('aria-pressed')==='true'?'♥ Kept in your Kit':'♡ Keep photo';save.hidden=items[index].type==='video'}
function stop(){stage.querySelector('video')?.pause();stage.replaceChildren()}
function show(n){
 index=(n+items.length)%items.length;stop();const item=items[index];
 const media=document.createElement(item.type==='video'?'video':'img');
 if(item.type==='video'){media.controls=true;media.playsInline=true;media.preload='metadata';media.poster=item.thumb;media.setAttribute('aria-label',item.caption||item.group)}else{media.alt=item.caption||`${project.title} — ${item.group}, photo ${index+1}`;media.decoding='async'}
 media.src=item.src;media.onerror=()=>{const p=document.createElement('p');p.textContent='This file could not load. ';const a=document.createElement('a');a.href=item.src;a.textContent='Open the original';p.append(a);stage.replaceChildren(p)};stage.append(media);
 q('h2').textContent=project.title;q('.pg-note').textContent=item.note||item.group;
 q('.pg-caption').textContent=[item.caption,item.meta].filter(Boolean).join(' · ');
 q('.pg-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
 saved();q('.pg-prev').disabled=q('.pg-next').disabled=items.length<2;
 q('.pg-thumbs').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));
 if(item.type==='image'){const next=items[(index+1)%items.length];if(next.type==='image'){const im=new Image();im.src=next.src}}
}
function thumbnails(){const tray=q('.pg-thumbs');tray.replaceChildren();items.forEach((item,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',`${item.group}: ${item.caption||'Photo '+(i+1)}`);const im=document.createElement('img');im.src=item.thumb;im.alt='';im.loading='lazy';b.append(im);b.onclick=()=>show(i);tray.append(b)})}
function open(p,src){project=p;last=document.activeElement;select.replaceChildren();['All photos & clips',...p.groups.map(g=>g.name)].forEach((name,i)=>{const o=document.createElement('option');o.value=String(i-1);o.textContent=name;select.append(o)});items=flatten(p);thumbnails();show(Math.max(0,items.findIndex(i=>i.src===src)));q('.pg-thumbs').hidden=true;q('.pg-browse').setAttribute('aria-expanded','false');oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();q('.pg-close').focus()}
select.onchange=()=>{items=select.value==='-1'?flatten(project):project.groups[Number(select.value)].items.map(i=>({...i,group:project.groups[Number(select.value)].name,note:project.groups[Number(select.value)].note}));thumbnails();show(0)};
q('.pg-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{stop();document.body.style.overflow=oldOverflow;last?.focus({preventScroll:true})});
q('.pg-prev').onclick=()=>show(index-1);q('.pg-next').onclick=()=>show(index+1);
q('.pg-browse').onclick=()=>{const tray=q('.pg-thumbs');tray.hidden=!tray.hidden;q('.pg-browse').setAttribute('aria-expanded',String(!tray.hidden))};
save.onclick=()=>{const item=items[index],f=read(),pos=f.findIndex(x=>x.src===item.src);if(pos>=0)f.splice(pos,1);else f.push({src:item.src,thumb:item.thumb,film:project.title,filmId:project.legacyId,t:Date.now()});try{localStorage.setItem(key,JSON.stringify(f.slice(-50)));saved()}catch{save.textContent='Storage unavailable'}};
window.addEventListener('storage',()=>{if(dialog.open)saved()});
dialog.addEventListener('keydown',e=>{if(e.target.matches('select,video'))return;if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}});
stage.addEventListener('touchstart',e=>{touch=e.touches.length===1&&!e.target.closest('video')?{x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}:null},{passive:true});
stage.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;if(Date.now()-touch.t<700&&Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.6)show(index+(dx<0?1:-1));touch=null},{passive:true});
projects.forEach(p=>{
 const section=document.getElementById(p.id);if(!section)return;
 // Existing editorial photos now enter the same project viewer at that frame.
 section.querySelectorAll('[data-image]').forEach(b=>{const src=b.dataset.image;if(!flatten(p).some(i=>i.src===src)){let g=p.groups.find(g=>g.name==='Selected frames');if(!g){g={name:'Selected frames',note:'Selected frames',items:[]};p.groups.push(g)}g.items.push({src,thumb:src,type:'image',caption:b.dataset.caption||'',meta:''})}b.onclick=()=>open(p,src)});
 const row=document.createElement('div');row.className='project-gallery-entry';const button=document.createElement('button');button.className='gallery-open';const photos=flatten(p).filter(i=>i.type==='image').length,clips=flatten(p).filter(i=>i.type==='video').length;
 const fan=document.createElement('span');fan.className='gallery-fan';fan.setAttribute('aria-hidden','true');flatten(p).slice(0,3).forEach(i=>{const im=document.createElement('img');im.src=i.thumb;im.alt='';im.loading='lazy';fan.append(im)});
 const label=document.createElement('span');label.textContent=`Explore the gallery · ${photos} photos${clips?' · '+clips+' clip'+(clips>1?'s':''):''} ↗`;button.append(fan,label);button.onclick=()=>open(p);row.append(button);
 if(section.tagName==='SPAN'){section.style.display='block'}section.append(row);
});
function favoriteLink(){if(!location.hash.startsWith('#fav='))return;let src;try{src=decodeURIComponent(location.hash.slice(5))}catch{return}const p=projects.find(p=>flatten(p).some(i=>i.src===src));if(p){if(dialog.open)dialog.close();open(p,src)}}
window.addEventListener('hashchange',favoriteLink);favoriteLink();
})();
