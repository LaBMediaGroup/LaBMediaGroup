/* ============================================================
   THE NOTEBOOK : shared renderer
   Loaded by learn.html, resources.html, people.html and sourcing.html.

   Each page sets window.PAGE_BANDS to the band ids it owns before
   including this file; everything else : grouping, counts, peek
   lines, search, the star buttons and the kit pointer : is the
   same code on all four. It lives in one file because four
   copies of 742 lines is how four pages quietly stop agreeing
   with each other, and the counts on this site have already
   drifted three times from exactly that.

   Entries are assigned to bands by category, and every band is
   owned by exactly one page, so no entry can render twice across
   the split.
   ============================================================ */
/* Nav */
(function(){
  var t=document.getElementById('navToggle'),l=document.getElementById('navLinks');
  var desktop=function(){return window.innerWidth>760};

  if(t&&l){t.addEventListener('click',function(e){
    e.stopPropagation();
    var open=t.getAttribute('aria-expanded')==='true';
    t.setAttribute('aria-expanded',String(!open));
    l.setAttribute('data-open',String(!open));
  });}

  function setOpen(d,on){
    d.setAttribute('data-open',String(on));
    d.querySelector('.nav-drop-btn').setAttribute('aria-expanded',String(on));
    if(!on) d.removeAttribute('data-pinned');
  }
  function closeAll(except){
    document.querySelectorAll('.nav-drop').forEach(function(o){ if(o!==except) setOpen(o,false); });
  }

  document.querySelectorAll('.nav-drop').forEach(function(d){
    var b=d.querySelector('.nav-drop-btn');

    /* Click pins it open, so hovering away can't yank it shut mid-reach. */
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var open=d.getAttribute('data-open')==='true';
      var pinned=d.hasAttribute('data-pinned');
      closeAll(d);
      if(open&&pinned){ setOpen(d,false); }
      else { setOpen(d,true); d.setAttribute('data-pinned','1'); }
    });

    d.addEventListener('mouseenter',function(){ if(desktop()){ closeAll(d); setOpen(d,true); } });
    d.addEventListener('mouseleave',function(){
      if(desktop() && !d.hasAttribute('data-pinned')) setOpen(d,false);
    });

    /* Keyboard, handled in JS rather than by a CSS :focus-within rule.
       That rule used to force the menu visible whenever anything inside the
       drop had focus : which meant clicking the button to CLOSE it set
       data-open="false" and aria-expanded="false" while the menu stayed on
       screen, because the button you just clicked still had focus. The menu
       then hung there until you clicked somewhere else entirely. Routing
       focus through the same setOpen() the mouse uses keeps one source of
       truth. focusin fires before click, so the toggle still works: the
       first click opens and pins, the second closes for real. */
    d.addEventListener('focusin',function(){ closeAll(d); setOpen(d,true); });
    d.addEventListener('focusout',function(){
      setTimeout(function(){
        if(!d.contains(document.activeElement)) setOpen(d,false);
      },0);
    });

    /* following a link should never leave a menu hanging open */
    d.querySelectorAll('.nav-drop-menu a').forEach(function(a){
      a.addEventListener('click',function(){ setOpen(d,false); });
    });
  });

  document.addEventListener('click',function(){ closeAll(null); });

  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    closeAll(null);
    if(t){t.setAttribute('aria-expanded','false');l.setAttribute('data-open','false');}
  });
})();

/* ---- Curated groups. Order = usefulness, not size. ---- */
/* ---- Bands ----
   Twelve sibling groups read as one undifferentiated list even when they are
   all collapsed, because nothing tells you which of them are the same KIND of
   thing. These four bands wrap the existing groups rather than replacing them,
   so nothing is re-tagged and every group still owns its own anchor and count.

   Every group belongs to exactly one band : a group that matched none would
   simply never render, so the last band deliberately catches whatever is left
   over instead of letting an entry disappear the day a new category is added. */
var BANDS=[
 {id:'band-learn', title:'Watch &amp; <em>Learn</em>',
  blurb:'Channels and sites that explain the reasoning instead of the settings. Eighteen of these are people on YouTube, so this is a watch-list rather than a toolbox.',
  groups:['references']},
 {id:'band-make',  title:'Software &amp; <em>Assets</em>',
  blurb:'Things you actually open: AI that earns its place in a workflow, music and effects that won\u2019t get an upload muted, stock, type, 3D and code.',
  groups:['ai','music','stock','fonts','3d','software']},
 {id:'band-gear',  title:'Gear &amp; <em>Flight</em>',
  blurb:'Where to buy, rent and research. <a href="gear.html">LaB\u2019s Kit</a> and <a href="skybound.html">SkyBound</a> go deeper on what actually gets used.',
  groups:['equipment','drone']},
 {id:'band-who',   title:'People &amp; <em>Community</em>',
  blurb:'Who to work with, where to send the finished thing, and who to sit in a room with.',
  groups:['collaborators','film-festivals','community']}
];

