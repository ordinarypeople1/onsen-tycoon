'use strict';
// ===== 설정 =====
const N=32,PS=8,TW=32,TH=16;           // 맵 24x24, 구역 6x6
const START_PLOT=[1,1];
const $=id=>document.getElementById(id);
const cv=$('c'),cx=cv.getContext('2d'),tc=$('tc'),tx=tc.getContext('2d');
const DEF={
 rock:{n:'바위 노천탕',tab:'bath',img:'rock',fp:3,sc:0.99,cost:6000,price:600,cap:4,dur:28,eff:{fatigue:-70,fun:12},wage:60,star:1,bath:1,water:'#8fe3df',appeal:12,desc:'김이 피어오르는 바위 노천탕'},
 hinoki:{n:'히노키 욕조',tab:'bath',img:'hinoki',fp:2,sc:0.87,cost:3500,price:450,cap:2,dur:22,eff:{fatigue:-50,fun:8},wage:35,star:1,bath:1,water:'#9fd6e6',appeal:7,desc:'편백나무 향 가득한 욕조'},
 sauna:{n:'사우나',tab:'bath',img:'sauna',fp:2,sc:0.97,cost:7000,price:700,cap:3,dur:20,eff:{fatigue:-40,fun:25},wage:55,star:2,appeal:8,light:[[0.1,-0.45]],desc:'땀 빼고 나면 개운!'},
 milky:{n:'유백 대욕장',tab:'bath',img:'milky',fp:3,sc:0.97,cost:15000,price:1100,cap:6,dur:30,eff:{fatigue:-85,fun:15},wage:110,star:3,bath:1,water:'#f1ede0',appeal:16,desc:'우윳빛 온천수의 대욕장'},
 ramen:{n:'라멘집',tab:'food',img:'ramen',fp:2,sc:1.03,cost:4000,price:900,cap:3,dur:15,eff:{hunger:-70,fun:5},wage:45,star:1,appeal:6,light:[[0.15,-0.55],[0.28,-0.3]],desc:'유자 시오 라멘이 명물'},
 teishoku:{n:'정식당',tab:'food',img:'teishoku',fp:2,sc:1.06,cost:9000,price:1600,cap:4,dur:20,eff:{hunger:-90,fun:10},wage:80,star:2,appeal:8,light:[[0.3,-0.35]],desc:'오늘의 유자 연어 정식'},
 izakaya:{n:'이자카야',tab:'food',img:'izakaya',fp:2,sc:1.01,cost:16000,price:2200,cap:5,dur:25,eff:{hunger:-50,thirst:-50,fun:40},wage:120,star:3,appeal:10,night:1,light:[[-0.1,-0.6],[0.1,-0.6],[0.3,-0.6]],desc:'밤에 북적이는 선술집'},
 milk:{n:'우유 매점',tab:'shop',img:'yuzu',filter:'saturate(0.35) brightness(1.12)',fp:2,sc:0.92,cost:1500,price:250,cap:3,dur:8,eff:{thirst:-70},wage:20,star:1,appeal:4,desc:'목욕 후엔 역시 커피우유'},
 yuzu:{n:'유자차 매점',tab:'shop',img:'yuzu',fp:2,sc:0.92,cost:2500,price:350,cap:3,dur:8,eff:{thirst:-60,fun:8},wage:25,star:1,appeal:6,desc:'따끈한 유자차 한 잔'},
 gift:{n:'기념품 가게',tab:'shop',img:'gift',fp:2,sc:0.99,cost:6000,price:1500,cap:3,dur:12,eff:{fun:-0,joy:30},wage:50,star:2,appeal:7,fun:1,light:[[0.2,-0.4]],desc:'카피바라 인형이 인기'},
 room:{n:'객실 별채',tab:'shop',img:'room',fp:3,sc:0.92,cost:12000,price:6000,cap:4,dur:0,eff:{fatigue:-100},wage:90,star:2,appeal:10,stay:1,light:[[-0.2,-0.3],[0.25,-0.3],[0,-0.55]],desc:'밤에 묵어가는 손님용 객실'},
 sakura:{n:'벚꽃나무',tab:'deco',img:'sakura',fp:1,sc:2.3,cost:1200,beauty:8,star:1,emit:'petal',desc:'꽃잎이 흩날려요'},
 maple:{n:'단풍나무',tab:'deco',img:'maple',fp:1,sc:2.3,cost:1200,beauty:8,star:1,emit:'leaf',desc:'붉은 잎이 떨어져요'},
 pine:{n:'눈 내린 소나무',tab:'deco',img:'pine',fp:1,sc:2.0,cost:2000,beauty:10,star:2,emit:'snow',desc:'주변에 눈이 내려요'},
 lantern:{n:'석등롱',tab:'deco',img:'lantern',fp:1,sc:1.25,cost:600,beauty:5,star:1,light:[[0,-0.55]],desc:'밤이면 은은히 빛나요'},
 rocks:{n:'정원석',tab:'deco',img:'rocks',fp:1,sc:1.4,cost:400,beauty:4,star:1,desc:'이끼 낀 정원석'},
 path:{n:'돌길',tab:'deco',img:null,fp:1,cost:50,beauty:1,star:1,desc:'손님이 좋아하는 돌길'},
};
const TABS=[['bath','♨️','탕'],['food','🍜','음식'],['shop','🏮','상점'],['deco','🌸','장식']];
const TIPS={bath:'🍃 탕은 손님의 피로를 풀어주고 만족도를 높여요!',food:'🍜 배고픈 손님은 식당을 찾아가요. 가격은 시설을 눌러 조절!',shop:'🏮 목마른 손님은 매점으로. 밤엔 객실에 묵어가요.',deco:'🌸 장식은 주변 분위기를 바꾸고 아름다움을 더해요.'};
const SEASONS=['봄','여름','가을','겨울'],SEMO=['🌸','🌻','🍁','❄️'],STEMP=[16,27,14,-1];
const NEEDK=['fatigue','hunger','thirst','fun'],NEEDN={fatigue:'피로',hunger:'배고픔',thirst:'목마름',fun:'재미'};
// ===== 상태 =====
let S;
function fresh(){
 const plots={};plots[START_PLOT.join(',')]=1;
 const o=[];const b=(k,x,y)=>o.push({k,x,y,lv:1,price:DEF[k].price||0,uses:0,earn:0});
 b('rock',10,10);b('lantern',9,13);b('sakura',14,9);b('rocks',9,10);for(let i=9;i<16;i++)b('path',i,14);
 return {yen:8000,min:8*60+40,plots,objs:o,fin:{inc:0,exp:0,hist:[]},rep:55,t:Date.now(),served:0,ver:2};
}
function load(){
 try{const d=JSON.parse(localStorage.onsen2||'null');if(d&&d.ver==2){S=d;
   const off=Math.min((Date.now()-d.t)/1000,8*3600);
   const hr=avgNet();const g=Math.floor(Math.max(0,hr)*(off/3600)*0.5);
   if(off>60&&g>0){S.yen+=g;setTimeout(()=>toast(`쉬는 동안 ${fmt(g)}엔 벌었어요! (${Math.floor(off/60)}분)`),800)}
   return}}catch(e){}
 S=fresh();
}
function save(){S.t=Date.now();localStorage.onsen2=JSON.stringify(S)}
const fmt=n=>Math.floor(n).toLocaleString('ko-KR');
function avgNet(){const h=S.fin.hist;if(!h.length)return 0;const a=h.slice(-24);return a.reduce((s,x)=>s+x,0)/a.length}
// ===== 에셋 =====
const IMG={},VAR={};const NAMES=['rock','hinoki','sauna','milky','ramen','teishoku','izakaya','yuzu','gift','room','sakura','maple','pine','lantern','rocks','cb1','cb2','cb3','cb4','cw1','cw2','cw3','cw4'];
function loadImgs(){return Promise.all(NAMES.map(n=>new Promise(r=>{const i=new Image();i.onload=()=>{IMG[n]=i;r()};i.onerror=r;i.src='assets/'+n+'.png'})))}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function variants(key,img,filter){ // 실루엣/림라이트 생성 (컴포지팅만 사용)
 const w=img.width,h=img.height,base=mk(w,h),bx=base.getContext('2d');if(filter)bx.filter=filter;bx.drawImage(img,0,0);
 const sil=mk(w,h),s=sil.getContext('2d');s.drawImage(base,0,0);s.globalCompositeOperation='source-in';s.fillStyle='#000';s.fillRect(0,0,w,h);
 const rim=(dx)=>{const c=mk(w,h),g=c.getContext('2d');g.drawImage(base,0,0);g.globalCompositeOperation='destination-out';g.drawImage(base,dx,3);g.globalCompositeOperation='source-in';g.fillStyle='#fff3cf';g.fillRect(0,0,w,h);return c};
 VAR[key]={base,sil,rimL:rim(3),rimR:rim(-3)};
}
// ===== 카메라 =====
let DPR=1,VW=0,VH=0;const cam={x:0,y:0,z:3.2,tz:3.2};
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);VW=innerWidth;VH=innerHeight;for(const c of[cv,tc]){c.width=VW*DPR;c.height=VH*DPR;c.style.width=VW+'px';c.style.height=VH+'px'}}
const iso=(x,y)=>[(x-y)*TW/2,(x+y)*TH/2];
function toScreen(wx,wy){return[(wx*cam.z+cam.x),(wy*cam.z+cam.y)]}
function toTile(sx,sy){const wx=(sx-cam.x)/cam.z,wy=(sy-cam.y)/cam.z;return[(wy/(TH/2)+wx/(TW/2))/2,(wy/(TH/2)-wx/(TW/2))/2]}
function focus(tx_,ty_,z){if(z)cam.z=cam.tz=z;const[wx,wy]=iso(tx_,ty_);cam.x=VW*(VW>820?0.42:0.5)-wx*cam.z;cam.y=VH*(VW>820?0.5:0.33)-wy*cam.z}
function zoomAt(sx,sy,z){z=Math.max(0.5,Math.min(8,z));cam.x=sx-(sx-cam.x)*z/cam.z;cam.y=sy-(sy-cam.y)*z/cam.z;cam.z=z}
// ===== 구역 =====
const plotOf=(x,y)=>[Math.floor(x/PS),Math.floor(y/PS)];
const plotOpen=(px,py)=>!!S.plots[px+','+py];
const tileOpen=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&plotOpen(...plotOf(x,y));
function plotPrice(px,py){const d=Math.abs(px-START_PLOT[0])+Math.abs(py-START_PLOT[1]);return Math.round(12000*Math.pow(2.3,d-1)/1000)*1000}
function plotAdj(px,py){return [[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>plotOpen(px+a,py+b))}
const anims={};
// ===== 지면 (오프스크린 픽셀 텍스처) =====
let ground=null,groundDirty=true;
function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function buildGround(){
 const W=N*TW+8,H=N*TH+40;ground=mk(W*2,H*2);const g=ground.getContext('2d');g.scale(2,2);const ox=N*TW/2+4;
 const pathSet=new Set(S.objs.filter(o=>o.k=='path').map(o=>o.x+','+o.y));
 const near=new Set();for(const o of S.objs){if(DEF[o.k].fp>=2)for(let x=o.x-1;x<=o.x+DEF[o.k].fp;x++)for(let y=o.y-1;y<=o.y+DEF[o.k].fp;y++)near.add(x+','+y)}
 // 절벽 옆면
 g.fillStyle='#8a6a48';g.beginPath();g.moveTo(ox-N*TW/2,N*TH/2);g.lineTo(ox,N*TH);g.lineTo(ox+N*TW/2,N*TH/2);g.lineTo(ox+N*TW/2,N*TH/2+14);g.lineTo(ox,N*TH+14);g.lineTo(ox-N*TW/2,N*TH/2+14);g.fill();
 g.fillStyle='#6d5238';g.beginPath();g.moveTo(ox,N*TH);g.lineTo(ox+N*TW/2,N*TH/2);g.lineTo(ox+N*TW/2,N*TH/2+14);g.lineTo(ox,N*TH+14);g.fill();
 g.fillStyle='#5f8f45';g.fillRect(0,0,0,0);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const r=rng(x*928371+y*1237+7);const[ix,iy]=iso(x,y);const X=ox+ix,Y=iy;
  const key=x+','+y,isPath=pathSet.has(key),cob=isPath||near.has(key);
  const id=g.createImageData(TW*2,TH*2);
  for(let py=0;py<TH*2;py++)for(let px=0;px<TW*2;px++){
   const dx=Math.abs(px+0.5-TW)/(TW),dy=Math.abs(py+0.5-TH)/(TH);if(dx+dy>1)continue;
   let c;const n=r();
   if(cob){const sx=Math.floor((px+py*2)/7),sy=Math.floor((px-py*2+140)/7);const seam=((px+py*2)%7==0)||((px-py*2+140)%7==0);
     const v=((sx*7+sy*13+x*3+y*5)%5)*6;c=seam?[150,140,124]:[196+v-n*10,186+v-n*10,166+v-n*8];}
   else{const v=n<0.08?22:n<0.2?-12:0;const fl=n>0.995;c=fl?[255,240,246]:[118+v+((x+y)%2)*4,170+v,92+v*0.6];
     if(n>0.985&&!fl)c=[150,196,108];}
   const i=(py*TW*2+px)*4;id.data[i]=c[0];id.data[i+1]=c[1];id.data[i+2]=c[2];id.data[i+3]=255;}
  const tmp=mk(TW*2,TH*2);tmp.getContext('2d').putImageData(id,0,0);g.drawImage(tmp,X-TW/2,Y,TW,TH);
 }
 groundDirty=false;
}
// ===== 오브젝트 =====
const occ=()=>{const m={};for(const o of S.objs){const f=DEF[o.k].fp;for(let i=0;i<f;i++)for(let j=0;j<f;j++)m[(o.x+i)+','+(o.y+j)]=o}return m};
let OCC={};
function canPlace(k,x,y){const f=DEF[k].fp;for(let i=0;i<f;i++)for(let j=0;j<f;j++){if(!tileOpen(x+i,y+j)||OCC[(x+i)+','+(y+j)])return false}return true}
function stars(){let s=S.rep*0.6;for(const o of S.objs){const d=DEF[o.k];s+=(d.appeal||0)*o.lv*0.5+(d.beauty||0)*0.4}s+=Object.keys(S.plots).length*6;
 return s>260?5:s>170?4:s>105?3:s>60?2:1}
