"""Short 044 clip cutter: official Rockstar shots (Extended Look, Trailers 1 & 2, Launch Trailer), none used in earlier videos,
matched to each voice-over line, cropped to 9:16 and speed-fitted. Run inside the work dir that holds vo.json."""
import json, subprocess, os
R='https://media-rockstargames-com.akamaized.net/VI/downloads/videos/'
EL=R+'GTAVI_An_Extended_Look/GTAVI_An_Extended_Look.mp4'; T1=R+'GTAVI_Trailer_1/GTAVI_Trailer_1.mp4'
T2=R+'GTAVI_Trailer_2/GTAVI_Trailer_2.mp4'; LT=R+'GTAVI_Launch_Trailer/GTAVI_Launch_Trailer.mp4'
B={b['beat']:b for b in json.load(open('vo.json'))['beats']}
MAP=1.9   # seconds of the official map with the Key Lento pin, inside the 'shop' beat
PLAN={'hook':[(T1,11.05,12.35,.45),(T1,23.4,25.0,.58)],            # aerial boat on turquoise sea; speedboat
 'count':[(T2,6.5,8.2,.5),(T1,35.6,37.6,.5)],                      # Keys aerial; Keys bridge + seaplane
 'shop':[(LT,3.4,5.0,.55),'MAP',(LT,5.05,6.95,.45)],               # "The Keys" sign; map pin; marina aerial
 'boat':[(EL,1550.95,1552.55,.5),(EL,1572.75,1576.3,.55)],         # boat at sea; anchored boat
 'dive':[(EL,1042.35,1045.0,.5),(EL,1036.05,1038.7,.4)],           # dock dive; underwater cave diver
 'wrecks':[(LT,14.25,15.15,.45),(T1,12.4,14.6,.5),(LT,10.0,11.85,.5)],
 'sell':[(EL,1048.9,1051.15,.55),(LT,7.05,8.9,.55)],               # kayak; boat polish
 'shark':[(T2,140.5,141.55,.55),(T2,139.25,140.2,.55)],            # jet ski; boat spray
 'close':[(EL,1045.05,1046.95,.45),(EL,1571.3,1572.65,.5)]}        # sunset jet skis; skyline
BOX={T2:(216,1728),LT:(120,1920)}   # letterbox: (top, active height); others are full 2160
P=['-http_proxy',os.environ['HTTPS_PROXY'],'-ca_file','/root/.ccr/ca-bundle.crt']
segs=[]
for beat,cl in PLAN.items():
    real=[c for c in cl if c!='MAP']
    need=B[beat]['end']-B[beat]['start']-(MAP if 'MAP' in cl else 0); src=sum(e-s-0.3 for _,s,e,_ in real); k=need/src
    for i,c in enumerate(cl):
        if c=='MAP': segs.append(dict(beat=beat,map=MAP)); continue
        u,s,e,cx=c; out=f'seg_{beat}_{i}.mp4'; s+=0.05; e-=0.25; d=e-s   # stay clear of the neighbouring shots
        y0,h=BOX.get(u,(0,2160)); w=h*9//16
        crop=f"crop={w}:{h}:'min(max({cx}*iw-{w//2},0),iw-{w})':{y0}"
        subprocess.run(['ffmpeg','-v','error','-y',*P,'-ss',str(s),'-t',str(d),'-i',u,'-an',
            '-vf',f"{crop},scale=1080:1920:flags=lanczos,setpts={k:.4f}*PTS,fps=30",'-c:v','libx264','-crf','17','-preset','fast',out],check=True)
        segs.append(dict(beat=beat,file=out,dur=round(d*k,3)))
    print(beat,'need',round(need,2),'src',round(src,2),'speed',round(1/k,2))
json.dump(segs,open('segs.json','w'),indent=1)
