"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useProductStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

import { CategoryBubbles } from "@/components/home/CategoryBubbles";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { HeroBannerCarousel } from "@/components/ui/HeroBannerCarousel";
import { CircularTestimonialsWrapper } from "@/components/ui/circular-testimonials-wrapper";
import { NewArrivalsSection } from "@/components/NewArrivalsSection";
import { useEffect, useState } from "react";

export default function Home() {
  const { products, categories } = useProductStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useProductStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  // Use categories from store for grid
  const displayCategories = categories.filter(cat =>
    products.some(p => p.category === cat.id)
  );

  return (
    <div className="min-h-screen font-sans selection:bg-primary/20">
      <Navbar />

      <main>
        {/* Category Bubbles */}
        <CategoryBubbles />

        {/* HERO SECTION */}
        <section className="relative w-full pt-10 pb-40 md:pb-64 bg-white flex flex-col items-center justify-center overflow-visible">
          <div className="flex flex-col items-center gap-8 animate-in fade-in duration-700 p-4 w-full">
            {/* Logo */}
            <img
              src="/kurtis-logo-large.png"
              alt="Kurtis Boutique"
              className="w-48 sm:w-64 md:w-80 h-auto object-contain drop-shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-forwards"
            />

            {/* Overlapping Banner */}
            <div className="absolute -bottom-24 md:-bottom-44 w-[90%] md:w-[80%] max-w-5xl h-[200px] md:h-[350px] rounded-xl overflow-hidden shadow-2xl z-20">
              <HeroBannerCarousel />
            </div>
          </div>
        </section>

        {/* CATEGORY GRID */}
        <section className="pt-40 md:pt-64 pb-20 container mx-auto px-4 md:px-8 hidden md:block">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-serif">Shop by Category</h2>
            <Link href="/shop" className="text-primary hover:underline underline-offset-4 hidden sm:block">View All</Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {(displayCategories || []).map((cat, idx) => (
              <Link key={cat.id} href={`/shop?category=${cat.id}`} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary/50">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 bg-stone-300">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium text-lg leading-tight">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* NEW ARRIVALS (REPLACING BEST SELLERS) */}
        <NewArrivalsSection />

        {/* FESTIVE HIGHLIGHT */}
        {/* CUSTOMER TESTIMONIALS */}
        <section className="flex justify-center bg-background py-12">
          <CircularTestimonialsWrapper />
        </section>
      </main>

      <Footer />
    </div>
  );
}
