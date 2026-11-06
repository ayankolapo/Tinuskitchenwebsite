// test-webhook.js — Simulate Paystack webhook event locally
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Read .env if present
let PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const envPath = path.join(__dirname, '.env');
if (!PAYSTACK_SECRET && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/PAYSTACK_SECRET_KEY=([^\r\n]+)/);
  if (match) PAYSTACK_SECRET = match[1].trim().replace(/^['"]|['"]$/g, '');
}

if (!PAYSTACK_SECRET) {
  console.error('❌ Error: PAYSTACK_SECRET_KEY not found in environment or .env file.');
  process.exit(1);
}

console.log('Using Paystack Secret:', PAYSTACK_SECRET.substring(0, 12) + '...');

const testRef = 'TKB-TEST-' + Date.now();
const testAmountKobo = 850000; // ₦8,500.00

const payload = {
  event: 'charge.success',
  data: {
    id: Math.floor(Math.random() * 10000000),
    domain: 'test',
    status: 'success',
    reference: testRef,
    amount: testAmountKobo,
    gateway_response: 'Successful',
    paid_at: new Date().toISOString(),
    channel: 'card',
    currency: 'NGN',
    ip_address: '127.0.0.1',
    customer: {
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test@tinuskitchen.com',
      phone: '08162918036'
    },
    metadata: {
      custom_fields: [
        { variable_name: 'customer_name', value: 'Test Customer' },
        { variable_name: 'customer_phone', value: '08162918036' },
        { variable_name: 'delivery_type', value: 'delivery' },
        { variable_name: 'location_zone', value: 'Inside ipaye' },
        { variable_name: 'delivery_fee', value: '1500' },
        { variable_name: 'delivery_address', value: '12 Test Street, Inside Ipaye, Lagos' },
        { variable_name: 'notes', value: 'Simulated webhook test order' }
      ]
    }
  }
};

const body = JSON.stringify(payload);
const signature = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');

async function testWebhook() {
  console.log(`\n🚀 Sending test webhook to http://localhost:8888/.netlify/functions/paystack-webhook...`);
  console.log(`📦 Order Ref: ${testRef}`);
  console.log(`🔐 Generated HMAC Signature: ${signature.substring(0, 16)}...`);

  try {
    const res = await fetch('http://localhost:8888/.netlify/functions/paystack-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature
      },
      body: body
    });

    const text = await res.text();
    console.log(`\n📡 Status Code: ${res.status}`);
    console.log(`📄 Response: ${text}`);

    if (res.status === 200) {
      console.log(`\n✅ Webhook succeeded! You can check this order in the tracker:`);
      console.log(`   http://localhost:8888/order-status.html?ref=${testRef}\n`);
    } else {
      console.log(`\n❌ Webhook test failed with status ${res.status}.\n`);
    }
  } catch (err) {
    console.error('\n❌ Could not connect to http://localhost:8888. Make sure `npx netlify dev` is running!', err.message);
  }
}

testWebhook();
