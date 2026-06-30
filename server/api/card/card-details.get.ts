import { db } from '../../utils/db'
import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const KEY = Buffer.from('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6') 

function decrypt(text: string): string {
    try {
        if (!text || !text.includes(':')) return 'Geçersiz Veri'

        const parts = text.split(':')
        const ivHex = parts[0]
        const encryptedText = parts[1]

        if (!ivHex || !encryptedText) {
            return 'Şifre Çözülemedi'
        }

        const iv = Buffer.from(ivHex, 'hex')
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch (e) {
        return 'Şifre Çözülemedi'
    }
}

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const userId = query.userId

        if (!userId) {
            throw createError({ statusCode: 400, message: 'Kullanıcı ID parametresi eksik!' })
        }

        const result = await db.query(
            `SELECT id, card_holder_name, encrypted_card_number, last_four_digits, expiration_month, expiration_year 
             FROM user_cards 
             WHERE user_id = $1`, 
            [userId]
        )

        const openCards = result.rows.map((card: any) => {
            return {
                id: card.id,
                card_holder_name: card.card_holder_name,
                last_four_digits: card.last_four_digits,
                expiration_month: card.expiration_month,
                expiration_year: card.expiration_year,
                cardNumber: decrypt(card.encrypted_card_number || '') 
            }
        })

        return {
            success: true,
            cards: openCards
        }

    } catch (error: any) {
        if (error.statusCode) throw error
        
        throw createError({
            statusCode: 500,
            message: 'Kartlar getirilirken ve şifreleri çözülürken bir hata oluştu!'
        })
    }
})