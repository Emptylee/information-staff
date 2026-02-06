import { VercelRequest, VercelResponse } from '@vercel/node';
import { allowCors } from './utils.js';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({ status: 'ok' });
};

export default allowCors(handler);
