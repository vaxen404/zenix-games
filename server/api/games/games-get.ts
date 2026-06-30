import fs from 'fs/promises'
import path from 'path'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const result = await db.query('select * from games')

        return result.rows
    }catch(error: any){
        throw createError({
            statusCode: 500,
            statusMessage: 'Oyunlar getirilirken bilinmeyen bir hata oluştu.',
        })
    }
})