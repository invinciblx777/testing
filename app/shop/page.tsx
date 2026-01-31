"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProductStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Check, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function ShopContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category");

    const { products, categories } = useProductStore();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        useProductStore.persist.rehydrate();
        setHydrated(true);
    }, []);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<"new" | "price_asc" | "price_desc">("new");

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (sortBy === "price_asc") {
            result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sortBy === "price_desc") {
            result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else {
            // Newest (just reverse ID or mock logic)
            result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        }

        return result;
    }, [selectedCategory, sortBy, products]);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex flex-col md:flex-row flex-1">
                {/* White Sidebar Panel - Full Height */}
                <aside className={cn(
                    "w-full md:w-72 bg-white border-r border-border p-6 md:p-8 flex-shrink-0",
                    showFilters ? "block" : "hidden md:block"
                )}>
                    <div className="sticky top-24 space-y-8">
                        <div>
                            <h1 className="text-3xl font-serif font-medium">Shop All</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                {filteredProducts.length} Products
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium mb-3 text-lg">Categories</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={cn(
                                            "flex items-center justify-between w-full text-sm text-left hover:text-primary transition-colors py-1",
                                            !selectedCategory && "font-semibold text-primary"
                                        )}
                                    >
                                        All Products
                                        {!selectedCategory && <Check className="w-4 h-4" />}
                                    </button>
                                    {categories && categories.filter(cat => products.some(p => p.category === cat.id)).map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={cn(
                                                "flex items-center justify-between w-full text-sm text-left hover:text-primary transition-colors py-1",
                                                selectedCategory === cat.id && "font-semibold text-primary"
                                            )}
                                        >
                                            {cat.name}
                                            {selectedCategory === cat.id && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </aside>

                {/* Main Content Area - Gradient Background */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background/60 backdrop-blur-sm">
                    {/* Mobile Filter Toggle & Sort */}
                    <div className="flex justify-end mb-6 gap-2">
                        <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
                            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                        </Button>

                        <select
                            className="h-10 rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-auto min-w-[150px]"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="new">New Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Product Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground">
                            No products found in this category.
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-48" />
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="h-96 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
