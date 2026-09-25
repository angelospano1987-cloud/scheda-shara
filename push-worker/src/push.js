/* Logica pura del servizio di notifica: firma VAPID (RFC 8292) e validazione delle richieste.
   Nessun accesso alla rete: la usa worker.js e la provano i test in Node (tests/push.test.mjs). */

export const MAX_DELAY_MS = 15 * 60 * 1000;   // un recupero non dura piu' di 15 minuti
export const MAX_BODY_BYTES = 4096;
/* Solo i servizi di notifica veri: il servizio non deve poter essere usato per chiamare indirizzi arbitrari. */
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^push\.services\.mozilla\.com$/,
  /^([a-z0-9-]+\.)*push\.apple\.com$/, /^([a-z0-9-]+\.)*notify\.windows\.com$/];

export const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export const unb64url = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const enc = new TextEncoder();

export function pushHostAllowed(endpoint) {
  let u; try { u = new URL(endpoint); } catch { return false; }
  return u.protocol === "https:" && !u.username && !u.password && (u.port === "" || u.port === "443") && PUSH_HOSTS.some(r => r.test(u.hostname));
}

/* Richiesta di programmazione: {id, sub:{endpoint}, at}. Restituisce {ok:true, value} oppure {ok:false, error}. */
export function validateSchedule(body, now) {
  if (!body || typeof body !== "object") return { ok: false, error: "corpo mancante" };
  const { id, sub, at } = body;
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) return { ok: false, error: "id non valido" };
  if (!sub || typeof sub.endpoint !== "string" || sub.endpoint.length > 1024 || !pushHostAllowed(sub.endpoint)) return { ok: false, error: "endpoint non ammesso" };
  if (typeof at !== "number" || !isFinite(at) || at < now + 1000 || at > now + MAX_DELAY_MS) return { ok: false, error: "orario fuori intervallo" };
  return { ok: true, value: { id, endpoint: sub.endpoint, at: Math.round(at) } };
}
export function validateCancel(body) {
  return body && typeof body.id === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(body.id) ? { ok: true, value: { id: body.id } } : { ok: false, error: "id non valido" };
}

export async function importVapidKey(privateJwk) {
  const jwk = typeof privateJwk === "string" ? JSON.parse(privateJwk) : privateJwk;
  if (!jwk || jwk.kty !== "EC" || jwk.crv !== "P-256" || !jwk.d) throw new Error("chiave VAPID privata non valida");
  return crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y, d: jwk.d, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

/* Intestazioni per una notifica senza contenuto (nessuna cifratura necessaria): il testo lo mette il service worker. */
export async function vapidHeaders(endpoint, key, publicKeyB64, subject, nowMs) {
  const aud = new URL(endpoint).origin;
  const header = b64url(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64url(enc.encode(JSON.stringify({ aud, exp: Math.floor(nowMs / 1000) + 12 * 3600, sub: subject })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(header + "." + claims));
  return { Authorization: `vapid t=${header}.${claims}.${b64url(sig)}, k=${publicKeyB64}`, TTL: "60", Urgency: "high", "Content-Length": "0" };
}
