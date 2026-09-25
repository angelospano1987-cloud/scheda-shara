(function(){
"use strict";
/* Interfaccia di Scheda SHARA. La logica pura (scheda di partenza, unione dati, suggerimenti, record, settimana)
   sta in core.js ed e' coperta dai test in tests/. */
const C = window.SharaCore;
const { DEFAULT_DAYS, clone, same, num, kgFmt, esc, isoOf, fmtDate, shortDate, mondayOf, addDays, targetReps, doseOf, ytId, live } = C;

const $ = id => document.getElementById(id);
const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z"/></svg>';
const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>';
const isoToday = () => isoOf(new Date());
function defaultDay(){ return ({0:"lun",1:"lun",2:"mer",3:"mer",4:"ven",5:"ven",6:"lun"})[new Date().getDay()]; }

/* ---------- archivio sul dispositivo: pesi, note, scheda, corpo ---------- */
const LS_KEY="shara-log-v1", NOTES_KEY="shara-notes-v1", PLAN_KEY="shara-plan-v1", BODY_KEY="shara-body-v1";
function lsGet(k,def){ try{ const o=JSON.parse(localStorage.getItem(k)||"null"); return (o && typeof o==="object")?o:def; }catch(e){ return def; } }
function lsPut(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
const lsAll = () => lsGet(LS_KEY,{});
const lsWrite = all => lsPut(LS_KEY,all);
const notesAll = () => lsGet(NOTES_KEY,{});
const bodyAll = () => lsGet(BODY_KEY,{});
function planGet(){ const p=lsGet(PLAN_KEY,null); return C.validPlan(p) ? p : {updated:"", days:clone(DEFAULT_DAYS), archive:[]}; }
const localAll = () => ({log:lsAll(), notes:notesAll(), plan:lsGet(PLAN_KEY,null), body:bodyAll()});
function setStatus(t){ $("status").textContent=t; }

const state = { date: isoToday(), dayId: defaultDay(), session:{}, last:{}, vidx:{}, plan: planGet(), editing:null, view:"train", bodyField:"peso" };
const days = () => state.plan.days;
const dayOf = id => days().find(d=>d.id===id) || days()[0];

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
function reloadAll(){
  stopVideos(); state.session={}; state.last={}; openDay(state.dayId);
  if(state.view==="diary") renderDiary(); if(state.view==="body") renderBody();
}

/* ---------- viste: allenamento, diario, corpo ---------- */
function setView(v){
  if(state.editing && v!=="train") closeEditor();
  state.view=v; stopVideos();
  $("vTrain").hidden=v!=="train"; $("vDiary").hidden=v!=="diary"; $("vBody").hidden=v!=="body";
  document.querySelectorAll(".vnav button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.view===v));
  if(v==="diary") renderDiary(); if(v==="body") renderBody();
  try{ sessionStorage.setItem("shara-view",v); }catch(e){}
  window.scrollTo({top:0});
}
document.querySelector(".vnav").addEventListener("click",e=>{ const b=e.target.closest("button[data-view]"); if(b) setView(b.dataset.view); });

/* ---------- riepilogo della settimana ---------- */
function allDocsLive(){
  const all=lsAll();
  for(const [dayId,ses] of Object.entries(state.session)) all[ses.date+"_"+dayId]=ses;
  return Object.values(all).filter(live);
}
function renderWeek(){
  const docs=allDocsLive(), mon=mondayOf(state.date);
  const cur=C.weekStats(mon,docs,days()), prev=C.weekStats(addDays(mon,-7),docs,days());
  const weeks=Array.from({length:8},(_,i)=>{ const m=addDays(mon,-7*(7-i)); return {m, v:C.weekStats(m,docs,days()).volume}; });
  const maxV=Math.max(1,...weeks.map(w=>w.v));
  $("week").innerHTML=
    '<div class="wk-head"><h2>Questa settimana</h2><span>dal '+shortDate(mon)+' al '+shortDate(addDays(mon,6))+'</span></div>'+
    '<div class="wk-days">'+days().map(d=>'<span class="wk-dot'+(cur.days[d.id]?' on':'')+'" style="--pc:'+d.plate+'" title="'+esc(d.name)+(cur.days[d.id]?': fatto':': da fare')+'"><i></i>'+esc(d.name.slice(0,3))+'</span>').join("")+'</div>'+
    '<div class="wk-kpi">'+
      '<div><span>Allenamenti</span><b>'+cur.sessions+' di '+days().length+'</b><small>scorsa: '+prev.sessions+'</small></div>'+
      '<div><span>Serie</span><b>'+cur.sets+'</b><small>scorsa: '+prev.sets+'</small></div>'+
      '<div><span>Volume</span><b>'+kgFmt(Math.round(cur.volume))+' kg</b><small>scorsa: '+kgFmt(Math.round(prev.volume))+' kg</small></div>'+
    '</div>'+
    '<div class="wk-bars" role="img" aria-label="Volume delle ultime 8 settimane">'+weeks.map((w,i)=>
      '<div class="wk-bar'+(i===7?' cur':'')+'"><i style="height:'+Math.max(w.v?4:0,Math.round(w.v/maxV*100))+'%"></i><small>'+shortDate(w.m).replace(/\s.*/,"")+'</small></div>').join("")+'</div>';
}

/* ---------- interfaccia del giorno ---------- */
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
  const docs=dayDocs(day.id);
  const out=it.parts.map((p,pi)=>{ const s=C.suggestion(docs,it,pi,state.date); if(!s) return "";
    return '<div class="sugg'+(s.up?' up':'')+'"><div><b>'+(it.parts.length>1?esc(p.short||p.name)+': ':'')+'oggi '+kgFmt(s.kg)+' kg'+(s.up?' ↑':'')+'</b><small>'+esc(s.why)+'</small></div>'+
      '<button class="lbtn sm" type="button" data-use="'+it.id+'" data-p="'+pi+'" data-kg="'+s.kg+'">Usa</button></div>'; }).join("");
  return out ? '<div class="suggs">'+out+'</div>' : "";
}
/* Record personali dell'esercizio e, se oggi ne batti uno, l'avviso. */
function recordHTML(day,it){
  const docs=dayDocs(day.id), rows=state.session[day.id].sets[it.id];
  return it.parts.map((p,pi)=>{
    const b=C.bests(docs,it,pi,state.date), r=C.recordToday(docs,it,pi,state.date,rows), lab=it.parts.length>1?esc(p.short||p.name)+': ':'';
    const news = r ? '<div class="newrec" role="status"><b>Nuovo record'+(r.type==="kg"?' di carico: '+kgFmt(r.value)+' kg':' di massimale stimato: '+kgFmt(Math.round(r.value))+' kg')+'</b> (prima '+kgFmt(r.type==="kg"?r.prev:Math.round(r.prev))+' kg)</div>' : "";
    const info = b.kg!==null ? '<div class="recinfo">'+lab+'record '+kgFmt(b.kg)+' kg il '+shortDate(b.kgDate)+(b.rm!==null?' · massimale stimato '+kgFmt(Math.round(b.rm))+' kg':'')+'</div>' : "";
    return news+info;
  }).join("");
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
      '<div class="recs" id="rec-'+it.id+'">'+recordHTML(day,it)+'</div>'+
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
  const day=dayOf(state.dayId), it=day.items.find(x=>x.id===t.dataset.it), rec=$("rec-"+it.id);
  if(rec) rec.innerHTML=recordHTML(day,it);
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
function sparkline(points,unit,label){
  const W=300,H=96,L=34,R=10,T=12,B=22;
  const vals=points.map(p=>p.v), lo=Math.min(...vals), hi=Math.max(...vals), span=(hi-lo)||1;
  const x=i=>L+(points.length===1?(W-L-R)/2:i*(W-L-R)/(points.length-1));
  const y=v=>T+(H-T-B)*(1-(v-(hi===lo?lo-0.5:lo))/(hi===lo?1:span));
  const pts=points.map((p,i)=>x(i).toFixed(1)+","+y(p.v).toFixed(1)).join(" ");
  const lastI=points.length-1;
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(label||"Peso massimo per sessione")+', da '+kgFmt(vals[0])+' a '+kgFmt(vals[lastI])+' '+esc(unit||"kg")+'">'+
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
function confirmBar(ask,what){
  return ask ? '<div class="confirm" role="alert"><p>Eliminare '+what+' del <b>'+esc(fmtDate(ask))+'</b>? La cancellazione vale anche sugli altri dispositivi collegati.</p>'+
    '<div class="row"><button class="lbtn danger" type="button" data-delsure="'+ask+'">Elimina</button><button class="lbtn" type="button" data-delno="1">Annulla</button></div></div>' : "";
}
function fillHist(det){
  const day=dayOf(state.dayId), it=day.items.find(x=>x.id===det.dataset.it);
  if(!it) return;
  const rows=histRows(day.id,it), body=det.querySelector(".hist-body"), bar=confirmBar(det.dataset.confirm||"","l'allenamento (tutti gli esercizi)");
  if(!rows.length){ body.innerHTML=bar+'<p class="hist-empty">Ancora nessun peso registrato per questo esercizio.</p>'; return; }
  body.innerHTML=bar+it.parts.map((p,pi)=>{
    const pr=rows.map(r=>{ const kgs=r.rows.map(row=>num((row.kg||[])[pi])); return {date:r.date, rows:r.rows, max:Math.max(...kgs.filter(v=>v!==null))}; }).filter(r=>isFinite(r.max));
    if(!pr.length) return it.parts.length>1?'<p class="hist-empty">'+esc(p.name)+': nessun peso registrato.</p>':'';
    const first=pr[0], last=pr[pr.length-1], diff=last.max-first.max, best=Math.max(...pr.map(r=>r.max));
    const rm=C.bests(dayDocs(day.id).concat([state.session[day.id]]),it,pi,null).rm;
    const trend = pr.length<2 ? "Prima sessione registrata" : (diff>0?"+":diff<0?"−":"±")+kgFmt(Math.abs(diff))+" kg dal "+shortDate(first.date);
    const nSets=Math.max(it.sets,...pr.map(r=>r.rows.length));
    return '<div class="hist-part">'+
      (it.parts.length>1?'<div class="part-name">'+esc(p.name)+'</div>':'')+
      '<div class="hist-kpi"><div><span>Ultimo massimo</span><b>'+kgFmt(last.max)+' kg</b></div><div><span>Record</span><b>'+kgFmt(best)+' kg</b></div><div><span>Massimale stimato</span><b>'+(rm!==null?kgFmt(Math.round(rm))+' kg':'—')+'</b></div></div>'+
      '<p class="hist-legend">Andamento: <b class="'+(diff>0?'up':diff<0?'down':'')+'">'+trend+'</b>. Il massimale stimato (formula di Epley) è indicativo, non un test.</p>'+
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
  const all=lsAll();
  all[date+"_"+dayId]={day:dayId, date, deleted:true, updated:new Date().toISOString(), sets:{}};
  lsWrite(all);
  if(date===state.date && dayId===state.dayId){ clearTimeout(saveTimer); saveTimer=null; }
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
    const day=dayOf(state.dayId), it=day.items.find(x=>x.id===use.dataset.use), pi=+use.dataset.p, kg=String(+use.dataset.kg);
    let n=0; state.session[state.dayId].sets[it.id].forEach(r=>{ if(!r.kg[pi]){ r.kg[pi]=kg; n++; } });
    const art=use.closest(".ex");
    art.querySelectorAll('input[data-f="kg"][data-p="'+pi+'"]').forEach(inp=>{ inp.value=state.session[state.dayId].sets[it.id][+inp.dataset.s].kg[pi]; });
    use.textContent = n ? "Inserito" : "Già pieno";
    if(n){ scheduleSave(); $("rec-"+it.id).innerHTML=recordHTML(day,it); }
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

/* ---------- diario: ogni allenamento per data ---------- */
/* Il nome di un esercizio si cerca nella scheda attuale e poi nell'archivio: un esercizio tolto dalla scheda resta leggibile. */
function itemFor(dayId,itId){
  const d=days().find(x=>x.id===dayId), it=d && d.items.find(x=>x.id===itId);
  if(it) return it;
  const arch=(state.plan.archive||[]).slice().reverse();
  for(const a of arch){ const x=a.day && a.day.items && a.day.items.find(y=>y.id===itId); if(x) return x; }
  return null;
}
let diaryConfirm="";
function renderDiary(){
  const all=lsAll();
  for(const [dayId,ses] of Object.entries(state.session)) all[ses.date+"_"+dayId]=ses;
  const docs=Object.values(all).filter(d=>live(d) && Object.values(d.sets).some(rows=>(rows||[]).some(r=>r && (r.done || (r.kg||[]).some(k=>num(k)!==null)))))
    .sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(a.day<b.day?-1:1));
  if(!docs.length){ $("diaryList").innerHTML='<p class="hist-empty">Nessun allenamento registrato. Compare qui appena scrivi un peso o spunti una serie.</p>'; return; }
  let month="";
  $("diaryList").innerHTML=docs.map(d=>{
    const day=days().find(x=>x.id===d.day), st=C.docStats(d,days()), key=d.date+"_"+d.day;
    const m=C.dateOf(d.date).toLocaleDateString("it-IT",{month:"long",year:"numeric"});
    const head = m!==month ? '<h3 class="dmonth">'+esc(m)+'</h3>' : ""; month=m;
    const items=Object.entries(d.sets).map(([itId,rows])=>{
      const it=itemFor(d.day,itId), parts=it?it.parts:[{name:itId}];
      const cells=(rows||[]).filter(Boolean).map(r=>parts.map((_,pi)=>cellTxt(r,pi)).filter(Boolean).join(" + ")+(r.done?"":" (non spuntata)")).filter(x=>x && x!==" (non spuntata)");
      return cells.length ? '<li><b>'+esc(parts.map(p=>p.name).join(" + "))+'</b><span>'+esc(cells.join(" · "))+'</span></li>' : "";
    }).join("");
    return head+'<details class="dentry" style="--pc:'+(day?day.plate:"var(--line)")+'"'+(diaryConfirm===key?' open':'')+'><summary><span class="ddot"></span><span class="dtitle">'+esc(fmtDate(d.date))+'</span><span class="dmeta">'+esc(day?day.name:d.day)+' · '+st.sets+' serie · '+kgFmt(Math.round(st.volume))+' kg</span></summary>'+
      '<ul class="ditems">'+(items||'<li>Nessun peso scritto.</li>')+'</ul>'+
      (diaryConfirm===key ? confirmBar(d.date,"l'allenamento").replace('data-delsure="'+d.date+'"','data-dsure="'+key+'"').replace('data-delno="1"','data-dno="1"')
                          : '<div class="row"><button class="lbtn sm" type="button" data-dask="'+key+'">Elimina questo allenamento</button></div>')+
    '</details>';
  }).join("");
}
$("diaryList").addEventListener("click",e=>{
  const ask=e.target.closest("[data-dask]"), sure=e.target.closest("[data-dsure]"), no=e.target.closest("[data-dno]");
  if(ask){ diaryConfirm=ask.dataset.dask; renderDiary(); return; }
  if(no){ diaryConfirm=""; renderDiary(); return; }
  if(sure){ const [date,dayId]=sure.dataset.dsure.split("_"); diaryConfirm=""; deleteSession(dayId,date); renderDiary(); }
});

/* ---------- corpo: peso e misure ---------- */
let bodyConfirm="";
function renderBody(){
  const body=bodyAll(), date=$("bDate").value||state.date, cur=body[date]&&!body[date].deleted?body[date]:{};
  $("bFields").innerHTML=C.BODY_FIELDS.map(f=>'<label class="ef"><span>'+f.label+' ('+f.unit+')</span><input inputmode="decimal" autocomplete="off" data-bf="'+f.k+'" value="'+esc(cur[f.k]||"")+'" placeholder="—"></label>').join("");
  $("bSel").innerHTML=C.BODY_FIELDS.map(f=>'<option value="'+f.k+'"'+(f.k===state.bodyField?' selected':'')+'>'+f.label+'</option>').join("");
  const f=C.BODY_FIELDS.find(x=>x.k===state.bodyField), pts=C.bodySeries(body,f.k);
  let chart='<p class="hist-empty">Ancora nessuna misura di '+f.label.toLowerCase()+'.</p>';
  if(pts.length){
    const first=pts[0], last=pts[pts.length-1], diff=last.v-first.v;
    chart='<div class="hist-kpi"><div><span>Ultima</span><b>'+kgFmt(last.v)+' '+f.unit+'</b></div><div><span>Prima</span><b>'+kgFmt(first.v)+' '+f.unit+'</b></div><div><span>Variazione</span><b>'+(diff>0?"+":diff<0?"−":"±")+kgFmt(Math.abs(diff))+' '+f.unit+'</b></div></div>'+sparkline(pts,f.unit,f.label);
  }
  $("bChart").innerHTML=chart;
  const rows=Object.values(body).filter(e=>e && !e.deleted && C.BODY_FIELDS.some(x=>num(e[x.k])!==null)).sort((a,b)=>a.date<b.date?1:-1);
  $("bTable").innerHTML=(bodyConfirm?confirmBar(bodyConfirm,"le misure").replace('data-delsure=','data-bsure=').replace('data-delno="1"','data-bno="1"'):"")+
    (rows.length?'<div class="hist-tbl"><table><thead><tr><th>Data</th>'+C.BODY_FIELDS.map(x=>'<th>'+x.label+'</th>').join("")+'<th><span class="sr">Elimina</span></th></tr></thead><tbody>'+
    rows.map(e=>'<tr><td>'+shortDate(e.date)+'</td>'+C.BODY_FIELDS.map(x=>'<td>'+(num(e[x.k])!==null?kgFmt(num(e[x.k])):'—')+'</td>').join("")+'<td><button class="del" type="button" data-bdel="'+e.date+'" aria-label="Elimina le misure del '+esc(shortDate(e.date))+'">×</button></td></tr>').join("")+
    '</tbody></table></div>':"");
}
$("bDate").addEventListener("change",()=>{ $("bMsg").textContent=""; renderBody(); });
$("bSel").addEventListener("change",()=>{ state.bodyField=$("bSel").value; renderBody(); });
$("bFields").addEventListener("input",e=>{ const t=e.target; if(t.dataset.bf){ const c=t.value.replace(",",".").replace(/[^0-9.]/g,""); if(c!==t.value) t.value=c; } });
$("bSave").addEventListener("click",()=>{
  const date=$("bDate").value; if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){ $("bMsg").textContent="Scegli una data valida."; return; }
  const e={date, updated:new Date().toISOString()}, errs=[];
  $("bFields").querySelectorAll("[data-bf]").forEach(inp=>{ const f=C.BODY_FIELDS.find(x=>x.k===inp.dataset.bf), v=num(inp.value);
    if(inp.value.trim()==="") return; if(v===null||v<f.min||v>f.max) errs.push(f.label+": tra "+f.min+" e "+f.max+" "+f.unit); else e[f.k]=String(v); });
  if(errs.length){ $("bMsg").textContent="Da correggere: "+errs.join("; ")+"."; return; }
  if(!C.BODY_FIELDS.some(f=>e[f.k]!=null)){ $("bMsg").textContent="Scrivi almeno una misura."; return; }
  const body=bodyAll(); body[date]=e; lsPut(BODY_KEY,body);
  $("bMsg").textContent="Misure del "+fmtDate(date)+" salvate."; renderBody(); requestSync(1000);
});
$("bTable").addEventListener("click",e=>{
  const d=e.target.closest("[data-bdel]"), s=e.target.closest("[data-bsure]"), n=e.target.closest("[data-bno]");
  if(d){ bodyConfirm=d.dataset.bdel; renderBody(); return; }
  if(n){ bodyConfirm=""; renderBody(); return; }
  if(s){ const body=bodyAll(); body[s.dataset.bsure]={date:s.dataset.bsure, deleted:true, updated:new Date().toISOString()}; lsPut(BODY_KEY,body); bodyConfirm=""; renderBody(); requestSync(500); }
});

/* ---------- modifica della scheda, con archivio delle versioni ---------- */
const newId = () => "x"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const blankPart = () => ({name:"",short:"",reps:"10",inc:2.5,v:[],cues:[]});
const vidRaw = (p,k) => p.vraw ? (p.vraw[k]||"") : (p.v&&p.v[k] ? "https://youtu.be/"+p.v[k].id : "");
function openEditor(){
  stopVideos();
  state.editing={dayId:state.dayId, draft:clone(dayOf(state.dayId)), confirm:"", showArch:""};
  $("list").hidden=true; $("editor").hidden=false; $("bEdit").hidden=true;
  renderEditor(); window.scrollTo({top:$("focusRow").offsetTop-10});
}
function closeEditor(){ state.editing=null; $("editor").hidden=true; $("list").hidden=false; $("bEdit").hidden=false; $("editor").innerHTML=""; }
function fld(label,attrs,val,cls){ return '<label class="ef'+(cls?' '+cls:'')+'"><span>'+label+'</span><input '+attrs+' value="'+esc(val)+'"></label>'; }
function archiveHTML(){
  const ed=state.editing, list=(state.plan.archive||[]).filter(a=>a.dayId===ed.dayId).slice().reverse();
  if(!list.length) return '<p class="hist-empty">Nessuna versione precedente: la prima comparirà qui dopo un salvataggio.</p>';
  return '<ul class="arch">'+list.map(a=>{
    const when=new Date(a.savedAt).toLocaleString("it-IT",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
    return '<li><div class="arch-h"><span>Sostituita il '+esc(when)+' · '+a.day.items.length+' esercizi</span>'+
      '<span class="row"><button class="lbtn sm" type="button" data-archshow="'+a.id+'">'+(ed.showArch===a.id?'Nascondi':'Mostra')+'</button><button class="lbtn sm" type="button" data-archload="'+a.id+'">Ripristina</button></span></div>'+
      (ed.showArch===a.id?'<ol class="arch-items">'+a.day.items.map(it=>'<li>'+esc(it.parts.map(p=>p.name).join(" + "))+' <span>'+esc(doseOf(it))+' · '+it.rest+'″</span></li>').join("")+'</ol>':'')+'</li>';
  }).join("")+'</ul>';
}
function renderEditor(msg){
  const ed=state.editing, d=ed.draft;
  $("editor").innerHTML=
    '<div class="ed-top"><h2>Modifica scheda · '+esc(d.name)+'</h2><p>Le modifiche valgono da oggi e si sincronizzano sugli altri dispositivi. Lo storico resta, e la versione che sostituisci finisce nell\'archivio qui sotto.</p></div>'+
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
    '<section class="ed-arch"><h3>Schede precedenti di '+esc(d.name.toLowerCase())+'</h3>'+archiveHTML()+'</section>'+
    '<div class="row">'+(ed.confirm==="reset"?'<button class="lbtn sm danger" type="button" data-reset="sure">Conferma: torna alla scheda originale di '+esc(d.name.toLowerCase())+'</button>':'<button class="lbtn sm" type="button" data-reset="ask">Ripristina la scheda originale del giorno</button>')+'</div>';
}
/* Legge i campi nella bozza cosi' come sono scritti (testo), senza validare: ridisegnare l'editor dopo
   un'aggiunta o uno spostamento deve mostrare cio' che e' stato digitato. La validazione avviene al salvataggio. */
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
  if(same(d,orig)){ closeEditor(); setStatus("Nessuna modifica alla scheda."); return; }
  const now=new Date().toISOString();
  let plan=C.archivePush(state.plan,d.id,orig,now);
  plan.days=plan.days.map(x=>x.id===d.id?d:x); plan.updated=now;
  if(saveTimer){ clearTimeout(saveTimer); saveNow(); }
  state.plan=plan; lsPut(PLAN_KEY,plan);
  closeEditor(); reloadAll(); requestSync(500);
  setStatus("Scheda di "+d.name.toLowerCase()+" salvata. La versione precedente è nell'archivio.");
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
  else if(b.dataset.archshow){ ed.showArch = ed.showArch===b.dataset.archshow ? "" : b.dataset.archshow; }
  else if(b.dataset.archload){ const a=(state.plan.archive||[]).find(x=>x.id===b.dataset.archload); if(a){ ed.draft=clone(a.day); ed.confirm=""; renderEditor("Versione archiviata caricata: premi «Salva scheda» per rimetterla in uso."); return; } }
  else if(b.dataset.reset==="ask"){ ed.confirm="reset"; }
  else if(b.dataset.reset==="sure"){ ed.draft=clone(DEFAULT_DAYS.find(x=>x.id===ed.dayId)); ed.confirm=""; renderEditor("Scheda originale ricaricata: premi «Salva scheda» per confermarla."); return; }
  renderEditor();
});

/* ---------- copia dei dati ---------- */
$("bExport").addEventListener("click",()=>{
  flushNotes();
  const blob=new Blob([JSON.stringify(Object.assign({app:"scheda-shara",version:3,exported:new Date().toISOString()},localAll()),null,1)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="scheda-shara-"+state.date+".json";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  setStatus("Copia esportata: tienila nei tuoi file per ripristinarla su un altro dispositivo.");
});
$("bImport").addEventListener("change",async e=>{
  const f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return;
  try{
    const j=JSON.parse(await f.text());
    if(!j || j.app!=="scheda-shara" || typeof j.log!=="object") throw new Error("formato");
    const before=lsAll(), m=C.mergeAll(localAll(),{log:j.log,notes:j.notes||{},plan:j.plan||null,body:j.body||{}});
    const n=Object.keys(m.log).filter(k=>!same(m.log[k],before[k])).length;
    if(!writeAll(m)) throw new Error("memoria");
    reloadAll();
    setStatus("Copia importata: "+n+" sessioni aggiornate.");
    requestSync(500);
  }catch(err){ setStatus("Importazione non riuscita: il file non è una copia di Scheda SHARA."); }
});
function writeAll(m){
  const ok=lsWrite(m.log) && lsPut(NOTES_KEY,m.notes) && lsPut(BODY_KEY,m.body||{}) && (m.plan ? lsPut(PLAN_KEY,m.plan) : true);
  state.plan=planGet();
  return ok;
}

/* ---------- notifica di fine recupero a schermo bloccato ----------
   Il servizio (push-worker/) riceve l'orario di fine e manda una push; senza servizio configurato resta spenta. */
const PUSH_URL=String(window.SHARA_PUSH_URL||"").replace(/\/+$/,""), VAPID_KEY=String(window.SHARA_VAPID_KEY||"");
const PUSH_KEY="shara-push", DEV_KEY="shara-device";
function deviceId(){ let id=null; try{ id=localStorage.getItem(DEV_KEY); if(!id){ id="d"+crypto.getRandomValues(new Uint32Array(3)).join("").slice(0,20); localStorage.setItem(DEV_KEY,id); } }catch(e){} return id; }
const pushSub = () => lsGet(PUSH_KEY,null);
function unb64(s){ const b=atob(s.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((s.length+3)%4)); return Uint8Array.from(b,c=>c.charCodeAt(0)); }
function pushCall(path,body){
  return fetch(PUSH_URL+path,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(body),keepalive:true})
    .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r; });
}
function pushSchedule(at){ const s=pushSub(); if(!s || !PUSH_URL) return; pushCall("/schedule",{id:deviceId(), sub:{endpoint:s.endpoint}, at:Math.round(at)}).catch(()=>renderPush("La notifica di fine recupero non è stata programmata: servizio non raggiungibile. Il timer in pagina funziona comunque.")); }
function pushCancel(){ if(!pushSub() || !PUSH_URL) return; pushCall("/cancel",{id:deviceId()}).catch(()=>{}); }
function renderPush(msg){
  const cfg=!!(PUSH_URL && VAPID_KEY), sup=("serviceWorker" in navigator) && ("PushManager" in window) && ("Notification" in window), on=!!pushSub();
  $("pushOn").hidden=!cfg||!sup||on; $("pushOff").hidden=!on;
  $("pushMsg").textContent = msg || (!cfg ? "Non ancora attiva: il servizio di notifica non è configurato in questa versione." :
    !sup ? (/iPhone|iPad/.test(navigator.userAgent) ? "Sull'iPhone la notifica funziona solo aprendo l'app dall'icona nella schermata Home (iOS 16.4 o successivo)." : "Questo browser non supporta le notifiche push.") :
    on ? "Attiva su questo dispositivo: a fine recupero arriva una notifica anche a schermo bloccato." : "A fine recupero una notifica anche a schermo bloccato o con un'altra app aperta.");
}
$("pushOn").addEventListener("click",async()=>{
  try{
    const perm=await Notification.requestPermission();
    if(perm!=="granted"){ renderPush("Permesso negato: le notifiche si riattivano dalle impostazioni del telefono per questa app."); return; }
    const reg=await navigator.serviceWorker.ready;
    const sub=await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:unb64(VAPID_KEY)});
    lsPut(PUSH_KEY,{endpoint:sub.endpoint, created:new Date().toISOString()});
    renderPush();
  }catch(e){ renderPush("Attivazione non riuscita ("+(e&&e.message||e)+")."); }
});
$("pushOff").addEventListener("click",async()=>{
  pushCancel();
  try{ const reg=await navigator.serviceWorker.ready; const s=await reg.pushManager.getSubscription(); if(s) await s.unsubscribe(); }catch(e){}
  try{ localStorage.removeItem(PUSH_KEY); }catch(e){}
  renderPush("Notifica disattivata su questo dispositivo.");
});
async function checkPush(){
  if(!pushSub() || !("serviceWorker" in navigator)) return renderPush();
  try{ const reg=await navigator.serviceWorker.ready; const s=await reg.pushManager.getSubscription();
    if(!s){ localStorage.removeItem(PUSH_KEY); renderPush("La notifica si era disattivata (permesso revocato o iscrizione scaduta): riattivala."); return; }
    if(s.endpoint!==pushSub().endpoint) lsPut(PUSH_KEY,{endpoint:s.endpoint, created:new Date().toISOString()});
  }catch(e){}
  renderPush();
}

/* ---------- timer di recupero ---------- */
const R=2*Math.PI*37;
$("tRing").style.strokeDasharray=R;
let tEnd=0,tTotal=90,tInt=null,audio=null,wake=null;
function unlockAudio(){ try{ if(!audio){ const A=window.AudioContext||window.webkitAudioContext; if(A) audio=new A(); } if(audio && audio.state==="suspended") audio.resume(); }catch(e){} }
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
  if(sec>=2) pushSchedule(tEnd);
}
function tick(){
  const left=(tEnd-Date.now())/1000;
  $("tClock").textContent=fmt(left);
  $("tRing").style.strokeDashoffset=R*(1-Math.max(0,Math.min(1,left/tTotal)));
  if(left<=0 && tInt){
    clearInterval(tInt); tInt=null; beep();
    $("timer").classList.add("go"); $("tLabel").textContent="Via, tocca a te"; $("tClock").textContent="0:00";
    setTimeout(()=>{ if(!tInt) $("timer").hidden=true; },6000);
    // con l'app davanti basta il segnale in pagina: la notifica arrivata nel frattempo si chiude
    if(document.visibilityState==="visible" && pushSub()) setTimeout(()=>navigator.serviceWorker.ready.then(r=>r.getNotifications({tag:"shara-rest"})).then(ns=>ns.forEach(n=>n.close())).catch(()=>{}),2500);
  }
}
function stopTimer(){ const was=!!tInt; clearInterval(tInt); tInt=null; $("timer").hidden=true; if(was) pushCancel(); }
$("tMinus").addEventListener("click",()=>{ if(tInt){ tEnd-=15000; tick(); if(tInt) pushSchedule(tEnd); } });
$("tPlus").addEventListener("click",()=>{ if(tInt){ tEnd+=15000; tTotal=Math.max(tTotal,(tEnd-Date.now())/1000); tick(); pushSchedule(tEnd); } });
$("tSkip").addEventListener("click",stopTimer);

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
  if(r.status===409){ const t=await r.text(); if(t.includes("not_found")) return {rev:null,log:{},notes:{},plan:null,body:{}}; throw new Error("download: "+t.slice(0,120)); }
  if(!r.ok) throw new Error("download HTTP "+r.status);
  let rev=null; try{ rev=JSON.parse(r.headers.get("Dropbox-API-Result")||"{}").rev||null; }catch(e){}
  const j=await r.json().catch(()=>null);
  if(!j || j.app!=="scheda-shara" || typeof j.log!=="object") throw new Error("pesi.json su Dropbox non è un file di Scheda SHARA: non lo sovrascrivo");
  const obj=x=>(x&&typeof x==="object")?x:{};
  return {rev, log:j.log, notes:obj(j.notes), plan:j.plan||null, body:obj(j.body)};
}
async function push(m,rev){
  const mode = rev ? {".tag":"update",update:rev} : {".tag":"overwrite"};
  const body=JSON.stringify({app:"scheda-shara",version:3,updated:new Date().toISOString(),log:m.log,notes:m.notes,plan:m.plan,body:m.body});
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
      const remote=await pull(), local=localAll(), m=C.mergeAll(local,remote);
      if(!same(m,{log:local.log,notes:local.notes,plan:local.plan,body:local.body})){
        const cur=state.date+"_"+state.dayId, ae=document.activeElement, focused=ae && ae.closest && ae.closest("#list,#vBody");
        const changedLog=Object.keys(m.log).filter(k=>!same(m.log[k],local.log[k]));
        writeAll(m);
        const onlyMine = same(m.notes,local.notes) && same(m.plan,local.plan) && same(m.body,local.body) && changedLog.length===1 && changedLog[0]===cur;
        if(state.editing){ /* niente ridisegno mentre si modifica la scheda */ }
        else if(!(focused && onlyMine)) reloadAll();
        else renderWeek();
      }
      if(same(m,{log:remote.log,notes:remote.notes,plan:remote.plan,body:remote.body})) break;
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

$("bDate").value=state.date; $("bDate").max=state.date;
openDay(state.dayId);
try{ const v=sessionStorage.getItem("shara-view"); if(v==="diary"||v==="body") setView(v); }catch(e){}
bootSync();
checkPush();
if(!lsWrite(lsAll())) setStatus("Attenzione: questo browser non permette di salvare i dati (navigazione privata?).");
if("serviceWorker" in navigator && location.protocol==="https:"){
  /* Quando si attiva una versione nuova dell'app la pagina si ricarica da sola, dopo aver salvato;
     non alla prima installazione (nessun controller all'avvio) e non a metà di una modifica della scheda. */
  const hadController=!!navigator.serviceWorker.controller; let refreshing=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(!hadController || refreshing || state.editing) return;
    refreshing=true; if(saveTimer){ clearTimeout(saveTimer); saveNow(); } flushNotes(); location.reload();
  });
  navigator.serviceWorker.register("sw.js").then(r=>r.update()).catch(()=>{});
}
})();
