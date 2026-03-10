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
  
  let apiKey: string | undefined = process.env.API_KEY;
  
  if (!apiKey) {
    if (userType === 'user1') {
      apiKey = process.env.API_KEY_USER1;
    } else if (userType === 'user2') {
      apiKey = process.env.API_KEY_USER2;
    }
  }

  if (!apiKey) {
    return res.status(401).json({ error: "Unauthorized: No API key for user" });
  }

  try {
    const opData = req.body.operation;
    if (!opData || !opData.name) {
      return res.status(400).json({ error: "Invalid operation data" });
    }

    // Use direct fetch to avoid SDK's requirement for live Operation instances
    // which are lost during JSON serialization between client and proxy.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opData.name}`, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error(`[Proxy] getVideosOperation error:`, error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
