const https = require('https');
const http = require('http');
const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');
const os = require('os');

const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

function getLocalIps() {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

async function main() {
  const localIps = getLocalIps();
  const primaryIp = localIps.find((ip) => !ip.startsWith('169.254') && !ip.startsWith('192.168.137')) || localIps[0] || '127.0.0.1';

  let pems;
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    pems = {
      cert: fs.readFileSync(certPath, 'utf8'),
      private: fs.readFileSync(keyPath, 'utf8'),
    };
  } else {
    const attrs = [{ name: 'commonName', value: primaryIp }];
    const altNames = [
      { type: 2, value: 'localhost' },
      { type: 7, ip: '127.0.0.1' },
    ];
    for (const ip of localIps) {
      altNames.push({ type: 7, ip });
    }

    pems = await selfsigned.generate(attrs, {
      algorithm: 'sha256',
      days: 365,
      keySize: 2048,
      extensions: [
        {
          name: 'subjectAltName',
          altNames,
        },
      ],
    });
    fs.writeFileSync(certPath, pems.cert);
    fs.writeFileSync(keyPath, pems.private);
  }

  const TARGET_PORT = Number(process.env.TARGET_PORT || 3000);
  const HTTPS_PORT = 3443;

  const server = https.createServer(
    {
      key: pems.private,
      cert: pems.cert,
    },
    (req, res) => {
      const options = {
        hostname: '127.0.0.1',
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: req.headers.host,
          'x-forwarded-proto': 'https',
        },
      };

      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy Error: ' + err.message);
      });

      req.pipe(proxyReq);
    }
  );

  server.on('upgrade', (req, socket, head) => {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    });

    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
      socket.write(
        `HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`
      );
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (Array.isArray(value)) {
          value.forEach((v) => socket.write(`${key}: ${v}\r\n`));
        } else {
          socket.write(`${key}: ${value}\r\n`);
        }
      }
      socket.write('\r\n');

      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
    });

    proxyReq.on('error', () => {
      socket.destroy();
    });

    proxyReq.end();
  });

  server.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`HTTPS proxy running on:`);
    console.log(`  - https://localhost:${HTTPS_PORT}`);
    console.log(`  - https://${primaryIp}:${HTTPS_PORT}`);
  });
}

main().catch(console.error);
