<script setup>
    import Sidebar from '~/components/Sidebar.vue';
    import Avatar from '~/components/Avatar.vue';
    import ErrorBox from '~/components/ErrorBox.vue';
    import { useSystemStore } from '~/stores/system';

    definePageMeta({ middleware: 'admin' })

    const systemStore = useSystemStore()

    const route = useRoute()
    const userId = route.params.id
    const user = ref(null)
    const user_games = ref([])
    const user_cards = ref([]) 
    const errorMsg = ref('')
    const errorRef = ref(null)
    const successMsg = ref('')
    
    const currentPage = ref(1)

    const getUserDetails = async () => {
        try {
            currentPage.value = 1

            const data = await $fetch('/api/user/user-details', { method: 'GET', query: { userId: userId } })
            user.value = data.details

            const owned_games = await $fetch('/api/games/owned-games', { method: 'GET', query: { userId: userId } })
            user_games.value = owned_games.items || []
            
            const cardData = await $fetch('/api/card/card-details', { method: 'GET', query: { userId: userId } })
            if (cardData.success) {
                user_cards.value = cardData.cards || []
            }
        } catch(error) {
            errorMsg.value = error.data?.message || 'Kullanıcı verileri çekilirken bilinmeyen bir hata oluştu!'
        }
    }

    const copyToClipBoard = async (id) => {
        try {
            await navigator.clipboard.writeText(id)

            successMsg.value = 'ID Kopyalandı!'
            setTimeout(() => {
                successMsg.value = ''
            }, 2000);
        }catch(error) {
            errorMsg.value = 'Kopyalama işlemi başarısız oldu!'
        }
    }

    const activeCard = computed(() => {
        if (user_cards.value.length === 0) return null
        return user_cards.value[currentPage.value - 1] || null
    })

    const maskEmail = (email) => {
        if (!email) return ''
        const [name, domain] = email.split('@')
        if (name.length <= 2) return `${name[0]}***@${domain}`
        return `${name[0]}***${name[name.length - 1]}@${domain}`
    }

    const maskName = (name) => {
        if (!name) return ''
        return name.split(' ').map(word => {
            if (word.length <= 1) return word
            return word[0] + '*'.repeat(word.length - 1)
        }).join(' ')
    }

    const removeGame = async (game) => {
        if(!confirm(`${game.name} adlı oyunu kaldırmak istediğinize emin misiniz?`)) return

        if (systemStore.user === 'DemoAdmin') {
            errorMsg.value = 'Kullanıcıların Oyunlarını Kaldırmak İçin Admin Olmalısınız!'

            nextTick(() => {
                errorRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })

            return
        }

        try {
            await $fetch('/api/games/remove-game', {
                method: 'POST',
                body: {
                    userId: userId,
                    gameId: game.id
                }
            })
            await getUserDetails()

            await $fetch('/api/audit_logs', {
                method: 'POST',
                body: {
                    userId: systemStore.userId,
                    username: systemStore.user,
                    userType: systemStore.role,
                    action: 'DELETE_USER_GAMES',
                    details: `${userId} id li kullanıcının ${game.name} adlı oyununu sildi`
                }
            })
        }catch(error) {
            errorMsg.value = error.data?.message || 'Oyun kaldırılırken bilinmeyen bir hata oluştu!'
        }
    }

    onMounted(() => {
        getUserDetails()
    })
</script>

