import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, requireAdmin, isAdmin } from '@/lib/supabase/server';

// GET /api/products - List all products (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { searchParams } = new URL(request.url);
        const admin = await isAdmin();

        // Query parameters
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const sortBy = searchParams.get('sort') || 'created_at';
        const order = searchParams.get('order') === 'asc' ? true : false;

        let query = supabase
            .from('products')
            .select(`
        *,
        category:categories(*),
        images:product_images(*, order:display_order.asc),
        sizes:product_sizes(*)
      `);

        // Only fitler active products for non-admins
        if (!admin) {
            query = query.eq('is_active', true);
        }

        query = query.order(sortBy, { ascending: order })
            .range(offset, offset + limit - 1);

        // Filter by category
        if (category) {
            const { data: cat } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', category)
                .single();

            if (cat) {
                query = query.eq('category_id', cat.id);
            }
        }

        // Search by name
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data: products, error, count } = await query;

        if (error) {
            console.error('Products fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            products,
            pagination: {
                limit,
                offset,
                total: count
            }
        });
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/products - Create product (admin only)
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const supabase = await createSupabaseServerClient();
        const body = await request.json();

        const {
            slug,
            name,
            description,
            category_id,
            price,
            discount_price,
            discount_type,
            discount_value,
            stock_total = 0,
            stock_remaining = 0,
            low_stock_threshold = 5,
            is_active = true,
            is_new = false,
            is_best_seller = false,
            sizes = []
        } = body;

        // Validate required fields
        if (!slug || !name || !price) {
            return NextResponse.json(
                { error: 'Missing required fields: slug, name, price' },
                { status: 400 }
            );
        }

        // Create product
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                slug,
                name,
                description,
                category_id,
                price,
                discount_price,
                discount_type,
                discount_value,
                stock_total,
                stock_remaining,
                low_stock_threshold,
                is_active,
                is_new,
                is_best_seller
            })
            .select()
            .single();

        if (productError) {
            console.error('Product creation error:', productError);
            return NextResponse.json({ error: productError.message }, { status: 500 });
        }

        // Create sizes if provided
        if (sizes.length > 0) {
            const sizeRecords = sizes.map((s: { size: string; stock_count: number }) => ({
                product_id: product.id,
                size: s.size,
                stock_count: s.stock_count || 0
            }));

            const { error: sizesError } = await supabase
                .from('product_sizes')
                .insert(sizeRecords);

            if (sizesError) {
                console.error('Sizes creation error:', sizesError);
            }
        }

        // Fetch complete product with relations
        const { data: fullProduct } = await supabase
            .from('products')
            .select(`
        *,
        category:categories(*),
        images:product_images(*),
        sizes:product_sizes(*)
      `)
            .eq('id', product.id)
            .single();

        return NextResponse.json({ product: fullProduct }, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        console.error('Products API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
