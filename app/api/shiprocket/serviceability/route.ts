import { NextRequest, NextResponse } from 'next/server';
import { checkServiceability, ShiprocketError } from '@/lib/shiprocket';

/**
 * GET /api/shiprocket/serviceability
 * 
 * Check courier availability between pincodes.
 * Returns list of available couriers with rates and ETD.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const pickup_postcode = searchParams.get('pickup_postcode');
        const delivery_postcode = searchParams.get('delivery_postcode');
        const weight = searchParams.get('weight') || '0.5';
        const cod = searchParams.get('cod') || '0';

        if (!pickup_postcode || !delivery_postcode) {
            return NextResponse.json(
                { error: 'pickup_postcode and delivery_postcode are required' },
                { status: 400 }
            );
        }

        const result = await checkServiceability({
            pickup_postcode,
            delivery_postcode,
            weight: parseFloat(weight),
            cod: cod === '1' ? 1 : 0
        });

        // Simplify response for frontend
        const couriers = result.data?.available_courier_companies?.map(courier => ({
            id: courier.courier_company_id,
            name: courier.courier_name,
            rate: courier.rate,
            etd: courier.etd,
            estimated_days: courier.estimated_delivery_days,
            min_weight: courier.min_weight,
            charge_weight: courier.charge_weight
        })) || [];

        return NextResponse.json({
            success: true,
            pickup_postcode,
            delivery_postcode,
            serviceable: couriers.length > 0,
            recommended_courier_id: result.data?.recommended_courier_company_id,
            couriers
        });

    } catch (err) {
        const error = err as ShiprocketError;
        console.error('Serviceability check error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to check serviceability',
                details: error.message
            },
            { status: 500 }
        );
    }
}
