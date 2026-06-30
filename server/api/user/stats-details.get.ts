import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const [gamesResult, usersResult, adminsResult ] = await Promise.all([
            db.query('select count(*) as count from games'),
            db.query('select count(*) as count from users'),
            db.query('select count(*) as count from users')
        ])

        return {
            success: true,
            stats: {
                totalGames: gamesResult.rows[0].count,
                totalUsers: usersResult.rows[0].count,
                totalAdmins: adminsResult.rows[0].count
            }
        }
    }catch(error: any) {
        throw createError({
            statusCode: 500,
            message: 'İstatistikler alınırken bilinmeyen bir hata oluştu!'
        })
    }
})