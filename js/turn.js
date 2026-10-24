// Turoppgjør: flytting, kamp, overtakelse, påvirkning, økonomi
/* ---------- turoppgjør ---------- */
function fight(a,d){
  const b=blk(d.x,d.y);
  const ahp0=a.hp, dhp0=d.hp, dieA=r(1,6), dieD=r(1,6), bon=(d.order==='hold'||d.order==='none'?1:0)+(b.owner===d.fam?1:0);
  const ra=musOf(a)+dieA, rd=musOf(d)+dieD+bon;
  const me=a.fam===0||d.fam===0;
  if(ra>=rd){d.hp-=ra-rd+3;a.hp-=1;Lv(b.x,b.y,me,t('{a} ({af}) overfalt {d} ({df}) i {co} og vant.',{a:a.name,af:fn(a.fam),d:d.name,df:fn(d.fam),co:CO(b.x,b.y)}))}
  else{a.hp-=rd-ra+3;d.hp-=1;Lv(b.x,b.y,me,t('{a} ({af}) angrep {d} ({df}) i {co}, men ble slått tilbake.',{a:a.name,af:fn(a.fam),d:d.name,df:fn(d.fam),co:CO(b.x,b.y)}))}
  const pWon=(a.fam===0&&ra>=rd)||(d.fam===0&&ra<rd), pLost=(a.fam===0&&ra<rd)||(d.fam===0&&ra>=rd);
  if(pWon)stat('fw'); if(pLost)stat('fl');
  const dead=[];
  [a,d].forEach(g=>{if(g.hp<=0&&!g.gone){g.gone=true;dead.push(g.name);if(g.fam===0)stat('lost');else if(me)stat('killed');Lv(b.x,b.y,me,t('{g} ({f}) havnet i elva.',{g:g.name,f:fn(g.fam)}))}});
  FX.push({k:'fight',seen:me||canSee(b.x,b.y),x:b.x,y:b.y,a:a.fam,d:d.fam,an:a.name,dn:d.name,won:ra>=rd,dead,
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
      if(g.fam===0)stat('taken');
      if(prev>=0)b.sup[prev]=Math.max(0,b.sup[prev]-2);
      Lv(b.x,b.y,g.fam===0||prev===0,prev>=0?t('{g} tok {co} ({ty}) for {f} fra {p}.',{g:g.name,co:CO(b.x,b.y),ty:TYPES[b.t].n,f:fn(g.fam),p:fn(prev)}):t('{g} tok {co} ({ty}) for {f}.',{g:g.name,co:CO(b.x,b.y),ty:TYPES[b.t].n,f:fn(g.fam)}));
      if(b.hq>=0&&b.hq!==g.fam)Lv(b.x,b.y,g.fam===0||b.hq===0,t('Hovedkvarteret til {f} har falt!',{f:fn(b.hq)}));
      FX.push({k:'take',seen:g.fam===0||prev===0||canSee(b.x,b.y),x:b.x,y:b.y,f:g.fam,prev,gn:g.name,hq:b.hq>=0&&b.hq!==g.fam?b.hq:-1});
    }else{b.sup[g.fam]=Math.min(5,b.sup[g.fam]+1); if(g.fam===0)L(t('{g} prøvde å ta {co}, men folk holdt kjeft. Støtten øker likevel.',{g:g.name,co:CO(b.x,b.y)}))}
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
      Lv(b.x,b.y,g.fam===0,t('{g} fikk {b} i {co} til å betale {f} (+${v}/mnd).',{g:g.name,b:lc(BK[bd.k].n),co:CO(b.x,b.y),f:fn(g.fam),v:BK[bd.k].v}));
      FX.push({k:'infl',seen:g.fam===0||canSee(b.x,b.y),x:b.x,y:b.y,f:g.fam,gn:g.name,bk:bd.k});
    }else if(g.fam===0)L(t('{g} jobbet med {b} i {co}: {p} av {n} (+{d}).',{g:g.name,b:lc(BK[bd.k].n),co:CO(b.x,b.y),p:bd.pr[0],n:need,d:gain}));
  }
  // 4. kreve inn og hvile
  for(const g of S.gangs){
    const b=blk(g.x,g.y);
    if(g.order==='extort'){
      if(b.owner===g.fam){const v=TYPES[b.t].inc+g.inf;S.money[g.fam]+=v;if(g.fam===0)ledgerAdd('extort',v);b.sup[g.fam]=Math.max(0,b.sup[g.fam]-1);if(g.fam===0)L(t('{g} krevde inn ${v} i {co}.',{g:g.name,v,co:CO(b.x,b.y)}))}
      else if(b.owner>=0){const v=Math.min(S.money[b.owner],TYPES[b.t].inc+g.inf);S.money[b.owner]-=v;S.money[g.fam]+=v;
        if(g.fam===0)ledgerAdd('extort',v); if(b.owner===0)ledgerAdd('stolen',v);b.sup[b.owner]=Math.max(0,b.sup[b.owner]-1);
        if(g.fam===0||b.owner===0)L(t('{g} ({f}) presset ${v} ut av {o} i {co}.',{g:g.name,f:fn(g.fam),v,o:fn(b.owner),co:CO(b.x,b.y)}))}
    }
    if(g.order==='hold'||g.order==='none')g.hp=Math.min(MAXHP,g.hp+6);
  }
  // 5. økonomi og støtte
  for(let f=0;f<4;f++){
    if(S.dead[f])continue;
    const ec=econ(f);
    S.money[f]+=ec.net;
    if(f===0){ledgerAdd('income',ec.inc);ledgerAdd('wages',ec.up);stat('earned',ec.inc+((S.led&&S.led.extort)||0))}
    // går kassen i minus, stikker den dyreste banden uten lønn, til kassen er i balanse
    while(S.money[f]<0&&mine(f).length){
      const g=mine(f).sort((a,b)=>wage(b)-wage(a))[0];
      S.gangs=S.gangs.filter(o=>o!==g); S.money[f]+=wage(g);
      if(f===0){ledgerAdd('unpaid',wage(g));(S.led.left=S.led.left||[]).push(g.name);L(t('{g} fikk ikke lønn og forlot {f}.',{g:g.name,f:fn(f)}))}
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
    if(!S.dead[f]&&!owned(f)&&!mine(f).length){S.dead[f]=true;L(t('{f} er knust og forsvunnet fra byen.',{f:fn(f)}))}
  }
  if(S.dead[0])return finish(false,t('Familien din er knust. Lakeport tilhører andre nå.'));
  if([1,2,3].every(f=>S.dead[f]))return finish(true,t('Alle rivalene er borte. Lakeport er din.'),'rivals');
  checkGoal();
}
// Seier etter spilltypen (se MODES i data.js)
function checkGoal(){
  const M=S.mode||'dominans', alive=[0,1,2,3].filter(f=>!S.dead[f]);
  if(M==='dominans'){
    if(owned(0)>=WIN)return finish(true,t('Du eier {n} kvartaler. Ingen tør lenger utfordre deg.',{n:owned(0)}));
    for(let f=1;f<4;f++)if(owned(f)>=WIN)return finish(false,t('{f} eier {n} kvartaler og styrer byen.',{f:FAM[f].name,n:owned(f)}));
  }
  if(M==='sniken'){
    for(const f of alive)if(hqOwned(f)===4)return f===0
      ?finish(true,t('Du sitter på alle fire hovedkvarterene. Rivalene har ingen steder å gjemme seg.'))
      :finish(false,t('{f} har tatt alle fire hovedkvarterene, også ditt.',{f:FAM[f].name}));
  }
  if(M==='sentrum'){
    S.hold=S.hold||[0,0,0,0];
    for(let f=0;f<4;f++){
      const had=S.hold[f]; S.hold[f]=!S.dead[f]&&centreOwned(f)===4?had+1:0;
      if(S.hold[f]&&(f===0||S.hold[f]===1||S.hold[f]>=SENTRUM_TURNS-3))L(t('{f} holder sentrum ({n} av {m} måneder).',{f:fn(f),n:S.hold[f],m:SENTRUM_TURNS}));
      if(had&&!S.hold[f])L(t('{f} mistet grepet om sentrum.',{f:fn(f)}));
    }
    for(const f of alive)if(S.hold[f]>=SENTRUM_TURNS)return f===0
      ?finish(true,t('Familien har holdt sentrum i {m} måneder. Hele byen går gjennom dine gater.',{m:SENTRUM_TURNS}))
      :finish(false,t('{f} har holdt sentrum i {m} måneder og styrer byen.',{f:FAM[f].name,m:SENTRUM_TURNS}));
  }
  if(M==='kapitalist'&&S.turn>=KAP_TURNS){
    const best=alive.filter(f=>f>0).sort((a,b)=>S.money[b]-S.money[a])[0];
    if(best===undefined||S.money[0]>=S.money[best])return finish(true,t('Etter {m} måneder har familien ${v} i kassen, mer enn noen annen i byen.',{m:KAP_TURNS,v:S.money[0]}));
    return finish(false,t('Etter {m} måneder har {f} ${v} i kassen. Du har ${u}.',{m:KAP_TURNS,f:FAM[best].name,v:S.money[best],u:S.money[0]}));
  }
}
function keepOrder(g){
  const b=blk(g.x,g.y);
  if(g.order==='extort')return b.owner>=0;
  if(g.order==='take')return b.owner!==g.fam;
  if(g.order==='infl'){const bd=b.bld&&b.bld[g.tgt];return !!bd&&b.owner===g.fam&&bd.by!==g.fam}
  return false;
}
function finish(win,text,kind){S.over={win,text,kind:kind||''}}

function endTurn(){
  if(S.over)return;
  ui.moving=null; FX=[];
  for(let f=1;f<4;f++)aiTurn(f);
  resolve();
  S.events={t:S.turn,list:FX};
  // lagre regnskapet for måneden og start et nytt
  S.ledger={t:S.turn,start:S.ledStart??S.money[0],end:S.money[0],...(S.led||{})};
  S.led={}; S.ledStart=S.money[0];
  S.turn++;
  if(!S.over)L(t('— {d} begynner —',{d:dateOf(S.turn)}));
  save(); render();
  if(EVENT_POPUP&&!S.over)openEvents(0);
}
