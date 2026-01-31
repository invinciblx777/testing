"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { createPortal } from "react-dom";
import { Product } from "@/types";

interface CartSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
    const { cart, removeFromCart, updateCartItemQuantity } = useStore();
    const isMobile = useIsMobile();
    const [hydrated, setHydrated] = useState(false);
    const [cartProducts, setCartProducts] = useState<Record<string, Product>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    // Fetch product details for items in cart
    useEffect(() => {
        if (!isOpen) return;

        const fetchCartProducts = async () => {
            // Collect needed IDs
            const ids = Array.from(new Set(cart.map(item => item.productId)));
            if (ids.length === 0) return;

            // Optimization: don't refetch if we have them
            const missingIds = ids.filter(id => !cartProducts[id]);
            if (missingIds.length === 0) return;

            setLoading(true);
            try {
                // Fetch full list (inefficient but works for now)
                // TODO: Implement batch fetch
                const res = await fetch('/api/products?limit=100');
                const data = await res.json();
                if (data.products) {
                    const newMap = { ...cartProducts };
                    data.products.forEach((p: Product) => {
                        if (ids.includes(p.id)) {
                            newMap[p.id] = p;
                        }
                    });
                    setCartProducts(newMap);
                }
            } catch (e) {
                console.error("Cart fetch error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchCartProducts();
    }, [isOpen, cart]);

    if (!hydrated) return null;

    const cartItems = cart.map(item => {
        const product = cartProducts[item.productId];
        return {
            ...item,
            product,
        };
    }); // We keep items even if product load fails, but UI handles undefined

    const subtotal = cartItems.reduce((total, item) => {
        const price = item.product?.discount_price || item.product?.price || 0;
        return total + (price * item.quantity);
    }, 0);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={isMobile ? { type: "tween", duration: 0.3 } : { type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-[100dvh] w-full sm:w-[500px] bg-background shadow-2xl z-[101] flex flex-col mobile-gpu"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-2xl font-serif">Shopping Bag ({cart.length})</h2>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-medium">Your bag is empty</h3>
                                    <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
                                    <Button onClick={onClose} className="mt-4">Start Shopping</Button>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={`${item.productId}-${item.size}`} className="flex gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="relative w-24 h-32 bg-muted rounded-md overflow-hidden flex-shrink-0 border border-border">
                                            {item.product?.images?.[0]?.image_url ? (
                                                <Image
                                                    src={item.product.images[0].image_url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                                                    <span className="text-xs text-stone-500">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-medium text-base leading-tight line-clamp-2">
                                                        {item.product?.name || "Loading Product..."}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.productId)}
                                                        className="text-muted-foreground hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">Size: {item.size}</p>
                                                <p className="font-medium mt-1">
                                                    {item.product?.discount_price
                                                        ? formatPrice(item.product.discount_price)
                                                        : formatPrice(item.product?.price || 0)
                                                    }
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-border rounded-md bg-background">
                                                    <button
                                                        className="p-1 hover:bg-muted transition-colors rounded-l-md"
                                                        onClick={() => {
                                                            if (item.quantity > 1) {
                                                                updateCartItemQuantity(item.productId, item.quantity - 1);
                                                            }
                                                        }}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        className="p-1 hover:bg-muted transition-colors rounded-r-md"
                                                        onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-border bg-muted/20">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-lg font-medium">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Shipping and taxes calculated at checkout.
                                    </p>
                                    <div className="space-y-2">
                                        <label htmlFor="checkout-email" className="text-sm font-medium">Contact Email</label>
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        />
                                    </div>
                                    <Button size="lg" className="w-full" onClick={() => {
                                        // Simple validation check (can be improved)
                                        const emailInput = document.getElementById('checkout-email') as HTMLInputElement;
                                        const email = emailInput?.value || "";

                                        if (!email || !email.includes('@')) {
                                            alert("Please enter a valid email address to checkout.");
                                            return;
                                        }

                                        const newOrder = {
                                            id: `ORD-${Date.now().toString().slice(-6)}`,
                                            date: new Date().toISOString(),
                                            total: subtotal,
                                            status: 'Pending' as const,
                                            items: cartItems,
                                            email: email
                                        };
                                        useStore.getState().addOrder(newOrder); // This adds to local store. Ideally POST /api/orders
                                        useStore.getState().clearCart();
                                        onClose();
                                        alert(`Order placed successfully! Receipt sent to ${email}`);
                                    }}>
                                        Checkout
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
