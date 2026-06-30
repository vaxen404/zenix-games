<script setup>
    import Avatar from '~/components/Avatar.vue'
    import ErrorBox from '~/components/ErrorBox.vue'
    import Sidebar from '~/components/Sidebar.vue'
    import { useSystemStore } from '~/stores/system'
    import { UpdatePasswordSchema } from '../../utils/schemas'

    definePageMeta({ middleware: 'admin' })

    const systemStore = useSystemStore()

    const errorMsg = ref('')
    const successMsg = ref('')
    const msgBoxOpen = ref(false)
    const msgBoxRef = ref(null)

    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')

    const handlePasswordUpdate = async () => {
        errorMsg.value = ''

        if (systemStore.user === 'DemoAdmin') {
            msgBoxOpen.value = true

            nextTick(() => {
                msgBoxRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })

            return
        }

        const validation = UpdatePasswordSchema.safeParse({
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
            confirmPassword: confirmPassword.value
        })

        if (!validation.success) {
            errorMsg.value = validation.error.issues[0]?.message || 'Geçerli bilgiler giriniz!'
            return
        }

        try {
            const response = await $fetch('/api/user/update-password', {
                method: 'POST',
                body: {
                    currentPassword: currentPassword.value,
                    newPassword: newPassword.value,
                    userId: systemStore.userId
                }
            })

            if(response.success) {
                successMsg.value = 'Şifreniz başarıyla güncellendi!'

                await $fetch('/api/audit_logs', {
                    method: 'POST',
                    body: {
                        userId: systemStore.userId,
                        username: systemStore.user,
                        userType: systemStore.role,
                        action: 'CHANGED_PASSWORD',
                        details: `Şifresini değiştirdi`
                    }
                })

                setTimeout(() => {
                    successMsg.value = ''
                }, 3000);
            }
        }catch(error) {
            errorMsg.value = error.data?.message || 'Şifre güncellenirken bilinmeyen bir hata oluştu!'
        }
    }

    const handleDeleteAccount = async () => {
        errorMsg.value = ''
        msgBoxOpen.value = false
        
        if(!confirm('Hesabınızı silmek istediğinizden emin misiniz?')) return
        
        if (systemStore.user === 'DemoAdmin') {
            systemStore.logout()
            return navigateTo('/')
        }

        try {
            const response = await $fetch('/api/user/delete-user', {
                method: 'POST',
                body: {
                    userId: systemStore.userId
                }
            })

            if(response.success) {
                await $fetch('/api/audit_logs', {
                    method: 'POST',
                    body: {
                        userId: systemStore.userId,
                        username: systemStore.user,
                        userType: systemStore.role,
                        action: 'CHANGED_PASSWORD',
                        details: `Hesap kaydını sildi`
                    }
                })

                systemStore.logout()
                let count = 4

                const countDown = setInterval(() => {
                    count --

                    if(count > 0) {
                        successMsg.value = `Hesabınız silindi! Yönlendiriliyorsunuz: ${count}`
                    }else {
                        clearInterval(countDown)
                        successMsg.value = 'Hesabınız silindi!'
                        setTimeout(() => {
                            navigateTo('/')
                        }, 1000);
                    }
                }, 1000)
            }
        }catch(error) {
            errorMsg.value = error.data?.message || 'Hesabınız silinirken bilinmeyen bir hata oluştu!'
        }
    }

</script>

