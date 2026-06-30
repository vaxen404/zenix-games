<script setup>
import Sidebar from '~/components/Sidebar.vue';
import Avatar from '~/components/Avatar.vue';
import ErrorBox from '~/components/ErrorBox.vue';
import { useSystemStore } from '../stores/system'
import { useCartStore } from '../stores/cart'

definePageMeta({ middleware: 'auth' })

const systemStore = useSystemStore()
const cartStore = useCartStore()

const games = ref([])
const errorMsg = ref('')
const errorRef = ref(null)
const successMsg = ref('')
const successRef = ref(null)
const category = ref('all-games')
const loading = ref(false)
const searchQuery = ref('')
const owned_games = ref([])

const categoriesList = ref([
    { id: 'all-games', label: 'All Games' },
    { id: 'fps', label: 'FPS' },
    { id: 'rpg', label: 'RPG' },
    { id: 'moba', label: 'MOBA' },
    { id: 'souls-like', label: 'Souls-like' },
    { id: 'open world', label: 'Open World' },
    { id: 'survival', label: 'Survival' },
    { id: 'sandbox', label: 'Sandbox' },
    { id: 'horror', label: 'Horror' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'sports', label: 'Sports / Racing' }
])

const getGames = async () => {
    try {
        loading.value = true 
        const data = await $fetch('/api/games/games-get', { method: 'GET'} )
        games.value = data
        
        if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') return
        const ownedGames = await $fetch('/api/games/owned-games', { 
            method: 'GET', 
            query: { userId: systemStore.userId }
        })
        owned_games.value = ownedGames.items || []
    } catch(error) {
        errorMsg.value = error.data?.message || 'Oyunlar getirilirken bilinmeyen bir hata oluştu!'
    } finally {
        loading.value = false
    }
}

const isGameOwned = (game) => {
    return owned_games.value.some(g => (g.game_id || g.id) === game.id)
}

const filteredGames = computed(() => {
    return games.value.filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        
        const matchesCategory = category.value === 'all-games' || 
            game.genre?.toLowerCase().includes(category.value.toLowerCase())

        return matchesSearch && matchesCategory
    })
})

const addToCart = async (game) => {
    errorMsg.value = ''
    if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') {
        const data = cartStore.cartItems
        const isGameExists = data.some(g => g.name === game.name)

        if(isGameExists) {
            errorMsg.value = 'Bu ürün zaten sepetinizde bulunuyor!'
            nextTick(() => { errorRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) })
            return
        }
        cartStore.addToCart(game)
        successMsg.value = 'Ürün sepetinize eklendi!'
        nextTick(() => { successRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) })

        setTimeout(() => { successMsg.value = '' }, 3000)
        return
    }

    try {
        const response = await $fetch('/api/cart/add-cart', {
            method: 'POST',
            body: { id: game.id, userId: systemStore.userId }
        })

        if(response.success){
            successMsg.value = 'Ürün sepetinize eklendi!'
            nextTick(() => { successRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) })
            setTimeout(() => { successMsg.value = '' }, 3000)
        }
    } catch(error) {
        errorMsg.value = error.data?.message || 'Sepete eklenirken bilinmeyen bir hata oluştu!'
        nextTick(() => { errorRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) })
    }
}

onMounted(async () => {
    await getGames()
})
</script>

<template>
    <div class="dashboard-layout">
        <Sidebar page="story"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <h1>GAMES</h1>
                    <span v-if="!loading" class="count-tag">{{ filteredGames.length }} oyun listeleniyor</span>
                </div>

                <div class="top-actions">
                    <div class="search-box">
                        <span class="icon">🔎</span>
                        <input type="text" v-model="searchQuery" placeholder="Oyununu ara...">
                    </div>

                    <button @click="navigateTo('/cart')" class="cart">🛒 SEPET</button>
                </div>

                <Avatar />
            </header>

            <main class="scrollable-content">
                <ErrorBox v-model="errorMsg" ref="errorRef"/>
                <SuccessBox v-model="successMsg" ref="successRef"/>

                <div v-if="!errorMsg" class="categories-nav">
                    <button 
                        v-for="cat in categoriesList" 
                        :key="cat.id"
                        @click="category = cat.id" 
                        class="category-btn" 
                        :class="{ active: category === cat.id }"
                    >
                        {{ cat.label }}
                    </button>
                </div> 

                <div v-if="loading" class="loading-state">Oyunlar Yükleniyor...</div>

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
                            <div v-if="!isGameOwned(game)" class="price-section">
                                <span v-if="game.oldPrice" class="old-price">{{ game.oldPrice }} TL</span>
                                <span class="current-price">{{ game.price > 0 ? game.price + ' TL' : 'Free to Play' }}</span>
                            </div>
                            
                            <div v-else class="price-section">
                                <span class="current-price" style="color: #ef4444; font-size: 14px;">Kütüphanede</span>
                            </div>

                            <button 
                                class="btn-add-cart" 
                                :class="{ 'btn-owned': isGameOwned(game) }"
                                :disabled="isGameOwned(game)"
                                @click="addToCart(game)"
                            >
                                {{ isGameOwned(game) ? '✓ Zaten Sahipsiniz' : '🛒 Sepete Ekle' }}
                            </button>
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
    .dashboard-layout {
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

    .scrollable-content {
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
        border-color: #00ff66;
        color: #00ff66;
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
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
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

    .btn-add-cart {
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

    .btn-add-cart:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.3);
    }

    .btn-add-cart.btn-owned {
        background: #232329 !important;
        color: #a1a1aa !important;
        border: 1px solid #2d2d35 !important;
        cursor: not-allowed !important;
        box-shadow: none !important;
        transform: none !important;
    }
</style>