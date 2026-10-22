XSORT=False
from PIL import Image
import numpy as np
from scipy import ndimage
def mask(a):
    r,g,b=[a[...,i].astype(int) for i in range(3)]
    return ~((r>140)&(b>90)&(r-g>90)&(b-g>40))
def cut(src,names,scale=2,minarea=3000):
    im=np.array(Image.open('assets/src/'+src).convert('RGB'))
    m=mask(im)
    r_,g_,b_=[im[...,i].astype(int) for i in range(3)]
    loose=(r_>110)&(r_-g_>60)&(b_-g_>25)
    edge=ndimage.binary_dilation(~m,iterations=4)
    m=m&~(edge&loose); m=ndimage.binary_opening(m,iterations=2)
    lab,n=ndimage.label(ndimage.binary_dilation(m,iterations=12))
    objs=[(s,i+1) for i,s in enumerate(ndimage.find_objects(lab))]
    objs=[o for o in objs if (o[0][0].stop-o[0][0].start)*(o[0][1].stop-o[0][1].start)>minarea]
    # sort rows then cols
    objs.sort(key=(lambda o:o[0][1].start) if XSORT else (lambda o:(round(o[0][0].start/150),o[0][1].start)))
    print(src,len(objs))
    for (sl,i),nm in zip(objs,names):
        sub=im[sl].copy(); mm=(m[sl]&(lab[sl]==i))
        # despill
        rgba=np.dstack([sub,(mm*255).astype(np.uint8)])
        img=Image.fromarray(rgba,'RGBA')
        w,h=img.size; img=img.resize((max(1,w//scale),max(1,h//scale)),Image.BOX)
        a=np.array(img); al=a[...,3]>140; a[...,3]=al*255
        rgb=Image.fromarray(a[...,:3]).quantize(48,method=Image.MEDIANCUT).convert('RGB')
        out=np.dstack([np.array(rgb),a[...,3]]); 
        Image.fromarray(out,'RGBA').save('assets/'+nm+'.png'); print(nm,img.size)
cut('rock.jpg',['rock'])
cut('capy.jpg',['cb1','cb2','cb3','cb4','cw1','cw2','cw3','cw4'])
cut('bld.jpg',['yuzu','ramen','room','sauna'])
cut('deco.jpg',['sakura','maple','pine','lantern','rocks','hinoki'])
cut('bld2.jpg',['gift','izakaya','teishoku','milky'])
