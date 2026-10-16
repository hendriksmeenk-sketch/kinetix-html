/* 子-streken uit ESC stroke_data.js — niet nagetekend, gekopieerd. */
window.ZI_STROKES = [
  { name: "横撇", d: "M28.7 30.6 L34.7 33 L45.1 30 L60.6 26.6 L64.3 26.6 L65.9 28.5 L66.5 30.9 L53.6 43.6" },
  { name: "竖钩", d: "M46.1 42.6 L50.4 46.4 L51.8 53.3 L53.7 74.3 L53.6 82.5 L52.4 90.3 L51.1 93.8 L49.3 95.9 L47.9 96.7 L37.4 92.3 L35.9 91.1" },
  { name: "横", d: "M11.6 60.5 L13.9 61.5 L18.2 62.3 L40.0 59.0 L80.7 55.2 L83.5 55.4 L89.5 57.1 L91.5 58.8" }
];
window.drawZi = function (el, n) {
  if (!el) return;
  n = n == null ? 3 : n;
  var paths = window.ZI_STROKES.map(function (s, i) {
    var op = i < n ? "1" : "0.12";
    return '<path d="' + s.d + '" fill="none" stroke="#c41e3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="' + op + '"/>';
  }).join("");
  el.innerHTML = '<svg viewBox="0 0 100 100" class="tian-svg">' +
    '<line x1="50" y1="4" x2="50" y2="96" stroke="#c9b8a0" stroke-width="0.6"/>' +
    '<line x1="4" y1="50" x2="96" y2="50" stroke="#c9b8a0" stroke-width="0.6"/>' +
    paths + "</svg>";
};
