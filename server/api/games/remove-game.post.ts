import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
        const { userId, gameId } = data

        if(!userId || !gameId) {
            throw createError({ statusCode: 400, message: 'Eksik veri!'} )
        }

        const result = await db.query('delete from user_games where user_id = $1 and game_id = $2', [userId, gameId] )

        if(!result.rows || result.rowCount === 0) {
            throw createError({ statusCode: 404, message: 'oyun bulunamadı!'})
        }

        return {
            success: true,
            message: 'başarıyla kaldırıldı!'
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        throw createError({
            statusCode: 500,
            message: 'Oyun kaldırılırken bilinmeyen bir hata oluştu!'
        })
    }
})