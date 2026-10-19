// ══════════════════════════════════════════════════════
// Tinu's Kitchen Bistro — Order Status Function
// Customers can check their order status by reference
// ══════════════════════════════════════════════════════

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const reference = event.queryStringParameters?.reference;
  if (!reference) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Reference required' }) };
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?reference=eq.${reference}&select=id,status,items,total_amount,delivery_type,paid_at,confirmed_at,ready_at,delivered_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const orders = await res.json();
    if (!orders.length) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ order: orders[0] })
    };

  } catch (err) {
    console.error('order-status error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
