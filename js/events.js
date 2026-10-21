// Hendelser fra forrige runde og hendelsesfeltet nederst
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
function goEv(i){
  ui.rev=i; ui.dockMin=false; render();
  const e=evList()[i]; if(!e)return;
  document.querySelector('.evrow.on')?.scrollIntoView({block:'nearest'});
}
// Hendelseslisten ligger fast nederst på skjermen og stenger ikke for resten av spillet.
function renderRev(){
  const dock=document.getElementById('dock'), all=evAll(), l=evList();
  if(!all.length){dock.hidden=true;updateStage(null);document.body.style.paddingBottom='';return}
  dock.hidden=false;
  dock.classList.toggle('min',!!ui.dockMin);
  document.getElementById('dockMin').textContent=ui.dockMin?'Vis':'Skjul';
  document.getElementById('revFilter').innerHTML=`<button data-a="revf" data-v="0" class="${!ui.revAll?'on':''}">Mine (${all.filter(evMine).length})</button><button data-a="revf" data-v="1" class="${ui.revAll?'on':''}">Alle (${all.length})</button>`;
  if(ui.rev==null&&l.length)ui.rev=0;
  const e=l.length?l[ui.rev=clamp(ui.rev,0,l.length-1)]:null;
  document.getElementById('revTitle').textContent=e?`${evLabel(e)} i ${CO(e.x,e.y)}`:'Forrige runde';
  document.getElementById('revCount').textContent=(e?`${ui.rev+1} av ${l.length} · `:'')+dateOf(S.events.t);
  document.getElementById('revText').innerHTML=e?evText(e):'Ingen hendelser som gjelder deg. Velg «Alle» for å se hva rivalene gjorde.';
  document.getElementById('revPrev').disabled=!e||ui.rev===0;
  document.getElementById('revNext').disabled=!e||ui.rev===l.length-1;
  const fight=!!(e&&e.k==='fight'&&e.aid!=null);
  const rp=document.getElementById('stageReplay'); rp.hidden=!!ui.dockMin; rp.classList.toggle('inv',!fight);
  if(ui.dockMin)updateStage(null);
  else if(fight)updateStage(e);
  else{updateStage(null);drawStill(e)}
  document.body.style.paddingBottom=(dock.offsetHeight+16)+'px';
}
