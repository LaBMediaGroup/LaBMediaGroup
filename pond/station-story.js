// Each door line is a field from the same local-filmmaker roll used in ideas.html.
window.createStoryFridge = function({get,world,onShuffle}) {
  const fields = {concept:'Premise',place:'Place',character:'Character',object:'Object',constraint:'Constraint',twist:'Twist',genre:'Genre',visualStyle:'Visual style',emotion:'Emotion',bonus:'Bonus challenge'};
  const keys=Object.keys(fields), pinned=new Set();
  const field=get('storyField'), tone=get('storyTone'), sheet=get('briefSheet');
  let brief={};
  for(const key of keys) field.add(new Option(fields[key],key));
  const pools=['concepts','places','characters','objects','constraints','twists','genres','visualStyles','emotions','bonuses'];
  const locks=new Map(keys.map(k=>[k,new Map()]));
  const wordBox=get('wordButtons');
  let focusWord=0;
  function shareLink() {
    return '../ideas.html#b='+keys.map((key,i)=>window.LaBBriefLink.encode(brief[key],pools[i])).join('.');
  }
  function paintWords(tokens,locked) {
    const hadFocus=wordBox.contains(document.activeElement);
    focusWord=Math.max(0,Math.min(focusWord,tokens.length-1));
    tokens.forEach((word,i)=>{
      let btn=wordBox.children[i];
      if(!btn){btn=document.createElement('button');btn.type='button';btn.dataset.index=i;wordBox.append(btn);}
      btn.textContent=word;btn.setAttribute('aria-label',(locked.has(i)?'Unpin ':'Pin ')+word);
      btn.setAttribute('aria-pressed',String(locked.has(i)));btn.tabIndex=i===focusWord?0:-1;
    });
    while(wordBox.children.length>tokens.length)wordBox.lastElementChild.remove();
    if(hadFocus)wordBox.children[focusWord]?.focus({preventScroll:true});
  }
  function toggleWord(i) {
    const key=field.value,tokens=brief[key]?.trim().split(/\s+/)||[];
    if(!Number.isInteger(i)||i<0||i>=tokens.length)return;
    const locked=locks.get(key);
    if(locked.has(i))locked.delete(i);else locked.set(i,tokens[i]);
    focusWord=i;paint();
  }
  wordBox.addEventListener('click',e=>{const button=e.target.closest('button');if(button)toggleWord(+button.dataset.index);});
  wordBox.addEventListener('keydown',e=>{
    const moves={ArrowRight:1,ArrowLeft:-1};
    if(!(e.key in moves))return;
    e.preventDefault();const children=wordBox.children;
    const next=(+document.activeElement.dataset.index+moves[e.key]+children.length)%children.length;
    children[focusWord].tabIndex=-1;focusWord=next;children[next].tabIndex=0;children[next].focus({preventScroll:true});
  });
  function paint(animate=false) {
    const key=field.value,locked=locks.get(key),tokens=(brief[key]||'').trim().split(/\s+/);
    get('premise').textContent=brief[key] || '';
    get('pinLine').setAttribute('aria-pressed',String(pinned.has(key)));
    get('pinLine').textContent=pinned.has(key)?'Unlock line':'Lock line';
    get('shuffleLine').disabled=pinned.has(key)||locked.size===tokens.length;
    get('roll').disabled=pinned.size===keys.length;
    get('developBrief').href=shareLink();
    paintWords(tokens,locked);
    world()?.setStoryLine?.(brief[key]||'',fields[key],animate,[...locked.keys()]);
  }
  function roll(one=false,sound=true) {
    if(!window.rollIdea || !window.ideasData || (one && pinned.has(field.value)))return;
    const pick=()=>window.rollIdea(window.ideasData,{localMode:true,tone:tone.value||null}).text;
    let fresh=pick();
    for(let i=0;i<3 && fresh[field.value]===brief[field.value];i++)fresh=pick();
    for(const key of keys){
      if(pinned.has(key)||(one && key!==field.value))continue;
      const locked=locks.get(key);
      if(!locked.size){brief[key]=fresh[key];continue;}
      const previous=brief[key].split(/\s+/);
      if(locked.size===previous.length)continue;
      const words=fresh[key].split(/\s+/),last=Math.max(...locked.keys());
      while(words.length<=last)words.push(previous[words.length]);
      for(const [index,word] of locked)words[index]=word;
      brief[key]=words.join(' ');
    }
    paint(sound);if(sound)onShuffle();
  }
  field.addEventListener('change',()=>paint(true));
  tone.addEventListener('change',()=>roll());
  get('roll').addEventListener('click',()=>roll());
  get('shuffleLine').addEventListener('click',()=>roll(true));
  get('pinLine').addEventListener('click',()=>{
    const key=field.value;
    if(pinned.has(key))pinned.delete(key);else pinned.add(key);
    paint();
  });
  get('readBrief').addEventListener('click',()=>{
    const list=get('briefLines');
    list.replaceChildren(...keys.flatMap(key=>{
      const term=document.createElement('dt'),description=document.createElement('dd');
      term.textContent=fields[key];description.textContent=brief[key];
      return [term,description];
    }));
    get('copyBrief').textContent='Copy brief';
    sheet.showModal();sheet.scrollTop=0;
  });
  get('briefClose').addEventListener('click',()=>sheet.close());
  sheet.addEventListener('click',e=>{
    if(e.target!==sheet)return;
    const r=sheet.getBoundingClientRect();
    if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom)sheet.close();
  });
  get('copyBrief').addEventListener('click',async()=>{
    const copy=keys.map(key=>fields[key]+' — '+brief[key]).join('\n');
    try{await navigator.clipboard.writeText(copy);get('copyBrief').textContent='Copied';}
    catch{const range=document.createRange();range.selectNodeContents(get('briefLines'));const s=getSelection();s.removeAllRanges();s.addRange(range);get('copyBrief').textContent='Brief selected';}
  });
  roll(false,false);
  return {refresh:()=>paint(),shuffleLine:()=>roll(true),toggleWord, pickField(key){
    if(!Object.hasOwn(fields,key))return;
    field.value=key;focusWord=0;paint(true);
  }};
};
