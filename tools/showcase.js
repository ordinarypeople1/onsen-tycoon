// 쇼케이스 저장 파일을 손으로 배치해 assets/showcase.json 으로 내보낸다
const {chromium}=require('playwright');const fs=require('fs');
const L=[];const A=(k,x,y,lv=1,extra={})=>L.push({k,x,y,lv,...extra});
const line=(k,x0,y0,x1,y1,step=1)=>{const dx=Math.sign(x1-x0)*step,dy=Math.sign(y1-y0)*step;let x=x0,y=y0;for(;;){A(k,x,y);if((dx>=0?x>=x1:x<=x1)&&(dy>=0?y>=y1:y<=y1))break;x+=dx;y+=dy}};
// --- 본관 구역 (16..31) ---
A('rock',22,21,5);A('milky',27,16,5);A('hinoki',17,23,5);A('sauna',17,17,3);A('yuzu',20,17,3);A('milk',17,26,3);
A('maple',26,21);A('rocks',23,17);A('rocks',26,23);A('cedar',16,21);A('maple',16,19);A('fern',20,25);A('mushroom',22,25);
// 본관 전통 조명 & 네온 간판 배치
A('andon_lantern',21,26);A('takeakari',25,26);A('takeakari',26,20);A('kagaribi',22,29);A('kagaribi',25,29);A('andon_lantern',19,22);
A('chochin_tower',22,27);A('chochin_tower',25,27);
A('neon_yu',20,27);A('neon_capy',27,27);A('neon_izakaya',19,27);
A('floating_lanterns',27,25);A('takeakari',28,22);A('andon_lantern',23,25);
A('pond',27,29);A('shishi',30,29);A('fern',30,30);A('mushroom',21,30);
line('path',24,25,24,30);line('path',19,28,23,28);line('path',25,28,31,28);line('path_gravel',29,21,29,27);line('path_gravel',19,23,19,24);
line('path_gravel',19,19,19,19);
// --- 먹자골목 구역 (32..47) ---
line('path_wood',32,28,47,28);
A('ramen',32,25,5);A('teishoku',35,25,3);A('izakaya',38,25,5);A('gift',41,25,3);A('yuzu',44,25,1);A('dango',46,26,2);
A('neon_yu',34,27);A('neon_izakaya',37,27);A('chochin_tower',40,27);A('neon_capy',43,27);A('kagaribi',45,27);
A('tsukimi',47,25);A('banner',31,27);
A('room',33,29,5);A('room',37,29,3);A('room',41,29,5);A('maple',44,29);A('tsukimi',46,29);A('fern',46,30);
A('andon_lantern',36,29);A('takeakari',40,29);
// 뒤뜰 정원
line('bamboofence',32,23,38,23,2);A('torii',40,23);line('bamboofence',42,23,46,23,2);A('nodate',39,19,1);A('pagoda',36,18);A('shishi',42,20);A('pond',43,17);
A('cedar',32,17);A('cedar',34,19);A('cedar',32,20);A('maple',46,17);A('mushroom',38,21);A('fern',43,21);
A('maple',46,20);A('maple',37,17);A('rocks',41,16);A('birdhouse',36,21);A('mushroom',34,21);A('fern',22,19);A('fern',39,17);
A('floating_lanterns',37,19);A('takeakari',42,21);A('ema',36,19,1);
line('path_gravel',36,22,43,22);line('path_gravel',41,18,41,20);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 const r=await p.evaluate(L=>{const D=__dbg,S=D.S,DEF=D.DEF;S.plots={'1,1':1,'2,1':1};S.objs=S.objs.filter(o=>o.k=='gate');D.occ();const fail=[];
  for(const o of L){if(!DEF[o.k]){fail.push('nodef '+o.k);continue}if(!D.canPlace(o.k,o.x,o.y,o.rot||0)){fail.push(o.k+'@'+o.x+','+o.y);continue}S.objs.push({k:o.k,x:o.x,y:o.y,lv:o.lv,rot:o.rot||0,price:DEF[o.k].price||0,uses:0,earn:0,users:0});D.occ()}
  S.yen=48000;S.served=6200;S.rep=92;S.min=14*1440+16*60;S.fin={inc:0,exp:0,hist:[]};
  return{fail,reach:D.reachOK(),stars:D.stars(),json:JSON.stringify(S)}},L);
 console.log('fail:',r.fail.join(' ')||'none','reach:',r.reach,'stars:',r.stars);fs.writeFileSync('assets/showcase.json',r.json);
 await p.evaluate(H=>{for(let i=0;i<900;i++)__dbg.step(0.1);document.body.classList.add('zen');__dbg.S.min=14*1440+H*60;__dbg.focusXY(32,24,2.1)},+(process.env.H||22));await p.waitForTimeout(1200);await p.screenshot({path:'/tmp/sc_over.png'});await b.close()})();
