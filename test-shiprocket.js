const crypto = require('crypto');
const https = require('https');

const API_KEY = "NUugHZRHG3Bxg5Et";
const API_SECRET = "f7POUrD9jjYIWKM8dDRCTGBDRLZ9BDkZ";
const CHECKOUT_BASE_URL = 'https://checkout-api.shiprocket.com';

function generateHMAC(payload) {
    return crypto.createHmac('sha256', API_SECRET).update(payload).digest('base64');
}

const payload = {
    order_id: "TEST-ORDER-" + Date.now(),
    sub_total: 100,
    total_amount: 100,
    shipping_charges: 0,
    discount: 0,
    cart_items: [{
        variant_id: "default",
        quantity: 1,
        selling_price: 100,
        title: "Test Product",
        sku: "TEST-SKU",
    }],
    customer_details: {
        name: "Test User",
        email: "test@example.com",
        phone: "9999999999",
    },
    redirect_url: "http://localhost:3000/checkout/success",
    timestamp: new Date().toISOString(),
};

const payloadString = JSON.stringify(payload);
const signature = generateHMAC(payloadString);

console.log("Testing Shiprocket API...");
console.log("URL:", `${CHECKOUT_BASE_URL}/create-session`);

const req = https.request(`${CHECKOUT_BASE_URL}/create-session`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': `Bearer ${API_KEY}`,
        'X-Api-HMAC-SHA256': signature,
    },
}, (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(payloadString);
req.end();
