Scheda SHARA
============

Web app statica (PWA) della scheda di allenamento: video YouTube incorporati, registro di pesi e ripetizioni,
carico suggerito, record personali, diario, peso e misure, modifica della scheda con archivio delle versioni,
timer di recupero. Sincronizzazione fra dispositivi via Dropbox (cartella dell'app, file `pesi.json`).

Fonte della scheda: `Dropbox\PROGETTI CLAUDE\SHARA\SCHEDA ALLENAMENTO.docx`.

File
----
- `core.js`: logica pura (scheda di partenza, unione dati, suggerimenti, record, settimana). Coperta dai test.
- `app.js`: interfaccia. `sw.js`: cache offline e notifiche. `config.js`: chiavi pubbliche (Dropbox, notifica).
- `push-worker/`: servizio Cloudflare per la notifica di fine recupero a schermo bloccato.
- `tests/`: `node --test "tests/*.test.mjs"` (girano anche su GitHub a ogni push).
- `tools/estrai_scheda_word.py`: rigenera `tests/scheda-word.json` dal Word; il test dice se l'app non coincide più.

Prova in locale: `python -m http.server 8765` in questa cartella, poi http://localhost:8765 (da file:// i video non partono).
A ogni rilascio: cambiare `VERSION` in `sw.js`.

Notifica di fine recupero (una volta sola)
-------------------------------------------
Serve un account Cloudflare (piano gratuito). Dalla cartella `push-worker/`:
1. `npx wrangler@4.140.0 login` (si apre il browser: accesso e consenso)
2. `node attiva.mjs`: genera la coppia di chiavi VAPID, carica la privata come segreto (mai su disco), pubblica il servizio
   e scrive indirizzo e chiave pubblica in `config.js`. `node attiva.mjs --prova` fa tutto tranne segreto e pubblicazione.
3. cambiare `VERSION` in `sw.js`, commit e push.
