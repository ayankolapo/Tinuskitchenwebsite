const crypto = require('crypto');

const PAYSTACK_SECRET = (process.env.PAYSTACK_SECRET_KEY || '').trim().replace(/^['"]|['"]$/g, '');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async function (event, context) {
  if (!PAYSTACK_SECRET) {
    console.error('[Webhook] Missing PAYSTACK_SECRET_KEY environment variable in Netlify');
    return { statusCode: 500, body: 'Server configuration error: PAYSTACK_SECRET_KEY missing' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const signature = event.headers['x-paystack-signature'] || event.headers['X-Paystack-Signature'];
  if (!signature) {
    console.warn('[Webhook] Rejected request: Missing x-paystack-signature header');
    return { statusCode: 400, body: 'Missing Paystack signature header' };
  }

  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(event.body).digest('hex');
  if (hash !== signature) {
    console.warn('[Webhook] Rejected request: Invalid HMAC cryptographic signature');
    return { statusCode: 401, body: 'Unauthorized signature' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    console.info(`[Webhook] Received event: ${payload.event}`);

    if (payload.event === 'charge.success') {
      const data = payload.data || {};
      const reference = data.reference;
      const totalAmount = (data.amount || 0) / 100;
      const metadata = data.metadata || {};
      const customFields = Array.isArray(metadata.custom_fields) ? metadata.custom_fields : [];

      console.info(`[Webhook] Processing charge.success | Ref: ${reference} | Amount: ₦${totalAmount.toLocaleString()} | Channel: ${data.channel || 'unknown'}`);

      const getField = (varName) => {
        const found = customFields.find(f => f.variable_name === varName);
        return found ? found.value : null;
      };

      if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn('[Webhook] Supabase credentials unconfigured in environment; skipping DB insert');
        return { statusCode: 200, body: 'Webhook received (database unconfigured)' };
      }

      // Check for duplicate insert (idempotency)
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}&select=id`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (Array.isArray(existing) && existing.length > 0) {
          console.info(`[Webhook] Order ${reference} already exists in database (ID: ${existing[0].id}); skipping insert`);
          return { statusCode: 200, body: 'Order already exists' };
        }
      }

      const customerName = getField('customer_name') || data.customer?.first_name || 'Valued Diner';
      const customerPhone = getField('customer_phone') || data.customer?.phone || '08000000000';
      const deliveryType = getField('delivery_type') || 'delivery';
      const locationZone = getField('location_zone') || (deliveryType === 'pickup' ? 'Counter Pickup' : 'Local Delivery');
      const deliveryFee = Number(getField('delivery_fee')) || 0;
      const deliveryAddress = getField('delivery_address') || (deliveryType === 'pickup' ? 'Counter Pickup' : 'Lagos Delivery');
      const notes = getField('notes') || null;

      const orderPayload = {
        reference,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: data.customer?.email || null,
        items: [{ name: 'Order via Paystack', quantity: 1, price: totalAmount }],
        total_amount: totalAmount,
        delivery_type: deliveryType,
        delivery_address: deliveryAddress,
        location_zone: locationZone,
        delivery_fee: deliveryFee,
        notes: notes,
        status: 'pending',
        payment_status: 'paid',
        paid_at: data.paid_at || new Date().toISOString()
      };

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        console.error(`[Webhook] Supabase insert failed for ${reference}:`, errText);
      } else {
        const saved = await insertRes.json();
        console.info(`[Webhook] Successfully saved order ${reference} to Supabase (ID: ${saved[0]?.id})`);
      }
    }

    return { statusCode: 200, body: 'Webhook processed' };

  } catch (err) {
    console.error('[Webhook] Unhandled error:', err.message);
    return { statusCode: 500, body: 'Webhook internal error' };
  }
};
