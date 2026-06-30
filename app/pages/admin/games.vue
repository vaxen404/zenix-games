<script setup>
    import ErrorBox from '~/components/ErrorBox.vue';
    import { useSystemStore } from '../../stores/system';
    import SuccessBox from '~/components/SuccessBox.vue';
    import Avatar from '~/components/Avatar.vue';
    import Sidebar from '~/components/Sidebar.vue';

    definePageMeta({ middleware: 'admin' })

    const systemStore = useSystemStore()

    const games = ref([])
    const loading = ref(false)
    const errorMsg = ref('')
    const errorRef = ref(null)
    const successMsg = ref('')
    const successRef = ref(null)
    const isGiftBoxOpen = ref(false)
    const searchQuery = ref('')

    const receiverId = ref('')
    const gameId = ref('')
    const gameName = ref('')

    const category = ref('all-games')

    const getGames = async () => {
        try {
            loading.value = true
            const data = await $fetch('/api/games/games-get', { method: 'GET'} )
            games.value = data
        }catch(error) {
            errorMsg.value = error.data?.message || 'Oyunlar çekilirken bir hata oluştu!'
        }finally {
            loading.value = false
        }
    }

    const toggleGiftBoxOpen = (id, name) => {
        isGiftBoxOpen.value = !isGiftBoxOpen.value
        gameId.value = id
        gameName.value = name
    }

    const filteredGames = computed(() => {
        return games.value.filter(game => {
            const matchesSearch = game.name?.toLowerCase().includes(searchQuery.value.toLowerCase())

            const matchesCategory = category.value === 'all-games' || game.genre?.toLowerCase() === category.value.toLowerCase()

            return matchesSearch && matchesCategory
        })
    })

    const sendToUser = async () => {
        errorMsg.value = ''

        if (systemStore.user === 'DemoAdmin') {
            isGiftBoxOpen.value = false
            errorMsg.value = 'Kullanıcılara Oyun Hediye Etmek İçin Admin Olmalısınız!'

            nextTick(() => {
                errorRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })

            return
        }

        if(receiverId.value === '') {
            errorMsg.value = 'Kullanıcı ID Giriniz!'

            nextTick(() => {
                errorRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })

            isGiftBoxOpen.value = false
            return
        }

        try {
            const userData = await $fetch(`/api/user/user-details`, {
                method: 'GET',
                query: { userId: receiverId.value }
            })

            const targetUsername = userData?.details.username

            const response = await $fetch('/api/user/gift-user', {
                method: 'POST',
                body: {
                    receiverId: receiverId.value,
                    gameId: gameId.value,
                    senderId: systemStore.userId
                }
            })
            if(response.success) {
                successMsg.value = `${receiverId.value} ID li kullanıcıya başarıyla hediye edildi!`

                await $fetch('/api/audit_logs', {
                    method: 'POST',
                    body: {
                        userId: systemStore.userId,
                        username: systemStore.user,
                        userType: systemStore.role,
                        action: 'SEND_GIFT',
                        details: `${receiverId.value} id li kullanıcıya ${gameName.value} hediye etti`
                    }
                })

                await $fetch('/api/audit_logs', {
                    method: 'POST',
                    body: {
                        userId: receiverId.value,
                        username: targetUsername,
                        userType: 'user',
                        action: 'GIFT_RECEIVED',
                        details: `Admin ${systemStore.user} tarafından ${gameName.value} oyunu hediye edildi`
                    }
                })

                nextTick(() => {
                    successRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                })

                setTimeout(() => {
                    successMsg.value = ""
                }, 4000);
            }
        }catch(error) {
            console.log(error);
            errorMsg.value = error.data?.message || 'Kullanıcıya gönderilirken bilinmeyen bir hata oluştu!'

            nextTick(() => {
                errorRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })
        }finally {
            isGiftBoxOpen.value = false
            receiverId.value = ''
            gameId.value = ''
            gameName.value = ''
        }
    }


    onMounted(() => {
        getGames()
    })
</script>

