"use client";

import Link from "next/link";

import { useProductStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CategoryBubbles() {
    const { categories, products } = useProductStore();

    // Only show categories that have products
    const activeCategories = categories.filter(cat =>
        products.some(p => p.category === cat.id)
    );

    return (
        <div className="w-full border-b border-border/40 bg-gradient-to-b from-white to-transparent py-6">
            <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
                <div className="flex justify-start md:justify-center gap-6 md:gap-10 min-w-max pb-2">
                    {activeCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop?category=${cat.id}`}
                            className="group flex flex-col items-center gap-3 min-w-[80px]"
                        >
                            <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 group-hover:from-primary group-hover:to-primary/60 transition-all duration-300">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-background overflow-hidden relative bg-secondary/30">
                                    {cat.image ? (
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 mobile-gpu"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-serif text-lg">
                                            {cat.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors text-center font-serif tracking-wide">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