function beautyAt(x,y){let b=0;for(const o of S.objs){const d=DEF[o.k];if(!d.beauty)continue;const dd=Math.hypot(o.x-x,o.y-y);if(dd<4)b+=d.beauty*(1-dd/4)}return b}
// ===== 시간/조명 =====
const hour=()=>(S.min/60)%24,dayN=()=>Math.floor(S.min/1440)+1,season=()=>Math.floor((dayN()-1)/7)%4;
const KEYS=[ // h, 하늘, 주변광(곱), 밝기, 따뜻함
 [0,'#1c2546',[92,102,160],0.0],[5,'#3a3f6e',[110,105,160],0.1],[6.5,'#f3b8a0',[230,190,180],0.55],[8.5,'#bfe3f0',[255,248,236],0.95],
 [12,'#cfeefa',[255,255,252],1],[16,'#f6e2b8',[255,240,218],0.9],[18,'#f29c7a',[250,200,178],0.6],[19.3,'#5b4a7e',[130,115,170],0.2],[21,'#1f2a50',[96,106,165],0.02],[24,'#1c2546',[92,102,160],0]];
function lerp(a,b,t){return a+(b-a)*t}
function hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function light(){const h=hour();let i=0;while(KEYS[i+1][0]<=h)i++;const a=KEYS[i],b=KEYS[i+1],t=(h-a[0])/(b[0]-a[0]);
 const sa=hex(a[1]),sb=hex(b[1]);return{sky:sa.map((v,j)=>Math.round(lerp(v,sb[j],t))),amb:a[2].map((v,j)=>Math.round(lerp(v,b[2][j],t))),sun:lerp(a[3],b[3],t),night:1-lerp(a[3],b[3],t)}}
