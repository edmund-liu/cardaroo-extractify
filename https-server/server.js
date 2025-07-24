import fs   from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const {
  PORT_HTTP  = '80',
  PORT_HTTPS = '443',
  SSL_KEY_PATH,
  SSL_CERT_PATH,
  SSL_CA_PATH,
} = process.env;

// fail fast if your certs aren’t set
if (!SSL_KEY_PATH || !SSL_CERT_PATH) {
  console.error('𐄒 SSL_KEY_PATH & SSL_CERT_PATH must be set');
  process.exit(1);
}

const app = express();
const DIST = path.resolve(process.cwd(),'dist');

// (A) Trust proxy if you’re behind a load-balancer
//     so `req.secure` will reflect the original client protocol
app.enable('trust proxy');

// 1️⃣  Log incoming requests
app.use(morgan('combined',{ stream:{ write:msg=>logger.info(msg.trim()) }}));

// 2️⃣  Serve your React build
app.use(express.static(DIST));

// 3️⃣  Redirect HTTP→HTTPS (Express way)
app.use((req,res,next)=>{
  // if already HTTPS, or direct to index (static) or health-check, just continue
  if (req.secure || req.get('X-Forwarded-Proto')==='https') {
    return next();
  }

  // otherwise, build a safe redirect URL
  const host = req.get('host');
  if (!host) {
    // no Host header? return 400 Bad Request
    return res.status(400).send('Missing Host header');
  }

  // preserve path + query
  return res.redirect(301, `https://${host}${req.originalUrl}`);
});

// 4️⃣  SPA fallback
app.use((req,res) => {
  res.sendFile(path.join(DIST,'index.html'));
});

// 5️⃣  Load your certificates
let sslOpts;
try {
  sslOpts = {
    key : fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH),
    ...(SSL_CA_PATH ? { ca: fs.readFileSync(SSL_CA_PATH) } : {})
  };
} catch(err){
  logger.error('❌ Failed reading SSL files',err);
  process.exit(1);
}

// 6️⃣  Start HTTPS server
https.createServer(sslOpts, app)
     .listen(+PORT_HTTPS, ()=>logger.info(`✅ HTTPS on ${PORT_HTTPS}`))
     .on('error', err=>{
       logger.error('HTTPS error',err);
       process.exit(1);
     });

// 7️⃣  (Optional) Keep a bare HTTP listener too, in case some clients don’t respect X-Forwarded-Proto
http.createServer((req,res)=>{
  const host = req.headers.host;
  if (!host) {
    res.writeHead(400);
    return res.end('Missing Host header');
  }
  const hostname = host.split(':')[0];
  const url      = `https://${hostname}${req.url}`;
  res.writeHead(301,{ Location: url });
  res.end();
}).listen(+PORT_HTTP, ()=>logger.info(`𐄄 HTTP→HTTPS redirect on ${PORT_HTTP}`))
  .on('error', err=>{
    logger.error('HTTP redirector error',err);
    process.exit(1);
  });

// 8️⃣  Catch-all Express error handler
app.use((err,req,res,next)=>{
  logger.error('Express error',err);
  res.status(500).json({ message:'Internal server error' });
});

// 9️⃣  Crash on unhandleds so your orchestrator can restart you
process.on('uncaughtException', err=>{
  logger.error('Uncaught Exception',err);
  process.exit(1);
});
process.on('unhandledRejection', reason=>{
  logger.error('Unhandled Rejection',reason);
  process.exit(1);
});
