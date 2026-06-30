import { db } from '../../utils/db'
import argon2 from 'argon2'

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)

        if(!data || !data.userId || !data.currentPassword || !data.newPassword) {
            throw createError({ statusCode: 400, message: 'Eksik veri!'} )
        }

        const result = await db.query(`select password_hash from users where id = $1`, [data.userId])

        if(!result.rows || result.rows.length === 0) {
            throw createError({ statusCode: 404, message: 'Kullanıcı bulunamadı, çık gir yapın!'})
        }

        const currentPasswordHash = result.rows[0].password_hash

        const isPasswordValid = await argon2.verify(currentPasswordHash, data.currentPassword)

        if(!isPasswordValid) {
            throw createError({ statusCode: 401, message: 'Yanlış şifre!' })
        }

        const isSamePassword = await argon2.verify(currentPasswordHash, data.newPassword)
        if(isSamePassword) {
            throw createError({ statusCode: 409, message: 'Yeni şifreniz mevcut şifrenizle aynı!' })
        }

        const newPasswordHash = await argon2.hash(data.newPassword)

        await db.query(`update users set password_hash = $1 where id = $2`, [newPasswordHash, data.userId])

        return {
            success: true,
            message: 'şifre başarıyla güncellendi!'
        }
    }catch(error: any) {
        if(error.statusCode) throw error

        throw createError({
            statusCode: 500,
            message: 'Şifre güncellenirken bilinmeyen bir hata oluştu!'
        })
    }
})