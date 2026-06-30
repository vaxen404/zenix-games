<script setup>
defineProps({
    ui: {
        type: String,
        default: 'user'
    },
    page: {
        type: String,
        default: 'home'
    }
})
</script>

<template>
    <aside class="sidebar-area">
        <div class="brand-section" @click="navigateTo(ui === 'admin' ? '/admin/' : '/home')">
            <span class="brand-icon">
                <span class="brand-icon-text">Z</span>
            </span>
            
            <div class="brand-text-group">
                <span class="brand-name">Zenix Games</span>
                <span v-if="ui === 'admin'" class="brand-subname">Admin Panel</span>
            </div>
        </div>
        
        <nav class="nav-list">
            <p class="nav-label">MAIN MENU</p>
            
            <template v-if="ui === 'admin'">
                <NuxtLink to="/admin" class="nav-item" :class="{ active: page === 'home' }">HOME</NuxtLink>
                <NujxtLink to="/admin/users" class="nav-item" :class="{ active: page === 'users' }">USERS</NujxtLink>
                <NuxtLink to="/admin/games" class="nav-item" :class="{ active: page === 'games' }">GAMES</NuxtLink>
                <NuxtLink to="/admin/audit-log" class="nav-item" :class="{ active: page === 'audit_log' }">AUDIT LOG</NuxtLink>
            </template>
            
            <template v-else>
                <NuxtLink to="/home" class="nav-item" :class="{ active: page === 'home' }">HOME</NuxtLink>
                <NuxtLink to="/story" class="nav-item" :class="{ active: page === 'story' }">STORY</NuxtLink>
                <NuxtLink to="/library" class="nav-item" :class="{ active: page === 'library' }">LIBRARY</NuxtLink>
            </template>
        </nav>
    </aside>
</template>

<style scoped>
    .sidebar-area {
        width: 260px;
        min-width: 260px;
        max-width: 260px;
        background: #16161a;
        border-right: 1px solid #232329;
        padding: 40px 24px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }

    .brand-section {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        margin-bottom: 40px;
        width: 100%;
        box-sizing: border-box;
        cursor: pointer;
    }

    .brand-icon {
        width: 40px;
        height: 40px;
        background-color: #00ff66;
        border-radius: 12px;
        margin-left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 0 20px rgba(0, 255, 102, 0.3);
    }

    .brand-icon-text {
        display: inline-block;
        font-weight: 900;
        font-size: 20px;
        line-height: 1;
        color: #0f0f12;
    }

    .brand-text-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .brand-name {
        display: inline-block;
        font-size: 22px;
        font-weight: 800;
        line-height: 1;
        color: white;
    }

    .brand-subname {
        font-size: 11px;
        font-weight: 700;
        color: #00ff66;
        letter-spacing: 0.5px;
        text-shadow: 0 0 10px rgba(0, 255, 102, 0.2);
        line-height: 1;
    }

    .nav-label {
        font-size: 11px;
        color: #52525b;
        letter-spacing: 1.5px;
        margin-bottom: 20px;
        font-weight: 700;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        color: #a1a1aa;
        text-decoration: none;
        border-radius: 12px;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 14px;
        transition: 0.2s;
    }

    .nav-item:hover { 
        background: rgba(255,255,255,0.03); 
        color: white; 
    }
    
    .nav-item.active { 
        background: #00ff66;
        color: #0f0f12;
        box-shadow: 0 4px 15px rgba(0, 255, 102, 0.2);
    }
</style>