// ══════════════════════════════════════════════════════
// Tinu's Kitchen Bistro — Payment Verification Function
// Runs securely on Netlify server — keys never exposed
// ══════════════════════════════════════════════════════

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { reference, orderData } = JSON.parse(event.body);

    // 1. Verify payment with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });
    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Payment verification failed' })
      };
    }

    // 2. Save order to Supabase
    const orderPayload = {
      reference,
      customer_name:  orderData.customerName,
      customer_phone: orderData.customerPhone,
      customer_email: orderData.customerEmail,
      items:          orderData.items,
      total_amount:   paystackData.data.amount / 100, // Paystack uses kobo
      delivery_type:  orderData.deliveryType,
      delivery_address: orderData.deliveryAddress || null,
      status:         'pending',
      paid_at:        new Date().toISOString(),
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

    const savedOrder = await supabaseRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        orderId: savedOrder[0]?.id,
        reference
      })
    };

  } catch (err) {
    console.error('verify-payment error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
