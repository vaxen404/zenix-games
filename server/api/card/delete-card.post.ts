import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
        const { userId, cardId } = data 

        if (!userId || !cardId) {
            throw createError({ statusCode: 400, message: 'Kullanıcı ID veya Kart ID eksik!' })
        }

        const result = await db.query(
            `DELETE FROM user_cards WHERE id = $1 AND user_id = $2 RETURNING id`,
            [cardId, userId]
        )

        if (result.rowCount === 0) {
            throw createError({ statusCode: 44, message: 'Silinecek kart bulunamadı!' })
        }

        return { success: true, message: 'Kart başarıyla silindi.' }
    } catch (error: any) {
        if (error.statusCode) throw error
        throw createError({ statusCode: 500, message: 'Veri tabanından kart silinemedi!' })
    }
})