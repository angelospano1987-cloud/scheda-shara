// Test del servizio di notifica: firma VAPID verificabile con la chiave pubblica, e richieste non ammesse rifiutate.
import { test } from "node:test";
import assert from "node:assert/strict";
import { b64url, unb64url, pushHostAllowed, validateSchedule, validateCancel, importVapidKey, vapidHeaders, MAX_DELAY_MS } from "../push-worker/src/push.js";

const NOW = Date.UTC(2026, 8, 25, 18, 0, 0);
const dec = s => JSON.parse(new TextDecoder().decode(unb64url(s)));

test("firma VAPID: intestazioni corrette e firma valida con la chiave pubblica", async () => {
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const pub = b64url(await crypto.subtle.exportKey("raw", kp.publicKey));
  const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  const key = await importVapidKey(JSON.stringify(jwk));
  const ep = "https://web.push.apple.com/QGuQyavXutnMH_abc";
  const h = await vapidHeaders(ep, key, pub, "https://angelospano1987-cloud.github.io/scheda-shara/", NOW);
  const m = h.Authorization.match(/^vapid t=([\w-]+)\.([\w-]+)\.([\w-]+), k=([\w-]+)$/);
  assert.ok(m, "formato Authorization: " + h.Authorization.slice(0, 40));
  assert.deepEqual(dec(m[1]), { typ: "JWT", alg: "ES256" });
  const claims = dec(m[2]);
  assert.equal(claims.aud, "https://web.push.apple.com");
  assert.ok(claims.exp > NOW / 1000 && claims.exp <= NOW / 1000 + 24 * 3600, "scadenza entro 24 ore (RFC 8292)");
  assert.equal(m[4], pub);
  assert.equal(unb64url(m[3]).length, 64, "firma ES256 grezza r||s");
  const verify = async (data) => crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, kp.publicKey, unb64url(m[3]), new TextEncoder().encode(data));
  assert.ok(await verify(m[1] + "." + m[2]), "la firma si verifica");
  assert.ok(!(await verify(m[1] + "." + m[2] + "x")), "un dato alterato non si verifica");
  assert.equal(h.TTL, "60");
});

test("chiave privata non valida: errore esplicito", async () => {
  await assert.rejects(importVapidKey("{}"), /non valida/);
  await assert.rejects(importVapidKey({ kty: "RSA" }), /non valida/);
});

test("solo servizi di notifica veri", () => {
  for (const ok of ["https://fcm.googleapis.com/fcm/send/abc", "https://web.push.apple.com/abc", "https://updates.push.services.mozilla.com/wpush/v2/abc", "https://wns2-par02p.notify.windows.com/w/?token=abc"])
    assert.ok(pushHostAllowed(ok), ok);
  for (const ko of ["http://fcm.googleapis.com/fcm/send/abc", "https://169.254.169.254/latest", "https://example.com/push", "https://fcm.googleapis.com.evil.com/x",
    "https://user:pw@fcm.googleapis.com/x", "https://fcm.googleapis.com:8443/x", "notaurl", "https://evilpush.apple.com.example.org/"])
    assert.ok(!pushHostAllowed(ko), "da rifiutare: " + ko);
});

test("programmazione: orario, id ed endpoint validati", () => {
  const sub = { endpoint: "https://fcm.googleapis.com/fcm/send/abc" };
  const ok = validateSchedule({ id: "dev_12345678", sub, at: NOW + 90000 }, NOW);
  assert.deepEqual(ok, { ok: true, value: { id: "dev_12345678", endpoint: sub.endpoint, at: NOW + 90000 } });
  assert.equal(validateSchedule({ id: "dev_12345678", sub, at: NOW - 1 }, NOW).ok, false, "nel passato");
  assert.equal(validateSchedule({ id: "dev_12345678", sub, at: NOW + MAX_DELAY_MS + 1 }, NOW).ok, false, "oltre 15 minuti");
  assert.equal(validateSchedule({ id: "corto", sub, at: NOW + 90000 }, NOW).ok, false, "id troppo corto");
  assert.equal(validateSchedule({ id: "dev_12345678", sub: { endpoint: "https://example.com/x" }, at: NOW + 90000 }, NOW).ok, false, "endpoint estraneo");
  assert.equal(validateSchedule(null, NOW).ok, false);
  assert.equal(validateCancel({ id: "dev_12345678" }).ok, true);
  assert.equal(validateCancel({ id: "../../x" }).ok, false);
});
