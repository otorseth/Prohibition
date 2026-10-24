// Konstanter, typer, bygninger, våpen og små hjelpefunksjoner
const N=8, MAXB=6, WIN=40, SAVE='forbudstid-v1';
const MAXHP=20, FAMHEX=['#d0aa5f','#c4554a','#5c9c8b','#9282c4'];
// Tre hovedtyper med tre bygninger hver, pluss tre spesialkvartaler
const TYPES={
  bolig:{n:t('Bolig'),inc:1,res:0},
  komm:{n:t('Kommersiell'),inc:2,res:1},
  ind:{n:t('Industri'),inc:2,res:2},
  havn:{n:t('Havn'),inc:5,res:2},
  politi:{n:t('Politistasjon'),inc:1,res:4},
  hq:{n:t('Hovedkvarter'),inc:3,res:3}
};
// v = ekstra inntekt per måned når bygningen er påvirket, res = motstand mot påvirkning
const BK={
  leie:{n:t('Leiegård'),c:'bolig',v:2,res:1}, rekke:{n:t('Rekkehus'),c:'bolig',v:1,res:0}, villa:{n:t('Villa'),c:'bolig',v:2,res:2},
  pensjonat:{n:t('Pensjonat'),c:'bolig',v:1,res:0}, arbeider:{n:t('Arbeiderboliger'),c:'bolig',v:1,res:0},
  speak:{n:t('Speakeasy'),c:'komm',v:4,res:2}, kasino:{n:t('Spillebule'),c:'komm',v:5,res:3}, bakeri:{n:t('Bakeri'),c:'komm',v:2,res:0},
  slakter:{n:t('Slakter'),c:'komm',v:2,res:0}, frisor:{n:t('Barberer'),c:'komm',v:2,res:0}, pante:{n:t('Pantelåner'),c:'komm',v:3,res:1},
  kino:{n:t('Kino'),c:'komm',v:3,res:1}, rest:{n:t('Restaurant'),c:'komm',v:3,res:1},
  brygg:{n:t('Bryggeri'),c:'ind',v:4,res:2}, destill:{n:t('Destilleri'),c:'ind',v:5,res:3}, fabrikk:{n:t('Fabrikk'),c:'ind',v:3,res:1},
  lager:{n:t('Lagerhall'),c:'ind',v:2,res:0}, sag:{n:t('Sagbruk'),c:'ind',v:3,res:1}, trykk:{n:t('Trykkeri'),c:'ind',v:3,res:1}
};
const CATN={bolig:t('Bolig'),komm:t('Butikk'),ind:t('Industri')};
// Våpen: én per bande, gir ekstra muskler. d = hvordan våpenet tegnes i kampscenen.
const WEAP={
  strompe:{n:Q(t('Strømpebåndet')),t:t('Lommepistol'),p:15,m:1,d:'derringer'},
  roscoe:{n:Q(t('Roscoe')),t:t('Revolver'),p:30,m:2,d:'revolver'},
  heater:{n:Q(t('Heater')),t:t('Halvautomatisk pistol'),p:50,m:3,d:'pistol'},
  feie:{n:Q(t('Feiekosten')),t:t('Avsagd hagle'),p:70,m:4,d:'shotgun'},
  tom:{n:Q(t('Lange Tom')),t:t('Repetergevær'),p:90,m:4,d:'rifle'},
  tommy:{n:Q(t('Tommy-gun')),t:t('Maskinpistol'),p:140,m:6,d:'tommy'}
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
  if(f===0)L(t('{g} fikk levert {w} ({ty}, +{m} muskler) for ${p}.',{g:g.name,w:W.n,ty:lc(W.t),m:W.m,p:wPrice(id)}));
  return true;
}
function genBld(t,must){
  const ks=Object.keys(BK).filter(k=>BK[k].c===t); let out;
  if(t==='bolig')out=[0,1,2].map(()=>pick(ks));
  else{out=ks.slice().sort(()=>Math.random()-.5).slice(0,3);if(must&&!out.includes(must))out[0]=must}
  return out.map(k=>({k,by:-1}));
}
const FAM=[
  {name:t('Din familie'),c:'var(--f0)'},
  {name:'Rossetti',c:'var(--f1)'},
  {name:"O'Dwyer",c:'var(--f2)'},
  {name:'Novak',c:'var(--f3)'}
];
const HQS=[[0,0],[7,7],[7,0],[0,7]];
const SX=L10({no:['Kanal','Mølle','Union','Marked','Lind','Smie','Bisp','Havne'],
  en:['Canal','Mill','Union','Market','Linden','Forge','Bishop','Harbor'],
  fr:['du Canal','du Moulin','de l’Union','du Marché','des Tilleuls','de la Forge','de l’Évêque','du Port'],
  de:['Kanal','Mühlen','Union','Markt','Linden','Schmiede','Bischofs','Hafen']});
