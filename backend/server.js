import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import publicRoutes from './routes/public.js';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 4000);
const here = path.dirname(fileURLToPath(import.meta.url));
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined }) : null;

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim()), methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '20kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (!pool) return res.status(503).json({ error: 'الحجز الإلكتروني قيد الإعداد. تواصلي معنا مباشرةً ريثما تكتمل التهيئة.' });
  req.db = pool; next();
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

app.listen(port, () => console.log(`BEAUTY SALON API listening on port ${port}`));
process.on('SIGTERM', () => pool?.end().finally(() => process.exit(0)));
