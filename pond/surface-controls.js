// Map the actual HTML buttons onto the photographed plane of the door or page.
// Native selects, links, keyboard focus and screen-reader state stay intact.
window.createStationSurfaces=function(section,world,currentTool){
  const doc=document,fridge=doc.getElementById('panel-story'),book=doc.getElementById('panel-book');
  const words=doc.getElementById('wordButtons'),hint=doc.getElementById('wordHint');
  const picker=section.querySelector('.tool-picker');
  const layer=doc.createElement('div');layer.className='magnet-layer';section.append(layer);
  let bound,lastTool='',lastRevision=-1,lastProjection='';
  function projectQuad(el,p,w,h){
    const [a,b,c,d]=p;
    const dx1=b.x-c.x,dx2=d.x-c.x,dy1=b.y-c.y,dy2=d.y-c.y;
    const dx3=a.x-b.x+c.x-d.x,dy3=a.y-b.y+c.y-d.y;
    const det=dx1*dy2-dx2*dy1;if(Math.abs(det)<1)return false;
    const g=(dx3*dy2-dx2*dy3)/det,k=(dx1*dy3-dx3*dy1)/det;
    el.style.transform='matrix3d('+[(b.x*(1+g)-a.x)/w,(b.y*(1+g)-a.y)/w,0,g/w,(d.x*(1+k)-a.x)/h,(d.y*(1+k)-a.y)/h,0,k/h,0,0,1,0,a.x,a.y,0,1].join(',')+')';
    return true;
  }
  function paint(arrival){
    surfaceUI.onFrame?.(projectQuad);
    picker.inert=arrival<.78;
    const approaching=arrival<.78;
    if(section.hasAttribute('data-approaching')!==approaching)section.toggleAttribute('data-approaching',approaching);
    const tool=currentTool();
    const surface=bound.stationSurface(tool,lastProjection,lastRevision);
    if(!surface){
      section.classList.remove('surface-ready');layer.hidden=true;
      lastProjection='';lastTool='';return;
    }
    if(surface.unchanged && tool===lastTool)return;
    const {corners,anchors,key,revision}=surface;
    if(!corners)return;
    const isStory=tool==='story',el=tool==='events'?doc.getElementById('panel-events'):isStory?fridge:tool==='ask'?doc.getElementById('panel-ask'):book;
    if(!projectQuad(el,corners,el.offsetWidth,el.offsetHeight))return;
    if(tool==='ask'){
      const pageWidth=Math.hypot(corners[1].x-corners[0].x,corners[1].y-corners[0].y);
      el.style.setProperty('--paper-type',Math.max(17,Math.min(33,16*el.offsetWidth/pageWidth))+'px');
    }
    lastTool=tool;lastProjection=key;lastRevision=revision;
    section.classList.add('surface-ready');section.classList.toggle('page-moving',Boolean(surface.turning));layer.hidden=!isStory;
    if(isStory)for(const a of anchors){
      const btn=words.children[a.index];if(!btn)continue;
      btn.style.left=a.x+'px';btn.style.top=a.y+'px';
      btn.style.width=Math.max(12,a.width)+'px';btn.style.height=Math.max(13,a.height)+'px';
    }
  }
  addEventListener('labworld:unavailable',()=>{
    bound?.bindStationControls(null);bound=null;lastProjection='';
    section.classList.remove('physical-tools','surface-ready');section.removeAttribute('data-approaching');
    picker.inert=false;layer.hidden=true;hint.before(words);
  });
  const surfaceUI={connect(){
    const api=world();if(!api?.stationSurface||bound===api)return;
    bound=api;section.classList.add('physical-tools');layer.append(words);
    api.bindStationControls(paint);
  }};
  return surfaceUI;
};
