import mysql from "mysql2/promise";

const requiredEnvs = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;

let pool: mysql.Pool | null = null;

function ensureEnv() {
  for (const key of requiredEnvs) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}

function getPool() {
  if (pool) return pool;

  ensureEnv();
  pool = mysql.createPool({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10_000,
    dateStrings: true,
    timezone: "Z",
    charset: "utf8mb4",
  });

  return pool;
}

const db = {
  query: (sql: string, values?: unknown[]) =>
    values === undefined ? getPool().query(sql) : getPool().query(sql, values),
  execute: (sql: string, values?: unknown[]) =>
    values === undefined ? getPool().execute(sql) : getPool().execute(sql, values),
  end: () => getPool().end(),
};

export default db;
