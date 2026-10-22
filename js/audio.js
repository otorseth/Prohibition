// Bakgrunnsmusikk og lydeffekter (Web Audio)
/* ---------- bakgrunnsmusikk ---------- */
// Spilles med Web Audio for sømløs loop. Nettleseren tillater lyd først etter første klikk.
const MUS={ctx:null,gain:null,src:null,buf:null,el:null,loading:null,on:true,vol:.5};
try{const m=JSON.parse(localStorage.getItem('forbudstid-musikk')||'null');if(m){MUS.on=!!m.on;MUS.vol=+m.vol}}catch(e){}
function musSave(){try{localStorage.setItem('forbudstid-musikk',JSON.stringify({on:MUS.on,vol:MUS.vol,sfx:MUS.sfx}))}catch(e){}}
function musUi(){
  const b=document.getElementById('musicBtn');
  b.textContent=MUS.on?'♪ Musikk på':'♪ Musikk av'; b.setAttribute('aria-pressed',MUS.on);
  document.getElementById('vol').value=Math.round(MUS.vol*100);
}
async function musStart(){
  if(!MUS.on)return;
  try{
    if(!MUS.ctx){const AC=window.AudioContext||window.webkitAudioContext;MUS.ctx=new AC();MUS.gain=MUS.ctx.createGain();MUS.gain.connect(MUS.ctx.destination)}
    MUS.gain.gain.value=MUS.vol*.7;
    if(MUS.ctx.state==='suspended')await MUS.ctx.resume();
    if(!MUS.buf){MUS.loading=MUS.loading||fetch('musikk.mp3').then(r=>{if(!r.ok)throw new Error('mangler');return r.arrayBuffer()}).then(a=>MUS.ctx.decodeAudioData(a));MUS.buf=await MUS.loading}
    if(!MUS.src&&MUS.on){const src=MUS.ctx.createBufferSource();src.buffer=MUS.buf;src.loop=true;src.connect(MUS.gain);src.start();MUS.src=src}
  }catch(e){
    // reserve: vanlig lydelement med loop
    if(!MUS.el){MUS.el=new Audio('musikk.mp3');MUS.el.loop=true}
    MUS.el.volume=MUS.vol*.7; MUS.el.play().catch(()=>{});
  }
}
function musStop(){
  if(MUS.src){try{MUS.src.stop()}catch(e){}MUS.src.disconnect();MUS.src=null}
  if(MUS.el)MUS.el.pause();
}
document.getElementById('musicBtn').onclick=()=>{MUS.on=!MUS.on;musSave();musUi();MUS.on?musStart():musStop()};
document.getElementById('vol').addEventListener('input',e=>{
  MUS.vol=e.target.value/100; musSave();
  if(MUS.gain)MUS.gain.gain.setTargetAtTime(MUS.vol*.7,MUS.ctx.currentTime,.05);
  if(MUS.el)MUS.el.volume=MUS.vol*.7;
});
function firstGesture(e){
  if(e.target.closest&&e.target.closest('#musicBtn,#vol'))return;
  document.removeEventListener('pointerdown',firstGesture); document.removeEventListener('keydown',firstGesture);
  musStart();
}
document.addEventListener('pointerdown',firstGesture); document.addEventListener('keydown',firstGesture);
document.addEventListener('visibilitychange',()=>{
  if(MUS.ctx){if(document.hidden)MUS.ctx.suspend();else if(MUS.on)MUS.ctx.resume()}
  if(MUS.el){if(document.hidden)MUS.el.pause();else if(MUS.on)MUS.el.play().catch(()=>{})}
});
/* ---------- lydeffekter i kampscenen ---------- */
// Alle lyder lages med Web Audio: filtrert støy for smellet og en synkende tone for trykket.
let SFX=null, sfxStage=null;
try{const m=JSON.parse(localStorage.getItem('forbudstid-musikk')||'null');MUS.sfx=!m||m.sfx!==false}catch(e){MUS.sfx=true}
function sfxInit(){
  if(SFX)return SFX;
  if(!MUS.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;MUS.ctx=new AC();MUS.gain=MUS.ctx.createGain();MUS.gain.gain.value=MUS.vol*.7;MUS.gain.connect(MUS.ctx.destination)}
  const c=MUS.ctx, comp=c.createDynamicsCompressor(), out=c.createGain();
  out.gain.value=.8; out.connect(comp); comp.connect(c.destination);
  const nb=c.createBuffer(1,c.sampleRate,c.sampleRate), d=nb.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  SFX={c,out,nb}; return SFX;
}
function burst(dst,t,type,freq,q,gain,decay){
  const {c,nb}=SFX, src=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain();
  src.buffer=nb; f.type=type; f.frequency.value=freq; f.Q.value=q;
  g.gain.setValueAtTime(gain,t); g.gain.exponentialRampToValueAtTime(.001,t+decay);
  src.connect(f); f.connect(g); g.connect(dst); src.start(t,Math.random()*.5); src.stop(t+decay+.05);
}
function thump(dst,t,f0,f1,dur,gain,wave){
  const {c}=SFX, o=c.createOscillator(), g=c.createGain();
  o.type=wave||'sine'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(gain,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g); g.connect(dst); o.start(t); o.stop(t+dur+.05);
}
function whoosh(dst,t){
  const {c,nb}=SFX, src=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain();
  src.buffer=nb; f.type='bandpass'; f.Q.value=1.2; f.frequency.setValueAtTime(400,t); f.frequency.exponentialRampToValueAtTime(1800,t+.14);
  g.gain.setValueAtTime(.001,t); g.gain.linearRampToValueAtTime(.3,t+.08); g.gain.exponentialRampToValueAtTime(.001,t+.16);
  src.connect(f); f.connect(g); g.connect(dst); src.start(t); src.stop(t+.2);
}
// Én lyd per våpen. t = tidspunkt i lydmotorens klokke.
const SOUND={
  derringer:(d,t)=>{burst(d,t,'highpass',1800,.7,.5,.07);thump(d,t,400,150,.05,.2)},
  revolver:(d,t)=>{burst(d,t,'bandpass',1200,.7,.9,.22);thump(d,t,160,50,.15,.6);burst(d,t+.04,'lowpass',700,.5,.15,.4)},
  pistol:(d,t)=>{burst(d,t,'highpass',900,.7,.8,.14);thump(d,t,180,60,.1,.5)},
  shotgun:(d,t)=>{burst(d,t,'lowpass',2200,.6,1,.5);thump(d,t,90,30,.35,1);burst(d,t+.05,'lowpass',600,.5,.4,.9);
    burst(d,t+.55,'bandpass',3000,6,.35,.03);burst(d,t+.68,'bandpass',2400,6,.35,.04)},
  rifle:(d,t)=>{burst(d,t,'highpass',2500,.7,.9,.05);thump(d,t,140,40,.2,.6);burst(d,t+.03,'lowpass',900,.5,.35,.8)},
  tommy:(d,t)=>{burst(d,t,'bandpass',1500,.8,.6,.07);thump(d,t,150,60,.06,.4)},
  fists:(d,t)=>{thump(d,t,140,55,.09,.9);burst(d,t,'lowpass',500,.7,.5,.05)},
  bat:(d,t)=>{burst(d,t,'bandpass',800,2,.8,.08);thump(d,t,220,80,.08,.7);thump(d,t,600,500,.05,.25,'triangle')}
};
// Tidspunkter (ms inn i fasen) som matcher munningsflammene og slagene i animasjonen
function hitTimes(w){
  if(w==='tommy')return [0,90,180,270,360,450,540];
  if(w==='shotgun'||w==='rifle')return [90];
  if(w==='fists')return [230,330,430];
  if(w==='bat')return [380];
  return [80,330];
}
function fightSfx(b){
  if(sfxStage){try{sfxStage.disconnect()}catch(x){}sfxStage=null}
  if(!MUS.sfx||!sfxInit())return;
  const {c,out}=SFX; if(c.state==='suspended')c.resume();
  const d=c.createGain(); d.connect(out); sfxStage=d;
  const now=c.currentTime+.02;
  // b.cues: [starttid i ms, våpentype] for hvert angrep i slaget
  b.cues.forEach(([T,w])=>{
    const start=T/1000;
    if(w==='bat')whoosh(d,now+start+.25);
    if(w==='fists')whoosh(d,now+start+.15);
    hitTimes(w).forEach(ms=>SOUND[w](d,now+start+ms/1000));
  });
}
// Kort, diskret svisj når du klikker på en rute
function tileSwish(){
  if(!MUS.sfx||!sfxInit())return;
  const {c,out,nb}=SFX; if(c.state==='suspended')c.resume();
  const t=c.currentTime+.005, src=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain();
  src.buffer=nb; f.type='bandpass'; f.Q.value=.9;
  f.frequency.setValueAtTime(900,t); f.frequency.exponentialRampToValueAtTime(2600,t+.09);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.07,t+.03); g.gain.exponentialRampToValueAtTime(.0001,t+.11);
  src.connect(f); f.connect(g); g.connect(out); src.start(t,Math.random()*.5); src.stop(t+.13);
}
function sfxUi(){const b=document.getElementById('sfxBtn');b.textContent=MUS.sfx?'Effekter på':'Effekter av';b.setAttribute('aria-pressed',MUS.sfx)}
document.getElementById('sfxBtn').onclick=()=>{MUS.sfx=!MUS.sfx;musSave();sfxUi();if(!MUS.sfx&&sfxStage){try{sfxStage.disconnect()}catch(x){}sfxStage=null}};
sfxUi();
musUi();
