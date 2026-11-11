"use strict";
// Baut aus geprüften Schichten eine Kalenderdatei (.ics) und liest die kompakte Übergabe aus der Adresse.

const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const RE_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_EVENTS = 120;
const MAX_TEXT = 120;

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
function dt(date, time) {
  return date.replace(/-/g, "") + "T" + time.replace(":", "") + "00";
}
function nextDay(date) {
  const p = date.split("-").map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2] + 1)).toISOString().slice(0, 10);
}
function endDate(ev) {
  return ev.bis > ev.von ? ev.date : nextDay(ev.date);
}
function validDate(date) {
  if (!RE_DATE.test(date)) return false;
  const p = date.split("-").map(Number);
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return d.getUTCFullYear() === p[0] && d.getUTCMonth() === p[1] - 1 && d.getUTCDate() === p[2];
}
function clean(text) {
  return String(text == null ? "" : text).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, MAX_TEXT);
}

// Lange Zeilen nach 75 Bytes umbrechen (RFC 5545)
function fold(line) {
  const enc = Buffer.from(line, "utf8");
  if (enc.length <= 75) return line;
  const out = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch, "utf8");
    const limit = out.length ? 74 : 75;
    if (bytes + b > limit) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}

function buildIcs(events, now) {
  const stamp = (now || new Date()).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const L = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Familien-App-Studio//Zeitnachweis//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE", "TZID:Europe/Berlin",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
    "END:VTIMEZONE",
  ];
  for (const ev of events) {
    L.push(
      "BEGIN:VEVENT",
      "UID:zeitnachweis-" + ev.date + "-" + ev.von.replace(":", "") + "-" + ev.bis.replace(":", "") + "@zeitnachweis-kalender",
      "DTSTAMP:" + stamp,
      "DTSTART;TZID=Europe/Berlin:" + dt(ev.date, ev.von),
      "DTEND;TZID=Europe/Berlin:" + dt(endDate(ev), ev.bis),
      "SUMMARY:" + esc(ev.title)
    );
    if (ev.loc) L.push("LOCATION:" + esc(ev.loc));
    L.push("END:VEVENT");
  }
  L.push("END:VCALENDAR");
  return L.map(fold).join("\r\n") + "\r\n";
}

// Übergabe: base64url von {"s":["Titel","Ort",...],"e":[["2026-12-01","16:00","20:05",0,1],...]}
function decodePayload(d) {
  if (typeof d !== "string" || !d || d.length > 12000) throw new Error("payload");
  const json = Buffer.from(d.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  const p = JSON.parse(json);
  if (!p || !Array.isArray(p.s) || !Array.isArray(p.e)) throw new Error("payload");
  if (!p.e.length || p.e.length > MAX_EVENTS) throw new Error("count");
  const strings = p.s.map(clean);
  return p.e.map((e) => {
    if (!Array.isArray(e)) throw new Error("event");
    const isIndex = (i) => Number.isInteger(i) && i >= 0 && i < strings.length;
    if (!isIndex(e[3]) || (e[4] != null && !isIndex(e[4]))) throw new Error("event");
    const ev = { date: String(e[0]), von: String(e[1]), bis: String(e[2]), title: strings[e[3]], loc: e[4] == null ? "" : strings[e[4]] };
    if (!validDate(ev.date) || !RE_TIME.test(ev.von) || !RE_TIME.test(ev.bis) || !ev.title) throw new Error("event");
    return ev;
  });
}

module.exports = { buildIcs, decodePayload, endDate, validDate, clean, RE_TIME };
