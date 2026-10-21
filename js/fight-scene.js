// Kampscenen, gangsterfigurer og portretter
/* ---------- kampscene ---------- */
const SKIN=['#e0b48c','#c99a6e','#a87650','#f0c8a0','#7a5236'], HATS=['#1d1c1c','#3a3530','#4a4238','#262a30','#5a5048'];
let stageKey='', stageRaf=0;
function shade(hex,k){const n=parseInt(hex.slice(1),16),f=v=>Math.min(255,Math.round(v*k));return `rgb(${f(n>>16&255)},${f(n>>8&255)},${f(n&255)})`}
function sLine(c,a,b,x,y){c.beginPath();c.moveTo(a,b);c.lineTo(x,y);c.stroke()}
function sCirc(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function sPath(c,p){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
function sStar(c,x,y,r1,r2,col){c.fillStyle=col;c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,rr=i%2?r2:r1;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}
// Eldre hendelser har ikke våpen lagret; da velges figurens våpen ut fra muskler som før
const wpnOf=G=>G.w!==undefined?(G.w?WEAP[G.w].d:'fists'):(G.mus>=7?'tommy':G.mus>=4?'pistol':'bat');
const MUZ={tommy:[83,-96],pistol:[56,-97],revolver:[57,-97],derringer:[46,-95],shotgun:[63,-97],rifle:[89,-98]};
const muzzle=w=>MUZ[w]||[56,-97];

// En gangster sett fra siden. Utseendet er fast for hver bande (styrt av bandens id).
function drawGangster(c,G,x,face,o){
  const R=rng(G.id*2654435761+7), pk=a=>a[Math.floor(R()*a.length)];
  const fam=FAMHEX[G.fam], skin=pk(SKIN), hat=pk(HATS), ht=Math.floor(R()*3), stache=R()<.5, cig=R()<.35;
  const bw=1+((G.bm??G.mus)-5)*.05, w=wpnOf(G);
  c.save(); c.globalAlpha=o.alpha??1;
  c.translate(x+(o.dx||0)*face,230); c.scale(face,1);
  if(o.fall)c.rotate(-o.fall*1.45);
  c.lineCap='round';
  // bein og sko
  c.fillStyle='#1c1b1d'; c.fillRect(-12*bw,-56,10,52); c.fillRect(3*bw,-56,10,52);
  c.fillStyle='#0b0a0a'; c.fillRect(-14*bw,-6,15,6); c.fillRect(2*bw,-6,17,6);
  // bakre arm
  c.strokeStyle=shade(fam,.42); c.lineWidth=9; sLine(c,-10*bw,-112,-17*bw,-72);
  // frakk, skjorte og slips
  c.fillStyle=shade(fam,.6); sPath(c,[[-20*bw,-122],[20*bw,-122],[25*bw,-46],[-25*bw,-46]]); c.fill();
  c.fillStyle='#d9d2c3'; sPath(c,[[-9,-122],[9,-122],[0,-96]]); c.fill();
  c.fillStyle=shade(fam,1.15); c.fillRect(-2.5,-120,5,22);
  c.strokeStyle=shade(fam,.38); c.lineWidth=1.5; sLine(c,-9,-122,0,-90); sLine(c,9,-122,0,-90); sLine(c,0,-90,0,-48);
  // hode
  c.fillStyle=skin; c.fillRect(-4,-131,8,10); sCirc(c,1,-142,14,skin);
  sCirc(c,-6,-141,3.5,'rgba(0,0,0,.18)'); sCirc(c,7,-144,1.8,'#111');
  if(stache){c.fillStyle='#2a1d14';c.fillRect(5,-136,9,3)}
  if(cig){c.fillStyle='#6b4a2e';c.fillRect(12,-134,11,3);sCirc(c,23.5,-132.5,1.8,'#ff8a3a')}
  // hatt: fedora, sixpence eller bowler
  c.fillStyle=hat;
  if(ht===0){c.beginPath();c.ellipse(2,-152,23,4.5,0,0,Math.PI*2);c.fill();c.fillRect(-12,-170,27,19);c.fillStyle=fam;c.fillRect(-12,-157,27,4)}
  else if(ht===1){c.beginPath();c.ellipse(0,-152,15,10,0,Math.PI,0);c.fill();c.fillRect(8,-154,15,4)}
  else{c.beginPath();c.ellipse(1,-152,19,3.5,0,0,Math.PI*2);c.fill();c.beginPath();c.arc(1,-153,14,Math.PI,0);c.fill();c.fillStyle=fam;c.fillRect(-13,-156,28,3)}
  // fremre arm og våpen
  // knyttneve: armen strekkes ut i slaget
  const hx=w==='fists'?30+(o.swing||0)*22:36, hy=w==='fists'?-104+(o.swing||0)*4:-93;
  c.strokeStyle=shade(fam,.55); c.lineWidth=9; sLine(c,8*bw,-114,hx-2,hy-1);
  if(w==='tommy'){c.fillStyle='#5a3b24';c.fillRect(14,-98,18,8);c.fillStyle='#2a2622';c.fillRect(30,-99,40,7);sCirc(c,44,-88,7,'#1a1816');c.fillStyle='#2a2622';c.fillRect(56,-93,4,9);c.fillStyle='#3a3633';c.fillRect(68,-98,14,4)}
  else if(w==='pistol'){c.fillStyle='#2a2622';c.fillRect(32,-99,22,6);c.fillRect(33,-94,6,9)}
  else if(w==='revolver'){c.fillStyle='#2a2622';c.fillRect(32,-99,24,5);c.fillStyle='#3a3633';c.fillRect(36,-101,9,9);c.fillStyle='#5a3b24';c.fillRect(32,-94,6,9)}
  else if(w==='derringer'){c.fillStyle='#3a3633';c.fillRect(33,-97,12,4);c.fillStyle='#5a3b24';c.fillRect(33,-94,4,6)}
  else if(w==='shotgun'){c.fillStyle='#5a3b24';c.fillRect(16,-98,18,8);c.fillStyle='#2a2622';c.fillRect(32,-99,30,4);c.fillRect(32,-95,30,3)}
  else if(w==='rifle'){c.fillStyle='#5a3b24';c.fillRect(8,-98,24,7);c.fillRect(30,-97,40,4);c.fillStyle='#2a2622';c.fillRect(30,-100,58,3)}
  else if(w==='fists'){}
  else{c.save();c.translate(36,-93);c.rotate(-.9+(o.swing||0));c.strokeStyle='#8a6a42';c.lineWidth=5;sLine(c,0,0,30,0);c.lineWidth=8;sLine(c,28,0,48,0);c.restore()}
  sCirc(c,hx,hy,w==='fists'?6:4.5,skin);
  if(o.flash){const [mx,my]=muzzle(w), big=w==='shotgun'?1.5:1;sCirc(c,mx,my,14*big,'rgba(255,200,110,.25)');sStar(c,mx,my,11*big,4*big,'#ffd27a')}
  if(o.hit){const n=performance.now()*.02;for(let i=0;i<3;i++)sCirc(c,4+Math.sin(i*2.1+n)*10,-104+i*10,2.6,'#ff5a4a')}
  c.restore();
}
// Portrett til Bander og Rekrutter. Bruker samme tilfeldige trekk som kampfiguren,
// så hatt, hudfarge, bart og sigar er de samme som i kampscenen.
const PORTRAITS=new Map();
function portrait(g){
  const key=g.id+'|'+g.fam;
  if(PORTRAITS.has(key))return PORTRAITS.get(key);
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  const R=rng(g.id*2654435761+7), pk=a=>a[Math.floor(R()*a.length)];
  const skin=pk(SKIN), hat=pk(HATS), ht=Math.floor(R()*3), stache=R()<.5, cig=R()<.35;
  const R2=rng(g.id*97+13), fw=.9+R2()*.18, hair=['#1b1410','#3a2a1c','#5b4330','#2a2a2a','#7a6a58'][Math.floor(R2()*5)];
  const stub=R2()<.4, scar=R2()<.25, brow=R2()*4-2, fam=g.fam>=0?FAMHEX[g.fam]:'#8a8178';
  // bakgrunn med lys bakfra
  const bg=c.createRadialGradient(64,50,6,64,64,80); bg.addColorStop(0,'#4a3826'); bg.addColorStop(1,'#141110');
  c.fillStyle=bg; c.fillRect(0,0,128,128);
  c.setTransform(1.3,0,0,1.3,-19.2,-15); // zoom inn på hode og hatt
  // frakk, skjorte og slips
  c.fillStyle=shade(fam,.55); c.beginPath(); c.moveTo(4,128); c.quadraticCurveTo(14,98,40,94); c.lineTo(88,94); c.quadraticCurveTo(114,98,124,128); c.closePath(); c.fill();
  c.fillStyle='#d9d2c3'; c.beginPath(); c.moveTo(48,94); c.lineTo(80,94); c.lineTo(64,124); c.closePath(); c.fill();
  c.fillStyle=shade(fam,1.1); c.beginPath(); c.moveTo(60,98); c.lineTo(68,98); c.lineTo(70,124); c.lineTo(58,124); c.closePath(); c.fill();
  c.strokeStyle=shade(fam,.35); c.lineWidth=2; sLine(c,48,94,62,126); sLine(c,80,94,66,126);
  // hals og hode
  c.fillStyle=skin; c.fillRect(54,78,20,18);
  c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(54,78,20,6);
  c.fillStyle=skin; c.beginPath(); c.ellipse(41-6*(fw-1)*10/2,64,4,7,0,0,Math.PI*2); c.ellipse(87+6*(fw-1)*10/2,64,4,7,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(64,62,22*fw,26,0,0,Math.PI*2); c.fill();
  c.fillStyle=hair; c.fillRect(64-22*fw,42,6,14); c.fillRect(64+22*fw-6,42,6,14);
  if(stub){c.fillStyle='rgba(30,20,15,.18)';c.beginPath();c.ellipse(64,76,17*fw,11,0,0,Math.PI);c.fill()}
  // ansikt
  c.fillStyle='rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(64,49,23*fw,6,0,0,Math.PI*2); c.fill(); // skygge fra hattebremmen
  c.strokeStyle='#1c140f'; c.lineWidth=3; c.lineCap='round';
  sLine(c,48,57+brow*.5,59,59-brow); sLine(c,80,57+brow*.5,69,59-brow);
  sCirc(c,54,63,2.6,'#111'); sCirc(c,74,63,2.6,'#111');
  c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=2; c.beginPath(); c.moveTo(64,64); c.lineTo(61,74); c.lineTo(67,75); c.stroke();
  c.strokeStyle='#4a2a22'; c.lineWidth=2; c.beginPath(); c.moveTo(56,82); c.quadraticCurveTo(64,80,72,83); c.stroke();
  if(stache){c.fillStyle='#2a1d14';c.beginPath();c.moveTo(54,80);c.quadraticCurveTo(64,74,74,80);c.quadraticCurveTo(64,78,54,80);c.fill();c.fillRect(56,77,16,3)}
  if(scar){c.strokeStyle='rgba(150,60,55,.8)';c.lineWidth=1.6;sLine(c,74,68,82,78);sLine(c,76,71,79,70);sLine(c,78,74,81,73)}
  if(cig){c.save();c.translate(70,82);c.rotate(.18);c.fillStyle='#6b4a2e';c.fillRect(0,-2,22,5);c.fillStyle='#d9d2c3';c.fillRect(0,-2,4,5);sCirc(c,23,.5,2.6,'#ff8a3a');c.restore();
    c.fillStyle='rgba(220,220,220,.18)';c.beginPath();c.ellipse(98,70,6,10,.4,0,Math.PI*2);c.fill()}
  // hatt
  c.fillStyle=hat;
  if(ht===0){c.beginPath();c.moveTo(42,44);c.lineTo(46,18);c.quadraticCurveTo(64,24,82,18);c.lineTo(86,44);c.closePath();c.fill();
    c.beginPath();c.ellipse(64,44,42,8,0,0,Math.PI*2);c.fill();c.fillStyle=fam;c.fillRect(43,35,42,6);
    c.fillStyle='rgba(255,255,255,.07)';c.fillRect(47,20,8,15)}
  else if(ht===1){c.beginPath();c.ellipse(64,40,27,17,0,Math.PI,0);c.fill();c.fillRect(37,38,54,6);c.beginPath();c.ellipse(64,46,30,6,0,0,Math.PI);c.fill();
    c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;sLine(c,64,23,64,40)}
  else{c.beginPath();c.arc(64,42,24,Math.PI,0);c.fill();c.beginPath();c.ellipse(64,43,34,6,0,0,Math.PI*2);c.fill();c.fillStyle=fam;c.fillRect(40,36,48,5);
    c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.arc(56,30,6,0,Math.PI*2);c.fill()}
  const url=cv.toDataURL('image/png'); PORTRAITS.set(key,url); return url;
}
function stageBg(c){
  const g=c.createLinearGradient(0,0,0,200); g.addColorStop(0,'#0e1116'); g.addColorStop(1,'#1c1714');
  c.fillStyle=g; c.fillRect(0,0,640,200);
  c.fillStyle='#3b2620'; c.fillRect(0,70,640,130);
  c.strokeStyle='#26170f'; c.lineWidth=1;
  for(let y=70,row=0;y<200;y+=11,row++){sLine(c,0,y,640,y);for(let x=row%2?0:13;x<640;x+=26)sLine(c,x,y,x,y+11)}
  [[80,96],[510,96]].forEach(([x,y])=>{c.fillStyle='#16110d';c.fillRect(x,y,56,42);c.fillStyle='rgba(214,150,70,.35)';c.fillRect(x+4,y+4,22,34);c.fillRect(x+30,y+4,22,34)});
  c.fillStyle='#34302b'; c.fillRect(0,200,640,32); c.fillStyle='#4a443d'; c.fillRect(0,229,640,3);
  c.fillStyle='#1a1817'; c.fillRect(0,232,640,38);
  const lg=c.createRadialGradient(320,88,4,320,88,150); lg.addColorStop(0,'rgba(255,210,140,.28)'); lg.addColorStop(1,'rgba(255,210,140,0)');
  c.fillStyle=lg; c.fillRect(150,0,340,232);
  c.fillStyle='#262626'; c.fillRect(318,84,5,148); c.fillStyle='#3a3530'; c.fillRect(309,76,23,10); sCirc(c,320,89,4,'#ffe2a8');
}
function stageHud(c,name,fam,hp,left){
  const w=190, x=left?16:624-w, tx=left?x:x+w;
  c.textAlign=left?'left':'right';
  c.font="700 16px 'Archivo Narrow',sans-serif"; c.fillStyle=FAMHEX[fam]; c.fillText(name,tx,22);
  c.fillStyle='#2a231c'; c.fillRect(x,30,w,8);
  c.fillStyle=hp<=8?'#c4554a':'#86ab6d'; c.fillRect(left?x:x+w-w*Math.max(0,hp)/MAXHP,30,w*Math.max(0,hp)/MAXHP,8);
  c.font="13px 'Archivo Narrow',sans-serif"; c.fillStyle='#eee4d1'; c.fillText(`Helse ${Math.round(hp)}/${MAXHP}`,tx,54);
}
function drawFight(c,e,t){
  const cl=p=>Math.max(0,Math.min(1,p)), ease=p=>1-Math.pow(1-p,3), lerp=(a,b,p)=>a+(b-a)*p;
  const A={id:e.aid,fam:e.a,mus:e.am,bm:e.abm,w:e.aw}, D={id:e.did,fam:e.d,mus:e.dm,bm:e.dbm,w:e.dw}, wA=wpnOf(A), wD=wpnOf(D);
  stageBg(c);
  const pin=ease(cl(t/600)), ax=-90+290*pin, dx=730-290*pin;
  const qa=cl((t-700)/600), qb=cl((t-1400)/600), onA=t>=700&&t<1300, onB=t>=1400&&t<2000;
  const dmgD=e.dhp0-e.dhp1, dmgA=e.ahp0-e.ahp1;
  const fire=(q,w)=>{const ms=q*600;return w==='tommy'?ms%90<45:(w==='shotgun'||w==='rifle')?(ms>90&&ms<190):(ms>80&&ms<140)||(ms>330&&ms<390)};
  const melee=w=>w==='bat'||w==='fists';
  const flA=onA&&!melee(wA)&&fire(qa,wA), flB=onB&&!melee(wD)&&fire(qb,wD);
  const lunge=(on,q,w)=>on&&melee(w)?Math.sin(q*Math.PI)*(w==='fists'?150:130):0;
  // balltre: ett slag; knyttnever: tre raske støt
  const swing=(on,q,w)=>!on?0:w==='bat'?cl((q-.3)*3)*1.7:w==='fists'&&q>.3&&q<.55?Math.abs(Math.sin((q-.3)*Math.PI*6)):0;
  const hitD=onA&&qa>.15&&dmgD>0, hitA=onB&&qb>.15&&dmgA>0;
  const fallA=e.ahp1<=0?ease(cl((t-2100)/500)):0, fallD=e.dhp1<=0?ease(cl((t-2100)/500)):0;
  const jolt=h=>h?Math.abs(Math.sin(t*.06))*6:0;
  drawGangster(c,D,dx,-1,{dx:lunge(onB,qb,wD)-jolt(hitD),swing:swing(onB,qb,wD),flash:flB,hit:hitD,fall:fallD,alpha:1-.45*fallD});
  drawGangster(c,A,ax,1,{dx:lunge(onA,qa,wA)-jolt(hitA),swing:swing(onA,qa,wA),flash:flA,hit:hitA,fall:fallA,alpha:1-.45*fallA});
  c.strokeStyle='rgba(255,220,140,.6)'; c.lineWidth=1.5;
  if(flA){const [mx,my]=muzzle(wA);sLine(c,ax+mx,230+my,dx-6,128+Math.sin(t)*8)}
  if(flB){const [mx,my]=muzzle(wD);sLine(c,dx-mx,230+my,ax+6,128+Math.cos(t)*8)}
  const float=(t0,x,dmg)=>{if(dmg<=0||t<t0)return;const p=cl((t-t0)/900);if(p>=1)return;
    c.globalAlpha=1-p;c.fillStyle='#ff7a6a';c.font="700 24px 'Archivo Narrow',sans-serif";c.textAlign='center';c.fillText('-'+dmg,x,100-p*30);c.globalAlpha=1};
  float(850,dx+45,dmgD); float(1550,ax-45,dmgA);
  stageHud(c,e.an,e.a,lerp(e.ahp0,e.ahp1,cl((t-1500)/450)),true);
  stageHud(c,e.dn,e.d,lerp(e.dhp0,e.dhp1,cl((t-800)/450)),false);
  if(t>600){
    c.globalAlpha=cl((t-600)/250); c.font="13px 'Archivo Narrow',sans-serif"; c.fillStyle='#a39580';
    c.textAlign='left'; c.fillText(`Muskler ${e.am}${e.aw?' ('+WEAP[e.aw].n+')':''} + kast ${e.dieA} = ${e.am+e.dieA}`,16,70);
    c.textAlign='right'; c.fillText(`Muskler ${e.dm}${e.dw?' ('+WEAP[e.dw].n+')':''} + kast ${e.dieD}${e.bon?' + bonus '+e.bon:''} = ${e.dm+e.dieD+e.bon}`,624,70);
    c.globalAlpha=1;
  }
  if(t>2000){
    c.globalAlpha=cl((t-2000)/300); c.textAlign='center';
    c.font="17px Limelight, Georgia, serif"; c.fillStyle='#d0aa5f';
    c.fillText(e.won?`${e.an} vant kampen`:`${e.dn} slo angrepet tilbake`,320,251);
    if(e.dead.length&&t>2600){c.globalAlpha=cl((t-2600)/300);c.font="700 12px 'Archivo Narrow',sans-serif";c.fillStyle='#ff7a6a';c.fillText(`${e.dead.join(' og ')} havnet i elva`,320,266)}
    c.globalAlpha=1;
  }
}
function stageCtx(){
  const cv=document.getElementById('stageCv'), W=cv.clientWidth||600, dpr=window.devicePixelRatio||1;
  cv.width=Math.round(W*dpr); cv.height=Math.round(W*270/640*dpr);
  const c=cv.getContext('2d'); c.setTransform(dpr*W/640,0,0,dpr*W/640,0,0);
  return c;
}
// Stillbilde for hendelser uten kamp, så feltet beholder samme størrelse
function drawStill(e){
  const c=stageCtx(); stageBg(c);
  c.fillStyle='rgba(10,9,8,.55)'; c.fillRect(0,0,640,270);
  c.textAlign='center';
  if(e&&e.k==='infl'){
    c.font="34px Limelight, Georgia, serif"; c.fillStyle=FAMHEX[e.f]; c.fillText(BK[e.bk].n,320,130);
    c.font="16px 'Archivo Narrow',sans-serif"; c.fillStyle='#eee4d1';
    c.fillText(`${CO(e.x,e.y)} · betaler nå ${FAM[e.f].name} · +$${BK[e.bk].v}/mnd`,320,162);
  }else if(e&&e.k==='take'){
    c.font="34px Limelight, Georgia, serif"; c.fillStyle=FAMHEX[e.f]; c.fillText('Overtakelse',320,130);
    c.font="16px 'Archivo Narrow',sans-serif"; c.fillStyle='#eee4d1';
    c.fillText(`${CO(e.x,e.y)} · ${TYPES[blk(e.x,e.y).t].n} · ${FAM[e.f].name}`,320,162);
  }else{
    c.font="28px Limelight, Georgia, serif"; c.fillStyle='#d0aa5f'; c.fillText(e?'Kamp':'En rolig måned',320,140);
  }
}
function startStage(e){
  cancelAnimationFrame(stageRaf);
  const c=stageCtx();
  const END=3200, still=matchMedia('(prefers-reduced-motion: reduce)').matches, t0=performance.now();
  const loop=now=>{const t=still?END:now-t0; drawFight(c,e,t); if(t<END)stageRaf=requestAnimationFrame(loop)};
  stageRaf=requestAnimationFrame(loop);
  if(!still)fightSfx(e);
}
function updateStage(e){
  const ok=!!(e&&e.k==='fight'&&e.aid!=null);
  if(!ok){cancelAnimationFrame(stageRaf);stageKey='';return}
  const key=[S.events.t,e.x,e.y,e.aid,e.did,e.dhp0].join('|');
  if(key===stageKey)return; stageKey=key;
  startStage(e);
}
