import argon2 from 'argon2'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
    
        if (!data.username || !data.password) {
            throw createError({ statusCode: 400, message: 'Eksik veya hatalı veri!' })
        }

        const userResult = await db.query('SELECT * FROM users WHERE username = $1', [data.username])
        
        if (!userResult || (userResult.rowCount ?? 0) === 0) {
            throw createError({ statusCode: 404, message: 'Kullanıcı adı veya şifre hatalı!' })
        }

        const account = userResult.rows[0]

        if (!account.password_hash || typeof account.password_hash !== 'string' || !account.password_hash.startsWith('$')) {
            throw createError({ statusCode: 401, message: 'Kullanıcı adı veya şifre hatalı!' })
        }

        const isPasswordValid = await argon2.verify(account.password_hash, data.password)

        if (!isPasswordValid) {
            throw createError({ statusCode: 401, message: 'Kullanıcı adı veya şifre hatalı!' })
        }

        const sessionToken = `session_${Math.random().toString(36).substring(2)}`

        return {
            success: true,
            message: 'Giriş başarıyla tamamlandı!',
            token: sessionToken, 
            user: {
                id: account.id,
                username: account.username,
                email: account.email,
                role: account.role 
            }
        }
        
    } catch (error: any) {
        if (error.statusCode) throw error

        throw createError({
            statusCode: 500,
            message: 'Giriş yapılırken bilinmeyen bir hata oluştu!'
        })
    }
})