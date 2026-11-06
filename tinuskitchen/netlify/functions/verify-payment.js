const PAYSTACK_SECRET = (process.env.PAYSTACK_SECRET_KEY || '').trim().replace(/^['"]|['"]$/g, '');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    console.warn(`[Verify] Rejected method: ${event.httpMethod}`);
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!PAYSTACK_SECRET) {
    console.error('[Verify] Missing PAYSTACK_SECRET_KEY environment variable in Netlify');
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Server payment configuration error: PAYSTACK_SECRET_KEY is not set.' })
    };
  }

  try {
    const { reference, orderData } = JSON.parse(event.body || '{}');

    if (!reference) {
      console.warn('[Verify] Rejected request: Missing reference');
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Transaction reference is required' }) };
    }

    console.info(`[Verify] Verifying payment with Paystack | Ref: ${reference}`);

    // 1. Verify transaction with Paystack API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { 
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data?.status !== 'success') {
      const reason = paystackData.data?.gateway_response || paystackData.message || 'Payment not successful';
      console.warn(`[Verify] Paystack rejected ${reference}: ${reason}`);
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          error: 'Payment verification failed: Transaction not approved by bank.',
          gateway_response: reason
        })
      };
    }

    const verifiedAmount = (paystackData.data.amount || 0) / 100;
    const expectedAmount = Number(orderData?.total) || 0;

    console.info(`[Verify] Paystack confirmed success | Ref: ${reference} | Paid: ₦${verifiedAmount.toLocaleString()} | Channel: ${paystackData.data?.channel || 'card'}`);

    // Fraud check: Paid amount must cover the order total
    if (expectedAmount > 0 && verifiedAmount < (expectedAmount - 1)) {
      console.error(`[Verify] Security alert: Amount mismatch on ${reference} (Paid ₦${verifiedAmount}, Expected ₦${expectedAmount})`);
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Security warning: Paid amount does not match expected order total.' })
      };
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('[Verify] Supabase unconfigured in environment; order verified without cloud DB persistence');
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          reference,
          verifiedAmount,
          message: 'Payment verified with Paystack.'
        })
      };
    }

    // Check for duplicate insert (idempotency)
    const existingRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}&select=id,reference`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (existingRes.ok) {
      const existing = await existingRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        console.info(`[Verify] Order ${reference} already recorded in Supabase (ID: ${existing[0].id}); returning existing`);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            orderId: existing[0].id,
            reference,
            duplicate: true,
            message: 'Order was already recorded.'
          })
        };
      }
    }

    // Insert verified order into Supabase
    const orderPayload = {
      reference,
      customer_name: orderData?.customerName || paystackData.data?.customer?.first_name || 'Guest Diner',
      customer_phone: orderData?.customerPhone || paystackData.data?.customer?.phone || '08000000000',
      customer_email: orderData?.customerEmail || paystackData.data?.customer?.email || null,
      items: orderData?.items || [],
      total_amount: verifiedAmount,
      delivery_type: orderData?.deliveryType || 'delivery',
      delivery_address: orderData?.deliveryAddress || null,
      location_zone: orderData?.locationZone || (orderData?.deliveryType === 'pickup' ? 'Counter Pickup' : 'Local Delivery'),
      delivery_fee: Number(orderData?.deliveryFee) || 0,
      notes: orderData?.notes || null,
      status: 'pending',
      payment_status: 'paid',
      paid_at: paystackData.data?.paid_at || new Date().toISOString()
    };

    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(orderPayload)
    });

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error(`[Verify] Supabase insert failed for ${reference}:`, errText);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Database record creation failed', details: errText })
      };
    }

    const savedOrder = await supabaseRes.json();
    const orderId = savedOrder[0]?.id;

    console.info(`[Verify] Successfully saved order ${reference} to Supabase (Order ID: ${orderId})`);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        orderId,
        reference,
        amount: verifiedAmount,
        paid_at: orderPayload.paid_at
      })
    };

  } catch (err) {
    console.error('[Verify] Internal error during verification:', err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error', details: err.message })
    };
  }
};
