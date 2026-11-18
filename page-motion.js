// Give section headings one short entrance as the reader reaches them.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  if (!('IntersectionObserver' in window)) return;
  const running = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (quiet() || !entry.target.animate) continue;
      const animation = entry.target.animate([
        {opacity:.45, transform:'translateY(.5em)', clipPath:'inset(0 0 38% 0)'},
        {opacity:1, transform:'translateY(0)', clipPath:'inset(0)'}
      ],{duration:520,easing:'cubic-bezier(.16,1,.3,1)'});
      running.add(animation);
      animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
    }
  },{threshold:.2});
  document.querySelectorAll('main h2,section h2,article h2').forEach(heading=>observer.observe(heading));
  function stop(){if(quiet()) for(const animation of running) animation.cancel();}
  reduced.addEventListener('change',stop);
  document.addEventListener('lab-motion-change',stop);
})();