function sunVec(){const h=hour();const t=(h-6)/12;const el=Math.max(0.12,Math.sin(Math.PI*Math.min(1,Math.max(0,t))));const L=Math.min(2.6,0.45/el);
 return{kx:-Math.cos(Math.PI*Math.min(1,Math.max(0,t)))*L*0.9,ky:0.28+L*0.12,left:t<0.5}}
// ===== 손님 =====
let guests=[],parts=[],floats=[],bubbles=[];
const THOUGHT={
 good:['물이 정말 좋아~','몸이 사르르 녹아요','유자 향이 좋네','여기 최고예요!','벚꽃이 예뻐요','또 올게요~'],
 pricey:['너무 비싸요…','가격이 좀…','지갑이 울어요'],
 none:{fatigue:'쉴 곳이 없네…',hunger:'뭐 먹을 데 없나…',thirst:'목말라요…',fun:'좀 심심하다'},
 want:{fatigue:'온천 하고 싶다',hunger:'배고파요',thirst:'우유 마시고 싶다',fun:'구경하고 싶어요'}};
function entrance(){let best=null;for(const k in S.plots){const[px,py]=k.split(',').map(Number);if(!best||px+py>best[0]+best[1])best=[px,py]}return[best[0]*PS+PS/2,best[1]*PS+PS+0.3]}
function spawnRate(){const h=hour();const f=h<6?0.05:h<9?0.5:h<12?0.7:h<15?0.6:h<17?0.8:h<21?1.15:h<23?0.5:0.15;return f*(0.12+stars()*0.06)}
function spawn(){const[ex,ey]=entrance();const vip=Math.random()<0.1*stars();
 guests.push({x:ex+(Math.random()-0.5)*2,y:ey,tx:ex,ty:ey-1,st:'walk',spr:'cw'+(1+(Math.random()*4|0)),cb:'cb'+(1+(Math.random()*4|0)),
  need:{fatigue:50+Math.random()*45,hunger:20+Math.random()*60,thirst:20+Math.random()*60,fun:20+Math.random()*50},
  budget:Math.round((2500+Math.random()*5000)*(vip?2.2:1)),happy:60,t:0,target:null,life:0,dir:1,bob:Math.random()*6,fade:0})}
function pickTarget(g){
 const h=hour();
 if((h>=20||h<5)&&g.budget>2000){const r=S.objs.filter(o=>DEF[o.k].stay&&(o.users||0)<DEF[o.k].cap+o.lv-1);if(r.length)return pickBy(g,r,'fatigue')}
 const order=NEEDK.slice().sort((a,b)=>g.need[b]-g.need[a]);
 for(const nk of order){if(g.need[nk]<30)break;
  const c=S.objs.filter(o=>{const d=DEF[o.k];return d.eff&&!d.stay&&(d.eff[nk]<0||(nk=='fun'&&(d.fun||d.eff.fun>15)))&&!g.used?.includes(o)});
  if(!c.length){think(g,THOUGHT.none[nk]);g.happy-=6;g.need[nk]-=15;continue}
  return pickBy(g,c,nk)}
 return null}
function pickBy(g,list,nk){list.sort((a,b)=>(dist(g,a)+a.price/300)-(dist(g,b)+b.price/300));const o=list[0];
 if(Math.random()<0.25)think(g,THOUGHT.want[nk]||'');return o}
const ctr=o=>{const f=DEF[o.k].fp;return[o.x+f/2,o.y+f/2]};
const dist=(g,o)=>{const[a,b]=ctr(o);return Math.hypot(a-g.x,b-g.y)};
function think(g,t){if(!t)return;bubbles=bubbles.filter(b=>b.g!==g);if(bubbles.length>=4)return;bubbles.push({g,t,l:3.2})}
function door(o){const f=DEF[o.k].fp;return[o.x+f/2,o.y+f+0.25]}
function bathSlot(o,i){const f=DEF[o.k].fp,c=ctr(o),n=DEF[o.k].cap+o.lv-1;const a=(i/n)*Math.PI*2+0.6;const r=f*0.24;return[c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r]}
function updGuest(g,dt){
 g.life+=dt;g.fade=Math.min(1,g.fade+dt*2);for(const k of NEEDK)g.need[k]=Math.min(100,g.need[k]+dt*(k=='fatigue'?0.2:0.9));
 g.happy=Math.max(0,Math.min(100,g.happy+(beautyAt(g.x,g.y)*0.02-0.03)*dt));
 if(g.st=='walk'){const dx=g.tx-g.x,dy=g.ty-g.y,d=Math.hypot(dx,dy);
  if(d>0.05){const sp=1.3*dt;g.x+=dx/d*Math.min(sp,d);g.y+=dy/d*Math.min(sp,d);g.dir=(dx-dy)>=0?1:-1;return}
  if(g.target){arrive(g);return}
  if(g.leaving){g.dead=1;return}
  decide(g)}
 else if(g.st=='use'){g.t-=dt;if(g.t<=0)finish(g)}
}
function decide(g){
 if(g.life>220||g.budget<200||g.happy<15){leave(g);return}
 const o=pickTarget(g);if(!o){if(NEEDK.every(k=>g.need[k]<35)||Math.random()<0.4){leave(g);return}
  const[ex,ey]=entrance();g.tx=ex+(Math.random()-0.5)*4;g.ty=ey-1-Math.random()*3;if(!tileOpen(g.tx|0,g.ty|0)){g.tx=ex;g.ty=ey-1}return}
 g.target=o;const[a,b]=door(o);g.tx=a;g.ty=b;}
function arrive(g){const o=g.target,d=DEF[o.k];g.target=null;o.users=o.users||0;
 if(!S.objs.includes(o)){decide(g);return}
 const cap=d.cap+o.lv-1;if(o.users>=cap){think(g,'자리가 없네…');g.happy-=4;(g.used=g.used||[]).push(o);return}
 const fair=d.price*(1+o.lv*0.12)*(0.8+g.happy/150);
 if(o.price>g.budget||o.price>fair*1.45){think(g,THOUGHT.pricey[Math.random()*3|0]);g.happy-=10;(g.used=g.used||[]).push(o);return}
 g.budget-=o.price;S.yen+=o.price;S.fin.inc+=o.price;o.earn=(o.earn||0)+o.price;o.uses=(o.uses||0)+1;S.served++;
 const[sx,sy]=toScreenT(...ctr(o));floats.push({x:ctr(o)[0],y:ctr(o)[1],t:'+¥'+fmt(o.price),l:1.6});
 o.users++;g.cur=o;g.st='use';g.t=d.stay?Math.max(30,((30-hour()+24)%24+7)*60/120):d.dur*(1+o.lv*0.1);
 if(d.bath){g.slot=freeSlot(o);const[a,b]=bathSlot(o,g.slot);g.x=a;g.y=b;g.inBath=true}else g.hide=true;
 const bonus=o.price<fair*0.9?8:o.price<fair*1.15?3:-3;g.happy+=bonus+o.lv*2;
 for(const k in d.eff)if(g.need[k]!=null)g.need[k]=Math.max(0,g.need[k]+d.eff[k]*(1+o.lv*0.1));
 if(d.joy)g.happy+=d.joy*0.3;if(d.bath&&Math.random()<0.6)setTimeout(()=>think(g,THOUGHT.good[Math.random()*6|0]),1500);}
