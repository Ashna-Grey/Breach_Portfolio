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

  /* ---------- background: digital rain + cursor-reactive particles + code fragments ---------- */
  (function bg(){
    var c=$('#bgCanvas'),x=c.getContext('2d'),rc=$('#rainCanvas'),rx=rc.getContext('2d');
    var W,H,P=[],cols=[],fs=15,mouse={x:-999,y:-999},raf=0,last=0,CH='01{}[]<>/\\|#$%&=+*;:ABCDEF23456789';
    function red(){return html.classList.contains('tone-red')}
    function size(){
      W=c.width=rc.width=innerWidth;H=c.height=rc.height=innerHeight;
      fs=W<700?18:15;var n=Math.floor(W/fs);cols=[];
      for(var i=0;i<n;i++)cols.push({y:Math.random()*H/fs,v:.3+Math.random()*.7});
      var np=Math.min(60,Math.floor(W*H/26000));P=[];
      for(var j=0;j<np;j++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.4+.5});
      rx.clearRect(0,0,W,H);
      if(reduceMQ.matches)parts();
    }
    function rain(){
      rx.globalCompositeOperation='destination-out';rx.fillStyle='rgba(0,0,0,.14)';rx.fillRect(0,0,W,H);
      rx.globalCompositeOperation='source-over';rx.font=fs+'px "Share Tech Mono",monospace';
      rx.fillStyle=red()?'rgba(255,48,48,.9)':'rgba(0,255,136,.9)';
      for(var i=0;i<cols.length;i++){
        var cl=cols[i];
        rx.fillText(CH.charAt((Math.random()*CH.length)|0),i*fs,cl.y*fs);
        cl.y+=cl.v;
        if(cl.y*fs>H&&Math.random()>.975)cl.y=0;
      }
    }
    function parts(){
      x.clearRect(0,0,W,H);
      var col=red()?'255,48,48':'0,255,136',i,j,p,q;
      for(i=0;i<P.length;i++){
        p=P[i];
        var dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy)||1;
        if(d<130){p.vx+=dx/d*.05;p.vy+=dy/d*.05}
        p.vx*=.995;p.vy*=.995;
        var sp=Math.sqrt(p.vx*p.vx+p.vy*p.vy);if(sp>1.2){p.vx*=1.2/sp;p.vy*=1.2/sp}
        if(!reduceMQ.matches){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0}
        x.fillStyle='rgba('+col+',.8)';x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.fill();
        for(j=i+1;j<P.length;j++){
          q=P[j];var ex=p.x-q.x,ey=p.y-q.y,e=ex*ex+ey*ey;
          if(e<9000){x.strokeStyle='rgba('+col+','+((1-e/9000)*.2)+')';x.lineWidth=.6;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke()}
        }
        if(d<150){x.strokeStyle='rgba('+col+','+((1-d/150)*.5)+')';x.lineWidth=.8;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(mouse.x,mouse.y);x.stroke()}
      }
    }
    function loop(t){
      raf=requestAnimationFrame(loop);
      if(document.hidden||t-last<33)return;
      last=t;rain();parts();
    }
    function kick(){cancelAnimationFrame(raf);if(reduceMQ.matches){parts()}else raf=requestAnimationFrame(loop)}
    window.addEventListener('resize',size);
    window.addEventListener('pointermove',function(e){mouse.x=e.clientX;mouse.y=e.clientY},{passive:true});
    document.addEventListener('pointerleave',function(){mouse.x=mouse.y=-999});
    reduceMQ.addEventListener&&reduceMQ.addEventListener('change',function(){size();kick()});
    /* drifting code fragments (pure CSS motion) */
    var fr=$('#frags'),F=['chmod 600 id_rsa','0x7f3a9c21','SELinux: enforcing','sudo systemctl status ssh','trust = infer(context)','ssh -i key.pem','def verify_mfa(user):','SELECT * FROM ledger;','nmap -sV 192.0.2.0/24','0xdeadbeef','if risk > threshold: step_up()','git commit -m "ship it"'];
    if(fr)F.forEach(function(t,i){
      var s=document.createElement('span');s.className='frag';s.textContent=t;
      s.style.left=(4+(i*83)%88)+'%';s.style.animationDuration=(22+(i*7)%16)+'s';s.style.animationDelay='-'+((i*5)%24)+'s';
      fr.appendChild(s);
    });
    size();kick();
  })();

  /* ---------- gate ---------- */
  var gate=$('#gate'),portfolio=$('#portfolio');
  var views={landing:$('#view-landing'),easy:$('#view-easy'),medium:$('#view-medium'),transition:$('#view-transition')};
  var current='landing',game=null,puzzles=null,easyToken=0,bootTimers=[],transTimers=[],transSkip=null;

  function show(name){
    Object.keys(views).forEach(function(k){views[k].hidden=(k!==name)});
    current=name;
    var red=name==='medium';
    gate.classList.toggle('tone-red',red);html.classList.toggle('tone-red',red);
    var st=$('#gateStatusText');if(st)st.textContent=red?'RESTRICTED ZONE':(name==='easy'?'FIREWALL ACTIVE':'SYSTEM LOCKED');
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
      html.classList.remove('locked','tone-red');html.classList.add('unlocked');
      gate.classList.remove('leaving','tone-red');
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
    if(window.BreachProjects)BreachProjects.close();
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
        result.innerHTML='<p class="gotcha">GOTCHA!</p><p class="quote">You thought breaking into my website would be that easy?</p><p class="sub">Don&rsquo;t worry. I respect the attempt.</p><p class="meta">'+n+' / 35 attacks &middot; '+(reason==='time'?'time expired':'health depleted')+'</p><div class="btn-row"><button type="button" class="btn btn-primary" data-action="enter">ENTER PORTFOLIO ANYWAY</button><button type="button" class="btn btn-red" data-action="retry">TRY AGAIN</button></div>';
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
    var roles=['Software Developer','Cybersecurity Researcher','AI/ML Enthusiast','IEEE CS Chapter Chair'],ri=0,n=0,del=false;
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
  /* skills filters */
  var fbtns=$$('.f-btn');
  fbtns.forEach(function(b){b.addEventListener('click',function(){
    var f=b.getAttribute('data-f'),n=0;
    fbtns.forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});
    $$('.chip').forEach(function(c){var show=(f==='all'||c.getAttribute('data-cat')===f);c.hidden=!show;if(show)n++;c.classList.remove('sel')});
    readout.textContent='> '+(f==='all'?'all categories':b.textContent)+': '+n+' skills';
  })});
  /* project showcase (lazy-loaded) */
  function openProject(id,from){
    loadScript('js/projects.js').then(function(){BreachProjects.open(id,from)}).catch(function(){});
  }
  document.addEventListener('click',function(e){
    if(e.target.closest('a'))return;
    var t=e.target.closest('[data-open]');
    if(!t||!portfolio.contains(t))return;
    e.preventDefault();openProject(t.getAttribute('data-open'),t);
  });
  /* easter egg: Konami code */
  var KON=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],ki=0,toastT=0;
  window.BreachToast=function(msg){
    var t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},3200);
  };
  document.addEventListener('keydown',function(e){
    if(html.classList.contains('locked')||/^(INPUT|TEXTAREA)$/.test((document.activeElement||{}).tagName||''))return;
    ki=(e.key===KON[ki]||e.key.toLowerCase()===KON[ki])?ki+1:(e.key===KON[0]?1:0);
    if(ki===KON.length){ki=0;html.classList.add('matrix-boost');BreachToast('ACCESS LEVEL: ROOT. (Just kidding. Thanks for exploring.)');setTimeout(function(){html.classList.remove('matrix-boost')},6000)}
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
    var dm=/^#project-(\w+)$/.exec(location.hash);if(dm)openProject(dm[1],null);
  }
})();
