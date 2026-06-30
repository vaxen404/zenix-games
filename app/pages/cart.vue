<script setup>
    import Sidebar from '~/components/Sidebar.vue';
    import Avatar from '~/components/Avatar.vue';
    import ErrorBox from '~/components/ErrorBox.vue';
    import { useSystemStore } from '../stores/system'
    import { useCartStore } from '../stores/cart'
    import { CardSchema } from '../utils/schemas'
    import SuccessBox from '~/components/SuccessBox.vue';

    definePageMeta({ middleware: 'auth' })
    
    const systemStore = useSystemStore()
    const cartStore = useCartStore()

    const loading = ref(false)
    const cardsLoading = ref(false)
    const errorMsg = ref('')
    const successMsg = ref('')
    const msgBoxRef = ref(null)
    const products = ref([])
    const active_products = ref([])
    const savedCards = ref([])
    const isFormOpen = ref(false)
    const msgBoxOpen = ref(false)

    const cardForm = ref({
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    })

    watch(() => cardForm.value.cardNumber, (newValue) => {
        if (!newValue) return

        const cleanValue = newValue.replace(/\s+/g, '').replace(/[^0-9]/g, '')
        
        const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
        
        if (formattedValue !== newValue) {
            cardForm.value.cardNumber = formattedValue
        }
    })

    watch(() => cardForm.value.expiryDate, (newValue, oldValue) => {
        if (!newValue) return

        let cleanValue = newValue.replace(/[^0-9]/g, '')

        if (oldValue && newValue.length < oldValue.length && oldValue.endsWith('/')) {
            return
        }

        if (cleanValue.length >= 2) {
            const month = parseInt(cleanValue.slice(0, 2))
            if (month > 12) {
                cleanValue = '12' + cleanValue.slice(2)
            } else if (month === 0) {
                cleanValue = '01' + cleanValue.slice(2)
            }
            
            cardForm.value.expiryDate = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4)
        } else {
            cardForm.value.expiryDate = cleanValue
        }
    })
   
    const getProducts = async () => {
        if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') {
            const data = cartStore.cartItems
            products.value = data
            active_products.value = data
            return
        }

        try {
            loading.value = true
            const data = await $fetch('/api/cart/cart-get', {
                method: 'GET',
                query: {
                    userId: systemStore.userId
                }
            })
            products.value = data.cartItems

            active_products.value = [...data.cartItems]
        }catch(error) {
            errorMsg.value = error.data?.message || 'ürünler listelenirken bir hata oluştu!'
        }finally {
            loading.value = false
        }
    }

    const payment = async () => {
        errorMsg.value = ""
        successMsg.value = ""

        if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') {
            msgBoxOpen.value = true

            nextTick(() => {
                msgBoxRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })
            return
        }

        const cleanedFormData = {
            ...cardForm.value,
            cardNumber: cardForm.value.cardNumber.replace(/\s+/g, '')
        }

        const validation = CardSchema.safeParse(cleanedFormData)

        if(!validation.success) {
            errorMsg.value = validation.error.issues[0]?.message
            isFormOpen.value = true
            return
        }

        try {
            loading.value = true

            let gamesList = []
            
            for(const product of active_products.value) {
                const productName = product.name || `Oyun (ID: ${product.game_id || product.id})`
                gamesList.push(productName)
                
                await $fetch('/api/cart/payment-product', {
                    method: 'POST',
                    body: {
                        userId: systemStore.userId,
                        gameId: product.game_id || product.id,
                        price: product.price
                    }
                })
            }
            const formattedGamesList = gamesList.join(', ')
            successMsg.value = 'Ürün başarıyla satın alındı!'
            await getProducts()

            if(!confirm('Kartınız gelecek işlemler için kaydedilsin mi?')) return

            const [month, year] = cardForm.value.expiryDate.split('/')
            const fullYear = year ? `20${year}` : ''

            try {
                await $fetch('/api/card/save-card', {
                    method: 'POST',
                    body: {
                        userId: systemStore.userId,
                        cardHolderName: cardForm.value.cardHolderName,
                        cardNumber: cleanedFormData.cardNumber,
                        expirationMonth: month,
                        expirationYear: fullYear,
                        cvv: cardForm.value.cvv,
                    }
                })

                await $fetch('/api/audit_logs', {
                    method: 'POST',
                    body: {
                        userId: systemStore.userId,
                        username: systemStore.user,
                        userType: systemStore.role,
                        action: 'SAVED_CARD',
                        details: `${maskCardNumber(cardForm.value.cardNumber)} numaralı kartını kaydetti`
                    }
                })
            }catch(error) {
                errorMsg.value = error.data?.message || 'kart kaydedilirken bilinmeyen bir hata oluştu!'
            }finally {
                loading.value = false
            }

            const displayGames = formattedGamesList.trim() ? formattedGamesList : 'Sepetteki seçili'

            await $fetch('/api/audit_logs', {
                method: 'POST',
                body: {
                    userId: systemStore.userId,
                    username: systemStore.user,
                    userType: systemStore.role,
                    action: 'GAME_PURCHASED',
                    details: `${displayGames} ${gamesList.length > 1 ? 'adlı oyunları aldı' : 'adlı oyunu aldı'}`
                }
            })

        }catch(error) {
            errorMsg.value = error.data?.message || 'satın alma esnasında bilinmeyen bir hata oluştu!'
        }finally {
            loading.value = false
        }
    }

    const maskCardNumber = (cardNumber) => {
        if (!cardNumber) return '****'

        const cleaned = cardNumber.replace(/\D/g, '')
        if (cleaned.length < 4) return '****'
        
        const lastFour = cleaned.slice(-4)
        return `**** **** **** ${lastFour}`
    }

    const getSavedCards = async () => {
        if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') return

        try {
            cardsLoading.value = true

            const data = await $fetch('/api/card/card-details', { method: 'GET', query: { userId: systemStore.userId } })
            savedCards.value = data?.cards || [] 

        }catch(error) {
            errorMsg.value = error.data?.message || 'Kayıtlı kartlar çekilirken bilinmeyen bir hata oluştu!'
        }finally {
            cardsLoading.value = false
        }
    }

    const selectCard = (card) => {
        cardForm.value.cardHolderName = card.card_holder_name
        cardForm.value.cardNumber = card.cardNumber 
        cardForm.value.expiryDate = `${String(card.expiration_month).padStart(2, '0')}/${String(card.expiration_year).slice(-2)}`
        cardForm.value.cvv = '' 
    }

    const deleteCard = async (cardId, cardNumber) => {
        if(!confirm('Bu kartı silmek istediğinizden emin misiniz?')) return

        try {
            cardsLoading.value = true

            await $fetch('/api/card/delete-card', {
                method: 'POST',
                body: {
                    userId: systemStore.userId,
                    cardId: cardId
                }
            })

            await getSavedCards()

            await $fetch('/api/audit_logs', {
                method: 'POST',
                body: {
                    userId: systemStore.userId,
                    username: systemStore.user,
                    userType: systemStore.role,
                    action: 'DELETE_CARD',
                    details: `${cardNumber} numaralı kartını sildi`
                }
            })
        }catch(error) {
            errorMsg.value = error.data?.message || 'Kart silinirken bir hata oluştu!'
        }finally {
            cardsLoading.value = false
        }
    }

    const removeFromCart = async (product) => {
        if (systemStore.user === 'DemoUser' || systemStore.user === 'DemoAdmin') {
            cartStore.removeFromCart(product.game_id)
            getProducts()
            return
        }
        try {
            loading.value = true
            
            await $fetch('/api/cart/remove-cart', {
                method: 'POST',
                body: {
                    userId: systemStore.userId,
                    gameId: product.game_id
                }
            })

            await getProducts()
        }catch(error) {
            errorMsg.value = error.data?.message || 'ürün silinirken bilinmeyen bir hata oluştu'
        }finally {
            loading.value = false
        }
    }

    const totalPrice =  computed(() => {
        return active_products.value.reduce((total, product) => {
            return total + (Number(product.price) || 0)
        }, 0)
    })

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('tr-TR')
    }

    onMounted(async () => {
        await getProducts()
        await getSavedCards()
    })
