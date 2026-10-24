const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.addInitScript(m=>{window.__MODE=m;const P=CanvasRenderingContext2D.prototype;const di=P.drawImage,fr=P.fillRect;
 if(m=='nobig'){P.drawImage=function(...a){const w=a.length>=5?a[a.length-2]:a[0].width;if(this.canvas.id=='c'&&w>900)return;return di.apply(this,a)};P.fillRect=function(x,y,w,h){if(this.canvas.id=='c'&&w>900)return;return fr.call(this,x,y,w,h)}}
 if(m=='nosmall'){P.drawImage=function(...a){const w=a.length>=5?a[a.length-2]:a[0].width;if(this.canvas.id=='c'&&w<=900)return;return di.apply(this,a)}}
 if(m=='notext'){const ft=P.fillText;P.fillText=function(){};P.strokeText=function(){}}
},process.env.M||'');
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);await p.evaluate(()=>{window.__noauto=1;if(1)window.WSCALE=0.75,resize();__dbg.S.min=Math.floor(__dbg.S.min/1440)*1440+21*60});
const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const f=await p.evaluate(()=>new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(n/3)};requestAnimationFrame(f)}));
console.log(process.env.M,f.toFixed(1),await p.evaluate(()=>[innerWidth,devicePixelRatio,document.getElementById('c').width,document.getElementById('tc').width]));await b.close()})();
