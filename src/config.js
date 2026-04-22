import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const required = ['JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`[config] Faltan variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  // eslint-disable-next-line no-console
  console.error('[config] JWT_SECRET debe tener al menos 32 caracteres');
  process.exit(1);
}

export const config = Object.freeze({
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@juanino.dev',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  dbPath: path.resolve(__dirname, '../data/portfolio.db'),
  bcryptRounds: 12,
});
