import subprocess, os
subprocess.run("pip install -q -U huggingface_hub", shell=True)
from huggingface_hub import snapshot_download
p = snapshot_download("KlingTeam/LivePortrait", local_dir="/kaggle/tmp/pw",
    ignore_patterns=["*.git*", "README.md", "docs/*", "liveportrait_animals/*"])
subprocess.run("cd /kaggle/tmp/pw && tar czf /kaggle/working/lp_weights.tgz . && ls -la /kaggle/working && find . -type f | head -40", shell=True)
