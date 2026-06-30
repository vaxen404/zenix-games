import { db } from '../../utils/db'

export default defineEventHandler( async (event) => {
    try {

        const product = await readBody(event)

        if (!product.id || !product.userId) {
            throw createError({ statusCode: 400, message: 'Eksik veya hatalı ürün verisi!' })
        }

        const checkQuery = `SELECT * FROM cart WHERE user_id = $1 AND game_id = $2;`
        const checkResult = await db.query(checkQuery, [product.userId, product.id])

        if (checkResult.rows.length > 0) {
            throw createError({ 
                statusCode: 400, 
                message: 'Bu ürün zaten sepetinizde bulunuyor!' 
            })
        }
    
        const queryText = `
            INSERT INTO cart (user_id, game_id) 
            VALUES ($1, $2)
            RETURNING *;
        `
    
        const result = await db.query(queryText, [product.userId, product.id])
    
        return {
            success: true,
            message: 'sepete başarıyla eklendi!',
            data: result.rows[0]
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: 'Sepete eklenirken bilinmeyen bir hata olustu!'
        })
    }
})