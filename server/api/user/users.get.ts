import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const result = await db.query('SELECT * FROM users')

        const totalUsers = result.rowCount ?? 0

        return {
            success: true,
            users: result.rows, 
            total: totalUsers
        }
    } catch(error: any) {
        throw createError({
            statusCode: 500,
            message: 'Kullanıcılar getirilirken bilinmeyen bir hata oluştu!'
        })
    }
})