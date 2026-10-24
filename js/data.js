// Konstanter, typer, bygninger, våpen og små hjelpefunksjoner
const N=8, MAXB=6, WIN=40, SAVE='forbudstid-v1';
const MAXHP=20, FAMHEX=['#d0aa5f','#c4554a','#5c9c8b','#9282c4'];
// Tre hovedtyper med tre bygninger hver, pluss tre spesialkvartaler
const TYPES={
  bolig:{n:'Bolig',inc:1,res:0},
  komm:{n:'Kommersiell',inc:2,res:1},
  ind:{n:'Industri',inc:2,res:2},
  havn:{n:'Havn',inc:5,res:2},
  politi:{n:'Politistasjon',inc:1,res:4},
  hq:{n:'Hovedkvarter',inc:3,res:3}
};
// v = ekstra inntekt per måned når bygningen er påvirket, res = motstand mot påvirkning
const BK={
  leie:{n:'Leiegård',c:'bolig',v:2,res:1}, rekke:{n:'Rekkehus',c:'bolig',v:1,res:0}, villa:{n:'Villa',c:'bolig',v:2,res:2},
  pensjonat:{n:'Pensjonat',c:'bolig',v:1,res:0}, arbeider:{n:'Arbeiderboliger',c:'bolig',v:1,res:0},
  speak:{n:'Speakeasy',c:'komm',v:4,res:2}, kasino:{n:'Spillebule',c:'komm',v:5,res:3}, bakeri:{n:'Bakeri',c:'komm',v:2,res:0},
  slakter:{n:'Slakter',c:'komm',v:2,res:0}, frisor:{n:'Barberer',c:'komm',v:2,res:0}, pante:{n:'Pantelåner',c:'komm',v:3,res:1},
  kino:{n:'Kino',c:'komm',v:3,res:1}, rest:{n:'Restaurant',c:'komm',v:3,res:1},
  brygg:{n:'Bryggeri',c:'ind',v:4,res:2}, destill:{n:'Destilleri',c:'ind',v:5,res:3}, fabrikk:{n:'Fabrikk',c:'ind',v:3,res:1},
  lager:{n:'Lagerhall',c:'ind',v:2,res:0}, sag:{n:'Sagbruk',c:'ind',v:3,res:1}, trykk:{n:'Trykkeri',c:'ind',v:3,res:1}
};
const CATN={bolig:'Bolig',komm:'Butikk',ind:'Industri'};
// Våpen: én per bande, gir ekstra muskler. d = hvordan våpenet tegnes i kampscenen.
const WEAP={
  strompe:{n:'«Strømpebåndet»',t:'Lommepistol',p:15,m:1,d:'derringer'},
  roscoe:{n:'«Roscoe»',t:'Revolver',p:30,m:2,d:'revolver'},
  heater:{n:'«Heater»',t:'Halvautomatisk pistol',p:50,m:3,d:'pistol'},
  feie:{n:'«Feiekosten»',t:'Avsagd hagle',p:70,m:4,d:'shotgun'},
  tom:{n:'«Lange Tom»',t:'Repetergevær',p:90,m:4,d:'rifle'},
  tommy:{n:'«Tommy-gun»',t:'Maskinpistol',p:140,m:6,d:'tommy'}
};
// Økonomijustering: våpen 50 % dyrere og lønn 100 % høyere enn grunnverdien.
const PRIS={vapen:1.5, lonn:2};
const wPrice=id=>Math.round(WEAP[id].p*PRIS.vapen);
const wage=g=>Math.ceil(g.up*PRIS.lonn);
const musOf=g=>g.mus+(g.wpn?WEAP[g.wpn].m:0);
const musTxt=g=>g.wpn?`${musOf(g)} (${g.mus}+${WEAP[g.wpn].m})`:`${g.mus}`;
function buyWeapon(f,g,id){
  const W=WEAP[id], b=blk(g.x,g.y);
  if(!W||g.wpn===id||b.owner!==f||S.money[f]<wPrice(id))return false;
  S.money[f]-=wPrice(id); g.wpn=id;
  if(f===0)ledgerAdd('weapons',wPrice(id));
  if(f===0)L(`${g.name} fikk levert ${W.n} (${W.t.toLowerCase()}, +${W.m} muskler) for $${wPrice(id)}.`);
  return true;
}
function genBld(t,must){
  const ks=Object.keys(BK).filter(k=>BK[k].c===t); let out;
  if(t==='bolig')out=[0,1,2].map(()=>pick(ks));
  else{out=ks.slice().sort(()=>Math.random()-.5).slice(0,3);if(must&&!out.includes(must))out[0]=must}
  return out.map(k=>({k,by:-1}));
}
const FAM=[
  {name:'Din familie',c:'var(--f0)'},
  {name:'Rossetti',c:'var(--f1)'},
  {name:"O'Dwyer",c:'var(--f2)'},
  {name:'Novak',c:'var(--f3)'}
];
const HQS=[[0,0],[7,7],[7,0],[0,7]];
const SX=['Kanal','Mølle','Union','Marked','Lind','Smie','Bisp','Havne'];
// Bandenavn. Kvinner får egne fornavn og kallenavn, og vises som kvinner i portrett og kampscene.
const FIRST=['Tommy','Sal','Benny','Frankie','Lou','Mickey','Vito','Eddie','Nicky','Joe','Dutch','Rocco','Gus','Irish','Fat Pete'];
const FIRST_F=['Mae','Ruby','Lola','Bonnie','Stella','Rosie','Dottie','Velma','Hazel','Kitty'];
const NICK=['Kniven','Lynet','Hatten','Snusen','Tannløs','Doktoren','Pianisten','Kalde','Kjeksen','Bjørnen','Presten','Revolveren','Smilet','Glasset'];
const NICK_F=['Kniven','Lynet','Doktoren','Pianisten','Kalde','Revolveren','Smilet','Glasset','Dronningen','Enken','Perlen','Sirenen','Silken','Hjerteknuseren'];
const FEM_SHARE=.25; // andel kvinner blant nye bander
const isFem=name=>FIRST_F.includes(String(name||'').split(' ')[0]);
// Spilltyper (seiersbetingelser). Å knuse alle rivalene gir alltid seier.
const MODES={
  dominans:{n:'Dominans',d:'Eie 40 av byens 64 kvartaler.'},
  kapitalist:{n:'Kapitalist',d:'Ha mest penger i kassen etter 40 måneder.'},
  sniken:{n:'Sniken',d:'Ta kontroll over alle fire hovedkvarterene.'},
  sentrum:{n:'Sentrum',d:'Eie D4, D5, E4 og E5 samtidig i 10 måneder på rad.'}
};
const KAP_TURNS=40, SENTRUM=[[3,3],[3,4],[4,3],[4,4]], SENTRUM_TURNS=10;
// Kallenavn spillet gir sjefen (mellomnavn)
const BOSSNICK=['Haien','Sigaren','Slakteren','Isbiten','Skyggen','Gribben','Bulldogen','Spøkelset','Bankieren','Gentlemannen','Stålneven','Silkehansken','Kortstokken','Diamanten','Ulven','Kobraen','Rotta','Hammeren','Jernkjeften','Tolvskuddet','Dommeren','Flaksen','Barbereren','Svartebørsen'];
const ORD={infl:'Påvirk',none:'Ingen ordre',hold:'Hel',move:'Flytt',take:'Ta kontroll',attack:'Angrip',extort:'Kreve inn'};
const MONTHS=['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'];

const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const CO=(x,y)=>'ABCDEFGH'[x]+(y+1);
const street=(x,y)=>`${SX[x]}gata / ${y+1}. aveny`;
const fn=f=>`<span class="fn f${f}">${FAM[f].name}</span>`;
const dateOf=t=>MONTHS[(t-1)%12]+' '+(1925+Math.floor((t-1)/12));
