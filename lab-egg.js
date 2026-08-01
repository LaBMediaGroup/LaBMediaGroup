// LaB Media — Easter Egg Entry Points
// Konami code: ↑↑↓↓←→←→BA → redirects to /ai-usage.html
(function(){
  var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var pos = 0;
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
  });
})();
