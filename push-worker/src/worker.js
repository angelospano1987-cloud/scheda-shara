/* Servizio di notifica di fine recupero per Scheda SHARA (Cloudflare Worker + Durable Object).
   L'app chiede "avvisami alle HH:MM:SS"; un Durable Object per dispositivo tiene un solo allarme e, allo scadere,
   manda una notifica push senza contenuto. Il testo lo mostra il service worker dell'app. */
import { MAX_BODY_BYTES, validateSchedule, validateCancel, importVapidKey, vapidHeaders } from "./push.js";

function cors(env) {
  return { "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
}
const json = (env, status, obj) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...cors(env) } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });
    if (request.method !== "POST" || !["/schedule", "/cancel"].includes(url.pathname)) return json(env, 404, { error: "non trovato" });
    if (request.headers.get("Origin") !== env.ALLOWED_ORIGIN) return json(env, 403, { error: "origine non ammessa" });
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json(env, 413, { error: "richiesta troppo grande" });
    let body; try { body = JSON.parse(text); } catch { return json(env, 400, { error: "JSON non valido" }); }
    const v = url.pathname === "/schedule" ? validateSchedule(body, Date.now()) : validateCancel(body);
    if (!v.ok) return json(env, 400, { error: v.error });
    const stub = env.TIMERS.get(env.TIMERS.idFromName(v.value.id));
    const r = await stub.fetch("https://timer" + url.pathname, { method: "POST", body: JSON.stringify(v.value) });
    return json(env, r.status, await r.json());
  },
};

export class RestTimer {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }

  async fetch(request) {
    const path = new URL(request.url).pathname, v = await request.json();
    if (path === "/schedule") {
      await this.ctx.storage.put("job", { endpoint: v.endpoint, at: v.at });
      await this.ctx.storage.setAlarm(v.at);
      return Response.json({ ok: true, at: v.at });
    }
    await this.ctx.storage.delete("job");
    await this.ctx.storage.deleteAlarm();
    return Response.json({ ok: true });
  }

  async alarm() {
    const job = await this.ctx.storage.get("job");
    await this.ctx.storage.delete("job");
    if (!job) return;
    const key = await importVapidKey(this.env.VAPID_PRIVATE_JWK);
    const headers = await vapidHeaders(job.endpoint, key, this.env.VAPID_PUBLIC_KEY, this.env.VAPID_SUBJECT, Date.now());
    const r = await fetch(job.endpoint, { method: "POST", headers });
    // 404/410: iscrizione scaduta sul telefono; l'app ne crea una nuova al prossimo avvio. Altri errori finiscono nei log.
    if (!r.ok && r.status !== 404 && r.status !== 410) console.error(JSON.stringify({ level: "WARNING", msg: "push rifiutata", status: r.status, host: new URL(job.endpoint).hostname }));
  }
}
