// Kleiner Server zum Ausprobieren und für die Freigabe-Prüfung: liefert public/ aus und ruft die Funktionen in api/ auf.
// Aufruf: node tools/dev-server.js [port]
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2] || process.env.PORT || 4317);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json", ".json": "application/json" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const file = path.join(ROOT, "api", path.basename(url.pathname) + ".js");
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    let raw = "";
    for await (const chunk of req) raw += chunk;
    req.query = Object.fromEntries(url.searchParams);
    try { req.body = raw ? JSON.parse(raw) : undefined; } catch (e) { req.body = undefined; }
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(obj)); };
    res.send = (text) => res.end(text);
    try { await require(file)(req, res); } catch (e) { console.error(e); res.statusCode = 500; res.end(); }
    return;
  }
  let p = path.normalize(path.join(ROOT, "public", decodeURIComponent(url.pathname)));
  if (!p.startsWith(path.join(ROOT, "public"))) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end("Nicht gefunden"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log("Zeitnachweis läuft auf http://localhost:" + PORT));
