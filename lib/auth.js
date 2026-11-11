"use strict";
// Anmeldung mit Google: prüft das Anmelde-Token bei Google und gleicht die E-Mail mit der Freigabeliste ab.
// Client-ID und Freigabeliste kommen aus der Umgebung (Vercel), nie aus dem Code.

function allowedEmails() {
  return String(process.env.ALLOWED_EMAILS || "")
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function bearer(req) {
  const h = (req.headers && (req.headers.authorization || req.headers.Authorization)) || "";
  const m = /^Bearer\s+([A-Za-z0-9._-]{20,4096})$/.exec(String(h));
  return m ? m[1] : "";
}

// Liest die Angaben aus dem Token, ohne ihnen zu trauen (die Echtheit prüft Google danach)
function peek(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const c = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    return c && typeof c === "object" ? c : null;
  } catch (e) {
    return null;
  }
}

// Ergebnis: {status:"ok", email} | {status:"none"} | {status:"invalid"} | {status:"forbidden", email} | {status:"unconfigured"}
async function checkUser(req, fetchImpl) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const allowed = allowedEmails();
  if (!clientId || !allowed.length) return { status: "unconfigured" };
  const token = bearer(req);
  if (!token) return { status: "none" };
  // Erst lokal aussortieren, was offensichtlich nicht passt: spart den Abruf bei Google
  const claims = peek(token);
  if (!claims || claims.aud !== clientId || !(Number(claims.exp) * 1000 > Date.now())) return { status: "invalid" };
  let info;
  try {
    const r = await (fetchImpl || fetch)("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token), { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return { status: "invalid" };
    info = await r.json();
  } catch (e) {
    return { status: "invalid" };
  }
  if (!info || typeof info !== "object") return { status: "invalid" };
  const issOk = info.iss === "accounts.google.com" || info.iss === "https://accounts.google.com";
  const fresh = Number(info.exp) * 1000 > Date.now();
  const verified = info.email_verified === true || info.email_verified === "true";
  if (info.aud !== clientId || !issOk || !fresh || !verified || !info.email) return { status: "invalid" };
  const email = String(info.email).toLowerCase();
  if (!allowed.includes(email)) return { status: "forbidden", email };
  return { status: "ok", email };
}

module.exports = { checkUser, allowedEmails, bearer };
