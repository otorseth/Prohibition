// Turoppgjør: flytting, kamp, overtakelse, påvirkning, økonomi
/* ---------- turoppgjør ---------- */
function fight(a,d){
  const b=blk(d.x,d.y);
  const ahp0=a.hp, dhp0=d.hp, dieA=r(1,6), dieD=r(1,6), bon=(d.order==='hold'||d.order==='none'?1:0)+(b.owner===d.fam?1:0);
  const ra=musOf(a)+dieA, rd=musOf(d)+dieD+bon;
  if(ra>=rd){d.hp-=ra-rd+3;a.hp-=1;L(`${a.name} (${fn(a.fam)}) overfalt ${d.name} (${fn(d.fam)}) i ${CO(b.x,b.y)} og vant.`)}
  else{a.hp-=rd-ra+3;d.hp-=1;L(`${a.name} (${fn(a.fam)}) angrep ${d.name} (${fn(d.fam)}) i ${CO(b.x,b.y)}, men ble slått tilbake.`)}
  const dead=[];
  [a,d].forEach(g=>{if(g.hp<=0&&!g.gone){g.gone=true;dead.push(g.name);L(`${g.name} (${fn(g.fam)}) havnet i elva.`)}});
  FX.push({k:'fight',x:b.x,y:b.y,a:a.fam,d:d.fam,an:a.name,dn:d.name,won:ra>=rd,dead,
    aid:a.id,did:d.id,am:musOf(a),dm:musOf(d),abm:a.mus,dbm:d.mus,aw:a.wpn||null,dw:d.wpn||null,dieA,dieD,bon,ahp0,dhp0,ahp1:Math.max(0,a.hp),dhp1:Math.max(0,d.hp)});
}
function resolve(){
  const live=()=>S.gangs.filter(g=>!g.gone);
  // 1. flytt
  for(const g of S.gangs)if(g.order==='move'){
    if(gangsAt(g.tx,g.ty).filter(o=>o.fam===g.fam).length<MAXB){g.x=g.tx;g.y=g.ty}
  }
  // 2. angrep
  for(const g of live().sort(()=>Math.random()-.5)){
    if(g.gone||g.order!=='attack')continue;
    const en=gangsAt(g.x,g.y).filter(o=>o.fam!==g.fam&&!o.gone);
    if(en.length)fight(g,pick(en));
  }
  S.gangs=live();
  // 3. ta kontroll
  for(const g of S.gangs.slice().sort(()=>Math.random()-.5)){
    if(g.order!=='take')continue;
    const b=blk(g.x,g.y); if(b.owner===g.fam)continue;
    if(Math.random()<takeChance(g,b)){
      const prev=b.owner; b.owner=g.fam; b.sup[g.fam]=Math.max(b.sup[g.fam],1);
      if(b.bld)b.bld.forEach(x=>{x.by=-1;x.pr=[0,0,0,0]}); // ny eier må vinne bygningene på nytt
      if(prev>=0)b.sup[prev]=Math.max(0,b.sup[prev]-2);
      L(`${g.name} tok ${CO(b.x,b.y)} (${TYPES[b.t].n}) for ${fn(g.fam)}${prev>=0?' fra '+fn(prev):''}.`);
      if(b.hq>=0&&b.hq!==g.fam)L(`Hovedkvarteret til ${fn(b.hq)} har falt!`);
      FX.push({k:'take',x:b.x,y:b.y,f:g.fam,prev,gn:g.name,hq:b.hq>=0&&b.hq!==g.fam?b.hq:-1});
    }else{b.sup[g.fam]=Math.min(5,b.sup[g.fam]+1); if(g.fam===0)L(`${g.name} prøvde å ta ${CO(b.x,b.y)}, men folk holdt kjeft. Støtten øker likevel.`)}
  }
  // 3b. påvirke bygninger i egne kvartaler
  for(const g of S.gangs){
    if(g.order!=='infl')continue;
    const b=blk(g.x,g.y), bd=b.bld&&b.bld[g.tgt];
    if(!bd||b.owner!==g.fam||bd.by===g.fam)continue;
    bd.pr=bd.pr||[0,0,0,0];
    const gain=inflGain(g,b)+r(0,3), need=inflNeed(bd);
    bd.pr[g.fam]=Math.min(need,bd.pr[g.fam]+gain);
    if(bd.pr[g.fam]>=need){
      bd.by=g.fam; bd.pr=[0,0,0,0];
      L(`${g.name} fikk ${BK[bd.k].n.toLowerCase()} i ${CO(b.x,b.y)} til å betale ${fn(g.fam)} (+$${BK[bd.k].v}/mnd).`);
      FX.push({k:'infl',x:b.x,y:b.y,f:g.fam,gn:g.name,bk:bd.k});
    }else if(g.fam===0)L(`${g.name} jobbet med ${BK[bd.k].n.toLowerCase()} i ${CO(b.x,b.y)}: ${bd.pr[0]} av ${need} (+${gain}).`);
  }
  // 4. kreve inn og hvile
  for(const g of S.gangs){
    const b=blk(g.x,g.y);
    if(g.order==='extort'){
      if(b.owner===g.fam){const v=TYPES[b.t].inc+g.inf;S.money[g.fam]+=v;b.sup[g.fam]=Math.max(0,b.sup[g.fam]-1);if(g.fam===0)L(`${g.name} krevde inn $${v} i ${CO(b.x,b.y)}.`)}
      else if(b.owner>=0){const v=Math.min(S.money[b.owner],TYPES[b.t].inc+g.inf);S.money[b.owner]-=v;S.money[g.fam]+=v;b.sup[b.owner]=Math.max(0,b.sup[b.owner]-1);
        if(g.fam===0||b.owner===0)L(`${g.name} (${fn(g.fam)}) presset $${v} ut av ${fn(b.owner)} i ${CO(b.x,b.y)}.`)}
    }
    if(g.order==='hold'||g.order==='none')g.hp=Math.min(MAXHP,g.hp+6);
  }
  // 5. økonomi og støtte
  for(let f=0;f<4;f++){
    if(S.dead[f])continue;
    S.money[f]+=econ(f).net;
    while(S.money[f]<0&&mine(f).length){
      const g=mine(f).sort((a,b)=>wage(b)-wage(a))[0];
      S.gangs=S.gangs.filter(o=>o!==g); S.money[f]+=wage(g);
      L(`${g.name} fikk ikke lønn og forlot ${fn(f)}.`);
    }
    if(S.money[f]<0)S.money[f]=0;
  }
  S.blocks.forEach(b=>{if(b.owner>=0)b.sup[b.owner]=Math.min(5,b.sup[b.owner]+1)});
  // Kreve inn er en fast ordre: den står til spilleren endrer den, eller kvartalet ikke lenger har en eier
  // Faste ordrer: kreve inn, ta kontroll og påvirk står til de er fullført eller ikke lenger er mulige
  S.gangs.forEach(g=>{if(!keepOrder(g))g.order='none'});
  // 6. leiemarked
  S.pool.splice(0,Math.min(2,S.pool.length));
  while(S.pool.length<5)S.pool.push(makeGang());
  // 7. eliminering og seier
  for(let f=0;f<4;f++){
    if(!S.dead[f]&&!owned(f)&&!mine(f).length){S.dead[f]=true;L(`${fn(f)} er knust og forsvunnet fra byen.`)}
  }
  if(S.dead[0])return finish(false,'Familien din er knust. Lakeport tilhører andre nå.');
  if([1,2,3].every(f=>S.dead[f]))return finish(true,'Alle rivalene er borte. Lakeport er din.');
  if(owned(0)>=WIN)return finish(true,`Du eier ${owned(0)} kvartaler. Ingen tør lenger utfordre deg.`);
  for(let f=1;f<4;f++)if(owned(f)>=WIN)return finish(false,`${FAM[f].name} eier ${owned(f)} kvartaler og styrer byen.`);
}
function keepOrder(g){
  const b=blk(g.x,g.y);
  if(g.order==='extort')return b.owner>=0;
  if(g.order==='take')return b.owner!==g.fam;
  if(g.order==='infl'){const bd=b.bld&&b.bld[g.tgt];return !!bd&&b.owner===g.fam&&bd.by!==g.fam}
  return false;
}
function finish(win,text){S.over={win,text}}

function endTurn(){
  if(S.over)return;
  ui.moving=null; FX=[];
  for(let f=1;f<4;f++)aiTurn(f);
  resolve();
  S.events={t:S.turn,list:FX};
  S.turn++;
  if(!S.over)L(`— ${dateOf(S.turn)} begynner —`);
  ui.rev=evList().length?0:null; ui.dockMin=false;
  save(); render();
}
