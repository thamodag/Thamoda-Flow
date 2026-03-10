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
  
  let apiKey: string | undefined = process.env.API_KEY; // Prefer platform-selected key if available
  
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
    const ai = new GoogleGenAI({ apiKey });
    
    let payload = { ...req.body };
    
    // Handle sourceImage URL if provided
    if (payload.sourceImage && !payload.image) {
      if (payload.sourceImage.startsWith('data:')) {
        const [header, base64] = payload.sourceImage.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        payload.image = {
          imageBytes: base64,
          mimeType: mimeType
        };
      } else {
        const imgRes = await fetch(payload.sourceImage);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const contentType = imgRes.headers.get('content-type') || 'image/png';
          
          payload.image = {
            imageBytes: base64,
            mimeType: contentType
          };
        }
      }
      // Clean up sourceImage to avoid SDK errors if it's not a recognized field
      delete payload.sourceImage;
    }

    const operation = await ai.models.generateVideos(payload);
    return res.status(200).json(operation);
  } catch (error: any) {
    console.error(`[Proxy] generateVideos error:`, error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
