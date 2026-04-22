import bcrypt from 'bcrypt';
import db from '../db/database.js';
import { signToken } from '../middleware/auth.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ?').get(email);

    // Comparación constante: siempre hacemos bcrypt.compare para evitar timing attacks.
    const dummyHash = '$2b$12$abcdefghijklmnopqrstuuOaaAaAaAaAaAaAaAaAaAaAaAaAaAaAa';
    const hash = user ? user.password_hash : dummyHash;
    const match = await bcrypt.compare(password, hash);

    if (!user || !match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
};

export const me = (req, res) => {
  res.json({ user: req.user });
};
