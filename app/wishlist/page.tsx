"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
    const { wishlist } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-background/60 backdrop-blur-sm">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-serif mb-8">My Wishlist</h1>
                    <div className="animate-pulse space-y-4">
                        <div className="h-64 bg-secondary/20 rounded-lg"></div>
                    </div>
                </main>
            </div>
        )
    }

    const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

    return (
        <div className="min-h-screen bg-background/60 backdrop-blur-sm text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8 text-center md:text-left">
                    My Wishlist
                    <span className="text-muted-foreground text-lg ml-3 font-sans font-normal">({wishlistProducts.length} items)</span>
                </h1>

                {wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlistProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl">
                            💖
                        </div>
                        <h2 className="text-xl font-medium">Your wishlist is empty</h2>
                        <p className="text-muted-foreground max-w-sm">
                            Save items you love here to review later.
                        </p>
                        <Link href="/shop">
                            <Button size="lg" className="mt-4">Start Shopping</Button>
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
