const test = require("node:test");
const assert = require("node:assert");
const { buildIcs, decodePayload, endDate, validDate } = require("../lib/ics");
const { normalize } = require("../lib/eintraege");
const { checkUser, allowedEmails, bearer } = require("../lib/auth");

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

test("Kalenderdatei: Zeiten, Titel, Ort und feste Kennung", () => {
  const ics = buildIcs([{ date: "2026-12-01", von: "16:00", bis: "20:05", title: "Arbeit; dm, Markt", loc: "Musterstraße 1" }], new Date("2026-11-11T20:00:00Z"));
  assert.match(ics, /DTSTART;TZID=Europe\/Berlin:20261201T160000\r\n/);
  assert.match(ics, /DTEND;TZID=Europe\/Berlin:20261201T200500\r\n/);
  assert.ok(ics.includes("SUMMARY:Arbeit\\; dm\\, Markt\r\n"));
  assert.match(ics, /LOCATION:Musterstraße 1\r\n/);
  assert.match(ics, /UID:zeitnachweis-2026-12-01-1600-2005@zeitnachweis-kalender\r\n/);
  assert.match(ics, /DTSTAMP:20261111T200000Z\r\n/);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
});

test("Kalenderdatei: Schicht über Mitternacht endet am Folgetag, auch am Monatsende", () => {
  assert.strictEqual(endDate({ date: "2026-12-31", von: "22:00", bis: "06:00" }), "2027-01-01");
  assert.strictEqual(endDate({ date: "2026-12-01", von: "08:00", bis: "12:00" }), "2026-12-01");
});

test("Kalenderdatei: lange Zeilen werden umbrochen", () => {
  const ics = buildIcs([{ date: "2026-12-01", von: "08:00", bis: "12:00", title: "ä".repeat(100), loc: "" }]);
  for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75, line);
});

test("Übergabe: gültige Daten werden gelesen", () => {
  const ev = decodePayload(b64({ s: ["Arbeit dm", "Markt", "Lernzeit"], e: [["2026-12-01", "14:00", "16:00", 2, 1], ["2026-12-01", "16:00", "20:05", 0, null]] }));
  assert.deepStrictEqual(ev[0], { date: "2026-12-01", von: "14:00", bis: "16:00", title: "Lernzeit", loc: "Markt" });
  assert.strictEqual(ev[1].loc, "");
});

test("Übergabe: Unsinn wird abgelehnt", () => {
  assert.throws(() => decodePayload(""));
  assert.throws(() => decodePayload("%%%"));
  assert.throws(() => decodePayload(b64({ s: ["A"], e: [] })));
  assert.throws(() => decodePayload(b64({ s: ["A"], e: [["2026-02-30", "08:00", "12:00", 0, null]] })));
  assert.throws(() => decodePayload(b64({ s: ["A"], e: [["2026-12-01", "25:00", "12:00", 0, null]] })));
  assert.throws(() => decodePayload(b64({ s: ["A"], e: [["2026-12-01", "08:00", "08:00", 0, null]] })));
  assert.throws(() => decodePayload(b64({ s: ["A\r\nBEGIN:VEVENT"], e: [["2026-12-01", "08:00", "12:00", 5, null]] })));
  assert.throws(() => decodePayload(b64({ s: ["A"], e: [["2026-12-01", "08:00", "12:00", "constructor", null]] })));
  assert.throws(() => decodePayload(b64({ s: ["A"], e: [["2026-12-01", "08:00", "12:00", 0, 7]] })));
  assert.throws(() => decodePayload(b64({ s: ["A"], e: new Array(121).fill(["2026-12-01", "08:00", "12:00", 0, null]) })));
});

test("Übergabe: Zeilenumbrüche im Titel können keine Termine einschleusen", () => {
  const ev = decodePayload(b64({ s: ["A\r\nBEGIN:VEVENT"], e: [["2026-12-01", "08:00", "12:00", 0, null]] }));
  assert.ok(!/\r|\n/.test(ev[0].title));
  assert.strictEqual(buildIcs(ev).split("\r\n").filter((l) => l === "BEGIN:VEVENT").length, 1);
});

test("Datum: nur echte Kalendertage", () => {
  assert.ok(validDate("2028-02-29"));
  assert.ok(!validDate("2026-02-29"));
  assert.ok(!validDate("2026-13-01"));
});