function freeSlot(o){const used=guests.filter(x=>x.cur===o&&x.inBath).map(x=>x.slot);for(let i=0;i<20;i++)if(!used.includes(i))return i;return 0}
function finish(g){const o=g.cur;if(o)o.users=Math.max(0,o.users-1);(g.used=g.used||[]).push(o);if(g.used.length>3)g.used.shift();
 g.cur=null;g.hide=false;if(g.inBath){const[a,b]=door(o);g.x=a;g.y=b;g.inBath=false}g.st='walk';g.tx=g.x;g.ty=g.y}
function leave(g){g.leaving=true;g.target=null;const[ex,ey]=entrance();g.tx=ex+(Math.random()-0.5)*2;g.ty=ey+1.2;
 S.rep=S.rep*0.97+g.happy*0.03;if(g.happy>70&&Math.random()<0.5)think(g,'또 올게요~');}
const toScreenT=(x,y)=>{const[a,b]=iso(x,y);return toScreen(a,b)};
// ===== 파티클 =====
function emit(dt){
 for(const o of S.objs){const d=DEF[o.k];const[cx_,cy_]=ctr(o);
  if(d.bath&&Math.random()<dt*(4+DEF[o.k].fp)){const a=Math.random()*6.28,r=Math.random()*d.fp*0.3;parts.push({k:'steam',x:cx_+Math.cos(a)*r,y:cy_+Math.sin(a)*r,h:0,vx:(Math.random()-0.5)*0.1,l:3+Math.random()*2,L:5,s:3+Math.random()*4})}
  if(o.k=='sauna'&&Math.random()<dt*1.5)parts.push({k:'steam',x:o.x+1.6,y:o.y+0.4,h:40,vx:0.05,l:3,L:3,s:3});
  if(d.emit&&Math.random()<dt*2.2){parts.push({k:d.emit,x:o.x+0.5+(Math.random()-0.5)*4,y:o.y+0.5+(Math.random()-0.5)*4,h:30+Math.random()*25,vx:0,l:6,L:6,ph:Math.random()*6})}}
 if(season()==3&&Math.random()<dt*6){const r=rng(Date.now()|0);parts.push({k:'snow',x:Math.random()*N,y:Math.random()*N,h:60,l:8,L:8,ph:Math.random()*6})}
}
function updParts(dt){for(const p of parts){p.l-=dt;if(p.k=='steam'){p.h+=dt*9;p.x+=p.vx*dt;p.s+=dt*2.5}else{if(p.h>0){p.h-=dt*(p.k=='snow'?6:8);p.ph+=dt*2;p.x+=Math.sin(p.ph)*dt*0.25+dt*0.12}else{p.h=0;p.l=Math.min(p.l,1.5)}}}
 parts=parts.filter(p=>p.l>0);floats.forEach(f=>f.l-=dt);floats=floats.filter(f=>f.l>0);bubbles.forEach(b=>b.l-=dt);bubbles=bubbles.filter(b=>b.l>0&&!b.g.dead&&!b.g.hide);
 for(const k in anims){anims[k].t+=dt;if(anims[k].t>1.6)delete anims[k]}}
// ===== 렌더 =====
let ghost=null,hoverT=null,mode=null;
function drawSprite(key,o,X,Y,W,lt,sv,alpha){ // X,Y: 바닥 중앙(월드), W: 폭(월드)
 const v=VAR[key];if(!v)return;const h=W*v.base.height/v.base.width;
 cx.globalAlpha=alpha??1;cx.drawImage(v.base,X-W/2,Y-h,W,h);
 if(lt.sun>0.15){cx.globalAlpha=(alpha??1)*lt.sun*0.55;cx.drawImage(sv.left?v.rimL:v.rimR,X-W/2,Y-h,W,h)}
 cx.globalAlpha=1;return h}
function drawShadow(key,X,Y,W,lt,sv,str){const v=VAR[key];if(!v||lt.sun<0.1)return;const h=W*v.base.height/v.base.width;
 cx.save();cx.globalAlpha=0.28*lt.sun*(str||1);cx.translate(X,Y);cx.transform(1,0,-sv.kx,sv.ky,0,0);cx.drawImage(v.sil,-W/2,-h,W,h);cx.restore()}
