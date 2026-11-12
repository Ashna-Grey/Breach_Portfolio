/* ASHNA.OS terminal. A fixed table of commands: input is matched, never evaluated. */
(function(){
  'use strict';
  var out,input,form,panel,toggle,hist=[],hi=0,timers=[];
  var NAV={projects:'projects',research:'research',skills:'skills',contact:'contact'};
  var HELP=['Available commands:',
    '  help        show this list',
    '  whoami      who is Ashna',
    '  projects    jump to projects',
    '  research    jump to research',
    '  skills      jump to skills',
    '  contact     jump to contact',
    '  clear       clear the screen'];
  var WHOAMI=['Ashna Islam: cybersecurity researcher & ML engineer.',
    '3rd-year B.Tech CSE (Cybersecurity), IEM Kolkata. IEEE CS Chapter Chair.',
    'Published: Bayesian Zero Trust access control (IEEE DOI). Open to internships.'];
  var EGG=['> Permission requested.','> Evaluating candidate...','> Skills detected.','> Research detected.','> Initiative detected.','> FINAL DECISION: YOUR CALL.'];

  function line(text,cls){
    var p=document.createElement('p'); if(cls)p.className=cls; p.textContent=text;   // textContent only: no HTML injection
    out.appendChild(p); out.scrollTop=out.scrollHeight; return p;
  }
  function lines(arr,cls){arr.forEach(function(l){line(l,cls)})}
  function go(id){
    var el=document.getElementById(id); if(!el)return;
    line('> navigating to '+id+'...','t-ok');
    close(); el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  function egg(){
    var i=0;
    (function next(){
      if(i>=EGG.length){
        var b=document.createElement('button'); b.type='button'; b.className='btn btn-primary'; b.textContent="LET'S CONNECT";
        b.addEventListener('click',function(){go('contact')});
        out.appendChild(b); out.scrollTop=out.scrollHeight; b.focus(); return;
      }
      line(EGG[i],i===EGG.length-1?'t-ok':''); if(window.Sfx)Sfx.play('tick'); i++;
      timers.push(setTimeout(next,reduceMotion()?0:420));
    })();
  }
  function reduceMotion(){return matchMedia('(prefers-reduced-motion: reduce)').matches}
  function run(raw){
    var cmd=raw.trim().toLowerCase().replace(/\s+/g,' ');
    if(!cmd)return;
    hist.push(raw); hi=hist.length;
    line('$ '+raw,'t-cmd');
    if(cmd==='help')lines(HELP);
    else if(cmd==='whoami')lines(WHOAMI);
    else if(cmd==='clear')out.innerHTML='';
    else if(cmd==='sudo hire ashna')egg();
    else if(Object.prototype.hasOwnProperty.call(NAV,cmd))go(NAV[cmd]);
    else line('command not found: '+cmd.slice(0,40)+'. Type help.','t-err');
  }
  function open(){
    panel.hidden=false; toggle.setAttribute('aria-expanded','true');
    if(!out.childNodes.length)lines(['ASHNA.OS terminal v1.0','Type help to see commands.'],'t-ok');
    input.focus();
  }
  function close(){
    panel.hidden=true; toggle.setAttribute('aria-expanded','false');
    timers.forEach(clearTimeout); timers=[];
  }
  function init(){
    if(panel)return;
    out=document.getElementById('termOut'); input=document.getElementById('termIn'); form=document.getElementById('termForm');
    panel=document.getElementById('term'); toggle=document.getElementById('termToggle');
    form.addEventListener('submit',function(e){e.preventDefault();var v=input.value;input.value='';run(v)});
    input.addEventListener('keydown',function(e){
      if(e.key==='ArrowUp'&&hist.length){e.preventDefault();hi=Math.max(0,hi-1);input.value=hist[hi]||''}
      else if(e.key==='ArrowDown'){e.preventDefault();hi=Math.min(hist.length,hi+1);input.value=hist[hi]||''}
    });
    panel.addEventListener('keydown',function(e){if(e.key==='Escape'){close();toggle.focus()}});
    document.getElementById('termClose').addEventListener('click',function(){close();toggle.focus()});
  }
  window.BreachTerminal={
    toggle:function(){init();panel.hidden?open():close()},
    close:function(){if(panel)close()}
  };
})();
