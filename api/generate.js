function splitDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl || '');
  if (!match) throw new Error('Formato de imagen inválido');
  return { mime: match[1], data: match[2] };
}

async function handleFlux(req, res) {
  const REPLICATE_KEY = process.env.REPLICATE_API_KEY;
  if (!REPLICATE_KEY) return res.status(500).json({ error: 'REPLICATE_API_KEY not configured in Vercel environment variables' });

  const { imageUrl, imageBase64, prompt, negativePrompt, steps, guidance } = req.body;

  // flux-kontext-pro: edit an existing image with text instructions
  const input = {
    prompt: prompt,
    input_image: imageBase64 || imageUrl,
    guidance: parseFloat(guidance) || 3.5,
    steps: parseInt(steps) || 28,
    output_format: "jpg",
    safety_tolerance: 2
  };

  // Create prediction
  const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait=60'
    },
    body: JSON.stringify({ input })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    return res.status(createRes.status).json({ error: err.detail || JSON.stringify(err) });
  }

  const prediction = await createRes.json();

  // If already done (Prefer: wait worked)
  if (prediction.status === 'succeeded') {
    return res.json({ output: prediction.output, id: prediction.id, status: 'succeeded' });
  }

  if (prediction.status === 'failed') {
    return res.status(500).json({ error: prediction.error || 'Prediction failed' });
  }

  // Return prediction ID for polling
  return res.json({ id: prediction.id, status: prediction.status });
}

async function handleOpenAI(req, res) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not configured in Vercel environment variables' });

  const { imageBase64, prompt } = req.body;
  if (!imageBase64 || !prompt) return res.status(400).json({ error: 'Falta la imagen o el prompt' });

  const { mime, data } = splitDataUrl(imageBase64);
  const ext = (mime.split('/')[1] || 'png').replace('jpeg', 'jpg');

  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('image', new Blob([Buffer.from(data, 'base64')], { type: mime }), `input.${ext}`);

  const r = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
    body: form
  });

  const result = await r.json();
  if (!r.ok) return res.status(r.status).json({ error: result.error?.message || JSON.stringify(result) });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) return res.status(500).json({ error: 'OpenAI no devolvió ninguna imagen' });

  return res.json({ output: `data:image/png;base64,${b64}`, status: 'succeeded' });
}

async function handleGemini(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not configured in Vercel environment variables' });

  const { imageBase64, prompt } = req.body;
  if (!imageBase64 || !prompt) return res.status(400).json({ error: 'Falta la imagen o el prompt' });

  const { mime, data } = splitDataUrl(imageBase64);
  const model = 'gemini-2.5-flash-image';

  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mime, data } }
        ]
      }]
    })
  });

  const result = await r.json();
  if (!r.ok) return res.status(r.status).json({ error: result.error?.message || JSON.stringify(result) });

  const parts = result.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inlineData || p.inline_data);
  const inline = imgPart?.inlineData || imgPart?.inline_data;
  if (!inline) return res.status(500).json({ error: 'Gemini no devolvió ninguna imagen' });

  const outMime = inline.mimeType || inline.mime_type || 'image/png';
  return res.json({ output: `data:${outMime};base64,${inline.data}`, status: 'succeeded' });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const provider = req.body?.provider || 'flux';

  try {
    if (provider === 'openai') return await handleOpenAI(req, res);
    if (provider === 'gemini') return await handleGemini(req, res);
    if (provider === 'flux') return await handleFlux(req, res);
    return res.status(400).json({ error: `Proveedor desconocido: ${provider}` });
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
