// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt'
  ],

  runtimeConfig: {
    dbHost: process.env.DB_HOST || 'postgres.railway.internal',
    dbPort: process.env.DB_PORT || '5432',
    dbUser: process.env.DB_USER || 'postgres',
    dbPassword: process.env.DB_PASSWORD || '',
    dbDatabase: process.env.DB_DATABASE || 'railway'
  }
})