import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedProducts } from '@/lib/shiprocket-catalog';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const data = await getPaginatedProducts(page, limit);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Shiprocket Catalog] Error fetching products:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
