'use strict';
// ===== 앰비언트: 바람·풀·구름 그림자·연못·물결·생물·카피바라 행동·감상 모드 =====
const AMB=(()=>{
 const R=Math.random;let tPrev=0,wind=0,windT=0;window.WIND=0;
 const blob=(()=>{const c=mk(64,64),g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.5,'rgba(255,255,255,0.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return c})();
 const tint=(c0)=>{const c=mk(64,64),g=c.getContext('2d');g.drawImage(blob,0,0);g.globalCompositeOperation='source-in';g.fillStyle=c0;g.fillRect(0,0,64,64);return c};
 const B_SH=tint('#242042'),B_FF=tint('#d9ff8a'),B_WARM=tint('#ffc070'),B_W=tint('#ffffff');
 // ---- 풀잎 (열린 빈 잔디 타일, 캐시) ----
 let tufts=[],tuftSig='';
 function rebuildTufts(){const r=rng(99);tufts=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!tileOpen(x,y)||OCC[x+','+y])continue;const n=r()<0.55?1:r()<0.3?2:0;for(let i=0;i<n;i++)tufts.push({x:x+0.15+r()*0.7,y:y+0.15+r()*0.7,h:2+r()*2.5,c:r(),p:r()*6,f:r()<0.06?(r()<0.5?'#f4e7d2':'#f2b8c8'):null})}}
 function drawTufts(t,lt){if(window.GFX_LOW)return;const sig=Object.keys(OCC).length+'|'+Object.keys(S.plots).length;if(sig!=tuftSig){tuftSig=sig;rebuildTufts()}
  const x0=-cam.x/cam.z-20,x1=(VW-cam.x)/cam.z+20,y0=-cam.y/cam.z-20,y1=(VH-cam.y)/cam.z+20;
  const cols=['#467336','#6ea044','#9ec654'];cx.lineWidth=0.7;
  for(let ci=0;ci<3;ci++){cx.strokeStyle=cols[ci];cx.beginPath();
   for(const u of tufts){if((u.c*3|0)!=ci)continue;const[X,Y]=iso(u.x,u.y);if(X<x0||X>x1||Y<y0||Y>y1)continue;
    const s=Math.sin(t/700+u.p+u.x*0.6)*0.6+wind*1.4;cx.moveTo(X-1,Y);cx.lineTo(X-1.4+s*0.7,Y-u.h*0.8);cx.moveTo(X,Y);cx.lineTo(X+s,Y-u.h);cx.moveTo(X+1,Y);cx.lineTo(X+1.6+s*0.8,Y-u.h*0.7)}cx.stroke()}
  for(const u of tufts){if(!u.f)continue;const[X,Y]=iso(u.x,u.y);if(X<x0||X>x1||Y<y0||Y>y1)continue;const s=Math.sin(t/700+u.p)*0.6+wind*1.4;cx.fillStyle=u.f;cx.fillRect(X+s-0.8,Y-u.h-0.8,1.6,1.6);cx.fillStyle='#f6d36a';cx.fillRect(X+s-0.3,Y-u.h-0.3,0.6,0.6)}}
 // ---- 연못 ----
 const PD=new WeakMap();
 function pondData(o){let d=PD.get(o);if(d)return d;const r=rng(o.x*131+o.y*7+3);d={stones:[],koi:[],pads:[]};
  for(let i=0;i<22;i++){const a=i/22*6.283+r()*0.15;d.stones.push({a,s:0.8+r()*0.6,c:(r()*3)|0})}
  const KC=[['#f08a3c','#fff4e6'],['#fff4e6','#e0503a'],['#f3b23e','#f3b23e'],['#2b2b2b','#f08a3c']];
  for(let i=0;i<4;i++)d.koi.push({r:0.25+r()*0.5,sp:(0.12+r()*0.18)*(r()<0.5?1:-1),ph:r()*6.28,c:KC[i%4],w:r()*6});
  for(let i=0;i<4;i++){const a=r()*6.28,rr=0.35+r()*0.5;d.pads.push({a,rr,s:0.8+r()*0.5,fl:i==1})}
  d.rip=[];PD.set(o,d);return d}
 const PWC={};
 function pondWater(ctx,rx,ry,ph,lt){ // 레퍼런스 이미지의 투명하고 선명한 에메랄드-터콰이즈 연못물
  const su=lt.sun,n=lt.night;const mix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k));
  const shal=mix([72,216,228],[36,110,148],n*0.55),mid=mix([40,185,204],[24,84,120],n*0.55),deep=mix([22,108,136],[14,42,74],n*0.6);
  const g=ctx.createRadialGradient(0,-ry*0.15,0,0,0,rx);g.addColorStop(0,`rgb(${deep})`);g.addColorStop(0.58,`rgb(${mid})`);g.addColorStop(1,`rgb(${shal})`);
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,6.283);ctx.fill();ctx.save();ctx.clip();
  // 바닥 자갈 (깊은 청록 투영)
  ctx.globalAlpha=0.22*(1-n*0.5);ctx.fillStyle='#165870';for(let i=0;i<22;i++){const a=i*2.39996,r=Math.sqrt((i+0.5)/22)*0.82;ctx.beginPath();ctx.ellipse(Math.cos(a)*rx*r,Math.sin(a)*ry*r+1,1.5,0.75,0,0,6.283);ctx.fill()}
  ctx.globalAlpha=1;
  // 선명한 민트-크림 물결 리플
  ctx.strokeStyle=`rgba(186,250,242,${0.22+0.18*su})`;ctx.lineWidth=0.6;ctx.beginPath();
  for(let i=0;i<5;i++){const yy=-ry+(i+0.6)/5.5*ry*2;ctx.moveTo(-rx*0.85,yy);for(let xx=-rx*0.85;xx<=rx*0.85;xx+=2.5)ctx.lineTo(xx,yy+Math.sin(xx/3.3+ph+i*1.7)*0.75+Math.sin(xx/7-ph*0.7+i)*0.5)}ctx.stroke();
  // 햇살 스펙큘러 포인트
  ctx.fillStyle=`rgba(244,254,210,${0.28+0.25*su})`;ctx.beginPath();ctx.ellipse(-rx*0.32,-ry*0.38,rx*0.24,ry*0.09,-0.1,0,6.283);ctx.fill();
  // 위쪽 호안 바위 아래 깊은 인디고-틸 수중 그림자 (#14445c)
  const sg=ctx.createLinearGradient(0,-ry,0,-ry*0.25);sg.addColorStop(0,'rgba(18,62,84,0.62)');sg.addColorStop(1,'rgba(18,62,84,0)');ctx.fillStyle=sg;ctx.fillRect(-rx,-ry,rx*2,ry);
  ctx.restore()}
 function drawPond(o,t,lt,ghostA){const d=pondData(o);const[cX,cY]=iso(o.x+1.5,o.y+1.5);const rx=3*TW*0.4,ry=rx/2;
  cx.save();cx.globalAlpha=ghostA||1;if(o.rot&1){cx.translate(cX*2,0);cx.scale(-1,1)}
  cx.fillStyle='rgba(30,40,30,0.25)';cx.beginPath();cx.ellipse(cX,cY+1.5,rx+3,ry+2.5,0,0,6.283);cx.fill();
  // 연못 수면 직접 렌더 (줌·조명 변화 시 오프스크린 캔버스 대량 생성 누수 제거)
  cx.save();cx.translate(cX,cY);pondWater(cx,rx,ry,(t%4800)/4800*6.283,lt);cx.restore();
  cx.save();cx.beginPath();cx.ellipse(cX,cY,rx-1,ry-0.5,0,0,6.283);cx.clip();
  // 잉어 + 그림자
  for(const k of d.koi){const a=t/1000*k.sp+k.ph;const px=cX+Math.cos(a)*rx*k.r*1.3,py=cY+Math.sin(a)*ry*k.r*1.3;const hd=a+(k.sp>0?1.571:-1.571);
   const ux=Math.cos(hd),uy=Math.sin(hd)*0.5,wig=Math.sin(t/180+k.w)*0.35;const dep=0.5+0.5*Math.sin(t/2600+k.w);
   cx.globalAlpha=0.22;cx.fillStyle='#0c1c1c';cx.beginPath();cx.ellipse(px-ux*3+1.2,py-uy*3+1.4,4.2,1.5,hd,0,6.283);cx.fill();
   cx.globalAlpha=0.6+0.3*dep;for(let s=0;s<4;s++){const bx=px-ux*s*1.7+Math.sin(wig*s)*0.6*-uy,by=py-uy*s*1.7;cx.fillStyle=s==1?k.c[1]:k.c[0];cx.beginPath();cx.ellipse(bx,by,s==3?0.8:1.5-s*0.2,s==3?0.8:1.1-s*0.15,hd,0,6.283);cx.fill()}
   const tx=px-ux*7.2,ty=py-uy*7.2;cx.fillStyle=k.c[0];cx.beginPath();cx.moveTo(tx+ux*1.5,ty+uy*1.5);cx.lineTo(tx-uy*2+Math.sin(t/150+k.w),ty+ux*1.2);cx.lineTo(tx+uy*2+Math.sin(t/150+k.w),ty-ux*1.2);cx.fill();
   if(R()<0.003){d.rip.push({x:px,y:py,l:1.6})}}
  cx.globalAlpha=1;cx.lineWidth=0.5;
  for(const p of d.rip){p.l-=1/60;const k=1.6-p.l;cx.strokeStyle=`rgba(230,250,250,${Math.max(0,p.l/1.6)*0.6})`;cx.beginPath();cx.ellipse(p.x,p.y,1+k*5,0.5+k*2.5,0,0,6.283);cx.stroke()}d.rip=d.rip.filter(p=>p.l>0);
  cx.restore();
  // 연잎 (깊은 청록 그림자 + 밝은 연두/샤르트뢰즈 하이라이트)
  for(const p of d.pads){const a=p.a+Math.sin(t/4000+p.a)*0.05;const px=cX+Math.cos(a)*rx*p.rr,py=cY+Math.sin(a)*ry*p.rr;
   cx.fillStyle='rgba(16,66,84,0.48)';cx.beginPath();cx.ellipse(px+0.6,py+0.8,2.6*p.s,1.3*p.s,0,0,6.283);cx.fill();
   cx.fillStyle='#6aa83e';cx.beginPath();cx.ellipse(px,py,2.6*p.s,1.3*p.s,0,0.5,6.0);cx.lineTo(px,py);cx.fill();cx.fillStyle='#a8de62';cx.beginPath();cx.ellipse(px-0.4,py-0.3,1.7*p.s,0.75*p.s,0,0.5,6.0);cx.lineTo(px,py);cx.fill();
   cx.fillStyle='#e2f68c';cx.fillRect(px-1.5*p.s,py-0.2,1.3*p.s,0.4);
   if(p.fl){cx.fillStyle='#ff9eb5';cx.beginPath();cx.ellipse(px+0.5,py-1,1.3,0.9,0,0,6.283);cx.fill();cx.fillStyle='#fff6d6';cx.fillRect(px+0.1,py-1.8,0.8,0.8)}}
  // 돌 테두리는 깊이 정렬 패스(drawPondRim)에서 그려 손님과 올바르게 겹침
  if(ghostA)drawPondRim(o,ghostA);
  cx.restore()}

 window.drawPondRim=drawPondRim;function drawPondRim(o,ghostA){const d=pondData(o);const[cX,cY]=iso(o.x+1.5,o.y+1.5);const rx=3*TW*0.4,ry=rx/2;cx.save();cx.globalAlpha=ghostA||1;if(o.rot&1){cx.translate(cX*2,0);cx.scale(-1,1)}
  // 돌 테두리 + 이끼 (레퍼런스의 인디고-슬레이트 그늘 측면 & 햇살 받은 버터-크림 상판)
  const st=d.stones.slice().sort((a,b)=>Math.sin(a.a)-Math.sin(b.a));const SC=[['#4a4058','#faebb8'],['#3e364c','#efd698'],['#544862','#fff3c6']];
  for(const s of st){const px=cX+Math.cos(s.a)*(rx+0.5),py=cY+Math.sin(s.a)*(ry+0.3);const w=3.2*s.s,h=2.2*s.s;const front=Math.sin(s.a)>0;
   cx.fillStyle='rgba(24,22,46,0.42)';cx.beginPath();cx.ellipse(px+0.6,py+1.0,w,h*0.72,0,0,6.283);cx.fill();
   cx.fillStyle=SC[s.c][0];cx.beginPath();cx.ellipse(px,py,w,h,0,0,6.283);cx.fill();cx.fillStyle=SC[s.c][1];cx.beginPath();cx.ellipse(px-0.4,py-0.75,w*0.72,h*0.56,0,0,6.283);cx.fill();
   if(front){cx.fillStyle='rgba(20,72,92,0.45)';cx.beginPath();cx.ellipse(px,py-h*0.55,w*0.8,h*0.25,0,3.3,6.1);cx.fill()}
   if(s.c!=2){cx.fillStyle=s.c==1?'rgba(102,152,62,0.9)':'rgba(132,176,74,0.82)';cx.beginPath();cx.ellipse(px-w*0.25,py-h*0.55,w*0.45,h*0.28,0,0,6.283);cx.fill();cx.fillStyle='#c4e268';cx.fillRect(px-w*0.4,py-h*0.75,1,0.6)}}
  cx.restore()}
 // 밤: 연못 수중등 + 가장자리 반사
 BUS.on('nightlight',(t,lt,k,z)=>{for(const o of S.objs){if(!DEF[o.k].pond)continue;const[X0,Y0]=iso(o.x+1.5,o.y+1.5);const X=X0*z+cam.x,Y=Y0*z+cam.y;const rx=3*TW*0.4*z,ry=rx/2;if(X<-rx||X>VW+rx||Y<-ry||Y>VH+ry)continue;const fl=0.93+0.05*Math.sin(t/210+o.x);
  cx.save();cx.translate(X,Y);cx.scale(1,0.5);glow(0,0,rx*0.95,`rgba(90,210,200,${0.2*k*fl})`);glow(-rx*0.3,rx*0.15,rx*0.4,`rgba(255,210,140,${0.14*k*fl})`);cx.restore();
  for(let i=0;i<3;i++){const a=Math.PI*(0.25+0.25*i);glow(X+Math.cos(a)*rx,Y+Math.sin(a)*ry,3*z,`rgba(255,226,170,${0.55*k*fl})`)}}});
 // ---- 탕 물결/커스틱 ----
 BUS.on('water',(o,cX,cY,rx,ry,t,lt)=>{
  cx.globalCompositeOperation='screen';cx.strokeStyle=`rgba(255,255,255,${0.05+0.07*lt.sun})`;cx.lineWidth=0.6;cx.beginPath();
  for(let i=0;i<7;i++){const ph=i*1.3+o.x;for(let k=0;k<2;k++){const yy=cY-ry+((i+0.5)/7)*ry*2;cx.moveTo(cX-rx,yy);for(let xx=-rx;xx<=rx;xx+=3){cx.lineTo(cX+xx,yy+Math.sin(xx/(4+k)+t/(700+k*230)+ph)*1.2+Math.sin(xx/9-t/900)*0.8)}}}cx.stroke();
  cx.globalCompositeOperation='source-over';
  for(const g of guests){if(!g.inBath||g.cur!==o)continue;const[X,Y]=iso(g.x,g.y);const ph=((t/1000+g.bob)%2.4)/2.4;
   cx.strokeStyle=`rgba(235,255,255,${0.45*(1-ph)})`;cx.lineWidth=0.6;cx.beginPath();cx.ellipse(X,Y+2,6+ph*7,1.8+ph*2.6,0,0,6.283);cx.stroke()}});
 // ---- 생물 ----
 const flies=[],butts=[],birds=[],fx=[];
 function updCreatures(dt,t,lt){
  const open=Object.keys(S.plots).map(k=>k.split(',').map(Number));if(!open.length)return;const rp=()=>{const p=open[(R()*open.length)|0];return[p[0]*PS+R()*PS,p[1]*PS+R()*PS]};
  const want=Math.round(Math.max(0,lt.night-0.5)*2*(window.GFX_LOW?14:36));while(flies.length<want){const[x,y]=rp();flies.push({x,y,h:3+R()*12,vx:0,vy:0,p:R()*6,l:0})}if(flies.length>want&&R()<dt*3)flies.pop();
  for(const f of flies){f.vx+=(R()-0.5)*dt*1.2;f.vy+=(R()-0.5)*dt*1.2;f.vx*=0.97;f.vy*=0.97;f.x+=f.vx*dt;f.y+=f.vy*dt;f.h=Math.max(2,Math.min(18,f.h+(R()-0.5)*dt*10));f.l+=dt}
  const sea=season();const bw=lt.sun>0.35&&sea!=3?Math.min(7,2+S.objs.filter(o=>DEF[o.k].tree||DEF[o.k].pond).length):0;
  while(butts.length<bw){const[x,y]=rp();butts.push({x,y,h:6+R()*8,a:R()*6,c:['#f6e7a8','#f0b6c8','#ffffff','#bcd8f2'][(R()*4)|0],p:R()*6})}if(butts.length>bw)butts.pop();
  for(const b of butts){b.a+=(R()-0.5)*dt*3;b.x+=Math.cos(b.a)*dt*0.9;b.y+=Math.sin(b.a)*dt*0.9;b.h=6+Math.sin(t/900+b.p)*3;if(!tileOpen(b.x|0,b.y|0))b.a+=3.14*dt*4}
  if(lt.sun>0.3&&birds.length<1&&R()<dt*0.04){const n=3+(R()*4|0),y=VH*(0.08+R()*0.25),dir=R()<0.5?1:-1;for(let i=0;i<n;i++)birds.push({x:dir>0?-30-i*14:VW+30+i*14,y:y+Math.abs(i-n/2)*8,dir,p:R()*6,s:0.8+R()*0.4})}
  for(const b of birds){b.x+=b.dir*dt*38;b.y+=Math.sin(t/1500+b.p)*0.05}for(let i=birds.length-1;i>=0;i--)if(birds[i].x<-200||birds[i].x>VW+200)birds.splice(i,1);
  for(const e of fx)e.l-=dt;for(let i=fx.length-1;i>=0;i--)if(fx[i].l<=0)fx.splice(i,1);
  // 카피바라 행동
  for(const g of guests){if(g.hop){g.hop-=dt;g.hz=Math.max(0,Math.sin((0.5-g.hop)/0.5*3.14))*5;if(g.hop<=0){g.hop=0;g.hz=0}}
   if(g.inBath){g.soak=(g.soak||0)+dt;
    if(R()<dt*0.12)fx.push({k:'drop',x:g.x,y:g.y,n:5,l:0.7,L:0.7});
    if(g.soak>8&&R()<dt*0.18)fx.push({k:'zz',g,l:2.4,L:2.4});
    if(R()<dt*0.06){const nb=guests.find(h=>h!==g&&h.inBath&&h.cur===g.cur&&Math.hypot(h.x-g.x,h.y-g.y)<1.2);if(nb)fx.push({k:'note',g,l:1.8,L:1.8,c:R()<0.5?'♪':'♥'})}}
   else{g.soak=0;if(!g.leaving&&R()<dt*0.01)fx.push({k:'yawn',g,l:1.4,L:1.4})}}
  if(fx.length>60)fx.splice(0,fx.length-60)}
 BUS.on('ground',(t,lt)=>{drawTufts(t,lt);

  for(const o of S.objs)if(DEF[o.k].pond)drawPond(o,t,lt);
  if(ghost=='pond'&&hoverT)drawPond({x:hoverT[0],y:hoverT[1],rot:moving?moving.rot:ROT},t,lt,0.6)});
 BUS.on('over',(t,lt,sv)=>{
  // 나비
  for(const b of butts){const[X,Y]=iso(b.x,b.y);const fl=Math.abs(Math.sin(t/70+b.p));cx.fillStyle=b.c;cx.fillRect(X-1.6*fl,Y-b.h-0.8,1.6*fl,1.6);cx.fillRect(X,Y-b.h-0.8,1.6*fl,1.6);cx.fillStyle='#3a3026';cx.fillRect(X-0.3,Y-b.h-0.9,0.6,1.8);cx.fillStyle='rgba(30,30,20,0.18)';cx.fillRect(X-1,Y,2,0.7)}
  // 이펙트
  cx.textAlign='center';
  for(const e of fx){const a=Math.min(1,e.l/e.L*2);
   if(e.k=='drop'){const[X,Y]=iso(e.x,e.y);const k=1-e.l/e.L;cx.fillStyle=`rgba(225,250,255,${a})`;for(let i=0;i<e.n;i++){const an=i/e.n*6.28;cx.fillRect(X+Math.cos(an)*k*5,Y-4-Math.sin(k*3.14)*6+Math.sin(an)*k*2,1,1)}}
   else if(e.g&&!e.g.dead){const[X,Y]=iso(e.g.x,e.g.y);const k=1-e.l/e.L;const hy=e.g.inBath?10:16;
    if(e.k=='zz'){cx.fillStyle=`rgba(240,246,255,${a})`;cx.font='bold 5px sans-serif';cx.fillText('z',X+4+k*3,Y-hy-k*6);cx.font='bold 3.5px sans-serif';cx.fillText('z',X+7+k*4,Y-hy-3-k*8)}
    else if(e.k=='note'){cx.fillStyle=e.c=='♥'?`rgba(255,140,170,${a})`:`rgba(255,240,180,${a})`;cx.font='bold 5px sans-serif';cx.fillText(e.c,X+Math.sin(k*6)*2,Y-hy-k*8)}
    else if(e.k=='yawn'){cx.fillStyle=`rgba(255,255,255,${a*0.8})`;cx.font='4px sans-serif';cx.fillText('~',X+5,Y-hy-k*3)}
    else if(e.k=='heart'){cx.fillStyle=`rgba(255,120,150,${a})`;cx.font='bold 7px sans-serif';cx.fillText('♥',X,Y-hy-6-k*10)}}
   else if(e.k=='spark'){const[X,Y]=iso(e.x,e.y);const k=1-e.l/e.L;cx.fillStyle=`rgba(255,246,200,${a})`;for(let i=0;i<6;i++){const an=i/6*6.28+k;const r=4+k*9;cx.fillRect(X+Math.cos(an)*r-0.6,Y-e.h+Math.sin(an)*r*0.6-0.6,1.2,1.2)}}
   else if(e.k=='ring'){const[X,Y]=iso(e.x,e.y);const k=1-e.l/e.L;cx.strokeStyle=`rgba(255,255,255,${a*0.8})`;cx.lineWidth=0.7;cx.beginPath();cx.ellipse(X,Y,3+k*12,1.5+k*6,0,0,6.283);cx.stroke()}}
  // 구름 그림자
  if(lt.sun>0.15&&!window.GFX_LOW){cx.save();cx.globalCompositeOperation='multiply';cx.globalAlpha=0.10*lt.sun;const T=t/1000;
   for(let i=0;i<5;i++){const wx=((T*(6+wind*4)+i*380)%2200)-500,wy=-200+i*170+Math.sin(T/40+i)*60;const s=160+i%3*70;cx.drawImage(B_SH,wx-s,wy-s*0.5,s*2,s);cx.drawImage(B_SH,wx-s*0.3,wy-s*0.6,s*1.4,s*0.8)}cx.restore()}
 });
 BUS.on('screen',(t,lt)=>{const z=cam.z;
  // 반딧불
  if(flies.length){cx.globalCompositeOperation='lighter';for(const f of flies){const[a,b]=iso(f.x,f.y);const[X,Y]=toScreen(a,b-f.h);const pu=(Math.sin(f.l*2.5+f.p)+1)/2;if(pu<0.15)continue;const r=(2+pu*2.5)*Math.min(z,4);cx.globalAlpha=pu*Math.min(1,f.l);cx.drawImage(B_FF,X-r,Y-r,r*2,r*2);cx.fillStyle='#f6ffd0';cx.fillRect(X-0.6*z,Y-0.6*z,1.2*z,1.2*z)}cx.globalAlpha=1}
  // 석등 일렁임
  if(lt.night>0.3){cx.globalCompositeOperation='lighter';for(const o of S.objs){if(o.k!='lantern')continue;const G=objGeom(o);const[X,Y]=toScreen(G.X,G.Y-G.H*0.55);const fl=0.6+0.4*Math.sin(t/90+o.x*3)*Math.sin(t/233+o.y);const r=(9+fl*4)*z;cx.globalAlpha=0.25*fl*lt.night;cx.drawImage(B_WARM,X-r,Y-r,r*2,r*2)}cx.globalAlpha=1}
  cx.globalCompositeOperation='source-over';
  // 새
  for(const b of birds){const w=Math.sin(t/110+b.p)*3*b.s;cx.strokeStyle='rgba(50,45,50,0.55)';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(b.x-5*b.s,b.y-w);cx.quadraticCurveTo(b.x-2*b.s,b.y-1,b.x,b.y);cx.quadraticCurveTo(b.x+2*b.s,b.y-1,b.x+5*b.s,b.y-w);cx.stroke()}
 });
 // ---- 나무 사이를 오가는 작은 새 (낮, 나무 3그루 이상: 2그루당 1마리, 최대 10마리) ----
 const TREEK=/^(sakura|maple|pine|cedar|olive)/;const tbirds=[];window.__birds=tbirds;let tbT=0,treeList=[];
 function perchOf(o){const G=objGeom(o);return[G.X+(Math.random()-0.5)*G.W*0.45,G.Y-G.H*(0.62+Math.random()*0.2)]}
 BUS.on('screen',(t,lt)=>{const n=performance.now();if(n-tbT>2000){tbT=n;treeList=S.objs.filter(o=>TREEK.test(o.k)&&o!==window.__dbg?.moving)}
  const want=lt.night>0.6||treeList.length<3?0:Math.min(10,treeList.length>>1);
  while(tbirds.length<want){const o=treeList[Math.random()*treeList.length|0];const[x,y]=perchOf(o);tbirds.push({x,y,st:'perch',t:2+Math.random()*6,ph:Math.random()*6,a:0})}
  if(tbirds.length>want){const b=tbirds[tbirds.length-1];b.leave=1}
  const dt=Math.min(0.05,(n-(tbirds._l||n))/1000);tbirds._l=n;const z=cam.z,s=Math.max(1.4,z*1.1);
  cx.save();cx.globalCompositeOperation='source-over';
  for(let i=tbirds.length-1;i>=0;i--){const b=tbirds[i];b.ph+=dt;b.a=Math.min(1,b.a+dt*(b.leave?-1.5:1.5));if(b.a<=0&&b.leave){tbirds.splice(i,1);continue}
   if(b.st=='perch'){b.t-=dt;if(b.t<=0&&treeList.length){const near=treeList.map(q=>{const G=objGeom(q);return[Math.hypot(G.X-b.x,G.Y-b.y),q]}).sort((p,q)=>p[0]-q[0]).slice(0,4);const o=near[1+Math.random()*Math.max(1,near.length-1)|0]?.[1]||near[0][1];const[tx_,ty_]=perchOf(o);const d=Math.hypot(tx_-b.x,ty_-b.y);
     b.st='fly';b.fx=b.x;b.fy=b.y;b.tx=tx_;b.ty=ty_;b.ft=0;b.fd=Math.max(0.6,d/70);b.arc=Math.min(40,10+d*0.25)}}
   else{b.ft+=dt;const u=Math.min(1,b.ft/b.fd),e=u*u*(3-2*u);b.x=b.fx+(b.tx-b.fx)*e;b.y=b.fy+(b.ty-b.fy)*e-Math.sin(u*Math.PI)*b.arc;b.dir=b.tx>b.fx?1:-1;if(u>=1){b.st='perch';b.t=3+Math.random()*6}}
   const[X,Y]=toScreen(b.x,b.y+(b.st=='perch'?Math.sin(b.ph*3)*0.4:0));if(X<-10||X>VW+10||Y<-10||Y>VH+10)continue;
   cx.globalAlpha=b.a*(1-0.6*lt.night);const flap=b.st=='fly'?Math.sin(b.ph*28)>0:Math.sin(b.ph*5)>0.97,dr=b.dir||1;
   cx.fillStyle='#4a3424';cx.fillRect(X-s,Y-s*0.5,s*2,s);cx.fillRect(X+dr*s,Y-s,s,s);// 몸·머리
   cx.fillStyle='#c98a4a';cx.fillRect(X+dr*s*1.6,Y-s*0.6,s*0.6,s*0.4);// 부리
   cx.fillStyle='#6b4a32';if(flap)cx.fillRect(X-s*0.8,Y-s*1.6,s*1.4,s*0.9);else cx.fillRect(X-s*0.8,Y,s*1.4,s*0.7)}// 날개
  cx.restore()});
 // ---- 탭 반응 ----
 function tap(fx_,fy_,sx,sy){let best=null,bd=1e9;for(const g of guests){if(g.hide||g.dead)continue;const[X,Y]=toScreenT(g.x,g.y);const d=Math.hypot(X-sx,(Y-7*cam.z)-sy);if(d<bd){bd=d;best=g}}
  if(best&&bd<9*cam.z+6){best.hop=0.5;fx.push({k:'heart',g:best,l:1.2,L:1.2});if(best.inBath)fx.push({k:'ring',x:best.x,y:best.y,l:1,L:1},{k:'drop',x:best.x,y:best.y,n:8,l:0.7,L:0.7});
   const L=['아~ 좋다','뜨끈뜨끈','최고야…','♨ 행복'],T=best.target&&DEF[best.target.k]?DEF[best.target.k].n:null;
   const V=best.view&&DEF[best.view.k]?DEF[best.view.k].n:null;
   const line=best.inBath?L[(R()*L.length)|0]:best.leaving?'집에 가는 중이에요':best.st=='look'?'풍경 구경 중':V?`${V} 구경하러 가는 중`:best.st=='wait'&&T?`${T} 자리 기다리는 중`:T?`${T} 가는 중`:'느긋하게 산책 중';think(best,line,true);window.SND&&SND.squeak&&SND.squeak();return !best.inBath}
  const o=OCC[(fx_|0)+','+(fy_|0)];if(o&&!DEF[o.k].isPath){const c=ctr(o);o.sway=Math.min(0.4,(o.sway||0)+0.3);fx.push({k:'spark',x:c[0],y:c[1],h:DEF[o.k].tree?20:10,l:0.8,L:0.8});
   if(DEF[o.k].pond){const d=pondData(o);const[X,Y]=iso(fx_,fy_);d.rip.push({x:X,y:Y,l:1.6},{x:X+2,y:Y+1,l:1.2})}}
  return false}
 // ---- 호버 ----
 let hov=null;addEventListener('pointermove',e=>{if(e.pointerType!='mouse')return;let best=null,bd=1e9;for(const g of guests){if(g.hide||g.dead)continue;const[X,Y]=toScreenT(g.x,g.y);const d=Math.hypot(X-e.clientX,(Y-7*cam.z)-e.clientY);if(d<bd){bd=d;best=g}}hov=best&&bd<9*cam.z+6?best:null;const c=document.getElementById('c');if(c)c.style.cursor=hov&&!ghost?'pointer':''});
 BUS.on('over',(t)=>{if(!hov||hov.dead||ghost)return;const[X,Y]=iso(hov.x,hov.y);cx.strokeStyle=`rgba(255,246,200,${0.55+0.25*Math.sin(t/200)})`;cx.lineWidth=0.8;cx.beginPath();cx.ellipse(X,Y+(hov.inBath?2:0),7,3.2,0,0,6.283);cx.stroke()});
 // ---- 계절 전역 낙하물 (뷰포트 위쪽에서) ----
 function seasonal(dt){const sea=season();const k=sea==0?'petal':sea==2?'leaf':null;if(!k||window.GFX_LOW||parts.length>500)return;if(R()<dt*1.6){const[fx,fy]=toTile(R()*VW,R()*VH*0.6);parts.push({k,x:fx-1,y:fy-1,h:50+R()*20,vx:0,l:7,L:7,ph:R()*6})}}
 // ---- 바람 & 갱신 ----
 BUS.on('frame',(dt,t)=>{windT+=dt;const target=Math.sin(windT/23)*0.6+Math.sin(windT/7.3)*0.25;wind+=(target-wind)*Math.min(1,dt*0.5);window.WIND=wind;updCreatures(dt,t,light());seasonal(dt);zenStep(dt,t);shT-=dt;if(shT<=0){shT=9+R()*6;const sh=S.objs.find(o=>o.k=='shishi');if(sh){window.SND&&SND.tok&&SND.tok();const c=ctr(sh);fx.push({k:'drop',x:c[0],y:c[1],n:6,l:0.6,L:0.6});sh.sway=0.3}}});let shT=5;
 // ---- 감상 모드 ----
 let zen=false,zT=0,zHint=null;
 function zenStep(dt,t){if(!zen)return;zT+=dt;
  const pts=S.objs.filter(o=>DEF[o.k].bath||DEF[o.k].stay||DEF[o.k].tab=='food').sort((a,b)=>(DEF[b.k].bath?1:0)-(DEF[a.k].bath?1:0)||(a.x+a.y)-(b.x+b.y));
  let tx_,ty_;if(pts.length){const seg=16,i=Math.floor(zT/seg),f=(zT%seg)/seg;const A=pts[(i*3)%pts.length],c0=ctr(A);const all=S.objs.filter(o=>!DEF[o.k].isPath&&o.k!='gate');let mx=0,my=0;for(const o of all){const q=ctr(o);mx+=q[0];my+=q[1]}mx/=all.length||1;my/=all.length||1;const c=[c0[0]*0.6+mx*0.4,c0[1]*0.6+my*0.4];const dr=(f-0.5)*2.2;tx_=c[0]+dr*0.6;ty_=c[1]-dr*0.6+Math.sin(zT/11)*0.4}
  else{const P=Object.keys(S.plots).map(k=>k.split(',').map(Number));tx_=P[0][0]*PS+PS/2;ty_=P[0][1]*PS+PS/2}
  const zz=((VW>820?3.6:2.8)+Math.sin(zT/23)*0.35)*Math.max(1,VW/1280);
  const[wx,wy]=iso(tx_,ty_);const k=Math.min(1,dt*(zT<3?1.6:0.45));cam.z+=(zz-cam.z)*Math.min(1,dt*0.4);cam.tz=cam.z;const gx=VW/2-wx*cam.z,gy=VH/2-wy*cam.z;cam.x+=(gx-cam.x)*k;cam.y+=(gy-cam.y)*k}
 function setZen(on,quiet){zen=on;zT=0;document.body.classList.toggle('zen',on);if(on&&!quiet){zHint=document.createElement('div');zHint.id='zenHint';zHint.textContent='감상 모드 · 아무 곳이나 누르거나 Esc로 나가기';document.body.appendChild(zHint);setTimeout(()=>zHint&&zHint.classList.add('fade'),2500);window.SND&&SND.init&&SND.init()}else{zHint&&zHint.remove();zHint=null}}
 addEventListener('keydown',e=>{if(window.SHELL&&SHELL.inTitle)return;if(e.key=='Escape'&&zen){setZen(false);e.stopPropagation()}else if((e.key=='z'||e.key=='Z')&&!e.ctrlKey&&document.activeElement.tagName!='INPUT')setZen(!zen)},true);
 addEventListener('pointerdown',e=>{if(zen&&!document.body.classList.contains('titling')&&!e.target.closest('#zenBtn,#title,.ovl')){setZen(false);e.stopPropagation();e.preventDefault()}},true);
 const tb=document.getElementById('tools');if(tb){const b=document.createElement('button');b.className='tool';b.id='zenBtn';b.innerHTML='<i>감상</i>';b.title='감상 모드 (Z)';b.onclick=e=>{e.stopPropagation();setZen(true)};tb.appendChild(b)}
 return{tap,setZen,get zen(){return zen},flies,butts,birds,fx};
})();
window.AMB=AMB;
