$ErrorActionPreference = 'Stop'
$assetRoot = Join-Path (Split-Path -Parent $PSScriptRoot) 'assets'
$downloadsDir = Join-Path $env:USERPROFILE 'Downloads'
& ffmpeg -hide_banner -loglevel error -y -i (Join-Path $downloadsDir 'hero desktop.jpeg') -c:v libwebp -quality 92 (Join-Path $assetRoot 'hero-historico-desktop.webp')
if ($LASTEXITCODE -ne 0) { throw 'Falha na imagem desktop' }
& ffmpeg -hide_banner -loglevel error -y -i (Join-Path $downloadsDir 'hero desktop.jpeg') -vf 'crop=608:900:992:0' -c:v libwebp -quality 92 (Join-Path $assetRoot 'hero-historico-mobile.webp')
if ($LASTEXITCODE -ne 0) { throw 'Falha no enquadramento mobile' }
& ffmpeg -hide_banner -loglevel error -y -i (Join-Path $downloadsDir 'efa foto perfil.jpeg') -vf 'scale=512:-1:flags=lanczos' -c:v libwebp -quality 94 (Join-Path $assetRoot 'felipe-rissi-perfil.webp')
if ($LASTEXITCODE -ne 0) { throw 'Falha na foto do autor' }
