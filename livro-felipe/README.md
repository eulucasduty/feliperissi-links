# Deus de Processos — landing page

Landing page estática do ebook de Felipe Rissi e da comunidade PROCESSO.

- `index.html`: estrutura e conteúdo da página.
- `styles.css`: identidade visual e layout responsivo.
- `app.js`: integração do player e aplicação da configuração.
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

VSL atual: https://www.youtube.com/shorts/KtIwh-f2Ysc, incorporada na hero.
O player abre após o clique, com proporção vertical no mobile.
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

`design.md` registra a direção visual. As fontes DynaPuff e Manrope são locais,
com licenças em `assets/fonts/`. A fonte do print é uma referência aproximada,
pendente de identificação exata. As imagens novas estão em WebP. A representação
do ebook é ilustrativa, não uma nova capa oficial nem produto físico.

## Verificação

Com o servidor local ativo, execute `python livro-felipe/scripts/check-page.py`
na raiz do repositório. O script usa Playwright e Chrome instalado; verifica
desktop, tablet, mobile, links, jornadas, FAQ, imagens e player configurado.
Capturas ficam em `~/.codex/artifacts/recomeco/`, fora do repositório.
