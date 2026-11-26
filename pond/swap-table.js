// Offers and receipts belong to the visitor ID already used by the pond API.
export function swapTable(pane,api,onHistory){
  const choices=pane.querySelector('.swap-choices'),hint=pane.querySelector('.swap-hint'),receipt=pane.querySelector('.swap-receipt');
  let active=false,reading=false,lastChoices='',draft=null,history=[];
  try{draft=JSON.parse(localStorage.getItem('labcoon-swap-draft')||'null');}catch{}
  function saveDraft(value){draft=value;try{if(value)localStorage.setItem('labcoon-swap-draft',JSON.stringify(value));else localStorage.removeItem('labcoon-swap-draft');}catch{}}
  function text(r){return r.outcome==='traded'?'He kept your '+r.offered+' and gave you his '+r.gave+'.':r.outcome==='returned'?'He inspected your '+r.offered+' and handed it back.':'Your '+r.offered+' is waiting on the picnic table.';}
  function buttons(data){
    const key=data.choices.join('|');
    if(key!==lastChoices){
      choices.replaceChildren();lastChoices=key;
      for(const name of data.choices){
        const b=document.createElement('button');b.type='button';b.className='st-pill';
        b.textContent=name;b.dataset.offer=name;b.setAttribute('aria-label','Offer '+name);choices.appendChild(b);
      }
    }
    for(const b of choices.children)b.disabled=active||data.left<=0||!!draft&&draft.offered!==b.dataset.offer;
    hint.textContent=draft?'Select '+draft.offered+' to retry your offer.':data.left===0?'You’ve made both offers today.':data.left+' of 2 daily offers left.';
    receipt.textContent=data.records[0]?text(data.records[0]):'';
  }
  async function refresh(){
    if(!api){hint.textContent='Trading opens in the local live pond.';return;}
    if(reading||active)return;reading=true;
    try{
      const data=await api('/swaps',{});
      if(draft&&data.records.some(r=>r.id===draft.id))saveDraft(null);
      history=data.records.map(r=>({kind:'swap',text:text(r),at:r.at}));onHistory(history);
      if(!active)buttons(data);
    }catch(e){hint.textContent=e.message;}finally{reading=false;}
  }
  choices.addEventListener('click',async e=>{
    const b=e.target.closest('[data-offer]');if(!b||active||b.disabled)return;
    active=true;for(const el of choices.children)el.disabled=true;
    const offer=draft||{id:crypto.randomUUID(),offered:b.dataset.offer};saveDraft(offer);hint.textContent='Leaving your find…';
    try{await api('/swap',offer);saveDraft(null);}
    catch(e){if(e.status && e.status<500)saveDraft(null);hint.textContent=e.message;active=false;for(const el of choices.children)el.disabled=!!draft&&el.dataset.offer!==draft.offered;return;}
    active=false;await refresh();
  });
  return refresh;
}
