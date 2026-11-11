// Thema und Sprache vor dem ersten Zeichnen setzen (kein Aufblitzen)
(function () {
  var theme = "auto", lang = "de";
  try {
    theme = localStorage.getItem("studio-theme") || "auto";
    lang = localStorage.getItem("studio-lang") || "de";
  } catch (e) {}
  var root = document.documentElement;
  if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
  root.lang = lang === "en" ? "en" : "de";
})();
