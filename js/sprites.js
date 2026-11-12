/* Original pixel-art fighters, generated from character grids (no external assets). */
(function(){
  'use strict';
  var BASE=[
    '.....DDDDDD.....',
    '....DBBBBBBD....',
    '...DBBVVVVBBD...',
    '...DBBVVVVBBD...',
    '....DBBBBBBD....',
    '.....DDDDDD.....',
    '....DDBBBBDD....',
    '...DBBBBBBBBD...',
    '..SDBBEEEEBBDS..',
    '..SDBBEEEEBBDS..',
    '..SDBBBBBBBBDS..',
    '...DDBBBBBBDD...',
    '....DBBBBBBD....',
    '....DBBDDBBD....',
    '....DBB..BBD....',
    '....DBB..BBD....',
    '....DBB..BBD....',
    '....DDD..DDD....',
    '...DDDD..DDDD...',
    '...DDDD..DDDD...'
  ];
  var HORNS='...DD.DDDD.DD...';
  var PAL={
    visitor:{B:'#00ff88',D:'#005a30',V:'#ffffff',S:'#8affc8',E:'#e9fff4'},
    ashna:{B:'#141414',D:'#ff3030',V:'#ff3030',S:'#ff6b6b',E:'#ff3030'},
    hit:{B:'#ffffff',D:'#b9c9bd',V:'#ff3030',S:'#ffffff',E:'#ffffff'},
    dead:{B:'#3f4a43',D:'#1b221e',V:'#ff3030',S:'#5b675f',E:'#5b675f'}
  };
  function grid(who){
    var g=BASE.map(function(r){return r.split('')});
    if(who==='ashna')g[0]=HORNS.split('');
    return g;
  }
  function put(g,r,c,ch){if(g[r]&&c>=0&&c<16)g[r][c]=ch}
  function frame(who,name){
    var g=grid(who),r,c,pal=PAL[who];
    if(name==='atk'){
      for(r=8;r<=10;r++)put(g,r,14,'.');
      for(c=12;c<=14;c++){put(g,8,c,'S');put(g,9,c,'S')}
      put(g,8,15,'E');put(g,9,15,'E');
    }else if(name==='hit'){
      pal=PAL.hit;
    }else if(name==='win'){
      for(r=2;r<=8;r++){put(g,r,1,'S');put(g,r,14,'S')}
      put(g,8,2,'S');put(g,8,13,'S');
    }else if(name==='dead'){
      pal=PAL.dead;
      put(g,2,6,'V');put(g,2,7,'B');put(g,2,8,'B');put(g,2,9,'V');
      put(g,3,6,'B');put(g,3,7,'V');put(g,3,8,'V');put(g,3,9,'B');
    }
    return {grid:g,pal:pal};
  }
  function draw(ctx,f,ox,oy,s,flip){
    for(var y=0;y<f.grid.length;y++)for(var x=0;x<16;x++){
      var ch=f.grid[y][x]; if(ch==='.')continue;
      ctx.fillStyle=f.pal[ch];
      ctx.fillRect(ox+(flip?15-x:x)*s,oy+y*s,s,s);
    }
  }
  function drawMini(canvas){
    var ctx=canvas.getContext('2d'); ctx.imageSmoothingEnabled=false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw(ctx,frame('visitor','idle'),8,6,3,false);
    draw(ctx,frame('ashna','idle'),canvas.width-8-48,6,3,true);
    ctx.fillStyle='#ff3030';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('VS',canvas.width/2,40);
  }
  window.BreachSprites={frame:frame,draw:draw,drawMini:drawMini,W:16,H:20,NAMES:['idle','atk','hit','win','dead']};
})();
