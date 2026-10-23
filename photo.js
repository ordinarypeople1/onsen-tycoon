'use strict';
// ===== 사진 장식: 업로드 → 픽셀화(축소·팔레트 양자화·디더링) → 프레임 합성 → 저장 =====
const PHOTO=(()=>{
 const pics=()=>S.pics||(S.pics={});
 // 료칸 팔레트 (따뜻하고 절제된 24색)
 const ONSEN=['#2b2320','#4a3528','#6d4c35','#9a6a45','#c48f5f','#e8c49a','#f6e7cf','#fffaf0','#3d4f3a','#5f7a4a','#8fa868','#c9d49a','#2f5257','#3f7f86','#7fc4c4','#d7efe9','#7a2f2a','#b8483a','#e07a5a','#f2b8a0','#c99a2e','#f0c64a','#5a4a6a','#a090b8'].map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
 const SIZE={banner:[16,30],frame:[24,18],noren:[24,16],sign:[28,12]};
 function kmeans(px,k){const n=px.length/4;const C=[];for(let i=0;i<k;i++){const j=Math.floor((i+0.5)/k*n)*4;C.push([px[j],px[j+1],px[j+2]])}
  // 밝기순 초기화
  const idx=[...Array(n).keys()].filter(i=>px[i*4+3]>0).sort((a,b)=>(px[a*4]+px[a*4+1]+px[a*4+2])-(px[b*4]+px[b*4+1]+px[b*4+2]));for(let i=0;i<k;i++){const j=idx[Math.floor((i+0.5)/k*idx.length)]*4;C[i]=[px[j],px[j+1],px[j+2]]}
  for(let it=0;it<10;it++){const acc=C.map(()=>[0,0,0,0]);for(let i=0;i<n;i++){const r=px[i*4],g=px[i*4+1],b=px[i*4+2];let bi=0,bd=1e9;for(let c=0;c<k;c++){const d=(r-C[c][0])**2+(g-C[c][1])**2+(b-C[c][2])**2;if(d<bd){bd=d;bi=c}}const a=acc[bi];a[0]+=r;a[1]+=g;a[2]+=b;a[3]++}
   for(let c=0;c<k;c++)if(acc[c][3])C[c]=[acc[c][0]/acc[c][3],acc[c][1]/acc[c][3],acc[c][2]/acc[c][3]]}return C.map(c=>c.map(Math.round))}
 const near=(P,r,g,b)=>{let bi=0,bd=1e9;for(let c=0;c<P.length;c++){const d=(r-P[c][0])**2*0.3+(g-P[c][1])**2*0.59+(b-P[c][2])**2*0.11;if(d<bd){bd=d;bi=c}}return P[bi]};
 const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 function pixelize(img,w,h,opt){const c=mk(w,h),g=c.getContext('2d');const ar=w/h,ia=img.width/img.height;let sx=0,sy=0,sw=img.width,sh=img.height;if(ia>ar){sw=img.height*ar;sx=(img.width-sw)/2}else{sh=img.width/ar;sy=(img.height-sh)/2}
  // 2단계 축소(박스 근사)로 노이즈 억제
  const m2=mk(w*4,h*4),g2=m2.getContext('2d');g2.imageSmoothingQuality='high';g2.drawImage(img,sx,sy,sw,sh,0,0,w*4,h*4);g.imageSmoothingQuality='high';g.drawImage(m2,0,0,w,h);
  const id=g.getImageData(0,0,w,h),p=id.data;
  // 대비/채도 살짝 보정
  for(let i=0;i<p.length;i+=4){for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,(p[i+k]-128)*(1+opt.contrast)+128));const l=(p[i]+p[i+1]+p[i+2])/3;for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,l+(p[i+k]-l)*(1+opt.sat)))}
  let P=opt.pal=='onsen'?ONSEN:kmeans(p,opt.colors);if(opt.pal=='mix'){P=kmeans(p,opt.colors).map(c=>{const o=near(ONSEN,...c);return c.map((v,i)=>Math.round(v*0.5+o[i]*0.5))})}
  const err=new Float32Array(p.length);for(let i=0;i<p.length;i++)err[i]=p[i];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let r=err[i],gg=err[i+1],b=err[i+2];
   if(opt.dither=='bayer'){const t=(BAYER[(y%4)*4+x%4]/16-0.5)*opt.ds*64;r+=t;gg+=t;b+=t}
   const q=near(P,r,gg,b);p[i]=q[0];p[i+1]=q[1];p[i+2]=q[2];p[i+3]=255;
   if(opt.dither=='fs'){const er=[r-q[0],gg-q[1],b-q[2]].map(v=>v*opt.ds);const sp=(dx,dy,f)=>{const xx=x+dx,yy=y+dy;if(xx<0||xx>=w||yy>=h)return;const j=(yy*w+xx)*4;err[j]+=er[0]*f;err[j+1]+=er[1]*f;err[j+2]+=er[2]*f};sp(1,0,7/16);sp(-1,1,3/16);sp(0,1,5/16);sp(1,1,1/16)}}
  g.putImageData(id,0,0);return c}
 // ---- 프레임 합성 (픽셀 단위로 직접 그림) ----
 function compose(kind,pic){const P=(g,c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};let c,g;
  const W1='#3e2716',W2='#62402a',W3='#83583a',W4='#a0744c';
  if(kind=='banner'){c=mk(26,60);g=c.getContext('2d');P(g,W1,3,2,2,56);P(g,W3,3,2,1,56);P(g,'#d8b04a',2,0,4,2);P(g,W1,5,4,18,1);
   P(g,'#2b2320',6,5,18,32);g.drawImage(pic,7,6,16,30);P(g,'rgba(255,255,255,0.12)',7,6,1,30);P(g,'rgba(0,0,0,0.18)',22,6,1,30);
   for(let i=0;i<4;i++)P(g,'#f6e7cf',8+i*4,37,2,2);P(g,'#6d6a62',0,56,9,3);P(g,'#9a978c',1,56,7,1)}
  else if(kind=='frame'){c=mk(36,46);g=c.getContext('2d');P(g,W1,8,24,2,21);P(g,W1,26,24,2,21);P(g,W2,17,10,2,33);P(g,W3,8,24,1,21);P(g,W1,6,34,24,2);
   P(g,'#3a2416',4,2,28,24);P(g,W4,5,3,26,22);P(g,W2,6,4,24,20);P(g,'#2b2320',7,5,22,16);g.drawImage(pic,6,4,24,18);P(g,'rgba(255,255,255,0.18)',6,4,24,1);P(g,W4,5,3,26,1);P(g,'#c99a2e',16,1,4,2)}
  else if(kind=='noren'){c=mk(40,48);g=c.getContext('2d');P(g,W1,3,4,3,43);P(g,W1,34,4,3,43);P(g,W3,3,4,1,43);P(g,W3,34,4,1,43);P(g,'#3a2416',0,2,40,4);P(g,W4,0,2,40,1);
   for(let s=0;s<3;s++){g.drawImage(pic,s*8,0,7,16,8+s*8,7,7,24);P(g,'rgba(0,0,0,0.25)',8+s*8+7,7,1,24)}P(g,'rgba(255,255,255,0.15)',8,7,24,1);P(g,'#6d6a62',1,45,8,3);P(g,'#6d6a62',31,45,8,3)}
  else{c=mk(38,30);g=c.getContext('2d');P(g,W1,6,15,2,15);P(g,W1,30,15,2,15);P(g,'#3a2416',1,1,36,16);P(g,W4,2,2,34,14);P(g,W2,3,3,32,12);g.drawImage(pic,5,3,28,12);P(g,'rgba(255,255,255,0.18)',3,3,32,1);P(g,'#2b2320',18,0,2,1);P(g,'#c99a2e',4,2,1,1);P(g,'#c99a2e',33,2,1,1)}
  return c}
 function register(id){const e=pics()[id];if(!e)return Promise.resolve();return new Promise(r=>{const im=new Image();im.onload=()=>{variants('pic_'+e.kind+'_'+id,compose(e.kind,im));r()};im.onerror=r;im.src=e.d})}
 // 기본(사진 없음) 플레이스홀더
 function placeholders(){for(const k of Object.keys(SIZE)){const[w,h]=SIZE[k];const c=mk(w,h),g=c.getContext('2d');for(let y=0;y<h;y++)for(let x=0;x<w;x++){g.fillStyle=((x>>2)+(y>>2))%2?'#f6e7cf':'#e8c49a';g.fillRect(x,y,1,1)}g.fillStyle='#f0c64a';g.beginPath();g.arc(w/2,h/2,Math.min(w,h)/3,0,6.3);g.fill();g.fillStyle='#5f7a4a';g.fillRect(w/2-1,h/2-Math.min(w,h)/3-2,2,2);variants(k,compose(k,c))}}
 // ---- 업로드 UI ----
 let pending=null;
 function open(kind,target){const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=()=>{const f=inp.files[0];if(!f)return;if(f.size>15e6)return toast('사진이 너무 커요 (15MB 이하)');const url=URL.createObjectURL(f);const im=new Image();im.onload=()=>editor(kind,im,target);im.onerror=()=>toast('이미지를 읽지 못했어요');im.src=url};inp.click()}
 function editor(kind,im,target){const[w,h]=SIZE[kind];const opt={colors:12,pal:'mix',dither:'fs',ds:0.6,contrast:0.1,sat:0.1};
  const m=$('modal');m.style.display='block';m.innerHTML=`<h3>픽셀 장식 만들기 <small>(${DEF[kind].n})</small></h3>
   <div class="pxw"><div><canvas id="pxPrev"></canvas><div class="lab">픽셀 결과 ${w}×${h}</div></div><div><canvas id="pxFull"></canvas><div class="lab">장식 미리보기</div></div></div>
   <div class="row"><span>색 수</span><input type="range" id="pxC" min="4" max="24" value="12"><b id="pxCv">12</b></div>
   <div class="row"><span>팔레트</span><select id="pxP"><option value="mix" selected>사진+료칸 혼합</option><option value="auto">사진 그대로</option><option value="onsen">료칸 24색</option></select></div>
   <div class="row"><span>디더링</span><select id="pxD"><option value="fs" selected>오차 확산</option><option value="bayer">격자(바이어)</option><option value="none">없음</option></select></div>
   <div class="row"><span>디더 강도</span><input type="range" id="pxS" min="0" max="1" step="0.05" value="0.6"></div>
   <div class="row"><span>대비</span><input type="range" id="pxK" min="-0.3" max="0.6" step="0.05" value="0.1"></div>
   <div style="margin-top:8px;text-align:right"><button class="b g" id="pxX">취소</button><button class="b" id="pxOk">${target?'바꾸기':'만들고 배치하기'}</button></div>`;
  let out=null;const draw=()=>{out=pixelize(im,w,h,opt);const pv=$('pxPrev');pv.width=w*6;pv.height=h*6;const pg=pv.getContext('2d');pg.imageSmoothingEnabled=false;pg.drawImage(out,0,0,w*6,h*6);
   const fr=compose(kind,out);const fv=$('pxFull');fv.width=fr.width*3;fv.height=fr.height*3;const fg=fv.getContext('2d');fg.imageSmoothingEnabled=false;fg.drawImage(fr,0,0,fr.width*3,fr.height*3)};
  let tm=0;const later=()=>{clearTimeout(tm);tm=setTimeout(draw,60)};
  $('pxC').oninput=e=>{opt.colors=+e.target.value;$('pxCv').textContent=opt.colors;later()};$('pxP').onchange=e=>{opt.pal=e.target.value;later()};$('pxD').onchange=e=>{opt.dither=e.target.value;later()};$('pxS').oninput=e=>{opt.ds=+e.target.value;later()};$('pxK').oninput=e=>{opt.contrast=+e.target.value;later()};
  $('pxX').onclick=()=>{m.style.display='none'};
  $('pxOk').onclick=async()=>{const id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);pics()[id]={kind,w,h,d:out.toDataURL('image/png')};await register(id);m.style.display='none';
   if(target){const old=target.pic;target.pic=id;gc(old);save();toast('사진을 바꿨어요 ✨')}else{pending={kind,id};ghost=kind;buildCards();toast('놓을 곳을 눌러주세요 (Esc 취소)')}};
  draw()}
 function gc(id){if(!id)return;if(!S.objs.some(o=>o.pic===id))delete pics()[id]}
 // 건설 카드 가로채기: 사진 장식 카드는 먼저 업로드
 document.addEventListener('click',e=>{const c=e.target.closest('.card');if(!c)return;const k=c.dataset.k;if(!DEF[k]||!DEF[k].photo)return;e.stopImmediatePropagation();e.preventDefault();if(S.yen<DEF[k].cost)return toast('엔이 부족해요');if(window.READONLY)return;open(k)},true);
 BUS.on('build',o=>{if(DEF[o.k].photo){if(pending&&pending.kind==o.k){o.pic=pending.id;pending=null;ghost=null;buildCards()}}});
 BUS.on('info',(o,el)=>{if(!DEF[o.k].photo)return;const b=document.createElement('button');b.className='b';b.textContent='사진 바꾸기';b.onclick=()=>open(o.k,o);el.lastElementChild.prepend(b)});
 // 노렌 흔들림: 손님이 가까이 오면
 BUS.on('frame',()=>{for(const o of S.objs){if(o.k!='noren'&&o.k!='banner')continue;if(guests.some(g=>Math.abs(g.x-o.x-0.5)<0.8&&Math.abs(g.y-o.y-0.5)<0.8))o.sway=Math.min(0.35,(o.sway||0)+0.02)}});
 placeholders();
 async function init(){for(const id in pics())await register(id);for(const o of S.objs)if(o.pic&&!pics()[o.pic])delete o.pic}
 if(window.__ready)init();else{const iv=setInterval(()=>{if(window.__ready){clearInterval(iv);init()}},50)}
 return{pixelize,compose,register,open,editor,ONSEN,SIZE,init};
})();
window.PHOTO=PHOTO;
