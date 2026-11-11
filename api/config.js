"use strict";
// Öffentliche Einstellungen der App und, wenn ein Anmelde-Token mitkommt, ob das Konto freigeschaltet ist.

const { checkUser, allowedEmails } = require("../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const loginReady = !!clientId && allowedEmails().length > 0;
  const body = {
    googleClientId: loginReady ? clientId : "",
    erkennung: loginReady && !!process.env.GEMINI_API_KEY,
  };
  if (loginReady) {
    const user = await checkUser(req);
    if (user.status === "ok") body.konto = { email: user.email, erlaubt: true };
    else if (user.status === "forbidden") body.konto = { email: user.email, erlaubt: false };
    else if (user.status === "invalid") body.konto = null;
  }
  res.status(200).json(body);
};