var GROUPS=[
 {id:'collaborators',cats:['collaborators'],title:'People I’ve <em>Worked With</em>',blurb:'Artists, musicians, and studios I’ve actually shot with. If you need any of these skills on a Michigan project, start here : I can vouch for every one.'},
 {id:'references',cats:['references'],title:'References &amp; <em>Craft</em>',blurb:'The channels and sites I go back to. Shot breakdowns, editing theory, color, and comedy timing : the ones that explain <em>why</em> instead of just walking you through settings.'},
 {id:'ai',cats:['ai'],title:'AI <em>Tools</em>',blurb:'The handful that earn a place in a real workflow. Most AI video tools are still demos; these are the ones I’ve gotten usable output from.'},
 {id:'music',cats:['music','soundfx'],title:'Music &amp; <em>Sound</em>',blurb:'Score, licensing, and effects libraries that won’t get your upload muted three days later. Read the license terms : “free” and “free for YouTube” are not the same thing.'},
 {id:'stock',cats:['stock'],title:'Stock <em>Footage</em>',blurb:'For the plate you couldn’t get, the establishing shot you didn’t have time for, and the b-roll that saves an edit.'},
 {id:'fonts',cats:['fonts'],title:'<em>Type</em>',blurb:'Title cards and lower thirds live or die on typeface choice. These are free or fairly licensed, and none of them are Papyrus.'},
 {id:'3d',cats:['3d'],title:'<em>3D</em> &amp; Motion',blurb:'Assets and software for when a shot needs something that doesn’t exist yet.'},
 {id:'equipment',cats:['equipment'],title:'<em>Gear</em>',blurb:'Where to buy, rent, and research. Gear matters far less than people think, right up until the moment it matters enormously.'},
 {id:'software',cats:['software','coding','tools'],title:'Software &amp; <em>Code</em>',blurb:'Production planning, call sheets, and the coding tools I used to build this site.'},
 {id:'film-festivals',cats:['film-festivals'],title:'Film <em>Fests</em>',blurb:'Michigan first, then the national ones worth an entry fee. If you’ve never submitted anything, the timed competitions are the friendliest door.'},
 {id:'community',cats:['community'],title:'Community &amp; <em>Groups</em>',blurb:'Where Michigan filmmakers actually talk to each other. Crew calls, casting, meetups, and orgs.'},
 {id:'drone',cats:['drone'],title:'Drone &amp; <em>FPV</em>',blurb:'Sims, gear, shops, and training. This one got big enough that it became <a href="skybound.html">its own step-by-step page</a> : start there if you’re new.'}
];

var ALL=(typeof resources!=='undefined'?resources:[]);

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* A paid product may lead with a free tier in its pricing table. Showing
   "Paid" beside "$0" in the collapsed row is technically true and practically
   confusing, so paid entries advertise the first non-free tier instead. */
function summaryPrice(r){
  if(!r.pricing||!r.pricing.length)return '';
  if(!r.paid)return r.pricing[0].price||'';
  for(var i=0;i<r.pricing.length;i++){
    var price=r.pricing[i].price||'';
    if(!/^\s*(?:\$?0\b|free\b)/i.test(price))return price;
  }
  return '';
}

function socialsFor(r){
  var out=[];
  if(r.instagramUrl)out.push('<a href="'+esc(r.instagramUrl)+'" target="_blank" rel="noopener">Instagram</a>');
  if(r.youtubeUrl)out.push('<a href="'+esc(r.youtubeUrl)+'" target="_blank" rel="noopener">YouTube</a>');
  if(r.spotifyUrl)out.push('<a href="'+esc(r.spotifyUrl)+'" target="_blank" rel="noopener">Spotify</a>');
  if(r.facebookUrl)out.push('<a href="'+esc(r.facebookUrl)+'" target="_blank" rel="noopener">Facebook</a>');
  if(r.filmFreewayUrl)out.push('<a href="'+esc(r.filmFreewayUrl)+'" target="_blank" rel="noopener">FilmFreeway</a>');
  (r.extraLinks||[]).forEach(function(l){
    out.push('<a href="'+esc(l.url)+'" target="_blank" rel="noopener">'+esc(l.label)+' ↗</a>');
  });
  return out.length?'<span class="socials">'+out.join('')+'</span>':'';
}

