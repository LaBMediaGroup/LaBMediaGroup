const q = selector => document.querySelector(selector);
const records = [...SPOTLIGHT].sort((a,b)=>a.date.localeCompare(b.date));
const flyer = records.find(record=>record.photos?.length);
const posterURL = 'light/kickoff-art.webp';
q('#poster img').src = posterURL;
const modal = q('dialog');
function show(html) {
  q('#content').innerHTML = html;
  modal.showModal();
}
const pin = q('#poster');
pin.insertAdjacentHTML('beforeend','<i class="blue-sheet" aria-hidden="true"></i>');
const reduceMotion = matchMedia('(prefers-reduced-motion:reduce)');
let flyerAnimation;
function paperTransform(from,to) {
  return 'translate('+ (from.left-to.left+(from.width-to.width)/2) +'px,'+
    (from.top-to.top+(from.height-to.height)/2)+'px) scale('+from.width/to.width+') rotate(-3deg)';
}
pin.onclick = () => {
  modal.removeAttribute('aria-labelledby');modal.setAttribute('aria-label','Festival flyer');
  const start=pin.getBoundingClientRect();
  modal.classList.add('flyer-view');
  show('<span class="loose-sheet"><img src="'+posterURL+'" alt="'+flyer.photos[0].alt+'"><i class="blue-sheet" aria-hidden="true"></i></span>');
  const image=q('.loose-sheet');
  pin.classList.add('flyer-away');
  if(!reduceMotion.matches)flyerAnimation=image.animate([
    {transform:paperTransform(start,image.getBoundingClientRect())},
    {transform:'none'}
  ],{duration:460,easing:'cubic-bezier(.17,.78,.22,1)'});
};
let closing=false;
async function closeDetail(){
  if(closing)return;
  closing=true;
  if(modal.classList.contains('flyer-view')&&!reduceMotion.matches){
    flyerAnimation?.cancel();
    const image=q('.loose-sheet');
    await image.animate([{transform:'none'},{transform:paperTransform(pin.getBoundingClientRect(),image.getBoundingClientRect())}],{duration:290,easing:'ease-in-out'}).finished;
  }
  modal.close();modal.classList.remove('flyer-view');pin.classList.remove('flyer-away');closing=false;
}
q('#close').onclick=closeDetail;
modal.oncancel=event=>{event.preventDefault();closeDetail()};
modal.onclick=event=>{if(event.target===modal || (modal.classList.contains('flyer-view') && event.target===q('#content')))closeDetail()};
function details(record) {
  const links = new Map([[record.byUrl,record.by],[record.venueUrl,record.venue],[record.mapUrl,record.address],[record.url,'Event details']]);
  for (const link of record.links || []) links.set(link.url,link.label);
  const date=new Date(record.date+'T12:00:00');
  const month=date.toLocaleDateString('en-US',{month:'short'});
  const weekday=date.toLocaleDateString('en-US',{weekday:'long',year:'numeric'});
  const sources=[...links].filter(([url])=>url).map(([url,label])=>'<a href="'+url+'">'+label+' <span aria-hidden="true">↗</span></a>').join('');
  modal.setAttribute('aria-labelledby','event-heading');
  show('<article class="event-sheet"><header class="event-dateline"><time datetime="'+record.date+'"><b>'+date.getDate()+'</b> '+month+'</time><span>'+weekday+'</span></header>'+
    '<h2 id="event-heading">'+record.title+'</h2><div class="event-venue">'+record.where+'<br><strong>'+record.time+'</strong></div>'+
    '<p class="event-story">'+record.body+'</p><nav class="event-sources" aria-label="Event sources">'+sources+'</nav></article>');

}
let month = new Date(2026,7,1);
function entry(record, agenda) {
  const button = document.createElement('button');
  button.className = agenda?'agenda-item':'event';
  const when = new Date(record.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  button.innerHTML = agenda?'<small>'+when+'</small><strong>'+record.title+'</strong>':record.title;
  button.onclick = ()=>details(record);
  return button;
}
function render() {
  q('h1').textContent = month.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const grid = q('#days'), agenda = q('#agenda');
  grid.replaceChildren(); agenda.replaceChildren();
  for (const weekday of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']) {
    const label=document.createElement('span');label.className='weekday';label.textContent=weekday;grid.append(label);
  }
  const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  for(let d=1;d<=count;d++) {
    const cell=document.createElement('div');cell.className='cell';cell.textContent=d;
    if(d===1)cell.style.gridColumnStart=month.getDay()+1;
    const key=[month.getFullYear(),String(month.getMonth()+1).padStart(2,'0'),String(d).padStart(2,'0')].join('-');
    for(const record of records.filter(r=>r.date===key)){cell.append(entry(record,false));agenda.append(entry(record,true))}
    grid.append(cell);
  }
  if(!agenda.children.length)agenda.textContent='No listings this month.';
}
function step(by){month=new Date(month.getFullYear(),month.getMonth()+by,1);render()}
q('#prev').onclick=()=>step(-1);q('#next').onclick=()=>step(1);render();
