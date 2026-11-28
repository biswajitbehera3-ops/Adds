"""Short 049 background plan: official clips (cut + speed-fitted to each beat), official screenshots (Ken Burns in the
renderer), route cards and a dark 'classified' card. Run in the work dir with vo.json; writes seg_*.mp4 + segs.json."""
import json, subprocess, os, glob
R='https://media-rockstargames-com.akamaized.net/VI/downloads/videos/'
EL=R+'GTAVI_An_Extended_Look/GTAVI_An_Extended_Look.mp4'
SH='/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/shots/'
def shot(n): return glob.glob(SH+'**/'+n,recursive=True)[0]
B={b['beat']:b for b in json.load(open('vo.json'))['beats']}
TAIL=1.2
# per beat: list of items; durations: 'auto' items share what is left after the fixed ones
PLAN={'hook':[('hangar',None,None,None,None,None,3.0),('clip',EL,847.3,852.8,.55,False,'auto')],   # tank intro, then the official shootout
 'what':[('map',0,None,None,None,None,'auto')],                                  # official Leonida map: route overview
 'step1':[('map',1,None,None,None,None,2.6),('still','Vice_City_10.jpg',.45,None,None,None,'auto')],
 'step2':[('still','Vice_City_09.jpg',.5,None,None,None,'auto')],
 'code1':[('map',2,None,None,None,None,2.8),('still','Leonida_Keys_01.jpg',.5,None,None,None,'auto')],
 'joke':[('still','Leonida_Keys_01.jpg',.62,None,None,None,'auto')],
 'alien':[('clip',EL,1320.5,1327.5,.5,False,'auto')],                           # dark corridor
 'code2':[('clip',EL,1334.5,1342.5,.5,False,'auto')],                           # dark office
 'obsess':[('dark',None,None,None,None,None,'auto')],
 'code3':[('map',3,None,None,None,None,2.8),('still','Mount_Kalaga_National_Park_03.jpg',.5,None,None,None,'auto')],
 'payoff':[('hangar',None,None,None,None,None,'auto')],
 'end':[('hangar_dim',None,None,None,None,None,'auto')]}
P=['-http_proxy',os.environ['HTTPS_PROXY'],'-ca_file','/root/.ccr/ca-bundle.crt']
segs=[]
for beat,items in PLAN.items():
    total=B[beat]['end']-B[beat]['start']+(TAIL if beat=='end' else 0)
    fixed=sum(it[6] for it in items if it[6]!='auto'); autos=[it for it in items if it[6]=='auto']
    for i,it in enumerate(items):
        kind=it[0]; dur=it[6] if it[6]!='auto' else (total-fixed)/len(autos)
        if kind=='clip':
            _,u,s,e,cx,rev,_=it; k=dur/(e-s); out=f'seg_{beat}_{i}.mp4'
            vf=f"crop=ih*9/16:ih:'min(max({cx}*iw-ih*9/32,0),iw-ih*9/16)':0,scale=1080:1920:flags=lanczos,"+("reverse," if rev else "")+f"setpts={k:.4f}*PTS,fps=30"
            subprocess.run(['ffmpeg','-v','error','-y',*P,'-ss',str(s),'-t',str(e-s),'-i',u,'-an','-vf',vf,'-c:v','libx264','-crf','17','-preset','fast',out],check=True)
            segs.append(dict(beat=beat,kind='clip',file=out,dur=round(dur,3)))
            print(beat,'clip',round(e-s,2),'->',round(dur,2),'speed',round(1/k,2))
        elif kind=='still': segs.append(dict(beat=beat,kind='still',path=shot(it[1]),cx=it[2],dur=round(dur,3)))
        elif kind in ('route','map'): segs.append(dict(beat=beat,kind=kind,stage=it[1],dur=round(dur,3)))
        else: segs.append(dict(beat=beat,kind=kind,dur=round(dur,3)))
json.dump(segs,open('segs.json','w'),indent=1)
