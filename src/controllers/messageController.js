import crypto from 'node:crypto';
import db from '../db/database.js';
import { config } from '../config.js';

const hashIp = (ip) =>
  crypto.createHmac('sha256', config.jwtSecret).update(ip || '').digest('hex').slice(0, 32);

export const createMessage = (req, res) => {
  const { name, email, subject, body } = req.body;
  const ipHash = hashIp(req.ip);
  db.prepare(
    'INSERT INTO messages (name, email, subject, body, ip_hash) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, subject || null, body, ipHash);
  res.status(201).json({ ok: true });
};

export const listMessages = (_req, res) => {
  const rows = db.prepare(
    'SELECT id, name, email, subject, body, read, created_at FROM messages ORDER BY created_at DESC LIMIT 200'
  ).all();
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject,
    body: r.body,
    read: !!r.read,
    createdAt: r.created_at,
  })));
};

export const markRead = (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Mensaje no encontrado' });
  res.json({ ok: true });
};

export const deleteMessage = (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Mensaje no encontrado' });
  res.status(204).end();
};
