// Labels stay on the map while the text remains large enough to tap.
window.createFieldHub=function(world,reduced,onRouteChange){
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
  const root=document.documentElement;
  const topOf=el=>scrollY+el.getBoundingClientRect().top;
  const ease=t=>t*t*(3-2*t);
  let ride=null,frame=0,recovery=0;
  function cancel(){
    cancelAnimationFrame(frame);frame=0;
    if(ride?.airborne){
      // On a swipe, immediately give scroll back. Finish blending into its
      // current view over a few frames instead of cutting the camera.
      const from=ride.blend,start=performance.now();
      function land(now){
        const t=Math.min(1,(now-start)/440);
        world()?.approachLandmark(from+(1-from)*ease(t));
        if(t<1)recovery=requestAnimationFrame(land);
      }
      recovery=requestAnimationFrame(land);
    }
    if(ride && root.dataset.fieldDestination)requestAnimationFrame(onRouteChange);
    ride=null;delete root.dataset.fieldRide;delete root.dataset.fieldDestination;
  }
  for(const type of ['wheel','touchstart','pointerdown','keydown','popstate','hashchange','orientationchange','pagehide'])
    addEventListener(type,cancel,{capture:true,passive:true});
  function travel(destination,{place=-1,staging=null,onArrive}={}){
    cancel();cancelAnimationFrame(recovery);
    world()?.approachLandmark(1);
    const start=scrollY,end=topOf(destination);
    if(reduced || !world() || root.classList.contains('no-world') || Math.abs(end-start)<3){
      scrollTo({top:end,behavior:'instant'});onArrive?.();return;
    }
    const airborne=place>=0,stage=staging??end;
    if(airborne){
      world().beginLandmark(place);root.dataset.fieldRide='establish';root.dataset.fieldDestination=destination.id;
      scrollTo({top:stage,behavior:'instant'});
    }
    const route={airborne,blend:0};ride=route;
    const depart=performance.now();
    const flyTime=airborne?(place===2?2700:3400):0;
    const distance=Math.abs(end-(airborne?stage:start))/Math.max(innerHeight,1);
    const railTime=distance<.01?0:Math.min(6400,1400+distance*960);
    function step(now){
      if(ride!==route)return;
      const ms=now-depart;
      if(route.airborne){
        route.blend=ease(Math.min(1,ms/flyTime));
        world()?.approachLandmark(route.blend);
        if(ms>=flyTime)route.airborne=false;
      }
      const t=railTime?Math.min(1,Math.max(0,(ms-flyTime)/railTime)):Number(ms>=flyTime);
      if(ms>=flyTime && railTime)scrollTo({top:(airborne?stage:start)+(end-(airborne?stage:start))*ease(t),behavior:'instant'});
      if(airborne && ms>=flyTime+railTime-520)root.dataset.fieldRide='reveal';
      if(ms<flyTime+railTime){frame=requestAnimationFrame(step);return;}
      scrollTo({top:topOf(destination),behavior:'instant'});
      ride=null;frame=0;delete root.dataset.fieldRide;delete root.dataset.fieldDestination;onRouteChange();onArrive?.();
    }
    frame=requestAnimationFrame(step);
  }
  function navigate(event,link=event.currentTarget){
    if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    const hash=link.hash,dest=document.querySelector(hash);if(!dest)return;
    event.preventDefault();
    if(location.hash!==hash)history.pushState(null,'',hash);
    const landmark=links.indexOf(link);
    const story=hash==='#tools'?document.querySelector('[data-stop="story"]'):null;
    const focusArrival=()=>{
      if(event.detail || location.hash!==hash)return;
      const aim=link===mark?links[0]:hash==='#drone-school'?document.querySelector('#flyShot'):dest;
      const target=aim.disabled?document.querySelector('#tools'):aim;
      if(!target.matches('a,button,[tabindex]'))target.tabIndex=-1;
      target.focus({preventScroll:true});
    };
    if(link===mark){
      if(!event.detail){scrollTo({top:0,behavior:'instant'});focusArrival();}
      else scrollTo({top:0,behavior:reduced?'instant':'smooth'});
      return;
    }
    // Films use the regular water entry after this shore approach. The other
    // outdoor landmarks settle directly onto their matching scroll stops.
    const staging=landmark===2?topOf(dest)-document.querySelector('.work-frame').offsetHeight*1.50:null;
    travel(story??dest,{place:landmark>0?landmark:-1,staging,onArrive:focusArrival});
  }
  for(const link of [...links,mark,document.querySelector('.enter-field'),document.querySelector('.cue')])
    link.addEventListener('click',navigate);
  for(const link of document.querySelectorAll('#chapters a')){
    link.addEventListener('click',event=>{
      if(!active)return;
      const landmark=links.find(item=>item.hash===link.hash);
      if(landmark)navigate(event,landmark);
    });
  }
  addEventListener('resize',layout);addEventListener('labworld:ready',layout);document.fonts?.ready.then(layout);
  addEventListener('labworld:unavailable',layout);
  return {update(opacity){
    if(!active && opacity>0){active=true;layout();}
    map.parentElement.style.setProperty('--hub-photo',String(opacity));
    map.style.opacity=String(opacity);map.inert=opacity<.35;active=opacity>0;
  },layout,travel};
};
