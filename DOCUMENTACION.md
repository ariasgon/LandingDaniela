# SIBI Landing Page — Documentación Técnica

## Resumen del Proyecto

Landing page para **SIBI** ("¡Y que tu negocio fluya!") con sistema de captura de leads y panel de administración. Diseñada para convertir visitantes en prospectos interesados en la plataforma.

---

## Stack Tecnológico

| Componente | Tecnología | ¿Por qué? |
|---|---|---|
| **Backend** | Node.js + Express | Ligero, rápido de desarrollar, ideal para una landing |
| **Base de datos** | SQLite (better-sqlite3) | Sin necesidad de servidor externo de BD, archivo local, cero configuración |
| **Autenticación** | JWT + bcryptjs | Tokens seguros para el panel admin, contraseñas hasheadas |
| **Frontend** | HTML/CSS/JS puro | Sin frameworks — carga rápida, sin dependencias innecesarias para una landing |
| **Despliegue** | Docker + Railway | Contenedor reproducible, deploy automático desde GitHub |

---

## Arquitectura

```
┌──────────────────────────────────────────────┐
│                  RAILWAY                      │
│  ┌──────────────────────────────────────┐     │
│  │         Docker Container             │     │
│  │  ┌──────────┐    ┌───────────────┐   │     │
│  │  │ Express  │───▶│  SQLite DB    │   │     │
│  │  │ Server   │    │  (Volume)     │   │     │
│  │  └─────┬────┘    └───────────────┘   │     │
│  │        │                             │     │
│  │  ┌─────▼────────────────────────┐    │     │
│  │  │     public/                  │    │     │
│  │  │  ├── index.html (landing)    │    │     │
│  │  │  ├── admin.html (dashboard)  │    │     │
│  │  │  ├── css/                    │    │     │
│  │  │  ├── js/                     │    │     │
│  │  │  └── images/ (logos SVG)     │    │     │
│  │  └──────────────────────────────┘    │     │
│  └──────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
```

---

## Estructura de Archivos

```
LandingDaniela/
├── server.js              # Servidor Express (API + rutas + BD)
├── package.json           # Dependencias del proyecto
├── package-lock.json      # Lock file para builds reproducibles
├── Dockerfile             # Configuración de contenedor Docker
├── .gitignore             # Excluye node_modules y archivos de BD
├── data/
│   └── .gitkeep           # Directorio para SQLite (mount de volumen en Railway)
└── public/
    ├── index.html          # Landing page principal
    ├── admin.html          # Panel de administración
    ├── css/
    │   ├── landing.css     # Estilos de la landing
    │   └── admin.css       # Estilos del panel admin
    ├── js/
    │   ├── landing.js      # Lógica del formulario de contacto
    │   └── admin.js        # Lógica del dashboard (login, tabla, CSV)
    └── images/
        ├── logo-dark.svg   # Logo para fondos claros (navbar)
        ├── logo-light.svg  # Logo para fondos oscuros (footer)
        └── logo-hero.svg   # Logo grande para sección hero
```

---

## Proceso de Construcción

### Fase 1: Backend y API

Se construyó un servidor Express minimalista en un solo archivo (`server.js`) que maneja:

1. **Captura de leads** — `POST /api/leads`
   - Recibe: nombre, email, teléfono (opcional), tipo de negocio (opcional), mensaje (opcional)
   - Valida campos obligatorios (nombre + email)
   - Guarda en SQLite con timestamp automático

2. **Autenticación admin** — `POST /api/admin/login`
   - Verifica credenciales contra la tabla `admins`
   - Contraseñas hasheadas con bcrypt (10 salt rounds)
   - Genera JWT con expiración de 24 horas
   - Token se almacena en cookie httpOnly (protección XSS)

3. **Panel admin protegido** — `GET /api/leads` (requiere JWT)
   - Lista todos los leads ordenados por fecha descendente
   - Permite eliminar leads individuales (`DELETE /api/leads/:id`)
   - Exporta a CSV con encoding UTF-8 BOM (para Excel en español)

**Decisión técnica: SQLite en vez de PostgreSQL/MySQL**
- Para una landing page con captura de leads, SQLite es más que suficiente
- No requiere servicio externo de base de datos (ahorro de costos)
- Se activa modo WAL (`journal_mode = WAL`) para mejor rendimiento en escrituras concurrentes
- En Railway, se monta un Volume en `/app/data` para persistencia entre deploys

**Seguridad implementada:**
- Contraseñas nunca se guardan en texto plano (bcrypt)
- Tokens JWT con expiración de 24h
- Cookies httpOnly (no accesibles desde JavaScript del cliente)
- Validación de entrada en todos los endpoints
- Middleware de autenticación centralizado

### Fase 2: Frontend — Landing Page

Se construyó con HTML/CSS/JS puro (sin React, Vue, etc.) por estas razones:
- **Velocidad de carga**: Sin bundle de JavaScript pesado
- **SEO**: HTML semántico renderizado directamente
- **Simplicidad**: Una landing no necesita state management ni componentes reactivos

**Secciones de la landing:**

