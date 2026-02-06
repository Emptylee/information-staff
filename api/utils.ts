import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const getProxyAgent = () => {
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxy) {
    console.log(`[Proxy] Using proxy: ${proxy}`);
    return new HttpsProxyAgent(proxy);
  }
  return undefined;
};

export const allowCors = (fn: (req: VercelRequest, res: VercelResponse) => Promise<unknown>) => async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-access-code'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Auth check
  const clientCode = req.headers['x-access-code'];
  const serverCode = process.env.VITE_ACCESS_CODE;

  console.log(`[Auth Check] Client Code: "${clientCode}" | Server Code: "${serverCode}"`);

  if (serverCode && clientCode !== serverCode) {
     res.status(401).json({ error: 'Unauthorized: Invalid Access Code' });
     return;
  }

  return await fn(req, res);
};
