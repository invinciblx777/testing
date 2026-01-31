import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Review = {
    id: number;
    name: string;
    image: string;
    rating: number; // 1-5
    verified: boolean;
    createdAt: string;
    description?: string; // Internal admin note
};

interface ReviewsState {
    reviews: Review[];
    addReview: (review: Omit<Review, 'id' | 'createdAt' | 'verified'>) => void;
    deleteReview: (id: number) => void;
    reorderReviews: (startIndex: number, endIndex: number) => void;
}

const INITIAL_REVIEWS: Review[] = [
    {
        id: 1,
        name: "Priya Sharma",
        image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        rating: 5,
        verified: true,
        createdAt: new Date().toISOString(),
        description: "loves the silk kurti"
    },
    {
        id: 2,
        name: "Anjali Gupta",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        rating: 5,
        verified: true,
        createdAt: new Date().toISOString(),
        description: "festive set feedback"
    },
    {
        id: 3,
        name: "Sneha Reddy",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        rating: 4,
        verified: true,
        createdAt: new Date().toISOString(),
        description: "fashion blogger review"
    }
];

export const useReviewsStore = create<ReviewsState>()(
    persist(
        (set) => ({
            reviews: INITIAL_REVIEWS,
            addReview: (review) =>
                set((state) => ({
                    reviews: [
                        ...state.reviews,
                        {
                            ...review,
                            id: Date.now(),
                            verified: true,
                            createdAt: new Date().toISOString()
                        }
                    ],
                })),
            deleteReview: (id) =>
                set((state) => ({
                    reviews: state.reviews.filter((r) => r.id !== id),
                })),
            reorderReviews: (startIndex, endIndex) =>
                set((state) => {
                    const newReviews = [...state.reviews];
                    const [removed] = newReviews.splice(startIndex, 1);
                    newReviews.splice(endIndex, 0, removed);
                    return { reviews: newReviews };
                }),
        }),
        {
            name: 'reviews-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