test("Erkennung: ordnet, entfernt Doppelte und Ungültiges", () => {
  const out = normalize({ eintraege: [
    { datum: "2026-12-08", art: "Anwesenheitszeit (Plan)", von: "16:00", bis: "20:05" },
    { datum: "2026-12-01", art: "Lernzeit (final)", von: "14:00", bis: "16:00", unsicher: true },
    { datum: "2026-12-01", art: "Lernzeit (final)", von: "14:00", bis: "16:00" },
    { datum: "2026-12-04", art: "Anwesenheitszeit (Plan)", von: "8:00", bis: "12:00" },
    { datum: "2026-12-05", art: "x", von: "4,08", bis: "0,25" },
    { datum: "2026-12-09", art: "<img src=x> Max Muster", von: "08:00", bis: "12:00" },
    { datum: "05.12.2026", art: "x", von: "08:00", bis: "12:00" },
    null, "x",
  ] });
  assert.deepStrictEqual(out.map((e) => e.datum + " " + e.von + "-" + e.bis), ["2026-12-01 14:00-16:00", "2026-12-04 08:00-12:00", "2026-12-08 16:00-20:05", "2026-12-09 08:00-12:00"]);
  assert.strictEqual(out[3].art, "");
  assert.strictEqual(out[1].art, "Anwesenheitszeit");
  assert.strictEqual(out[0].art, "Lernzeit");
  assert.strictEqual(out[0].unsicher, true);
  assert.deepStrictEqual(normalize(null), []);
});

test("Anmeldung: Freigabeliste und Token-Prüfung", async () => {
  process.env.GOOGLE_CLIENT_ID = "client-1";
  process.env.ALLOWED_EMAILS = "Eins@Example.com, zwei@example.com";
  assert.deepStrictEqual(allowedEmails(), ["eins@example.com", "zwei@example.com"]);
  const good = { aud: "client-1", iss: "https://accounts.google.com", exp: String(Math.floor(Date.now() / 1000) + 600), email_verified: "true", email: "EINS@example.com" };
  const jwt = (claims) => "x".repeat(10) + "." + Buffer.from(JSON.stringify(claims)).toString("base64url") + "." + "y".repeat(20);
  const req = { headers: { authorization: "Bearer " + jwt(good) } };
  const fake = (info, ok = true) => async () => ({ ok, json: async () => info });
  assert.deepStrictEqual(await checkUser(req, fake(good)), { status: "ok", email: "eins@example.com" });
  assert.strictEqual((await checkUser(req, fake({ ...good, email: "fremd@example.com" }))).status, "forbidden");
  assert.strictEqual((await checkUser(req, fake({ ...good, aud: "anderer-client" }))).status, "invalid");
  assert.strictEqual((await checkUser(req, fake({ ...good, exp: "1" }))).status, "invalid");
  assert.strictEqual((await checkUser(req, fake({ ...good, email_verified: "false" }))).status, "invalid");
  assert.strictEqual((await checkUser(req, fake(good, false))).status, "invalid");
  assert.strictEqual((await checkUser(req, fake(null))).status, "invalid");
  // Offensichtlich falsche Tokens lösen keinen Abruf bei Google aus
  let calls = 0;
  const counting = async () => { calls++; return { ok: true, json: async () => good }; };
  assert.strictEqual((await checkUser({ headers: { authorization: "Bearer " + "a".repeat(40) } }, counting)).status, "invalid");
  assert.strictEqual((await checkUser({ headers: { authorization: "Bearer " + jwt({ ...good, aud: "fremd" }) } }, counting)).status, "invalid");
  assert.strictEqual((await checkUser({ headers: { authorization: "Bearer " + jwt({ ...good, exp: "1" }) } }, counting)).status, "invalid");
  assert.strictEqual(calls, 0);
  assert.strictEqual((await checkUser({ headers: {} }, fake(good))).status, "none");
  assert.strictEqual(bearer({ headers: { authorization: "Basic abc" } }), "");
  delete process.env.ALLOWED_EMAILS;
  assert.strictEqual((await checkUser(req, fake(good))).status, "unconfigured");
  delete process.env.GOOGLE_CLIENT_ID;
});
