import { db } from '../../utils/db'

function maskIpAddress(ip: string): string {
    if (!ip || ip === '::1' || ip === '127.0.0.1') return '127.0.0.***';
    if (ip.includes('.')) {
        const parts = ip.split('.');
        parts[parts.length - 1] = '***';
        return parts.join('.');
    }
    if (ip.includes(':')) {
        const parts = ip.split(':');
        parts[parts.length - 1] = '***';
        return parts.join(':');
    }
    return ip;
}

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
        const { userId, username, userType, action, details } = data
        if(!userId || !username || !userType || !action || !details) {
            throw createError({ statusCode: 400, message: 'Eksik veri!' })
        }

        const headers = getHeaders(event)
        let publicIp = headers['x-forwarded-for']?.split(',')[0] || 
                       headers['x-real-ip'] || 
                       event.node.req.socket.remoteAddress || 
                       '127.0.0.1';
    
        try {
            const ipResponse = await $fetch<{ ip: string }>('https://api.ipify.org?format=json', { timeout: 3000 })
            if (ipResponse && ipResponse.ip) {
                publicIp = ipResponse.ip
            }
        } catch (ipError) {
            console.error('IP servisine erişilemedi, dahili IP kullanılıyor.');
        }

        const maskedIp = maskIpAddress(publicIp)

        const activityText = 'INSERT INTO audit_logs(user_id, username, user_type, action, details, ip_address, created_at) VALUES($1, $2, $3, $4, $5, $6, NOW())'
        await db.query(activityText, [ userId, username, userType, action, details, maskedIp])

        return { success: true, message: 'Başarıyla eklendi!' }
    } catch(error: any) {

        if(error.statusCode) throw error

        throw createError({ 
            statusCode: 500, 
            message: 'İşlem kaydedilirken bilinmeyen bir hata oluştu!' 
        })
    }
})