| Sección | Propósito |
|---|---|
| **Navbar** | Logo + CTA fijo arriba |
| **Hero** | Propuesta de valor principal + logo grande animado |
| **Problema** | Pain points del cliente ideal (identificación) |
| **Solución** | Features de SIBI como respuesta a los problemas |
| **Cómo funciona** | 3 pasos simples (reducción de fricción) |
| **Testimonios** | Prueba social (genera confianza) |
| **Formulario** | Captura de leads (la conversión) |
| **Footer** | Links de navegación + branding |

**Estructura de copywriting**: Sigue el framework PAS (Problem → Agitate → Solution):
1. Hero plantea que hay un problema con el desorden
2. Sección "problema" amplifica el dolor con preguntas específicas
3. Sección "solución" presenta SIBI como la respuesta

### Fase 3: Panel de Administración

Dashboard protegido en `/admin` con:
- **Login** con email y contraseña
- **Estadísticas** en tiempo real (total leads, hoy, esta semana)
- **Tabla de leads** con búsqueda por nombre/email
- **Exportación CSV** para abrir en Excel
- **Eliminación** de leads individuales

El admin se crea automáticamente al iniciar el servidor (seed) usando las variables de entorno `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

### Fase 4: Identidad Visual (Branding)

Se aplicó la guía de marca SIBI:

**Paleta de colores:**
| Color | Código | Uso |
|---|---|---|
| Azul claro | `#5DC6FF` | Acentos, gradientes |
| Azul | `#3993FF` | Color primario, botones, links |
| Púrpura | `#5C3DFD` | Gradientes, hover states |
| Púrpura claro | `#7B63FF` | Variante secundaria |
| Navy oscuro | `#0B103E` | Texto, fondos hero/footer |

**Tipografías (Google Fonts):**
- **Quicksand** — Títulos (h1-h6) y logo. Redonda, amigable, moderna
- **Maven Pro** — Cuerpo de texto. Legible, profesional

**Logos SVG:**
Se crearon 3 variantes del logo como SVG vectorial:
- `logo-dark.svg` — Marca S + "sibi" en navy (para fondos claros)
- `logo-light.svg` — Marca S + "sibi" en blanco (para fondos oscuros)
- `logo-hero.svg` — Versión grande con efecto glow y tagline

La marca S usa un degradado vertical que va de `#5DC6FF` → `#3993FF` → `#5C3DFD` → `#7B63FF`.

### Fase 5: Preparación para Deploy (Railway)

**Dockerfile:**
```dockerfile
FROM node:20          # Imagen completa (no slim) para compilar better-sqlite3
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev # Instala solo dependencias de producción
COPY . .
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "server.js"]
```

**¿Por qué `node:20` y no `node:20-slim`?**
`better-sqlite3` es un módulo nativo de Node.js que necesita compilarse. La imagen `slim` no incluye las herramientas de compilación (`python3`, `make`, `g++`). Si `prebuild-install` no encuentra un binario precompilado, la imagen `slim` falla.

---

## Variables de Entorno (Railway)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `sibi-secret-key-change-in-production` |
| `ADMIN_EMAIL` | Email del usuario administrador | `admin@sibi.com` |
| `ADMIN_PASSWORD` | Contraseña del administrador | `admin123` |
| `DB_PATH` | Ruta al archivo SQLite | `./data/sibi.db` |

**Importante:** En producción (Railway), configurar `DB_PATH=/app/data/sibi.db` y montar un **Volume** en `/app/data` para que la base de datos persista entre deploys.

---

## API Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/leads` | No | Capturar un nuevo lead |
| `POST` | `/api/admin/login` | No | Login del administrador |
| `POST` | `/api/admin/logout` | No | Cerrar sesión |
| `GET` | `/api/leads` | JWT | Listar todos los leads |
| `DELETE` | `/api/leads/:id` | JWT | Eliminar un lead |
| `GET` | `/api/leads/export/csv` | JWT | Descargar leads en CSV |

---

## Cómo Correr Localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor
npm start

# 3. Abrir en navegador
# Landing:  http://localhost:3000
# Admin:    http://localhost:3000/admin
# Login:    admin@sibi.com / admin123
```

---

## Deploy en Railway

1. Conectar el repositorio de GitHub al proyecto en Railway
2. Railway detecta el Dockerfile automáticamente
3. Agregar un **Volume** montado en `/app/data`
4. Configurar las variables de entorno:
   - `JWT_SECRET` → clave aleatoria segura
   - `ADMIN_EMAIL` → email del admin
   - `ADMIN_PASSWORD` → contraseña segura
   - `DB_PATH` → `/app/data/sibi.db`
5. Deploy automático con cada push a la rama

---

## Historial de Commits

| Commit | Descripción |
|---|---|
| `36a7410` | feat: Landing page inicial con captura de leads y panel admin |
| `79cbfc8` | style: Rebrand a identidad SIBI — colores, fuentes y logo |
| `bcc9957` | Archivos subidos (logo) |
| `6fbc335` | style: Logos SVG con marca S y logo grande en hero |

---

*Documentación generada el 25 de febrero de 2026.*
