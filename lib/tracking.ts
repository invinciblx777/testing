
export function getTrackingUrl(awb: string | null, courier: string | null): string {
    if (!awb || !courier) return '#';

    // Placeholder Logic for Shiprocket / Courier Links
    // In a real app, this would map courier codes to their specific tracking URL patterns.

    // Example patterns (mock):
    // Delhivery: https://www.delhivery.com/track/package/{awb}
    // Bluedart: https://www.bluedart.com/track?handler=trakdocs&trackId={awb}

    // For now, we return a generic placeholder that the User requested.
    // Ideally, this could link to a Shiprocket tracking page if we had the specific URL format.

    const courierSlug = courier.toLowerCase().replace(/\s+/g, '-');
    return `https://kurtisboutique.shiprocket.co/tracking/${awb}`;
}

export function getStatusDescription(status: string): string {
    switch (status) {
        case 'Pending Shipment':
            return 'We are preparing your order for shipment.';
        case 'Shipped':
            return 'Your order has been shipped and is on its way.';
        case 'In Transit':
            return 'Your order is in transit and will reach you soon.';
        case 'Delivered':
            return 'Your order has been delivered.';
        case 'RTO':
            return 'Order was returned to origin.';
        default:
            return 'Status update available soon.';
    }
}
