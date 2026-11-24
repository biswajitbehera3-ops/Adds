"""Short 044 v2 (retention cut) clip cutter. Bounds below are already trimmed clear of neighbouring shots.
Run inside the work dir that holds vo.json; writes seg_*.mp4 + segs.json."""
import json, subprocess, os
R='https://media-rockstargames-com.akamaized.net/VI/downloads/videos/'
EL=R+'GTAVI_An_Extended_Look/GTAVI_An_Extended_Look.mp4'; T1=R+'GTAVI_Trailer_1/GTAVI_Trailer_1.mp4'
T2=R+'GTAVI_Trailer_2/GTAVI_Trailer_2.mp4'; LT=R+'GTAVI_Launch_Trailer/GTAVI_Launch_Trailer.mp4'
BOX={T2:(216,1728),LT:(120,1920)}   # letterbox (top, active height)
B={b['beat']:b for b in json.load(open('vo.json'))['beats']}
MAP=1.6
PLAN={'hook':[(T1,23.45,24.75,.58),(T1,76.75,78.45,.5),(EL,1036.1,1037.3,.4),(T2,140.55,141.3,.55)],  # speedboat; store robbery; under water; jet ski
 'proof':[(T1,35.65,37.35,.5),(T2,6.55,7.95,.5)],
 'shop':[(LT,3.45,4.75,.55),'MAP',(LT,5.1,6.7,.45)],
 'boat':[(EL,1551.0,1552.3,.5),(EL,1572.8,1576.05,.55)],
 'dive':[(EL,1042.4,1044.75,.5),(EL,1037.3,1038.45,.4)],
 'shark':[(EL,1045.1,1046.7,.45),(T2,139.3,139.95,.55)],
 'sell':[(EL,1048.95,1050.9,.55),(LT,7.1,8.65,.55)],
 'payoff':[(T1,11.1,12.1,.45),(LT,14.3,14.9,.45),(T1,12.45,14.35,.5),(LT,10.05,11.6,.5)],
 'track':[(LT,12.0,14.1,.6),(T1,19.5,20.6,.5),(T1,20.8,21.6,.5),(EL,1571.35,1572.4,.5)]}   # marina; wetland; flamingos; sunset skyline
P=['-http_proxy',os.environ['HTTPS_PROXY'],'-ca_file','/root/.ccr/ca-bundle.crt']
segs=[]
for beat,cl in PLAN.items():
    real=[c for c in cl if c!='MAP']
    need=B[beat]['end']-B[beat]['start']-(MAP if 'MAP' in cl else 0)
    if beat=='hook': need+=B['hook']['start']          # hook clips start at frame 0
    if beat=='track': need+=1.2                      # hold the last shot under the fade-out
    src=sum(e-s for _,s,e,_ in real); k=need/src
    for i,c in enumerate(cl):
        if c=='MAP': segs.append(dict(beat=beat,map=MAP)); continue
        u,s,e,cx=c; out=f'seg_{beat}_{i}.mp4'; d=e-s
        y0,h=BOX.get(u,(0,2160)); w=h*9//16
        crop=f"crop={w}:{h}:'min(max({cx}*iw-{w//2},0),iw-{w})':{y0}"
        subprocess.run(['ffmpeg','-v','error','-y',*P,'-ss',str(s),'-t',str(d),'-i',u,'-an',
            '-vf',f"{crop},scale=1080:1920:flags=lanczos,setpts={k:.4f}*PTS,fps=30",'-c:v','libx264','-crf','17','-preset','fast',out],check=True)
        segs.append(dict(beat=beat,file=out,dur=round(d*k,3)))
    print(beat,'need',round(need,2),'src',round(src,2),'speed',round(1/k,2))
json.dump(segs,open('segs.json','w'),indent=1)
