import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCollection } from '@/lib/shiprocket-catalog';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Collection ID is required' },
                { status: 400 }
            );
        }

        const data = await getProductsByCollection(id, page, limit);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Shiprocket Catalog] Error fetching products by collection:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
