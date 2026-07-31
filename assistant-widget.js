/* Site-wide LaB Assistant launcher. Heavy retrieval data loads only on open. */
(function(){
  'use strict';
  if(/(?:^|\/)assistant\.html$/.test(location.pathname))return;

  var SESSION_KEY='lab-assistant-session-v2';
  var MAX_MESSAGES=12;
  var client=null,loading=null,busy=false,elapsedTimer=null,elapsedStarted=0,activeModel='';

  var shell=document.createElement('div');
  shell.className='lab-chat';
  shell.innerHTML=
    '<button class="lab-chat-launch" type="button" aria-expanded="false" aria-controls="labChatPanel" aria-label="Ask the LaB">'
      +'<img src="images/WhiteBeakerLogo.png" alt="" aria-hidden="true">'
    +'</button>'
    +'<section class="lab-chat-panel" id="labChatPanel" role="dialog" aria-modal="false" aria-label="LaB Assistant" hidden>'
      +'<header class="lab-chat-head">'
        +'<div><strong>Ask the <em>LaB.</em></strong>'
          +'<div class="lab-chat-state-row">'
            +'<span class="lab-chat-state" id="labChatState" role="status">Sourced search ready</span>'
            +'<button class="lab-chat-model-toggle" type="button" aria-pressed="true" title="Switch to sourced-only answers">Nemotron</button>'
          +'</div>'
        +'</div>'
        +'<div class="lab-chat-actions">'
          +'<a href="assistant.html" aria-label="Open full-screen assistant" title="Open full assistant">↗</a>'
          +'<button type="button" data-chat-clear aria-label="Start a new conversation" title="New conversation">↺</button>'
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
        +'<textarea id="labChatInput" rows="1" maxlength="280" placeholder="Ask about the LaB…" disabled></textarea>'
        +'<button type="submit" aria-label="Ask the LaB" title="Ask" disabled><span aria-hidden="true">→</span></button>'
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
  var modelToggle=shell.querySelector('.lab-chat-model-toggle');

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
      var raw=localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY);
      var parsed=JSON.parse(raw||'[]');
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
    var records=[].slice.call(log.querySelectorAll('.lab-chat-msg, .assistant-msg')).map(function(article){
      var copy=article.querySelector('.lab-chat-copy, .assistant-copy');
      return {
        kind:article.dataset.kind||(article.classList.contains('is-user')?'user':'assistant'),
        text:copy?copy.innerText||copy.textContent:'',
        mode:article.dataset.mode||'',
        sources:[].slice.call(article.querySelectorAll('.lab-chat-sources a, .assistant-sources a')).map(function(a){
          return {title:a.textContent.replace(/\s*→$/,'').trim(),url:a.getAttribute('href'),note:a.getAttribute('title')||''};
        })
      };
    }).filter(function(item){return item.text && !item.text.startsWith('Ask about a film') && !item.text.startsWith('Fresh page');}).slice(-MAX_MESSAGES);
    try{
      localStorage.setItem(SESSION_KEY,JSON.stringify(records));
      sessionStorage.setItem(SESSION_KEY,JSON.stringify(records));
    }catch(error){}
  }
  function modelLabel(){
    if(/nemotron-3-super/i.test(activeModel))return 'Nemotron 3 Super';
    return /:cloud$/i.test(activeModel)?'Ollama Cloud':'local Ollama';
  }
  function badgeFor(mode){
    if(mode==='ollama')return modelLabel()+' · verified';
    return 'Sourced';
  }
  function setModelToggle(enabled){
    modelToggle.setAttribute('aria-pressed',String(enabled));
    modelToggle.textContent=enabled?'Nemotron':'Sourced only';
    modelToggle.title=enabled?'Switch to sourced-only answers':'Enable Nemotron phrasing';
  }
  function extractYouTubeInfo(url){
    if(!url)return null;
    var m=String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if(!m)return null;
    var id=m[1];
    var startMatch=String(url).match(/[?&]t=(?:(\d+)s?|(\d+)m(\d+)s?)/);
    var start=0;
    if(startMatch){
      if(startMatch[1])start=parseInt(startMatch[1],10);
      else if(startMatch[2])start=parseInt(startMatch[2],10)*60+(parseInt(startMatch[3],10)||0);
    }
    return {id:id,start:start,rawUrl:url};
  }

  function appendTextWithLinks(container,textLine){
    var urlRegex=/(https?:\/\/[^\s]+)/g;
    var parts=String(textLine||'').split(urlRegex);
    parts.forEach(function(part){
      if(urlRegex.test(part)){
        var a=document.createElement('a');
        a.href=part;a.textContent=part;
        a.target='_blank';a.rel='noopener';
        container.appendChild(a);
      }else if(part){
        container.appendChild(document.createTextNode(part));
      }
    });
  }

  function createYouTubeCard(ytInfo,titleText){
    var card=document.createElement('div');card.className='as-video-card';
    var facade=document.createElement('div');facade.className='as-video-facade';
    facade.title='Click to play video';
    var img=document.createElement('img');
    img.src='https://img.youtube.com/vi/'+ytInfo.id+'/hqdefault.jpg';
    img.alt=titleText||'YouTube Video Thumbnail';
    img.loading='lazy';
    var playBtn=document.createElement('div');playBtn.className='as-video-play';
    playBtn.innerHTML='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    facade.appendChild(img);facade.appendChild(playBtn);
    facade.addEventListener('click',function(){
      var iframe=document.createElement('iframe');
      iframe.className='as-video-iframe';
      iframe.src='https://www.youtube-nocookie.com/embed/'+ytInfo.id+'?autoplay=1'+(ytInfo.start?'&start='+ytInfo.start:'');
      iframe.title=titleText||'YouTube video player';
      iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen=true;
      card.replaceChild(iframe,facade);
    });
    card.appendChild(facade);
    var caption=document.createElement('div');caption.className='as-video-caption';
    var labelSpan=document.createElement('span');labelSpan.textContent=titleText||'Watch Video Walkthrough';
    var actionSpan=document.createElement('small');actionSpan.textContent='Click to play';
    caption.appendChild(labelSpan);caption.appendChild(actionSpan);
    card.appendChild(caption);
    return card;
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
      appendTextWithLinks(copy,line);
    });
    article.appendChild(meta);article.appendChild(copy);

    var ytMatches=[];
    var allUrls=[];
    if(textValue){
      var matches=textValue.match(/https?:\/\/[^\s]+/g);
      if(matches)allUrls=allUrls.concat(matches);
    }
    if(sources&&sources.length){
      sources.forEach(function(s){if(s.url)allUrls.push(s.url);});
    }
    var seenYt={};
    allUrls.forEach(function(u){
      var yt=extractYouTubeInfo(u);
      if(yt&&!seenYt[yt.id]){
        seenYt[yt.id]=true;
        ytMatches.push(yt);
      }
    });

    ytMatches.forEach(function(yt){
      var ytSrc=(sources&&sources.filter(function(s){return extractYouTubeInfo(s.url);})[0]);
      var videoTitle=ytSrc?ytSrc.title:'Watch Video Walkthrough';
      var videoCard=createYouTubeCard(yt,videoTitle);
      article.appendChild(videoCard);
    });

    if(sources&&sources.length){
      var sourceWrap=document.createElement('div');sourceWrap.className='lab-chat-sources';
      sourceWrap.setAttribute('aria-label','Source pages');
      var sourceLabel=document.createElement('span');sourceLabel.textContent='Pages';sourceWrap.appendChild(sourceLabel);
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
    if((phase==='model'||phase==='ready')&&detail)activeModel=String(detail);
    state.dataset.phase=phase;
    if(phase==='loading')state.textContent='Loading the local index…';
    else if(phase==='searching')state.textContent='Searching the LaB…';
    else if(phase==='model'){
      elapsedStarted=Date.now();
      state.textContent='Asking '+modelLabel()+' · 0s';
      elapsedTimer=setInterval(function(){
        state.textContent='Asking '+modelLabel()+' · '+Math.floor((Date.now()-elapsedStarted)/1000)+'s';
      },1000);
    }else if(phase==='verified')state.textContent='Answer verified';
    else if(phase==='grounding')state.textContent='Sourced answer ready';
    else if(phase==='offline')state.textContent='Sourced search ready';
    else if(phase==='busy')state.textContent='Sourced answer ready';
    else if(phase==='disabled')state.textContent='No model requests';
    else if(phase==='ready')state.textContent='Grounded · Nemotron ready';
    else state.textContent='Sourced search ready';
  }
  function setBusy(on){
    busy=on;log.setAttribute('aria-busy',String(on));
    input.disabled=on||!client;submit.disabled=on||!client;
    modelToggle.disabled=on;
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
    loading=loadScript('resources-data.js?v=20260731_v4',hasResources)
      .then(function(){return loadScript('gear-data.js?v=20260731_v4',function(){return Boolean(window.gearData);});})
      .then(function(){return loadScript('spotlight-data.js?v=20260731_v4',function(){return Boolean(window.SPOTLIGHT);});})
      .then(function(){return loadScript('field-notes-data.js?v=20260731_v4',function(){return Array.isArray(window.LAB_FIELD_NOTES);});})
      .then(function(){return loadScript('assistant-data.js?v=20260731_v4',function(){return Boolean(window.LAB_ASSISTANT_KNOWLEDGE);});})
      .then(function(){return loadScript('assistant-core.js?v=20260731_v4',function(){return Boolean(window.LaBAssistantCore);});})
      .then(function(){return loadScript('assistant-client.js?v=20260731_v4',function(){return Boolean(window.LaBAssistantClient);});})
      .then(function(){
        client=window.LaBAssistantClient.create({
          resources:getResources(),
          gearData:window.gearData||[],
          spotlight:window.SPOTLIGHT||[],
          fieldNotes:window.LAB_FIELD_NOTES||[],
          knowledge:window.LAB_ASSISTANT_KNOWLEDGE||{}
        });
        setModelToggle(client.isModelEnabled());
        setBusy(false);
        return client.checkModel().then(function(result){
          if(result.state==='ready')setState('ready',result.model);
          else if(result.state==='offline')setState('offline');
          else if(result.state==='disabled')setState('disabled');
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
    try{
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }catch(error){}
    var intro=addMessage('assistant','Ask about a film, the kit, a checked resource, an event, or where something lives on the site.',[],'retrieval');
    intro.classList.add('is-intro');
    prompts.hidden=false;
    if(client)input.focus();
  }
  function ask(question){
    question=String(question||'').trim();
    if(!question||busy)return;
    var intro=log.querySelector('.is-intro');
    if(intro)intro.remove();
    prompts.hidden=true;
    addMessage('user',question,[],'');
    setBusy(true);
    client.ask(question,{
      onPhase:function(phase,detail){setState(phase,detail&&detail.model);}
    }).then(function(result){
      if(result.model)activeModel=result.model;
      var mode=result.mode==='ollama'?'ollama':result.fallback||'retrieval';
      addMessage('assistant',result.answer,result.sources,mode);
      var modelState=client.getModelState();
      if(result.mode==='ollama')setState('verified');
      else if(result.fallback==='grounding')setState('grounding');
      else if(result.fallback==='offline')setState('offline');
      else if(result.fallback==='busy')setState('busy');
      else if(modelState.state==='ready')setState('ready',modelState.model);
      else if(modelState.state==='disabled')setState('disabled');
      else setState('retrieval');
    }).finally(function(){setBusy(false);input.focus();});
  }

  var stored=readSession();
  if(stored.length){
    stored.forEach(function(item){addMessage(item.kind,item.text,item.sources,item.mode,false);});
    prompts.hidden=true;
  }else{
    var intro=addMessage('assistant','Ask about a film, the kit, a checked resource, an event, or where something lives on the site.',[],'retrieval',false);
    intro.classList.add('is-intro');
  }

  launch.addEventListener('click',function(){panel.hidden?open():close();});
  closeButton.addEventListener('click',close);
  clearButton.addEventListener('click',clearConversation);
  modelToggle.addEventListener('click',function(){
    loadAssistant().then(function(){
      var enabled=!client.isModelEnabled();
      setModelToggle(enabled);
      return client.setModelEnabled(enabled);
    }).then(function(result){
      if(result.state==='ready')setState('ready',result.model);
      else if(result.state==='offline')setState('offline');
      else if(result.state==='disabled')setState('disabled');
      else setState('retrieval');
      input.focus();
    }).catch(function(){setState('offline');});
  });
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
