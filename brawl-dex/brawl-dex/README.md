# BrawlDex – Guia de Brawlers

Aplicação web responsiva (tema Brawl Stars) que consome a **API Brawlify** (`https://api.brawlapi.com/v1/brawlers`) com JavaScript puro.

## Funcionalidades
- Lista dinâmica de brawlers com imagem, nome e raridade
- Busca por nome, filtro por raridade e ordenação
- Detalhes (descrição, gadgets e star powers) em modal acessível (`<dialog>`)
- Estados de carregamento (skeleton), erro com "Tentar de novo" e cache na sessão
- Layout mobile-first, acessível (labels, foco visível, `aria-live`, reduced motion) e leve (sem frameworks)

## Como rodar
Abra `index.html` no navegador ou use um servidor estático (`npx serve .`).

## Publicação (GitHub Pages)
Settings → Pages → Branch `main` / pasta `/ (root)`.

## Tecnologias
HTML5, CSS3, JavaScript (fetch/async-await), Google Fonts (Lilita One, Nunito).
