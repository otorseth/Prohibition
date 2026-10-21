// Visning: toppfelt, kart-ruter, sidepanel og bandekort
/* ---------- visning ---------- */
function render(){
  const e=econ(0);
  document.getElementById('date').textContent=dateOf(S.turn);
  document.getElementById('stats').innerHTML=`
    <div class="stat"><small>Kasse</small><b>$${S.money[0]}</b></div>
    <div class="stat"><small>Netto per måned</small><b style="color:${e.net<0?'var(--blood)':'var(--ok)'}">${e.net>=0?'+':''}$${e.net}</b></div>
    <div class="stat"><small>Kvartaler</small><b>${owned(0)} / 64</b></div>
    <div class="stat"><small>Bander</small><b>${mine(0).length}</b></div>
    <button class="stat needbtn ${needTiles().length?'on':''}" id="needBtn" title="Gå til neste rute med bander uten ordre"><small>Uten ordre</small><b>${mine(0).filter(g=>g.order==='none').length}${needTiles().length?' →':''}</b></button>`;
  renderBoard(); drawCity(); renderLegend(); renderPane(); renderRev();
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===ui.tab));
  document.getElementById('endBtn').disabled=!!S.over;
  const ov=document.getElementById('over');
  if(S.over){ov.hidden=false;document.getElementById('overTitle').textContent=S.over.win?'Byen er din':'Spillet er over';document.getElementById('overText').textContent=S.over.text}
  else ov.hidden=true;
}
function needTiles(){
  const s=new Set(mine(0).filter(g=>g.order==='none').map(g=>g.y*N+g.x));
  return [...s].sort((a,b)=>a-b);
}
function nextNeed(){
  const l=needTiles(); if(!l.length)return;
  const cur=ui.sel?ui.sel[1]*N+ui.sel[0]:-1;
  const k=l.find(i=>i>cur)??l[0];
  ui.sel=[k%N,Math.floor(k/N)]; ui.tab='kvartal'; ui.moving=null; render();
  document.querySelector(`.tile[data-x="${k%N}"][data-y="${Math.floor(k/N)}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'});
}
function renderBoard(){
  const need=new Set(needTiles());
  const mv=movers()[0]||null;
  const can=mv?nbrs(mv.x,mv.y).map(b=>b.x+','+b.y):[];
  const dests=new Set(mine(0).filter(g=>g.order==='move').map(g=>g.tx+','+g.ty));
  const rv=ui.rev!=null&&!ui.dockMin&&S.events?evList():null, cur=rv&&rv[ui.rev], evAt={};
  if(rv)rv.forEach((e,i)=>{(evAt[e.x+','+e.y]=evAt[e.x+','+e.y]||[]).push(i)});
  // «PANG!» og risting spilles bare når du blar til en ny hendelse, ikke ved hvert klikk
  const bk=cur?[S.events.t,ui.rev,!!ui.revAll].join('|'):'', fresh=bk&&bk!==lastBang; lastBang=bk;
  let h='';
  for(const b of S.blocks){
    const k=b.x+','+b.y, gs=gangsAt(b.x,b.y);
    const here=cur&&cur.x===b.x&&cur.y===b.y, ev=evAt[k];
    const cls=['tile',b.owner<0?'free':'',ui.sel&&ui.sel[0]===b.x&&ui.sel[1]===b.y?'sel':'',can.includes(k)?'can':'',dests.has(k)?'dest':'',here?'hit':'',here&&fresh?'shake':'',need.has(b.y*N+b.x)?'need':''].join(' ');
    const badge=ev?`<span class="evn ${ev.includes(ui.rev)?'cur':''}">${here?ui.rev+1:ev[0]+1}${ev.length>1?'+':''}</span>`:'';
    const bang=here&&fresh?`<span class="bang">${cur.k==='fight'?'PANG!':cur.k==='infl'?'$$$':'TATT!'}</span>`:'';
    h+=`<button class="${cls}" data-x="${b.x}" data-y="${b.y}" style="${b.owner>=0?'--fc:'+FAM[b.owner].c+';':''}${here?'--hc:'+evColor(cur):''}"
      title="${CO(b.x,b.y)} · ${TYPES[b.t].n}${b.owner>=0?' · '+FAM[b.owner].name:''}" aria-label="${CO(b.x,b.y)} ${TYPES[b.t].n}${b.owner>=0?', eid av '+FAM[b.owner].name:''}">
      <span class="co">${CO(b.x,b.y)}</span>${need.has(b.y*N+b.x)?'<span class="ask" aria-label="Bande uten ordre">?</span>':''}${b.hq>=0?`<span class="hq" style="--fc:${FAM[b.hq].c}">★</span>`:''}
      <span class="pips">${gs.map(g=>`<i class="pip" style="--pc:${FAM[g.fam].c}"></i>`).join('')}</span>${badge}${bang}</button>`;
  }
  document.getElementById('board').innerHTML=h;
}
function renderLegend(){
  document.getElementById('legend').innerHTML=FAM.map((f,i)=>`<span class="${S.dead[i]?'dead':''}"><i style="--c:${f.c}"></i>${f.name}: ${owned(i)} kvt.</span>`).join('')+
    `<span class="note">Klikk på et kvartal for å se type, eier og inntekt.</span>`;
}
function supBars(b){
  return FAM.map((f,i)=>S.dead[i]?'':`<span>${f.name}</span><span class="bar">${[1,2,3,4,5].map(n=>`<i class="${b.sup[i]>=n?'on':''}" style="--c:${f.c}"></i>`).join('')}</span>`).join('');
}
function movers(){return ui.moving?S.gangs.filter(g=>ui.moving.includes(g.id)):[]}
function picked(g){return !(ui.unpick||[]).includes(g.id)}
function groupSel(){const [x,y]=ui.sel||[0,0];return gangsAt(x,y).filter(g=>g.fam===0&&picked(g))}
function shopList(g){
  if(blk(g.x,g.y).owner!==0)return `<p class="note shopnote">Våpen leveres bare i kvartaler du eier. Flytt banden dit først.</p>`;
  return `<div class="shop">${Object.entries(WEAP).map(([k,W])=>`<button data-a="buy" data-id="${g.id}" data-w="${k}" ${g.wpn===k||S.money[0]<W.p?'disabled':''}>
    <span><b>${W.n}</b> <span class="note">${W.t}</span></span><span class="sm">+${W.m}</span><span class="sp">${g.wpn===k?'Har':'$'+W.p}</span></button>`).join('')}
    ${g.wpn?`<p class="note shopnote">Et nytt våpen erstatter ${WEAP[g.wpn].n}. Du får ingenting tilbake for det gamle.</p>`:''}</div>`;
}
function gangCard(g,group){
  const b=blk(g.x,g.y), en=gangsAt(g.x,g.y).some(o=>o.fam!==0);
  const tc=Math.round(takeChance(g,b)*100);
  const btn=(o,label,dis)=>`<button data-a="order" data-id="${g.id}" data-o="${o}" class="${g.order===o?'on':''}" ${dis?'disabled':''}>${label}</button>`;
  return `<div class="gang ${g.order==='none'?'need':''}" style="--c:var(--f0)">
    <div class="gh"><b>${g.name}${g.order==='none'?' <span class="need-txt">?</span>':''}</b><span>Muskler ${musTxt(g)} · Innflytelse ${g.inf} · Lønn $${g.up}</span></div>
    <div class="wrow"><span class="note">Våpen: ${g.wpn?`<b class="wn">${WEAP[g.wpn].n}</b> ${WEAP[g.wpn].t.toLowerCase()}, +${WEAP[g.wpn].m}`:'ingen'}</span><button class="linkb" data-a="shop" data-id="${g.id}">${ui.shop===g.id?'Lukk våpenhandleren':'Kjøp våpen'}</button></div>
    ${ui.shop===g.id?shopList(g):''}
    ${group?`<label class="pick"><input type="checkbox" id="pick-${g.id}" data-a="pick" data-id="${g.id}" ${picked(g)?'checked':''}> Med i gruppeordre</label>`:''}
    <div class="hp ${g.hp<=8?'low':''}" title="Helse ${g.hp}/${MAXHP}"><i style="width:${g.hp/MAXHP*100}%"></i></div>
    ${b.bld&&b.owner===0&&b.bld.some(x=>x.by!==0)?`<div class="orders infl"><span class="note">Påvirk:</span>${b.bld.map((x,i)=>x.by===0?'':`<button data-a="order" data-id="${g.id}" data-o="infl" data-t="${i}" class="${g.order==='infl'&&g.tgt===i?'on':''}">${BK[x.k].n} (ca. ${inflTurns(g,b,i)} mnd)${g.order==='infl'&&g.tgt===i?' · fast':''}</button>`).join('')}</div>`:''}
    <div class="orders">
      ${btn('hold','Hel')}
      ${btn('move',g.order==='move'?'Flytt → '+CO(g.tx,g.ty):'Flytt')}
      ${btn('take',`Ta kontroll (${tc} %)${g.order==='take'?' · fast':''}`,b.owner===0)}
      ${btn('attack','Angrip',!en)}
      ${btn('extort',g.order==='extort'?'Kreve inn (fast)':'Kreve inn',b.owner<0)}
    </div></div>`;
}
function renderPane(){
  const p=document.getElementById('pane'); let h='';
  if(ui.tab==='kvartal'){
    const [x,y]=ui.sel||[0,0], b=blk(x,y), T=TYPES[b.t], gs=gangsAt(x,y);
    const mvs=movers();
    if(mvs.length)h+=`<div class="banner"><span>Velg et nabokvartal for ${mvs.length>1?mvs.length+' bander':mvs[0].name}.</span><button class="btn" data-a="cancel">Avbryt</button></div>`;
    h+=`<h2>${CO(x,y)} <small>${street(x,y)}</small></h2>
      <div class="meta"><div><small>Type</small>${T.n}</div><div><small>Eier</small>${b.owner>=0?fn(b.owner):'Ingen'}</div>
      <div><small>Inntekt</small>$${blockInc(b,b.owner>=0?b.owner:0)}/mnd</div><div><small>Motstand</small>${T.res}</div></div>
      <h3>Lokal støtte</h3><div class="sup">${supBars(b)}</div>`;
    if(b.bld){
      h+=`<h3>Bygninger</h3><div class="blds">`+b.bld.map(x=>{const K=BK[x.k];
        return `<div class="bld"><span><b>${K.n}</b><br><span class="note">${CATN[K.c]} · motstand ${K.res}</span></span>
          <span class="bv">+$${K.v}/mnd</span><span class="chip ${x.by>=0?'on':''}" style="${x.by>=0?'--c:'+FAM[x.by].c:''}">${x.by===0?'Betaler deg':x.by>0?'Betaler '+FAM[x.by].name:'Ikke påvirket'}</span>
          ${x.by!==0&&b.owner===0?`<div class="prog" title="Fremdrift ${inflProg(x,0)} av ${inflNeed(x)}"><i style="width:${inflProg(x,0)/inflNeed(x)*100}%"></i><span>Påvirkning ${inflProg(x,0)} av ${inflNeed(x)}</span></div>`:''}</div>`}).join('')+`</div>`;
      if(b.owner!==0)h+=`<p class="note">Ta kontroll over kvartalet før bandene dine kan påvirke bygningene.</p>`;
    }
    const own=gs.filter(g=>g.fam===0), oth=gs.filter(g=>g.fam!==0);
    h+=`<h3>Dine bander her</h3>`;
    if(own.length>1){
      const sel=own.filter(picked), en=oth.length>0, none=!sel.length;
      const gb=(o,label,dis)=>`<button data-a="gorder" data-o="${o}" ${dis||none?'disabled':''}>${label}</button>`;
      h+=`<div class="group"><div class="gh"><b>Gruppeordre</b><span>${sel.length} av ${own.length} valgt${sel.length<own.length?' · <button class="linkb" data-a="pickall">Velg alle</button>':''}</span></div>
        <div class="orders">${gb('hold','Alle heler')}${gb('move',`Flytt ${sel.length} sammen`)}${gb('take','Alle tar kontroll',b.owner===0)}${gb('attack','Alle angriper',!en)}${gb('extort','Alle krever inn',b.owner<0)}${b.bld?gb('infl','Alle påvirker',b.owner!==0||!b.bld.some(x=>x.by!==0)):''}</div>
        <p class="note" style="margin:0">Gjelder bandene som er krysset av nedenfor.</p></div>`;
    }
    h+=own.length?own.map(g=>gangCard(g,own.length>1)).join(''):`<p class="note">Ingen av dine bander står her.</p>`;
    if(oth.length)h+=`<h3>Andre bander her</h3>`+oth.map(g=>`<div class="row"><span>${g.name} · ${fn(g.fam)}</span><span class="note">Muskler ${musTxt(g)}${g.wpn?' · '+WEAP[g.wpn].n:''} · Innfl. ${g.inf} · Helse ${g.hp}</span></div>`).join('');
  }
  if(ui.tab==='bander'){
    const gs=mine(0);
    h+=`<h2>Dine bander <small>${gs.length} stk · lønn $${econ(0).up}/mnd</small></h2>`;
    h+=gs.length?gs.map(g=>`<div class="row"><button class="link brow" data-a="goto" data-x="${g.x}" data-y="${g.y}"><img class="ava" src="${portrait(g)}" alt="" style="--c:var(--f0)"><span><b>${g.name}</b><br><span class="note">${CO(g.x,g.y)} · Muskler ${musTxt(g)}${g.wpn?' · '+WEAP[g.wpn].n:''} · Innfl. ${g.inf} · Helse ${g.hp}</span></span></button>
      <span class="${g.order==='none'?'need-txt':''}">${g.order==='move'?'Flytt → '+CO(g.tx,g.ty):g.order==='extort'?'Kreve inn (fast)':g.order==='infl'&&blk(g.x,g.y).bld?'Påvirk '+BK[blk(g.x,g.y).bld[g.tgt].k].n.toLowerCase()+' (fast)':g.order==='take'?'Ta kontroll (fast)':g.order==='none'?'? Ingen ordre':ORD[g.order]}</span></div>`).join(''):`<p class="note">Du har ingen bander. Lei noen under Rekrutter.</p>`;
  }
  if(ui.tab==='leie'){
    const hm=home(0);
    h+=`<h2>Leiemarkedet</h2><p class="note">${hm?`Nye bander møter opp i ${CO(hm.x,hm.y)}. Lønn trekkes hver måned.`:'Du eier ingen kvartaler og kan ikke ta imot nye folk.'} Rivalene leier fra samme marked.</p>`;
    h+=S.pool.map(g=>`<div class="row"><span class="brow"><img class="ava" src="${portrait(g)}" alt="" style="--c:var(--line)"><span><b>${g.name}</b><br><span class="note">Muskler ${g.mus} · Innflytelse ${g.inf} · Lønn $${g.up}/mnd</span></span></span>
      <button class="btn" data-a="hire" data-id="${g.id}" ${!hm||S.money[0]<g.cost?'disabled':''}>Lei for $${g.cost}</button></div>`).join('');
  }
  if(ui.tab==='hend'){
    const all=(S.events&&S.events.list)||[], l=evList();
    h+=`<h2>Hendelser <small>${S.events?dateOf(S.events.t):''}</small></h2>
      <div class="orders"><button data-a="revf" data-v="0" class="${!ui.revAll?'on':''}">Mine (${all.filter(evMine).length})</button><button data-a="revf" data-v="1" class="${ui.revAll?'on':''}">Alle (${all.length})</button></div>`;
    h+=l.length?l.map((e,i)=>`<button class="evrow ${i===ui.rev?'on':''}" data-a="ev" data-i="${i}"><span class="evnum">${i+1}</span><span><b>${evLabel(e)} · ${CO(e.x,e.y)}</b><br><span class="note">${evText(e)}</span></span></button>`).join('')
      :`<p class="note">${S.events?'Ingen hendelser her forrige runde.':'Avslutt en tur for å se hva som skjedde.'}</p>`;
    h+=`<p class="note">Bla med pilene, piltastene eller ved å klikke på et nummer i kartet.</p>`;
  }
  if(ui.tab==='logg'){
    h+=`<h2>Rapport</h2><div class="log">`;
    let cur=null;
    for(const l of S.log.slice().reverse()){
      if(l.t!==cur){cur=l.t;h+=`<h4>${dateOf(l.t)}</h4>`}
      h+=`<p>${l.x}</p>`;
    }
    h+=`</div>`;
  }
  p.innerHTML=h;
}
