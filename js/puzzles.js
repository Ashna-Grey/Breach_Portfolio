/* HACK MY WEBSITE: three beginner puzzles. Entirely client-side and fictional; nothing is scanned, sent or attacked. */
(function(){
  'use strict';
  var KEY='breach.medium';
  function get(){try{return sessionStorage.getItem(KEY)}catch(e){return null}}
  function put(v){try{sessionStorage.setItem(KEY,v)}catch(e){}}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var LOCK='<svg class="lock-ico" id="lockIco" viewBox="0 0 40 48" width="44" height="52" aria-hidden="true"><path class="sh" d="M11 21v-6a9 9 0 0118 0v6" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><rect x="5" y="21" width="30" height="22" rx="3" fill="currentColor"/><circle cx="20" cy="31" r="3" fill="#050814"/></svg>';

  function mount(root,opts){
    var sfx=window.Sfx||{play:function(){}};
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var state={step:Math.min(3,parseInt(get()||'0',10)||0),skipped:{}};
    try{var sk=JSON.parse(sessionStorage.getItem(KEY+'.skip')||'{}');state.skipped=sk||{}}catch(e){}
    var timers=[], hintLevel=0, resumed=state.step>0, introPlayed=resumed;

    function later(fn,ms){timers.push(setTimeout(fn,ms))}
    function save(){put(String(state.step));try{sessionStorage.setItem(KEY+'.skip',JSON.stringify(state.skipped))}catch(e){}}
    function pips(){
      var h='';
      for(var i=0;i<3;i++)h+='<span class="pip'+(i<state.step?(state.skipped[i]?' skip':' on'):'')+'"></span>';
      return '<div class="pz-layers" role="img" aria-label="Security layers bypassed: '+state.step+' of 3">'+h+'</div>';
    }
    function shell(inner){
      root.innerHTML='<div class="pz-win"><div class="pz-head"><span>TARGET: ASHNA.OS &middot; SECURITY LEVEL: MEDIUM</span>'+pips()+'</div><div class="pz-body">'+inner+'</div></div>';
    }
    function log(lines,cls){
      var el=root.querySelector('#pzLog'); if(!el)return;
      lines.forEach(function(l){var p=document.createElement('p');if(cls)p.className=cls;p.textContent=l;el.appendChild(p)});
    }
    function typeLines(lines,done){
      var el=root.querySelector('#pzLog'),i=0;
      if(!el){done&&done();return}
      (function next(){
        if(i>=lines.length){var c=el.querySelector('.cur');if(c)c.remove();done&&done();return}
        var p=document.createElement('p'),txt=lines[i++];
        el.appendChild(p);
        if(reduce){p.textContent=txt;later(next,40);return}
        var n=0;
        (function ch(){
          p.textContent=txt.slice(0,++n);
          if(n<txt.length)later(ch,14);else later(next,160);
        })();
      })();
    }

    /* ----- intro ----- */
    function intro(){
      shell('<div class="pz-log" id="pzLog" aria-live="polite"></div>');
      typeLines(['> SECURE SYSTEM DETECTED','> TARGET: ASHNA.OS','> SECURITY LEVEL: MEDIUM','> OBJECTIVE: COMPLETE THREE CHALLENGES','> INITIALIZING INFILTRATION...'],function(){
        introPlayed=true; render();
      });
    }

    /* ----- challenge frames ----- */
    function head(n,title){
      return '<div class="pz-log" id="pzLog" aria-live="polite"><p class="info">&gt; SECURITY LAYER '+n+' OF 3</p></div><h2 class="pz-title">'+title+'</h2>';
    }
    function actions(){
      return '<div class="pz-actions"><button type="button" class="btn btn-ghost" data-pz="hint">Hint</button><button type="button" class="btn btn-ghost" data-pz="skip">Skip challenge</button></div><div id="pzHint" aria-live="polite"></div>';
    }
    function success(lines,note,lastLines){
      var lock=root.querySelector('#lockIco'); if(lock)lock.classList.add('open');
      log(lines,'');
      sfx.play('unlock');
      state.step++; save();
      var pz=root.querySelector('.pz-layers'); if(pz)pz.outerHTML=pips();
      var body=root.querySelector('.pz-body');
      var n=document.createElement('div');
      n.innerHTML='<div class="pz-note">'+note+'</div><div class="pz-actions"><button type="button" class="btn btn-primary" data-pz="next">'+(state.step>=3?'FINISH':'NEXT LAYER')+'</button></div>';
      body.appendChild(n);
      var nb=n.querySelector('[data-pz=next]'); if(nb)nb.focus();
      var f=root.querySelector('[data-pz=hint]'); if(f){f.disabled=true;} 
      var s=root.querySelector('[data-pz=skip]'); if(s){s.disabled=true;}
      root.querySelectorAll('.opt,.rec,.pz-form button,.pz-form input').forEach(function(e){e.disabled=true});
    }

    /* ----- challenge 1: Caesar ----- */
    function c1(){
      hintLevel=0;
      shell(head(1,'Decode the message')+
        '<div class="cipher-box">'+LOCK+'<code aria-label="Encrypted text: D F F H V V, J U D Q W H G">DFFHVV JUDQWHG</code></div>'+
        '<p class="pz-q">This message is a Caesar cipher. Decode it to unlock the first layer.</p>'+
        '<form class="pz-form" id="c1form" autocomplete="off"><label class="sr" for="c1in">Decoded message</label><input type="text" id="c1in" placeholder="type the decoded message" autocapitalize="characters" spellcheck="false" autocomplete="off"><button class="btn btn-primary" type="submit">DECODE</button></form>'+
        actions());
      var inp=root.querySelector('#c1in'); if(inp&&introPlayed)inp.focus({preventScroll:true});
    }
    function c1check(){
      var v=root.querySelector('#c1in').value.trim().replace(/\s+/g,' ').toUpperCase();
      if(v==='ACCESS GRANTED'){
        success(['> ENCRYPTION DEFEATED','> SECURITY LAYER 1 BYPASSED'],'<b>What you just did:</b> a Caesar cipher shifts every letter by a fixed amount. Because there are only 25 possible shifts, it is trivial to break, which is why real systems use modern encryption such as AES.');
      }else{
        sfx.play('counter');
        log(['> DECRYPTION FAILED. Try again; hints are optional.'],'bad');
        var i=root.querySelector('#c1in'); i.select();
      }
    }

    /* ----- challenge 2: brute force ----- */
    var RECS=[
      {id:'A',ip:'192.0.2.10',time:'10:30 AM',att:1,st:'SUCCESS',why:'One attempt, a normal hour, and success. That is what an ordinary login looks like.'},
      {id:'B',ip:'198.51.100.25',time:'02:14 AM',att:47,st:'FAILED',why:'Repeated failed authentication attempts can indicate a brute-force attack.'},
      {id:'C',ip:'203.0.113.12',time:'11:45 AM',att:2,st:'SUCCESS',why:'Two attempts followed by success is usually just a typo.'}
    ];
    function c2(){
      hintLevel=0;
      var h=RECS.map(function(r){
        return '<button type="button" class="rec" data-rec="'+r.id+'"><b>Record '+r.id+'</b>IP: '+r.ip+'<br>Time: '+r.time+'<br>Attempts: '+r.att+'<br>Status: <span class="'+(r.st==='SUCCESS'?'st-ok':'st-fail')+'">'+r.st+'</span></button>';
      }).join('');
      shell(head(2,'Identify the suspicious login')+
        '<p class="pz-q">Which login record shows the strongest indication of a brute-force attempt?</p>'+
        '<div class="records">'+h+'</div>'+
        '<p class="pz-hint" style="border-color:var(--line);color:var(--muted)">These are fictional records using documentation-reserved IP addresses.</p>'+
        actions());
    }
    function c2pick(id){
      var r=RECS.filter(function(x){return x.id===id})[0], el=root.querySelector('[data-rec='+id+']');
      if(id==='B'){
        el.classList.add('right');
        success(['> THREAT IDENTIFIED','> SECURITY LAYER 2 BYPASSED'],'<b>Record B:</b> '+esc(r.why)+' Forty-seven failures at 2 a.m. is a script guessing passwords, which is why real systems add rate limiting, lockouts, and multi-factor authentication.');
      }else{
        el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong');
        sfx.play('counter');
        log(['> Record '+id+' looks normal. '+r.why],'bad');
      }
    }

    /* ----- challenge 3: vulnerability ----- */
    var OPTS=[
      ['A','The username is too short.','Length is not the problem. The check itself is.'],
      ['B','The code grants access without verifying a password or other authentication factor.',''],
      ['C','The application uses Python.','The language is not the flaw; any language can be written insecurely.'],
      ['D','The login page has no animations.','Animations are not a security control.']
    ];
    function c3(){
      hintLevel=0;
      shell(head(3,'Find the vulnerability')+
        '<form class="fake-login" onsubmit="return false" autocomplete="off"><span>DEMO LOGIN (not connected to anything)</span><input type="text" placeholder="username" aria-label="Demo username" autocomplete="off"><input type="password" placeholder="password" aria-label="Demo password" autocomplete="off"></form>'+
        '<code class="code">if username == "admin":\n    grant_access()</code>'+
        '<p class="pz-q">What is the primary security flaw?</p>'+
        '<div class="opts">'+OPTS.map(function(o){return '<button type="button" class="opt" data-opt="'+o[0]+'"><b>'+o[0]+'.</b>'+esc(o[1])+'</button>'}).join('')+'</div>'+
        actions());
    }
    function c3pick(id){
      var el=root.querySelector('[data-opt='+id+']'), o=OPTS.filter(function(x){return x[0]===id})[0];
      if(id==='B'){
        el.classList.add('right');
        success(['> AUTHENTICATION FLAW IDENTIFIED','> ALL SECURITY LAYERS BYPASSED','> ACCESS GRANTED'],'<b>Why B:</b> knowing a username is not proof of identity. Access must depend on something only the real user has, such as a password, a passkey, or a one-time code.');
      }else{
        el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong');
        sfx.play('counter');
        log(['> Not quite. '+o[2]],'bad');
      }
    }

    /* ----- completion ----- */
    function done(){
      sfx.play('win');
      shell('<div class="holo"><div class="holo-ring" aria-hidden="true"></div><h2>SYSTEM COMPROMISED. ETHICALLY.</h2><p>Congratulations. You&rsquo;ve successfully infiltrated my digital world.</p><button type="button" class="btn btn-primary" data-pz="enter">EXPLORE THE PORTFOLIO</button> <button type="button" class="btn btn-ghost" data-pz="again">Play again</button></div>');
      var b=root.querySelector('[data-pz=enter]'); if(b)b.focus();
    }

    function render(){
      if(state.step>=3)return done();
      if(state.step===0&&!introPlayed)return intro();
      [c1,c2,c3][state.step]();
    }

    /* ----- events (delegated; removed on destroy) ----- */
    function onClick(e){
      var t=e.target.closest('[data-pz],[data-rec],[data-opt]'); if(!t||!root.contains(t))return;
      var a=t.getAttribute('data-pz');
      if(t.hasAttribute('data-rec')&&!t.disabled)return c2pick(t.getAttribute('data-rec'));
      if(t.hasAttribute('data-opt')&&!t.disabled)return c3pick(t.getAttribute('data-opt'));
      if(a==='next')return render();
      if(a==='enter'){return opts.onComplete&&opts.onComplete()}
      if(a==='again'){state.step=0;state.skipped={};save();introPlayed=true;return render()}
      if(a==='skip'){state.skipped[state.step]=true;state.step++;save();return render()}
      if(a==='hint'){
        var H={0:['The letters have been shifted three positions forward.','To decode, move each letter three positions back in the alphabet: D becomes A.'],
               1:['Look at the number of attempts and whether they succeeded.','A person rarely fails 47 times in a row, and almost never at 2 a.m.'],
               2:['Read the code: what has to be true for access to be granted?','The code checks the username only. Does it ever ask the visitor to prove who they are?']}[state.step];
        var box=root.querySelector('#pzHint'); if(!box||!H)return;
        box.innerHTML='<p class="pz-hint">Hint: '+esc(H[Math.min(hintLevel,1)])+'</p>'; hintLevel++;
      }
    }
    function onSubmit(e){
      if(e.target.id==='c1form'){e.preventDefault();c1check()}
    }
    root.addEventListener('click',onClick);
    root.addEventListener('submit',onSubmit);
    render();
    return {destroy:function(){
      timers.forEach(clearTimeout);timers=[];
      root.removeEventListener('click',onClick);root.removeEventListener('submit',onSubmit);
      root.innerHTML='';
    }};
  }
  window.BreachPuzzles={mount:mount};
})();
