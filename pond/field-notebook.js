// The local owner's notebook uses the same pond sheet as the art wall and games.
export function fieldNotebook(host,places,initialSection) {
  const labels = {thoughts:'Thoughts',notes:'Field notes',nights:'Nightly entries',searches:'Searches'};
  const headings = {thoughts:'On his mind',notes:'From his notebook',nights:'At the end of the day',searches:'At the shed computer'};
  const blank = {thoughts:'His next thought will appear here.',notes:'He hasn’t written his first field note yet.',nights:'His first nightly entry will appear after his long sleep.',searches:'He hasn’t looked anything up yet.'};
  host.innerHTML = `<div class="book-tabs" role="group" aria-label="Journal sections">
    ${Object.entries(labels).map(([key,name])=>`<button type="button" data-book="${key}">${name}</button>`).join('')}
    </div><div class="field-book"><article class="book-leaf" aria-live="polite" aria-atomic="true">
      <header><h3></h3><span class="page-num"></span></header><small></small>
      <div class="book-words"></div></article>
      <div class="book-turn"><button type="button" data-turn="-1" aria-label="Older page">← Older</button>
      <button type="button" data-turn="1" aria-label="Newer page">Newer →</button></div></div>`;
  const leaf=host.querySelector('.book-leaf'), words=leaf.querySelector('.book-words');
  let data={thoughts:[],notes:[],nights:[],searches:[]}, section=Object.hasOwn(labels,initialSection)?initialSection:'thoughts', index=-1, fetched=0, pending=false, error=false;
  const pg = (tag,text) => { const el=document.createElement(tag); el.textContent=text; words.appendChild(el); return el; };
  function paint(turn=false) {
    const items=data[section], entry=items[index];
    for (const b of host.querySelectorAll('[data-book]')) b.setAttribute('aria-pressed',String(b.dataset.book===section));
    leaf.querySelector('h3').textContent=headings[section];
    leaf.querySelector('.page-num').textContent=entry ? (index+1)+' / '+items.length : '';
    leaf.querySelector('small').textContent=entry ? [entry.stamp,places[entry.place]?.label || entry.place?.replaceAll('_',' ')].filter(Boolean).join(' · ') : '';
    words.replaceChildren();
    if(entry){
      for(const para of entry.text.split(/\n\s*\n/)) pg('p',para);
      if(section==='searches'){
        const states={started:'Lookup started',unavailable:'The encyclopedia was out of reach.',no_finding:'He didn’t save a passage from this search.',read:'He read '+(entry.title||'an article')+'.'};
        pg('small',states[entry.status]||'');
      }
      if(entry.query){pg('h4','He looked up');pg('p',entry.query);}
      if(entry.finding){pg('h4','What he found');pg('p',entry.finding);}
      if(Number.isSafeInteger(entry.page)&&entry.page>0){
        const link=pg('a',entry.title?'Read '+entry.title+' ↗':'Read the article ↗');link.href='https://en.wikipedia.org/?curid='+entry.page;link.target='_blank';link.rel='noopener noreferrer';
      }
      if(section==='searches' && items.length>1){
        const past=document.createElement('details'),summary=document.createElement('summary');summary.textContent='All searches ('+items.length+')';past.appendChild(summary);
        items.forEach((item,i)=>{
          const b=document.createElement('button');b.type='button';b.className='search-entry';b.textContent=item.text+' · '+item.stamp;b.onclick=()=>{index=i;paint(true);};past.appendChild(b);
        });words.appendChild(past);
      }
    } else {
      pg('p',error?'His notebook is out of reach.':!fetched?'Opening his notebook…':blank[section]);
      if(error){const retry=pg('button','Try again');retry.type='button';retry.onclick=()=>refresh(true);}
    }
    host.querySelector('[data-turn="-1"]').disabled=index<=0;
    host.querySelector('[data-turn="1"]').disabled=index<0||index>=items.length-1;
    if(turn&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      leaf.animate([{opacity:.65,transform:'translateX(3px)'},{opacity:1,transform:'none'}],{duration:155,easing:'ease-out'});
    }
  }
  function changePage(step) {
    const next=Math.min(data[section].length-1,Math.max(0,index+step));
    if(next!==index){index=next;paint(true);}
  }
  host.addEventListener('click',e=>{
    const tab=e.target.closest('[data-book]'),page=e.target.closest('[data-turn]');
    if(tab){section=tab.dataset.book;index=data[section].length-1;paint(true);}
    if(page)changePage(Number(page.dataset.turn));
  });
  host.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();changePage(e.key==='ArrowLeft'?-1:1);}
  });
  async function refresh(force=false) {
    if(pending || !force && Date.now()-fetched<30000)return;
    pending=true;
    try{
      const resp=await fetch('http://127.0.0.1:5437/entries',{cache:'no-store',credentials:'omit'});
      if(!resp.ok)throw Error();
      const next=await resp.json(), prior=data[section][index];
      data={...next,searches:next.searches||[]};
      const same=prior?data[section].findIndex(p=>p.stamp===prior.stamp&&p.text===prior.text):-1;
      index=same<0?data[section].length-1:same;
      error=false;
    }catch{error=true;}finally{fetched=Date.now();pending=false;paint();}
  }
  paint();return refresh;
}
