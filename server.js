const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
    filePath = decodeURIComponent(filePath);
    
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        /* Models are large.  Cache them after the first visit so refreshes
           are instant; HTML stays fresh while the character/world are reused. */
        const cacheControl = ['.glb', '.png', '.jpg', '.jpeg']
            .includes(ext)
            ? 'public, max-age=31536000, immutable'
            : 'no-cache';

        res.writeHead(200, {
            'Content-Type': mime,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': cacheControl
        });
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('Server running at http://127.0.0.1:' + PORT);
});
