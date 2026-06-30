<script setup>
    import Sidebar from '~/components/Sidebar.vue';
    import Avatar from '~/components/Avatar.vue';
    import ErrorBox from '~/components/ErrorBox.vue';
    import { useSystemStore } from '../../stores/system'

    definePageMeta({ middleware: 'admin' })

    const systemStore = useSystemStore()

    const userDetails = ref({})
    const errorMsg = ref('')

    const getDetails = async () => {
        if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') {
            const date = new Date().toLocaleDateString()
            userDetails.value = {username: 'Demodmin', email: 'user@vaultx.com', created_at: date}
            return
        }

        try {
            const data = await $fetch('/api/user/user-details', { method: 'GET', query: { userId: systemStore.userId} })
            userDetails.value = data.details
        }catch(error) {
            errorMsg.value = error.data?.message || 'Kullanıcı bilgileri getirilirken bilinmeyen bir hata oluştu!'
        }
    }

    onMounted(() => {
        getDetails()
    })
</script>

<template>
    <div class="profile-layout">
        <Sidebar ui="admin"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <h1>My Profile</h1>
                    <p>Hesap bilgilerinizi buradan görebilirsiniz.</p>
                </div>
                
                <Avatar ui="admin"/>
            </header>

            <main class="profile-content">
                <ErrorBox v-model="errorMsg" />

                <div class="profile-card">
                    <div class="profile-avatar-large">
                        {{ userDetails.username?.charAt(0).toUpperCase() }}
                    </div>

                    <div class="profile-details">
                        <div class="detail-row">
                            <span class="detail-label">Kullanıcı Adı</span>
                            <span class="detail-value">@{{ userDetails.username }}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">Email Adresi</span>
                            <span class="detail-value">{{ userDetails.email }}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">Katılma Tarihi</span>
                            <span class="detail-value">{{ userDetails.created_at }}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
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
    .profile-layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        background: #0f0f12;
        color: white;
        overflow: hidden;
        box-sizing: border-box;
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

    .title-group {
        flex-grow: 1;
    }

    .header-bar h1 { font-size: 30px; margin: 0; font-weight: 800; }
    .header-bar p { color: #71717a; margin: 8px 0 0; }

    .profile-content {
        padding: 20px 60px 60px;
        overflow-y: auto;
        width: 100%;
        box-sizing: border-box;
    }

    .profile-card {
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 24px;
        padding: 40px;
        display: flex;
        gap: 40px;
        align-items: center;
        max-width: 600px;
    }

    .profile-avatar-large {
        width: 100px;
        height: 100px;
        background: #00ff66;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        font-weight: 800;
        color: white;
        flex-shrink: 0;
    }

    .profile-details {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .detail-row {
        display: flex;
        flex-direction: column;
        padding: 10px;
        border-radius: 12px;
        gap: 4px;
        border: 1px solid #1f1f24;
        padding-bottom: 12px;
    }

    .detail-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .detail-label {
        font-size: 11px;
        color: #52525b;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }

    .detail-value {
        font-size: 16px;
        color: white;
        font-weight: 500;
    }
</style>