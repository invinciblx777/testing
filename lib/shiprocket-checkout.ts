import crypto from 'crypto';

// Environment variable validation
const API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY;
const API_SECRET = process.env.SHIPROCKET_CHECKOUT_SECRET;

if (!API_KEY || !API_SECRET) {
    console.error('❌ SHIPROCKET CHECKOUT CONFIG ERROR: Missing environment variables');
    console.error('  Required: SHIPROCKET_CHECKOUT_API_KEY, SHIPROCKET_CHECKOUT_SECRET');
}

const CHECKOUT_BASE_URL = 'https://apiv2.shiprocket.in/v1/checkout';

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
    };
    redirect_url: string;
    timestamp?: string; // ISO string format
}

export interface ShiprocketCheckoutResponse {
    success: boolean;
    checkout_url?: string;
    session_id?: string;
    error?: string;
    message?: string;
}

export interface ShiprocketError {
    error: true;
    message: string;
    status_code: number;
    shiprocket_response: unknown;
    request_body?: unknown;
    hmac_debug?: {
        payload_string: string;
        hmac_signature: string;
    };
}

export class ShiprocketCheckoutService {
    /**
     * Generate HMAC SHA256 signature in BASE64 format
     * CRITICAL: Must use base64, NOT hex!
     */
    private static generateSignature(payload: string): string {
        if (!API_SECRET) {
            throw new Error('SHIPROCKET_CHECKOUT_SECRET is not configured');
        }

        const hmac = crypto
            .createHmac('sha256', API_SECRET)
            .update(payload)
            .digest('base64'); // FIXED: Using base64 instead of hex

        console.log('[Shiprocket] HMAC Debug:');
        console.log('  Payload length:', payload.length);
        console.log('  HMAC (base64):', hmac.substring(0, 20) + '...');

        return hmac;
    }

    /**
     * Validate environment variables are set
     */
    static validateConfig(): { valid: boolean; missing: string[] } {
        const missing: string[] = [];
        if (!API_KEY) missing.push('SHIPROCKET_CHECKOUT_API_KEY');
        if (!API_SECRET) missing.push('SHIPROCKET_CHECKOUT_SECRET');
        return { valid: missing.length === 0, missing };
    }

    /**
     * Create checkout session with Shiprocket
     */
    static async createSession(payload: CheckoutSessionPayload): Promise<ShiprocketCheckoutResponse> {
        // Validate config first
        const config = this.validateConfig();
        if (!config.valid) {
            throw new Error(`Missing Shiprocket config: ${config.missing.join(', ')}`);
        }

        // Add timestamp in ISO format if not present
        if (!payload.timestamp) {
            payload.timestamp = new Date().toISOString();
        }

        // Stringify payload for HMAC and request body
        const payloadString = JSON.stringify(payload);
        const signature = this.generateSignature(payloadString);

        console.log('[Shiprocket] Creating checkout session:');
        console.log('  Order ID:', payload.order_id);
        console.log('  Items:', payload.cart_items.length);
        console.log('  Total:', payload.total_amount);
        console.log('  Redirect URL:', payload.redirect_url);

        // Prepare headers with correct format
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Api-Key': `Bearer ${API_KEY}`, // FIXED: Added Bearer prefix
            'X-Api-HMAC-SHA256': signature,   // FIXED: Correct header name
        };

        console.log('[Shiprocket] Request headers:', {
            'Content-Type': headers['Content-Type'],
            'X-Api-Key': 'Bearer ***' + API_KEY!.slice(-4),
            'X-Api-HMAC-SHA256': signature.substring(0, 20) + '...'
        });

        try {
            const response = await fetch(`${CHECKOUT_BASE_URL}/create-session`, {
                method: 'POST',
                headers,
                body: payloadString,
            });

            const responseText = await response.text();
            console.log('[Shiprocket] Response status:', response.status);
            console.log('[Shiprocket] Response body:', responseText.substring(0, 500));

            let responseData: unknown;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                responseData = { raw_response: responseText };
            }

            if (!response.ok) {
                const errorDetails: ShiprocketError = {
                    error: true,
                    message: `Shiprocket API Error [${response.status}]`,
                    status_code: response.status,
                    shiprocket_response: responseData,
                    request_body: payload,
                    hmac_debug: {
                        payload_string: payloadString.substring(0, 200) + '...',
                        hmac_signature: signature
                    }
                };

                console.error('[Shiprocket] ❌ API Error:', JSON.stringify(errorDetails, null, 2));
                throw new Error(JSON.stringify(errorDetails));
            }

            return responseData as ShiprocketCheckoutResponse;

        } catch (error) {
            if (error instanceof Error && error.message.startsWith('{')) {
                // Re-throw structured errors
                throw error;
            }

            console.error('[Shiprocket] ❌ Network/Fetch error:', error);
            throw new Error(`Shiprocket request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Verify webhook signature
     */
    static verifyWebhook(payload: string, signature: string): boolean {
        const expectedSignature = this.generateSignature(payload);
        const isValid = signature === expectedSignature;

        console.log('[Shiprocket] Webhook verification:', isValid ? '✅ Valid' : '❌ Invalid');

        return isValid;
    }

    /**
     * Debug utility to test HMAC generation
     */
    static debugHMAC(testPayload: string): { payload: string; hmac_base64: string; hmac_hex: string } {
        if (!API_SECRET) {
            throw new Error('SHIPROCKET_CHECKOUT_SECRET not configured');
        }

        return {
            payload: testPayload,
            hmac_base64: crypto.createHmac('sha256', API_SECRET).update(testPayload).digest('base64'),
            hmac_hex: crypto.createHmac('sha256', API_SECRET).update(testPayload).digest('hex')
        };
    }
}
