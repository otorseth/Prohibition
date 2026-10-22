// Kampscenen, gangsterfigurer og portretter
/* ---------- kampscene ---------- */
const SKIN=['#e0b48c','#c99a6e','#a87650','#f0c8a0','#7a5236'], HATS=['#1d1c1c','#3a3530','#4a4238','#262a30','#5a5048'];
let stageKey='', stageRaf=0, bigRaf=0;
function shade(hex,k){const n=parseInt(hex.slice(1),16),f=v=>Math.min(255,Math.round(v*k));return `rgb(${f(n>>16&255)},${f(n>>8&255)},${f(n&255)})`}
function sLine(c,a,b,x,y){c.beginPath();c.moveTo(a,b);c.lineTo(x,y);c.stroke()}
function sCirc(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function sPath(c,p){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
function sStar(c,x,y,r1,r2,col){c.fillStyle=col;c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,rr=i%2?r2:r1;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}
// Eldre hendelser har ikke våpen lagret; da velges figurens våpen ut fra muskler som før
const wpnOf=G=>G.w!==undefined?(G.w?WEAP[G.w].d:'fists'):(G.mus>=7?'tommy':G.mus>=4?'pistol':'bat');
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
/* ---------- kampscene: bakgrunner ---------- */
// Én bakgrunn per kvartalstype. Tallet er hvor bakken (fortauet) ligger, som andel av bildehøyden.
const BG_SRC={bolig:'img/bg/bolig.jpg',komm:'img/bg/komm.jpg',ind:'img/bg/ind.jpg',havn:'img/bg/havn.jpg',politi:'img/bg/politi.jpg',hq:'img/bg/hq.jpg'};
const BG_GROUND={bolig:.925,komm:.875,ind:.875,havn:.905,politi:.93,hq:.885};
const BG_IMG={};
for(const [k,src] of Object.entries(BG_SRC)){const im=new Image();im.onload=()=>{BG_IMG[k]=im};im.src=src}
// Tegner bakgrunnen og returnerer hvor bakken ligger (y i scenen)
function sceneBg(c,type){
  const im=GFX==='noir'&&BG_IMG[type];
  if(!im){stageBg(c);return 232}
  const h=640*im.height/im.width, y0=(270-h)/2;
  c.drawImage(im,0,y0,640,h);
  c.fillStyle='rgba(8,6,5,.30)'; c.fillRect(0,0,640,270); // demp bakgrunnen så figurene trer fram
  return y0+h*BG_GROUND[type];
}

/* ---------- kampscene: riggede figurer ---------- */
// Figurene har ledd (hofte, knær, skuldre, albuer) og styres med «invers kinematikk»:
// en positur sier hvor hender og føtter skal være, og leddene regnes ut.
const FIG_SCALE=.9;
const cl01=p=>Math.max(0,Math.min(1,p)), easeOut=p=>1-Math.pow(1-p,3), easeIO=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2, lerp=(a,b,p)=>a+(b-a)*p;
const pulse=d=>d<0?0:d<50?d/50:Math.exp(-(d-50)/90); // rask topp og myk nedtoning etter et treff eller skudd
function ik(ax,ay,tx,ty,l1,l2,bend){
  let dx=tx-ax,dy=ty-ay,d=Math.hypot(dx,dy); const mx=l1+l2-.01;
  if(d>mx){tx=ax+dx/d*mx;ty=ay+dy/d*mx;d=mx} if(d<.001)d=.001;
  const a=Math.atan2(ty-ay,tx-ax), A=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)), b=a+bend*A;
  return {ex:ax+Math.cos(b)*l1,ey:ay+Math.sin(b)*l1,tx,ty};
}
// Våpenets munning i forhold til grepet (løpet peker langs +x)
const MUZ={tommy:[47,-3],pistol:[20,-4],revolver:[21,-4],derringer:[10,-2],shotgun:[27,-4],rifle:[53,-5]};
const LONG=w=>w==='tommy'||w==='shotgun'||w==='rifle';
const MELEE=w=>w==='fists'||w==='bat';
function drawWeapon(c,w,rim){
  const box=(x,y,ww,hh,col)=>{c.fillStyle=rim||col;c.fillRect(x,y,ww,hh);if(rim){c.strokeStyle=rim;c.lineWidth=2.6;c.strokeRect(x,y,ww,hh)}};
  const dark='#2a2622', wood='#5a3b24', steel='#3a3633';
  if(w==='tommy'){box(-22,-5,18,8,wood);box(-6,-6,40,7,dark);c.fillStyle=rim||'#1a1816';c.beginPath();c.arc(8,5,7+(rim?1.3:0),0,Math.PI*2);c.fill();box(20,0,4,9,dark);box(32,-5,14,4,steel)}
  else if(w==='pistol'){box(-4,-6,22,6,dark);box(-3,-1,6,9,dark)}
  else if(w==='revolver'){box(-4,-6,24,5,dark);box(0,-8,9,9,steel);box(-4,-1,6,9,wood)}
  else if(w==='derringer'){box(-3,-4,12,4,steel);box(-3,-1,4,6,wood)}
  else if(w==='shotgun'){box(-20,-5,18,8,wood);box(-4,-6,30,4,dark);box(-4,-2,30,3,dark)}
  else if(w==='rifle'){box(-28,-5,24,7,wood);box(-6,-4,40,4,wood);box(-6,-7,58,3,dark)}
  else if(w==='bat'){c.strokeStyle=rim||'#8a6a42';c.lineCap='round';c.lineWidth=5+(rim?2.6:0);sLine(c,0,0,30,0);c.lineWidth=8+(rim?2.6:0);sLine(c,28,0,46,0)}
}
// Utseende fra bandens id: samme trekk som portrettet
function looks(G){
  const R=rng(G.id*2654435761+7), pk=a=>a[Math.floor(R()*a.length)];
  return {skin:pk(SKIN),hat:pk(HATS),ht:Math.floor(R()*3),stache:R()<.5,cig:R()<.35,fam:FAMHEX[G.fam],bw:1+((G.bm??G.mus)-5)*.04};
}
// Tegner én figur. P = positur, o = plassering. rim = farge for lyskanten (tegnes først, litt større).
function drawFigure(c,L,w,P,o,rim){
  const out={};
  const sc=FIG_SCALE*(o.s||1);
  c.save(); c.translate(o.x,o.ground); c.scale(o.face*sc,sc);
  if(o.fall)c.rotate(-o.fall*1.42);
  if(rim)c.translate(0,-1.6);
  const W=n=>n+(rim?2.6:0), col=x=>rim||x;
  const hip=[0,-60+P.crouch*22], up=[Math.sin(P.lean),-Math.cos(P.lean)];
  const at=d=>[hip[0]+up[0]*d,hip[1]+up[1]*d];
  const neck=at(50), sh=at(44), shF=[sh[0]+3,sh[1]], shB=[sh[0]-4,sh[1]+1];
  const coat=shade(L.fam,.38), coatB=shade(L.fam,.28), trou='#141312', shoe='#090808';
  c.lineCap='round';
  const limb=(ax,ay,k,w1,w2,cl)=>{c.strokeStyle=col(cl);c.lineWidth=W(w1);sLine(c,ax,ay,k.ex,k.ey);c.lineWidth=W(w2);sLine(c,k.ex,k.ey,k.tx,k.ty)};
  const blob=(x,y,r,cl)=>{c.fillStyle=col(cl);c.beginPath();c.arc(x,y,r+(rim?1.3:0),0,Math.PI*2);c.fill()};
  // hender
  let hF=[shF[0]+P.fH[0],shF[1]+P.fH[1]];
  const armF=ik(shF[0],shF[1],hF[0],hF[1],24,22,1); hF=[armF.tx,armF.ty];
  const bT=P.twoHand?[hF[0]+Math.cos(P.wAng)*P.twoHand,hF[1]+Math.sin(P.wAng)*P.twoHand]:[shB[0]+P.bH[0],shB[1]+P.bH[1]];
  const armB=ik(shB[0],shB[1],bT[0],bT[1],24,22,1);
  // bakre arm og bein
  limb(shB[0],shB[1],armB,9,8,coatB); blob(armB.tx,armB.ty,w==='fists'?5:3.8,shade(L.skin,.8));
  const leg=(i)=>{const [fx,fy]=P.feet[i], hx=hip[0]+(i?-3:3), k=ik(hx,hip[1],fx,fy,30,30,-1);
    limb(hx,hip[1],k,12*L.bw,10,i?'#0f0e0d':trou); c.fillStyle=col(shoe);c.beginPath();c.ellipse(k.tx+4,k.ty-2,W(8),W(3.5),0,0,Math.PI*2);c.fill()};
  leg(1); leg(0);
  // frakk, skjorte og slips
  c.save(); c.translate(hip[0],hip[1]); c.rotate(P.lean);
  c.fillStyle=col(coat); c.beginPath();
  c.moveTo(-14*L.bw,-47);c.lineTo(15*L.bw,-47);c.lineTo(13*L.bw,-8);c.lineTo(18*L.bw,24);c.lineTo(-16*L.bw,24);c.lineTo(-12*L.bw,-8);c.closePath(); c.fill();
  if(rim){c.strokeStyle=rim;c.lineWidth=2.6;c.stroke()}
  else{
    c.fillStyle='#cfc6b5'; sPath(c,[[-1,-47],[9,-47],[4,-33]]); c.fill();
    c.fillStyle=L.fam; c.fillRect(2.5,-46,3,15);
    c.strokeStyle=shade(L.fam,.22); c.lineWidth=1.2; sLine(c,-1,-47,4,-30); sLine(c,9,-47,4,-30); sLine(c,4,-30,1,24);
    c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(-12*L.bw,-6,25*L.bw,3); // belte/skygge
  }
  c.restore();
  // hode (gjenbruker profilen fra før, skalert)
  c.save(); c.translate(neck[0],neck[1]); c.rotate(P.lean+P.head); c.scale(.8,.8); c.translate(-1,131);
  c.fillStyle=col(L.skin); c.fillRect(-4,-131,8,10);
  blob(1,-142,14,L.skin);
  if(!rim){
    sCirc(c,-6,-141,3.5,'rgba(0,0,0,.2)'); sCirc(c,7,-144,1.8,'#111');
    c.fillStyle='rgba(0,0,0,.28)'; c.fillRect(-13,-147,28,6); // skygge fra hattebremmen
    if(L.stache){c.fillStyle='#2a1d14';c.fillRect(5,-136,9,3)}
    if(L.cig){c.fillStyle='#6b4a2e';c.fillRect(12,-134,11,3);sCirc(c,23.5,-132.5,1.8,'#ff8a3a')}
  }
  c.fillStyle=col(L.hat);
  if(L.ht===0){c.beginPath();c.ellipse(2,-152,W(23),W(4.5),0,0,Math.PI*2);c.fill();c.fillRect(-12,-170,27,19);if(!rim){c.fillStyle=L.fam;c.fillRect(-12,-157,27,4)}}
  else if(L.ht===1){c.beginPath();c.ellipse(0,-152,W(15),W(10),0,Math.PI,0);c.fill();c.fillRect(8,-154,15,4)}
  else{c.beginPath();c.ellipse(1,-152,W(19),W(3.5),0,0,Math.PI*2);c.fill();c.beginPath();c.arc(1,-153,W(14),Math.PI,0);c.fill();if(!rim){c.fillStyle=L.fam;c.fillRect(-13,-156,28,3)}}
  if(rim&&L.ht===0){c.strokeStyle=rim;c.lineWidth=2.6;c.strokeRect(-12,-170,27,19)}
  c.restore();
  // fremre arm med våpen
  limb(shF[0],shF[1],armF,9.5,8.5,coat);
  if(w!=='fists'){c.save();c.translate(hF[0],hF[1]);c.rotate(P.wAng);drawWeapon(c,w,rim);c.restore()}
  blob(hF[0],hF[1],w==='fists'?5.5:4.2,L.skin);
  c.restore();
  // posisjoner i scenen (til effekter)
  const toW=(x,y)=>[o.x+x*o.face*sc,o.ground+y*sc];
  const m=MUZ[w]||[0,0];
  out.muzzle=toW(hF[0]+Math.cos(P.wAng)*m[0]-Math.sin(P.wAng)*m[1],hF[1]+Math.sin(P.wAng)*m[0]+Math.cos(P.wAng)*m[1]);
  out.hand=toW(hF[0],hF[1]); out.chest=toW(...at(30)); out.head=toW(...at(66));
  return out;
}

