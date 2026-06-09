import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number.parseInt(process.env.PORT || '5173', 10);
const host = process.env.HOST || '0.0.0.0';
const distDir = new URL('./dist/', import.meta.url);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveAssetPath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath);
  const normalizedPath = normalize(decodedPath).replace(/^([.]{2}[\/\\])+/, '');
  const candidate = normalizedPath === '/' ? '/index.html' : normalizedPath;
  return join(distDir.pathname, candidate);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    const filePath = resolveAssetPath(url.pathname);
    let body;
    let contentType = contentTypes[extname(filePath)] || 'application/octet-stream';

    try {
      body = await readFile(filePath);
    } catch {
      body = await readFile(join(distDir.pathname, 'index.html'));
      contentType = contentTypes['.html'];
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(body);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Internal Server Error: ${String(error)}`);
  }
}).listen(port, host, () => {
  console.log(`Frontend serving at http://${host}:${port}`);
});