import db from '../db/database.js';

const mapProject = (row) => ({
  id: row.id,
  slug: row.slug,
  title: { es: row.title_es, en: row.title_en },
  description: { es: row.description_es, en: row.description_en },
  tech: row.tech_stack ? row.tech_stack.split(',').map((t) => t.trim()) : [],
  url: row.url || null,
  repoUrl: row.repo_url || null,
  featured: !!row.featured,
  order: row.display_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listProjects = (_req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY display_order ASC, id ASC').all();
  res.json(rows.map(mapProject));
};

export const getProject = (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Proyecto no encontrado' });
  res.json(mapProject(row));
};

export const createProject = (req, res) => {
  const { slug, titleEs, titleEn, descriptionEs, descriptionEn, tech, url, repoUrl, featured, order } = req.body;
  const techStr = Array.isArray(tech) ? tech.join(',') : (tech || '');
  const stmt = db.prepare(`INSERT INTO projects
    (slug, title_es, title_en, description_es, description_en, tech_stack, url, repo_url, featured, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  try {
    const info = stmt.run(slug, titleEs, titleEn, descriptionEs, descriptionEn, techStr, url || null, repoUrl || null, featured ? 1 : 0, order || 0);
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(mapProject(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Slug duplicado' });
    throw err;
  }
};

export const updateProject = (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Proyecto no encontrado' });
  const { slug, titleEs, titleEn, descriptionEs, descriptionEn, tech, url, repoUrl, featured, order } = req.body;
  const techStr = Array.isArray(tech) ? tech.join(',') : (tech || existing.tech_stack);
  db.prepare(`UPDATE projects SET
    slug=?, title_es=?, title_en=?, description_es=?, description_en=?,
    tech_stack=?, url=?, repo_url=?, featured=?, display_order=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?`).run(
    slug ?? existing.slug, titleEs ?? existing.title_es, titleEn ?? existing.title_en,
    descriptionEs ?? existing.description_es, descriptionEn ?? existing.description_en,
    techStr, url ?? existing.url, repoUrl ?? existing.repo_url,
    featured !== undefined ? (featured ? 1 : 0) : existing.featured,
    order ?? existing.display_order, id
  );
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json(mapProject(row));
};

export const deleteProject = (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });
  res.status(204).end();
};
