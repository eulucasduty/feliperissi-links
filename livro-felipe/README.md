# Deus de Processos — landing page

Landing page estática do ebook de Felipe Rissi e da comunidade PROCESSO.

- `index.html`: página, estilos e links de compra.
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

Os links ficam no objeto `LINKS`, ao final de `index.html`.
O ebook já possui link de checkout. O botão da comunidade ainda aponta para
`#oferta` e precisa do destino definitivo quando ele estiver disponível.
