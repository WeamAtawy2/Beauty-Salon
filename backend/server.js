import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import publicRoutes from './routes/public.js';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 4000);
const here = path.dirname(fileURLToPath(import.meta.url));
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined }) : null;

async function initializeDatabase() {
  if (!pool) return;
  try {
    const schemaSql = await fs.readFile(path.resolve(here, 'database/schema.sql'), 'utf8');
    await pool.query(schemaSql);
  } catch (error) {
    console.warn('Database bootstrap warning:', error.message);
  }
}

await initializeDatabase();

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim()), methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '20kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  req.db = pool;
  next();
});
app.get('/api/health', (req, res) => res.json({ status: pool ? 'ready' : 'setup-required' }));
app.use('/api', publicRoutes);

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(here, '../dist');
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((error, req, res, next) => {
  console.error('API error:', error.message);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'حدثت مشكلة أثناء الاتصال. يرجى المحاولة لاحقاً.' });
});

// Vercel imports the Express app as a serverless function; local development
// still starts the long-running server on PORT (4000 by default).
if (!process.env.VERCEL) app.listen(port, () => console.log(`BEAUTY SALON API listening on port ${port}`));
process.on('SIGTERM', () => pool?.end().finally(() => process.exit(0)));

export default app;
