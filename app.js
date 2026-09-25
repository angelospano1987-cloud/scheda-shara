(function(){
"use strict";

/* Scheda: dati trascritti da "SCHEDA ALLENAMENTO.docx".
   Video YouTube: ID letti dai risultati di ricerca e incorporabilita' verificata via oEmbed il 25.09.2026. */
const DAYS = [
  { id:"lun", name:"Lunedì", dow:1, plate:"var(--red)", focus:"Glutei, femorali, spalle",
    warm:["Circonduzioni delle anche e affondi dinamici, 8 per lato","Ponte glutei a corpo libero, 12 ripetizioni","Good morning a corpo libero (mani sui fianchi), 10 ripetizioni","Circonduzioni delle spalle e apertura con elastico, 10 + 10"],
    items:[
      { id:"hip", sets:4, dose:"4 × 8", rest:90, parts:[
        { name:"Hip thrust con bilanciere", reps:"8",
          v:[{id:"K2Q6hRKYpMI", ch:"Dieta Flessibile", d:"1:45"},{id:"IHk9Qn8ttX8", ch:"Project inVictus", d:"6:13"}],
          cues:["Scapole appoggiate sul bordo della panca, bilanciere sulle anche con l'imbottitura.","Piedi alla larghezza delle anche: in alto le tibie devono essere verticali.","Spingi con i talloni e stringi i glutei 1 secondo in alto, bacino leggermente in retroversione.","Mento verso il petto: non inarcare la zona lombare."] } ] },
      { id:"legcurl", sets:3, dose:"3 × 12", rest:90, note:"<b>2 secondi di isometria</b> in contrazione a ogni ripetizione.", parts:[
        { name:"Leg curl", reps:"12",
          v:[{id:"1zevKZn_n1E", ch:"Project inVictus", d:"3:36"},{id:"sLsmkdBH3c8", ch:"Wepa Science", d:"1:01"}],
          cues:["Ginocchio allineato al perno della macchina, rullo appena sopra il tallone.","Fletti fino in fondo e tieni la posizione 2 secondi.","Ritorno lento e controllato, senza lasciar cadere il peso.","Bacino fermo sul sedile: non sollevarlo per aiutarti."] } ] },
      { id:"rdl", sets:4, dose:"4 × 8", rest:90, parts:[
        { name:"Mezzo stacco rumeno con bilanciere", reps:"8",
          v:[{id:"w3BVJ0GyBnI", ch:"Lorenzo Gabrielli Coaching", d:"2:58"},{id:"_P3WyVBuSwA", ch:"Project Strength Genova", d:"0:45"}],
          cues:["Parti in piedi, ginocchia leggermente flesse e ferme per tutta la serie.","Porta le anche indietro: il bilanciere scivola a contatto con le cosce.","Schiena neutra e scapole strette; scendi finché senti tirare i femorali (circa metà tibia).","Risali spingendo le anche in avanti e stringendo i glutei."] } ] },
      { id:"lpsingle", sets:3, dose:"3 × 12", rest:90, note:"12 ripetizioni <b>per gamba</b>.", parts:[
        { name:"Leg press single leg", reps:"12",
          v:[{id:"1v8w-I2FEoE", ch:"4fit Sport & Fitness", d:"0:15"},{id:"S6-h9rUZVOY", ch:"Project inVictus", d:"1:10"}],
          cues:["Piede al centro della pedana, ginocchio in linea con la punta del piede.","Scendi finché il bacino resta appoggiato allo schienale.","Non bloccare il ginocchio in estensione completa.","Finisci tutte le ripetizioni con una gamba, poi cambia."] } ] },
      { id:"spress", sets:4, dose:"4 × 10 + 10", rest:90, note:"<b>Superserie</b>: shoulder press e subito alzate laterali, poi recupero.", parts:[
        { name:"Shoulder press manubri o macchina ai cavi", short:"Press", reps:"10",
          v:[{id:"fkW9CxGN4pk", ch:"Dieta Flessibile", d:"1:17"},{id:"AfIJ6VwYR5g", ch:"Project inVictus", d:"4:37"}],
          cues:["Schienale quasi verticale, piedi ben appoggiati a terra.","Manubri all'altezza delle orecchie, gomiti leggermente in avanti.","Spingi verso l'alto senza far battere i manubri.","Addome contratto: la schiena non si inarca."] },
        { name:"Alzate laterali", short:"Alzate", reps:"10",
          v:[{id:"FDCwcG71Yi0", ch:"Umberto Miletto", d:"1:46"},{id:"9yg83KalYTo", ch:"GianzCoach", d:"9:29"}],
          cues:["Busto appena inclinato in avanti, gomiti morbidi.","Sali fino all'altezza delle spalle guidando il movimento con i gomiti.","Niente slancio: scendi in circa 2 secondi.","Spalle basse, lontane dalle orecchie."] } ] }
    ] },
  { id:"mer", name:"Mercoledì", dow:3, plate:"var(--blue)", focus:"Petto e tricipiti",
    warm:["Circonduzioni delle braccia avanti e indietro, 10 + 10","Rotazioni esterne con elastico, 12 per lato","Apertura toracica a quattro zampe (libro), 8 per lato","Piegamenti sulle ginocchia lenti, 8 ripetizioni"],
    items:[
      { id:"bench", sets:4, dose:"4 × 8", rest:90, parts:[
        { name:"Panca piana con manubri", reps:"8",
          v:[{id:"n8CskqpOPek", ch:"Project inVictus", d:"5:49"},{id:"ON0D6MmOVDo", ch:"Invictus Club Torino", d:"0:52"}],
          cues:["Scapole strette e basse, piedi saldi a terra.","Parti con i manubri sopra le spalle.","Scendi ai lati del petto con i gomiti a circa 45–60° dal busto.","Spingi in alto avvicinando appena i manubri, polsi dritti."] } ] },
      { id:"flyinc", sets:3, dose:"3 × 12", rest:90, note:"Panca inclinata a <b>45°</b>.", parts:[
        { name:"Aperture laterali su panca inclinata", reps:"12",
          v:[{id:"d4rmg47U8HA", ch:"Dieta Flessibile", d:"0:57"},{id:"BwHw56WdXPQ", ch:"Davide Luna", d:"0:53"}],
          cues:["Manubri sopra il petto, palmi rivolti uno verso l'altro.","Apri ad arco con i gomiti leggermente flessi e fermi.","Scendi finché senti allungare il petto, senza superare la linea delle spalle.","Richiudi stringendo il petto, non spingendo con le braccia."] } ] },
      { id:"cablefly", sets:4, dose:"4 × 10", rest:90, note:"Una gamba avanti, busto inclinato, spalla a 45°, braccio in estensione.", parts:[
        { name:"Croci ai cavi", reps:"10",
          v:[{id:"V6kI05lcj-g", ch:"Francesco Russillo PT", d:"0:30"},{id:"d7B7bXZr26c", ch:"V Athlete", d:"7:34"}],
          cues:["Un piede avanti per stabilità, busto inclinato in avanti.","Braccia quasi tese, come da scheda.","Porta le mani avanti e insieme descrivendo un arco, stringi 1 secondo.","Torna lentamente senza lasciare che il cavo ti tiri indietro le spalle."] } ] },
      { id:"pushdown", sets:3, dose:"3 × 10", rest:90, parts:[
        { name:"Push down al cavo con corda", reps:"10",
          v:[{id:"z-GYsUm3f9c", ch:"Project inVictus", d:"4:21"},{id:"vdwP7HxDAo4", ch:"Davide Morelli", d:"0:11"}],
          cues:["Gomiti fermi, attaccati ai fianchi.","Spingi giù fino a braccia tese e apri la corda in fondo.","Risali fino a circa 90° senza sollevare i gomiti.","Busto fermo: niente oscillazioni."] } ] },
      { id:"french", sets:3, dose:"3 × 10", rest:90, parts:[
        { name:"French press con manubrio", reps:"10",
          v:[{id:"CHyjj0frj54", ch:"Vegan Coach", d:"1:09"},{id:"agVvU-OVZ-o", ch:"Lorenzo Gabrielli Coaching", d:"5:03"}],
          cues:["Gomiti fermi e rivolti in alto: si muove solo l'avambraccio.","Scendi lento finché senti allungare il tricipite.","Estendi le braccia senza bloccare i gomiti di scatto.","Carico moderato: la tecnica viene prima del peso."] } ] }
    ] },
  { id:"ven", name:"Venerdì", dow:5, plate:"var(--yellow)", focus:"Gambe, dorso, bicipiti",
    warm:["Squat a corpo libero lenti, 10 ripetizioni","Mobilità delle caviglie al muro, 10 per lato","Circonduzioni delle spalle e retrazione delle scapole, 10 + 10","Circonduzioni di polsi e gomiti, 10 per lato"],
    items:[
      { id:"legpress", sets:3, dose:"3 × 10 + 10", rest:90, note:"<b>Superserie</b>: leg press e subito leg extension, poi recupero.", parts:[
        { name:"Leg press", short:"Press", reps:"10",
          v:[{id:"LMTyPl_oo38", ch:"Project inVictus", d:"3:55"},{id:"mAweueISnMI", ch:"Luigi Colbax", d:"5:48"}],
          cues:["Piedi alla larghezza delle spalle, a metà pedana.","Scendi fino a circa 90° di ginocchio, bacino sempre appoggiato.","Ginocchia in linea con le punte dei piedi.","Non bloccare le ginocchia in alto."] },
        { name:"Leg extension", short:"Extension", reps:"10",
          v:[{id:"wRSr98kKUsg", ch:"Project inVictus", d:"5:34"},{id:"IZpKu3JyLKs", ch:"TrainingPedia", d:"2:01"}],
          cues:["Regola lo schienale: ginocchio allineato al perno della macchina.","Rullo appoggiato sopra la caviglia.","Estendi fino in fondo e tieni 1 secondo.","Scendi lento, senza far toccare i pesi."] } ] },
      { id:"lat", sets:4, dose:"4 × 10", rest:90, parts:[
        { name:"Lat machine", reps:"10",
          v:[{id:"zhCwrtIZaQk", ch:"Luigi Colbax", d:"1:38"},{id:"P8QKoy5sjv8", ch:"Project inVictus", d:"8:01"}],
          cues:["Presa poco più larga delle spalle, cosce bloccate sotto i rulli.","Petto in fuori, busto appena inclinato indietro.","Tira la barra verso la parte alta del petto portando i gomiti giù e indietro.","Risali controllato fino ad allungare bene la schiena."] } ] },
      { id:"row", sets:3, dose:"3 × 12", rest:90, note:"12 ripetizioni <b>per braccio</b>.", parts:[
        { name:"Rematore singolo con manubrio", reps:"12",
          v:[{id:"-ebafKeAmXs", ch:"Project inVictus", d:"4:46"},{id:"1e-Ks7gpp44", ch:"Invictus Club Torino", d:"0:31"}],
          cues:["Mano e ginocchio appoggiati sulla panca, schiena piatta.","Tira il manubrio verso l'anca, gomito vicino al corpo.","Il busto non ruota durante la tirata.","Scendi fino a braccio disteso, poi ripeti."] } ] },
      { id:"ezcurl", sets:3, dose:"3 × 12", rest:90, parts:[
        { name:"Curl con bilanciere a zeta (EZ)", reps:"12",
          v:[{id:"6YH1xZZ43Vw", ch:"Project inVictus", d:"7:21"},{id:"7ECvCFpsOik", ch:"Daniele Esposito", d:"0:57"}],
          cues:["Impugna il bilanciere sulle curve, alla larghezza delle spalle.","Gomiti fermi ai fianchi.","Sali senza slanciare il busto.","Scendi controllato fino quasi a braccia tese."] } ] },
      { id:"inccurl", sets:3, dose:"3 × 10", rest:90, note:"Panca inclinata a <b>60°</b>.", parts:[
        { name:"Curl su panca inclinata", reps:"10",
          v:[{id:"0o5foceYAnA", ch:"Project inVictus", d:"5:17"},{id:"rr2meFMsgSY", ch:"Dieta Flessibile", d:"1:51"}],
          cues:["Braccia che pendono verticali, leggermente dietro il busto.","Fletti senza portare i gomiti in avanti.","Ruota il palmo verso l'alto mentre sali.","Scendi fino a braccio completamente disteso."] } ] }
    ] }
];

const $ = id => document.getElementById(id);
const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z"/></svg>';
const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>';

function isoToday(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fmtDate(iso){ const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"}); }
function defaultDay(){ return ({0:"lun",1:"lun",2:"mer",3:"mer",4:"ven",5:"ven",6:"lun"})[new Date().getDay()]; }
const dayOf = id => DAYS.find(d=>d.id===id);

const state = { date: isoToday(), dayId: defaultDay(), session:{}, last:{}, vidx:{} };

/* ---------- archivio sul dispositivo ---------- */
const LS_KEY = "shara-log-v1";
function lsAll(){ try{ const o=JSON.parse(localStorage.getItem(LS_KEY)||"{}"); return (o && typeof o==="object")?o:{}; }catch(e){ return {}; } }
function lsWrite(all){ try{ localStorage.setItem(LS_KEY,JSON.stringify(all)); return true; }catch(e){ return false; } }
function setStatus(t){ $("status").textContent=t; }

let saveTimer=null;
function scheduleSave(){ clearTimeout(saveTimer); saveTimer=setTimeout(saveNow,500); }
function saveNow(){
  const dayId=state.dayId, doc=JSON.parse(JSON.stringify(state.session[dayId]));
  doc.updated=new Date().toISOString();
  const all=lsAll(); all[doc.date+"_"+dayId]=doc;
  setStatus(lsWrite(all) ? "Pesi salvati su questo telefono." : "Salvataggio non riuscito: la memoria del browser non è disponibile (navigazione privata?).");
}
window.addEventListener("pagehide",()=>{ if(saveTimer){ clearTimeout(saveTimer); saveNow(); } });

function blankSession(day){
  const sets={};
  day.items.forEach(it=>{ sets[it.id]=Array.from({length:it.sets},()=>({kg:it.parts.map(()=>""),done:false})); });
  return {day:day.id, date:state.date, sets};
}
function loadDay(day){
  const docs=Object.values(lsAll()).filter(d=>d && d.day===day.id && d.sets);
  const ses=blankSession(day);
  const today=docs.find(d=>d.date===state.date);
  if(today){
    day.items.forEach(it=>{ const s=today.sets[it.id]; if(Array.isArray(s)) s.forEach((row,i)=>{ if(ses.sets[it.id][i] && row) ses.sets[it.id][i]={kg:it.parts.map((_,p)=>String((row.kg||[])[p]??"")),done:!!row.done}; }); });
  }
  state.session[day.id]=ses;
  state.last[day.id]=docs.filter(d=>d.date<state.date).sort((a,b)=>a.date<b.date?1:-1)[0]||null;
}
function openDay(dayId){
  state.dayId=dayId;
  const day=dayOf(dayId);
  document.body.dataset.day=dayId;
  if(!state.session[dayId]) loadDay(day);
  renderDays(); renderHead(day); renderList(day);
}

/* ---------- interfaccia ---------- */
function renderDays(){
  $("days").innerHTML = DAYS.map(d=>{
    const n=d.items.reduce((a,it)=>a+it.sets,0);
    return '<button class="day" role="tab" aria-selected="'+(d.id===state.dayId)+'" data-day="'+d.id+'" style="--pc:'+d.plate+'"><span class="plate" aria-hidden="true"></span><span class="txt"><b>'+d.name+'</b><small>'+d.items.length+' esercizi · '+n+' serie</small></span></button>';
  }).join("");
}
function renderHead(day){
  $("focus").textContent=day.focus;
  $("today").textContent=(new Date().getDay()===day.dow ? "Oggi, " : "Sessione di ")+fmtDate(state.date);
  $("warmList").innerHTML=day.warm.map(t=>"<li>"+t+"</li>").join("");
}
function posterHTML(v){
  return '<button class="poster" type="button" data-vid="'+v.id+'" style="background-image:url(https://i.ytimg.com/vi/'+v.id+'/hqdefault.jpg)" aria-label="Riproduci il video di '+v.ch+'">'+
    '<span class="ico">'+PLAY+'</span><span class="cap"><b>'+v.ch+'</b>'+v.d+'</span></button>';
}
function renderList(day){
  const ses=state.session[day.id], last=state.last[day.id];
  $("list").innerHTML = day.items.map((it,i)=>{
    const rows=ses.sets[it.id], complete=rows.every(r=>r.done), multi=it.parts.length>1;
    const parts=it.parts.map((p,pi)=>{
      const key=it.id+"-"+pi, vi=state.vidx[key]||0;
      return '<div class="part">'+
        (multi?'<div class="part-name">'+p.name+'<span>× '+p.reps+'</span></div>':'')+
        '<div class="player" id="pl-'+key+'">'+posterHTML(p.v[vi])+'</div>'+
        '<div class="vtabs" role="group" aria-label="Scegli il video">'+p.v.map((v,k)=>'<button class="vtab" type="button" aria-pressed="'+(k===vi)+'" data-key="'+key+'" data-k="'+k+'">Video '+(k+1)+' · '+v.d+'</button>').join("")+'</div>'+
        '<details class="how"><summary>Come si esegue</summary><ul>'+p.cues.map(c=>"<li>"+c+"</li>").join("")+'</ul></details>'+
      '</div>';
    }).join("");
    const setRows=rows.map((r,s)=>
      '<div class="set'+(r.done?' done':'')+'">'+
        '<span class="lab">Serie '+(s+1)+'</span>'+
        '<div class="kgs">'+it.parts.map((p,pi)=>
          '<label class="kg'+(multi?' multi':'')+'">'+(multi?'<small>'+p.short+'</small>':'')+
          '<input inputmode="decimal" autocomplete="off" placeholder="—" aria-label="Chili, '+p.name+', serie '+(s+1)+'" data-it="'+it.id+'" data-s="'+s+'" data-p="'+pi+'" value="'+(r.kg[pi]||"")+'"><em>kg</em></label>').join("")+
        '</div>'+
        '<button class="chk" type="button" aria-pressed="'+r.done+'" aria-label="Serie '+(s+1)+' fatta" data-it="'+it.id+'" data-s="'+s+'">'+TICK+'</button>'+
      '</div>').join("");
    let lastTxt="";
    if(last && Array.isArray(last.sets[it.id])){
      const v=last.sets[it.id].map(r=>((r&&r.kg)||[]).filter(x=>x!=="").join("+")).filter(Boolean);
      if(v.length) lastTxt='<div class="last">Ultima volta ('+fmtDate(last.date)+'): <b>'+v.join(" · ")+' kg</b></div>';
    }
    return '<article class="ex'+(complete?' complete':'')+'">'+
      '<div class="ex-head"><span class="num">'+(i+1)+'</span><div><h3>'+it.parts.map(p=>p.name).join(" + ")+'</h3>'+(multi?'<span class="tag">Superserie</span>':'')+'</div></div>'+
      '<dl class="dose"><div><dt>Serie × rip.</dt><dd>'+it.dose+'</dd></div><div><dt>Recupero</dt><dd>'+it.rest+'″</dd></div>'+
        '<button class="restbtn" type="button" data-rest="'+it.id+'">'+CLOCK+'Avvia recupero</button></dl>'+
      (it.note?'<p class="note">'+it.note+'</p>':'')+
      parts+
      '<div class="sets">'+setRows+'</div>'+lastTxt+
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
function stopVideos(except){
  document.querySelectorAll(".player iframe").forEach(f=>{
    if(f===except) return;
    const box=f.parentElement, key=box.id.slice(3), [itId,pi]=key.split("-");
    const p=findPart(itId,+pi); box.innerHTML=posterHTML(p.v[state.vidx[key]||0]);
  });
}
function findPart(itId,pi){ for(const d of DAYS){ const it=d.items.find(x=>x.id===itId); if(it) return it.parts[pi]; } return null; }

$("days").addEventListener("click",e=>{ const b=e.target.closest(".day"); if(b && b.dataset.day!==state.dayId){ stopVideos(); openDay(b.dataset.day); window.scrollTo({top:0}); } });
$("list").addEventListener("input",e=>{
  const t=e.target; if(t.tagName!=="INPUT") return;
  const clean=t.value.replace(",",".").replace(/[^0-9.]/g,"");
  if(clean!==t.value) t.value=clean;
  state.session[state.dayId].sets[t.dataset.it][+t.dataset.s].kg[+t.dataset.p]=clean;
  scheduleSave();
  const h=t.closest(".ex").querySelector("details.hist");
  if(h && h.open) fillHist(h);
});

/* ---------- storico pesi per esercizio ---------- */
const num = x => { const n=parseFloat(x); return isFinite(n) ? n : null; };
const kgFmt = n => (Math.round(n*10)/10).toLocaleString("it-IT");
function shortDate(iso){ const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("it-IT",{day:"numeric",month:"short"}); }
/* Sessioni in cui l'esercizio ha almeno un peso, dalla piu' vecchia; oggi preso dallo stato vivo, non dal salvato. */
function histRows(dayId,it){
  const byDate={};
  Object.values(lsAll()).forEach(d=>{ if(d && d.day===dayId && d.sets && Array.isArray(d.sets[it.id])) byDate[d.date]=d.sets[it.id]; });
  byDate[state.date]=state.session[dayId].sets[it.id];
  return Object.keys(byDate).sort().map(date=>({date, parts:it.parts.map((_,pi)=>byDate[date].map(r=>num(((r&&r.kg)||[])[pi])))}))
    .filter(r=>r.parts.some(p=>p.some(v=>v!==null)));
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
  const rows=histRows(day.id,it), body=det.querySelector(".hist-body");
  if(!rows.length){ body.innerHTML='<p class="hist-empty">Ancora nessun peso registrato per questo esercizio.</p>'; return; }
  body.innerHTML=it.parts.map((p,pi)=>{
    const pr=rows.map(r=>({date:r.date, sets:r.parts[pi], max:Math.max(...r.parts[pi].filter(v=>v!==null))})).filter(r=>isFinite(r.max));
    if(!pr.length) return it.parts.length>1?'<p class="hist-empty">'+p.name+': nessun peso registrato.</p>':'';
    const first=pr[0], last=pr[pr.length-1], diff=last.max-first.max, best=Math.max(...pr.map(r=>r.max));
    const trend = pr.length<2 ? "Prima sessione registrata" :
      (diff>0?"+":diff<0?"−":"±")+kgFmt(Math.abs(diff))+" kg dal "+shortDate(first.date);
    const nSets=it.sets;
    return '<div class="hist-part">'+
      (it.parts.length>1?'<div class="part-name">'+p.name+'</div>':'')+
      '<div class="hist-kpi"><div><span>Ultimo massimo</span><b>'+kgFmt(last.max)+' kg</b></div><div><span>Record</span><b>'+kgFmt(best)+' kg</b></div><div><span>Andamento</span><b class="'+(diff>0?'up':diff<0?'down':'')+'">'+trend+'</b></div></div>'+
      sparkline(pr.map(r=>({date:r.date,v:r.max})))+
      '<div class="hist-tbl"><table><thead><tr><th>Data</th>'+Array.from({length:nSets},(_,s)=>'<th>S'+(s+1)+'</th>').join("")+'<th>Max</th></tr></thead><tbody>'+
      pr.slice().reverse().map(r=>'<tr><td>'+shortDate(r.date)+(r.date===state.date?' <em>oggi</em>':'')+'</td>'+
        Array.from({length:nSets},(_,s)=>'<td>'+(r.sets[s]!=null?kgFmt(r.sets[s]):'—')+'</td>').join("")+'<td><b>'+kgFmt(r.max)+'</b></td></tr>').join("")+
      '</tbody></table></div></div>';
  }).join("");
}
$("list").addEventListener("toggle",e=>{ const d=e.target; if(d.matches && d.matches("details.hist") && d.open) fillHist(d); },true);
$("list").addEventListener("click",e=>{
  const poster=e.target.closest(".poster");
  if(poster){
    const f=document.createElement("iframe");
    f.src="https://www.youtube-nocookie.com/embed/"+poster.dataset.vid+"?autoplay=1&rel=0&playsinline=1&modestbranding=1";
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
    const key=tab.dataset.key, k=+tab.dataset.k, [itId,pi]=key.split("-");
    state.vidx[key]=k;
    $("pl-"+key).innerHTML=posterHTML(findPart(itId,+pi).v[k]);
    tab.parentElement.querySelectorAll(".vtab").forEach(b=>b.setAttribute("aria-pressed",b===tab));
    return;
  }
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
  if(everything){ stopTimer(); setStatus("Allenamento completato. Pesi salvati su questo telefono."); return; }
  const idx=day.items.indexOf(it), nextOpen=sets[it.id].findIndex(r=>!r.done);
  const next = nextOpen>=0 ? it.parts.map(p=>p.name).join(" + ")+" · serie "+(nextOpen+1)+" di "+it.sets
             : (day.items.slice(idx+1).concat(day.items.slice(0,idx)).find(x=>sets[x.id].some(r=>!r.done))||{parts:[{name:""}]}).parts.map(p=>p.name).join(" + ");
  startTimer(it.rest,next);
});

/* ---------- copia dei dati ---------- */
$("bExport").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify({app:"scheda-shara",version:1,exported:new Date().toISOString(),log:lsAll()},null,1)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="scheda-shara-pesi-"+state.date+".json";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  setStatus("Copia esportata: tienila nei tuoi file per ripristinarla su un altro telefono.");
});
$("bImport").addEventListener("change",async e=>{
  const f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return;
  try{
    const j=JSON.parse(await f.text());
    if(!j || j.app!=="scheda-shara" || typeof j.log!=="object") throw new Error("formato");
    const all=lsAll(); let n=0;
    for(const [k,v] of Object.entries(j.log)){ if(v && v.day && v.date && v.sets && (!all[k] || (v.updated||"")>(all[k].updated||""))){ all[k]=v; n++; } }
    if(!lsWrite(all)) throw new Error("memoria");
    state.session={}; state.last={}; openDay(state.dayId);
    setStatus("Copia importata: "+n+" sessioni aggiornate.");
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
  tTotal=sec; tEnd=Date.now()+sec*1000;
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

openDay(state.dayId);
if(!lsWrite(lsAll())) setStatus("Attenzione: questo browser non permette di salvare i pesi (navigazione privata?).");
if("serviceWorker" in navigator && location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
