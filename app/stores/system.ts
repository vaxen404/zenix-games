import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', {
    state: () => {
        const userIdCookie = useCookie('auth_user_id')
        const usernameCookie = useCookie('auth_username')
        const roleCookie = useCookie('auth_role')

        return {
            isLoggedIn: !!userIdCookie.value,
            user: usernameCookie.value || null,
            userId: userIdCookie.value || null,
            role: roleCookie.value || null
        }
    },
    actions: {
        login(username: string, id: string, token: string = 'session-active', role: string = 'user') {
            const cookieOptions = { maxAge: 60 * 60 * 24 * 7, path: '/' }
            
            const userIdCookie = useCookie('auth_user_id', cookieOptions)
            const usernameCookie = useCookie('auth_username', cookieOptions)
            const tokenCookie = useCookie('auth_token', cookieOptions)
            const roleCookie = useCookie('auth_role', cookieOptions)

            userIdCookie.value = id
            usernameCookie.value = username
            tokenCookie.value = token
            roleCookie.value = role

            this.isLoggedIn = true
            this.user = username || 'Misafir'
            this.userId = id || ''
            this.role = role
        },
        logout() {  
            const userIdCookie = useCookie('auth_user_id')
            const usernameCookie = useCookie('auth_username')
            const tokenCookie = useCookie('auth_token')
            const roleCookie = useCookie('auth_role')
            
            userIdCookie.value = null
            usernameCookie.value = null
            tokenCookie.value = null
            roleCookie.value = null

            this.isLoggedIn = false
            this.user = null
            this.userId = null
            this.role = null
        }
    }
})