"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/lib/store";

interface NewArrivalsSectionProps {
    // products: Product[]; // Removed prop
}

const TABS = [
    { id: "kurti-coord", label: "Kurthi's / Co-ords" },
    { id: "work-three", label: "Workwear / Three-piece set" },
    { id: "maxi-casual", label: "Maxi's / Casual Wear" },
    { id: "festive", label: "Festive & Traditional Wear" },
    { id: "party", label: "Party Wear" },
    { id: "tot", label: "TOT Wear" },
] as const;

export function NewArrivalsSection() {
    const { products } = useProductStore();
    const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("kurti-coord");

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const cat = product.category.toLowerCase();
            // Logic to map tabs to categories
            switch (activeTab) {
                case "kurti-coord":
                    return cat === "kurtis" || cat === "aline" || product.name.toLowerCase().includes("co-ord");
                case "work-three":
                    return cat === "workwear" || cat === "sets";
                case "maxi-casual":
                    return cat === "maxis" || cat === "daily" || cat === "short" || cat === "dresses";
                case "festive":
                    // Include 'traditional' and 'festive'. Also maybe products with 'festive' in name if category is vague?
                    return cat === "traditional" || cat === "festive";
                case "party":
                    // 'party' isn't a standard category in the provided list, so we map suitable items.
                    // Maybe 'dresses' or 'festive' or 'maxis' can fit here too if they are fancy?
                    // For now, let's reuse 'festive' / 'traditional' or specifically look for "party" tags if we had them.
                    // Let's assume some 'festive' items are also 'party'.
                    // Or simply fallback to 'traditional' + 'maxis' for variety? 
                    // Let's filter for items that might be party wear.
                    return cat === "festive" || cat === "traditional" || (cat === "maxis" && product.price > 1500);
                case "tot":
                    return cat === "tot";
                default:
                    return false;
            }
        });
    }, [products, activeTab]);

    return (
        <section className="pt-32 pb-20 md:py-20 bg-[#faf9f6]"> {/* Ivory/White-ish background */}
            <div className="container mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <span className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
                        Summer Collection
                    </span>
                    <div className="w-24 h-[1px] bg-border mx-auto" /> {/* Subtle divider */}
                    <h2 className="text-3xl md:text-5xl font-serif text-foreground">
                        NEW ARRIVALS
                    </h2>
                </div>

                {/* Filter Tabs */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-y-6 gap-x-4 md:gap-4 mb-12 border-b border-border/50 pb-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative pb-3 px-2 text-sm md:text-base font-medium transition-colors duration-300 flex justify-center",
                                activeTab === tab.id
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="text-center">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="min-h-[400px]">
                    {/* Using AnimatePresence for smooth transitions */}
                    <motion.div
                        layout
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={`${activeTab}-${product.id}`} // Force re-mount for animation per tab switch if needed, or just product.id
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ProductCard product={product} hideWishlist />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredProducts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 text-muted-foreground"
                        >
                            <p>No new arrivals in this category yet.</p>
                        </motion.div>
                    )}
                </div>

            </div>
        </section>
    );
}
