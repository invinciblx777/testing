import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { mapShiprocketStatusToOrderStatus, SHIPMENT_STATUS_MAP } from '@/lib/shiprocket';

/**
 * Shiprocket Webhook Payload
 */
interface ShiprocketWebhookPayload {
    awb: string;
    courier_name: string;
    current_status: string;
    current_status_id: number;
    shipment_status: string;
    shipment_status_id: number;
    current_timestamp: string;
    order_id: string;
    sr_order_id: number;
    awb_assigned_date?: string;
    pickup_scheduled_date?: string;
    etd?: string;
    scans?: Array<{
        date: string;
        status: string;
        activity: string;
        location: string;
        'sr-status': string;
        'sr-status-label': string;
    }>;
    is_return: number;
    pod_status?: string;
    pod?: string;
}

/**
 * POST /api/shiprocket/webhook
 * 
 * Receives tracking updates from Shiprocket.
 * Must return 200 immediately to acknowledge receipt.
 * 
 * Setup: In Shiprocket dashboard, go to Settings → API → Webhooks
 * Add URL: https://your-domain.com/api/shiprocket/webhook
 */
export async function POST(request: NextRequest) {
    try {
        // Immediately acknowledge receipt
        const responsePromise = processWebhook(request);

        // Return 200 quickly, process in background
        // Note: In serverless, we can't truly do background processing,
        // so we do quick processing and return
        await responsePromise;

        return NextResponse.json({ status: 'received' }, { status: 200 });

    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still return 200 to prevent Shiprocket from retrying
        return NextResponse.json({ status: 'error logged' }, { status: 200 });
    }
}

async function processWebhook(request: NextRequest): Promise<void> {
    const supabase = createSupabaseAdmin();

    let payload: ShiprocketWebhookPayload;
    try {
        payload = await request.json();
    } catch {
        console.error('Invalid webhook payload');
        return;
    }

    console.log('Shiprocket webhook received:', {
        awb: payload.awb,
        status: payload.current_status,
        status_id: payload.current_status_id,
        sr_order_id: payload.sr_order_id
    });

    // Find order by Shiprocket order ID or AWB
    const { data: order, error: findError } = await supabase
        .from('orders')
        .select('id, status')
        .or(`shiprocket_order_id.eq.${payload.sr_order_id},shiprocket_awb_code.eq.${payload.awb}`)
        .single();

    if (findError || !order) {
        console.error('Order not found for webhook:', payload.sr_order_id, payload.awb);
        return;
    }

    // Map Shiprocket status to our order status
    const newStatus = mapShiprocketStatusToOrderStatus(payload.shipment_status_id);
    const shiprocketStatusLabel = SHIPMENT_STATUS_MAP[payload.shipment_status_id] || payload.shipment_status;

    // Update order
    const updateData: Record<string, unknown> = {
        shiprocket_status: shiprocketStatusLabel,
        shiprocket_tracking_data: {
            current_status: payload.current_status,
            current_status_id: payload.current_status_id,
            shipment_status: payload.shipment_status,
            shipment_status_id: payload.shipment_status_id,
            timestamp: payload.current_timestamp,
            etd: payload.etd,
            is_return: payload.is_return,
            scans: payload.scans,
            pod_status: payload.pod_status,
            pod: payload.pod
        }
    };

    // Update order status if it changed
    if (newStatus !== order.status) {
        updateData.status = newStatus;

        // Set timestamps
        if (newStatus === 'shipped') {
            updateData.shipped_at = new Date().toISOString();
        } else if (newStatus === 'delivered') {
            updateData.delivered_at = new Date().toISOString();
        }
    }

    const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

    if (updateError) {
        console.error('Failed to update order from webhook:', updateError);
        return;
    }

    // Add timeline entry for significant status changes
    const significantStatuses = [6, 7, 8, 9, 10, 17, 18, 21, 42]; // Shipped, Delivered, Canceled, RTO, etc.

    if (significantStatuses.includes(payload.shipment_status_id)) {
        const latestScan = payload.scans?.[payload.scans.length - 1];

        await supabase.from('order_timeline').insert({
            order_id: order.id,
            status: newStatus,
            description: payload.current_status,
            location: latestScan?.location || payload.courier_name
        });
    }

    console.log('Order updated from webhook:', order.id, newStatus);
}

/**
 * GET /api/shiprocket/webhook
 * 
 * Health check endpoint for webhook verification
 */
export async function GET() {
    return NextResponse.json({
        status: 'Shiprocket webhook endpoint active',
        timestamp: new Date().toISOString()
    });
}
