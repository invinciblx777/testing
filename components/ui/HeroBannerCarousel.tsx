"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBannerStore } from "@/lib/banner-store";
import { useIsMobile } from "@/lib/hooks/use-mobile";

// Mock Data Structure
// In a real app, this could come from an API or CMS
export function HeroBannerCarousel() {
    const banners = useBannerStore((state) => state.banners);
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeBanners = banners.filter((b) => b.isActive);

    const isMobile = useIsMobile();
    // Auto-slide logic
    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeBanners.length, currentIndex]); // Depend on currentIndex to reset timer on manual interaction indirectly

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    };

    if (activeBanners.length === 0) return null;

    return (
        <motion.div
            className="relative w-full h-full overflow-hidden group mobile-gpu" // mobile-gpu for promotion
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.05}
            onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x; // pull to right is positive (prev)

                if (swipe < -50) {
                    // Swiped Left -> Next
                    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
                } else if (swipe > 50) {
                    // Swiped Right -> Prev
                    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
                }
            }}
        >
            <Link href={activeBanners[currentIndex].link} className="block w-full h-full relative cursor-grab active:cursor-grabbing">
                <AnimatePresence mode="popLayout">
                    {activeBanners[currentIndex].image ? (
                        <motion.img
                            key={activeBanners[currentIndex].id}
                            src={activeBanners[currentIndex].image}
                            alt="Hero Banner"
                            className="absolute inset-0 w-full h-full object-cover mobile-gpu" // GPU promotion
                            initial={{ opacity: 0, scale: 1.05, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{
                                duration: 1.2,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        />
                    ) : (
                        <motion.div
                            key={`placeholder-${activeBanners[currentIndex].id}`}
                            className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center text-white/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <span className="text-2xl font-serif">Banner {activeBanners[currentIndex].id}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </Link>

            {/* Manual Navigation - Left Arrow */}
            <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white/20"
                aria-label="Previous Slide"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Manual Navigation - Right Arrow */}
            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white/20"
                aria-label="Next Slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            {activeBanners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {activeBanners.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentIndex(index);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
