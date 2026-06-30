import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool

const dbConfig = {
  user: process.env.DB_USER,          
  password: process.env.DB_PASSWORD,      
  host: process.env.DB_HOST,         
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,          
  database: process.env.DB_DATABASE,         
}

if (!process.dev) {
  pool = new Pool(dbConfig)
} else {
  if (!(global as any).__globalPool) {
    (global as any).__globalPool = new Pool(dbConfig)
  }
  pool = (global as any).__globalPool
}

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
}