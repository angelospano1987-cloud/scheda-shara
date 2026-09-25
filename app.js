(function(){
"use strict";

/* Scheda di partenza: dati trascritti da "SCHEDA ALLENAMENTO.docx".
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
      { id:"legcurl", sets:3, rest:90, note:"2 secondi di isometria in contrazione a ogni ripetizione.", parts:[
        { name:"Leg curl", short:"Leg curl", reps:"12", inc:2.5,
          v:[{id:"1zevKZn_n1E", ch:"Project inVictus", d:"3:36"},{id:"sLsmkdBH3c8", ch:"Wepa Science", d:"1:01"}],
          cues:["Ginocchio allineato al perno della macchina, rullo appena sopra il tallone.","Fletti fino in fondo e tieni la posizione 2 secondi.","Ritorno lento e controllato, senza lasciar cadere il peso.","Bacino fermo sul sedile: non sollevarlo per aiutarti."] } ] },
      { id:"rdl", sets:4, rest:90, note:"", parts:[
        { name:"Mezzo stacco rumeno con bilanciere", short:"Stacco", reps:"8", inc:2.5,
          v:[{id:"w3BVJ0GyBnI", ch:"Lorenzo Gabrielli Coaching", d:"2:58"},{id:"_P3WyVBuSwA", ch:"Project Strength Genova", d:"0:45"}],
          cues:["Parti in piedi, ginocchia leggermente flesse e ferme per tutta la serie.","Porta le anche indietro: il bilanciere scivola a contatto con le cosce.","Schiena neutra e scapole strette; scendi finché senti tirare i femorali (circa metà tibia).","Risali spingendo le anche in avanti e stringendo i glutei."] } ] },
      { id:"lpsingle", sets:3, rest:90, note:"12 ripetizioni per gamba.", parts:[
        { name:"Leg press single leg", short:"Leg press", reps:"12", inc:2.5,
          v:[{id:"1v8w-I2FEoE", ch:"4fit Sport & Fitness", d:"0:15"},{id:"S6-h9rUZVOY", ch:"Project inVictus", d:"1:10"}],
          cues:["Piede al centro della pedana, ginocchio in linea con la punta del piede.","Scendi finché il bacino resta appoggiato allo schienale.","Non bloccare il ginocchio in estensione completa.","Finisci tutte le ripetizioni con una gamba, poi cambia."] } ] },
      { id:"spress", sets:4, rest:90, note:"Superserie: shoulder press e subito alzate laterali, poi recupero.", parts:[
        { name:"Shoulder press manubri o macchina ai cavi", short:"Press", reps:"10", inc:2,
          v:[{id:"fkW9CxGN4pk", ch:"Dieta Flessibile", d:"1:17"},{id:"AfIJ6VwYR5g", ch:"Project inVictus", d:"4:37"}],
          cues:["Schienale quasi verticale, piedi ben appoggiati a terra.","Manubri all'altezza delle orecchie, gomiti leggermente in avanti.","Spingi verso l'alto senza far battere i manubri.","Addome contratto: la schiena non si inarca."] },
        { name:"Alzate laterali", short:"Alzate", reps:"10", inc:1,
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
      { id:"flyinc", sets:3, rest:90, note:"Panca inclinata a 45°.", parts:[
        { name:"Aperture laterali su panca inclinata", short:"Aperture", reps:"12", inc:1,
          v:[{id:"d4rmg47U8HA", ch:"Dieta Flessibile", d:"0:57"},{id:"BwHw56WdXPQ", ch:"Davide Luna", d:"0:53"}],
          cues:["Manubri sopra il petto, palmi rivolti uno verso l'altro.","Apri ad arco con i gomiti leggermente flessi e fermi.","Scendi finché senti allungare il petto, senza superare la linea delle spalle.","Richiudi stringendo il petto, non spingendo con le braccia."] } ] },
      { id:"cablefly", sets:4, rest:90, note:"Una gamba avanti, busto inclinato, spalla a 45°, braccio in estensione.", parts:[
        { name:"Croci ai cavi", short:"Croci", reps:"10", inc:2.5,
          v:[{id:"V6kI05lcj-g", ch:"Francesco Russillo PT", d:"0:30"},{id:"d7B7bXZr26c", ch:"V Athlete", d:"7:34"}],
          cues:["Un piede avanti per stabilità, busto inclinato in avanti.","Braccia quasi tese, come da scheda.","Porta le mani avanti e insieme descrivendo un arco, stringi 1 secondo.","Torna lentamente senza lasciare che il cavo ti tiri indietro le spalle."] } ] },
      { id:"pushdown", sets:3, rest:90, note:"", parts:[
        { name:"Push down al cavo con corda", short:"Push down", reps:"10", inc:2.5,
          v:[{id:"z-GYsUm3f9c", ch:"Project inVictus", d:"4:21"},{id:"vdwP7HxDAo4", ch:"Davide Morelli", d:"0:11"}],
          cues:["Gomiti fermi, attaccati ai fianchi.","Spingi giù fino a braccia tese e apri la corda in fondo.","Risali fino a circa 90° senza sollevare i gomiti.","Busto fermo: niente oscillazioni."] } ] },
      { id:"french", sets:3, rest:90, note:"", parts:[
        { name:"French press con manubrio", short:"French", reps:"10", inc:2,
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
        { name:"Leg extension", short:"Extension", reps:"10", inc:2.5,
          v:[{id:"wRSr98kKUsg", ch:"Project inVictus", d:"5:34"},{id:"IZpKu3JyLKs", ch:"TrainingPedia", d:"2:01"}],
          cues:["Regola lo schienale: ginocchio allineato al perno della macchina.","Rullo appoggiato sopra la caviglia.","Estendi fino in fondo e tieni 1 secondo.","Scendi lento, senza far toccare i pesi."] } ] },
      { id:"lat", sets:4, rest:90, note:"", parts:[
        { name:"Lat machine", short:"Lat", reps:"10", inc:2.5,
          v:[{id:"zhCwrtIZaQk", ch:"Luigi Colbax", d:"1:38"},{id:"P8QKoy5sjv8", ch:"Project inVictus", d:"8:01"}],
          cues:["Presa poco più larga delle spalle, cosce bloccate sotto i rulli.","Petto in fuori, busto appena inclinato indietro.","Tira la barra verso la parte alta del petto portando i gomiti giù e indietro.","Risali controllato fino ad allungare bene la schiena."] } ] },
      { id:"row", sets:3, rest:90, note:"12 ripetizioni per braccio.", parts:[
        { name:"Rematore singolo con manubrio", short:"Rematore", reps:"12", inc:2,
          v:[{id:"-ebafKeAmXs", ch:"Project inVictus", d:"4:46"},{id:"1e-Ks7gpp44", ch:"Invictus Club Torino", d:"0:31"}],
          cues:["Mano e ginocchio appoggiati sulla panca, schiena piatta.","Tira il manubrio verso l'anca, gomito vicino al corpo.","Il busto non ruota durante la tirata.","Scendi fino a braccio disteso, poi ripeti."] } ] },
      { id:"ezcurl", sets:3, rest:90, note:"", parts:[
        { name:"Curl con bilanciere a zeta (EZ)", short:"Curl EZ", reps:"12", inc:2.5,
          v:[{id:"6YH1xZZ43Vw", ch:"Project inVictus", d:"7:21"},{id:"7ECvCFpsOik", ch:"Daniele Esposito", d:"0:57"}],
          cues:["Impugna il bilanciere sulle curve, alla larghezza delle spalle.","Gomiti fermi ai fianchi.","Sali senza slanciare il busto.","Scendi controllato fino quasi a braccia tese."] } ] },
      { id:"inccurl", sets:3, rest:90, note:"Panca inclinata a 60°.", parts:[
        { name:"Curl su panca inclinata", short:"Curl inclinata", reps:"10", inc:1,
          v:[{id:"0o5foceYAnA", ch:"Project inVictus", d:"5:17"},{id:"rr2meFMsgSY", ch:"Dieta Flessibile", d:"1:51"}],
          cues:["Braccia che pendono verticali, leggermente dietro il busto.","Fletti senza portare i gomiti in avanti.","Ruota il palmo verso l'alto mentre sali.","Scendi fino a braccio completamente disteso."] } ] }
    ] }
];

const $ = id => document.getElementById(id);
const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z"/></svg>';
const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>';
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone = o => JSON.parse(JSON.stringify(o));
/* Confronto indipendente dall'ordine delle chiavi: due copie con gli stessi dati non devono sembrare diverse. */
const canon = o => Array.isArray(o) ? "["+o.map(canon).join(",")+"]" : (o && typeof o==="object") ? "{"+Object.keys(o).sort().map(k=>JSON.stringify(k)+":"+canon(o[k])).join(",")+"}" : JSON.stringify(o===undefined?null:o);
const same = (x,y) => canon(x)===canon(y);
const num = x => { const n=parseFloat(String(x==null?"":x).replace(",",".")); return isFinite(n) ? n : null; };
const kgFmt = n => (Math.round(n*10)/10).toLocaleString("it-IT");

function isoOf(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function isoToday(){ return isoOf(new Date()); }
function dateOf(iso){ const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d); }
function fmtDate(iso){ return dateOf(iso).toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"}); }
function shortDate(iso){ return dateOf(iso).toLocaleDateString("it-IT",{day:"numeric",month:"short"}); }
function mondayOf(iso){ const d=dateOf(iso); d.setDate(d.getDate()-((d.getDay()+6)%7)); return isoOf(d); }
function addDays(iso,n){ const d=dateOf(iso); d.setDate(d.getDate()+n); return isoOf(d); }
function defaultDay(){ return ({0:"lun",1:"lun",2:"mer",3:"mer",4:"ven",5:"ven",6:"lun"})[new Date().getDay()]; }

/* ---------- archivio sul dispositivo: pesi, note, scheda ---------- */
const LS_KEY="shara-log-v1", NOTES_KEY="shara-notes-v1", PLAN_KEY="shara-plan-v1";
function lsGet(k,def){ try{ const o=JSON.parse(localStorage.getItem(k)||"null"); return (o && typeof o==="object")?o:def; }catch(e){ return def; } }
function lsPut(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
const lsAll = () => lsGet(LS_KEY,{});
const lsWrite = all => lsPut(LS_KEY,all);
const notesAll = () => lsGet(NOTES_KEY,{});
function planGet(){ const p=lsGet(PLAN_KEY,null); return (p && Array.isArray(p.days) && p.days.length) ? p : {updated:"", days:clone(DEFAULT_DAYS)}; }
function setStatus(t){ $("status").textContent=t; }
const live = d => d && !d.deleted && d.sets;

const state = { date: isoToday(), dayId: defaultDay(), session:{}, last:{}, vidx:{}, plan: planGet(), editing:null };
const days = () => state.plan.days;
const dayOf = id => days().find(d=>d.id===id) || days()[0];
const doseOf = it => it.sets+" × "+it.parts.map(p=>p.reps).join(" + ");
const targetReps = p => { const n=parseInt(p.reps,10); return isFinite(n)&&n>0 ? n : null; };

let saveTimer=null;
function scheduleSave(){ clearTimeout(saveTimer); saveTimer=setTimeout(saveNow,500); }
function saveNow(){
  saveTimer=null;
  const dayId=state.dayId, doc=clone(state.session[dayId]);
  doc.updated=new Date().toISOString();
  const all=lsAll(); all[doc.date+"_"+dayId]=doc;
  setStatus(lsWrite(all) ? "Allenamento salvato su questo dispositivo." : "Salvataggio non riuscito: la memoria del browser non è disponibile (navigazione privata?).");
  renderWeek();
  requestSync(2000);
}
window.addEventListener("pagehide",()=>{ if(saveTimer){ clearTimeout(saveTimer); saveNow(); } flushNotes(); });

function blankRow(it){ return {kg:it.parts.map(()=>""), reps:it.parts.map(()=>""), done:false}; }
function blankSession(day){
  const sets={};
  day.items.forEach(it=>{ sets[it.id]=Array.from({length:it.sets},()=>blankRow(it)); });
  return {day:day.id, date:state.date, sets};
}
function dayDocs(dayId){ return Object.values(lsAll()).filter(d=>live(d) && d.day===dayId); }
function loadDay(day){
  const docs=dayDocs(day.id), ses=blankSession(day), today=docs.find(d=>d.date===state.date);
  if(today){
    day.items.forEach(it=>{ const s=today.sets[it.id]; if(Array.isArray(s)) s.forEach((row,i)=>{ if(ses.sets[it.id][i] && row) ses.sets[it.id][i]={
      kg:it.parts.map((_,p)=>String((row.kg||[])[p]??"")), reps:it.parts.map((_,p)=>String((row.reps||[])[p]??"")), done:!!row.done}; }); });
  }
  state.session[day.id]=ses;
  state.last[day.id]=docs.filter(d=>d.date<state.date).sort((a,b)=>a.date<b.date?1:-1)[0]||null;
}
function openDay(dayId){
  state.dayId=dayOf(dayId).id;
  const day=dayOf(state.dayId);
  document.body.dataset.day=day.id;
  if(!state.session[day.id]) loadDay(day);
  renderDays(); renderHead(day); renderList(day); renderWeek();
}
function reloadAll(){ stopVideos(); state.session={}; state.last={}; openDay(state.dayId); }

/* ---------- riepilogo della settimana ---------- */
/* Volume = somma di kg × ripetizioni delle serie spuntate; se le ripetizioni non sono scritte vale il numero previsto dalla scheda. */
function allDocsLive(){
  const all=lsAll();
  for(const [dayId,ses] of Object.entries(state.session)) all[ses.date+"_"+dayId]=ses;
  return Object.values(all).filter(live);
}
function weekStats(monday,docs){
  const end=addDays(monday,6), out={sessions:0,sets:0,volume:0,days:{}};
  docs.forEach(d=>{
    if(d.date<monday || d.date>end) return;
    const day=days().find(x=>x.id===d.day); let done=0;
    for(const [itId,rows] of Object.entries(d.sets)){
      const it=day && day.items.find(x=>x.id===itId);
      (rows||[]).forEach(r=>{ if(!r||!r.done) return; done++;
        (r.kg||[]).forEach((k,pi)=>{ const kg=num(k); if(kg===null) return; const rp=num((r.reps||[])[pi]) ?? (it&&it.parts[pi]?targetReps(it.parts[pi]):null); if(rp) out.volume+=kg*rp; }); });
    }
    if(done){ out.sessions++; out.sets+=done; out.days[d.day]=true; }
  });
  return out;
}
function renderWeek(){
  const docs=allDocsLive(), mon=mondayOf(state.date);
  const cur=weekStats(mon,docs), prev=weekStats(addDays(mon,-7),docs);
  const weeks=Array.from({length:8},(_,i)=>{ const m=addDays(mon,-7*(7-i)); return {m, v:weekStats(m,docs).volume}; });
  const maxV=Math.max(1,...weeks.map(w=>w.v));
  const planned=days().length;
  $("week").innerHTML=
    '<div class="wk-head"><h2>Questa settimana</h2><span>dal '+shortDate(mon)+' al '+shortDate(addDays(mon,6))+'</span></div>'+
    '<div class="wk-days">'+days().map(d=>'<span class="wk-dot'+(cur.days[d.id]?' on':'')+'" style="--pc:'+d.plate+'" title="'+esc(d.name)+(cur.days[d.id]?': fatto':': da fare')+'"><i></i>'+esc(d.name.slice(0,3))+'</span>').join("")+'</div>'+
    '<div class="wk-kpi">'+
      '<div><span>Allenamenti</span><b>'+cur.sessions+' di '+planned+'</b><small>scorsa: '+prev.sessions+'</small></div>'+
      '<div><span>Serie</span><b>'+cur.sets+'</b><small>scorsa: '+prev.sets+'</small></div>'+
      '<div><span>Volume</span><b>'+kgFmt(Math.round(cur.volume))+' kg</b><small>scorsa: '+kgFmt(Math.round(prev.volume))+' kg</small></div>'+
    '</div>'+
    '<div class="wk-bars" role="img" aria-label="Volume delle ultime 8 settimane">'+weeks.map((w,i)=>
      '<div class="wk-bar'+(i===7?' cur':'')+'"><i style="height:'+Math.max(w.v?4:0,Math.round(w.v/maxV*100))+'%"></i><small>'+shortDate(w.m).replace(/\s.*/,"")+'</small></div>').join("")+'</div>';
}

/* ---------- carico suggerito ---------- */
/* Doppia progressione: se l'ultima volta tutte le serie sono state spuntate e nessuna e' sotto le ripetizioni previste,
   si propone il carico massimo usato + l'incremento dell'esercizio; altrimenti si resta al carico massimo. */
function suggestion(day,it,pi){
  const prev=dayDocs(day.id).filter(d=>d.date<state.date && Array.isArray(d.sets[it.id]) && d.sets[it.id].some(r=>r && num((r.kg||[])[pi])!==null))
    .sort((a,b)=>a.date<b.date?1:-1)[0];
  if(!prev) return null;
  const rows=prev.sets[it.id].filter(Boolean), p=it.parts[pi], tgt=targetReps(p);
  const kgs=rows.map(r=>num((r.kg||[])[pi])).filter(v=>v!==null);
  const base=Math.max(...kgs), inc=num(p.inc)||2.5;
  const allDone=rows.length>0 && rows.every(r=>r.done);
  const short=rows.filter(r=>{ const rp=num((r.reps||[])[pi]); return tgt && rp!==null && rp<tgt; }).length;
  if(allDone && !short) return {kg:base+inc, up:true, why:"il "+shortDate(prev.date)+" hai completato tutte le serie a "+kgFmt(base)+" kg"};
  if(allDone) return {kg:base, up:false, why:short+(short===1?" serie è rimasta":" serie sono rimaste")+" sotto le "+tgt+" ripetizioni il "+shortDate(prev.date)};
  return {kg:base, up:false, why:"il "+shortDate(prev.date)+" non hai completato tutte le serie"};
}

/* ---------- interfaccia ---------- */
function renderDays(){
  $("days").innerHTML = days().map(d=>{
    const n=d.items.reduce((a,it)=>a+it.sets,0);
    return '<button class="day" role="tab" aria-selected="'+(d.id===state.dayId)+'" data-day="'+d.id+'" style="--pc:'+d.plate+'"><span class="plate" aria-hidden="true"></span><span class="txt"><b>'+esc(d.name)+'</b><small>'+d.items.length+' esercizi · '+n+' serie</small></span></button>';
  }).join("");
}
function renderHead(day){
  $("focus").textContent=day.focus;
  $("today").textContent=(new Date().getDay()===day.dow ? "Oggi, " : "Sessione di ")+fmtDate(state.date);
  $("warmList").innerHTML=(day.warm||[]).map(t=>"<li>"+esc(t)+"</li>").join("");
}
function posterHTML(v){
  return '<button class="poster" type="button" data-vid="'+esc(v.id)+'" style="background-image:url(https://i.ytimg.com/vi/'+esc(v.id)+'/hqdefault.jpg)" aria-label="Riproduci il video'+(v.ch?' di '+esc(v.ch):'')+'">'+
    '<span class="ico">'+PLAY+'</span><span class="cap"><b>'+esc(v.ch||"YouTube")+'</b>'+esc(v.d||"")+'</span></button>';
}
function videoBlock(it,p,pi){
  const key=it.id+"-"+pi, vids=p.v||[];
  if(!vids.length) return '<a class="alt-link" href="https://www.youtube.com/results?search_query='+encodeURIComponent(p.name+" esecuzione")+'" target="_blank" rel="noopener">Cerca un video di «'+esc(p.name)+'» su YouTube</a>';
  const vi=Math.min(state.vidx[key]||0,vids.length-1);
  return '<div class="player" id="pl-'+key+'">'+posterHTML(vids[vi])+'</div>'+
    (vids.length>1?'<div class="vtabs" role="group" aria-label="Scegli il video">'+vids.map((v,k)=>'<button class="vtab" type="button" aria-pressed="'+(k===vi)+'" data-key="'+key+'" data-k="'+k+'">Video '+(k+1)+(v.d?' · '+esc(v.d):'')+'</button>').join("")+'</div>':'');
}
function suggHTML(day,it){
  const out=it.parts.map((p,pi)=>{ const s=suggestion(day,it,pi); if(!s) return "";
    return '<div class="sugg'+(s.up?' up':'')+'"><div><b>'+(it.parts.length>1?esc(p.short||p.name)+': ':'')+'oggi '+kgFmt(s.kg)+' kg'+(s.up?' ↑':'')+'</b><small>'+esc(s.why)+'</small></div>'+
      '<button class="lbtn sm" type="button" data-use="'+it.id+'" data-p="'+pi+'" data-kg="'+s.kg+'">Usa</button></div>'; }).join("");
  return out ? '<div class="suggs">'+out+'</div>' : "";
}
function cellTxt(r,pi){ const k=num((r.kg||[])[pi]), rp=num((r.reps||[])[pi]); return k===null?"":kgFmt(k)+(rp!==null?"×"+rp:""); }
function renderList(day){
  const ses=state.session[day.id], last=state.last[day.id], notes=notesAll();
  $("list").innerHTML = day.items.map((it,i)=>{
    const rows=ses.sets[it.id], complete=rows.every(r=>r.done), multi=it.parts.length>1;
    const parts=it.parts.map((p,pi)=>
      '<div class="part">'+
        (multi?'<div class="part-name">'+esc(p.name)+'<span>× '+esc(p.reps)+'</span></div>':'')+
        videoBlock(it,p,pi)+
        (p.cues&&p.cues.length?'<details class="how"><summary>Come si esegue</summary><ul>'+p.cues.map(c=>"<li>"+esc(c)+"</li>").join("")+'</ul></details>':'')+
      '</div>').join("");
    const setRows=rows.map((r,s)=>
      '<div class="set'+(r.done?' done':'')+'">'+
        '<span class="lab"><span class="lab-l">Serie </span><span class="lab-s">S</span>'+(s+1)+'</span>'+
        '<div class="kgs'+(multi?' multi':'')+'">'+it.parts.map((p,pi)=>
          '<div class="pset">'+
            '<label class="kg'+(multi?' multi':'')+'">'+(multi?'<small>'+esc(p.short||p.name)+'</small>':'')+
              '<input inputmode="decimal" autocomplete="off" placeholder="—" aria-label="Chili, '+esc(p.name)+', serie '+(s+1)+'" data-f="kg" data-it="'+it.id+'" data-s="'+s+'" data-p="'+pi+'" value="'+esc(r.kg[pi]||"")+'"><em>kg</em></label>'+
            '<label class="kg rp'+(multi?' multi':'')+'">'+(multi?'<small>rip.</small>':'')+
              '<input inputmode="numeric" autocomplete="off" placeholder="'+esc(p.reps)+'" aria-label="Ripetizioni fatte, '+esc(p.name)+', serie '+(s+1)+' (previste '+esc(p.reps)+')" data-f="reps" data-it="'+it.id+'" data-s="'+s+'" data-p="'+pi+'" value="'+esc(r.reps[pi]||"")+'"><em>rip</em></label>'+
          '</div>').join("")+
        '</div>'+
        '<button class="chk" type="button" aria-pressed="'+r.done+'" aria-label="Serie '+(s+1)+' fatta" data-it="'+it.id+'" data-s="'+s+'">'+TICK+'</button>'+
      '</div>').join("");
    let lastTxt="";
    if(last && Array.isArray(last.sets[it.id])){
      const v=last.sets[it.id].map(r=>r?it.parts.map((_,pi)=>cellTxt(r,pi)).filter(Boolean).join(" + "):"").filter(Boolean);
      if(v.length) lastTxt='<div class="last">Ultima volta ('+fmtDate(last.date)+'), kg: <b>'+esc(v.join(" · "))+'</b></div>';
    }
    const note=(notes[it.id]&&notes[it.id].text)||"";
    return '<article class="ex'+(complete?' complete':'')+'" data-item="'+it.id+'">'+
      '<div class="ex-head"><span class="num">'+(i+1)+'</span><div><h3>'+esc(it.parts.map(p=>p.name).join(" + "))+'</h3>'+(multi?'<span class="tag">Superserie</span>':'')+'</div></div>'+
      '<dl class="dose"><div><dt>Serie × rip.</dt><dd>'+esc(doseOf(it))+'</dd></div><div><dt>Recupero</dt><dd>'+it.rest+'″</dd></div>'+
        '<button class="restbtn" type="button" data-rest="'+it.id+'">'+CLOCK+'Avvia recupero</button></dl>'+
      (it.note?'<p class="note">'+esc(it.note)+'</p>':'')+
      suggHTML(day,it)+
      parts+
      '<div class="sets">'+setRows+'</div>'+lastTxt+
      '<label class="mynote"><span>Note personali</span><textarea rows="2" data-note="'+it.id+'" placeholder="Regolazioni, presa, sensazioni… (es. sedile al 4)">'+esc(note)+'</textarea></label>'+
      '<details class="hist" data-it="'+it.id+'"><summary>Storico pesi</summary><div class="hist-body"></div></details>'+
    '</article>';
  }).join("");
  renderProgress();
}
function renderProgress(){
  const day=dayOf(state.dayId), ses=state.session[day.id];
  let tot=0,done=0; day.items.forEach(it=>ses.sets[it.id].forEach(r=>{tot++; if(r.done)done++;}));
  $("pDone").textContent=done+"/"+tot;
  $("pBar").style.width=(tot?done/tot*100:0)+"%";
}
function findPart(itId,pi){ for(const d of days()){ const it=d.items.find(x=>x.id===itId); if(it) return it.parts[pi]; } return null; }
function stopVideos(except){
  document.querySelectorAll(".player iframe").forEach(f=>{
    if(f===except) return;
    const box=f.parentElement, key=box.id.slice(3), cut=key.lastIndexOf("-");
    const p=findPart(key.slice(0,cut),+key.slice(cut+1));
    if(p && p.v && p.v.length) box.innerHTML=posterHTML(p.v[Math.min(state.vidx[key]||0,p.v.length-1)]); else box.remove();
  });
}

$("days").addEventListener("click",e=>{ const b=e.target.closest(".day"); if(b && b.dataset.day!==state.dayId){ if(state.editing) closeEditor(); stopVideos(); openDay(b.dataset.day); window.scrollTo({top:0}); } });

/* ---------- note personali per esercizio ---------- */
let noteTimer=null, notePending={};
function flushNotes(){
  if(!Object.keys(notePending).length) return;
  const n=notesAll(), now=new Date().toISOString();
  for(const [id,text] of Object.entries(notePending)) n[id]={text,updated:now};
  notePending={}; lsPut(NOTES_KEY,n); requestSync(2000);
}

$("list").addEventListener("input",e=>{
  const t=e.target;
  if(t.matches("textarea[data-note]")){ notePending[t.dataset.note]=t.value; clearTimeout(noteTimer); noteTimer=setTimeout(flushNotes,800); return; }
  if(t.tagName!=="INPUT" || !t.dataset.f) return;
  const clean = t.dataset.f==="reps" ? t.value.replace(/[^0-9]/g,"").slice(0,3) : t.value.replace(",",".").replace(/[^0-9.]/g,"");
  if(clean!==t.value) t.value=clean;
  state.session[state.dayId].sets[t.dataset.it][+t.dataset.s][t.dataset.f][+t.dataset.p]=clean;
  scheduleSave();
  const h=t.closest(".ex").querySelector("details.hist");
  if(h && h.open) fillHist(h);
});

/* ---------- storico pesi per esercizio ---------- */
/* Sessioni in cui l'esercizio ha almeno un peso, dalla piu' vecchia; oggi preso dallo stato vivo, non dal salvato. */
function histRows(dayId,it){
  const byDate={};
  dayDocs(dayId).forEach(d=>{ if(Array.isArray(d.sets[it.id])) byDate[d.date]=d.sets[it.id]; });
  byDate[state.date]=state.session[dayId].sets[it.id];
  return Object.keys(byDate).sort().map(date=>({date, rows:byDate[date].filter(Boolean)}))
    .filter(r=>r.rows.some(row=>(row.kg||[]).some(v=>num(v)!==null)));
}
function sparkline(points){
  const W=300,H=96,L=34,R=10,T=12,B=22;
  const vals=points.map(p=>p.v), lo=Math.min(...vals), hi=Math.max(...vals), span=(hi-lo)||1;
  const x=i=>L+(points.length===1?(W-L-R)/2:i*(W-L-R)/(points.length-1));
  const y=v=>T+(H-T-B)*(1-(v-(hi===lo?lo-0.5:lo))/(hi===lo?1:span));
  const pts=points.map((p,i)=>x(i).toFixed(1)+","+y(p.v).toFixed(1)).join(" ");
  const lastI=points.length-1;
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Peso massimo per sessione, da '+kgFmt(vals[0])+' a '+kgFmt(vals[lastI])+' kg">'+
    '<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+y(hi).toFixed(1)+'" y2="'+y(hi).toFixed(1)+'"/>'+
    '<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+y(lo).toFixed(1)+'" y2="'+y(lo).toFixed(1)+'"/>'+
    '<text class="ax" x="'+(L-6)+'" y="'+(y(hi)+4).toFixed(1)+'" text-anchor="end">'+kgFmt(hi)+'</text>'+
    (hi!==lo?'<text class="ax" x="'+(L-6)+'" y="'+(y(lo)+4).toFixed(1)+'" text-anchor="end">'+kgFmt(lo)+'</text>':'')+
    (points.length>1?'<polyline class="ln" points="'+pts+'"/>':'')+
    points.map((p,i)=>'<circle class="'+(i===lastI?'pt end':'pt')+'" cx="'+x(i).toFixed(1)+'" cy="'+y(p.v).toFixed(1)+'" r="'+(i===lastI?4.5:3)+'"/>').join("")+
    '<text class="ax" x="'+x(0).toFixed(1)+'" y="'+(H-6)+'" text-anchor="'+(points.length===1?'middle':'start')+'">'+shortDate(points[0].date)+'</text>'+
    (points.length>1?'<text class="ax" x="'+x(lastI).toFixed(1)+'" y="'+(H-6)+'" text-anchor="end">'+shortDate(points[lastI].date)+'</text>':'')+
  '</svg>';
}
function fillHist(det){
  const day=dayOf(state.dayId), it=day.items.find(x=>x.id===det.dataset.it);
  if(!it) return;
  const rows=histRows(day.id,it), body=det.querySelector(".hist-body"), ask=det.dataset.confirm||"";
  const confirmBar = ask ? '<div class="confirm" role="alert"><p>Eliminare l\'allenamento del <b>'+esc(fmtDate(ask))+'</b>? Si cancellano tutti gli esercizi di quel giorno, anche sugli altri dispositivi collegati.</p>'+
    '<div class="row"><button class="lbtn danger" type="button" data-delsure="'+ask+'">Elimina</button><button class="lbtn" type="button" data-delno="1">Annulla</button></div></div>' : "";
  if(!rows.length){ body.innerHTML=confirmBar+'<p class="hist-empty">Ancora nessun peso registrato per questo esercizio.</p>'; return; }
  body.innerHTML=confirmBar+it.parts.map((p,pi)=>{
    const pr=rows.map(r=>{ const kgs=r.rows.map(row=>num((row.kg||[])[pi])); return {date:r.date, rows:r.rows, max:Math.max(...kgs.filter(v=>v!==null))}; }).filter(r=>isFinite(r.max));
    if(!pr.length) return it.parts.length>1?'<p class="hist-empty">'+esc(p.name)+': nessun peso registrato.</p>':'';
    const first=pr[0], last=pr[pr.length-1], diff=last.max-first.max, best=Math.max(...pr.map(r=>r.max));
    const trend = pr.length<2 ? "Prima sessione registrata" : (diff>0?"+":diff<0?"−":"±")+kgFmt(Math.abs(diff))+" kg dal "+shortDate(first.date);
    const nSets=Math.max(it.sets,...pr.map(r=>r.rows.length));
    return '<div class="hist-part">'+
      (it.parts.length>1?'<div class="part-name">'+esc(p.name)+'</div>':'')+
      '<div class="hist-kpi"><div><span>Ultimo massimo</span><b>'+kgFmt(last.max)+' kg</b></div><div><span>Record</span><b>'+kgFmt(best)+' kg</b></div><div><span>Andamento</span><b class="'+(diff>0?'up':diff<0?'down':'')+'">'+trend+'</b></div></div>'+
      sparkline(pr.map(r=>({date:r.date,v:r.max})))+
      '<p class="hist-legend">Celle: kg × ripetizioni fatte (solo kg se le ripetizioni non sono state scritte).</p>'+
      '<div class="hist-tbl"><table><thead><tr><th>Data</th>'+Array.from({length:nSets},(_,s)=>'<th>S'+(s+1)+'</th>').join("")+'<th>Max</th>'+(pi===0?'<th><span class="sr">Elimina</span></th>':'')+'</tr></thead><tbody>'+
      pr.slice().reverse().map(r=>'<tr><td>'+shortDate(r.date)+(r.date===state.date?' <em>oggi</em>':'')+'</td>'+
        Array.from({length:nSets},(_,s)=>'<td>'+(r.rows[s]&&cellTxt(r.rows[s],pi)||'—')+'</td>').join("")+'<td><b>'+kgFmt(r.max)+'</b></td>'+
        (pi===0?'<td><button class="del" type="button" data-del="'+r.date+'" aria-label="Elimina l\'allenamento del '+esc(shortDate(r.date))+'">×</button></td>':'')+'</tr>').join("")+
      '</tbody></table></div></div>';
  }).join("");
}
function deleteSession(dayId,date){
  const all=lsAll(), now=new Date().toISOString();
  all[date+"_"+dayId]={day:dayId, date, deleted:true, updated:now, sets:{}};
  lsWrite(all);
  if(date===state.date){ clearTimeout(saveTimer); saveTimer=null; }
  reloadAll(); requestSync(500);
  setStatus("Allenamento del "+fmtDate(date)+" eliminato.");
}
$("list").addEventListener("toggle",e=>{ const d=e.target; if(d.matches && d.matches("details.hist") && d.open) fillHist(d); },true);
$("list").addEventListener("click",e=>{
  const poster=e.target.closest(".poster");
  if(poster){
    const f=document.createElement("iframe");
    f.src="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(poster.dataset.vid)+"?autoplay=1&rel=0&playsinline=1&modestbranding=1";
    f.title="Video tutorial";
    f.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen=true;
    f.referrerPolicy="strict-origin-when-cross-origin";
    const box=poster.parentElement; box.innerHTML=""; box.appendChild(f);
    stopVideos(f);
    return;
  }
  const tab=e.target.closest(".vtab");
  if(tab){
    const key=tab.dataset.key, k=+tab.dataset.k, cut=key.lastIndexOf("-");
    state.vidx[key]=k;
    $("pl-"+key).innerHTML=posterHTML(findPart(key.slice(0,cut),+key.slice(cut+1)).v[k]);
    tab.parentElement.querySelectorAll(".vtab").forEach(b=>b.setAttribute("aria-pressed",b===tab));
    return;
  }
  const use=e.target.closest("[data-use]");
  if(use){
    const it=dayOf(state.dayId).items.find(x=>x.id===use.dataset.use), pi=+use.dataset.p, kg=String(+use.dataset.kg);
    let n=0; state.session[state.dayId].sets[it.id].forEach(r=>{ if(!r.kg[pi]){ r.kg[pi]=kg; n++; } });
    const art=use.closest(".ex");
    art.querySelectorAll('input[data-f="kg"][data-p="'+pi+'"]').forEach(inp=>{ inp.value=state.session[state.dayId].sets[it.id][+inp.dataset.s].kg[pi]; });
    use.textContent = n ? "Inserito" : "Già pieno";
    if(n) scheduleSave();
    return;
  }
  const del=e.target.closest("[data-del]"), sure=e.target.closest("[data-delsure]"), no=e.target.closest("[data-delno]");
  if(del||no){ const h=e.target.closest("details.hist"); h.dataset.confirm = del ? del.dataset.del : ""; fillHist(h); return; }
  if(sure){ deleteSession(state.dayId,sure.dataset.delsure); return; }
  const rb=e.target.closest(".restbtn");
  if(rb){
    unlockAudio(); keepAwake();
    const it=dayOf(state.dayId).items.find(x=>x.id===rb.dataset.rest);
    startTimer(it.rest, it.parts.map(p=>p.name).join(" + "));
    return;
  }
  const b=e.target.closest(".chk"); if(!b) return;
  unlockAudio(); keepAwake();
  const day=dayOf(state.dayId), it=day.items.find(x=>x.id===b.dataset.it), s=+b.dataset.s;
  const sets=state.session[day.id].sets, row=sets[it.id][s];
  row.done=!row.done;
  b.setAttribute("aria-pressed",row.done);
  b.closest(".set").classList.toggle("done",row.done);
  const all=sets[it.id].every(r=>r.done);
  b.closest(".ex").classList.toggle("complete",all);
  renderProgress(); scheduleSave();
  if(!row.done) return;
  const everything=day.items.every(x=>sets[x.id].every(r=>r.done));
  if(everything){ stopTimer(); setStatus("Allenamento completato."); return; }
  const idx=day.items.indexOf(it), nextOpen=sets[it.id].findIndex(r=>!r.done);
  const next = nextOpen>=0 ? it.parts.map(p=>p.name).join(" + ")+" · serie "+(nextOpen+1)+" di "+it.sets
             : (day.items.slice(idx+1).concat(day.items.slice(0,idx)).find(x=>sets[x.id].some(r=>!r.done))||{parts:[{name:""}]}).parts.map(p=>p.name).join(" + ");
  startTimer(it.rest,next);
});

/* ---------- modifica della scheda ---------- */
function ytId(s){
  s=String(s||"").trim(); if(!s) return "";
  if(/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m=s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
const newId = () => "x"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const blankPart = () => ({name:"",short:"",reps:"10",inc:2.5,v:[],cues:[]});
function openEditor(){
  stopVideos();
  state.editing={dayId:state.dayId, draft:clone(dayOf(state.dayId)), confirm:""};
  $("list").hidden=true; $("editor").hidden=false; $("bEdit").hidden=true;
  renderEditor(); window.scrollTo({top:$("focusRow").offsetTop-10});
}
function closeEditor(){ state.editing=null; $("editor").hidden=true; $("list").hidden=false; $("bEdit").hidden=false; $("editor").innerHTML=""; }
function fld(label,attrs,val,cls){ return '<label class="ef'+(cls?' '+cls:'')+'"><span>'+label+'</span><input '+attrs+' value="'+esc(val)+'"></label>'; }
function renderEditor(msg){
  const ed=state.editing, d=ed.draft;
  $("editor").innerHTML=
    '<div class="ed-top"><h2>Modifica scheda · '+esc(d.name)+'</h2><p>Le modifiche valgono da oggi e si sincronizzano sugli altri dispositivi. Lo storico resta.</p></div>'+
    (msg?'<p class="ed-msg" role="alert">'+esc(msg)+'</p>':'')+
    fld("Gruppi muscolari del giorno",'data-e="focus"',d.focus,"wide")+
    '<label class="ef wide"><span>Riscaldamento (una voce per riga)</span><textarea rows="4" data-e="warm">'+esc((d.warm||[]).join("\n"))+'</textarea></label>'+
    d.items.map((it,i)=>
      '<fieldset class="ed-item" data-i="'+i+'"><legend>Esercizio '+(i+1)+(it.parts.length>1?' · superserie':'')+'</legend>'+
        it.parts.map((p,pi)=>
          '<div class="ed-part">'+(it.parts.length>1?'<div class="ed-sub">Movimento '+(pi+1)+'</div>':'')+
            fld("Nome",'data-e="name" data-i="'+i+'" data-p="'+pi+'" autocomplete="off"',p.name,"wide")+
            '<div class="ed-grid">'+
              fld("Ripetizioni",'data-e="reps" data-i="'+i+'" data-p="'+pi+'" inputmode="numeric" autocomplete="off"',p.reps)+
              fld("Aumento kg",'data-e="inc" data-i="'+i+'" data-p="'+pi+'" inputmode="decimal" autocomplete="off"',typeof p.inc==="number"?String(p.inc).replace(".",","):String(p.inc??""))+
            '</div>'+
            fld("Video 1 (link YouTube)",'data-e="v0" data-i="'+i+'" data-p="'+pi+'" inputmode="url" autocomplete="off" placeholder="https://youtu.be/…"',vidRaw(p,0),"wide")+
            fld("Video 2 (facoltativo)",'data-e="v1" data-i="'+i+'" data-p="'+pi+'" inputmode="url" autocomplete="off" placeholder="https://youtu.be/…"',vidRaw(p,1),"wide")+
          '</div>').join("")+
        '<div class="ed-grid">'+
          fld("Serie",'data-e="sets" data-i="'+i+'" inputmode="numeric" autocomplete="off"',String(it.sets))+
          fld("Recupero (secondi)",'data-e="rest" data-i="'+i+'" inputmode="numeric" autocomplete="off"',String(it.rest))+
        '</div>'+
        fld("Nota della scheda",'data-e="note" data-i="'+i+'" autocomplete="off"',it.note||"","wide")+
        '<div class="row ed-act">'+
          '<button class="lbtn sm" type="button" data-mv="-1" data-i="'+i+'"'+(i===0?' disabled':'')+'>↑ Su</button>'+
          '<button class="lbtn sm" type="button" data-mv="1" data-i="'+i+'"'+(i===d.items.length-1?' disabled':'')+'>↓ Giù</button>'+
          (it.parts.length<2?'<button class="lbtn sm" type="button" data-ss="add" data-i="'+i+'">+ Superserie</button>':'<button class="lbtn sm" type="button" data-ss="del" data-i="'+i+'">Togli movimento 2</button>')+
          (ed.confirm==="item"+i?'<button class="lbtn sm danger" type="button" data-rm="'+i+'">Conferma: elimina</button>':'<button class="lbtn sm" type="button" data-rmask="'+i+'">Elimina esercizio</button>')+
        '</div>'+
      '</fieldset>').join("")+
    '<div class="row"><button class="lbtn" type="button" data-add="1">+ Aggiungi esercizio</button></div>'+
    '<div class="row ed-save"><button class="lbtn primary" type="button" data-save="1">Salva scheda</button><button class="lbtn" type="button" data-cancel="1">Annulla</button></div>'+
    '<div class="row">'+(ed.confirm==="reset"?'<button class="lbtn sm danger" type="button" data-reset="sure">Conferma: torna alla scheda originale di '+esc(d.name.toLowerCase())+'</button>':'<button class="lbtn sm" type="button" data-reset="ask">Ripristina la scheda originale del giorno</button>')+'</div>';
}
/* Legge i campi nella bozza cosi' come sono scritti (testo), senza validare: ridisegnare l'editor dopo
   un'aggiunta o uno spostamento deve mostrare cio' che e' stato digitato. La validazione avviene al salvataggio. */
const vidRaw = (p,k) => p.vraw ? (p.vraw[k]||"") : (p.v&&p.v[k] ? "https://youtu.be/"+p.v[k].id : "");
function readEditor(){
  const d=state.editing.draft;
  $("editor").querySelectorAll("[data-e]").forEach(el=>{
    const e=el.dataset.e, i=+el.dataset.i, pi=+el.dataset.p, v=el.value;
    if(e==="focus") d.focus=v;
    else if(e==="warm") d.warm=v.split("\n").map(s=>s.trim()).filter(Boolean);
    else if(e==="sets"||e==="rest"||e==="note") d.items[i][e]=v;
    else if(e==="v0"||e==="v1"){ const p=d.items[i].parts[pi]; if(!p.vraw) p.vraw=[vidRaw(p,0),vidRaw(p,1)]; p.vraw[+e[1]]=v; }
    else d.items[i].parts[pi][e]=v;
  });
}
function commitEditor(){
  readEditor();
  const d=clone(state.editing.draft), orig=dayOf(d.id), errs=[];
  d.focus=(d.focus||"").trim()||orig.focus;
  d.items.forEach((it,i)=>{
    const n=i+1, sets=/^\d+$/.test(String(it.sets).trim())?+it.sets:NaN, rest=/^\d+$/.test(String(it.rest).trim())?+it.rest:NaN;
    if(!(sets>=1&&sets<=10)) errs.push("Esercizio "+n+": le serie vanno da 1 a 10.");
    if(!(rest>=0&&rest<=600)) errs.push("Esercizio "+n+": il recupero va da 0 a 600 secondi.");
    it.sets=sets; it.rest=rest; it.note=String(it.note||"").trim();
    const old=orig.items.find(x=>x.id===it.id);
    it.parts.forEach((p,pi)=>{
      const name=String(p.name||"").trim(), reps=String(p.reps||"").trim(), inc=num(p.inc);
      if(!name) errs.push("Esercizio "+n+": manca il nome"+(it.parts.length>1?" del movimento "+(pi+1):"")+".");
      if(!/^\d{1,3}$/.test(reps)) errs.push("Esercizio "+n+": le ripetizioni devono essere un numero (es. 10).");
      if(inc===null||inc<0||inc>50) errs.push("Esercizio "+n+": l'aumento in kg va da 0 a 50.");
      const oldP=old&&old.parts[pi];
      if(oldP && name!==oldP.name){ p.cues=[]; p.short=""; }
      p.name=name; p.reps=reps; p.inc=inc===null?2.5:inc;
      if(!p.short) p.short=name.length>14?name.split(" ").slice(0,2).join(" "):name;
      const vids=[];
      [0,1].forEach(k=>{ const raw=vidRaw(p,k); const id=ytId(raw);
        if(id===null) errs.push("Esercizio "+n+": «"+raw.trim()+"» non è un link YouTube valido.");
        else if(id){ const known=(oldP&&oldP.v||[]).concat(p.v||[]).find(x=>x.id===id); vids.push(known?clone(known):{id,ch:"YouTube",d:""}); } });
      p.v=vids; delete p.vraw;
    });
  });
  if(!d.items.length) errs.push("Il giorno deve avere almeno un esercizio.");
  if(errs.length){ renderEditor(errs[0]+(errs.length>1?" (e altri "+(errs.length-1)+" da correggere)":"")); return; }
  const plan=clone(state.plan); plan.days=plan.days.map(x=>x.id===d.id?d:x); plan.updated=new Date().toISOString();
  if(saveTimer){ clearTimeout(saveTimer); saveNow(); }
  state.plan=plan; lsPut(PLAN_KEY,plan);
  closeEditor(); reloadAll(); requestSync(500);
  setStatus("Scheda di "+d.name.toLowerCase()+" salvata.");
}
$("bEdit").addEventListener("click",openEditor);
$("editor").addEventListener("click",e=>{
  const b=e.target.closest("button"); if(!b || !state.editing) return;
  const ed=state.editing, items=ed.draft.items, i=+b.dataset.i;
  if(b.dataset.save){ commitEditor(); return; }
  if(b.dataset.cancel){ closeEditor(); setStatus("Modifiche alla scheda annullate."); return; }
  readEditor();
  if(b.dataset.mv){ const j=i+(+b.dataset.mv); [items[i],items[j]]=[items[j],items[i]]; ed.confirm=""; }
  else if(b.dataset.ss==="add"){ items[i].parts.push(blankPart()); ed.confirm=""; }
  else if(b.dataset.ss==="del"){ items[i].parts.length=1; ed.confirm=""; }
  else if(b.dataset.rmask!=null){ ed.confirm="item"+b.dataset.rmask; }
  else if(b.dataset.rm!=null){ items.splice(+b.dataset.rm,1); ed.confirm=""; }
  else if(b.dataset.add){ items.push({id:newId(),sets:3,rest:90,note:"",parts:[blankPart()]}); ed.confirm=""; }
  else if(b.dataset.reset==="ask"){ ed.confirm="reset"; }
  else if(b.dataset.reset==="sure"){ ed.draft=clone(DEFAULT_DAYS.find(x=>x.id===ed.dayId)); ed.confirm=""; renderEditor("Scheda originale ricaricata: premi «Salva scheda» per confermarla."); return; }
  renderEditor();
});

/* ---------- copia dei dati ---------- */
$("bExport").addEventListener("click",()=>{
  flushNotes();
  const blob=new Blob([JSON.stringify({app:"scheda-shara",version:2,exported:new Date().toISOString(),log:lsAll(),notes:notesAll(),plan:lsGet(PLAN_KEY,null)},null,1)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="scheda-shara-"+state.date+".json";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  setStatus("Copia esportata: tienila nei tuoi file per ripristinarla su un altro dispositivo.");
});
$("bImport").addEventListener("change",async e=>{
  const f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return;
  try{
    const j=JSON.parse(await f.text());
    if(!j || j.app!=="scheda-shara" || typeof j.log!=="object") throw new Error("formato");
    const before=lsAll(), m=mergeAll({log:before,notes:notesAll(),plan:lsGet(PLAN_KEY,null)},{log:j.log,notes:j.notes||{},plan:j.plan||null});
    const n=Object.keys(m.log).filter(k=>!same(m.log[k],before[k])).length;
    if(!writeAll(m)) throw new Error("memoria");
    reloadAll();
    setStatus("Copia importata: "+n+" sessioni aggiornate.");
    requestSync(500);
  }catch(err){ setStatus("Importazione non riuscita: il file non è una copia di Scheda SHARA."); }
});

/* ---------- timer di recupero ---------- */
const R=2*Math.PI*37;
$("tRing").style.strokeDasharray=R;
let tEnd=0,tTotal=90,tInt=null,audio=null,wake=null;
function unlockAudio(){ try{ if(!audio){ const C=window.AudioContext||window.webkitAudioContext; if(C) audio=new C(); } if(audio && audio.state==="suspended") audio.resume(); }catch(e){} }
function beep(){
  try{ if(audio){ [0,0.3,0.6].forEach((t,i)=>{ const o=audio.createOscillator(), g=audio.createGain(); o.frequency.value=i===2?1320:880; o.connect(g); g.connect(audio.destination); const s=audio.currentTime+t; g.gain.setValueAtTime(0.0001,s); g.gain.exponentialRampToValueAtTime(0.35,s+0.02); g.gain.exponentialRampToValueAtTime(0.0001,s+0.22); o.start(s); o.stop(s+0.25); }); } }catch(e){}
  try{ navigator.vibrate && navigator.vibrate([250,120,250,120,400]); }catch(e){}
}
async function keepAwake(){ try{ if(!wake && navigator.wakeLock){ wake=await navigator.wakeLock.request("screen"); wake.addEventListener("release",()=>{wake=null;}); } }catch(e){} }
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"){ keepAwake(); if(tInt) tick(); } });
function fmt(s){ s=Math.max(0,Math.ceil(s)); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); }
function startTimer(sec,next){
  tTotal=Math.max(1,sec); tEnd=Date.now()+sec*1000;
  const el=$("timer"); el.hidden=false; el.classList.remove("go");
  $("tLabel").textContent="Recupero "+sec+"″"; $("tNext").textContent=next?"Poi: "+next:"";
  clearInterval(tInt); tInt=setInterval(tick,250); tick();
}
function tick(){
  const left=(tEnd-Date.now())/1000;
  $("tClock").textContent=fmt(left);
  $("tRing").style.strokeDashoffset=R*(1-Math.max(0,Math.min(1,left/tTotal)));
  if(left<=0 && tInt){
    clearInterval(tInt); tInt=null; beep();
    $("timer").classList.add("go"); $("tLabel").textContent="Via, tocca a te"; $("tClock").textContent="0:00";
    setTimeout(()=>{ if(!tInt) $("timer").hidden=true; },6000);
  }
}
function stopTimer(){ clearInterval(tInt); tInt=null; $("timer").hidden=true; }
$("tMinus").addEventListener("click",()=>{ if(tInt){ tEnd-=15000; tick(); } });
$("tPlus").addEventListener("click",()=>{ if(tInt){ tEnd+=15000; tTotal=Math.max(tTotal,(tEnd-Date.now())/1000); tick(); } });
$("tSkip").addEventListener("click",stopTimer);

/* ---------- unione dei dati fra dispositivi ----------
   Pesi: per sessione (data_giorno); note: per esercizio; scheda: intera. In ogni caso vince la copia con "updated" piu' recente.
   Una sessione eliminata resta come segno di cancellazione (deleted), cosi' l'eliminazione vince anche sugli altri dispositivi. */
function mergeLogs(a,b){
  const out=Object.assign({},a);
  for(const [k,v] of Object.entries(b||{})){ if(v && v.day && v.date && (v.sets||v.deleted) && (!out[k] || (v.updated||"")>(out[k].updated||""))) out[k]=v; }
  return out;
}
function mergeNotes(a,b){
  const out=Object.assign({},a);
  for(const [k,v] of Object.entries(b||{})){ if(v && typeof v.text==="string" && (!out[k] || (v.updated||"")>(out[k].updated||""))) out[k]=v; }
  return out;
}
function validPlan(p){ return p && Array.isArray(p.days) && p.days.length && p.days.every(d=>d && d.id && Array.isArray(d.items)); }
function mergeAll(local,remote){
  const lp=validPlan(local.plan)?local.plan:null, rp=validPlan(remote.plan)?remote.plan:null;
  const plan = !lp ? rp : !rp ? lp : ((rp.updated||"")>(lp.updated||"") ? rp : lp);
  return {log:mergeLogs(local.log,remote.log), notes:mergeNotes(local.notes,remote.notes), plan};
}
function writeAll(m){
  const ok=lsWrite(m.log) && lsPut(NOTES_KEY,m.notes) && (m.plan ? lsPut(PLAN_KEY,m.plan) : true);
  state.plan=planGet();
  return ok;
}

/* ---------- sincronizzazione con Dropbox ----------
   Il file e' /pesi.json nella cartella dell'app (Dropbox > Applicazioni > Scheda SHARA).
   Ogni dispositivo tiene la sua copia completa, quindi un caricamento perso in una corsa fra due dispositivi
   si ripara alla sincronizzazione successiva; il rev di Dropbox evita di sovrascrivere un file cambiato nel frattempo. */
const DROPBOX_APP_KEY = String(window.SHARA_DROPBOX_KEY||"");
const TK_KEY = "shara-dbx", PKCE_KEY = "shara-dbx-pkce";
const REDIRECT = location.origin + location.pathname.replace(/index\.html$/,"");
const sync = { busy:false, again:false, timer:null, last:null };
function tkGet(){ try{ return JSON.parse(localStorage.getItem(TK_KEY)||"null"); }catch(e){ return null; } }
function tkSet(t){ try{ t ? localStorage.setItem(TK_KEY,JSON.stringify(t)) : localStorage.removeItem(TK_KEY); }catch(e){} }
function b64url(bytes){ let s=""; bytes.forEach(b=>s+=String.fromCharCode(b)); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
async function pkceStart(withRedirect){
  const verifier=b64url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge=b64url(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier))));
  const st=b64url(crypto.getRandomValues(new Uint8Array(12)));
  try{ localStorage.setItem(PKCE_KEY,JSON.stringify({verifier,state:st,redirect:withRedirect})); }catch(e){}
  const q=new URLSearchParams({client_id:DROPBOX_APP_KEY,response_type:"code",code_challenge:challenge,code_challenge_method:"S256",token_access_type:"offline"});
  if(withRedirect){ q.set("redirect_uri",REDIRECT); q.set("state",st); }
  return "https://www.dropbox.com/oauth2/authorize?"+q.toString();
}
async function tokenCall(params){
  const r=await fetch("https://api.dropboxapi.com/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(Object.assign({client_id:DROPBOX_APP_KEY},params))});
  const j=await r.json().catch(()=>({}));
  if(!r.ok || !j.access_token){ const e=new Error(j.error_description||j.error||("HTTP "+r.status)); e.grant=(j.error==="invalid_grant"); throw e; }
  return j;
}
async function finishAuth(code){
  let p=null; try{ p=JSON.parse(localStorage.getItem(PKCE_KEY)||"null"); }catch(e){}
  if(!p) throw new Error("Accesso scaduto: premi di nuovo «Collega Dropbox».");
  const params={grant_type:"authorization_code",code:code.trim(),code_verifier:p.verifier};
  if(p.redirect) params.redirect_uri=REDIRECT;
  const j=await tokenCall(params);
  tkSet({refresh:j.refresh_token, access:j.access_token, exp:Date.now()+(j.expires_in||14400)*1000});
  try{ localStorage.removeItem(PKCE_KEY); }catch(e){}
}
async function accessToken(force){
  const t=tkGet(); if(!t) return null;
  if(!force && t.access && t.exp>Date.now()+60000) return t.access;
  try{
    const j=await tokenCall({grant_type:"refresh_token",refresh_token:t.refresh});
    t.access=j.access_token; t.exp=Date.now()+(j.expires_in||14400)*1000; tkSet(t); return t.access;
  }catch(e){ if(e.grant){ tkSet(null); renderSync("Dropbox ha revocato l'accesso: collegalo di nuovo."); return null; } throw e; }
}
async function dbx(url,headers,body){
  for(let attempt=0;attempt<2;attempt++){
    const tok=await accessToken(attempt>0); if(!tok) throw new Error("scollegato");
    const r=await fetch(url,{method:"POST",headers:Object.assign({Authorization:"Bearer "+tok},headers),body});
    if(r.status===401 && attempt===0) continue;
    return r;
  }
}
async function pull(){
  const r=await dbx("https://content.dropboxapi.com/2/files/download",{"Dropbox-API-Arg":JSON.stringify({path:"/pesi.json"})});
  if(r.status===409){ const t=await r.text(); if(t.includes("not_found")) return {rev:null,log:{},notes:{},plan:null}; throw new Error("download: "+t.slice(0,120)); }
  if(!r.ok) throw new Error("download HTTP "+r.status);
  let rev=null; try{ rev=JSON.parse(r.headers.get("Dropbox-API-Result")||"{}").rev||null; }catch(e){}
  const j=await r.json().catch(()=>null);
  if(!j || j.app!=="scheda-shara" || typeof j.log!=="object") throw new Error("pesi.json su Dropbox non è un file di Scheda SHARA: non lo sovrascrivo");
  return {rev, log:j.log, notes:(j.notes&&typeof j.notes==="object")?j.notes:{}, plan:j.plan||null};
}
async function push(m,rev){
  const mode = rev ? {".tag":"update",update:rev} : {".tag":"overwrite"};
  const body=JSON.stringify({app:"scheda-shara",version:2,updated:new Date().toISOString(),log:m.log,notes:m.notes,plan:m.plan});
  const r=await dbx("https://content.dropboxapi.com/2/files/upload",{"Content-Type":"application/octet-stream","Dropbox-API-Arg":JSON.stringify({path:"/pesi.json",mode,autorename:false,mute:true})},body);
  if(r.status===409) return "conflict";
  if(!r.ok) throw new Error("upload HTTP "+r.status);
  return "ok";
}
function requestSync(delay){ if(!tkGet()) return; clearTimeout(sync.timer); sync.timer=setTimeout(runSync,delay||0); }
async function runSync(){
  if(!tkGet() || !DROPBOX_APP_KEY) return;
  if(sync.busy){ sync.again=true; return; }
  sync.busy=true; renderSync("Sincronizzazione in corso…");
  try{
    flushNotes();
    for(let i=0;i<3;i++){
      const remote=await pull(), local={log:lsAll(), notes:notesAll(), plan:lsGet(PLAN_KEY,null)}, m=mergeAll(local,remote);
      if(!same(m,local)){
        const cur=state.date+"_"+state.dayId, ae=document.activeElement, focused=ae && ae.closest && ae.closest("#list");
        const changedLog=Object.keys(m.log).filter(k=>!same(m.log[k],local.log[k]));
        writeAll(m);
        const onlyMine = same(m.notes,local.notes) && same(m.plan,local.plan) && changedLog.length===1 && changedLog[0]===cur;
        if(state.editing){ /* niente ridisegno mentre si modifica la scheda */ }
        else if(!(focused && onlyMine)) reloadAll();
        else renderWeek();
      }
      if(same(m,{log:remote.log,notes:remote.notes,plan:remote.plan})) break;
      if(await push(m,remote.rev)==="ok") break;
    }
    sync.last=new Date();
    renderSync();
  }catch(e){
    renderSync(navigator.onLine===false ? "Senza rete: sincronizzo appena torna la connessione." : "Sincronizzazione non riuscita ("+e.message+"). I dati restano su questo dispositivo.");
  }finally{
    sync.busy=false;
    if(sync.again){ sync.again=false; requestSync(500); }
  }
}
function renderSync(msg){
  const on=!!tkGet(), cfg=!!DROPBOX_APP_KEY;
  $("syncOff").hidden=on || !cfg; $("syncOn").hidden=!on; $("syncNoCfg").hidden=cfg;
  $("syncMsg").textContent = msg || (on ? (sync.last ? "Dropbox collegato · ultima sincronizzazione alle "+sync.last.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}) : "Dropbox collegato.") : (cfg ? "Collega Dropbox per avere gli stessi dati su telefono e PC." : ""));
}
/* Nell'app installata su iPhone il ritorno da Dropbox atterra in Safari, che ha una memoria separata:
   li' si usa il flusso con codice da incollare. */
const IOS_STANDALONE = window.navigator.standalone === true;
async function startCodeFlow(){ const url=await pkceStart(false); window.open(url,"_blank","noopener"); $("sCodeBox").hidden=false; renderSync("Accedi a Dropbox nella pagina che si è aperta, copia il codice che ti mostra e incollalo qui sotto."); }
$("sConnect").addEventListener("click",async()=>{ if(IOS_STANDALONE) return startCodeFlow(); location.href=await pkceStart(true); });
$("sCodeStart").addEventListener("click",startCodeFlow);
if(IOS_STANDALONE) $("sCodeStart").hidden=true;
$("sCodeOk").addEventListener("click",async()=>{
  const c=$("sCode").value; if(!c.trim()) return;
  try{ await finishAuth(c); $("sCode").value=""; $("sCodeBox").hidden=true; renderSync(); runSync(); }
  catch(e){ renderSync("Codice non valido o scaduto: richiedine uno nuovo."); }
});
$("sNow").addEventListener("click",()=>runSync());
$("sOff").addEventListener("click",async()=>{
  const t=await accessToken().catch(()=>null);
  if(t) fetch("https://api.dropboxapi.com/2/auth/token/revoke",{method:"POST",headers:{Authorization:"Bearer "+t}}).catch(()=>{});
  tkSet(null); renderSync("Dropbox scollegato. I dati restano su questo dispositivo e nel file su Dropbox.");
});
window.addEventListener("online",()=>requestSync(500));
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") requestSync(300); });

async function bootSync(){
  const q=new URLSearchParams(location.search);
  if(q.get("code") || q.get("error")){
    history.replaceState(null,"",REDIRECT);
    let p=null; try{ p=JSON.parse(localStorage.getItem(PKCE_KEY)||"null"); }catch(e){}
    if(q.get("error")) renderSync("Collegamento a Dropbox annullato.");
    else if(!p || q.get("state")!==p.state) renderSync("Collegamento non valido: premi di nuovo «Collega Dropbox».");
    else { try{ await finishAuth(q.get("code")); }catch(e){ renderSync("Collegamento non riuscito ("+e.message+")."); return; } }
  }
  renderSync(); runSync();
}

openDay(state.dayId);
bootSync();
if(!lsWrite(lsAll())) setStatus("Attenzione: questo browser non permette di salvare i dati (navigazione privata?).");
if("serviceWorker" in navigator && location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
