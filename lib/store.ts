import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, User, Order } from '@/types';

// --- Customisation Types ---
export interface CustomisationRequest {
    id: string;
    productId: string;
    productName: string;
    userId: string;
    userEmail: string;
    status: 'New' | 'In Progress' | 'Closed';
    createdAt: string;
    // Form Fields
    customisationTypes: string[];
    message: string;
    preferredSize?: string;
    contactPreference: 'WhatsApp' | 'Email' | 'Call';
    mobileNumber?: string;
}

interface StoreState {
    wishlist: string[];
    cart: CartItem[];
    orders: Order[];
    user: User | null;
    customisationQueries: CustomisationRequest[];

    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;

    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string) => void;
    updateCartItemQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    addOrder: (order: Order) => void;
    login: (user: User) => void;
    logout: () => void;

    // New Actions
    addCustomisationQuery: (query: CustomisationRequest) => void;
    deleteCustomisationQuery: (id: string) => void;
    updateCustomisationStatus: (id: string, status: 'New' | 'In Progress' | 'Closed') => void;
}


export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            wishlist: [],
            cart: [],
            orders: [],
            user: null,
            customisationQueries: [],
            addToWishlist: (productId) => set((state) => {
                if (state.wishlist.includes(productId)) return state;
                return { wishlist: [...state.wishlist, productId] };
            }),
            removeFromWishlist: (productId) => set((state) => ({
                wishlist: state.wishlist.filter((id) => id !== productId),
            })),
            isInWishlist: (productId) => get().wishlist.includes(productId),
            addToCart: (item) => set((state) => {
                const existingItem = state.cart.find(i => i.productId === item.productId && i.size === item.size);
                if (existingItem) {
                    return {
                        cart: state.cart.map(i =>
                            (i.productId === item.productId && i.size === item.size)
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        )
                    };
                }
                return { cart: [...state.cart, item] };
            }),
            removeFromCart: (productId) => set((state) => ({
                cart: state.cart.filter(item => item.productId !== productId)
            })),
            updateCartItemQuantity: (productId, quantity) => set((state) => ({
                cart: state.cart.map(item =>
                    item.productId === productId ? { ...item, quantity } : item
                )
            })),
            clearCart: () => set({ cart: [] }),
            addOrder: (order) => set((state) => ({
                orders: [order, ...state.orders]
            })),
            login: (user) => set({ user }),
            logout: () => set({ user: null }),
            // Implementation of new actions
            addCustomisationQuery: (query) => set((state) => ({
                customisationQueries: [query, ...state.customisationQueries]
            })),
            deleteCustomisationQuery: (id) => set((state) => ({
                customisationQueries: state.customisationQueries.filter(q => q.id !== id)
            })),
            updateCustomisationStatus: (id, status) => set((state) => ({
                customisationQueries: state.customisationQueries.map(q =>
                    q.id === id ? { ...q, status } : q
                )
            })),
        }),
        {
            name: 'kurtis-boutique-storage',
            version: 3,
            migrate: (persistedState: any, version: number) => {
                let state = persistedState;

                if (version < 3) {
                    state = {
                        ...state,
                        customisationQueries: [],
                    };
                }

                if (state.orders) {
                    state.orders = state.orders.map((order: any) => {
                        let newStatus = order.status;
                        if (order.status === 'pending') newStatus = 'Pending';
                        if (order.status === 'processing') newStatus = 'In Transit';
                        if (order.status === 'completed') newStatus = 'Delivered';
                        if (order.status === 'cancelled') newStatus = 'Cancelled';
                        return { ...order, status: newStatus };
                    });
                }

                return state;
            },
        }
    )
);
