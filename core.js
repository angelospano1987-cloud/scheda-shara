/* Logica pura di Scheda SHARA: nessun accesso a pagina, memoria o rete.
   Caricata dal browser prima di app.js (window.SharaCore) e dai test in Node (require). */
(function(root){
"use strict";

/* Scheda di partenza: nomi, serie, ripetizioni e recuperi come in "SCHEDA ALLENAMENTO.docx"
   (verificato da tests/scheda.test.mjs contro tests/scheda-word.json).
   Video YouTube: ID letti dai risultati di ricerca e incorporabilita' verificata via oEmbed il 25.09.2026.
   inc = incremento proposto in kg quando tutte le serie sono state completate. */
const DEFAULT_DAYS = [
  { id:"lun", name:"Lunedì", dow:1, plate:"var(--red)", focus:"Glutei, femorali, spalle",
    warm:["Circonduzioni delle anche e affondi dinamici, 8 per lato","Ponte glutei a corpo libero, 12 ripetizioni","Good morning a corpo libero (mani sui fianchi), 10 ripetizioni","Circonduzioni delle spalle e apertura con elastico, 10 + 10"],
    items:[
      { id:"hip", sets:4, rest:90, note:"", parts:[
        { name:"Hip thrust con bilanciere", short:"Hip thrust", reps:"8", inc:2.5,
          v:[{id:"K2Q6hRKYpMI", ch:"Dieta Flessibile", d:"1:45"},{id:"IHk9Qn8ttX8", ch:"Project inVictus", d:"6:13"}],
          cues:["Scapole appoggiate sul bordo della panca, bilanciere sulle anche con l'imbottitura.","Piedi alla larghezza delle anche: in alto le tibie devono essere verticali.","Spingi con i talloni e stringi i glutei 1 secondo in alto, bacino leggermente in retroversione.","Mento verso il petto: non inarcare la zona lombare."] } ] },
      { id:"legcurl", sets:3, rest:90, note:"Con 2 sec di isometria.", parts:[
        { name:"leg curl", short:"Leg curl", reps:"12", inc:2.5,
          v:[{id:"1zevKZn_n1E", ch:"Project inVictus", d:"3:36"},{id:"sLsmkdBH3c8", ch:"Wepa Science", d:"1:01"}],
          cues:["Ginocchio allineato al perno della macchina, rullo appena sopra il tallone.","Fletti fino in fondo e tieni la posizione 2 secondi.","Ritorno lento e controllato, senza lasciar cadere il peso.","Bacino fermo sul sedile: non sollevarlo per aiutarti."] } ] },
      { id:"rdl", sets:4, rest:90, note:"", parts:[
        { name:"Mezzo stacco rumeno con bilanciere", short:"Stacco", reps:"8", inc:2.5,
          v:[{id:"w3BVJ0GyBnI", ch:"Lorenzo Gabrielli Coaching", d:"2:58"},{id:"_P3WyVBuSwA", ch:"Project Strength Genova", d:"0:45"}],
          cues:["Parti in piedi, ginocchia leggermente flesse e ferme per tutta la serie.","Porta le anche indietro: il bilanciere scivola a contatto con le cosce.","Schiena neutra e scapole strette; scendi finché senti tirare i femorali (circa metà tibia).","Risali spingendo le anche in avanti e stringendo i glutei."] } ] },
      { id:"lpsingle", sets:3, rest:90, note:"", parts:[
        { name:"Leg Press single leg", short:"Leg press", reps:"12", inc:2.5,
          v:[{id:"1v8w-I2FEoE", ch:"4fit Sport & Fitness", d:"0:15"},{id:"S6-h9rUZVOY", ch:"Project inVictus", d:"1:10"}],
          cues:["Piede al centro della pedana, ginocchio in linea con la punta del piede.","Scendi finché il bacino resta appoggiato allo schienale.","Non bloccare il ginocchio in estensione completa.","Finisci tutte le ripetizioni con una gamba, poi cambia."] } ] },
      { id:"spress", sets:4, rest:90, note:"Superserie: shoulder press e subito alzate laterali, poi recupero.", parts:[
        { name:"Shoulder Press manubri o macchina con cavi (macchine isotoniche)", short:"Press", reps:"10", inc:2,
          v:[{id:"fkW9CxGN4pk", ch:"Dieta Flessibile", d:"1:17"},{id:"AfIJ6VwYR5g", ch:"Project inVictus", d:"4:37"}],
          cues:["Schienale quasi verticale, piedi ben appoggiati a terra.","Manubri all'altezza delle orecchie, gomiti leggermente in avanti.","Spingi verso l'alto senza far battere i manubri.","Addome contratto: la schiena non si inarca."] },
        { name:"alzate laterali", short:"Alzate", reps:"10", inc:1,
          v:[{id:"FDCwcG71Yi0", ch:"Umberto Miletto", d:"1:46"},{id:"9yg83KalYTo", ch:"GianzCoach", d:"9:29"}],
          cues:["Busto appena inclinato in avanti, gomiti morbidi.","Sali fino all'altezza delle spalle guidando il movimento con i gomiti.","Niente slancio: scendi in circa 2 secondi.","Spalle basse, lontane dalle orecchie."] } ] }
    ] },
  { id:"mer", name:"Mercoledì", dow:3, plate:"var(--blue)", focus:"Petto e tricipiti",
    warm:["Circonduzioni delle braccia avanti e indietro, 10 + 10","Rotazioni esterne con elastico, 12 per lato","Apertura toracica a quattro zampe (libro), 8 per lato","Piegamenti sulle ginocchia lenti, 8 ripetizioni"],
    items:[
      { id:"bench", sets:4, rest:90, note:"", parts:[
        { name:"Panca piana con manubri", short:"Panca", reps:"8", inc:2,
          v:[{id:"n8CskqpOPek", ch:"Project inVictus", d:"5:49"},{id:"ON0D6MmOVDo", ch:"Invictus Club Torino", d:"0:52"}],
          cues:["Scapole strette e basse, piedi saldi a terra.","Parti con i manubri sopra le spalle.","Scendi ai lati del petto con i gomiti a circa 45–60° dal busto.","Spingi in alto avvicinando appena i manubri, polsi dritti."] } ] },
      { id:"flyinc", sets:3, rest:90, note:"", parts:[
        { name:"Aperture laterali (petto) panca inclinata a 45°", short:"Aperture", reps:"12", inc:1,
          v:[{id:"d4rmg47U8HA", ch:"Dieta Flessibile", d:"0:57"},{id:"BwHw56WdXPQ", ch:"Davide Luna", d:"0:53"}],
          cues:["Manubri sopra il petto, palmi rivolti uno verso l'altro.","Apri ad arco con i gomiti leggermente flessi e fermi.","Scendi finché senti allungare il petto, senza superare la linea delle spalle.","Richiudi stringendo il petto, non spingendo con le braccia."] } ] },
      { id:"cablefly", sets:4, rest:90, note:"", parts:[
        { name:"Croci ai Cavi (una gamba avanti, busto inclinato, spalla 45°, braccio in estensione)", short:"Croci", reps:"10", inc:2.5,
          v:[{id:"V6kI05lcj-g", ch:"Francesco Russillo PT", d:"0:30"},{id:"d7B7bXZr26c", ch:"V Athlete", d:"7:34"}],
          cues:["Un piede avanti per stabilità, busto inclinato in avanti.","Braccia quasi tese, come da scheda.","Porta le mani avanti e insieme descrivendo un arco, stringi 1 secondo.","Torna lentamente senza lasciare che il cavo ti tiri indietro le spalle."] } ] },
      { id:"pushdown", sets:3, rest:90, note:"", parts:[
        { name:"Push down cavo corda (tricipidi)", short:"Push down", reps:"10", inc:2.5,
          v:[{id:"z-GYsUm3f9c", ch:"Project inVictus", d:"4:21"},{id:"vdwP7HxDAo4", ch:"Davide Morelli", d:"0:11"}],
          cues:["Gomiti fermi, attaccati ai fianchi.","Spingi giù fino a braccia tese e apri la corda in fondo.","Risali fino a circa 90° senza sollevare i gomiti.","Busto fermo: niente oscillazioni."] } ] },
      { id:"french", sets:3, rest:90, note:"", parts:[
        { name:"French Press con manubrio", short:"French", reps:"10", inc:2,
          v:[{id:"CHyjj0frj54", ch:"Vegan Coach", d:"1:09"},{id:"agVvU-OVZ-o", ch:"Lorenzo Gabrielli Coaching", d:"5:03"}],
          cues:["Gomiti fermi e rivolti in alto: si muove solo l'avambraccio.","Scendi lento finché senti allungare il tricipite.","Estendi le braccia senza bloccare i gomiti di scatto.","Carico moderato: la tecnica viene prima del peso."] } ] }
    ] },
  { id:"ven", name:"Venerdì", dow:5, plate:"var(--yellow)", focus:"Gambe, dorso, bicipiti",
    warm:["Squat a corpo libero lenti, 10 ripetizioni","Mobilità delle caviglie al muro, 10 per lato","Circonduzioni delle spalle e retrazione delle scapole, 10 + 10","Circonduzioni di polsi e gomiti, 10 per lato"],
    items:[
      { id:"legpress", sets:3, rest:90, note:"Superserie: leg press e subito leg extension, poi recupero.", parts:[
        { name:"Leg press", short:"Press", reps:"10", inc:5,
          v:[{id:"LMTyPl_oo38", ch:"Project inVictus", d:"3:55"},{id:"mAweueISnMI", ch:"Luigi Colbax", d:"5:48"}],
          cues:["Piedi alla larghezza delle spalle, a metà pedana.","Scendi fino a circa 90° di ginocchio, bacino sempre appoggiato.","Ginocchia in linea con le punte dei piedi.","Non bloccare le ginocchia in alto."] },
        { name:"leg extension", short:"Extension", reps:"10", inc:2.5,
          v:[{id:"wRSr98kKUsg", ch:"Project inVictus", d:"5:34"},{id:"IZpKu3JyLKs", ch:"TrainingPedia", d:"2:01"}],
          cues:["Regola lo schienale: ginocchio allineato al perno della macchina.","Rullo appoggiato sopra la caviglia.","Estendi fino in fondo e tieni 1 secondo.","Scendi lento, senza far toccare i pesi."] } ] },
      { id:"lat", sets:4, rest:90, note:"", parts:[
        { name:"Lat machine", short:"Lat", reps:"10", inc:2.5,
          v:[{id:"zhCwrtIZaQk", ch:"Luigi Colbax", d:"1:38"},{id:"P8QKoy5sjv8", ch:"Project inVictus", d:"8:01"}],
          cues:["Presa poco più larga delle spalle, cosce bloccate sotto i rulli.","Petto in fuori, busto appena inclinato indietro.","Tira la barra verso la parte alta del petto portando i gomiti giù e indietro.","Risali controllato fino ad allungare bene la schiena."] } ] },
      { id:"row", sets:3, rest:90, note:"", parts:[
        { name:"Rematore Singolo manubri", short:"Rematore", reps:"12", inc:2,
          v:[{id:"-ebafKeAmXs", ch:"Project inVictus", d:"4:46"},{id:"1e-Ks7gpp44", ch:"Invictus Club Torino", d:"0:31"}],
          cues:["Mano e ginocchio appoggiati sulla panca, schiena piatta.","Tira il manubrio verso l'anca, gomito vicino al corpo.","Il busto non ruota durante la tirata.","Scendi fino a braccio disteso, poi ripeti."] } ] },
      { id:"ezcurl", sets:3, rest:90, note:"", parts:[
        { name:"Bic Curl con manubrio a zeta", short:"Curl zeta", reps:"12", inc:2.5,
          v:[{id:"6YH1xZZ43Vw", ch:"Project inVictus", d:"7:21"},{id:"7ECvCFpsOik", ch:"Daniele Esposito", d:"0:57"}],
          cues:["Impugna il bilanciere sulle curve, alla larghezza delle spalle.","Gomiti fermi ai fianchi.","Sali senza slanciare il busto.","Scendi controllato fino quasi a braccia tese."] } ] },
      { id:"inccurl", sets:3, rest:90, note:"", parts:[
        { name:"Panca inclinata a 60° bi curl", short:"Curl 60°", reps:"10", inc:1,
          v:[{id:"0o5foceYAnA", ch:"Project inVictus", d:"5:17"},{id:"rr2meFMsgSY", ch:"Dieta Flessibile", d:"1:51"}],
          cues:["Braccia che pendono verticali, leggermente dietro il busto.","Fletti senza portare i gomiti in avanti.","Ruota il palmo verso l'alto mentre sali.","Scendi fino a braccio completamente disteso."] } ] }
    ] }
];

/* ---------- utilita' ---------- */
const clone = o => JSON.parse(JSON.stringify(o));
/* Confronto indipendente dall'ordine delle chiavi: due copie con gli stessi dati non devono sembrare diverse. */
const canon = o => Array.isArray(o) ? "["+o.map(canon).join(",")+"]" : (o && typeof o==="object") ? "{"+Object.keys(o).sort().map(k=>JSON.stringify(k)+":"+canon(o[k])).join(",")+"}" : JSON.stringify(o===undefined?null:o);
const same = (x,y) => canon(x)===canon(y);
const num = x => { const n=parseFloat(String(x==null?"":x).replace(",",".")); return isFinite(n) ? n : null; };
const kgFmt = n => (Math.round(n*10)/10).toLocaleString("it-IT");
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function isoOf(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function dateOf(iso){ const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d); }
function fmtDate(iso){ return dateOf(iso).toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"}); }
function shortDate(iso){ return dateOf(iso).toLocaleDateString("it-IT",{day:"numeric",month:"short"}); }
function mondayOf(iso){ const d=dateOf(iso); d.setDate(d.getDate()-((d.getDay()+6)%7)); return isoOf(d); }
function addDays(iso,n){ const d=dateOf(iso); d.setDate(d.getDate()+n); return isoOf(d); }

const targetReps = p => { const n=parseInt(p.reps,10); return isFinite(n)&&n>0 ? n : null; };
const doseOf = it => it.sets+" × "+it.parts.map(p=>p.reps).join(" + ");
function ytId(s){
  s=String(s||"").trim(); if(!s) return "";
  if(/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m=s.match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/);
  return m ? m[1] : null;
}
const live = d => !!(d && !d.deleted && d.sets);
const newer = (a,b) => (a&&a.updated||"") > (b&&b.updated||"");

/* ---------- unione fra dispositivi ----------
   Pesi: per sessione (data_giorno); note: per esercizio; corpo: per data; scheda: intera. Vince "updated" piu' recente.
   Una voce eliminata resta come segno di cancellazione (deleted), cosi' l'eliminazione vince anche altrove. */
function mergeLogs(a,b){
  const out=Object.assign({},a);
  for(const [k,v] of Object.entries(b||{})){ if(v && v.day && v.date && (v.sets||v.deleted) && (!out[k] || newer(v,out[k]))) out[k]=v; }
  return out;
}
function mergeNotes(a,b){
  const out=Object.assign({},a);
  for(const [k,v] of Object.entries(b||{})){ if(v && typeof v.text==="string" && (!out[k] || newer(v,out[k]))) out[k]=v; }
  return out;
}
function mergeBody(a,b){
  const out=Object.assign({},a);
  for(const [k,v] of Object.entries(b||{})){ if(v && /^\d{4}-\d{2}-\d{2}$/.test(k) && (!out[k] || newer(v,out[k]))) out[k]=v; }
  return out;
}
function validPlan(p){ return !!(p && Array.isArray(p.days) && p.days.length && p.days.every(d=>d && d.id && Array.isArray(d.items))); }
function mergeAll(local,remote){
  const lp=validPlan(local.plan)?local.plan:null, rp=validPlan(remote.plan)?remote.plan:null;
  const plan = !lp ? rp : !rp ? lp : (newer(rp,lp) ? rp : lp);
  return {log:mergeLogs(local.log||{},remote.log), notes:mergeNotes(local.notes||{},remote.notes), plan, body:mergeBody(local.body||{},remote.body)};
}

/* ---------- volume e settimana ----------
   Volume = somma di kg × ripetizioni delle serie spuntate; se le ripetizioni non sono scritte vale il numero previsto. */
function repsOf(r,pi,it){ return num((r.reps||[])[pi]) ?? (it&&it.parts[pi]?targetReps(it.parts[pi]):null); }
function docStats(d,days){
  const day=days.find(x=>x.id===d.day); let sets=0, volume=0;
  for(const [itId,rows] of Object.entries(d.sets||{})){
    const it=day && day.items.find(x=>x.id===itId);
    (rows||[]).forEach(r=>{ if(!r||!r.done) return; sets++;
      (r.kg||[]).forEach((k,pi)=>{ const kg=num(k); if(kg===null) return; const rp=repsOf(r,pi,it); if(rp) volume+=kg*rp; }); });
  }
  return {sets, volume};
}
function weekStats(monday,docs,days){
  const end=addDays(monday,6), out={sessions:0,sets:0,volume:0,days:{}};
  docs.forEach(d=>{
    if(!live(d) || d.date<monday || d.date>end) return;
    const s=docStats(d,days);
    if(s.sets){ out.sessions++; out.sets+=s.sets; out.volume+=s.volume; out.days[d.day]=true; }
  });
  return out;
}

/* ---------- carico suggerito ----------
   Doppia progressione: se l'ultima volta tutte le serie sono state spuntate e nessuna e' sotto le ripetizioni previste,
   si propone il carico massimo usato + l'incremento dell'esercizio; altrimenti si resta al carico massimo. */
function lastWith(docs,itId,pi,before){
  return docs.filter(d=>live(d) && d.date<before && Array.isArray(d.sets[itId]) && d.sets[itId].some(r=>r && num((r.kg||[])[pi])!==null))
    .sort((a,b)=>a.date<b.date?1:-1)[0] || null;
}
function suggestion(docs,it,pi,today){
  const prev=lastWith(docs,it.id,pi,today); if(!prev) return null;
  const rows=prev.sets[it.id].filter(Boolean), p=it.parts[pi], tgt=targetReps(p);
  const base=Math.max(...rows.map(r=>num((r.kg||[])[pi])).filter(v=>v!==null)), inc=num(p.inc)||2.5;
  const allDone=rows.length>0 && rows.every(r=>r.done);
  const short=rows.filter(r=>{ const rp=num((r.reps||[])[pi]); return tgt && rp!==null && rp<tgt; }).length;
  const when=shortDate(prev.date);
  if(allDone && !short) return {kg:base+inc, up:true, why:"il "+when+" hai completato tutte le serie a "+kgFmt(base)+" kg"};
  if(allDone) return {kg:base, up:false, why:short+(short===1?" serie è rimasta":" serie sono rimaste")+" sotto le "+tgt+" ripetizioni il "+when};
  return {kg:base, up:false, why:"il "+when+" non hai completato tutte le serie"};
}

/* ---------- record personali ----------
   Massimale stimato con la formula di Epley: kg × (1 + ripetizioni / 30). E' una stima: sopra le 12 ripetizioni perde precisione. */
const e1rm = (kg,reps) => kg*(1+reps/30);
function rowBests(rows,it,pi){
  let kg=null, rm=null;
  (rows||[]).forEach(r=>{ if(!r) return; const k=num((r.kg||[])[pi]); if(k===null) return; const rp=repsOf(r,pi,it);
    if(kg===null||k>kg) kg=k; if(rp){ const v=e1rm(k,rp); if(rm===null||v>rm) rm=v; } });
  return {kg, rm};
}
function bests(docs,it,pi,before){
  const out={kg:null,kgDate:null,rm:null,rmDate:null};
  docs.forEach(d=>{ if(!live(d) || (before && d.date>=before) || !Array.isArray(d.sets[it.id])) return;
    const b=rowBests(d.sets[it.id],it,pi);
    if(b.kg!==null && (out.kg===null||b.kg>out.kg)){ out.kg=b.kg; out.kgDate=d.date; }
    if(b.rm!==null && (out.rm===null||b.rm>out.rm)){ out.rm=b.rm; out.rmDate=d.date; } });
  return out;
}
/* Record di oggi rispetto a tutte le sessioni precedenti; alla prima sessione non c'e' niente da battere. */
function recordToday(docs,it,pi,today,todayRows){
  const prev=bests(docs,it,pi,today); if(prev.kg===null) return null;
  const t=rowBests(todayRows,it,pi);
  if(t.kg!==null && t.kg>prev.kg) return {type:"kg", value:t.kg, prev:prev.kg};
  if(t.rm!==null && prev.rm!==null && t.rm>prev.rm+0.05) return {type:"rm", value:t.rm, prev:prev.rm};
  return null;
}

/* ---------- archivio delle schede ---------- */
const ARCHIVE_MAX_PER_DAY = 20;
function archivePush(plan,dayId,oldDay,nowIso){
  const p=clone(plan); p.archive=(p.archive||[]).slice();
  p.archive.push({id:"a"+Date.parse(nowIso).toString(36)+Math.random().toString(36).slice(2,5), dayId, savedAt:nowIso, day:clone(oldDay)});
  const mine=p.archive.filter(a=>a.dayId===dayId);
  if(mine.length>ARCHIVE_MAX_PER_DAY){ const drop=new Set(mine.slice(0,mine.length-ARCHIVE_MAX_PER_DAY).map(a=>a.id)); p.archive=p.archive.filter(a=>!drop.has(a.id)); }
  return p;
}

/* ---------- corpo ---------- */
const BODY_FIELDS = [
  {k:"peso", label:"Peso", unit:"kg", min:30, max:250},
  {k:"vita", label:"Vita", unit:"cm", min:40, max:200},
  {k:"fianchi", label:"Fianchi", unit:"cm", min:40, max:200},
  {k:"petto", label:"Petto", unit:"cm", min:40, max:200},
  {k:"braccio", label:"Braccio", unit:"cm", min:15, max:80},
  {k:"coscia", label:"Coscia", unit:"cm", min:25, max:120}
];
function bodySeries(body,field){
  return Object.values(body||{}).filter(e=>e && !e.deleted && num(e[field])!==null).map(e=>({date:e.date, v:num(e[field])})).sort((a,b)=>a.date<b.date?-1:1);
}

const api = {DEFAULT_DAYS, clone, canon, same, num, kgFmt, esc, isoOf, dateOf, fmtDate, shortDate, mondayOf, addDays,
  targetReps, doseOf, ytId, live, mergeLogs, mergeNotes, mergeBody, validPlan, mergeAll, repsOf, docStats, weekStats,
  lastWith, suggestion, e1rm, rowBests, bests, recordToday, ARCHIVE_MAX_PER_DAY, archivePush, BODY_FIELDS, bodySeries};
root.SharaCore = api;
if(typeof module!=="undefined" && module.exports) module.exports = api;
})(typeof window!=="undefined" ? window : globalThis);
