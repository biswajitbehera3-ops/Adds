# Podcast pipeline test 1: confirm the free GPU + generate two host voice lines (Kokoro TTS, Apache-2.0).
import subprocess, time, json, os
t0 = time.time()
def sh(c, t=600):
    print("$", c, flush=True)
    try:
        r = subprocess.run(c, shell=True, capture_output=True, text=True, timeout=t)
        print((r.stdout + r.stderr)[-3000:], flush=True)
    except subprocess.TimeoutExpired:
        print("TIMEOUT after", t, "s", flush=True)
sh("curl -s -o /dev/null -w 'internet check: HTTP %{http_code}' https://pypi.org/simple/kokoro/", 30)
sh("nvidia-smi")
sh("apt-get -qq install -y espeak-ng > /dev/null && echo espeak ok")
sh("pip install -q 'kokoro>=0.9.4' soundfile 2>&1 | tail -2")
import torch, soundfile as sf
from kokoro import KPipeline
print("CUDA:", torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "")
pipe = KPipeline(lang_code="a")
lines = [
  ("am_michael", "professor", "Actually, that company didn't lose ten billion dollars in a day. It lost nine point eight. Precision matters."),
  ("am_puck", "wildcard", "Bro, he just corrected a ten billion dollar disaster by two hundred million. That's the most professor thing ever!"),
]
os.makedirs("/kaggle/working", exist_ok=True)
for voice, name, text in lines:
    s = time.time()
    audio = [a for _, _, a in pipe(text, voice=voice, speed=1.0)]
    import numpy as np
    wav = np.concatenate([a.cpu().numpy() if hasattr(a, "cpu") else a for a in audio])
    sf.write(f"/kaggle/working/{name}.wav", wav, 24000)
    print(name, voice, f"{len(wav)/24000:.1f}s audio in {time.time()-s:.1f}s")
print(f"TOTAL {time.time()-t0:.0f}s")
