/* Tiny Web Audio synth for BREACH.exe. Muted by default; no audio files needed. */
(function(){
  'use strict';
  var ctx=null, muted=true, listeners=[];
  function get(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
  function set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
  if(get('breach.sound')==='on')muted=false;
  function ac(){
    if(ctx)return ctx;
    var C=window.AudioContext||window.webkitAudioContext;
    if(!C)return null;
    try{ctx=new C()}catch(e){ctx=null}
    return ctx;
  }
  function tone(f0,f1,dur,type,vol,delay){
    var c=ac(); if(!c)return;
    if(c.state==='suspended')c.resume();
    var t=c.currentTime+(delay||0), o=c.createOscillator(), g=c.createGain();
    o.type=type||'square';
    o.frequency.setValueAtTime(f0,t);
    if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
    g.gain.setValueAtTime(vol||.06,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t+dur+.02);
  }
  var SOUNDS={
    ui:function(){tone(660,880,.07,'square',.04)},
    hit:function(){tone(520,240,.08,'square',.05)},
    big:function(){tone(300,90,.16,'sawtooth',.07)},
    counter:function(){tone(180,60,.12,'sawtooth',.06)},
    win:function(){[523,659,784,1047].forEach(function(f,i){tone(f,f,.14,'square',.05,i*.1)})},
    lose:function(){[392,330,262,196].forEach(function(f,i){tone(f,f*.9,.2,'sawtooth',.05,i*.14)})},
    unlock:function(){tone(440,880,.12,'triangle',.06);tone(880,1320,.16,'triangle',.05,.1)},
    tick:function(){tone(900,900,.03,'square',.03)}
  };
  function sync(){
    var btns=document.querySelectorAll('.snd-toggle');
    for(var i=0;i<btns.length;i++){
      btns[i].textContent='Sound: '+(muted?'off':'on');
      btns[i].setAttribute('aria-pressed',String(!muted));
    }
    listeners.forEach(function(fn){fn(muted)});
  }
  window.Sfx={
    play:function(n){if(muted)return;var f=SOUNDS[n];if(f)try{f()}catch(e){}},
    isMuted:function(){return muted},
    setMuted:function(m){muted=!!m;set('breach.sound',muted?'off':'on');if(!muted){ac();}sync();if(!muted)SOUNDS.ui()},
    toggle:function(){this.setMuted(!muted)},
    sync:sync,
    onChange:function(fn){listeners.push(fn)}
  };
})();
