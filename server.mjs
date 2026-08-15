// 零依赖静态服务器：托管当前目录，默认首页 index.html
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2'
};

function handler(req, res) {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad Request'); return; }
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(root, urlPath.replace(/^[/\\]+/, ''));
  if (!filePath.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('404 Not Found: ' + urlPath); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
}

function listen(port) {
  const srv = http.createServer(handler);
  srv.once('error', (e) => {
    if (e.code === 'EADDRINUSE' || e.code === 'EACCES') {
      if (port >= 8095) { console.error('no free port found in range'); process.exit(1); }
      console.log('port ' + port + ' unavailable (' + e.code + '), trying ' + (port + 1));
      listen(port + 1);
    }
    else { console.error('server error:', e); process.exit(1); }
  });
  srv.listen(port, '127.0.0.1', () => {
    console.log('READY http://127.0.0.1:' + port + '/');
  });
}
listen(Number(process.env.PORT || 8080));
