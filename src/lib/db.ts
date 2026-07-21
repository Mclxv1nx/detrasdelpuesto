import { turso } from "./turso";

/* -------------------------------------------------------------------------- */
/*  Esquema (auto-inicializable)                                              */
/* -------------------------------------------------------------------------- */

let schemaReady: Promise<void> | null = null;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    path TEXT NOT NULL DEFAULT '/',
    referrer TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    visitor_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at)`,
];

/** Crea las tablas la primera vez que se usa la base en cada instancia. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = turso
      .batch(SCHEMA, "write")
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null; // permite reintentar en la siguiente petición
        throw err;
      });
  }
  return schemaReady;
}

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                     */
/* -------------------------------------------------------------------------- */

export type Comment = {
  id: number;
  author: string;
  body: string;
  created_at: string;
};

export type Stats = {
  totalVisits: number;
  uniqueVisitors: number;
  totalLikes: number;
  totalComments: number;
  visitsByDay: { day: string; count: number }[];
  likesByDay: { day: string; count: number }[];
  commentsByDay: { day: string; count: number }[];
  engagementSplit: { label: string; value: number }[];
  topReferrers: { label: string; value: number }[];
  recentComments: Comment[];
};

/* -------------------------------------------------------------------------- */
/*  Visitas                                                                   */
/* -------------------------------------------------------------------------- */

export async function recordVisit(
  visitorId: string,
  path = "/",
  referrer: string | null = null,
) {
  await ensureSchema();
  await turso.execute({
    sql: "INSERT INTO visits (visitor_id, path, referrer) VALUES (?, ?, ?)",
    args: [visitorId, path, referrer],
  });
}

/* -------------------------------------------------------------------------- */
/*  Likes                                                                     */
/* -------------------------------------------------------------------------- */

export async function getLikeState(visitorId: string) {
  await ensureSchema();
  const [total, mine] = await turso.batch(
    [
      "SELECT COUNT(*) AS c FROM likes",
      { sql: "SELECT 1 FROM likes WHERE visitor_id = ?", args: [visitorId] },
    ],
    "read",
  );
  return {
    likes: Number(total.rows[0]?.c ?? 0),
    liked: mine.rows.length > 0,
  };
}

/** Alterna el like del visitante y devuelve el nuevo estado. */
export async function toggleLike(visitorId: string) {
  await ensureSchema();
  const existing = await turso.execute({
    sql: "SELECT id FROM likes WHERE visitor_id = ?",
    args: [visitorId],
  });

  if (existing.rows.length > 0) {
    await turso.execute({
      sql: "DELETE FROM likes WHERE visitor_id = ?",
      args: [visitorId],
    });
  } else {
    await turso.execute({
      sql: "INSERT OR IGNORE INTO likes (visitor_id) VALUES (?)",
      args: [visitorId],
    });
  }

  return getLikeState(visitorId);
}

/* -------------------------------------------------------------------------- */
/*  Comentarios                                                               */
/* -------------------------------------------------------------------------- */

export async function getComments(limit = 100): Promise<Comment[]> {
  await ensureSchema();
  const res = await turso.execute({
    sql: "SELECT id, author, body, created_at FROM comments ORDER BY datetime(created_at) DESC, id DESC LIMIT ?",
    args: [limit],
  });
  return res.rows.map((r) => ({
    id: Number(r.id),
    author: String(r.author),
    body: String(r.body),
    created_at: String(r.created_at),
  }));
}

export async function addComment(
  author: string,
  body: string,
  visitorId: string | null,
): Promise<Comment> {
  await ensureSchema();
  const res = await turso.execute({
    sql: "INSERT INTO comments (author, body, visitor_id) VALUES (?, ?, ?) RETURNING id, author, body, created_at",
    args: [author, body, visitorId],
  });
  const r = res.rows[0];
  return {
    id: Number(r.id),
    author: String(r.author),
    body: String(r.body),
    created_at: String(r.created_at),
  };
}

/* -------------------------------------------------------------------------- */
/*  Estadísticas para el dashboard                                            */
/* -------------------------------------------------------------------------- */

function toSeries(rows: any[]): { day: string; count: number }[] {
  return rows.map((r) => ({ day: String(r.day), count: Number(r.c) }));
}

/** Rellena los días sin registros para que las series tengan 14 puntos. */
function fillDays(series: { day: string; count: number }[], days = 14) {
  const map = new Map(series.map((s) => [s.day, s.count]));
  const out: { day: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export async function getStats(): Promise<Stats> {
  await ensureSchema();

  const DAY_SQL = (table: string) => `
    SELECT date(created_at) AS day, COUNT(*) AS c
    FROM ${table}
    WHERE date(created_at) >= date('now', '-13 days')
    GROUP BY day ORDER BY day`;

  const [
    visitsTotal,
    uniques,
    likesTotal,
    commentsTotal,
    visitsDaily,
    likesDaily,
    commentsDaily,
    referrers,
    recent,
  ] = await turso.batch(
    [
      "SELECT COUNT(*) AS c FROM visits",
      "SELECT COUNT(DISTINCT visitor_id) AS c FROM visits",
      "SELECT COUNT(*) AS c FROM likes",
      "SELECT COUNT(*) AS c FROM comments",
      DAY_SQL("visits"),
      DAY_SQL("likes"),
      DAY_SQL("comments"),
      `SELECT COALESCE(NULLIF(referrer, ''), 'Directo') AS label, COUNT(*) AS c
       FROM visits GROUP BY label ORDER BY c DESC LIMIT 5`,
      "SELECT id, author, body, created_at FROM comments ORDER BY datetime(created_at) DESC, id DESC LIMIT 8",
    ],
    "read",
  );

  const totalVisits = Number(visitsTotal.rows[0]?.c ?? 0);
  const totalLikes = Number(likesTotal.rows[0]?.c ?? 0);
  const totalComments = Number(commentsTotal.rows[0]?.c ?? 0);

  return {
    totalVisits,
    uniqueVisitors: Number(uniques.rows[0]?.c ?? 0),
    totalLikes,
    totalComments,
    visitsByDay: fillDays(toSeries(visitsDaily.rows)),
    likesByDay: fillDays(toSeries(likesDaily.rows)),
    commentsByDay: fillDays(toSeries(commentsDaily.rows)),
    engagementSplit: [
      { label: "Visitas sin interacción", value: Math.max(0, totalVisits - totalLikes - totalComments) },
      { label: "Likes", value: totalLikes },
      { label: "Comentarios", value: totalComments },
    ],
    topReferrers: referrers.rows.map((r) => ({
      label: String(r.label),
      value: Number(r.c),
    })),
    recentComments: recent.rows.map((r) => ({
      id: Number(r.id),
      author: String(r.author),
      body: String(r.body),
      created_at: String(r.created_at),
    })),
  };
}
