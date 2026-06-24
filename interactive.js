// ===== Shared interactive helpers for easy pages =====

// Accordion self-check (also used in ch2_easy)
document.addEventListener('click', function(e){
  const q = e.target.closest('.cp-q');
  if (q) q.classList.toggle('open');
  const fc = e.target.closest('.flip-card');
  if (fc) fc.classList.toggle('flipped');
});

// Scroll reveal (reuse .unit visibility like quiz.js, in case quiz.js absent)
(function(){
  const obs = new IntersectionObserver(es=>{
    es.forEach(x=>{ if(x.isIntersecting) x.target.classList.add('visible'); });
  }, {threshold:0, rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.unit').forEach(u=>obs.observe(u));
  setTimeout(()=>document.querySelectorAll('.unit:not(.visible)').forEach(u=>u.classList.add('visible')), 600);
})();

// ---- Ch1: rental prediction calculator ----
function initRentalCalc(){
  const h=document.getElementById('rc-hum'), t=document.getElementById('rc-temp'), w=document.getElementById('rc-wind');
  if(!h) return;
  // illustrative coefficients (teaching only)
  const B0=3000, Bh=-3100, Bt=70, Bw=-130;
  function upd(){
    const hv=+h.value, tv=+t.value, wv=+w.value;
    document.getElementById('rc-hum-v').textContent=hv.toFixed(2);
    document.getElementById('rc-temp-v').textContent=tv+'°';
    document.getElementById('rc-wind-v').textContent=wv+' mph';
    let pred=Math.round(B0 + Bh*hv + Bt*tv + Bw*wv);
    if(pred<0) pred=0;
    document.getElementById('rc-out').textContent=pred.toLocaleString();
  }
  [h,t,w].forEach(s=>s.addEventListener('input',upd)); upd();
}

// ---- Ch4: VIF calculator from R^2 ----
function initVifCalc(){
  const r=document.getElementById('vif-r2');
  if(!r) return;
  function upd(){
    const r2=+r.value;
    document.getElementById('vif-r2-v').textContent=r2.toFixed(2);
    const vif=1/(1-r2);
    const tol=1-r2;
    document.getElementById('vif-out').textContent=isFinite(vif)?vif.toFixed(2):'∞';
    document.getElementById('vif-tol').textContent=tol.toFixed(2);
    const v=document.getElementById('vif-verdict');
    if(vif>10){v.textContent='🚨 VIF > 10：深刻な多重共線性！';v.className='verdict bad';}
    else if(vif>5){v.textContent='⚠️ VIF > 5：共線性あり。対処すべき';v.className='verdict warn';}
    else{v.textContent='✅ VIF < 5：問題なし。残してOK';v.className='verdict good';}
  }
  r.addEventListener('input',upd); upd();
}

// ---- Ch5: curve vs line fit slider ----
function initCurveDemo(){
  const c=document.getElementById('cv-curve');
  if(!c) return;
  const path=document.getElementById('cv-fit');
  const label=document.getElementById('cv-label');
  function upd(){
    const amt=+c.value; // 0 = straight, 100 = full curve
    document.getElementById('cv-curve-v').textContent=amt+'%';
    // control point Y moves up as curve increases (parabola peak)
    const peakY = 150 - amt*1.0; // higher amt => smaller Y => taller arch
    path.setAttribute('d', `M70,150 Q270,${peakY} 470,150`);
    if(amt<25){label.textContent='ほぼ直線 → 山なりデータに合っていない 😟';label.className='verdict bad';}
    else if(amt<70){label.textContent='少し曲げた → だいぶ合ってきた 🙂';label.className='verdict warn';}
    else{label.textContent='しっかり曲げた → データにフィット！ 😄';label.className='verdict good';}
  }
  c.addEventListener('input',upd); upd();
}

// ---- Ch8: interaction slider (wind + rain) ----
function initInteractionDemo(){
  const wind=document.getElementById('ix-wind'), rain=document.getElementById('ix-rain');
  if(!wind) return;
  function upd(){
    const wv=+wind.value;            // 1..10 mph
    const rv=+rain.value;            // 0 clear,1 light,2 heavy
    document.getElementById('ix-wind-v').textContent=wv+' mph';
    document.getElementById('ix-rain-v').textContent=['晴れ','小雨','大雨'][rv];
    // base + wind effect + rain effect + INTERACTION (wind*rain makes it worse)
    let pred=5800 - 60*wv - 700*rv - 130*wv*rv;
    if(pred<0)pred=0;
    document.getElementById('ix-out').textContent=Math.round(pred).toLocaleString();
    // show interaction magnitude
    const inter=Math.round(130*wv*rv);
    document.getElementById('ix-inter').textContent='－'+inter.toLocaleString();
    const v=document.getElementById('ix-verdict');
    if(wv>=7&&rv>=2){v.textContent='💨🌧️ 強風×大雨のダブルパンチ！激減';v.className='verdict bad';}
    else if(wv>=7||rv>=2){v.textContent='⚠️ どちらか悪い → そこそこ減る';v.className='verdict warn';}
    else{v.textContent='✅ 穏やかな日 → よく借りられる';v.className='verdict good';}
  }
  [wind,rain].forEach(s=>s.addEventListener('input',upd)); upd();
}

// ---- Ch9/10: stepwise selection animation ----
function initStepwise(mode){
  // mode: 'forward' or 'backward'
  const box=document.getElementById('sw-box');
  if(!box) return;
  const all=['気温','湿度','real_feel','date','湿度²','風速','曜日'];
  let step=0;
  const order = (mode==='forward')
    ? [['気温'],['気温','湿度'],['気温','湿度','date'],['気温','湿度','date','湿度²']]
    : [all.slice(),all.slice(0,6),all.slice(0,5),['気温','湿度','date','湿度²']];
  const aics=(mode==='forward')?[10000,9700,9500,9400,9367]:[9160,9120,9090,9380];
  function render(){
    const cur = step===0 ? (mode==='forward'?[]:all.slice()) : order[step-1];
    box.innerHTML = all.map(v=>{
      const inn = cur.includes(v);
      return `<span style="display:inline-block;margin:.2rem;padding:.4rem .8rem;border-radius:20px;font-size:.82rem;font-weight:700;
        background:${inn?'var(--green-light)':'#f1f5f9'};color:${inn?'#065f46':'#94a3b8'};
        border:1.5px solid ${inn?'var(--green)':'var(--border)'};">${inn?'✓ ':'· '}${v}</span>`;
    }).join('');
    document.getElementById('sw-aic').textContent = (step===0?aics[0]:aics[Math.min(step,aics.length-1)]).toLocaleString();
    document.getElementById('sw-caption').textContent =
      step===0 ? (mode==='forward'?'スタート：空モデル（予測変数なし）':'スタート：全部入りモデル')
      : step>=order.length ? '停止：これ以上'+(mode==='forward'?'足しても':'削っても')+'AICが下がらない！完成 🎉'
      : (mode==='forward'?'AICが一番下がる変数を1つ追加':'最も非有意な変数を1つ削除');
  }
  document.getElementById('sw-next').addEventListener('click',()=>{ if(step<order.length){step++;render();} updateBtns();});
  document.getElementById('sw-reset').addEventListener('click',()=>{ step=0;render();updateBtns();});
  function updateBtns(){ document.getElementById('sw-next').disabled = step>=order.length; }
  render(); updateBtns();
}
