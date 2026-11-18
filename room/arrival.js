(() => {
  const value = new URLSearchParams(location.search).get('aperture');
  if (!value || matchMedia('(prefers-reduced-motion: reduce)').matches || !document.body.animate) return;
  const [left,top,width,height] = value.split(',').map(Number);
  if (![left,top,width,height].every(Number.isFinite)) return;
  const flask = [[.46,.07],[.60,.07],[.60,.33],[.71,.84],[.68,.95],[.39,.95],[.36,.84],[.46,.33]];
  const points = flask.map(([x,y]) => (left+x*width)+'px '+(top+y*height)+'px');
  document.documentElement.animate([
    {clipPath:'polygon('+points.join(',')+')'},
    {clipPath:'polygon(0% 0%,100% 0%,100% 32%,100% 85%,100% 100%,0% 100%,0% 85%,0% 32%)'}
  ], {duration:580,easing:'cubic-bezier(.19,.76,.24,1)'});
})();
