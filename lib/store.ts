import { create } from 'zustand';
import { User, Order } from '@/types';

// Extended cart item with product details from DB
export interface DBCartItem {
    id: string;
    user_id: string;
    product_id: string;
    size: string;
    quantity: number;
    created_at: string;
    product?: {
        id: string;
        name: string;
        slug: string;
        price: number;
        discount_price?: number;
        images?: { image_url: string }[];
    };
}

// Wishlist item from DB
export interface DBWishlistItem {
    id: string;
    product_id: string;
    created_at: string;
    product?: {
        id: string;
        name: string;
        slug: string;
        price: number;
        discount_price?: number;
        is_active: boolean;
        images?: { image_url: string }[];
    };
}

interface StoreState {
    // User - from Supabase auth
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Wishlist - DB-driven
    wishlist: string[];  // Just product IDs for quick lookup
    wishlistItems: DBWishlistItem[];  // Full items with product details
    wishlistLoading: boolean;

    // Cart - DB-driven
    cart: DBCartItem[];
    cartLoading: boolean;

    // Orders - from DB
    orders: Order[];

    // Auth actions
    setUser: (user: User | null) => void;
    setIsAuthenticated: (value: boolean) => void;
    setIsLoading: (value: boolean) => void;
    login: (user: User) => void;

    // Wishlist actions - all DB-driven
    setWishlist: (items: DBWishlistItem[]) => void;
    addToWishlist: (productId: string) => Promise<boolean>;
    removeFromWishlist: (productId: string) => Promise<boolean>;
    isInWishlist: (productId: string) => boolean;
    syncWishlist: () => Promise<void>;

    // Cart actions - all DB-driven
    setCart: (items: DBCartItem[]) => void;
    addToCart: (productId: string, size: string, quantity?: number) => Promise<boolean>;
    removeFromCart: (cartItemId: string) => Promise<boolean>;
    updateCartQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
    syncCart: () => Promise<void>;
    getCartTotal: () => number;
    getCartItemCount: () => number;

    // Orders
    setOrders: (orders: Order[]) => void;

    // Combined sync
    syncAllData: () => Promise<void>;
    logout: () => void;

    // Customisation queries (legacy support)
    customisationQueries: CustomisationRequest[];
    addCustomisationQuery: (query: CustomisationRequest) => void;
    deleteCustomisationQuery: (id: string) => void;
    updateCustomisationStatus: (id: string, status: 'New' | 'In Progress' | 'Closed') => void;
}

// Customisation request type
export interface CustomisationRequest {
    id: string;
    productId: string;
    productName: string;
    userId: string;
    userEmail: string;
    status: 'New' | 'In Progress' | 'Closed';
    createdAt: string;
    customisationTypes: string[];
    message: string;
    preferredSize?: string;
    contactPreference: 'WhatsApp' | 'Email' | 'Call';
    mobileNumber?: string;
}

