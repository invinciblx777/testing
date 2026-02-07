import { NextRequest, NextResponse } from 'next/server';
import { ShiprocketCheckoutService } from '@/lib/shiprocket-checkout';

/**
 * Debug endpoint for Shiprocket checkout integration
 * GET /api/shiprocket/debug
 * 
 * Use this to verify:
 * - Environment variables are configured
 * - HMAC generation is working correctly
 * - API key format is correct
 */
export async function GET(request: NextRequest) {
    console.log('[Shiprocket Debug] Running diagnostics...');

    const diagnostics: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    };

    // 1. Check environment variables
    const apiKey = process.env.SHIPROCKET_CHECKOUT_API_KEY;
    const apiSecret = process.env.SHIPROCKET_CHECKOUT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    diagnostics.env_vars = {
        SHIPROCKET_CHECKOUT_API_KEY: apiKey ? `✅ Set (ends with ...${apiKey.slice(-4)})` : '❌ MISSING',
        SHIPROCKET_CHECKOUT_SECRET: apiSecret ? `✅ Set (${apiSecret.length} chars)` : '❌ MISSING',
        NEXT_PUBLIC_APP_URL: appUrl || '❌ MISSING',
    };

    // 2. Validate config
    const configCheck = ShiprocketCheckoutService.validateConfig();
    diagnostics.config_valid = configCheck.valid;
    if (!configCheck.valid) {
        diagnostics.missing_config = configCheck.missing;
    }

    // 3. Test HMAC generation
    if (apiSecret) {
        const testPayload = JSON.stringify({ test: 'payload', timestamp: new Date().toISOString() });
        try {
            const hmacResult = ShiprocketCheckoutService.debugHMAC(testPayload);
            diagnostics.hmac_test = {
                status: '✅ HMAC generation working',
                test_payload_length: testPayload.length,
                hmac_base64_length: hmacResult.hmac_base64.length,
                hmac_hex_length: hmacResult.hmac_hex.length,
                // Show first 20 chars for verification
                hmac_base64_preview: hmacResult.hmac_base64.substring(0, 20) + '...',
                hmac_hex_preview: hmacResult.hmac_hex.substring(0, 20) + '...',
            };
        } catch (error) {
            diagnostics.hmac_test = {
                status: '❌ HMAC generation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    } else {
        diagnostics.hmac_test = {
            status: '⚠️ Cannot test - API secret not configured'
        };
    }

    // 4. API endpoint info
    diagnostics.api_info = {
        checkout_endpoint: 'https://apiv2.shiprocket.in/v1/checkout/create-session',
        header_format: {
            'X-Api-Key': 'Bearer <API_KEY>',
            'X-Api-HMAC-SHA256': '<BASE64_HMAC>',
        },
        redirect_url: appUrl ? `${appUrl}/orders/success` : 'NOT CONFIGURED'
    };

    // 5. Summary
    const allGood = configCheck.valid && appUrl;
    diagnostics.summary = allGood
        ? '✅ All checks passed - ready for checkout'
        : '❌ Configuration issues detected - see above for details';

    console.log('[Shiprocket Debug] Diagnostics complete:', diagnostics);

    return NextResponse.json(diagnostics, {
        status: allGood ? 200 : 500
    });
}
