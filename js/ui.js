// Visning: toppfelt, kart-ruter, sidepanel og bandekort
/* ---------- visning ---------- */
// Spilltypens mål i toppfeltet. Advarer når en rival nærmer seg seier.
function goalStat(){
  const M=S.mode||'dominans', r=[1,2,3].filter(f=>!S.dead[f]);
  let v='',tip=MODES[M].d,warn=false;
  if(M==='dominans'){v=t('{n} / {w} kvartaler',{n:owned(0),w:WIN});const b=r.sort((a,z)=>owned(z)-owned(a))[0];if(b!==undefined&&owned(b)>=WIN-8){warn=true;tip+=' '+t('{f} eier {n}.',{f:FAM[b].name,n:owned(b)})}}
  if(M==='kapitalist'){const b=r.sort((a,z)=>S.money[z]-S.money[a])[0], lead=b===undefined||S.money[0]>=S.money[b];
    v=t('Mnd {n}/{m}',{n:Math.min(S.turn,KAP_TURNS),m:KAP_TURNS})+' · '+(lead?t('du leder'):FAM[b].name);warn=!lead&&S.turn>=KAP_TURNS-5;
    tip+=' '+t('Kassene nå: du ${v},',{v:S.money[0]})+' '+r.map(f=>`${FAM[f].name} $${S.money[f]}`).join(', ')+'.'}
  if(M==='sniken'){v=t('{n} / 4 hovedkvarter',{n:hqOwned(0)});const b=r.find(f=>hqOwned(f)>=3);if(b!==undefined){warn=true;tip+=' '+t('{f} har {n}.',{f:FAM[b].name,n:hqOwned(b)})}}
  if(M==='sentrum'){const h=S.hold||[0,0,0,0];v=h[0]?t('Holdt {n}/{m} mnd',{n:h[0],m:SENTRUM_TURNS}):t('{n} / 4 ruter',{n:centreOwned(0)});
    const b=r.find(f=>h[f]>0);if(b!==undefined){warn=true;v=`${FAM[b].name} ${h[b]}/${SENTRUM_TURNS}`;tip+=' '+t('{f} holder sentrum nå.',{f:FAM[b].name})}}
  return `<div class="stat goal ${warn?'warn':''}" title="${tip.replace(/"/g,'&quot;')}"><small>${t('Mål')}: ${MODES[M].n}</small><b>${v}</b></div>`;
}
function render(){
  VIS=updateSeen();
  const e=econ(0), ext=extortForecast(0), net=e.net+ext, gone=desertForecast(0);
  document.getElementById('date').textContent=dateOf(S.turn);
  document.getElementById('boss').textContent=S.boss?bossName():'';
  document.getElementById('stats').innerHTML=`
    <button class="stat statbtn" data-a="ledger" title="${t('Se regnskapet')}"><small>${t('Kasse')}</small><b>$${S.money[0]}</b></button>
    <button class="stat statbtn" data-a="ledger" title="${t('Inntekt ${a} + innkreving ${b} − lønn ${c}',{a:e.inc,b:ext,c:e.up})}"><small>${t('Forventet netto')}</small><b style="color:${net<0?'var(--blood)':'var(--ok)'}">${net>=0?'+':''}$${net}</b></button>
    ${gone.length?`<button class="stat statbtn warn" data-a="ledger" title="${t('Kassen dekker ikke lønna')}"><small>⚠ ${t('Lønna dekkes ikke')}</small><b>${t(gone.length>1?'{n} bander stikker':'{n} bande stikker',{n:gone.length})}</b></button>`:''}
    <div class="stat"><small>${t('Kvartaler')}</small><b>${owned(0)} / 64</b></div>
    ${goalStat()}
    <button class="stat needbtn ${needTiles().length?'on':''}" id="needBtn" title="${t('Gå til neste rute med bander uten ordre')}"><small>${t('Uten ordre')}</small><b>${mine(0).filter(g=>g.order==='none').length}${needTiles().length?' →':''}</b></button>`;
  renderBoard(); drawCity(); renderLegend(); renderPane();
  // sidepanelet skal gå akkurat ned til hendelsesfeltet når siden står øverst
  document.documentElement.style.setProperty('--sideTop',document.querySelector('.side').offsetTop+'px');
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===ui.tab));
  document.querySelector('#tabs [data-tab="bander"]').textContent=`${t('Bander')} (${mine(0).length})`;
  document.getElementById('endBtn').disabled=!!S.over;
  if(S.over&&!endingShown){endingShown=true;showEnding(S.over.win)}
}
// Hendelser forrige runde: klikk for å se dem i pop-upen igjen
function eventsHtml(){
  if(!S.events)return '';
  const all=evAll(), l=evList();
  let h=`<div class="evbox"><div class="evhead"><h3>${t('Hendelser i {d}',{d:dateOf(S.events.t)})}</h3>
    <div class="orders"><button data-a="revf" data-v="0" class="${!ui.revAll?'on':''}">${t('Mine')} (${all.filter(evMine).length})</button><button data-a="revf" data-v="1" class="${ui.revAll?'on':''}">${t('Alle')} (${all.length})</button></div></div>`;
  h+=l.length?l.map((e,i)=>`<button class="evrow" data-a="ev" data-i="${i}"><span class="evnum">${i+1}</span><span><b>${evLabel(e)} · ${CO(e.x,e.y)}</b><br><span class="note">${evText(e)}</span></span></button>`).join('')
    :`<p class="note">${t('Ingen hendelser som gjelder deg.')}</p>`;
  if(l.length)h+=`<button class="btn" data-a="evall">▶ ${t('Vis alle i pop-up')}</button>`;
  return h+`</div>`;
}
// Regnskap: forrige måned og prognose for neste
function ledgerHtml(){
  const e=econ(0), ext=extortForecast(0), gone=desertForecast(0), L=S.ledger;
  const row=(t,v,cls='')=>`<div class="lrow ${cls}"><span>${t}</span><b>${v>=0?'+':'−'}$${Math.abs(v)}</b></div>`;
  let h=`<div class="ledger"><h3>${t('Neste måned (prognose)')}</h3>`+row(t('Inntekt fra kvartaler og bygninger'),e.inc)+row(t('Innkreving'),ext)+row(t('Lønn'),-e.up)+
    row(t('Forventet netto'),e.inc+ext-e.up,'sum');
  if(gone.length)h+=`<p class="lwarn">⚠ ${t('Kassen (${v}) dekker ikke lønna. Disse vil stikke uten lønn:',{v:S.money[0]})} ${gone.map(g=>`<b>${g.name}</b> ($${wage(g)})`).join(', ')}.</p>`;
  if(L){h+=`<h3>${t('Regnskap for {d}',{d:dateOf(L.t)})}</h3>`+`<div class="lrow"><span>${t('Kasse ved start')}</span><b>$${L.start}</b></div>`;
    if(L.hire)h+=row(t('Innleie av bander'),-L.hire); if(L.weapons)h+=row(t('Våpen'),-L.weapons);
    h+=row(t('Inntekt fra kvartaler og bygninger'),L.income||0); if(L.extort)h+=row(t('Innkreving'),L.extort); if(L.stolen)h+=row(t('Presset ut av rivaler'),-L.stolen);
    h+=row(t('Lønn'),-(L.wages||0)); if(L.unpaid)h+=row(t('Lønn som ikke ble betalt ({n} stakk)',{n:L.left.join(', ')}),L.unpaid,'unpaid');
    h+=`<div class="lrow sum"><span>${t('Kasse ved slutt')}</span><b>$${L.end}</b></div>`}
  return h+`</div>`;
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
  const rv=null, cur=null, evAt={};
  if(rv)rv.forEach((e,i)=>{(evAt[e.x+','+e.y]=evAt[e.x+','+e.y]||[]).push(i)});
  // «PANG!» og risting spilles bare når du blar til en ny hendelse, ikke ved hvert klikk
  const bk=cur?[S.events.t,ui.rev,!!ui.revAll].join('|'):'', fresh=bk&&bk!==lastBang; lastBang=bk;
  let h='';
  for(const b of S.blocks){
    const i=b.y*N+b.x, fs=fogState(i), own=fs==='vis'?b.owner:fs==='fog'?S.mem[i]:-1;
    const k=b.x+','+b.y, gs=fs==='vis'?gangsAt(b.x,b.y):[];
    const here=cur&&cur.x===b.x&&cur.y===b.y, ev=evAt[k];
    const tip=fs==='unk'?`${CO(b.x,b.y)} · ${t('Ukjent område')}`:`${CO(b.x,b.y)} · ${TYPES[b.t].n}${own>=0?' · '+FAM[own].name:''}${fs==='fog'?' ('+t('sist sett')+')':''}`;
    const cls=['tile',own<0?'free':'',fs==='fog'?'fogged':'',fs==='unk'?'unknown':'',ui.sel&&ui.sel[0]===b.x&&ui.sel[1]===b.y?'sel':'',can.includes(k)?'can':'',dests.has(k)?'dest':'',here?'hit':'',here&&fresh?'shake':'',need.has(b.y*N+b.x)?'need':'',isGoal(b.x,b.y)?'goal':''].join(' ');
    const badge=ev?`<span class="evn ${ev.includes(ui.rev)?'cur':''}">${here?ui.rev+1:ev[0]+1}${ev.length>1?'+':''}</span>`:'';
    const bang=here&&fresh?`<span class="bang">${cur.k==='fight'?t('PANG!'):cur.k==='infl'?'$$$':t('TATT!')}</span>`:'';
    h+=`<button class="${cls}" data-x="${b.x}" data-y="${b.y}" style="${own>=0?'--fc:'+FAM[own].c+';':''}${here?'--hc:'+evColor(cur):''}"
      title="${tip}" aria-label="${tip}">
      <span class="co">${CO(b.x,b.y)}</span>${need.has(b.y*N+b.x)?`<span class="ask" aria-label="${t('Bande uten ordre')}">?</span>`:''}${b.hq>=0?`<span class="hq" style="--fc:${FAM[b.hq].c}">★</span>`:''}
      <span class="pips">${gs.map(g=>`<i class="pip" style="--pc:${FAM[g.fam].c}"></i>`).join('')}</span>${badge}${bang}</button>`;
  }
  document.getElementById('board').innerHTML=h;
}
function renderLegend(){
  document.getElementById('legend').innerHTML=FAM.map((f,i)=>`<span class="${S.dead[i]?'dead':''}"><i style="--c:${f.c}"></i>${f.name}: ${owned(i)} ${t('kvt.')}</span>`).join('')+
    `<span class="note">${t('Klikk på et kvartal for å se type, eier og inntekt.')}</span>`;
}
function supBars(b){
  return FAM.map((f,i)=>S.dead[i]?'':`<span class="supf" title="${t('{f}: støtte {n} av 5',{f:f.name,n:b.sup[i]})}"><span class="supn" style="color:${f.c}">${i===0?t('Du'):f.name}</span><span class="bar">${[1,2,3,4,5].map(n=>`<i class="${b.sup[i]>=n?'on':''}" style="--c:${f.c}"></i>`).join('')}</span></span>`).join('');
}
function movers(){return ui.moving?S.gangs.filter(g=>ui.moving.includes(g.id)):[]}
// Gruppeordre: bander på en fast oppgave (kreve inn, ta kontroll, påvirk) er ikke med før du krysser dem av
const FIXED_ORD=['extort','take','infl'];
function picked(g){return FIXED_ORD.includes(g.order)?(ui.pickOn||[]).includes(g.id):!(ui.unpick||[]).includes(g.id)}
function groupSel(){const [x,y]=ui.sel||[0,0];return gangsAt(x,y).filter(g=>g.fam===0&&picked(g))}
function shopList(g){
  if(blk(g.x,g.y).owner!==0)return `<p class="note shopnote">${t('Våpen leveres bare i kvartaler du eier. Flytt banden dit først.')}</p>`;
  return `<div class="shop">${Object.entries(WEAP).map(([k,W])=>`<button data-a="buy" data-id="${g.id}" data-w="${k}" ${g.wpn===k||S.money[0]<wPrice(k)?'disabled':''}>
    <span><b>${W.n}</b> <span class="note">${W.t}</span></span><span class="sm">+${W.m}</span><span class="sp">${g.wpn===k?t('Har'):'$'+wPrice(k)}</span></button>`).join('')}
    ${g.wpn?`<p class="note shopnote">${t('Et nytt våpen erstatter {w}. Du får ingenting tilbake for det gamle.',{w:WEAP[g.wpn].n})}</p>`:''}</div>`;
}
function orderLabel(g){
  const b=blk(g.x,g.y);
  return g.order==='move'?t('Flytt')+' → '+CO(g.tx,g.ty):g.order==='extort'?t('Kreve inn (fast)'):g.order==='infl'&&b.bld?t('Påvirk {b} (fast)',{b:lc(BK[b.bld[g.tgt].k].n)}):g.order==='take'?t('Ta kontroll (fast)'):g.order==='none'?'? '+t('Ingen ordre'):ORD[g.order];
}
function gangCard(g,group){
  const b=blk(g.x,g.y), en=gangsAt(g.x,g.y).some(o=>o.fam!==0);
  const tc=Math.round(takeChance(g,b)*100);
  const btn=(o,label,dis)=>`<button data-a="order" data-id="${g.id}" data-o="${o}" class="${g.order===o?'on':''}" ${dis?'disabled':''}>${label}</button>`;
  return `<div class="gang ${g.order==='none'?'need':''}" style="--c:var(--f0)">
    <div class="gh">
      ${group?`<input type="checkbox" class="gpick" id="pick-${g.id}" data-a="pick" data-id="${g.id}" ${picked(g)?'checked':''} title="${t('Med i gruppeordre')}" aria-label="${t('Med i gruppeordre')}">`:''}
      <b>${g.name}${g.order==='none'?' <span class="need-txt">?</span>':''}</b>
      <span class="hpw" title="${t('Helse')} ${g.hp}/${MAXHP}"><span class="hp ${g.hp<=8?'low':''}"><i style="width:${g.hp/MAXHP*100}%"></i></span>${g.hp}</span>
    </div>
    <div class="gstat note">${t('Muskler')} ${musTxt(g)} · ${t('Innfl.')} ${g.inf} · ${t('Lønn')} $${wage(g)} · ${g.wpn?`<b class="wn">${WEAP[g.wpn].n}</b>`:t('uten våpen')}
      <button class="linkb" data-a="shop" data-id="${g.id}">${ui.shop===g.id?t('lukk'):t('kjøp våpen')}</button></div>
    ${ui.shop===g.id?shopList(g):''}
    ${b.bld&&b.owner===0&&b.bld.some(x=>x.by!==0)?`<div class="orders infl"><span class="note">${t('Påvirk')}</span>${b.bld.map((x,i)=>x.by===0?'':`<button data-a="order" data-id="${g.id}" data-o="infl" data-t="${i}" class="${g.order==='infl'&&g.tgt===i?'on':''}">${BK[x.k].n} (${t('ca. {n} mnd',{n:inflTurns(g,b,i)})})${g.order==='infl'&&g.tgt===i?' · '+t('fast'):''}</button>`).join('')}</div>`:''}
    <div class="orders">
      ${btn('hold',t('Hel'))}
      ${btn('move',g.order==='move'?t('Flytt')+' → '+CO(g.tx,g.ty):t('Flytt'))}
      ${btn('take',`${t('Ta kontroll')} (${tc} %)${g.order==='take'?' · '+t('fast'):''}`,b.owner===0)}
      ${btn('attack',t('Angrip'),!en)}
      ${btn('extort',g.order==='extort'?t('Kreve inn (fast)'):t('Kreve inn'),b.owner<0)}
    </div></div>`;
}
function renderPane(){
  const p=document.getElementById('pane'); let h='';
  if(ui.tab==='kvartal'){
    const [x,y]=ui.sel||[0,0], b=blk(x,y), T=TYPES[b.t], gs=gangsAt(x,y);
    const mvs=movers();
    if(mvs.length)h+=`<div class="banner"><span>${t('Velg et nabokvartal for {g}.',{g:mvs.length>1?t('{n} bander',{n:mvs.length}):mvs[0].name})}</span><button class="btn" data-a="cancel">${t('Avbryt')}</button></div>`;
    const fs=fogState(y*N+x);
    if(fs==='unk'){
      h+=`<h2>${CO(x,y)} <small>${street(x,y)}</small></h2><p class="note">${t('Ukjent område. Flytt en bande hit eller til et nabokvartal for å se hva som er her.')}</p>`;
    }else if(fs==='fog'){
      const mo=S.mem[y*N+x];
      h+=`<h2>${CO(x,y)} <small>${street(x,y)}</small></h2>
        <div class="facts"><span>${T.n}</span><span>${t('Sist kjente eier')}: ${mo>=0?fn(mo):t('ingen')}</span><span>${t('Motstand')} ${T.res}</span></div>
        ${b.bld?`<h3>${t('Bygninger')}</h3><div class="blds">${b.bld.map(x=>`<div class="bld"><span class="brow"><img class="ava" src="img/bld/${x.k}.jpg" alt="" style="--c:var(--line)"><span><b>${BK[x.k].n}</b> <span class="note">${CATN[BK[x.k].c]}</span></span></span><span class="bv">+$${BK[x.k].v}/${t('mnd')}</span><span class="chip">${t('Ukjent')}</span></div>`).join('')}</div>`:''}
        <p class="note">${t('Du ser ikke dette kvartalet nå. Opplysningene er fra sist du hadde folk i nærheten, og fiendebander vises ikke.')}</p>`;
    }else{
    h+=`<h2>${CO(x,y)} <small>${street(x,y)}</small></h2>
      <div class="facts"><span>${T.n}</span><span>${b.owner>=0?fn(b.owner):t('Ingen eier')}</span><span>$${blockInc(b,b.owner>=0?b.owner:0)}/${t('mnd')}</span><span>${t('Motstand')} ${T.res}</span></div>
      <div class="sup"><span class="note">${t('Støtte')}</span>${supBars(b)}</div>`;
    if(b.bld){
      h+=`<h3>${t('Bygninger')}</h3><div class="blds">`+b.bld.map(x=>{const K=BK[x.k];
        return `<div class="bld"><span class="brow"><img class="ava" src="img/bld/${x.k}.jpg" alt="" style="--c:${x.by>=0?FAM[x.by].c:'var(--line)'}"><span><b>${K.n}</b> <span class="note">${CATN[K.c]} · ${t('mot.')} ${K.res}</span></span></span>
          <span class="bv">+$${K.v}/${t('mnd')}</span><span class="chip ${x.by>=0?'on':''}" style="${x.by>=0?'--c:'+FAM[x.by].c:''}">${x.by===0?t('Betaler deg'):x.by>0?t('Betaler {f}',{f:FAM[x.by].name}):t('Ikke påvirket')}</span>
          ${x.by!==0&&b.owner===0?`<div class="prog" title="${t('Fremdrift {p} av {n}',{p:inflProg(x,0),n:inflNeed(x)})}"><i style="width:${inflProg(x,0)/inflNeed(x)*100}%"></i><span>${inflProg(x,0)}/${inflNeed(x)}</span></div>`:''}</div>`}).join('')+`</div>`;
      if(b.owner!==0)h+=`<p class="note">${t('Ta kontroll over kvartalet før bandene dine kan påvirke bygningene.')}</p>`;
    }
    const own=gs.filter(g=>g.fam===0), oth=gs.filter(g=>g.fam!==0);
    h+=`<h3>${t('Dine bander her')}</h3>`;
    if(own.length>1){
      const sel=own.filter(picked), en=oth.length>0, none=!sel.length;
      const gb=(o,label,dis)=>`<button data-a="gorder" data-o="${o}" ${dis||none?'disabled':''}>${label}</button>`;
      h+=`<div class="group"><div class="gh"><b>${t('Gruppeordre')}</b><span title="${t('Gjelder bandene som er krysset av')}">${t('{n} av {m} valgt',{n:sel.length,m:own.length})}${sel.length<own.length?` · <button class="linkb" data-a="pickall">${t('Velg alle')}</button>`:''}</span></div>
        <div class="orders">${gb('hold',t('Alle heler'))}${gb('move',t('Flytt {n} sammen',{n:sel.length}))}${gb('take',t('Alle tar kontroll'),b.owner===0)}${gb('attack',t('Alle angriper'),!en)}${gb('extort',t('Alle krever inn'),b.owner<0)}${b.bld?gb('infl',t('Alle påvirker'),b.owner!==0||!b.bld.some(x=>x.by!==0)):''}</div>
        </div>`;
    }
    h+=own.length?own.map(g=>gangCard(g,own.length>1)).join(''):`<p class="note">${t('Ingen av dine bander står her.')}</p>`;
    if(oth.length)h+=`<h3>${t('Andre bander her')}</h3>`+oth.map(g=>`<div class="row orow"><span>${g.name} · ${fn(g.fam)}</span><span class="note">${t('Muskler')} ${musTxt(g)}${g.wpn?' · '+WEAP[g.wpn].n:''} · ${t('Innfl.')} ${g.inf} · ${t('Helse')} ${g.hp}</span></div>`).join('');
    }
  }
  if(ui.tab==='bander'){
    const gs=mine(0);
    h+=`<h2>${t('Dine bander')} <small>${t('{n} stk · lønn ${v}/mnd',{n:gs.length,v:econ(0).up})}</small></h2>`;
    h+=gs.length?gs.map(g=>`<div class="row"><button class="link brow" data-a="goto" data-x="${g.x}" data-y="${g.y}"><img class="ava" src="${portrait(g)}" alt="" style="--c:var(--f0)"><span><b>${g.name}</b><br><span class="note">${CO(g.x,g.y)} · ${t('Muskler')} ${musTxt(g)}${g.wpn?' · '+WEAP[g.wpn].n:''} · ${t('Innfl.')} ${g.inf} · ${t('Helse')} ${g.hp}</span></span></button>
      <span class="${g.order==='none'?'need-txt':''}">${orderLabel(g)}</span></div>`).join(''):`<p class="note">${t('Du har ingen bander. Lei noen under Rekrutter.')}</p>`;
  }
  if(ui.tab==='leie'){
    const hm=home(0);
    h+=`<h2>${t('Leiemarkedet')}</h2><p class="note">${hm?t('Nye bander møter opp i {co}. Lønn trekkes hver måned.',{co:CO(hm.x,hm.y)}):t('Du eier ingen kvartaler og kan ikke ta imot nye folk.')} ${t('Rivalene leier fra samme marked.')}</p>`;
    h+=S.pool.map(g=>`<div class="row"><span class="brow"><img class="ava" src="${portrait(g)}" alt="" style="--c:var(--line)"><span><b>${g.name}</b><br><span class="note">${t('Muskler')} ${g.mus} · ${t('Innflytelse')} ${g.inf} · ${t('Lønn')} $${wage(g)}/${t('mnd')}</span></span></span>
      <button class="btn" data-a="hire" data-id="${g.id}" ${!hm||S.money[0]<g.cost?'disabled':''}>${t('Lei for ${v}',{v:g.cost})}</button></div>`).join('');
  }
  if(ui.tab==='logg'){
    h+=`<h2>${t('Rapport')}</h2>`+eventsHtml()+ledgerHtml()+`<div class="log">`;
    let cur=null;
    for(const l of S.log.slice().reverse()){
      if(l.t!==cur){cur=l.t;h+=`<h4>${dateOf(l.t)}</h4>`}
      h+=`<p>${l.x}</p>`;
    }
    h+=`</div>`;
  }
  p.innerHTML=h;
}
