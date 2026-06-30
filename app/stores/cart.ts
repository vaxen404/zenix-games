import { defineStore } from 'pinia'

interface CartItem {
  id: string | number
  game_id: string | number
  name: string
  price: number | string
  added_at: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [] as CartItem[]
  }),
  
  actions: {
    loadCart() {
      if (typeof window !== 'undefined') {
        const localCart = localStorage.getItem('guest_cart')
        this.cartItems = localCart ? JSON.parse(localCart) : []
      }
    },

    addToCart(product: any) {
      this.loadCart() 
      
      const productId = product.game_id || product.id
      const exists = this.cartItems.find(item => (item.game_id === productId || item.id === productId))
      
      if (!exists) {
        const newItem: CartItem = {
          id: productId,
          game_id: productId,
          name: product.name,
          price: product.price,
          added_at: new Date().toISOString()
        }
        this.cartItems.push(newItem)
        localStorage.setItem('guest_cart', JSON.stringify(this.cartItems))
      }
    },

    removeFromCart(productId: string | number) {
      this.loadCart()
      
      this.cartItems = this.cartItems.filter(item => item.game_id !== productId && item.id !== productId)
      localStorage.setItem('guest_cart', JSON.stringify(this.cartItems))
    },

    clearCart() {
      this.cartItems = []
      if (typeof window !== 'undefined') {
        localStorage.removeItem('guest_cart')
      }
    }
  }
})