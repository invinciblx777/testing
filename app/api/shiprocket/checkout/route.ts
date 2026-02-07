import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY;
const API_SECRET = process.env.SHIPROCKET_CHECKOUT_SECRET;
const CHECKOUT_BASE_URL = 'https://apiv2.shiprocket.in/v1/checkout';

function generateHMAC(payload: string): string {
    if (!API_SECRET) {
        throw new Error('SHIPROCKET_CHECKOUT_SECRET is not configured');
    }
    return crypto.createHmac('sha256', API_SECRET).update(payload).digest('base64');
}

export async function POST(request: NextRequest) {
    try {
        // Validate config
        if (!API_KEY || !API_SECRET) {
            return NextResponse.json(
                { error: 'Shiprocket checkout not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { orderId, totalAmount, customer, cartItems } = body;

        // Validate required fields
        if (!orderId || !totalAmount) {
            return NextResponse.json(
                { error: 'Missing required fields: orderId, totalAmount' },
                { status: 400 }
            );
        }

        // Build payload for Shiprocket
        const payload = {
            order_id: orderId,
            sub_total: totalAmount,
            total_amount: totalAmount,
            shipping_charges: 0,
            discount: 0,
            cart_items: cartItems || [{
                variant_id: "default",
                quantity: 1,
                selling_price: totalAmount,
                title: "Order",
                sku: orderId,
            }],
            customer_details: customer ? {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            } : undefined,
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`,
            timestamp: new Date().toISOString(),
        };

        const payloadString = JSON.stringify(payload);
        const signature = generateHMAC(payloadString);

        console.log('[Shiprocket Checkout] Creating session for order:', orderId);

        const response = await fetch(`${CHECKOUT_BASE_URL}/create-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': `Bearer ${API_KEY}`,
                'X-Api-HMAC-SHA256': signature,
            },
            body: payloadString,
        });

        const responseText = await response.text();
        console.log('[Shiprocket Checkout] Response status:', response.status);
        console.log('[Shiprocket Checkout] Response:', responseText.substring(0, 500));

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { raw: responseText };
        }

        if (!response.ok) {
            console.error('[Shiprocket Checkout] ❌ Error:', data);
            return NextResponse.json(
                { error: 'Shiprocket API error', details: data },
                { status: response.status }
            );
        }

        // Return the checkout URL
        return NextResponse.json({
            success: true,
            checkout_url: data.checkout_url || data.url,
            session_id: data.session_id,
        });

    } catch (error) {
        console.error('[Shiprocket Checkout] ❌ Exception:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
