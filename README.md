# Daphne Binder — Portfólio 3D

Site-portfólio da designer **Daphne Binder** (desde 2015), feito a partir do portfólio original em PDF.
A identidade foi mantida: rosa `#F3CEF0` + grafite `#1A1A1A`, fonte arredondada (Baloo 2), os cartões de título
rosa entre as seções e o selo **“GRAPHICS BY DAPHNE BINDER • SINCE 2015”** com o Totoro da capa.

> O Totoro vem da arte do portfólio original (`public/brand/`, extraída da capa do PDF). O personagem é
> propriedade do Studio Ghibli; o uso aqui segue a escolha da própria Daphne na identidade dela.

## O que tem

- **Vídeo de introdução** (10 s), renderizado a partir de uma cena 3D: partículas formam o selo, a câmera voa por
  um túnel com os trabalhos, o selo gira até a frente, o Totoro 3D salta para dentro dele e o nome aparece. Versões horizontal (desktop) e vertical (celular/Reels).
  Toca uma vez por sessão, dá para pular e respeita “reduzir movimento”.
- **Hero 3D**: o Totoro em 3D (modelado em código, `src/three/Totoro3D.jsx`) na frente do selo da Daphne em
  forma de medalha, como no logo dela. Ele acompanha o mouse, respira, pisca e mexe as orelhas; em volta, um anel
  com as áreas de atuação e trabalhos flutuando.
  Atrás do título, o selo gigante em tom sobre tom, como na capa do PDF.
- **Twitch Graphics**: carrossel 3D arrastável com os 7 boards (clique para ampliar).
- **Identidade Visual**: cards com inclinação 3D (iHeal, Artificers).
- **Mídia Kits**: galeria horizontal em “coverflow” 3D, fixada durante o scroll (no celular, rolagem lateral com o dedo).
- **Manu Vieira**: social media e assessoria 2021–2023.
- **UI/UX**: celulares 3D com as telas do Rastro e do Si.Go, mais o LockOn.
- Scroll suave (Lenis), animações (GSAP), lightbox, cursor personalizado e layout responsivo.

## Rodar localmente

```bash
npm install
npm run dev
```

- `/?nointro` abre o site sem a intro; `/?intro` força a intro.
- `/film.html` (só em dev) mostra a cena do filme de introdução tocando ao vivo.

## Deploy na Vercel

1. Na Vercel: **Add New → Project** e importe este repositório do GitHub.
2. O preset **Vite** é detectado sozinho (build `npm run build`, saída `dist`). Não precisa de variáveis de ambiente.
3. Clique em **Deploy**. Cada push na branch principal publica de novo.

## Editar conteúdo

- **Textos, links e trabalhos**: `src/data.js` (tudo em um arquivo só).
- **Imagens dos trabalhos**: `public/work/` (WebP recortados do PDF; para trocar, mantenha o mesmo nome ou
  atualize o caminho em `src/data.js`).
- **Cores e tipografia**: variáveis no topo de `src/styles.css`.
- **Totoro**: `public/brand/totoro-shape.png` (silhueta preenchida) e `totoro-detail.png` (corpo/olhos/marcas).
  São máscaras brancas com transparência, recoloridas via CSS (`src/components/Totoro.jsx`) e no 3D
  (`src/three/TotoroBadge.jsx`). As cores do Totoro 3D ficam no topo de `src/three/Totoro3D.jsx`.

## Regerar o vídeo de introdução

A cena fica em `src/film/Film.jsx` (roteiro de tempo comentado no topo). Depois de editar:

```bash
npm i -D playwright && npx playwright install chromium   # uma vez
npm run render:intro                                     # precisa de ffmpeg instalado
```

Gera em `src/assets/intro/` (o Vite publica com nome versionado, sem problema de cache): `intro-1080.mp4` / `intro-720.mp4` (16:9), `intro-vertical-1080.mp4` /
`intro-vertical-720.mp4` (9:16, bom para Instagram/TikTok), os posters e `public/og.jpg` (imagem de
compartilhamento). Use `-- --preview` para gerar só alguns quadros de conferência.

## Estrutura

```
src/
  App.jsx            scroll suave + animações de scroll
  data.js            todo o conteúdo
  components/        seções (Hero, About, Twitch, Identity, MediaKits, Manu, UIUX, Contact…)
  three/             cenas 3D (selo do Totoro, hero, carrossel, celulares)
  film/              cena do vídeo de introdução
scripts/render-intro.mjs   renderiza o vídeo quadro a quadro
```
