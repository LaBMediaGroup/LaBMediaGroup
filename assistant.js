(function(){
  'use strict';
  var form=document.getElementById('assistantForm');
  var input=document.getElementById('assistantInput');
  var log=document.getElementById('assistantLog');
  var clear=document.getElementById('assistantClear');
  var status=document.getElementById('assistantStatus');
  var send=form&&form.querySelector('.assistant-send');
  if(!form||!input||!log||!window.LaBAssistantClient)return;

  var busy=false,elapsedTimer=null,elapsedStarted=0,activeModel='';
  var client=window.LaBAssistantClient.create({
    resources:typeof resources!=='undefined'?resources:[],
    gearData:window.gearData||[],
    spotlight:window.SPOTLIGHT||[],
    knowledge:window.LAB_ASSISTANT_KNOWLEDGE||{}
  });

  function modelLabel(){
    return /:cloud$/i.test(activeModel)?'Ollama Cloud':'local Ollama';
  }
  function statusText(phase,detail){
    if(phase==='checking')return 'Local index ready · checking for Ollama';
    if(phase==='searching')return 'Searching the local LaB index';
    if(phase==='retrieval')return 'Sourced local search ready';
    if(phase==='model')return 'Asking '+modelLabel()+' · '+detail+'s';
    if(phase==='verified')return modelLabel()+' answer verified against retrieved sources';
    if(phase==='grounding')return 'Model rewrite rejected · sourced fallback shown';
    if(phase==='offline')return 'Ollama offline · sourced local search ready';
    if(phase==='busy')return 'Ollama busy · sourced local search ready';
    if(phase==='ready')return modelLabel()+' ready · '+detail+' · grounded only';
    return 'Local index · model-free here · no prompt saved';
  }
  function setStatus(phase,detail){
    if(!status)return;
    if((phase==='model'||phase==='ready')&&detail)activeModel=String(detail);
    clearInterval(elapsedTimer);elapsedTimer=null;
    status.setAttribute('data-model-state',phase);
    var copy=status.querySelector('span');
    if(phase==='model'){
      elapsedStarted=Date.now();
      if(copy)copy.textContent=statusText('model',0);
      elapsedTimer=setInterval(function(){
        if(copy)copy.textContent=statusText('model',Math.floor((Date.now()-elapsedStarted)/1000));
      },1000);
      return;
    }
    if(copy)copy.textContent=statusText(phase,detail||'');
  }
  function badgeFor(mode){
    if(mode==='ollama')return modelLabel()+' · verified';
    if(mode==='grounding')return 'Sourced fallback · model rejected';
    if(mode==='offline')return 'Sourced fallback · Ollama offline';
    if(mode==='busy')return 'Sourced fallback · model busy';
    return 'Sourced search';
  }
  function addMessage(kind,textValue,sources,mode){
    var article=document.createElement('article');
    article.className='assistant-msg is-'+kind;
    var whoRow=document.createElement('div');whoRow.className='assistant-who-row';
    var who=document.createElement('div');who.className='assistant-who';
    who.textContent=kind==='user'?'You':'LaB Assistant';
    whoRow.appendChild(who);
    if(kind==='assistant'){
      var badge=document.createElement('small');
      badge.className='assistant-mode';badge.textContent=badgeFor(mode);
      whoRow.appendChild(badge);
    }
    var body=document.createElement('p');body.className='assistant-copy';
    String(textValue||'').split('\n').forEach(function(line,index){
      if(index)body.appendChild(document.createElement('br'));
      body.appendChild(document.createTextNode(line));
    });
    article.appendChild(whoRow);article.appendChild(body);

    if(sources&&sources.length){
      var wrap=document.createElement('div');wrap.className='assistant-sources';
      var sourceLabel=document.createElement('span');sourceLabel.textContent='Sources';
      wrap.appendChild(sourceLabel);
      sources.slice(0,4).forEach(function(src){
        var a=document.createElement('a');
        a.href=src.url;a.textContent=src.title+' →';
        if(src.note)a.title=src.note;
        var guide=window.LaBAssistantGuide;
        if(guide&&guide.isInternal(src.url)){
          a.addEventListener('click',function(event){
            event.preventDefault();guide.navigate(src.url,a);
          });
        }else if(/^https?:\/\//.test(src.url)){
          a.target='_blank';a.rel='noopener';
        }
        wrap.appendChild(a);
      });
      article.appendChild(wrap);
    }
    log.appendChild(article);
    var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    article.scrollIntoView({block:'nearest',behavior:reduced?'auto':'smooth'});
    return article;
  }
  function setBusy(on){
    busy=on;log.setAttribute('aria-busy',String(on));
    if(send)send.disabled=on;input.disabled=on;
  }
  function settleStatus(result){
    if(result.mode==='ollama')setStatus('verified');
    else if(result.fallback==='grounding')setStatus('grounding');
    else if(result.fallback==='offline')setStatus('offline');
    else if(result.fallback==='busy')setStatus('busy');
    else{
      var model=client.getModelState();
      if(model.state==='ready')setStatus('ready',model.model);
      else if(model.state==='offline')setStatus('offline');
      else setStatus('retrieval');
    }
  }
  function submit(question){
    question=String(question||'').trim();
    if(!question||busy)return Promise.resolve();
    addMessage('user',question,[],null);
    setBusy(true);
    return client.ask(question,{
      onPhase:function(phase,detail){
        if(phase==='retrieval')setStatus('searching');
        else setStatus(phase,detail&&detail.model);
      }
    }).then(function(result){
      if(result.model)activeModel=result.model;
      var mode=result.mode==='ollama'?'ollama':result.fallback||'retrieval';
      addMessage('assistant',result.answer,result.sources,mode);
      settleStatus(result);
      return result;
    }).finally(function(){
      setBusy(false);input.focus();
    });
  }

  form.addEventListener('submit',function(event){
    event.preventDefault();
    var question=input.value;input.value='';submit(question);
  });
  input.addEventListener('keydown',function(event){
    if(event.key==='Enter'&&!event.shiftKey){
      event.preventDefault();
      if(form.requestSubmit)form.requestSubmit();
      else form.dispatchEvent(new Event('submit',{cancelable:true}));
    }
  });
  document.querySelectorAll('[data-assistant-prompt]').forEach(function(button){
    button.addEventListener('click',function(){submit(button.getAttribute('data-assistant-prompt'));});
  });
  if(clear)clear.addEventListener('click',function(){
    log.replaceChildren();
    addMessage('assistant','Fresh page. Ask me about a film, the kit, a checked resource, an event, or how the site works.',[],'retrieval');
    input.focus();
  });

  window.LaBAssistant={ask:client.retrieve,client:client};
  setStatus('checking');
  client.checkModel().then(function(result){
    if(result.state==='ready')setStatus('ready',result.model);
    else if(result.state==='offline')setStatus('offline');
    else setStatus('retrieval');
  });
  if(window.LaBAssistantGuide)window.LaBAssistantGuide.resume();
})();
