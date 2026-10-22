'use strict';
// ===== 퀘스트 · 마일스톤 · 도감 · 단골/VIP · 리뷰 · 연출 =====
const QX=(()=>{
 const M=()=>{if(!S.meta)S.meta={tut:0,stats:{earned:0,built:0,decor:0,upgrades:0,paint:0,vip:0,good:0,unlock:0,price:0,regular:0},daily:null,weekly:null,ms:[],col:{g:{},i:{}},regs:{},reviews:[]};return S.meta};
 const st=()=>M().stats;
 const hasK=k=>S.objs.some(o=>o.k==k);
 const TUT=[
  ['첫 손님 3명 맞이하기',()=>[S.served,3],500],
  ['우유 매점 짓기 (상점 탭)',()=>[hasK('milk')?1:0,1],800],
  ['장식 2개 놓기 (장식 탭)',()=>[st().decor,2],600],
  ['길 10칸 칠하기 (드래그)',()=>[st().paint,10],500],
  ['바위 노천탕 Lv2 업그레이드',()=>[Math.max(0,...S.objs.filter(o=>o.k=='rock').map(o=>o.lv))>=2?1:0,1],1500],
  ['라멘집 짓기 (음식 탭)',()=>[hasK('ramen')?1:0,1],1500],
  ['시설 이용 요금 조정해보기',()=>[st().price>0?1:0,1],500],
  ['손님 30명 맞이하기',()=>[S.served,30],3000],
  ['료칸 등급 2★ 달성',()=>[stars()>=2?1:0,1],3000],
  ['새 구역 열기 (표지판 클릭)',()=>[st().unlock,1],5000]];
 const DPOOL=[['served','손님 {n}명 맞이',[20,35,50],60],['earned','¥{n} 벌기',[6000,12000,20000],0.12],['decor','장식 {n}개 놓기',[1,2,3],400],['upgrades','시설 {n}번 업그레이드',[1,2],900],['paint','길 {n}칸 칠하기',[8,15],40],['good','좋은 리뷰 {n}개 받기',[3,5],300],['vip','VIP 손님 {n}명 접대',[1,2],1200]];
 const WPOOL=[['served','손님 {n}명 맞이',[150,250],30],['earned','¥{n} 벌기',[60000,120000],0.1],['upgrades','시설 {n}번 업그레이드',[5,8],1000],['vip','VIP 손님 {n}명 접대',[5,8],1200]];
 const MILES=[['served',[10,50,100,250,500,1000,2500],'누적 손님 {n}명',n=>n*30],['earned',[10000,50000,200000,500000,1000000],'누적 매출 ¥{n}',n=>n*0.08],['upgrades',[1,5,15,30],'업그레이드 {n}회',n=>n*500],['unlock',[1,3,8],'구역 {n}개 확장',n=>n*4000],['decor',[5,15,40],'장식 {n}개',n=>n*300],['vip',[1,10,30],'VIP {n}명 접대',n=>n*800]];
 const REGS=[['유자','cw1','유자 노천탕 마니아'],['모모','cw2','벚꽃 구경을 좋아해요'],['코타로','cw3','라멘 한 그릇은 필수'],['하나','cw4','기념품 수집가'],['텐','cw1','사우나 장인'],['소라','cw2','밤 온천파'],['키나코','cw3','커피우유 애호가'],['단고','cw4','이자카야 단골']];
 const seedPick=(pool,seed,n)=>{const r=rng(seed*7919+13),a=pool.slice(),out=[];while(out.length<n&&a.length){out.push(a.splice(Math.floor(r()*a.length),1)[0])}return out};
 function mkSet(pool,seed,n){const r=rng(seed*31+7);return seedPick(pool,seed,n).map(([key,txt,goals,rw])=>{const goal=goals[Math.floor(r()*goals.length)];return{key,txt:txt.replace('{n}',fmt(goal)),goal,base:key=='served'?S.served:(st()[key]||0),rw:Math.round(rw<1?goal*rw:goal*rw),claimed:false}})}
 const cur=q=>(q.key=='served'?S.served:(st()[q.key]||0))-q.base;
 function ensureSets(){const m=M(),d=dayN();if(!m.daily||m.daily.day!=d){m.daily={day:d,list:mkSet(DPOOL,d,3)}}const w=Math.floor((d-1)/7);if(!m.weekly||m.weekly.w!=w){m.weekly={w,list:mkSet(WPOOL,w+100,2)}}}
 function reward(y,label){S.yen+=y;S.fin.inc+=y;toast(`🎁 ${label} 보상 ¥${fmt(y)}!`);SND.quest();burst();save();render_()}
 // ----- UI -----
 const box=document.createElement('div');box.id='quest';document.body.appendChild(box);
 function render_(){const m=M();ensureSets();
  if(m.tut<TUT.length){const[t,f,rw]=TUT[m.tut];const[a,b]=f();const done=a>=b;
   box.innerHTML=`<div class="qh">📜 튜토리얼 ${m.tut+1}/${TUT.length}</div><div class="qt">${t}</div><div class="bar"><i style="width:${Math.min(100,a/b*100)}%"></i></div><div class="qf"><span>${Math.min(a,b)}/${b} · 보상 ¥${fmt(rw)}</span>${done?'<button class="b" id="qClaim">받기</button>':''}</div>`;
   if(done)$('qClaim').onclick=()=>{m.tut++;reward(rw,'튜토리얼')}}
  else{const ready=[...m.daily.list,...m.weekly.list].filter(q=>!q.claimed&&cur(q)>=q.goal).length+milesReady().length;
   box.innerHTML=`<div class="qh">📜 오늘의 퀘스트 ${ready?`<b class="dot">${ready}</b>`:''}</div>`+m.daily.list.map(q=>`<div class="qs ${q.claimed?'ok':''}">${q.claimed?'✅':cur(q)>=q.goal?'🎁':'▫️'} ${q.txt} <small>${fmt(Math.min(cur(q),q.goal))}/${fmt(q.goal)}</small></div>`).join('')+`<div class="qf"><span></span><button class="b g" id="qOpen">전체 보기</button></div>`;
   $('qOpen').onclick=modalQuest}}
 function milesReady(){const m=M(),out=[];for(const[key,steps,txt,rw]of MILES){for(const n of steps){const id=key+n;if(m.ms.includes(id))continue;const v=key=='served'?S.served:(st()[key]||0);if(v>=n)out.push({id,txt:txt.replace('{n}',fmt(n)),rw:Math.round(rw(n))});break}}return out}
 function modalQuest(){const m=M();ensureSets();const el=$('modal');
  const row=(q,grp,i)=>{const c=cur(q),ok=c>=q.goal;return`<div class="row"><span>${q.claimed?'✅':ok?'🎁':'▫️'} ${q.txt} <small>(${fmt(Math.min(c,q.goal))}/${fmt(q.goal)})</small></span>${q.claimed?'<small>완료</small>':ok?`<button class="b" data-q="${grp}:${i}">¥${fmt(q.rw)} 받기</button>`:`<small>¥${fmt(q.rw)}</small>`}</div>`};
  const ml=milesReady();const next=MILES.map(([key,steps,txt,rw])=>{const n=steps.find(n=>!m.ms.includes(key+n));if(!n)return`<div class="row"><span>🏆 ${txt.replace('{n}',fmt(steps[steps.length-1]))}</span><small>전부 달성</small></div>`;const v=key=='served'?S.served:(st()[key]||0);const r=ml.find(x=>x.id==key+n);
   return`<div class="row"><span>🏆 ${txt.replace('{n}',fmt(n))} <small>(${fmt(Math.min(v,n))}/${fmt(n)})</small></span>${r?`<button class="b" data-m="${r.id}">¥${fmt(r.rw)} 받기</button>`:`<small>¥${fmt(Math.round(rw(n)))}</small>`}</div>`}).join('');
  el.innerHTML=`<h3>📜 퀘스트</h3><b>오늘 (Day ${m.daily.day})</b>${m.daily.list.map((q,i)=>row(q,'d',i)).join('')}<b style="display:block;margin-top:8px">이번 주</b>${m.weekly.list.map((q,i)=>row(q,'w',i)).join('')}<b style="display:block;margin-top:8px">마일스톤</b>${next}<div style="text-align:right"><button class="b g" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;
  el.style.display='block';
  el.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const[g,i]=b.dataset.q.split(':');const q=(g=='d'?m.daily:m.weekly).list[i];q.claimed=true;reward(q.rw,'퀘스트');modalQuest()});
  el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const r=milesReady().find(x=>x.id==b.dataset.m);if(!r)return;m.ms.push(r.id);reward(r.rw,'마일스톤');modalQuest()})}
 // ----- 도감 -----
 const GKINDS=[['cw1','파란 유카타'],['cw2','분홍 유카타'],['cw3','초록 유카타'],['cw4','베이지 유카타'],['vip','VIP 손님']];
 function modalBook(){const m=M(),el=$('modal');const cell=(img,name,got,sub,filter,ic)=>`<div class="bk ${got?'':'no'}">${img?`<img src="assets/${img}.png" style="${filter?'filter:'+filter:''}">`:`<div class="ph">${ic||'?'}</div>`}<b>${got?name:'???'}</b><small>${got?sub||'':''}</small></div>`;
  const items=Object.entries(DEF).filter(([k,d])=>d.tab&&!d.erase);const gotI=items.filter(([k])=>m.col.i[k]).length;
  el.innerHTML=`<h3>📖 도감</h3><b>손님 (${GKINDS.filter(([k])=>m.col.g[k]).length+REGS.filter(([n])=>m.regs[n]).length}/${GKINDS.length+REGS.length})</b><div class="bkg">${GKINDS.map(([k,n])=>cell(k=='vip'?'cw1':k,n,m.col.g[k],'',k=='vip'?'sepia(1) saturate(3) hue-rotate(-10deg)':'')).join('')}${REGS.map(([n,img,d])=>cell(img,'단골 '+n,m.regs[n],m.regs[n]?`${d} · ${m.regs[n].v}회 방문`:'')).join('')}</div>
  <b style="display:block;margin-top:8px">시설·장식 (${gotI}/${items.length})</b><div class="bkg">${items.map(([k,d])=>{const lv=m.col.i[k]||0;const bi=d.img=='milk'?'yuzu':d.img;const img=bi?(TIERED.includes(bi)?bi+'_lv'+(lv>=5?5:lv>=3?3:1):bi):null;return cell(img,d.n,lv,d.price?`최고 Lv.${lv}`:'',d.filter,d.ic)}).join('')}</div>
  <div style="text-align:right"><button class="b g" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;el.style.display='block'}
 // ----- 리뷰 -----
 const RV={5:['최고의 온천이에요! 또 올게요','물이 정말 좋고 직원도 친절해요','여기서 평생 살고 싶어요'],4:['편안하게 쉬다 갑니다','분위기가 참 좋아요','다음엔 친구랑 올래요'],3:['나쁘지 않았어요','무난한 온천이에요','조금 더 볼거리가 있으면 좋겠어요'],2:['좀 비싸요…','기다리는 시간이 길었어요','먹을 곳이 부족해요'],1:['다신 안 올래요','실망했어요','시설이 너무 부족해요']};
 function review(g){const sc=g.happy>82?5:g.happy>66?4:g.happy>48?3:g.happy>30?2:1;const m=M();let t=RV[sc][Math.random()*3|0];
  if(sc<=2&&g.need.hunger>60)t='배고팠는데 먹을 곳이 없었어요';if(sc<=2&&g.need.thirst>60)t='목이 말랐어요. 매점이 더 있었으면';
  if(sc>=4&&g.used&&g.used.length){const o=g.used[g.used.length-1];if(o&&DEF[o.k])t+=` (${DEF[o.k].n} 추천!)`}
  m.reviews.unshift({n:g.reg||(g.vip?'VIP 손님':'손님'),s:sc,t,d:dayN()});if(m.reviews.length>30)m.reviews.length=30;if(sc>=4)st().good++}
 function modalReviews(){const m=M(),el=$('modal');const avg=m.reviews.length?m.reviews.reduce((a,r)=>a+r.s,0)/m.reviews.length:0;
  el.innerHTML=`<h3>⭐ 손님 리뷰 <small>평균 ${avg.toFixed(1)} / 5 (최근 ${m.reviews.length}개)</small></h3>`+(m.reviews.map(r=>`<div class="row"><span><b>${r.n}</b> <span class="stars">${'★'.repeat(r.s)}<span style="color:#cdbb9c">${'★'.repeat(5-r.s)}</span></span><br><small>${r.t}</small></span><small>Day ${r.d}</small></div>`).join('')||'<div>아직 리뷰가 없어요</div>')+`<div style="text-align:right"><button class="b g" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;el.style.display='block'}
 // ----- 연출 -----
 let coinT=0;
 function flyCoin(sx,sy){const yb=$('yen').getBoundingClientRect();const c=document.createElement('div');c.className='flycoin';c.textContent='¥';c.style.left=sx+'px';c.style.top=sy+'px';document.body.appendChild(c);
  requestAnimationFrame(()=>{c.style.left=(yb.left+6)+'px';c.style.top=(yb.top+4)+'px';c.style.transform='scale(0.6)';c.style.opacity='0.4'});setTimeout(()=>{c.remove();const y=$('yen').parentNode;y.classList.remove('bump');void y.offsetWidth;y.classList.add('bump')},650)}
 function burst(){for(let i=0;i<14;i++){const r=$('quest').getBoundingClientRect();flyCoin(r.left+r.width/2+(Math.random()-0.5)*80,r.top+r.height/2+(Math.random()-0.5)*30)}}
 function flash(){const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),500)}
 // ----- 이벤트 -----
 BUS.on('pay',(o,g,p)=>{st().earned+=p;if(g.vip)st().vip++;const now=performance.now();if(now-coinT>180){coinT=now;const[sx,sy]=toScreenT(...ctr(o));if(sx>0&&sy>0&&sx<innerWidth&&sy<innerHeight){flyCoin(sx,sy-20);SND.coin()}}});
 BUS.on('build',o=>{const d=DEF[o.k];st().built++;if((d.tab=='deco'||d.tab=='theme')&&!d.isPath&&!d.price)st().decor++;const _sd=setsDone();for(const k of _sd)if(!(M().sets||(M().sets=[])).includes(k)){M().sets.push(k);toast('🎐 '+SETS[k][0]+' 세트 완성! 평판 점수 +15');SND.quest&&SND.quest()}M().col.i[o.k]=Math.max(M().col.i[o.k]||0,1);SND.build()});
 BUS.on('upgrade',o=>{st().upgrades++;M().col.i[o.k]=Math.max(M().col.i[o.k]||0,o.lv);SND.upgrade();if(o.lv==3||o.lv==5)flash()});
 BUS.on('unlock',()=>{st().unlock++;SND.unlock()});
 BUS.on('paint',(k,n)=>{st().paint+=n;M().col.i[k]=Math.max(M().col.i[k]||0,1)});
 BUS.on('spawn',g=>{const m=M();m.col.g[g.vip?'vip':g.spr]=1;
  if(!g.vip&&S.served>=15&&Math.random()<0.14){const free=REGS.filter(([n])=>!guests.some(x=>x.reg==n));if(free.length){const[n,img]=free[Math.random()*free.length|0];g.reg=n;g.spr=img;g.budget+=1500;g.happy+=8;const r=m.regs[n]=m.regs[n]||{v:0};r.v++;st().regular++;if(r.v==1)toast(`🦫 새 단골 손님 '${n}'이(가) 찾아왔어요!`);setTimeout(()=>think(g,r.v>1?`${n}: 또 왔어요~ (${r.v}번째)`:`${n}: 처음 왔어요!`),1200)}}
  if(g.vip)setTimeout(()=>think(g,'VIP: 최고의 서비스를 기대할게요'),1000)});
 BUS.on('leave',g=>review(g));
 BUS.on('hour',()=>render_());
 BUS.on('text',t=>{if(cam.z<2.2)return;t.font='700 11px Pretendard';for(const g of guests){if(!(g.reg||g.vip)||g.hide||g.inBath)continue;const[X,Y]=toScreenT(g.x,g.y);const s=g.reg||'VIP';const w=t.measureText(s).width+10;t.fillStyle=g.vip?'rgba(200,150,30,0.9)':'rgba(60,110,170,0.9)';rr(t,X-w/2,Y+4,w,15,7);t.fill();t.fillStyle='#fff';t.fillText(s,X,Y+12)}});
 // 가격 조정 감지
 document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-p]'))st().price++;if(e.target.closest&&e.target.closest('button,.card,.tab'))SND.click()},true);
 // 도구 버튼
 const tools=$('tools');const mkT=(ic,lb,fn)=>{const b=document.createElement('button');b.className='tool';b.innerHTML=`${ic}<i>${lb}</i>`;b.onclick=fn;tools.insertBefore(b,tools.querySelector('.zoom'));return b};
 mkT('📜','퀘스트',modalQuest);mkT('📖','도감',modalBook);mkT('⭐','리뷰',modalReviews);
 const mute=document.createElement('div');mute.className='box btn';mute.id='bMute';mute.textContent=SND.muted()?'🔇':'🔊';mute.onclick=()=>{mute.textContent=SND.toggle()?'🔇':'🔊'};$('bSpeed').before(mute);
 setInterval(()=>{if(S)render_()},1000);
 return{render:render_,modalQuest,modalBook,modalReviews,M,TUT,milesReady}})();
