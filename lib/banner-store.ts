import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

export type Banner = {
    id: number;
    image: string;
    link: string;
    isActive: boolean;
};

interface BannerState {
    banners: Banner[];
    addBanner: (banner: Omit<Banner, 'id'>) => void;
    updateBanner: (id: number, banner: Partial<Banner>) => void;
    deleteBanner: (id: number) => void;
    reorderBanners: (startIndex: number, endIndex: number) => void;
    toggleBannerStatus: (id: number) => void;
}

const INITIAL_BANNERS: Banner[] = [
    {
        id: 1,
        image: "",
        link: "/shop?category=new-arrivals",
        isActive: true,
    },
    {
        id: 2,
        image: "",
        link: "/shop?category=festive",
        isActive: true,
    },
    {
        id: 3,
        image: "",
        link: "/shop?category=custom",
        isActive: true,
    },
];

// Custom storage adapter for IndexedDB
const storage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};

export const useBannerStore = create<BannerState>()(
    persist(
        (set) => ({
            banners: INITIAL_BANNERS,
            addBanner: (banner) =>
                set((state) => ({
                    banners: [...state.banners, { ...banner, id: Date.now() }],
                })),
            updateBanner: (id, updatedBanner) =>
                set((state) => ({
                    banners: state.banners.map((b) =>
                        b.id === id ? { ...b, ...updatedBanner } : b
                    ),
                })),
            deleteBanner: (id) =>
                set((state) => ({
                    banners: state.banners.filter((b) => b.id !== id),
                })),
            reorderBanners: (startIndex, endIndex) =>
                set((state) => {
                    const newBanners = Array.from(state.banners);
                    const [removed] = newBanners.splice(startIndex, 1);
                    newBanners.splice(endIndex, 0, removed);
                    return { banners: newBanners };
                }),
            toggleBannerStatus: (id) =>
                set((state) => ({
                    banners: state.banners.map((b) =>
                        b.id === id ? { ...b, isActive: !b.isActive } : b
                    ),
                })),
        }),
        {
            name: 'hero-banner-storage',
            storage: createJSONStorage(() => storage),
        }
    )
);
