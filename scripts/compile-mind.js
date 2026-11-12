const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 9988;
const targetImgPath = path.resolve(__dirname, '../public/targets/denah-kampus2.jpg');
const outputMindPath = path.resolve(__dirname, '../public/targets/kampus2.mind');

const imgBase64 = fs.readFileSync(targetImgPath).toString('base64');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Compiling Denah Kampus 2 MindAR Target</title>
  <script src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.5/dist/mindar-image.prod.js"></script>
  <style>
    body { font-family: sans-serif; background: #0a0f1d; color: white; padding: 2rem; }
    #progressBar { width: 100%; height: 24px; background: #334155; border-radius: 12px; overflow: hidden; margin-top: 1rem; }
    #progressFill { width: 0%; height: 100%; background: #10b981; transition: width 0.2s; }
  </style>
</head>
<body>
  <h2>Sedang Mengompilasi Target MindAR Denah Kampus 2...</h2>
  <div id="status">Menginisialisasi...</div>
  <div id="progressBar"><div id="progressFill"></div></div>
  <script>
    async function run() {
      const status = document.getElementById('status');
      const progressFill = document.getElementById('progressFill');
      try {
        status.innerText = 'Menyiapkan compiler MindAR...';
        const compiler = new window.MINDAR.IMAGE.Compiler();
        
        status.innerText = 'Memuat gambar denah kampus 2...';
        const img = new Image();
        img.src = 'data:image/jpeg;base64,${imgBase64}';
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
        });

        status.innerText = 'Mengekstrak titik fitur (feature points)...';
        await compiler.compileImageTargets([img], (p) => {
          status.innerText = 'Proses: ' + p.toFixed(1) + '%';
          progressFill.style.width = p + '%';
          fetch('/progress?p=' + p.toFixed(1)).catch(() => {});
        });

        status.innerText = 'Mengekspor buffer data .mind...';
        const exportedBuffer = await compiler.exportData();

        status.innerText = 'Menyimpan ke public/targets/kampus2.mind...';
        const resp = await fetch('/save-mind', {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: exportedBuffer
        });

        if (resp.ok) {
          status.innerText = 'SUKSES! File kampus2.mind tersimpan.';
          setTimeout(() => { window.close(); }, 1000);
        } else {
          status.innerText = 'Gagal menyimpan buffer.';
        }
      } catch (err) {
        status.innerText = 'ERROR: ' + err.message;
        await fetch('/log?msg=' + encodeURIComponent(err.message));
      }
    }
    window.addEventListener('DOMContentLoaded', run);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } else if (req.url.startsWith('/progress')) {
    console.log('Compiler ' + req.url.replace('/progress?', ''));
    res.writeHead(200);
    res.end();
  } else if (req.url === '/save-mind' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(outputMindPath, buf);
      console.log('Saved kampus2.mind successfully! Size:', buf.length, 'bytes');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    });
  } else if (req.url.startsWith('/log')) {
    console.log('Browser log:', decodeURIComponent(req.url));
    res.writeHead(200);
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log('Compiler server listening on http://localhost:' + PORT);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cmd = `"${edgePath}" --app=http://localhost:${PORT}`;
  exec(cmd, (err) => {
    if (err) console.error('Edge execution error:', err);
  });
});
