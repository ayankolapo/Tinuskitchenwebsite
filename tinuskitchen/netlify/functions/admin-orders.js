const RAW_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tinus2026';
const ADMIN_PASSWORD = RAW_ADMIN_PASSWORD.trim().replace(/^['"]|['"]$/g, '');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

function getProvidedPassword(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim().replace(/^['"]|['"]$/g, '');
  const headerPass = (event.headers['x-admin-password'] || '').trim().replace(/^['"]|['"]$/g, '');
  const queryPass = (event.queryStringParameters?.password || '').trim().replace(/^['"]|['"]$/g, '');
  return token || headerPass || queryPass;
}

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const providedPass = getProvidedPassword(event);
  if (!providedPass || providedPass !== ADMIN_PASSWORD) {
    console.warn(`[Admin] Unauthorized access attempt from ${event.headers['client-ip'] || 'unknown IP'}`);
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Unauthorized: Invalid Admin Password' })
    };
  }

  // Handle lightweight login verification check
  if (event.httpMethod === 'POST') {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch (e) { }
    if (body.action === 'verify-login') {
      console.info('[Admin] Admin session authenticated successfully');
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, message: 'Admin verified successfully' })
      };
    }
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[Admin] Database configuration missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY unset');
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Database configuration missing. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      })
    };
  }

  const queryType = event.queryStringParameters?.type || 'orders';
  const queryAction = event.queryStringParameters?.action || '';

  try {
    // GET: List Orders or Delivery Zones
    if (event.httpMethod === 'GET') {
      if (queryType === 'zones') {
        console.info('[Admin] Fetching delivery zones');
        const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_zones?select=*&order=display_order.asc,created_at.asc`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error('[Admin] Failed to fetch delivery zones:', errText);
          return {
            statusCode: res.status,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Failed to fetch delivery zones', details: errText })
          };
        }

        const zones = await res.json();
        console.info(`[Admin] Successfully retrieved ${zones.length} delivery zones`);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, zones })
        };
      }

      console.info('[Admin] Fetching customer orders list');
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[Admin] Failed to fetch orders:', errText);
        return {
          statusCode: res.status,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Failed to fetch orders from database', details: errText })
        };
      }

      const orders = await res.json();
      console.info(`[Admin] Successfully retrieved ${orders.length} orders`);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, orders })
      };
    }

    // POST: Create Manual Walk-in Order or Add/Upsert Delivery Zone
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const action = body.action || queryAction;

      if (action === 'create-order') {
        const orderPayload = {
          reference: body.reference || `TKB-W-${Math.floor(1000 + Math.random() * 9000)}`,
          customer_name: body.customer_name || 'Walk-In Customer',
          customer_phone: body.customer_phone || body.phone || '08000000000',
          customer_email: body.customer_email || null,
          items: body.items || [{ name: 'Custom Counter Meal', quantity: 1, price: Number(body.total_amount) || 5000 }],
          total_amount: Number(body.total_amount) || Number(body.amount) || 5000,
          delivery_type: body.delivery_type || 'pickup',
          delivery_address: body.delivery_address || 'Walk-In Customer / Counter Pickup',
          location_zone: body.location_zone || 'Counter Pickup',
          delivery_fee: Number(body.delivery_fee) || 0,
          status: body.status || 'pending',
          payment_status: body.payment_status || 'paid',
          notes: body.notes || 'Walk-in order created from kitchen dashboard',
          paid_at: new Date().toISOString()
        };

        console.info(`[Admin] Creating manual walk-in order: ${orderPayload.reference} (Amount: ₦${orderPayload.total_amount})`);

        const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(orderPayload)
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[Admin] Failed to insert walk-in order ${orderPayload.reference}:`, errText);
          return {
            statusCode: res.status,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Failed to insert walk-in order into database', details: errText })
          };
        }

        const inserted = await res.json();
        console.info(`[Admin] Successfully created walk-in order ${orderPayload.reference}`);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, order: inserted[0] })
        };
      }

      if (action === 'save-zone') {
        const zonePayload = {
          name: body.name,
          time_estimate: body.time_estimate || body.time || '30 – 45 mins',
          fee: Number(body.fee) || 0,
          active: body.active !== undefined ? body.active : true,
          display_order: Number(body.display_order) || 1,
          updated_at: new Date().toISOString()
        };

        console.info(`[Admin] Saving delivery zone: "${zonePayload.name}" (Fee: ₦${zonePayload.fee})`);

        if (body.id && !body.id.startsWith('zone_temp_')) {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_zones?id=eq.${body.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(zonePayload)
          });
          const updated = await res.json();
          console.info(`[Admin] Updated existing zone ${body.id} ("${zonePayload.name}")`);
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, zone: updated[0] })
          };
        }

        const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_zones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(zonePayload)
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[Admin] Failed to create delivery zone "${zonePayload.name}":`, errText);
          return {
            statusCode: res.status,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Failed to create delivery zone', details: errText })
          };
        }

        const inserted = await res.json();
        console.info(`[Admin] Created new delivery zone: "${zonePayload.name}"`);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, zone: inserted[0] })
        };
      }

      console.warn(`[Admin] Unrecognized POST action: "${action}"`);
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Unknown action specified' })
      };
    }

    // PATCH: Update Order Status or Delivery Zone Parameters
    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const action = body.action || queryAction;

      if (action === 'update-zone' || queryType === 'zones') {
        const { id, fee, active, name, time_estimate } = body;
        if (!id) {
          console.warn('[Admin] Zone update failed: Missing ID');
          return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Zone ID required' }) };
        }

        const updatePayload = { updated_at: new Date().toISOString() };
        if (fee !== undefined) updatePayload.fee = Number(fee);
        if (active !== undefined) updatePayload.active = Boolean(active);
        if (name !== undefined) updatePayload.name = name;
        if (time_estimate !== undefined) updatePayload.time_estimate = time_estimate;

        console.info(`[Admin] Updating zone ${id}:`, updatePayload);

        const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_zones?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updatePayload)
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[Admin] Failed to update zone ${id}:`, errText);
          return {
            statusCode: res.status,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Failed to update zone in database', details: errText })
          };
        }

        const updated = await res.json();
        console.info(`[Admin] Zone ${id} successfully updated`);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, zone: updated[0] })
        };
      }

      const { id, reference, status, notes } = body;
      if (!id && !reference) {
        console.warn('[Admin] Order update failed: Missing order ID or reference');
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Order ID or reference is required' })
        };
      }

      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
      if (status && !validStatuses.includes(status)) {
        console.warn(`[Admin] Order update failed: Invalid status "${status}"`);
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
        };
      }

      const updatePayload = { updated_at: new Date().toISOString() };
      if (status) {
        updatePayload.status = status;
        const now = new Date().toISOString();
        if (status === 'confirmed') updatePayload.confirmed_at = now;
        if (status === 'ready') updatePayload.ready_at = now;
        if (status === 'delivered') updatePayload.delivered_at = now;
      }
      if (notes !== undefined) {
        updatePayload.notes = notes;
      }

      const targetId = (id || '').toString().trim();
      const rawRef = (reference || (!targetId.includes('-') || targetId.startsWith('TKB') ? targetId : '')).toString().trim();
      const targetRef = rawRef.replace(/[–—]/g, '-');
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

      let queryParam = '';
      if (isUUID) {
        queryParam = `id=eq.${targetId}`;
      } else if (targetRef) {
        queryParam = `reference=ilike.${encodeURIComponent(targetRef)}`;
      } else {
        queryParam = `reference=ilike.${encodeURIComponent(targetId.replace(/[–—]/g, '-'))}`;
      }

      console.info(`[Admin] Updating order (${queryParam}) status to "${status}"`);

      let res = await fetch(`${SUPABASE_URL}/rest/v1/orders?${queryParam}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updatePayload)
      });

      let updated = [];
      if (res.ok) {
        updated = await res.json();
      }

      // If updating by UUID returned empty but reference is available, try fallback by reference
      if ((!updated || updated.length === 0) && targetRef && queryParam !== `reference=ilike.${encodeURIComponent(targetRef)}`) {
        console.info(`[Admin] Retrying update via reference: ${targetRef}`);
        res = await fetch(`${SUPABASE_URL}/rest/v1/orders?reference=ilike.${encodeURIComponent(targetRef)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updatePayload)
        });
        if (res.ok) {
          updated = await res.json();
        }
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Admin] Failed to update order:`, errText);
        return {
          statusCode: res.status,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Failed to update order in database', details: errText })
        };
      }

      if (!updated || updated.length === 0) {
        console.warn(`[Admin] Order not found for update (${queryParam})`);
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Order not found in database' })
        };
      }

      console.info(`[Admin] Successfully updated order #${updated[0].reference || updated[0].id} to "${status}"`);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, order: updated[0] })
      };
    }

    // DELETE: Delete Delivery Zone
    if (event.httpMethod === 'DELETE') {
      const zoneId = event.queryStringParameters?.id;
      if (!zoneId) {
        console.warn('[Admin] Delete zone failed: Missing zone ID');
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Zone ID is required for deletion' })
        };
      }

      console.info(`[Admin] Deleting delivery zone ${zoneId}`);

      const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_zones?id=eq.${zoneId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Admin] Failed to delete delivery zone ${zoneId}:`, errText);
        return {
          statusCode: res.status,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Failed to delete delivery zone', details: errText })
        };
      }

      console.info(`[Admin] Successfully deleted delivery zone ${zoneId}`);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, message: 'Delivery zone deleted successfully' })
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (err) {
    console.error('[Admin] Unhandled exception:', err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error', details: err.message })
    };
  }
};
