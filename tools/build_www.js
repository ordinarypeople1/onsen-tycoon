// 앱용 웹 파일을 www/로 모음 (Capacitor webDir). 사이트(GitHub Pages)는 루트 그대로 사용
// index.html이 참조하는 파일 + assets/ (원본 시트 assets/src, 개발용 파일 제외)
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),out=path.join(root,'www');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const refs=[...html.matchAll(/(?:src|href)="([^"?#]+)/g)].map(m=>m[1]).filter(r=>!/^https?:/.test(r));
const SKIP_DIR=new Set(['src']),SKIP_EXT=new Set(['.py','.md','.psd','.ase','.aseprite']);
let n=0,bytes=0;
function copy(rel){const s=path.join(root,rel),d=path.join(out,rel);fs.mkdirSync(path.dirname(d),{recursive:true});fs.copyFileSync(s,d);n++;bytes+=fs.statSync(s).size}
function walk(rel){for(const e of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){const r=path.join(rel,e.name);
 if(e.isDirectory()){if(!SKIP_DIR.has(e.name))walk(r)}else if(!SKIP_EXT.has(path.extname(e.name)))copy(r)}}
fs.copyFileSync(path.join(root,'index.html'),path.join(out,'index.html'));n++;
for(const r of new Set(refs))if(!r.startsWith('assets/'))copy(r);
walk('assets');
console.log(`www: ${n} files, ${(bytes/1e6).toFixed(1)} MB`);
