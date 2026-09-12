from PIL import Image, ImageDraw, ImageFilter
import os, sys
P='/home/doston-sulaymon/projects/jas-ad-studio-api/out/pack'
OUT=os.path.join(sys.argv[1],'art/img'); os.makedirs(OUT,exist_ok=True)

def keyed(path, tol=34):
    im = Image.open(path).convert('RGB')
    w,h = im.size
    px = im.load()
    # seed from all 4 corners
    seeds=[(0,0),(w-1,0),(0,h-1),(w-1,h-1)]
    mask = Image.new('L',(w,h),255)          # 255 = keep
    mk = mask.load()
    from collections import deque
    seen = bytearray(w*h)
    q=deque()
    for s in seeds:
        q.append(s); seen[s[1]*w+s[0]]=1
    base = [px[s] for s in seeds]
    while q:
        x,y=q.popleft()
        r,g,b = px[x,y]
        if not any(abs(r-br)<=tol and abs(g-bg)<=tol and abs(b-bb)<=tol for br,bg,bb in base):
            continue
        mk[x,y]=0
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if 0<=nx<w and 0<=ny<h and not seen[ny*w+nx]:
                seen[ny*w+nx]=1; q.append((nx,ny))
    mask = mask.filter(ImageFilter.GaussianBlur(0.7))
    im.putalpha(mask)
    return im.crop(im.getbbox())

def plate(src, out, bg, tol=34, size=780, inset=0.76):
    o = keyed(os.path.join(P,src), tol)
    canvas = Image.new('RGB',(size,size),bg)
    m = int(size*inset)
    o.thumbnail((m,m), Image.LANCZOS)
    canvas.paste(o,((size-o.width)//2,(size-o.height)//2), o)
    canvas.save(os.path.join(OUT,out),quality=93)
    print(out, o.size)

def crop(src, out, box_ar=1.0, size=780):
    im = Image.open(os.path.join(P,src)).convert('RGB')
    w,h=im.size; want_w = min(w, int(h*box_ar)); want_h = int(want_w/box_ar)
    im = im.crop(((w-want_w)//2,(h-want_h)//2,(w+want_w)//2,(h+want_h)//2))
    im = im.resize((size,int(size/box_ar)), Image.LANCZOS)
    im.save(os.path.join(OUT,out),quality=93); print(out, im.size)

plate('03-03-notebook/photo.png','notebook.jpg','#EDEBE3')
plate('04-04-charger/photo.png','charger.jpg','#E9E8E0')
plate('05-05-car/photo.png','car.jpg','#EDEBE3', inset=0.88)
plate('08-08-key/photo.png','key.jpg','#163D32')
plate('09-09-laptop/photo.png','laptop.jpg','#E9E8E0')
plate('10-10-wipes/photo.png','wipes.jpg','#EDEBE3')
plate('07-07-curtains/photo.png','curtains.jpg','#163D32', tol=60)
plate('06-06-tshirt/photo.png','tshirt.jpg','#EDEBE3', tol=60)
crop('01-01-phones/photo.png','phones.jpg', 1.0)
crop('02-02-rotary-phone/photo.png','rotary.jpg', 1.0)
