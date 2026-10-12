"""Encode official book assets and locally upscaled pages for the website."""
from pathlib import Path
from PIL import Image
import re
import urllib.request
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
DOWNLOADS = Path.home() / 'Downloads'
UPSCALED = Path.home() / '.codex/artifacts/recomeco/upscale'
PAGES = ASSETS / 'pages'
PAGES.mkdir(exist_ok=True)

# Encoding only: cover and logo retain their original dimensions/composition.
for source_name, target_name in [
    ('capa do livro o deus de processo.png', 'capa-original.webp'),
    ('logo comunidade felipe rissi.png', 'logo-comunidade.webp'),
]:
    with Image.open(DOWNLOADS / source_name) as image:
        image.convert('RGB').save(ASSETS / target_name, 'WEBP', quality=95, method=6)
        print(f'{target_name}: {image.size}')

page_sources = {
    108: 'WhatsApp Image 2026-10-12 at 20.08.47.jpeg',
    109: 'WhatsApp Image 2026-10-12 at 20.08.48.jpeg',
    110: 'WhatsApp Image 2026-10-12 at 20.08.48 (1).jpeg',
    111: 'WhatsApp Image 2026-10-12 at 20.08.48 (2).jpeg',
}
page_records = []
for number, original_name in page_sources.items():
    with Image.open(UPSCALED / f'pagina-{number}.png') as image:
        target = PAGES / f'pagina-{number}.webp'
        image.save(target, 'WEBP', lossless=True, method=6)
        # Small previews load in the carousel; the lossless 4x file opens on demand.
        preview = PAGES / f'pagina-{number}-preview.webp'
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(target), '-vf', 'scale=912:-1:flags=lanczos', '-c:v', 'libwebp', '-quality', '94', str(preview)], check=True)
        with Image.open(DOWNLOADS / original_name) as original:
            assert image.size == (original.width * 4, original.height * 4)
            page_records.append({'page': number, 'original': original_name, 'originalSize': original.size, 'size': image.size, 'file': f'assets/pages/pagina-{number}.webp', 'preview': f'assets/pages/pagina-{number}-preview.webp', 'upscale': 'Real-ESRGAN ncnn Vulkan, realesrgan-x4plus, 4x', 'encoding': 'lossless WebP'})
        print(f'{target.name}: {image.size}, {target.stat().st_size:,} bytes')

fonts = ASSETS / 'fonts'
css_url = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}
css = urllib.request.urlopen(urllib.request.Request(css_url, headers=headers)).read().decode()
blocks = re.findall(r'/\* latin \*/\s*(@font-face\s*\{[^}]+\})', css)
for style, filename in [('normal', 'lora-latin.woff2'), ('italic', 'lora-italic-latin.woff2')]:
    block = next(block for block in blocks if f'font-style: {style}' in block)
    font_url = re.search(r'url\(([^)]+)\)', block).group(1)
    (fonts / filename).write_bytes(urllib.request.urlopen(font_url).read())
    print(f'{filename}: {(fonts / filename).stat().st_size:,} bytes')
(fonts / 'lora-OFL.txt').write_bytes(urllib.request.urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/lora/OFL.txt').read())
(ASSETS / 'book-media-ledger.json').write_text(json.dumps({
    'cover': {'file': 'assets/capa-original.webp', 'source': 'capa do livro o deus de processo.png', 'official': True},
    'communityLogo': {'file': 'assets/logo-comunidade.webp', 'source': 'logo comunidade felipe rissi.png', 'official': True},
    'pages': page_records,
    'readingGroups': [[108, 109], [110, 111]],
}, ensure_ascii=False, indent=2), encoding='utf-8')
