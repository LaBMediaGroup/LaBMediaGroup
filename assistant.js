(function(){
  'use strict';
  var form=document.getElementById('assistantForm');
  var input=document.getElementById('assistantInput');
  var log=document.getElementById('assistantLog');
  var clear=document.getElementById('assistantClear');
  var status=document.getElementById('assistantStatus');
  var modelToggle=document.getElementById('assistantModelToggle');
  var send=form&&form.querySelector('.assistant-send');
  if(!form||!input||!log||!window.LaBAssistantClient)return;

  var busy=false,elapsedTimer=null,elapsedStarted=0,activeModel='';
  var client=window.LaBAssistantClient.create({
    resources:typeof resources!=='undefined'?resources:[],
    gearData:window.gearData||[],
    spotlight:window.SPOTLIGHT||[],
    fieldNotes:window.LAB_FIELD_NOTES||[],
    knowledge:window.LAB_ASSISTANT_KNOWLEDGE||{}
  });

  function modelLabel(){
    if(/nemotron-3-super/i.test(activeModel))return 'Nemotron 3 Super';
    return /:cloud$/i.test(activeModel)?'Ollama Cloud':'local Ollama';
  }
  function statusText(phase,detail){
    if(phase==='checking')return 'Local index ready · checking for Ollama';
    if(phase==='searching')return 'Searching the local LaB index';
    if(phase==='retrieval')return 'Sourced local search ready';
    if(phase==='disabled')return 'Sourced only · no model requests';
    if(phase==='model')return 'Asking '+modelLabel()+' · '+detail+'s';
    if(phase==='verified')return modelLabel()+' answer verified against retrieved sources';
    if(phase==='grounding')return 'Model rewrite rejected · sourced fallback shown';
    if(phase==='offline')return 'Ollama offline · sourced local search ready';
    if(phase==='busy')return 'Ollama busy · sourced local search ready';
    if(phase==='ready')return modelLabel()+' ready · grounded to the site';
    return 'Local index · sourced only · no prompt saved';
  }
  function setModelToggle(enabled){
    if(!modelToggle)return;
    modelToggle.setAttribute('aria-pressed',String(enabled));
    modelToggle.textContent=enabled?'Nemotron':'Sourced only';
    modelToggle.title=enabled?'Switch to sourced-only answers':'Enable Nemotron phrasing';
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
      appendTextWithLinks(body,line);
    });
    article.appendChild(whoRow);article.appendChild(body);

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
    if(modelToggle)modelToggle.disabled=on;
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
      else if(model.state==='disabled')setStatus('disabled');
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
  if(modelToggle)modelToggle.addEventListener('click',function(){
    var enabled=!client.isModelEnabled();
    setModelToggle(enabled);
    client.setModelEnabled(enabled).then(function(result){
      if(result.state==='ready')setStatus('ready',result.model);
      else if(result.state==='offline')setStatus('offline');
      else if(result.state==='disabled')setStatus('disabled');
      else setStatus('retrieval');
      input.focus();
    });
  });

  window.LaBAssistant={ask:client.retrieve,client:client};
  setModelToggle(client.isModelEnabled());
  setStatus(client.isModelEnabled()?'checking':'disabled');
  client.checkModel().then(function(result){
    if(result.state==='ready')setStatus('ready',result.model);
    else if(result.state==='offline')setStatus('offline');
    else if(result.state==='disabled')setStatus('disabled');
    else setStatus('retrieval');
  });
  if(window.LaBAssistantGuide)window.LaBAssistantGuide.resume();
})();
