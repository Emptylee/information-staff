export interface Celebrity {
  id: string;
  name: string;
  avatarUrl?: string;
  description?: string;
  jobTitle?: string;
  keywords?: string[];
  platformHandles?: Record<string, string>;
}

export interface NewsItem {
  id: string;
  celebrityId: string;
  content: string;
  originalUrl: string;
  source: 'Twitter' | 'News' | 'Weibo' | 'Reddit' | 'Instagram' | 'WeChat' | 'Other';
  publishedAt: string;
  title?: string;
}
