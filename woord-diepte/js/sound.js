/* Geluid: ESC toon-synth (toon 3 = C) + bij-zoem. Geen omschrijving — afspelen. */
(function (g) {
  var ctx;
  function ac() {
    var AC = g.AudioContext || g.webkitAudioContext;
    if (!AC) return null;
    if (!ctx || ctx.state === "closed") ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function bee() {
    var a = ac();
    if (!a) return;
    var n = a.sampleRate * 1.1;
    var buf = a.createBuffer(1, n, a.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
    var src = a.createBufferSource();
    src.buffer = buf;
    var bp = a.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 280;
    bp.Q.value = 8;
    var g1 = a.createGain();
    var now = a.currentTime;
    g1.gain.setValueAtTime(0.0001, now);
    g1.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
    src.connect(bp); bp.connect(g1); g1.connect(a.destination);
    src.start(now); src.stop(now + 1.1);
  }
  function tone3() {
    if (g.TOON && TOON.synth && TOON.synth.playAnchor) return TOON.synth.playAnchor("C", 0.75);
  }
  function zi() {
    if (g.TOON && TOON.synth && TOON.synth.playWord) return TOON.synth.playWord("zǐ");
    try {
      var u = new SpeechSynthesisUtterance("子");
      u.lang = "zh-CN";
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function dzuh() {
    bee();
    setTimeout(function () {
      try {
        var u = new SpeechSynthesisUtterance("DZUH");
        u.lang = "nl-NL";
        u.rate = 0.85;
        speechSynthesis.speak(u);
      } catch (e) {}
    }, 400);
  }
  g.Sound = { bee: bee, tone3: tone3, zi: zi, dzuh: dzuh, unlock: ac };
})(window);
