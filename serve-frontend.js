const fs = require('fs');
const path = require('path');

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
};

function staticRoot() {
  const dir = process.env.STATIC_DIR || 'dist';
  const root = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(root)) {
    return null;
  }
  return root;
}

function resolveFile(root, urlPath) {
  const raw = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relativePath = raw === '/' ? 'index.html' : raw.replace(/^\/+/, '');
  const full = path.resolve(root, relativePath);
  const outside = path.relative(root, full).startsWith('..');
  if (outside) {
    return null;
  }
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    return full;
  }
  const index = path.resolve(root, 'index.html');
  if (fs.existsSync(index)) {
    return index;
  }
  return null;
}

function serveFrontend(req, res) {
  const root = staticRoot();
  if (!root) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Fun Chat server is running. Build the frontend with npm run build.');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  const file = resolveFile(root, req.url);
  if (!file) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(file).pipe(res);
}

module.exports = { serveFrontend };
