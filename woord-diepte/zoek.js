/* Hub-zoeken · Chinese leren 4.6 · zoekt in zoek.json (masterlijst), geen externe diensten */
(function(){
  var inp=document.getElementById('hubzoek'),out=document.getElementById('hubzoek-uit'),W=null,F;
  var TM={'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4};
  function bare(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ü/g,'v').replace(/u:/g,'v').replace(/[^a-z0-9v]/g,'');}
  function tones(s){var t='';for(var i=0;i<s.length;i++){if(TM[s[i]])t+=TM[s[i]];}return t;}
  function low(s){return (s||'').toLowerCase();}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function load(cb){
    if(W)return cb();
    fetch('zoek.json').then(function(r){return r.json();}).then(function(d){
      W=d.w.map(function(r){var py=r[1].normalize('NFC');return{hz:r[0],py:py,nl:r[2],en:r[3],bron:r[4],rad:r[5],st:r[6],k:r[7],o:r[8],b:bare(py),t:tones(py),pl:low(py).replace(/\s+/g,''),txt:low(r[2])+' | '+low(r[3])};});
      cb();
    }).catch(function(){out.innerHTML='<p class="sub">zoek.json niet geladen.</p>';});
  }
  function score(w,q){
    var han=/[\u2e80-\u9fff]/.test(q);
    if(han){
      if(w.hz===q)return 100; if(w.rad.split(' ').indexOf(q)>=0&&w.hz.length===1)return 70;
      if(w.hz.indexOf(q)>=0)return 60-w.hz.length; if(w.rad.indexOf(q)>=0)return 40; return 0;
    }
    var ql=low(q).trim(),s=0,qb=bare(ql),qd=/[0-9]/.test(ql),qm=tones(ql.normalize('NFC'));
    if(qb){
      if(qd){var qt=ql.replace(/[^1-5]/g,'').replace(/5/g,''),qs=qb.replace(/[0-9]/g,'');
        if(w.b===qs&&(w.t===qt||w.t.indexOf(qt)===0))s=95;else if(w.b.indexOf(qs)===0&&w.t.indexOf(qt)===0)s=75;}
      else if(qm){var qp=ql.normalize('NFC').replace(/\s+/g,'');if(w.pl===qp)s=95;else if(w.pl.indexOf(qp)===0)s=75;else if(w.pl.indexOf(qp)>0)s=45;}
      else{if(w.b===qb)s=90;else if(w.b.indexOf(qb)===0)s=65+Math.max(0,10-w.b.length);}
    }
    if(ql.length>=2&&!qd&&!qm){var re=new RegExp('(^|[^a-zà-ÿ])'+ql.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
      var i=w.txt.indexOf(ql);if(i>=0){var t=re.test(w.txt)?85:50;if(w.nl.toLowerCase()===ql||w.en.toLowerCase()===ql)t=98;s=Math.max(s,t-Math.min(20,w.txt.length/10));}}
    return s;
  }
  function tag(w){if(w.st==='4.6')return '<span class="tag ok">4.6 kaart</span>';if(w.st==='3.5')return '<span class="tag">3.5</span>';return '<span class="tag">geen kaart</span>';}
  function run(){
    var q=inp.value.trim();if(!q){out.innerHTML='';return;}
    load(function(){
      var r=[];for(var i=0;i<W.length;i++){var s=score(W[i],q);if(s>0)r.push([s+(W[i].st==='4.6'?3:W[i].st==='3.5'?1:0),W[i]]);}
      r.sort(function(a,b){return b[0]-a[0]||a[1].hz.length-b[1].hz.length;});
      var n=r.length;r=r.slice(0,40);
      out.innerHTML='<p class="sub">'+n+' gevonden'+(n>40?' · eerste 40':'')+'</p>'+r.map(function(x){var w=x[1],h='<span class="hz2">'+esc(w.hz)+'</span>';
        return '<li>'+(w.k?'<a href="'+esc(w.k)+'">'+h+'</a>':h)+' <b>'+esc(w.py)+'</b> · '+esc(w.nl||'—')+' <span class="sub">/ '+esc((w.en||'').split(';')[0])+'</span> '+tag(w)+(w.o?' <span class="tag" title="zie master.json">onzeker</span>':'')+'<div class="sub zb">'+esc(w.bron.split(' | ').slice(0,3).join(' · '))+(w.rad?' · radicaal '+esc(w.rad):'')+'</div></li>';}).join('');
      out.insertAdjacentHTML('afterbegin','');
    });
  }
  inp.addEventListener('input',function(){clearTimeout(F);F=setTimeout(run,120);});
  inp.addEventListener('focus',function(){load(function(){});},{once:true});
  var q=new URLSearchParams(location.search).get('q');if(q){inp.value=q;run();}
})();
