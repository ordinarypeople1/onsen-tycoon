// 휴대폰 화면 정리: 상단 HUD 한 줄, 하단 독(건설·손님·퀘스트·메뉴), 나머지 도구는 메뉴 시트로
(()=>{
 const $=id=>document.getElementById(id);
 const mq=matchMedia('(max-width:600px), (max-height:500px)');
 const tools=$('tools');if(!tools)return;
 const mk=(id,lb,fn,cls)=>{const b=document.createElement('button');b.className='tool '+(cls||'');b.id=id;b.innerHTML=`<i>${lb}</i>`;b.onclick=fn;return b};
 const close=()=>{tools.classList.remove('open');menu.innerHTML=L('<i>메뉴</i>');menu.dataset.ic='menu'};
 // 메뉴 안에만 보이는 버튼: 상단 HUD의 사운드·일시정지, 줌의 '중앙'
 const z=tools.querySelector('.zoom');
 const mHome=mk('mHome',L('중앙'),()=>{$('zHome').click();close()},'mx');
 const mSnd=mk('mSnd',L('사운드'),()=>{const m=$('bMute');if(m){m.click();mSnd.innerHTML=`<i>${m.textContent}</i>`}},'mx');
 const mPause=mk('mPause',L('일시정지'),()=>{close();const p=$('bPause');if(p)p.click()},'mx');
 [mHome,mSnd,mPause].forEach(b=>tools.insertBefore(b,z));
 const menu=mk('tMenu',L('메뉴'),e=>{e.stopPropagation();if(tools.classList.toggle('open')){tagIcons();menu.innerHTML=L('<i>닫기</i>');menu.dataset.ic='close';const m=$('bMute');if(m)mSnd.innerHTML=`<i>${m.textContent}</i>`}else close()},'dock');
 tools.appendChild(menu);
 // 독에 남길 버튼
 const g=$('tGuest');if(g)g.classList.add('dock');
 [...tools.querySelectorAll('.tool')].forEach(b=>{if(b.dataset.ic=='quest')b.classList.add('dock')});
 // 메뉴 안 버튼을 누르면 시트 닫기 (사운드는 유지)
 tools.addEventListener('click',e=>{const b=e.target.closest('.tool');if(!b||!tools.classList.contains('open')||b==menu||b==mSnd||b.classList.contains('dock'))return;setTimeout(close,0)});
 document.addEventListener('pointerdown',e=>{if(tools.classList.contains('open')&&!tools.contains(e.target))close()},true);
 // 시계의 ' · ' 구분점을 감쌀 수 있게
 const tm=$('time');if(tm&&tm.nextSibling&&tm.nextSibling.nodeType==3){const sp=document.createElement('span');sp.className='dsep';sp.textContent=tm.nextSibling.textContent;tm.nextSibling.replaceWith(sp)}
 // 퀘스트 카드 접기 (휴대폰)
 const q=$('quest');
 if(q&&window.L){q.style.setProperty('--fold',JSON.stringify(L('접기')));q.style.setProperty('--unfold',JSON.stringify(L('펼치기')))}
 let qmin=false;try{qmin=localStorage.onsenQmin==='1'}catch(e){}
 if(q){q.classList.toggle('qmin',qmin);q.addEventListener('click',e=>{if(!document.body.classList.contains('phone')||!e.target.closest('.qh'))return;q.classList.toggle('qmin');try{localStorage.onsenQmin=q.classList.contains('qmin')?'1':'0'}catch(e){}})}
 // 아이콘 이름 붙이기 (나중에 추가되는 버튼도 있어 여러 번 실행)
 const IC={'재정':'fin','손님':'guest','철거':'del','퀘스트':'quest','도감':'book','리뷰':'review','엽서':'mail','초대·방문':'invite','연출':'fx','감상':'zen','중앙':'home','사운드':'sound','음소거':'sound','일시정지':'pause'};
 const tagIcons=()=>{for(const b of tools.querySelectorAll('.tool[data-ic]'))b.dataset.tip=(b.textContent||'').replace(/\d+$/,'').trim();for(const b of tools.querySelectorAll('.tool')){if(b.dataset.ic||b===menu)continue;const t=b.textContent.trim();for(const k in IC)if(t.startsWith(k)||t.startsWith(window.L?L(k):k)){b.dataset.ic=IC[k];break}}};
 menu.dataset.ic='menu';const bo=$('bOpen');if(bo){bo.dataset.ic='build';const n=bo.textContent.trim();bo.title=n;bo.setAttribute('aria-label',n)}
 for(const [id,ic] of [['bMute','sound'],['bInvite','invite'],['bPause','pause']]){const e=$(id);if(e)e.dataset.ic=ic}
 tagIcons();let tn=0;const ti=setInterval(()=>{tagIcons();if(++tn>20)clearInterval(ti)},500);
 // ---- 건설·철거 중 하단 바: [회전] [취소] (모든 기기). 휴대폰은 배치하는 동안 건설 시트를 내려 화면을 비움 ----
 const bar=document.createElement('div');bar.id='ghBar';bar.className='box';
 bar.innerHTML=L('<span id="ghTxt"></span><button id="ghR" data-ic="rotate"><i>회전</i></button><button id="ghX" data-ic="close"><i>취소</i></button>');
 document.body.appendChild(bar);
 const ghR=bar.querySelector('#ghR'),ghX=bar.querySelector('#ghX'),ghT=bar.querySelector('#ghTxt');
 const stop=e=>{e.stopPropagation();e.preventDefault()};
 ghR.addEventListener('pointerdown',stop);ghX.addEventListener('pointerdown',stop);
 ghR.onclick=e=>{stop(e);const r=$('ghRot');if(r)r.click()};
 ghX.onclick=e=>{stop(e);try{escCancel()}catch(_){}};
 setInterval(()=>{let g=null,m=null;try{g=ghost;m=mode}catch(_){return}
  const mv=(()=>{try{return moving}catch(_){return null}})();
  const on=!!(g||m=='del')&&!mv;bar.classList.toggle('on',on);document.body.classList.toggle('placing',on);
  if(!on)return;const d=g&&DEF[g];
  ghR.style.display=(d&&g!='gate'&&!d.isPath&&!d.erase)?'':'none';
  ghT.textContent=m=='del'?L('철거할 시설을 눌러주세요'):d?(d.isPath||d.erase?L`${d.n} · 눌러서 칠하기`:L`${d.n} · 끌어서 놓으세요`):'';
 },150);
 const apply=()=>{const on=mq.matches;document.body.classList.toggle('phone',on);document.body.classList.toggle('phone-land',on&&innerWidth>innerHeight);if(!on)close()};
 mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply);addEventListener('resize',apply);apply();
})();
