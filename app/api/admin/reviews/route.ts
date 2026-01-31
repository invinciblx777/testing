import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase/server';

// GET /api/admin/reviews - List all reviews (admin only)
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const supabase = await createSupabaseServerClient();
        const { searchParams } = new URL(request.url);

        const productId = searchParams.get('product_id');

        let query = supabase
            .from('reviews')
            .select(`
        *,
        product:products(id, name, slug)
      `)
            .order('created_at', { ascending: false });

        if (productId) {
            query = query.eq('product_id', productId);
        }

        const { data: reviews, error } = await query;

        if (error) {
            console.error('Reviews fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ reviews });
    } catch (error) {
        if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        console.error('Admin reviews API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/reviews - Create review (admin only)
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const supabase = await createSupabaseServerClient();
        const body = await request.json();

        const {
            product_id,
            reviewer_name,
            reviewer_image,
            rating,
            review_text,
            is_verified_buyer = true,
            is_active = true
        } = body;

        if (!product_id || !reviewer_name || !rating) {
            return NextResponse.json(
                { error: 'Missing required fields: product_id, reviewer_name, rating' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .insert({
                product_id,
                reviewer_name,
                reviewer_image,
                rating,
                review_text,
                is_verified_buyer,
                is_active
            })
            .select()
            .single();

        if (error) {
            console.error('Review creation error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        console.error('Admin reviews API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
