import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { handleRequest } from '../src/index.js';

// Simple .env loader
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

const PORT = process.env.PORT || 3005;
const publicDir = resolve(process.cwd(), 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain'
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Serve static public assets
  if (pathname === '/' || pathname === '/index.html' || pathname === '/robots.txt') {
    const filename = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    const filePath = resolve(publicDir, filename);

    if (existsSync(filePath)) {
      const ext = extname(filePath);
      const mime = MIME_TYPES[ext] || 'text/plain';
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': mime });
      return res.end(content);
    }
  }

  // Convert Node incoming message to Fetch Request
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks);

  const fetchRequest = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body
  });

  try {
    const fetchResponse = await handleRequest(fetchRequest, process.env);
    const resHeaders = {};
    for (const [key, val] of fetchResponse.headers.entries()) {
      resHeaders[key] = val;
    }

    res.writeHead(fetchResponse.status, resHeaders);
    const resBuffer = await fetchResponse.arrayBuffer();
    res.end(Buffer.from(resBuffer));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Drop The Raw Operator Console running at: http://localhost:${PORT}`);
  console.log(`🛡️  Non-Main Production Safety Gate: ACTIVE\n`);
});
