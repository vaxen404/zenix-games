export default defineNuxtRouteMiddleware((to) => {
    const authToken = useCookie('auth_token')

    if (!authToken.value && to.path !== '/') {
        return navigateTo('/')
    }

    if (authToken.value && to.path === '/') {
        return navigateTo('/home') 
    }
})