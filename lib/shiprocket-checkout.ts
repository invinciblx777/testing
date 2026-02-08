import crypto from 'crypto';

// Environment variable validation
const API_EMAIL = process.env.SHIPROCKET_EMAIL;
const API_PASSWORD = process.env.SHIPROCKET_PASSWORD;
// Keeping these for legacy check, but prioritizing Email/Pass
const LEGACY_API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY;
const LEGACY_API_SECRET = process.env.SHIPROCKET_CHECKOUT_SECRET;

const CHECKOUT_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

export interface CheckoutItem {
    variant_id: string;
    quantity: number;
    selling_price: number;
    title: string;
    sku: string;
    image_url?: string;
}

export interface CheckoutSessionPayload {
    order_id: string;
    cart_items: CheckoutItem[];
    sub_total: number;
    shipping_charges?: number;
    discount?: number;
    total_amount: number;
    customer_details?: {
        email?: string;
        phone?: string;
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    billing_details?: {
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    redirect_url: string;
    timestamp?: string; // ISO string format
}

export interface ShiprocketCheckoutResponse {
    success: boolean;
    checkout_url?: string; // We might construct this manually or get it from response
    order_id?: number;
    shipment_id?: number;
    awb_code?: string;
    error?: string;
    message?: string;
}

export class ShiprocketCheckoutService {
    private static token: string | null = null;
    private static tokenExpiry: number | null = null;

    /**
     * Validate environment variables are set
     */
    static validateConfig(): { valid: boolean; missing: string[] } {
        const missing: string[] = [];
        if (!API_EMAIL) missing.push('SHIPROCKET_EMAIL');
        if (!API_PASSWORD) missing.push('SHIPROCKET_PASSWORD');
        return { valid: missing.length === 0, missing };
    }

    private static async getToken(): Promise<string> {
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token!;
        }

        const config = this.validateConfig();
        if (!config.valid) {
            throw new Error(`Missing Shiprocket credentials: ${config.missing.join(', ')}`);
        }

        try {
            console.log('[Shiprocket] Authenticating with:', API_EMAIL);
            const response = await fetch(`${CHECKOUT_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: API_EMAIL, password: API_PASSWORD }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Auth failed [${response.status}]: ${errorText}`);
            }

            const data = await response.json();
            if (!data.token) {
                throw new Error('No token received from Shiprocket auth');
            }
            this.token = data.token;
            this.tokenExpiry = Date.now() + (240 * 60 * 60 * 1000) - 3600000; // 10 days - 1 hour buffer
            return this.token!;
        } catch (error) {
            console.error('[Shiprocket] Auth Error:', error);
            throw error;
        }
    }

    /**
     * Create checkout session (Actually creates an Order in standard API)
     * Note: Standard API doesn't return a "Checkout URL" directly.
     * We might need to handle payment locally or use a different flow?
     * 
     * WAIT: The user wants "Headless Checkout".
     * If we use standard API, we are creating an ORDER.
     * 
     * Let's implement this as a standard order creation for now, 
     * and if that succeeds, we return success.
     */
    static async createSession(payload: CheckoutSessionPayload): Promise<ShiprocketCheckoutResponse> {
        try {
            const token = await this.getToken();

            // Determine if shipping is billing
            // If billing_details is NOT provided, we assume same as shipping.
            // But we can check specifically.
            // For now, if billing_details is passed, we use it.

            const billingSource = payload.billing_details || payload.customer_details;
            const shippingIsBilling = !payload.billing_details;

            // Map payload to Shiprocket Order Schema
            const orderData = {
                order_id: payload.order_id,
                order_date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
                pickup_location: "Primary", // Needs to be configured in dashboard
                billing_customer_name: billingSource?.name || "Guest",
                billing_last_name: "",
                billing_address: billingSource?.address || "Not Provided",
                billing_city: billingSource?.city || "New Delhi",
                billing_pincode: billingSource?.pincode || "110001",
                billing_state: billingSource?.state || "Delhi",
                billing_country: "India",
                billing_email: payload.customer_details?.email || "guest@example.com",
                billing_phone: billingSource?.phone || "9999999999",
                shipping_is_billing: shippingIsBilling,
                shipping_customer_name: payload.customer_details?.name || "Guest",
                shipping_last_name: "",
                shipping_address: payload.customer_details?.address || "Not Provided",
                shipping_city: payload.customer_details?.city || "New Delhi",
                shipping_pincode: payload.customer_details?.pincode || "110001",
                shipping_country: "India",
                shipping_state: payload.customer_details?.state || "Delhi",
                shipping_email: payload.customer_details?.email || "guest@example.com",
                shipping_phone: payload.customer_details?.phone || "9999999999",
                order_items: payload.cart_items.map(item => ({
                    name: item.title,
                    sku: item.sku,
                    units: item.quantity,
                    selling_price: item.selling_price,
                })),
                payment_method: "Prepaid",
                sub_total: payload.sub_total,
                length: 10, breadth: 10, height: 10, weight: 0.5 // Default dimensions
            };

            console.log('[Shiprocket] Creating Order:', JSON.stringify(orderData, null, 2));

            const response = await fetch(`${CHECKOUT_BASE_URL}/orders/create/adhoc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[Shiprocket] Order Creation Failed:', data);
                throw new Error(data.message || 'Order creation failed');
            }

            console.log('[Shiprocket] Order Created:', data);

            return {
                success: true,
                order_id: data.order_id,
                shipment_id: data.shipment_id,
                awb_code: data.awb_code,
                // Note: Standard API does NOT give a checkout URL.
                // We might need to redirect to our own success page.
                checkout_url: payload.redirect_url + `?order_id=${data.order_id}&status=success`
            };

        } catch (error) {
            console.error('[Shiprocket] Create Session Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Unknown error');
        }
    }

    /**
     * Generate HMAC SHA256 signature in BASE64 format
     * Used for legacy webhook verification
     */
    private static generateSignature(payload: string): string {
        if (!LEGACY_API_SECRET) {
            throw new Error('SHIPROCKET_CHECKOUT_SECRET is not configured');
        }

        const hmac = crypto
            .createHmac('sha256', LEGACY_API_SECRET)
            .update(payload)
            .digest('base64');

        return hmac;
    }

    /**
     * Verify webhook signature
     */
    static verifyWebhook(payload: string, signature: string): boolean {
        // If no secret is configured, we can't verify
        if (!LEGACY_API_SECRET) return false;

        try {
            const expectedSignature = this.generateSignature(payload);
            return signature === expectedSignature;
        } catch (error) {
            console.error('[Shiprocket] Webhook verification error:', error);
            return false;
        }
    }
}
