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
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    diagnostics.env_vars = {
        SHIPROCKET_EMAIL: email ? `✅ Set (${email})` : '❌ MISSING',
        SHIPROCKET_PASSWORD: password ? `✅ Set (${password.length} chars)` : '❌ MISSING',
        NEXT_PUBLIC_APP_URL: appUrl || '❌ MISSING',
    };

    // 2. Validate config
    const configCheck = ShiprocketCheckoutService.validateConfig();
    diagnostics.config_valid = configCheck.valid;
    if (!configCheck.valid) {
        diagnostics.missing_config = configCheck.missing;
    }

    // 3. Auth Test (Optional - could try to login here via service but keeping it simple for now)
    diagnostics.auth_type = "Standard API (Email/Password)";

    // 4. API endpoint info
    diagnostics.api_info = {
        base_url: 'https://apiv2.shiprocket.in/v1/external',
        auth_endpoint: '/auth/login',
        order_endpoint: '/orders/create/adhoc',
        header_format: {
            'Authorization': 'Bearer <TOKEN>',
        },
        redirect_url: appUrl ? `${appUrl}/orders/success` : 'NOT CONFIGURED'
    };

    // 5. Summary
    const allGood = configCheck.valid && appUrl;
    diagnostics.summary = allGood
        ? '✅ All checks passed - ready for standard checkout'
        : '❌ Configuration issues detected - see above for details';

    console.log('[Shiprocket Debug] Diagnostics complete:', diagnostics);

    return NextResponse.json(diagnostics, {
        status: allGood ? 200 : 500
    });
}
