/* MedData — типы лекарств, дефолтные данные, иконки, хелперы. БЕЗ DOM. */
'use strict';
const RU_NAME={FUSID:'ФУСИД',FORXIGA:'ФОРКСИГА',AMIOCARD:'АМИОКАРД',ELIQUIS:'ЭЛИКВИС',LAEVOLAC:'ЛАЕВОЛАК',MUCOLESS:'МУКОЛЕСС',AEROVENT:'АЭРОВЕНТ',FLIXOTIDE:'ФЛИКСОТИД','VITAMIN D3':'ВИТАМИН D3',LIPITOR:'ЛИПИТОР',LAXADIN:'ЛАКСАДИН',GLYCERIN:'ГЛИЦЕРИН'};
function medRu(m){ const r=m.ru||RU_NAME[m.name]; return (r&&r!==m.name)?r:'' }
function medSub(m){return m.subKey?t(m.subKey):(m.sub||'')}
function medWarn(m){return m.warnKey?t(m.warnKey):(m.warn||'')}

/* ============ CONSTANTS ============ */
const TYPES={
 tab:{c:'#4F46E5',bg:'#ECECFD',svg:'<rect x="3" y="8" width="11" height="8" rx="4" transform="rotate(-45 8.5 12)"/><path d="M10.5 13.5l3-3"/>'},
 cap:{c:'#C2570C',bg:'#FCEBDD',svg:'<rect x="4" y="9.4" width="16" height="5.2" rx="2.6" transform="rotate(-35 12 12)"/><path d="M9.6 7.7l4.8 8.6"/>'},
 syr:{c:'#7C3AED',bg:'#F1E9FE',svg:'<path d="M9 3h6v3l-1 2v3h-4V8L9 6z"/><rect x="9" y="11" width="6" height="9" rx="2"/><path d="M9.5 15h5"/>'},
 drop:{c:'#0E7490',bg:'#DEF1F5',svg:'<path d="M12 3s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10z"/>'},
 inh:{c:'#059669',bg:'#DCF3EA',svg:'<path d="M3 12h6"/><circle cx="14" cy="12" r="4"/><path d="M18 12h3"/>'},
 sup:{c:'#EA580C',bg:'#FCE8DC',svg:'<path d="M12 3c2 2 3 4 3 7v7a3 3 0 0 1-6 0v-7c0-3 1-5 3-7z"/>'}
};
function tyLabel(k){return t('ty_'+k)}
const ORDER={tab:0,cap:1,syr:2,drop:3,inh:4,sup:5};
const DAYORDER=[0,1,2,3,4,5,6];
function icon(ty,s=18){const d=TYPES[ty]||TYPES.tab;return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d.svg}</svg>`}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

/* ============ DEFAULT DATA ============ */
function defaultState(){return JSON.parse(JSON.stringify({
 caregiver:"Джамшид",
 refillTime:"22:30",
 tgToken:"",
 tgChat:"",
 tgMissedMin:30,
 tgSummary:"22:00",
 times:["08:00","12:00","16:00","18:00","20:00"],
 meds:{
  fusid:{name:"FUSID",type:"tab",qty:"1 таблетка",subKey:"sub_fusid",img:"fusid"},
  forxiga:{name:"FORXIGA",type:"tab",qty:"1 таблетка",subKey:"sub_forxiga",img:"forxiga"},
  amiocard:{name:"AMIOCARD",type:"tab",qty:"1 таблетка",subKey:"sub_amiocard",warnKey:"w_amiocard",warnLevel:"red",excludeDays:[2,5],img:"amiocard"},
  eliquis:{name:"ELIQUIS",type:"tab",qty:"1 таблетка",subKey:"sub_eliquis",warnKey:"w_eliquis",warnLevel:"red",img:"eliquis"},
  laevolac:{name:"LAEVOLAC",type:"syr",qty:"30 мл",subKey:"sub_laevolac",img:"laevolac"},
  mucoless:{name:"MUCOLESS",type:"drop",qty:"4 мл",subKey:"sub_mucoless",img:"mucoless"},
  aerovent:{name:"AEROVENT",type:"inh",qty:"1 мл",subKey:"sub_aerovent",warnKey:"w_aerovent",warnLevel:"info",img:"aerovent"},
  flixotide:{name:"FLIXOTIDE",type:"inh",qty:"4 ампулы (4 мг)",subKey:"sub_flixotide",img:"flixotide"},
  vitamind3:{name:"VITAMIN D3",type:"cap",qty:"2 капсулы",subKey:"sub_vitd",img:"vitamin_d3"},
  lipitor:{name:"LIPITOR",type:"tab",qty:"1 таблетка",subKey:"sub_lipitor",img:"lipitor"},
  laxadin:{name:"LAXADIN",type:"tab",qty:"2 таблетки",subKey:"sub_laxadin",img:"laxadin"},
  glycerin:{name:"GLYCERIN",type:"sup",qty:"1 свеча",subKey:"sub_glycerin",img:null}
 },
 schedule:{
  "08:00":["fusid","forxiga","amiocard","eliquis","laevolac","mucoless","aerovent","flixotide"],
  "12:00":["vitamind3","aerovent","flixotide"],
  "16:00":["aerovent"],
  "18:00":["lipitor","laxadin","flixotide"],
  "20:00":["eliquis","aerovent"]
 }
}))}

/* ---- добавлено при переходе на клиент-серверную структуру ---- */
var IMG_SRC = {
 "aerovent": "img/aerovent.jpg",
 "amiocard": "img/amiocard.jpg",
 "eliquis": "img/eliquis.jpg",
 "flixotide": "img/flixotide.jpg",
 "forxiga": "img/forxiga.jpg",
 "fusid": "img/fusid.jpg",
 "laxadin": "img/laxadin.jpg",
 "lipitor": "img/lipitor.jpg",
 "mucoless": "img/mucoless.jpg",
 "vitamin_d3": "img/vitamin_d3.jpg",
 "laevolac": "img/laevolac.jpg"
};
function medImg(m){ if(!m||!m.img)return null;
  if(typeof m.img==='string'&&m.img.indexOf('data:')===0)return m.img;
  return IMG_SRC[m.img]||null; }
/* FNV-1a 32-бит: пароль настроек и детектор изменений бэкапа */
function hash(str){ var h=0x811c9dc5>>>0; str=String(str);
  for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; }
  return (h>>>0).toString(36); }
