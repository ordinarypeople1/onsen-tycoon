'use strict';
// ===== 셸: 타이틀 · 새로 시작하기 · 2026 초대/방문 · 일시정지 · 설정 · 저장 슬롯 · 크레딧 =====
const SHELL=(()=>{
 const SET=Object.assign({vol:{master:0.8,bgm:0.6,sfx:0.8,amb:0.8},gfx:'auto',lang:'ko',fps:false},(()=>{try{return JSON.parse(localStorage.onsenSet||'{}')}catch(e){return{}}})());
 const saveSet=()=>{try{localStorage.onsenSet=JSON.stringify(SET)}catch(e){}};
 const I18N={
  ko:{
   eyebrow:'CAPYBARA ONSEN · 료칸 타이쿤',
   gameTitle:'카피바라 온센',
   tagline:'따스한 온천 김 너머, 카피바라가 쉬어가는 계절 료칸',
   show:'이웃 온천 놀러가기',cont:'이어하기',newg:'새로 시작하기',startNew:'온천 시작하기',
   slots:'저장 슬롯',set:'설정',cred:'크레딧',resume:'계속하기',title:'타이틀로',
   paused:'일시정지',vol:'음량',master:'전체',bgm:'배경음악',sfx:'효과음',amb:'환경음',
   gfx:'그래픽 품질',auto:'자동',high:'높음',low:'낮음',lang:'언어',fps:'FPS 표시',
   close:'닫기',slot:'슬롯',empty:'비어 있음',use:'불러오기',del:'삭제',
   zen:'감상 모드',share:'초대 · 방문',press:'아무 키나 눌러 시작'
  },
  en:{
   eyebrow:'CAPYBARA ONSEN · RYOKAN TYCOON',
   gameTitle:'Capybara Onsen',
   tagline:'A tranquil seasonal hot spring inn for capybaras',
   show:'Visit Neighbor Onsen',cont:'Continue',newg:'New Game',startNew:'Start Onsen',
   slots:'Save Slots',set:'Settings',cred:'Credits',resume:'Resume',title:'Title Screen',
   paused:'Paused',vol:'Volume',master:'Master',bgm:'Music',sfx:'Effects',amb:'Ambience',
   gfx:'Graphics',auto:'Auto',high:'High',low:'Low',lang:'Language',fps:'Show FPS',
   close:'Close',slot:'Slot',empty:'Empty',use:'Load',del:'Delete',
   zen:'Zen Mode',share:'Invite · Visit',press:'Press any key'
  }
 };
 const T=k=>(I18N[SET.lang]||I18N.ko)[k]||I18N.ko[k]||k;
 const el=(h)=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild};
 const slotKey=n=>n==1?'onsen2':'onsen2_s'+n;
 const slotInfo=n=>{try{const d=JSON.parse(localStorage[slotKey(n)]||'null');if(!d)return null;return{day:Math.floor(d.min/1440)+1,yen:d.yen,served:d.served,name:d.ryokanName||'유자향 카피바라 료칸',t:d.t}}catch(e){return{bad:1}}};

 // ---- 그래픽 ----
 function applyGfx(){const low=SET.gfx=='low'||(SET.gfx=='auto'&&autoLow);window.GFX_LOW=low;try{resize()}catch(e){}}
 let autoLow=localStorage.onsenAutoLow==='1';
 let fT=0,fN=0,fps=60,probe=0;const fpsEl=el('<div id="fps"></div>');document.body.appendChild(fpsEl);
 BUS.on('frame',dt=>{fT+=dt;fN++;if(fT>=1){fps=fN/fT;fT=0;fN=0;fpsEl.textContent=Math.round(fps)+' FPS';
   if(SET.gfx=='auto'&&!autoLow&&!document.hidden){probe=fps<42?probe+1:0;if(probe>=5&&!(window.WSCALE<1)){window.WSCALE=0.75;probe=0;try{resize()}catch(e){}}else if(probe>=5){autoLow=true;localStorage.onsenAutoLow='1';applyGfx();toast('기기 성능에 맞춰 그래픽 품질을 낮췄어요 (설정에서 변경)')}}}
  fpsEl.style.display=SET.fps?'block':'none'});

 // ---- 오버레이 공통 ----
 let pasteHandler=null;
 function overlay(id,html,cls=''){
  close(id);
  const o=el(`<div class="ovl dim ${cls}" id="${id}"><div class="menu panel">${html}</div></div>`);
  o.addEventListener('pointerdown',e=>{if(e.target===o)close(id)});
  document.body.appendChild(o);
  requestAnimationFrame(()=>o.classList.add('on'));
  return o;
 }
 function close(id){
  if(id==='ovShare'&&pasteHandler){removeEventListener('paste',pasteHandler);pasteHandler=null}
  const o=document.getElementById(id);if(!o)return;o.classList.remove('on');o.id='';setTimeout(()=>o.remove(),250);
 }
 const top=()=>[...document.querySelectorAll('.ovl.on')].pop();

 // ---- 추천 이웃 료칸 프리셋 생성기 ----
 const NEIGHBORS=[
  {id:'moonlight',name:'할머니의 달빛 료칸',stars:5,tag:'5★ 대표 쇼케이스',desc:'달빛 노천탕과 등불 정원 · Day 15'},
  {id:'forest',name:'안개숲 편백 온천',stars:4,tag:'4★ 치유의 숲',desc:'대나무 숲과 폭포 노천탕 · Day 9'},
  {id:'neon',name:'쇼와 네온 온천 거리',stars:3,tag:'3★ 야시장 골목',desc:'네온사인과 라멘·이자카야 거리 · Day 6'}
 ];
 async function buildNeighborData(id){
  if(id==='moonlight'){
   try{
    const r=await fetch('assets/showcase.json');
    if(r.ok){const d=await r.json();d.ryokanName='할머니의 달빛 료칸';d.t=Date.now();return d}
   }catch(_){}
  }
  if(id==='forest'){
   const o=[];const b=(k,x,y,lv=1,price=0)=>o.push({k,x,y,lv,rot:0,price:price||(DEF[k]&&DEF[k].price)||0,uses:0,earn:0});
   b('gate',23,31,1);
   b('hinoki',21,21,5,550);b('fall',26,20,4,950);b('foot',17,24,3,320);b('cave',17,19,3,780);
   b('tea',29,25,3,620);b('dango',26,25,3,380);b('yuzu',20,26,3,380);b('room',33,24,4,5500);
   b('pond',33,19,1);b('shishi',36,19,1);b('nodate',37,21,1);b('pagoda',31,18,1);
   for(const[x,y]of[[16,18],[16,21],[16,24],[25,18],[30,18],[35,17],[39,19]])b('cedar',x,y);
   for(const[x,y]of[[19,18],[24,18],[29,20],[32,22],[38,23]])b('bamboo',x,y);
   for(const[x,y]of[[20,25],[25,24],[28,24],[32,27],[36,27]])b('takeakari',x,y);
   for(const[x,y]of[[23,25],[27,27],[31,27]])b('andon_lantern',x,y);
   for(const[x,y]of[[19,22],[25,22],[30,22],[35,21]])b('fern',x,y);
   for(let j=25;j<=30;j++)b('path',24,j);
   for(let i=18;i<=36;i++)if(i!==24)b('path',i,28);
   for(let j=22;j<=27;j++)b('path_gravel',31,j);
   return{layout:16,ryokanName:'안개숲 편백 온천',yen:34500,min:8*1440+10*60+30,plots:{'1,1':1,'2,1':1},objs:o,fin:{inc:0,exp:0,hist:[]},rep:88,t:Date.now(),served:5200,ver:2};
  }
  const o=[];const b=(k,x,y,lv=1,price=0)=>o.push({k,x,y,lv,rot:0,price:price||(DEF[k]&&DEF[k].price)||0,uses:0,earn:0});
  b('gate',23,31,1);
  b('rock',21,21,4,520);b('sauna',17,21,4,680);b('yuzu',17,25,3,360);
  b('ramen',26,24,5,920);b('izakaya',29,24,5,2100);b('milk',20,26,4,280);
  b('shoot',26,19,3,520);b('pingpong',29,19,3,580);
  for(const[x,y]of[[20,27],[25,27],[28,27]])b('neon_yu',x,y);
  for(const[x,y]of[[22,27],[27,27],[30,27]])b('neon_izakaya',x,y);
  for(const[x,y]of[[23,25],[26,27],[31,26]])b('neon_capy',x,y);
  for(const[x,y]of[[21,29],[25,29],[19,27],[31,27]])b('chochin_tower',x,y);
  for(const[x,y]of[[22,30],[25,30]])b('kagaribi',x,y);
  for(const[x,y]of[[16,20],[16,24],[25,17],[31,17]])b('maple',x,y);
  for(let j=24;j<=30;j++)b('path',24,j);
  for(let i=18;i<=31;i++)if(i!==24)b('path',i,28);
  return{layout:16,ryokanName:'쇼와 네온 온천 거리',yen:26800,min:5*1440+20*60+40,plots:{'1,1':1},objs:o,fin:{inc:0,exp:0,hist:[]},rep:83,t:Date.now(),served:2400,ver:2};
 }

 // ---- 인메모리 방문 전환 & 복귀 ----
 let homeBackup=null;
 let cheeredVisit=false;
 function enterVisit(data,meta={}){
  if(!window.READONLY&&window.S){
   try{save()}catch(_){}
   homeBackup=JSON.parse(JSON.stringify(S));
  }
  cheeredVisit=false;
  ['ovShare','ovPause','ovNew','ovSlot','ovSet','ovCred'].forEach(close);
  const tEl=document.getElementById('title');
  if(tEl){tEl.classList.remove('on');tEl.id='';setTimeout(()=>tEl.remove(),300)}
  inTitle=false;paused=false;
  document.body.classList.remove('titling');
  if(window.AMB&&AMB.setZen)AMB.setZen(false);
  if(window.applyState)window.applyState(data,true);
  const st=meta.stars||(window.__dbg&&window.__dbg.stars?window.__dbg.stars():4);
  const nm=meta.name||data.ryokanName||'이웃 카피바라 료칸';
  visitUI({name:nm,stars:st,day:Math.floor((data.min||0)/1440)+1});
  toast(`${nm}에 방문했어요! 자유롭게 둘러보세요`);
 }
 function exitVisit(){
  const vb=document.getElementById('visitBar');if(vb)vb.remove();
  document.body.classList.remove('visit');
  window.SHOWCASE=0;window.VISIT_SAVE=null;
  if(location.hash)try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}
  let target=homeBackup;
  if(!target){
   try{target=JSON.parse(localStorage[SKEY]||'null')}catch(_){}
  }
  if(!target&&window.fresh)target=window.fresh();
  if(target&&window.applyState){
   window.applyState(target,false);
   save();
   toast('내 료칸으로 돌아왔어요!');
  }else{
   location.href=location.pathname;
  }
 }

 // ---- 새로 시작하기 모달 (New Game) ----
 function newGameModal(fromTitle){
  const cur=SLOT;
  const curInfo=slotInfo(cur);
  const rows=[1,2,3].map(n=>{
   const i=slotInfo(n);
   return `<div class="slot ${n==cur?'cur':''}">
    <b>${T('slot')} ${n}${n==cur?' · 현재':''}</b>
    <span>${i?(i.bad?'손상됨':`<b>${i.name}</b> · Day ${i.day} · ¥${fmt(i.yen)}<br><small>손님 ${fmt(i.served||0)}명 · ${new Date(i.t).toLocaleString('ko-KR')}</small>`):'비어 있음 (바로 시작 가능)'}</span>
    <div class="sbtns"><button class="mb sm ${n==cur?'pri':'sec'}" data-newslot="${n}">${i?'초기화 후 시작':'새로 시작'}</button></div>
   </div>`;
  }).join('');
  const o=overlay('ovNew',`
   <div class="m-head">
    <div class="m-head-left"><span class="m-eyebrow">NEW RYOKAN</span><h2>새로 시작하기</h2></div>
    <button class="m-close-x" data-x>${T('close')}</button>
   </div>
   <p class="note" style="margin:0 0 12px">처음부터 새로운 카피바라 온천을 시작할 슬롯을 선택하세요.</p>
   ${rows}
   <div class="btns">
    <button class="mb pri" id="btnQuickNew">${T('slot')} ${cur}에서 바로 새로 시작하기</button>
    <button class="mb sec" data-x>${T('close')}</button>
   </div>`);
  const startInSlot=(n)=>{
   const info=slotInfo(n);
   if(info&&!info.bad){
    if(!confirm(`슬롯 ${n}의 기존 데이터(Day ${info.day} · ¥${fmt(info.yen)})를 지우고 Day 1부터 새로 시작할까요?`))return;
   }
   const key=slotKey(n);
   try{localStorage[key+'_bak']=localStorage[key]||''}catch(_){}
   const f=window.fresh?window.fresh():null;
   if(n===SLOT&&f&&window.applyState){
    localStorage[key]=JSON.stringify(f);
    close('ovNew');close('ovPause');
    if(document.getElementById('visitBar'))exitVisit();
    window.applyState(f,false);
    start();
    toast(`슬롯 ${n}에서 새로운 온천 료칸을 시작했어요!`);
   }else{
    localStorage.removeItem(key);
    localStorage.onsenSlot=n;
    localStorage.onsenSkipTitle='1';
    location.reload();
   }
  };
  o.querySelector('#btnQuickNew').onclick=()=>startInSlot(cur);
  o.querySelectorAll('[data-newslot]').forEach(b=>b.onclick=()=>startInSlot(+b.dataset.newslot));
  o.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>close('ovNew'));
 }

 // ---- 설정 ----
 function settings(){const v=SET.vol;const sl=k=>`<label class="row"><span>${T(k)}</span><input type="range" min="0" max="1" step="0.05" value="${v[k]}" data-v="${k}"></label>`;
  const o=overlay('ovSet',`<div class="m-head"><div class="m-head-left"><span class="m-eyebrow">PREFERENCES</span><h2>${T('set')}</h2></div><button class="m-close-x" data-x>${T('close')}</button></div>
   <h3>${T('vol')}</h3>${sl('master')}${sl('bgm')}${sl('sfx')}${sl('amb')}
   <h3>${T('gfx')}</h3><div class="seg" data-k="gfx">${['auto','high','low'].map(g=>`<button data-g="${g}" class="${SET.gfx==g?'on':''}">${T(g)}</button>`).join('')}</div>
   <h3>${T('lang')}</h3><div class="seg" data-k="lang"><button data-l="ko" class="${SET.lang=='ko'?'on':''}">한국어</button><button data-l="en" class="${SET.lang=='en'?'on':''}">English</button></div>
   <label class="row chk"><span>${T('fps')}</span><input type="checkbox" ${SET.fps?'checked':''} id="sFps"></label>
   <h3>진단</h3><div class="btns"><button class="mb sm sec" id="sDiag">오류 로그 복사</button></div>
   <div class="btns"><button class="mb sec" data-x>${T('close')}</button></div>`);
  o.querySelector('#sDiag').onclick=async()=>{const t=window.DIAG?DIAG.text():'';try{await navigator.clipboard.writeText(t);toast('오류 로그를 복사했어요. 그대로 붙여넣어 보내주세요')}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('오류 로그를 복사했어요')}catch(_){prompt('아래 내용을 복사하세요',t.slice(0,5000))}ta.remove()}};
  o.querySelectorAll('input[data-v]').forEach(i=>i.oninput=()=>{v[i.dataset.v]=+i.value;saveSet();SND.applyVol&&SND.applyVol()});
  o.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{SET.gfx=b.dataset.g;if(SET.gfx!='auto'){autoLow=false;localStorage.onsenAutoLow='0'}saveSet();applyGfx();settings()});
  o.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{SET.lang=b.dataset.l;saveSet();settings();refreshTexts()});
  o.querySelector('#sFps').onchange=e=>{SET.fps=e.target.checked;saveSet()};o.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>close('ovSet'))}

 // ---- 슬롯 ----
 function slots(fromTitle){const cur=SLOT;const rows=[1,2,3].map(n=>{const i=slotInfo(n);return`<div class="slot ${n==cur?'cur':''}"><b>${T('slot')} ${n}</b><span>${i?(i.bad?'손상됨':`<b>${i.name}</b> · Day ${i.day} · ¥${fmt(i.yen)} · 손님 ${fmt(i.served||0)}명<br><small>${new Date(i.t).toLocaleString('ko-KR')}</small>`):T('empty')}</span>
   <div class="sbtns"><button class="mb sm pri" data-use="${n}">${n==cur?T('resume'):(i?T('use'):T('newg'))}</button>${i?`<button class="mb sm ghost" data-del="${n}">${T('del')}</button>`:''}</div></div>`}).join('');
  const o=overlay('ovSlot',`<div class="m-head"><div class="m-head-left"><span class="m-eyebrow">SAVE DATA</span><h2>${T('slots')}</h2></div><button class="m-close-x" data-x>${T('close')}</button></div>${rows}<p class="note">자동 저장: 5초마다 · 슬롯 전환 시 현재 진행은 자동 저장돼요</p><div class="btns"><button class="mb sec" data-x>${T('close')}</button></div>`);
  o.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{const n=+b.dataset.use;if(n==cur){close('ovSlot');if(fromTitle)start();else resume();return}save();localStorage.onsenSlot=n;localStorage.onsenSkipTitle='1';location.reload()});
  o.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const n=+b.dataset.del;if(confirm(`${T('slot')} ${n} 데이터를 초기화할까요? 되돌릴 수 없어요.`)){if(n==cur&&window.fresh&&window.applyState){const f=window.fresh();localStorage[slotKey(n)]=JSON.stringify(f);window.applyState(f,false)}else{localStorage.removeItem(slotKey(n))}slots(fromTitle)}});
  o.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>close('ovSlot'))}

 // ---- QR 배지 드로잉 & 초대장 이미지 합성 ----
 function drawQrBadge(canvas,str){
  if(!canvas)return;
  const g=canvas.getContext('2d'),N=15,sz=canvas.width;
  g.fillStyle='#f4efe6';g.fillRect(0,0,sz,sz);
  g.fillStyle='#12151c';
  const cell=sz/N;
  const finder=(ox,oy)=>{
   for(let y=0;y<5;y++)for(let x=0;x<5;x++){
    if(x==0||x==4||y==0||y==4||(x==2&&y==2))g.fillRect(Math.round((ox+x)*cell),Math.round((oy+y)*cell),Math.ceil(cell),Math.ceil(cell));
   }
  };
  finder(1,1);finder(N-6,1);finder(1,N-6);
  let h=2166136261;for(let i=0;i<str.length;i++)h=Math.imul(h^str.charCodeAt(i),16777619);
  for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){
   if((x<6&&y<6)||(x>=N-6&&y<6)||(x<6&&y>=N-6))continue;
   h=Math.imul(h^(x*37+y*101),16777619);
   if((h>>>0)%10<5)g.fillRect(Math.round(x*cell),Math.round(y*cell),Math.ceil(cell),Math.ceil(cell));
  }
 }

 function downloadInviteCard(rName,stCount,dayNum,servedNum,code){
  const W=720,H=420,c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  // 배경 그라데이션
  const bg=g.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#141824');bg.addColorStop(1,'#0d1017');
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  // 외곽 보더
  g.strokeStyle='rgba(255,255,255,0.18)';g.lineWidth=2;
  g.strokeRect(16,16,W-32,H-32);
  // 좌측 온천 라이브 스냅샷
  const mainC=document.getElementById('c');
  if(mainC){
   g.save();
   g.beginPath();g.roundRect(36,36,340,H-72,16);g.clip();
   const sw=mainC.width,sh=mainC.height,s=Math.max(340/sw,(H-72)/sh);
   const dw=sw*s,dh=sh*s;
   g.drawImage(mainC,36+(340-dw)/2,36+((H-72)-dh)/2,dw,dh);
   g.restore();
   g.strokeStyle='rgba(255,255,255,0.22)';g.lineWidth=1.5;
   g.beginPath();g.roundRect(36,36,340,H-72,16);g.stroke();
  }
  // 우측 텍스트 정보
  g.fillStyle='#e8c468';g.font='700 13px Pretendard, sans-serif';
  g.fillText('CAPYBARA ONSEN · RYOKAN INVITE PASS',402,72);
  g.fillStyle='#faf8f5';g.font='800 30px Pretendard, sans-serif';
  g.fillText(rName.slice(0,14),402,116);
  g.fillStyle='#e8c468';g.font='700 22px Pretendard, sans-serif';
  g.fillText('★'.repeat(stCount)+'☆'.repeat(Math.max(0,5-stCount)),402,154);
  g.fillStyle='rgba(244,239,230,0.78)';g.font='600 17px Pretendard, sans-serif';
  g.fillText(`Day ${dayNum}  ·  누적 손님 ${fmt(servedNum)}명`,402,190);
  g.fillStyle='rgba(244,239,230,0.52)';g.font='500 14px Pretendard, sans-serif';
  g.fillText('따스한 온천 김 너머, 카피바라가 쉬어가는 계절 료칸',402,226);
  // QR 배지
  const qr=document.createElement('canvas');qr.width=96;qr.height=96;
  drawQrBadge(qr,code);
  g.drawImage(qr,402,262,96,96);
  g.fillStyle='#faf8f5';g.font='700 15px Pretendard, sans-serif';
  g.fillText('초대 코드로 바로 놀러오세요',514,298);
  g.fillStyle='rgba(244,239,230,0.6)';g.font='500 13px monospace';
  g.fillText((code||'').slice(0,22)+'…',514,324);
  g.fillStyle='#6fd4a6';g.font='600 13px Pretendard, sans-serif';
  g.fillText('카피바라 온센 · 초대 · 방문',514,348);

  const a=document.createElement('a');
  a.download=`capybara-onsen-${Date.now().toString(36)}.png`;
  a.href=c.toDataURL('image/png');
  a.click();
  toast('초대장 이미지를 저장했어요! 메신저나 SNS에 공유해보세요');
 }

 // ---- 클립보드/붙여넣기 코드에서 온천 입장 ----
 async function tryEnterFromText(raw){
  if(!raw)return false;
  let code=String(raw).trim();
  const m=code.match(/#visit=([^&\s]+)/);
  if(m)code=decodeURIComponent(m[1]);
  const cMatch=code.match(/((?:CAPY1|YUZU1)\.[A-Za-z0-9._-]+)/);
  if(cMatch)code=cMatch[1];
  const d=await SAVE.codec.decode(code);
  const st=Math.min(5,Math.max(1,Math.floor((d.served||0)/1500)+1));
  enterVisit(d,{name:d.ryokanName||'친구의 카피바라 료칸',stars:st});
  return true;
 }

 // ---- 2026 초대 · 방문 모달 (Visual Invite Pass + 1-Click Neighbor Feed) ----
 async function share(){
  save();
  if(!S.ryokanName)S.ryokanName='유자향 카피바라 료칸';
  let code='';
  try{code=await SAVE.codec.encode(S)}catch(e){toast('초대 코드를 만들지 못했어요');return}
  let link=location.origin+location.pathname+'#visit='+code;
  const stCount=window.stars?stars():1;
  const dNum=window.dayN?dayN():1;
  const svNum=S.served||0;

  const nbHtml=NEIGHBORS.map(nb=>`
   <div class="nb-card">
    <div>
     <span class="nb-tag">${nb.tag}</span>
     <b>${nb.name}</b>
     <p>${nb.desc}</p>
    </div>
    <button class="mb pri sm" data-nb="${nb.id}">놀러가기</button>
   </div>`).join('');

  const o=overlay('ovShare',`
   <div class="m-head">
    <div class="m-head-left"><span class="m-eyebrow">INVITE & VISIT · 2026 PASS</span><h2>초대 · 방문</h2></div>
    <button class="m-close-x" data-x>${T('close')}</button>
   </div>

   <h3>내 온천 초대장 · 원클릭 공유</h3>
   <div class="inv-card">
    <div class="inv-snap-wrap">
     <canvas id="invSnap" width="320" height="200"></canvas>
     <span class="inv-snap-tag">LIVE · Day ${dNum}</span>
    </div>
    <div class="inv-body">
     <div class="inv-top">
      <div class="inv-title-wrap">
       <div class="inv-kicker">RYOKAN PASSPORT</div>
       <div class="inv-name-row">
        <input class="inv-name-inp" id="invName" value="${S.ryokanName.replace(/"/g,'&quot;')}" maxlength="20" aria-label="료칸 이름" title="클릭하여 내 료칸 이름 수정">
       </div>
       <div class="inv-meta">
        <span class="stars">${'★'.repeat(stCount)}<span class="st-off">${'★'.repeat(Math.max(0,5-stCount))}</span></span>
        <span>·</span>
        <span>Day ${dNum}</span>
        <span>·</span>
        <span>손님 ${fmt(svNum)}명</span>
       </div>
      </div>
      <div class="inv-qr-wrap" title="온천 초대 패스 배지"><canvas id="invQr" width="60" height="60"></canvas></div>
     </div>
     <div class="inv-actions">
      <button class="mb pri" id="btnCopyInvite">초대 링크 원클릭 복사</button>
      <button class="mb sec" id="btnSaveCard">초대장 이미지 저장</button>
     </div>
    </div>
   </div>

   <h3>추천 이웃 료칸 · 원클릭 바로 놀러가기</h3>
   <div class="nb-grid">${nbHtml}</div>

   <h3>친구 초대 링크로 입장 (클립보드 자동 인식 · Ctrl+V)</h3>
   <div class="clip-bar">
    <input id="invPaste" placeholder="복사한 초대 링크나 코드를 여기에 붙여넣으면(Ctrl+V) 즉시 이동해요">
    <button class="mb sm pri" id="btnClipVisit">클립보드 링크로 바로 입장</button>
   </div>

   <details class="adv-save">
    <summary>고급 · 기기 간 세이브 백업 및 내 슬롯(${SLOT})으로 복원</summary>
    <div class="cp" style="margin-bottom:8px"><input readonly value="${link}" id="shL"><button class="mb sm sec" data-c="shL">링크 복사</button></div>
    <div class="cp" style="margin-bottom:8px"><textarea readonly id="shC" rows="2">${code}</textarea><button class="mb sm sec" data-c="shC">코드 복사</button></div>
    <div class="cp"><textarea id="shI" rows="2" placeholder="내 슬롯(${SLOT})에 덮어쓸 CAPY1. 저장 코드를 붙여넣으세요"></textarea><button class="mb sm pri" id="shGo">슬롯 복원</button></div>
   </details>
  `);

  // 1) 라이브 온천 캔버스 스냅샷 렌더링
  const snap=o.querySelector('#invSnap'),mainC=document.getElementById('c');
  if(snap&&mainC){
   const sg=snap.getContext('2d');
   const sw=mainC.width,sh=mainC.height,s=Math.max(snap.width/sw,snap.height/sh);
   const dw=sw*s,dh=sh*s;
   sg.drawImage(mainC,(snap.width-dw)/2,(snap.height-dh)/2,dw,dh);
  }
  drawQrBadge(o.querySelector('#invQr'),code);

  // 2) 료칸 이름 실시간 변경 시 초대 링크 갱신
  const nameInp=o.querySelector('#invName');
  nameInp.onchange=async()=>{
   const v=nameInp.value.trim()||'유자향 카피바라 료칸';
   nameInp.value=v;S.ryokanName=v;save();
   try{
    code=await SAVE.codec.encode(S);
    link=location.origin+location.pathname+'#visit='+code;
    o.querySelector('#shL').value=link;
    o.querySelector('#shC').value=code;
    drawQrBadge(o.querySelector('#invQr'),code);
    toast(`료칸 이름을 '${v}'(으)로 변경했어요`);
   }catch(_){}
  };

  // 3) 원클릭 초대 링크 복사
  const copyBtn=o.querySelector('#btnCopyInvite');
  copyBtn.onclick=async()=>{
   try{await navigator.clipboard.writeText(link)}catch(e){
    const inp=o.querySelector('#shL');inp.select();try{document.execCommand('copy')}catch(_){}
   }
   copyBtn.classList.add('copied');
   copyBtn.textContent='✓ 초대 링크 복사 완료! (메신저에 붙여넣기)';
   toast('초대 링크를 복사했어요! 카카오톡·슬랙·디스코드에 바로 붙여넣어 보세요');
   setTimeout(()=>{if(copyBtn.isConnected){copyBtn.classList.remove('copied');copyBtn.textContent='초대 링크 원클릭 복사'}},2800);
  };

  // 4) 초대장 포스트카드 PNG 저장
  o.querySelector('#btnSaveCard').onclick=()=>{
   downloadInviteCard(S.ryokanName||'유자향 카피바라 료칸',stCount,dNum,svNum,code);
  };

  // 5) 추천 이웃 료칸 1-Click 놀러가기
  o.querySelectorAll('[data-nb]').forEach(b=>b.onclick=async()=>{
   const id=b.dataset.nb;
   const nb=NEIGHBORS.find(x=>x.id===id)||NEIGHBORS[0];
   b.textContent='이동 중…';
   const d=await buildNeighborData(id);
   enterVisit(d,{name:nb.name,stars:nb.stars});
  });

  // 6) 클립보드 1-Tap 바로 입장 & 입력창 붙여넣기 즉시 입장
  const pasteInp=o.querySelector('#invPaste');
  pasteInp.oninput=async()=>{
   const v=pasteInp.value.trim();
   if(v.includes('CAPY1.')||v.includes('YUZU1.')||v.includes('#visit=')){
    try{await tryEnterFromText(v)}catch(e){toast('초대 링크 형식을 확인해주세요')}
   }
  };
  o.querySelector('#btnClipVisit').onclick=async()=>{
   const typed=pasteInp.value.trim();
   if(typed){
    try{await tryEnterFromText(typed);return}catch(e){toast('초대 링크가 올바르지 않아요: '+e.message);return}
   }
   try{
    const clip=await navigator.clipboard.readText();
    if(clip&&(clip.includes('CAPY1.')||clip.includes('YUZU1.')||clip.includes('#visit='))){
     await tryEnterFromText(clip);
     return;
    }
    pasteInp.focus();
    toast('클립보드에 초대 링크가 없어요. 입력창에 Ctrl+V로 붙여넣어 주세요!');
   }catch(_){
    pasteInp.focus();
    toast('입력창에 초대 링크를 붙여넣으면(Ctrl+V) 바로 이동해요!');
   }
  };

  // 모달이 열려 있는 동안 어디서든 Ctrl+V 누르면 즉시 친구 온천 입장
  pasteHandler=async(e)=>{
   if(e.target&&e.target.id==='shI')return;
   const txt=(e.clipboardData||window.clipboardData)?.getData('text')||'';
   if(txt&&(txt.includes('CAPY1.')||txt.includes('YUZU1.')||txt.includes('#visit='))){
    e.preventDefault();
    try{await tryEnterFromText(txt)}catch(err){toast('초대 코드를 읽지 못했어요')}
   }
  };
  addEventListener('paste',pasteHandler);

  // 7) 고급 백업/복원 핸들러 유지
  o.querySelectorAll('[data-c]').forEach(b=>b.onclick=async()=>{const t=o.querySelector('#'+b.dataset.c);t.select();try{await navigator.clipboard.writeText(t.value)}catch(e){document.execCommand('copy')}b.textContent='복사됨';setTimeout(()=>b.textContent='복사',1500)});
  o.querySelector('#shGo').onclick=async()=>{const v=o.querySelector('#shI').value;try{const d=await SAVE.codec.decode(v);if(!confirm(`Day ${Math.floor(d.min/1440)+1} · ¥${fmt(d.yen)} 저장으로 슬롯 ${SLOT}을(를) 덮어쓸까요?`))return;localStorage[SKEY+'_bak']=localStorage[SKEY]||'';localStorage[SKEY]=JSON.stringify(d);if(window.applyState){close('ovShare');window.applyState(d,false);toast(`슬롯 ${SLOT}에 저장 데이터를 복원했어요!`)}else{localStorage.onsenSkipTitle='1';location.reload()}}catch(e){toast('코드를 읽지 못했어요: '+e.message)}};
  o.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>close('ovShare'));
 }

 // ---- 방문 모드 상단 플로팅 바 ----
 function visitUI(meta={}){
  document.body.classList.add('visit');
  const old=document.getElementById('visitBar');if(old)old.remove();
  const nm=meta.name||(window.SHOWCASE?'할머니의 달빛 료칸':(window.S&&S.ryokanName)||'이웃 카피바라 료칸');
  const st=meta.stars||(window.SHOWCASE?5:(window.stars?stars():4));
  const b=el(`<div id="visitBar" class="box">
   <span class="vb-badge">방문 중</span>
   <b class="vb-name">${nm}</b>
   <span class="stars">${'★'.repeat(st)}</span>
   <button class="mb sm sec" id="vCheer">♥ 응원하기 (+¥500)</button>
   <button class="mb sm ghost" id="vOther">다른 이웃 보기</button>
   <button class="mb sm pri" id="vHome">내 료칸으로 돌아가기</button>
  </div>`);
  document.body.appendChild(b);
  b.querySelector('#vCheer').onclick=(e)=>{
   if(cheeredVisit){toast('이미 따뜻한 응원을 보냈어요 ♥');return}
   cheeredVisit=true;
   e.currentTarget.textContent='♥ 응원 완료';
   e.currentTarget.style.color='var(--gold)';
   if(window.SND&&SND.quest)SND.quest();
   if(homeBackup)homeBackup.yen=(homeBackup.yen||0)+500;
   else{try{const hd=JSON.parse(localStorage[SKEY]||'null');if(hd){hd.yen=(hd.yen||0)+500;localStorage[SKEY]=JSON.stringify(hd)}}catch(_){}}
   if(window.AMB&&AMB.fx&&window.guests){
    guests.slice(0,5).forEach(g=>{g.hop=0.5;AMB.fx.push({k:'heart',g,l:1.4,L:1.4})});
   }
   toast(`${nm}에 응원(♥)을 보냈어요! 내 료칸에 응원 보너스 +¥500이 적립되었어요`);
  };
  b.querySelector('#vOther').onclick=()=>share();
  b.querySelector('#vHome').onclick=()=>exitVisit();
 }

 // ---- 크레딧 ----
 function credits(){const o=overlay('ovCred',`<div class="m-head"><div class="m-head-left"><span class="m-eyebrow">CREDITS</span><h2>${T('cred')}</h2></div><button class="m-close-x" data-x>${T('close')}</button></div><div class="cred">
  <p><b>카피바라 온센 · 료칸 타이쿤</b><br>CAPYBARA ONSEN · v3.0</p>
  <p><b>기획 · 개발</b><br>ordinarypeople1 & Grok Bot</p>
  <p><b>아트</b><br>이미지 생성 후 수작업 파이프라인(크로마키·디스필·박스 축소·팔레트 정리)으로 픽셀화</p>
  <p><b>사운드</b><br>WebAudio 절차적 합성 — 물소리, 풍경, 고토풍 선율</p>
  <p><b>폰트</b><br>Pretendard — © Kil Hyung-jin, <a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener">github.com/orioncactus/pretendard</a><br>SIL Open Font License 1.1 (<a href="assets/fonts/LICENSE.txt" target="_blank">전문</a>)</p>
  <p><b>특별히 감사</b><br>느긋한 모든 카피바라에게</p></div><div class="btns"><button class="mb sec" data-x>${T('close')}</button></div>`);o.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>close('ovCred'))}

 // ---- 일시정지 ----
 let inTitle=true;
 function pause(){if(inTitle||document.getElementById('ovPause'))return;paused=true;SND.suspend&&SND.suspend(false);
  const o=overlay('ovPause',`<div class="m-head"><div class="m-head-left"><span class="m-eyebrow">CAPYBARA ONSEN</span><h2>${T('paused')}</h2></div><button class="m-close-x" data-a="resume">${T('close')}</button></div>
   <div class="col">
    <button class="mb big pri" data-a="resume"><span class="mb-main">${T('resume')}</span><span class="mb-sub">ESC</span></button>
    <div class="m-grid">
     <button class="mb sec" data-a="share">${T('share')}</button>
     <button class="mb sec" data-a="newg">${T('newg')}</button>
     <button class="mb sec" data-a="slots">${T('slots')}</button>
     <button class="mb sec" data-a="zen">${T('zen')}</button>
     <button class="mb sec" data-a="set">${T('set')}</button>
     <button class="mb sec" data-a="cred">${T('cred')}</button>
    </div>
    <div class="tl-nav">
     <button class="tl-link" data-a="title">${T('title')}</button>
    </div>
   </div>`);
  o.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a=='resume')resume();else if(a=='newg')newGameModal(false);else if(a=='slots')slots();else if(a=='share')share();else if(a=='set')settings();else if(a=='cred')credits();else if(a=='zen'){resume();AMB.setZen(true)}else if(a=='title'){save();resume();showTitle()}})}
 function resume(){close('ovPause');paused=false}

 // ---- 타이틀 ----
 function showTitle(){const prev=document.getElementById("title");if(prev)prev.remove();inTitle=true;paused=true;document.body.classList.add('titling');AMB.setZen(true,true);const info=slotInfo(SLOT),has=!!info&&!info.bad;
  const metaTxt=has?`${T('slot')} ${SLOT} · Day ${info.day}`:`${T('slot')} ${SLOT} · NEW`;
  const o=el(`<div id="title"><div class="tl">
   <div class="tl-head">
    <span class="tl-eyebrow">${T('eyebrow')}</span>
    <h1><span class="k">${T('gameTitle')}</span><span class="s">${T('tagline')}</span></h1>
   </div>
   <div class="tl-pri">
    <button class="mb big pri" data-a="cont"><span class="mb-main">${has?T('cont'):T('startNew')}</span><span class="mb-sub">${metaTxt}</span></button>
    <button class="mb sec" data-a="newg">${T('newg')}</button>
    <button class="mb sec" data-a="share">${T('share')} · ${T('show')}</button>
   </div>
   <div class="tl-nav">
    <button class="tl-link" data-a="slots">${T('slots')}</button>
    <button class="tl-link" data-a="share">${T('share')}</button>
    <button class="tl-link" data-a="zen">${T('zen')}</button>
    <button class="tl-link" data-a="set">${T('set')}</button>
    <button class="tl-link" data-a="cred">${T('cred')}</button>
   </div>
   <div class="ver">v3.0  ·  ESC 일시정지  ·  Z 감상 모드</div></div></div>`);
  document.body.appendChild(o);requestAnimationFrame(()=>o.classList.add('on'));
  o.querySelectorAll('[data-a]').forEach(b=>b.onclick=async e=>{e.stopPropagation();SND.init();const a=b.dataset.a;if(a=='cont')start();else if(a=='newg')newGameModal(true);else if(a=='slots')slots(true);else if(a=='share')share();else if(a=='set')settings();else if(a=='cred')credits();else if(a=='zen'){start();AMB.setZen(true)}else if(a=='show'){const d=await buildNeighborData('moonlight');enterVisit(d,{name:'할머니의 달빛 료칸',stars:5})}})}
 function start(){const o=document.getElementById('title');if(o){o.classList.remove('on');o.id='';setTimeout(()=>o.remove(),700)}inTitle=false;paused=false;document.body.classList.remove('titling');AMB.setZen(false);const zh=document.getElementById('zHome');zh&&zh.click()}
 function refreshTexts(){const o=document.getElementById('title');if(o){o.remove();showTitle()}}

 // ---- 입력 ----
 addEventListener('keydown',e=>{if(inTitle){const t=top();if(e.key=='Escape'&&t){close(t.id);e.stopImmediatePropagation()}else if(e.key=='Enter'&&!t){start()}return}
  if(e.key=='Escape'){const t=top();if(t&&t.id!='ovPause'){close(t.id);e.stopImmediatePropagation();return}
   if(AMB.zen)return;if(document.getElementById('ovPause')){resume();e.stopImmediatePropagation();return}
   const vis=id=>getComputedStyle($(id)).display!='none';if(!ghost&&!moving&&!mode&&!vis('modal')&&!vis('info')){pause();e.stopImmediatePropagation()}}
  else if((e.key=='p'||e.key=='P')&&document.activeElement.tagName!='INPUT'&&document.activeElement.tagName!='TEXTAREA'){document.getElementById('ovPause')?resume():pause()}},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});

 // ---- 상단 HUD '초대 · 방문' + '일시정지' 버튼 & 하단 툴바 '초대·방문' 버튼 ----
 const sp=$('bSpeed');
 const invBtn=el('<div class="box btn" id="bInvite" title="내 온천 초대장 · 이웃 온천 놀러가기">초대 · 방문</div>');
 sp.parentNode.insertBefore(invBtn,sp);invBtn.onclick=()=>share();
 const pb=el('<div class="box btn" id="bPause" title="일시정지 (Esc)">일시정지</div>');
 sp.parentNode.insertBefore(pb,sp);pb.onclick=()=>pause();
 const tools=$('tools');
 if(tools){
  const tInv=el('<button class="tool" id="tInvite" title="초대 · 방문"><i>초대·방문</i></button>');
  tInv.onclick=()=>share();
  tools.insertBefore(tInv,tools.querySelector('.zoom'));
 }

 // ---- 오류 처리 ----
 let errShown=0;const onErr=m=>{console.warn('[onsen]',m);try{save()}catch(e){}if(!errShown++)toast('앗, 작은 문제가 생겼지만 진행은 안전하게 저장했어요')};
 addEventListener('error',e=>onErr(e.message));addEventListener('unhandledrejection',e=>onErr(String(e.reason)));
 applyGfx();
 BUS.on('info',(o,el)=>{if(window.READONLY){const b=el.lastElementChild;if(b)b.querySelectorAll('button').forEach(x=>{if(x.id!='iCl')x.remove()});el.querySelectorAll('[data-p]').forEach(x=>x.remove())}});
 const boot=()=>{if(window.READONLY){visitUI();inTitle=false;paused=false;return}if(localStorage.onsenSkipTitle==='1'||/[?&]notitle/.test(location.search)){localStorage.removeItem('onsenSkipTitle');inTitle=false;paused=false;return}showTitle()};
 if(window.__ready)boot();else{const iv=setInterval(()=>{if(window.__ready){clearInterval(iv);boot()}},50)}
 return{share,newGameModal,enterVisit,exitVisit,SET,T,pause,resume,settings,slots,credits,showTitle,start,get inTitle(){return inTitle}};
})();
window.SHELL=SHELL;
