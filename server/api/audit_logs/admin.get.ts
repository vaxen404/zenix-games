import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const activitiesResult = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC')
        return { success: true, activities: activitiesResult.rows }
    } catch(error: any) {
        throw createError({ statusCode: 500, message: 'İşlemler çekilirken bilinmeyen bir hata oluştu!' })
    }
})