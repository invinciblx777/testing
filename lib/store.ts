import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    productId: string;
    size: string;
    quantity: number;
}

import { PRODUCTS, CATEGORIES, Product } from '@/data/products';

export interface User {
    name: string;
    email: string;
    role: 'admin' | 'customer';
}

export interface Order {
    id: string;
    date: string;
    total: number;
    status: 'Pending' | 'Shipped' | 'In Transit' | 'Delivered' | 'Cancelled';
    items: CartItem[];
    email: string;
    awbId?: string;
    trackingUrl?: string;
    timeline?: { status: string; date: string; description: string }[];
}

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
    customisationQueries: CustomisationRequest[]; // New array
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

export interface Category {
    id: string;
    name: string;
    image: string;
}

interface ProductStoreState {
    products: Product[];
    categories: Category[];
    addProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    toggleStock: (id: string) => void;
    updateProduct: (product: Product) => void;
    addCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;
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
            version: 3, // Bump for migration if needed
            migrate: (persistedState: any, version: number) => {
                let state = persistedState;

                if (version < 3) {
                    state = {
                        ...state,
                        customisationQueries: [],
                    };
                }

                // Migration for Order Statuses (v3 fix)
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

export const useProductStore = create<ProductStoreState>()(
    persist(
        (set) => ({
            products: PRODUCTS, // Initialize with mock data
            categories: CATEGORIES, // Initialize with mock data
            addProduct: (product) => set((state) => ({
                products: [product, ...state.products]
            })),
            deleteProduct: (id) => set((state) => ({
                products: state.products.filter(p => p.id !== id)
            })),
            toggleStock: (id) => set((state) => ({
                products: state.products.map(p =>
                    p.id === id ? { ...p, inStock: !p.inStock } : p
                )
            })),
            updateProduct: (product) => set((state) => ({
                products: state.products.map(p =>
                    p.id === product.id ? product : p
                )
            })),
            addCategory: (category) => set((state) => ({
                categories: [...state.categories, category]
            })),
            deleteCategory: (id) => set((state) => ({
                categories: state.categories.filter(c => c.id !== id)
            })),
        }),
        {
            name: 'kurtis-boutique-products',
            skipHydration: true,
            version: 2,
            migrate: (persistedState: any, version: number) => {
                if (version < 2) {
                    // Reset products and categories to code defaults on migration
                    return {
                        ...persistedState,
                        products: PRODUCTS,
                        categories: CATEGORIES,
                    };
                }
                return persistedState;
            },
        }
    )
);
