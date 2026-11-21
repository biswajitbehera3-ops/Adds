# Generate a single podcast microphone on a desk boom stand (SDXL 1.0, OpenRAIL++-M), then cut out its
# background with rembg (MIT). The cut-outs get composited onto the studio table outside Kaggle.
import subprocess, time
t0 = time.time()
subprocess.run("pip install -q -U diffusers transformers accelerate 'rembg[gpu]' onnxruntime-gpu", shell=True, timeout=900)
import torch
from diffusers import StableDiffusionXLPipeline, AutoencoderKL
from PIL import Image, ImageDraw
from rembg import remove, new_session
vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", vae=vae,
       torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
P1 = ("a single professional podcast microphone with black foam windscreen on a short black desk boom arm stand "
      "with a round heavy base, side view, microphone pointing to the left, whole object visible")
P2 = ("Pixar-style 3D animated movie prop, warm soft studio light from above, product shot, "
      "plain light grey seamless background, centered, high detail")
NEG = "text, logo, watermark, people, hands, multiple microphones, cropped, cut off, blurry, lowres, table, desk"
session = new_session("isnet-general-use")
tiles = []
for seed in [1, 2, 3, 4, 5, 6]:
    img = pipe(prompt=P1, prompt_2=P2, negative_prompt=NEG, width=1024, height=1024, num_inference_steps=32,
               guidance_scale=7.0, generator=torch.Generator("cuda").manual_seed(seed)).images[0]
    img.save(f"/kaggle/working/mic_seed{seed}.png")
    cut = remove(img, session=session); cut.save(f"/kaggle/working/mic_seed{seed}_cutout.png")
    tiles.append((seed, img, cut)); print(f"mic seed {seed}: {time.time()-t0:.0f}s", flush=True)
sheet = Image.new("RGB", (512 * 6, 1024 + 30), "white"); d = ImageDraw.Draw(sheet)
for i, (seed, img, cut) in enumerate(tiles):
    d.text((i * 512 + 8, 8), f"option {i+1} (seed {seed})", fill="black")
    sheet.paste(img.resize((512, 512)), (i * 512, 30))
    bg = Image.new("RGBA", cut.size, (30, 40, 70, 255)); bg.alpha_composite(cut)
    sheet.paste(bg.convert("RGB").resize((512, 512)), (i * 512, 542))
sheet.save("/kaggle/working/mic_sprite_options.jpg", quality=90)
print(f"TOTAL {time.time()-t0:.0f}s")
