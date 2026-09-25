// Test della logica pura (core.js). Esecuzione: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const C = createRequire(import.meta.url)("../core.js");

const R = (kg, reps, done = true) => ({ kg, reps, done });
const days = C.DEFAULT_DAYS;
const ven = days.find(d => d.id === "ven");
const it = id => days.flatMap(d => d.items).find(x => x.id === id);
// Dati di prova con esiti calcolati a mano (sessione del 25.09.2026):
// lun 22/09: hip 60x8,60x8,60x8,60x7 -> 4 serie, 1.860 kg
// ven 18/09: leg press 80+30 x3 senza rip. (valgono 10) = 3.300 kg; lat 50x10,10,9,10 = 1.950 kg -> 7 serie, 5.250 kg
const docs = [
  { day: "lun", date: "2026-09-22", updated: "2026-09-22T10:00:00Z", sets: { hip: [R(["60"], ["8"]), R(["60"], ["8"]), R(["60"], ["8"]), R(["60"], ["7"])] } },
  { day: "ven", date: "2026-09-18", updated: "2026-09-18T10:00:00Z", sets: {
    legpress: [R(["80", "30"], ["", ""]), R(["80", "30"], ["", ""]), R(["80", "30"], ["", ""])],
    lat: [R(["50"], ["10"]), R(["50"], ["10"]), R(["50"], ["9"]), R(["50"], ["10"])] } },
  { day: "ven", date: "2026-09-11", updated: "2026-09-11T10:00:00Z", sets: { legpress: [R(["75", "30"], ["10", "10"]), R(["75", "30"], ["10", "10"]), R(["75", "30"], ["10", "10"])] } },
];

test("confronto indipendente dall'ordine delle chiavi", () => {
  assert.ok(C.same({ a: 1, b: { c: [1, 2], d: 2 } }, { b: { d: 2, c: [1, 2] }, a: 1 }));
  assert.ok(!C.same({ a: [1, 2] }, { a: [2, 1] }), "l'ordine degli elenchi conta");
  assert.ok(!C.same({ a: 1 }, { a: 1, b: null }) || C.canon({ a: 1 }) !== C.canon({ a: 1, b: null }));
});

test("settimana: allenamenti, serie e volume", () => {
  const cur = C.weekStats("2026-09-21", docs, days), prev = C.weekStats("2026-09-14", docs, days);
  assert.deepEqual([cur.sessions, cur.sets, cur.volume], [1, 4, 1860]);
  assert.deepEqual([prev.sessions, prev.sets, prev.volume], [1, 7, 5250]);
  assert.deepEqual(cur.days, { lun: true });
  const empty = C.weekStats("2026-08-31", docs, days);
  assert.deepEqual([empty.sessions, empty.sets, empty.volume], [0, 0, 0], "settimana senza allenamenti");
  const undone = [{ day: "ven", date: "2026-09-25", sets: { lat: [R(["50"], ["10"], false)] } }];
  assert.equal(C.weekStats("2026-09-21", undone, days).sessions, 0, "serie non spuntate non contano");
});

test("carico suggerito: doppia progressione", () => {
  const lp = it("legpress"), lat = it("lat");
  assert.deepEqual([C.suggestion(docs, lp, 0, "2026-09-25").kg, C.suggestion(docs, lp, 0, "2026-09-25").up], [85, true]);
  assert.deepEqual([C.suggestion(docs, lp, 1, "2026-09-25").kg, C.suggestion(docs, lp, 1, "2026-09-25").up], [32.5, true]);
  const s = C.suggestion(docs, lat, 0, "2026-09-25");
  assert.deepEqual([s.kg, s.up], [50, false], "una serie a 9 su 10: resta al carico");
  assert.match(s.why, /1 serie è rimasta sotto le 10/);
  assert.equal(C.suggestion(docs, it("row"), 0, "2026-09-25"), null, "nessuno storico: nessun suggerimento");
  const incomplete = [{ day: "ven", date: "2026-09-18", sets: { lat: [R(["50"], ["10"]), R(["50"], ["10"], false)] } }];
  assert.equal(C.suggestion(incomplete, lat, 0, "2026-09-25").up, false, "serie non completate: nessun aumento");
  const tomb = [{ day: "ven", date: "2026-09-18", deleted: true, sets: {} }];
  assert.equal(C.suggestion(tomb, lat, 0, "2026-09-25"), null, "una sessione eliminata non conta");
});

test("record personali e massimale stimato", () => {
  assert.equal(Math.round(C.e1rm(100, 10) * 100) / 100, 133.33);
  const lp = it("legpress");
  const b = C.bests(docs, lp, 0, "2026-09-25");
  assert.deepEqual([b.kg, b.kgDate], [80, "2026-09-18"]);
  assert.equal(C.recordToday(docs, lp, 0, "2026-09-25", [R(["85", ""], ["10", ""])]).type, "kg");
  const rm = C.recordToday(docs, lp, 0, "2026-09-25", [R(["80", ""], ["12", ""])]);
  assert.equal(rm.type, "rm", "stesso carico, più ripetizioni: record del massimale stimato");
  assert.equal(C.recordToday(docs, lp, 0, "2026-09-25", [R(["80", ""], ["10", ""])]), null, "uguale al record: non è un record");
  assert.equal(C.recordToday(docs, lp, 0, "2026-09-25", [R(["70", ""], ["10", ""])]), null, "sotto il record");
  assert.equal(C.recordToday(docs, it("row"), 0, "2026-09-25", [R(["30"], ["12"])]), null, "prima sessione: niente da battere");
});

