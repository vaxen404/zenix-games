<script setup>
    import Sidebar from '~/components/Sidebar.vue';
    import Avatar from '~/components/Avatar.vue';
    import ErrorBox from '~/components/ErrorBox.vue';
    import { useSystemStore } from '../stores/system'

    definePageMeta({ middleware: 'auth' })

    const systemStore = useSystemStore()

    const errorMsg = ref('')
    const loading = ref(false)
    const games = ref([])
    const category = ref('all-games')
    const searchQuery = ref('')

    const getGames = async () => {
        if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') return
        try {
            loading.value = true
            const data = await $fetch('/api/games/owned-games', { method: 'GET', query: { userId: systemStore.userId } })
            games.value = data.items
        }catch(error) {
            errorMsg.value = error.data?.message || 'oyunlar getirilirken bilinmeyen bir hata oluştu!'
        }finally {
            loading.value = false
        }
    }

    const filteredGames = computed(() => {
        return games.value.filter(game => {
            const matchesSearch = game.name.toLowerCase().includes(searchQuery.value.toLowerCase())

        const matchesCategory = category.value === 'all-games' || game.genre?.toLowerCase() === category.value.toLowerCase()

            return matchesSearch && matchesCategory
        })
    })

    onMounted(() => {
        getGames()
    })
</script>

<template>
    <div class="liblary-layout">
        <Sidebar page="library"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <h1>GAMES</h1>
                    <span v-if="!loading" class="count-tag">{{ games.length }} oyun bulundu.</span>
                </div>

                <div class="top-actions">
                    <div class="search-box">
                        <div class="icon">🔎</div>
                        <input type="text" v-model="searchQuery" placeholder="Oyununu ara...">
                    </div>

                    <button @click="navigateTo('/cart')" class="cart">🛒 SEPET</button>
                </div>

                <Avatar />
            </header>

            <main class="liblary-content">
                <ErrorBox v-model="errorMsg" />

                <div v-if="!errorMsg" class="categories-nav">
                    <button @click="category = 'all-games'" class="category-btn" :class="{ active: category === 'all-games'}">All Games</button>
                    <button @click="category = 'fps'" class="category-btn" :class="{ active: category === 'fps'}">FPS</button>
                    <button @click="category = 'rpg'" class="category-btn" :class="{ active: category === 'rpg'}">RPG</button>
                    <button @click="category = 'moba'" class="category-btn" :class="{ active: category === 'moba'}">MOBA</button>
                    <button @click="category = 'souls-like'" class="category-btn" :class="{ active: category === 'souls-like'}">Souls-like</button>
                    <button @click="category = 'open world'" class="category-btn" :class="{ active: category === 'open world'}">Open World</button>
                </div> 

                <div v-if="loading" class="loading-state">Oyunlar yükleniyor...</div>

                <div v-else-if="games.length === 0" class="empty-liblary-state">
                    <div class="empty-icon">🛒</div>
                    <h2>Kütüphaneniz Şu An Boş</h2>
                    <p>Kütüphanenizi efsanevi oyunlarla doldurmak için henüz geç değil</p>
                    <button @click="navigateTo('/story')" class="discover-btn">
                        <span>Oyunları Keşfet</span>
                        <span class="arrow">→</span>
                    </button>
                </div>

                <div v-else class="games-grid">
                    <div v-for="game in filteredGames" :key="game.id" class="card game-card">
                        <div class="game-cover">
                            <img :src="game.image_url || 'https://via.placeholder.com/400x225'" :alt="game.name">
                            <span v-if="game.genre" class="game-tag">{{ game.genre }}</span>
                        </div>

                        <div class="game-body">
                            <h3 class="game-title">{{ game.name }}</h3>
                        </div>

                        <div class="game-footer">
                            <button class="play-btn">🎮 Oynamaya başla</button>
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
    .liblary-layout {
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
        width: 100%;
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

    .header-bar span {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #232329;
        padding: 6px 12px;
        border-radius: 12px;
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

    .cart {
        background: #16161a;
        border: 1px solid #232329;
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .cart:hover {
        border-color: #00ff66;
        color: #00ff66;
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.1);
    }

    .liblary-content {
        padding: 20px 60px 60px;
        overflow-y: auto;
        flex-grow: 1;
        box-sizing: border-box;
    }

    .categories-nav {
        display: flex;
        gap: 12px;
        margin-bottom: 32px;
        flex-wrap: wrap;
    }

    .category-btn {
        background: #16161a;
        border: 1px solid #232329;
        color: #a1a1aa;
        padding: 10px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .category-btn:hover {
        background: #1d1d24;
        color: white;
        border-color: #3b3b45;
    }

    .category-btn.active {
        background: rgba(0, 255, 102, 0.1);
        color: #00ff66;
        border-color: #00ff66;
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.05);
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
        box-shadow: 0 12px 30px rgba(0,0,0,0.6);
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
        justify-content: end;
        gap: 12px;
    }

    .play-btn {
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

    .play-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.3);
    }


    .empty-liblary-state {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        text-align: center;
        background: #16161a;
        border: 1px dashed #232329;
        border-radius: 20px;
        padding: 40px;
        margin-top: 20px;
    }

    .empty-icon {
        font-size: 64px;
        margin-bottom: 20px;
        animation: float 3s ease-in-out infinite;
        filter: drop-shadow(0 0 15px rgba(0, 255, 102, 0.2));
    }

    .empty-cart-state h2 {
        font-size: 24px;
        font-weight: 800;
        color: #fff;
        margin: 0 0 10px 0;
        letter-spacing: 0.5px;
    }

    .empty-cart-state p {
        font-size: 14px;
        color: #a1a1aa;
        margin: 0 0 30px 0;
        max-width: 360px;
        line-height: 1.5;
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

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
</style>