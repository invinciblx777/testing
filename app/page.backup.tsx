"use client";

import Link from "next/link";
import { CATEGORIES } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useProductStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

import { CategoryBubbles } from "@/components/home/CategoryBubbles";
import { useEffect, useState } from "react";

export default function Home() {
  const { products } = useProductStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useProductStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const bestSellers = products.filter(p => p.isBestSeller);
  const newArrivals = products.filter(p => p.isNew);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar />

      <main>
        {/* Category Bubbles */}
        <CategoryBubbles />

        {/* HERO SECTION */}
        <section className="relative w-full h-[80vh] overflow-hidden">
          <BackgroundGradientAnimation
            containerClassName="h-full w-full"
            className="absolute inset-0 flex items-center justify-center"
            firstColor="197, 160, 89"
            secondColor="250, 225, 221"
            thirdColor="242, 232, 213"
            fourthColor="220, 180, 100"
            fifthColor="255, 240, 230"
            pointerColor="197, 160, 89"
            size="80%"
          >
            <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000 p-4">
              {/* Logo */}
              <img
                src="/kurtis-logo-large.png"
                alt="Kurtis Boutique"
                className="w-64 sm:w-80 md:w-96 h-auto object-contain drop-shadow-2xl"
              />

              <p className="text-xl md:text-2xl text-stone-800 font-light tracking-wide text-center max-w-lg drop-shadow-sm">
                Elegance in Every Stitch
              </p>

              <div className="flex gap-4 pointer-events-auto z-50">
                <Link href="/shop">
                  <Button size="lg" className="px-8 text-lg h-14 rounded-full shadow-xl hover:scale-105 transition-transform">
                    Explore Collection
                  </Button>
                </Link>
              </div>
            </div>
          </BackgroundGradientAnimation>
        </section>

        {/* CATEGORY GRID */}
        <section className="py-20 container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-serif">Shop by Category</h2>
            <Link href="/shop" className="text-primary hover:underline underline-offset-4 hidden sm:block">View All</Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, idx) => (
              <Link key={cat.id} href={`/shop?category=${cat.id}`} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary/50">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 bg-stone-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium text-lg leading-tight">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BEST SELLERS */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-primary tracking-widest text-sm font-semibold uppercase">Customer Favorites</span>
              <h2 className="text-3xl md:text-4xl font-serif">Best Sellers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {bestSellers.concat(newArrivals).slice(0, 4).map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] bg-muted mb-4 overflow-hidden rounded-md">
                    <span className="sr-only">{product.name}</span>
                    {product.discountPrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-sm z-10">
                        SALE
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {product.discountPrice ? (
                      <>
                        <span className="text-primary font-medium">{formatPrice(product.discountPrice)}</span>
                        <span className="text-muted-foreground line-through text-sm">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <span className="font-medium text-foreground">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/shop">
                <Button variant="outline" size="lg" className="rounded-full px-12 border-primary text-primary hover:bg-primary hover:text-white">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FESTIVE HIGHLIGHT */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-multiply" />
          <div className="container relative z-10 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-serif">The Festive Edit</h2>
            <p className="max-w-xl mx-auto text-primary-foreground/90 text-lg font-light">
              Handpicked ensembles for weddings, parties, and special occasions.
              Shine brighter this season.
            </p>
            <Link href="/shop?category=festive">
              <Button size="lg" variant="secondary" className="rounded-full mt-4 px-8 text-foreground">
                Shop Collection
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