test("unione fra dispositivi: vince il più recente, le cancellazioni si propagano", () => {
  const a = { "2026-09-18_ven": { day: "ven", date: "2026-09-18", updated: "2026-09-18T10:00:00Z", sets: { lat: [R(["50"], ["10"])] } } };
  const b = { "2026-09-18_ven": { day: "ven", date: "2026-09-18", updated: "2026-09-19T10:00:00Z", sets: { lat: [R(["55"], ["10"])] } },
              "2026-09-11_ven": { day: "ven", date: "2026-09-11", updated: "2026-09-11T10:00:00Z", sets: {} } };
  const m = C.mergeLogs(a, b);
  assert.equal(m["2026-09-18_ven"].sets.lat[0].kg[0], "55");
  assert.ok(m["2026-09-11_ven"]);
  assert.equal(C.mergeLogs(b, a)["2026-09-18_ven"].sets.lat[0].kg[0], "55", "l'unione è simmetrica");
  const tomb = { "2026-09-18_ven": { day: "ven", date: "2026-09-18", deleted: true, updated: "2026-09-20T00:00:00Z", sets: {} } };
  assert.ok(C.mergeLogs(m, tomb)["2026-09-18_ven"].deleted);
  assert.equal(Object.keys(C.mergeLogs(a, { x: { foo: 1 } })).length, 1, "voci estranee ignorate");
  const pOld = { updated: "2026-09-01T00:00:00Z", days: [{ id: "lun", items: [] }] }, pNew = { updated: "2026-09-02T00:00:00Z", days: [{ id: "lun", items: [] }] };
  assert.equal(C.mergeAll({ plan: pOld }, { plan: pNew }).plan, pNew);
  assert.equal(C.mergeAll({ plan: pNew }, { plan: { updated: "2099", days: "rotta" } }).plan, pNew, "scheda non valida ignorata");
  const body = C.mergeBody({ "2026-09-25": { date: "2026-09-25", peso: "70", updated: "1" } }, { "2026-09-25": { date: "2026-09-25", peso: "71", updated: "2" }, "chiave-strana": { peso: 1 } });
  assert.deepEqual(Object.keys(body), ["2026-09-25"]);
  assert.equal(body["2026-09-25"].peso, "71");
});

test("link YouTube", () => {
  for (const [s, id] of [["https://youtu.be/zhCwrtIZaQk", "zhCwrtIZaQk"], ["https://www.youtube.com/watch?v=pSHjTRCQxIw&t=5s", "pSHjTRCQxIw"],
    ["https://m.youtube.com/watch?feature=share&v=pSHjTRCQxIw", "pSHjTRCQxIw"], ["https://youtube.com/shorts/abcdefghijk", "abcdefghijk"],
    ["zhCwrtIZaQk", "zhCwrtIZaQk"], ["", ""]]) assert.equal(C.ytId(s), id, s);
  for (const s of ["https://example.com/video", "https://example.com/watch?v=zhCwrtIZaQk", "javascript:alert(1)", "https://youtu.be/short"])
    assert.equal(C.ytId(s), null, "da rifiutare: " + s);
});

test("archivio delle schede: al massimo 20 per giorno, i più vecchi escono", () => {
  let p = { updated: "", days: C.clone(days), archive: [] };
  for (let i = 0; i < 25; i++) p = C.archivePush(p, "ven", { id: "ven", n: i }, new Date(Date.UTC(2026, 0, 1 + i)).toISOString());
  p = C.archivePush(p, "lun", { id: "lun" }, "2026-02-01T00:00:00.000Z");
  const v = p.archive.filter(a => a.dayId === "ven");
  assert.equal(v.length, 20);
  assert.equal(v[0].day.n, 5, "restano gli ultimi 20");
  assert.equal(p.archive.filter(a => a.dayId === "lun").length, 1, "gli altri giorni non si toccano");
});

test("corpo: serie ordinata, voci eliminate escluse", () => {
  const body = { "2026-09-20": { date: "2026-09-20", peso: "71,5" }, "2026-09-10": { date: "2026-09-10", peso: "72" }, "2026-09-15": { date: "2026-09-15", deleted: true, peso: "90" }, "2026-09-12": { date: "2026-09-12", vita: "80" } };
  assert.deepEqual(C.bodySeries(body, "peso"), [{ date: "2026-09-10", v: 72 }, { date: "2026-09-20", v: 71.5 }]);
});

test("dose e ripetizioni previste", () => {
  assert.equal(C.doseOf(it("spress")), "4 × 10 + 10");
  assert.equal(C.targetReps({ reps: "12" }), 12);
  assert.equal(C.targetReps({ reps: "" }), null);
  assert.equal(C.esc('<b a="1">'), "&lt;b a=&quot;1&quot;&gt;");
  assert.equal(ven.items.length, 5);
});
