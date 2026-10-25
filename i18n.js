'use strict';
// ===== 다국어: 한국어 원문을 키로 쓰는 번역 (L('원문'), L`원문 ${값}`) =====
// 언어: 설정에서 고른 값 → 없으면 기기 언어(ko/ja/zh → 해당 언어, 나머지는 영어)
// 사전: assets/i18n/<언어>.js (tools/i18n_build.js 로 생성), 폰트: assets/fonts/lang-<언어>.css
(()=>{
 const SUP=['ko','en','ja','zh-TW'];
 let set={};try{set=JSON.parse(localStorage.onsenSet||'{}')}catch(e){}
 const nav=String((navigator.languages&&navigator.languages[0])||navigator.language||'ko').toLowerCase();
 const auto=nav.startsWith('ko')?'ko':nav.startsWith('ja')?'ja':nav.startsWith('zh')?'zh-TW':'en';
 const LANG=SUP.includes(set.lang)?set.lang:auto;
 window.LANG=LANG;
 const html=document.documentElement;html.lang=LANG;html.classList.add('lang-'+LANG);
 const me=document.currentScript,ver=me&&/\?v=(\w+)/.exec(me.src);const q=ver?'?v='+ver[1]:'';
 window.I18N_DICT=window.I18N_DICT||{};
 if(LANG!='ko'){
  document.write('<link rel="stylesheet" href="assets/fonts/lang-'+LANG+'.css'+q+'"><script src="assets/i18n/'+LANG+'.js'+q+'"><\/script>');
 }
 const miss=window.__L_MISS=new Set();
 const tr=s=>{const D=window.I18N_DICT;if(D[s]!==undefined)return D[s];miss.add(s);return null};
 const fill=(t,v)=>t.replace(/\{(\d+)\}/g,(m,i)=>v[+i]===undefined?'':v[+i]);
 // 값 번역: 이름처럼 사전에 그대로 있는 값은 그 언어로 바꿔 끼운다 (예: 단골 이름, 기본 료칸 이름)
 const val=v=>{if(typeof v!='string'||LANG=='ko')return v;const D=window.I18N_DICT;return D[v]!==undefined?D[v]:v};
 window.L=function(s,...vals){
  if(Array.isArray(s)&&s.raw){
   if(LANG=='ko'){let o=s[0];for(let i=0;i<vals.length;i++)o+=vals[i]+s[i+1];return o}
   const key=s.join('{}'),v=vals.map(val),t=tr(key);
   if(t!==null)return fill(t,v);
   let o=s[0];for(let i=0;i<v.length;i++)o+=v[i]+s[i+1];return o}
  if(LANG=='ko')return s;const t=tr(s);return t===null?s:t};
 // 저장된 한국어 문장(리뷰·퀘스트·이름 등)을 현재 언어로: 사전 일치 → 템플릿 역매칭 → 그대로
 let RX=null,PAREN=null;const PART={ye:'(?:이에요|예요)?',ni:'(?:이|가)?',i:'(?:이|가)?',r:'(?:을|를)?',at:'(?: 앞에서|에서)?'};
 const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 window.Lx=function(s){
  if(LANG=='ko'||typeof s!='string'||!H.test(s))return s;const D=window.I18N_DICT;if(D[s]!==undefined)return D[s];
  if(!PAREN){PAREN={};for(const k in D){const b=k.replace(/\s*\(.*\)$/,'');if(b!==k&&!(b in PAREN))PAREN[b]=D[k].replace(/\s*[(（].*[)）]$/,'')}}if(PAREN[s]!==undefined)return PAREN[s];
  if(!RX){RX=[];for(const k in D){if(!/\{\}|\{[a-z]+\}/.test(k)||/</.test(k))continue;const names=[];const re=esc(k).replace(/\\\{\\\}|\\\{([a-z]+)\\\}/g,(m,nm)=>{if(PART[nm])return PART[nm];names.push(nm||'');return '(.+?)'});RX.push([new RegExp('^'+re+'$'),k,names])}}
  for(const [re,k,names] of RX){const m=re.exec(s);if(!m)continue;let t=D[k];const caps=m.slice(1).map(c=>Lx(c));
   if(names.every(n=>!n))return t.replace(/\{(\d+)\}/g,(x,i)=>caps[+i]===undefined?'':caps[+i]);
   names.forEach((n,i)=>{t=t.split('{'+n+'}').join(caps[i])});return t.replace(/\{(?:ye|ni|i|r|at)\}/g,'')}
  const r=/^(.*) \((.+) 추천!\)$/.exec(s);if(r)return Lx(r[1])+L` (${Lx(r[2])} 추천!)`;
  return s};
 // index.html 고정 문구 (글자·title·aria-label)
 const H=/[가-힣]/;
 window.L_DOM=root=>{if(LANG=='ko')return;const D=window.I18N_DICT;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];while(w.nextNode())ns.push(w.currentNode);
  for(const n of ns){const t=n.nodeValue.trim();if(t&&H.test(t)&&D[t]!==undefined)n.nodeValue=n.nodeValue.replace(t,D[t])}
  for(const e of root.querySelectorAll('[title],[aria-label],[placeholder]'))for(const a of ['title','aria-label','placeholder']){const t=e.getAttribute(a);if(t&&H.test(t)&&D[t]!==undefined)e.setAttribute(a,D[t])}};
 if(LANG!='ko')document.addEventListener('DOMContentLoaded',()=>{L_DOM(document.body);const t=document.title;if(window.I18N_DICT[t]!==undefined)document.title=window.I18N_DICT[t]});
})();
