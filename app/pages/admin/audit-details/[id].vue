<script setup>
import { ref, onMounted } from 'vue'
import Avatar from '~/components/Avatar.vue'
import ErrorBox from '~/components/ErrorBox.vue'
import Sidebar from '~/components/Sidebar.vue'
import SuccessBox from '~/components/SuccessBox.vue'
import { useSystemStore } from '../../../stores/system'

definePageMeta({ middleware: 'admin' })

const systemStore = useSystemStore()

const route = useRoute()
const activityId = route.params.id

const activity_details = ref(null)
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

const getActivity_detailsDetail = async () => {
    try {
        loading.value = true
        const data = await $fetch(`/api/audit_logs/${activityId}`, {
            method: 'GET',
            query: {
                id: activityId,
                userId: systemStore.userId
            }
        })
        if (data.success) {
            activity_details.value = data.activity_details
        }
    } catch (error) {
        errorMsg.value = error.data?.message || 'İşlem detayı yüklenirken bir hata oluştu!'
    } finally {
        loading.value = false
    }
}

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    successMsg.value = 'ID başarıyla panoya kopyalandı!'
    setTimeout(() => { successMsg.value = '' }, 3000)
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('tr-TR')
}

onMounted(() => {
    getActivity_detailsDetail()
})
</script>

<template>
    <div class="activity_details-detail-layout">
        <Sidebar page="audit_log" ui="admin"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <NuxtLink to="/admin/audit-log" class="back-btn">← Geri Dön</NuxtLink>
                    <h1>İşlem Detayı</h1>
                </div>
                <Avatar ui="admin"/>
            </header>

            <main class="detail-content">
                <ErrorBox v-model="errorMsg"/>
                <SuccessBox v-model="successMsg" style="width: 800px;"/>

                <div v-if="loading" class="loading-state">İşlem Detayları yükleniyor...</div>

                <div v-else-if="activity_details" class="content-grid">
                    <div class="detail-card">
                        <div class="card-header">
                            <span class="badge" :class="activity_details.user_type">{{ activity_details.user_type }}</span>
                            <span class="action-tag">{{ activity_details.action }}</span>
                        </div>

                        <div class="info-group main-id">
                            <label>İşlem ID</label>
                            <div class="id-wrapper">
                                <code>{{ activity_details.id }}</code>
                                <button class="copy-btn" @click="copyToClipboard(activity_details.id)">📋 Kopyala</button>
                            </div>
                        </div>

                        <div class="info-row">
                            <div class="info-group">
                                <label>Kullanıcı Adı</label>
                                <p>{{ activity_details.username || '-' }}</p>
                            </div>
                            <div class="info-group">
                                <label>Kullanıcı ID</label>
                                <p>{{ activity_details.user_id }}</p>
                            </div>
                        </div>

                        <div class="info-row">
                            <div class="info-group">
                                <label>IP Adresi</label>
                                <p class="ip-text">{{ activity_details.ip_address || '127.0.0.1' }}</p>
                            </div>
                            <div class="info-group">
                                <label>Gerçekleşme Tarihi</label>
                                <p>{{ formatDate(activity_details.created_at) }}</p>
                            </div>
                        </div>

                        <div class="info-group details-block">
                            <label>İşlem Detayı Açıklaması</label>
                            <div class="details-box">
                                {{ activity_details.details || 'Açıklama belirtilmemiş.' }}
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else-if="!loading && !activity_details" class="empty-state">
                    Log verisi bulunamadı veya silinmiş olabilir.
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.activity_details-detail-layout {
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
    flex-direction: column;
    gap: 8px;
    flex-grow: 1;
}

.back-btn {
    color: #a1a1aa;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: color 0.2s;
    display: inline-block;
    width: fit-content;
}

.back-btn:hover {
    color: #00ff66;
}

.header-bar h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    letter-spacing: 0.5px;
}

.detail-content {
    display: flex;
    flex-direction: column;
    padding: 20px 60px 60px;
    flex-grow: 1;
    overflow-y: auto;
}

.content-grid {
    width: 100%;
    max-width: 800px;
}

.detail-card {
    background: #16161a;
    border: 1px solid #232329;
    border-radius: 20px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #232329;
    padding-bottom: 20px;
}

.badge {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
}

.badge.admin {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.badge.user {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.2);
}

.action-tag {
    background: rgba(0, 255, 102, 0.1);
    color: #00ff66;
    border: 1px solid rgba(0, 255, 102, 0.2);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 800;
    font-family: monospace;
}

.info-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-group label {
    font-size: 12px;
    color: #71717a;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-group p {
    margin: 0;
    font-size: 16px;
    color: #e4e4e7;
    font-weight: 600;
}

.info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.id-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #0f0f12;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid #232329;
}

.id-wrapper code {
    font-family: monospace;
    color: #00ff66;
    font-size: 14px;
    flex-grow: 1;
}

.copy-btn {
    background: #232329;
    border: none;
    color: #a1a1aa;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: #2d2d35;
    color: white;
}

.ip-text {
    font-family: monospace;
    color: #3b82f6 !important;
}

.details-box {
    background: #0f0f12;
    border: 1px solid #232329;
    border-radius: 10px;
    padding: 16px;
    color: #e4e4e7;
    font-size: 15px;
    line-height: 1.6;
    min-height: 80px;
}

.loading-state, .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    color: #a1a1aa;
    font-size: 16px;
    font-weight: 600;
}
</style>