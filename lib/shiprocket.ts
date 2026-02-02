/**
 * Shiprocket API v2 Service
 * 
 * Production-grade integration with:
 * - Token caching with expiry
 * - Order creation, AWB assignment, pickup scheduling
 * - Tracking and serviceability checks
 * 
 * All calls are server-side only - never expose credentials to frontend
 */

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Shiprocket API Error
 */
export class ShiprocketError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public apiError?: unknown
    ) {
        super(message);
        this.name = 'ShiprocketError';
    }
}

/**
 * Get authentication token (cached with 24hr expiry)
 */
export async function getToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (cachedToken && Date.now() < tokenExpiry - 5 * 60 * 1000) {
        return cachedToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        throw new ShiprocketError(
            'Shiprocket credentials not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environment variables.'
        );
    }

    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ShiprocketError(
            `Authentication failed: ${response.statusText}`,
            response.status,
            error
        );
    }

    const data = await response.json();
    cachedToken = data.token;
    // Token valid for 10 days, but we'll refresh after 24 hours for safety
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    return cachedToken!;
}

/**
 * Make authenticated request to Shiprocket API
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getToken();

    const response = await fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ShiprocketError(
            `API request failed: ${endpoint}`,
            response.status,
            data
        );
    }

    return data as T;
}

// ============================================
// Order Types
// ============================================

export interface ShiprocketOrderItem {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: string;
}

export interface CreateOrderParams {
    order_id: string;
    order_date: string; // YYYY-MM-DD HH:mm
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name?: string;
    billing_address: string;
    billing_address_2?: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    shipping_customer_name?: string;
    shipping_last_name?: string;
    shipping_address?: string;
    shipping_address_2?: string;
    shipping_city?: string;
    shipping_pincode?: string;
    shipping_state?: string;
    shipping_country?: string;
    shipping_email?: string;
    shipping_phone?: string;
    order_items: ShiprocketOrderItem[];
    payment_method: 'COD' | 'Prepaid';
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
    channel_id?: number;
}

export interface CreateOrderResponse {
    order_id: number;
    shipment_id: number;
    status: string;
    status_code: number;
    awb_code?: string;
    courier_company_id?: number;
    courier_name?: string;
}

/**
 * Create order in Shiprocket (adhoc/quick order)
 */
export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
    return apiRequest<CreateOrderResponse>('/orders/create/adhoc', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

// ============================================
// AWB Assignment
// ============================================

export interface AssignAWBParams {
    shipment_id: number;
    courier_id?: number;
    status?: 'reassign';
}

export interface AssignAWBResponse {
    awb_assign_status: number;
    response: {
        data: {
            awb_code: string;
            courier_company_id: number;
            courier_name: string;
            cod: number;
            order_id: number;
            shipment_id: number;
            applied_weight: number;
            routing_code?: string;
            invoice_no?: string;
            label_url?: string;
        };
    };
}

/**
 * Assign AWB (Air Waybill) to shipment
 */
export async function assignAWB(params: AssignAWBParams): Promise<AssignAWBResponse> {
    return apiRequest<AssignAWBResponse>('/courier/assign/awb', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

// ============================================
// Pickup Scheduling
// ============================================

export interface SchedulePickupParams {
    shipment_id: number[];
}

export interface SchedulePickupResponse {
    pickup_status: number;
    response: {
        pickup_scheduled_date?: string;
        pickup_token_number?: string;
    };
}

/**
 * Generate pickup request for shipment
 */
export async function schedulePickup(shipmentIds: number[]): Promise<SchedulePickupResponse> {
    return apiRequest<SchedulePickupResponse>('/courier/generate/pickup', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipmentIds })
    });
}

// ============================================
// Tracking
// ============================================

export interface TrackingActivity {
    date: string;
    status?: string;
    activity: string;
    location: string;
    'sr-status'?: string;
    'sr-status-label'?: string;
}

export interface TrackingData {
    tracking_data: {
        track_status: number;
        shipment_status: number;
        shipment_track: Array<{
            id: number;
            awb_code: string;
            courier_company_id: number;
            shipment_id: number;
            order_id: number;
            pickup_date: string | null;
            delivered_date: string | null;
            weight: string;
            packages: number;
            current_status: string;
            delivered_to: string;
            destination: string;
            consignee_name: string;
            origin: string;
            courier_name?: string;
            edd?: string;
        }>;
        shipment_track_activities: TrackingActivity[];
        track_url: string;
        etd?: string;
    };
}

