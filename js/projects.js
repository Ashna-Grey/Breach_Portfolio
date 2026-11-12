/* Immersive project showcase (full-screen dialog). Loaded on first project open.
   All content comes from the Final Portfolio Data; nothing here is invented. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var reduceMQ=window.matchMedia('(prefers-reduced-motion: reduce)');
  var ov=$('#projView'),bodyEl=$('#pvBody'),scroller=$('#pvScroll'),backBtn=$('#pvBack'),crumb=$('#pvCrumb'),prog=$('#pvProgress');
  var ORDER=['minipay','ethereum','zerotrust','quantum'];
  var opener=null,current=null,isOpen=false,pushes=0,io=null,showT=null,hideT=null;
  var INERT=['#main','.nav','#termToggle','#term','.foot'];

  /* ---------- hero illustrations (inline SVG + CSS animation, no libraries) ---------- */
  function slab(y,o){return '<g class="slab" style="--o:'+o+'"><polygon points="240,'+(y)+' 310,'+(y+32)+' 240,'+(y+64)+' 170,'+(y+32)+'" class="top"/><polygon points="170,'+(y+32)+' 240,'+(y+64)+' 240,'+(y+78)+' 170,'+(y+46)+'" class="sl"/><polygon points="240,'+(y+64)+' 310,'+(y+32)+' 310,'+(y+46)+' 240,'+(y+78)+'" class="sr"/></g>'}
  var ART={
    minipay:'<svg viewBox="0 0 480 400" role="img" aria-label="Illustration: two wallets exchanging funds through a stacked double-entry ledger"><defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".5"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><rect x="205" y="40" width="70" height="170" fill="url(#gm)" class="beam"/>'+slab(215,0)+slab(180,1)+slab(145,2)+
      '<path class="flow" d="M130 230 C170 230 170 200 200 200"/><path class="flow" d="M280 200 C320 200 320 230 350 230"/>'+
      '<g class="card"><rect x="24" y="190" width="108" height="76" rx="10"/><path d="M24 214h108"/><circle cx="108" cy="244" r="6"/><text x="36" y="236">WALLET A</text></g>'+
      '<g class="card"><rect x="348" y="190" width="108" height="76" rx="10"/><path d="M348 214h108"/><circle cx="432" cy="244" r="6"/><text x="360" y="236">WALLET B</text></g>'+
      '<g class="shield"><path d="M240 52l22 9v16c0 15-9 25-22 31-13-6-22-16-22-31V61z"/><path d="M230 78l8 8 14-16"/></g><text class="lbl" x="240" y="335" text-anchor="middle">DOUBLE-ENTRY LEDGER</text><text class="lbl dim" x="240" y="355" text-anchor="middle">simulated transfers</text></svg>',
    ethereum:'<svg viewBox="0 0 480 400" role="img" aria-label="Illustration: a blockchain network of wallet nodes with three suspicious wallets highlighted in red"><g class="edges"><path d="M240 200L110 90M240 200L370 80M240 200L90 230M240 200L400 240M240 200L150 340M240 200L340 330M110 90L90 230M370 80L400 240M150 340L340 330M90 230L150 340M400 240L340 330M110 90L240 40M240 40L370 80"/></g>'+
      '<g class="edges bad"><path d="M240 200L400 240M240 200L150 340M240 200L110 90"/></g>'+
      '<g class="nodes"><circle cx="110" cy="90" r="9" class="sus"/><circle cx="370" cy="80" r="9"/><circle cx="90" cy="230" r="9"/><circle cx="400" cy="240" r="9" class="sus"/><circle cx="150" cy="340" r="9" class="sus"/><circle cx="340" cy="330" r="9"/><circle cx="240" cy="40" r="7"/><circle cx="30" cy="150" r="6"/><circle cx="450" cy="150" r="6"/></g>'+
      '<g class="rings"><circle cx="110" cy="90" r="9"/><circle cx="400" cy="240" r="9"/><circle cx="150" cy="340" r="9"/></g>'+
      '<g class="core"><polygon points="240,140 288,205 240,232 192,205"/><polygon points="240,242 288,214 240,268 192,214"/><polygon points="240,140 240,232 192,205" class="f1"/><polygon points="240,140 240,232 288,205" class="f2"/></g><text class="lbl" x="240" y="300" text-anchor="middle">WALLET GRAPH</text></svg>',
    zerotrust:'<svg viewBox="0 0 480 400" role="img" aria-label="Illustration: an identity at the centre surrounded by orbiting contextual signals feeding a trust score"><g class="orbits"><ellipse cx="240" cy="200" rx="95" ry="95"/><ellipse cx="240" cy="200" rx="150" ry="150" class="o2"/><ellipse cx="240" cy="200" rx="200" ry="170" class="o3"/></g>'+
      '<g class="spin a"><circle cx="335" cy="200" r="8"/><circle cx="145" cy="200" r="8"/></g><g class="spin b"><circle cx="240" cy="50" r="8" class="r"/><circle cx="390" cy="200" r="8"/><circle cx="90" cy="200" r="8"/></g><g class="spin c"><circle cx="440" cy="200" r="7"/><circle cx="40" cy="200" r="7" class="r"/></g>'+
      '<g class="id"><circle cx="240" cy="200" r="52"/><circle cx="240" cy="188" r="15"/><path d="M212 228c6-18 50-18 56 0"/></g>'+
      '<text class="lbl" x="240" y="278" text-anchor="middle">IDENTITY</text><text class="lbl dim" x="240" y="20" text-anchor="middle">CONTEXT SIGNALS</text><text class="lbl dim" x="240" y="392" text-anchor="middle">TRUST SCORE &middot; ADAPTIVE MFA</text></svg>',
    quantum:'<svg viewBox="0 0 480 400" role="img" aria-label="Illustration: two qubits connected by a noisy quantum channel, tuned by an adaptive reinforcement learning controller"><g class="qb"><circle cx="90" cy="230" r="52"/><ellipse cx="90" cy="230" rx="52" ry="16"/><path d="M90 178v104"/><circle cx="90" cy="230" r="6" class="dot"/></g><g class="qb"><circle cx="390" cy="230" r="52"/><ellipse cx="390" cy="230" rx="52" ry="16"/><path d="M390 178v104"/><circle cx="390" cy="230" r="6" class="dot d2"/></g>'+
      '<path class="chan" d="M142 230 q 24 -34 48 0 t 48 0 t 48 0 t 48 0"/><path class="chan c2" d="M142 240 q 24 -22 48 0 t 48 0 t 48 0 t 48 0"/>'+
      '<g class="agent"><rect x="170" y="60" width="140" height="64" rx="10"/><text x="240" y="88" text-anchor="middle">ADAPTIVE</text><text x="240" y="108" text-anchor="middle">CONTROLLER</text></g><path class="fb" d="M240 124v52"/><path class="fb f2" d="M90 176q0-70 80-82"/>'+
      '<text class="lbl" x="90" y="318" text-anchor="middle">SENDER</text><text class="lbl" x="390" y="318" text-anchor="middle">RECEIVER</text><text class="lbl dim" x="240" y="350" text-anchor="middle">NOISY, TIME-VARYING CHANNEL</text></svg>'
  };

  /* ---------- project data ---------- */
  var T=function(n,t){return [n,t]};
  var P={
    minipay:{
      cat:'FULL-STACK DEVELOPMENT · FINTECH',title:'MiniPay',sub:'Digital Wallet and Payment Platform',
      tagline:'Secure wallets, simulated peer-to-peer transfers, and a ledger built so balances stay correct.',
      status:[['ok','DEVELOPED']],
      badges:[T('React','Front end'),T('TypeScript','Typed front end and back end'),T('Node.js','Server runtime'),T('Express.js','RESTful API layer'),T('PostgreSQL','Relational database'),T('Prisma','ORM and schemas'),T('JWT','Token-based authentication'),T('Docker','Containerisation')],
      links:[['Live project','https://mini-qcsehzbo1-ashna13.vercel.app/login',1]],
      problem:'Payment systems must keep balances correct even when a request fails midway or is submitted twice.',
      solution:'MiniPay combines atomic database transactions, a double-entry ledger and idempotency controls behind a secured REST API, with simulated peer-to-peer transfers.',
      feats:['Secure user authentication and wallet management','Simulated peer-to-peer fund transfers and transaction history','RESTful APIs and relational database schemas','Atomic database transactions that prevent partial balance updates','Double-entry ledger and idempotency controls that prevent duplicate payments','Input validation, error handling, and automated tests'],
      stack:'React · TypeScript · Node.js · Express.js · PostgreSQL · Prisma · JWT · Docker',
      warn:true,note:'All transfers in MiniPay are simulated. It does not move real money.',
      arch:{caption:'Conceptual request flow assembled from the documented feature set; not a verbatim system diagram.',legend:['Implemented'],cols:[
        [{id:'ui',kind:'impl',label:'React + TypeScript UI',sub:'login · wallet · transfers',d:'Front end for authentication, wallet balances, simulated peer-to-peer transfers and transaction history.'}],
        [{id:'api',kind:'impl',label:'Express REST API',sub:'JWT · validation',d:'RESTful APIs on Node.js and Express.js, with JWT-based authentication, input validation and error handling.'}],
        [{id:'idem',kind:'impl',label:'Idempotency controls',sub:'no duplicate payments',d:'Idempotency controls prevent the same payment from being applied twice when a request is repeated.'},
         {id:'atom',kind:'impl',label:'Atomic transaction',sub:'no partial updates',d:'Atomic database transactions prevent partial balance updates: a transfer either fully applies or not at all.'},
         {id:'led',kind:'impl',label:'Double-entry ledger',sub:'matching entries',d:'Each transfer is recorded in a double-entry ledger, so debits and credits can be reconciled.'}],
        [{id:'db',kind:'impl',label:'PostgreSQL + Prisma',sub:'relational schemas',d:'Relational database schemas managed through the Prisma ORM.'}]]},
      hl:[['Data integrity','Atomic transactions, a double-entry ledger and idempotency controls protect balances.'],['Security','JWT-based authentication, input validation and error handling.'],['Backend','RESTful APIs over PostgreSQL, modelled with Prisma.'],['Quality & delivery','Automated tests, Docker packaging and a live deployed demo.']]
    },
    ethereum:{
      cat:'BLOCKCHAIN SECURITY · MACHINE LEARNING',title:'Ethereum Fraud Wallet Detection',sub:'Hybrid fraud intelligence',
      tagline:'Supervised learning, anomaly detection and rule-based scoring, fused with explicit uncertainty handling.',
      status:[['wip','ONGOING DEVELOPMENT'],['dim','SEP 2026 – PRESENT']],
      badges:[T('Random Forest','Supervised classifier'),T('Isolation Forest','Unsupervised anomaly detection'),T('Rule-Based Scoring','Explicit risk rules'),T('Belief Fusion','Conflict-aware discounted belief fusion'),T('Ethereum','Wallet transaction data'),T('Kaggle','Data source'),T('Alchemy','Data source')],
      links:[['Live project','https://blockchain-lime-one.vercel.app',1]],
      problem:'Fraudulent wallets are hard to flag from a single signal, and different models can disagree about the same wallet.',
      solution:'A hybrid pipeline combines supervised learning, anomaly detection and rule-based risk analysis, then fuses the evidence while accounting for disagreement, data quality and model conflict.',
      feats:['Hybrid pipeline: Random Forest, Isolation Forest and rule-based risk scoring','Wallet-level transaction feature engineering','Feature selection and statistical analysis for interpretable, leakage-aware classification','Uncertainty-aware fusion for prediction disagreement, data quality and model conflicts'],
      stack:'Random Forest · Isolation Forest · Rule-Based Risk Scoring · Conflict-Aware Discounted Belief Fusion',
      note:'Dataset: approximately 19,000 unique Ethereum wallets from Kaggle and Alchemy.',
      metrics:{label:'Reported project results (self-reported; not independently verified)',items:[[95,'%','Accuracy'],[92,'%','Precision'],[91,'%','Recall'],[91.49,'%','F1-score']]},
      arch:{caption:'Stages follow the documented pipeline. The dashed node is a proposed research direction and is not part of the implemented system.',legend:['Implemented','Proposed direction'],cols:[
        [{id:'data',kind:'impl',label:'Wallet data',sub:'Kaggle · Alchemy · ~19,000',d:'Approximately 19,000 unique Ethereum wallets drawn from Kaggle and Alchemy.'}],
        [{id:'feat',kind:'impl',label:'Feature engineering',sub:'wallet-level features',d:'Wallet-level transaction features, followed by feature selection and statistical analysis for interpretable, leakage-aware classification.'}],
        [{id:'rf',kind:'impl',label:'Random Forest',sub:'supervised',d:'Supervised classifier over the engineered wallet features.'},
         {id:'if',kind:'impl',label:'Isolation Forest',sub:'anomaly detection',d:'Unsupervised anomaly detector that flags wallets with unusual behaviour.'},
         {id:'rules',kind:'impl',label:'Rule-based scoring',sub:'explicit risk rules',d:'Rule-based risk analysis that scores wallets against explicit rules.'}],
        [{id:'fuse',kind:'impl',label:'Belief fusion',sub:'conflict-aware · discounted',d:'Conflict-Aware Discounted Belief Fusion combines the three evidence sources while accounting for prediction disagreement, data quality and model conflicts.'}],
        [{id:'risk',kind:'impl',label:'Risk assessment',sub:'fused wallet verdict',d:'The fused output is the overall fraud-risk assessment for a wallet.'}],
        [{id:'ns',kind:'plan',label:'Neuro-symbolic layer',sub:'proposed direction',d:'An extended neuro-symbolic reasoning architecture is a proposed research direction. It is not implemented and is not part of the system described above.'}]]},
      hl:[['Hybrid detection','Supervised, unsupervised and rule-based evidence in one pipeline.'],['Uncertainty-aware fusion','Handles prediction disagreement, data quality and model conflict explicitly.'],['Interpretable features','Wallet-level features with feature selection and statistical analysis.'],['Leakage-aware','Feature set built to avoid leakage in classification.']]
    },
    zerotrust:{
      cat:'CYBERSECURITY RESEARCH · IDENTITY & ACCESS',title:'Context-Aware Fuzzy Logic Engine',sub:'for Continuous Zero Trust Access Control',
      tagline:'A Mamdani fuzzy inference engine that turns context into a continuous trust score and adapts MFA to it.',
      status:[['ok','PUBLISHED'],['dim','IEEE CIACON 2026'],['dim','MAY – JUL 2026']],
      badges:[T('Mamdani FIS','Mamdani Fuzzy Inference System'),T('Python','Implementation language'),T('Scikit-fuzzy','Fuzzy logic toolkit'),T('NumPy','Numerical computing'),T('Streamlit','Python web gateway interface'),T('Zero Trust','Never trust, always verify'),T('Adaptive MFA','Risk-driven step-up')],
      links:[['IEEE publication','https://doi.org/10.1109/CIACON70148.2026.11688234',1],['ResearchGate','https://www.researchgate.net/publication/414628419_Context_Aware_Fuzzy_Logic_Engine_for_Continuous_Zero_Trust_Access_Control',0]],
      problem:'Static access rules cannot react to changing context, so access ends up over-trusted or under-protected.',
      solution:'A Mamdani fuzzy inference engine converts contextual signals into a continuous trust score and drives adaptive multi-factor authentication through a Python web gateway.',
      feats:['Continuous trust evaluation with Mamdani Fuzzy Inference','Sigmoid normalization, exponential time decay and dynamic risk scaling','Adaptive MFA enforcement through a Python web gateway','Dormant-account and brute-force attack scenarios evaluated','Constant-time evaluation for a fixed rule base, described as O(1)'],
      stack:'Python · Scikit-fuzzy · NumPy · Streamlit',
      note:'Developed during the Summer Research Internship at IDC Lab, University of Engineering and Management, Kolkata (18 May – 31 July 2026).',
      arch:{caption:'Stages are arranged from the documented components; the order is a conceptual flow, not a verbatim system diagram.',legend:['Implemented'],cols:[
        [{id:'ctx',kind:'impl',label:'Access request',sub:'context signals',d:'Each access attempt arrives with contextual information for the engine to evaluate.'}],
        [{id:'sig',kind:'impl',label:'Sigmoid normalization',sub:'condition inputs',d:'Sigmoid normalization is applied to the inputs used for trust evaluation.'}],
        [{id:'decay',kind:'impl',label:'Exponential time decay',sub:'discount old activity',d:'Exponential time decay lowers the influence of older activity.'}],
        [{id:'fis',kind:'impl',label:'Mamdani FIS',sub:'fixed rule base',d:'A Mamdani Fuzzy Inference System evaluates a fixed rule base to produce a continuous trust value.'}],
        [{id:'scale',kind:'impl',label:'Dynamic risk scaling',sub:'adjust to risk',d:'Dynamic risk scaling adjusts the trust result to the risk of the situation.'}],
        [{id:'score',kind:'impl',label:'Continuous trust score',sub:'O(1) fixed rules',d:'A continuous trust score per access attempt. Evaluation is constant-time for a fixed rule base, described as O(1).'}],
        [{id:'mfa',kind:'impl',label:'Adaptive MFA',sub:'Python web gateway',d:'Multi-factor authentication is enforced adaptively through a Python-based web gateway.'}]]},
      hl:[['Fuzzy trust engine','Mamdani inference gives continuous trust scores instead of static allow/deny rules.'],['Signal conditioning','Sigmoid normalization, exponential time decay and dynamic risk scaling.'],['Adaptive enforcement','MFA requirements adapt to the computed trust through a Python web gateway.'],['Attack scenarios','Dormant-account and brute-force scenarios evaluated.']]
    },
    quantum:{
      cat:'ONGOING RESEARCH · QUANTUM COMPUTING · REINFORCEMENT LEARNING',title:'Noise-Aware Adaptive n-Qubit Quantum Teleportation',sub:'Research in progress since January 2026',
      tagline:'Using reinforcement learning to adapt teleportation circuits to a noisy, changing quantum channel.',
      status:[['wip','ONGOING RESEARCH'],['dim','SINCE JAN 2026'],['dim','NOT YET PUBLISHED']],
      badges:[T('Reinforcement Learning','Adaptive circuit selection'),T('PPO','Algorithm under exploration'),T('DQN','Algorithm under exploration'),T('SAC','Algorithm under exploration'),T('Quantum Channels','Dynamic noisy channels'),T('Quantum Teleportation','n-qubit teleportation')],
      links:[],
      problem:'Quantum channels are noisy and change over time, so a fixed teleportation circuit may not suit every channel state.',
      solution:'Explore reinforcement learning to select circuits adaptively from estimated channel state, evaluating teleportation fidelity and resource cost.',
      feats:['Adaptive n-qubit teleportation framework over dynamic quantum channels','Reinforcement learning-based circuit selection','Channel-state estimation and adaptive feedback','Quantum error mitigation and entanglement optimization','Evaluation of teleportation fidelity and resource costs'],
      stack:'Quantum computing · Reinforcement learning (PPO, DQN, SAC under exploration)',
      warn:true,note:'This is ongoing research. No results or publication are claimed.',
      arch:{caption:'Research objectives arranged as a control loop. No experimental results are reported.',legend:['Research objective'],cols:[
        [{id:'chan',kind:'res',label:'Dynamic quantum channel',sub:'noisy, time-varying',d:'The teleportation runs over channels whose noise changes over time.'}],
        [{id:'est',kind:'res',label:'Channel-state estimation',sub:'sense the channel',d:'Estimating the current channel state so the controller can adapt.'}],
        [{id:'rl',kind:'res',label:'RL agent',sub:'PPO · DQN · SAC',d:'PPO, DQN and SAC are the reinforcement learning algorithms under exploration.'}],
        [{id:'circ',kind:'res',label:'Circuit selection',sub:'adaptive choice',d:'Reinforcement learning-based selection of the teleportation circuit, with error mitigation and entanglement optimization investigated.'}],
        [{id:'tele',kind:'res',label:'n-qubit teleportation',sub:'over the channel',d:'Adaptive n-qubit quantum teleportation over the dynamic channel.'}],
        [{id:'eval',kind:'res',label:'Fidelity & cost',sub:'adaptive feedback',d:'Teleportation fidelity and resource costs are evaluated and fed back as adaptive feedback.'}]]},
      hl:[['Adaptive framework','n-qubit teleportation over dynamic quantum channels.'],['RL circuit selection','PPO, DQN and SAC are under exploration.'],['Channel awareness','Channel-state estimation and adaptive feedback.'],['Evaluation','Teleportation fidelity and resource cost.']]
    }
  };

  /* ---------- rendering ---------- */
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function archHTML(a){
    var h='<div class="arch-legend" aria-hidden="true">'+a.legend.map(function(l,i){return '<span><i class="lg'+(i?' dash':'')+'"></i>'+l+'</span>'}).join('')+'</div><div class="arch" role="list">';
    a.cols.forEach(function(col,ci){
      if(ci)h+='<div class="conn'+(col[0].kind==='plan'?' dash':'')+'" aria-hidden="true"></div>';
      h+='<div class="acol" role="listitem">'+col.map(function(n){return '<button type="button" class="node k-'+n.kind+'" data-node="'+n.id+'"><b>'+esc(n.label)+'</b><span>'+esc(n.sub)+'</span></button>'}).join('')+'</div>';
    });
    return h+'</div><div class="arch-detail" id="archDetail" aria-live="polite"><b>Select a component</b><span>Hover, focus or tap any node to see what it does in this project.</span></div><p class="arch-cap">'+esc(a.caption)+'</p>';
  }
  function render(id){
    var d=P[id],i=ORDER.indexOf(id),nx=P[ORDER[(i+1)%ORDER.length]],nid=ORDER[(i+1)%ORDER.length];
    var links=d.links.map(function(l){return '<a class="btn '+(l[2]?'btn-primary':'btn-ghost')+'" href="'+l[1]+'" target="_blank" rel="noopener">'+l[0].toUpperCase()+' &#8599;</a>'}).join('');
    var metrics=d.metrics?'<div class="metrics"><p class="m-label">'+d.metrics.label+'</p><div class="m-grid">'+d.metrics.items.map(function(m){return '<div class="metric"><span class="mn" data-to="'+m[0]+'">'+m[0]+'</span><span class="mu">'+m[1]+'</span><small>'+m[2]+'</small></div>'}).join('')+'</div></div>':'';
    bodyEl.innerHTML=
    '<header class="pv-hero th-'+id+'"><div class="pv-hero-l"><p class="pv-cat">'+d.cat+'</p><h1 id="pvTitle">'+esc(d.title)+'</h1><p class="pv-sub">'+esc(d.sub)+'</p><p class="pv-tag">'+esc(d.tagline)+'</p>'+
      '<div class="pv-status">'+d.status.map(function(s){return '<span class="st st-'+s[0]+'">'+s[1]+'</span>'}).join('')+'</div>'+
      '<div class="pv-badges">'+d.badges.map(function(b){return '<span class="pv-badge" tabindex="0" data-tip="'+esc(b[1])+'">&#10003; '+esc(b[0])+'</span>'}).join('')+'</div>'+
      (links?'<div class="pv-links">'+links+'</div>':'')+'</div>'+
      '<div class="pv-hero-r art-'+id+'">'+ART[id]+'</div></header>'+
    '<section class="pv-sec"><h2 class="pv-h"><span>01</span> Technical overview</h2><div class="ov-grid"><div class="panel"><h3>Problem</h3><p>'+esc(d.problem)+'</p></div><div class="panel"><h3>Solution</h3><p>'+esc(d.solution)+'</p></div><div class="panel wide"><h3>Major features</h3><ul class="feats">'+d.feats.map(function(f){return '<li>'+esc(f)+'</li>'}).join('')+'</ul><p class="stack"><b>Stack:</b> '+esc(d.stack)+'</p></div></div><p class="callout'+(d.warn?' warn':'')+'">'+esc(d.note)+'</p></section>'+
    '<section class="pv-sec"><h2 class="pv-h"><span>02</span> Architecture</h2>'+archHTML(d.arch)+'</section>'+
    '<section class="pv-sec"><h2 class="pv-h"><span>03</span> Technical highlights</h2><div class="hl-grid">'+d.hl.map(function(h,k){return '<div class="panel hl"><i>0'+(k+1)+'</i><h3>'+esc(h[0])+'</h3><p>'+esc(h[1])+'</p></div>'}).join('')+'</div>'+metrics+'</section>'+
    '<section class="pv-sec pv-end"><button type="button" class="btn btn-ghost" data-pv="back">&larr; BACK TO PROJECTS</button><button type="button" class="btn btn-primary" data-pv="next" data-id="'+nid+'">NEXT: '+esc(nx.title.toUpperCase())+' &rarr;</button></section>';
    crumb.textContent='projects / '+id;
    wire();
  }
  function wire(){
    var det=$('#archDetail');
    var map={};P[current].arch.cols.forEach(function(c){c.forEach(function(n){map[n.id]=n})});
    bodyEl.querySelectorAll('.node').forEach(function(b){
      function sel(){
        bodyEl.querySelectorAll('.node.on').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
        var n=map[b.getAttribute('data-node')];
        det.innerHTML='<b>'+esc(n.label)+(n.kind==='plan'?' <em>(proposed, not implemented)</em>':'')+'</b><span>'+esc(n.d)+'</span>';
      }
      b.addEventListener('mouseenter',sel);b.addEventListener('focus',sel);b.addEventListener('click',sel);
    });
    if(io)io.disconnect();
    io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;
      e.target.classList.add('in');io.unobserve(e.target);
      e.target.querySelectorAll('.mn').forEach(countUp);
    })},{root:scroller,threshold:.12});
    bodyEl.querySelectorAll('.pv-sec,.pv-hero').forEach(function(s){io.observe(s)});
  }
  function countUp(el){
    var to=parseFloat(el.getAttribute('data-to')),dec=String(to).indexOf('.')>-1?2:0;
    if(reduceMQ.matches){el.textContent=to.toFixed(dec);return}
    var t0=performance.now();
    (function f(t){var k=Math.min(1,(t-t0)/900);el.textContent=(to*(1-Math.pow(1-k,3))).toFixed(dec);if(k<1&&isOpen)requestAnimationFrame(f)})(t0);
  }

  /* ---------- open / close, focus management ---------- */
  function setInert(on){INERT.forEach(function(s){var e=$(s);if(e){if(on)e.setAttribute('inert','');else e.removeAttribute('inert')}})}
  function focusables(){return Array.prototype.slice.call(ov.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')).filter(function(e){return e.offsetParent!==null})}
  function onKey(e){
    if(!isOpen)return;
    if(e.key==='Escape'){e.preventDefault();close();return}
    if(e.key==='Tab'){
      var f=focusables();if(!f.length)return;
      var first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      else if(!ov.contains(document.activeElement)){e.preventDefault();first.focus()}
    }
  }
  function onScroll(){var m=scroller.scrollHeight-scroller.clientHeight;prog.style.transform='scaleX('+(m>0?scroller.scrollTop/m:0)+')'}
  function show(id,push){
    current=id;render(id);
    clearTimeout(hideT);
    ov.hidden=false;
    document.documentElement.classList.add('pv-open');
    setInert(true);
    scroller.scrollTop=0;onScroll();
    requestAnimationFrame(function(){ov.classList.add('open')});
    if(!isOpen){document.addEventListener('keydown',onKey,true);scroller.addEventListener('scroll',onScroll,{passive:true})}
    isOpen=true;
    if(push){try{pushes++;history.pushState({pv:id,d:pushes},'','#project-'+id)}catch(e){pushes--}}
    backBtn.focus({preventScroll:true});
  }
  function open(id,from,fromHistory){
    if(!P[id])return;
    opener=from||opener||document.activeElement;
    var card=from&&from.closest&&from.closest('.project,.dossier,.tl-card');
    var push=!fromHistory&&location.hash!=='#project-'+id;
    if(isOpen){show(id,push);return}
    if(card&&!reduceMQ.matches){
      card.classList.add('zooming');
      clearTimeout(showT);showT=setTimeout(function(){card.classList.remove('zooming');show(id,push)},210);
    }else show(id,push);
  }
  function finishClose(){
    ov.classList.remove('open');
    hideT=setTimeout(function(){ov.hidden=true;bodyEl.innerHTML=''},reduceMQ.matches?0:260);
    document.documentElement.classList.remove('pv-open');
    setInert(false);isOpen=false;current=null;
    document.removeEventListener('keydown',onKey,true);scroller.removeEventListener('scroll',onScroll);
    if(io){io.disconnect();io=null}
    var back=opener;opener=null;
    if(back&&document.contains(back)){
      back.focus({preventScroll:true});
      requestAnimationFrame(function(){if(document.activeElement!==back)back.focus({preventScroll:true})});   // inert removal can lag one frame
    }else{var s=document.getElementById('projects');if(s)s.scrollIntoView()}
  }
  function close(){
    if(!isOpen)return;
    if(pushes>0){var n=pushes;pushes=0;history.go(-n)}          // popstate handler finishes the close
    else{
      if(location.hash.indexOf('#project-')===0){try{history.replaceState(null,'',location.pathname+location.search+'#projects')}catch(e){}}
      finishClose();
    }
  }
  window.addEventListener('popstate',function(){
    var m=/^#project-(\w+)$/.exec(location.hash);
    pushes=(m&&history.state&&history.state.d)||0;               // keep our depth in sync with the browser's
    if(m&&P[m[1]]){if(!isOpen||current!==m[1])open(m[1],null,true)}
    else if(isOpen){finishClose()}
  });
  backBtn.addEventListener('click',close);
  bodyEl.addEventListener('click',function(e){
    var b=e.target.closest('[data-pv]');if(!b)return;
    if(b.getAttribute('data-pv')==='back')close();
    else if(b.getAttribute('data-pv')==='next')open(b.getAttribute('data-id'),null,false);
  });
  window.BreachProjects={open:open,close:close,ids:ORDER};
})();
