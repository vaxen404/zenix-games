import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const data = getQuery(event)
        const { userId } = data

        if(!userId) {
            throw createError({ statusCode: 400, message: 'Eksik veri!' })
        }

        const activitiesResult = await db.query('SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY id DESC', [userId])
        return { success: true, activities: activitiesResult.rows }
    } catch(error: any) {
        if(error.statusCode) throw error

        throw createError({ 
            statusCode: 500, 
            message: 'İşlemler çekilirken bilinmeyen bir hata oluştu!'
        })
    }
})