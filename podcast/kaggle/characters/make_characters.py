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

# SDXL reads at most 77 tokens per text encoder: character details go in `prompt`, the art style in `prompt_2`.
STYLE = ("2D illustrated character art, bold clean ink outlines, flat bright colors with soft cel shading, "
         "exaggerated cartoon proportions, animation character design, half-body portrait, front view")
NEG = ("photo, realistic, 3d render, sepia, monochrome, beige background, pencil sketch, logo, brand, text, "
       "watermark, signature, deformed, extra fingers, blurry, multiple people")
HOSTS = {
  "genius": ("cartoon caricature of a nerdy Indian man, big round black glasses, messy curly black hair sticking up, "
             "worried raised eyebrows, thin long face, pen behind ear, white shirt, maroon tie, brown suspenders, "
             "flat teal background"),
  "questioner": ("cartoon caricature of a chubby Indian man, beige baseball cap, smug half smile, half-closed eyes, "
                 "short goatee, round face, red and black track jacket, arms crossed, flat red background"),
}
os.makedirs("/kaggle/working", exist_ok=True)
for name, desc in HOSTS.items():
    tiles = []
    for seed in [11, 22, 33, 44]:
        s = time.time()
        img = pipe(prompt=desc, prompt_2=STYLE, negative_prompt=NEG, width=832, height=1216,
                   num_inference_steps=30, guidance_scale=7.5,
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
