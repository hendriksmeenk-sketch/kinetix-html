/* Zoeken · Chinese leren 4.6 · alle woorden uit zoek.json (masterlijst), geen externe diensten.
   Zoekt op hanzi, pinyin (tonen, cijfers of geen), Nederlands, Engels, Spaans, thema en radicaal/onderdeel. */
(function(){
  var inp=document.getElementById('hubzoek'),out=document.getElementById('hubzoek-uit'),W=null,TH={},F,MAX=50;
  if(!inp||!out)return;
  var TM={'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4};
  var HAN=/[\u2e80-\u2fdf\u3400-\u9fff\uf900-\ufaff]/;
  function fold(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').normalize('NFC');}
  function bare(s){return fold(String(s).replace(/ü|ǖ|ǘ|ǚ|ǜ|Ü/g,'v')).replace(/u:/g,'v').replace(/[^a-z]/g,'');}
  function tones(s){var t='';s=(s||'').normalize('NFC');for(var i=0;i<s.length;i++){if(TM[s[i]])t+=TM[s[i]];}return t;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function woorden(s){return fold(s).split(/[^a-z0-9ñ]+/).filter(Boolean);}
  function load(cb){
    if(W)return cb();
    out.innerHTML='<li class="sub">laden…</li>';
    fetch('zoek.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw r.status;return r.json();}).then(function(d){
      var f=d.velden,ix={};f.forEach(function(n,i){ix[n]=i;});TH=d.themas||{};
      W=d.w.map(function(r){
        var g=function(n){return ix[n]==null?'':(r[ix[n]]||'');};
        var py=String(g('py')).normalize('NFC'),th=g('thema')||[],thw=[];
        th.forEach(function(t){thw.push(fold(t));(TH[t]||[]).forEach(function(x){thw.push(fold(x));});});
        var nl=g('nl'),en=g('en'),es=g('es');
        return{hz:g('hz'),py:py,nl:nl,en:en,es:es,bron:g('bron'),rad:g('rad'),st:g('status'),k:g('kaart'),o:g('onzeker'),gen:g('gegenereerd'),th:th,
          b:bare(py),bu:bare(py).replace(/v/g,'u'),t:tones(py),
          mean:[fold(nl),fold(en),fold(es)],ww:woorden(nl+' ; '+en+' ; '+es),thw:thw};
      });cb();
    }).catch(function(e){out.innerHTML='<li class="sub">De woordenlijst kon niet laden ('+esc(e)+'). Probeer de pagina te verversen.</li>';});
  }
  function score(w,q){
    if(HAN.test(q)){
      var qh=q.replace(/[^\u2e80-\u2fdf\u3400-\u9fff\uf900-\ufaff]/g,'');
      if(w.hz===qh)return 1000;
      if(w.hz.indexOf(qh)===0)return 700-w.hz.length;
      if(w.hz.indexOf(qh)>0)return 650-w.hz.length;
      if(qh.length===1&&w.rad.split(' ').indexOf(qh)>=0)return 450-w.hz.length;
      return 0;
    }
    var ql=q.toLowerCase().normalize('NFC').trim(),qf=fold(ql),s=0;
    var qd=ql.replace(/[^1-5]/g,'').replace(/5/g,''),qm=tones(ql),qt=qd||qm,qb=bare(ql);
    if(qb){ // pinyin
      var b=(w.b===qb||w.bu===qb)?2:(w.b.indexOf(qb)===0||w.bu.indexOf(qb)===0)?1:0;
      if(b){var tok=!qt||w.t===qt?2:w.t.indexOf(qt)===0?1:0;
        if(tok)s=b===2?(tok===2&&qt?960:900):(qb.length>=2?600-(w.b.length-qb.length)*5:0);}
    }
    if(qf.length>=2&&!qd){ // betekenis NL/EN/ES + thema
      for(var i=0;i<3;i++){var m=w.mean[i];if(!m)continue;
        var parts=m.split(/\s*[;,]\s*/);for(var j=0;j<parts.length;j++){var p=parts[j].replace(/^(to|om te|te|para|el|la|een|de|het|a|an|the) /,'');if(p===qf||parts[j]===qf){s=Math.max(s,i===0?880:850);}}
      }
      if(w.ww.indexOf(qf)>=0)s=Math.max(s,700);
      else if(qf.length>=3&&w.ww.some(function(x){return x.indexOf(qf)===0;}))s=Math.max(s,520);
      else if(qf.length>=4&&w.mean.some(function(m){return m.indexOf(qf)>=0;}))s=Math.max(s,300);
      if(w.thw.some(function(x){return x===qf||(qf.length>=4&&x.indexOf(qf)===0);}))s=s>=560?s+40:560;
    }
    return s;
  }
  function bron(b){var l=b.split(' | ').map(function(x){return x.replace('WOORD DIEPTE woorden.json','Woord-diepte').replace(/ · A-Z \(les onbekend\)/,'');});
    var u=[];l.forEach(function(x){if(u.indexOf(x)<0)u.push(x);});return u.slice(0,2).join(' · ')+(u.length>2?' · +'+(u.length-2):'');}
  function kaart(w){
    if(w.st==='4.6'&&w.k)return '<a class="zk-kaart" href="'+esc(w.k)+'">open 4.6-kaart →</a>';
    return '<span class="zk-geen">nog geen kaart</span>'+(w.st==='3.5'&&w.k?' <a class="zk-oud" href="'+esc(w.k)+'">3.5-versie</a>':'');
  }
  function run(){
    var q=inp.value.trim();
    try{var u=new URL(location.href);if(q)u.searchParams.set('q',q);else u.searchParams.delete('q');history.replaceState(null,'',u);}catch(e){}
    if(!q){out.innerHTML='';return;}
    load(function(){
      if(inp.value.trim()!==q)return;
      var r=[];for(var i=0;i<W.length;i++){var s=score(W[i],q);if(s>0)r.push([s+(W[i].st==='4.6'?3:0),W[i]]);}
      r.sort(function(a,b){return b[0]-a[0]||a[1].hz.length-b[1].hz.length;});
      var n=r.length;r=r.slice(0,MAX);
      if(!n){out.innerHTML='<li class="sub">Niets gevonden voor “'+esc(q)+'”. Probeer een hanzi (手), pinyin (shouji) of een woord (telefoon, family).</li>';return;}
      out.innerHTML='<li class="sub zk-n">'+n+' gevonden'+(n>MAX?' · eerste '+MAX:'')+'</li>'+r.map(function(x){var w=x[1];
        var es=w.es?' · <i>es</i> '+esc(w.es):'',en=w.en?'<i>en</i> '+esc(w.en.split(';').slice(0,2).join(';')):'';
        return '<li class="zk"><div class="zk-hz" lang="zh">'+esc(w.hz)+'</div><div class="zk-txt"><div><b class="zk-py">'+esc(w.py)+'</b> <span class="zk-nl">'+esc(w.nl||'—')+'</span></div>'+
          '<div class="zk-klein">'+en+es+'</div><div class="zk-klein zk-bron">'+esc(bron(w.bron))+(w.rad&&w.rad!==w.hz?' · radicaal '+esc(w.rad):'')+(w.th.length?' · '+esc(w.th.join(', ')):'')+(w.gen?' · <span title="betekenis/thema automatisch aangevuld, nog te controleren">NL auto</span>':'')+'</div><div>'+kaart(w)+'</div></div></li>';}).join('');
    });
  }
  inp.addEventListener('input',function(){clearTimeout(F);F=setTimeout(run,150);});
  inp.addEventListener('search',run);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();run();inp.blur();}});
  inp.addEventListener('focus',function(){load(function(){if(!inp.value.trim())out.innerHTML='';});},{once:true});
  var q0=new URLSearchParams(location.search).get('q');if(q0){inp.value=q0;run();}
})();
