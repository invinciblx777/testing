import { create } from 'zustand';
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
    // Wishlist - synced with Supabase for auth users, in-memory for guests
    wishlist: string[];
    wishlistLoaded: boolean;

    // Cart - in-memory only (session data)
    cart: CartItem[];

    // Orders - loaded from Supabase
    orders: Order[];

    // User - from Supabase auth
    user: User | null;

    // Customisation queries
    customisationQueries: CustomisationRequest[];

    // Wishlist actions
    setWishlist: (items: string[]) => void;
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    syncWishlistWithDB: () => Promise<void>;

    // Cart actions
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string) => void;
    updateCartItemQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    // Order actions
    addOrder: (order: Order) => void;
    setOrders: (orders: Order[]) => void;

    // Auth actions
    login: (user: User) => void;
    logout: () => void;

    // Customisation actions
    addCustomisationQuery: (query: CustomisationRequest) => void;
    deleteCustomisationQuery: (id: string) => void;
    updateCustomisationStatus: (id: string, status: 'New' | 'In Progress' | 'Closed') => void;
}

export const useStore = create<StoreState>()((set, get) => ({
    wishlist: [],
    wishlistLoaded: false,
    cart: [],
    orders: [],
    user: null,
    customisationQueries: [],

    // Set wishlist from Supabase
    setWishlist: (items) => set({ wishlist: items, wishlistLoaded: true }),

    // Add to wishlist (also syncs to Supabase)
    addToWishlist: async (productId) => {
        const state = get();
        if (state.wishlist.includes(productId)) return;

        set({ wishlist: [...state.wishlist, productId] });

        // Sync to Supabase if user is logged in
        if (state.user) {
            try {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: productId })
                });
            } catch (error) {
                console.error('Failed to sync wishlist to DB:', error);
            }
        }
    },

    // Remove from wishlist
    removeFromWishlist: async (productId) => {
        const state = get();
        set({ wishlist: state.wishlist.filter(id => id !== productId) });

        // Sync to Supabase if user is logged in
        if (state.user) {
            try {
                await fetch(`/api/wishlist?product_id=${productId}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('Failed to remove from wishlist in DB:', error);
            }
        }
    },

    isInWishlist: (productId) => get().wishlist.includes(productId),

    // Sync wishlist from Supabase on login
    syncWishlistWithDB: async () => {
        try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
                const data = await res.json();
                set({ wishlist: data.product_ids || [], wishlistLoaded: true });
            }
        } catch (error) {
            console.error('Failed to sync wishlist from DB:', error);
        }
    },

    // Cart actions (in-memory only - no localStorage)
    addToCart: (item) => set((state) => {
        const existing = state.cart.find(
            i => i.productId === item.productId && i.size === item.size
        );
        if (existing) {
            return {
                cart: state.cart.map(i =>
                    i.productId === item.productId && i.size === item.size
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

    // Orders
    addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
    setOrders: (orders) => set({ orders }),

    // Auth
    login: (user) => {
        set({ user });
        // Sync wishlist on login
        get().syncWishlistWithDB();
    },
    logout: () => set({ user: null, wishlist: [], orders: [] }),

    // Customisation
    addCustomisationQuery: (query) => set((state) => ({
        customisationQueries: [...state.customisationQueries, query]
    })),
    deleteCustomisationQuery: (id) => set((state) => ({
        customisationQueries: state.customisationQueries.filter(q => q.id !== id)
    })),
    updateCustomisationStatus: (id, status) => set((state) => ({
        customisationQueries: state.customisationQueries.map(q =>
            q.id === id ? { ...q, status } : q
        )
    })),
}));
