# Detrás del Puesto

Landing page del reportaje **"Comercio informal: una realidad que crece"**, sobre la
dinámica del comercio informal en la provincia de Imbabura (Otavalo e Ibarra).

Construida con **Astro** (SSR sobre Vercel) y **Turso** para likes, comentarios y
estadísticas de visitas.

## Estructura

```text
public/img/            Fotografías del reportaje
src/
├── components/        Hero, Gallery, Interactions, charts, header y footer
├── layouts/           Layout base (SEO, fuentes, reveal on scroll)
├── lib/
│   ├── turso.ts       Cliente Turso (@libsql/client/web)
│   ├── db.ts          Esquema auto-inicializable + consultas
│   ├── visitor.ts     Cookie anónima de visitante
│   └── auth.ts        Sesión del panel protegido
├── pages/
│   ├── index.astro    Landing page
│   ├── dashboard.astro Panel de estadísticas (protegido por clave)
│   └── api/           like.ts · comments.ts · visit.ts
└── styles/global.css  Sistema de diseño (tokens, reset, utilidades)
```

## Variables de entorno

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
DASHBOARD_PASSWORD=clave-del-panel
```

Las tres deben estar también configuradas en el proyecto de Vercel.

## Base de datos

No hace falta ejecutar migraciones: `ensureSchema()` crea las tablas
`visits`, `likes` y `comments` (con sus índices) la primera vez que se consulta
la base en cada instancia del servidor.

| Tabla      | Campos                                              |
| :--------- | :-------------------------------------------------- |
| `visits`   | `visitor_id`, `path`, `referrer`, `created_at`       |
| `likes`    | `visitor_id` (único), `created_at`                   |
| `comments` | `author`, `body`, `visitor_id`, `created_at`         |

## API

| Método | Ruta            | Descripción                                  |
| :----- | :-------------- | :------------------------------------------- |
| `GET`  | `/api/like`     | Total de likes y si el visitante ya dio like |
| `POST` | `/api/like`     | Alterna el like del visitante                |
| `GET`  | `/api/comments` | Últimos 100 comentarios                      |
| `POST` | `/api/comments` | Publica un comentario (`author`, `body`)     |
| `POST` | `/api/visit`    | Registra una visita manualmente              |

> Las peticiones `POST` deben enviar `Content-Type: application/json`; sin ese
> encabezado la protección CSRF de Astro las rechaza con un 403.

## Panel de estadísticas

Disponible en `/dashboard`, protegido con `DASHBOARD_PASSWORD`. La sesión dura
8 horas y se guarda como un hash de la contraseña en una cookie `httpOnly`.
Muestra tarjetas de resumen, un gráfico de barras de los últimos 14 días y dos
gráficos de pastel (composición de la interacción y origen del tráfico).

## Diseño

Mobile-first. Paleta del documento fuente: azul marino, gris neutro, fondo claro
en tono tierra y terracota suave, definidos como variables CSS en
`src/styles/global.css`.

## Comandos

| Comando           | Acción                                     |
| :---------------- | :----------------------------------------- |
| `npm install`     | Instala las dependencias                   |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321` |
| `npm run build`   | Compila el sitio para producción           |
| `npm run preview` | Previsualiza la compilación                |

## Créditos

Investigación: Damián Reyes · Flor Lema · Alexis Ulcuango
