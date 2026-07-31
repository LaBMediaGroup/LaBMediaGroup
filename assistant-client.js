/* Shared retrieval + optional Ollama controller for the full page and widget. */
(function(root){
  'use strict';
  var MODEL_MODE_KEY='lab-assistant-model-mode-v1';

  function savedModelEnabled(){
    try{return root.sessionStorage.getItem(MODEL_MODE_KEY)!=='sourced';}
    catch(error){return true;}
  }

  function create(options){
    options=options||{};
    if(!root.LaBAssistantCore)throw new Error('LaB Assistant core is not loaded.');

    var engine=root.LaBAssistantCore.createEngine({
      resources:options.resources||[],
      gearData:options.gearData||[],
      spotlight:options.spotlight||[],
      fieldNotes:options.fieldNotes||[],
      knowledge:options.knowledge||{}
    });
    var publicApiBase=location.protocol==='https:'
      && (location.hostname==='labmedia.work'||location.hostname==='www.labmedia.work')
        ? 'https://lab-assistant-api.robertbaldwin3d.workers.dev'
        : '';
    var apiBase=String(options.apiBase||publicApiBase).replace(/\/+$/,'');
    var gatewayState='unchecked';
    var gatewayModel='';
    var modelEnabled=typeof options.modelEnabled==='boolean'
      ? options.modelEnabled
      : savedModelEnabled();

    function canUseGateway(){
      if(apiBase)return true;
      return location.protocol==='http:'&&(location.hostname==='localhost'||location.hostname==='127.0.0.1');
    }

    function endpoint(pathname){
      return apiBase+pathname;
    }

    function fetchJSON(url,requestOptions,timeoutMs){
      if(!root.fetch)return Promise.reject(new Error('Fetch unavailable.'));
      var controller=root.AbortController?new AbortController():null;
      var timer=controller?setTimeout(function(){controller.abort();},timeoutMs):null;
      requestOptions=requestOptions||{};
      if(controller)requestOptions.signal=controller.signal;
      return root.fetch(url,requestOptions).then(function(response){
        if(!response.ok){
          var error=new Error('Request failed.');error.status=response.status;throw error;
        }
        return response.json();
      }).finally(function(){if(timer)clearTimeout(timer);});
    }

    function checkModel(){
      if(!modelEnabled){
        gatewayState='disabled';
        gatewayModel='';
        return Promise.resolve({state:gatewayState,model:''});
      }
      if(!canUseGateway()){
        gatewayState='retrieval';
        return Promise.resolve({state:gatewayState,model:''});
      }
      gatewayState='checking';
      return fetchJSON(endpoint('/api/assistant/health'),{cache:'no-store'},2200)
        .then(function(result){
          gatewayModel=String(result&&result.model||'');
          gatewayState=result&&result.ollama==='ready'?'ready':'offline';
          return {state:gatewayState,model:gatewayModel};
        })
        .catch(function(){
          gatewayState='offline';
          gatewayModel='';
          return {state:gatewayState,model:''};
        });
    }

    function retrieve(question){
      return engine.ask(question);
    }

    function ask(question,hooks){
      hooks=hooks||{};
      question=String(question||'').trim();
      if(hooks.onPhase)hooks.onPhase('retrieval',{question:question});
      var baseline=retrieve(question);
      if(baseline.kind==='unknown'||baseline.kind==='empty'||baseline.kind==='field-note'||!modelEnabled||gatewayState!=='ready'){
        return Promise.resolve({
          ok:true,
          mode:'retrieval',
          answer:baseline.answer,
          sources:baseline.sources,
          baselineKind:baseline.kind,
          modelState:gatewayState
        });
      }

      if(hooks.onPhase)hooks.onPhase('model',{model:gatewayModel});
      var requestBody=apiBase
        ? {baseline:{answer:baseline.answer}}
        : {question:question};
      return fetchJSON(endpoint('/api/assistant'),{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(requestBody)
      },32000).then(function(result){
        if(!result||!result.ok)throw new Error('No answer returned.');
        result.sources=baseline.sources;
        if(result.mode==='ollama'){
          gatewayState='ready';
          if(hooks.onPhase)hooks.onPhase('verified',{model:result.model||gatewayModel});
        }else if(result.fallback==='grounding'){
          gatewayState='ready';
          if(hooks.onPhase)hooks.onPhase('grounding',{model:gatewayModel});
        }else{
          gatewayState='offline';
          if(hooks.onPhase)hooks.onPhase('offline',{});
        }
        return result;
      }).catch(function(error){
        if(error.status===429){
          if(hooks.onPhase)hooks.onPhase('busy',{});
          return {
            ok:true,mode:'retrieval',fallback:'busy',
            answer:baseline.answer,sources:baseline.sources,
            notice:'The Ollama model is busy; this is the sourced answer.'
          };
        }
        gatewayState='offline';
        if(hooks.onPhase)hooks.onPhase('offline',{});
        return {
          ok:true,mode:'retrieval',fallback:'offline',
          answer:baseline.answer,sources:baseline.sources,
          notice:'Ollama phrasing is offline; this is the sourced answer.'
        };
      });
    }

    return {
      ask:ask,
      retrieve:retrieve,
      checkModel:checkModel,
      setModelEnabled:function(enabled){
        modelEnabled=Boolean(enabled);
        try{root.sessionStorage.setItem(MODEL_MODE_KEY,modelEnabled?'hybrid':'sourced');}
        catch(error){}
        if(!modelEnabled){
          gatewayState='disabled';
          gatewayModel='';
          return Promise.resolve({state:gatewayState,model:''});
        }
        gatewayState='unchecked';
        return checkModel();
      },
      isModelEnabled:function(){return modelEnabled;},
      isModelReady:function(){return gatewayState==='ready';},
      getModelState:function(){return {state:gatewayState,model:gatewayModel};},
      buildIndex:function(){return engine.buildIndex();}
    };
  }

  root.LaBAssistantClient={create:create};
})(window);
