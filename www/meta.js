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
 function reward(y,label){S.yen+=y;S.fin.inc+=y;toast(`${label} 보상 ¥${fmt(y)}!`);SND.quest();burst();save();render_()}
 // ----- UI -----
 const box=document.createElement('div');box.id='quest';document.body.appendChild(box);
 function render_(){const m=M();ensureSets();
  if(m.tut<TUT.length){const[t,f,rw]=TUT[m.tut];const[a,b]=f();const done=a>=b;
   box.innerHTML=`<div class="qh">튜토리얼 <span>${m.tut+1}/${TUT.length}</span></div><div class="qt">${t}</div><div class="bar"><i style="width:${Math.min(100,a/b*100)}%"></i></div><div class="qf"><span>${Math.min(a,b)}/${b} · 보상 ¥${fmt(rw)}</span>${done?'<button class="b" id="qClaim">받기</button>':''}</div>`;
   if(done)$('qClaim').onclick=()=>{m.tut++;reward(rw,'튜토리얼')}}
  else{const ready=[...m.daily.list,...m.weekly.list].filter(q=>!q.claimed&&cur(q)>=q.goal).length+milesReady().length;
   box.innerHTML=`<div class="qh">오늘의 퀘스트 ${ready?`<b class="dot">${ready}</b>`:''}</div>`+m.daily.list.map(q=>`<div class="qs ${q.claimed?'ok':''}"><span class="q-bullet">${q.claimed?'✓':cur(q)>=q.goal?'●':'·'}</span> ${q.txt} <small>${fmt(Math.min(cur(q),q.goal))}/${fmt(q.goal)}</small></div>`).join('')+`<div class="qf"><span></span><button class="b g" id="qOpen">전체 보기</button></div>`;
   $('qOpen').onclick=modalQuest}}
 function milesReady(){const m=M(),out=[];for(const[key,steps,txt,rw]of MILES){for(const n of steps){const id=key+n;if(m.ms.includes(id))continue;const v=key=='served'?S.served:(st()[key]||0);if(v>=n)out.push({id,txt:txt.replace('{n}',fmt(n)),rw:Math.round(rw(n))});break}}return out}
 function modalQuest(){const m=M();ensureSets();const el=$('modal');
  const row=(q,grp,i)=>{const c=cur(q),ok=c>=q.goal;return`<div class="row"><span>${q.claimed?'✓':ok?'●':'·'} ${q.txt} <small>(${fmt(Math.min(c,q.goal))}/${fmt(q.goal)})</small></span>${q.claimed?'<small>완료</small>':ok?`<button class="b" data-q="${grp}:${i}">¥${fmt(q.rw)} 받기</button>`:`<small>¥${fmt(q.rw)}</small>`}</div>`};
  const ml=milesReady();const next=MILES.map(([key,steps,txt,rw])=>{const n=steps.find(n=>!m.ms.includes(key+n));if(!n)return`<div class="row"><span>${txt.replace('{n}',fmt(steps[steps.length-1]))}</span><small>전부 달성</small></div>`;const v=key=='served'?S.served:(st()[key]||0);const r=ml.find(x=>x.id==key+n);
   return`<div class="row"><span>${txt.replace('{n}',fmt(n))} <small>(${fmt(Math.min(v,n))}/${fmt(n)})</small></span>${r?`<button class="b" data-m="${r.id}">¥${fmt(r.rw)} 받기</button>`:`<small>¥${fmt(Math.round(rw(n)))}</small>`}</div>`}).join('');
  el.innerHTML=`<h3>퀘스트</h3><b>오늘 (Day ${m.daily.day})</b>${m.daily.list.map((q,i)=>row(q,'d',i)).join('')}<b style="display:block;margin-top:8px">이번 주</b>${m.weekly.list.map((q,i)=>row(q,'w',i)).join('')}<b style="display:block;margin-top:8px">마일스톤</b>${next}<div style="text-align:right;margin-top:10px"><button class="b g" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;
  el.style.display='block';
  el.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const[g,i]=b.dataset.q.split(':');const q=(g=='d'?m.daily:m.weekly).list[i];q.claimed=true;reward(q.rw,'퀘스트');modalQuest()});
  el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const r=milesReady().find(x=>x.id==b.dataset.m);if(!r)return;m.ms.push(r.id);reward(r.rw,'마일스톤');modalQuest()})}
 // ----- 도감 -----
 const GKINDS=[['cw1','파란 유카타'],['cw2','분홍 유카타'],['cw3','초록 유카타'],['cw4','베이지 유카타'],['vip','VIP 손님']];
 function modalBook(){const m=M(),el=$('modal');const cell=(img,name,got,sub,filter,ic)=>`<div class="bk ${got?'':'no'}">${img?`<img src="${window.SPRURL?SPRURL(img):'assets/'+img+'.png'}" style="${filter?'filter:'+filter:''}">`:`<div class="ph">${ic||'?'}</div>`}<b>${got?name:'???'}</b><small>${got?sub||'':''}</small></div>`;
  const items=Object.entries(DEF).filter(([k,d])=>d.tab&&!d.erase);const gotI=items.filter(([k])=>m.col.i[k]).length;
  el.innerHTML=`<h3>도감</h3><b>손님 (${GKINDS.filter(([k])=>m.col.g[k]).length+REGS.filter(([n])=>m.regs[n]).length}/${GKINDS.length+REGS.length})</b><div class="bkg">${GKINDS.map(([k,n])=>cell(k=='vip'?'cw1':k,n,m.col.g[k],'',k=='vip'?'sepia(1) saturate(3) hue-rotate(-10deg)':'')).join('')}${REGS.map(([n,img,d])=>cell(img,'단골 '+n,m.regs[n],m.regs[n]?`${d} · ${m.regs[n].v}회 방문`:'')).join('')}</div>
  <b style="display:block;margin-top:8px">시설·장식 (${gotI}/${items.length})</b><div class="bkg">${items.map(([k,d])=>{const lv=m.col.i[k]||0;const bi=d.img;const img=bi?(TIERED.includes(bi)?bi+'_lv'+(lv>=5?5:lv>=3?3:1):bi):null;return cell(img,d.n,lv,d.price?`최고 Lv.${lv}`:'',d.filter,d.ic)}).join('')}</div>
  <div style="text-align:right;margin-top:10px"><button class="b g" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;
  el.style.display='block';if(window.ICFIX)ICFIX(el)}
 // ----- 리뷰 -----
 const RV={5:['최고의 온천이에요! 또 올게요','물이 정말 좋고 직원도 친절해요','여기서 평생 살고 싶어요'],4:['편안하게 쉬다 갑니다','분위기가 참 좋아요','다음엔 친구랑 올래요'],3:['나쁘지 않았어요','무난한 온천이에요','조금 더 볼거리가 있으면 좋겠어요'],2:['좀 비싸요…','기다리는 시간이 길었어요','먹을 곳이 부족해요'],1:['다신 안 올래요','실망했어요','시설이 너무 부족해요']};
 function review(g){const sc=g.happy>82?5:g.happy>66?4:g.happy>48?3:g.happy>30?2:1;const m=M();let t=RV[sc][Math.random()*3|0];
  if(sc<=2&&g.need.hunger>60)t='배고팠는데 먹을 곳이 없었어요';if(sc<=2&&g.need.thirst>60)t='목이 말랐어요. 매점이 더 있었으면';
  if(sc>=4&&g.used&&g.used.length){const o=g.used[g.used.length-1];if(o&&DEF[o.k])t+=` (${DEF[o.k].n} 추천!)`}
  m.reviews.unshift({n:g.reg||(g.vip?'VIP 손님':'손님'),s:sc,t,d:dayN()});if(m.reviews.length>30)m.reviews.length=30;if(sc>=4)st().good++}
 function modalReviews(){const m=M(),el=$('modal');const avg=m.reviews.length?m.reviews.reduce((a,r)=>a+r.s,0)/m.reviews.length:0;
  el.innerHTML=`<h3>손님 리뷰 <small>평균 ${avg.toFixed(1)} / 5 (최근 ${m.reviews.length}개)</small></h3>`+(m.reviews.map(r=>`<div class="row"><span><b>${r.n}</b> <span class="stars">${'★'.repeat(r.s)}<span class="st-off">${'★'.repeat(5-r.s)}</span></span><br><small>${r.t}</small></span><small>Day ${r.d}</small></div>`).join('')||'<div>아직 리뷰가 없어요</div>')+`<div style="text-align:right;margin-top:10px"><button class="b g" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;el.style.display='block'}
 // ----- 연출 -----
 let coinT=0;
 function flyCoin(sx,sy){const yb=$('yen').getBoundingClientRect();const c=document.createElement('div');c.className='flycoin';c.textContent='¥';c.style.left='0px';c.style.top='0px';document.body.appendChild(c);
  const ex=yb.left+6,ey=yb.top+4,mx=(sx+ex)/2+(Math.random()-0.5)*120,my=Math.min(sy,ey)-60-Math.random()*60,K=[];
  for(let i=0;i<=12;i++){const t=i/12,u=1-t,x=u*u*sx+2*u*t*mx+t*t*ex,y=u*u*sy+2*u*t*my+t*t*ey;K.push({transform:`translate(${x}px,${y}px) scale(${1.15-0.55*t}) rotateY(${t*540}deg)`,opacity:t<0.1?t*10:1-0.4*t*t})}
  const an=c.animate?c.animate(K,{duration:620+Math.random()*160,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'forwards'}):null;
  const done=()=>{c.remove();const y=$('yen').parentNode;y.classList.remove('bump');void y.offsetWidth;y.classList.add('bump')};if(an)an.onfinish=done;else setTimeout(done,650)}
 function lvPop(o){try{const[sx,sy]=toScreenT(...ctr(o));const e=document.createElement('div');e.className='lvpop'+(o.lv==3||o.lv==5?' big':'');e.innerHTML=`<b>Lv.${o.lv}</b>${o.lv==3||o.lv==5?'<small>새 외관!</small>':''}`;e.style.left=sx+'px';e.style.top=(sy-30)+'px';document.body.appendChild(e);setTimeout(()=>e.remove(),1600)}catch(_){}}
 function burst(){for(let i=0;i<14;i++){const r=$('quest').getBoundingClientRect();flyCoin(r.left+r.width/2+(Math.random()-0.5)*80,r.top+r.height/2+(Math.random()-0.5)*30)}}
 function flash(){const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),500)}
 // ----- 이벤트 -----
 BUS.on('pay',(o,g,p)=>{st().earned+=p;if(g.vip)st().vip++;if(window.__warm)return;const now=performance.now();if(now-coinT>180){coinT=now;const[sx,sy]=toScreenT(...ctr(o));if(sx>0&&sy>0&&sx<innerWidth&&sy<innerHeight){flyCoin(sx,sy-20);SND.coin()}}});
 BUS.on('build',o=>{const d=DEF[o.k];st().built++;if((d.tab=='deco'||d.tab=='theme')&&!d.isPath&&!d.price)st().decor++;const _sd=setsDone();for(const k of _sd)if(!(M().sets||(M().sets=[])).includes(k)){M().sets.push(k);toast(SETS[k][0]+' 세트 완성! 평판 점수 +15');SND.quest&&SND.quest()}M().col.i[o.k]=Math.max(M().col.i[o.k]||0,1);SND.build()});
 BUS.on('upgrade',o=>{st().upgrades++;M().col.i[o.k]=Math.max(M().col.i[o.k]||0,o.lv);SND.upgrade();lvPop(o);if(o.lv==3||o.lv==5)flash()});
 BUS.on('unlock',()=>{st().unlock++;SND.unlock()});
 BUS.on('paint',(k,n)=>{st().paint+=n;M().col.i[k]=Math.max(M().col.i[k]||0,1)});
 BUS.on('spawn',g=>{const m=M();m.col.g[g.vip?'vip':g.spr]=1;
  if(!g.vip&&S.served>=15&&Math.random()<0.14){const free=REGS.filter(([n])=>!guests.some(x=>x.reg==n));if(free.length){const[n,img]=free[Math.random()*free.length|0];g.reg=n;g.spr=img;g.budget+=1500;g.happy+=8;const r=m.regs[n]=m.regs[n]||{v:0};r.v++;st().regular++;if(r.v==1)toast(`새 단골 손님 '${n}'이(가) 찾아왔어요!`);setTimeout(()=>think(g,r.v>1?`${n}: 또 왔어요~ (${r.v}번째)`:`${n}: 처음 왔어요!`),1200)}}
  if(g.vip)setTimeout(()=>think(g,'VIP: 최고의 서비스를 기대할게요'),1000)});
 BUS.on('leave',g=>{review(g);postcard(g)});
 // ----- 엽서: 단골이 방문 단계마다, 아주 행복했던 손님이 가끔 보내는 손편지 (방문·미리 진행 중엔 없음) -----
 const PC_REG={3:'{n}{ye}. 벌써 세 번째 왔네요. {rest}이 요즘 제 작은 낙이에요.',7:'{n}{ye}. 지난번엔 가족들을 데리고 왔는데, 다들 {f}{i} 제일 좋았대요. 덕분에 행복한 하루였어요.',15:'{n}{ye}. 이제 여기가 제 두 번째 집 같아요. 언제 와도 반겨줘서 고마워요.',30:'{n}{ni} 드려요. 오래오래 이 자리에 있어 주세요. 저도 계속 올게요.'};
 const PC_FAM=[['세 식구 카피바라 가족','가족들과 행복한 시간을 보내게 해줘서 고마워요. 아이가 집에 와서도 {f} 이야기를 계속해요.'],
  ['쌍둥이네 가족','쌍둥이가 {f}{r} 제일 좋아했어요. 가족 모두 푹 쉬고 갑니다. 고마워요.'],
  ['효도 여행 온 남매','오랜만에 부모님을 모시고 왔어요. {f}{at} 함께 웃던 시간이 오래 기억날 것 같아요.'],
  ['퇴근길 직장인','바쁜 한 주였는데 {f} 덕분에 마음이 다 녹았어요. 꼭 또 올게요.'],
  ['신혼부부 카피바라','둘이 처음 여행 온 곳이 여기예요. {f}{at} 보낸 시간을 오래 간직할게요.'],
  ['할머니와 손녀','할머니가 {f}{r} 보시고 옛날 생각이 난다며 좋아하셨어요. 고맙습니다.'],
  ['단짝 친구 셋','친구들이랑 실컷 웃고 쉬다 가요. {f}{i} 특히 좋았어요.']];
 // 손님이 좋아한 곳: 구경한 장식(60%) 또는 이용한 시설. 장식이면 '앞에서/바라보며', 시설이면 '에서/쉬며'
 function favOf(g){const seen=g.seen?[...g.seen].filter(o=>S.objs.includes(o)):[];if(seen.length&&Math.random()<0.6)return{n:DEF[seen[seen.length-1].k].n.replace(/\s*\(.*\)$/,''),deco:1};const ks=g.kinds?[...g.kinds]:[];if(ks.length)return{n:DEF[ks[ks.length-1]].n,deco:0};return{n:'따뜻한 온천',deco:0}}
 function fill(t,n,F){const f=F.n,rest=F.deco?f+josa(f,'을','를')+' 바라보며 쉬는 시간':f+'에서 보내는 시간';return t.replace('{rest}',rest).replace('{n}',n).replace('{ye}',n?josa(n,'이에요','예요'):'').replace('{ni}',n?josa(n,'이','가'):'').replace('{f}',f).replace('{at}',F.deco?' 앞에서':'에서').replace('{i}',josa(f,'이','가')).replace('{r}',josa(f,'을','를'))}
 function sendCard(from,text){const m=M();(m.cards||(m.cards=[])).unshift({d:typeof dayN=='function'?dayN():1,from,t:text,read:0});if(m.cards.length>40)m.cards.length=40;toast(`${from}에게서 엽서가 도착했어요`);SND.quest&&SND.quest();cardBadge()}
 function postcard(g){if(window.READONLY||window.__warm)return;const m=M();
  if(g.reg&&g.happy>=60){const r=m.regs[g.reg];if(r&&PC_REG[r.v]&&!(r.c||(r.c=[])).includes(r.v)){r.c.push(r.v);sendCard(g.reg,fill(PC_REG[r.v],g.reg,favOf(g)));return}}
  const day=typeof dayN=='function'?dayN():0;if(m.cardDay!==day){m.cardDay=day;m.cardN=0}
  if(!g.reg&&g.happy>=85&&(m.cardN||0)<2&&Math.random()<0.05){m.cardN=(m.cardN||0)+1;const[fr,tx]=PC_FAM[Math.random()*PC_FAM.length|0];sendCard(fr,fill(tx,'',favOf(g)))}}
 function modalCards(){const el=$('modal'),m=M(),cs=m.cards||[];
  el.innerHTML=`<h3>엽서함 <small>손님들이 보낸 손편지</small></h3>`+(cs.map(c=>`<div class="pcard${c.read?'':' new'}"><div class="pstamp">♨</div><p>${c.t}</p><div class="pfrom">— ${c.from}<small>Day ${c.d}</small></div></div>`).join('')||'<div class="row" style="border:0"><span>아직 받은 엽서가 없어요. 손님들이 행복하게 쉬다 가면 엽서가 와요.</span></div>')+`<div style="text-align:right;margin-top:10px"><button class="b g" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;
  el.style.display='block';cs.forEach(c=>c.read=1);cardBadge()}
 const pcs=document.createElement('style');pcs.textContent='.pcard{position:relative;background:linear-gradient(180deg,#f6ecd6,#efe0c2);color:#3b2a1c;border-radius:6px;padding:14px 64px 12px 16px;margin:10px 0;box-shadow:0 2px 10px rgba(0,0,0,.25);font-size:13.5px;line-height:1.65}.pcard p{margin:0 0 8px}.pcard .pstamp{position:absolute;top:10px;right:12px;width:38px;height:44px;border:2px dashed #b98c5a;border-radius:3px;display:flex;align-items:center;justify-content:center;color:#b5643a;font-size:18px;background:#f9f1e1;transform:rotate(4deg)}.pcard .pfrom{text-align:right;color:#6b4a2e;font-weight:600}.pcard .pfrom small{display:block;font-weight:400;opacity:.7;font-size:11px}.pcard.new{outline:2px solid rgba(232,196,104,.7)}.pbadge{display:inline-block;min-width:16px;padding:0 5px;margin-left:4px;border-radius:9px;background:#e0703a;color:#fff;font-size:11px;font-style:normal;line-height:16px;text-align:center}';document.head.appendChild(pcs);
 BUS.on('hour',()=>render_());
 BUS.on('text',t=>{if(cam.z<2.2)return;t.font='700 11px Pretendard';for(const g of guests){if(!(g.reg||g.vip)||g.hide||g.inBath)continue;const[X,Y]=toScreenT(g.x,g.y);const s=g.reg||'VIP';const w=t.measureText(s).width+10;t.fillStyle=g.vip?'rgba(200,150,30,0.9)':'rgba(60,110,170,0.9)';rr(t,X-w/2,Y+4,w,15,7);t.fill();t.fillStyle='#fff';t.fillText(s,X,Y+12)}});
 // 가격 조정 감지
 document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-p]'))st().price++;if(e.target.closest&&e.target.closest('button,.card,.tab'))SND.click()},true);
 // 도구 버튼 (아이콘 없이 깔끔한 텍스트 알약 버튼)
 const tools=$('tools');const mkT=(ic,lb,fn)=>{const b=document.createElement('button');b.className='tool';b.innerHTML=`<i>${lb}</i>`;b.onclick=fn;tools.insertBefore(b,tools.querySelector('.zoom'));return b};
 mkT('','퀘스트',modalQuest);mkT('','도감',modalBook);mkT('','리뷰',modalReviews);const cardBtn=mkT('','엽서',modalCards);
 function cardBadge(){const n=((S&&S.meta&&S.meta.cards)||[]).filter(c=>!c.read).length;cardBtn.innerHTML=`<i>엽서${n?`<b class="pbadge">${n}</b>`:''}</i>`}cardBadge();
 const mute=document.createElement('div');mute.className='box btn';mute.id='bMute';mute.textContent=SND.muted()?'음소거':'사운드';mute.onclick=()=>{mute.textContent=SND.toggle()?'음소거':'사운드'};$('bSpeed').before(mute);
 setInterval(()=>{if(S){render_();cardBadge()}},1000);
 return{render:render_,modalQuest,modalBook,modalReviews,M,TUT,milesReady}})();
