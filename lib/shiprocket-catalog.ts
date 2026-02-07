/**
 * Shiprocket Catalog Helpers
 * Transforms Supabase data to Shiprocket's expected format
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role client for catalog APIs (bypasses RLS)
export function getAdminClient() {
    return createClient(supabaseUrl, supabaseServiceKey);
}

export interface ShiprocketProduct {
    id: string;
    title: string;
    description: string;
    vendor: string;
    product_type: string;
    status: 'active' | 'draft';
    image_url: string;
    updated_at: string;
    variants: ShiprocketVariant[];
}

export interface ShiprocketVariant {
    id: string;
    product_id: string;
    title: string;
    price: number;
    quantity: number;
    sku: string;
    weight: number;
    image_url: string;
}

export interface ShiprocketCollection {
    id: string;
    title: string;
    description: string;
    image_url: string;
}

/**
 * Format a product for Shiprocket catalog
 */
export function formatProductForShiprocket(
    product: any,
    variants: any[]
): ShiprocketProduct {
    const primaryImage = product.images?.[0]?.image_url || '';

    return {
        id: product.id,
        title: product.name,
        description: product.description || '',
        vendor: product.vendor || 'Kurtis Boutique',
        product_type: product.product_type || product.category?.name || 'Kurti',
        status: product.is_active ? 'active' : 'draft',
        image_url: primaryImage,
        updated_at: product.updated_at,
        variants: variants.map((v, idx) => ({
            id: v.id,
            product_id: product.id,
            title: `${product.name} - ${v.size}`,
            price: product.discount_price || product.price,
            quantity: v.stock_count || 0,
            sku: `${product.slug}-${v.size}`.toUpperCase(),
            weight: v.weight || 0.5, // Default 500g if not set
            image_url: product.images?.[idx]?.image_url || primaryImage
        }))
    };
}

/**
 * Format a category as Shiprocket collection
 */
export function formatCollectionForShiprocket(category: any): ShiprocketCollection {
    return {
        id: category.id,
        title: category.name,
        description: category.description || `${category.name} collection`,
        image_url: category.image_url || ''
    };
}

/**
 * Fetch paginated products with variants
 */
export async function getPaginatedProducts(page: number = 1, limit: number = 50) {
    const supabase = getAdminClient();
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    // Get products with images and sizes
    const { data: products, error } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(id, name),
      images:product_images(image_url, display_order),
      sizes:product_sizes(id, size, stock_count, weight)
    `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
    }

    const formattedProducts = (products || []).map(product => {
        // Sort images by display order
        const sortedImages = [...(product.images || [])].sort(
            (a, b) => a.display_order - b.display_order
        );
        return formatProductForShiprocket(
            { ...product, images: sortedImages },
            product.sizes || []
        );
    });

    return {
        products: formattedProducts,
        pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
        }
    };
}

/**
 * Fetch all collections (categories)
 */
export async function getAllCollections() {
    const supabase = getAdminClient();

    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch collections: ${error.message}`);
    }

    return {
        collections: (categories || []).map(formatCollectionForShiprocket)
    };
}

/**
 * Fetch products by collection ID
 */
export async function getProductsByCollection(
    collectionId: string,
    page: number = 1,
    limit: number = 50
) {
    const supabase = getAdminClient();
    const offset = (page - 1) * limit;

    // Get total count for this collection
    const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('category_id', collectionId);

    // Get products
    const { data: products, error } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(id, name),
      images:product_images(image_url, display_order),
      sizes:product_sizes(id, size, stock_count, weight)
    `)
        .eq('is_active', true)
        .eq('category_id', collectionId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
    }

    const formattedProducts = (products || []).map(product => {
        const sortedImages = [...(product.images || [])].sort(
            (a, b) => a.display_order - b.display_order
        );
        return formatProductForShiprocket(
            { ...product, images: sortedImages },
            product.sizes || []
        );
    });

    return {
        products: formattedProducts,
        pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
        }
    };
}
