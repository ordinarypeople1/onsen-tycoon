'use strict';
// ===== 연출: 불꽃놀이·등불·반딧불·벚꽃비·섬광·눈·무지개·오로라·퍼레이드 =====
// 모두 게임 월드 캔버스 안에 그린다 (UI 패널·도구 바 아래).
//  · 바닥 레이어('ground', 바닥 위·건물 아래): 무지개·오로라 → 건물과 나무가 앞을 가려 장면 안에 걸림
//  · 조명 뒤 레이어('screen'): 불꽃·등불·반딧불·섬광·퍼레이드는 맵 좌표(iso px, 높이는 Y에서 뺌)라 카메라를 따라 움직임
//    벚꽃비·눈은 화면 좌표로 내리되 역시 월드 캔버스 안
//  · 연출 중에는 따뜻한 비네트·옅은 필름 그레인으로 빛바랜 사진 같은 톤
// 고정 크기 파티클 풀(1600) → 아무리 눌러도 메모리/개수 상한
(()=>{const $=id=>document.getElementById(id);
 const PN=1600,X=new Float32Array(PN),Y=new Float32Array(PN),VX=new Float32Array(PN),VY=new Float32Array(PN),L=new Float32Array(PN),ML=new Float32Array(PN),SZ=new Float32Array(PN),GR=new Float32Array(PN),TY=new Uint8Array(PN),CI=new Uint16Array(PN),PH=new Float32Array(PN),WS=new Uint8Array(PN);
 let free=[];for(let i=PN-1;i>=0;i--)free.push(i);const act=new Set();
 const COL=[];const ci=c=>{let i=COL.indexOf(c);if(i<0){if(COL.length>60)return 0;COL.push(c);i=COL.length-1}return i};
 // 타입: 0 불꽃 점, 1 로켓, 2 등불, 3 반딧불, 4 꽃잎, 5 눈, 6 섬광 / WS: 1=맵 좌표, 0=화면 좌표
 function spawn(t,x,y,vx,vy,life,sz,col,gr=0,ws=1){const i=free.pop();if(i==null)return -1;TY[i]=t;X[i]=x;Y[i]=y;VX[i]=vx;VY[i]=vy;L[i]=ML[i]=life;SZ[i]=sz;CI[i]=ci(col);GR[i]=gr;PH[i]=Math.random()*6.28;WS[i]=ws;act.add(i);return i}
 const kill=i=>{act.delete(i);free.push(i)};
 // 빛바랜 파스텔: 샴페인 골드·복숭아·더스티 로즈·라벤더·민트
 const SH={peony:['#ffe2a8','#ffb994','#fff1dc'],willow:['#ffd59a','#e9b878'],ring:['#c4efdf','#fff4e2'],heart:['#f6b3c3','#ffd0da'],chrys:['#cdbdf6','#b4cdf2','#fff4e8']};
 const SHK=Object.keys(SH);
 // 맵 위 무작위 지점(현재 보고 있는 영역의 열린 칸) → 월드 iso 좌표
 function fieldPt(x0=0.18,x1=0.82,y0=0.32,y1=0.82){for(let k=0;k<24;k++){const sx=VW*(x0+Math.random()*(x1-x0)),sy=VH*(y0+Math.random()*(y1-y0));const[a,b]=toTile(sx,sy);if(tileOpen(a|0,b|0))return iso(a,b)}const[a,b]=toTile(VW/2,VH*0.6);return iso(a,b)}
 function burst(x,y,kind){const cs=SH[kind]||SH.peony,n=window.GFX_LOW?36:kind=='willow'?96:78;
  for(let k=0;k<n;k++){const a=k/n*6.283+Math.random()*0.08;let sp=kind=='ring'?62:kind=='willow'?26+Math.random()*26:24+Math.random()*44;let vx=Math.cos(a)*sp,vy=Math.sin(a)*sp*0.92;
   if(kind=='heart'){vx=16*Math.pow(Math.sin(a),3)*3.4;vy=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*3.4}
   spawn(0,x,y,vx,vy,kind=='willow'?4.4:2.8+Math.random()*0.9,kind=='willow'?1.5:2,cs[k%cs.length],kind=='willow'?16:12)}
  flash=Math.min(1,flash+0.3);boom()}
 // 터지는 높이: 맵 기준 최대 150px, 확대 중이면 화면 위쪽 18% 아래에서 터지도록 낮춤
 function rocket(kind){const[gx,gy]=fieldPt(0.22,0.78,0.45,0.82);const sy=toScreen(gx,gy)[1],T=1.3+Math.random()*0.3,G=38;
  const h=Math.max(35,Math.min(150,(sy-VH*0.18)/cam.z))*(0.8+Math.random()*0.2),v=(h+0.5*G*T*T)/T;
  const i=spawn(1,gx,gy,(Math.random()-0.5)*10,-v,T,2,'#fff0d0',G);if(i>=0)PH[i]=SHK.indexOf(kind)}
 let flash=0,boomT=0;function boom(){if(!window.SND||!SND.boom)return;const n=performance.now();if(n-boomT<120)return;boomT=n;SND.boom()}
 // 지속형 연출 상태
 const timed=[];function every(dur,rate,fn){if(timed.length>=12)timed.shift();timed.push({t:0,dur,rate,acc:0,fn})}
 let rainbow=0,aurora=0,parade=null,mood=0;
 const FX={
  fw_peony:{n:'불꽃 · 국화',c:800,cd:20,h:2,star:1,run(){for(let i=0;i<3;i++)setTimeout(()=>rocket('peony'),i*600)}},
  fw_willow:{n:'불꽃 · 버드나무',c:1500,cd:25,h:3,star:2,run(){for(let i=0;i<3;i++)setTimeout(()=>rocket('willow'),i*800)}},
  fw_heart:{n:'불꽃 · 하트',c:2500,cd:30,h:3,star:2,run(){for(let i=0;i<2;i++)setTimeout(()=>rocket('heart'),i*900)}},
  fw_show:{n:'불꽃놀이 대회 (30초)',c:12000,cd:180,h:8,star:3,run(){every(30,1.3,()=>rocket(SHK[Math.random()*SHK.length|0]))}},
  sparkle:{n:'불꽃 섬광',c:600,cd:15,h:1,star:1,run(){every(8,10,()=>{const[x,y0]=fieldPt();const y=y0-8-Math.random()*22;for(let k=0;k<6;k++)spawn(6,x,y,(Math.random()-0.5)*30,(Math.random()-0.8)*30,0.7+Math.random()*0.5,1.5,'#fff1c4',30)})}},
  lanterns:{n:'등불 날리기 (25초)',c:3000,cd:60,h:5,star:2,run(){every(25,2,()=>{const[x,y]=fieldPt(0.1,0.9,0.45,0.95);spawn(2,x,y-4,(Math.random()-0.5)*3,-(7+Math.random()*6),26,3+Math.random()*1.6,'#ffc27a')})}},
  fireflies:{n:'반딧불 모으기 (40초)',c:1200,cd:45,h:3,star:1,run(){every(6,12,()=>{const[x,y]=fieldPt(0.05,0.95,0.2,0.95);spawn(3,x,y-4-Math.random()*16,0,0,34+Math.random()*8,1.6,'#e4ffa6')})}},
  sakura:{n:'벚꽃비 (40초)',c:1500,cd:45,h:3,star:1,run(){every(40,9,()=>spawn(4,Math.random()*VW*1.2,-10,-(10+Math.random()*20),26+Math.random()*22,15,3+Math.random()*2,Math.random()<0.5?'#f4c0cc':'#fbe4ea',0,0))}},
  snow:{n:'눈 내리기 (45초)',c:1500,cd:45,h:3,star:1,run(){every(45,14,()=>spawn(5,Math.random()*VW,-10,0,20+Math.random()*20,26,1.5+Math.random()*2.2,'#fffaf2',0,0))}},
  rainbow:{n:'무지개 (20초)',c:2000,cd:60,h:4,star:2,run(){rainbow=20}},
  aurora:{n:'오로라 (40초)',c:6000,cd:120,h:6,star:3,run(){aurora=40}},
  parade:{n:'마을 축제 퍼레이드 (30초)',c:15000,cd:240,h:10,star:3,run(){const[a,b]=toTile(VW/2,VH*0.6);parade={t:0,dur:30,x0:Math.floor(a)-10,y:Math.floor(b)+0.5}}},
 };
 const CD={};
 function trigger(id){const f=FX[id];if(!f)return false;const D=window.__dbg,S=D&&D.S;const now=performance.now()/1000;
  if((CD[id]||0)>now){toast&&toast('잠시 후 다시 할 수 있어요');return false}if(D&&D.stars()<f.star){toast('등급 '+f.star+'성부터 열려요');return false}
  if(S){if(S.yen<f.c){toast('돈이 부족해요');return false}S.yen-=f.c;S.fin.exp+=f.c}
  CD[id]=now+f.cd;try{f.run()}catch(e){console.warn('fx',e)}
  if(D)D.guests().forEach(q=>{q.happy=Math.min(100,(q.happy||50)+f.h)});return true}
 window.FX={trigger,list:FX,stats:()=>({active:act.size,free:free.length,timed:timed.length,mood:+mood.toFixed(2)})};
 // 메뉴
 function menu(){const el=$('modal');const D=window.__dbg;const st=D?D.stars():5;const now=performance.now()/1000;
  el.innerHTML=`<h3>온천 연출 <small>손님 만족도가 조금 올라가요</small></h3><div class="fxg">`+Object.entries(FX).map(([k,f])=>{const lock=st<f.star,cd=Math.max(0,(CD[k]||0)-now);return`<button class="fxb${lock?' lock':''}" data-fx="${k}" ${lock||cd?'disabled':''}><b>${f.n}</b><small>${lock?f.star+'성 필요':cd?Math.ceil(cd)+'초 후':'¥'+f.c.toLocaleString()}</small></button>`}).join('')+`</div><div style="text-align:right"><button class="b g" id="fxClose">닫기</button></div>`;
  el.style.display='block';el.querySelectorAll('[data-fx]').forEach(b=>b.onclick=()=>{if(trigger(b.dataset.fx))menu()});$('fxClose').onclick=()=>el.style.display='none'}
 const st=document.createElement('style');st.textContent='.fxg{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin:10px 0}.fxb{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px 12px;border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:rgba(255,255,255,0.05);color:#f5f2eb;font:inherit;cursor:pointer;text-align:left;transition:background .18s,border-color .18s,transform .15s}.fxb b{font-size:12.5px;font-weight:600;color:#faf8f5}.fxb small{color:#e8c468;font-size:11px}.fxb:disabled{opacity:.42;cursor:default}.fxb:not(:disabled):hover{background:rgba(255,255,255,0.11);border-color:rgba(255,255,255,0.24);transform:translateY(-1px)}';document.head.appendChild(st);
 setTimeout(()=>{const tools=$('tools');if(!tools)return;const b=document.createElement('button');b.className='tool';b.id='tFx';b.innerHTML=`<i>연출</i>`;b.onclick=menu;tools.insertBefore(b,tools.querySelector('.zoom'))},0);

 // ---- 그리기 도구 ----
 const blobC={};const blob=c=>{if(blobC[c])return blobC[c];const b=document.createElement('canvas');b.width=b.height=32;const x=b.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,c);gr.addColorStop(0.3,c+'b0');gr.addColorStop(0.65,c+'30');gr.addColorStop(1,c+'00');x.fillStyle=gr;x.fillRect(0,0,32,32);return blobC[c]=b};
 let vig=null,grain=null;
 function vignette(){if(vig&&vig.w==VW&&vig.h==VH)return vig.c;const c=document.createElement('canvas');c.width=Math.max(1,VW>>1);c.height=Math.max(1,VH>>1);const x=c.getContext('2d'),r=Math.hypot(c.width,c.height)/2;
  const gr=x.createRadialGradient(c.width/2,c.height*0.46,r*0.35,c.width/2,c.height/2,r);gr.addColorStop(0,'rgba(58,34,20,0)');gr.addColorStop(0.7,'rgba(58,34,20,0.18)');gr.addColorStop(1,'rgba(40,22,14,0.55)');x.fillStyle=gr;x.fillRect(0,0,c.width,c.height);vig={w:VW,h:VH,c};return c}
 function grainTile(){if(grain)return grain;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),d=x.createImageData(128,128);
  for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=Math.random()<0.5?26:0}x.putImageData(d,0,0);return grain=c}

 // ---- 바닥 레이어: 무지개·오로라 (바닥 위·건물 아래 → 건물과 나무가 앞을 가려 장면 안에 걸림) ----
 BUS.on('ground',(t,lt)=>{if(!(rainbow>0||aurora>0))return;const n=performance.now()/1000;
  cx.save();cx.setTransform(DPR,0,0,DPR,0,0);cx.globalCompositeOperation='screen';cx.lineCap='round';
  if(rainbow>0){const a=Math.min(1,rainbow/3,(20-rainbow)/3)*(0.34-0.14*lt.night);const cs=['#ee8f88','#f2b278','#efd77e','#9fd49c','#86bfe2','#a198dc','#c69fe0'];
   const R=Math.max(VW*0.5,VH*0.78),cxR=VW*0.5,cyR=VH*1.04,bw=R*0.03;
   cx.globalCompositeOperation='source-over';for(let pass=0;pass<2;pass++)cs.forEach((c,i)=>{cx.globalAlpha=a*(pass?0.62:0.2);cx.strokeStyle=c;cx.lineWidth=pass?bw:bw*2.8;cx.beginPath();cx.arc(cxR,cyR,R-i*bw,Math.PI*1.04,Math.PI*1.96);cx.stroke()});
   // 무지개 안쪽 엷은 빛 안개
   const hg=cx.createRadialGradient(cxR,cyR,R*0.55,cxR,cyR,R*0.98);hg.addColorStop(0,'rgba(255,244,226,0)');hg.addColorStop(1,'rgba(255,240,220,0.22)');cx.globalCompositeOperation='screen';cx.globalAlpha=a;cx.fillStyle=hg;cx.fillRect(0,0,VW,VH)}
  if(aurora>0){cx.globalCompositeOperation='screen';const a=Math.min(1,aurora/4,(40-aurora)/4)*(0.2+0.45*lt.night),U=Math.max(VW,VH);
   for(let b=0;b<3;b++){const yb=VH*(0.16+b*0.07);for(let pass=0;pass<2;pass++){cx.beginPath();for(let x=-20;x<=VW+20;x+=18){const y=yb+Math.sin(x/230+n*0.35+b)*U*0.03+Math.sin(x/80+n*0.8)*U*0.008;x>-20?cx.lineTo(x,y):cx.moveTo(x,y)}
     cx.lineWidth=(pass?0.45:1.6)*U*(0.05-b*0.011);cx.globalAlpha=a*(pass?0.6:0.24);cx.strokeStyle=b==1?'#a98cf2':'#6fe6be';cx.stroke()}}}
  cx.restore()});

 // ---- 갱신 + 맵 위 연출 (조명 뒤, UI 아래) ----
 let last=performance.now();
 BUS.on('screen',(t,lt)=>{const n=performance.now(),dt=Math.min(0.05,(n-last)/1000);last=n;const z=cam.z,zs=Math.pow(z,0.8),night=lt.night;
  const busy=act.size||timed.length||rainbow>0||aurora>0||parade||flash>0.01;mood+=((busy?1:0)-mood)*Math.min(1,dt*1.2);
  if(rainbow>0)rainbow-=dt;if(aurora>0)aurora-=dt;
  if(!busy&&mood<0.01)return;
  for(let k=timed.length-1;k>=0;k--){const e=timed[k];e.t+=dt;e.acc+=dt*e.rate;while(e.acc>=1){e.acc--;e.fn()}if(e.t>=e.dur)timed.splice(k,1)}
  cx.save();
  if(flash>0.01){cx.globalCompositeOperation='screen';cx.fillStyle=`rgba(255,226,186,${flash*0.07})`;cx.fillRect(0,0,VW,VH);flash*=Math.pow(0.03,dt)}
  // 퍼레이드: 화면 중앙 근처 맵 줄을 따라 걷는 카피바라 행렬 + 손등불
  if(parade){parade.t+=dt;const p=parade,cnt=10,sp=20/(p.dur*0.8);for(let i=0;i<cnt;i++){const tx_=p.x0+p.t*sp-i*0.9;if(tx_<p.x0-1)continue;const[wx,wy]=iso(tx_,p.y);const[sx,sy]=toScreen(wx,wy);if(sx<-40||sx>VW+40||sy<-40||sy>VH+60)continue;
    const spr=typeof VAR!='undefined'&&VAR['cw'+(1+i%4)],bob=Math.sin(p.t*6+i)*0.6*z;cx.globalCompositeOperation='source-over';cx.globalAlpha=1;
    if(spr){const w=13*z,h=w*spr.base.height/spr.base.width;cx.drawImage(spr.base,sx-w/2,sy-h+bob,w,h)}
    cx.globalCompositeOperation='screen';cx.globalAlpha=0.55+0.35*night;const r=9*zs;cx.drawImage(blob('#ffc27a'),sx+4*z-r,sy-17*z+bob-r,r*2,r*2);
    cx.globalCompositeOperation='source-over';cx.fillStyle='#d9643f';cx.fillRect(sx+3*z,sy-19*z+bob,2.4*z,3.2*z)}
   if(Math.random()<dt*5){const[wx,wy]=iso(p.x0+p.t*sp-2,p.y);spawn(6,wx,wy-10,(Math.random()-0.5)*12,-8,1,1.4,'#ffe3b0',6)}if(p.t>=p.dur)parade=null}
  // 파티클
  const fwA=0.6+0.4*night;
  for(const i of act){L[i]-=dt;if(L[i]<=0){if(TY[i]==1)burst(X[i],Y[i],SHK[PH[i]|0]||'peony');kill(i);continue}
   const ty=TY[i],lf=L[i]/ML[i];
   if(ty==3){PH[i]+=dt;VX[i]=Math.cos(PH[i]*0.7)*5;VY[i]=Math.sin(PH[i]*1.1)*3.5}
   else if(ty==2){VX[i]=Math.sin(PH[i]+n/1900)*3}
   else if(ty==4){VX[i]+=Math.sin(PH[i]+n/700)*dt*20}else if(ty==5){VX[i]=Math.sin(PH[i]+n/1500)*10}
   VY[i]+=GR[i]*dt;if(ty==0){VX[i]*=Math.pow(0.45,dt);VY[i]*=Math.pow(0.62,dt)}X[i]+=VX[i]*dt;Y[i]+=VY[i]*dt;
   let sx=X[i],sy=Y[i];if(WS[i]){[sx,sy]=toScreen(X[i],Y[i])}
   if((ty==4||ty==5)&&sy>VH+10){kill(i);continue}if(ty==2&&sy<-60){kill(i);continue}
   if(sx<-80||sx>VW+80||sy<-120||sy>VH+80)continue;
   const c=COL[CI[i]];
   if(ty==4||ty==5){cx.globalCompositeOperation='source-over';cx.globalAlpha=Math.min(1,lf*3)*(ty==5?0.8:0.85);cx.fillStyle=c;cx.fillRect(sx,sy,SZ[i],ty==4?SZ[i]*0.7:SZ[i]);continue}
   const tw=ty==3?0.45+0.55*Math.sin(PH[i]*5):ty==0&&lf<0.4?0.5+0.5*Math.sin(PH[i]*3+n/55):1;
   let a=(ty==0?Math.min(1,lf*1.8):ty==2?Math.min(1,(1-lf)*6,lf*3):Math.min(1,lf*2))*tw;if(ty<=1)a*=fwA;
   const s=(ty==2?SZ[i]*5:ty==1?7:SZ[i]*5)*zs;cx.globalCompositeOperation='lighter';
   if(ty==0){cx.globalAlpha=a*0.32;const tx_=sx-VX[i]*0.07*z,ty_=sy-VY[i]*0.07*z;cx.drawImage(blob(c),tx_-s*0.4,ty_-s*0.4,s*0.8,s*0.8)}
   cx.globalAlpha=a*0.9;cx.drawImage(blob(c),sx-s/2,sy-s/2,s,s);
   if(ty==2){cx.globalCompositeOperation='source-over';cx.globalAlpha=a*0.95;cx.fillStyle='#e9944c';const w=SZ[i]*0.9*zs,h=SZ[i]*1.2*zs;cx.fillRect(sx-w/2,sy-h*0.55,w,h);cx.fillStyle='rgba(255,226,170,0.85)';cx.fillRect(sx-w*0.25,sy-h*0.4,w*0.5,h*0.7)}
   if(ty==1&&Math.random()<0.6)spawn(6,X[i],Y[i]+3,(Math.random()-0.5)*4,8,0.45,1.1,'#ffdcae',0)}
  // 빛바랜 사진 톤: 따뜻한 비네트 + 옅은 필름 그레인 (연출 중에만, 서서히)
  if(mood>0.01){cx.globalCompositeOperation='source-over';cx.globalAlpha=mood*0.7;cx.drawImage(vignette(),0,0,VW,VH);
   cx.globalCompositeOperation='soft-light';cx.globalAlpha=mood*0.5;cx.fillStyle='rgb(255,206,160)';cx.fillRect(0,0,VW,VH);
   if(!window.GFX_LOW){cx.globalCompositeOperation='overlay';cx.globalAlpha=mood*0.5;const gt=grainTile(),ox=(Math.random()*128)|0,oy=(Math.random()*128)|0;cx.translate(-ox,-oy);cx.fillStyle=cx.createPattern(gt,'repeat');cx.fillRect(0,0,VW+128,VH+128)}}
  cx.restore();
 });
})();
