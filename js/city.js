// Bykartet sett ovenfra (canvas)
/* ---------- bykart sett ovenfra ---------- */
let cityKey='';
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function drawCity(){
  if(!S)return;
  const cv=document.getElementById('city'), tiles=document.getElementById('board').children;
  if(tiles.length<2)return;
  const W=cv.clientWidth, H=cv.clientHeight;
  const fog=S.blocks.map((b,i)=>fogState(i));
  const key=W+'x'+H+'|'+S.blocks.map((b,i)=>b.t+fog[i]+(b.bld&&fog[i]==='vis'?b.bld.map(x=>x.k+x.by).join(''):'')).join(',');
  if(!W||key===cityKey)return; cityKey=key;
  const dpr=window.devicePixelRatio||1; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
  const c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0);
  const s=tiles[0].offsetWidth, px=tiles[0].offsetLeft, py=tiles[0].offsetTop, gap=tiles[1].offsetLeft-px-s;
  c.fillStyle='#171513'; c.fillRect(0,0,W,H);
  // midtlinjer i gatene
  c.strokeStyle='rgba(208,170,95,.22)'; c.lineWidth=1; c.setLineDash([4,5]);
  c.beginPath();
  for(let i=0;i<N-1;i++){
    const gx=px+(i+1)*s+i*gap+gap/2, gy=py+(i+1)*s+i*gap+gap/2;
    c.moveTo(gx,0);c.lineTo(gx,H);c.moveTo(0,gy);c.lineTo(W,gy);
  }
  c.stroke(); c.setLineDash([]);
  for(const b of S.blocks)drawBlock(c,b,px+b.x*(s+gap),py+b.y*(s+gap),s,fog[b.y*N+b.x]==='vis');
  // tåke: mørk og tett over ukjente kvartaler, halvmørk over kvartaler du har sett før
  S.blocks.forEach((b,i)=>{
    if(fog[i]==='vis')return;
    const x=px+b.x*(s+gap)-gap/2, y=py+b.y*(s+gap)-gap/2, w=s+gap;
    if(fog[i]==='fog'){c.fillStyle='rgba(12,10,9,.55)';c.fillRect(x,y,w,w);return}
    c.fillStyle='rgba(14,12,11,.93)'; c.fillRect(x,y,w,w);
    const R=rng(i*7919+3);
    for(let k=0;k<5;k++){
      const cx=x+R()*w, cy=y+R()*w, rr=w*(.25+R()*.3), g=c.createRadialGradient(cx,cy,0,cx,cy,rr);
      g.addColorStop(0,'rgba(120,110,100,.10)'); g.addColorStop(1,'rgba(120,110,100,0)');
      c.fillStyle=g; c.fillRect(x,y,w,w);
    }
  });
}
function drawBlock(c,b,x,y,s,seeNow=true){
  const R=rng((b.x+1)*73856093^(b.y+1)*19349663^b.t.length*83492791);
  const rnd=(a,z)=>a+R()*(z-a);
  const fr=(X,Y,w,h,col)=>{c.fillStyle=col;c.fillRect(X,Y,w,h)};
  const o=Math.max(1,s*.03);
  const shadow=(X,Y,w,h)=>fr(X+o,Y+o,w,h,'rgba(0,0,0,.4)');
  const roof=(X,Y,w,h,col)=>{shadow(X,Y,w,h);fr(X,Y,w,h,col);
    c.fillStyle='rgba(0,0,0,.2)'; if(w>=h)c.fillRect(X,Y+h/2,w,h/2); else c.fillRect(X+w/2,Y,w/2,h);
    c.strokeStyle='rgba(255,235,200,.12)';c.lineWidth=1;c.beginPath();
    if(w>=h){c.moveTo(X+1,Y+h/2);c.lineTo(X+w-1,Y+h/2)}else{c.moveTo(X+w/2,Y+1);c.lineTo(X+w/2,Y+h-1)}c.stroke()};
  const flat=(X,Y,w,h,col)=>{shadow(X,Y,w,h);fr(X,Y,w,h,col);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.strokeRect(X+.5,Y+.5,w-1,h-1)};
  const circ=(X,Y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(X,Y,r,0,Math.PI*2);c.fill()};
  const tree=(X,Y,r)=>{circ(X+o,Y+o,r,'rgba(0,0,0,.4)');circ(X,Y,r,'#2c3a25');circ(X-r*.3,Y-r*.3,r*.55,'#3b4b30')};
  const glow=(X,Y,col)=>{circ(X,Y,Math.max(1.5,s*.035),col)};
  // fortau og tomt
  fr(x,y,s,s,'#302a24');
  const m=s*.07, X=x+m, Y=y+m, S2=s-2*m;
  fr(X,Y,S2,S2,'#25211d');
  const ROOF=['#6e4a3c','#5e4035','#74533f','#634a3e','#57423a'];
  const GREY=['#4f4a45','#58514a','#48433f','#5c554c'];
  // bolig, kommersiell og industri: tre tomter med hver sin bygning
  if(b.bld){
    const g=S2*.07, hw=(S2-g)/2;
    const P=[[X,Y,hw,hw],[X+hw+g,Y,hw,hw],[X,Y+hw+g,S2,hw]];
    const pk=a=>a[Math.floor(R()*a.length)];
    b.bld.forEach((bd,i)=>{
      const [px,py,pw,ph]=P[i];
      const shop=(col,awn,stripe)=>{flat(px+pw*.06,py+ph*.06,pw*.88,ph*.68,col);fr(px+pw*.06,py+ph*.74,pw*.88,ph*.16,awn);
        if(stripe){c.fillStyle=stripe;for(let k=0;k<pw*.88;k+=pw*.16)c.fillRect(px+pw*.06+k,py+ph*.74,pw*.07,ph*.16)}};
      switch(bd.k){
        case 'leie':flat(px+pw*.06,py+ph*.06,pw*.88,ph*.88,pk(GREY));fr(px+pw*.38,py+ph*.32,pw*.24,ph*.32,'rgba(0,0,0,.45)');break;
        case 'rekke':fr(px,py,pw,ph,'#28311f');for(let k=0;k<3;k++)roof(px+k*pw/3+1,py+ph*.12,pw/3-2,ph*.56,pk(ROOF));break;
        case 'villa':fr(px,py,pw,ph,'#28311f');roof(px+pw*.14,py+ph*.18,pw*.5,ph*.42,pk(ROOF));tree(px+pw*.8,py+ph*.72,s*.04);tree(px+pw*.3,py+ph*.82,s*.03);break;
        case 'pensjonat':{const col=pk(ROOF);flat(px+pw*.08,py+ph*.08,pw*.84,ph*.36,col);flat(px+pw*.08,py+ph*.08,pw*.36,ph*.84,col);break}
        case 'arbeider':roof(px+pw*.06,py+ph*.08,pw*.88,ph*.34,pk(ROOF));roof(px+pw*.06,py+ph*.56,pw*.88,ph*.34,pk(ROOF));break;
        case 'speak':shop('#3f3a36','#6b2a24');glow(px+pw*.5,py+ph*.82,'rgba(230,180,90,.95)');break;
        case 'kasino':shop('#5a3a31','#a3854f');circ(px+pw*.5,py+ph*.4,Math.min(pw,ph)*.18,'#7d6644');glow(px+pw*.14,py+ph*.82,'rgba(240,200,110,.9)');glow(px+pw*.86,py+ph*.82,'rgba(240,200,110,.9)');break;
        case 'bakeri':shop('#57504a','#d9c9a3','rgba(120,90,60,.5)');break;
        case 'slakter':shop('#4f4a45','#b04a42','rgba(240,230,220,.6)');break;
        case 'frisor':shop('#4f4a45','#3e5f8a','rgba(200,70,60,.8)');break;
        case 'pante':shop('#48433f','#3f5a3c');circ(px+pw*.5,py+ph*.4,Math.min(pw,ph)*.08,'#a3854f');break;
        case 'kino':shop('#4a3f44','#8c6b2f');[.2,.4,.6,.8].forEach(q=>glow(px+pw*q,py+ph*.82,'rgba(255,225,150,.9)'));break;
        case 'rest':shop('#58514a','#5a7a4a','rgba(240,230,220,.4)');break;
        case 'brygg':flat(px+pw*.04,py+ph*.06,pw*.46,ph*.88,'#5a4636');[.3,.72].forEach(q=>{circ(px+pw*.76+o,py+ph*q+o,Math.min(pw,ph)*.17,'rgba(0,0,0,.4)');circ(px+pw*.76,py+ph*q,Math.min(pw,ph)*.17,'#6b5a45');c.strokeStyle='#8f7756';c.lineWidth=1;c.beginPath();c.arc(px+pw*.76,py+ph*q,Math.min(pw,ph)*.11,0,Math.PI*2);c.stroke()});break;
        case 'destill':flat(px+pw*.06,py+ph*.08,pw*.88,ph*.5,'#4b4844');[.3,.65].forEach(q=>circ(px+pw*q,py+ph*.78,Math.min(pw,ph)*.13,'#9a6a3a'));circ(px+pw*.85,py+ph*.25,Math.min(pw,ph)*.08,'#151311');break;
        case 'fabrikk':{flat(px+pw*.04,py+ph*.06,pw*.92,ph*.7,'#4b4844');c.fillStyle='rgba(0,0,0,.3)';for(let k=0;k<pw*.92;k+=pw*.14)c.fillRect(px+pw*.04+k,py+ph*.06,pw*.06,ph*.7);circ(px+pw*.85,py+ph*.86,Math.min(pw,ph)*.08,'#3a3633');break}
        case 'lager':{flat(px+pw*.05,py+ph*.1,pw*.9,ph*.8,'#55504a');c.fillStyle='rgba(0,0,0,.22)';for(let k=0;k<ph*.8;k+=ph*.14)c.fillRect(px+pw*.05,py+ph*.1+k,pw*.9,ph*.06);break}
        case 'sag':fr(px,py,pw,ph,'#3a2e22');flat(px+pw*.06,py+ph*.08,pw*.36,ph*.4,'#5a4636');for(let k=0;k<4;k++){fr(px+pw*.5,py+ph*(.14+k*.18),pw*.44,ph*.1,'#7a5a38');circ(px+pw*.94,py+ph*(.19+k*.18),ph*.05,'#a07a50')}break;
        case 'trykk':flat(px+pw*.06,py+ph*.08,pw*.88,ph*.84,'#4f4a45');[.25,.5,.75].forEach(q=>fr(px+pw*q-pw*.07,py+ph*.3,pw*.14,ph*.4,'rgba(190,205,220,.35)'));break;
      }
      if(seeNow&&bd.by>=0){const rr=Math.max(2.5,s*.05);circ(px+pw-rr-1,py+rr+1,rr+1.2,'#0c0a09');circ(px+pw-rr-1,py+rr+1,rr,FAMHEX[bd.by])}
    });
    return;
  }
  switch(b.t){
    case 'havn':{
      fr(X+S2*.42,y,s-m-S2*.42,s,'#1b2c33');
      c.strokeStyle='rgba(160,200,210,.18)';c.lineWidth=1;c.beginPath();
      for(let k=0;k<5;k++){const wx=X+S2*rnd(.5,.9), wy=y+s*rnd(.05,.95);c.moveTo(wx,wy);c.lineTo(wx+s*.08,wy)}c.stroke();
      flat(X,Y+S2*.05,S2*.36,S2*.9,'#4a4540');
      c.fillStyle='rgba(0,0,0,.22)';for(let k=0;k<S2*.9;k+=S2*.12)c.fillRect(X,Y+S2*.05+k,S2*.36,S2*.05);
      [.25,.7].forEach(p=>{fr(X+S2*.42,Y+S2*p,s*.5,S2*.07,'#4a3c2e');
        c.fillStyle='#5f4b3a';c.beginPath();c.ellipse(X+S2*.78,Y+S2*(p+.15),S2*.15,S2*.05,0,0,Math.PI*2);c.fill();
        fr(X+S2*.72,Y+S2*(p+.13),S2*.08,S2*.04,'#7a6650')});
      break;}
    case 'politi':{
      fr(X,Y,S2,S2,'#2a2c2f');
      const i=S2*.08;
      flat(X+i,Y+i,S2-2*i,S2-2*i,'#3d4451');
      fr(X+S2*.3,Y+S2*.3,S2*.4,S2*.7-i,'#2a2c2f');
      fr(X+S2*.36,Y+S2*.5,S2*.1,S2*.16,'#1a1c1f');fr(X+S2*.54,Y+S2*.5,S2*.1,S2*.16,'#1a1c1f');
      glow(X+S2*.5,Y+S2*.2,'rgba(120,160,230,.95)');
      break;}
    case 'hq':{
      fr(X,Y,S2,S2,'#26311f');
      fr(X+S2*.44,Y+S2*.55,S2*.12,S2*.45,'#4a4237');
      roof(X+S2*.2,Y+S2*.2,S2*.6,S2*.3,'#6a4c3a');
      roof(X+S2*.38,Y+S2*.12,S2*.24,S2*.48,'#74533f');
      circ(X+S2*.5,Y+S2*.75,S2*.07,'#3c5560');circ(X+S2*.5,Y+S2*.75,S2*.03,'#6a8a96');
      [[.1,.1],[.9,.1],[.1,.9],[.9,.9],[.1,.5],[.9,.5]].forEach(([a,z])=>tree(X+S2*a,Y+S2*z,s*.05));
      break;}
  }
}
