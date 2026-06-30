import { db } from '../../utils/db'
import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const KEY = Buffer.from('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6') 

function encrypt(text: string) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { userId, cardHolderName, cardNumber, expirationMonth, expirationYear, cvv } = body

        const lastFourDigits = cardNumber.slice(-4)

        const encryptedCardNumber = encrypt(cardNumber)
        const encryptedCvv = encrypt(cvv)

        await db.query(
            `INSERT INTO user_cards (
                user_id, card_holder_name, encrypted_card_number, 
                last_four_digits, expiration_month, 
                expiration_year, encrypted_cvv
             ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                userId, cardHolderName, encryptedCardNumber, 
                lastFourDigits, parseInt(expirationMonth), 
                parseInt(expirationYear), encryptedCvv
            ]
        )

        return { success: true, message: 'Kart güvenli şekilde şifrelenip kaydedildi.' }
    } catch (error: any) {
        throw createError({ statusCode: 500, message: 'Kart kaydedilemedi!' })
    }
})