import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { apiFetch, addCartItem, updateCartItem, removeCartItem } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const EMPTY_CART = { items: [], totalItems: 0, totalAmount: 0 }

export function CartProvider({ children }) {
  const { token } = useAuth()
  const [cart, setCart] = useState(EMPTY_CART)
  const [loading, setLoading] = useState(false)

  const loadCart = useCallback(async () => {
    if (!token) {
      setCart(EMPTY_CART)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch('/cart', { token })
      setCart(data)
    } catch {
      setCart(EMPTY_CART)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      await addCartItem(productId, quantity, token)
      await loadCart()
    },
    [token, loadCart],
  )

  const updateItem = useCallback(
    async (itemId, quantity) => {
      await updateCartItem(itemId, quantity, token)
      await loadCart()
    },
    [token, loadCart],
  )

  const removeItem = useCallback(
    async (itemId) => {
      await removeCartItem(itemId, token)
      await loadCart()
    },
    [token, loadCart],
  )

  return (
    <CartContext.Provider value={{ cart, loading, loadCart, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
