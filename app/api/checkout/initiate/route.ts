import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createSupabaseServerClient } from '@/lib/supabase/server';
import { ShiprocketCheckoutService, CheckoutSessionPayload } from '@/lib/shiprocket-checkout';

export async function POST(request: NextRequest) {
    console.log('[Checkout] Starting checkout initiation...');

    try {
        // 0. Validate Shiprocket config first
        const configCheck = ShiprocketCheckoutService.validateConfig();
        if (!configCheck.valid) {
            console.error('[Checkout] ❌ Missing config:', configCheck.missing);
            return NextResponse.json({
                error: 'Shiprocket configuration error',
                details: `Missing: ${configCheck.missing.join(', ')}`
            }, { status: 500 });
        }

        const user = await requireAuth();
        console.log('[Checkout] User authenticated:', user.email);

        const supabase = await createSupabaseServerClient();

        // 1. Fetch Cart Items with Product Details
        const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select(`
                *,
                product:products (
                    id,
                    name,
                    slug,
                    price,
                    discount_price,
                    images:product_images(image_url)
                )
            `)
            .eq('user_id', user.id);

        if (error) {
            console.error('[Checkout] ❌ Cart fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
        }

        if (!cartItems || cartItems.length === 0) {
            console.log('[Checkout] Cart is empty');
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        console.log('[Checkout] Cart items found:', cartItems.length);

        // 2. Calculate Totals & Prepare Shiprocket Payload
        let subTotal = 0;
        const checkoutItems = cartItems.map((item, index) => {
            const price = item.product.discount_price || item.product.price;
            subTotal += price * item.quantity;

            const checkoutItem = {
                // Using product ID as variant_id - Shiprocket may need catalog sync for proper variant IDs
                variant_id: String(item.product.id),
                quantity: item.quantity,
                selling_price: price,
                title: `${item.product.name} - Size ${item.size}`,
                sku: item.product.slug || `SKU-${item.product.id}`,
                image_url: item.product.images?.[0]?.image_url || undefined
            };

            console.log(`[Checkout] Item ${index + 1}:`, {
                variant_id: checkoutItem.variant_id,
                title: checkoutItem.title,
                quantity: checkoutItem.quantity,
                price: checkoutItem.selling_price
            });

            return checkoutItem;
        });

        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Validate redirect URL
        let redirectUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!redirectUrl) {
            // Fallback to Vercel URL if available
            if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
                redirectUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
            } else if (process.env.VERCEL_URL) {
                redirectUrl = `https://${process.env.VERCEL_URL}`;
            } else {
                // Fallback to request origin
                redirectUrl = request.nextUrl.origin;
            }
        }

        if (!redirectUrl) {
            console.error('[Checkout] ❌ Could not determine redirect URL');
            return NextResponse.json({
                error: 'Server configuration error: Missing redirect URL'
            }, { status: 500 });
        }

        const sessionPayload: CheckoutSessionPayload = {
            order_id: orderId,
            cart_items: checkoutItems,
            sub_total: subTotal,
            total_amount: subTotal,
            customer_details: {
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0],
            },
            redirect_url: `${redirectUrl}/orders/success`,
        };

        console.log('[Checkout] Session payload prepared:', {
            order_id: sessionPayload.order_id,
            items_count: sessionPayload.cart_items.length,
            sub_total: sessionPayload.sub_total,
            redirect_url: sessionPayload.redirect_url
        });

        // 3. Call Shiprocket API
        const session = await ShiprocketCheckoutService.createSession(sessionPayload);

        console.log('[Checkout] ✅ Session created successfully:', session);

        // 4. Return Checkout URL
        return NextResponse.json({
            success: true,
            checkoutUrl: session.checkout_url,
            orderId: session.order_id || orderId,
            shipmentId: session.shipment_id,
            awbCode: session.awb_code
        });

    } catch (error) {
        console.error('[Checkout] ❌ Error:', error);

        // Try to parse structured Shiprocket error
        if (error instanceof Error) {
            try {
                const parsedError = JSON.parse(error.message);
                if (parsedError.error && parsedError.shiprocket_response) {
                    return NextResponse.json({
                        error: 'Shiprocket checkout failed',
                        details: parsedError.shiprocket_response,
                        status_code: parsedError.status_code,
                        debug: parsedError.hmac_debug
                    }, { status: parsedError.status_code || 500 });
                }
            } catch {
                // Not a structured error, use message as-is
            }

            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
