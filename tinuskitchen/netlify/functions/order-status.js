const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    console.warn(`[OrderStatus] Method not allowed: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const rawRef = (event.queryStringParameters?.reference || event.queryStringParameters?.ref || '').trim();
  const cleanRef = rawRef.replace(/^#/, '').replace(/[–—]/g, '-').trim();

  if (!cleanRef) {
    console.warn('[OrderStatus] Missing reference parameter in request');
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Reference required' })
    };
  }

  console.info(`[OrderStatus] Querying status for reference: ${cleanRef}`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[OrderStatus] Supabase credentials unconfigured in environment');
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Database unconfigured' })
    };
  }

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanRef);
    const filterQuery = isUUID ? `id=eq.${cleanRef}` : `reference=ilike.${encodeURIComponent(cleanRef)}`;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?${filterQuery}&select=id,reference,status,items,total_amount,delivery_type,delivery_address,location_zone,delivery_fee,customer_name,customer_phone,customer_email,notes,paid_at,confirmed_at,ready_at,delivered_at,created_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[OrderStatus] Supabase query failed for ${cleanRef}:`, errText);
      return {
        statusCode: res.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Failed to retrieve order status' })
      };
    }

    const orders = await res.json();
    if (!orders || orders.length === 0) {
      console.warn(`[OrderStatus] No order found matching reference: ${reference}`);
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    const order = orders[0];
    console.info(`[OrderStatus] Order found: ${order.reference} (Status: ${order.status}, Customer: ${order.customer_name})`);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, order })
    };
  } catch (err) {
    console.error(`[OrderStatus] Internal server error for ${reference}:`, err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error', details: err.message })
    };
  }
};
