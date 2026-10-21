// Datamotstanderne
/* ---------- datamotstandere ---------- */
function aiTurn(f){
  if(S.dead[f])return;
  const limit=3+Math.floor(owned(f)/4);
  let tries=3;
  while(tries-->0&&mine(f).length<limit){
    const ok=S.pool.filter(g=>S.money[f]-g.cost>=10).sort((a,b)=>(b.mus+b.inf)/b.cost-(a.mus+a.inf)/a.cost);
    if(!ok.length||!hire(f,ok[0].id))break;
  }
  let buys=2;
  for(const g of mine(f).sort((a,z)=>z.mus-a.mus)){
    if(buys<=0)break;
    const cur=g.wpn?WEAP[g.wpn].m:0;
    const opt=Object.keys(WEAP).filter(k=>WEAP[k].m>cur&&S.money[f]-wPrice(k)>=30).sort((a,z)=>WEAP[z].m-WEAP[a].m||wPrice(a)-wPrice(z))[0];
    if(opt&&buyWeapon(f,g,opt))buys--;
  }
  for(const g of mine(f)){
    const b=blk(g.x,g.y), en=gangsAt(g.x,g.y).filter(o=>o.fam!==f);
    if(g.hp<=8){g.order='hold';continue}
    if(en.length){const weak=Math.min(...en.map(musOf));g.order=musOf(g)+2>=weak?'attack':'hold';continue}
    if(b.owner!==f){g.order='take';continue}
    if(b.bld&&Math.random()<.6){
      const opts=b.bld.map((x,i)=>i).filter(i=>b.bld[i].by!==f&&!mine(f).some(o=>o!==g&&o.x===g.x&&o.y===g.y&&o.order==='infl'&&o.tgt===i));
      if(opts.length){const i=opts.sort((a,z)=>BK[b.bld[z].k].v/inflTurns(g,b,z)-BK[b.bld[a].k].v/inflTurns(g,b,a))[0];g.order='infl';g.tgt=i;continue}
    }
    let best=null,bs=-1;
    for(const n of nbrs(g.x,g.y)){
      const T=TYPES[n.t], e=gangsAt(n.x,n.y).filter(o=>o.fam!==f).length;
      let s=T.inc+(n.bld?n.bld.reduce((a,x)=>a+BK[x.k].v,0)*.25:0)-T.res*0.8+(n.owner===-1?1.5:0)+(n.owner>=0&&n.owner!==f?1:0)-e*2.5+Math.random()*2;
      if(n.owner===f)s-=4;
      if(s>bs){bs=s;best=n}
    }
    if(best&&bs>0){g.order='move';g.tx=best.x;g.ty=best.y}
    else g.order=Math.random()<0.5?'extort':'hold';
  }
}
