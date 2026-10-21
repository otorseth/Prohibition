// Spilltilstand: nytt spill, bander, økonomi, påvirkning
let S, ui={sel:null,tab:'kvartal',moving:null};
let FX=[], lastBang='';

function blk(x,y){return S.blocks[y*N+x]}
function gangsAt(x,y){return S.gangs.filter(g=>g.x===x&&g.y===y)}
function owned(f){return S.blocks.filter(b=>b.owner===f).length}
function mine(f){return S.gangs.filter(g=>g.fam===f)}
function nbrs(x,y){return [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].map(([a,b])=>[x+a,y+b]).filter(([a,b])=>a>=0&&b>=0&&a<N&&b<N).map(([a,b])=>blk(a,b))}
function L(t){S.log.push({t:S.turn,x:t}); if(S.log.length>150)S.log.shift()}

function makeGang(){
  const mus=r(2,8), inf=r(1,7);
  return {id:S.nid++,name:`${pick(FIRST)} «${pick(NICK)}»`,mus,inf,hp:MAXHP,fam:-1,x:0,y:0,order:'none',tx:0,ty:0,
    cost:(mus+inf)*4+r(0,6),up:Math.ceil((mus+inf)/3)};
}

function newGame(){
  S={v:4,turn:1,nid:1,money:[60,60,60,60],blocks:[],gangs:[],pool:[],log:[],dead:[false,false,false,false],over:false};
  const bag=[...Array(30).fill('bolig'),...Array(18).fill('komm'),...Array(14).fill('ind')];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    let t=pick(bag);
    if(x===7&&y>=2&&y<=5)t='havn';
    S.blocks.push({x,y,t,owner:-1,sup:[0,0,0,0],hq:-1});
  }
  [[4,3],[1,4],[6,2]].forEach(([x,y])=>blk(x,y).t='politi');
  HQS.forEach(([x,y],f)=>{const b=blk(x,y);b.t='hq';b.owner=f;b.hq=f;b.sup[f]=5});
  S.blocks.forEach(b=>{if(BKCAT(b.t))b.bld=genBld(b.t)});
  [[3,3],[4,4]].forEach(([x,y])=>{const b=blk(x,y);b.t='komm';b.bld=genBld('komm','kasino')});
  for(let f=0;f<4;f++)for(let i=0;i<2;i++){const g=makeGang();g.fam=f;g.x=HQS[f][0];g.y=HQS[f][1];S.gangs.push(g)}
  for(let i=0;i<5;i++)S.pool.push(makeGang());
  L('Forbudet har gjort byen tørst. Fire familier gjør krav på Lakeport.');
  ui={sel:[0,0],tab:'kvartal',moving:null};
  save(); render();
}

function BKCAT(t){return t==='bolig'||t==='komm'||t==='ind'}
// Påvirkning bygges opp over flere runder: hver runde gir fremdrift til målet er nådd
function inflNeed(bd){return 8+BK[bd.k].res*4}
function inflProg(bd,f){return (bd.pr&&bd.pr[f])||0}
function inflGain(g,b){return g.inf+b.sup[g.fam]+1} // pluss et kast 0-3 i selve oppgjøret
function inflTurns(g,b,i){const bd=b.bld[i];return Math.max(1,Math.ceil((inflNeed(bd)-inflProg(bd,g.fam))/(inflGain(g,b)+1.5)))}
function blockInc(b,f){
  let v=TYPES[b.t].inc+(b.sup[f]>=4?1:0);
  if(b.bld)b.bld.forEach(x=>{if(x.by===f)v+=BK[x.k].v});
  return v;
}
function home(f){
  const [x,y]=HQS[f]; const b=blk(x,y);
  if(b.owner===f)return b;
  return S.blocks.find(o=>o.owner===f)||null;
}
function hire(f,id){
  const i=S.pool.findIndex(g=>g.id===id); if(i<0)return false;
  const g=S.pool[i], h=home(f);
  if(!h||S.money[f]<g.cost)return false;
  if(gangsAt(h.x,h.y).filter(o=>o.fam===f).length>=MAXB)return false;
  S.money[f]-=g.cost; g.fam=f; g.x=h.x; g.y=h.y; g.order='none';
  S.gangs.push(g); S.pool.splice(i,1);
  L(`${fn(f)} leide inn ${g.name}.`);
  return true;
}
function takeChance(g,b){
  let c=0.3+g.inf*0.07+b.sup[g.fam]*0.06-TYPES[b.t].res*0.06;
  if(b.owner>=0){c-=b.sup[b.owner]*0.06; c-=gangsAt(b.x,b.y).filter(o=>o.fam===b.owner).length*0.15}
  else c+=0.1;
  return clamp(c,0.05,0.9);
}
function econ(f){
  let inc=0; S.blocks.forEach(b=>{if(b.owner===f)inc+=blockInc(b,f)});
  const up=mine(f).reduce((s,g)=>s+g.up,0);
  return {inc,up,net:inc-up};
}
