# 탕 스프라이트에서 수면 영역을 찾아 assets/water.json 생성 (정규화 좌표)
import json,sys,colorsys
from PIL import Image
import numpy as np
out={}
def detect(path,milky):
    a=np.asarray(Image.open(path).convert('RGBA')).astype(float)/255
    r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
    mx=np.max(a[...,:3],-1);mn=np.min(a[...,:3],-1);sat=(mx-mn)/(mx+1e-6)
    if milky: m=(al>0.9)&(mn>0.78)&(sat<0.12)
    else: m=(al>0.9)&(b>r+0.08)&(g>r+0.04)&(sat>0.25)
    H,W=m.shape
    # 가장 큰 덩어리 근사: 행/열 밀도 기반 트림
    ys,xs=np.nonzero(m)
    if len(xs)<30: return None
    x0,x1=np.percentile(xs,[3,97]);y0,y1=np.percentile(ys,[3,97])
    return dict(cx=(x0+x1)/2/W,cy=(y0+y1)/2/H,rx=(x1-x0)/2/W,ry=(y1-y0)/2/H,n=int(len(xs)))
for k in sys.argv[1:]:
    for l in [1,2,3,4,5]:
      for sf in ['','_b']:
        p=f'{k}_lv{l}{sf}.png'
        try: d=detect(p,k=='milky')
        except FileNotFoundError: continue
        if d: out[f'{k}_lv{l}{sf}']={q:round(v,4) if isinstance(v,float) else v for q,v in d.items()}
OVR={'hinoki_lv5':dict(cx=0.27,cy=0.635,rx=0.15,ry=0.055)}
for k,v in OVR.items():
    if k in out or k.split('_')[0] in sys.argv: out[k]=v
for k in list(out):
    if k.startswith('sauna'): del out[k]
open('water.js','w').write('// tools/water.py 로 생성: 탕 스프라이트의 수면 영역(정규화)\nwindow.WATER='+json.dumps(out)+';\n')
print(out.keys())