<template>
    <div class="settings-dashboard">
        <Sidebar ui="admin"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="title-group">
                    <h1>Settings</h1>
                    <p>Sistem, güvenlik ve hesap tercihlerinizi kişiselleştirin</p>
                </div>

                <Avatar ui="admin"/>
            </header>

            <main class="settings-content">
                <ErrorBox v-model="errorMsg" />

                <SuccessBox v-model="successMsg"/>

                <div v-if="msgBoxOpen" class="msg-box" ref="msgBoxRef">
                    <h2>Henüz giriş yapmadınız</h2>
                    <p>Güvenlik ve hesap ayarlarınızı değiştirmek için giriş yapmalısınız.</p>
                    <button @click="navigateTo('/')" class="discover-btn">
                        <span>Giriş Yap</span>
                        <span class="arrow">→</span>
                    </button>
                </div>

                <div class="settings-layout">
                    <div class="settings-card">
                        <h3>🔑 Şifre Değiştir</h3>
                        <p class="card-desc">Hesap güvenliğiniz için düzenli olarak şifrenizi değiştirmeniz önerilir</p>
                        
                        <form @submit.prevent="handlePasswordUpdate" class="settings-form">
                            <div class="form-group">
                                <label>Mevcut Şifre</label>
                                <input type="password" v-model="currentPassword" placeholder="••••••••" autocomplete="current-password" />
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Yeni Şifre</label>
                                    <input type="password" v-model="newPassword" placeholder="••••••••" autocomplete="new-password" />
                                </div>
                                <div class="form-group">
                                    <label>Yeni Şifre (Tekrar)</label>
                                    <input type="password" v-model="confirmPassword" placeholder="••••••••" autocomplete="new-password" />
                                </div>
                            </div>
                            
                            <button type="submit" class="submit-btn">Şifreyi Güncelle</button>
                        </form>
                    </div>
                </div>

                <div class="settings-card danger-card" style="margin-top: 24px;">
                    <h3>🚨 Tehlikeli Bölge</h3>
                    <p class="card-desc">Geri dönüşü olmayan hesap işlemleri</p>
                    <div class="settings-item no-border">
                        <div class="settings-info">
                            <span class="settings-title danger-text">Hesabı kalıcı olarak sil</span>
                            <span class="settings-desc">Hesabınızı sildiğinizde, eJutsu üzerindeki oyunlarınız ve tüm verileriniz kalıcı olarak silinir.</span>
                        </div>
                        <button class="btn-danger" @click="handleDeleteAccount">
                            🗑️ Hesabı Sil
                        </button>
                    </div>
                </div>
            </main>
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
    .settings-dashboard {
        display: flex;
        width: 100%;
        min-width: 100%;
        height: 100vh;
        background: #0f0f12;
        color: white;
        overflow: hidden;
    }

    .main-panel {
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
    }

    .header-bar {
        padding: 40px 60px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
    }

    .title-group { flex-grow: 1; }
    .header-bar h1 { font-size: 30px; margin: 0; font-weight: 800; }
    .header-bar p { color: #71717a; margin: 8px 0 0; }

    .settings-content {
        padding: 20px 60px 60px;
        overflow-y: auto;
        width: 100%;
        box-sizing: border-box;
    }

    .settings-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 650px;
    }
    
    .settings-card { background: #16161a; border: 1px solid #232329; border-radius: 24px; padding: 32px; max-width: 650px; box-sizing: border-box; }
    .settings-card h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: white; }
    .card-desc { color: #63636e; font-size: 13px; margin: 0 0 24px 0; }

    .settings-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: flex; gap: 16px; }
    .form-row .form-group { flex: 1; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #a1a1aa; }

    .settings-form input {
        background: #0f0f12; border: 1px solid #232329; border-radius: 12px; padding: 14px 16px;
        color: white; font-size: 14px; outline: none; box-sizing: border-box; width: 100%; transition: border-color 0.2s;
    }
    .settings-form input:focus { border-color: #6366f1; }

    .submit-btn {
        align-self: flex-start; background: #6366f1; border: none; color: white; padding: 14px 28px;
        border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; margin-top: 8px;
    }
    .submit-btn:hover { background: #4f46e5; }

    .danger-card { border-color: rgba(239, 68, 68, 0.2); }
    
    .settings-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
    .no-border { padding: 0; }
    .settings-info { display: flex; flex-direction: column; gap: 6px; padding-right: 24px; }
    .settings-title { font-size: 15px; font-weight: 600; }
    .danger-text { color: #ef4444; }
    .settings-desc { font-size: 13px; color: #63636e; line-height: 1.5; }

    .btn-danger {
        background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444;
        padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer;
        transition: 0.2s ease; flex-shrink: 0;
    }
    .btn-danger:hover { background: #ef4444; color: white; border-color: #ef4444; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }

    .message-box { padding: 14px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; max-width: 650px; box-sizing: border-box; }
    .success-box { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #22c55e; }
    .box-icon { font-size: 16px; }

    .msg-box {
        max-width: 650px;
        padding: 40px 0 60px;
        background: rgba(255, 255, 255, 0.02);
        color: #a1a1aa;
        border: 1px solid #232329;
        border-radius: 24px;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
    }

    .discover-btn {
        background: rgba(0, 255, 102, 0.1);
        border: 1px solid #00ff66;
        color: #00ff66;
        padding: 14px 28px;
        margin-top: 10px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 20px rgba(0, 255, 102, 0.05);
    }

    .discover-btn:hover {
        background: #00ff66;
        color: #0f0f12;
        box-shadow: 0 0 25px rgba(0, 255, 102, 0.4);
        transform: translateY(-2px);
    }

    .discover-btn:hover .arrow {
        transform: translateX(4px);
    }

    .discover-btn .arrow {
        transition: transform 0.2s ease;
        font-weight: 800;
    }
</style>