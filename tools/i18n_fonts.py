"""언어별 폰트 서브셋 생성 (tools/i18n_build.js 실행 후)
  python3 tools/i18n_fonts.py
원본 TTF: node_modules/@expo-google-fonts/* (npm install 로 받음, 저장소에는 서브셋만 커밋)
결과: assets/fonts/lang/*.woff2, assets/fonts/lang-<언어>.css
 - 'Pretendard'와 같은 이름으로 등록해, CSS·캔버스 코드를 바꾸지 않고 그 언어 글자만 이 폰트로 그림
 - unicode-range는 서브셋에 실제로 있는 글자로 계산 → 없는 글자(한글 등)는 Pretendard로 자연스럽게 넘어감
"""
import os, json
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NM=os.path.join(ROOT,'node_modules','@expo-google-fonts')
OUT=os.path.join(ROOT,'assets','fonts','lang'); os.makedirs(OUT,exist_ok=True)
# 언어: (패키지, [(파일, CSS weight 범위)])
LANGS={
 'en':('nunito',[('400Regular/Nunito_400Regular.ttf','100 449'),('500Medium/Nunito_500Medium.ttf','450 549'),('600SemiBold/Nunito_600SemiBold.ttf','550 649'),('700Bold/Nunito_700Bold.ttf','650 749'),('800ExtraBold/Nunito_800ExtraBold.ttf','750 1000')]),
 'ja':('m-plus-rounded-1c',[('400Regular/MPLUSRounded1c_400Regular.ttf','100 449'),('500Medium/MPLUSRounded1c_500Medium.ttf','450 599'),('700Bold/MPLUSRounded1c_700Bold.ttf','600 749'),('800ExtraBold/MPLUSRounded1c_800ExtraBold.ttf','750 1000')]),
 'zh-TW':('huninn',[('400Regular/Huninn_400Regular.ttf','100 1000')]),
}
BASE=''.join(chr(c) for c in range(0x20,0x7f))+'¥©°·×–—…‘’“”・「」『』（）！？、。，：；～〜'
def ranges(cps):
    cps=sorted(cps); out=[]; s=p=cps[0]
    for c in cps[1:]:
        if c==p+1: p=c; continue
        out.append((s,p)); s=p=c
    out.append((s,p))
    return ','.join(f'U+{a:X}' if a==b else f'U+{a:X}-{b:X}' for a,b in out)
for lang,(pkg,files) in LANGS.items():
    text=BASE+open(os.path.join(ROOT,'tools','i18n',f'glyphs-{lang}.txt'),encoding='utf8').read()
    css=[f'/* {lang}: tools/i18n_fonts.py 생성 — SIL Open Font License 1.1 */']
    for fn,wr in files:
        src=os.path.join(NM,pkg,fn); name=os.path.basename(fn).replace('.ttf','')
        dst=os.path.join(OUT,f'{name}.woff2')
        opt=subset.Options(); opt.flavor='woff2'; opt.layout_features=['*']; opt.name_IDs=['*']; opt.notdef_outline=True
        f=TTFont(src); s=subset.Subsetter(opt); s.populate(text=text); s.subset(f); f.flavor='woff2'; f.save(dst)
        cmap=TTFont(dst).getBestCmap(); ur=ranges([c for c in cmap if c>=0x20])
        css.append(f"@font-face{{font-family:'Pretendard';font-style:normal;font-weight:{wr};font-display:swap;src:url('lang/{name}.woff2') format('woff2');unicode-range:{ur}}}")
        print(lang,name,os.path.getsize(dst)//1024,'KB',len(cmap),'glyphs')
    open(os.path.join(ROOT,'assets','fonts',f'lang-{lang}.css'),'w',encoding='utf8').write('\n'.join(css)+'\n')