<template>
    <div class="games-dashboard">
        <Sidebar page="games" ui="admin"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <h1>GAMES</h1>
                    <span class="count-tag">{{ filteredGames.length }} oyun bulundu.</span>
                </div>

                <div class="top-actions">
                    <div class="search-box">
                        <span class="icon">🔎</span>
                        <input type="text" v-model="searchQuery" placeholder="Oyununu ara...">
                    </div>
                </div>

                <Avatar ui="admin"/>
            </header>

            <main class="games-layout">
                <ErrorBox v-model="errorMsg" ref="errorRef"/>

                <SuccessBox v-model="successMsg" ref="successRef"/>

                <div v-if="isGiftBoxOpen" class="gift-box-overlay" @click.self="isGiftBoxOpen = false">
                    <div class="gift-box-content">
                        <button class="close-gift-btn" @click="isGiftBoxOpen = false">x</button>
                        <h2>🎁 Oyun Hediye Et</h2>

                        <div class="gift-form">
                            <input type="text" v-model="receiverId" placeholder="Kullanıcı ID" class="gift-input">
                            <button @click="sendToUser" class="gift-submit-btn">Gönder</button>
                        </div>
                    </div>
                </div>

                <CategoryNav v-model:errorMsg="errorMsg" v-model:category="category" />

                <div v-if="loading" class="loading-state">Oyunlar yükleniyor...</div>

                <div v-else class="games-grid">
                    <div v-for="game in filteredGames" :key="game.id" class="card game-card">
                        <div class="game-cover">
                            <img :src='game.image_url || "https://via.placeholder.com/400x225"' :alt="game.name">
                            <span v-if="game.genre" class="game-tag">{{ game.genre }}</span>
                        </div>

                        <div class="game-body">
                            <h3 class="game-title">{{ game.name }}</h3>
                        </div>

                        <div class="game-footer">
                            <div class="price-section">
                                <span v-if="game.oldPrice" class="old-price">{{ game.oldPrice }} TL</span>
                                <span class="currentPrice">{{ game.price > 0 ? game.price + 'TL' : 'Free to play' }}</span>
                            </div>

                            <button class="gift-btn" @click="toggleGiftBoxOpen(game.id, game.name)">🎁 Hediye Et</button>
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

    .games-dashboard {
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
        height: 100vh;
        overflow: hidden;
        box-sizing: border-box;
    }

    .header-bar {
        padding: 40px 60px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        gap: 20px;
    }

    .page-info {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-grow: 1;
    }

    .header-bar h1 {
        font-size: 32px;
        font-weight: 800;
        margin: 0;
        letter-spacing: 0.5px;
    }

    .count-tag {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #232329;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 13px;
        color: #a1a1aa;
        font-weight: 600;
    }

    .top-actions { display: flex; align-items: center; gap: 20px; }

    .search-box {
        background: #16161a;
        border: 1px solid #232329;
        padding: 10px 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        width: 280px;
    }
    
    .search-box input { background: transparent; border: none; color: white; outline: none; width: 100%; }

    .games-layout {
        padding: 20px 60px 60px;
        overflow-y: auto;
        flex-grow: 1;
        box-sizing: border-box;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        color: #a1a1aa;
        font-size: 16px;
        font-weight: 600;
    }

    .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        width: 100%;
        box-sizing: border-box;
    }

    .game-card {
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 20px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .game-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12pz 30px rgba(0,0,0,0.6);
        border-color: rgba(0, 255, 102, 0.2);
    }

    .game-cover {
        position: relative;
        width: 100%;
        padding-top: 56.25%;
        background: #0f0f12;
    }

    .game-cover img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .game-tag {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(15, 15, 18, 0.75);
        backdrop-filter: blur(4px);
        color: #00ff66;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .game-body {
        padding: 20px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .game-title {
        color: #fff;
        font-size: 18px;
        font-weight: 800;
        margin: 0;
    }

    .game-footer {
        padding: 0 20px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .price-section {
        display: flex;
        flex-direction: column;
    }

    .old-price {
        color: #71717a;
        font-size: 12px;
        text-decoration: line-through;
        margin-bottom: 2px;
    }

    .current-price {
        color: #fff;
        font-size: 16px;
        font-weight: 800;
    }

    .gift-box-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 15, 18, 0.7); 
        backdrop-filter: blur(4px); 
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999; 
    }

    .gift-box-content {
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 16px;
        padding: 32px;
        width: 400px;
        max-width: 90%;
        position: relative;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 102, 0.05);
        text-align: center;
        animation: scaleUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .close-gift-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        background: transparent;
        border: none;
        color: #a1a1aa;
        font-size: 16px;
        cursor: pointer;
        transition: color 0.2s;
    }

    .close-gift-btn:hover {
        color: #ef4444;
    }

    .gift-box-content h2 {
        margin-top: 0;
        font-size: 22px;
        color: white;
    }

    .gift-box-content p {
        color: #a1a1aa;
        font-size: 14px;
        margin-bottom: 24px;
    }

    .gift-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .gift-input {
        background: #0f0f12;
        border: 1px solid #232329;
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
        outline: none;
    }

    .gift-input:focus {
        border-color: #00ff66;
    }

    .gift-submit-btn {
        background: #00ff66;
        color: #0f0f12;
        border: none;
        border-radius: 8px;
        padding: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
    }

    .gift-submit-btn:hover {
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.4);
        transform: translateY(-1px);
    }

    @keyframes scaleUp {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .gift-btn {
        background: #00ff66;
        color: #0f0f12;
        border: none;
        padding: 10px 16px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 255, 102, 0.1);
    }

    .gift-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.3);
    }

    .gift-btn.btn-owned {
        background: #232329 !important;
        color: #a1a1aa !important;
        border: 1px solid #2d2d35 !important;
        cursor: not-allowed !important;
        box-shadow: none !important;
        transform: none !important;
    }
</style>