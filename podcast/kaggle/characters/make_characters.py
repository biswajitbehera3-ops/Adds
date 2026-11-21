# 3D podcast-studio view with both hosts, plus the empty studio as a background plate. SDXL 1.0 (OpenRAIL++-M, commercial use allowed).
# Text-to-image only: the user's reference pictures guided the written description; they are not fed to the model.
# SDXL reads at most 77 tokens per text encoder: subjects go in `prompt`, setting and look in `prompt_2`.
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

NEG = ("text, letters, logo, watermark, signature, brand, 2d, flat illustration, sketch, photo, realistic skin, "
       "deformed, extra limbs, extra fingers, extra people, blurry, lowres")
LOOK = "Pixar-style 3D animated movie still, soft global illumination, subsurface skin, stylized proportions, high detail"
JOBS = {
  "studio": dict(w=1344, h=768, seeds=[1, 2, 3, 4, 5, 6],
    prompt=("two cartoon Indian men sitting in blue armchairs facing each other across a small round wooden table "
            "with two podcast microphones. Left: thin nerdy man, big round glasses, curly black hair, white shirt, "
            "maroon tie, suspenders. Right: chubby man, beige cap, goatee, red and black track jacket, arms crossed"),
    prompt_2=(LOOK + ", dark navy podcast studio, deep blue velvet curtains, two black pendant lamps with warm glow, "
              "yellow cushions, headphones and a mug on the table, yellow LED strip along the stage floor, wide shot")),
  "studio_empty": dict(w=1344, h=768, seeds=[1, 2],
    prompt=("empty podcast studio set, two blue armchairs with yellow cushions facing each other across a small round "
            "wooden table with two podcast microphones, headphones and a mug, nobody in the room"),
    prompt_2=(LOOK + ", dark navy studio, deep blue velvet curtains, two black pendant lamps with warm glow, "
              "yellow LED strip along the stage floor, wide shot")),
}
os.makedirs("/kaggle/working", exist_ok=True)
for name, j in JOBS.items():
    tiles = []
    for seed in j["seeds"]:
        s = time.time()
        img = pipe(prompt=j["prompt"], prompt_2=j["prompt_2"], negative_prompt=NEG, width=j["w"], height=j["h"],
                   num_inference_steps=32, guidance_scale=7.0,
                   generator=torch.Generator("cuda").manual_seed(seed)).images[0]
        img.save(f"/kaggle/working/{name}_seed{seed}.png"); tiles.append((seed, img))
        print(f"{name} seed {seed}: {time.time()-s:.0f}s", flush=True)
    cols = 3 if name == "studio" else 2
    rows = (len(tiles) + cols - 1) // cols
    W, H = j["w"] // 2, j["h"] // 2
    sheet = Image.new("RGB", (W * cols, (H + 30) * rows), "white"); d = ImageDraw.Draw(sheet)
    for i, (seed, im) in enumerate(tiles):
        x, y = (i % cols) * W, (i // cols) * (H + 30)
        d.text((x + 10, y + 8), f"{name} option {i+1} (seed {seed})", fill="black")
        sheet.paste(im.resize((W, H)), (x, y + 30))
    sheet.save(f"/kaggle/working/{name}_options.jpg", quality=90)
print(f"TOTAL {time.time()-t0:.0f}s")
