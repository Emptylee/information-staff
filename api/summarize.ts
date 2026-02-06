import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import { allowCors, getProxyAgent } from './utils.js';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { newsContent } = req.body;
  const apiKey = process.env.VITE_GROQ_API_KEY;
  const baseURL = 'https://api.groq.com/openai/v1';
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing Groq API Key' });
  }

  const client = new OpenAI({
    baseURL,
    apiKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetch: (url: any, init: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return fetch(url, { ...init, agent: getProxyAgent() } as any) as any;
    },
  });

  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful news assistant. Summarize the following news items into a concise briefing in Chinese." },
        { role: "user", content: newsContent }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const summary = completion.choices[0].message.content;
    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Groq API Error:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorMessage = (error as any)?.message || String(error);

    return res.status(500).json({ error: `Failed to generate summary: ${errorMessage}` });
  }
};

export default allowCors(handler);
