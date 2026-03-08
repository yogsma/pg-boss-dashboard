import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DB_PASSWORD) {
  console.warn('WARNING: DB_PASSWORD not set, using default. Do not use defaults in production.');
}

export const config = {
  port: process.env.PORT || 3001,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'pg-boss',
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
  },
};
