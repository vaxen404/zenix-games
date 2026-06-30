import { db } from '../../utils/db'

export default defineEventHandler( async (event) => {
    try {
        const data = await readBody(event)

        if(!data.userId || !data.gameId) {
            throw createError({ statusCode: 400, message: 'Eksik veri!'})
        }

        const queryText = 'delete from cart where user_id = $1 and game_id = $2'
        const result = await db.query(queryText, [data.userId, data.gameId])

        return {
            success: true,
            message: 'başarıyla silindi!'
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        throw createError({
            statusCode: 500,
            message: 'ürün silinirken bilinmeyen bir hata oluştu!'
        })
    }
})