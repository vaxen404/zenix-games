import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const userId = query.userId

        if (!userId) {
            throw createError({ 
                statusCode: 400, 
                message: 'Eksik veri!' 
            })
        }

        const queryText = `
            select 
                c.id as cart_item_id,
                g.id as game_id,
                g.name,
                g.price,
                g.image_url,
                c.added_at
            from cart c inner join games g on c.game_id = g.id
            where c.user_id = $1
            order by c.added_at desc;
        `

        const result = await db.query(queryText, [userId])

        return {
            success: true,
            cartItems: result.rows
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        throw createError({
            statusCode: 500,
            message: 'Sepetteki ürünler listelenirken bir hata oluştu!'
        })
    }
})