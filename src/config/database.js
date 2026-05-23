import 'dotenv/config';

let sql;
let db;

if (process.env.NODE_ENV === 'production') {
  const { neon } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-http');

  sql = neon(process.env.DATABASE_URL);
  db = drizzle({ client: sql });
} else {
  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  db = drizzle({ client: pool });
}

export { db, sql };
