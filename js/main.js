// Knapper, klikk og oppstart av spillet. Lastes sist.
/* ---------- hendelser ---------- */
document.getElementById('board').addEventListener('click',e=>{
  const t=e.target.closest('.tile'); if(!t)return;
  tileSwish();
  const x=+t.dataset.x, y=+t.dataset.y;
  if(ui.moving){
    const ms=movers(), g=ms[0];
    if(g&&nbrs(g.x,g.y).some(b=>b.x===x&&b.y===y)){ms.forEach(m=>{m.order='move';m.tx=x;m.ty=y});ui.moving=null;save();render();return}
    ui.moving=null;
  }
  if(!ui.sel||ui.sel[0]!==x||ui.sel[1]!==y)ui.unpick=[];
  ui.sel=[x,y]; ui.tab='kvartal'; render();
});
document.getElementById('pane').addEventListener('click',e=>{
  const t=e.target.closest('[data-a]'); if(!t)return;
  const a=t.dataset.a;
  if(a==='order'){
    const g=S.gangs.find(o=>o.id===+t.dataset.id); if(!g)return;
    if(t.dataset.o==='move'){ui.moving=[g.id]}else{g.order=t.dataset.o;ui.moving=null;if(g.order==='infl')g.tgt=+t.dataset.t}
  }
  if(a==='pick'){const id=+t.dataset.id, u=ui.unpick||[];ui.unpick=u.includes(id)?u.filter(i=>i!==id):[...u,id]}
  if(a==='pickall')ui.unpick=[];
  if(a==='shop')ui.shop=ui.shop===+t.dataset.id?null:+t.dataset.id;
  if(a==='buy'){const g=S.gangs.find(o=>o.id===+t.dataset.id);if(g&&buyWeapon(0,g,t.dataset.w))ui.shop=null}
  if(a==='gorder'){
    const sel=groupSel(), o=t.dataset.o;
    if(o==='move')ui.moving=sel.map(g=>g.id);
    else if(o==='infl'){
      // fordel bandene på bygningene som ikke betaler ennå, de letteste først
      const b=blk(...ui.sel), open=b.bld.map((x,i)=>i).filter(i=>b.bld[i].by!==0);
      sel.forEach((g,n)=>{const order=open.slice().sort((a,z)=>inflTurns(g,b,a)-inflTurns(g,b,z));g.order='infl';g.tgt=order[n%order.length]});
      ui.moving=null;
    }
    else{sel.forEach(g=>{if(o==='take'&&blk(g.x,g.y).owner===0)return;g.order=o});ui.moving=null}
  }
  if(a==='ev'){openEvents(evList()[+t.dataset.i]);return}
  if(a==='evall'){openEvents(0);return}
  if(a==='revf'){ui.revAll=t.dataset.v==='1';render();return}
  if(a==='cancel')ui.moving=null;
  if(a==='hire')hire(0,+t.dataset.id);
  if(a==='goto'){ui.sel=[+t.dataset.x,+t.dataset.y];ui.tab='kvartal';ui.unpick=[]}
  save(); render();
});
document.getElementById('tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b){ui.tab=b.dataset.tab;render()}});
// pop-up med rundens hendelser
document.getElementById('evPrev').onclick=()=>playEvent(popIdx-1);
document.getElementById('evNext').onclick=()=>playEvent(popIdx+1);
document.getElementById('evReplay').onclick=()=>playEvent(popIdx);
document.getElementById('evClose').onclick=closeEvents;
document.getElementById('evFilter').addEventListener('click',e=>{const b=e.target.closest('button');if(b){ui.revAll=b.dataset.v==='1';playEvent(0);render()}});
document.getElementById('bigAuto').addEventListener('change',e=>{EVENT_POPUP=e.target.checked;try{localStorage.setItem('forbudstid-kamppopup',EVENT_POPUP?'på':'av')}catch(x){}});
document.getElementById('evPop').addEventListener('click',e=>{if(e.target.id==='evPop')closeEvents()});
document.addEventListener('keydown',e=>{
  if(!document.getElementById('ending').hidden){if(e.key==='Escape'){if(!document.getElementById('endSkip').hidden)document.getElementById('endSkip').click();else hideEnding()}return}
  if(document.getElementById('evPop').hidden)return;
  if(e.key==='Escape')closeEvents();
  if(e.key==='ArrowRight'&&!document.getElementById('evNext').disabled)playEvent(popIdx+1);
  if(e.key==='ArrowLeft'&&!document.getElementById('evPrev').disabled)playEvent(popIdx-1);
});
document.getElementById('endBtn').onclick=endTurn;
document.getElementById('legend').addEventListener('click',e=>{if(e.target.closest('[data-a="gfx"]'))setGfx(GFX==='noir'?'klassisk':'noir')});


document.getElementById('stats').addEventListener('click',e=>{if(e.target.closest('#needBtn'))nextNeed();if(e.target.closest('[data-a="ledger"]')){ui.tab='logg';render()}});

document.getElementById('rulesBtn').onclick=()=>document.getElementById('rules').hidden=false;
document.getElementById('rulesClose').onclick=()=>document.getElementById('rules').hidden=true;
document.getElementById('endNew').onclick=()=>{hideEnding();endingShown=false;newGame()};
document.getElementById('endMap').onclick=hideEnding;
let confirmNew=false;
document.getElementById('newBtn').onclick=e=>{
  if(!confirmNew){confirmNew=true;e.target.textContent='Sikker? Trykk igjen';setTimeout(()=>{confirmNew=false;e.target.textContent='Nytt spill'},3000);return}
  confirmNew=false;e.target.textContent='Nytt spill';newGame();
};

if(window.ResizeObserver)new ResizeObserver(()=>drawCity()).observe(document.querySelector('.map'));
// forhåndsvisning av avslutningen: legg til #seier eller #tap i adressen
if(location.hash==='#seier'||location.hash==='#tap')setTimeout(()=>showEnding(location.hash==='#seier'),300);
if(load()){ui.sel=[...HQS[0]];render()}
else{newGame();document.getElementById('rules').hidden=false}
