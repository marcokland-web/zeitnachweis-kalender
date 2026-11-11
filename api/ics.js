"use strict";
// Liefert die geprüften Schichten als Kalenderdatei, die iPhone und Mac direkt zum Hinzufügen anbieten.
// Die Schichten stehen in der Adresse (Parameter d); die App selbst speichert nichts.

const { buildIcs, decodePayload } = require("../lib/ics");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ fehler: "method" });
  }
  let events;
  try {
    events = decodePayload(req.query && req.query.d);
  } catch (e) {
    return res.status(400).json({ fehler: "ungueltig" });
  }
  const month = events[0].date.slice(0, 7);
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="Arbeitszeiten-' + month + '.ics"');
  res.status(200).send(buildIcs(events));
};
