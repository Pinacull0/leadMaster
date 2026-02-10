import mysql from "mysql2/promise";

const requiredEnvs = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;

for (const key of requiredEnvs) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const pool = mysql.createPool({
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

export default pool;
