import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
        const { receiverId, gameId, senderId } = data

        if (!receiverId || !gameId || !senderId) {
            throw createError({ statusCode: 400, message: 'Eksik veri!' })
        }

        const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [receiverId])

        if (!userCheck || (userCheck.rowCount ?? 0) === 0) {
            throw createError({ statusCode: 404, message: 'Kullanıcı bulunamadı!' })
        }

        const libraryCheck = await db.query(
            'SELECT id FROM user_games WHERE user_id = $1 AND game_id = $2', 
            [receiverId, gameId]
        )

        if (libraryCheck && (libraryCheck.rowCount ?? 0) > 0) {
            throw createError({ 
                statusCode: 409, 
                message: 'Kullanıcı bu oyuna zaten sahip!' 
            })
        }

        const gameCheck = await db.query('SELECT price FROM games WHERE id = $1', [gameId])
        if (!gameCheck || (gameCheck.rowCount ?? 0) === 0) {
            throw createError({ statusCode: 404, message: 'Oyun bulunamadı!' })
        }
        
        const price = gameCheck.rows[0].price

        const date = new Date().toLocaleDateString('tr-TR').replace(/[\.\/]/g, '-')
        await db.query(
            'INSERT INTO user_games (user_id, game_id, price_paid, purchased_date) VALUES ($1, $2, $3, $4)',
            [receiverId, gameId, price ,date]
        )

        
        await db.query(
            'INSERT INTO gift_logs (sender_id, receiver_id, game_id, gifted_at) VALUES ($1, $2, $3, $4)',
            [senderId, receiverId, gameId, date]
        )

        return {
            success: true,
            message: 'Kullanıcıya başarıyla hediye edildi!'
        }

    } catch (error: any) {
        if (error.statusCode) throw error

        console.log(error);
        throw createError({
            statusCode: 500,
            message: error.message || 'Kullanıcıya hediye gönderirken bilinmeyen bir hata oluştu!'
        })
    }
})