/**
 * Get tracking data by AWB code
 */
export async function getTrackingByAWB(awbCode: string): Promise<TrackingData> {
    return apiRequest<TrackingData>(`/courier/track/awb/${awbCode}`, {
        method: 'GET'
    });
}

/**
 * Get tracking data by shipment ID
 */
export async function getTrackingByShipmentId(shipmentId: number): Promise<TrackingData> {
    return apiRequest<TrackingData>(`/courier/track/shipment/${shipmentId}`, {
        method: 'GET'
    });
}

// ============================================
// Serviceability
// ============================================

export interface CourierOption {
    courier_company_id: number;
    courier_name: string;
    freight_charge: number;
    cod_charges?: number;
    estimated_delivery_days: string;
    etd: string;
    rate: number;
    min_weight: number;
    charge_weight: number;
    blocked: number;
}

export interface ServiceabilityResponse {
    status: number;
    data: {
        available_courier_companies: CourierOption[];
        recommended_courier_company_id?: number;
    };
}

/**
 * Check courier serviceability between pincodes
 */
export async function checkServiceability(params: {
    pickup_postcode: string;
    delivery_postcode: string;
    weight: number;
    cod: 0 | 1;
}): Promise<ServiceabilityResponse> {
    const query = new URLSearchParams({
        pickup_postcode: params.pickup_postcode,
        delivery_postcode: params.delivery_postcode,
        weight: params.weight.toString(),
        cod: params.cod.toString()
    });

    return apiRequest<ServiceabilityResponse>(`/courier/serviceability/?${query}`, {
        method: 'GET'
    });
}

// ============================================
// Pickup Locations
// ============================================

export interface PickupLocation {
    id: number;
    pickup_location: string;
    address: string;
    address_2: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
    email: string;
    phone: string;
    name: string;
    status: number;
}

export interface PickupLocationsResponse {
    data: {
        shipping_address: PickupLocation[];
    };
}

/**
 * Get all configured pickup locations
 */
export async function getPickupLocations(): Promise<PickupLocationsResponse> {
    return apiRequest<PickupLocationsResponse>('/settings/company/pickup', {
        method: 'GET'
    });
}

// ============================================
// Manifest Generation
// ============================================

export interface ManifestResponse {
    status: number;
    manifest_url?: string;
}

/**
 * Generate manifest for shipments
 */
export async function generateManifest(shipmentIds: number[]): Promise<ManifestResponse> {
    return apiRequest<ManifestResponse>('/manifests/generate', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipmentIds })
    });
}

// ============================================
// Label Generation
// ============================================

export interface LabelResponse {
    label_created: number;
    label_url?: string;
    response?: string;
}

/**
 * Generate shipping label for shipment
 */
export async function generateLabel(shipmentIds: number[]): Promise<LabelResponse> {
    return apiRequest<LabelResponse>('/courier/generate/label', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipmentIds })
    });
}

// ============================================
// Shipment Status Mapping
// ============================================

export const SHIPMENT_STATUS_MAP: Record<number, string> = {
    1: 'AWB_ASSIGNED',
    2: 'LABEL_GENERATED',
    3: 'PICKUP_SCHEDULED',
    4: 'PICKUP_QUEUED',
    5: 'MANIFEST_GENERATED',
    6: 'SHIPPED',
    7: 'DELIVERED',
    8: 'CANCELED',
    9: 'RTO_INITIATED',
    10: 'RTO_DELIVERED',
    12: 'LOST',
    13: 'PICKUP_ERROR',
    14: 'RTO_ACKNOWLEDGED',
    15: 'PICKUP_RESCHEDULED',
    16: 'CANCELLATION_REQUESTED',
    17: 'OUT_FOR_DELIVERY',
    18: 'IN_TRANSIT',
    19: 'OUT_FOR_PICKUP',
    20: 'PICKUP_EXCEPTION',
    21: 'UNDELIVERED',
    22: 'DELAYED',
    38: 'REACHED_DESTINATION_HUB',
    42: 'PICKED_UP'
};

/**
 * Map Shiprocket status code to our order status
 */
export function mapShiprocketStatusToOrderStatus(statusCode: number): string {
    switch (statusCode) {
        case 7:
            return 'delivered';
        case 8:
        case 16:
            return 'cancelled';
        case 6:
        case 17:
        case 18:
        case 42:
            return 'shipped';
        case 9:
        case 10:
        case 14:
            return 'returned';
        default:
            return 'processing';
    }
}
