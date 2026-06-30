import { db } from '../../utils/db'

export default defineEventHandler( async (event) => {
    try {
        const data = await readBody(event)
    
        if(!data.userId || !data.gameId || !data.price) {
            throw createError({ statusCode: 400, message: 'Eksik veri!'})
        }
    
        const queryText = `INSERT INTO user_games (user_id, game_id, price_paid, purchased_date) VALUES ($1,$2,$3,NOW())`
        const result = await db.query(queryText, [data.userId, data.gameId, data.price])

        const deleteQuery = `
            DELETE FROM cart 
            WHERE user_id = $1 AND game_id = $2
        `
        await db.query(deleteQuery, [data.userId, data.gameId])

        return {
            success: true,
            message: 'satın alındı!'
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        throw createError({
            statusCode: 500,
            message: 'Satın alma sırasında bilinmeyen bir hata oluştu!'
        })
    }

})