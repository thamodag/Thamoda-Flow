import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-user-type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userType = req.headers['x-user-type'] as string;
  
  let apiKey: string | undefined;
  if (userType === 'user1') {
    apiKey = process.env.API_KEY_USER1;
  } else if (userType === 'user2') {
    apiKey = process.env.API_KEY_USER2;
  }

  if (!apiKey) {
    return res.status(401).json({ error: "Unauthorized: No API key for user" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent(req.body);
    return res.status(200).json(response);
  } catch (error: any) {
    console.error(`[Proxy] generateContent error:`, error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