export const useStore = create<StoreState>()((set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    isLoading: true,

    wishlist: [],
    wishlistItems: [],
    wishlistLoading: false,

    cart: [],
    cartLoading: false,

    orders: [],

    // Auth
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setIsLoading: (value) => set({ isLoading: value }),

    login: (user) => {
        set({ user, isAuthenticated: true });
        // Sync data from DB
        get().syncAllData();
    },

    // === WISHLIST ===
    setWishlist: (items) => set({
        wishlistItems: items,
        wishlist: items.map(item => item.product_id)
    }),

    isInWishlist: (productId) => get().wishlist.includes(productId),

    syncWishlist: async () => {
        set({ wishlistLoading: true });
        try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
                const data = await res.json();
                set({
                    wishlistItems: data.wishlist || [],
                    wishlist: data.product_ids || [],
                    wishlistLoading: false
                });
            }
        } catch (error) {
            console.error('Failed to sync wishlist:', error);
            set({ wishlistLoading: false });
        }
    },

    addToWishlist: async (productId) => {
        // Optimistic update
        const current = get().wishlist;
        if (current.includes(productId)) return true;
        set({ wishlist: [...current, productId] });

        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId })
            });

            if (!res.ok) {
                // Revert on failure
                set({ wishlist: current });
                return false;
            }

            // Refetch to get full item with product details
            await get().syncWishlist();
            return true;
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            set({ wishlist: current });
            return false;
        }
    },

    removeFromWishlist: async (productId) => {
        // Optimistic update
        const currentWishlist = get().wishlist;
        const currentItems = get().wishlistItems;
        set({
            wishlist: currentWishlist.filter(id => id !== productId),
            wishlistItems: currentItems.filter(item => item.product_id !== productId)
        });

        try {
            const res = await fetch(`/api/wishlist?product_id=${productId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                // Revert on failure
                set({ wishlist: currentWishlist, wishlistItems: currentItems });
                return false;
            }
            return true;
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            set({ wishlist: currentWishlist, wishlistItems: currentItems });
            return false;
        }
    },

    // === CART ===
    setCart: (items) => set({ cart: items }),

    syncCart: async () => {
        set({ cartLoading: true });
        try {
            const res = await fetch('/api/cart');
            if (res.ok) {
                const data = await res.json();
                set({ cart: data.cart || [], cartLoading: false });
            } else if (res.status === 401) {
                // User not authenticated, clear cart
                set({ cart: [], cartLoading: false });
            }
        } catch (error) {
            console.error('Failed to sync cart:', error);
            set({ cartLoading: false });
        }
    },

    addToCart: async (productId, size, quantity = 1) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, size, quantity })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    console.error('User must be logged in to add to cart');
                    return false;
                }
                return false;
            }

            // Refetch cart to get updated state
            await get().syncCart();
            return true;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            return false;
        }
    },

    removeFromCart: async (cartItemId) => {
        // Optimistic update
        const currentCart = get().cart;
        set({ cart: currentCart.filter(item => item.id !== cartItemId) });

        try {
            const res = await fetch(`/api/cart?id=${cartItemId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                set({ cart: currentCart });
                return false;
            }
            return true;
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            set({ cart: currentCart });
            return false;
        }
    },

    updateCartQuantity: async (cartItemId, quantity) => {
        // Optimistic update
        const currentCart = get().cart;
        set({
            cart: currentCart.map(item =>
                item.id === cartItemId ? { ...item, quantity } : item
            )
        });

        try {
            const res = await fetch('/api/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_item_id: cartItemId, quantity })
            });

            if (!res.ok) {
                set({ cart: currentCart });
                return false;
            }

            // Refetch if item was deleted (quantity <= 0)
            if (quantity <= 0) {
                await get().syncCart();
            }
            return true;
        } catch (error) {
            console.error('Failed to update cart quantity:', error);
            set({ cart: currentCart });
            return false;
        }
    },

    clearCart: async () => {
        const currentCart = get().cart;
        set({ cart: [] });

        try {
            const res = await fetch('/api/cart?clear=true', {
                method: 'DELETE'
            });

            if (!res.ok) {
                set({ cart: currentCart });
                return false;
            }
            return true;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            set({ cart: currentCart });
            return false;
        }
    },

    getCartTotal: () => {
        return get().cart.reduce((total, item) => {
            const price = item.product?.discount_price || item.product?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    },

    getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
    },

    // === COMBINED ===
    syncAllData: async () => {
        const { syncWishlist, syncCart } = get();
        await Promise.all([syncWishlist(), syncCart()]);
    },

    setOrders: (orders) => set({ orders }),

    logout: () => {
        set({
            user: null,
            isAuthenticated: false,
            wishlist: [],
            wishlistItems: [],
            cart: [],
            orders: [],
            customisationQueries: []
        });
    },

    // Customisation queries (legacy support)
    customisationQueries: [],

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
