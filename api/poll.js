export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const REPLICATE_KEY = process.env.REPLICATE_API_KEY;
  if (!REPLICATE_KEY) return res.status(500).json({ error: 'REPLICATE_API_KEY not configured' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing prediction id' });

  try {
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Bearer ${REPLICATE_KEY}` }
    });

    const data = await pollRes.json();
    return res.json({ id: data.id, status: data.status, output: data.output, error: data.error });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
