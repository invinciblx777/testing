import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin, requireAdmin } from '@/lib/supabase/server';
import {
    createOrder,
    assignAWB,
    schedulePickup,
    generateLabel,
    ShiprocketError,
    CreateOrderParams
} from '@/lib/shiprocket';

/**
 * POST /api/shiprocket/create-shipment
 * 
 * Creates a shipment in Shiprocket for an existing order.
 * Admin only. Full flow: create order → assign AWB → schedule pickup
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const supabase = createSupabaseAdmin();
        const body = await request.json();

        const { order_id, courier_id, weight = 0.5, length = 20, breadth = 15, height = 5 } = body;

        if (!order_id) {
            return NextResponse.json(
                { error: 'order_id is required' },
                { status: 400 }
            );
        }

        // Fetch order with items
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if already shipped
        if (order.shiprocket_order_id) {
            return NextResponse.json(
                { error: 'Order already has a Shiprocket shipment', shiprocket_order_id: order.shiprocket_order_id },
                { status: 400 }
            );
        }

        const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';

        // Prepare order items for Shiprocket
        const orderItems = order.items.map((item: {
            product_name: string;
            product_id: string;
            quantity: number;
            unit_price: number;
        }) => ({
            name: item.product_name,
            sku: item.product_id,
            units: item.quantity,
            selling_price: item.unit_price,
            discount: 0,
            tax: 0,
            hsn: ''
        }));

        // Format order date
        const orderDate = new Date(order.created_at);
        const formattedDate = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')} ${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}`;

        // Create order params
        const createOrderParams: CreateOrderParams = {
            order_id: order.id,
            order_date: formattedDate,
            pickup_location: pickupLocation,
            billing_customer_name: order.shipping_name?.split(' ')[0] || 'Customer',
            billing_last_name: order.shipping_name?.split(' ').slice(1).join(' ') || '',
            billing_address: order.shipping_address_line1 || '',
            billing_address_2: order.shipping_address_line2 || '',
            billing_city: order.shipping_city || '',
            billing_pincode: order.shipping_pincode || '',
            billing_state: order.shipping_state || '',
            billing_country: 'India',
            billing_email: order.email || 'customer@example.com',
            billing_phone: order.shipping_phone || '',
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
            sub_total: order.subtotal || order.total,
            length,
            breadth,
            height,
            weight
        };

        // Step 1: Create order in Shiprocket
        let shiprocketOrder;
        try {
            shiprocketOrder = await createOrder(createOrderParams);
        } catch (err) {
            const error = err as ShiprocketError;
            await supabase
                .from('orders')
                .update({ shiprocket_error: error.message })
                .eq('id', order_id);

            return NextResponse.json(
                { error: 'Failed to create Shiprocket order', details: error.apiError },
                { status: 500 }
            );
        }

        // Update order with Shiprocket order ID
        await supabase
            .from('orders')
            .update({
                shiprocket_order_id: shiprocketOrder.order_id,
                shiprocket_shipment_id: shiprocketOrder.shipment_id,
                shiprocket_status: shiprocketOrder.status,
                shiprocket_error: null
            })
            .eq('id', order_id);

        // Step 2: Assign AWB
        let awbResponse;
        try {
            awbResponse = await assignAWB({
                shipment_id: shiprocketOrder.shipment_id,
                courier_id: courier_id || undefined
            });
        } catch (err) {
            const error = err as ShiprocketError;
            await supabase
                .from('orders')
                .update({ shiprocket_error: `AWB assignment failed: ${error.message}` })
                .eq('id', order_id);

            return NextResponse.json({
                warning: 'Order created but AWB assignment failed',
                shiprocket_order_id: shiprocketOrder.order_id,
                error: error.apiError
            }, { status: 207 });
        }

        const awbData = awbResponse.response?.data;

        // Update order with AWB
        await supabase
            .from('orders')
            .update({
                shiprocket_awb_code: awbData?.awb_code,
                shiprocket_courier_id: awbData?.courier_company_id,
                shiprocket_courier_name: awbData?.courier_name,
                awb_id: awbData?.awb_code,
                courier_name: awbData?.courier_name,
                status: 'processing'
            })
            .eq('id', order_id);

        // Step 3: Schedule pickup
        let pickupResponse;
        try {
            pickupResponse = await schedulePickup([shiprocketOrder.shipment_id]);
        } catch (err) {
            console.error('Pickup scheduling failed:', err);
            // Non-fatal - continue
        }

        // Step 4: Generate label
        let labelResponse;
        try {
            labelResponse = await generateLabel([shiprocketOrder.shipment_id]);
            if (labelResponse.label_url) {
                await supabase
                    .from('orders')
                    .update({ shiprocket_label_url: labelResponse.label_url })
                    .eq('id', order_id);
            }
        } catch (err) {
            console.error('Label generation failed:', err);
            // Non-fatal - continue
        }

        // Add timeline entry
        await supabase.from('order_timeline').insert({
            order_id: order_id,
            status: 'processing',
            description: `Shipment created with AWB: ${awbData?.awb_code || 'pending'}`,
            location: `Courier: ${awbData?.courier_name || 'Assigning'}`
        });

        return NextResponse.json({
            success: true,
            shiprocket_order_id: shiprocketOrder.order_id,
            shipment_id: shiprocketOrder.shipment_id,
            awb_code: awbData?.awb_code,
            courier_name: awbData?.courier_name,
            label_url: labelResponse?.label_url,
            pickup_scheduled: pickupResponse?.pickup_status === 1
        });

    } catch (error) {
        if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        console.error('Shiprocket create-shipment error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
