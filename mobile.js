// 휴대폰 화면 정리: 상단 HUD 한 줄, 하단 독(건설·손님·퀘스트·메뉴), 나머지 도구는 메뉴 시트로
(()=>{
 const $=id=>document.getElementById(id);
 const mq=matchMedia('(max-width:600px), (max-height:500px)');
 const tools=$('tools');if(!tools)return;
 const mk=(id,lb,fn,cls)=>{const b=document.createElement('button');b.className='tool '+(cls||'');b.id=id;b.innerHTML=`<i>${lb}</i>`;b.onclick=fn;return b};
 const close=()=>{tools.classList.remove('open');menu.innerHTML='<i>메뉴</i>'};
 // 메뉴 안에만 보이는 버튼: 상단 HUD의 사운드·일시정지, 줌의 '중앙'
 const z=tools.querySelector('.zoom');
 const mHome=mk('mHome','중앙',()=>{$('zHome').click();close()},'mx');
 const mSnd=mk('mSnd','사운드',()=>{const m=$('bMute');if(m){m.click();mSnd.innerHTML=`<i>${m.textContent}</i>`}},'mx');
 const mPause=mk('mPause','일시정지',()=>{close();const p=$('bPause');if(p)p.click()},'mx');
 [mHome,mSnd,mPause].forEach(b=>tools.insertBefore(b,z));
 const menu=mk('tMenu','메뉴',e=>{e.stopPropagation();if(tools.classList.toggle('open')){menu.innerHTML='<i>닫기</i>';const m=$('bMute');if(m)mSnd.innerHTML=`<i>${m.textContent}</i>`}else close()},'dock');
 tools.appendChild(menu);
 // 독에 남길 버튼
 const g=$('tGuest');if(g)g.classList.add('dock');
 [...tools.querySelectorAll('.tool')].forEach(b=>{if(b.textContent.trim()=='퀘스트')b.classList.add('dock')});
 // 메뉴 안 버튼을 누르면 시트 닫기 (사운드는 유지)
 tools.addEventListener('click',e=>{const b=e.target.closest('.tool');if(!b||!tools.classList.contains('open')||b==menu||b==mSnd||b.classList.contains('dock'))return;setTimeout(close,0)});
 document.addEventListener('pointerdown',e=>{if(tools.classList.contains('open')&&!tools.contains(e.target))close()},true);
 // 시계의 ' · ' 구분점을 감쌀 수 있게
 const tm=$('time');if(tm&&tm.nextSibling&&tm.nextSibling.nodeType==3){const sp=document.createElement('span');sp.className='dsep';sp.textContent=tm.nextSibling.textContent;tm.nextSibling.replaceWith(sp)}
 // 퀘스트 카드 접기 (휴대폰)
 const q=$('quest');
 let qmin=false;try{qmin=localStorage.onsenQmin==='1'}catch(e){}
 if(q){q.classList.toggle('qmin',qmin);q.addEventListener('click',e=>{if(!document.body.classList.contains('phone')||!e.target.closest('.qh'))return;q.classList.toggle('qmin');try{localStorage.onsenQmin=q.classList.contains('qmin')?'1':'0'}catch(e){}})}
 const apply=()=>{const on=mq.matches;document.body.classList.toggle('phone',on);document.body.classList.toggle('phone-land',on&&innerWidth>innerHeight);if(!on)close()};
 mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply);addEventListener('resize',apply);apply();
})();
