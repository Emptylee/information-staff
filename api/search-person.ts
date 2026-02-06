import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { allowCors, getProxyAgent } from './utils.js';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { name } = req.body;
  const TAVILY_API_KEY = process.env.VITE_TAVILY_API_KEY;

  if (!TAVILY_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: `${name} biography profile career social media handles`,
        search_depth: "basic",
        include_images: true,
        include_answer: true,
      }),
      agent: getProxyAgent(),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to search person' });
  }
};

export default allowCors(handler);
