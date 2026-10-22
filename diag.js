'use strict';
// ===== 충돌 진단: 오류/캔버스 실패/긴 프레임/주기 통계 → localStorage 링버퍼 =====
(()=>{const KEY='onsenDiag',MAX=150;let buf=[];try{buf=JSON.parse(localStorage[KEY]||'[]')}catch(e){buf=[]}
 let dirty=false;const log=(type,msg,extra)=>{buf.push({t:new Date().toISOString(),type,msg:String(msg).slice(0,400),...(extra||{})});if(buf.length>MAX)buf.splice(0,buf.length-MAX);dirty=true};
 const flush=()=>{if(!dirty)return;dirty=false;try{localStorage[KEY]=JSON.stringify(buf)}catch(e){buf.splice(0,buf.length>>1)}};setInterval(flush,3000);addEventListener('pagehide',flush);
 addEventListener('error',e=>log('error',e.message,{src:(e.filename||'').split('/').pop()+':'+e.lineno+':'+e.colno,stack:(e.error&&e.error.stack||'').slice(0,600)}));
 addEventListener('unhandledrejection',e=>log('reject',e.reason&&(e.reason.message||e.reason),{stack:(e.reason&&e.reason.stack||'').slice(0,600)}));
 // 캔버스 생성/컨텍스트 실패 감지 + 살아있는 캔버스 수 집계
 const live=new Set();const reg=typeof FinalizationRegistry!='undefined'?new FinalizationRegistry(id=>live.delete(id)):null;let cid=0;
 const oc=Document.prototype.createElement;Document.prototype.createElement=function(t,o){const e=oc.call(this,t,o);if(reg&&String(t).toLowerCase()=='canvas'){const id=++cid;live.add(id);reg.register(e,id)}return e};
 const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,o){const c=gc.call(this,type,o);if(!c)log('canvas','getContext 실패',{w:this.width,h:this.height,live:live.size});return c};
 addEventListener('webglcontextlost',e=>log('ctxlost','context lost'),true);
 // 긴 프레임 감시
 let last=performance.now(),longN=0;const wd=()=>{const n=performance.now(),d=n-last;last=n;if(d>1500&&!document.hidden){longN++;log('longframe',Math.round(d)+'ms')}requestAnimationFrame(wd)};requestAnimationFrame(wd);
 const stats=()=>{const m=performance.memory;return{canv:live.size,heapMB:m?Math.round(m.usedJSHeapSize/1e6):null,dom:document.getElementsByTagName('*').length,guests:window.__dbg&&__dbg.guests?__dbg.guests().length:null,objs:window.__dbg?__dbg.S.objs.length:null,long:longN}};
 setInterval(()=>log('stats','',stats()),120000);log('boot',navigator.userAgent.slice(0,160),{dpr:devicePixelRatio,vw:innerWidth,vh:innerHeight});
 window.DIAG={log,stats,text:()=>JSON.stringify({ver:document.querySelector('meta[name=ver]')?.content,now:new Date().toISOString(),stats:stats(),log:buf},null,1),clear(){buf=[];dirty=true;flush()}};
})();
