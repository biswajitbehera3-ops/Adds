import json, subprocess, os
EL='https://media-rockstargames-com.akamaized.net/VI/downloads/videos/GTAVI_An_Extended_Look/GTAVI_An_Extended_Look.mp4'
T2='https://media-rockstargames-com.akamaized.net/VI/downloads/videos/GTAVI_Trailer_2/GTAVI_Trailer_2.mp4'
B={b['beat']:b for b in json.load(open('vo.json'))['beats']}
# beat -> list of (src, start, end, crop centre x)
PLAN={'blue':[(EL,440.0,445.8,.50)],
 'parrot':[(EL,706.0,712.5,.50),(EL,713.0,715.8,.48)],
 'parachute':[(T2,19.0,23.0,.45)],          # + map pin added in the render
 'guns':[(EL,576.0,582.3,.56),(EL,549.6,551.9,.55)],
 'watson':[(EL,1030.0,1032.9,.50),(EL,1033.0,1036.0,.45),(T2,81.5,83.4,.50),(T2,83.5,85.4,.50)],
 'jets':[(EL,1171.0,1174.0,.50),(EL,1176.0,1179.5,.42)],
 'vault':[(EL,1052.0,1056.9,.50)],
 'close':[(EL,745.0,748.0,.50)]}
EXTRA={'parachute':1.9}   # seconds of map at the end of the beat
P=['-http_proxy',os.environ['HTTPS_PROXY'],'-ca_file','/root/.ccr/ca-bundle.crt']
segs=[]
for beat,cl in PLAN.items():
    need=B[beat]['end']-B[beat]['start']-EXTRA.get(beat,0); src=sum(e-s for _,s,e,_ in cl); k=need/src
    for i,(u,s,e,cx) in enumerate(cl):
        out=f'seg_{beat}_{i}.mp4'; d=e-s
        crop=f"crop=1215:2160:'min(max({cx}*iw-607,0),iw-1215)':0"
        subprocess.run(['ffmpeg','-v','error','-y',*P,'-ss',str(s),'-t',str(d),'-i',u,'-an',
            '-vf',f"{crop},scale=1080:1920:flags=lanczos,setpts={k:.4f}*PTS,fps=30",'-c:v','libx264','-crf','17','-preset','fast',out],check=True)
        segs.append(dict(beat=beat,file=out,dur=round(d*k,3)))
    print(beat,'need',round(need,2),'src',round(src,2),'speed',round(1/k,2))
json.dump(segs,open('segs.json','w'),indent=1)
