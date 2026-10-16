/* 10 min → 1 uur → 1 dag → 1 week → 1 maand → 1 jaar. Batch zelfde kalenderdag. */
(function (g) {
  var STATIONS = [
    { id: 0, ms: 10 * 60 * 1000, label: "10 min" },
    { id: 1, ms: 60 * 60 * 1000, label: "1 uur" },
    { id: 2, ms: 864e5, label: "1 dag" },
    { id: 3, ms: 7 * 864e5, label: "1 week" },
    { id: 4, ms: 30 * 864e5, label: "1 maand" },
    { id: 5, ms: 365 * 864e5, label: "1 jaar" }
  ];
  function dayKey(t) {
    var d = new Date(t);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function cycle(from) {
    var t0 = from || Date.now();
    return STATIONS.map(function (s) {
      return { station: s.id, label: s.label, at: t0 + s.ms, day: dayKey(t0 + s.ms) };
    });
  }
  function batch(woorden, from) {
    var bags = {};
    (woorden || []).forEach(function (w) {
      if (w.status !== "geleerd") return;
      cycle(w.geleerdAt || from).forEach(function (hit) {
        if (hit.station < 2) {
          var k = w.hz + "@" + hit.label;
          bags[k] = { day: hit.day, at: hit.at, label: hit.label, woorden: [w], single: true };
          return;
        }
        var k = hit.day + ":" + hit.label;
        if (!bags[k]) bags[k] = { day: hit.day, at: hit.at, label: hit.label, woorden: [], single: false };
        bags[k].woorden.push(w);
      });
    });
    return Object.keys(bags).map(function (k) { return bags[k]; }).sort(function (a, b) { return a.at - b.at; });
  }
  function stepUrls(href, hz) {
    var b = href.split("#")[0].split("?")[0];
    var q = "?hz=" + encodeURIComponent(hz);
    return {
      open: b + q,
      kaart: b + q + "#s1",
      klank: b + q + "#s2",
      schrift: b + q + "#s3",
      beeld: b + q + "#s4",
      recall: b + q + "#s5",
      streep: b + q + "#s6",
      yes: b + "?ja=" + encodeURIComponent(hz),
      no: b + "?nee=" + encodeURIComponent(hz)
    };
  }
  function eventFor(bag, base) {
    var href = base || "";
    if (bag.woorden.length === 1 && bag.single) {
      var w = bag.woorden[0];
      var u = stepUrls(href, w.hz);
      return {
        title: "Recall 3.5: " + w.hz + " (" + (w.pinyin || "") + ") · " + bag.label,
        at: bag.at,
        label: bag.label,
        yes: u.yes,
        no: u.no,
        open: u.open,
        steps: u,
        hook: w.klankhook || "",
        doe: (w.recallDoe || []).slice(0, 3).join(" · "),
        desc:
          "VORM 3.5. Geen quiz.\n" +
          "HOOK " + (w.klankhook || "") + "\n" +
          "DOE " + (w.recallDoe || []).slice(0, 3).join(" / ") + "\n" +
          "kaart " + u.kaart + "\nklank " + u.klank + "\nschrift " + u.schrift +
          "\nbeeld " + u.beeld + "\nrecall " + u.recall + "\nstreep " + u.streep +
          "\nJA " + u.yes + "\nNEE " + u.no
      };
    }
    var ids = bag.woorden.map(function (w) { return w.hz; }).join(",");
    var first = bag.woorden[0] || { hz: "" };
    var u0 = stepUrls(href, first.hz);
    return {
      title: "Recall 3.5 batch " + bag.woorden.length + " · " + bag.label,
      at: bag.at,
      label: bag.label,
      yes: href.split("?")[0] + "?batch=" + encodeURIComponent(ids) + "&ok=1",
      no: href.split("?")[0] + "?batch=" + encodeURIComponent(ids) + "&ok=0",
      open: u0.open,
      desc: "VORM 3.5 batch: " + ids + "\nEerste: " + u0.recall
    };
  }
  g.Chronos = { STATIONS: STATIONS, cycle: cycle, batch: batch, eventFor: eventFor, stepUrls: stepUrls, dayKey: dayKey };
})(window);