function ao(X,Y,rx,ry,a){const g=cx.createRadialGradient(X,Y,0,X,Y,rx);g.addColorStop(0,`rgba(40,30,20,${a})`);g.addColorStop(1,'rgba(40,30,20,0)');cx.save();cx.translate(X,Y);cx.scale(1,ry/rx);cx.translate(-X,-Y);cx.fillStyle=g;cx.fillRect(X-rx,Y-rx,rx*2,rx*2);cx.restore()}
function objGeom(o){const d=DEF[o.k],f=d.fp;const[cX,cY]=iso(o.x+f/2,o.y+f/2);const sY=iso(o.x+f,o.y+f)[1];return{X:cX,Y:sY-f*1.2,cY,W:f*TW*(d.sc||1)}}
function render(t){
 const lt=light(),sv=sunVec(),z=cam.z;
 cx.setTransform(DPR,0,0,DPR,0,0);cx.imageSmoothingEnabled=false;
 const sg=cx.createLinearGradient(0,0,0,VH);const sk=lt.sky;sg.addColorStop(0,`rgb(${sk})`);sg.addColorStop(1,`rgb(${sk.map(v=>Math.min(255,v+25))})`);cx.fillStyle=sg;cx.fillRect(0,0,VW,VH);
 // 원경 숲
 cx.setTransform(DPR*z,0,0,DPR*z,DPR*cam.x,DPR*cam.y);
 if(groundDirty)buildGround();
 drawForest(lt);
 cx.drawImage(ground,-N*TW/2-4,0,ground.width/2,ground.height/2);
 // 잠긴 구역
 drawPlots(t,lt);
 // 그림자 + 오브젝트 + 손님 정렬
 const list=[];
 for(const o of S.objs){if(o.k=='path')continue;const d=DEF[o.k];list.push({z:o.x+o.y+d.fp*2-1,o})}
 for(const g of guests)if(!g.hide)list.push({z:g.inBath?g.cur.x+g.cur.y+DEF[g.cur.k].fp*2-1+0.01+g.y*0.001:g.x+g.y+0.2,g});
 list.sort((a,b)=>a.z-b.z);
 for(const it of list)if(it.o){const o=it.o,G=objGeom(o),key=o.k;ao(G.X,G.cY+DEF[o.k].fp*3,G.W*0.55,G.W*0.28,0.35);drawShadow(key,G.X,G.Y,G.W,lt,sv,DEF[o.k].bath?0.4:1)}
 for(const it of list){
  if(it.o){const o=it.o,d=DEF[o.k],G=objGeom(o);const an=anims['o'+S.objs.indexOf(o)];const pop=an?Math.min(1,an.t*3):1;
   const Wp=G.W*(0.7+0.3*easeOut(pop));drawSprite(o.k,o,G.X,G.Y,Wp,lt,sv,pop);
   if(d.bath)drawWater(o,G,t,lt);
   if(o.lv>1){for(let i=0;i<o.lv-1;i++){cx.fillStyle='#f6cf5a';cx.fillRect(G.X-8+i*4,G.Y+1,3,3)}}}
  else drawGuest(it.g,t,lt,sv);}
 // 파티클
 for(const p of parts){const[X,Y]=iso(p.x,p.y);const a=Math.min(1,p.l/p.L*2)*(p.k=='steam'?1:1);
  if(p.k=='steam'){cx.globalAlpha=0.22*Math.min(1,p.l)*(1-0.4*lt.night);const r=p.s;const g=cx.createRadialGradient(X,Y-p.h,0,X,Y-p.h,r);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=g;cx.fillRect(X-r,Y-p.h-r,r*2,r*2)}
  else{cx.globalAlpha=Math.min(1,p.l);cx.fillStyle=p.k=='petal'?'#ffc6d9':p.k=='leaf'?(p.ph%2<1?'#e8643a':'#f0a03a'):'#ffffff';const w=p.k=='snow'?1:Math.abs(Math.sin(p.ph))*1.5+0.6;cx.fillRect(X,Y-p.h,w,1)}}
 cx.globalAlpha=1;
 // 빛줄기 (낮) – 김 사이로
 if(lt.sun>0.2){cx.save();cx.globalCompositeOperation='screen';for(const o of S.objs){if(!DEF[o.k].bath)continue;const G=objGeom(o);
   for(let i=0;i<3;i++){const ox=G.X-G.W*0.35+i*G.W*0.3+Math.sin(t/3000+i)*4;const a=(0.07+0.04*Math.sin(t/1700+i*2))*lt.sun;
    const gr=cx.createLinearGradient(ox-40,G.cY-90,ox,G.cY);gr.addColorStop(0,'rgba(255,246,214,0)');gr.addColorStop(0.6,`rgba(255,246,214,${a})`);gr.addColorStop(1,'rgba(255,246,214,0)');
    cx.fillStyle=gr;cx.beginPath();cx.moveTo(ox-50+sv.kx*10,G.cY-100);cx.lineTo(ox-38+sv.kx*10,G.cY-100);cx.lineTo(ox+8,G.cY+4);cx.lineTo(ox-4,G.cY+4);cx.fill()}}cx.restore()}
 // 고스트
 if(ghost&&hoverT){const ok=canPlace(ghost,hoverT[0],hoverT[1]);const f=DEF[ghost].fp;cx.fillStyle=ok?'rgba(140,230,140,0.45)':'rgba(240,110,100,0.45)';
  for(let i=0;i<f;i++)for(let j=0;j<f;j++){const[X,Y]=iso(hoverT[0]+i,hoverT[1]+j);cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+16,Y+8);cx.lineTo(X,Y+16);cx.lineTo(X-16,Y+8);cx.fill()}
  if(DEF[ghost].img){const o={k:ghost,x:hoverT[0],y:hoverT[1]};const G=objGeom(o);drawSprite(ghost,o,G.X,G.Y,G.W,lt,sv,0.65)}}
 // 조명: 주변광 곱하기
 cx.setTransform(DPR,0,0,DPR,0,0);cx.globalCompositeOperation='multiply';cx.fillStyle=`rgb(${lt.amb})`;cx.fillRect(0,0,VW,VH);
 // 따뜻한 햇살 그라디언트
 cx.globalCompositeOperation='screen';if(lt.sun>0.1){const g=cx.createRadialGradient(sv.left?VW*0.1:VW*0.9,-VH*0.2,0,sv.left?VW*0.1:VW*0.9,-VH*0.2,VH*1.3);g.addColorStop(0,`rgba(255,236,190,${0.32*lt.sun})`);g.addColorStop(1,'rgba(255,236,190,0)');cx.fillStyle=g;cx.fillRect(0,0,VW,VH)}
 // 점광원 (밤)
 if(lt.night>0.25){cx.globalCompositeOperation='lighter';const k=Math.min(1,(lt.night-0.25)*1.6);
  for(const o of S.objs){const d=DEF[o.k];if(!d.light)continue;const G=objGeom(o);const hgt=G.W*VAR[o.k].base.height/VAR[o.k].base.width;
   for(const[lx,ly]of d.light){const[X,Y]=toScreen(G.X+lx*G.W,G.Y+ly*hgt);const fl=0.9+0.1*Math.sin(t/180+lx*20);
    glow(X,Y,14*z,`rgba(255,214,140,${0.55*k*fl})`);glow(X,Y,4*z,`rgba(255,240,200,${0.8*k})`);
    const[gx,gy]=toScreen(G.X+lx*G.W,G.Y+2);cx.save();cx.translate(gx,gy);cx.scale(1,0.5);glow(0,0,30*z,`rgba(255,180,100,${0.22*k*fl})`);cx.restore()}}}
 cx.globalCompositeOperation='source-over';
 drawText(t,lt);
}
const easeOut=t=>1-Math.pow(1-t,3);
function glow(X,Y,r,c){const g=cx.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(X-r,Y-r,r*2,r*2)}
function drawForest(lt){const r=rng(42);for(let i=0;i<70;i++){const side=i%2;const k=r()*N;const x=side?-1.5-r()*3:k,y=side?k:-1.5-r()*3;const[X,Y]=iso(x,y);
  cx.fillStyle=`rgb(${60+r()*20|0},${104+r()*25|0},${70+r()*15|0})`;const h=18+r()*18;cx.beginPath();cx.moveTo(X,Y-h);cx.lineTo(X+9,Y);cx.lineTo(X-9,Y);cx.fill();
  cx.fillStyle='rgba(255,255,255,0.08)';cx.beginPath();cx.moveTo(X,Y-h);cx.lineTo(X-9,Y);cx.lineTo(X-3,Y);cx.fill()}}
function drawWater(o,G,t,lt){const d=DEF[o.k],f=d.fp;const[cX,cY]=iso(o.x+f/2,o.y+f/2);const rx=f*TW*0.27,ry=f*TH*0.27;
 cx.save();cx.beginPath();cx.ellipse(cX,cY-1,rx,ry,0,0,6.283);cx.clip();
 // 반짝이는 하이라이트 띠
 cx.globalCompositeOperation='screen';for(let i=0;i<4;i++){const y=cY-ry+((t/90+i*ry*0.6)%(ry*2.4));cx.fillStyle=`rgba(255,255,255,${0.10+0.08*lt.sun})`;cx.fillRect(cX-rx,y,rx*2,0.6)}
 // 하늘 반사
 const sk=lt.sky;cx.fillStyle=`rgba(${sk},${0.18})`;cx.fillRect(cX-rx,cY-ry,rx*2,ry);
 // 스펙큘러
 const r=rng(Math.floor(t/220)+o.x*31);for(let i=0;i<10;i++){const a=r()*6.28,rr=Math.sqrt(r());cx.fillStyle=`rgba(255,255,240,${0.5+0.5*lt.sun})`;cx.fillRect(cX+Math.cos(a)*rx*rr,cY+Math.sin(a)*ry*rr,1,0.6)}
 if(lt.night>0.4){cx.fillStyle=`rgba(255,200,120,${0.12*lt.night})`;cx.fillRect(cX-rx,cY-ry,rx*2,ry*2)}
 cx.restore();}
function drawGuest(g,t,lt,sv){const[X,Y]=iso(g.x,g.y);
 if(g.inBath){const v=VAR[g.cb];if(!v)return;const W=17,h=W*v.base.height/v.base.width,bob=Math.sin(t/600+g.bob)*0.4,ch=h*0.8;
  cx.drawImage(v.base,0,0,v.base.width,v.base.height*0.8,X-W/2,Y-ch+2+bob,W,ch);
  cx.fillStyle='rgba(180,240,240,0.55)';cx.beginPath();cx.ellipse(X,Y+2+bob,W*0.55,1.6,0,0,6.283);cx.fill();
  if(g.slot%3==1){const yx=X+W*0.7,yy=Y+2+Math.sin(t/700+g.bob)*0.6;cx.fillStyle='#f6c431';cx.beginPath();cx.arc(yx,yy,1.6,0,6.283);cx.fill();cx.fillStyle='#fff3a0';cx.fillRect(yx-0.8,yy-1,0.8,0.6)}
  return}
 const v=VAR[g.spr];if(!v)return;const W=14,h=W*v.base.height/v.base.width;const moving=Math.hypot(g.tx-g.x,g.ty-g.y)>0.05;const bob=moving?Math.abs(Math.sin(t/120+g.bob))*1.2:0;
 cx.globalAlpha=g.fade;ao(X,Y,5,2.2,0.35);
 if(lt.sun>0.1){cx.save();cx.globalAlpha=0.25*lt.sun*g.fade;cx.translate(X,Y);cx.transform(1,0,-sv.kx,sv.ky,0,0);cx.drawImage(v.sil,-W/2,-h,W,h);cx.restore()}
 cx.globalAlpha=g.fade;cx.save();cx.translate(X,Y-bob);cx.scale(g.dir,1);cx.drawImage(v.base,-W/2,-h,W,h);if(lt.sun>0.15){cx.globalAlpha=0.45*lt.sun*g.fade;cx.drawImage(sv.left?v.rimL:v.rimR,-W/2,-h,W,h)}cx.restore();cx.globalAlpha=1}
