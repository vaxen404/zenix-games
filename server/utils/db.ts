import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool

const config = useRuntimeConfig()

const dbConfig = {
  user: config.dbUser,          
  password: config.dbPassword,      
  host: config.dbHost,         
  port: config.dbPort ? parseInt(config.dbPort) : 5432,          
  database: config.dbDatabase,         
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