function videoHTML(id,label){
  return '<div class="rv" data-video="'+esc(id)+'">'
    + '<button class="rv-btn" type="button" aria-label="Play: '+esc(label)+'">'
    +   '<img loading="lazy" decoding="async" alt="" width="480" height="360"'
    +     ' src="https://i.ytimg.com/vi/'+esc(id)+'/hqdefault.jpg">'
    +   '<span class="rv-play" aria-hidden="true"><svg viewBox="0 0 12 14"><path d="M0 0l12 7-12 7z"/></svg></span>'
    + '</button></div>';
}

function detailMediaHTML(media){
  if(!media||!media.src)return '';
  var image='<img loading="lazy" decoding="async" src="'+esc(media.src)+'" alt="'+esc(media.alt||'')+'">';
  if(media.url){
    var external=/^https?:\/\//i.test(media.url);
    image='<a href="'+esc(media.url)+'"'+(external?' target="_blank" rel="noopener"':'')+'>'+image+'</a>';
  }
  return '<figure class="d-media">'+image
    +(media.caption?'<figcaption>'+esc(media.caption)+'</figcaption>':'')
    +'</figure>';
}

function detailHTML(r){
  var out='',overview='';

  /* Why this one is in the LaB. Sits first because "we pay for this" is the
     most useful sentence on the page : everything else is a recommendation. */
  if(r.inLab) overview+='<p class="d-inlab"><b>In the LaB</b>'+esc(r.inLab)+'</p>';

  if(r.fullDesc && r.fullDesc!==r.desc){
    overview+='<div class="d-summary"><span class="d-lbl">Quick read</span>'
      +'<p class="d-body">'+esc(r.fullDesc)+'</p></div>';
  }

  if(r.keyInfo && r.keyInfo.length){
    overview+='<dl class="d-info">'+r.keyInfo.map(function(k){
      return '<div><dt>'+esc(k.label)+'</dt><dd>'+esc(k.value)+'</dd></div>';
    }).join('')+'</dl>';
  }

  if(overview||r.detailMedia){
    out+='<div class="d-overview'+(r.detailMedia?' has-media':'')+'">'
      +detailMediaHTML(r.detailMedia)
      +'<div class="d-overview-copy">'+overview+'</div></div>';
  }

  var vids=[];
  if(r.featuredVideo) vids.push(r.featuredVideo);
  (r.additionalVideos||[]).forEach(function(v){vids.push(v)});
  if(r.vimeoVideo) { /* vimeo handled by link only */ }
  if(vids.length) out+='<div class="d-vids">'+vids.map(function(v){return videoHTML(v,r.name)}).join('')+'</div>';

  if(r.pricing && r.pricing.length){
    out+='<div class="d-price"><span class="d-lbl">Pricing</span><table>'
      + r.pricing.map(function(p){
          return '<tr><th>'+esc(p.plan)+'</th><td>'+esc(p.price)+'</td></tr>';
        }).join('')
      + '</table></div>';
  }

  /* A link to the same video that is already embedded three inches above it is
     not "also worth knowing". Filtered by id rather than by label so it keeps
     working whatever a future entry calls it. */
  var links=(r.additionalLinks||[]).filter(function(l){
    if(!r.featuredVideo) return true;
    return String(l.url||'').indexOf(r.featuredVideo)<0;
  });
  if(links.length){
    out+='<div class="d-links"><span class="d-lbl">Also worth knowing</span>'
      + links.map(function(l){
          return '<a href="'+esc(l.url)+'" target="_blank" rel="noopener">'
            + '<strong>'+esc(l.label)+' ↗</strong>'
            + (l.description?'<span>'+esc(l.description)+'</span>':'')
            + '</a>';
        }).join('')
      + '</div>';
  }

  /* The summary row already shows the first three features. This used to print
     the WHOLE set again, so 106 of the 127 entries repeated their own tags the
     moment you opened them : which is what made an expanded row look like it
     had lost its place. Only the ones that didn't fit go here. */
  var rest=(r.features||[]).slice(3);
  if(rest.length){
    out+='<div class="d-feat">'+rest.map(function(f){
      return '<span class="tag">'+esc(f)+'</span>';
    }).join('')+'</div>';
  }

  return out;
}

