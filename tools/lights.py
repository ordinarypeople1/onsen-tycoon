# 시설 스프라이트별 명시적 조명 마스크 생성: 등롱·창 같은 '작은 발광 덩어리'만 남기고 넓은 회벽은 제외
import glob,json,os,numpy as np
from PIL import Image
from scipy import ndimage
out={}
for p in sorted(glob.glob('assets/*_lv[1-5]*.png')):
    k=os.path.basename(p)[:-4]
    if k.startswith('milk_'):continue
    a=np.asarray(Image.open(p).convert('RGBA')).astype(int);r,g,b,al=[a[...,i] for i in range(4)];op=al>200
    lan=op&(r>185)&(r-g>70)&(g>60)&(b<130)
    if not lan.any() and k.split('_')[0] in ('teishoku','izakaya') and not k.endswith('_b'): lan=op&(r>150)&(r-g>55)&(b<120)  # 어두운 등롱 팔레트용 완화 기준
    win=op&(r>200)&(g>165)&(b>100)&(b<200)&(r-b>55)&(g-b>25)
    fl=op&(r>235)&(g>220)&(b<190)
    H,W=op.shape;area=H*W;m=np.zeros((H,W),float)
    for mask,e,mx in((lan,1.0,0.02),(win,0.7,0.006),(fl,0.9,0.01)):
        lab,n=ndimage.label(mask)
        if not n:continue
        sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
        # 덩어리 모양: 너무 크거나(벽) 너무 작으면(노이즈) 제외, 꽉 찬 사각형/원 형태 우선
        sl=ndimage.find_objects(lab)
        for i,(z,s_) in enumerate(zip(sz,sl)):
            if z<5 or z>area*mx:continue
            hh=s_[0].stop-s_[0].start;ww=s_[1].stop-s_[1].start
            if z/(hh*ww)<0.35:continue
            m[lab==i+1]=np.maximum(m[lab==i+1],e)
    if m.max()==0:continue
    img=np.zeros((H,W,4),np.uint8);img[...,0]=255;img[...,1]=np.clip(g+40,0,255);img[...,2]=np.clip(b+10,0,255);img[...,3]=(m*255).astype(np.uint8)
    Image.fromarray(img,'RGBA').save(f'assets/lights/{k}.png')
    # 광원 점: 큰 덩어리 중심 상위 7개
    lab,n=ndimage.label(m>0);cs=ndimage.center_of_mass(m,lab,range(1,n+1));ws=ndimage.sum(m,lab,range(1,n+1))
    pts=sorted([(round(c[1]/W,3),round(c[0]/H,3),float(w)) for c,w in zip(cs,ws)],key=lambda t:-t[2])
    sel=[]
    for p_ in pts:
        if len(sel)>=7:break
        if all(abs(p_[0]-q[0])*W+abs(p_[1]-q[1])*H>24 for q in sel):sel.append(p_)
    out[k]=[[x,y,round(w,1)] for x,y,w in sel]
open('assets/lights.js','w').write('// tools/lights.py 생성: 스프라이트별 광원 점 (마스크는 assets/lights/*.png)\nwindow.LIGHTS='+json.dumps(out)+';\n')
print(len(out))
