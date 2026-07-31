/* LaB Assistant: deterministic retrieval core.
   No network calls, model calls, storage or DOM dependency. */
(function(root){
  'use strict';

  var STOP = {
    a:1, an:1, and:1, are:1, can:1, could:1, did:1, do:1, does:1, for:1, from:1,
    get:1, give:1, help:1, how:1, i:1, in:1, is:1, it:1, me:1, need:1, of:1, on:1,
    please:1, recommend:1, show:1, some:1, that:1, the:1, there:1, this:1, to:1,
    want:1, was:1, were:1, what:1, when:1, where:1, which:1, who:1, with:1, you:1, your:1
  };
  var ALIASES = [
    ['camera','cameras','body','bodies'],
    ['lens','lenses','glass','optics'],
    ['rent','rental','rentals','hire'],
    ['drone','drones','fpv','quad','quadcopter'],
    ['edit','editing','editor','cut','post'],
    ['music','score','scores','audio','sound'],
    ['event','events','screening','screenings','festival','festivals'],
    ['free','gratis','no-cost','nocost'],
    ['own','owns','owned','ours','kit','gear'],
    ['borrowed','shared','collaborator','collaborators'],
    ['idea','ideas','prompt','prompts','story'],
    ['film','films','movie','movies','reel','portfolio'],
    ['learn','learning','tutorial','tutorials','education'],
    ['site','website','page','pages','navigation'],
    ['based','location','shelby','township','michigan','detroit'],
    ['crew','crews','team','teams'],
    ['48hfp','48-hour','48hour']
  ];

  function plain(value){
    return String(value == null ? '' : value)
      .replace(/<[^>]*>/g,' ')
      .replace(/&amp;/g,'&').replace(/&rsquo;|&#8217;/g,'’')
      .replace(/&ldquo;|&rdquo;/g,'"').replace(/—|&mdash;/g,': ')
      .replace(/, |&ndash;/g,': ')
      .replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim();
  }
  function normalize(value){
    return plain(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }
  function unique(values){
    var seen={}, out=[];
    values.forEach(function(v){if(v && !seen[v]){seen[v]=1;out.push(v);}});
    return out;
  }
  function tokens(value){
    return unique(normalize(value).split(/\s+/).filter(function(t){return t && !STOP[t];}));
  }
  function expand(ts){
    var out=ts.slice();
    ALIASES.forEach(function(group){
      if(group.some(function(word){return ts.indexOf(word)>-1;})) out=out.concat(group);
    });
    return unique(out);
  }
  function variantsFor(token){
    for(var i=0;i<ALIASES.length;i++)if(ALIASES[i].indexOf(token)>-1)return ALIASES[i];
    return [token];
  }
  function slug(value){
    return normalize(value).replace(/\s+/g,'-');
  }
  function catsOf(record){
    return String(record.category||'').split(',').map(function(v){return v.trim();}).filter(Boolean);
  }
  function groupFor(record){
    var cats=catsOf(record);
    var groups=[
      {id:'references',cats:['references']},
      {id:'ai',cats:['ai']},{id:'music',cats:['music','soundfx']},{id:'stock',cats:['stock']},
      {id:'fonts',cats:['fonts']},{id:'3d',cats:['3d']},{id:'software',cats:['software','coding','tools']},
      {id:'equipment',cats:['equipment']},{id:'drone',cats:['drone']},
      {id:'collaborators',cats:['collaborators']},{id:'film-festivals',cats:['film-festivals']},
      {id:'community',cats:['community']}
    ];
    for(var i=0;i<groups.length;i++){
      if(groups[i].cats.some(function(c){return cats.indexOf(c)>-1;})) return groups[i].id;
    }
    return 'software';
  }
  function pageForGroup(group){
    if(group==='references') return 'learn.html';
    if(group==='equipment'||group==='drone') return 'sourcing.html';
    if(group==='collaborators'||group==='film-festivals'||group==='community') return 'people.html';
    return 'resources.html';
  }
  function resourceUrl(record){
    return pageForGroup(groupFor(record))+'#'+slug(record.id||record.name);
  }
  function gearUrl(section,item){
    var anchor=root.gearItemAnchor
      ? root.gearItemAnchor(section,item)
      : 'gear-'+String(section&&section.id||'kit')+'-'+slug(item&&item.name||'');
    return 'gear.html#'+anchor;
  }
  function eventUrl(event){
    return event&&event.id?'events.html#event-'+event.id:'events.html';
  }
  function parseDate(value){
    var p=String(value||'').split('-');
    if(p.length!==3) return null;
    var d=new Date(+p[0],+p[1]-1,+p[2]);
    return isNaN(d.getTime()) ? null : d;
  }
  function localToday(now){
    var d=now ? new Date(now) : new Date();
    d.setHours(0,0,0,0);
    return d;
  }
  function dateLabel(event){
    var start=parseDate(event.date), end=parseDate(event.until);
    if(!start) return '';
    var opts={month:'short',day:'numeric',year:'numeric'};
    var label=start.toLocaleDateString(undefined,opts);
    if(end) label+='–'+end.toLocaleDateString(undefined,opts);
    return label+(event.time?' · '+event.time:'');
  }
  function editDistance(a,b){
    if(a===b)return 0;
    if(!a.length)return b.length;if(!b.length)return a.length;
    var prev=[],cur=[],i,j;
    for(j=0;j<=b.length;j++)prev[j]=j;
    for(i=1;i<=a.length;i++){
      cur=[i];
      for(j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      prev=cur;
    }
    return prev[b.length];
  }
  function tokenHit(queryToken, docToken){
    if(queryToken===docToken)return 5;
    if(queryToken.length>3 && (docToken.indexOf(queryToken)===0 || queryToken.indexOf(docToken)===0))return 2;
    if(queryToken.length>4 && editDistance(queryToken,docToken)<=1)return 1.5;
    if(queryToken.length>7 && editDistance(queryToken,docToken)<=2)return 1;
    return 0;
  }
  function scoreDoc(query, doc){
    var qn=normalize(query), title=normalize(doc.title), hay=normalize(doc.text+' '+doc.tags);
    var base=tokens(query), d=tokens(title+' '+hay), titleTokens=tokens(title), score=0, baseMatched=0;
    if(qn && title===qn)score+=28;
    else if(qn && title.indexOf(qn)>-1)score+=18;
    if(qn.length>3 && hay.indexOf(qn)>-1)score+=10;
    base.forEach(function(qt){
      var best=0;
      var variants=variantsFor(qt);
      variants.forEach(function(v){d.forEach(function(dt){best=Math.max(best,tokenHit(v,dt));});});
      if(best){
        baseMatched++;
        score+=best+(variants.some(function(v){return titleTokens.indexOf(v)>-1;})?2:0);
      }
    });
    return {score:score,coverage:base.length?baseMatched/base.length:0};
  }
  function source(title,url,note){
    return {title:title,url:url,note:note||''};
  }
  function joinNames(items,limit){
    return items.slice(0,limit).map(function(item){return plain(item.name||item.title);}).join(', ');
  }

  function createEngine(data){
    data=data||{};
    var resourceList=data.resources||[];
    var gearSections=data.gearData||[];
    var eventList=data.spotlight||[];
    var knowledge=data.knowledge||{pages:[],films:[],faqs:[]};
    var fieldNotes=data.fieldNotes||[];
    var docs=[];

    resourceList.forEach(function(r){
      docs.push({
        type:'resource', title:r.name, url:resourceUrl(r), record:r,
        tags:catsOf(r).join(' ')+' '+(r.features||[]).join(' ')+' '+(r.labPick?'lab pick':'')+' '+(r.inLab?'in lab':''),
        text:(r.desc||'')+' '+(r.fullDesc||'')+' '+(r.pricing||[]).map(function(p){return p.name+' '+p.price;}).join(' ')
      });
    });
    gearSections.forEach(function(sec){
      (sec.items||[]).forEach(function(item){
        docs.push({
          type:'gear', title:item.name, record:item, section:sec,
          url:gearUrl(sec,item), tags:plain(sec.title)+' '+(item.shared?'shared borrowed collaborator':'owned lab kit'),
          text:(item.what||'')+' '+(item.note||'')+' '+(sec.blurb||'')
        });
      });
    });
    (knowledge.films||[]).forEach(function(f){
      docs.push({type:'film',title:f.title,url:f.url,record:f,tags:f.tags,text:f.kind+' '+f.year+' '+f.summary});
    });
    (knowledge.pages||[]).forEach(function(p){
      docs.push({type:'page',title:p.title,url:p.url,record:p,tags:p.tags,text:p.summary});
    });
    (knowledge.faqs||[]).forEach(function(f){
      docs.push({type:'faq',title:f.title,url:f.url,record:f,tags:f.tags,text:f.answer});
    });
    fieldNotes.forEach(function(n){
      docs.push({type:'field-note',title:n.title,url:n.url,record:n,tags:n.tags,text:n.answer});
    });

    function eventMention(query,event){
      var q=tokens(query), titleTokens=tokens(plain(event.title)).filter(function(t){return t.length>2;});
      var hits=titleTokens.filter(function(t){return q.some(function(qt){return tokenHit(qt,t)>0;});}).length;
      return hits>=Math.min(2,titleTokens.length);
    }
    function eventsAnswer(now,query){
      var today=localToday(now);
      if(/\b(expired|past|old)\b/.test(normalize(query||''))){
        return {kind:'events',confidence:1,answer:'No. Dated spotlight events are removed after their final day; multi-day events remain current through their inclusive `until` date.',
          sources:[source('Michigan Film Events','events.html','Current-event behavior')]};
      }
      var live=eventList.filter(function(e){
        var end=parseDate(e.until)||parseDate(e.date);
        return end && end>=today;
      }).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0;});
      var named=live.filter(function(e){return eventMention(query||'',e);});
      if(named.length)live=named;
      else{
        var months=['january','february','march','april','may','june','july','august','september','october','november','december'];
        var month=months.indexOf(tokens(query||'').filter(function(t){return months.indexOf(t)>-1;})[0]);
        if(month>-1)live=live.filter(function(e){
          var start=parseDate(e.date),end=parseDate(e.until);
          return (start&&start.getMonth()===month)||(end&&end.getMonth()===month);
        });
      }
      if(!live.length){
        return {kind:'events',confidence:1,answer:'I don’t have a current dated event in the spotlight list right now. The Events page still has Michigan organizations and recurring places to check.',sources:[source('Michigan Film Events','events.html')]};
      }
      var lines=live.slice(0,4).map(function(e){
        return plain(e.title)+': '+dateLabel(e)+(e.where?' · '+plain(e.where):'')+(e.by?' · Presented by '+plain(e.by):'');
      });
      return {kind:'events',confidence:1,answer:'Here’s what is still current in the event list:\n'+lines.join('\n'),
        sources:live.slice(0,4).map(function(e){return source(plain(e.title),eventUrl(e),dateLabel(e));})};
    }
    function gearAnswer(query){
      var nq=normalize(query), borrowed=/\b(borrow|borrowed|shared|collaborator|not ours)\b/.test(nq);
      var owned=/\b(own|owns|owned|ours|yours|kit|have|has)\b/.test(nq) && !borrowed;
      var sectionHints=[
        ['camera',['camera','body']],['lenses',['lens','glass','optic']],
        ['light',['light','lighting']],['audio-prod',['audio','sound','recorder','microphone','mic']],
        ['drone',['drone','fpv','quad']],['support',['gimbal','tripod','dolly','support']],
        ['software',['software','edit','editor','editing']],['machine',['computer','machine','storage','nas']]
      ];
      var sectionId='';
      sectionHints.some(function(pair){
        if(pair[1].some(function(w){return nq.indexOf(w)>-1;})){sectionId=pair[0];return true;}
        return false;
      });
      var candidates=[],namedShared=[];
      gearSections.forEach(function(sec){
        (sec.items||[]).forEach(function(item){
          if(item.shared&&scoreDoc(query,{title:item.name,text:'',tags:''}).score>=7)namedShared.push({item:item,sec:sec});
          if(sectionId && sec.id!==sectionId)return;
          if(borrowed && !item.shared)return;
          if(owned && item.shared)return;
          candidates.push({item:item,sec:sec});
        });
      });
      var exactShared=namedShared.filter(function(x){return nq.indexOf(normalize(x.item.name))>-1;});
      if(exactShared.length)namedShared=exactShared;
      if(owned&&namedShared.length&&!sectionId){
        return {
          kind:'gear',
          confidence:1,
          answer:joinNames(namedShared.map(function(x){return x.item;}),4)
            +(namedShared.length===1?' is':' are')+' collaborator/shared gear, not LaB-owned.',
          sources:namedShared.slice(0,4).map(function(x){
            return source(plain(x.item.name),gearUrl(x.sec,x.item),'Marked shared');
          })
        };
      }
      if(!candidates.length)return null;
      candidates.sort(function(a,b){
        var as=scoreDoc(query,{title:a.item.name,text:(a.item.what||'')+' '+plain(a.sec.title),tags:''}).score+(a.item.key?4:0);
        var bs=scoreDoc(query,{title:b.item.name,text:(b.item.what||'')+' '+plain(b.sec.title),tags:''}).score+(b.item.key?4:0);
        return bs-as;
      });
      var chosen=candidates.slice(0,sectionId?8:6);
      var lead=borrowed?'These are explicitly marked as collaborator/shared gear, not LaB-owned: '
        : owned?'The LaB-owned list includes: ':'The closest kit matches are: ';
      var answer=lead+joinNames(chosen.map(function(x){return x.item;}),8)+'.';
      if(owned&&namedShared.length){
        answer+=' '+joinNames(namedShared.map(function(x){return x.item;}),4)
          +(namedShared.length===1?' is':' are')+' collaborator/shared gear, not LaB-owned.';
      }
      var sourceItems=[],sourceSeen={};
      chosen.concat(owned?namedShared:[]).forEach(function(x){
        var url=gearUrl(x.sec,x.item);
        if(!sourceSeen[url]){sourceSeen[url]=1;sourceItems.push({entry:x,url:url});}
      });
      return {kind:'gear',confidence:1,answer:answer,
        sources:sourceItems.slice(0,4).map(function(x){
          return source(plain(x.entry.item.name),x.url,borrowed?'Marked shared':'Kit item');
        })};
    }
    function resourceAnswer(query,freeOnly){
      var nq=normalize(query);
      var wanted=null;
      if(/\b(rent|rental|rentals|hire)\b/.test(nq))wanted=['equipment'];
      else if(/\b(drone|fpv)\b/.test(nq)&&/\b(training|learn|tutorial|links)\b/.test(nq))wanted=['drone'];
      else if(/\b(community|groups)\b/.test(nq))wanted=['community'];
      else if(/\bmusic\b/.test(nq))wanted=['music','soundfx'];
      else if(/\bstock\b/.test(nq))wanted=['stock'];
      else if(/\b(font|fonts|typeface|typefaces)\b/.test(nq))wanted=['fonts'];
      else if(/\bai\b/.test(nq))wanted=['ai'];
      else if(/\b(edit|editing|editor|grading)\b/.test(nq))wanted=['software','coding','tools'];
      var contentTokens=tokens(query).filter(function(t){return ['free','resource','resources','tool','tools','find','need','link','links'].indexOf(t)<0;});
      var rankQuery=contentTokens.join(' ');
      var candidates=resourceList.filter(function(r){
        if(freeOnly && r.paid)return false;
        var cats=catsOf(r);
        if(wanted&&!wanted.some(function(c){return cats.indexOf(c)>-1;}))return false;
        if(freeOnly && (cats.indexOf('collaborators')>-1||cats.indexOf('community')>-1||cats.indexOf('film-festivals')>-1))return false;
        return true;
      }).map(function(r){
        var s=scoreDoc(rankQuery,{title:r.name,text:(r.desc||'')+' '+(r.fullDesc||''),tags:catsOf(r).join(' ')+' '+(r.features||[]).join(' ')});
        if(freeOnly && (r.labPick||r.inLab))s.score+=3;
        if(/\b(rent|rental|hire)\b/.test(nq) && /\b(rent|rental|hire)\b/.test(normalize((r.desc||'')+' '+(r.fullDesc||'')+' '+(r.features||[]).join(' '))))s.score+=10;
        return {record:r,score:s.score,coverage:s.coverage};
      }).sort(function(a,b){return b.score-a.score;});
      if(!candidates.length)return null;
      var limit=/\b(rent|rental|rentals|hire)\b/.test(nq)?3:4;
      var floor=contentTokens.length&&candidates.length?Math.max(2,candidates[0].score*.35):0;
      var chosen=(contentTokens.length?candidates.filter(function(x){return x.score>=floor;}):candidates).slice(0,limit);
      if(!chosen.length)return null;
      var label=freeOnly?'These checked resources are marked free: ':'These are the closest checked resources: ';
      return {kind:'resources',confidence:chosen[0].score>2?1:.65,answer:label+joinNames(chosen.map(function(x){return x.record;}),4)+'.',
        sources:chosen.map(function(x){return source(x.record.name,resourceUrl(x.record),x.record.desc||'');})};
    }
    function filmAnswer(query){
      var films=(knowledge.films||[]).map(function(f){var s=scoreDoc(query,{title:f.title,text:f.summary,tags:f.tags+' '+f.kind+' '+f.year});return {film:f,score:s.score};})
        .sort(function(a,b){return b.score-a.score;});
      var nq=normalize(query), themed=null;
      var qTokens=tokens(query);
      var named=films.filter(function(x){
        var titleTokens=tokens(x.film.title).filter(function(t){return t!=='the'&&t.length>1;});
        return titleTokens.length&&titleTokens.every(function(t){return qTokens.indexOf(t)>-1;});
      });
      if(named.length===1){
        films=named;
        var f=named[0].film;
        var videoAdd=f.videoUrl?'\n\nWatch '+f.title+' on YouTube: '+f.videoUrl:'';
        var srcList=[source(f.title,f.url,f.kind+' · '+f.year)];
        if(f.videoUrl)srcList.push(source(f.title+' Video',f.videoUrl,'YouTube video'));
        if(/\b(when|date|dates|filmed|shot|shoot|made)\b/.test(nq)&&f.filmed){
          return {
            kind:'films',
            confidence:1,
            answer:f.title+' was filmed '+f.filmed+'. '+f.summary+videoAdd,
            sources:srcList
          };
        }
      }
      if(/\b(comedy|comedies|funny)\b/.test(nq))themed='comedy';
      else if(/\b(brand|commercial|commercials)\b/.test(nq))themed='commercial';
      else if(/\b(horror|scary)\b/.test(nq))themed='horror';
      else if(/\b(music video|live session|band)\b/.test(nq))themed='music';
      else if(/\b(artist|portrait|documentary)\b/.test(nq))themed='artist';
      if(themed)films=films.filter(function(x){return normalize(x.film.tags+' '+x.film.kind).indexOf(themed)>-1;});
      var plural=/\b(films|movies|reel|portfolio|work)\b/.test(nq) && !/\b(award|horror|scary|comedy|comedies|funny|48|brand|commercial|music|artist|portrait|documentary)\b/.test(nq);
      var floor=films.length?Math.max(6,films[0].score*.6):6;
      var chosen=plural?films.slice(0,8):named.length===1?films:themed?films.slice(0,3):films.filter(function(x){return x.score>=floor;}).slice(0,3);
      if(!chosen.length)return null;
      var singleVideo=(chosen.length===1&&chosen[0].film.videoUrl)?'\n\nWatch '+chosen[0].film.title+' on YouTube: '+chosen[0].film.videoUrl:'';
      var mainSources=chosen.slice(0,4).map(function(x){return source(x.film.title,x.film.url,x.film.kind+' · '+x.film.year);});
      if(chosen.length===1&&chosen[0].film.videoUrl){
        mainSources.push(source(chosen[0].film.title+' Video',chosen[0].film.videoUrl,'YouTube video'));
      }
      return {kind:'films',confidence:1,answer:plural
          ? 'The Reel currently has eight films: '+chosen.map(function(x){return x.film.title;}).join(', ')+'.'
          : chosen.map(function(x){return x.film.title+': '+x.film.summary;}).join('\n')+singleVideo,
        sources:mainSources};
    }
    function genericAnswer(query){
      var ranked=docs.map(function(doc){var s=scoreDoc(query,doc);return {doc:doc,score:s.score,coverage:s.coverage};})
        .filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score;});
      var queryTokens=tokens(query);
      if(!ranked.length || ranked[0].score<6 || (queryTokens.length>1&&ranked[0].coverage<.5)){
        return {kind:'unknown',confidence:0,answer:'I couldn’t find that in the LaB site yet. Try asking about a film, owned or borrowed gear, a free resource, an upcoming event, Story Generator, SkyBound, or how the site was built.',
          sources:[source('Browse the LaB','index.html')]};
      }
      var top=ranked.slice(0,3), first=top[0].doc;
      var answer;
      if(first.type==='faq')answer=first.record.answer;
      else if(first.type==='field-note')answer=first.record.answer;
      else if(first.type==='page')answer=first.record.summary;
      else if(first.type==='film')answer=first.record.title+': '+first.record.summary;
      else if(first.type==='gear')answer=first.title+': '+first.record.what+(first.record.shared?' It is marked as collaborator/shared gear, not LaB-owned.':'');
      else answer=first.title+': '+(first.record.desc||first.record.fullDesc||'A checked resource in the LaB notebook.');
      var cited=(first.type==='faq'||(first.type==='page'&&top[0].score>=12))?top.slice(0,1):top;
      return {kind:'search',confidence:Math.min(1,top[0].score/14),answer:answer,
        sources:cited.map(function(x){return source(x.doc.title,x.doc.url,x.doc.type);})};
    }
    function fieldNoteAnswer(query){
      var ranked=fieldNotes.map(function(note){
        var scored=scoreDoc(query,{title:note.title,text:note.answer,tags:note.tags});
        return {note:note,score:scored.score,coverage:scored.coverage};
      }).sort(function(a,b){return b.score-a.score;});
      if(!ranked.length||ranked[0].score<10||ranked[0].coverage<.6)return null;
      var n=ranked[0].note;
      var sources=n.sources ? n.sources.map(function(s){ return source(s.title,s.url,s.note); }) : [source(n.title,n.url,'Curated LaB field note')];
      return {
        kind:'field-note',
        confidence:1,
        answer:n.answer,
        sources:sources
      };
    }
    function ask(query,options){
      query=String(query||'').trim().slice(0,280);
      if(!query)return {kind:'empty',confidence:0,answer:'Ask me something about the films, kit, resources, events or how this place works.',sources:[]};
      var nq=normalize(query);
      if(/^(hello|hi|hey|good morning|good afternoon|good evening|how are you)( there)?$/.test(nq)){
        return {
          kind:'greeting',
          confidence:1,
          answer:'Hey: I’m the LaB Assistant. Ask me about a film, the gear LaB actually owns, a checked resource, a Michigan event, SkyBound, or how the site was built.',
          sources:[source('LaB Assistant','assistant.html')]
        };
      }
      var fieldNote=fieldNoteAnswer(query);
      if(fieldNote)return fieldNote;
      if(/\b(sync|account|saved|save)\b/.test(nq)&&/\b(kit|links|resources|favorites|favourites)\b/.test(nq)){
        var savedFaq=(knowledge.faqs||[]).filter(function(f){return f.title==='Where are saved resources kept?';})[0];
        if(savedFaq)return {kind:'faq',confidence:1,answer:savedFaq.answer,sources:[source(savedFaq.title,savedFaq.url)]};
      }
      if(/\b(hire|hiring|book|booking|taking projects|shoot my project)\b/.test(nq)){
        var hiring=(knowledge.faqs||[]).filter(function(f){return f.title==='Is LaB taking projects?';})[0];
        if(hiring)return {kind:'faq',confidence:1,answer:hiring.answer,sources:[source(hiring.title,hiring.url)]};
      }
      var namesEvent=eventList.some(function(e){return eventMention(query,e);});
      if(namesEvent||/\b(event|events|screening|screenings|festival|festivals|coming up|happening)\b/.test(nq))return eventsAnswer(options&&options.now,query);
      if(/\b(music video|48 hour|48 hours|award|won|winner|comedies|brand pieces|horror film)\b/.test(nq)){
        var earlyFilm=filmAnswer(query);if(earlyFilm)return earlyFilm;
      }
      if(/\b(rent|rental|rentals|resource|resources|free|training|tutorial|tutorials|community|groups|links)\b/.test(nq)){
        var directResource=resourceAnswer(query,/\bfree\b/.test(nq));if(directResource)return directResource;
      }
      if(/\b(camera|cameras|lens|lenses|gear|kit|own|owned|yours|borrowed|shared|gimbal|gimbals|tripod|light|lighting|audio|sound|mic|microphone|recorder|drone|fpv|software|edit|editing|editor|nas)\b/.test(nq)){
        var g=gearAnswer(query);if(g)return g;
      }
      if(/\b(tool|tools|music|stock|font|fonts|tutorial|tutorials|grading)\b/.test(nq)){
        var r=resourceAnswer(query,/\bfree\b/.test(nq));if(r)return r;
      }
      if(/\b(film|films|movie|movies|reel|portfolio|award|horror|comedy|comedies|funny|commercial|commercials|48 hour|trail dead|scattered|pandys|moz|juic|anthony brass|lookout)\b/.test(nq)){
        var f=filmAnswer(query);if(f)return f;
      }
      return genericAnswer(query);
    }

    return {ask:ask,buildIndex:function(){return docs.slice();}};
  }

  var api={createEngine:createEngine,normalize:normalize,tokens:tokens,scoreDoc:scoreDoc,plain:plain};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LaBAssistantCore=api;
})(typeof window!=='undefined'?window:globalThis);
