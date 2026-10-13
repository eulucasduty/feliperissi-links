"""Prepare local, user-supplied and generated assets; retain original composition."""
from pathlib import Path
from PIL import Image
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
GENERATED = Path('C:/Users/User/.codex/generated_images/01a13109-91ca-7390-91cc-6ac3df020e38')
IMAGES = {
    'recomeco-jesus': (GENERATED / 'exec-4f88c82d-6cea-4b99-b167-45b066a1bb5a.png', 1672),
}
ASSETS.mkdir(exist_ok=True)
for name, (source, width) in IMAGES.items():
    with Image.open(source) as img:
        img = img.convert('RGB')
        if img.width > width:
            img = img.resize((width, round(img.height * width / img.width)), Image.Resampling.LANCZOS)
        target = ASSETS / f'{name}.webp'
        img.save(target, 'WEBP', quality=87, method=6)
        print(f'{target.name}: {img.width}x{img.height}, {target.stat().st_size:,} bytes')

fonts = ASSETS / 'fonts'
fonts.mkdir(exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}
css_url = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap'
css = urllib.request.urlopen(urllib.request.Request(css_url, headers=headers)).read().decode()
for family, slug in [('Manrope', 'manrope')]:
    blocks = re.findall(r'/\* latin \*/\s*(@font-face\s*\{[^}]+\})', css)
    block = next(block for block in blocks if f"font-family: '{family}'" in block)
    font_url = re.search(r'url\(([^)]+)\)', block).group(1)
    target = fonts / f'{slug}-latin.woff2'
    target.write_bytes(urllib.request.urlopen(font_url).read())
    license_url = f'https://raw.githubusercontent.com/google/fonts/main/ofl/{slug}/OFL.txt'
    (fonts / f'{slug}-OFL.txt').write_bytes(urllib.request.urlopen(license_url).read())
    print(f'{target.name}: {target.stat().st_size:,} bytes')
