// Avslutningen: seiersvideo og avisforside (seier), eller bare avisforside (tap).
/* ---------- avslutning ---------- */
let endingShown=false;
function statLine(){
  const st=S.st||{};
  return [
    ['Kvartaler', `${owned(0)} av 64`],
    ['Måneder', `${S.turn-1}`],
    ['Kamper vunnet', `${st.fw||0}`],
    ['Fiender i elva', `${st.killed||0}`],
    ['Egne bander tapt', `${st.lost||0}`],
    ['Kvartaler tatt', `${st.taken||0}`],
    ['Tjent totalt', `$${st.earned||0}`],
  ];
}
// Bygger avisforsiden. photo = stillbilde fra videoen (seier), ellers et bilde fra spillet.
function paperHtml(win,photo){
  if(!photo)photo=win?'img/bg/hq.jpg':'img/bg/havn.jpg';
  const months=S.turn-1, own=owned(0), st=S.st||{};
  const head=win?'DIN FAMILIE STYRER LAKEPORT':'FAMILIEN KNUST';
  const sub=win
    ?(S.over&&/rivalene er borte/.test(S.over.text)?'Rossetti, O\'Dwyer og Novak er borte fra gatene':`Eier ${own} av byens 64 kvartaler – ingen tør lenger utfordre familien`)
    :(S.over&&S.over.text?S.over.text:'De siste bandene er borte fra gatene');
  const story=win
    ?`${bossName()} har gjort det. Etter ${months} måneder med gatekamper, bestikkelser og blod i rennesteinen er det ingen tvil lenger om hvem som bestemmer i Lakeport. Familien vant ${st.fw||0} kamper, sendte ${st.killed||0} av rivalenes folk i elva og tok over ${st.taken||0} kvartaler. Politiet nekter å kommentere. Ordføreren er ikke å få tak i.`
    :`Etter ${months} måneder er det slutt. Familien mistet ${st.lost||0} bander og har ikke lenger fotfeste i byen. På speakeasyene snakkes det om hvem som tar over restene.`;
  const date=dateOf(S.turn).toUpperCase();
  const mast=`<div class="pmast"><span>${date}</span><b>LAKEPORT EVENING STAR</b><span>5 CENTS</span></div>
    <div class="prule"></div>`;
  const stats=`<div class="pstats">${statLine().map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>`;
  if(!win){
    // Tap: dødsannonse med gravsteinsbilde
    return `${mast}
    <h1 class="phead">SJEFEN ER DØD</h1>
    <p class="psub">${sub}</p>
    <div class="pcols">
      <figure class="pphoto"><img src="img/grav.jpg" alt="" onerror="this.onerror=null;this.src='img/bg/havn.jpg'"><figcaption>Graven på Lakeport kirkegård. Foto: Evening Star</figcaption></figure>
      <div class="ptext">
        <div class="obit">
          <div class="ocross">✝</div>
          <p class="osmall">Vår kjære sjef og forretningsforbindelse</p>
          <h2 class="oname">${bossName()}</h2>
          <p class="osmall">gikk brått bort i Lakeport i ${dateOf(S.turn).toLowerCase()}</p>
          <p class="overse">«Byen var aldri stor nok.»</p>
          <p class="osign">Familien &middot; Gutta på hjørnet &middot; Speakeasyene i Kanalgata</p>
          <p class="osmall">Bisettelsen skjer i stillhet. Blomster frabedes – kontanter mottas.</p>
        </div>
        ${stats}
      </div>
    </div>`;
  }
  return `${mast}
    <h1 class="phead">${head}</h1>
    <p class="psub">${sub}</p>
    <div class="pcols">
      <figure class="pphoto">${photo?`<img src="${photo}" alt="">`:''}<figcaption>${`Sjefen over byen: ${bossShort()}. Foto: Evening Star`}</figcaption></figure>
      <div class="ptext"><p class="pstory">${story}</p>
        ${stats}
      </div>
    </div>`;
}
function showPaper(win,photo){
  const wrap=document.getElementById('paperWrap'), paper=document.getElementById('paper');
  paper.innerHTML=paperHtml(win,photo);
  document.getElementById('endSkip').hidden=true;
  document.getElementById('endVid').hidden=true;
  wrap.hidden=false;
  paper.classList.remove('spin'); void paper.offsetWidth; paper.classList.add('spin');
  // avisen lander med et dunk
  setTimeout(()=>{if(MUS.sfx&&sfxInit()){const {c,out}=SFX;thump(out,c.currentTime,120,45,.25,.9);burst(out,c.currentTime,'lowpass',900,.6,.4,.15)}},1500);
}
// Grabber siste bilde fra videoen til avisbildet
function videoFrame(v){
  try{const cv=document.createElement('canvas');cv.width=v.videoWidth||832;cv.height=v.videoHeight||464;cv.getContext('2d').drawImage(v,0,0,cv.width,cv.height);return cv.toDataURL('image/jpeg',.82)}catch(e){return null}
}
function showEnding(win){
  closeEvents&&closeEvents();
  const el=document.getElementById('ending'), v=document.getElementById('endVid');
  el.hidden=false; document.getElementById('paperWrap').hidden=true;
  // Seier: seiersvideo. Tap: kirkegårdsvideo. WebM først, MP4 som reserve.
  const clip=win?'seier':'tap';
  if(v.dataset.clip!==clip){v.dataset.clip=clip;v.innerHTML=`<source src="video/${clip}.webm" type="video/webm"><source src="video/${clip}.mp4" type="video/mp4">`;v.load()}
  v.hidden=false; document.getElementById('endSkip').hidden=false;
  let done=false; const finish=()=>{if(done)return;done=true;const ph=win?videoFrame(v):null;v.pause();showPaper(win,ph)};
  v.onended=finish; v.onerror=()=>{done=true;showPaper(win,null)};
  document.getElementById('endSkip').onclick=finish;
  v.currentTime=0; const p=v.play(); if(p&&p.catch)p.catch(()=>finish());
  // Vakthund: kan nettleseren ikke spille videoen, går vi rett til avisen
  setTimeout(()=>{if(done)return;if(v.error||v.readyState===0){done=true;showPaper(win,null)}else if(v.paused&&v.currentTime===0)finish()},2500);
}
function hideEnding(){const v=document.getElementById('endVid');v.pause();document.getElementById('ending').hidden=true}
