// Hendelser fra forrige runde: pop-up etter hver tur og listen i Rapport
/* ---------- hendelser fra forrige runde ---------- */
function evMine(e){return e.k==='fight'?(e.a===0||e.d===0):e.k==='infl'?e.f===0:(e.f===0||e.prev===0||e.hq===0)}
function evAll(){return ((S.events&&S.events.list)||[]).filter(e=>evMine(e)||e.seen!==false)}
function evList(){const l=evAll();return ui.revAll?l:l.filter(evMine)}
function evLabel(e){return e.k==='fight'?t('Kamp'):e.k==='infl'?t('Påvirkning'):t('Overtakelse')}
function evColor(e){return FAM[e.k==='fight'?e.a:e.f].c}
function evText(e){
  if(e.k==='fight'){
    let s=t(e.won?'{a} ({af}) angrep {d} ({df}) og vant.':'{a} ({af}) angrep {d} ({df}) og tapte.',{a:e.an,af:fn(e.a),d:e.dn,df:fn(e.d)});
    if(e.dead.length)s+=' '+t('{n} havnet i elva.',{n:e.dead.join(t(' og '))});
    return s;
  }
  if(e.k==='infl')return t('{g} fikk {b} til å betale {f}. +${v} i måneden.',{g:e.gn,b:lc(BK[e.bk].n),f:fn(e.f),v:BK[e.bk].v});
  const ty=lc(TYPES[blk(e.x,e.y).t].n);
  let s=e.prev>=0?t('{g} tok kvartalet ({ty}) for {f} fra {p}.',{g:e.gn,ty,f:fn(e.f),p:fn(e.prev)}):t('{g} tok kvartalet ({ty}) for {f}.',{g:e.gn,ty,f:fn(e.f)});
  if(e.hq>=0)s+=' '+t('Hovedkvarteret til {f} har falt!',{f:fn(e.hq)});
  return s;
}
// Pop-up med rundens hendelser. Alle kamper i samme kvartal vises som ett slag.
function popItems(){const seen=new Set();return evList().filter(e=>{if(e.k!=='fight'||e.aid==null)return true;const k=e.x+','+e.y;if(seen.has(k))return false;seen.add(k);return true})}
let popIdx=0, popTimer=0, popRaf=0;
let EVENT_POPUP=true;
try{EVENT_POPUP=localStorage.getItem('forbudstid-kamppopup')!=='av'}catch(e){}
// target: et tall (plass i listen) eller en hendelse
function openEvents(target=0){
  const l=popItems(); if(!l.length&&!S.events)return false;
  let i=typeof target==='number'?target:0;
  if(target&&typeof target==='object'){const j=l.findIndex(o=>o===target||(o.k==='fight'&&target.k==='fight'&&o.x===target.x&&o.y===target.y));if(j>=0)i=j}
  document.getElementById('evPop').hidden=false;
  document.getElementById('bigAuto').checked=EVENT_POPUP;
  playEvent(i); return true;
}
function playEvent(i){
  clearTimeout(popTimer); cancelAnimationFrame(popRaf);
  const l=popItems(), all=evAll(), n=l.length;
  document.getElementById('evFilter').innerHTML=`<button data-v="0" class="${!ui.revAll?'on':''}">${t('Mine')} (${all.filter(evMine).length})</button><button data-v="1" class="${ui.revAll?'on':''}">${t('Alle')} (${all.length})</button>`;
  const prev=document.getElementById('evPrev'), next=document.getElementById('evNext'), rep=document.getElementById('evReplay');
  if(!n){
    document.getElementById('evTitle').textContent=t('Forrige runde'); document.getElementById('evCount').textContent=S.events?dateOf(S.events.t):'';
    document.getElementById('evText').innerHTML=t('Ingen hendelser som gjelder deg. Velg «Alle» for å se hva rivalene gjorde.');
    prev.disabled=next.disabled=true; rep.classList.add('inv'); drawStill(null,'stageBigCv'); return;
  }
  popIdx=clamp(i,0,n-1); const e=l[popIdx];
  const fight=e.k==='fight'&&e.aid!=null, bt=fight?buildBattle(e):null;
  document.getElementById('evTitle').textContent=t('{w} i {co}',{w:fight?(bt.ex.length>1?t('Slag'):t('Kamp')):evLabel(e),co:CO(e.x,e.y)});
  document.getElementById('evCount').textContent=t('{i} av {n}',{i:popIdx+1,n})+` · ${dateOf(S.events.t)}`;
  document.getElementById('evText').innerHTML=fight?bt.ex.map(evText).join('<br>'):evText(e);
  prev.disabled=popIdx===0; next.disabled=popIdx===n-1; rep.classList.toggle('inv',!fight);
  const auto=()=>{if(popIdx<n-1)popTimer=setTimeout(()=>playEvent(popIdx+1),fight?900:2800)}; // går videre av seg selv
  if(!fight){drawStill(e,'stageBigCv');auto();return}
  const c=stageCtx('stageBigCv'), END=fightEnd(e), still=matchMedia('(prefers-reduced-motion: reduce)').matches, t0=performance.now();
  const loop=now=>{const t=still?END:now-t0; drawFight(c,e,t); if(t<END)popRaf=requestAnimationFrame(loop); else auto()};
  popRaf=requestAnimationFrame(loop);
  if(!still)fightSfx(bt);
}
function closeEvents(){clearTimeout(popTimer);cancelAnimationFrame(popRaf);document.getElementById('evPop').hidden=true;if(sfxStage){try{sfxStage.disconnect()}catch(x){}sfxStage=null}}