var ITEM_RENDER_SEQ=0;
function itemHTML(r,i,isCopy){
  var n=String(i+1).padStart(2,'0');
  var tags='';
  if(isNew(r))tags+='<span class="tag fresh">New</span>';
  if(r.inLab)tags+='<span class="tag inlab">In the LaB</span>';
  var where = r.locationBadge || r.location;
  if(where) tags+='<span class="tag loc">'+esc(where)+'</span>';
  if(r.labPick)tags+='<span class="tag pick">★ LaB Pick</span>';
  /* People aren't free or paid : a cost tag on a collaborator reads like a price list */
  var isPerson = catsOf(r).indexOf('collaborators')>-1;
  if(!isPerson){
    tags+= r.paid?'<span class="tag paid">Paid</span>':'<span class="tag free">Free</span>';
    var price=summaryPrice(r);
    if(price)tags+='<span class="tag">'+esc(price)+'</span>';
  }
  (r.features||[]).slice(0,3).forEach(function(f){tags+='<span class="tag">'+esc(f)+'</span>'});

  var title=r.url
    ? '<a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+esc(r.name)+'</a>'
    : esc(r.name);

  var d=detailHTML(r);
  var bits=[];
  if(r.detailMedia) bits.push('Photo');
  if(r.keyInfo&&r.keyInfo.length) bits.push('Facts');
  if(r.featuredVideo||(r.additionalVideos||[]).length) bits.push('Video');
  if(r.pricing&&r.pricing.length) bits.push('Pricing');
  if(r.additionalLinks&&r.additionalLinks.length) bits.push('Links');
  var hint = bits.length ? bits.join(' · ') : 'Notes & context';
  /* In-the-LaB entries also appear in their normal group, so controls need a
     per-render id even though the resource's public anchor remains stable. */
  var detailId='detail-'+keyOf(r)+'-'+(++ITEM_RENDER_SEQ);
  /* More, Save and Visit are one action group. The old renderer put More in
     the copy column and the other two in an unstyled side span, which made
     More easy to miss and allowed Save / Visit to collide at narrow widths. */
  var more = d
    ? '<button class="item-more" type="button" aria-expanded="false" aria-controls="'+esc(detailId)+'">'
      +'<span><b aria-hidden="true">+</b> More details</span><small>'+esc(hint)+'</small></button>'
    : '';

  var publicAnchor=isCopy?'':' id="'+esc(keyOf(r))+'"';
  return '<div class="item"'+publicAnchor+(r.paid?' data-paid="1"':'')+' data-hay="'+esc((r.name+' '+(r.desc||'')+' '+(r.features||[]).join(' ')).toLowerCase())+'">'
    +'<span class="item-idx">'+n+'</span>'
    +'<div class="item-main"><h3>'+title+'</h3><p>'+esc(r.desc||'')+'</p>'
    +'<span class="item-tags">'+tags+'</span>'+socialsFor(r)
    +'<div class="item-actions'+(d?'':' no-more')+'">'+more
    +  '<button class="save" type="button" data-k="'+esc(keyOf(r))+'" aria-pressed="false"'
    +    ' aria-label="Save '+esc(r.name)+' to your kit">'
    +    '<span class="star" aria-hidden="true">☆</span><span class="save-t">Save</span></button>'
    +  (r.url?'<a class="item-visit" href="'+esc(r.url)+'" target="_blank" rel="noopener">Visit site ↗</a>'
             :'<span class="item-visit is-missing" aria-disabled="true">No site listed</span>')
    +'</div>'
    +(d?'<div class="d-panel" id="'+esc(detailId)+'" hidden>'+d
      +'<button class="d-close" type="button">Close details</button></div>':'')
    +'</div>'
    +'</div>';
}

/* Some entries carry multiple categories ("ai,coding"). Split them, then
   assign each resource to the FIRST matching group so nothing duplicates
   and nothing falls through. */

/* A saved kit needs a stable key per entry. Only 18 of the 127 entries carry
   an explicit id, but all 127 names are unique and slugify uniquely : so the
   key is derived rather than hand-authored, and no data file had to change.
   Derived from name, not array position, so reordering the list never
   invalidates somebody's saved kit or a link they already shared. */
/* An entry counts as new for 60 days after the date you added it. No date at
   all means not new : better than backfilling dates nobody can verify. Add
   `added: 'YYYY-MM-DD'` when you add a resource and the tag handles itself. */
var NEW_DAYS=60;
function isNew(r){
  if(!r.added) return false;
  var p=String(r.added).split('-');
  if(p.length!==3) return false;
  var when=new Date(+p[0],+p[1]-1,+p[2]);
  return (Date.now()-when.getTime())/86400000 <= NEW_DAYS;
}

