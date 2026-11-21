# Generate original designs for the two podcast hosts with SDXL 1.0 (CreativeML OpenRAIL++-M: commercial use allowed).
# Text-to-image only: the user's reference pictures guided the written description, they are not fed to the model.
import subprocess, time, os
t0 = time.time()
subprocess.run("nvidia-smi --query-gpu=name,memory.total --format=csv", shell=True)
subprocess.run("pip install -q -U diffusers transformers accelerate", shell=True, timeout=900)
import torch
from diffusers import StableDiffusionXLPipeline, AutoencoderKL
from PIL import Image, ImageDraw

vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", vae=vae, torch_dtype=torch.float16,
    variant="fp16", use_safetensors=True).to("cuda")
print(f"model loaded in {time.time()-t0:.0f}s", flush=True)

STYLE = ("2D digital illustration, hand-drawn cartoon character, clean confident ink linework, "
         "flat muted colors with soft painterly shading, subtle paper grain texture, stylized proportions, "
         "expressive cartoon face, half-body portrait, centered, facing camera, plain flat background")
NEG = ("photo, photorealistic, 3d render, cgi, logo, brand, text, letters, watermark, signature, emblem, badge, "
       "deformed, extra fingers, extra arms, blurry, lowres, cropped head, multiple people, ugly")
HOSTS = {
  "genius": ("young Indian man around 30, warm brown skin, thin lanky build, long narrow face, "
             "messy curly black hair sticking up on top, big round thin black-rimmed glasses, "
             "large expressive dark brown eyes, worried raised eyebrows, pen tucked behind his ear, "
             "white collared shirt, maroon tie, brown suspenders, khaki jacket, "
             "plain flat muted teal background"),
  "questioner": ("chubby Indian man around 30, warm brown skin, big round body, round full face, "
                 "smug confident closed-mouth half smile, relaxed half-lidded eyes, thick dark eyebrows, short goatee, "
                 "beige baseball cap, plain red and black sporty track jacket with no logos, white t-shirt, arms crossed, "
                 "plain flat red background"),
}
os.makedirs("/kaggle/working", exist_ok=True)
for name, desc in HOSTS.items():
    tiles = []
    for seed in [11, 22, 33, 44]:
        s = time.time()
        img = pipe(prompt=f"{STYLE}, {desc}", negative_prompt=NEG, width=832, height=1216,
                   num_inference_steps=30, guidance_scale=6.5,
                   generator=torch.Generator("cuda").manual_seed(seed)).images[0]
        img.save(f"/kaggle/working/{name}_seed{seed}.png")
        tiles.append(img)
        print(f"{name} seed {seed}: {time.time()-s:.0f}s", flush=True)
    sheet = Image.new("RGB", (832 * 4, 1216 + 60), "white")
    d = ImageDraw.Draw(sheet)
    for i, im in enumerate(tiles):
        sheet.paste(im, (832 * i, 60)); d.text((832 * i + 20, 20), f"{name}  option {i+1} (seed {[11,22,33,44][i]})", fill="black")
    sheet.save(f"/kaggle/working/{name}_options.jpg", quality=90)
print(f"TOTAL {time.time()-t0:.0f}s")
