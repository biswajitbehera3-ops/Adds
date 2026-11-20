# like build_raw.py, but the audio comes from the separate audio_only track (the 1080p chunks sometimes lose sound)
import sys, os, subprocess, math
B='https://d2vi6trrdongqn.cloudfront.net/ac813018b92ff81dafc2_kaicenat_321440808416_1795006791'
name=sys.argv[1]; pieces=[tuple(map(float,p.split(':'))) for p in sys.argv[2:]]
parts=[]
for k,(a,b) in enumerate(pieces):
    s0,s1=int(a//10),int(math.ceil(b/10)); d=b-a
    for q in ('chunked','audio_only'):
        segs=[f'{name}_{q}_{i}.ts' for i in range(s0,s1)]
        for i,f in zip(range(s0,s1),segs):
            subprocess.run(['curl','-s','--retry','3','-m','90','-o',f,f'{B}/{q}/{i}.ts'],check=True)
        with open(f'{name}_{q}.txt','w') as fh: fh.writelines(f"file '{os.path.abspath(f)}'\n" for f in segs)
    out=f'{name}_p{k}.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'{name}_chunked.txt','-f','concat','-safe','0','-i',f'{name}_audio_only.txt',
        '-ss',str(a-s0*10),'-t',str(d),'-map','0:v','-map','1:a',
        '-c:v','libx264','-crf','17','-preset','fast','-r','60','-c:a','aac','-b:a','192k','-ar','48000',
        '-af',f'afade=t=in:d=0.04,afade=t=out:st={d-0.04:.2f}:d=0.04',out],check=True)
    for q in ('chunked','audio_only'):
        for i in range(s0,s1): os.remove(f'{name}_{q}_{i}.ts')
        os.remove(f'{name}_{q}.txt')
    parts.append(out)
with open(f'{name}_parts.txt','w') as fh: fh.writelines(f"file '{os.path.abspath(p)}'\n" for p in parts)
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'{name}_parts.txt','-c','copy',f'{name}_raw.mp4'],check=True)
for p in parts: os.remove(p)
os.remove(f'{name}_parts.txt')
print(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{name}_raw.mp4'],capture_output=True,text=True).stdout.strip())
