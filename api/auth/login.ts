import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const pass1 = process.env.APP_PASSWORD_USER1;
  const pass2 = process.env.APP_PASSWORD_USER2;

  if (!pass1 || !pass2) {
    console.error('APP_PASSWORD_USER1 or APP_PASSWORD_USER2 environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (password === pass1) {
    return res.status(200).json({ user: 'user1' });
  } else if (password === pass2) {
    return res.status(200).json({ user: 'user2' });
  } else {
    return res.status(401).json({ error: 'Invalid password' });
  }
}
