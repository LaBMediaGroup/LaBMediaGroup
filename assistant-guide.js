/* Visual, same-site source guidance. This never controls the real pointer. */
(function(root){
  'use strict';
  var NAV_KEY='lab-assistant-guide-v1';
  var MAX_AGE=15000;

  function reducedMotion(){
    return root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function normalizedPath(pathname){
    if(pathname==='/'||pathname==='/index.html')return '/index.html';
    return pathname;
  }
  function internalTarget(href){
    var url;
    try{url=new URL(href,location.href);}catch(error){return null;}
    if(url.origin!==location.origin)return null;
    if(!/^\/(?:[a-z0-9-]+\.html)?$/i.test(url.pathname))return null;
    var targetId='';
    if(url.hash){
      try{targetId=decodeURIComponent(url.hash.slice(1));}catch(error){return null;}
      if(!/^[a-z0-9][a-z0-9._:-]*$/i.test(targetId))return null;
    }
    return {url:url,targetId:targetId};
  }
  function cursorAt(rect){
    var cursor=document.createElement('span');
    cursor.className='lab-guide-cursor';
    cursor.setAttribute('aria-hidden','true');
    cursor.style.left=Math.round(rect?rect.left+Math.min(rect.width,28):innerWidth-42)+'px';
    cursor.style.top=Math.round(rect?rect.top+Math.min(rect.height,22):innerHeight-42)+'px';
    document.body.appendChild(cursor);
    return cursor;
  }
  function move(cursor,from,to,duration){
    if(reducedMotion()||!cursor.animate){
      cursor.style.left=to.x+'px';cursor.style.top=to.y+'px';
      return Promise.resolve();
    }
    var animation=cursor.animate([
      {left:from.x+'px',top:from.y+'px',transform:'scale(.82)',opacity:.55},
      {left:to.x+'px',top:to.y+'px',transform:'scale(1)',opacity:1}
    ],{duration:duration,easing:'cubic-bezier(.22,.8,.24,1)',fill:'forwards'});
    return animation.finished.catch(function(){});
  }
  function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms);});}
  function findTarget(id){
    return id?document.getElementById(id):document.getElementById('main');
  }
  function waitForTarget(id){
    var started=Date.now();
    return new Promise(function(resolve){
      (function check(){
        var target=findTarget(id);
        if(target||Date.now()-started>2400){resolve(target);return;}
        requestAnimationFrame(check);
      })();
    });
  }
  function reveal(target){
    var node=target;
    while(node&&node!==document.body){
      if(node.tagName==='DETAILS')node.open=true;
      node=node.parentElement;
    }
  }
  function focusAndHighlight(target){
    if(!target)return;
    target.classList.add('lab-guide-target');
    var hadTabindex=target.hasAttribute('tabindex');
    if(!hadTabindex)target.setAttribute('tabindex','-1');
    try{target.focus({preventScroll:true});}catch(error){target.focus();}
    setTimeout(function(){
      target.classList.remove('lab-guide-target');
      if(!hadTabindex)target.removeAttribute('tabindex');
    },2200);
  }
  async function arrive(targetId,startRect){
    var target=await waitForTarget(targetId);
    if(!target)return false;
    reveal(target);
    root.dispatchEvent(new CustomEvent('lab-assistant-collapse'));
    var start=startRect||{left:innerWidth-42,top:innerHeight-42,width:0,height:0};
    var cursor=reducedMotion()?null:cursorAt(start);
    target.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'center'});
    if(!reducedMotion())await wait(520);
    var rect=target.getBoundingClientRect();
    if(cursor){
      await move(cursor,{x:start.left,y:start.top},{x:rect.left+Math.min(rect.width*.45,180),y:rect.top+Math.min(rect.height*.35,70)},520);
      cursor.classList.add('is-arrived');
      await wait(180);
      cursor.remove();
    }
    focusAndHighlight(target);
    root.dispatchEvent(new CustomEvent('lab-assistant-guide-arrived'));
    return true;
  }
  function storeInstruction(target){
    try{
      sessionStorage.setItem(NAV_KEY,JSON.stringify({
        path:normalizedPath(target.url.pathname),
        targetId:target.targetId,
        expires:Date.now()+MAX_AGE
      }));
    }catch(error){}
  }
  function readInstruction(){
    var value=null;
    try{
      value=JSON.parse(sessionStorage.getItem(NAV_KEY)||'null');
      sessionStorage.removeItem(NAV_KEY);
    }catch(error){return null;}
    if(!value||value.expires<Date.now()||value.expires>Date.now()+MAX_AGE)return null;
    if(value.path!==normalizedPath(location.pathname))return null;
    if(value.targetId&&!/^[a-z0-9][a-z0-9._:-]*$/i.test(value.targetId))return null;
    return value;
  }
  async function navigate(href,originElement){
    var target=internalTarget(href);
    if(!target)return false;
    var originRect=originElement&&originElement.getBoundingClientRect
      ? originElement.getBoundingClientRect()
      : {left:innerWidth-42,top:innerHeight-42,width:0,height:0};
    var same=normalizedPath(target.url.pathname)===normalizedPath(location.pathname);
    if(same){
      await arrive(target.targetId,originRect);
      if(target.targetId)history.replaceState(null,'','#'+encodeURIComponent(target.targetId));
      return true;
    }

    storeInstruction(target);
    if(reducedMotion()){location.assign(target.url.href);return true;}
    var cursor=cursorAt(originRect),cancelled=false;
    function cancel(event){if(event.key==='Escape')cancelled=true;}
    document.addEventListener('keydown',cancel,{once:true});
    await move(cursor,{x:originRect.left,y:originRect.top},{x:innerWidth-36,y:Math.max(70,innerHeight*.22)},430);
    cursor.remove();
    document.removeEventListener('keydown',cancel);
    if(cancelled){
      try{sessionStorage.removeItem(NAV_KEY);}catch(error){}
      return true;
    }
    location.assign(target.url.href);
    return true;
  }
  function resume(){
    var instruction=readInstruction();
    if(!instruction)return Promise.resolve(false);
    return arrive(instruction.targetId,null);
  }

  root.LaBAssistantGuide={
    isInternal:function(href){return Boolean(internalTarget(href));},
    navigate:navigate,
    resume:resume
  };
})(window);
