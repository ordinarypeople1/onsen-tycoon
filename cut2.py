import sys
sys.argv=['x'];exec(open('cut.py').read().split("cut('rock.jpg'")[0])
import os
XSORT=True
for b in os.listdir('assets/src'):
    p=f'assets/src/{b}/lv3/sheet_lv3_lv5.jpg'
    if os.path.exists(p): cut(f'{b}/lv3/sheet_lv3_lv5.jpg',[f'{b}_lv3',f'{b}_lv5'])
