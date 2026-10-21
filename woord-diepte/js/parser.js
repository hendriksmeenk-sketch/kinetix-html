/* 3.3 radicaal-parser. Rood = radicaal. Grijs = rest. */
(function (g) {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function paint(raw) {
    var s = esc(raw);
    s = s.replace(/⚫\s*([^⚫]+?)\s*⚫/g, '<span class="comp">$1</span>');
    s = s.replace(/🔴\s*([^🔴]+?)\s*🔴/g, '<span class="rad">$1</span>');
    s = s.replace(/&lt;rad&gt;([\s\S]+?)&lt;\/rad&gt;/gi, '<span class="rad">$1</span>');
    s = s.replace(/\[rad\]([\s\S]+?)\[\/rad\]/gi, '<span class="rad">$1</span>');
    s = s.replace(/【([^】]+)】/g, '<span class="rad">$1</span>');
    return s;
  }
  function strip(raw) {
    return String(raw || "")
      .replace(/⚫|🔴|<\/?rad>|\[\/?rad\]|【|】/gi, "")
      .trim();
  }
  function parseTekst(text) {
    var t = String(text || "").trim();
    if (!t) return null;
    if (t[0] === "{" || t[0] === "[") {
      try {
        var j = JSON.parse(t);
        return Array.isArray(j) ? j[0] : j;
      } catch (e) {}
    }
    function blok(n, names) {
      var re = new RegExp("(?:^|\\n)\\s*" + n + "[\\.\\):]\\s*(?:" + names + ")[:\\s]*([\\s\\S]*?)(?=\\n\\s*[1-6][\\.\\):]|$)", "i");
      var m = t.match(re);
      return m ? m[1].trim() : "";
    }
    function veld(src, key) {
      var m = (src || "").match(new RegExp(key + "\\s*[:|]+\\s*(.+)", "i"));
      if (m) return m[1].trim();
      m = (src || "").match(new RegExp("^\\s*" + key + "\\s{2,}(.+)$", "im"));
      return m ? m[1].trim() : "";
    }
    var k1 = blok(1, "de kaart|kaart");
    var k2 = blok(2, "klank");
    var k3 = blok(3, "schrift[:\\s]|schrift");
    var k4 = blok(4, "buzan[\\s\\S]{0,40}geheugenbeeld|beeld|geheugenbeeld");
    var k5 = blok(5, "actieve recall|recall");
    var k6 = blok(6, "schrijf\\s*volgorde|schrijfvolgorde|streep");
    var hz = veld(k1, "symbool") || veld(k1, "teken") || (t.match(/[\u4e00-\u9fff]/) || [""])[0];
    var heel = /hele teken is radicaal/i.test(t);
    var doe = [], vragen = [];
    var parts = (k5 || "").split(/controlevragen\s*:/i);
    (parts[0] || "").split(/\n/).forEach(function (s) {
      s = s.replace(/^[\-\*\d\.\)]\s*/, "").trim();
      if (s) doe.push(s);
    });
    (parts[1] || "").split(/\n/).forEach(function (s) {
      s = s.replace(/^[\-\*\d\.\)]\s*/, "").trim();
      if (s) vragen.push(s);
    });
    return {
      hz: hz,
      heelRadicaal: heel,
      pinyin: veld(k1, "pinyin"),
      toon: veld(k1, "toon"),
      vertaling: veld(k1, "vertaling"),
      klankhook: veld(k1, "klankhook"),
      beeldhook: veld(k1, "beeldhook"),
      plek: veld(k1, "plek"),
      actie: veld(k1, "actie"),
      radicalen: veld(k1, "radicalen") || veld(k3, "radicalen"),
      klank: k2,
      schrift: k3,
      beeld: k4,
      recallDoe: doe,
      recallVragen: vragen,
      strekenTekst: k6,
      raw: t
    };
  }
  function paintHz(s, w) {
    var html = paint(s);
    if (w && w.heelRadicaal && w.hz) {
      var re = new RegExp(w.hz.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      html = html.replace(re, '<span class="rad">' + w.hz + "</span>");
    }
    return html;
  }
  g.Parser = { paint: paint, paintHz: paintHz, strip: strip, parseTekst: parseTekst };
})(window);
