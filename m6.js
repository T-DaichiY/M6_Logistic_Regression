/* =====================================================================
   M5 重回帰分析 完全ガイド — 共有インタラクティブ helpers (M6 style)
   ===================================================================== */

/* ---------- reveal on scroll ---------- */
(function(){
  function run(){
    var els = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in');});return;}
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    },{threshold:.12});
    els.forEach(function(e){io.observe(e);});
  }
  if(document.readyState!=='loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();

/* ---------- journey: light up .jbox sequentially ---------- */
function resetJourney(id){
  document.querySelectorAll('#'+id+' .jbox').forEach(function(b){b.classList.remove('on');});
}
function playJourney(id){
  resetJourney(id);
  var b = document.querySelectorAll('#'+id+' .jbox');
  b.forEach(function(x,i){ setTimeout(function(){ x.classList.add('on'); }, i*650); });
}

/* ---------- slider fill helper ---------- */
function setFill(input, min, max){
  var pct = (input.value - min)/(max - min)*100;
  input.style.setProperty('--fill', pct + '%');
}

/* ---------- quiz builder ----------
   buildQuiz('quizId', [ {q:'...', opts:[{t:'..',ok:true},...], exp:'..'}, ... ])
   英語の問題文・選択肢、日本語の解説に対応。クリックで正誤＋解説を表示。 */
function buildQuiz(containerId, data){
  var box = document.getElementById(containerId);
  if(!box) return;
  data.forEach(function(item, qi){
    var q = document.createElement('div'); q.className = 'q';
    var html = '<div class="qh"><span class="qn">Q'+(qi+1)+'.</span>'+item.q+'</div>';
    item.opts.forEach(function(o, oi){
      var L = String.fromCharCode(65+oi);
      html += '<button class="opt" data-ok="'+(o.ok?'true':'false')+'" data-q="'+qi+'">'
            + '<span class="ol">'+L+'</span>'+o.t+'</button>';
    });
    html += '<div class="qexp" id="'+containerId+'-exp-'+qi+'"><b>解説：</b>'+item.exp+'</div>';
    q.innerHTML = html;
    box.appendChild(q);
  });
  box.addEventListener('click', function(e){
    var btn = e.target.closest('.opt');
    if(!btn || btn.classList.contains('disabled')) return;
    var qi = btn.dataset.q;
    box.querySelectorAll('.opt[data-q="'+qi+'"]').forEach(function(s){
      s.classList.add('disabled');
      if(s.dataset.ok==='true') s.classList.add('correct');
    });
    if(btn.dataset.ok!=='true') btn.classList.add('wrong');
    document.getElementById(containerId+'-exp-'+qi).classList.add('show');
  });
}

/* ---------- tiny SVG helper ---------- */
var SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs){
  var e = document.createElementNS(SVGNS, tag);
  for(var k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
