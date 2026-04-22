import db from '../db/database.js';

const mapPost = (row) => ({
  id: row.id,
  slug: row.slug,
  title: { es: row.title_es, en: row.title_en },
  excerpt: { es: row.excerpt_es, en: row.excerpt_en },
  content: { es: row.content_es, en: row.content_en },
  published: !!row.published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapPostPreview = (row) => ({
  id: row.id,
  slug: row.slug,
  title: { es: row.title_es, en: row.title_en },
  excerpt: { es: row.excerpt_es, en: row.excerpt_en },
  published: !!row.published,
  createdAt: row.created_at,
});

export const listPublishedPosts = (_req, res) => {
  const rows = db.prepare(
    'SELECT id, slug, title_es, title_en, excerpt_es, excerpt_en, published, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC'
  ).all();
  res.json(rows.map(mapPostPreview));
};

export const listAllPosts = (_req, res) => {
  const rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  res.json(rows.map(mapPost));
};

export const getPost = (req, res) => {
  const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Post no encontrado' });
  if (!row.published && (!req.user || req.user.role !== 'admin')) {
    return res.status(404).json({ error: 'Post no encontrado' });
  }
  res.json(mapPost(row));
};

export const createPost = (req, res) => {
  const { slug, titleEs, titleEn, excerptEs, excerptEn, contentEs, contentEn, published } = req.body;
  try {
    const info = db.prepare(`INSERT INTO posts
      (slug, title_es, title_en, excerpt_es, excerpt_en, content_es, content_en, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      slug, titleEs, titleEn, excerptEs, excerptEn, contentEs, contentEn, published ? 1 : 0
    );
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(mapPost(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Slug duplicado' });
    throw err;
  }
};

export const updatePost = (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Post no encontrado' });
  const { slug, titleEs, titleEn, excerptEs, excerptEn, contentEs, contentEn, published } = req.body;
  db.prepare(`UPDATE posts SET
    slug=?, title_es=?, title_en=?, excerpt_es=?, excerpt_en=?,
    content_es=?, content_en=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(
    slug ?? existing.slug, titleEs ?? existing.title_es, titleEn ?? existing.title_en,
    excerptEs ?? existing.excerpt_es, excerptEn ?? existing.excerpt_en,
    contentEs ?? existing.content_es, contentEn ?? existing.content_en,
    published !== undefined ? (published ? 1 : 0) : existing.published, id
  );
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  res.json(mapPost(row));
};

export const deletePost = (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Post no encontrado' });
  res.status(204).end();
};
