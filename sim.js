const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:800,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 const HOURS=+process.env.H||120, BOT=process.env.BOT||'smart';
 const res=await p.evaluate(async({HOURS,BOT})=>{window.__norender=1;const D=__dbg,S=D.S,DEF=D.DEF;const log=[],starAt={};let minYen=1e9;
  const place=k=>{const d=DEF[k];if(S.yen<d.cost||d.star>D.stars())return false;for(let r=0;r<20;r++)for(let i=0;i<60;i++){const ks=Object.keys(S.plots).map(k=>k.split(',').map(Number));const pk=ks[Math.random()*ks.length|0];const x=pk[0]*16+Math.floor(Math.random()*16),y=pk[1]*16+Math.floor(Math.random()*16);if(D.canPlace(k,x,y)){S.yen-=d.cost;S.fin.exp+=d.cost;const o={k,x,y,lv:1,price:d.price||0,uses:0,earn:0,users:0};S.objs.push(o);D.occ();if(!D.reachOK()){S.objs.pop();D.occ();S.yen+=d.cost;continue}D.emit('build',o);return true}}return false};
  const upg=()=>{const c=S.objs.filter(o=>DEF[o.k].price&&o.lv<5).map(o=>({o,c:Math.round(DEF[o.k].cost*Math.pow(1.7,o.lv))})).sort((a,b)=>a.c-b.c)[0];if(c&&S.yen>c.c*1.3){S.yen-=c.c;c.o.lv++;D.emit('upgrade',c.o);return true}return false};
  const claim=()=>{const m=QX.M();for(let i=0;i<3;i++){if(m.tut<QX.TUT.length){const[t,f,rw]=QX.TUT[m.tut];const[a,b2]=f();if(a>=b2){m.tut++;S.yen+=rw}}}for(const r of QX.milesReady()){m.ms.push(r.id);S.yen+=r.rw}};
  const want=['milk','ramen','yuzu','lantern','sakura','hinoki','gift','sauna','teishoku','room','maple','izakaya','milky','pine','rock'];
  let h0=Math.floor(S.min/60);
  for(let h=0;h<HOURS;h++){for(let i=0;i<300;i++)D.step(0.1);
   if(BOT=='smart'){claim();
    for(const k of want){const n=S.objs.filter(o=>o.k==k).length;const cap=DEF[k].tab=='deco'?4+h/10:1+Math.floor(h/40);if(n<cap&&S.yen>DEF[k].cost*1.5){place(k);break}}
    upg();for(const pk of ['2,1','1,0','0,1','1,2','2,2','0,0','2,0','0,2']){if(S.plots[pk])continue;const[a,b2]=pk.split(',').map(Number);const pr=D.plotPrice(a,b2);if(S.yen>pr*1.4&&S.objs.length>30*Object.keys(S.plots).length){S.plots[pk]=1;S.yen-=pr;D.emit('unlock',pk);D.occ()}break}}
   const s=D.stars();if(!starAt[s])starAt[s]=h;minYen=Math.min(minYen,S.yen);
   if(h%10==0)log.push([h,D.maxG(),Math.round(S.yen),D.guests().length,S.served,s,Math.round(S.rep),S.objs.filter(o=>!DEF[o.k].isPath).length]);
   if(h%5==0)await new Promise(r=>setTimeout(r,0))}
  return{th:Object.entries(window.__thinks||{}).sort((a,b)=>b[1]-a[1]).slice(0,10),starAt,minYen,log,served:S.served,yen:S.yen,reviews:QX.M().reviews.slice(0,5).map(r=>r.s)}},{HOURS,BOT});
 console.log(JSON.stringify(res));console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
