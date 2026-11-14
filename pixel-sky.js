/* Shared pixel landscape for the homepage entrance and the Golden Hour preview. */
(()=>{'use strict';
function mins(d){return d.getHours()*60+d.getMinutes();}
function hhmm(d){return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function onScreenLoop(cvs,draw){let visible=false,raf=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');const paused=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');function frame(t){raf=0;if(!visible||document.hidden||paused())return;draw(t);raf=requestAnimationFrame(frame);}function sync(){cancelAnimationFrame(raf);raf=0;draw(0);if(visible&&!document.hidden&&!paused())raf=requestAnimationFrame(frame);}new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(cvs);new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);}
  function mount(cvs,options) {
      var day=options.day,LAT=options.lat,LON=options.lon;
      var REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
      var slider=options.slider,clock=options.clock,phaseLabel=options.phaseLabel;
      if(!cvs)return;
      var ctx=cvs.getContext('2d'),width=0,height=0,stamp=0;
      var selected=Math.round((mins(day.eveningGoldenStart)+mins(day.sunset))/2);
      if(slider)slider.value=selected;
      var colors={night:['#080b12','#11182a','#28334a'],blue:['#151c32','#3f5975','#bf7c72'],golden:['#718da3','#d6956f','#e66f3c'],daylight:['#8eb7cc','#c6d6d6','#e6c4a6']};
      var names={'night':'Night','blue-dawn':'Blue hour','blue-dusk':'Blue hour','golden-morning':'Morning golden hour','golden-evening':'Evening golden hour','daylight':'Daylight'};
      function pixel(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
      // Same stepped, three-tier pine anatomy as sun.js, on a low-resolution canvas.
      function tree(cx,base,th,half,bend,color){
        for(var y=base-th;y<=base;y++){
          var f=(y-(base-th))/th,r=0;
          [[0,.52,.55],[.24,.78,.8],[.52,1,1]].forEach(function(tier){if(f>=tier[0]&&f<=tier[1])r=Math.max(r,Math.round(half*tier[2]*(f-tier[0])/(tier[1]-tier[0])));});
          pixel(cx-r+bend*(1-f)*(1-f),y,r*2+1,1,color);
        }
      }
      function draw(t){
        stamp=t||stamp;
        if(!width)return;
        var still=REDUCED||document.documentElement.classList.contains('motion-paused');
        var time=still?0:stamp/1000;
        var date=new Date(day.sunrise);date.setHours(0,selected,0,0);
        var phase=LaBSun.phaseAt(date,day),night=phase==='night';
        var palette=colors[phase.split('-')[0]]||colors.daylight;
        cvs.parentElement.dataset.phase=phase;
        var gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,palette[0]);gradient.addColorStop(.6,palette[1]);gradient.addColorStop(1,palette[2]);ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
        if(night){for(var i=0;i<28;i++)pixel((i*47+13)%width,(i*23+7)%(height*.65),1,1,i%3?'#7c8da4':'#d1d8e1');}
        var elevation=LaBSun.position(date,LAT,LON).elevation;
        if(elevation>-.8){
          var x=width*(.08+.84*(selected-mins(day.sunrise))/Math.max(1,mins(day.sunset)-mins(day.sunrise)));
          var y=height*(.78-.57*Math.max(0,elevation)/Math.max(10,day.maxElevation));
          // Crisp stepped disc, rather than a smooth graph marker.
          for(var row=-5;row<=5;row++){var half=Math.floor(Math.sqrt(30-row*row));pixel(x-half,y+row,half*2+1,1,'#ffe0a1');}
        }
        // Layered ridges and pines keep depth while leaving the sky open.
        for(var col=0;col<width;col++){
          var ridge=height*(.77+.035*Math.sin(col*.055)+.025*Math.sin(col*.11));pixel(col,ridge,1,height-ridge,night?'#172333':'#526965');
        }
        [[.06,.34,.06],[.23,.22,.035],[.48,.27,.045],[.73,.42,.065],[.92,.36,.055]].forEach(function(p,i){tree(width*p[0],height+2,height*p[1],width*p[2],Math.sin(time*.6+i)*1.2,night?'#070e17':'#172d2c');});
        [[.15,.29],[.57,.22],[.84,.34]].forEach(function(b,i){var x=((b[0]+time*.012)%1.2-.1)*width,y=height*b[1]+Math.sin(time+i),flap=Math.sin(time*4+i)>0?-1:1;pixel(x-3,y+flap,2,1,night?'#8c99aa':'#243c42');pixel(x-1,y,2,1,night?'#8c99aa':'#243c42');pixel(x+1,y+flap,2,1,night?'#8c99aa':'#243c42');});
        if(clock)clock.textContent=hhmm(date);if(phaseLabel)phaseLabel.textContent=names[phase];if(slider)slider.setAttribute('aria-valuetext',hhmm(date)+' · '+names[phase]);
      }
      function resize(){var r=cvs.getBoundingClientRect();if(!r.width)return;width=Math.round(r.width/3);height=Math.round(r.height/3);cvs.width=width;cvs.height=height;draw(stamp);}
      new ResizeObserver(resize).observe(cvs);resize();
      if(slider)slider.addEventListener('input',function(){selected=Number(slider.value);draw(stamp);});
      onScreenLoop(cvs,draw);
    }

window.LaBPixelSky={mount};
})();