// 잠긴 구역: 안개, 로프 울타리, 가격 표지판
function drawPlots(t,lt){const P=N/PS;window._signs=[];
 for(let py=0;py<P;py++)for(let px=0;px<P;px++){const k=px+','+py,open=plotOpen(px,py);const an=anims['p'+k];
  let fog=open?0:1;if(an)fog=1-easeOut(Math.min(1,an.t));if(fog<=0)continue;
  const x0=px*PS,y0=py*PS;const c=[iso(x0,y0),iso(x0+PS,y0),iso(x0+PS,y0+PS),iso(x0,y0+PS)];
  cx.beginPath();cx.moveTo(...c[0]);c.slice(1).forEach(p=>cx.lineTo(...p));cx.closePath();
  cx.save();cx.clip();cx.fillStyle=`rgba(200,214,206,${0.42*fog})`;cx.fill();cx.fillStyle=`rgba(70,90,90,${0.12*fog})`;cx.fill();
  // 안개 덩어리
  const r=rng(px*7+py*13+3);for(let i=0;i<5;i++){const fx=x0+r()*PS,fy=y0+r()*PS;const[X,Y]=iso(fx,fy);const s=10+r()*10;const g=cx.createRadialGradient(X+Math.sin(t/4000+i)*6,Y,0,X,Y,s);g.addColorStop(0,`rgba(255,255,255,${0.22*fog})`);g.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=g;cx.fillRect(X-s,Y-s,s*2,s*2)}cx.restore();
  if(!open&&plotAdj(px,py)){ // 로프 울타리
   cx.strokeStyle='#c9a46a';cx.lineWidth=0.7;for(let e=0;e<4;e++){const a=c[e],b=c[(e+1)%4];
    for(let s=0;s<=6;s++){const X=lerp(a[0],b[0],s/6),Y=lerp(a[1],b[1],s/6);cx.fillStyle='#7a5432';cx.fillRect(X-0.8,Y-6,1.6,6);cx.fillStyle='#a07448';cx.fillRect(X-0.8,Y-6,0.8,6)}
    cx.beginPath();for(let s=0;s<6;s++){const X1=lerp(a[0],b[0],s/6),Y1=lerp(a[1],b[1],s/6),X2=lerp(a[0],b[0],(s+1)/6),Y2=lerp(a[1],b[1],(s+1)/6);cx.moveTo(X1,Y1-5);cx.quadraticCurveTo((X1+X2)/2,(Y1+Y2)/2-3,X2,Y2-5)}cx.stroke()}
   const[sX,sY]=iso(x0+PS/2,y0+PS/2);cx.fillStyle='#6b4a2b';cx.fillRect(sX-1,sY-10,2,10);
   window._signs.push({px,py,X:sX,Y:sY-16,price:plotPrice(px,py)})}}}
function drawText(t,lt){ // 고해상도 텍스트 레이어
 tx.setTransform(DPR,0,0,DPR,0,0);tx.clearRect(0,0,VW,VH);tx.textAlign='center';tx.textBaseline='middle';
 for(const s of window._signs||[]){const[X,Y]=toScreen(s.X,s.Y);const fs=Math.max(9,Math.min(15,3.2*cam.z));tx.font=`700 ${fs}px Pretendard`;const t_='🔒 ¥'+fmt(s.price);const w=tx.measureText(t_).width+18;tx.fillStyle='#f3e0b6';tx.strokeStyle='#7a5432';tx.lineWidth=2;rr(tx,X-w/2,Y-fs,w,fs*2,6);tx.fill();tx.stroke();tx.fillStyle='#5b3e22';tx.fillText(t_,X,Y+1);}
 for(const f of floats){const[X,Y]=toScreenT(f.x,f.y);const a=Math.min(1,f.l);tx.globalAlpha=a;tx.font='800 15px Pretendard';tx.lineWidth=3;tx.strokeStyle='#6b4310';const yy=Y-40-(1.6-f.l)*30;tx.strokeText(f.t,X,yy);tx.fillStyle='#ffd65a';tx.fillText(f.t,X,yy)}
 tx.globalAlpha=1;
 for(const b of bubbles){const g=b.g;const[X0,Y0]=toScreenT(g.x,g.y);const Y=Y0-(g.inBath?14:26)*cam.z-8;tx.font='600 13px Pretendard';const w=tx.measureText(b.t).width+16;
  tx.globalAlpha=Math.min(1,b.l*2);tx.fillStyle='rgba(255,252,244,0.96)';tx.strokeStyle='#b89366';tx.lineWidth=1.5;rr(tx,X0-w/2,Y-13,w,24,10);tx.fill();tx.stroke();
  tx.beginPath();tx.moveTo(X0-4,Y+11);tx.lineTo(X0,Y+17);tx.lineTo(X0+4,Y+11);tx.fill();tx.fillStyle='#4a3320';tx.fillText(b.t,X0,Y);tx.globalAlpha=1}}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
// ===== UI =====
let tab='bath',speed=1;
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(t.h);t.h=setTimeout(()=>t.style.display='none',2600)}
function buildTabs(){$('tabs').innerHTML=TABS.map(([k,i,n])=>`<div class="tab ${k==tab?'on':''}" data-k="${k}"><span class="ic">${i}</span>${n}</div>`).join('');
 document.querySelectorAll('.tab').forEach(e=>e.onclick=()=>{tab=e.dataset.k;buildTabs();buildCards();$('tip').textContent=TIPS[tab]});buildCards()}
function buildCards(){const st=stars();$('cards').innerHTML=Object.entries(DEF).filter(([k,d])=>d.tab==tab).map(([k,d])=>`<div class="card ${ghost==k?'sel':''} ${d.star>st?'lock':''}" data-k="${k}" data-need="${d.star}★ 필요" title="${d.desc}">
 ${d.img?`<img src="assets/${d.img}.png" style="${d.filter?'filter:'+d.filter:''}">`:'<div style="height:56px;display:flex;align-items:center;justify-content:center;font-size:30px">🪨</div>'}<b>${d.n}</b><span class="p">¥${fmt(d.cost)}</span></div>`).join('');
 document.querySelectorAll('.card').forEach(e=>e.onclick=()=>{const k=e.dataset.k;if(DEF[k].star>stars())return toast(`료칸 등급 ${DEF[k].star}★ 에서 해금돼요`);ghost=ghost==k?null:k;mode=null;$('tDel').classList.remove('on');buildCards();if(ghost)toast('놓을 곳을 눌러주세요 (Esc 취소)')})}
