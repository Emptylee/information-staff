import { Celebrity, NewsItem } from './types';

// Access code management
const getAccessCode = () => localStorage.getItem('access_code') || '';

// Base API request helper
async function apiRequest(endpoint: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-code': getAccessCode(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function searchPerson(name: string): Promise<Celebrity> {
  const data = await apiRequest('search-person', { name });
  
  const firstResult = data.results?.[0];
  const answer = data.answer || firstResult?.content || 'No description found.';
  const image = data.images?.[0] || firstResult?.image_url;
  
  // Try to find more info
  const job = firstResult?.title || '';

  return {
    id: crypto.randomUUID(),
    name: name,
    description: answer,
    avatarUrl: image,
    keywords: [name],
    platformHandles: {},
    jobTitle: job, // Add job title or similar info
  };
}

interface TavilyResult {
  title: string;
  content: string;
  raw_content?: string;
  url: string;
  published_date?: string;
}

export async function fetchLatestNews(celebrity: Celebrity): Promise<NewsItem[]> {
  const data = await apiRequest('fetch-news', { name: celebrity.name });
  
  if (!data.results) return [];

  // Helper to determine source from URL
  const getSource = (url: string): NewsItem['source'] => {
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    if (url.includes('weibo.com') || url.includes('weibo.cn')) return 'Weibo';
    if (url.includes('reddit.com')) return 'Reddit';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('weixin') || url.includes('wechat')) return 'WeChat';
    return 'News'; // Default to News for other sites
  };

  // Map Tavily results to NewsItem
  return data.results.map((result: TavilyResult) => ({
    id: crypto.randomUUID(),
    celebrityId: celebrity.id,
    title: result.title,
    content: result.raw_content || result.content,
    originalUrl: result.url,
    source: getSource(result.url),
    publishedAt: result.published_date!, // We filtered out null dates in backend
  }));
}

export async function summarizeNews(news: NewsItem[]): Promise<string> {
  if (news.length === 0) return "No news found.";

  const newsContent = news.map(n => `- ${n.title}: ${n.content}`).join('\n');

  try {
    const data = await apiRequest('summarize', { newsContent });
    return data.summary || "Could not generate summary.";
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return "Error generating summary.";
  }
}
