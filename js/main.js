/* BREACH.exe controller: gate (landing, Easy, Medium, Hard) + portfolio interactions. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var html=document.documentElement;
  var reduceMQ=window.matchMedia('(prefers-reduced-motion: reduce)');
  var store={
    get:function(k){try{return sessionStorage.getItem(k)}catch(e){return null}},
    set:function(k,v){try{sessionStorage.setItem(k,v)}catch(e){}},
    del:function(k){try{sessionStorage.removeItem(k)}catch(e){}}
  };
  var sfx=window.Sfx;
  var scripts={};
  function loadScript(src){
    if(scripts[src])return scripts[src];
    scripts[src]=new Promise(function(res,rej){
      var s=document.createElement('script'); s.src=src; s.async=true;
      s.onload=res; s.onerror=function(){delete scripts[src];s.remove();rej(new Error('failed '+src))};
      document.head.appendChild(s);
    });
    return scripts[src];
  }

  /* ---------- background particles (single canvas, paused when hidden) ---------- */
  (function bg(){
    var c=$('#bgCanvas'),x=c.getContext('2d'),W,H,P=[],raf=0;
    function size(){
      W=c.width=innerWidth;H=c.height=innerHeight;
      var n=Math.min(80,Math.floor(W*H/20000));
      P=[];for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()*1.4+.4,c:i%3===0?'#8b5cf6':'#22e4ff'});
      if(reduceMQ.matches)frame(true);
    }
    function frame(once){
      x.clearRect(0,0,W,H);
      for(var i=0;i<P.length;i++){
        var p=P[i];
        if(!once){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0}
        x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.fill();
        for(var j=i+1;j<P.length;j++){
          var q=P[j],dx=p.x-q.x,dy=p.y-q.y,d=dx*dx+dy*dy;
          if(d<9000){x.strokeStyle='rgba(34,228,255,'+((1-d/9000)*.22)+')';x.lineWidth=.6;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke()}
        }
      }
      if(!once&&!document.hidden&&!reduceMQ.matches)raf=requestAnimationFrame(function(){frame(false)});
    }
    function kick(){cancelAnimationFrame(raf);if(reduceMQ.matches)frame(true);else frame(false)}
    window.addEventListener('resize',size);
    document.addEventListener('visibilitychange',kick);
    size();kick();
  })();

  /* ---------- gate ---------- */
  var gate=$('#gate'),portfolio=$('#portfolio');
  var views={landing:$('#view-landing'),easy:$('#view-easy'),medium:$('#view-medium'),transition:$('#view-transition')};
  var current='landing',game=null,puzzles=null,easyToken=0,bootTimers=[],transTimers=[],transSkip=null;

  function show(name){
    Object.keys(views).forEach(function(k){views[k].hidden=(k!==name)});
    current=name;
    var f=$('[data-focus]',views[name]);
    if(f&&name!=='landing')f.focus({preventScroll:true});
    gate.scrollTop=0;
  }
  function lockPortfolio(on){
    if(on){portfolio.setAttribute('inert','');portfolio.setAttribute('aria-hidden','true')}
    else{portfolio.removeAttribute('inert');portfolio.removeAttribute('aria-hidden')}
  }
  function stopModes(){
    easyToken++;
    if(game){game.destroy();game=null}
    if(puzzles){puzzles.destroy();puzzles=null}
    clearTransition();
  }

  /* boot sequence on the landing view */
  var bootLines=$$('.boot-line'),levels=$('#levels'),skipIntroBtn=$('#skipIntro');
  function finishBoot(){
    bootTimers.forEach(function(t){clearTimeout(t);clearInterval(t)});bootTimers=[];
    bootLines.forEach(function(l){l.textContent=l.getAttribute('data-text')});
    levels.classList.add('ready');skipIntroBtn.hidden=true;store.set('breach.intro','1');
  }
  function runBoot(){
    levels.classList.remove('ready');skipIntroBtn.hidden=false;
    if(reduceMQ.matches){finishBoot();return}
    var t=0;
    bootLines.forEach(function(l){
      var txt=l.getAttribute('data-text');l.textContent='';
      bootTimers.push(setTimeout(function(){
        var n=0,iv=setInterval(function(){l.textContent=txt.slice(0,++n);if(n>=txt.length)clearInterval(iv)},13);
        bootTimers.push(iv);
      },t));
      t+=txt.length*13+240;
    });
    bootTimers.push(setTimeout(finishBoot,t+150));
  }
  function toMenu(){
    stopModes();store.del('breach.mode');show('landing');
    if(!levels.classList.contains('ready'))finishBoot();
    var first=$('.level',levels);if(first)first.focus({preventScroll:true});
  }

  /* entering the portfolio */
  function unlock(){
    stopModes();
    store.set('breach.entered','1');store.del('breach.mode');
    sfx&&sfx.play('unlock');
    gate.classList.add('leaving');
    setTimeout(function(){
      html.classList.remove('locked');html.classList.add('unlocked');
      gate.classList.remove('leaving');
      lockPortfolio(false);
      window.scrollTo(0,0);
      var m=$('#main');m.focus({preventScroll:true});
      startRoles();
    },reduceMQ.matches?0:300);
  }
  function replay(){
    stopModes();
    ['breach.entered','breach.intro','breach.medium','breach.medium.skip','breach.mode'].forEach(store.del);
    try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
    html.classList.remove('unlocked');html.classList.add('locked');
    lockPortfolio(true);window.scrollTo(0,0);
    if(window.BreachTerminal)BreachTerminal.close();
    show('landing');runBoot();
  }

  /* Hard mode transition (about 1.8 s, skippable) */
  function clearTransition(){
    transTimers.forEach(clearTimeout);transTimers=[];
    if(transSkip){document.removeEventListener('keydown',transSkip,true);views.transition.removeEventListener('click',transSkip);transSkip=null}
  }
  function enterHard(){
    show('transition');
    var box=$('#transLines');box.innerHTML='';
    var L=[['> Bypassing all security layers...',''],['> Evaluating confidence...',''],['> WARNING: You are about to meet your next potential hire.','warn'],['> ACCESS GRANTED.','ok']];
    var finished=false;
    function end(){if(finished)return;finished=true;clearTransition();unlock()}
    transSkip=end;
    document.addEventListener('keydown',transSkip,true);
    views.transition.addEventListener('click',transSkip);
    var step=reduceMQ.matches?0:450;
    L.forEach(function(l,i){
      transTimers.push(setTimeout(function(){
        var p=document.createElement('p');p.textContent=l[0];if(l[1])p.className=l[1];box.appendChild(p);sfx&&sfx.play('tick');
      },i*step));
    });
    transTimers.push(setTimeout(end,L.length*step+(reduceMQ.matches?100:250)));
  }

  /* Easy mode */
  function enterEasy(){
    show('easy');
    var wrap=$('#gameWrap'),status=$('#gameStatus'),result=$('#gameResult');
    result.hidden=true;result.innerHTML='';wrap.innerHTML='';
    status.textContent='Loading battle module...';
    var token=++easyToken;
    loadScript('js/vendor/phaser.min.js').then(function(){return loadScript('js/game.js')}).then(function(){
      if(token!==easyToken)return;
      startGame(token);
    }).catch(function(){
      if(token!==easyToken)return;
      status.textContent='';
      result.hidden=false;
      result.innerHTML='<p class="sub">The battle module could not load (offline or blocked). You can still get in.</p><div class="btn-row"><button type="button" class="btn btn-primary" data-action="enter">ENTER PORTFOLIO ANYWAY</button><button type="button" class="btn btn-ghost" data-action="retry">TRY AGAIN</button></div>';
    });
  }
  function startGame(token){
    var wrap=$('#gameWrap'),status=$('#gameStatus'),result=$('#gameResult');
    if(game){game.destroy();game=null}
    result.hidden=true;result.innerHTML='';
    status.textContent='Land 35 attacks in 10 seconds. Click, tap, or press Space.';
    wrap.focus({preventScroll:true});
    game=BreachGame.start(wrap,{reducedMotion:reduceMQ.matches,sfx:sfx,
      onWin:function(n){
        status.textContent='Firewall breached.';
        result.hidden=false;
        result.innerHTML='<p class="rl">&gt; FIREWALL BREACHED</p><p class="rl">&gt; ASHNA.OS DEFEATED</p><p class="rl">&gt; ACCESS GRANTED</p><p class="quote">Impressive. You&rsquo;ve earned your way in.</p><button type="button" class="btn btn-primary" data-action="enter">ENTER ASHNA&rsquo;S PORTFOLIO</button>';
        var b=$('[data-action=enter]',result);if(b)b.focus();
      },
      onLose:function(reason,n){
        status.textContent='Breach failed.';
        result.hidden=false;
        result.innerHTML='<p class="gotcha">GOTCHA!</p><p class="quote">You thought breaking into my website would be that easy?</p><p class="sub">Don&rsquo;t worry. I respect the attempt.</p><p class="meta">'+n+' / 35 attacks &middot; '+(reason==='time'?'time expired':'health depleted')+'</p><div class="btn-row"><button type="button" class="btn btn-primary" data-action="enter">ENTER PORTFOLIO ANYWAY</button><button type="button" class="btn btn-magenta" data-action="retry">TRY AGAIN</button></div>';
        var b=$('[data-action=retry]',result);if(b)b.focus();
      }});
  }

  /* Medium mode */
  function enterMedium(){
    show('medium');store.set('breach.mode','medium');
    var root=$('#puzzleRoot');root.innerHTML='<p class="game-status">Loading...</p>';
    var token=++easyToken;
    loadScript('js/puzzles.js').then(function(){
      if(token!==easyToken)return;
      if(puzzles)puzzles.destroy();
      puzzles=BreachPuzzles.mount(root,{onComplete:unlock});
    }).catch(function(){
      root.innerHTML='<div class="result" style="position:static"><p class="sub">The challenge module could not load. You can still get in.</p><button type="button" class="btn btn-primary" data-action="enter">ENTER PORTFOLIO</button></div>';
    });
  }

  gate.addEventListener('click',function(e){
    var lv=e.target.closest('[data-level]'),ac=e.target.closest('[data-action]');
    if(lv){
      sfx&&sfx.play('ui');
      var l=lv.getAttribute('data-level');
      if(l==='easy')enterEasy();else if(l==='medium')enterMedium();else enterHard();
      return;
    }
    if(ac){
      var a=ac.getAttribute('data-action');
      if(a==='enter')unlock();
      else if(a==='menu')toMenu();
      else if(a==='retry')enterEasy();
    }
  });
  skipIntroBtn.addEventListener('click',finishBoot);

  /* sound toggles (gate + nav) */
  document.addEventListener('click',function(e){
    if(e.target.closest('.snd-toggle')&&sfx)sfx.toggle();
  });
  sfx&&sfx.sync();

  /* ---------- portfolio ---------- */
  function startRoles(){
    var el=$('#roleText');if(!el||el.getAttribute('data-run'))return;
    el.setAttribute('data-run','1');
    if(reduceMQ.matches)return;
    var roles=['Cybersecurity Researcher','Developer','AI Enthusiast','Zero Trust Researcher','IEEE CS Chapter Chair'],ri=0,n=0,del=false;
    (function tick(){
      var w=roles[ri];
      if(!del){el.textContent=w.slice(0,++n);if(n===w.length){del=true;return setTimeout(tick,1400)}}
      else{el.textContent=w.slice(0,--n);if(n===0){del=false;ri=(ri+1)%roles.length}}
      setTimeout(tick,del?35:70);
    })();
  }
  function togglePanel(btn,force){
    var host=btn.parentElement,region=document.getElementById(btn.getAttribute('aria-controls'));
    var open=typeof force==='boolean'?force:btn.getAttribute('aria-expanded')!=='true';
    btn.setAttribute('aria-expanded',String(open));
    host.classList.toggle('open',open);
    if(region){if(open)region.removeAttribute('inert');else region.setAttribute('inert','')}
  }
  $$('.toggle').forEach(function(b){
    var r=document.getElementById(b.getAttribute('aria-controls'));if(r)r.setAttribute('inert','');
    // the .open class lives on the card that directly contains both button and region
    b.addEventListener('click',function(){togglePanel(b)});
  });
  /* project cards: tilt on desktop only */
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduceMQ.matches){
    $$('[data-tilt]').forEach(function(c){
      c.addEventListener('pointermove',function(e){
        var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
        c.style.setProperty('--ry',(px*7).toFixed(2)+'deg');c.style.setProperty('--rx',(-py*7).toFixed(2)+'deg');
      });
      c.addEventListener('pointerleave',function(){c.style.setProperty('--ry','0deg');c.style.setProperty('--rx','0deg')});
    });
  }
  /* heading reveal + active nav link */
  if('IntersectionObserver' in window){
    var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}})},{threshold:.2});
    $$('.reveal-head').forEach(function(h){ro.observe(h)});
    var links={};$$('.nav-links a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
    var so=new IntersectionObserver(function(es){es.forEach(function(e){
      var a=links[e.target.id];if(!a)return;
      if(e.isIntersecting){$$('.nav-links a').forEach(function(x){x.classList.remove('active')});a.classList.add('active')}
    })},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(links).forEach(function(id){var s=document.getElementById(id);if(s)so.observe(s)});
  }else{$$('.reveal-head').forEach(function(h){h.classList.add('in')})}
  /* nav menu (mobile) */
  var burger=$('#navBurger'),navLinks=$('#navLinks');
  burger.addEventListener('click',function(){var o=navLinks.classList.toggle('open');burger.setAttribute('aria-expanded',String(o))});
  navLinks.addEventListener('click',function(e){if(e.target.closest('a')){navLinks.classList.remove('open');burger.setAttribute('aria-expanded','false')}});
  /* skills readout */
  var readout=$('#skillReadout');
  function tip(c){
    $$('.chip.sel').forEach(function(x){x.classList.remove('sel')});c.classList.add('sel');
    readout.textContent='> '+c.textContent+': '+c.getAttribute('data-tip');
  }
  $$('.chip').forEach(function(c){
    c.addEventListener('mouseenter',function(){tip(c)});c.addEventListener('focus',function(){tip(c)});c.addEventListener('click',function(){tip(c)});
  });
  /* replay + terminal */
  $('#replayBtn').addEventListener('click',replay);
  $('#termToggle').addEventListener('click',function(){
    loadScript('js/terminal.js').then(function(){BreachTerminal.toggle()}).catch(function(){});
  });

  /* ---------- init ---------- */
  var sprite=$('#miniFighters');if(sprite&&window.BreachSprites)BreachSprites.drawMini(sprite);
  if(html.classList.contains('locked')){
    lockPortfolio(true);
    if(store.get('breach.mode')==='medium'){finishBoot();enterMedium()}
    else if(store.get('breach.intro')==='1'){finishBoot();show('landing')}
    else{show('landing');runBoot()}
  }else{
    lockPortfolio(false);
    store.set('breach.entered','1');                      // deep links (#projects) count as entered
    startRoles();
  }
})();
