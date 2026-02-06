import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { allowCors, getProxyAgent } from './utils.js';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { name } = req.body;
  const TAVILY_API_KEY = process.env.VITE_TAVILY_API_KEY;

  if (!TAVILY_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  const platforms = "twitter.com OR x.com OR weibo.com OR reddit.com OR instagram.com OR wechat";
  const query = `"${name}" latest news updates site:${platforms} OR "${name}" news`;

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_images: true,
        include_raw_content: true,
        days: 2,
        topic: "general",
        max_results: 10
      }),
      agent: getProxyAgent(),
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('Tavily API Error:', data);
        return res.status(500).json({ error: `Tavily API failed: ${JSON.stringify(data)}` });
    }

    // Filter results to ensure they are within the last 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    if (data.results && Array.isArray(data.results)) {
      console.log('Raw results count:', data.results.length);
      data.results = data.results.filter((item: { published_date?: string, content: string, title?: string, url?: string }) => {
        // 1. Content filter first
        const content = item.content || "";
        const isBoilerplate = 
            content.includes("JavaScript is disabled") ||
            content.includes("Please enable JavaScript") ||
            content.includes("Sign up to see photos") ||
            content.includes("Log in to Twitter") ||
            content.includes("Cookies are disabled") ||
            content.includes("People on X are the first to know") ||
            content.includes("Log in to X") ||
            content.includes("Happening now");

        const isTooShort = content.length < 20;

        // 2. Date check logic
        const hasDate = !!item.published_date;
        const isSocialMedia = item.url?.includes('x.com') || item.url?.includes('twitter.com') || item.url?.includes('weibo.com');
        
        let passesDateCheck = false;
        if (hasDate) {
            const itemDate = new Date(item.published_date!);
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            passesDateCheck = itemDate >= twoDaysAgo;
        } else {
            // If no date, but it's social media, we give it a pass because Tavily sucks at extracting dates from SPA.
            if (isSocialMedia) {
               passesDateCheck = true; 
            }
        }

        return passesDateCheck && !isBoilerplate && !isTooShort;
      });
      console.log('Filtered results count:', data.results.length);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch news', details: String(error) });
  }
};

export default allowCors(handler);