let lastStars=0;
function hud(){const lt=light();$('yen').textContent=fmt(S.yen);const n=S.fin.hist.length?avgNet():(S.fin._h||0);$('ihr').textContent=(n>=0?'+':'')+fmt(n)+' ¥/시';
 const h=hour(),m=Math.floor(S.min%60);$('time').textContent=`${h<12?'오전':'오후'} ${String(Math.floor(h%12)||12).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
 $('sun').textContent=h>=6&&h<18?(h>=16.5?'🌇':'☀️'):'🌙';$('dayn').textContent='Day '+dayN();$('season').textContent=SEASONS[season()]+' '+SEMO[season()];
 $('temp').textContent=`· ${STEMP[season()]+Math.round(Math.sin((h-9)/24*6.28)*4)}°C · 손님 ${guests.length}명`;
 const s=stars();$('stars').innerHTML='★'.repeat(s)+'<span style="color:#cdbb9c">'+'★'.repeat(5-s)+'</span>';if(s!=lastStars){if(lastStars&&s>lastStars)toast(`🎉 료칸 등급 ${s}★ 달성! 새 시설이 해금됐어요`);lastStars=s;buildCards()}
 if(document.activeElement!==$('zs'))$('zs').value=cam.z;}
function showInfo(o){const d=DEF[o.k];const el=$('info');el.style.display='block';const up=Math.round(d.cost*Math.pow(1.7,o.lv));
 const users=guests.filter(g=>g.cur===o).length;
 el.innerHTML=`<h3>${d.n} <small>Lv.${o.lv}</small></h3><div style="color:#7a5a3a;margin-bottom:6px">${d.desc}</div>`+
 (d.price?`<div class="row"><span>이용 요금</span><b>¥${fmt(o.price)}</b></div><div style="display:flex;gap:4px;margin:4px 0"><button class="b g" data-p="-0.1">−10%</button><button class="b g" data-p="0.1">+10%</button><button class="b g" data-p="0">기본</button></div>
  <div class="row"><span>이용 중</span><b>${users}/${d.cap+o.lv-1}</b></div><div class="row"><span>누적 이용</span><b>${o.uses||0}회</b></div><div class="row"><span>누적 매출</span><b>¥${fmt(o.earn||0)}</b></div><div class="row"><span>직원 급여</span><b>¥${fmt(d.wage*o.lv)}/시</b></div>
  <div style="font-size:12px;color:#7a5a3a;margin-top:4px">적정가 약 ¥${fmt(d.price*(1+o.lv*0.12))} · 너무 비싸면 손님이 돌아가요</div>`:`<div class="row"><span>아름다움</span><b>+${d.beauty}</b></div>`)+
 `<div style="margin-top:6px">${o.lv<5&&d.price?`<button class="b" id="iUp">업그레이드 ¥${fmt(up)}</button>`:''}<button class="b g" id="iDel">철거</button><button class="b g" id="iCl">닫기</button></div>`;
 el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const p=+b.dataset.p;o.price=p==0?d.price:Math.max(50,Math.round(o.price*(1+p)/10)*10);showInfo(o)});
 if($('iUp'))$('iUp').onclick=()=>{if(S.yen<up)return toast('엔이 부족해요');S.yen-=up;S.fin.exp+=up;o.lv++;anims['o'+S.objs.indexOf(o)]={t:0};toast(`${d.n} Lv.${o.lv}!`);showInfo(o);save()};
 $('iDel').onclick=()=>remove(o);$('iCl').onclick=()=>el.style.display='none';}
function remove(o){if(S.objs.length<=1)return;S.yen+=Math.floor(DEF[o.k].cost*0.4);guests.forEach(g=>{if(g.cur===o)finish(g);if(g.target===o)g.target=null});S.objs.splice(S.objs.indexOf(o),1);OCC=occ();groundDirty=true;$('info').style.display='none';save()}
function modalFin(){const m=$('modal');const wages=S.objs.reduce((s,o)=>s+(DEF[o.k].wage||0)*o.lv,0),up=S.objs.length*8;
 const rows=S.objs.filter(o=>DEF[o.k].price).sort((a,b)=>(b.earn||0)-(a.earn||0)).slice(0,8).map(o=>`<div class="row"><span>${DEF[o.k].n} Lv.${o.lv}</span><b>¥${fmt(o.earn||0)}</b></div>`).join('');
 m.innerHTML=`<h3>📊 재정</h3><div class="row"><span>보유 자금</span><b>¥${fmt(S.yen)}</b></div><div class="row"><span>평균 순이익</span><b>¥${fmt(avgNet())}/시</b></div><div class="row"><span>오늘 수입</span><b>¥${fmt(S.fin.inc)}</b></div><div class="row"><span>오늘 지출</span><b>¥${fmt(S.fin.exp)}</b></div>
 <div class="row"><span>직원 급여</span><b>¥${fmt(wages)}/시</b></div><div class="row"><span>시설 유지비</span><b>¥${fmt(up)}/시</b></div><h3 style="margin-top:10px">시설별 매출</h3>${rows}<div style="text-align:right"><button class="b" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;m.style.display='block'}
