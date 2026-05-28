# AI Image Studio 🎨

App personal para transformar fotos usando **flux-kontext-pro** de Black Forest Labs via Replicate.

## ¿Qué hace?
- Editás tu foto con instrucciones en texto
- Cambiás fondo, ropa, escenario manteniendo tu cara
- Modelo: `black-forest-labs/flux-kontext-pro`

## Deploy en Vercel

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ai-image-studio.git
git push -u origin main
```

### 2. Conectar con Vercel
1. Ir a [vercel.com](https://vercel.com) → New Project
2. Importar el repo de GitHub
3. En **Environment Variables** agregar:
   - `REPLICATE_API_KEY` = `r8_xxxxxxxxxx` (tu key de replicate.com)
4. Deploy ✅

### 3. Obtener API Key de Replicate
1. Registrarse en [replicate.com](https://replicate.com)
2. Account → API Tokens → Create token
3. Pegar en la variable de Vercel

## Estructura
```
/
├── public/
│   └── index.html      ← La app completa
├── api/
│   ├── generate.js     ← Proxy para Replicate (oculta tu API key)
│   └── poll.js         ← Polling del estado
├── vercel.json
└── package.json
```

## Costo estimado
- flux-kontext-pro en Replicate: ~$0.04 por imagen
- 100 imágenes ≈ $4 USD

## Uso
1. Subís tu foto
2. Elegís un escenario rápido o escribís tu prompt en inglés
3. Clic en Generar
4. Descargás el resultado
