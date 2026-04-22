import bcrypt from 'bcrypt';
import db from './database.js';
import { config } from '../config.js';

const seedAdmin = async () => {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(config.adminEmail);
  if (existing) {
    console.log('[seed] Admin ya existe, se omite.');
    return;
  }
  if (!config.adminPassword || config.adminPassword.length < 10) {
    console.error('[seed] ADMIN_PASSWORD debe tener al menos 10 caracteres.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(config.adminPassword, config.bcryptRounds);
  db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
    .run(config.adminEmail, hash, 'admin');
  console.log(`[seed] Admin creado: ${config.adminEmail}`);
};

const projects = [
  {
    slug: 'valencia-basket',
    title_es: 'Valencia Basket - E-commerce Oficial',
    title_en: 'Valencia Basket - Official E-commerce',
    description_es: 'Diseño y desarrollo del sitio oficial de comercio electrónico para Valencia Basket, con Shopify Plus, Liquid y plantillas personalizadas.',
    description_en: 'Design and development of the official e-commerce site for Valencia Basket, using Shopify Plus, Liquid, and custom templates.',
    tech_stack: 'Shopify Plus,Liquid,JavaScript,HTML,CSS,SEO',
    url: '',
    repo_url: '',
    featured: 1,
    display_order: 1,
  },
  {
    slug: 'crosspay-recaudo',
    title_es: 'Sistema de Recaudo Crosspay',
    title_en: 'Crosspay Collection System',
    description_es: 'Plataforma completa de recaudos desarrollada desde cero: análisis, arquitectura e implementación con React.js y Material-UI.',
    description_en: 'Complete collection platform developed from scratch: analysis, architecture and implementation with React.js and Material-UI.',
    tech_stack: 'React.js,Material-UI,Node.js,REST APIs',
    url: '',
    repo_url: '',
    featured: 1,
    display_order: 2,
  },
  {
    slug: 'medicinaysaludpublica',
    title_es: 'Medicina y Salud Pública',
    title_en: 'Medicine and Public Health',
    description_es: 'Mantenimiento y desarrollo de la plataforma editorial con WordPress, reportes de anuncios y optimización de contenido.',
    description_en: 'Maintenance and development of the editorial platform with WordPress, ad reporting, and content optimization.',
    tech_stack: 'WordPress,PHP,JavaScript,SEO',
    url: 'https://medicinaysaludpublica.com',
    repo_url: '',
    featured: 0,
    display_order: 3,
  },
];

const seedProjects = () => {
  const stmt = db.prepare(`INSERT OR IGNORE INTO projects
    (slug, title_es, title_en, description_es, description_en, tech_stack, url, repo_url, featured, display_order)
    VALUES (@slug, @title_es, @title_en, @description_es, @description_en, @tech_stack, @url, @repo_url, @featured, @display_order)`);
  const insertMany = db.transaction((rows) => rows.forEach((r) => stmt.run(r)));
  insertMany(projects);
  console.log(`[seed] ${projects.length} proyectos insertados (ignora duplicados).`);
};

const run = async () => {
  await seedAdmin();
  seedProjects();
  console.log('[seed] Completado.');
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
