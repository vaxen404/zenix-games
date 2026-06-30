import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const data = getQuery(event)

        if(!data || !data.userId) {
            throw createError({ statusCode: 400, statusMessage: 'Eksik veri!'})
        }

        const result = await db.query('select * from users where id = $1', [data.userId])

        return {
            success: true,
            details: result.rows[0]
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        console.log(error);
        throw createError({
            statusCode: 500,
            message: 'Kullanıcı bilgileri getirilirken bilinmeyen bir hata oluştu!'
        })
    }
})