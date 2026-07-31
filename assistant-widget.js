/* Site-wide LaB Assistant launcher. Heavy retrieval data loads only on open. */
(function(){
  'use strict';
  if(/(?:^|\/)assistant\.html$/.test(location.pathname))return;

  var SESSION_KEY='lab-assistant-widget-session-v1';
  var MAX_MESSAGES=8;
  var client=null,loading=null,busy=false,elapsedTimer=null,elapsedStarted=0;

  var shell=document.createElement('div');
  shell.className='lab-chat';
  shell.innerHTML=
    '<button class="lab-chat-launch" type="button" aria-expanded="false" aria-controls="labChatPanel" aria-label="Ask the LaB">'
      +'<img src="images/WhiteBeakerLogo.png" alt="" aria-hidden="true">'
    +'</button>'
    +'<section class="lab-chat-panel" id="labChatPanel" role="dialog" aria-modal="false" aria-label="LaB Assistant" hidden>'
      +'<header class="lab-chat-head">'
        +'<div><strong>Ask the <em>LaB.</em></strong><span class="lab-chat-state" id="labChatState" role="status">Local search ready</span></div>'
        +'<div class="lab-chat-actions">'
          +'<a href="assistant.html" aria-label="Open full-screen assistant" title="Open full assistant">↗</a>'
          +'<button type="button" data-chat-clear aria-label="Clear conversation" title="Clear">Clear</button>'
          +'<button type="button" data-chat-close aria-label="Close assistant" title="Close">×</button>'
        +'</div>'
      +'</header>'
      +'<div class="lab-chat-log" role="log" aria-live="polite" aria-relevant="additions"></div>'
      +'<div class="lab-chat-prompts">'
        +'<button type="button" data-chat-prompt="What cameras do you own?">Owned cameras</button>'
        +'<button type="button" data-chat-prompt="Which film won an editing award?">Award winner</button>'
        +'<button type="button" data-chat-prompt="What events are coming up?">Upcoming events</button>'
      +'</div>'
      +'<form class="lab-chat-form">'
        +'<label for="labChatInput" class="vh">Ask a question about this site</label>'
        +'<textarea id="labChatInput" rows="2" maxlength="280" placeholder="Ask about a film, tool, event, or the kit…" disabled></textarea>'
        +'<button type="submit" disabled>Ask <span aria-hidden="true">→</span></button>'
      +'</form>'
    +'</section>';
  document.body.appendChild(shell);

  var launch=shell.querySelector('.lab-chat-launch');
  var panel=shell.querySelector('.lab-chat-panel');
  var closeButton=shell.querySelector('[data-chat-close]');
  var clearButton=shell.querySelector('[data-chat-clear]');
  var log=shell.querySelector('.lab-chat-log');
  var prompts=shell.querySelector('.lab-chat-prompts');
  var form=shell.querySelector('.lab-chat-form');
  var input=shell.querySelector('textarea');
  var submit=form.querySelector('button[type="submit"]');
  var state=shell.querySelector('.lab-chat-state');

  function safeStoredSource(source){
    if(!source||typeof source.title!=='string'||typeof source.url!=='string')return null;
    try{
      var url=new URL(source.url,location.href);
      if(url.protocol!=='http:'&&url.protocol!=='https:')return null;
    }catch(error){return null;}
    return {title:source.title.slice(0,100),url:source.url.slice(0,500),note:String(source.note||'').slice(0,180)};
  }
  function readSession(){
    try{
      var parsed=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'[]');
      if(!Array.isArray(parsed))return [];
      return parsed.slice(-MAX_MESSAGES).filter(function(item){
        return item&&(item.kind==='user'||item.kind==='assistant')&&typeof item.text==='string';
      }).map(function(item){
        return {
          kind:item.kind,text:item.text.slice(0,1800),mode:String(item.mode||''),
          sources:(item.sources||[]).map(safeStoredSource).filter(Boolean).slice(0,4)
        };
      });
    }catch(error){return [];}
  }
  function writeSession(){
    var records=[].slice.call(log.querySelectorAll('.lab-chat-msg')).map(function(article){
      return {
        kind:article.dataset.kind,
        text:article.querySelector('.lab-chat-copy').textContent,
        mode:article.dataset.mode||'',
        sources:[].slice.call(article.querySelectorAll('.lab-chat-sources a')).map(function(a){
          return {title:a.textContent.replace(/\s*→$/,''),url:a.getAttribute('href'),note:a.getAttribute('title')||''};
        })
      };
    }).slice(-MAX_MESSAGES);
    try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(records));}catch(error){}
  }
  function badgeFor(mode){
    if(mode==='ollama')return 'Local Ollama · verified';
    if(mode==='grounding')return 'Sourced fallback · model rejected';
    if(mode==='offline')return 'Sourced fallback · Ollama offline';
    if(mode==='busy')return 'Sourced fallback · model busy';
    return 'Sourced search';
  }
  function addMessage(kind,textValue,sources,mode,persist){
    var article=document.createElement('article');
    article.className='lab-chat-msg is-'+kind;
    article.dataset.kind=kind;
    article.dataset.mode=mode||'';
    var meta=document.createElement('div');meta.className='lab-chat-meta';
    var who=document.createElement('span');who.textContent=kind==='user'?'You':'LaB Assistant';
    meta.appendChild(who);
    if(kind==='assistant'){
      var badge=document.createElement('small');badge.textContent=badgeFor(mode);meta.appendChild(badge);
    }
    var copy=document.createElement('p');copy.className='lab-chat-copy';
    String(textValue||'').split('\n').forEach(function(line,index){
      if(index)copy.appendChild(document.createElement('br'));
      copy.appendChild(document.createTextNode(line));
    });
    article.appendChild(meta);article.appendChild(copy);

    if(sources&&sources.length){
      var sourceWrap=document.createElement('div');sourceWrap.className='lab-chat-sources';
      sources.slice(0,4).forEach(function(source){
        var a=document.createElement('a');
        a.href=source.url;a.textContent=source.title;
        if(source.note)a.title=source.note;
        var guide=window.LaBAssistantGuide;
        if(guide&&guide.isInternal(source.url)){
          a.addEventListener('click',function(event){
            event.preventDefault();
            guide.navigate(source.url,a);
          });
        }else if(/^https?:\/\//.test(source.url)){
          a.target='_blank';a.rel='noopener';
        }
        sourceWrap.appendChild(a);
      });
      article.appendChild(sourceWrap);
    }
    log.appendChild(article);
    log.scrollTop=log.scrollHeight;
    if(persist!==false)writeSession();
    return article;
  }
  function setState(phase,detail){
    clearInterval(elapsedTimer);elapsedTimer=null;
    state.dataset.phase=phase;
    if(phase==='loading')state.textContent='Loading the local index…';
    else if(phase==='searching')state.textContent='Searching the LaB…';
    else if(phase==='model'){
      elapsedStarted=Date.now();
      state.textContent='Asking local Ollama · 0s';
      elapsedTimer=setInterval(function(){
        state.textContent='Asking local Ollama · '+Math.floor((Date.now()-elapsedStarted)/1000)+'s';
      },1000);
    }else if(phase==='verified')state.textContent='Ollama answer verified';
    else if(phase==='grounding')state.textContent='Model rewrite rejected · sourced answer';
    else if(phase==='offline')state.textContent='Ollama offline · sourced answer ready';
    else if(phase==='busy')state.textContent='Ollama busy · sourced answer ready';
    else if(phase==='ready')state.textContent=detail?'Local Ollama ready · '+detail:'Local Ollama ready';
    else state.textContent='Sourced local search ready';
  }
  function setBusy(on){
    busy=on;log.setAttribute('aria-busy',String(on));
    input.disabled=on||!client;submit.disabled=on||!client;
  }
  function scriptLoaded(test){try{return test();}catch(error){return false;}}
  function loadScript(src,test){
    if(scriptLoaded(test))return Promise.resolve();
    return new Promise(function(resolve,reject){
      var existing=document.querySelector('script[src="'+src+'"]');
      if(existing){
        if(scriptLoaded(test)){resolve();return;}
        existing.addEventListener('load',resolve,{once:true});
        existing.addEventListener('error',reject,{once:true});
        return;
      }
      var script=document.createElement('script');
      script.src=src;script.async=false;
      script.onload=resolve;script.onerror=function(){reject(new Error('Could not load '+src));};
      document.head.appendChild(script);
    }).then(function(){
      if(!scriptLoaded(test))throw new Error(src+' loaded without its expected data.');
    });
  }
  function hasResources(){return Array.isArray(window.LaBResources);}
  function getResources(){return window.LaBResources||[];}
  function loadAssistant(){
    if(client)return Promise.resolve(client);
    if(loading)return loading;
    setState('loading');
    loading=loadScript('resources-data.js',hasResources)
      .then(function(){return loadScript('gear-data.js',function(){return Boolean(window.gearData);});})
      .then(function(){return loadScript('spotlight-data.js',function(){return Boolean(window.SPOTLIGHT);});})
      .then(function(){return loadScript('assistant-data.js',function(){return Boolean(window.LAB_ASSISTANT_KNOWLEDGE);});})
      .then(function(){return loadScript('assistant-core.js',function(){return Boolean(window.LaBAssistantCore);});})
      .then(function(){return loadScript('assistant-client.js',function(){return Boolean(window.LaBAssistantClient);});})
      .then(function(){
        client=window.LaBAssistantClient.create({
          resources:getResources(),
          gearData:window.gearData||[],
          spotlight:window.SPOTLIGHT||[],
          knowledge:window.LAB_ASSISTANT_KNOWLEDGE||{}
        });
        setBusy(false);
        return client.checkModel().then(function(result){
          if(result.state==='ready')setState('ready',result.model);
          else if(result.state==='offline')setState('offline');
          else setState('retrieval');
          return client;
        });
      }).catch(function(){
        setState('offline');
        addMessage('assistant','The assistant data did not load. The rest of the site is still available from the navigation.',[],'offline');
        throw new Error('Assistant loading failed.');
      });
    return loading;
  }
  function open(preserveFocus){
    panel.hidden=false;launch.setAttribute('aria-expanded','true');shell.classList.add('is-open');
    panel.setAttribute('aria-modal',String(matchMedia('(max-width:560px)').matches));
    loadAssistant().then(function(){if(!preserveFocus)input.focus();}).catch(function(){});
  }
  function close(){
    panel.hidden=true;launch.setAttribute('aria-expanded','false');shell.classList.remove('is-open');launch.focus();
  }
  function clearConversation(){
    log.replaceChildren();
    try{sessionStorage.removeItem(SESSION_KEY);}catch(error){}
    addMessage('assistant','Fresh page. Ask me about a film, the kit, a checked resource, an event, or how this place works.',[],'retrieval');
    if(client)input.focus();
  }
  function ask(question){
    question=String(question||'').trim();
    if(!question||busy)return;
    prompts.hidden=true;
    addMessage('user',question,[],'');
    setBusy(true);
    client.ask(question,{
      onPhase:function(phase,detail){setState(phase,detail&&detail.model);}
    }).then(function(result){
      var mode=result.mode==='ollama'?'ollama':result.fallback||'retrieval';
      addMessage('assistant',result.answer,result.sources,mode);
      var modelState=client.getModelState();
      if(result.mode==='ollama')setState('verified');
      else if(result.fallback==='grounding')setState('grounding');
      else if(result.fallback==='offline')setState('offline');
      else if(result.fallback==='busy')setState('busy');
      else if(modelState.state==='ready')setState('ready',modelState.model);
      else setState('retrieval');
    }).finally(function(){setBusy(false);input.focus();});
  }

  var stored=readSession();
  if(stored.length){
    stored.forEach(function(item){addMessage(item.kind,item.text,item.sources,item.mode,false);});
    prompts.hidden=true;
  }else{
    addMessage('assistant','Ask me about a film, what gear is actually owned, a checked resource, an event, or where to find something on this site.',[],'retrieval',false);
  }

  launch.addEventListener('click',function(){panel.hidden?open():close();});
  closeButton.addEventListener('click',close);
  clearButton.addEventListener('click',clearConversation);
  form.addEventListener('submit',function(event){
    event.preventDefault();var question=input.value;input.value='';ask(question);
  });
  input.addEventListener('keydown',function(event){
    if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();if(form.requestSubmit)form.requestSubmit();}
  });
  prompts.querySelectorAll('[data-chat-prompt]').forEach(function(button){
    button.addEventListener('click',function(){ask(button.getAttribute('data-chat-prompt'));});
  });
  document.addEventListener('keydown',function(event){
    if(event.key==='Escape'&&!panel.hidden)close();
    if(event.key==='Tab'&&!panel.hidden&&matchMedia('(max-width:560px)').matches){
      var focusable=[].slice.call(panel.querySelectorAll('button:not([disabled]),a[href],textarea:not([disabled])'));
      if(!focusable.length)return;
      var first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  window.addEventListener('lab-assistant-collapse',function(){if(!panel.hidden)close();});
  window.addEventListener('lab-assistant-guide-arrived',function(){
    launch.classList.add('has-arrived');
    setTimeout(function(){launch.classList.remove('has-arrived');},1800);
  });

  if(window.LaBAssistantGuide){
    window.LaBAssistantGuide.resume().then(function(guided){if(guided)open(true);});
  }
})();