// Bandenavn. Kvinner får egne fornavn og kallenavn, og vises som kvinner i portrett og kampscene.
const FIRST=['Tommy','Sal','Benny','Frankie','Lou','Mickey','Vito','Eddie','Nicky','Joe','Dutch','Rocco','Gus','Irish','Fat Pete'];
const FIRST_F=['Mae','Ruby','Lola','Bonnie','Stella','Rosie','Dottie','Velma','Hazel','Kitty'];
const NICK=L10({no:['Kniven','Lynet','Hatten','Snusen','Tannløs','Doktoren','Pianisten','Kalde','Kjeksen','Bjørnen','Presten','Revolveren','Smilet','Glasset'],
  en:['The Knife','Lightning','The Hat','Snuff','Toothless','The Doctor','The Pianist','Ice','Cookie','The Bear','The Preacher','Six-Shooter','Smiles','Glass Jaw'],
  fr:['le Couteau','l’Éclair','le Chapeau','la Prise','Sans-Dents','le Docteur','le Pianiste','le Froid','Biscuit','l’Ours','le Curé','le Revolver','Sourire','Mâchoire de Verre'],
  de:['das Messer','der Blitz','der Hut','Schnupf','Zahnlos','der Doktor','der Pianist','der Kalte','Keks','der Bär','der Prediger','der Revolver','Grinser','Glaskinn']});
const NICK_F=L10({no:['Kniven','Lynet','Doktoren','Pianisten','Kalde','Revolveren','Smilet','Glasset','Dronningen','Enken','Perlen','Sirenen','Silken','Hjerteknuseren'],
  en:['The Knife','Lightning','The Doctor','The Pianist','Ice','Six-Shooter','Smiles','Glass Jaw','The Queen','The Widow','The Pearl','The Siren','Silk','Heartbreaker'],
  fr:['le Couteau','l’Éclair','la Doctoresse','la Pianiste','la Froide','le Revolver','Sourire','Mâchoire de Verre','la Reine','la Veuve','la Perle','la Sirène','Soie','Briseuse de Cœurs'],
  de:['das Messer','der Blitz','die Doktorin','die Pianistin','die Kalte','der Revolver','Grinserin','Glaskinn','die Königin','die Witwe','die Perle','die Sirene','Seide','Herzensbrecherin']});
const FEM_SHARE=.25; // andel kvinner blant nye bander
const isFem=name=>FIRST_F.includes(String(name||'').split(' ')[0]);
// Spilltyper (seiersbetingelser). Å knuse alle rivalene gir alltid seier.
const MODES={
  dominans:{n:t('Dominans'),d:t('Eie 40 av byens 64 kvartaler.')},
  kapitalist:{n:t('Kapitalist'),d:t('Ha mest penger i kassen etter 40 måneder.')},
  sniken:{n:t('Sniken'),d:t('Ta kontroll over alle fire hovedkvarterene.')},
  sentrum:{n:t('Sentrum'),d:t('Eie D4, D5, E4 og E5 samtidig i 10 måneder på rad.')}
};
const KAP_TURNS=40, SENTRUM=[[3,3],[3,4],[4,3],[4,4]], SENTRUM_TURNS=10;
// Kallenavn spillet gir sjefen (mellomnavn)
const BOSSNICK=L10({no:['Haien','Sigaren','Slakteren','Isbiten','Skyggen','Gribben','Bulldogen','Spøkelset','Bankieren','Gentlemannen','Stålneven','Silkehansken','Kortstokken','Diamanten','Ulven','Kobraen','Rotta','Hammeren','Jernkjeften','Tolvskuddet','Dommeren','Flaksen','Barbereren','Svartebørsen'],
  en:['The Shark','The Cigar','The Butcher','Ice Cube','The Shadow','The Vulture','The Bulldog','The Ghost','The Banker','The Gentleman','Iron Fist','Silk Glove','The Deck','Diamond','The Wolf','The Cobra','The Rat','The Hammer','Iron Jaw','Twelve Gauge','The Judge','Lucky','The Barber','Black Market'],
  fr:['le Requin','le Cigare','le Boucher','Glaçon','l’Ombre','le Vautour','le Bouledogue','le Fantôme','le Banquier','le Gentleman','Poing d’Acier','Gant de Soie','le Jeu de Cartes','Diamant','le Loup','le Cobra','le Rat','le Marteau','Mâchoire de Fer','Calibre Douze','le Juge','le Veinard','le Barbier','Marché Noir'],
  de:['der Hai','die Zigarre','der Schlachter','Eiswürfel','der Schatten','der Geier','die Bulldogge','das Gespenst','der Bankier','der Gentleman','Stahlfaust','Samthandschuh','das Kartenspiel','Diamant','der Wolf','die Kobra','die Ratte','der Hammer','Eisenkiefer','Zwölfender','der Richter','Glückspilz','der Barbier','Schwarzmarkt']});
const ORD={infl:t('Påvirk'),none:t('Ingen ordre'),hold:t('Hel'),move:t('Flytt'),take:t('Ta kontroll'),attack:t('Angrip'),extort:t('Kreve inn')};
const MONTHS=L10({no:['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'],
  en:['January','February','March','April','May','June','July','August','September','October','November','December'],
  fr:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']});

const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const CO=(x,y)=>'ABCDEFGH'[x]+(y+1);
const street=(x,y)=>t('{s}gata / {n}. aveny',{s:SX[x],n:y+1});
const fn=f=>`<span class="fn f${f}">${FAM[f].name}</span>`;
const dateOf=t=>MONTHS[(t-1)%12]+' '+(1925+Math.floor((t-1)/12));
