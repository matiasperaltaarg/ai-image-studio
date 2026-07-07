# AI Image Studio 🎨

App personal para transformar fotos con IA. Soporta tres motores intercambiables desde la UI:
- **Flux** — `black-forest-labs/flux-kontext-pro` vía Replicate
- **OpenAI** — `gpt-image-1` (endpoint de edición de imágenes)
- **Gemini** — `gemini-2.5-flash-image` (Google AI Studio / Gemini API)

## ¿Qué hace?
- Editás tu foto con instrucciones en texto
- Cambiás fondo, ropa, escenario manteniendo tu cara
- Elegís con qué motor probar cada edición (botón "Motor de IA")

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
3. En **Environment Variables** agregar las que vayas a usar (podés cargar una, dos o las tres — cada motor solo falla si le falta su propia key):
   - `REPLICATE_API_KEY` = `r8_xxxxxxxxxx` (para Flux)
   - `OPENAI_API_KEY` = `sk-xxxxxxxxxx` (para OpenAI)
   - `GEMINI_API_KEY` = `AIzaxxxxxxxxxx` (para Gemini)
4. Deploy ✅

Para cambiar o rotar una key más adelante: Vercel → tu proyecto → Settings → Environment Variables → editar el valor → **Redeploy** (los cambios de env vars no se aplican hasta el próximo deploy).

### 3. Obtener las API Keys
- **Replicate**: [replicate.com](https://replicate.com) → Account → API Tokens → Create token
- **OpenAI**: [platform.openai.com](https://platform.openai.com/api-keys) → API Keys → Create new secret key (necesita acceso a `gpt-image-1`, puede requerir verificación de organización)
- **Gemini**: [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → Create API key

## Estructura
```
/
├── public/
│   └── index.html      ← La app completa (incluye el selector de motor)
├── api/
│   ├── generate.js     ← Proxy para Replicate/OpenAI/Gemini (oculta tus API keys)
│   └── poll.js         ← Polling del estado (solo lo usa Flux)
├── vercel.json
└── package.json
```

## Costo estimado
- Flux (flux-kontext-pro) en Replicate: ~$0.04 por imagen
- OpenAI (gpt-image-1): variable según tamaño/calidad, ver [pricing](https://openai.com/api/pricing/)
- Gemini (gemini-2.5-flash-image): variable, ver [pricing](https://ai.google.dev/pricing)

## Uso
1. Subís tu foto
2. Elegís un escenario rápido o escribís tu prompt en inglés
3. Clic en Generar
4. Descargás el resultado
