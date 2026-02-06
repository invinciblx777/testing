
import crypto from 'crypto';

const CHECKOUT_BASE_URL = 'https://apiv2.shiprocket.in/v1/checkout';
const API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY!;
const API_SECRET = process.env.SHIPROCKET_CHECKOUT_SECRET!;

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
    timestamp?: number;
}

export class ShiprocketCheckoutService {

    private static generateSignature(payload: string): string {
        return crypto
            .createHmac('sha256', API_SECRET)
            .update(payload)
            .digest('hex');
    }

    static async createSession(payload: CheckoutSessionPayload) {
        if (!payload.timestamp) {
            payload.timestamp = Math.floor(Date.now() / 1000);
        }

        const payloadString = JSON.stringify(payload);
        const signature = this.generateSignature(payloadString);

        const response = await fetch(`${CHECKOUT_BASE_URL}/create-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY,
                'X-Api-Signature': signature,
            },
            body: payloadString,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shiprocket Checkout Error [${response.status}]: ${errorText}`);
        }

        return response.json();
    }

    static verifyWebhook(payload: string, signature: string): boolean {
        const expectedSignature = this.generateSignature(payload);
        return signature === expectedSignature;
    }
}
