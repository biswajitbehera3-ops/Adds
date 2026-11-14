import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, out, l1, l2, stamp = sys.argv[1:6]
W,H=1080,1920
im=Image.open(src).convert("RGB")
s=max(W/im.width,H/im.height); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
x=(im.width-W)//2; y=(im.height-H)//2; im=im.crop((x,y,x+W,y+H)).convert("RGBA")
# bottom gradient for legibility
g=Image.new("L",(1,H))
for i in range(H): g.putpixel((0,i), int(max(0,(i-1000)/(H-1000))**1.3*215))
shade=Image.new("RGBA",(W,H),(15,5,30,255)); shade.putalpha(g.resize((W,H))); im=Image.alpha_composite(im,shade)
F="remotion-overlays/public/fonts/Anton-Regular.ttf"
def big(d,text,size,y,fill):
    f=ImageFont.truetype(F,size)
    while d.textlength(text,font=f)>W-90: size-=6; f=ImageFont.truetype(F,size)
    w=d.textlength(text,font=f)
    d.text(((W-w)/2,y),text,font=f,fill=fill,stroke_width=10,stroke_fill=(0,0,0))
    return y+size*1.12
# drop shadow layer + text
txt=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(txt)
yy=big(d,l1,190,1270,(255,255,255))
big(d,l2,300,yy-20,(255,204,51))
sh=txt.copy().filter(ImageFilter.GaussianBlur(14)); sh=Image.eval(sh,lambda v:v)
im=Image.alpha_composite(im,Image.new("RGBA",(W,H),(0,0,0,0)))
dark=Image.new("RGBA",(W,H),(0,0,0,0)); dark.putalpha(sh.split()[3].point(lambda a:int(a*0.7)))
im=Image.alpha_composite(im,dark); im=Image.alpha_composite(im,txt)
# red rubber stamp, rotated
f=ImageFont.truetype(F,104); tmp=ImageDraw.Draw(Image.new("RGB",(1,1)))
tw=int(tmp.textlength(stamp,font=f)); st=Image.new("RGBA",(tw+80,175),(0,0,0,0)); sd=ImageDraw.Draw(st)
sd.rounded_rectangle((6,6,tw+74,169),radius=16,fill=(230,30,45,235),outline=(255,255,255,255),width=6)
sd.text((40,20),stamp,font=f,fill=(255,255,255,255))
st=st.rotate(-9,expand=True,resample=Image.BICUBIC)
im.alpha_composite(st,(W-st.width-36,1050))
im.convert("RGB").save(out,quality=92)
