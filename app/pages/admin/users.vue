<script setup>
    import Avatar from '~/components/Avatar.vue';
    import ErrorBox from '~/components/ErrorBox.vue';
    import Sidebar from '~/components/Sidebar.vue';
    import { useSystemStore } from '../../stores/system';

    definePageMeta({ middleware: 'admin' })

    const systemStore = useSystemStore()

    const users = ref([])
    const errorMsg = ref('')
    const loading = ref(false)
    const searchQuery = ref('')
    const active_users = ref([])

    const getUsers = async () => {
        try {
            loading.value = true

            const data = await $fetch('/api/user/users', { method: 'GET'} )
            users.value = data.users
        }catch(error) {
            errorMsg.value = error.data?.message || 'Kullanıcılar getirilirken bilenmeyen bir hata oluştu!'
        }finally {
            loading.value = false
        }
    }

    const filteredUsers = computed(() => {
        return users.value.filter(user => {
            const query = searchQuery.value.toLowerCase()

            const matchesSearch = user.username.toLowerCase().includes(query)

            const matchesID = String(user.id).toLowerCase().includes(query)

            return matchesSearch || matchesID
        })
    })

    const viewUser = async (userId) => {
        await $fetch('/api/audit_logs', {
            method: 'POST',
            body: {
                userId: systemStore.userId,
                username: systemStore.user,
                userType: systemStore.role,
                action: 'VIEW_USER',
                details: `${userId} id li kullanıcıyı görüntüledi`
            }
        })

        navigateTo(`/admin/user-details/${userId}`)
    }

    const maskEmail = (email) => {
        if (!email) return ''
        const [name, domain] = email.split('@')
        if (name.length <= 2) return `${name[0]}***@${domain}`
        return `${name[0]}***${name[name.length - 1]}@${domain}`
    }

    const deleteUser = async (user) => {
        if(!confirm(`${user.username} adlı kişinin kaydını silmek istediğinizden emin misiniz?`)) return

        if (systemStore.user === 'DemoAdmin') {
            errorMsg.value = 'Kullanıcıların Kaydını Silebilmek İçin Admin Olmalısınız!'

            nextTick(() => {
                errorRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })

            return
        }

        try {
            await $fetch('/api/user/delete-user', {
                method: 'POST',
                body: {
                    userId: user.id
                }
            })
            await getUsers()

            await $fetch('/api/audit_logs', {
                method: 'POST',
                body: {
                    userId: systemStore.userId,
                    username: systemStore.user,
                    userType: systemStore.role,
                    action: 'DELETE_USER',
                    details: `${user.id} id li kullanıcının kaydını sildi`
                }
            })
        }catch(error) {
            errorMsg.value = error.data?.message || 'Kullanıcı silinirken bilinmeyen bir hata oluştu!'
        }
    }

    onMounted(() => {
        getUsers()
    })
</script>

<template>
    <div class="users-dashboard">
        <Sidebar page="users" ui="admin"/>

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <h1>USERS</h1>
                    <span class="count-tag">{{ filteredUsers.length }} kullanıcı bulundu!</span>
                </div>

                <div class="top-actions">
                    <div class="search-box">
                        <span class="icon">🔎</span>
                        <input type="text" v-model="searchQuery" placeholder="Kullanıcı ara...">
                    </div>
                </div>

                <Avatar ui="admin"/>
            </header>

            <main class="users-layout">
                <ErrorBox v-model="errorMsg" />

                <div v-if="loading" class="loading-state">Kullanıcılar yükleniyor...</div>

                <div v-else-if="filteredUsers.length === 0" class="empty-state">Kullanıcı bulunamadı.</div>

                <div v-else class="users-grid">
                    <table class="user-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Username</th>
                                <th>email</th>
                                <th>Created At</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in filteredUsers" :key="user.id">
                                <td><input type="checkbox" v-model="active_users" :value="user" class="td-checkbox"></td>
                                <td>{{ user.username }}</td>
                                <td>{{ systemStore.user === 'DemoAdmin' ? maskEmail(user.email) :   user.email }}</td>
                                <td>{{ user.created_at }}</td>
                                <td class="text-right">
                                    <div class="action-btns">
                                        <button class="btn-i" @click="viewUser(user.id)">👁️</button>
                                        <button class="btn-i btn-red" @click="deleteUser(user)">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
    .users-dashboard {
        display: grid;
        grid-template-columns: 260px 1fr;
        width: 100vw;
        max-width: 100vw;
        min-height: 100vh; 
        background: #0f0f12;
        color: white;
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

    .users-layout {
        display: flex;
        flex-direction: column;
        padding: 20px 60px 30px; 
        flex-grow: 1;   
    }

    .users-grid {
        width: 100%;
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 16px;
        margin-bottom: 24px;
        display: inline-block; 
    }

    .user-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 14px;
    }

    .user-table th {
        background: rgba(255, 255, 255, 0.02);
        padding: 16px 24px;
        color: #a1a1aa;
        font-weight: 600;
        border-bottom: 1px solid #232329;
    }

    .user-table td {
        padding: 18px 24px;
        border-bottom: 1px solid #232329;
        color: #e4e4e7;
    }

    .user-table th:first-child,
    .user-table td:first-child {
        width: 40px;
        padding: 16px 0 16px 24px;
        text-align: left;
    }

    .td-checkbox {
        appearance: none; 
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        background: #0f0f12;
        border: 2px solid #232329;
        border-radius: 4px; 
        cursor: pointer;
        display: inline-block;
        position: relative;
        transition: all 0.2s ease;
        vertical-align: middle;
    }

    .td-checkbox:hover {
        border-color: #00ff66;
    }

    .td-checkbox:checked {
        background: #00ff66;
        border-color: #00ff66;
        box-shadow: 0 0 10px rgba(0, 255, 102, 0.3);
    }

    .td-checkbox:checked::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #0f0f12;
        font-size: 12px;
        font-weight: 900;
    }

    .text-right {
        text-align: right;
    }

    .action-btns {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
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

    .btn-red:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }

    .loading-state, .empty-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        color: #a1a1aa;
        font-size: 16px;
        font-weight: 600;
    }

    .input-error {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.03) !important;
    }

    .input-error:focus {
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.2) !important;
    }
</style>