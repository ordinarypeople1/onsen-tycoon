'use strict';
// ===== 저장 어댑터 · 저장 코드 · 방문 링크 (game.js보다 먼저 로드) =====
// 어댑터 인터페이스: { name, async load(slot)->obj|null, async save(slot,obj), async list()->[{slot,meta}], async remove(slot) }
const SaveCodec={
 PFX:'CAPY1.',
 async encode(obj){const json=JSON.stringify(obj);let bytes=new TextEncoder().encode(json);
  if(window.CompressionStream){const cs=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));bytes=new Uint8Array(await new Response(cs).arrayBuffer());return this.PFX+'z.'+b64u(bytes)}
  return this.PFX+'j.'+b64u(bytes)},
 async decode(code){code=String(code).trim().replace(/\s+/g,'');if(!code.startsWith('CAPY1.')&&!code.startsWith('YUZU1.'))throw new Error(L('형식이 달라요'));const[kind,data]=[code.slice(6,7),code.slice(8)];let bytes=unb64u(data);
  if(kind=='z'){if(!window.DecompressionStream)throw new Error(L('이 브라우저는 압축 해제를 지원하지 않아요'));const ds=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));bytes=new Uint8Array(await new Response(ds).arrayBuffer())}
  const obj=JSON.parse(new TextDecoder().decode(bytes));if(!obj||obj.ver!==2||!Array.isArray(obj.objs)||!obj.plots)throw new Error(L('저장 데이터가 아니에요'));return cleanSave(obj)}};
// 남이 보낸 코드·링크로 들어온 저장 데이터 정리: 이름의 HTML 문자 제거, 사진 장식은 data:image만 허용
function cleanSave(o){const txt=v=>String(v==null?'':v).replace(/[<>&"'`]/g,'').slice(0,40);if('ryokanName'in o)o.ryokanName=txt(o.ryokanName);
 if(o.pics&&typeof o.pics=='object'){for(const k in o.pics){const e=o.pics[k];if(!e||typeof e.d!='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(e.d)||!/^[a-z0-9]+$/i.test(k))delete o.pics[k];else e.kind=txt(e.kind)}}else o.pics={};
 o.objs=o.objs.filter(x=>x&&typeof x.k=='string'&&/^[a-z0-9_]+$/.test(x.k));return o}
function b64u(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
class LocalAdapter{constructor(){this.name='local'}key(n){return n==1?'onsen2':'onsen2_s'+n}
 async load(n){const r=localStorage[this.key(n)];return r?JSON.parse(r):null}async save(n,o){localStorage[this.key(n)]=JSON.stringify(o)}
 async list(){return[1,2,3].map(n=>({slot:n,exists:!!localStorage[this.key(n)]}))}async remove(n){localStorage.removeItem(this.key(n))}}
// ---- 원격 어댑터 (설정 전까지 비활성 — docs/BACKEND.md 참고) ----
class SupabaseAdapter{ // 테이블 saves(user_id uuid, slot int, data jsonb, updated_at timestamptz) + RLS
 constructor({url,anonKey,getToken}){this.name='supabase';this.url=url;this.key=anonKey;this.getToken=getToken}
 async h(){const t=await this.getToken();return{apikey:this.key,Authorization:'Bearer '+t,'Content-Type':'application/json'}}
 async load(n){const r=await fetch(`${this.url}/rest/v1/saves?slot=eq.${n}&select=data`,{headers:await this.h()});if(!r.ok)throw new Error(r.status);const j=await r.json();return j[0]?j[0].data:null}
 async save(n,o){const r=await fetch(`${this.url}/rest/v1/saves?on_conflict=user_id,slot`,{method:'POST',headers:{...await this.h(),Prefer:'resolution=merge-duplicates'},body:JSON.stringify({slot:n,data:o,updated_at:new Date().toISOString()})});if(!r.ok)throw new Error(r.status)}
 async list(){const r=await fetch(`${this.url}/rest/v1/saves?select=slot,updated_at`,{headers:await this.h()});return r.ok?r.json():[]}
 async remove(n){await fetch(`${this.url}/rest/v1/saves?slot=eq.${n}`,{method:'DELETE',headers:await this.h()})}}
class FirebaseAdapter{ // Firestore REST: users/{uid}/saves/{slot} { data: string(JSON) }
 constructor({projectId,getToken,getUid}){this.name='firebase';this.base=`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;this.getToken=getToken;this.getUid=getUid}
 async doc(n){return`${this.base}/users/${await this.getUid()}/saves/${n}`}async h(){return{Authorization:'Bearer '+await this.getToken(),'Content-Type':'application/json'}}
 async load(n){const r=await fetch(await this.doc(n),{headers:await this.h()});if(r.status==404)return null;if(!r.ok)throw new Error(r.status);const j=await r.json();return JSON.parse(j.fields.data.stringValue)}
 async save(n,o){const r=await fetch(await this.doc(n),{method:'PATCH',headers:await this.h(),body:JSON.stringify({fields:{data:{stringValue:JSON.stringify(o)},updated:{timestampValue:new Date().toISOString()}}})});if(!r.ok)throw new Error(r.status)}
 async list(){return[]}async remove(n){await fetch(await this.doc(n),{method:'DELETE',headers:await this.h()})}}
const SAVE={adapter:new LocalAdapter(),codec:SaveCodec,LocalAdapter,SupabaseAdapter,FirebaseAdapter,
 use(a){this.adapter=a},
 // 원격 백업(선택): 로컬 저장은 항상 즉시, 원격은 30초 디바운스
 _t:0,mirror(obj){if(this.adapter.name=='local')return;clearTimeout(this._t);this._t=setTimeout(()=>this.adapter.save(+localStorage.onsenSlot||1,obj).catch(e=>console.warn('remote save',e)),30000)}};
window.SAVE=SAVE;
// 방문 링크: #visit=YUZU1....
(()=>{const m=location.hash.match(/visit=([^&]+)/);if(m)window.VISIT_PROMISE=SaveCodec.decode(decodeURIComponent(m[1]));else if(/^#[a-z0-9_-]{2,24}$/i.test(location.hash)&&!/^#showcase$/i.test(location.hash)){const id=location.hash.slice(1).toLowerCase();window.VISIT_PROMISE=fetch('assets/visits/'+id+'.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{if(!d||d.ver!==2||!Array.isArray(d.objs)||!d.plots)throw new Error(L('저장 데이터가 아니에요'));d=cleanSave(d);d.t=Date.now();return d})}
 else if(/showcase/.test(location.hash)){window.SHOWCASE=1;window.VISIT_PROMISE=fetch('assets/showcase.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{d.t=Date.now();return d})}})();
