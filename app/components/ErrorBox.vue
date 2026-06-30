<script setup>
const errorMsg = defineModel({
    type: [String, Error],
    default: ""
})

const clear = () => {
    errorMsg.value = ""
}
</script>

<template>
    <div v-if="errorMsg" class="error-box">
        <span class="error-icon">⚠️</span>
        
        <div class="error-text">
            {{ errorMsg instanceof Error ? errorMsg.message : errorMsg }}
        </div>

        <button class="close-btn" @click="clear">x</button>
    </div>
</template>

<style scoped>
    .error-box {
        background:  rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #ef4444;
        padding: 14px;
        border-radius: 12px;
        font-size: 14px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
    }

    .error-text {
        flex-grow: 1;
    }

    .close-btn {
        background: none;
        border: none;
        color: #ef4444;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: 0.2s;
    }

    .close-btn:hover {
        background: rgba(239, 68, 68, 0.2);
    }
</style>