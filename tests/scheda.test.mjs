// La scheda dell'app deve coincidere con la tabella del Word (tests/scheda-word.json, da tools/estrai_scheda_word.py).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const C = createRequire(import.meta.url)("../core.js");
const word = JSON.parse(readFileSync(new URL("./scheda-word.json", import.meta.url), "utf8"));

const sp = s => s.replace(/\s+/g, " ").trim();
function dose(s) {
  const m = s.toLowerCase().replace(/×/g, "x").match(/^\s*(\d+)\s*x\s*(\d+)(?:\s*\+\s*(\d+))?/);
  assert.ok(m, "serie × rip. non leggibile nel Word: " + s);
  return [Number(m[1]), [m[2]].concat(m[3] ? [m[3]] : [])];
}

test("stessi giorni del Word", () => {
  assert.deepEqual(C.DEFAULT_DAYS.map(d => d.name), Object.keys(word.giorni));
});

for (const day of C.DEFAULT_DAYS) {
  test(day.name + ": esercizi, nomi, serie, ripetizioni e recuperi come nel Word", () => {
    const rows = word.giorni[day.name];
    assert.equal(day.items.length, rows.length, "numero di esercizi");
    day.items.forEach((it, i) => {
      const w = rows[i], n = i + 1;
      assert.equal(sp(it.parts.map(p => p.name).join(" + ")), sp(w.esercizio), n + ": nome");
      const [sets, reps] = dose(w.serie_rip);
      assert.equal(it.sets, sets, n + ": serie");
      assert.deepEqual(it.parts.map(p => p.reps), reps, n + ": ripetizioni");
      assert.equal(it.rest, Number(w.recupero.replace(/\D/g, "")), n + ": recupero");
    });
  });
}

test("il confronto sa fallire: un nome cambiato viene segnalato", () => {
  const rows = word.giorni["Venerdì"];
  const altered = C.clone(C.DEFAULT_DAYS.find(d => d.id === "ven"));
  altered.items[3].parts[0].name = "Curl con bilanciere a zeta (EZ)";
  assert.notEqual(sp(altered.items[3].parts.map(p => p.name).join(" + ")), sp(rows[3].esercizio));
});