function modalGuest(){const m=$('modal');const n=guests.length||1;const avg=k=>guests.reduce((s,g)=>s+g.need[k],0)/n;const hp=guests.reduce((s,g)=>s+g.happy,0)/n;
 const bar=(l,v,c)=>`<div class="row" style="border:0"><span>${l}</span><b>${Math.round(v)}</b></div><div class="bar"><i style="width:${v}%;background:${c}"></i></div>`;
 m.innerHTML=`<h3>🦫 손님 & 만족도</h3><div class="row"><span>현재 손님</span><b>${guests.length}명</b></div><div class="row"><span>누적 이용</span><b>${fmt(S.served)}회</b></div>${bar('평판',S.rep,'#e0a92e')}${bar('현재 손님 기분',guests.length?hp:0,'#7fbf6a')}
 <h3 style="margin-top:8px">평균 욕구 (높을수록 필요)</h3>${NEEDK.map(k=>bar(NEEDN[k],guests.length?avg(k):0,'#d98a5a')).join('')}
 <div style="font-size:12px;color:#7a5a3a">팁: 욕구에 맞는 시설이 없으면 기분이 떨어져요. 장식 근처를 걸으면 기분이 좋아져요.</div><div style="text-align:right"><button class="b" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;m.style.display='block'}
// ===== 입력 =====
const ptrs=new Map();let drag=null,pinch=null;
function onTap(sx,sy){const[fx,fy]=toTile(sx,sy);const x=Math.floor(fx),y=Math.floor(fy);
 for(const s of window._signs||[]){const[X,Y]=toScreen(s.X,s.Y);if(Math.abs(sx-X)<16*cam.z/1.5+10&&Math.abs(sy-Y)<10*cam.z/1.5+8){unlock(s);return}}
 if(ghost){if(!canPlace(ghost,x,y))return toast(tileOpen(x,y)?'여기엔 지을 수 없어요':'잠긴 구역이에요. 표지판을 눌러 열어주세요');const d=DEF[ghost];if(S.yen<d.cost)return toast('엔이 부족해요');
  S.yen-=d.cost;S.fin.exp+=d.cost;S.objs.push({k:ghost,x,y,lv:1,price:d.price||0,uses:0,earn:0});anims['o'+(S.objs.length-1)]={t:0};OCC=occ();groundDirty=true;
  for(let i=0;i<10;i++)parts.push({k:'steam',x:x+d.fp/2+(Math.random()-0.5)*d.fp,y:y+d.fp/2+(Math.random()-0.5)*d.fp,h:0,vx:0,l:1,L:1,s:2});if(ghost=='path'){}else if(!ev.shift){ghost=null;buildCards()}save();return}
 const o=OCC[x+','+y];if(o){if(mode=='del'){remove(o);return}showInfo(o)}else $('info').style.display='none'}
function unlock(s){const k=s.px+','+s.py;if(S.yen<s.price)return toast(`구역 확장에 ¥${fmt(s.price)} 필요해요`);S.yen-=s.price;S.fin.exp+=s.price;S.plots[k]=1;anims['p'+k]={t:0};toast('🎉 새 구역이 열렸어요!');
 for(let i=0;i<40;i++)parts.push({k:'petal',x:s.px*PS+Math.random()*PS,y:s.py*PS+Math.random()*PS,h:20+Math.random()*30,l:3,L:3,ph:Math.random()*6});save()}
const ev={shift:false};
function initInput(){
 cv.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});ev.shift=e.shiftKey;if(ptrs.size==1)drag={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,m:false};else{const p=[...ptrs.values()];pinch={d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),z:cam.z};drag=null}});
 cv.addEventListener('pointermove',e=>{const[a,b]=toTile(e.clientX,e.clientY);hoverT=[Math.floor(a-(ghost?DEF[ghost].fp/2-0.5:0)),Math.floor(b-(ghost?DEF[ghost].fp/2-0.5:0))];if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&ptrs.size==2){const p=[...ptrs.values()];zoomAt((p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2,pinch.z*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/pinch.d);cam.tz=cam.z}
  else if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>6)drag.m=true;if(drag.m){cam.x=drag.cx+dx;cam.y=drag.cy+dy}}});
 cv.addEventListener('pointerup',e=>{if(drag&&!drag.m&&ptrs.size==1){if(ghost){const[a,b]=toTile(e.clientX,e.clientY);hoverT=[Math.floor(a-(DEF[ghost].fp/2-0.5)),Math.floor(b-(DEF[ghost].fp/2-0.5))];placeAt()}else onTap(e.clientX,e.clientY)}ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;drag=null});
 cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);drag=null;pinch=null});
 cv.addEventListener('wheel',e=>{e.preventDefault();zoomTarget=[e.clientX,e.clientY];cam.tz=Math.max(0.5,Math.min(8,cam.tz*(e.deltaY<0?1.15:1/1.15)))},{passive:false});
 cv.addEventListener('contextmenu',e=>{e.preventDefault();ghost=null;buildCards()});
 addEventListener('keydown',e=>{if(e.key=='Escape'){ghost=null;mode=null;$('tDel').classList.remove('on');$('info').style.display='none';$('modal').style.display='none';buildCards()}});
 $('zs').oninput=e=>{zoomTarget=null;cam.tz=+e.target.value};$('zIn').onclick=()=>{zoomTarget=null;cam.tz=Math.min(8,cam.tz*1.3)};$('zOut').onclick=()=>{zoomTarget=null;cam.tz=Math.max(0.5,cam.tz/1.3)};
 $('zHome').onclick=()=>{const b=S.objs.find(o=>DEF[o.k].bath)||S.objs[0];homeAnim={t:0,from:{...cam},to:b}};
 $('tFin').onclick=modalFin;$('tGuest').onclick=modalGuest;
 $('tDel').onclick=()=>{mode=mode=='del'?null:'del';ghost=null;$('tDel').classList.toggle('on',mode=='del');buildCards();if(mode)toast('철거할 시설을 눌러주세요 (40% 환불)')};
 $('bSpeed').onclick=()=>{speed=speed==1?3:speed==3?10:1;$('bSpeed').textContent='▶ x'+speed};
 $('bClose').onclick=()=>{$('build').classList.add('hide');$('build').style.display='none';$('bOpen').style.display='flex';$('tools').classList.add('low')};
 $('bOpen').onclick=()=>{$('build').classList.remove('hide');$('build').style.display='';$('bOpen').style.display='none';$('tools').classList.remove('low')};
}
function placeAt(){const[x,y]=hoverT;const[sx,sy]=toScreenT(x+0.5,y+0.5);onTapPlace(x,y)}
function onTapPlace(x,y){if(!canPlace(ghost,x,y))return toast(tileOpen(x,y)?'여기엔 지을 수 없어요':'잠긴 구역이에요. 표지판을 눌러 열어주세요');const d=DEF[ghost];if(S.yen<d.cost)return toast('엔이 부족해요');
 S.yen-=d.cost;S.fin.exp+=d.cost;S.objs.push({k:ghost,x,y,lv:1,price:d.price||0,uses:0,earn:0});anims['o'+(S.objs.length-1)]={t:0};OCC=occ();groundDirty=true;
 for(let i=0;i<10;i++)parts.push({k:'steam',x:x+d.fp/2+(Math.random()-0.5)*d.fp,y:y+d.fp/2+(Math.random()-0.5)*d.fp,h:0,vx:0,l:1,L:1,s:2});
 if(ghost!='path'&&!ev.shift){ghost=null;buildCards()}save()}
let zoomTarget=null,homeAnim=null;
// ===== 루프 =====
let last=0,acc=0,hourAcc=0,saveAcc=0;
function step(dt){
 const gm=dt*2; // 실시간 1초 = 게임 2분
 const prevH=Math.floor(S.min/60);S.min+=gm;const nowH=Math.floor(S.min/60);
 if(nowH!=prevH){const wages=S.objs.reduce((s,o)=>s+(DEF[o.k].wage||0)*o.lv,0)+S.objs.length*8;S.yen-=wages;S.fin.exp+=wages;
  S.fin.hist.push((S.fin._h||0)-wages);S.fin._h=0;if(S.fin.hist.length>48)S.fin.hist.shift();if(nowH%24==0){S.fin.inc=0;S.fin.exp=0}}
 const before=S.yen;
 if(Math.random()<dt*spawnRate()*3&&guests.length<12+stars()*8)spawn();
 for(const g of guests)updGuest(g,dt);guests=guests.filter(g=>!g.dead);
 emit(dt);updParts(dt);
 const earned=Math.max(0,S.yen-before);S.fin._h=(S.fin._h||0)+earned;
}
function frame(now){const dt=Math.min(0.1,(now-last)/1000||0);last=now;
 for(let i=0;i<speed;i++)step(dt);
 if(Math.abs(cam.tz-cam.z)>0.001){const z=cam.z+(cam.tz-cam.z)*Math.min(1,dt*10);const p=zoomTarget||[VW/2,VH/2];zoomAt(p[0],p[1],z)}
 if(homeAnim){homeAnim.t+=dt/0.9;const k=easeOut(Math.min(1,homeAnim.t));const f=homeAnim.to.k?DEF[homeAnim.to.k].fp:1;const save_=cam.z;
  const z=lerp(homeAnim.from.z,VW>820?5.2:3.6,k);cam.z=z;cam.tz=z;const[wx,wy]=iso(homeAnim.to.x+f/2,homeAnim.to.y+f/2);const tx_=VW*(VW>820?0.42:0.5)-wx*z,ty_=VH*(VW>820?0.5:0.33)-wy*z;
  cam.x=lerp(homeAnim.from.x,tx_,k);cam.y=lerp(homeAnim.from.y,ty_,k);if(homeAnim.t>=1)homeAnim=null}
 render(now);hud();saveAcc+=dt;if(saveAcc>5){saveAcc=0;save()}
 requestAnimationFrame(frame)}
async function boot(){resize();addEventListener('resize',resize);load();S.objs.forEach(o=>o.users=0);OCC=occ();
 await Promise.all([loadImgs(),document.fonts.load('700 14px Pretendard'),document.fonts.ready]);
 for(const n of NAMES)if(IMG[n])variants(n,IMG[n]);variants('milk',IMG.yuzu,DEF.milk.filter);
 // 기존 이름 매핑
 DEF.milk.img='milk';
 const b=S.objs.find(o=>DEF[o.k].bath)||S.objs[0];focus(b.x+DEF[b.k].fp/2,b.y+DEF[b.k].fp/2,VW>820?5.2:3.6);
 for(let i=0;i<5;i++)spawn();guests.forEach((g,i)=>{g.x-=i*0.3});
 buildTabs();initInput();window.__ready=true;requestAnimationFrame(t=>{last=t;frame(t)})}
// 시설 표시용 키 매핑 (milk는 yuzu 이미지에 필터)
const _drawSprite=drawSprite;
boot();
// 테스트 훅
window.__dbg={refresh(){OCC=occ();groundDirty=true},get S(){return S},setHour(h){S.min=Math.floor(S.min/1440)*1440+h*60},spawn,guests:()=>guests,focus,cam};
