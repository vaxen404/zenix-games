<script setup>
import { ref, computed, onMounted } from 'vue' 
import Avatar from '~/components/Avatar.vue';
import ErrorBox from '~/components/ErrorBox.vue';
import Sidebar from '~/components/Sidebar.vue';
import { useSystemStore } from '../../stores/system';

definePageMeta({ middleware: 'admin' }) 

const systemStore = useSystemStore()

const activities = ref([])
const errorMsg = ref('')
const searchQuery = ref('')
const loading = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(8) 

const getActivities = async () => {
    try {
        loading.value = true
        const data = await $fetch('/api/audit_logs/admin', { method: 'GET' } )
        activities.value = data.activities || []
    }catch(error) {
        errorMsg.value = error.data?.message || 'İşlemler çekilirken bilinmeyen bir hata oluştu!'
    }finally {
        loading.value = false
    }
}

const filteredActivities = computed(() => {
    return activities.value.filter(activity => {
        const query = searchQuery.value.toLowerCase()
        const matchesID = String(activity.id).toLowerCase().includes(query)
        const matchesAction = activity.action?.toLowerCase().includes(query)
        const matchesDetails = activity.details?.toLowerCase().includes(query)
        
        return matchesID || matchesAction || matchesDetails
    })
})

const totalPages = computed(() => {
    return Math.ceil(filteredActivities.value.length / itemsPerPage.value) || 1
})

const paginatedActivities = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    const endIndex = startIndex + itemsPerPage.value
    return filteredActivities.value.slice(startIndex, endIndex)
})

watch(searchQuery, () => {
    currentPage.value = 1
})

const viewActivity = (id) => {
    navigateTo(`/admin/audit-details/${id}`)
}

const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id)
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('tr-TR')
}

onMounted(() => {
    getActivities()
})
</script>

<template>
    <div class="activities-log-layout">
        <Sidebar page="audit_log" ui="admin"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <h1>ACTIVITY LOG</h1>
                    <span class="count-tag">{{ filteredActivities.length }} tane işlem geçmişi bulundu.</span>
                </div>

                <div class="top-actions">
                    <div class="search-box">
                        <span class="icon">🔎</span>
                        <input type="text" v-model="searchQuery" placeholder="ID, aksiyon veya detay ara...">
                    </div>
                </div>

                <Avatar ui="admin"/>
            </header>

            <main class="activities-log-content">
                <ErrorBox v-model="errorMsg" />

                <div v-if="loading" class="loading-state">İşlemler yükleniyor...</div>

                <div v-else-if="filteredActivities.length === 0" class="msg-box">
                    <h2>{{ activities.length === 0 ? 'Henüz işlem yapılmadı' : 'Sonuç bulunamadı' }}</h2>
                    <p v-if="activities.length === 0">Oyun satın almak için</p>
                    <button v-if="activities.length === 0" @click="navigateTo('/story')" class="discover-btn">
                        <span>Oyunları Keşfet</span>
                        <span class="arrow">→</span>
                    </button>
                </div>

                <div v-else class="activities-grid">
                    <table class="activity-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Aksiyon</th>
                                <th>Detay</th>
                                <th>Tarih</th>
                                <th class="text-right">İşlemler</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="activity in paginatedActivities" :key="activity.id">
                                <td class="uuid-text" :title="activity.id">{{ activity.id ? activity.id.slice(0, 8) + '...' : '-' }}</td>
                                <td><strong>{{ activity.action }}</strong></td>
                                <td>{{ activity.details || '-' }}</td>
                                <td>{{ formatDate(activity.created_at) }}</td>
                                <td class="text-right">
                                    <div class="action-btns">
                                        <button class="btn-i" @click="viewActivity(activity.id)">👁️</button>
                                        <button class="btn-i" @click="copyToClipboard(activity.id)">📋</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="pagination-bar">
                        <button 
                            class="page-btn" 
                            :disabled="currentPage === 1" 
                            @click="currentPage--"
                        >
                            ◀ Önceki
                        </button>
                        
                        <span class="page-info-text">
                            Sayfa <strong>{{ currentPage }}</strong> / {{ totalPages }}
                        </span>

                        <button 
                            class="page-btn" 
                            :disabled="currentPage === totalPages" 
                            @click="currentPage++"
                        >
                            Sonraki ▶
                        </button>
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
    .activities-log-layout {
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
        min-height: 100vh;
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

    .top-actions {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .search-box {
        position: relative;
        display: flex;
        align-items: center;
    }

    .search-box .icon {
        position: absolute;
        left: 12px;
        color: #71717a;
    }

    .search-box input {
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 8px;
        padding: 10px 12px 10px 36px;
        color: white;
        font-size: 14px;
        outline: none;
        width: 280px;
        transition: border-color 0.2s;
    }

    .search-box input:focus {
        border-color: #00ff66;
    }

    .activities-log-content {
        display: flex;
        flex-direction: column;
        padding: 20px 60px 60px;
        flex-grow: 1;
        overflow-y: auto;
        height: calc(100vh - 120px); 
        box-sizing: border-box;
    }

    .activities-grid {
        width: 100%;
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 16px;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
    }

    .activity-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        box-sizing: border-box;
    }

    .activity-table th {
        background: rgba(255, 255, 255, 0.02);
        padding: 16px 24px;
        color: #a1a1aa;
        font-weight: 600;
        border-bottom: 1px solid #232329;
        font-size: 14px;
    }

    .activity-table td {
        padding: 18px 24px;
        border-bottom: 1px solid #232329;
        color: #e4e4e7;
        font-size: 14px;
    }

    .uuid-text {
        font-family: monospace;
        color: #71717a;
        cursor: help;
    }

    .text-right {
        text-align: right;
    }

    .action-btns {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .btn-i {
        background: #232329;
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
    }

    .btn-i:hover {
        background: #2d2d35;
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

    .msg-box {
        padding: 60px 40px;
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 12px;
        color: #a1a1aa;
        width: 100%;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .msg-box h2 {
        color: white;
        margin: 0 0 10px 0;
    }

    .msg-box p {
        margin: 0 0 20px 0;
    }

    .discover-btn {
        background: rgba(0, 255, 102, 0.1);
        border: 1px solid #00ff66;
        color: #00ff66;
        padding: 14px 28px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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

    .pagination-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background: #1c1c22; 
        border-top: 1px solid #232329;
        margin-top: auto; 
    }

    .page-btn {
        background: #232329;
        border: 1px solid transparent;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s;
    }

    .page-btn:hover:not(:disabled) {
        background: rgba(0, 255, 102, 0.1);
        border-color: #00ff66;
        color: #00ff66;
    }

    .page-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .page-info-text {
        font-size: 14px;
        color: #a1a1aa;
    }

    .page-info-text strong {
        color: white;
    }
</style>