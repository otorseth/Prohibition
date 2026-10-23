// Lagring i nettleseren og oppgradering av gamle lagringer
/* ---------- lagring ---------- */
function save(){try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function load(){try{const s=localStorage.getItem(SAVE);if(s){S=JSON.parse(s);migrate();return true}}catch(e){}return false}
// Eldre lagringer satte alle bander til «Vent» etter hver tur. Gjør dem om til «uten ordre» én gang.
function migrate(){
  if((S.v||1)<2){S.gangs.forEach(g=>{if(g.order==='hold')g.order='none'});S.v=2;save()}
  if(S.v<3){[...S.gangs,...S.pool].forEach(g=>g.hp=Math.min(MAXHP,g.hp*2));S.v=3;save()}
  if(S.v<4){
    const MAP={bolig:['bolig'],speak:['komm','speak'],kasino:['komm','kasino'],fabr:['ind','fabrikk'],brygg:['ind','brygg']};
    S.blocks.forEach(b=>{const m=MAP[b.t];if(m){b.t=m[0];b.bld=genBld(m[0],m[1])}});
    S.v=4;save();
  }
  if(S.ledStart==null)S.ledStart=S.money[0];
  if(S.v<5){S.seen=null;S.mem=null;S.v=5;save()} // tåke: fylles ut ved første visning
  if(S.v<6){S.boss=null;S.v=6;save()} // sjefens navn spørres om ved neste oppstart
}
