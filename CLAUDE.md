# Zeitnachweis

App des Familien-App-Studios. Es gelten die Studio-Standards und das Designsystem aus DasTeam (`studio/regeln/`).

- Kein Build-Schritt: `public/` wird direkt ausgeliefert, `api/` sind Vercel-Funktionen (CommonJS, Node 22).
- Tests: `npm test`. Lokal starten: `npm run dev` (Port 4317, anderer Port als Argument).
- Texte immer in Deutsch und Englisch im Wörterbuch `S` in `public/app.js`.
- Farben nur über die Tokens in `public/style.css`; neue Klassen auf ihren Bereich begrenzen.
- Keine persönlichen Daten und keine Schlüssel im Code: Client-ID, Freigabeliste und Gemini-Schlüssel kommen aus Umgebungsvariablen.
- Bei jeder Auslieferung `BUILD` (`public/app.js`) und `CACHE` (`public/sw.js`) hochzählen; ändert sich ein Icon, `?v=` an allen Icon-Adressen erhöhen.
