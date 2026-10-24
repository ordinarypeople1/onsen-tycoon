# 게임 코드·UI에 쓰인 비ASCII 글자를 모아 assets/fonts/glyphs.js 생성
# 부팅 시 document.fonts.load(…, FONT_GLYPHS)로 해당 Pretendard 서브셋 조각만 미리 받는다.
# 텍스트를 바꾼 뒤 레포 루트에서 실행: python3 tools/font_glyphs.py
import glob,json,re
files=[f for f in glob.glob('*.js')+glob.glob('assets/*.js')+['index.html','style.css'] if not re.match(r'(shot|perf|prof|cpuprof|live|play|sim|trailer)',f)]
txt=''.join(open(f,encoding='utf-8',errors='ignore').read() for f in files)
chars=''.join(sorted(set(c for c in txt if 0xAC00<=ord(c)<=0xD7A3 or 0x3131<=ord(c)<=0x318E or 0xA0<=ord(c)<=0x2BFF)))
open('assets/fonts/glyphs.js','w',encoding='utf-8').write('// tools/font_glyphs.py 생성: 화면에 쓰이는 글자(폰트 서브셋 선로딩용)\nwindow.FONT_GLYPHS='+json.dumps(chars,ensure_ascii=False)+';\n')
print(len(chars),'chars')
