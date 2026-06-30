<script setup>
const successMsg = defineModel({
    type: [String],
    default: ""
})

const clear = () => {
    successMsg.value = ""
}
</script>

<template>
    <div v-if="successMsg" class="message-box success-box">
        <span class="error-icon">✅</span>
        
        <div class="error-text">
            {{ successMsg }}
        </div>

        <button class="close-btn" @click="clear">x</button>
    </div>
</template>

<style scoped>
    .message-box { padding: 14px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; width: 100%;; box-sizing: border-box; }
    .success-box { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #22c55e; }

    .error-text {
        flex-grow: 1;
    }

    .close-btn {
        background: none;
        border: none;
        color: #a1a1aa;
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