/* ---------- kampscene: slag med flere bander ---------- */
// Alle kamper i samme kvartal samme tur vises som ett slag. Hver kamp (utveksling) får sitt eget tidsvindu.
const EX_START=700, EX_LEN=1500, EX_COUNTER=700;
// Grunnpositurer per våpentype (hender i forhold til skulderen, våpenvinkel i radianer)
function readyPose(w,aim){
  if(MELEE(w)) return w==='fists'
    ? {fH:[22,-6],bH:[14,0],wAng:0,lean:.08,crouch:.12}
    : {fH:[2,-8],bH:[0,0],twoHand:7,wAng:-2.2,lean:.02,crouch:.08};
  if(LONG(w)) return {fH:[16,14],bH:[0,0],twoHand:18,wAng:aim?0:.45,lean:aim?.05:0,crouch:aim?.08:.02};
  return aim?{fH:[42,-1],bH:[-6,38],wAng:0,lean:.02,crouch:.05}:{fH:[24,22],bH:[-6,38],wAng:.9,lean:0,crouch:0};
}
const BATTLES=new Map();
// Bygger slaget som hendelsen e hører til: deltakere, sider, plasser og tidslinje
function buildBattle(e){
  const list=((S.events&&S.events.list)||[]).filter(o=>o.k==='fight'&&o.aid!=null&&o.x===e.x&&o.y===e.y);
  const ex=list.includes(e)?list:[e];
  const key=(S.events?S.events.t:0)+'|'+e.x+','+e.y+'|'+ex.length+'|'+(ex[0].aid||0);
  if(BATTLES.has(key))return BATTLES.get(key);
  const F=new Map();
  const add=(id,fam,mus,bm,w,name,hp)=>{if(!F.has(id))F.set(id,{id,fam,mus,bm,w,name,hp0:hp,acts:[],reacts:[],hpCh:[],deathT:null,L:null})};
  ex.forEach(o=>{add(o.aid,o.a,o.am,o.abm,o.aw,o.an,o.ahp0);add(o.did,o.d,o.dm,o.dbm,o.dw,o.dn,o.dhp0)});
  const all=[...F.values()], fams=[...new Set(all.map(f=>f.fam))];
  const leftFam=fams.includes(0)?0:ex[0].a;
  // familiene ordnes: venstre, hovedmotstanderen til høyre, så tredje og fjerde familie bak i midten
  const vs=fm=>ex.filter(o=>(o.a===leftFam&&o.d===fm)||(o.d===leftFam&&o.a===fm)).length;
  const cnt=fm=>all.filter(f=>f.fam===fm).length;
  const order=[leftFam,...fams.filter(x=>x!==leftFam).sort((p,q)=>vs(q)-vs(p)||cnt(q)-cnt(p))];
  const LAY={1:[[232,-1,0]],2:[[232,-1,0],[408,1,0]],3:[[178,-1,0],[462,1,0],[320,0,1]],4:[[160,-1,0],[480,1,0],[268,0,1],[372,0,1]]}[order.length];
  const gap=order.length>2?46:58;
  order.forEach((fm,gi)=>{const [ax,dir,back]=LAY[gi];
    all.filter(f=>f.fam===fm).forEach((f,i)=>{
      f.group=gi; f.slot=i; f.back=!!back; f.s=back?.86:1; f.depth=back?2:i%2;
      f.x=dir===0?ax+(i%2?1:-1)*Math.ceil(i/2)*44-(i?0:0):ax+dir*i*gap;
      f.side=f.x<320?'L':'R'; f.L=looks(f); f.wt=wpnOf({mus:f.mus,w:f.w});
    })});
  // standard retning: mot nærmeste fiende
  all.forEach(f=>{let best=null;all.forEach(o=>{if(o.fam!==f.fam&&(best==null||Math.abs(o.x-f.x)<Math.abs(best-f.x)))best=o.x});
    f.face=best==null?(f.side==='L'?1:-1):(best>=f.x?1:-1)});
  // plasser: første rad nærmest midten, de neste litt bakover og lenger ut
  ex.forEach((o,k)=>{
    const T=EX_START+k*EX_LEN, a=F.get(o.aid), d=F.get(o.did);
    a.acts.push({T,target:d.id}); d.reacts.push({T,from:a.id,dmg:o.dhp0-o.dhp1});
    d.acts.push({T:T+EX_COUNTER,target:a.id}); a.reacts.push({T:T+EX_COUNTER,from:d.id,dmg:o.ahp0-o.ahp1});
    d.hpCh.push({T:T+100,from:o.dhp0,to:o.dhp1}); a.hpCh.push({T:T+EX_COUNTER+100,from:o.ahp0,to:o.ahp1});
    if(o.dhp1<=0)d.deathT=T+EX_COUNTER-100; if(o.ahp1<=0)a.deathT=T+EX_LEN-150;
  });
  // en bande som er død, slår ikke tilbake
  F.forEach(f=>{if(f.deathT!=null)f.acts=f.acts.filter(a=>a.T<f.deathT)});
  const b={key,e,ex,F,list:[...F.values()],type:blk(e.x,e.y).t,end:EX_START+ex.length*EX_LEN+1100,leftFam};
  b.cues=[];F.forEach(f=>f.acts.forEach(a=>b.cues.push([a.T,f.wt])));
  BATTLES.set(key,b); if(BATTLES.size>40)BATTLES.delete(BATTLES.keys().next().value);
  return b;
}
function hpAt(f,t){let h=f.hp0;f.hpCh.forEach(c=>{if(t>=c.T)h=lerp(c.from,c.to,cl01((t-c.T)/450))});return h}
// Positur og plassering for én deltaker på tidspunkt t (ms)
function fighterState(f,b,t,ground){
  const w=f.wt, xStart=f.x<320?-70-f.slot*40:710+f.slot*40, enter=650+f.slot*90+(f.back?150:0);
  const tgtX=id=>b.F.get(id).x, dirTo=id=>tgtX(id)>=f.x?1:-1;
  // figuren snur seg mot den den angriper, eller mot den som angriper den
  let face=f.face;
  f.acts.forEach(a=>{if(t>=a.T-150&&t<a.T+650)face=dirTo(a.target)});
  f.reacts.forEach(r=>{if(t>=r.T-100&&t<r.T+700&&!f.acts.some(a=>t>=a.T-150&&t<a.T+650))face=dirTo(r.from)});
  const xAt=tt=>{
    let x=tt<enter?lerp(xStart,f.x,easeOut(cl01(tt/enter))):f.x;
    f.acts.forEach(a=>{const m=tt-a.T, d=dirTo(a.target);
      if(MELEE(w)&&m>0&&m<600)x+=d*Math.sin(m/600*Math.PI)*Math.max(20,Math.abs(tgtX(a.target)-f.x)-56);
      if(!MELEE(w))hitTimes(w).forEach(ts=>{if(m>ts)x-=d*pulse(m-ts)*(w==='shotgun'?6:w==='rifle'?4:2)})});
    f.reacts.forEach(r=>{const om=tt-r.T, ow=b.F.get(r.from).wt, d=dirTo(r.from);
      if(om>0&&r.dmg>1)hitTimes(ow).forEach(ts=>{if(om>ts)x-=d*Math.min(1,(om-ts)/140)*(8+r.dmg*.6)/hitTimes(ow).length*1.6})});
    return x;
  };
  const x=xAt(t), speed=Math.abs(x-xAt(t-40));
  const dead=f.deathT!=null&&t>f.deathT;
  const P={...readyPose(w,t>enter-30),head:0,feet:null};
  const br=Math.sin(t*.0035+f.id); P.lean+=br*.015; P.crouch+=(br+1)*.015;
  let flash=false;
  f.acts.forEach(a=>{const m=t-a.T; if(m<0||m>=650)return;
    if(w==='fists'){hitTimes(w).forEach((ts,i)=>{const p=pulse(m-ts);if(i%2)P.bH=[P.bH[0]+30*p,P.bH[1]-4*p];else P.fH=[P.fH[0]+28*p,P.fH[1]-2*p];P.lean+=.14*p})}
    else if(w==='bat'){const s=easeIO(cl01((m-290)/110)),back=cl01((m-480)/160);P.wAng=lerp(-2.2,.6,s)-back*.8;P.fH=[lerp(2,30,s),lerp(-8,10,s)];P.lean+=.25*s-.15*back}
    else hitTimes(w).forEach(ts=>{const p=pulse(m-ts)*(w==='shotgun'?1.6:w==='rifle'?1.3:w==='tommy'?.45:.9);
      P.wAng-=p*.35;P.fH=[P.fH[0]-p*3,P.fH[1]-p*4];P.lean-=p*.06;if(m>=ts&&m-ts<45)flash=true});
  });
  f.reacts.forEach(r=>{const om=t-r.T; if(om<0||om>=700)return; const ow=b.F.get(r.from).wt;
    if(r.dmg>1)hitTimes(ow).forEach(ts=>{const p=pulse(om-ts);P.lean-=.32*p;P.head-=.35*p;P.crouch+=.12*p;P.wAng+=.5*p});
    else{const d=Math.sin(cl01(om/600)*Math.PI);P.crouch+=.38*d;P.lean+=.18*d}});
  let fall=0;
  if(dead){const k=cl01((t-f.deathT)/650);P.crouch+=Math.min(1,k*2.2)*.5;P.lean-=.2*k;P.head-=.3*k;P.wAng=lerp(P.wAng,1.4,k);fall=easeIO(cl01((k-.25)/.75))}
  else{const last=Math.max(0,...f.acts.map(a=>a.T+650),...f.reacts.map(r=>r.T+700));
    if(t>last+300&&t>b.end-1000){const k=easeOut(cl01((t-Math.max(last+300,b.end-1000))/500)),r=readyPose(w,false);
      P.wAng=lerp(P.wAng,r.wAng,k);P.fH=[lerp(P.fH[0],r.fH[0],k),lerp(P.fH[1],r.fH[1],k)];if(hpAt(f,t)<=8){P.crouch+=.15*k;P.lean-=.05*k}}}
  const stride=cl01(speed/5), ph=x*.11*face, wide=MELEE(w)?11:13;
  P.feet=[[lerp(wide,12*Math.sin(ph)+3,stride),-Math.max(0,Math.cos(ph))*8*stride],[lerp(-wide+2,-12*Math.sin(ph)-3,stride),-Math.max(0,-Math.cos(ph))*8*stride]];
  if(stride>.2)P.crouch+=Math.abs(Math.cos(ph*2))*.04;
  return {P,o:{x,ground:ground-f.depth*7,face,fall,s:f.s},flash,dead};
}
function battleHud(c,b,t){
  const byGroup=(p,q)=>p.group-q.group||p.slot-q.slot;
  const sides=[b.list.filter(f=>f.side==='L').sort(byGroup),b.list.filter(f=>f.side==='R').sort(byGroup)];
  const rows=Math.max(sides[0].length,sides[1].length), big=rows===1;
  c.fillStyle='rgba(8,6,5,.55)'; c.fillRect(0,0,640,big?78:16+rows*20);
  if(big){stageHud(c,sides[0][0].name,sides[0][0].fam,hpAt(sides[0][0],t),true);if(sides[1][0])stageHud(c,sides[1][0].name,sides[1][0].fam,hpAt(sides[1][0],t),false);return 78}
  sides.forEach((arr,si)=>arr.forEach((f,i)=>{
    const left=si===0, y=14+i*20, hp=hpAt(f,t), w=110, bx=left?16:624-w, dead=f.deathT!=null&&t>f.deathT+300;
    c.globalAlpha=dead?.45:1; c.textAlign=left?'left':'right';
    c.font="700 12px 'Archivo Narrow',sans-serif"; c.fillStyle=FAMHEX[f.fam];
    c.fillText(f.name+(dead?' ✝':''),left?bx+w+10:bx-10,y+4);
    c.fillStyle='#2a231c'; c.fillRect(bx,y-4,w,6);
    c.fillStyle=hp<=8?'#c4554a':'#86ab6d'; c.fillRect(left?bx:bx+w-w*Math.max(0,hp)/MAXHP,y-4,w*Math.max(0,hp)/MAXHP,6);
    c.globalAlpha=1;
  }));
  return 16+rows*20;
}
function drawFight(c,e,t){
  const b=buildBattle(e);
  let shake=0; b.cues.forEach(([T,w])=>hitTimes(w).forEach(ts=>{const tt=T+ts;if(t>=tt)shake+=Math.exp(-(t-tt)/90)*(w==='shotgun'?4.5:w==='rifle'?3.5:MELEE(w)?2.5:w==='tommy'?1.1:1.8)}));
  const zoom=1+.06*easeIO(cl01((t-500)/(b.end-500)));
  c.save(); c.fillStyle='#0b0908'; c.fillRect(0,0,640,270);
  c.translate(320+Math.sin(t*.9)*shake,150+Math.cos(t*1.3)*shake); c.scale(zoom,zoom); c.translate(-320,-150);
  const ground=sceneBg(c,b.type);
  const st=new Map(b.list.map(f=>[f.id,fighterState(f,b,t,ground)]));
  // skygger, så figurene bakerst først
  b.list.forEach(f=>{const s=st.get(f.id);c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(s.o.x-s.o.face*40*s.o.fall,s.o.ground+1,24+30*s.o.fall,4,0,0,Math.PI*2);c.fill()});
  const pos=new Map(), rimCol='rgba(240,222,190,.55)';
  [...b.list].sort((p,q)=>q.depth-p.depth||q.slot-p.slot).forEach(f=>{ // bakerste rad først
    if(f.back){c.save();c.globalAlpha=.92}
    const s=st.get(f.id); drawFigure(c,f.L,f.wt,s.P,s.o,rimCol); pos.set(f.id,drawFigure(c,f.L,f.wt,s.P,s.o));
    if(f.back)c.restore();
  });
  // partikler for hver utveksling
  const R=rng(b.ex[0].aid*31+b.ex[0].did*17);
  const particles=(T,w,sh,tg,face,dmg)=>{
    const a=t-T; if(a<0)return;
    if(!MELEE(w)){
      for(let i=0;i<3;i++){const aa=a-i*40;if(aa<0||aa>1300)continue;const r=5+aa*.018;
        c.fillStyle=`rgba(205,198,186,${.2*(1-aa/1300)})`;c.beginPath();c.arc(sh.muzzle[0]+face*(6+aa*.012)+i*3,sh.muzzle[1]-aa*.022-i*2,r,0,Math.PI*2);c.fill()}
      if(w!=='revolver'&&w!=='derringer'){const vx=-face*(.045+R()*.03),vy=-.13-R()*.04,g=.0006;const tt=Math.min(a,(-(vy)+Math.sqrt(vy*vy+2*g*Math.max(1,ground-sh.hand[1])))/g);
        const hx=sh.hand[0]+vx*tt, hy=Math.min(ground-1,sh.hand[1]+vy*tt+.5*g*tt*tt);c.fillStyle='#d9b36a';c.save();c.translate(hx,hy);c.rotate(a*.03);c.fillRect(-1.5,-.8,3,1.6);c.restore()}
    }
    if(a<650)for(let i=0;i<7;i++){const vx=face*(.04+R()*.12),vy=-.12+R()*.16,g=.0005,px=tg.chest[0]+vx*a,py=tg.chest[1]+vy*a+.5*g*a*a;
      if(dmg>1){c.fillStyle=`rgba(110,14,10,${.85*(1-a/650)})`;c.beginPath();c.arc(px,py,1.6+R()*1.4,0,Math.PI*2);c.fill()}
      else if(!MELEE(w)&&a<220){c.fillStyle=`rgba(255,230,170,${1-a/220})`;c.fillRect(tg.chest[0]+face*14+vx*a*1.5,tg.chest[1]-10+vy*a*1.5,2,2)}}
  };
  b.list.forEach(f=>f.acts.forEach(a=>{const tg=b.F.get(a.target), r=tg.reacts.find(x=>x.T===a.T&&x.from===f.id);
    hitTimes(f.wt).forEach(ts=>particles(a.T+ts,f.wt,pos.get(f.id),pos.get(tg.id),tg.x>=f.x?1:-1,r?r.dmg:0))}));
  // munningsflammer lyser opp scenen
  b.list.forEach(f=>{const s=st.get(f.id),p=pos.get(f.id); if(!s.flash)return;
    const act=f.acts.find(a=>t>=a.T&&t<a.T+650), tg=act&&pos.get(act.target);
    c.save(); c.globalCompositeOperation='lighter';
    const g=c.createRadialGradient(p.muzzle[0],p.muzzle[1],2,p.muzzle[0],p.muzzle[1],190);
    g.addColorStop(0,'rgba(255,200,120,.45)'); g.addColorStop(1,'rgba(255,200,120,0)'); c.fillStyle=g; c.fillRect(0,0,640,270); c.restore();
    const big=f.wt==='shotgun'?1.7:f.wt==='rifle'?1.3:1;
    sStar(c,p.muzzle[0],p.muzzle[1],11*big,4*big,'#ffe2a0'); sCirc(c,p.muzzle[0],p.muzzle[1],3.5*big,'#fff8e8');
    if(tg){c.strokeStyle='rgba(255,226,160,.5)';c.lineWidth=1.2;sLine(c,p.muzzle[0],p.muzzle[1],tg.chest[0]+Math.sin(t)*6,tg.chest[1]+Math.cos(t*1.7)*10)}
  });
  c.strokeStyle='rgba(210,215,225,.13)'; c.lineWidth=1; c.beginPath();
  for(let i=0;i<90;i++){const x=((i*97+t*.35)%720)-40, y=((i*61+t*.95)%320)-30; c.moveTo(x,y); c.lineTo(x-3,y+11)}
  c.stroke();
  c.restore();
  const v=c.createRadialGradient(320,150,120,320,150,380); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.6)');
  c.fillStyle=v; c.fillRect(0,0,640,270);
  // skadetall over den som blir truffet
  b.list.forEach(f=>f.reacts.forEach(r=>{const t0=r.T+150; if(r.dmg<=0||t<t0)return; const k=cl01((t-t0)/900); if(k>=1)return; const p=pos.get(f.id);
    c.globalAlpha=1-k;c.fillStyle='#ff7a6a';c.font="700 24px 'Archivo Narrow',sans-serif";c.textAlign='center';c.fillText('-'+r.dmg,p.head[0],p.head[1]-24-k*26);c.globalAlpha=1}));
  const hudH=battleHud(c,b,t);
  // terningkast for utvekslingen som pågår
  const k=Math.floor((t-EX_START)/EX_LEN), o=b.ex[clamp(k,0,b.ex.length-1)];
  if(t>600&&t<b.end-900){
    c.globalAlpha=cl01((t-600)/250); c.font="13px 'Archivo Narrow',sans-serif"; c.fillStyle='#b8aa94';
    if(b.ex.length===1){
      c.textAlign='left'; c.fillText(`Muskler ${o.am}${o.aw?' ('+WEAP[o.aw].n+')':''} + kast ${o.dieA} = ${o.am+o.dieA}`,16,70);
      c.textAlign='right'; c.fillText(`Muskler ${o.dm}${o.dw?' ('+WEAP[o.dw].n+')':''} + kast ${o.dieD}${o.bon?' + bonus '+o.bon:''} = ${o.dm+o.dieD+o.bon}`,624,70);
    }else{
      c.fillStyle='rgba(8,6,5,.6)'; c.fillRect(0,244,640,26); c.fillStyle='#d8ccb6'; c.textAlign='center';
      c.fillText(`Kamp ${clamp(k,0,b.ex.length-1)+1} av ${b.ex.length}: ${o.an} angriper ${o.dn} · ${o.am+o.dieA} mot ${o.dm+o.dieD+o.bon}`,320,261);
    }
    c.globalAlpha=1;
  }
  const tEnd=b.end-1100;
  if(t>tEnd+300){
    const kk=cl01((t-tEnd-300)/300), dead=b.list.filter(f=>f.deathT!=null);
    c.fillStyle=`rgba(8,6,5,${.6*kk})`; c.fillRect(0,236,640,34);
    c.globalAlpha=kk; c.textAlign='center'; c.font="17px Limelight, Georgia, serif"; c.fillStyle='#d0aa5f';
    let txt;
    if(b.ex.length===1)txt=o.won?`${o.an} vant kampen`:`${o.dn} slo angrepet tilbake`;
    else{
      const fams=[...new Set(b.list.map(f=>f.fam))], loss=fm=>dead.filter(f=>f.fam===fm).length;
      if(fams.length>2){txt=dead.length?`Tap i ${CO(e.x,e.y)}: `+fams.map(fm=>`${FAM[fm].name} ${loss(fm)}`).join(' · '):`Slaget i ${CO(e.x,e.y)} endte uten døde`}
      else{const dl=loss(b.leftFam), dr=dead.length-dl;
        txt=dl===dr?`Slaget i ${CO(e.x,e.y)} endte uavgjort`:`${dl<dr?FAM[b.leftFam].name:FAM[fams.find(x=>x!==b.leftFam)].name} vant slaget i ${CO(e.x,e.y)}`}}
    c.fillText(txt,320,252);
    if(dead.length&&t>tEnd+700){c.globalAlpha=cl01((t-tEnd-700)/300);c.font="700 12px 'Archivo Narrow',sans-serif";c.fillStyle='#ff7a6a';c.fillText(`${dead.map(f=>f.name).join(', ')} havnet i elva`,320,266)}
    c.globalAlpha=1;
  }
}
function fightEnd(e){return buildBattle(e).end}
function stageCtx(id='stageCv'){
  const cv=document.getElementById(id), W=cv.clientWidth||600, dpr=window.devicePixelRatio||1;
  cv.width=Math.round(W*dpr); cv.height=Math.round(W*270/640*dpr);
  const c=cv.getContext('2d'); c.setTransform(dpr*W/640,0,0,dpr*W/640,0,0);
  return c;
}
// Stillbilde for hendelser uten kamp, så feltet beholder samme størrelse
function drawStill(e){
  const c=stageCtx(); sceneBg(c,e?blk(e.x,e.y).t:'bolig');
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
// Stor visning: kamper spilles av på et stort lerret over spillet.
// Etter hver tur vises dine kamper automatisk, én etter én (kan slås av).
let bigQueue=[], bigIdx=0, bigTimer=0;
let FIGHT_POPUP=true;
try{FIGHT_POPUP=localStorage.getItem('forbudstid-kamppopup')!=='av'}catch(e){}
// Mine slag: én hendelse per kvartal der familien min var med i en kamp
function myFights(){const seen=new Set();return evAll().filter(e=>{if(e.k!=='fight'||e.aid==null||(e.a!==0&&e.d!==0))return false;const k=e.x+','+e.y;if(seen.has(k))return false;seen.add(k);return true})}
function openFightQueue(list,i=0){
  list=(list||[]).filter(e=>e&&e.k==='fight'&&e.aid!=null);
  if(!list.length)return;
  bigQueue=list; document.getElementById('bigStage').hidden=false;
  document.getElementById('bigAuto').checked=FIGHT_POPUP;
  playBig(i);
}
function openBigStage(e){
  if(!e||e.k!=='fight')return;
  const l=myFights(), i=l.findIndex(o=>o.x===e.x&&o.y===e.y);
  openFightQueue(i>=0?l:[e],Math.max(0,i));
}
function playBig(i){
  clearTimeout(bigTimer); cancelAnimationFrame(bigRaf);
  bigIdx=clamp(i,0,bigQueue.length-1); const e=bigQueue[bigIdx], n=bigQueue.length;
  const slag=buildBattle(e).ex.length>1?'Slag':'Kamp';
  document.getElementById('bigLabel').textContent=n>1?`${slag} ${bigIdx+1} av ${n} · ${CO(e.x,e.y)}`:`${slag} i ${CO(e.x,e.y)}`;
  document.getElementById('bigPrev').disabled=bigIdx===0;
  document.getElementById('bigNext').disabled=bigIdx===n-1;
  // hold hendelsesfeltet i takt med kampen som vises
  const ri=evList().indexOf(e); if(ri>=0&&ui.rev!==ri){ui.rev=ri;render()}
  const c=stageCtx('stageBigCv'), END=fightEnd(e), still=matchMedia('(prefers-reduced-motion: reduce)').matches, t0=performance.now();
  const loop=now=>{const t=still?END:now-t0; drawFight(c,e,t);
    if(t<END)bigRaf=requestAnimationFrame(loop);
    else if(bigIdx<n-1)bigTimer=setTimeout(()=>playBig(bigIdx+1),900); // neste kamp starter av seg selv
  };
  bigRaf=requestAnimationFrame(loop);
  if(!still)fightSfx(buildBattle(e));
}
function closeBigStage(){clearTimeout(bigTimer);cancelAnimationFrame(bigRaf);document.getElementById('bigStage').hidden=true}
function startStage(e){
  cancelAnimationFrame(stageRaf);
  const c=stageCtx();
  const END=fightEnd(e), still=matchMedia('(prefers-reduced-motion: reduce)').matches, t0=performance.now();
  const loop=now=>{const t=still?END:now-t0; drawFight(c,e,t); if(t<END)stageRaf=requestAnimationFrame(loop)};
  stageRaf=requestAnimationFrame(loop);
  if(!still)fightSfx(buildBattle(e));
}
function updateStage(e){
  const ok=!!(e&&e.k==='fight'&&e.aid!=null);
  if(!ok){cancelAnimationFrame(stageRaf);stageKey='';return}
  const key=[S.events.t,e.x,e.y,e.aid,e.did,e.dhp0].join('|');
  if(key===stageKey)return; stageKey=key;
  startStage(e);
}
