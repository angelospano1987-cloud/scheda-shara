// Percorso completo del servizio con Cloudflare simulato: richiesta dell'app -> Durable Object -> allarme -> push.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { RestTimer } from "../push-worker/src/worker.js";
import { b64url } from "../push-worker/src/push.js";

async function setup() {
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const env = { ALLOWED_ORIGIN: "https://angelospano1987-cloud.github.io", VAPID_SUBJECT: "https://angelospano1987-cloud.github.io/scheda-shara/",
    VAPID_PUBLIC_KEY: b64url(await crypto.subtle.exportKey("raw", kp.publicKey)), VAPID_PRIVATE_JWK: JSON.stringify(await crypto.subtle.exportKey("jwk", kp.privateKey)) };
  const objects = new Map();
  env.TIMERS = {
    idFromName: n => n,
    get: id => { if (!objects.has(id)) { const store = new Map(); let alarm = null;
      const ctx = { storage: { put: async (k, v) => store.set(k, v), get: async k => store.get(k), delete: async k => store.delete(k),
        setAlarm: async t => { alarm = t; }, deleteAlarm: async () => { alarm = null; }, get alarm() { return alarm; } } };
      objects.set(id, { obj: new RestTimer(ctx, env), ctx }); }
      const o = objects.get(id); return { fetch: (url, init) => o.obj.fetch(new Request(url, init)) }; },
  };
  return { env, objects };
}
const call = (env, path, body, origin = env.ALLOWED_ORIGIN) => worker.fetch(new Request("https://push.example" + path, { method: "POST", headers: { Origin: origin, "Content-Type": "text/plain" }, body: JSON.stringify(body) }), env);

test("programma, scade, manda la push con firma VAPID", async () => {
  const { env, objects } = await setup();
  const at = Date.now() + 90000, endpoint = "https://fcm.googleapis.com/fcm/send/abc123";
  const r = await call(env, "/schedule", { id: "device_0001", sub: { endpoint }, at });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), env.ALLOWED_ORIGIN);
  const o = objects.get("device_0001");
  assert.equal(o.ctx.storage.alarm, at, "allarme impostato all'orario richiesto");
  const sent = []; const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => { sent.push({ url, init }); return new Response(null, { status: 201 }); };
  try { await o.obj.alarm(); } finally { globalThis.fetch = realFetch; }
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, endpoint);
  assert.match(sent[0].init.headers.Authorization, /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=[\w-]+$/);
  assert.equal(await o.ctx.storage.get("job"), undefined, "lavoro consumato");
});

test("annullato prima della scadenza: nessuna push", async () => {
  const { env, objects } = await setup();
  await call(env, "/schedule", { id: "device_0002", sub: { endpoint: "https://web.push.apple.com/x" }, at: Date.now() + 60000 });
  assert.equal((await call(env, "/cancel", { id: "device_0002" })).status, 200);
  const o = objects.get("device_0002");
  assert.equal(o.ctx.storage.alarm, null);
  let n = 0; const realFetch = globalThis.fetch; globalThis.fetch = async () => { n++; return new Response(null, { status: 201 }); };
  try { await o.obj.alarm(); } finally { globalThis.fetch = realFetch; }
  assert.equal(n, 0);
});

test("richieste non ammesse", async () => {
  const { env } = await setup();
  assert.equal((await call(env, "/schedule", { id: "device_0003", sub: { endpoint: "https://fcm.googleapis.com/x" }, at: Date.now() + 60000 }, "https://evil.example")).status, 403, "altra origine");
  assert.equal((await call(env, "/schedule", { id: "device_0003", sub: { endpoint: "https://169.254.169.254/" }, at: Date.now() + 60000 })).status, 400, "endpoint interno");
  assert.equal((await call(env, "/schedule", { id: "device_0003", sub: { endpoint: "https://fcm.googleapis.com/x" }, at: Date.now() + 3600e3 })).status, 400, "troppo in là");
  assert.equal((await worker.fetch(new Request("https://push.example/altro", { method: "GET" }), env)).status, 404);
  const big = await worker.fetch(new Request("https://push.example/schedule", { method: "POST", headers: { Origin: env.ALLOWED_ORIGIN }, body: "x".repeat(5000) }), env);
  assert.equal(big.status, 413);
});
