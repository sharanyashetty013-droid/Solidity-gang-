import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { createChain } from './chain.js';
import { createIpfs } from './ipfs.js';
import { createStore } from './store.js';
import { buildRouter } from './routes.js';
import { AppError } from './errors.js';

export function createApp(config) {
  const chain = createChain(config);
  const ipfs = createIpfs(config);
  const store = createStore(config.dataDir);

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin(origin, cb) {
      if (!origin || config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) return cb(null, true);
      cb(null, false);
    },
    allowedHeaders: ['Content-Type', 'X-Signature', 'X-Expires'],
    exposedHeaders: ['X-Evidence-Hash', 'X-Evidence-Verified'],
  }));
  app.use(express.json({ limit: '10kb' }));
  app.use('/api', buildRouter({ config, chain, ipfs, store }));

  app.use((req, res) => res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      const tooBig = err.code === 'LIMIT_FILE_SIZE';
      return res.status(tooBig ? 413 : 400).json({ error: { code: tooBig ? 'file_too_large' : 'upload_error', message: tooBig ? 'Photo must be under 10MB' : err.message } });
    }
    if (err instanceof AppError) return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'invalid_json', message: 'Malformed JSON body' } });
    console.error(err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong' } });
  });

  return app;
}
