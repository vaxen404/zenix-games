import { db } from '../../utils/db' 

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const userId = query.userId

    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'userId parametresi zorunludur!',
        })
    }

    try {
        const ownedGames = await db.query(
            `SELECT g.id, g.name, g.image_url, g.genre 
             FROM user_games ug
             JOIN games g ON ug.game_id = g.id
             WHERE ug.user_id = $1`, 
            [userId]
        )

        return {
            items: ownedGames.rows 
        }
    } catch (error: any) {
        if(error.statusCode) throw error
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Satın alınan oyunlar getirilirken bir hata oluştu.',
        })
    }
})