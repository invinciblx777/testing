import { NextRequest, NextResponse } from 'next/server';
import { getTrackingByAWB, ShiprocketError } from '@/lib/shiprocket';

interface RouteParams {
    params: Promise<{ awb: string }>;
}

/**
 * GET /api/shiprocket/track/[awb]
 * 
 * Get tracking data for a shipment by AWB code.
 * Public endpoint - no auth required for tracking.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { awb } = await params;

        if (!awb) {
            return NextResponse.json(
                { error: 'AWB code is required' },
                { status: 400 }
            );
        }

        const trackingData = await getTrackingByAWB(awb);

        return NextResponse.json({
            success: true,
            awb_code: awb,
            ...trackingData
        });

    } catch (err) {
        const error = err as ShiprocketError;

        if (error.statusCode === 404) {
            return NextResponse.json(
                { error: 'Tracking data not found for this AWB' },
                { status: 404 }
            );
        }

        console.error('Tracking fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tracking data', details: error.message },
            { status: 500 }
        );
    }
}
