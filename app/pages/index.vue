<script setup>
import { ref } from 'vue'
import ErrorBox from '~/components/ErrorBox.vue';
import { UserSchema } from '../utils/schemas'
import { useSystemStore } from '../stores/system'

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const login = async (mode = false) => {
    const systemStore = useSystemStore()
    systemStore.logout()
    errorMsg.value = ''

    if (mode === 'demo_admin' || mode === 'demo_user') {
        const isTargetAdmin = mode === 'demo_admin'
        const demoName = isTargetAdmin ? 'DemoAdmin' : 'DemoUser'
        const demoRole = isTargetAdmin ? 'admin' : 'user'
        
        if (process.client) {
            localStorage.setItem('username', demoName)
        }
        
        systemStore.login(demoName, isTargetAdmin ? 'admin_456' : 'user_789', 'demo-token-active', demoRole)

        await $fetch('/api/audit_logs', {
            method: 'POST',
            body: {
                userId: systemStore.userId,
                username: systemStore.user,
                userType: systemStore.role,
                action: 'LOGIN',
                details: 'demo olarak giriş yaptı!'
            }
        })

        return navigateTo(isTargetAdmin ? '/admin' : '/home')
    }

    const result = UserSchema.pick({ username: true, password: true }).safeParse({ 
        username: username.value, 
        password: password.value
    })
    
    if (!result.success) {
        errorMsg.value = result.error.issues[0]?.message || 'Geçerli bilgiler giriniz!'
        return
    }
    
    try {


        loading.value = true
        const response = await $fetch('/api/auth/login', {
            method: 'POST',
            body: {
                username: username.value,
                password: password.value
            }
        })
        
        if (response.success) {
            if (process.client) {
                localStorage.setItem('username', username.value)
            }
            
            const userToken = response.token || 'session-active'
            systemStore.login(username.value, response.user.id, userToken, response.user.role)

            await $fetch('/api/audit_logs', {
                method: 'POST',
                body: {
                    userId: response.user.id,
                    username: username.value,
                    userType: response.user.role,
                    action: 'LOGIN',
                    details: 'giriş yapıldı!'
                }
            })
            
            if (response.user.role === 'admin') {
                navigateTo('/admin')
            } else {
                navigateTo('/home')
            }
        }
    } catch (error) {
        errorMsg.value = error.data?.message || 'Giriş sırasında bilinmeyen bir hata oluştu!'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="brand">
                <div class="brand-icon">E</div>
                <h2>Tekrar Hoş Geldiniz!</h2>
                <p>Oyun satın almak için giriş yap</p>
            </div>

            <ErrorBox v-model="errorMsg"/>

            <div class="form-body">
                <div class="input-group">
                    <label>Kullanıcı Adı</label>
                    <input
                        type="text"
                        v-model="username"
                        placeholder="kullanıcı adı giriniz..."
                        :class="{ 'input-error': errorMsg && !username }"
                        @keyup.enter="login(false)"
                    >
                </div>

                <div class="input-group">
                    <label>Şifre</label>
                    <input
                        type="password"
                        v-model="password"
                        placeholder="••••••••"
                        :class="{ 'input-error': errorMsg && !password }"
                        @keyup.enter="login(false)"
                    >
                </div>

                <button class="btn-main" :disabled="loading" @click="login(false)">
                    {{ loading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
                </button>

                <div class="demo-wrapper">
                    <button class="btn-main btn-demo btn-admin-demo" :disabled="loading" @click="login('demo_admin')">
                        🛡️ Admin Olarak İncele
                    </button>
                    <button class="btn-main btn-demo btn-user-demo" :disabled="loading" @click="login('demo_user')">
                        🌐 Kullanıcı Olarak İncele
                    </button>
                </div>
            </div>

            <div class="footer">
                <span>Henüz hesabın yok mu?</span>
                <button class="btn-link" @click="navigateTo('/signup')">Kayıt Ol</button>
            </div>
        </div>
    </div>
</template>

<style>
html, body, #__nuxt {
    margin: 0 !important;
    padding: 0 !important;
    height: 100% !important;
    width: 100% !important;
    background: #0f0f12;
    overflow: hidden; 
}
</style>

<style scoped>
    .auth-container {
        min-height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0f0f12;
        color: #fff;
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
    }

    .auth-card {
        width: 100vw;
        max-width: 400px;
        background: #16161a;
        padding: 40px;
        border-radius: 24px;
        border: 1px solid #232329;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }

    .brand {
        text-align: center;
        margin-bottom: 30px;
    }

    .brand-icon {
        width: 44px;
        height: 44px;
        background: #00ff66;
        color: #0f0f12;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 20px;
        margin: 0 auto 16px;
        box-shadow: 0 0 20px rgba(0, 255, 102, 0.3);
    }

    h2 {
        font-size: 24px;
        margin-bottom: 8px;
        font-weight: 800;
    }

    p {
        color: #71717a;
        font-size: 14px;
    }

    .input-group {
        margin-bottom: 20px;
    }

    label {
        display: block;
        font-size: 13px;
        color: #a1a1aa;
        margin-bottom: 8px;
        font-weight: 600;
    }

    input {
        width: 100%;
        padding: 12px 16px;
        background: #0f0f12;
        border: 1px solid #232329;
        border-radius: 12px;
        color: #fff;
        font-size: 15px;
        box-sizing: border-box;
        transition: all 0.2s ease;
    }

    input:focus {
        outline: none;
        border-color: #00ff66;
        background: #111116;
        box-shadow: 0 0 10px rgba(0, 255, 102, 0.1);
    }

    .input-error {
        border-color: #ef4444 !important;
    }

    .btn-main {
        width: 100%;
        padding: 14px;
        background: #00ff66;
        color: #0f0f12;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 10px;
        box-shadow: 0 4px 12px rgba(0, 255, 102, 0.15);
    }

    .btn-main:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 0 20px rgba(0, 255, 102, 0.3);
    }

    .demo-wrapper {
        display: flex;
        gap: 10px;
        margin-top: 4px;
    }

    .btn-demo {
        font-size: 11px;
        padding: 10px 6px;
        border-radius: 10px;
        font-weight: 600;
    }

    .btn-admin-demo {
        background: rgba(0, 255, 102, 0.1);
        color: #00ff66;
        border: 1px solid rgba(0, 255, 102, 0.2);
        box-shadow: none;
    }

    .btn-admin-demo:hover:not(:disabled) {
        background: rgba(0, 255, 102, 0.2);
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.1);
    }

    .btn-user-demo {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.2);
        box-shadow: none;
    }

    .btn-user-demo:hover:not(:disabled) {
        background: rgba(59, 130, 246, 0.2);
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
    }

    .btn-main:disabled {
        opacity: 0.5;
        background: #232329;
        color: #71717a;
        box-shadow: none;
        cursor: not-allowed;
    }

    .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 14px;
        color: #71717a;
    }

    .btn-link {
        background: none;
        border: none;
        color: #00ff66;
        font-weight: 700;
        cursor: pointer;
        margin-left: 6px;
        transition: color 0.15s ease;
    }

    .btn-link:hover {
        text-decoration: underline;
        color: #00cc52;
    }
</style>