<template>
    <div class="user-detail-dashboard">
        <Sidebar page="users" ui="admin"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <NuxtLink to="/admin/users" class="back-btn">⬅ Geri Dön</NuxtLink>
                    <h1>Kullanıcı Detayı</h1>
                </div>
                <Avatar ui="admin"/>
            </header>

            <main class="detail-layout">
                <ErrorBox v-model="errorMsg" ref="errorRef"/>

                <SuccessBox v-model="successMsg"/>
                
                <div v-if="!user" class="loading-state">Veriler yükleniyor...</div>

                <div v-else class="content-grid">
                    
                    <div class="top-row">
                        
                        <div class="profile-card bg-card">
                            <div class="title">
                                <h3>Profil Bilgileri</h3>
                                <span class="role-badge" :class="user.role?.toLowerCase() === 'admin' ? 'role-admin' : 'role-user'">
                                    {{ user.role }}
                                </span>
                            </div>

                            <div class="info-group">
                                <label>Kullanıcı ID</label>
                                <div class="id-container">
                                    <span class="info-value text-muted">{{ user.id }}</span>
                                    <button @click="copyToClipBoard(user.id)" class="copy-btn">📋</button>
                                </div>
                            </div>
                            <div class="info-group">
                                <label>Kullanıcı Adı</label>
                                <span class="info-value">{{ user.username }}</span>
                            </div>
                            <div class="info-group">
                                <label>E-posta Adresi</label>
                                <span class="info-value">{{ systemStore.user === 'DemoAdmin' ? maskEmail(user.email) : user.email }}</span>
                            </div>
                            <div class="info-group">
                                <label>Kayıt Tarihi</label>
                                <span class="info-value">{{ user.created_at }}</span>
                            </div>
                        </div>

                        <div class="profile-card bg-card">
                            <h3 class="card-title">Kart Bilgileri ({{ user_cards.length }})</h3>
                            
                            <div v-if="user_cards.length === 0" class="no-cards-state">
                                Kayıtlı kart bulunamadı.
                            </div>

                            <div v-else-if="activeCard" class="card-display-area">
                                <div class="info-group">
                                    <label>Kart Sahibi</label>
                                    <span class="info-value">{{ systemStore.user === 'DemoAdmin' ? maskName(activeCard.card_holder_name) : activeCard.card_holder_name }}</span>
                                </div>
                                <div class="info-group">
                                    <label>Kart Numarası</label>
                                    <span class="info-value">**** **** **** {{ activeCard.last_four_digits }}</span>
                                </div>
                                <div class="info-group">
                                    <label>Son Kullanma</label>
                                    <span class="info-value">{{ String(activeCard.expiration_month).padStart(2, '0') }} / {{ activeCard.expiration_year }}</span>
                                </div>

                                <div class="pagination-wrapper">
                                    <button 
                                        v-for="page in user_cards.length" 
                                        :key="page"
                                        class="page-btn"
                                        :class="{ 'active-page': currentPage === page }"
                                        @click="currentPage = page"
                                    >
                                        {{ page }}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="games-section bg-card">
                        <h3>Sahip Olduğu Oyunlar ({{ user_games.length }})</h3>
                        
                        <div v-if="user_games.length === 0" class="no-games">
                            Bu kullanıcıya ait oyun bulunamadı.
                        </div>

                        <div v-else class="games-table-wrapper">
                            <table class="games-table">
                                <thead>
                                    <tr>
                                        <th>Görsel</th>
                                        <th>Oyun Adı</th>
                                        <th>Tür</th>
                                        <th>Kaldır</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="game in user_games" :key="game.id">
                                        <td>
                                            <img :src="game.image_url || '/placeholder-game.png'" alt="game" class="game-thumb">
                                        </td>   
                                        <td class="game-name">{{ game.name }}</td>
                                        <td><span class="genre-tag">{{ game.genre }}</span></td>
                                        <td>
                                            <button @click="removeGame(game)" class="action-delete-btn">🗑️</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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
    .user-detail-dashboard {
        display: grid;
        grid-template-columns: 260px 1fr;
        background: #0f0f12;
        color: white;
        min-height: 100vh;
        width: 100vw;
        max-width: 100vw;
        box-sizing: border-box;
    }

    .main-panel {
        display: flex;
        flex-direction: column;        
        width: 100%;
        height: 100vh;        
        max-height: 100vh;      
        overflow-y: auto;       
        box-sizing: border-box;
    }

    .header-bar {
        padding: 40px 60px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .page-info {
        display: flex;
        align-items: center;
        gap: 24px;
    }

    .back-btn {
        background: #16161a;
        border: 1px solid #232329;
        color: #a1a1aa;
        padding: 8px 16px;
        border-radius: 8px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        transition: 0.2s;
    }

    .back-btn:hover {
        background: #232329;
        color: white;
    }

    .header-bar h1 {
        font-size: 28px;
        font-weight: 800;
        margin: 0;
    }

    .detail-layout {
        padding: 20px 60px 40px;
    }

    .content-grid {
        display: flex;
        flex-direction: column;
        gap: 30px;
        width: 100%;
    }

    .top-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        width: 100%;
    }

    .bg-card {
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 16px;
        padding: 24px;
        box-sizing: border-box;
    }

    .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #232329;
        margin-bottom: 24px;
        padding-bottom: 12px;
        width: 100%;
    }

    .profile-card h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
    }

    .profile-card .card-title {
        margin: 0;
        border-bottom: 1px solid #232329;
        padding-bottom: 12px;
        padding-bottom: 12px;
        margin-bottom: 24px;

    }

    .info-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 18px;
    }

    .info-group label {
        font-size: 13px;
        color: #52525b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
    }

    .info-value {
        font-size: 16px;
        color: #e4e4e7;
        font-weight: 600;
    }

    .text-muted {
        color: #71717a;
        font-size: 14px;
        word-break: break-all;
    }

    .games-section {
        width: 100%;
    }

    .games-table-wrapper {
        overflow-x: auto;
    }

    .games-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 14px;
    }

    .games-table th {
        color: #a1a1aa;
        font-weight: 600;
        padding: 12px 16px;
        border-bottom: 1px solid #232329;
    }

    .games-table td {
        padding: 14px 16px;
        border-bottom: 1px solid #232329;
        vertical-align: middle;
    }

    .game-thumb {
        width: 45px;
        height: 60px;
        object-fit: cover;
        border-radius: 6px;
        background: #0f0f12;
    }

    .game-name {
        font-weight: 600;
        color: white;
    }

    .genre-tag {
        background: rgba(0, 255, 102, 0.05);
        border: 1px solid rgba(0, 255, 102, 0.1);
        color: #00ff66;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
    }

    .loading-state, .no-games, .no-cards-state {
        color: #a1a1aa;
        font-size: 15px;
        font-weight: 600;
        text-align: center;
        padding: 40px 0;
    }

    .pagination-wrapper {
        display: flex;
        gap: 8px;
        margin-top: 24px;
        justify-content: flex-start;
        border-top: 1px solid #232329;
        padding-top: 16px;
    }

    .page-btn {
        background: #0f0f12;
        border: 1px solid #232329;
        color: #a1a1aa;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .page-btn:hover {
        border-color: #00ff66;
        color: #00ff66;
    }

    .active-page {
        background: #00ff66 !important;
        color: #0f0f12 !important;
        border-color: #00ff66 !important;
        box-shadow: 0 0 10px rgba(0, 255, 102, 0.2);
    }

    .action-delete-btn {
        background: #232329;
        border: 1px solid #2d2d35;
        color: #a1a1aa;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .action-delete-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: #ef4444;
        color: #ef4444;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    }

    .action-delete-btn:active {
        transform: translateY(0);
    }

    .id-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .copy-btn {
        background: #232329;
        border: 1px solid #2d2d35;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0;
    }

    .copy-btn:hover {
        background: rgba(0, 255, 102, 0.1);
        border-color: #00ff66;
        transform: scale(1.05);
    }

    .copy-btn:active {
        transform: scale(0.95);
    }

    .role-badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        width: fit-content;
    }

    .role-admin {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }

    .role-user {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }
</style>