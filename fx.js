'use strict';
// ===== 연출: 불꽃놀이·등불·반딧불·벚꽃비·섬광·눈·무지개·오로라·퍼레이드 =====
// 화면 공간 오버레이 캔버스 1장 + 고정 크기 파티클 풀(1600) → 아무리 눌러도 메모리/개수 상한
(()=>{const $=id=>document.getElementById(id);const cv=document.createElement('canvas');cv.id='fxc';cv.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:4';document.body.appendChild(cv);const g=cv.getContext('2d');
 let W=0,H=0,DP=1;const rs=()=>{DP=Math.min(1,devicePixelRatio||1)*(window.GFX_LOW?0.6:1);W=innerWidth;H=innerHeight;cv.width=W*DP|0;cv.height=H*DP|0;cv.style.width=W+'px';cv.style.height=H+'px'};rs();addEventListener('resize',rs);
 const N=1600,X=new Float32Array(N),Y=new Float32Array(N),VX=new Float32Array(N),VY=new Float32Array(N),L=new Float32Array(N),ML=new Float32Array(N),SZ=new Float32Array(N),GR=new Float32Array(N),TY=new Uint8Array(N),CI=new Uint16Array(N),PH=new Float32Array(N);let free=[];for(let i=N-1;i>=0;i--)free.push(i);const act=new Set();
 const COL=[];const ci=c=>{let i=COL.indexOf(c);if(i<0){if(COL.length>60)return 0;COL.push(c);i=COL.length-1}return i};
 // 타입: 0 불꽃 점, 1 로켓, 2 등불, 3 반딧불, 4 꽃잎, 5 눈, 6 섬광
 function spawn(t,x,y,vx,vy,life,sz,col,gr=0){const i=free.pop();if(i==null)return -1;TY[i]=t;X[i]=x;Y[i]=y;VX[i]=vx;VY[i]=vy;L[i]=ML[i]=life;SZ[i]=sz;CI[i]=ci(col);GR[i]=gr;PH[i]=Math.random()*6.28;act.add(i);return i}
 const kill=i=>{act.delete(i);free.push(i)};
 const SH={peony:['#ffd27a','#ff8f6b','#ffe9b8'],willow:['#ffcf6b','#e8a33a'],ring:['#9fe0d6','#ffffff'],heart:['#f6a3be','#ff6f91'],chrys:['#c9f0ff','#7fb8ff','#ffffff']};
 function burst(x,y,kind){const cs=SH[kind]||SH.peony,n=window.GFX_LOW?40:kind=='willow'?110:90;
  for(let k=0;k<n;k++){const a=k/n*6.283+Math.random()*0.05;let sp=kind=='ring'?150:kind=='willow'?70+Math.random()*60:60+Math.random()*110;let vx=Math.cos(a)*sp,vy=Math.sin(a)*sp;
   if(kind=='heart'){const t=a;vx=16*Math.pow(Math.sin(t),3)*7;vy=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*7}
   spawn(0,x,y,vx,vy,kind=='willow'?3.2:1.8+Math.random()*0.6,kind=='willow'?1.6:2.2,cs[k%cs.length],kind=='willow'?40:60)}
  flash=Math.min(1,flash+0.35);boom()}
 function rocket(kind){const x=W*(0.2+Math.random()*0.6);const i=spawn(1,x,H*0.95,(Math.random()-0.5)*30,-(H*0.55+Math.random()*H*0.25),1.1+Math.random()*0.3,2,'#fff2c8',H*0.3);if(i>=0)PH[i]=Object.keys(SH).indexOf(kind)}
 let flash=0,boomT=0;function boom(){if(!window.SND||!SND.boom)return;const n=performance.now();if(n-boomT<120)return;boomT=n;SND.boom()}
 // 지속형 연출 상태
 const timed=[];function every(dur,rate,fn,end){if(timed.length>=12)timed.shift();timed.push({t:0,dur,rate,acc:0,fn,end})}
 let rainbow=0,aurora=0,parade=null;
 const FX={
  fw_peony:{n:'불꽃 · 국화',c:800,cd:20,h:2,star:1,run(){for(let i=0;i<3;i++)setTimeout(()=>rocket('peony'),i*500)}},
  fw_willow:{n:'불꽃 · 버드나무',c:1500,cd:25,h:3,star:2,run(){for(let i=0;i<3;i++)setTimeout(()=>rocket('willow'),i*700)}},
  fw_heart:{n:'불꽃 · 하트',c:2500,cd:30,h:3,star:2,run(){for(let i=0;i<2;i++)setTimeout(()=>rocket('heart'),i*800)}},
  fw_show:{n:'불꽃놀이 대회 (30초)',c:12000,cd:180,h:8,star:3,run(){const ks=Object.keys(SH);every(30,1.6,()=>rocket(ks[Math.random()*ks.length|0]))}},
  sparkle:{n:'불꽃 섬광',c:600,cd:15,h:1,star:1,run(){every(8,14,()=>{const x=Math.random()*W,y=H*(0.4+Math.random()*0.5);for(let k=0;k<6;k++)spawn(6,x,y,(Math.random()-0.5)*90,(Math.random()-0.8)*90,0.5+Math.random()*0.4,1.6,'#fff3b0',120)})}},
  lanterns:{n:'등불 날리기 (25초)',c:3000,cd:60,h:5,star:2,run(){every(25,2.2,()=>spawn(2,Math.random()*W,H+20,(Math.random()-0.5)*8,-(18+Math.random()*16),22,6+Math.random()*4,'#ffb35a'))}},
  fireflies:{n:'반딧불 모으기 (40초)',c:1200,cd:45,h:3,star:1,run(){every(6,12,()=>spawn(3,Math.random()*W,H*(0.3+Math.random()*0.7),0,0,34+Math.random()*8,2.2,'#d8ff8a'))}},
  sakura:{n:'벚꽃비 (40초)',c:1500,cd:45,h:3,star:1,run(){every(40,9,()=>spawn(4,Math.random()*W*1.2,-10,-(10+Math.random()*20),30+Math.random()*25,14,3+Math.random()*2,Math.random()<0.5?'#f7b8c8':'#fde2ea'))}},
  snow:{n:'눈 내리기 (45초)',c:1500,cd:45,h:3,star:1,run(){every(45,14,()=>spawn(5,Math.random()*W,-10,0,22+Math.random()*22,24,1.5+Math.random()*2.2,'#ffffff'))}},
  rainbow:{n:'무지개 (20초)',c:2000,cd:60,h:4,star:2,run(){rainbow=20}},
  aurora:{n:'오로라 (40초)',c:6000,cd:120,h:6,star:3,run(){aurora=40}},
  parade:{n:'마을 축제 퍼레이드 (30초)',c:15000,cd:240,h:10,star:3,run(){parade={t:0,dur:30}}},
 };
 const CD={};
 function trigger(id){const f=FX[id];if(!f)return false;const D=window.__dbg,S=D&&D.S;const now=performance.now()/1000;
  if((CD[id]||0)>now){toast&&toast('잠시 후 다시 할 수 있어요');return false}if(D&&D.stars()<f.star){toast('등급 '+f.star+'성부터 열려요');return false}
  if(S){if(S.yen<f.c){toast('돈이 부족해요');return false}S.yen-=f.c;S.fin.exp+=f.c}
  CD[id]=now+f.cd;try{f.run()}catch(e){console.warn('fx',e)}
  if(D)D.guests().forEach(q=>{q.happy=Math.min(100,(q.happy||50)+f.h)});return true}
 window.FX={trigger,list:FX,stats:()=>({active:act.size,free:free.length,timed:timed.length})};
 // 메뉴
 function menu(){const el=$('modal');const D=window.__dbg;const st=D?D.stars():5;const now=performance.now()/1000;
  el.innerHTML=`<h3>온천 연출 <small>손님 만족도가 조금 올라가요</small></h3><div class="fxg">`+Object.entries(FX).map(([k,f])=>{const lock=st<f.star,cd=Math.max(0,(CD[k]||0)-now);return`<button class="fxb${lock?' lock':''}" data-fx="${k}" ${lock||cd?'disabled':''}><b>${f.n}</b><small>${lock?f.star+'성 필요':cd?Math.ceil(cd)+'초 후':'¥'+f.c.toLocaleString()}</small></button>`}).join('')+`</div><div style="text-align:right"><button class="b g" id="fxClose">닫기</button></div>`;
  el.style.display='block';el.querySelectorAll('[data-fx]').forEach(b=>b.onclick=()=>{if(trigger(b.dataset.fx))menu()});$('fxClose').onclick=()=>el.style.display='none'}
 const st=document.createElement('style');st.textContent='.fxg{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin:10px 0}.fxb{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px 12px;border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:rgba(255,255,255,0.05);color:#f5f2eb;font:inherit;cursor:pointer;text-align:left;transition:background .18s,border-color .18s,transform .15s}.fxb b{font-size:12.5px;font-weight:600;color:#faf8f5}.fxb small{color:#e8c468;font-size:11px}.fxb:disabled{opacity:.42;cursor:default}.fxb:not(:disabled):hover{background:rgba(255,255,255,0.11);border-color:rgba(255,255,255,0.24);transform:translateY(-1px)}';document.head.appendChild(st);
 setTimeout(()=>{const tools=$('tools');if(!tools)return;const b=document.createElement('button');b.className='tool';b.id='tFx';b.innerHTML=`<i>연출</i>`;b.onclick=menu;tools.insertBefore(b,tools.querySelector('.zoom'))},0);
 // 갱신/그리기 (활성일 때만)
 let last=performance.now();const blobC={};const blob=c=>{if(blobC[c])return blobC[c];const b=document.createElement('canvas');b.width=b.height=32;const x=b.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,c);gr.addColorStop(0.35,c+'aa');gr.addColorStop(1,c+'00');x.fillStyle=gr;x.fillRect(0,0,32,32);return blobC[c]=b};
 function frame(){requestAnimationFrame(frame);const n=performance.now(),dt=Math.min(0.05,(n-last)/1000);last=n;
  const busy=act.size||timed.length||rainbow>0||aurora>0||parade||flash>0.01;if(!busy){if(cv._on){g.clearRect(0,0,cv.width,cv.height);cv._on=0}return}cv._on=1;
  for(let k=timed.length-1;k>=0;k--){const e=timed[k];e.t+=dt;e.acc+=dt*e.rate;while(e.acc>=1){e.acc--;e.fn()}if(e.t>=e.dur)timed.splice(k,1)}
  g.setTransform(DP,0,0,DP,0,0);g.clearRect(0,0,W,H);
  if(flash>0.01){g.fillStyle=`rgba(255,240,210,${flash*0.12})`;g.fillRect(0,0,W,H);flash*=Math.pow(0.02,dt)}
  if(aurora>0){aurora-=dt;const a=Math.min(1,aurora/4,(40-aurora)/4)*0.5;const t=n/1000;for(let b=0;b<3;b++){g.beginPath();for(let x=0;x<=W;x+=20){const y=H*(0.12+b*0.06)+Math.sin(x/180+t*0.4+b)*24+Math.sin(x/70+t*0.9)*8;x?g.lineTo(x,y):g.moveTo(x,y)}g.lineWidth=40-b*8;g.strokeStyle=b==1?`rgba(160,120,255,${a*0.5})`:`rgba(90,255,190,${a*0.6})`;g.shadowBlur=30;g.shadowColor=g.strokeStyle;g.stroke()}g.shadowBlur=0}
  if(rainbow>0){rainbow-=dt;const a=Math.min(1,rainbow/3,(20-rainbow)/3)*0.35;const cs=['#ff5a5a','#ffa23a','#ffe45a','#6ee06e','#5ab4ff','#7a6bff','#c07aff'];g.lineWidth=Math.max(6,W/120);cs.forEach((c,i)=>{g.globalAlpha=a;g.strokeStyle=c;g.beginPath();g.arc(W*0.5,H*1.05,W*0.55-i*g.lineWidth,Math.PI*1.08,Math.PI*1.92);g.stroke()});g.globalAlpha=1}
  if(parade){parade.t+=dt;const p=parade,cnt=10,sp=W/(p.dur*0.7);for(let i=0;i<cnt;i++){const x=-60+(p.t*sp)-i*48;if(x<-60||x>W+60)continue;const y=H*0.86+Math.sin(p.t*6+i)*3;const spr=typeof VAR!='undefined'&&VAR['cw'+(1+i%4)];if(spr){const w=34,h=w*spr.base.height/spr.base.width;g.drawImage(spr.base,x-w/2,y-h,w,h)}else{g.fillStyle='#7a5230';g.fillRect(x-10,y-26,20,26)}
    g.globalCompositeOperation='lighter';g.drawImage(blob('#ffb35a'),x+8-14,y-46-14,28,28);g.globalCompositeOperation='source-over';g.fillStyle='#e0503a';g.fillRect(x+5,y-50,7,9)}
   if(Math.random()<dt*6)spawn(4,Math.random()*W,H*0.6,0,25,6,3,'#f7b8c8');if(p.t>=p.dur)parade=null}
  g.globalCompositeOperation='lighter';
  for(const i of act){L[i]-=dt;if(L[i]<=0){if(TY[i]==1)burst(X[i],Y[i],Object.keys(SH)[PH[i]|0]||'peony');kill(i);continue}
   const t=TY[i],lf=L[i]/ML[i];
   if(t==3){PH[i]+=dt;VX[i]=Math.cos(PH[i]*0.7)*14;VY[i]=Math.sin(PH[i]*1.1)*10}
   else if(t==4){VX[i]+=Math.sin(PH[i]+n/700)*dt*20}else if(t==5){VX[i]=Math.sin(PH[i]+n/1500)*10}
   VY[i]+=GR[i]*dt;if(t==0){VX[i]*=Math.pow(0.35,dt);VY[i]*=Math.pow(0.6,dt)}X[i]+=VX[i]*dt;Y[i]+=VY[i]*dt;
   if((t==4||t==5)&&Y[i]>H+10){kill(i);continue}if(t==2&&Y[i]<-30){kill(i);continue}
   const c=COL[CI[i]];
   if(t==4||t==5){g.globalCompositeOperation='source-over';g.globalAlpha=Math.min(1,lf*3)*(t==5?0.85:0.9);g.fillStyle=c;g.fillRect(X[i],Y[i],SZ[i],t==4?SZ[i]*0.7:SZ[i]);g.globalCompositeOperation='lighter';continue}
   const tw=t==3?0.5+0.5*Math.sin(PH[i]*5):1;const a=(t==0?Math.min(1,lf*1.6):t==2?Math.min(1,(1-lf)*6,lf*3):Math.min(1,lf*2))*tw;g.globalAlpha=a;
   const s=t==2?SZ[i]*4:t==1?10:SZ[i]*5;g.drawImage(blob(c),X[i]-s/2,Y[i]-s/2,s,s);
   if(t==2){g.globalCompositeOperation='source-over';g.globalAlpha=a;g.fillStyle='#e8803a';g.fillRect(X[i]-SZ[i]*0.5,Y[i]-SZ[i]*0.7,SZ[i],SZ[i]*1.3);g.globalCompositeOperation='lighter'}
   if(t==1&&Math.random()<0.6)spawn(6,X[i],Y[i]+4,(Math.random()-0.5)*10,20,0.35,1.2,'#ffd9a0',0)}
  g.globalAlpha=1;g.globalCompositeOperation='source-over'}
 requestAnimationFrame(frame);
})();
