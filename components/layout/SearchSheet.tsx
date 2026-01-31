"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search as SearchIcon, ArrowRight } from "lucide-react";
import { useProductStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface SearchSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchSheet({ isOpen, onClose }: SearchSheetProps) {
    const { products } = useProductStore();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            setQuery(""); // Reset on close
        }
    }, [isOpen]);

    const filteredProducts = query.length > 0
        ? products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5) // Limit to 5 results
        : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                    />

                    {/* Search Bar Container */}
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 w-full bg-background z-[101] border-b border-border shadow-lg"
                    >
                        <div className="container mx-auto px-4 py-6 max-w-4xl">
                            <div className="relative flex items-center gap-4">
                                <SearchIcon className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
                                <Input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Enter search term"
                                    className="h-14 pl-12 pr-12 text-lg bg-secondary/20 border-transparent focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="absolute right-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Results */}
                            {query.length > 0 && (
                                <div className="mt-4 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {filteredProducts.length > 0 ? (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                                                Found {filteredProducts.length} results
                                            </h3>
                                            <div className="grid gap-2">
                                                {filteredProducts.map(product => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/product/${product.slug}`}
                                                        onClick={onClose}
                                                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/30 transition-colors group"
                                                    >
                                                        <div className="h-16 w-12 bg-muted rounded overflow-hidden relative flex-shrink-0">
                                                            <Image
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-foreground truncated group-hover:text-primary transition-colors">
                                                                {product.name}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground capitalize">
                                                                {product.category}
                                                            </p>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No products found for "{query}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
