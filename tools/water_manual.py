# 신규 노천탕 수면 영역: 색 기준(청록/와인)으로 최대 연결영역을 찾아 타원 추정 → assets/water_extra.js
import json,numpy as np,colorsys
from PIL import Image,ImageDraw
from scipy import ndimage
out={};sheet=[]
for b in ['cave','foot','fall','wine']:
  for l in range(1,6):
    k=f'{b}_lv{l}';a=np.asarray(Image.open(f'assets/{k}.png').convert('RGBA')).astype(int)
    r,g,bl,al=a[...,0],a[...,1],a[...,2],a[...,3]
    if b=='wine': m=(r>70)&(r>g*1.8)&(r>bl*1.3)&(al>0)
    else: m=(bl>g*0.75)&(g>r*1.15)&(bl>90)&(al>0)
    m=ndimage.binary_opening(m,iterations=1)
    lab,n=ndimage.label(ndimage.binary_closing(m,iterations=3))
    if not n: print('none',k);continue
    sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1));mm=lab==(np.argmax(sz)+1)
    ys,xs=np.nonzero(mm);H,W=mm.shape
    cx,cy=xs.mean()/W,ys.mean()/H;rx=xs.std()*1.7/W;ry=ys.std()*1.7/H
    out[k]={'cx':round(cx,4),'cy':round(cy,4),'rx':round(rx,4),'ry':round(ry,4),'n':int(mm.sum())}
    im=Image.open(f'assets/{k}.png').convert('RGBA');d=ImageDraw.Draw(im)
    d.ellipse([(cx-rx)*W,(cy-ry)*H,(cx+rx)*W,(cy+ry)*H],outline=(255,255,0,255),width=2);sheet.append(im)
MAN={'foot_lv2':(.37,.47,.22,.12),'wine_lv1':(.4,.28,.25,.13),'wine_lv2':(.42,.4,.2,.09),'wine_lv3':(.43,.44,.17,.1),'wine_lv4':(.46,.43,.15,.07),'wine_lv5':(.45,.7,.27,.11)}
for k,(a1,a2,a3,a4) in MAN.items(): out[k]={'cx':a1,'cy':a2,'rx':a3,'ry':a4,'n':1}
for k in [b for b in ['cave','foot','fall','wine']]: out[k]=out[k+'_lv1']
open('assets/water_extra.js','w').write('// tools/water_manual.py: 신규 노천탕 수면\nObject.assign(window.WATER||(window.WATER={}),'+json.dumps(out)+');\n')
S=Image.new('RGBA',(5*300,4*260),(60,80,60,255))
for i,im in enumerate(sheet): S.paste(im,((i%5)*300,(i//5)*260),im)
S=Image.new('RGBA',(5*300,4*260),(60,80,60,255));sheet=[]
for k in sorted(out):
  if '_lv' not in k: continue
  im=Image.open(f'assets/{k}.png').convert('RGBA');W,H=im.size;e=out[k];d=ImageDraw.Draw(im);d.ellipse([(e['cx']-e['rx'])*W,(e['cy']-e['ry'])*H,(e['cx']+e['rx'])*W,(e['cy']+e['ry'])*H],outline=(255,255,0,255),width=2);sheet.append(im)
for i,im in enumerate(sheet): S.paste(im,((i%5)*300,(i//5)*260),im)
S.save('shots/r5/water_new.png');print(len(out))
