(function () {
  "use strict";
  var BUILD = "2026-11-11.1";
  var SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.calendarlist.readonly"];
  var $ = function (id) { return document.getElementById(id); };

  // ---------- Ablage pro Gerät ----------
  var store = {
    raw: function (k, fallback) { try { var v = localStorage.getItem(k); return v === null ? fallback : v; } catch (e) { return fallback; } },
    setRaw: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    get: function (k, fallback) { try { var v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  // ---------- Texte (Deutsch, Englisch) ----------
  var S = {
    appName: ["Zeitnachweis", "Zeitnachweis"],
    appLong: ["Arbeitszeiten vom Zeitnachweis in den Kalender", "Work hours from your time sheet into your calendar"],
    studio: ["Teil des Familien-App-Studios", "Part of the Familien-App-Studio"],
    settings: ["Einstellungen", "Settings"],
    done: ["Fertig", "Done"],
    close: ["Schließen", "Close"],
    undo: ["Rückgängig", "Undo"],
    appearance: ["Darstellung", "Appearance"],
    themeAuto: ["Automatisch", "Automatic"],
    themeLight: ["Hell", "Light"],
    themeDark: ["Dunkel", "Dark"],
    language: ["Sprache", "Language"],
    events: ["Termine", "Events"],
    defTitle: ["Standardtext", "Default title"],
    defLoc: ["Arbeitsort", "Workplace"],
    defFoot: ["Gilt für alle Schichten, bei denen du Titel oder Ort nicht einzeln überschrieben hast. Lernzeit heißt im Kalender „Lernzeit“.", "Applies to every shift where you have not changed title or place. Learning time is called “Lernzeit” in the calendar."],
    account: ["Konto", "Account"],
    signedInWith: ["Angemeldet mit Google", "Signed in with Google"],
    signOut: ["Abmelden", "Sign out"],
    signOutAsk: ["Abmelden? Schichten, Standardtext, Arbeitsort und Standardkalender werden auf diesem Gerät gelöscht.", "Sign out? Shifts, default title, workplace and default calendar will be removed from this device."],
    about: ["Über", "About"],
    update: ["Aktualisieren", "Update"],
    version: ["Version {v}", "Version {v}"],
    gateTitle: ["Anmelden", "Sign in"],
    gateText: ["Melde dich mit deinem Google-Konto an. Nur freigeschaltete Konten kommen hinein.", "Sign in with your Google account. Only approved accounts can enter."],
    gateDenied: ["Das Konto {email} ist nicht freigeschaltet. Nimm ein anderes Google-Konto.", "The account {email} is not approved. Use a different Google account."],
    gateFailed: ["Die Anmeldung hat nicht geklappt. Versuch es noch einmal.", "Sign-in did not work. Please try again."],
    gateNoScript: ["Die Google-Anmeldung lässt sich nicht laden. Prüfe deine Verbindung und lade die Seite neu.", "Google sign-in could not be loaded. Check your connection and reload the page."],
    setupLogin: ["Die Google-Anmeldung ist noch nicht eingerichtet. Bis dahin sind Foto-Erkennung und Google Kalender aus. Schichten von Hand eintragen und als Kalenderdatei öffnen geht schon.", "Google sign-in is not set up yet. Until then photo recognition and Google Calendar are off. Adding shifts by hand and opening them as a calendar file already works."],
    setupKey: ["Die Foto-Erkennung ist noch nicht eingerichtet (der Gemini-Schlüssel fehlt). Schichten von Hand eintragen geht schon.", "Photo recognition is not set up yet (the Gemini key is missing). Adding shifts by hand already works."],
    setupOffline: ["Der Server ist gerade nicht erreichbar. Foto-Erkennung und Google Kalender gehen erst wieder mit Verbindung.", "The server cannot be reached right now. Photo recognition and Google Calendar need a connection."],
    photoTitle: ["Foto", "Photo"],
    zoom: ["Vergrößern", "Enlarge"],
    pickPhoto: ["Foto auswählen oder aufnehmen", "Choose or take a photo"],
    otherPhoto: ["Anderes Foto wählen", "Choose another photo"],
    detect: ["Schichten erkennen", "Read shifts"],
    photoHint: ["Ausdruck oder Bildschirm, beides geht. Möglichst gerade und die ganze Tabelle im Bild. Zum Erkennen geht das Foto an Google (Gemini).", "A printout or a screen both work. Keep it straight with the whole table in view. For recognition the photo is sent to Google (Gemini)."],
    sendAsk: ["Das Foto wird zur Erkennung an Google (Gemini) geschickt. Name und Personalnummer sind darauf zu sehen. Einverstanden?", "The photo will be sent to Google (Gemini) for recognition. It shows your name and staff number. Do you agree?"],
    detecting: ["Lese die Arbeitszeiten aus dem Foto. Das dauert meist 10 bis 30 Sekunden.", "Reading the work hours from the photo. This usually takes 10 to 30 seconds."],
    detected: ["{n} erkannt. Vergleiche sie kurz mit dem Zeitnachweis.", "{n} found. Please compare them with your time sheet."],
    detectedUnsure: ["{n} davon schwer lesbar.", "{n} of them hard to read."],
    detectedNone: ["Auf dem Foto wurden keine Arbeitszeiten gefunden. Ist die ganze Tabelle scharf im Bild?", "No work hours were found in the photo. Is the whole table sharp and in view?"],
    errLogin: ["Deine Anmeldung ist abgelaufen. Melde dich neu an.", "Your sign-in has expired. Please sign in again."],
    errDenied: ["Dein Konto ist für die Erkennung nicht freigeschaltet.", "Your account is not approved for recognition."],
    errSetup: ["Die Foto-Erkennung ist noch nicht eingerichtet.", "Photo recognition is not set up yet."],
    errTooBig: ["Das Foto ist zu groß. Nimm bitte ein kleineres.", "The photo is too large. Please use a smaller one."],
    errImage: ["Das Foto konnte nicht gelesen werden. Nimm bitte ein JPG oder PNG.", "The photo could not be read. Please use a JPG or PNG."],
    errLimit: ["Das kostenlose Kontingent ist gerade ausgeschöpft. Versuch es in ein paar Minuten noch einmal.", "The free quota is used up right now. Try again in a few minutes."],
    errService: ["Die Erkennung hat nicht geantwortet. Tippe noch einmal auf „Schichten erkennen“.", "Recognition did not answer. Tap “Read shifts” again."],
    errOffline: ["Keine Verbindung. Prüfe dein Netz und versuch es noch einmal.", "No connection. Check your network and try again."],
    shiftsTitle: ["Schichten", "Shifts"],
    addRow: ["Schicht von Hand hinzufügen", "Add a shift by hand"],
    summaryNone: ["Noch keine Schichten. Wähle ein Foto oder trage eine Schicht von Hand ein.", "No shifts yet. Choose a photo or add a shift by hand."],
    summary: ["{sel} von {all} ausgewählt", "{sel} of {all} selected"],
    takeShift: ["Schicht übernehmen", "Include shift"],
    changeDate: ["Datum ändern", "Change date"],
    pickDate: ["Datum wählen", "Pick a date"],
    from: ["von", "from"],
    to: ["bis", "to"],
    title: ["Titel", "Title"],
    place: ["Ort", "Place"],
    deleteShift: ["Schicht löschen", "Delete shift"],
    deleted: ["Schicht gelöscht", "Shift deleted"],
    tagUnsure: ["schwer lesbar, bitte prüfen", "hard to read, please check"],
    tagInvalid: ["Datum oder Zeit fehlt", "date or time missing"],
    tagDone: ["eingetragen", "added"],
    tagExists: ["schon eingetragen", "already there"],
    tagFailed: ["abgelehnt", "rejected"],
    tagUnclear: ["unklar, im Kalender prüfen", "unclear, check your calendar"],
    exportTitle: ["Eintragen", "Add to calendar"],
    noPlace: ["kein Ort", "no place"],
    targetIcs: ["Apple Kalender", "Apple Calendar"],
    targetGoogle: ["Google Kalender", "Google Calendar"],
    hintIcs: ["Öffnet eine Kalenderdatei. Am iPhone tippst du auf „Alle hinzufügen“ und wählst den Kalender.", "Opens a calendar file. On iPhone tap “Add All” and choose the calendar."],
    hintGoogle: ["Trägt direkt in den gewählten Google Kalender ein.", "Adds the events straight to the chosen Google calendar."],
    hintGoogleOff: ["Google Kalender geht erst, wenn die Google-Anmeldung eingerichtet ist.", "Google Calendar works once Google sign-in is set up."],
    defaultCal: ["Standardkalender", "Default calendar"],
    loadCals: ["Kalender laden", "Load calendars"],
    calNone: ["Noch nicht geladen", "Not loaded yet"],
    calLoaded: ["Der gewählte Kalender wird als Standard gemerkt.", "The chosen calendar is remembered as your default."],
    calEmpty: ["Es wurde kein beschreibbarer Kalender gefunden.", "No writable calendar was found."],
    calFirst: ["Tippe zuerst auf „Kalender laden“ und wähle deinen Standardkalender.", "Tap “Load calendars” first and choose your default calendar."],
    goIcs: ["{n} als Kalenderdatei öffnen", "Open {n} as calendar file"],
    goGoogle: ["{n} in Google Kalender eintragen", "Add {n} to Google Calendar"],
    icsOpened: ["Kalenderdatei geöffnet. Tippe dort auf „Alle hinzufügen“.", "Calendar file opened. Tap “Add All” there."],
    icsTooMany: ["Das sind zu viele Schichten für eine Datei. Wähle weniger aus und öffne zwei Dateien.", "These are too many shifts for one file. Select fewer and open two files."],
    gWriting: ["Trage ein: {i} von {n}", "Adding {i} of {n}"],
    gDone: ["{n} in „{cal}“ eingetragen.", "{n} added to “{cal}”."],
    gSkipped: ["{n} waren schon drin.", "{n} were already there."],
    gDenied: ["Ohne deine Freigabe für Google Kalender kann nichts eingetragen werden.", "Nothing can be added without your permission for Google Calendar."],
    gPopup: ["Das Google-Fenster wurde geschlossen oder blockiert. Tippe noch einmal.", "The Google window was closed or blocked. Tap again."],
    gForbidden: ["In diesen Kalender darfst du nicht schreiben. Wähle einen anderen.", "You may not write to this calendar. Choose another one."],
    gUnclear: ["Bei einer Schicht kam keine Antwort. Schau im Kalender nach, ob sie drinsteht, bevor du es noch einmal versuchst.", "One shift got no answer. Check your calendar before you try again."],
    gFailed: ["Google Kalender hat die Anfrage abgelehnt.", "Google Calendar rejected the request."],
    nShift: ["1 Schicht|{n} Schichten", "1 shift|{n} shifts"],
    nEvent: ["1 Termin|{n} Termine", "1 event|{n} events"],
    nRow: ["1 Zeile|{n} Zeilen", "1 row|{n} rows"]
  };
  var lang = store.raw("studio-lang", "de") === "en" ? "en" : "de";
  function t(key, vars) {
    var s = (S[key] || [key, key])[lang === "en" ? 1 : 0];
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function count(key, n) { var p = t(key).split("|"); return (n === 1 ? p[0] : p[1]).replace("{n}", n); }
  function locale() { return lang === "en" ? "en-GB" : "de-DE"; }

  // ---------- Zustand ----------
  var state = {
    rows: [], file: null, busy: false,
    cfg: null, cfgFailed: false,
    user: null,                       // {email, token, exp}
    target: store.raw("zn-target", "ics") === "google" ? "google" : "ics",
    cal: store.get("zn-cal", null),   // {id, name}
    gTok: null, gisReady: null
  };
  var nextId = 1;

  function mkRow(date, von, bis, art, unsicher) {
    return { id: nextId++, date: date, von: von, bis: bis, art: art || "", work: !art || /anwesenheit/i.test(art),
             unsicher: !!unsicher, on: true, title: "", loc: "", status: "", kind: "" };
  }
  function saveRows() {
    store.set("zn-rows", state.rows.map(function (r) {
      return { date: r.date, von: r.von, bis: r.bis, art: r.art, unsicher: r.unsicher, on: r.on, title: r.title, loc: r.loc };
    }));
  }
  (store.get("zn-rows", []) || []).forEach(function (s) {
    if (!s || typeof s !== "object") return;
    var r = mkRow(String(s.date || ""), String(s.von || ""), String(s.bis || ""), String(s.art || ""), s.unsicher === true);
    r.on = s.on !== false; r.title = String(s.title || ""); r.loc = String(s.loc || "");
    state.rows.push(r);
  });

  // ---------- Hilfen ----------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (k === "text") n.textContent = v;
      else if (k === "class") n.className = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function parseDate(date) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || "");
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
  }
  function dayLabel(date) {
    var d = parseDate(date);
    if (!d) return t("pickDate");
    var wd = new Intl.DateTimeFormat(locale(), { weekday: "short", timeZone: "UTC" }).format(d).replace(".", "");
    var dm = new Intl.DateTimeFormat(locale(), { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(d);
    return wd + " " + dm;
  }
  function validRow(r) { return !!parseDate(r.date) && /^\d{2}:\d{2}$/.test(r.von) && /^\d{2}:\d{2}$/.test(r.bis) && r.von !== r.bis; }
  function defTitle() { return $("def-title").value.trim() || "Arbeit"; }
  function defLoc() { return $("def-loc").value.trim(); }
  function autoTitle(r) { return r.work ? defTitle() : (r.art || defTitle()); }
  function titleOf(r) { return r.title.trim() || autoTitle(r); }
  function locOf(r) { return r.loc.trim() || defLoc(); }
  function endDate(r) {
    if (r.bis > r.von) return r.date;
    var d = parseDate(r.date);
    return new Date(d.getTime() + 86400000).toISOString().slice(0, 10);
  }
  function setMsg(id, text, kind) { var n = $(id); n.textContent = text || ""; n.className = "msg" + (kind ? " " + kind : ""); }
  function selected() { return state.rows.filter(function (r) { return r.on && validRow(r); }); }

  // ---------- Liste ----------
  function renderSummary() {
    var months = [];
    state.rows.forEach(function (r) {
      var d = parseDate(r.date);
      if (!d) return;
      var label = new Intl.DateTimeFormat(locale(), { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
      if (months.indexOf(label) < 0) months.push(label);
    });
    $("summary").textContent = state.rows.length
      ? t("summary", { sel: state.rows.filter(function (r) { return r.on; }).length, all: state.rows.length }) + (months.length ? " · " + months.join(", ") : "")
      : t("summaryNone");
    var d = $("defaults");
    d.textContent = "";
    d.appendChild(el("strong", { text: defTitle() }));
    d.appendChild(document.createTextNode(" · " + (defLoc() || t("noPlace"))));
    var n = selected().length;
    $("go").textContent = t(state.target === "google" ? "goGoogle" : "goIcs", { n: count("nEvent", n) });
    $("go").disabled = state.busy || n === 0 || (state.target === "google" && !googleReady());
    // Höchstens ein gefüllter Hauptknopf: erst Erkennen, mit Schichten dann Eintragen
    var hasRows = state.rows.length > 0;
    $("go").classList.toggle("tinted", !hasRows);
    $("detect").classList.toggle("tinted", hasRows);
    $("detect").disabled = state.busy || !state.file || !canDetect();
  }

  function renderRows() {
    var box = $("rows");
    box.textContent = "";
    state.rows.forEach(function (r) {
      var day = el("span", { class: "day", text: dayLabel(r.date) });
      var tags = el("div", { class: "tags" });
      function paintTags() {
        tags.textContent = "";
        if (r.unsicher) tags.appendChild(el("span", { class: "tag warn", text: t("tagUnsure") }));
        if (!validRow(r)) tags.appendChild(el("span", { class: "tag warn", text: t("tagInvalid") }));
        if (r.status) tags.appendChild(el("span", { class: "tag " + r.kind, text: t(r.status) }));
      }
      function changed() { r.status = ""; paintTags(); renderSummary(); saveRows(); }
      var check = el("input", { type: "checkbox", id: "r" + r.id + "-on", "aria-label": t("takeShift"),
        onchange: function (e) { r.on = e.target.checked; node.classList.toggle("off", !r.on); renderSummary(); saveRows(); } });
      check.checked = r.on;
      var node = el("div", { class: "row" + (r.on ? "" : " off") }, [
        el("label", { class: "check" }, [check]),
        el("div", { class: "when" }, [
          el("span", { class: "datepick" }, [
            day,
            el("input", { type: "date", id: "r" + r.id + "-date", value: r.date, "aria-label": t("changeDate"),
              onclick: function (e) { try { e.target.showPicker(); } catch (x) {} },
              onchange: function (e) { r.date = e.target.value; day.textContent = dayLabel(r.date); changed(); } })
          ]),
          el("input", { class: "time", type: "time", id: "r" + r.id + "-von", value: r.von, "aria-label": t("from"),
            onchange: function (e) { r.von = e.target.value; changed(); } }),
          el("span", { class: "dash", text: "–" }),
          el("input", { class: "time", type: "time", id: "r" + r.id + "-bis", value: r.bis, "aria-label": t("to"),
            onchange: function (e) { r.bis = e.target.value; changed(); } })
        ]),
        el("div", { class: "what" }, [
          el("input", { type: "text", id: "r" + r.id + "-title", value: r.title, placeholder: autoTitle(r), "aria-label": t("title"), maxlength: "80",
            oninput: function (e) { r.title = e.target.value; saveRows(); } }),
          el("input", { type: "text", id: "r" + r.id + "-loc", value: r.loc, placeholder: defLoc() || t("place"), "aria-label": t("place"), maxlength: "120",
            oninput: function (e) { r.loc = e.target.value; saveRows(); } }),
          el("button", { class: "del", type: "button", "aria-label": t("deleteShift"), text: "×", onclick: function () { removeRow(r); } })
        ]),
        tags
      ]);
      paintTags();
      box.appendChild(node);
    });
  }
  function renderAll() { renderRows(); renderSummary(); }

  // Löschen mit Rückgängig
  var toastTimer = null, lastDeleted = null;
  function removeRow(r) {
    var i = state.rows.indexOf(r);
    if (i < 0) return;
    state.rows.splice(i, 1);
    lastDeleted = { row: r, index: i };
    saveRows(); renderAll();
    $("toast-text").textContent = t("deleted");
    $("toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $("toast").hidden = true; lastDeleted = null; }, 6000);
  }
  $("toast-undo").addEventListener("click", function () {
    if (lastDeleted) { state.rows.splice(Math.min(lastDeleted.index, state.rows.length), 0, lastDeleted.row); lastDeleted = null; saveRows(); renderAll(); }
    clearTimeout(toastTimer);
    $("toast").hidden = true;
  });
  $("add-row").addEventListener("click", function () {
    var last = state.rows[state.rows.length - 1];
    var today = new Date();
    var iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    state.rows.push(mkRow(last && parseDate(last.date) ? last.date : iso, "08:00", "12:00", "", false));
    saveRows(); renderAll();
  });

  // ---------- Texte, Thema, Sprache ----------
  function applyTexts() {
    document.documentElement.lang = lang;
    Array.prototype.forEach.call(document.querySelectorAll("[data-t]"), function (n) { n.textContent = t(n.getAttribute("data-t")); });
    $("gear").setAttribute("aria-label", t("settings"));
    $("theme").setAttribute("aria-label", t("appearance"));
    $("lang").setAttribute("aria-label", t("language"));
    $("thumb").alt = t("photoTitle");
    $("viewer-img").alt = t("photoTitle");
    if (state.file) $("photo-label").textContent = t("otherPhoto");
    $("st-build").textContent = t("version", { v: BUILD });
    renderSetupNote(); renderTarget(); renderCalSelect(null);
  }
  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme); else root.removeAttribute("data-theme");
    var bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    Array.prototype.forEach.call(document.querySelectorAll('meta[name="theme-color"]'), function (m) {
      if (theme === "light" || theme === "dark") m.setAttribute("content", bg);
      else m.setAttribute("content", /dark/.test(m.getAttribute("media") || "") ? "#141012" : "#FAF7F2");
    });
  }
  function radios(groupId, value, onChange) {
    Array.prototype.forEach.call($(groupId).querySelectorAll("input"), function (i) {
      i.checked = i.value === value;
      i.addEventListener("change", function () { if (i.checked) onChange(i.value); });
    });
  }
  radios("theme", store.raw("studio-theme", "auto"), function (v) { store.setRaw("studio-theme", v); applyTheme(v); });
  radios("lang", lang, function (v) { lang = v === "en" ? "en" : "de"; store.setRaw("studio-lang", lang); applyTexts(); renderAll(); if (!$("gate").hidden) renderGoogleButton(); });
  radios("target", state.target, function (v) { state.target = v; store.setRaw("zn-target", v); setMsg("go-msg", ""); renderTarget(); });

  $("def-title").value = store.raw("zn-title", "Arbeit dm");
  $("def-loc").value = store.raw("zn-loc", "");
  $("def-title").addEventListener("input", function () { store.setRaw("zn-title", $("def-title").value); });
  $("def-loc").addEventListener("input", function () { store.setRaw("zn-loc", $("def-loc").value); });

  var settings = $("settings");
  $("gear").addEventListener("click", function () { if (!settings.open) settings.showModal(); });
  $("st-done").addEventListener("click", function () { settings.close(); });
  settings.addEventListener("click", function (e) { if (e.target === settings) settings.close(); });
  settings.addEventListener("close", function () { renderAll(); $("gear").focus(); });
  $("st-update").addEventListener("click", function () {
    var go = function () { location.reload(); };
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) navigator.serviceWorker.getRegistration().then(function (r) { return r ? r.update() : null; }).then(go, go);
    else go();
  });

  // ---------- Foto und Vergrößern ----------
  var thumbUrl = null;
  $("photo").addEventListener("change", function () {
    var f = $("photo").files && $("photo").files[0];
    if (!f) return;
    state.file = f;
    if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    thumbUrl = URL.createObjectURL(f);
    $("thumb").src = thumbUrl;
    $("thumb-btn").hidden = false;
    $("photo-label").textContent = t("otherPhoto");
    setMsg("detect-msg", "");
    renderSummary();
  });

  var zoom = 1, vs = $("viewer-scroll"), vimg = $("viewer-img");
  function setZoom(z, cx, cy) {
    z = Math.max(1, Math.min(6, z));
    if (cx == null) { cx = vs.clientWidth / 2; cy = vs.clientHeight / 2; }
    var fx = (vs.scrollLeft + cx) / zoom, fy = (vs.scrollTop + cy) / zoom;
    zoom = z;
    vimg.style.width = (zoom * 100) + "%";
    vs.scrollLeft = fx * zoom - cx;
    vs.scrollTop = fy * zoom - cy;
    $("zoom-val").textContent = Math.round(zoom * 100) + " %";
  }
  function closeViewer() { $("viewer").hidden = true; $("thumb-btn").focus(); }
  $("thumb-btn").addEventListener("click", function () {
    if (!thumbUrl) return;
    vimg.src = thumbUrl;
    $("viewer").hidden = false;
    zoom = 1; vimg.style.width = "100%"; vs.scrollLeft = 0; vs.scrollTop = 0;
    $("zoom-val").textContent = "100 %";
    $("viewer-close").focus();
  });
  $("viewer-close").addEventListener("click", closeViewer);
  $("zoom-in").addEventListener("click", function () { setZoom(zoom * 1.5); });
  $("zoom-out").addEventListener("click", function () { setZoom(zoom / 1.5); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("viewer").hidden) closeViewer(); });
  var pinch = null, lastTap = 0;
  function dist(ts) { return Math.hypot(ts[0].clientX - ts[1].clientX, ts[0].clientY - ts[1].clientY); }
  vs.addEventListener("touchstart", function (e) { if (e.touches.length === 2) { pinch = { d: dist(e.touches), z: zoom }; e.preventDefault(); } }, { passive: false });
  vs.addEventListener("touchmove", function (e) {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    var r = vs.getBoundingClientRect();
    setZoom(pinch.z * dist(e.touches) / pinch.d, (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top);
  }, { passive: false });
  vs.addEventListener("touchend", function (e) {
    if (e.touches.length < 2) pinch = null;
    if (e.touches.length === 0 && e.changedTouches.length === 1) {
      var now = Date.now(), tc = e.changedTouches[0], r = vs.getBoundingClientRect();
      if (now - lastTap < 300) { setZoom(zoom > 1.2 ? 1 : 2.5, tc.clientX - r.left, tc.clientY - r.top); lastTap = 0; e.preventDefault(); }
      else lastTap = now;
    }
  }, { passive: false });
  vs.addEventListener("wheel", function (e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    var r = vs.getBoundingClientRect();
    setZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  vs.addEventListener("dblclick", function (e) { var r = vs.getBoundingClientRect(); setZoom(zoom > 1.2 ? 1 : 2.5, e.clientX - r.left, e.clientY - r.top); });

  // ---------- Erkennung ----------
  function canDetect() { return !!(state.cfg && state.cfg.erkennung && state.user); }
  function blobToBase64(blob) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result).split(",")[1] || ""); };
      fr.onerror = function () { rej(new Error("read")); };
      fr.readAsDataURL(blob);
    });
  }
  // Foto verkleinern: lange Seite höchstens 2200 px, damit die Ziffern lesbar bleiben und die Anfrage klein
  async function prepImage(file) {
    try {
      var bmp = await createImageBitmap(file);
      var scale = Math.min(1, 2200 / Math.max(bmp.width, bmp.height));
      var c = document.createElement("canvas");
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      var blob = await new Promise(function (res, rej) { c.toBlob(function (b) { b ? res(b) : rej(new Error("blob")); }, "image/jpeg", 0.85); });
      return { mime: "image/jpeg", bild: await blobToBase64(blob) };
    } catch (e) {
      // Nie die Originaldatei schicken: sie kann Aufnahmeort und andere Angaben enthalten
      throw { code: "bild" };
    }
  }
  var DETECT_ERR = { anmelden: "errLogin", nicht_freigeschaltet: "errDenied", nicht_eingerichtet: "errSetup", zu_gross: "errTooBig", bild: "errImage", limit: "errLimit" };
  $("detect").addEventListener("click", async function () {
    if (state.busy || !state.file || !canDetect()) return;
    if (store.raw("zn-send-ok", "") !== "1") {
      if (!window.confirm(t("sendAsk"))) return;
      store.setRaw("zn-send-ok", "1");
    }
    state.busy = true; renderSummary();
    setMsg("detect-msg", t("detecting"));
    try {
      var img = await prepImage(state.file);
      var r;
      try {
        r = await fetch("/api/erkennen", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + state.user.token }, body: JSON.stringify(img) });
      } catch (e) { throw { code: "offline" }; }
      var data = null;
      try { data = await r.json(); } catch (e) {}
      if (!r.ok) throw { code: (data && data.fehler) || "dienst" };
      var list = data && Array.isArray(data.eintraege) ? data.eintraege : [];
      var rows = list.map(function (e) { return mkRow(String(e.datum), String(e.von), String(e.bis), String(e.art || ""), e.unsicher === true); }).filter(validRow);
      if (!rows.length) setMsg("detect-msg", t("detectedNone"), "warn");
      else {
        state.rows = rows; saveRows();
        var unsure = rows.filter(function (x) { return x.unsicher; }).length;
        setMsg("detect-msg", t("detected", { n: count("nRow", rows.length) }) + (unsure ? " " + t("detectedUnsure", { n: unsure }) : ""), unsure ? "warn" : "good");
      }
    } catch (e) {
      var code = e && e.code;
      setMsg("detect-msg", code === "offline" ? t("errOffline") : t(DETECT_ERR[code] || "errService"), "bad");
      if (code === "anmelden") signOut(true);
    } finally { state.busy = false; renderAll(); }
  });

  // ---------- Kalenderdatei ----------
  function b64url(text) {
    var bytes = new TextEncoder().encode(text), bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function icsUrl(rows) {
    var strings = [];
    function idx(s) { var i = strings.indexOf(s); if (i < 0) { strings.push(s); i = strings.length - 1; } return i; }
    var events = rows.map(function (r) { var loc = locOf(r); return [r.date, r.von, r.bis, idx(titleOf(r)), loc ? idx(loc) : null]; });
    return "/api/ics?d=" + b64url(JSON.stringify({ s: strings, e: events }));
  }
  function openIcs(rows) {
    var url = icsUrl(rows);
    if (url.length > 7000 || rows.length > 120) { setMsg("go-msg", t("icsTooMany"), "warn"); return; }
    var w = null;
    try { w = window.open(url, "_blank"); } catch (e) {}
    if (!w) location.href = url;
    setMsg("go-msg", t("icsOpened"), "good");
  }

  // ---------- Google: Anmeldung ----------
  function loadGis() {
    if (!state.gisReady) state.gisReady = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = function () { res(); };
      s.onerror = function () { state.gisReady = null; rej(new Error("gis")); };
      document.head.appendChild(s);
    });
    return state.gisReady;
  }
  function tokenExp(token) {
    try { return Number(JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).exp) * 1000 || 0; } catch (e) { return 0; }
  }
  async function fetchConfig(token) {
    var r = await fetch("/api/config", { headers: token ? { Authorization: "Bearer " + token } : {} });
    if (!r.ok) throw new Error("config");
    return r.json();
  }
  function renderGoogleButton() {
    if (!window.google || !google.accounts || !google.accounts.id) return;
    $("gbtn").textContent = "";
    google.accounts.id.renderButton($("gbtn"), { theme: "outline", size: "large", shape: "pill", text: "signin_with", locale: lang, width: 260 });
  }
  async function onCredential(resp) {
    var token = resp && resp.credential;
    if (!token) { setMsg("gate-msg", t("gateFailed"), "bad"); return; }
    try {
      var cfg = await fetchConfig(token);
      if (cfg.konto && cfg.konto.erlaubt) {
        state.cfg = cfg;
        state.user = { email: cfg.konto.email, token: token, exp: tokenExp(token) };
        store.set("zn-id", { token: token });
        setMsg("gate-msg", "");
        showApp();
      } else if (cfg.konto && cfg.konto.email) {
        try { google.accounts.id.disableAutoSelect(); } catch (e) {}
        setMsg("gate-msg", t("gateDenied", { email: cfg.konto.email }), "bad");
      } else setMsg("gate-msg", t("gateFailed"), "bad");
    } catch (e) { setMsg("gate-msg", t("gateFailed"), "bad"); }
  }
  async function showGate() {
    $("app").hidden = true; $("gate").hidden = false;
    try {
      await loadGis();
      google.accounts.id.initialize({ client_id: state.cfg.googleClientId, callback: onCredential, auto_select: true, use_fedcm_for_prompt: true });
      renderGoogleButton();
      google.accounts.id.prompt();
    } catch (e) { setMsg("gate-msg", t("gateNoScript"), "bad"); }
  }
  function signOut(silent) {
    if (!silent && !window.confirm(t("signOutAsk"))) return;
    try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) {}
    if (!silent && state.gTok) { try { google.accounts.oauth2.revoke(state.gTok.token, function () {}); } catch (e) {} }
    state.user = null; state.gTok = null;
    store.del("zn-id");
    if (!silent) {
      state.rows = []; state.cal = null;
      ["zn-rows", "zn-cal", "zn-title", "zn-loc", "zn-send-ok"].forEach(store.del);
      $("def-title").value = "Arbeit dm"; $("def-loc").value = "";
      $("cal").textContent = ""; renderCalSelect(null);
    }
    if (settings.open) settings.close();
    if (state.cfg && state.cfg.googleClientId) showGate();
  }
  $("signout").addEventListener("click", function () { signOut(false); });

  // ---------- Google Kalender ----------
  function googleReady() { return !!(state.cfg && state.cfg.googleClientId && state.user); }
  function googleToken() {
    return new Promise(function (res, rej) {
      if (state.gTok && state.gTok.exp > Date.now() + 60000) return res(state.gTok.token);
      if (!window.google || !google.accounts || !google.accounts.oauth2) return rej({ code: "popup" });
      var client = google.accounts.oauth2.initTokenClient({
        client_id: state.cfg.googleClientId, scope: SCOPES.join(" "), hint: state.user.email,
        callback: function (r) {
          if (!r || r.error || !r.access_token) return rej({ code: "denied" });
          if (!google.accounts.oauth2.hasGrantedAllScopes(r, SCOPES[0], SCOPES[1])) return rej({ code: "denied" });
          state.gTok = { token: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3000) * 1000 };
          res(state.gTok.token);
        },
        error_callback: function () { rej({ code: "popup" }); }
      });
      client.requestAccessToken();
    });
  }
  async function gapi(method, path, body) {
    var token = await googleToken();
    var r;
    try {
      r = await fetch("https://www.googleapis.com/calendar/v3" + path, {
        method: method,
        headers: body ? { Authorization: "Bearer " + token, "Content-Type": "application/json" } : { Authorization: "Bearer " + token },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) { throw { code: "unclear" }; }
    if (r.status === 401) { state.gTok = null; throw { code: "denied" }; }
    var data = null;
    try { data = await r.json(); } catch (e) {}
    if (!r.ok) throw { code: r.status === 403 || r.status === 404 ? "forbidden" : r.status === 409 ? "conflict" : r.status >= 500 ? "unclear" : "failed" };
    return data;
  }
  function gErr(e) { return t({ denied: "gDenied", popup: "gPopup", forbidden: "gForbidden", unclear: "gUnclear" }[e && e.code] || "gFailed"); }

  function renderCalSelect(list) {
    var sel = $("cal");
    if (!list) {
      if (sel.options.length > 1) return;
      sel.textContent = "";
      sel.appendChild(el("option", { value: state.cal ? state.cal.id : "", text: state.cal ? state.cal.name : t("calNone") }));
      return;
    }
    sel.textContent = "";
    list.forEach(function (c) { sel.appendChild(el("option", { value: c.id, text: c.name })); });
    if (!state.cal || !list.some(function (c) { return c.id === state.cal.id; })) { state.cal = list[0]; store.set("zn-cal", state.cal); }
    sel.value = state.cal.id;
  }
  $("cal").addEventListener("change", function () {
    var o = $("cal").selectedOptions[0];
    if (o && o.value) { state.cal = { id: o.value, name: o.textContent }; store.set("zn-cal", state.cal); }
  });
  $("load-cals").addEventListener("click", async function () {
    if (!googleReady()) return;
    $("load-cals").disabled = true;
    try {
      var data = await gapi("GET", "/users/me/calendarList?minAccessRole=writer&maxResults=250");
      var list = ((data && data.items) || []).map(function (c) { return { id: String(c.id), name: String(c.summaryOverride || c.summary || c.id) }; });
      if (!list.length) setMsg("go-msg", t("calEmpty"), "warn");
      else { renderCalSelect(list); setMsg("go-msg", t("calLoaded"), "good"); }
    } catch (e) { setMsg("go-msg", gErr(e), "bad"); }
    finally { $("load-cals").disabled = false; }
  });

  // Feste Termin-Kennung: dieselbe Schicht landet nie doppelt im selben Kalender
  function eventId(r) { return "arbeit" + r.date.replace(/-/g, "") + r.von.replace(":", "") + r.bis.replace(":", ""); }
  async function writeGoogle(rows) {
    if (!state.cal) { setMsg("go-msg", t("calFirst"), "warn"); return; }
    try { await googleToken(); } catch (e) { setMsg("go-msg", gErr(e), "bad"); return; }
    var base = "/calendars/" + encodeURIComponent(state.cal.id) + "/events";
    var ok = 0, skipped = 0, stopped = "";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      setMsg("go-msg", t("gWriting", { i: i + 1, n: rows.length }));
      var body = { id: eventId(r), summary: titleOf(r),
        start: { dateTime: r.date + "T" + r.von + ":00", timeZone: "Europe/Berlin" },
        end: { dateTime: endDate(r) + "T" + r.bis + ":00", timeZone: "Europe/Berlin" } };
      if (locOf(r)) body.location = locOf(r);
      try {
        try { await gapi("POST", base, body); r.status = "tagDone"; r.kind = "good"; ok++; }
        catch (e) {
          if (!e || e.code !== "conflict") throw e;
          // Kennung schon vergeben: entweder steht der Termin drin oder er wurde gelöscht
          var old = await gapi("GET", base + "/" + body.id);
          if (old && old.status === "cancelled") { body.status = "confirmed"; await gapi("PUT", base + "/" + body.id, body); r.status = "tagDone"; r.kind = "good"; ok++; }
          else { r.status = "tagExists"; r.kind = "good"; skipped++; }
        }
      } catch (e) {
        r.status = e && e.code === "unclear" ? "tagUnclear" : "tagFailed";
        r.kind = e && e.code === "unclear" ? "warn" : "bad";
        stopped = gErr(e);
        break;
      }
    }
    renderRows();
    var done = t("gDone", { n: count("nEvent", ok), cal: state.cal.name }) + (skipped ? " " + t("gSkipped", { n: skipped }) : "");
    setMsg("go-msg", stopped ? ((ok || skipped) ? done + " " : "") + stopped : done, stopped ? "bad" : "good");
  }

  $("go").addEventListener("click", async function () {
    if (state.busy) return;
    var rows = selected();
    if (!rows.length) return;
    if (state.target !== "google") { openIcs(rows); return; }
    state.busy = true; renderSummary();
    try { await writeGoogle(rows); } finally { state.busy = false; renderSummary(); }
  });

  // ---------- Ansichten ----------
  function renderSetupNote() {
    var key = "";
    if (state.cfgFailed) key = "setupOffline";
    else if (state.cfg && !state.cfg.googleClientId) key = "setupLogin";
    else if (state.cfg && !state.cfg.erkennung) key = "setupKey";
    $("setup-note").hidden = !key;
    $("setup-note").textContent = key ? t(key) : "";
  }
  function renderTarget() {
    var canGoogle = !!(state.cfg && state.cfg.googleClientId);
    var g = state.target === "google" && canGoogle;
    Array.prototype.forEach.call($("target").querySelectorAll("input"), function (i) {
      if (i.value === "google") i.disabled = !canGoogle;
      i.checked = i.value === (g ? "google" : "ics");
    });
    if (state.target === "google" && !canGoogle) state.target = "ics";
    $("calrow").hidden = !g;
    $("target-hint").textContent = g ? t("hintGoogle") : t("hintIcs") + (canGoogle ? "" : " " + t("hintGoogleOff"));
    renderSummary();
  }
  function showApp() {
    $("gate").hidden = true; $("app").hidden = false;
    $("st-account").hidden = !state.user;
    $("st-email").textContent = state.user ? state.user.email : "";
    renderSetupNote(); renderTarget(); renderAll();
    if (state.cfg && state.cfg.googleClientId) loadGis().catch(function () {});
  }

  async function start() {
    applyTheme(store.raw("studio-theme", "auto"));
    applyTexts();
    var saved = store.get("zn-id", null);
    var token = saved && saved.token && tokenExp(saved.token) > Date.now() + 30000 ? saved.token : "";
    try { state.cfg = await fetchConfig(token); }
    catch (e) { state.cfg = { googleClientId: "", erkennung: false }; state.cfgFailed = true; }
    if (!state.cfg.googleClientId) { showApp(); return; }
    if (token && state.cfg.konto && state.cfg.konto.erlaubt) {
      state.user = { email: state.cfg.konto.email, token: token, exp: tokenExp(token) };
      showApp();
    } else { store.del("zn-id"); showGate(); }
  }
  start();

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});
})();
