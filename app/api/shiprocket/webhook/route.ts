import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { ShiprocketCheckoutService } from '@/lib/shiprocket-checkout';

/**
 * Shiprocket Webhook Handler
 * Handles checkout callbacks and shipment status updates
 * 
 * Events handled:
 * - checkout.completed - Order placed and paid
 * - shipment.status - Shipment tracking updates
 */
export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-shiprocket-signature') || '';

        // Verify webhook signature (if configured)
        if (process.env.SHIPROCKET_CHECKOUT_SECRET && signature) {
            const isValid = ShiprocketCheckoutService.verifyWebhook(rawBody, signature);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const payload = JSON.parse(rawBody);
        console.log('Shiprocket Webhook Received:', JSON.stringify(payload, null, 2));

        const supabaseAdmin = createSupabaseAdmin();

        // Handle different webhook event types
        const eventType = payload.event || determineEventType(payload);

        switch (eventType) {
            case 'checkout.completed':
            case 'order.created':
                await handleOrderCreated(supabaseAdmin, payload);
                break;

            case 'shipment.status':
            case 'tracking.update':
                await handleShipmentUpdate(supabaseAdmin, payload);
                break;

            case 'payment.success':
                await handlePaymentSuccess(supabaseAdmin, payload);
                break;

            default:
                // Log unknown events for debugging
                console.log('Unhandled webhook event type:', eventType);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Determine event type from payload structure
function determineEventType(payload: Record<string, unknown>): string {
    if (payload.order_id && payload.payment_status) return 'checkout.completed';
    if (payload.awb || payload.shipment_id) return 'shipment.status';
    if (payload.transaction_id) return 'payment.success';
    return 'unknown';
}

// Handle order creation from checkout
async function handleOrderCreated(supabase: ReturnType<typeof createSupabaseAdmin>, payload: Record<string, unknown>) {
    const orderId = payload.order_id as string;

    const { error } = await supabase
        .from('shiprocket_orders')
        .upsert({
            shiprocket_order_id: orderId,
            items: payload.items || payload.cart_items,
            phone: payload.phone || payload.customer_phone,
            email: payload.email || payload.customer_email,
            payment_type: payload.payment_method || 'prepaid',
            total_amount: payload.total_amount || payload.order_total,
            status: 'paid',
            shipping_address: payload.shipping_address || payload.delivery_address,
            raw_webhook_data: payload,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'shiprocket_order_id'
        });

    if (error) {
        console.error('Error saving order:', error);
        throw error;
    }

    console.log('Order saved successfully:', orderId);
}

// Handle shipment status updates
async function handleShipmentUpdate(supabase: ReturnType<typeof createSupabaseAdmin>, payload: Record<string, unknown>) {
    const awb = payload.awb as string;
    const currentStatus = payload.current_status as string;

    if (!awb) {
        console.log('No AWB in payload, skipping shipment update');
        return;
    }

    // Update shiprocket_orders table with shipment info
    const { error } = await supabase
        .from('shiprocket_orders')
        .update({
            status: currentStatus || payload.shipment_status,
            raw_webhook_data: payload,
            updated_at: new Date().toISOString()
        })
        .eq('shiprocket_order_id', payload.order_id);

    if (error) {
        console.error('Error updating shipment status:', error);
        throw error;
    }

    console.log('Shipment status updated:', awb, currentStatus);
}

// Handle payment success
async function handlePaymentSuccess(supabase: ReturnType<typeof createSupabaseAdmin>, payload: Record<string, unknown>) {
    const orderId = payload.order_id as string;

    const { error } = await supabase
        .from('shiprocket_orders')
        .update({
            status: 'paid',
            payment_type: payload.payment_method || 'prepaid',
            raw_webhook_data: payload,
            updated_at: new Date().toISOString()
        })
        .eq('shiprocket_order_id', orderId);

    if (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }

    console.log('Payment success recorded:', orderId);
}
