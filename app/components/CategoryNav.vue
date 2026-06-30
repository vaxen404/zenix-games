<script setup>
    const errorMsg = defineModel({
        type: [String, Error],
        default: ""
    })

    const category = defineModel('category', {
        type: String,
        default: 'all-games'
    })
</script>

<template>
    <div v-if="!errorMsg" class="categories-nav">
        <button @click="category = 'all-games'" class="category-btn" :class="{ active: category === 'all-games'}">All Games</button>
        <button @click="category = 'fps'" class="category-btn" :class="{ active: category === 'fps'}">FPS</button>
        <button @click="category = 'rpg'" class="category-btn" :class="{ active: category === 'rpg'}">RPG</button>
        <button @click="category = 'moba'" class="category-btn" :class="{ active: category === 'moba'}">MOBA</button>
        <button @click="category = 'souls-like'" class="category-btn" :class="{ active: category === 'souls-like'}">Souls-like</button>
        <button @click="category = 'open world'" class="category-btn" :class="{ active: category === 'open world'}">Open World</button>
    </div> 
</template>

<style scoped>
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
</style>