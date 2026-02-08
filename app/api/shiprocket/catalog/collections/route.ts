import { NextResponse } from 'next/server';
import { getAllCollections } from '@/lib/shiprocket-catalog';

export async function GET() {
    try {
        const data = await getAllCollections();

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Shiprocket Catalog] Error fetching collections:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
