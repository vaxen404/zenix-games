import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
    
        if(!data || !data.userId) throw createError({ statusCode: 400, message: 'Eksik veri!'} )

        await db.query(`delete from user_games where user_id = $1`, [data.userId])

        const result = await db.query(`delete from users where id = $1`, [data.userId])

        if(!result) {
            throw createError({ statusCode: 400, message: 'Kullanıcı bulunamadı, çık gir yap!'})
        }
    
        return {
            success: true,
            message: 'Kullanıcı başarıyla silindi!'
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        throw createError({
            statusCode: 500,
            message: 'Kullanıcı silinirken bilinmeyen bir hata oluştu!'
        })
    }
})