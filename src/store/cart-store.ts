import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '@/types';
import { generateSessionId } from '@/utils/helpers';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions: string | null;
}

interface CartState {
  items: CartItem[];
  sessionId: string;
  isOpen: boolean;

  // Actions
  addItem: (menuItem: MenuItem, quantity?: number, specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: generateSessionId(),
      isOpen: false,

      addItem: (menuItem, quantity = 1, specialInstructions) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.menuItem.id === menuItem.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.menuItem.id === menuItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          const newItem: CartItem = {
            id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            menuItem,
            quantity,
            specialInstructions: specialInstructions || null,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      updateInstructions: (itemId, instructions) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, specialInstructions: instructions || null }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], sessionId: generateSessionId() });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'restaurant-cart',
      partialize: (state) => ({
        items: state.items,
        sessionId: state.sessionId,
      }),
    }
  )
);