</script>

<template>
    <div class="cart-layout">
        <Sidebar />

        <div class="main-panel">
            <header class="header-bar">
                <div class="page-info">
                    <h1>SEPET</h1>
                    <span v-if="!loading" class="count-tag">{{ products.length }} ürün bulundu.</span>
                </div>

                <Avatar />
            </header>

            <main class="cart-content">
                <ErrorBox v-model="errorMsg" />

                <SuccessBox v-model="successMsg" />

                <div v-if="msgBoxOpen" class="msg-box" ref="msgBoxRef">
                    <h2>Henüz giriş yapmadınız</h2>
                    <p>Oyun satın almak için giriş yapmalısınız.</p>
                    <button @click="navigateTo('/')" class="discover-btn">
                        <span>Giriş Yap</span>
                        <span class="arrow">→</span>
                    </button>
                </div>

                <div v-if="loading" class="loading-state">Ürünler yükleniyor...</div>

                <div v-else-if="products.length === 0" class="empty-cart-state">
                    <div class="empty-icon">🛒</div>
                    <h2>Sepetiniz Şu An Boş</h2>
                    <button @click="navigateTo('/story')" class="discover-btn">
                        <span>Oyunları Keşfet</span>
                        <span class="arrow">→</span>
                    </button>
                </div>

                <div v-else class="products-grid">
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Product ID</th>
                                <th>Product Name</th>
                                <th>Order Date</th>
                                <th>Price</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in products" :key="product.id">
                                <td><input type="checkbox" v-model="active_products" :value="product" class="td-checkbox"></td>
                                <td>{{ product.cart_item_id }}</td>
                                <td class="p-name">{{ product.name }}</td>
                                <td>{{ formatDate(product.added_at) }}</td>
                                <td>{{ product.price <= 0 ? 'Free' : product.price + ' TL'}}</td>
                                <td class="text-right">
                                    <div class="action-btns">
                                        <button class="btn-i btn-red" @click="removeFromCart(product)">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div @click="isFormOpen = !isFormOpen" class="accordion-header">
                        <span>Kredi Kartı Bilgileri Girin</span>
                        <span class="arrow-icon" :class="{ 'rotated': isFormOpen }">▼</span>
                    </div>

                    <div class="accordion-content" :class="{ 'is-open': isFormOpen }">
                        <div class="cards-info">
                            <div v-if="cardsLoading" class="cards-loading">Kayıtlı kartlar yükleniyor...</div>

                            <div v-else-if="savedCards.length > 0" class="saved-cards-wrapper">
                                <label class="section-sub-label">Kayıtlı Kartlarınız</label>
                                <div class="cards-list">
                                    <div v-for="card in savedCards" :key="card.id" class="saved-card-item" @click="selectCard(card)">
                                        <div class="card-brand-icon">💳</div>
                                        <div class="card-details-text">
                                            <span class="card-owner">{{ card.card_holder_name }}</span>
                                            <span class="card-num">**** **** **** {{ card.last_four_digits }}</span>
                                        </div>
                                        <span class="card-brand-tag">{{ card.card_brand }}</span>

                                        <button class="delete-card-btn" @click.stop="deleteCard(card.id, card.name)">✕</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                v-model="cardForm.cardHolderName" 
                                class="form-input" 
                                :class="{ 'input-error': errorMsg && !cardForm.cardHolderName }"
                                placeholder="John Doe"
                            >
                        </div>

                        <div class="form-group">
                            <label>Credit Card Number</label>
                            <input 
                                type="text" 
                                maxlength="19" 
                                v-model="cardForm.cardNumber" 
                                class="form-input" 
                                :class="{ 'input-error': errorMsg && cardForm.cardNumber.length !== 19 }"
                                placeholder="0000000000000000"
                            >
                        </div>

                        <div class="form-row-inner">
                            <div class="form-group">
                                <label>Expiration Date</label>
                                <input 
                                    type="text" 
                                    maxlength="5" 
                                    v-model="cardForm.expiryDate" 
                                    class="form-input" 
                                    :class="{ 'input-error': errorMsg && !cardForm.expiryDate.includes('/') }"
                                    placeholder="MM/YY"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label>CVV</label>
                                <input 
                                    type="text" 
                                    maxlength="3" 
                                    v-model="cardForm.cvv" 
                                    class="form-input" 
                                    :class="{ 'input-error': errorMsg && cardForm.cvv.length !== 3 }"
                                    placeholder="000"
                                >
                            </div>
                        </div>
                    </div>
                    <hr style="width: 100%; height: 1px; background-color: rgba(255, 255, 255, 0.05); border: none;">

                    <div class="total-price-box">
                        <span>TOPLAM TUTAR:</span>
                        <span class="price-value">{{ totalPrice }} TL</span>
                    </div>

                    <hr style="width: 100%; height: 1px; background-color: rgba(255, 255, 255, 0.05); border: none;">
                    
                    <button @click="payment" class="payment-btn" :disabled="active_products.length === 0">Öde</button>
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
    .cart-layout {
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

    .cart-content {
        display: flex;
        flex-direction: column;
        padding: 20px 60px 60px;
        overflow-y: auto;
        flex-grow: 1;   
    }

    .products-grid {
        width: 100%;
        background: #16161a;
        border: 1px solid #232329;
        border-radius: 16px;
        overflow: visible;
        margin-bottom: 24px;
    }

    .product-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 14px;
    }

    .product-table th {
        background: rgba(255, 255, 255, 0.02);
        padding: 16px 24px;
        color: #a1a1aa;
        font-weight: 600;
        border-bottom: 1px solid #232329;
    }

    .product-table td {
        padding: 18px 24px;
        border-bottom: 1px solid #232329;
        color: #e4e4e7;
    }

    .product-table th:first-child,
    .product-table td:first-child {
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
    
    .payment-btn {
        display: block;
        width: 96%;
        height: 40px;
        margin: 24px 24px 24px;
        background: #00ff66;
        color: #0f0f12;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: center;
        line-height: 40px;
    }

    .payment-btn:hover {
        background: #00ff66;
        box-shadow: 0 0 20px rgba(0, 255, 102, 0.6);
        transform: translateY(-2px);
    }

    .payment-btn:active {
        transform: translateY(0);
        box-shadow: 0 0 10px rgba(0, 255, 102, 0.3);
    }

    .payment-btn:disabled {
        background: #232329 !important;
        color: #52525b !important;
        cursor: not-allowed;
        box-shadow: none !important;
        transform: none !important;
    }

    .accordion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #232329;
        color: #e4e4e7;
        padding: 14px 24px;
        margin: 24px 24px 0 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        user-select: none;
        transition: background 0.2s;
    }

    .accordion-header:hover {
        background: #2d2d35;
    }

    .arrow-icon {
        font-size: 12px;
        transition: transform 0.3s ease;
        color: #a1a1aa;
    }

    .arrow-icon.rotated {
        transform: rotate(180deg);
    }

    .accordion-content {
        max-height: 0;
        overflow-y: auto;
        transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        margin: 20px 24px;
    }

    .accordion-content.is-open {
        max-height: 600px; 
    }

    .form-body {
        padding: 20px 0;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        gap: 8px;
    }

    .form-group label {
        font-size: 13px;
        color: #a1a1aa;
        font-weight: 600;
    }

    .form-input {
        background: #0f0f12;
        border: 1px solid #232329;
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
    }

    .form-input:focus {
        border-color: #00ff66;
    }

    .form-row-inner {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        grid-column: span 2;
    }

    .total-price-box {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 16px;
        padding: 24px;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #a1a1aa;
    }

    .price-value {
        font-size: 20px;
        color: #00ff66;
        text-shadow: 0 0 10px rgba(0, 255, 102, 0.2);
    }

    .empty-cart-state {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        text-align: center;
        background: #16161a;
        border: 1px dashed #232329;
        border-radius: 20px;
        padding: 40px;
        margin-top: 20px;
    }

    .empty-icon {
        font-size: 64px;
        margin-bottom: 20px;
        animation: float 3s ease-in-out infinite;
        filter: drop-shadow(0 0 15px rgba(0, 255, 102, 0.2));
    }

    .empty-cart-state h2 {
        font-size: 24px;
        font-weight: 800;
        color: #fff;
        margin: 0 0 10px 0;
        letter-spacing: 0.5px;
    }

    .empty-cart-state p {
        font-size: 14px;
        color: #a1a1aa;
        margin: 0 0 30px 0;
        max-width: 360px;
        line-height: 1.5;
    }

    .discover-btn {
        background: rgba(0, 255, 102, 0.1);
        border: 1px solid #00ff66;
        color: #00ff66;
        padding: 14px 28px;
        margin-top: 10px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 20px rgba(0, 255, 102, 0.05);
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

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    .input-error {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.03) !important;
    }

    .input-error:focus {
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.2) !important;
    }

    .msg-box {
        padding: 40px 0 60px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid #232329;
        border-radius: 12px;
        color: #a1a1aa;
        width: 100%;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .saved-cards-wrapper {
        margin-bottom: 16px;
        width: 100%;
    }

    .section-sub-label {
        font-size: 12px;
        color: #71717a;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: block;
        margin-bottom: 10px;
    }

    .cards-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .saved-card-item {
        background: #0f0f12;
        border: 1px solid #232329;
        border-radius: 10px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .saved-card-item:hover {
        border-color: #00ff66;
        background: rgba(0, 255, 102, 0.02);
    }

    .card-brand-icon {
        font-size: 20px;
    }

    .card-details-text {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        gap: 2px;
    }

    .card-owner {
        font-size: 13px;
        font-weight: 700;
        color: #e4e4e7;
    }

    .card-num {
        font-size: 12px;
        color: #a1a1aa;
        font-family: monospace;
    }

    .card-brand-tag {
        font-size: 11px;
        background: #232329;
        padding: 4px 8px;
        border-radius: 4px;
        color: #a1a1aa;
        font-weight: 600;
    }

    .cards-loading {
        font-size: 13px;
        color: #71717a;
        text-align: center;
        padding: 10px 0;
    }

    .delete-card-btn {
        background: transparent;
        border: none;
        color: #71717a;
        font-size: 14px;
        cursor: pointer;
        padding: 6px;
        margin-left: 10px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .delete-card-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        transform: scale(1.1);
    }
</style>