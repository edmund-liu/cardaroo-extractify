import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const {
  PORT_HTTP = '80',
  PORT_HTTPS = '443',
  SSL_KEY_PATH,
  SSL_CERT_PATH,
  SSL_CA_PATH,            // optional intermediate chain
} = process.env;

// Ensure required env vars are set
if (!SSL_KEY_PATH || !SSL_CERT_PATH) {
  console.error(
    '❌ Missing required environment variables: SSL_KEY_PATH and SSL_CERT_PATH must be defined.'
  );
  process.exit(1);
}

const app = express();
const DIST_PATH = path.resolve(process.cwd(), 'dist');

// 1) Serve static assets
app.use(express.static(DIST_PATH));

// 2) Fallback for client-side routes (SPA)
app.use((req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// 3) Load SSL credentials
let sslOptions;
try {
  sslOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH),
    ...(SSL_CA_PATH && { ca: fs.readFileSync(SSL_CA_PATH) }),
  };
} catch (err) {
  console.error('❌ Failed to load SSL files:', err);
  process.exit(1);
}

// 4) Start HTTPS server
https
  .createServer(sslOptions, app)
  .listen(Number(PORT_HTTPS), () => {
    console.log(`✅ HTTPS server running on port ${PORT_HTTPS}`);
  })
  .on('error', (err) => {
    console.error('❌ HTTPS server error:', err);
    process.exit(1);
  });

// 5) Start HTTP → HTTPS redirector
http
  .createServer((req, res) => {
    const host = req.headers.host.split(':')[0];
    res.writeHead(301, { Location: `https://${host}${req.url}` });
    res.end();
  })
  .listen(Number(PORT_HTTP), () => {
    console.log(`𐄄 HTTP redirector listening on port ${PORT_HTTP}`);
  })
  .on('error', (err) => {
    console.error('❌ HTTP redirector error:', err);
    process.exit(1);
  });
