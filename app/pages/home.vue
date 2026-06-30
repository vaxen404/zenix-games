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
const owned_games = ref([])
const users = ref([])

const getGames = async () => {
    try {
        loading.value = true
        console.log(systemStore.user);
        console.log(systemStore.userId);
        console.log(systemStore.role);

        const gamesList = await $fetch('/api/games/games-get', { method: 'GET'} )
        games.value = gamesList.length

        if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') {
            owned_games.value = 0
            return
        }
        
        const owned_gamesList = await $fetch('/api/games/owned-games', { method: 'GET', query: { userId: systemStore.userId } })
        owned_games.value = owned_gamesList.items.length
    }catch(error) {
        errorMsg.value = error.data?.message || 'oyunlar getirilirken bilinmeyen bir hata oluştu!'
    }finally {
        loading.value = false
    }
}

const getUsers = async () => {
    try {
        loading.value = true

        const usersList = await $fetch('/api/user/users', { method: 'GET'} )
        users.value = usersList.total
    }catch(error) {
        errorMsg.value = error.data?.message || 'kullanıcılar getirilirken bilinmeyen bir hata oluştu!'
    }finally {
        loading.value = false
    }
}

onMounted(() => {
    getGames()
    getUsers()
})
</script>

<template>
    <div class="grid-container">
        <Sidebar page="home"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="title-group">
                    <h1>Your Statistics</h1>
                </div>

                <div class="top-actions">
                    <button @click="navigateTo('/cart')" v-if="!loading" class="cart">🛒 SEPET</button>
                </div>

                <Avatar />
            </header>

            <main class="stats-viewport">

                <ErrorBox v-model="errorMsg" />

                <div class="stats-layout">
                    <div class="stat-box">
                        <div class="box-top">
                            <span class="box-label">TOTAL GAMES</span>
                            <span class="box-icon">🎮</span>
                        </div>
                        <div class="box-number">{{ games }}</div>
                        <div class="box-info">Available in store</div>
                    </div>

                    <div class="stat-box">
                        <div class="box-top">
                            <span class="box-label">YOUR GAMES</span>
                            <span class="box-icon">📦</span>
                        </div>
                        <div class="box-number">{{ (systemStore.user === 'Misafir' ? 0 : owned_games) }}</div>
                        <div class="box-info">Your games count</div>
                    </div>

                    <div class="stat-box">
                        <div class="box-top">
                            <span class="box-label">TOTAL USERS</span>
                            <span class="box-icon">👤</span>
                        </div>
                        <div class="box-number">{{ users }}</div>
                        <div class="box-info">Active players</div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<style>
    html, body {
        margin: 0  !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        background: #0f0f12;
        overflow: hidden; 
        font-family: system-ui, -apple-system, sans-serif;
    }
</style>
<style scoped>
    .grid-container {
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

    .header-bar h1 { font-size: 32px; font-weight: 800; }

    .stats-viewport {
        padding: 20px 60px 60px;
        overflow-y: auto;
        box-sizing: border-box;
    }

    .stats-layout {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
    }

    .stat-box {
        background: #16161a;
        padding: 32px;
        border-radius: 24px;
        transition: 0.3s ease;
        border: 2px solid #232329;

        border: 5px solid transparent;


        border-image: linear-gradient(to right, red, orange, yellow, green, blue, purple) 1;


        animation: rgb-efekti 4s linear infinite;


    }

    .stat-box:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 35px rgba(0,0,0,0.4);
    }

    @keyframes rgb-efekti {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }

    .box-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .box-label {
        font-size: 12px;
        font-weight: 700;
        color: #71717a;
        letter-spacing: 1px;
    }

    .box-icon {
        font-size: 22px;
    }

    .box-number {
        font-size: 40px;
        font-weight: 800;
        margin-bottom: 8px;
    }

    .box-info {
        font-size: 13px;
        color: #71717a;
    }

    .top-actions { display: flex; align-items: center; gap: 20px; margin-right: 10px; }

    .cart {
        background: #16161a;
        border: 1px solid #232329;
        color: white;
        padding: 12px 25px;
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
</style>