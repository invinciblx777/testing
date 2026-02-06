
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createSupabaseServerClient } from '@/lib/supabase/server';
import { ShiprocketCheckoutService, CheckoutSessionPayload } from '@/lib/shiprocket-checkout';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
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

        if (error || !cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty or could not be retrieved' }, { status: 400 });
        }

        // 2. Calculate Totals & Prepare Shiprocket Payload
        let subTotal = 0;
        const checkoutItems = cartItems.map(item => {
            const price = item.product.discount_price || item.product.price;
            subTotal += price * item.quantity;

            return {
                variant_id: item.size, // Using size as variant identifier
                quantity: item.quantity,
                selling_price: price,
                title: item.product.name,
                sku: item.product.slug, // Or a specific SKU from DB if available
                image_url: item.product.images?.[0]?.image_url
            };
        });

        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const sessionPayload: CheckoutSessionPayload = {
            order_id: orderId,
            cart_items: checkoutItems,
            sub_total: subTotal,
            total_amount: subTotal,
            customer_details: {
                email: user.email,
                name: user.user_metadata?.full_name,
            },
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/success`,
            timestamp: Math.floor(Date.now() / 1000)
        };

        // 3. Call Shiprocket API
        const session = await ShiprocketCheckoutService.createSession(sessionPayload);

        // 4. Return Checkout URL
        return NextResponse.json({
            success: true,
            checkoutUrl: session.checkout_url
        });

    } catch (error) {
        console.error('Checkout initiation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
