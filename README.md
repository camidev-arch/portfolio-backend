# Portfolio Backend

API REST + CMS ligero para el portfolio de Juan Camilo Niño.  
Stack: Node.js, Express, SQLite (better-sqlite3), JWT, bcrypt.

## Instalación

```bash
cd backend
cp .env.example .env
# Edita .env y genera un JWT_SECRET seguro:
# openssl rand -hex 64
npm install
npm run seed    # Crea admin inicial + proyectos de ejemplo
npm run dev     # Modo desarrollo con --watch
```

## Endpoints principales

### Públicos
- `GET  /api/health`
- `GET  /api/projects` — Lista de proyectos
- `GET  /api/projects/:slug` — Detalle por slug
- `GET  /api/posts` — Blog posts publicados
- `GET  /api/posts/:slug` — Detalle de post
- `POST /api/messages` — Formulario de contacto (rate limit 3/h)

### Autenticación
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }` (rate limit 5/15min)
- `GET  /api/auth/me` — Usuario actual (requiere Bearer token)

### Admin (requiere token)
- `POST|PUT|DELETE /api/projects`
- `POST|PUT|DELETE /api/posts`
- `GET /api/posts/admin/all` — Incluye borradores
- `GET|PATCH|DELETE /api/messages`

## Seguridad implementada

- **Helmet** con CSP estricta y cabeceras seguras
- **CORS** whitelist desde `CORS_ORIGIN`
- **Rate limiting** diferenciado (general / login / contacto)
- **bcrypt** con 12 rounds + comparación constante anti-timing
- **JWT** con algoritmo forzado HS256 y expiración corta
- **Prepared statements** en 100% de las queries (anti SQLi)
- **express-validator** con sanitización HTML en inputs de usuario
- **Límite de body** 100kb para prevenir payload bombing
- **Foreign keys** activadas en SQLite
- **IP hasheada** con HMAC antes de guardarse
- `x-powered-by` deshabilitado

## Estructura

```
src/
  config.js                # Config + validación de env
  index.js                 # Entry + middlewares globales
  db/
    database.js            # Conexión y esquema
    seed.js                # Datos iniciales
  middleware/
    auth.js                # JWT + roles
    rateLimit.js           # 3 limitadores
    validation.js          # Errores y 404
  controllers/             # Lógica de cada recurso
  routes/                  # Endpoints + validators
```

Cada archivo ≤ 200 líneas.
