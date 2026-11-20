// The paper grows from the illustrated tile; the magnets are real brief fields.
(() => {
  const trigger = document.querySelector('.instrument-link.story, #story .tool-go');
  if (!trigger) return;
  const board = document.createElement('section');
  board.className = 'story-board';
  board.hidden = true;
  board.setAttribute('aria-labelledby','board-title');
  board.innerHTML = '<header><button type="button" data-back>← Tools</button><h1 id="board-title">Story generator</h1></header><div class="story-sheet"><small>Premise</small><p aria-live="polite">…</p></div><div class="magnet-caption">Tap a piece to pin it</div><div class="story-magnets"></div><div class="story-actions"><button type="button" data-roll>↻ Roll</button><a href="ideas.html">Full generator ↗</a></div>';
  document.body.append(board);
  const sheet = board.querySelector('.story-sheet');
  const roll = board.querySelector('[data-roll]');
  const back = board.querySelector('[data-back]');
  let brief, previousY=0, loading;
  const magnets = ['place','character','constraint'].map(field => {
    const button=document.createElement('button');
    button.type='button';
    button.dataset.field=field;
    button.innerHTML='<small>'+field+'</small><span></span>';
    button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true')));
    board.querySelector('.story-magnets').append(button);
    return button;
  });
  const motion=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('motion-paused');
  function glide(el,frames,duration,delay=0){
    if(!motion() || !el.animate)return;
    el.getAnimations().forEach(a=>a.cancel());
    el.animate(frames,{duration,delay,fill:'backwards',easing:'cubic-bezier(.2,.8,.23,1)'});
  }
  function deal(entering){
    const next=window.rollIdea(window.ideasData).text;
    magnets.forEach((button,i)=>{
      const key=button.dataset.field;
      if(brief && button.getAttribute('aria-pressed')==='true'){next[key]=brief[key];return;}
      button.querySelector('span').textContent=next[key];
      const side=i===1?1:-1;
      glide(button,[{transform:'translate('+side*(entering?52:20)+'px,14px) rotate('+side*5+'deg)',opacity:.3},{transform:'translate('+(-side*2)+'px,0) rotate('+(-side*.7)+'deg)',offset:.8},{transform:'none'}],300,entering?70+i*42:i*22);
    });
    brief=next;
    // The full generator accepts compact hashes of its original library entries.
    const fields=['concept','place','character','object','constraint','twist','genre','visualStyle','emotion','bonus'];
    const parts=fields.map(key=>{
      let hash=5381;
      for(const letter of next[key] || '') hash=(Math.imul(hash,33)+letter.charCodeAt(0))>>>0;
      return next[key]?hash.toString(36):'';
    });
    board.querySelector('.story-actions a').href='ideas.html#b='+parts.join('.');
    sheet.querySelector('p').textContent=next.concept;
    if(!entering)glide(sheet.querySelector('p'),[{transform:'translateY(6px)',opacity:.35},{transform:'none',opacity:1}],180);
  }
  roll.onclick=()=>deal(false);
  let revision=0;
  async function open(){
    if(!board.hidden)return;
    const ticket=++revision;
    previousY=scrollY;
    const origin=(trigger.querySelector('.token') || trigger).getBoundingClientRect();
    document.body.classList.add('story-editing');
    board.hidden=false;
    window.scrollTo(0,0);
    const end=sheet.getBoundingClientRect();
    glide(sheet,[{transformOrigin:'0 0',transform:'translate('+(origin.x-end.x)+'px,'+(origin.y-end.y)+'px) rotate(-6deg) scale('+origin.width/end.width+','+origin.height/end.height+')'},{transformOrigin:'0 0',transform:'none'}],370);
    back.focus({preventScroll:true});
    roll.disabled=true;
    try{
      if(!window.rollIdea) await (loading ||= import('./ideas-data.js'));
      if(ticket!==revision)return;
      if(!brief)deal(true);
      roll.disabled=false;
    }catch{loading=null;sheet.querySelector('p').textContent='The prompt library couldn’t load.';}
  }
  function close(){
    if(board.hidden)return;
    revision++;
    board.hidden=true;
    document.body.classList.remove('story-editing');
    window.scrollTo(0,previousY);
    trigger.focus({preventScroll:true});
  }
  function restore(){if(location.hash==='#tool-ideas')open();else close();}
  trigger.addEventListener('click',e=>{
    if(e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)return;
    e.preventDefault();
    history.pushState({storyBoard:true},'','#tool-ideas');
    open();
  });
  back.onclick=()=>{if(history.state?.storyBoard)history.back();else{history.replaceState(null,'','#directory');close();}};
  board.addEventListener('keydown',e=>{if(e.key==='Escape')back.click();});
  addEventListener('popstate',restore);
  restore();
})();
