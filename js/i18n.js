// Språk: engelsk (standard), norsk, fransk og tysk.
// Norsk er kildeteksten: t('norsk tekst med {navn}', {navn}) slår opp oversettelsen i I18N.
// Mangler en oversettelse, vises den norske teksten (og nøkkelen logges i I18N_MISS).
const LANGS=[['en','English'],['no','Norsk'],['fr','Français'],['de','Deutsch']];
let LANG='en';
try{const l=localStorage.getItem('forbudstid-lang');if(LANGS.some(x=>x[0]===l))LANG=l}catch(e){}
document.documentElement.lang=LANG==='no'?'nb':LANG;
const I18N_MISS=new Set();
const LI={en:0,fr:1,de:2};
function t(k,v){
  let s=k;
  if(LANG!=='no'){const r=I18N[k];if(r&&r[LI[LANG]]!=null)s=r[LI[LANG]];else I18N_MISS.add(k)}
  if(v)s=s.replace(/\{(\w+)\}/g,(m,n)=>v[n]!==undefined?v[n]:m);
  return s;
}
// Små bokstaver midt i setninger: tysk beholder stor forbokstav på substantiv, engelsk og tysk på måneder
const lc=s=>LANG==='de'?s:s.toLowerCase();
const lcMonth=s=>LANG==='no'||LANG==='fr'?s.toLowerCase():s;
// Lister og ord som er ulike per språk (navn, måneder, gater)
const L10=o=>o[LANG]||o.no;
// Anførselstegn rundt kallenavn
const Q=s=>L10({no:`«${s}»`,fr:`«${s}»`,en:`“${s}”`,de:`„${s}“`});
function setLang(l){try{localStorage.setItem('forbudstid-lang',l)}catch(e){}location.reload()}
// Oversetter fast tekst i index.html: elementer med data-t (hele innholdet), titler, aria-label og plassholdere
function applyI18n(){
  if(LANG==='no')return;
  const norm=s=>s.replace(/\s+/g,' ').trim();
  document.querySelectorAll('[data-t]').forEach(el=>{const k=norm(el.innerHTML);el.innerHTML=t(k)});
  document.querySelectorAll('[title],[aria-label]').forEach(el=>['title','aria-label'].forEach(a=>{const v=el.getAttribute(a);if(v)el.setAttribute(a,t(v))}));
  document.title=t(document.title);
}
