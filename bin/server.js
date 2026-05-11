#!/usr/bin/env node
import http from 'http';
import fs from 'fs';
import path from 'path';

const WORKSPACE = process.env.OPENCLAW_WORKSPACE
  || process.env.HOME && path.join(process.env.HOME, '.openclaw', 'workspace')
  || process.cwd();
const PORT = parseInt(process.env.PORT || '8765', 10);

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = url.pathname === '/'
    ? path.join(WORKSPACE, 'gym_workout.html')
    : path.join(WORKSPACE, url.pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(WORKSPACE)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  } catch (_) {}

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Skippy Workout server → http://0.0.0.0:${PORT}/`);
});
