(function () {
  var KEY = "woord_diepte_v35";
  var LEARNERS = ["leerling A", "leerling B", "leerling C"];
  var state = { cur: "子", live: false, learner: "leerling A", inDiepte: false };
  var db = { schema: 35, hersenen: "leerling A", woorden: [], recallByLearner: {} };

  function ziSeed() {
    return {
      hz: "子",
      source: "woord_diepte",
      card_id: "wd-子",
      heelRadicaal: true,
      pinyin: "zǐ",
      toon: "3",
      vertaling: "zoon, kind, meester, zaad",
      klankhook: "DZUH! (bij die duikt)",
      beeldhook: "IK ben een kind dat zijn armen naar de wereld uitstrekt.",
      plek: "wieg naast het bed",
      actie: "armpjes omhoog",
      radicalen: "🔴子🔴 — het hele teken is radicaal",
      klank: "zǐ — derde toon. Vallei: zak, veer. Klankhook DZUH!",
      schrift: "Streken: 3. Heel teken is radicaal 🔴子🔴.",
      beeld: "IK in de wieg, armpjes omhoog. DZUH!",
      img: "zi-wieg.jpg",
      recallDoe: [
        "Kijk naar 子. Armpjes, lijf, wieg.",
        "Zeg zǐ — vallei.",
        "Roep DZUH!",
        "Armpjes omhoog.",
        "Schrijf drie streken in de lucht."
      ],
      recallVragen: [
        "Teken → pinyin + toon + NL.",
        "Waarom helemaal rood?",
        "Klankhook?",
        "Plek + actie."
      ],
      strekenLos: ["㇇ 横撇/横钩", "㇚ 竖钩", "㇐ 横"],
      strekenSamen: ["㇇", "了", "子"],
      status: "nieuw",
      station: 0,
      nextLabel: "—"
    };
  }

  function ensureRecallMap() {
    if (!db.recallByLearner) db.recallByLearner = {};
    LEARNERS.forEach(function (L) {
      if (!db.recallByLearner[L]) db.recallByLearner[L] = {};
    });
  }

  function ensureZiMeta() {
    db.woorden.forEach(function (w) {
      if (w.hz === "子") {
        w.source = w.source || "woord_diepte";
        w.card_id = w.card_id || "wd-子";
      } else if (!w.source) {
        w.source = "woord_diepte";
        if (!w.card_id) w.card_id = "wd-" + w.hz;
      }
    });
  }

  function recallSlot(hz) {
    ensureRecallMap();
    var bag = db.recallByLearner[state.learner];
    if (!bag[hz]) {
      var base = db.woorden.filter(function (w) { return w.hz === hz; })[0] || {};
      bag[hz] = {
        status: base.status || "nieuw",
        station: typeof base.station === "number" ? base.station : 0,
        nextLabel: base.nextLabel || "—",
        geleerdAt: base.geleerdAt || null
      };
    }
    return bag[hz];
  }

  function applyRecallToWord(w) {
    if (!w) return w;
    var r = recallSlot(w.hz);
    w.status = r.status;
    w.station = r.station;
    w.nextLabel = r.nextLabel;
    w.geleerdAt = r.geleerdAt;
    return w;
  }

  function writeRecallFromWord(w) {
    if (!w) return;
    var r = recallSlot(w.hz);
    r.status = w.status || "nieuw";
    r.station = typeof w.station === "number" ? w.station : 0;
    r.nextLabel = w.nextLabel || "—";
    r.geleerdAt = w.geleerdAt || null;
  }

  function load() {
    try {
      var local = JSON.parse(localStorage.getItem(KEY) || "null");
      if (local && local.woorden) {
        db = local;
        ensureRecallMap();
        ensureZiMeta();
        if (db.hersenen && LEARNERS.indexOf(db.hersenen) >= 0) state.learner = db.hersenen;
        return Promise.resolve(db);
      }
    } catch (e) {}
    return fetch("data/woorden.json").then(function (r) { return r.json(); }).then(function (j) {
      db = j;
      ensureRecallMap();
      ensureZiMeta();
      if (db.hersenen && LEARNERS.indexOf(db.hersenen) >= 0) state.learner = db.hersenen;
      // migrate existing top-level station into current learner once
      db.woorden.forEach(function (w) {
        var bag = db.recallByLearner[state.learner];
        if (!bag[w.hz]) {
          bag[w.hz] = {
            status: w.status || "nieuw",
            station: typeof w.station === "number" ? w.station : 0,
            nextLabel: w.nextLabel || "—",
            geleerdAt: w.geleerdAt || null
          };
        }
      });
      save();
      return db;
    }).catch(function () {
      db = { schema: 35, hersenen: "leerling A", woorden: [ziSeed()], recallByLearner: {} };
      ensureRecallMap();
      save();
      return db;
    });
  }

  function save() {
    db.hersenen = state.learner;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }

  function woord() {
    var w = db.woorden.filter(function (x) { return x.hz === state.cur; })[0] || db.woorden[0];
    return applyRecallToWord(w);
  }

  function chip(k, v) { return '<span class="kw"><i>' + k + "</i>" + (v || "—") + "</span>"; }
  function speak(text, lang) {
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = lang || "zh-CN";
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function find(q) {
    var n = (q || "").trim().toLowerCase();
    return db.woorden.filter(function (w) {
      return w.hz === q
        || (w.pinyin || "").toLowerCase().indexOf(n) >= 0
        || (w.vertaling || "").toLowerCase().indexOf(n) >= 0;
    })[0];
  }

  function showHQ() {
    state.inDiepte = false;
    document.body.classList.add("hq-on");
    document.body.classList.remove("dicht");
    document.getElementById("hq").style.display = "block";
    document.getElementById("app-header").hidden = true;
    document.getElementById("app-wrap").hidden = true;
    paintLearnerButtons();
  }

  function openDiepte() {
    state.inDiepte = true;
    state.cur = "子";
    document.body.classList.remove("hq-on");
    document.getElementById("hq").style.display = "none";
    document.getElementById("app-header").hidden = false;
    document.getElementById("app-wrap").hidden = false;
    document.getElementById("hdr-learner-name").textContent = state.learner;
    save();
    render();
    if (location.hash) {
      var el = document.querySelector(location.hash);
      if (el) el.scrollIntoView();
    }
  }

  function paintLearnerButtons() {
    var nodes = document.querySelectorAll("#hq-learners .learner");
    nodes.forEach(function (btn) {
      btn.classList.toggle("on", btn.getAttribute("data-learner") === state.learner);
    });
    var hint = document.getElementById("hq-hint");
    if (hint) hint.textContent = "Leerling: " + state.learner + " · eerste kaart vast: 子 · recall apart";
  }

  function setLearner(name) {
    if (LEARNERS.indexOf(name) < 0) return;
    state.learner = name;
    db.hersenen = name;
    save();
    paintLearnerButtons();
    if (state.inDiepte) {
      document.getElementById("hdr-learner-name").textContent = name;
      render();
    }
  }

  function render() {
    var w = woord();
    if (!w) return;
    state.cur = w.hz;
    document.getElementById("hdr-learner-name").textContent = state.learner;
    document.getElementById("kop-hz").innerHTML = Parser.paintHz(w.hz, w);
    document.getElementById("kop-meta").innerHTML =
      chip("pinyin", w.pinyin) + chip("toon", w.toon) + chip("vertaling", w.vertaling) +
      chip("leerling", state.learner);
    var rijen = [
      ["Symbool", Parser.paintHz(w.hz, w)],
      ["Pinyin", w.pinyin],
      ["Toon", w.toon],
      ["Vertaling", w.vertaling],
      ["Radicalen", Parser.paintHz(w.radicalen || "", w)],
      ["Klankhook", w.klankhook],
      ["Beeldhook", w.beeldhook],
      ["Plek", w.plek],
      ["Actie", w.actie]
    ];
    document.getElementById("kaart").innerHTML = "<table class='kaart'>" + rijen.map(function (r) {
      return "<tr><th>" + r[0] + "</th><td>" + (r[1] || "—") + "</td></tr>";
    }).join("") + "</table>";
    document.getElementById("klank").innerHTML =
      chip("toon", w.toon) + chip("hook", w.klankhook) +
      '<div class="prose">' + Parser.paintHz(w.klank || "", w) + "</div>";
    document.getElementById("schrift").innerHTML =
      '<div class="prose">' + Parser.paintHz(w.schrift || "", w) + "</div>";
    document.getElementById("beeldtekst").innerHTML =
      chip("hook", w.beeldhook) + chip("plek", w.plek) + chip("actie", w.actie) +
      '<div class="prose">' + Parser.paintHz(w.beeld || "", w) + "</div>";
    var fam = document.getElementById("family");
    if (fam) fam.innerHTML = '<span class="kw"><i>zit in</i><span class="rad">子</span> · 好 字 学 孩</span>';
    if (window.drawZi && document.getElementById("tian")) drawZi(document.getElementById("tian"), 3);
    var it = document.getElementById("img-toon");
    var ip = document.getElementById("img-pict");
    if (it) { it.src = "toon3-vallei.jpg"; it.style.display = "block"; }
    if (ip) { ip.src = "zi-pict.jpg"; ip.style.display = "block"; }
    var img = document.getElementById("still");
    var cue = document.getElementById("cue-still");
    if (img && w.img) { img.src = w.img; img.style.display = "block"; }
    if (cue && w.img) cue.src = w.img;
    function ol(arr) {
      return "<ol>" + (arr || []).map(function (a) { return "<li>" + Parser.paintHz(a, w) + "</li>"; }).join("") + "</ol>";
    }
    var u = Chronos.stepUrls(location.href, w.hz);
    var urlsEl = document.getElementById("terug-urls");
    if (urlsEl) {
      urlsEl.innerHTML =
        '<a href="' + u.kaart + '">1 kaart</a>' +
        '<a href="' + u.klank + '">2 klank</a>' +
        '<a href="' + u.schrift + '">3 schrift</a>' +
        '<a href="' + u.beeld + '">4 beeld</a>' +
        '<a href="' + u.recall + '">5 recall</a>' +
        '<a href="' + u.streep + '">6 streep</a>' +
        '<a href="' + u.yes + '">JA</a>' +
        '<a href="' + u.no + '">NEE</a>';
    }
    document.getElementById("recall-hints").innerHTML =
      "<p class='dim'>DOE · lichaam eerst · " + state.learner + "</p>" + ol(w.recallDoe || w.recallActies) +
      "<p class='dim'>Productie · niet aankijken</p>" + ol(w.recallVragen);
    function grid(id, arr) {
      document.getElementById(id).innerHTML = (arr || []).map(function (s, i) {
        return "<div><i>" + (i + 1) + "</i>" + s + "</div>";
      }).join("");
    }
    grid("los", w.strekenLos);
    grid("samen", w.strekenSamen);
    var st = Chronos.STATIONS.map(function (s) {
      return '<span class="kw' + (w.station === s.id ? " on" : "") + '"><i>terug</i>' + s.label + "</span>";
    }).join("");
    document.getElementById("stations").innerHTML = st;
    document.getElementById("status").textContent = state.learner + " · " + (w.status || "nieuw") + " · " + (w.nextLabel || "—");
    tabel();
  }

  function tabel() {
    document.getElementById("tabel").innerHTML = db.woorden.map(function (raw, i) {
      var w = applyRecallToWord(Object.assign({}, raw));
      return "<tr><td>" + (i + 1) + "</td><td>" + w.hz + "</td><td>" + (w.pinyin || "") +
        "</td><td>" + (w.toon || "") + "</td><td>" + (w.vertaling || "") +
        "</td><td>" + (w.status || "nieuw") + "</td><td>" + (w.nextLabel || "—") + "</td></tr>";
    }).join("");
  }

  function upsert(src) {
    var p = typeof src === "string" ? Parser.parseTekst(src) : src;
    if (!p || !p.hz) { document.getElementById("wij").textContent = "Geen teken in de plak."; return; }
    var vragen = (p.recallTekst || "").split(/\n/).map(function (s) { return s.replace(/^[\-\*\d\.\)]\s*/, "").trim(); }).filter(Boolean);
    var w = {
      hz: p.hz, pinyin: p.pinyin, toon: p.toon, vertaling: p.vertaling,
      klankhook: p.klankhook, beeldhook: p.beeldhook, plek: p.plek, actie: p.actie,
      radicalen: p.radicalen, klank: p.klank, schrift: p.schrift, beeld: p.beeld,
      img: p.img || "", heelRadicaal: !!p.heelRadicaal,
      source: "woord_diepte", card_id: "wd-" + p.hz,
      recallDoe: p.recallDoe || vragen.slice(0, 8), recallVragen: p.recallVragen || [],
      strekenLos: (p.strekenLos || []), strekenSamen: (p.strekenSamen || []),
      status: "nieuw", station: 0, nextLabel: "—", geleerdAt: null, raw: p.raw || ""
    };
    var i = -1;
    db.woorden.forEach(function (x, n) { if (x.hz === w.hz) i = n; });
    if (i >= 0) db.woorden[i] = Object.assign(db.woorden[i], w);
    else db.woorden.push(w);
    writeRecallFromWord(w);
    state.cur = w.hz;
    save();
    render();
    document.getElementById("wij").textContent = "Woord " + w.hz + " in de DB.";
  }

  function geleerd() {
    var w = woord();
    w.status = "geleerd";
    w.geleerdAt = Date.now();
    w.station = 0;
    w.nextLabel = "10 min";
    writeRecallFromWord(w);
    save();
    render();
    var bags = Chronos.batch(db.woorden, w.geleerdAt);
    var base = location.href.split("?")[0];
    var plan = bags.map(function (b) { return Chronos.eventFor(b, base); });
    document.getElementById("wij").textContent = state.learner + ": geleerd. " + plan.length + " recall-momenten gepland.";
    fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ woorden: db.woorden, plan: plan, learner: state.learner }) }).catch(function () {});
    return plan;
  }

  function dek() {
    var w = woord();
    state.live = true;
    document.body.classList.add("dicht");
    document.getElementById("cue-txt").textContent = (w.beeldhook || ("Haal " + w.hz + " op.")) + " · " + (w.klankhook || "");
    if (window.Sound) { Sound.unlock(); Sound.bee(); }
  }
  function gezegd() {
    var w = woord();
    w.station = Math.min((w.station || 0) + 1, 5);
    w.nextLabel = Chronos.STATIONS[w.station].label;
    w.status = "geleerd";
    writeRecallFromWord(w);
    save();
    document.body.classList.remove("dicht");
    state.live = false;
    document.getElementById("cue-txt").textContent = state.learner + " · volgende: " + w.nextLabel + ".";
    render();
  }
  function nog() {
    var w = woord();
    w.station = 0; w.nextLabel = "10 min"; w.status = "herhalen";
    writeRecallFromWord(w);
    save();
    document.body.classList.remove("dicht");
    state.live = false;
    document.getElementById("cue-txt").textContent = "Terug bij 10 min. Geen straf.";
    render();
  }
  function niet() {
    document.body.classList.remove("dicht");
    state.live = false;
    document.getElementById("cue-txt").textContent = "Nu niet.";
  }

  function bootQuery() {
    var q = new URLSearchParams(location.search);
    if (q.get("learner") && LEARNERS.indexOf(q.get("learner")) >= 0) {
      setLearner(q.get("learner"));
    }
    var deep = !!(q.get("hz") || q.get("ja") || q.get("nee") || q.get("batch") || (location.hash && location.hash.indexOf("s") === 1));
    if (deep) openDiepte();
    if (q.get("hz")) state.cur = q.get("hz");
    if (q.get("ja")) { state.cur = q.get("ja"); if (state.inDiepte) gezegd(); }
    if (q.get("nee")) { state.cur = q.get("nee"); if (state.inDiepte) nog(); }
    if (q.get("batch")) {
      state.cur = q.get("batch").split(",")[0];
      if (q.get("ok") === "1" && state.inDiepte) gezegd();
      if (q.get("ok") === "0" && state.inDiepte) nog();
    }
    if (state.inDiepte && location.hash) {
      var el = document.querySelector(location.hash);
      if (el) el.scrollIntoView();
    }
  }

  document.querySelectorAll("#hq-learners .learner").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLearner(btn.getAttribute("data-learner"));
    });
  });
  document.getElementById("hq-diepte").onclick = openDiepte;
  document.getElementById("back-hq").onclick = showHQ;

  document.getElementById("zoek").addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var hit = find(this.value);
    if (!hit) { document.getElementById("wij").textContent = "ONBEKEND in DB. Plak de tekst."; return; }
    state.cur = hit.hz; render();
  });
  document.getElementById("say-py").onclick = function () { if (window.Sound) Sound.zi(); else speak(woord().hz); };
  document.getElementById("say-hook").onclick = function () { if (window.Sound) Sound.dzuh(); };
  document.getElementById("play-t3").onclick = function () { if (window.Sound) { Sound.unlock(); Sound.tone3(); } };
  document.getElementById("play-zi").onclick = function () { if (window.Sound) { Sound.unlock(); Sound.zi(); } };
  document.getElementById("play-bee").onclick = function () { if (window.Sound) { Sound.unlock(); Sound.dzuh(); } };
  document.getElementById("play-scène").onclick = function () {
    if (!window.Sound) return;
    Sound.unlock();
    Sound.bee();
    setTimeout(function () { Sound.zi(); }, 600);
    setTimeout(function () { Sound.dzuh(); }, 1400);
  };
  document.getElementById("dek").onclick = dek;
  document.getElementById("gezegd").onclick = gezegd;
  document.getElementById("nog").onclick = nog;
  document.getElementById("niet").onclick = niet;
  document.getElementById("geleerd").onclick = geleerd;
  document.getElementById("plak-go").onclick = function () {
    upsert(document.getElementById("plak-in").value);
  };

  load().then(function () {
    paintLearnerButtons();
    showHQ();
    bootQuery();
    if (state.inDiepte) render();
  });
})();
