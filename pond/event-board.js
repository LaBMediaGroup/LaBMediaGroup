// The printed calendar and its native hit targets use the same 400 by 610 layout.
window.createEventBoard=function(get,dayKey){
  const canvas=get('boardPrint'), ctx=canvas.getContext('2d'), days=get('boardDays');
  const monthFormat=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
  const labelDate=k=>new Date(k+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
  const clean=s=>(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&');
  let entries=[],selected=null,month='',loaded=false,selectedDay='';
  const today=dayKey(new Date());
  function inMonth(e,m){return e.date.slice(0,7)<=m && (e.until||e.date).slice(0,7)>=m;}
  function native(el,x,y,w,h){el.style.left=x/4+'%';el.style.top=y/6.1+'%';el.style.width=w/4+'%';el.style.height=h/6.1+'%';}
  function paper(x,y,w,h,color){ctx.fillStyle='#4b372653';ctx.fillRect(x+2,y+3,w,h);ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
  function ink(str,x,y,size,color='#24372e',font='Georgia',max=355){
    ctx.fillStyle=color;ctx.font=size+'px '+font;ctx.fillText(str,x,y,max);
  }
  function wrap(str,x,y,width,size,limit){
    ctx.font='bold '+size+'px Georgia';ctx.fillStyle='#21352d';
    const words=str.split(/\s+/);let line='',row=0;
    for(let i=0;i<words.length;i++){const word=words[i];
      if(line && ctx.measureText(line+' '+word).width>width){
        if(row===limit-1){ctx.fillText(line+'…',x,y+row*(size+2),width);return;}
        ctx.fillText(line,x,y+row++*(size+2),width);line=word;
      }else line=line?line+' '+word:word;
    }
    if(line)ctx.fillText(line,x,y+row*(size+2),width);
  }
  // Cork grain is reusable between months. Each speck is about a millimetre across.
  const cork=document.createElement('canvas');cork.width=800;cork.height=1220;
  const c=cork.getContext('2d');c.fillStyle='#b38150';c.fillRect(0,0,800,1220);
  let seed=131;const random=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;
  for(let i=0;i<83000;i++){c.fillStyle=i%3?'#72472e34':'#e3b57a70';c.fillRect(random()*800,random()*1220,random()*4+1,random()*3+1);}
  function paint(){
    const date=new Date((month||today.slice(0,7))+'-01T12:00:00Z'),label=monthFormat.format(date);
    const start=date.getUTCDay(),count=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
    ctx.setTransform(2,0,0,2,0,0);ctx.drawImage(cork,0,0,400,610);
    paper(31,35,338,43,'#283d34');ink('MICHIGAN EVENTS',51,65,25,'#fff6de','sans-serif');
    paper(61.5,110,277,222,'#f6f0db');
    ink(label,98,152,23,'#234238','Georgia',200);ink('‹',73,151,28);ink('›',315,151,28);
    const left=72,top=178,cw=36.6,ch=24;
    ['S','M','T','W','T','F','S'].forEach((v,i)=>ink(v,left+i*cw+10,172,11,'#726e5d','sans-serif'));
    days.replaceChildren();
    for(let d=1;d<=count;d++){
      const key=month+'-'+String(d).padStart(2,'0'),cell=start+d-1;
      const x=left+cell%7*cw,y=top+Math.floor(cell/7)*ch;
      const matches=entries.filter(e=>e.date<=key && (e.until||e.date)>=key);
      ctx.strokeStyle='#d1cbb8';ctx.lineWidth=.7;ctx.strokeRect(x,y,cw,ch);
      if(matches.length){ctx.fillStyle=key===selectedDay?'#a54229':'#d9d7bd';ctx.fillRect(x+1,y+1,cw-2,ch-2);}
      ink(String(d),x+8,y+17,15,key===selectedDay&&matches.length?'#fff':'#283b32','sans-serif');
      if(matches.length){
        const b=document.createElement('button');b.type='button';b.textContent=labelDate(key)+', '+matches.map(e=>clean(e.title)).join(', ');
        b.dataset.day=key;b.setAttribute('aria-pressed',String(key===selectedDay));native(b,x,y,cw,ch);
        b.onclick=()=>{selected=matches[(matches.indexOf(selected)+1)%matches.length];selectedDay=key;paint();days.querySelector('[data-day="'+key+'"]')?.focus({preventScroll:true});};days.append(b);
      }
    }
    paper(26,367,348,181,'#f3dfaa');
    const title=selected?clean(selected.title):(loaded?'No listings this month':'Loading listings…');
    const dateText=selected?((selected.until||selected.date)<today?'Archive':'On the calendar')+' · '+labelDate(selected.date)+(selected.until?' – '+labelDate(selected.until):''):'Michigan';
    const where=selected?clean(selected.venue||selected.where||selected.by):'';
    ink(dateText.toUpperCase(),45,405,14,'#86402e','sans-serif');wrap(title,45,438,306,23,2);
    ink(where,45,489,15,'#364437','sans-serif',310);
    ink('Next listing →',45,526,18,'#283e35','sans-serif');
    paper(196,560,176,32,'#2c4236');ink('All Michigan events ↗',207,582,15,'#fff7dc','sans-serif');
    const name=get('eventName');name.textContent=title;
    if(selected)name.href=get('boardAll').href+'#event-'+encodeURIComponent(selected.id);else name.removeAttribute('href');
    get('eventWhere').textContent=where;get('eventDate').textContent=dateText;get('boardMonth').textContent=label;
    get('eventNext').disabled=!entries.length;canvas.dispatchEvent(new Event('boardprint'));
  }
  function switchMonth(by){
    const d=new Date(month+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+by);month=d.toISOString().slice(0,7);
    selected=entries.find(e=>inMonth(e,month))||null;selectedDay=selected? (selected.date.slice(0,7)===month?selected.date:month+'-01'):'';
    paint();
  }
  function select(e){selected=e;month=e.date.slice(0,7);selectedDay=e.date;paint();}
  get('boardEarlier').onclick=()=>switchMonth(-1);get('boardLater').onclick=()=>switchMonth(1);
  get('eventNext').onclick=()=>{if(entries.length)select(entries[(entries.indexOf(selected)+1)%entries.length]);};
  native(get('boardEarlier'),62,116,36,44);native(get('boardLater'),304,116,35,44);
  native(get('eventName'),40,413,320,81);native(get('eventNext'),33,496,160,47);native(get('boardAll'),190,552,190,50);
  month=today.slice(0,7);paint();
  function load(list){if(loaded)return;loaded=true;entries=[...list].sort((a,b)=>a.date.localeCompare(b.date));
    const e=entries.find(e=>(e.until||e.date)>=today)||entries.at(-1);if(e)select(e);else paint();}
  return {load};
};
