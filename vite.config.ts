import { defineConfig, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';

// Simple middleware to handle /api routes during development
const apiMiddleware = () => ({
  name: 'api-middleware',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.url?.startsWith('/api/')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;
        
        // Try to find a matching file in /api
        // e.g. /api/auth/login -> /api/auth/login.ts
        // e.g. /api/proxy/generateContent -> /api/proxy/generateContent.ts
        const possibleFiles = [
          path.join(process.cwd(), pathname + '.ts'),
          path.join(process.cwd(), pathname + '.js'),
          path.join(process.cwd(), pathname, 'index.ts'),
          path.join(process.cwd(), pathname, 'index.js'),
        ];

        let filePath = '';
        for (const file of possibleFiles) {
          if (fs.existsSync(file)) {
            filePath = file;
            break;
          }
        }

        if (filePath) {
          try {
            // Use tsx or dynamic import to run the serverless function
            // Since we are in a Vite environment, we can use server.ssrLoadModule
            const module = await server.ssrLoadModule(filePath);
            const handler = module.default;
            
            if (typeof handler === 'function') {
              // Mock VercelRequest and VercelResponse
              const vercelReq = req as any;
              const vercelRes = res as any;

              // Add body parsing if it's a POST request
              if (req.method === 'POST' && !vercelReq.body) {
                const chunks: any[] = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const body = Buffer.concat(chunks).toString();
                try {
                  vercelReq.body = JSON.parse(body);
                } catch (e) {
                  vercelReq.body = body;
                }
              }

              // Add query parsing
              vercelReq.query = Object.fromEntries(url.searchParams.entries());

              // Add helper methods to res
              vercelRes.status = (code: number) => {
                res.statusCode = code;
                return vercelRes;
              };
              vercelRes.json = (data: any) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return vercelRes;
              };
              vercelRes.send = (data: any) => {
                res.end(data);
                return vercelRes;
              };

              await handler(vercelReq, vercelRes);
              return;
            }
          } catch (error) {
            console.error(`Error handling API route ${pathname}:`, error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
            return;
          }
        }
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), apiMiddleware()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
