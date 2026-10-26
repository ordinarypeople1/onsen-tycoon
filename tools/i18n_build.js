// 다국어 사전 생성 + 누락 검사
//   node tools/i18n_build.js         → assets/i18n/{en,ja,zh-TW}.js 생성
//   번역 원본: tools/i18n/strings.json  { "한국어 원문": ["English", "日本語", "繁體中文"] }
//   템플릿 키는 ${...} 자리를 {} 로 쓰고, 번역에서는 {0} {1} … 로 순서를 바꿀 수 있음
const fs=require('fs'),path=require('path'),acorn=require('acorn'),walk=require('acorn-walk');
const root=path.join(__dirname,'..');
const FILES=['game.js','meta.js','ambient.js','shell.js','photo.js','fx.js','mobile.js','save.js'];
const STATIC=['카피바라 온천 타이쿤 — CAPYBARA ONSEN','카피바라 손님이 쉬어가는 픽셀 아트 온천 료칸 타이쿤','수익','등급','시설 건설','닫기','재정','손님','철거','중앙','회전','회전 (R)','이동 중 — 끌어서 놓으세요','회전 R','취소','료칸 등급 · 승급 조건 보기','속도','축소','확대','중앙으로','접기','펼치기','한국어',
 '유자','모모','코타로','하나','텐','소라','키나코','단고',
 '초대·방문','연출','감상']; // index.html 고정 문구, 단골 이름(저장 ID라 감싸지 않음), mobile.js 아이콘 매칭
const keys=new Set(STATIC);
for(const f of FILES){const ast=acorn.parse(fs.readFileSync(path.join(root,f),'utf8'),{ecmaVersion:'latest',sourceType:'script'});
 walk.full(ast,n=>{if(n.type=='CallExpression'&&n.callee.type=='Identifier'&&n.callee.name=='L'&&n.arguments[0]&&n.arguments[0].type=='Literal')keys.add(n.arguments[0].value);
  if(n.type=='TaggedTemplateExpression'&&n.tag.type=='Identifier'&&n.tag.name=='L')keys.add(n.quasi.quasis.map(q=>q.value.cooked).join('{}'))});}
const S=JSON.parse(fs.readFileSync(path.join(__dirname,'i18n/strings.json'),'utf8'));
const miss=[...keys].filter(k=>!(k in S)),unused=Object.keys(S).filter(k=>!keys.has(k));
const LANGS=['en','ja','zh-TW'];
for(const [i,l] of LANGS.entries()){const d={};let chars=new Set();for(const k of keys)if(k in S){d[k]=S[k][i];for(const c of S[k][i].replace(/<[^>]*>/g,''))chars.add(c)}
 const glyphs=[...chars].filter(c=>c.charCodeAt(0)>127).sort().join('');
 fs.writeFileSync(path.join(root,'assets/i18n',l+'.js'),`// tools/i18n_build.js 생성 — 직접 고치지 말고 tools/i18n/strings.json 수정\nwindow.I18N_DICT=${JSON.stringify(d)};\nwindow.FONT_GLYPHS_X=${JSON.stringify(glyphs)};\n`);
 fs.writeFileSync(path.join(__dirname,'i18n','glyphs-'+l+'.txt'),[...chars].sort().join(''))}
console.log(`키 ${keys.size} · 번역 ${Object.keys(S).length} · 누락 ${miss.length} · 미사용 ${unused.length}`);
for(const k of miss)console.log('누락:',JSON.stringify(k).slice(0,120));
for(const k of unused)console.log('미사용:',JSON.stringify(k).slice(0,120));
if(miss.length)process.exitCode=1;
