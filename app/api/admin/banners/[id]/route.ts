import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/admin/banners/:id - Update banner (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin();
        const { id } = await params;
        const supabase = await createSupabaseServerClient();
        const body = await request.json();

        const { title, subtitle, image_url, link_url, display_order, is_active } = body;

        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (link_url !== undefined) updateData.link_url = link_url;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        const { data: banner, error } = await supabase
            .from('banners')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Banner update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ banner });
    } catch (error) {
        if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        console.error('Admin banner update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/banners/:id - Delete banner (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin();
        const { id } = await params;
        const supabase = await createSupabaseServerClient();

        // Get banner to delete image from storage
        const { data: banner } = await supabase
            .from('banners')
            .select('image_url')
            .eq('id', id)
            .single();

        if (banner?.image_url) {
            const urlParts = banner.image_url.split('/banners/');
            if (urlParts.length > 1) {
                await supabase.storage.from('banners').remove([urlParts[1]]);
            }
        }

        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Banner delete error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        console.error('Admin banner delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
