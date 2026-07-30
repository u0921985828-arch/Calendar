# Publicar Neuroflow (que sea una URL real e instalable)

La app es estática y vive en `public/` (`demo.html` + PWA). No necesita servidor
para funcionar: calendario, desglose, foco, cifrado local y offline funcionan
solos. Tienes tres formas de publicarla; elige una.

## Opción A — GitHub Pages (ya configurado)
Hay un workflow en `.github/workflows/pages.yml` que publica `public/`.
Un único paso manual (una vez):
1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. El workflow corre solo en cada push de la rama; la URL aparece en la pestaña
   **Actions** y en Settings → Pages (algo como `https://<usuario>.github.io/calendar/`).

## Opción B — Netlify (arrastrar y soltar)
1. Entra en app.netlify.com → **Add new site → Import from Git** (o arrastra la
   carpeta `public/`).
2. `netlify.toml` ya indica `publish = public`. Deploy. Te da una URL.

## Opción C — Vercel
1. vercel.com → **Add New → Project** → importa el repo.
2. En *Root Directory* pon `public` y *Framework Preset* = **Other**. Deploy.

## Instalar en el móvil
Abre la URL en el navegador del móvil → menú → **Añadir a pantalla de inicio**.
Queda como una app (icono, pantalla completa, offline).

## ¿Y el desglose con IA real (Claude)?
Eso sí necesita un servidor con una API key. El código ya está en
`app/api/breakdown/route.ts` (app Next.js): define `ANTHROPIC_API_KEY` en el
entorno del despliegue y el desglose usa Claude; sin key, cae a la heurística
local. Para ese modo hay que desplegar la app Next.js (Vercel lo hace directo),
no solo la carpeta estática.
