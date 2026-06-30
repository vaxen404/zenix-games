<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '../stores/system'

const systemStore = useSystemStore()

const props = defineProps({
    ui: {
        type: String,
        default: 'user'
    }
})

const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

const username = computed(() => {
    return systemStore.user || localStorage.getItem('username') || 'Misafir'
})

const adminTransitionLink = computed(() => {
    return props.ui === 'admin' ? '/home' : '/admin'
})

const adminTransitionText = computed(() => {
    return props.ui === 'admin' ? '👤 User arayüzüne geç' : '🛡️ Admin Paneline Geç'
})

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
}

const handleClickOutside = (event) => {
    if(dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isDropdownOpen.value = false
    }
}

const logout = () => {
    systemStore.logout()
    navigateTo('/')
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="avatar-dropdown" ref="dropdownRef">
        <button class="avatar-trigger" :class="{ 'active': isDropdownOpen }" @click="toggleDropdown">
            {{ username.charAt(0).toUpperCase() }}
        </button>

        <transition name="dropdown-fade">
            <div v-if="isDropdownOpen" class="dropdown-menu">
                <div class="dropdown-header">
                    <p class="user-title">Merhaba,</p>
                    <p class="user-name">@{{ username }}</p>
                </div>
                <hr class="dropdown-divider" />
                
                <NuxtLink :to="systemStore.role === 'admin' ? '/admin/profile' : '/profile'" class="dropdown-item">👤 Profilim</NuxtLink>
                <NuxtLink to="/activity-log" class="dropdown-item">📋 İşlem Geçmişi</NuxtLink>
                <NuxtLink :to="systemStore.role === 'admin' ? '/admin/settings' : '/settings'" class="dropdown-item">⚙️ Ayarlar</NuxtLink>
                
                <NuxtLink v-if="systemStore.role === 'admin'" :to="adminTransitionLink" class="dropdown-item">
                    {{ adminTransitionText }}
                </NuxtLink>
                
                <button class="dropdown-item btn-logout" @click="logout">🚪 Çıkış Yap</button>
            </div>
        </transition>
    </div>
</template>

<style scoped>
    .avatar-dropdown {
        position: relative; 
        display: inline-block;
    }

    .avatar-trigger {
        width: 44px;
        height: 44px;
        background: #00ff66;
        color: #0f0f12;
        border-radius: 12px;
        border: none;
        font-weight: 900;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 255, 102, 0.15);
    }

    .avatar-trigger:hover,
    .avatar-trigger.active {
        transform: translateY(-2px);
        box-shadow: 0 0 20px rgba(0, 255, 102, 0.4);    
    }

    .dropdown-menu {
        position: absolute;
        top: 54px;
        right: 0;
        width: 180px; 
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 999;
        padding: 6px;
        box-sizing: border-box; 
    }

    .dropdown-header { 
        padding: 8px 12px; 
    }
    
    .user-title { 
        color: #52525b; 
        font-size: 11px; 
        margin: 0; 
        font-weight: 600;
    }
    
    .user-name { 
        color: white; 
        font-size: 13px; 
        font-weight: 700; 
        margin: 2px 0 0; 
    }

    .dropdown-divider { 
        border: 0; 
        border-top: 1px solid #232329; 
        margin: 6px 0; 
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 10px 12px;
        color: #a1a1aa;
        text-decoration: none;
        background: transparent;
        border: none;
        border-radius: 8px;
        text-align: left;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.15s ease;
        box-sizing: border-box;
    }

    .dropdown-item:hover { 
        background: rgba(255, 255, 255, 0.02); 
        color: #00ff66; 
    }
    
    .btn-logout:hover { 
        background: rgba(239, 68, 68, 0.1); 
        color: #ef4444; 
    }

    .dropdown-fade-enter-active, 
    .dropdown-fade-leave-active { 
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
    }
    
    .dropdown-fade-enter-from, 
    .dropdown-fade-leave-to { 
        opacity: 0; 
        transform: translateY(-8px); 
    }
</style>