function keyOf(r){
  return (r.id || String(r.name||'')).toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function catsOf(r){return String(r.category||'').split(',').map(function(s){return s.trim()}).filter(Boolean)}


/* ============================================================
   WHERE THINGS LIVE
   Splitting the notebook across three pages would quietly break
   the one thing search was for : finding anything from anywhere.
   So every page searches all 127 and anything that belongs to a
   band it does not own is listed separately, with a link to the
   page that has it. Declared once, here, because a lookup table
   duplicated per page is a lookup table that will disagree.
   ============================================================ */
var BAND_PAGE = {
  'band-learn':'learn.html',
  'band-make' :'resources.html',
  'band-gear' :'sourcing.html',
  'band-who'  :'people.html'
};
var BAND_LABEL = {
  'band-learn':'Watch & Learn',
  'band-make' :'Software & Assets',
  'band-gear' :'Gear & Flight',
  'band-who'  :'People & Community'
};
function pageOfGroup(gid){
  for(var i=0;i<BANDS.length;i++){
    if(BANDS[i].groups.indexOf(gid)>-1) return BANDS[i].id;
  }
  return BANDS[BANDS.length-1].id;
}
function groupOfEntry(r){
  var cs=catsOf(r);
  for(var i=0;i<GROUPS.length;i++){
    for(var j=0;j<cs.length;j++){
      if(GROUPS[i].cats.indexOf(cs[j])>-1) return GROUPS[i].id;
    }
  }
  return null;
}

(function render(){
  var wrapEl=document.getElementById('groups'),jump=document.getElementById('jumpNav'),total=0,html='',nav='',gi=0;
  var claimed=[];

  /* Order the groups band by band, and note which band each one opens, so the
     markup can be emitted in one pass while the band headers land in the right
     places. Anything not named by a band is appended to the last one. */
  var named={}, ordered=[], bandStart={};
  /* Only the bands this page owns. Unset means "all", which keeps the file
     usable on a single-page setup and makes the split opt-in rather than
     something that silently empties a page if PAGE_BANDS is forgotten. */
  var OWN = (window.PAGE_BANDS && window.PAGE_BANDS.length)
    ? BANDS.filter(function(b){ return window.PAGE_BANDS.indexOf(b.id)>-1 })
    : BANDS;

  OWN.forEach(function(b){
    b.groups.forEach(function(gid){
      var g=GROUPS.filter(function(x){return x.id===gid})[0];
      if(!g||named[gid])return;
      named[gid]=1;
      if(!bandStart[gid]) bandStart[gid]=b;
      ordered.push(g);
    });
  });
  /* A group named by no band would otherwise vanish. Only adopt orphans on the
     page that owns the last band, so an untagged group appears exactly once
     across the split rather than on all three pages. */
  var ownsLast = OWN.indexOf(BANDS[BANDS.length-1])>-1;
  if(ownsLast){
    GROUPS.forEach(function(g){
      if(named[g.id])return;
      var claimedByAnyBand = BANDS.some(function(b){ return b.groups.indexOf(g.id)>-1 });
      if(claimedByAnyBand)return;      /* belongs to another page */
      named[g.id]=1;
      ordered.push(g);
    });
  }

  var bandCounts={}, bandOf={}, bandTotals={};
  ordered.forEach(function(g){
    var b=bandStart[g.id]||OWN[OWN.length-1];
    bandOf[g.id]=b;
  });

  ordered.forEach(function(g){
    var list=ALL.filter(function(r){
      if(claimed.indexOf(r)>-1)return false;
      var cs=catsOf(r);
      for(var i=0;i<cs.length;i++){if(g.cats.indexOf(cs[i])>-1)return true}
      return false;
    });
    list.forEach(function(r){claimed.push(r)});
    if(!list.length)return;
    list.sort(function(a,b){return (b.labPick?1:0)-(a.labPick?1:0) || a.name.localeCompare(b.name)});
    total+=list.length;
    var b=bandOf[g.id];
    if(!bandCounts[b.id]){
      bandCounts[b.id]=1;
      html+='<div class="band wrap" id="'+b.id+'">'
         +'<div class="rule"><span class="mono band-t">'+b.title+'</span><i></i>'
         +'<span class="mono band-c" data-band="'+b.id+'"></span></div>'
         +'<p class="band-b">'+b.blurb+'</p></div>';
      nav+='<span class="jump-band">'+b.title.replace(/<[^>]+>/g,'')+'</span>';
    }
    bandTotals[b.id]=(bandTotals[b.id]||0)+list.length;
    nav+='<a href="#'+g.id+'">'+g.title.replace(/<[^>]+>/g,'')+' <span style="color:var(--faint)">'+list.length+'</span></a>';

    /* A few names in the closed state, so a collapsed section still
       advertises what's inside instead of being a blind door. */
    var peek=list.slice(0,4).map(function(r){return r.name}).join(' · ')
           + (list.length>4 ? ' · +'+(list.length-4)+' more' : '');

    html+='<section class="grp wrap" id="'+g.id+'">'
       +'<details class="grp-d">'
       +'<summary>'
       +  '<span class="g-n">'+String(++gi).padStart(2,'0')+'</span>'
       +  '<span class="g-main">'
       +    '<h2 class="g-title">'+g.title+'</h2>'
       +    '<span class="g-blurb">'+g.blurb+'</span>'
       +    '<span class="g-peek">'+peek+'</span>'
       +  '</span>'
       +  '<span class="g-count">'+list.length+'</span>'
       +  '<span class="g-ico" aria-hidden="true"></span>'
       +'</summary>'
       +'<div class="items">'+list.map(function(r,i){return itemHTML(r,i,false)}).join('')+'</div>'
       +'</details></section>';
  });
  wrapEl.innerHTML=html;
  if(jump)jump.innerHTML=nav;
  Object.keys(bandTotals).forEach(function(id){
    var el=wrapEl.querySelector('.band-c[data-band="'+id+'"]');
    if(el) el.textContent=bandTotals[id];
  });
  /* `claimed` is exactly what this page rendered, so "new" is counted from that
     rather than from ALL : otherwise a page could advertise a new entry that
     lives on one of the other two. And the count says "n of 127" so the slice
     is honest about being a slice. */
  var fresh=claimed.filter(isNew).length;
  var el=document.getElementById('totalCount');
  if(el) el.textContent = (total===ALL.length ? total+' entries'
                                             : total+' of '+ALL.length+' entries')
                        + (fresh?' · '+fresh+' new':'');
})();

/* ============================================================
   SAVING TO YOUR KIT
   The kit itself now lives on mykit.html. This page keeps the
   stars : saving belongs next to the thing you are saving : but
   no longer renders the list, which used to sit above the 127
   entries most people came here for.

   Keys come from keyOf(), derived from each name rather than its
   position, so adding or reordering entries never invalidates a
   saved kit or a link already out in the world.
   ============================================================ */
(function(){
  var KEY='lab-kit', SEP='.';
  var ptr=document.getElementById('kitPtr');

  function read(){ try{ var v=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(v)?v:[] }catch(e){ return [] } }
  function write(a){ try{ localStorage.setItem(KEY,JSON.stringify(a)) }catch(e){} }
  var kit=read();
  var byKey={}; ALL.forEach(function(r){ byKey[keyOf(r)]=r });

  /* Any #kit= link that predates the split still lands here. Forward it rather
     than drop it : the whole point of hashing keys by content was that a shared
     link keeps working, and it would be a poor joke to break them by moving the
     page they open. */
  (function forwardLegacy(){
    var m=/[#&]kit=([^&]+)/.exec(location.hash);
    if(!m)return;
    location.replace('mykit.html'+location.hash);
  })();

  function toast(msg){
    var t=document.querySelector('.kit-toast');
    if(!t){ t=document.createElement('div'); t.className='kit-toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
    t.textContent=msg; t.classList.add('on');
    clearTimeout(t._x); t._x=setTimeout(function(){ t.classList.remove('on') },2200);
  }

  function syncButtons(){
    document.querySelectorAll('.save').forEach(function(b){
      var on=kit.indexOf(b.dataset.k)>-1;
      b.setAttribute('aria-pressed',on?'true':'false');
      b.querySelector('.star').textContent=on?'\u2605':'\u2606';
      b.querySelector('.save-t').textContent=on?'Saved':'Save';
    });
  }

  function paintPtr(){
    kit=kit.filter(function(k){ return byKey[k] });
    write(kit);
    syncButtons();
    if(!ptr)return;
    if(!kit.length){ ptr.hidden=true; ptr.innerHTML=''; return; }
    ptr.hidden=false;
    ptr.innerHTML='<a class="kit-ptr" href="mykit.html">'
      +'<span class="kit-ptr-n">\u2605 '+kit.length+'</span>'
      +'<span>in your kit</span>'
      +'<span class="arw" aria-hidden="true">\u2192</span></a>';
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest && e.target.closest('.save');
    if(!b)return;
    var k=b.dataset.k, i=kit.indexOf(k);
    if(i>-1){ kit.splice(i,1); toast('Removed from your kit'); }
    else { kit.push(k); toast('Saved \u2014 '+kit.length+' in your kit'); }
    write(kit); paintPtr();
  });

  paintPtr();
})();

/* ============================================================
   IN THE LaB
   The tools money actually went on. Rendered from the `inLab`
   field rather than a hand-kept list, so it can never drift out
   of sync with the entries themselves : add `inLab: 'why'` to
   any resource and it appears here and badges itself.
   ============================================================ */
(function(){
  var sec=document.getElementById('inlab');
  if(!sec)return;   /* only the page that owns this band renders it */
  var list=ALL.filter(function(r){return r.inLab});
  if(!list.length){ sec.hidden=true; return; }

  sec.innerHTML =
    '<details class="grp-d" open>'
    +'<summary>'
    +  '<span class="g-n">✦</span>'
    +  '<span class="g-main">'
    +    '<h2 class="g-title">In the <em>LaB</em></h2>'
    +    '<span class="g-blurb">What we actually use or have purchased : not things tried once and dropped. '
    +      'Everything else on this page is a recommendation; these are the ones money went on.</span>'
    +  '</span>'
    +  '<span class="g-count">'+list.length+'</span>'
    +  '<span class="g-ico" aria-hidden="true"></span>'
    +'</summary>'
    +'<div class="items">'+list.map(function(r,i){return itemHTML(r,i,true)}).join('')+'</div>'
    +'<p class="lab-note">Short on purpose. A long list of things somebody claims to '
    +'pay for is not worth much.</p>'
    +'</details>';
})();

/* Video facades inside the detail panels.
   Delegated, so rows rendered/opened later still work.
   Nothing is requested from YouTube until someone presses play. */
document.addEventListener('click',function(e){
  var btn=e.target.closest && e.target.closest('.rv-btn');
  if(!btn)return;
  var box=btn.parentNode, id=box.getAttribute('data-video');
  if(!id)return;
  var f=document.createElement('iframe');
  f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';
  f.title=btn.getAttribute('aria-label')||'Video';
  f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  f.allowFullscreen=true;
  box.innerHTML='';box.appendChild(f);
});

/* Search. Sections are closed by default, so a match inside a closed
   section has to force it open : otherwise searching looks broken. */
(function(){
  var q=document.getElementById('q'),count=document.getElementById('count');
  if(!q)return;
  /* Pinned sections re-render the same entries, so counting them would report
     more matches than are actually on screen : and both sections hide while
     filtering anyway. Count the groups only. */
  var items=[].slice.call(document.querySelectorAll('#groups .item'));
  var secs=[].slice.call(document.querySelectorAll('.grp'));

  var freeBtn=document.getElementById('freeOnly');
  var freeOnly=false;

  /* Text and cost are two filters over one list, so they run in a single pass.
     A resource is shown when it matches the query AND passes the cost filter.
     "Free only" hides what is explicitly tagged Paid : collaborators carry no
     cost tag at all, so they stay; they are people, not a purchase. */
  function run(){
    var v=q.value.trim().toLowerCase();
    var filtering = !!v || freeOnly;

    var hits=0;
    items.forEach(function(el){
      var on = (!v || el.dataset.hay.indexOf(v)>-1)
            && (!freeOnly || el.dataset.paid!=='1');
      el.style.display = on ? '' : 'none';
      if(on) hits++;
    });

    secs.forEach(function(s){
      if(!filtering){                          // cleared : restore the collapsed menu
        s.style.display='';
        s.querySelector('details').open=false;
        return;
      }
      var found=s.querySelectorAll('.item:not([style*="none"])').length;
      s.style.display=found?'':'none';
      s.querySelector('details').open=!!found; // open only what matched
    });

    if(!filtering){
      count.textContent='';
      document.body.classList.remove('searching');
      return;
    }
    count.textContent = hits ? (hits+(hits===1?' match':' matches')) : 'No matches';
    document.body.classList.add('searching');
    elsewhere(v);
  }

  /* ---- Matches on the other two pages ----
     Search used to cover the whole notebook because the whole notebook was one
     page. Now it isn't, so a query is run against all 127 and anything that
     lives in a band this page does not own is listed here with a link to the
     page that has it. Without this, splitting the pages would have quietly
     turned one good search into three partial ones. */
  var offEl=null;
  function elsewhere(v){
    if(!offEl){
      offEl=document.createElement('div');
      offEl.className='off-page wrap';
      offEl.hidden=true;
      var host=document.getElementById('groups');
      if(host&&host.parentNode) host.parentNode.insertBefore(offEl,host.nextSibling);
    }
    if(!v){ offEl.hidden=true; offEl.innerHTML=''; return; }

    var mine={};
    (window.PAGE_BANDS||[]).forEach(function(b){ mine[b]=1 });
    var byBand={};
    ALL.forEach(function(r){
      var hay=(r.name+' '+(r.desc||'')+' '+(r.category||'')).toLowerCase();
      if(hay.indexOf(v)<0)return;
      var gid=groupOfEntry(r); if(!gid)return;
      var bid=pageOfGroup(gid);
      if(mine[bid])return;                 /* already shown above */
      (byBand[bid]=byBand[bid]||[]).push(r.name);
    });

    var ids=Object.keys(byBand);
    if(!ids.length){ offEl.hidden=true; offEl.innerHTML=''; return; }
    offEl.hidden=false;
    offEl.innerHTML='<p class="off-lead">Also on the rest of the notebook</p>'
      + ids.map(function(bid){
          var names=byBand[bid];
          return '<a class="off-row" href="'+BAND_PAGE[bid]+'?q='+encodeURIComponent(v)+'">'
            +'<span class="off-band">'+BAND_LABEL[bid]+'</span>'
            +'<span class="off-names">'+names.slice(0,4).map(esc).join(' · ')
            + (names.length>4?' · +'+(names.length-4)+' more':'')+'</span>'
            +'<span class="off-n">'+names.length+'</span></a>';
        }).join('');
  }

  /* Arriving with ?q= from one of those links runs the same search here. */
  (function fromQuery(){
    var m=/[?&]q=([^&]+)/.exec(location.search);
    if(!m)return;
    try{ q.value=decodeURIComponent(m[1]); }catch(e){ return }
    run();
    history.replaceState(null,'',location.pathname+location.hash);
  })();

  /* Resource detail controls : delegated, because rows are built at runtime.
     The toggle remains in the unified action bar while the full-width detail
     panel opens directly beneath it. */
  document.addEventListener('click',function(e){
    var more=e.target.closest && e.target.closest('.item-more');
    if(more){
      var panel=document.getElementById(more.getAttribute('aria-controls'));
      if(!panel)return;
      var opening=more.getAttribute('aria-expanded')!=='true';
      more.setAttribute('aria-expanded',String(opening));
      panel.hidden=!opening;
      var glyph=more.querySelector('b');
      if(glyph)glyph.textContent=opening?'\u2212':'+';
      return;
    }

    var close=e.target.closest && e.target.closest('.d-close');
    if(!close)return;
    var detail=close.closest('.d-panel');
    if(!detail)return;
    detail.hidden=true;
    var item=detail.closest('.item');
    var toggle=item&&item.querySelector('.item-more[aria-controls="'+detail.id+'"]');
    if(toggle){
      toggle.setAttribute('aria-expanded','false');
      var icon=toggle.querySelector('b');
      if(icon)icon.textContent='+';
      var top=toggle.getBoundingClientRect().top;
      if(top<0||top>window.innerHeight)toggle.scrollIntoView({block:'center'});
      toggle.focus();
    }
  });

  q.addEventListener('input',run);
  q.addEventListener('keydown',function(e){if(e.key==='Escape'){q.value='';run();q.blur()}});

  if(freeBtn){
    freeBtn.addEventListener('click',function(){
      freeOnly=!freeOnly;
      freeBtn.setAttribute('aria-pressed',String(freeOnly));
      run();
    });
  }

  /* "/" jumps to the search box from anywhere on the page : this list is long
     enough that reaching for the mouse is the slow part. Ignored while you're
     already typing somewhere, so it never eats a real slash. */
  document.addEventListener('keydown',function(e){
    if(e.key!=='/'||e.metaKey||e.ctrlKey||e.altKey)return;
    var t=e.target, tag=t&&t.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    e.preventDefault();
    q.focus(); q.select();
    q.scrollIntoView({block:'center',behavior:'smooth'});
  });
})();

/* Expand / collapse all */
(function(){
  var btn=document.getElementById('toggleAll');
  if(!btn)return;
  btn.addEventListener('click',function(){
    var ds=[].slice.call(document.querySelectorAll('.grp-d'));
    var anyClosed=ds.some(function(d){return !d.open});
    ds.forEach(function(d){d.open=anyClosed});
    btn.textContent=anyClosed?'Collapse all':'Expand all';
  });
})();

/* Landing on resources.html#drone should open that section and scroll to it */
(function(){
  function openHash(){
    var h=location.hash;if(!h||h.length<2)return;
    /* A hash is not necessarily a selector. #kit=a.b.c is a shared kit, and
       handing that to querySelector throws a SyntaxError : which killed this
       handler outright, so arriving on a deep link WITH a kit in the URL never
       opened the group it pointed at. Only continue if the hash is a plain id. */
    if(!/^#[A-Za-z][\w-]*$/.test(h))return;
    var sec=document.querySelector(h);if(!sec)return;
    var d=sec.querySelector('.grp-d');if(!d)return;
    d.open=true;
    requestAnimationFrame(function(){sec.scrollIntoView({block:'start'})});
  }
  window.addEventListener('load',openHash);
  window.addEventListener('hashchange',openHash);
  /* jump-nav clicks within the page */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('.jump a');
    if(!a)return;
    var sec=document.querySelector(a.getAttribute('href'));
    if(sec){var d=sec.querySelector('.grp-d'); if(d)d.open=true;}
  });
})();
