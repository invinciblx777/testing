const https = require('https');

const email = "NUugHZRHG3Bxg5Et"; // API_KEY from previous context
const password = "f7POUrD9jjYIWKM8dDRCTGBDRLZ9BDkZ"; // API_SECRET from previous context

const data = JSON.stringify({
    email: email,
    password: password
});

const options = {
    hostname: 'apiv2.shiprocket.in',
    path: '/v1/external/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Testing auth with: ${email} / ${password.substring(0, 5)}...`);

const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${responseBody}`);
    });
});

req.on('error', (error) => {
    console.error(`Error: ${error.message}`);
});

req.write(data);
req.end();
