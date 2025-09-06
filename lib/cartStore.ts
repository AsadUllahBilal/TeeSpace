import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: string;
  title: string;
  price: number;
  images: string[];
  stockQuantity: number;
  description: string;
  quantity: number;
};

type CartState = {
  cart: CartItem[];
  cartTotal: number; // total price
  cartCount: number; // total quantity
  cartUniqueCount: number; // number of unique products
  updateTotals: (cart: CartItem[]) => { total: number; count: number; uniqueCount: number };
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      cartTotal: 0,
      cartCount: 0,
      cartUniqueCount: 0,

      // Helper: update totals
      updateTotals: (cart: CartItem[]) => {
        const total = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const uniqueCount = cart.length;
        return { total, count, uniqueCount };
      },

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.id === product.id
          );
          let updatedCart;
          if (existing) {
            updatedCart = state.cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            updatedCart = [...state.cart, { ...product, quantity: 1 }];
          }
          const { total, count, uniqueCount } = get().updateTotals(updatedCart);
          return {
            cart: updatedCart,
            cartTotal: total,
            cartCount: count,
            cartUniqueCount: uniqueCount,
          };
        }),

      removeFromCart: (id) =>
        set((state) => {
          const updatedCart = state.cart.filter((item) => item.id !== id);
          const { total, count, uniqueCount } = get().updateTotals(updatedCart);
          return {
            cart: updatedCart,
            cartTotal: total,
            cartCount: count,
            cartUniqueCount: uniqueCount,
          };
        }),

      increaseQuantity: (id) =>
        set((state) => {
          const updatedCart = state.cart.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          const { total, count, uniqueCount } = get().updateTotals(updatedCart);
          return {
            cart: updatedCart,
            cartTotal: total,
            cartCount: count,
            cartUniqueCount: uniqueCount,
          };
        }),

      decreaseQuantity: (id) =>
        set((state) => {
          const updatedCart = state.cart
            .map((item) =>
              item.id === id
                ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
                : item
            )
            .filter((item) => item.quantity > 0);
          const { total, count, uniqueCount } = get().updateTotals(updatedCart);
          return {
            cart: updatedCart,
            cartTotal: total,
            cartCount: count,
            cartUniqueCount: uniqueCount,
          };
        }),

      clearCart: () =>
        set({
          cart: [],
          cartTotal: 0,
          cartCount: 0,
          cartUniqueCount: 0,
        }),
    }),
    {
      name: "cart-storage", // localStorage key
      partialize: (state) => ({
        cart: state.cart,
        cartTotal: state.cartTotal,
        cartCount: state.cartCount,
        cartUniqueCount: state.cartUniqueCount,
      }),
    }
  )
);
