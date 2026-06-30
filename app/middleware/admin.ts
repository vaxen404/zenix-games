export default defineNuxtRouteMiddleware(() => {
    const authRole = useCookie('auth_role')

    if (authRole.value !== 'admin') {
        return navigateTo('/home')
    }
})