// Attiva il servizio di notifica, una volta sola, dopo `npx wrangler@4.140.0 login`.
// 1) genera la coppia di chiavi VAPID; 2) carica la privata come segreto Cloudflare (via stdin, mai su disco);
// 3) scrive la pubblica in wrangler.toml; 4) pubblica il servizio; 5) scrive indirizzo e chiave pubblica in ../config.js.
// Uso: node attiva.mjs [--prova]   (--prova: fa tutto tranne caricare segreto e pubblicare)
// Esito: 0 attivo · 1 errore (il messaggio dice a quale passo).
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { b64url } from "./src/push.js";

const WRANGLER = "wrangler@4.140.0";
const here = dirname(fileURLToPath(import.meta.url));
const dry = process.argv.includes("--prova");
const fail = (step, msg) => { console.error(`ERRORE al passo ${step}: ${msg}`); process.exit(1); };
const npx = (args, input) => {
  const r = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["-y", WRANGLER, ...args], { cwd: here, input, encoding: "utf8", shell: process.platform === "win32" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
};

// 0) accesso a Cloudflare
if (!dry) { const w = npx(["whoami"]); if (w.code !== 0 || /not authenticated|You are not logged in/i.test(w.out)) fail(0, "accesso a Cloudflare assente: esegui prima `npx " + WRANGLER + " login`"); }

// 1) chiavi
const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const pub = b64url(await crypto.subtle.exportKey("raw", kp.publicKey));
const j = await crypto.subtle.exportKey("jwk", kp.privateKey);
const priv = JSON.stringify({ kty: j.kty, crv: j.crv, x: j.x, y: j.y, d: j.d });
console.log("1) chiavi VAPID generate, pubblica:", pub.slice(0, 12) + "…");

// 2) segreto
if (!dry) { const s = npx(["secret", "put", "VAPID_PRIVATE_JWK"], priv); if (s.code !== 0) fail(2, s.out.slice(-400)); }
console.log("2) chiave privata caricata come segreto" + (dry ? " (saltato in prova)" : ""));

// 3) wrangler.toml
const tomlPath = join(here, "wrangler.toml"), toml = readFileSync(tomlPath, "utf8");
if (!/^VAPID_PUBLIC_KEY = ".*"$/m.test(toml)) fail(3, "riga VAPID_PUBLIC_KEY non trovata in wrangler.toml");
if (!dry) writeFileSync(tomlPath, toml.replace(/^VAPID_PUBLIC_KEY = ".*"$/m, `VAPID_PUBLIC_KEY = "${pub}"`));
console.log("3) chiave pubblica in wrangler.toml" + (dry ? " (saltato in prova)" : ""));

// 4) pubblicazione
let url = "https://scheda-shara-push.ESEMPIO.workers.dev";
if (!dry) {
  const d = npx(["deploy"]);
  if (d.code !== 0) fail(4, d.out.slice(-600));
  const m = d.out.match(/https:\/\/scheda-shara-push\.[a-z0-9-]+\.workers\.dev/);
  if (!m) fail(4, "pubblicato, ma indirizzo non trovato nell'output:\n" + d.out.slice(-600));
  url = m[0];
}
console.log("4) servizio pubblicato:", url);

// 5) config.js dell'app
const cfgPath = join(here, "..", "config.js"), cfg = readFileSync(cfgPath, "utf8");
if (!/window\.SHARA_PUSH_URL = ".*";/.test(cfg) || !/window\.SHARA_VAPID_KEY = ".*";/.test(cfg)) fail(5, "righe SHARA_PUSH_URL / SHARA_VAPID_KEY non trovate in config.js");
const next = cfg.replace(/window\.SHARA_PUSH_URL = ".*";/, `window.SHARA_PUSH_URL = "${url}";`).replace(/window\.SHARA_VAPID_KEY = ".*";/, `window.SHARA_VAPID_KEY = "${pub}";`);
if (!dry) writeFileSync(cfgPath, next);
console.log("5) config.js aggiornato" + (dry ? " (saltato in prova)" : "") + ". Ora: cambiare VERSION in sw.js, commit e push.");
