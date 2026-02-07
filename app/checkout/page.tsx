
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { cart, isAuthenticated, isLoading, cartLoading, getCartTotal, syncCart } = useStore();
    const router = useRouter();
    const [isInitiating, setIsInitiating] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    // Separate effect for auth check - only run when auth loading is done
    useEffect(() => {
        // Don't check until auth loading is complete
        if (isLoading) return;

        // If not authenticated after auth check completes, redirect to login
        if (!isAuthenticated) {
            console.log('[Checkout] Not authenticated, redirecting to login');
            router.push('/login?redirect=/checkout');
            return;
        }

        // Only sync cart when authenticated
        syncCart();
    }, [isLoading, isAuthenticated, router, syncCart]);


    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setIsInitiating(true);
        console.log('[Checkout] Starting checkout with', cart.length, 'items');

        try {
            // Generate unique order ID
            const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const totalAmount = getCartTotal();

            // Build cart items for Shiprocket
            const cartItems = cart.map(item => ({
                variant_id: item.product_id,
                quantity: item.quantity,
                selling_price: item.product?.discount_price || item.product?.price || 0,
                title: item.product?.name || 'Product',
                sku: `${item.product_id}-${item.size}`,
                image_url: item.product?.images?.[0]?.image_url,
            }));

            const response = await fetch('/api/shiprocket/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    totalAmount,
                    cartItems,
                    customer: {
                        name: 'Customer',
                        email: 'customer@example.com',
                        phone: '9999999999',
                    },
                }),
            });

            const data = await response.json();
            console.log('[Checkout] API Response:', { status: response.status, data });

            if (!response.ok) {
                console.error('[Checkout] ❌ API Error:', data);
                toast.error(data.error || 'Checkout initiation failed');
                return;
            }

            if (data.checkout_url) {
                console.log('[Checkout] ✅ Redirecting to:', data.checkout_url);
                window.location.href = data.checkout_url;
            } else {
                console.error('[Checkout] ❌ No checkout URL in response:', data);
                toast.error("Failed to get checkout URL - please try again");
            }
        } catch (error) {
            console.error('[Checkout] ❌ Exception:', error);
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsInitiating(false);
        }
    };


    if (!hydrated || isLoading || cartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading checkout...</p>
                </div>
            </div>
        );
    }

    const subtotal = getCartTotal();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Cart Summary */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-4 border-b last:border-0 border-gray-100">
                                        <div className="relative w-20 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                            {item.product?.images?.[0]?.image_url ? (
                                                <Image
                                                    src={item.product.images[0].image_url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                                            <p className="text-sm text-gray-500">Size: {item.size}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right font-medium">
                                            {formatPrice((item.product?.discount_price || item.product?.price || 0) * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment / Action */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                    <p>Subtotal</p>
                                    <p>{formatPrice(subtotal)}</p>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <p>Shipping</p>
                                    <p>Calculated at next step</p>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                                    <p>Total</p>
                                    <p>{formatPrice(subtotal)}</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                disabled={isInitiating || cart.length === 0}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-md shadow-lg transition-all"
                            >
                                {isInitiating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Secure Checkout"
                                )}
                            </Button>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                    <span>SSR-Secured Transaction</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <Truck className="h-4 w-4 text-primary" />
                                    <span>Fulfilled by Shiprocket</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
