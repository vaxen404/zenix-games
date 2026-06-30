import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
    try { 
        const id = event.context.params?.id

        if(!id) {
            throw createError({ statusCode: 400, message: 'Log ID eksik!' })
        }

        const activityResult = await db.query('SELECT * FROM audit_logs WHERE id = $1', [id])

        return {
            success: true,
            activity_details: activityResult.rows[0] || null
        }
    } catch(error: any) {
        if(error.statusCode) throw error
        throw createError({
            statusCode: 500,
            message: 'İşlem detayları çekilirken bilinmeyen bir hata oluştu!'
        })
    }
})