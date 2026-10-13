# Revisão do redesign

## Web Interface Guidelines

- `index.html`: ✓ estrutura semântica, título único, alt e dimensões nas imagens,
  skip link, navegação real, FAQ e jornadas operáveis por teclado.
- `styles.css`: ✓ foco visível, contraste legível, ações com área de toque de 44px,
  redução de movimento, safe areas, tipografia e layout responsivo.
- `app.js`: ✓ configuração vazia tratada, player sem carregamento antecipado,
  foco após interação, títulos de mídia e suporte a legendas em vídeo direto.
- `gallery.js`: ✓ livro com virada 3D, troca por botões, teclado e deslize,
  dia 3 indicado na terceira imagem, sem folhas antigas após cliques rápidos.
  Diálogo com foco contido, Escape, retorno do foco e zoom preservados.
  Carrossel independente de 3 trechos no iPad, respeitando movimento reduzido.
- `editorial.css`: ✓ moldura de iPad sem texto cortado, livro grande,
  ícones sem emojis, retrato real do autor, hero com enquadramento mobile.

## Verificação no navegador

Copy revisada conforme `ajustes copy lp efa.docx`, fornecido em 12/10/2026.
Títulos, benefícios, jornadas, comunidade, oferta, FAQ, mensagem do autor e
metadados atualizados. Quebras e larguras ajustadas para os textos novos;
verificação nos quatro tamanhos abaixo passou após a atualização.

Chrome: 1440px, 768px, 390px e 320px. Sem rolagem horizontal, imagens quebradas,
erros JavaScript ou respostas HTTP de erro. Jornadas, FAQ, âncoras e endereço de
checkout verificados. Incorporação da VSL validada com recurso de teste local.
Revisão visual feita em capturas desktop e mobile. Capa original, logo, 7
benefícios e lives diárias verificados. Páginas ampliadas em 4x, nos pares 108–109
e 110–111, com imagens grandes carregadas somente ao abrir o visualizador.
Os 3 trechos do iPad cabem em 320, 390, 768 e 1440px. Deslize real simulado
no Chrome mobile muda a página sem abrir a ampliação. Virada inspecionada
também durante o movimento; modo de movimento reduzido verificado.

## Pendências externas

- VSL: YouTube `KtIwh-f2Ysc`, carregado após clique; vertical no mobile.
- Tipografia atual: Lora e Manrope, conforme o pedido de fonte mais séria.
- Order bump: a apresentação na LP não configura a seleção/cobrança de comunidade
  na plataforma externa; essa configuração deve existir no checkout.

A imagem de Jesus é ilustrativa; capa, logo e páginas são fornecidas pelo usuário.
Sem depoimentos, urgência,
garantia, números de clientes ou promessas de resultado inventados.
