export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const REPLICATE_KEY = process.env.REPLICATE_API_KEY;
  if (!REPLICATE_KEY) return res.status(500).json({ error: 'REPLICATE_API_KEY not configured in Vercel environment variables' });

  try {
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

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
