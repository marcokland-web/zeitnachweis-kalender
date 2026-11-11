"use strict";
// Prüft und ordnet, was die Bilderkennung zurückgibt. Was nicht eindeutig Datum und Uhrzeit ist, fliegt raus.

const { validDate, clean, RE_TIME } = require("./ics");

function padTime(t) {
  const s = String(t == null ? "" : t).trim().replace(".", ":");
  return /^\d:\d{2}$/.test(s) ? "0" + s : s;
}

function normalize(data) {
  const list = data && Array.isArray(data.eintraege) ? data.eintraege : [];
  const seen = new Set();
  const out = [];
  for (const e of list) {
    if (!e || typeof e !== "object") continue;
    const date = String(e.datum || "");
    const von = padTime(e.von);
    const bis = padTime(e.bis);
    if (!validDate(date) || !RE_TIME.test(von) || !RE_TIME.test(bis) || von === bis) continue;
    const key = date + von + bis;
    if (seen.has(key)) continue;
    seen.add(key);
    // Nur bekannte Arten durchlassen, damit kein freier Text aus dem Foto im Kalender landet
    const m = /^(Anwesenheitszeit|Lernzeit)/i.exec(clean(e.art));
    const art = m ? (/^l/i.test(m[1]) ? "Lernzeit" : "Anwesenheitszeit") : "";
    out.push({ datum: date, von, bis, art, unsicher: e.unsicher === true });
    if (out.length >= 120) break;
  }
  out.sort((a, b) => (a.datum + a.von).localeCompare(b.datum + b.von));
  return out;
}

module.exports = { normalize };
