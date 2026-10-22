'use strict';
// ===== 셸: 타이틀 · 일시정지 · 설정 · 저장 슬롯 · 크레딧 · 오류 처리 · 성능 =====
const SHELL=(()=>{
 const SET=Object.assign({vol:{master:0.8,bgm:0.6,sfx:0.8,amb:0.8},gfx:'auto',lang:'ko',fps:false},(()=>{try{return JSON.parse(localStorage.onsenSet||'{}')}catch(e){return{}}})());
 const saveSet=()=>{try{localStorage.onsenSet=JSON.stringify(SET)}catch(e){}};
 const I18N={ko:{cont:'이어하기',newg:'새로 시작',slots:'저장 슬롯',set:'설정',cred:'크레딧',resume:'계속하기',title:'타이틀로',paused:'일시정지',vol:'음량',master:'전체',bgm:'배경음악',sfx:'효과음',amb:'환경음',gfx:'그래픽 품질',auto:'자동',high:'높음',low:'낮음',lang:'언어',fps:'FPS 표시',close:'닫기',slot:'슬롯',empty:'비어 있음',use:'사용',del:'삭제',zen:'감상 모드',share:'저장 코드 · 방문 링크',press:'아무 키나 눌러 시작'},
  en:{cont:'Continue',newg:'New Game',slots:'Save Slots',set:'Settings',cred:'Credits',resume:'Resume',title:'Title',paused:'Paused',vol:'Volume',master:'Master',bgm:'Music',sfx:'Effects',amb:'Ambience',gfx:'Graphics',auto:'Auto',high:'High',low:'Low',lang:'Language',fps:'Show FPS',close:'Close',slot:'Slot',empty:'Empty',use:'Load',del:'Delete',zen:'Zen Mode',share:'Save Code · Visit Link',press:'Press any key'}};
 const T=k=>(I18N[SET.lang]||I18N.ko)[k]||I18N.ko[k]||k;
 const el=(h)=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild};
 const slotKey=n=>n==1?'onsen2':'onsen2_s'+n;
 const slotInfo=n=>{try{const d=JSON.parse(localStorage[slotKey(n)]||'null');if(!d)return null;return{day:Math.floor(d.min/1440)+1,yen:d.yen,served:d.served,t:d.t}}catch(e){return{bad:1}}};
 // ---- 그래픽 ----
 function applyGfx(){const low=SET.gfx=='low'||(SET.gfx=='auto'&&autoLow);window.GFX_LOW=low;try{resize()}catch(e){}}
 let autoLow=localStorage.onsenAutoLow==='1';
 let fT=0,fN=0,fps=60,probe=0;const fpsEl=el('<div id="fps"></div>');document.body.appendChild(fpsEl);
 BUS.on('frame',dt=>{fT+=dt;fN++;if(fT>=1){fps=fN/fT;fT=0;fN=0;fpsEl.textContent=Math.round(fps)+' FPS';
   if(SET.gfx=='auto'&&!autoLow&&!document.hidden){probe=fps<42?probe+1:0;if(probe>=5){autoLow=true;localStorage.onsenAutoLow='1';applyGfx();toast('기기 성능에 맞춰 그래픽 품질을 낮췄어요 (설정에서 변경)')}}}
  fpsEl.style.display=SET.fps?'block':'none'});
 // ---- 오버레이 공통 ----
 function overlay(id,html,cls=''){close(id);const o=el(`<div class="ovl ${cls}" id="${id}"><div class="menu panel">${html}</div></div>`);document.body.appendChild(o);requestAnimationFrame(()=>o.classList.add('on'));return o}
 function close(id){const o=document.getElementById(id);if(!o)return;o.classList.remove('on');o.id='';setTimeout(()=>o.remove(),250)}
 const top=()=>[...document.querySelectorAll('.ovl.on')].pop();
 // ---- 설정 ----
 function settings(){const v=SET.vol;const sl=k=>`<label class="row"><span>${T(k)}</span><input type="range" min="0" max="1" step="0.05" value="${v[k]}" data-v="${k}"></label>`;
  const o=overlay('ovSet',`<h2>⚙️ ${T('set')}</h2><h3>${T('vol')}</h3>${sl('master')}${sl('bgm')}${sl('sfx')}${sl('amb')}
   <h3>${T('gfx')}</h3><div class="seg" data-k="gfx">${['auto','high','low'].map(g=>`<button data-g="${g}" class="${SET.gfx==g?'on':''}">${T(g)}</button>`).join('')}</div>
   <h3>${T('lang')}</h3><div class="seg" data-k="lang"><button data-l="ko" class="${SET.lang=='ko'?'on':''}">한국어</button><button data-l="en" class="${SET.lang=='en'?'on':''}">English (menus)</button></div>
   <label class="row chk"><span>${T('fps')}</span><input type="checkbox" ${SET.fps?'checked':''} id="sFps"></label>
   <div class="btns"><button class="mb" data-x>${T('close')}</button></div>`);
  o.querySelectorAll('input[data-v]').forEach(i=>i.oninput=()=>{v[i.dataset.v]=+i.value;saveSet();SND.applyVol&&SND.applyVol()});
  o.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{SET.gfx=b.dataset.g;if(SET.gfx!='auto'){autoLow=false;localStorage.onsenAutoLow='0'}saveSet();applyGfx();settings()});
  o.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{SET.lang=b.dataset.l;saveSet();settings();refreshTexts()});
  o.querySelector('#sFps').onchange=e=>{SET.fps=e.target.checked;saveSet()};o.querySelector('[data-x]').onclick=()=>close('ovSet')}
 // ---- 슬롯 ----
 function slots(fromTitle){const cur=SLOT;const rows=[1,2,3].map(n=>{const i=slotInfo(n);return`<div class="slot ${n==cur?'cur':''}"><b>${T('slot')} ${n}</b><span>${i?(i.bad?'⚠️ 손상됨':`Day ${i.day} · ¥${fmt(i.yen)} · 손님 ${fmt(i.served||0)}명<br><small>${new Date(i.t).toLocaleString('ko-KR')}</small>`):T('empty')}</span>
   <div><button class="mb sm" data-use="${n}">${n==cur?'▶ '+T('resume'):(i?T('use'):T('newg'))}</button>${i&&n!=cur?`<button class="mb sm ghost" data-del="${n}">${T('del')}</button>`:''}</div></div>`}).join('');
  const o=overlay('ovSlot',`<h2>💾 ${T('slots')}</h2>${rows}<p class="note">자동 저장: 5초마다 · 슬롯 전환 시 현재 진행은 저장돼요</p><div class="btns"><button class="mb" data-x>${T('close')}</button></div>`);
  o.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{const n=+b.dataset.use;if(n==cur){close('ovSlot');if(fromTitle)start();else resume();return}save();localStorage.onsenSlot=n;localStorage.onsenSkipTitle='1';location.reload()});
  o.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const n=+b.dataset.del;if(confirm(`${T('slot')} ${n} 을(를) 삭제할까요? 되돌릴 수 없어요.`)){localStorage.removeItem(slotKey(n));slots(fromTitle)}});
  o.querySelector('[data-x]').onclick=()=>close('ovSlot')}
 // ---- 저장 코드 · 방문 링크 ----
 async function share(){save();let code='';try{code=await SAVE.codec.encode(S)}catch(e){toast('저장 코드를 만들지 못했어요');return}
  const link=location.origin+location.pathname+'#visit='+code;
  const o=overlay('ovShare',`<h2>📤 ${T('share')}</h2>
   <h3>방문 링크 (읽기 전용으로 내 료칸 구경)</h3><div class="cp"><input readonly value="${link}" id="shL"><button class="mb sm" data-c="shL">복사</button></div><p class="note">${fmt(link.length)}자 · 링크를 받은 사람은 구경만 할 수 있어요</p>
   <h3>저장 코드 (백업 · 다른 기기로 옮기기)</h3><div class="cp"><textarea readonly id="shC" rows="3">${code}</textarea><button class="mb sm" data-c="shC">복사</button></div>
   <h3>저장 코드 가져오기 → 현재 슬롯(${SLOT})</h3><textarea id="shI" rows="3" placeholder="YUZU1. 로 시작하는 코드를 붙여넣으세요"></textarea>
   <div class="btns"><button class="mb" id="shGo">가져오기</button><button class="mb ghost" data-x>${T('close')}</button></div>`);
  o.querySelectorAll('[data-c]').forEach(b=>b.onclick=async()=>{const t=o.querySelector('#'+b.dataset.c);t.select();try{await navigator.clipboard.writeText(t.value)}catch(e){document.execCommand('copy')}b.textContent='복사됨 ✓';setTimeout(()=>b.textContent='복사',1500)});
  o.querySelector('#shGo').onclick=async()=>{const v=o.querySelector('#shI').value;try{const d=await SAVE.codec.decode(v);if(!confirm(`Day ${Math.floor(d.min/1440)+1} · ¥${fmt(d.yen)} 저장으로 슬롯 ${SLOT}을(를) 덮어쓸까요?`))return;localStorage[SKEY+'_bak']=localStorage[SKEY]||'';window.READONLY=true;localStorage[SKEY]=JSON.stringify(d);localStorage.onsenSkipTitle='1';location.reload()}catch(e){toast('코드를 읽지 못했어요: '+e.message)}};
  o.querySelector('[data-x]').onclick=()=>close('ovShare')}
 // ---- 방문 모드 ----
 function visitUI(){document.body.classList.add('visit');const b=el(`<div id="visitBar" class="box"><span>👀 다른 료칸을 구경 중이에요 · 읽기 전용</span><button class="mb sm" id="vHome">내 료칸으로</button></div>`);document.body.appendChild(b);b.querySelector('#vHome').onclick=()=>{location.href=location.pathname}}
 // ---- 크레딧 ----
 function credits(){const o=overlay('ovCred',`<h2>🌸 ${T('cred')}</h2><div class="cred">
  <p><b>유자 온센 료칸 타이쿤</b><br>v3.0 · 웹 아이들 타이쿤</p>
  <p><b>기획 · 개발</b><br>ordinarypeople1 & Grok Bot</p>
  <p><b>아트</b><br>이미지 생성 후 수작업 파이프라인(크로마키·디스필·박스 축소·팔레트 정리)으로 픽셀화</p>
  <p><b>사운드</b><br>WebAudio 절차적 합성 — 물소리, 풍경, 고토풍 선율</p>
  <p><b>폰트</b><br>Pretendard — © Kil Hyung-jin, <a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener">github.com/orioncactus/pretendard</a><br>SIL Open Font License 1.1 (<a href="assets/fonts/LICENSE.txt" target="_blank">전문</a>)</p>
  <p><b>특별히 감사</b><br>느긋한 모든 카피바라에게 ♨</p></div><div class="btns"><button class="mb" data-x>${T('close')}</button></div>`);o.querySelector('[data-x]').onclick=()=>close('ovCred')}
 // ---- 일시정지 ----
 let inTitle=true;
 function pause(){if(inTitle||document.getElementById('ovPause'))return;paused=true;SND.suspend&&SND.suspend(false);
  const o=overlay('ovPause',`<h2>⏸ ${T('paused')}</h2><div class="col"><button class="mb big" data-a="resume">▶ ${T('resume')}</button><button class="mb" data-a="slots">💾 ${T('slots')}</button><button class="mb" data-a="share">📤 ${T('share')}</button><button class="mb" data-a="set">⚙️ ${T('set')}</button><button class="mb" data-a="zen">🍃 ${T('zen')}</button><button class="mb" data-a="cred">🌸 ${T('cred')}</button><button class="mb ghost" data-a="title">🏠 ${T('title')}</button></div>`,'dim');
  o.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a=='resume')resume();else if(a=='slots')slots();else if(a=='share')share();else if(a=='set')settings();else if(a=='cred')credits();else if(a=='zen'){resume();AMB.setZen(true)}else if(a=='title'){save();resume();showTitle()}})}
 function resume(){close('ovPause');paused=false}
 // ---- 타이틀 ----
 function showTitle(){inTitle=true;paused=true;document.body.classList.add('titling');AMB.setZen(true,true);const has=!!slotInfo(SLOT);
  const o=el(`<div id="title"><div class="tl"><img src="assets/emblem.png" class="emb" alt=""><h1><span class="k">유자 온센</span><span class="s">YUZU ONSEN · 료칸 타이쿤</span></h1>
   <div class="col">${has?`<button class="mb big" data-a="cont">▶ ${T('cont')} <small>(${T('slot')} ${SLOT})</small></button>`:`<button class="mb big" data-a="cont">▶ ${T('newg')}</button>`}
   <button class="mb" data-a="slots">💾 ${T('slots')}</button><button class="mb" data-a="share">📤 ${T('share')}</button><button class="mb" data-a="set">⚙️ ${T('set')}</button><button class="mb" data-a="zen">🍃 ${T('zen')}</button><button class="mb ghost" data-a="cred">🌸 ${T('cred')}</button></div>
   <div class="ver">v3.0 · Esc 일시정지 · Z 감상 모드</div></div></div>`);
  document.body.appendChild(o);requestAnimationFrame(()=>o.classList.add('on'));
  o.querySelectorAll('[data-a]').forEach(b=>b.onclick=e=>{e.stopPropagation();SND.init();const a=b.dataset.a;if(a=='cont')start();else if(a=='slots')slots(true);else if(a=='set')settings();else if(a=='cred')credits();else if(a=='zen'){start();AMB.setZen(true)}})}
 function start(){const o=document.getElementById('title');if(o){o.classList.remove('on');o.id='';setTimeout(()=>o.remove(),700)}inTitle=false;paused=false;document.body.classList.remove('titling');AMB.setZen(false);const zh=document.getElementById('zHome');zh&&zh.click()}
 function refreshTexts(){const o=document.getElementById('title');if(o){o.remove();showTitle()}}
 // ---- 입력 ----
 addEventListener('keydown',e=>{if(inTitle){const t=top();if(e.key=='Escape'&&t){close(t.id);e.stopImmediatePropagation()}else if(e.key=='Enter'&&!t){start()}return}
  if(e.key=='Escape'){const t=top();if(t&&t.id!='ovPause'){close(t.id);e.stopImmediatePropagation();return}
   if(AMB.zen)return;if(document.getElementById('ovPause')){resume();e.stopImmediatePropagation();return}
   if(!ghost&&!moving&&!mode&&$('modal').style.display!='block'&&$('info').style.display!='block'){pause();e.stopImmediatePropagation()}}
  else if(e.key=='p'||e.key=='P'){document.getElementById('ovPause')?resume():pause()}},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
 // 상단 일시정지 버튼
 const pb=el('<div class="box btn" id="bPause" title="일시정지 (Esc)">⏸</div>');const sp=$('bSpeed');sp.parentNode.insertBefore(pb,sp);pb.onclick=()=>pause();
 // ---- 오류 처리 ----
 let errShown=0;const onErr=m=>{console.warn('[onsen]',m);try{save()}catch(e){}if(!errShown++)toast('앗, 작은 문제가 생겼지만 진행은 안전하게 저장했어요')};
 addEventListener('error',e=>onErr(e.message));addEventListener('unhandledrejection',e=>onErr(String(e.reason)));
 applyGfx();
 BUS.on('info',(o,el)=>{if(window.READONLY){const b=el.lastElementChild;if(b)b.querySelectorAll('button').forEach(x=>{if(x.id!='iCl')x.remove()});el.querySelectorAll('[data-p]').forEach(x=>x.remove())}});
 const boot=()=>{if(window.READONLY){visitUI();inTitle=false;paused=false;return}if(localStorage.onsenSkipTitle==='1'||/[?&]notitle/.test(location.search)){localStorage.removeItem('onsenSkipTitle');inTitle=false;paused=false;return}showTitle()};
 if(window.__ready)boot();else{const iv=setInterval(()=>{if(window.__ready){clearInterval(iv);boot()}},50)}
 return{share,SET,T,pause,resume,settings,slots,credits,showTitle,start,get inTitle(){return inTitle}};
})();
window.SHELL=SHELL;
