/* BREACH.exe: Phaser 3 click-fighter. Loaded only when Easy Mode is chosen.
   Usage: BreachGame.start(container, {onWin, onLose, sfx, reducedMotion}) -> {destroy()} */
(function(){
  'use strict';
  var W=800,H=450,FLOOR=H-90;
  var TARGET=35, DURATION=10000, MIN_GAP=45;          // 35 attacks in 10 s; ignore inputs closer than 45 ms (macro guard)
  var FIRST_COUNTER=1000, COUNTER_GAP=950, COUNTER_DMG=10, WINDUP=260;
  var MONO='"Share Tech Mono", ui-monospace, Menlo, Consolas, monospace';

  function start(container,opts){
    opts=opts||{};
    var reduce=!!opts.reducedMotion, sfx=opts.sfx||{play:function(){}}, destroyed=false, game=null;

    class BreachScene extends Phaser.Scene{
      constructor(){super('breach')}

      create(){
        container.__scene=this; this.timers=[]; this.lastT=null; this.state='ready'; this.attacks=0; this.elapsed=0; this.vHP=100;
        this.nextCounter=FIRST_COUNTER; this.windup=false; this.lastHit=-1e9;
        this.makeTextures(); this.drawBackground(); this.makeFighters(); this.makeHUD(); this.bindInput();
        this.runCountdown();
      }

      after(ms,fn){var t={ms:ms,fn:fn,dead:false};this.timers.push(t);return t}
      runTimers(dt){
        for(var i=this.timers.length-1;i>=0;i--){
          var t=this.timers[i];
          if(t.dead){this.timers.splice(i,1);continue}
          t.ms-=dt;
          if(t.ms<=0){this.timers.splice(i,1);t.fn()}
        }
      }

      makeTextures(){
        var self=this;
        ['visitor','ashna'].forEach(function(who){
          window.BreachSprites.NAMES.forEach(function(name){
            var key=who+'_'+name; if(self.textures.exists(key))return;
            var tex=self.textures.createCanvas(key,16,20);
            window.BreachSprites.draw(tex.getContext(),window.BreachSprites.frame(who,name),0,0,1,false);
            tex.refresh();
          });
        });
      }

      drawBackground(){
        var g=this.add.graphics().setDepth(0), i, t;
        var bands=30, bh=FLOOR/bands;
        for(i=0;i<bands;i++){
          t=i/(bands-1);
          var r=Math.round(5+(62-5)*t), gg=Math.round(7+(9-7)*t), b=Math.round(6+(12-6)*t);
          g.fillStyle((r<<16)|(gg<<8)|b,1); g.fillRect(0,i*bh,W,bh+1);
        }
        g.fillStyle(0x6d1018,.55); g.fillCircle(400,215,100);
        for(i=0;i<5;i++){g.fillStyle(0x1a0508,.9);g.fillRect(300,215+i*16,200,3+i)}   // synthwave sun slats
        var seed=11; function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
        var x=0;
        while(x<W){
          var w=34+rnd()*46, h=70+rnd()*150;
          g.fillStyle(0x070a08,1); g.fillRect(x,FLOOR-h,w,h);
          for(var wy=FLOOR-h+8;wy<FLOOR-10;wy+=14){
            for(var wx=x+5;wx<x+w-8;wx+=10){
              if(rnd()<.32){g.fillStyle(rnd()<.5?0x00ff88:0xff3030,.75);g.fillRect(wx,wy,4,5)}
            }
          }
          x+=w+3;
        }
        g.fillStyle(0x0a100c,1); g.fillRect(0,FLOOR,W,H-FLOOR);
        g.lineStyle(2,0x00ff88,.9); g.lineBetween(0,FLOOR,W,FLOOR);
        g.lineStyle(1,0x008f50,.35);
        for(i=-12;i<=12;i++)g.lineBetween(W/2+i*22,FLOOR,W/2+i*95,H);
        for(i=1;i<4;i++)g.lineBetween(0,FLOOR+i*i*6,W,FLOOR+i*i*6);
        this.add.text(W/2,FLOOR-8,'FIREWALL ACTIVE // PORT 443 FILTERED',{fontFamily:MONO,fontSize:'11px',color:'#ff3030'}).setOrigin(.5,1).setAlpha(.5).setDepth(1);
        if(!reduce){
          var sc=this.add.rectangle(W/2,0,W,3,0xff3030,.14).setDepth(1);
          this.tweens.add({targets:sc,y:FLOOR,duration:3200,repeat:-1});
        }
      }

      makeFighters(){
        var y=H-52;
        this.add.ellipse(230,y+2,110,14,0x000000,.45).setDepth(2);
        this.add.ellipse(570,y+2,110,14,0x000000,.45).setDepth(2);
        this.v=this.add.image(230,y,'visitor_idle').setOrigin(.5,1).setScale(6).setDepth(3);
        this.a=this.add.image(570,y,'ashna_idle').setOrigin(.5,1).setScale(6).setFlipX(true).setDepth(3);
        this.vx=230; this.ax=570;
        if(!reduce){
          [this.v,this.a].forEach(function(s,i){
            this.tweens.add({targets:s,scaleY:6.25,duration:460+i*60,yoyo:true,repeat:-1,ease:'Sine.inOut'});
          },this);
        }
      }

      makeHUD(){
        var st={fontFamily:MONO,fontSize:'16px',color:'#E8F2EA'};
        this.bars=this.add.graphics().setDepth(10);
        this.add.text(24,10,'VISITOR.exe',Object.assign({},st,{color:'#00ff88'})).setDepth(10);
        this.add.text(W-24,10,'ASHNA.OS',Object.assign({},st,{color:'#ff3030'})).setOrigin(1,0).setDepth(10);
        this.timerText=this.add.text(W/2,8,'10.0',Object.assign({},st,{fontSize:'40px',fontStyle:'bold',color:'#ffffff'})).setOrigin(.5,0).setDepth(10);
        this.countText=this.add.text(W/2,56,'ATTACKS 0 / '+TARGET,Object.assign({},st,{color:'#39ff14'})).setOrigin(.5,0).setDepth(10);
        this.hintText=this.add.text(W/2,H-12,'CLICK  /  TAP  /  SPACE',Object.assign({},st,{color:'#92A69A'})).setOrigin(.5,1).setDepth(10);
        this.msg=this.add.text(W/2,H/2-60,'',Object.assign({},st,{fontSize:'64px',fontStyle:'bold',color:'#00ff88',stroke:'#000000',strokeThickness:6})).setOrigin(.5).setDepth(20);
        this.drawBars();
      }

      drawBars(){
        var g=this.bars, bw=280, x1=24, x2=W-24-bw, y=34, h=14;
        g.clear();
        g.fillStyle(0x0b100d,1); g.fillRect(x1,y,bw,h); g.fillRect(x2,y,bw,h);
        var vp=Math.max(0,this.vHP)/100, bp=Math.max(0,1-this.attacks/TARGET);
        g.fillStyle(vp<.3?0xff3030:0x00ff88,1); g.fillRect(x1,y,bw*vp,h);
        g.fillStyle(0xff3030,1); g.fillRect(x2+bw*(1-bp),y,bw*bp,h);
        g.lineStyle(2,0x6f8a78,.8); g.strokeRect(x1,y,bw,h); g.strokeRect(x2,y,bw,h);
      }

      bindInput(){
        var self=this;
        this.input.on('pointerdown',function(p){ if(p.rightButtonDown&&p.rightButtonDown())return; self.attack(); });
        this.input.keyboard.on('keydown-SPACE',function(ev){
          if(ev.repeat)return;                                   // holding Space does nothing
          var ae=document.activeElement;
          if(ae&&ae!==container&&/^(BUTTON|A|INPUT|TEXTAREA)$/.test(ae.tagName))return;
          ev.preventDefault(); self.attack();
        });
      }

      runCountdown(){
        var self=this, steps=['3','2','1','BREACH!'];
        steps.forEach(function(s,i){
          self.after(i*550,function(){
            if(self.state==='over')return;
            self.msg.setText(s).setColor(i===3?'#39ff14':'#00ff88').setScale(1.35);
            self.tweens.add({targets:self.msg,scale:1,duration:260,ease:'Back.out'});
            sfx.play('tick');
            if(i===3){
              self.state='fight';
              self.after(450,function(){self.msg.setText('')});
            }
          });
        });
      }

      attack(){
        if(this.state!=='fight')return;
        var now=performance.now();
        if(now-this.lastHit<MIN_GAP)return;
        this.lastHit=now;
        this.attacks++;
        var big=this.attacks%5===0, self=this;
        this.hintText.setVisible(false);
        this.v.setTexture('visitor_atk'); this.v.x=this.vx+16;
        this.a.setTexture('ashna_hit'); this.a.x=this.ax+(big?10:4);
        if(this.vReset)this.vReset.dead=true;
        this.vReset=this.after(90,function(){
          if(self.state==='over')return;
          self.v.setTexture('visitor_idle'); self.v.x=self.vx;
          self.a.setTexture(self.windup?'ashna_idle':'ashna_idle'); self.a.x=self.ax;
        });
        this.spark(this.ax-30,H-130,big?0xff3030:0x00ff88,big?10:5);
        this.popText(this.ax-10,H-190,big?'CRIT!':'-'+Math.round(100/TARGET)+'%',big?'#ff3030':'#00ff88');
        sfx.play(big?'big':'hit');
        if(big&&!reduce)this.cameras.main.shake(110,.007);
        this.countText.setText('ATTACKS '+this.attacks+' / '+TARGET);
        this.drawBars();
        if(this.attacks>=TARGET)this.finish(true,'breached');
      }

      strike(){
        var self=this;
        this.a.setTexture('ashna_atk'); this.a.x=this.ax-22;
        this.v.setTexture('visitor_hit'); this.v.x=this.vx-8;
        this.vHP-=COUNTER_DMG;
        this.drawBars();
        this.spark(this.vx+30,H-130,0xff3030,6);
        this.popText(this.vx,H-190,'-'+COUNTER_DMG,'#ff3030');
        sfx.play('counter');
        if(!reduce)this.cameras.main.shake(90,.004);
        this.after(150,function(){
          if(self.state==='over')return;
          self.a.setTexture('ashna_idle'); self.a.x=self.ax;
          self.v.setTexture('visitor_idle'); self.v.x=self.vx;
        });
        if(this.vHP<=0)this.finish(false,'health');
      }

      spark(x,y,color,n){
        if(reduce)n=Math.min(n,2);
        for(var i=0;i<n;i++){
          var r=this.add.rectangle(x,y,6,6,color).setDepth(8);
          this.tweens.add({targets:r,x:x+Phaser.Math.Between(-70,70),y:y+Phaser.Math.Between(-70,30),alpha:0,duration:340,onComplete:function(){r.destroy()}});
        }
      }

      popText(x,y,str,color){
        var t=this.add.text(x,y,str,{fontFamily:MONO,fontSize:'22px',fontStyle:'bold',color:color,stroke:'#000',strokeThickness:4}).setOrigin(.5).setDepth(9);
        this.tweens.add({targets:t,y:y-34,alpha:0,duration:480,onComplete:function(){t.destroy()}});
      }

      update(time,delta){
        var dt=this.lastT===null?0:Math.min(time-this.lastT,250);   // real elapsed time; a stalled tab cannot burn the timer
        this.lastT=time;
        this.runTimers(dt);
        if(this.state!=='fight')return;
        var d=dt;
        this.elapsed+=d;
        var left=Math.max(0,DURATION-this.elapsed);
        this.timerText.setText((left/1000).toFixed(1)).setColor(left<3000?'#ff3030':'#ffffff');
        this.nextCounter-=d;
        if(!this.windup&&this.nextCounter<=WINDUP){
          this.windup=true; this.a.setTint(0xff3030);
          this.popText(this.ax,H-200,'!','#ff3030');
        }
        if(this.nextCounter<=0){
          this.windup=false; this.a.clearTint();
          this.nextCounter=COUNTER_GAP;
          this.strike();
          if(this.state==='over')return;
        }
        if(left<=0)this.finish(false,'time');
      }

      finish(win,reason){
        if(this.state==='over')return;
        this.state='over'; this.windup=false; this.a.clearTint();
        var self=this, attacks=this.attacks;
        this.hintText.setVisible(false);
        if(win){
          this.a.setTexture('ashna_dead'); this.v.setTexture('visitor_win'); this.v.x=this.vx; this.a.x=this.ax;
          this.cameras.main.flash(260,34,228,255);
          if(!reduce){
            this.cameras.main.shake(260,.012);
            this.tweens.add({targets:this.a,angle:-75,x:this.ax+50,alpha:.55,duration:700,ease:'Quad.in'});
            this.tweens.add({targets:this.v,y:this.v.y-26,duration:220,yoyo:true,repeat:2});
          }
          this.msg.setText('FIREWALL\nBREACHED').setColor('#39ff14').setFontSize(46);
          sfx.play('win');
          this.after(reduce?600:1500,function(){if(!destroyed&&opts.onWin)opts.onWin(attacks)});
        }else{
          this.v.setTexture('visitor_dead'); this.v.x=this.vx;
          this.a.setTexture('ashna_idle'); this.a.x=this.ax;
          this.msg.setText(reason==='time'?'TIME OUT':'SYSTEM FAILURE').setColor('#ff3030').setFontSize(46);
          sfx.play('lose');
          if(!reduce){
            container.classList.add('glitch');
            this.cameras.main.shake(380,.02);
            this.tweens.add({targets:this.v,angle:-80,x:this.vx-30,duration:500,ease:'Quad.in'});
            setTimeout(function(){container.classList.remove('glitch')},480);
          }
          this.after(reduce?600:1000,function(){if(!destroyed&&opts.onLose)opts.onLose(reason,attacks)});
        }
      }
    }

    game=new Phaser.Game({
      type:Phaser.AUTO, parent:container, width:W, height:H, backgroundColor:'#040605',
      pixelArt:true, banner:false, audio:{noAudio:true}, disableContextMenu:true,
      scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
      scene:[BreachScene]
    });
    return {
      destroy:function(){
        if(destroyed)return; destroyed=true;
        try{game.destroy(true)}catch(e){}
        container.classList.remove('glitch');
        container.innerHTML='';
      }
    };
  }
  window.BreachGame={start:start,TARGET:TARGET,DURATION:DURATION};
})();
