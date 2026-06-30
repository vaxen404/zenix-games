import argon2 from 'argon2'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
    
        if(!data.username || !data.password) {
            throw createError({ statusCode: 400, message: 'Eksik veya hatalı veri!' })
        }

        const email = data.email ? data.email : `${data.username}@zenix.gg`

        const checkUsernameResult = await db.query('select * from users where username = $1', [data.username])
    
        if(checkUsernameResult.rows.length > 0) {
            throw createError({ statusCode: 409, message: 'bu kullanıcı adına sahip biri zaten var!'})
        }
        
        const checkEmailResult = await db.query('select * from users where email = $1', [data.email])
    
        if(checkEmailResult.rows.length > 0) {
            throw createError({ statusCode: 409, message: 'bu emaile sahip bir kullanıcı zaten var!'})
        }

        const hashedPassword = await argon2.hash(data.password)
    
        const date = new Date().toLocaleDateString('tr-TR').replace(/[\.\/]/g, '-')
        
        const queryText = 'INSERT INTO users (username, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email'
        const result = await db.query(queryText, [data.username, email, hashedPassword, 'user', date])

        return {
            success: true,
            message: 'Kayıt başarıyla tamamlandı!',
            user: result.rows[0]
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        console.log(error);
        throw createError({
            statusCode: 500,
            message: 'Kayıt olunurken bilinmeyen bir hata oluştu!'
        })
    }
})