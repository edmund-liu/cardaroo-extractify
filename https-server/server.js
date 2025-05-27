import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './logger.js'; // your Winston + rotate setup

dotenv.config();

const {
  PORT_HTTP = '80',
  PORT_HTTPS = '443',
  SSL_KEY_PATH,
  SSL_CERT_PATH,
  SSL_CA_PATH, // optional intermediate chain
} = process.env;

// 0) Validate required env vars
if (!SSL_KEY_PATH || !SSL_CERT_PATH) {
  logger.error('Missing SSL_KEY_PATH or SSL_CERT_PATH in environment');
  process.exit(1);
}

const app = express();
const DIST_PATH = path.resolve(process.cwd(), 'dist');

// 1) HTTP request logging (Morgan → Winston)
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) }
  })
);

// 2) Serve static assets
app.use(express.static(DIST_PATH));

// 3) SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// 4) Load SSL credentials
let sslOptions;
try {
  sslOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH),
    ...(SSL_CA_PATH && { ca: fs.readFileSync(SSL_CA_PATH) }),
  };
} catch (err) {
  logger.error('Failed to load SSL files', err);
  process.exit(1);
}

// 5) Start HTTPS server
https
  .createServer(sslOptions, app)
  .listen(+PORT_HTTPS, () => {
    logger.info(`✅ HTTPS server running on port ${PORT_HTTPS}`);
  })
  .on('error', (err) => {
    logger.error('HTTPS server error', err);
    process.exit(1);
  });

// 6) HTTP → HTTPS redirector
http
  .createServer((req, res) => {
    const host = req.headers.host.split(':')[0];
    res.writeHead(301, { Location: `https://${host}${req.url}` });
    res.end();
  })
  .listen(+PORT_HTTP, () => {
    logger.info(`𐄄 HTTP redirector listening on port ${PORT_HTTP}`);
  })
  .on('error', (err) => {
    logger.error('HTTP redirector error', err);
    process.exit(1);
  });

// 7) Express error handler
app.use((err, req, res, next) => {
  logger.error('Express error', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 8) Catch uncaught exceptions & rejections
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
  process.exit(1);
});
