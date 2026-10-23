// Hendelser fra forrige runde: pop-up etter hver tur og listen i Rapport
/* ---------- hendelser fra forrige runde ---------- */
function evMine(e){return e.k==='fight'?(e.a===0||e.d===0):e.k==='infl'?e.f===0:(e.f===0||e.prev===0||e.hq===0)}
function evAll(){return ((S.events&&S.events.list)||[]).filter(e=>evMine(e)||e.seen!==false)}
function evList(){const l=evAll();return ui.revAll?l:l.filter(evMine)}
function evLabel(e){return e.k==='fight'?'Kamp':e.k==='infl'?'Påvirkning':'Overtakelse'}
function evColor(e){return FAM[e.k==='fight'?e.a:e.f].c}
function evText(e){
  if(e.k==='fight'){
    let t=`${e.an} (${fn(e.a)}) angrep ${e.dn} (${fn(e.d)}) og ${e.won?'vant':'tapte'}.`;
    if(e.dead.length)t+=` ${e.dead.join(' og ')} havnet i elva.`;
    return t;
  }
  if(e.k==='infl')return `${e.gn} fikk ${BK[e.bk].n.toLowerCase()} til å betale ${fn(e.f)}. +$${BK[e.bk].v} i måneden.`;
  let t=`${e.gn} tok kvartalet (${TYPES[blk(e.x,e.y).t].n.toLowerCase()}) for ${fn(e.f)}${e.prev>=0?' fra '+fn(e.prev):''}.`;
  if(e.hq>=0)t+=` Hovedkvarteret til ${fn(e.hq)} har falt!`;
  return t;
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
  document.getElementById('evFilter').innerHTML=`<button data-v="0" class="${!ui.revAll?'on':''}">Mine (${all.filter(evMine).length})</button><button data-v="1" class="${ui.revAll?'on':''}">Alle (${all.length})</button>`;
  const prev=document.getElementById('evPrev'), next=document.getElementById('evNext'), rep=document.getElementById('evReplay');
  if(!n){
    document.getElementById('evTitle').textContent='Forrige runde'; document.getElementById('evCount').textContent=S.events?dateOf(S.events.t):'';
    document.getElementById('evText').innerHTML='Ingen hendelser som gjelder deg. Velg «Alle» for å se hva rivalene gjorde.';
    prev.disabled=next.disabled=true; rep.classList.add('inv'); drawStill(null,'stageBigCv'); return;
  }
  popIdx=clamp(i,0,n-1); const e=l[popIdx];
  const fight=e.k==='fight'&&e.aid!=null, bt=fight?buildBattle(e):null;
  document.getElementById('evTitle').textContent=fight?`${bt.ex.length>1?'Slag':'Kamp'} i ${CO(e.x,e.y)}`:`${evLabel(e)} i ${CO(e.x,e.y)}`;
  document.getElementById('evCount').textContent=`${popIdx+1} av ${n} · ${dateOf(S.events.t)}`;
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
