"use client";

import { useEffect, useState } from "react";
import { CircularTestimonials } from "./circular-testimonials";
import { useReviewsStore } from "@/lib/reviews-store";

export function CircularTestimonialsWrapper() {
    const { reviews } = useReviewsStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Brand Colors
    const colors = {
        name: "#801848", // Deep Wine
        arrowBackground: "#801848", // Deep Wine
        arrowForeground: "#FDFBF7", // Ivory
        arrowHoverBackground: "#B05480", // Rose Mauve
        starFilled: "#801848", // Deep Wine
        starEmpty: "#E5E7EB", // Soft Gray (Tailwind gray-200)
    };

    return (
        <CircularTestimonials
            testimonials={reviews}
            colors={colors}
            fontSizes={{
                name: "1.75rem",
            }}
        />
    );
}
