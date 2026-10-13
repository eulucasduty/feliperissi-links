# Deus de Processos — landing page

Landing page estática do ebook de Felipe Rissi e da comunidade PROCESSOS no WhatsApp.

- `index.html`: estrutura e conteúdo da página.
- `styles.css`: identidade visual e layout responsivo.
- `editorial.css`: hero histórica, livro com virada de páginas e moldura de iPad.
- `app.js`: integração do player e aplicação da configuração.
- `gallery.js`: carrossel de leituras e visualizador ampliado das páginas.
- `config.js`: link de checkout e configuração da VSL.
- `assets/`: imagens da página.
- `vercel.json`: configuração própria desta landing page.

## Publicação

Projeto Vercel: `feliperissi-recomeco`.
Repositório: `eulucasduty/feliperissi-links`, branch de produção `main`.
Root Directory na Vercel: `livro-felipe`.
Endereço: https://recomeço.feliperissi.com.br
Hostname ASCII equivalente: `xn--recomeo-zxa.feliperissi.com.br`.

Os pushes para `main` publicam a landing page pela integração com o GitHub.

## Desenvolvimento local

Na raiz do repositório, execute `python -m http.server 8000 --bind 127.0.0.1`
e abra http://localhost:8000/livro-felipe/.

## Checkout

O link do ebook fica em `checkoutUrl` em `config.js`. A comunidade é apresentada
como adicional opcional de R$ 9,99; a seleção e a cobrança devem estar configuradas
como order bump na plataforma de checkout, não na landing page.

## VSL

VSL atual: `assets/vsl-deus-de-processos.mp4`, hospedada junto da LP.
Vídeo fornecido pelo usuário, convertido para MP4 H.264/AAC em 720p e 30 fps,
com `faststart`. O player abre após o clique, em 16:9 também no mobile;
o arquivo não é solicitado na abertura da página. As legendas já fazem parte
da imagem do vídeo fornecido.
Interface própria com pausar/continuar e barra de progresso sem controles
nativos. A barra usa uma curva visual que avança rápido no começo e desacelera;
acompanha o tempo reproduzido, para durante pausas/carregamento e só completa
ao terminar. O progresso acessível informa a posição real no vídeo.
Enquanto `vsl.url` estiver vazio, a hero exibe uma
imagem editorial com link real para o primeiro dia, sem controles de vídeo falsos.
Para integrar, preencha em `config.js`:

```js
vsl: {
  type: "embed", // URL de incorporação do player, não o link da página do vídeo.
  url: "https://player.exemplo.com/embed/VIDEO_ID",
  captionsUrl: ""
}
```

Para MP4/WebM direto, use `type: "video"` e indique legendas WebVTT em
`captionsUrl`. O player é carregado somente após o clique.

## Design e imagens

`design.md` registra a direção visual. As fontes Lora e Manrope são locais,
com licenças em `assets/fonts/`. A capa do ebook e a logo da comunidade são
originais, fornecidas pelo usuário. A comunidade no WhatsApp inclui lives diárias.
Os 7 benefícios do ebook são os fornecidos no print.

As páginas 108–109 (dia 2) e 110–111 (dia 3) aparecem uma por vez, em tamanho grande,
com virada em perspectiva. Há botões, navegação por teclado e deslize no celular.
A terceira foto inicia o dia 3, indicado acima do livro. Cada página também abre
em um visualizador com zoom, Escape e retorno do foco.
O primeiro dia possui um segundo carrossel: três trechos dentro de uma moldura
de iPad, com botões, teclado e deslize. As animações respeitam movimento reduzido.
A ampliação das páginas foi feita localmente em 4x com `realesrgan-ncnn-vulkan`, modelo
`realesrgan-x4plus`. O comando `/upscale` não estava instalado neste ambiente.
As imagens ampliadas ficam em `assets/pages/` como WebP sem perdas; prévias
menores carregam no carrossel. A proveniência fica em `assets/book-media-ledger.json`.

A hero usa `hero desktop.jpeg`, com enquadramento próprio no mobile e WebP.
A foto do autor é `efa foto perfil.jpeg`, apresentada como retrato circular.
Os benefícios da comunidade usam ícones Phosphor duotone, hospedados localmente
com licença MIT. Proveniência: `assets/editorial-media-ledger.json`.

## Verificação

Com o servidor local ativo, execute `python livro-felipe/scripts/check-page.py`
na raiz do repositório. O script usa Playwright e Chrome instalado; verifica
desktop, tablet, mobile, links, jornadas, FAQ, imagens e player configurado.
Capturas ficam em `~/.codex/artifacts/recomeco/`, fora do repositório.
