'use strict';
// ===== 앰비언트: 바람·풀·구름 그림자·연못·물결·생물·카피바라 행동·감상 모드 =====
const AMB=(()=>{
 const R=Math.random;let tPrev=0,wind=0,windT=0;window.WIND=0;
 const blob=(()=>{const c=mk(64,64),g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.5,'rgba(255,255,255,0.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return c})();
 const tint=(c0)=>{const c=mk(64,64),g=c.getContext('2d');g.drawImage(blob,0,0);g.globalCompositeOperation='source-in';g.fillStyle=c0;g.fillRect(0,0,64,64);return c};
 const B_SH=tint('#1d2a3a'),B_FF=tint('#d9ff8a'),B_WARM=tint('#ffc070'),B_W=tint('#ffffff');
 // ---- 풀잎 (열린 빈 잔디 타일, 캐시) ----
 let tufts=[],tuftSig='';
 function rebuildTufts(){const r=rng(99);tufts=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!tileOpen(x,y)||OCC[x+','+y])continue;const n=r()<0.55?1:r()<0.3?2:0;for(let i=0;i<n;i++)tufts.push({x:x+0.15+r()*0.7,y:y+0.15+r()*0.7,h:2+r()*2.5,c:r(),p:r()*6,f:r()<0.06?(r()<0.5?'#f4e7d2':'#f2b8c8'):null})}}
 function drawTufts(t,lt){if(window.GFX_LOW)return;const sig=Object.keys(OCC).length+'|'+Object.keys(S.plots).length;if(sig!=tuftSig){tuftSig=sig;rebuildTufts()}
  const x0=-cam.x/cam.z-20,x1=(VW-cam.x)/cam.z+20,y0=-cam.y/cam.z-20,y1=(VH-cam.y)/cam.z+20;
  const cols=['#5f8a46','#78a356','#93b866'];cx.lineWidth=0.7;
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
 function drawPond(o,t,lt,ghostA){const d=pondData(o);const[cX,cY]=iso(o.x+1.5,o.y+1.5);const rx=3*TW*0.4,ry=rx/2;
  cx.save();cx.globalAlpha=ghostA||1;
  // 바닥 그림자 + 물
  cx.fillStyle='rgba(30,40,30,0.25)';cx.beginPath();cx.ellipse(cX,cY+1.5,rx+3,ry+2.5,0,0,6.283);cx.fill();
  const wg=cx.createLinearGradient(0,cY-ry,0,cY+ry);wg.addColorStop(0,'#3d6f70');wg.addColorStop(1,'#2a5257');cx.fillStyle=wg;cx.beginPath();cx.ellipse(cX,cY,rx,ry,0,0,6.283);cx.fill();
  cx.save();cx.beginPath();cx.ellipse(cX,cY,rx-1,ry-0.5,0,0,6.283);cx.clip();
  // 안쪽 그늘
  cx.fillStyle='rgba(20,35,35,0.35)';cx.beginPath();cx.ellipse(cX,cY-ry*0.55,rx,ry*0.6,0,0,6.283);cx.fill();
  // 잉어
  for(const k of d.koi){const a=t/1000*k.sp+k.ph;const px=cX+Math.cos(a)*rx*k.r*1.3,py=cY+Math.sin(a)*ry*k.r*1.3;const hd=a+(k.sp>0?1.571:-1.571);
   const ux=Math.cos(hd),uy=Math.sin(hd)*0.5,wig=Math.sin(t/180+k.w)*0.35;
   cx.globalAlpha=0.85;for(let s=0;s<4;s++){const bx=px-ux*s*1.7+Math.sin(wig*s)*0.6*-uy,by=py-uy*s*1.7;cx.fillStyle=s==1?k.c[1]:k.c[0];cx.beginPath();cx.ellipse(bx,by,s==3?0.8:1.5-s*0.2,s==3?0.8:1.1-s*0.15,hd,0,6.283);cx.fill()}
   const tx=px-ux*7.2,ty=py-uy*7.2;cx.fillStyle=k.c[0];cx.beginPath();cx.moveTo(tx+ux*1.5,ty+uy*1.5);cx.lineTo(tx-uy*2+Math.sin(t/150+k.w),ty+ux*1.2);cx.lineTo(tx+uy*2+Math.sin(t/150+k.w),ty-ux*1.2);cx.fill();
   if(R()<0.002){d.rip.push({x:px,y:py,l:1.6})}}
  cx.globalAlpha=1;
  // 하늘 반사·물결선
  cx.fillStyle=`rgba(${lt.sky},0.14)`;cx.fillRect(cX-rx,cY-ry,rx*2,ry*2);
  cx.globalCompositeOperation='screen';cx.strokeStyle=`rgba(255,255,255,${0.08+0.08*lt.sun})`;cx.lineWidth=0.5;cx.beginPath();
  for(let i=0;i<5;i++){const yy=cY-ry+((t/120+i*ry*0.45)%(ry*2.2));cx.moveTo(cX-rx,yy);for(let xx=-rx;xx<=rx;xx+=4)cx.lineTo(cX+xx,yy+Math.sin(xx/5+t/500+i)*0.6)}cx.stroke();
  cx.globalCompositeOperation='source-over';
  for(const p of d.rip){p.l-=1/60;const k=1.6-p.l;cx.strokeStyle=`rgba(230,250,250,${Math.max(0,p.l/1.6)*0.6})`;cx.beginPath();cx.ellipse(p.x,p.y,1+k*5,0.5+k*2.5,0,0,6.283);cx.stroke()}d.rip=d.rip.filter(p=>p.l>0);
  cx.restore();
  // 연잎
  for(const p of d.pads){const a=p.a+Math.sin(t/4000+p.a)*0.05;const px=cX+Math.cos(a)*rx*p.rr,py=cY+Math.sin(a)*ry*p.rr;cx.fillStyle='#4f7d3a';cx.beginPath();cx.ellipse(px,py,2.6*p.s,1.3*p.s,0,0.5,6.0);cx.lineTo(px,py);cx.fill();cx.fillStyle='#6d9a4c';cx.beginPath();cx.ellipse(px-0.4,py-0.3,1.6*p.s,0.7*p.s,0,0.5,6.0);cx.lineTo(px,py);cx.fill();
   if(p.fl){cx.fillStyle='#f3c2cf';cx.beginPath();cx.ellipse(px+0.5,py-1,1.3,0.9,0,0,6.283);cx.fill();cx.fillStyle='#fff3f5';cx.fillRect(px+0.1,py-1.8,0.8,0.8)}}
  // 돌 테두리 (뒤→앞 순서)
  const st=d.stones.slice().sort((a,b)=>Math.sin(a.a)-Math.sin(b.a));const SC=[['#8f8a80','#b4ad9f'],['#7d7a72','#a39e92'],['#9a9384','#c2baa8']];
  for(const s of st){const px=cX+Math.cos(s.a)*(rx+0.5),py=cY+Math.sin(s.a)*(ry+0.3);const w=3.2*s.s,h=2.2*s.s;cx.fillStyle='rgba(30,30,25,0.25)';cx.beginPath();cx.ellipse(px+0.5,py+0.9,w,h*0.7,0,0,6.283);cx.fill();
   cx.fillStyle=SC[s.c][0];cx.beginPath();cx.ellipse(px,py,w,h,0,0,6.283);cx.fill();cx.fillStyle=SC[s.c][1];cx.beginPath();cx.ellipse(px-0.5,py-0.7,w*0.65,h*0.5,0,0,6.283);cx.fill();
   if(s.c==1){cx.fillStyle='rgba(110,140,70,0.7)';cx.fillRect(px-w*0.6,py-h*0.6,w*0.5,0.9)}}
  cx.restore()}
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
  const open=Object.keys(S.plots).map(k=>k.split(',').map(Number));const rp=()=>{const p=open[(R()*open.length)|0];return[p[0]*PS+R()*PS,p[1]*PS+R()*PS]};
  const want=Math.round(Math.max(0,lt.night-0.3)*(window.GFX_LOW?14:40));while(flies.length<want){const[x,y]=rp();flies.push({x,y,h:3+R()*12,vx:0,vy:0,p:R()*6,l:0})}if(flies.length>want&&R()<dt*3)flies.pop();
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
 BUS.on('ground',(t,lt)=>{drawTufts(t,lt);for(const o of S.objs)if(DEF[o.k].pond)drawPond(o,t,lt);
  if(ghost=='pond'&&hoverT)drawPond({x:hoverT[0],y:hoverT[1]},t,lt,0.6)});
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
  if(lt.sun>0.15&&!window.GFX_LOW){cx.save();cx.globalCompositeOperation='multiply';cx.globalAlpha=0.16*lt.sun;const T=t/1000;
   for(let i=0;i<5;i++){const wx=((T*(6+wind*4)+i*380)%2200)-500,wy=-200+i*170+Math.sin(T/40+i)*60;const s=160+i%3*70;cx.drawImage(B_SH,wx-s,wy-s*0.5,s*2,s);cx.drawImage(B_SH,wx-s*0.3,wy-s*0.6,s*1.4,s*0.8)}cx.restore()}
 });
 BUS.on('screen',(t,lt)=>{const z=cam.z;
  // 반딧불
  if(flies.length){cx.globalCompositeOperation='lighter';for(const f of flies){const[a,b]=iso(f.x,f.y);const[X,Y]=toScreen(a,b-f.h);const pu=(Math.sin(f.l*2.5+f.p)+1)/2;if(pu<0.15)continue;const r=(3+pu*4)*z;cx.globalAlpha=pu*Math.min(1,f.l);cx.drawImage(B_FF,X-r,Y-r,r*2,r*2);cx.fillStyle='#f6ffd0';cx.fillRect(X-0.6*z,Y-0.6*z,1.2*z,1.2*z)}cx.globalAlpha=1}
  // 석등 일렁임
  if(lt.night>0.3){cx.globalCompositeOperation='lighter';for(const o of S.objs){if(o.k!='lantern')continue;const G=objGeom(o);const[X,Y]=toScreen(G.X,G.Y-G.H*0.55);const fl=0.6+0.4*Math.sin(t/90+o.x*3)*Math.sin(t/233+o.y);const r=(9+fl*4)*z;cx.globalAlpha=0.25*fl*lt.night;cx.drawImage(B_WARM,X-r,Y-r,r*2,r*2)}cx.globalAlpha=1}
  cx.globalCompositeOperation='source-over';
  // 새
  for(const b of birds){const w=Math.sin(t/110+b.p)*3*b.s;cx.strokeStyle='rgba(50,45,50,0.55)';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(b.x-5*b.s,b.y-w);cx.quadraticCurveTo(b.x-2*b.s,b.y-1,b.x,b.y);cx.quadraticCurveTo(b.x+2*b.s,b.y-1,b.x+5*b.s,b.y-w);cx.stroke()}
 });
 // ---- 탭 반응 ----
 function tap(fx_,fy_,sx,sy){let best=null,bd=1e9;for(const g of guests){if(g.hide||g.dead)continue;const[X,Y]=toScreenT(g.x,g.y);const d=Math.hypot(X-sx,(Y-7*cam.z)-sy);if(d<bd){bd=d;best=g}}
  if(best&&bd<9*cam.z+6){best.hop=0.5;fx.push({k:'heart',g:best,l:1.2,L:1.2});if(best.inBath)fx.push({k:'ring',x:best.x,y:best.y,l:1,L:1},{k:'drop',x:best.x,y:best.y,n:8,l:0.7,L:0.7});
   const L=best.inBath?['아~ 좋다','뜨끈뜨끈','최고야…','♨ 행복']:['안녕하세요!','여기 좋네요','유자 냄새~','오늘 날씨 좋다'];think(best,L[(R()*L.length)|0]);window.SND&&SND.squeak&&SND.squeak();return true}
  const o=OCC[(fx_|0)+','+(fy_|0)];if(o&&!DEF[o.k].isPath){const c=ctr(o);o.sway=Math.min(0.4,(o.sway||0)+0.3);fx.push({k:'spark',x:c[0],y:c[1],h:DEF[o.k].tree?20:10,l:0.8,L:0.8});
   if(DEF[o.k].pond){const d=pondData(o);const[X,Y]=iso(fx_,fy_);d.rip.push({x:X,y:Y,l:1.6},{x:X+2,y:Y+1,l:1.2})}}
  return false}
 // ---- 바람 & 갱신 ----
 BUS.on('frame',(dt,t)=>{windT+=dt;const target=Math.sin(windT/23)*0.6+Math.sin(windT/7.3)*0.25;wind+=(target-wind)*Math.min(1,dt*0.5);window.WIND=wind;updCreatures(dt,t,light());zenStep(dt,t)});
 // ---- 감상 모드 ----
 let zen=false,zT=0,zHint=null;
 function zenStep(dt,t){if(!zen)return;zT+=dt;const P=Object.keys(S.plots).map(k=>k.split(',').map(Number));let cx_=0,cy_=0;for(const[a,b]of P){cx_+=a*PS+PS/2;cy_+=b*PS+PS/2}cx_/=P.length;cy_/=P.length;
  const span=PS*0.28*Math.sqrt(P.length);const tx_=cx_+Math.sin(zT/37)*span,ty_=cy_+Math.sin(zT/53+1)*span;const zz=(VW>820?3.4:2.6)+Math.sin(zT/29)*0.5;
  const[wx,wy]=iso(tx_,ty_);const k=Math.min(1,dt*(zT<3?1.6:0.35));cam.z+=(zz-cam.z)*k;cam.tz=cam.z;const gx=VW/2-wx*cam.z,gy=VH/2-wy*cam.z;cam.x+=(gx-cam.x)*k;cam.y+=(gy-cam.y)*k}
 function setZen(on,quiet){zen=on;zT=0;document.body.classList.toggle('zen',on);if(on&&!quiet){zHint=document.createElement('div');zHint.id='zenHint';zHint.textContent='감상 모드 · 아무 곳이나 누르거나 Esc로 나가기';document.body.appendChild(zHint);setTimeout(()=>zHint&&zHint.classList.add('fade'),2500);window.SND&&SND.init&&SND.init()}else{zHint&&zHint.remove();zHint=null}}
 addEventListener('keydown',e=>{if(window.SHELL&&SHELL.inTitle)return;if(e.key=='Escape'&&zen){setZen(false);e.stopPropagation()}else if((e.key=='z'||e.key=='Z')&&!e.ctrlKey&&document.activeElement.tagName!='INPUT')setZen(!zen)},true);
 addEventListener('pointerdown',e=>{if(zen&&!document.body.classList.contains('titling')&&!e.target.closest('#zenBtn,#title,.ovl')){setZen(false);e.stopPropagation();e.preventDefault()}},true);
 const tb=document.getElementById('tools');if(tb){const b=document.createElement('button');b.className='tool';b.id='zenBtn';b.innerHTML='🍃<i>감상</i>';b.title='감상 모드 (Z)';b.onclick=e=>{e.stopPropagation();setZen(true)};tb.appendChild(b)}
 return{tap,setZen,get zen(){return zen},flies,butts,birds,fx};
})();
window.AMB=AMB;
