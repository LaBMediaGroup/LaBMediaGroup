// LaB Media — Easter Egg Entry Points
// Konami code: ↑↑↓↓←→←→BA → redirects to /ai-usage.html
// Type "crew", or click the beaker in THE LAB masthead five times → the Crew Room.
(function(){
  var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var CREW = 'https://crew.labmedia.work';
  var pos = 0, typed = '';
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('keydown', function(e){
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[pos]) {
      pos++;
      if (pos === KONAMI.length) {
        pos = 0;
        window.location.href = '/ai-usage.html';
      }
    } else {
      pos = (key === KONAMI[0]) ? 1 : 0;
    }
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (key.length === 1) {
      typed = (typed + key).slice(-4);
      if (typed === 'crew') toCrew();
    }
  });

  // The beaker sits in the middle of the THE LAB mark (the "A").
  var mark = document.querySelector('img.masthead');
  if (mark) {
    var clicks = [];
    mark.addEventListener('click', function(e){
      var r = mark.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      if (x < 0.42 || x > 0.72) return;
      var now = Date.now();
      clicks = clicks.filter(function(t){ return now - t < 2500; });
      clicks.push(now);
      bubble(r, clicks.length);
      if (clicks.length >= 5) { clicks = []; toCrew(r); }
    });
  }

  function bubble(r, n){
    if (calm) return;
    for (var i = 0; i < n * 2; i++) {
      var b = document.createElement('span');
      var size = 4 + Math.random() * 7;
      b.style.cssText = 'position:fixed;z-index:200;pointer-events:none;border-radius:50%;border:1.5px solid currentColor;opacity:.85;' +
        'width:' + size + 'px;height:' + size + 'px;left:' + (r.left + r.width * (0.53 + (Math.random() - .5) * .1)) + 'px;top:' + (r.top + r.height * .55) + 'px;' +
        'color:var(--accent,#E07A47);transition:transform ' + (700 + Math.random() * 600) + 'ms cubic-bezier(.2,.7,.3,1),opacity 900ms ease';
      document.body.appendChild(b);
      (function(el){
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          el.style.transform = 'translate(' + ((Math.random() - .5) * 40) + 'px,' + (-60 - Math.random() * 90) + 'px)';
          el.style.opacity = '0';
        }); });
        setTimeout(function(){ el.remove(); }, 1500);
      })(b);
    }
  }

  function toCrew(r){
    if (document.getElementById('crew-egg')) return;
    var t = document.createElement('div');
    t.id = 'crew-egg';
    t.setAttribute('role', 'status');
    t.textContent = 'Crew only. Opening the Crew Room…';
    t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:201;padding:10px 16px;border-radius:3px;' +
      'background:var(--accent,#E07A47);color:#140a05;font:500 13.5px/1.2 Inter,system-ui,sans-serif;box-shadow:0 12px 40px -10px rgba(0,0,0,.6)';
    document.body.appendChild(t);
    if (r) for (var k = 0; k < 3; k++) setTimeout(function(){ bubble(r, 6); }, k * 160);
    setTimeout(function(){ window.location.href = CREW; }, calm ? 300 : 1100);
  }
})();
