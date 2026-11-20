(() => {
  const links = [...document.querySelectorAll('.instrument-link:not(.story),.bench .tool:not(#story) .tool-go')];
  if (!links.length || !window.HTMLDialogElement) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'tool-tray';
  dialog.setAttribute('aria-labelledby','tray-title');
  dialog.innerHTML = '<div class="tray-bar"><strong id="tray-title"></strong><button type="button" aria-label="Close tool">×</button></div><iframe title="Tool"></iframe>';
  document.body.append(dialog);
  const frame = dialog.querySelector('iframe');
  const close = dialog.querySelector('button');
  const title = dialog.querySelector('strong');
  let active;
  function show(link) {
    active = link;
    const box = link.getBoundingClientRect();
    title.textContent = link.closest('article')?.querySelector('h2')?.textContent || link.textContent.trim();
    frame.title = title.textContent;
    if (!dialog.open) dialog.showModal();
    const end = dialog.getBoundingClientRect();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && dialog.animate) {
      dialog.animate([
        {transformOrigin:'0 0',transform:'translate('+(box.left-end.left)+'px,'+(box.top-end.top)+'px) scale('+box.width/end.width+','+box.height/end.height+')',borderRadius:'4px'},
        {transformOrigin:'0 0',transform:'none'}
      ],{duration:320,easing:'cubic-bezier(.22,.76,.24,1)'});
    }
    frame.contentWindow.location.replace(link.href);
    close.focus({preventScroll:true});
  }
  function dismiss() {
    if (!dialog.open) return;
    dialog.close();
    frame.contentWindow.location.replace('about:blank');
    requestAnimationFrame(() => { if (!dialog.open) active?.focus({preventScroll:true}); });
  }
  frame.addEventListener('load',() => {
    let doc;
    try {doc=frame.contentDocument;} catch {return;}
    if (!doc?.body.dataset.instrument) return;
    const style=doc.createElement('style');
    style.textContent='body[data-instrument]{padding-bottom:12px}body>header.nav,.instrument-dock,.lab-chat,body>footer{display:none!important}html{scroll-padding-top:12px}';
    doc.head.append(style);
    const anchor=doc.getElementById(frame.contentWindow.location.hash.slice(1));
    anchor?.scrollIntoView({block:'start',behavior:'instant'});
    doc.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();requestClose();}});
  });
  function requestClose() { if(history.state?.tray) history.back(); else dismiss(); }
  close.onclick=requestClose;
  dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
  dialog.addEventListener('click',e=>{if(e.target===dialog) requestClose();});
  for(const link of links) link.addEventListener('click',e=>{
    if(e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    history.pushState({tray:link.pathname},'', '#tool-'+link.pathname.split('/').pop().split('.')[0]);
    show(link);
  });
  function restore(){
    const link=links.find(item=>'#tool-'+item.pathname.split('/').pop().split('.')[0]===location.hash);
    if(link) show(link); else dismiss();
  }
  addEventListener('popstate',restore);
  restore();
})();
