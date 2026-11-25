// Labels stay on the map while the text remains large enough to tap.
window.createFieldHub=function(world,reduced){
  const map=document.querySelector('#fieldHub'),links=[...map.querySelectorAll('a')];
  const mark=document.querySelector('.hud .mark');
  let active=true;
  function layout(){
    if(!active)return;
    const width=map.clientWidth,height=map.clientHeight;
    if(!width || !height)return;
    const narrow=width<680;
    let points=world()?.hubPoints?.();
    if(!points){
      if(!document.documentElement.classList.contains('no-world'))return;
      const portrait=height>width,w=portrait?390:1366,h=portrait?844:850;
      const coords=portrait?[[85,381],[150,412],[298,408],[139,501]]:[[459,332],[588,400],[909,400],[497,630]];
      const zoom=Math.max(width/w,height/h);
      points=coords.map(([x,y])=>({x:width/2+(x-w/2)*zoom,y:height/2+(y-h/2)*zoom}));
    }
    const spots=links.map((link,i)=>{
      const {x,y}=points[i],right=link.dataset.side==='right';
      const dx=narrow?12:22,dy=Number(link.dataset.lift)*(narrow?.78:1);
      const w=link.offsetWidth,h=link.offsetHeight;
      return {link,x,y,w,h,left:Math.max(12,Math.min(width-w-12,x+(right?dx:-dx-w))),
        top:Math.max(88,Math.min(height-h-100,y-h/2+dy))};
    }).sort((a,b)=>a.top-b.top);
    for(let i=0;i<spots.length;i++){
      const a=spots[i];
      for(const b of spots.slice(0,i)){
        if(a.left<b.left+b.w+8 && b.left<a.left+a.w+8 && a.top<b.top+b.h+6)a.top=b.top+b.h+6;
      }
      a.link.style.left=a.left+'px';a.link.style.top=a.top+'px';
      const startX=Math.min(a.w,Math.max(0,a.x-a.left)),startY=Math.min(a.h,Math.max(0,a.y-a.top));
      const dx=a.x-a.left-startX,dy=a.y-a.top-startY;
      const pin=a.link.firstElementChild;pin.style.left=startX+'px';pin.style.top=startY+'px';
      pin.style.width=Math.hypot(dx,dy)+'px';pin.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';
    }
    map.classList.add('mapped');
  }
  let pendingFocus=0;
  function navigate(event){
    if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    const link=event.currentTarget,dest=document.querySelector(link.hash);if(!dest)return;
    event.preventDefault();
    if(location.hash!==link.hash)history.pushState(null,'',link.hash);
    // Native smooth scrolling can be interrupted by a swipe or wheel.
    dest.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
    cancelAnimationFrame(pendingFocus);
    if(!event.detail){
      const started=performance.now();
      function focusArrival(){
        if(location.hash!==link.hash)return;
        const arrived=Math.abs(dest.getBoundingClientRect().top)<3 || (link.hash==='#top' && scrollY===0);
        if(arrived){
          const aim=link===mark?links[0]:link.hash==='#drone-school'?document.querySelector('#flyShot'):dest;
          const target=aim.disabled?document.querySelector('#tools'):aim;
          if(!target.matches('a,button,[tabindex]'))target.tabIndex=-1;
          target.focus({preventScroll:true});
        }else if(performance.now()-started<2500)pendingFocus=requestAnimationFrame(focusArrival);
      }
      pendingFocus=requestAnimationFrame(focusArrival);
    }
  }
  for(const link of [...links,mark])link.addEventListener('click',navigate);
  addEventListener('resize',layout);addEventListener('labworld:ready',layout);document.fonts?.ready.then(layout);
  addEventListener('labworld:unavailable',layout);
  return {update(opacity){
    if(!active && opacity>0){active=true;layout();}
    map.parentElement.style.setProperty('--hub-photo',String(opacity));
    map.style.opacity=String(opacity);map.inert=opacity<.35;active=opacity>0;
  },layout};
};
