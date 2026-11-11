"use strict";
// Liest die Arbeitszeiten aus einem Foto des Zeitnachweises (Google Gemini).
// Nur für angemeldete, freigeschaltete Konten. Der Gemini-Schlüssel bleibt auf dem Server.

const { checkUser } = require("../lib/auth");
const { normalize } = require("../lib/eintraege");

const MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_B64 = 4 * 1024 * 1024; // unter der Vercel-Grenze von 4,5 MB je Anfrage

const PROMPT = [
  "Auf dem Bild ist ein deutscher „Zeitnachweis“ (Arbeitszeitnachweis), als Ausdruck oder vom Bildschirm abfotografiert.",
  "Lies die Tabelle mit den Spalten Tag, An-/Abwesenheitsart, von, bis.",
  "Regeln:",
  "- Der Zeitraum steht oben rechts („von: TT.MM.JJJJ bis: TT.MM.JJJJ“). Daraus ergeben sich Monat und Jahr.",
  "- In der Spalte Tag steht Tageszahl und Wochentag, z. B. „08 Fr“. Eine Zeile ohne Tagesangabe gehört zum Tag der Zeile darüber.",
  "- Gib jede Zeile aus, die sowohl in „von“ als auch in „bis“ eine Uhrzeit hat (z. B. „Anwesenheitszeit (Plan)“, „Anwesenheitszeit (final)“, „Lernzeit (final)“).",
  "- Lass Zeilen ohne Uhrzeiten weg: freie Tage, „Wochensummation“, Feiertage, Summenübersicht.",
  "- Nimm nur die Spalten von und bis. Die Zahlen aus Anw., Pause, Istzt usw. sind keine Uhrzeiten.",
  "- Gib keine Namen, Personalnummern oder andere Angaben zur Person aus.",
  "- Rate nicht. Wenn eine Ziffer nicht sicher lesbar ist, gib die wahrscheinlichste Lesart aus und setze \"unsicher\": true.",
  "Antworte nur mit einem JSON-Objekt in genau dieser Form:",
  "{\"eintraege\":[{\"datum\":\"2026-12-01\",\"art\":\"Anwesenheitszeit (final)\",\"von\":\"16:00\",\"bis\":\"20:05\",\"unsicher\":false}]}",
  "Wenn das Bild kein Zeitnachweis ist oder nichts lesbar ist: {\"eintraege\":[]}",
].join("\n");

function parseJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) {} }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ fehler: "method" });
  }
  const key = process.env.GEMINI_API_KEY || "";
  const user = await checkUser(req);
  if (user.status === "unconfigured" || !key) return res.status(503).json({ fehler: "nicht_eingerichtet" });
  if (user.status === "none" || user.status === "invalid") return res.status(401).json({ fehler: "anmelden" });
  if (user.status !== "ok") return res.status(403).json({ fehler: "nicht_freigeschaltet" });

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const mime = String(body.mime || "");
  const bild = typeof body.bild === "string" ? body.bild : "";
  if (!MIME.includes(mime) || !bild || !/^[A-Za-z0-9+/]+=*$/.test(bild.slice(0, 2000))) return res.status(400).json({ fehler: "bild" });
  if (bild.length > MAX_B64) return res.status(413).json({ fehler: "zu_gross" });

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  let r;
  try {
    r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ inline_data: { mime_type: mime, data: bild } }, { text: PROMPT }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(50000),
    });
  } catch (e) {
    return res.status(502).json({ fehler: "dienst" });
  }
  if (r.status === 429) return res.status(429).json({ fehler: "limit" });
  if (!r.ok) {
    // Nur den Status festhalten, nie Schlüssel oder Bildinhalt
    console.error("Gemini antwortet mit Status", r.status);
    return res.status(502).json({ fehler: "dienst" });
  }
  let data;
  try { data = await r.json(); } catch (e) { return res.status(502).json({ fehler: "dienst" }); }
  const parts = ((((data || {}).candidates || [])[0] || {}).content || {}).parts || [];
  const text = parts.map((p) => (p && typeof p.text === "string" ? p.text : "")).join("");
  const parsed = parseJson(text);
  if (!parsed) return res.status(502).json({ fehler: "antwort" });
  res.status(200).json({ eintraege: normalize(parsed) });
};
