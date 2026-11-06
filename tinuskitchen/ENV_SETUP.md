# Tinu's Kitchen Bistro — Backend & Environment Setup

## 1. Netlify Environment Variables
In your Netlify Dashboard:
**Site Settings → Environment Variables → Add Variable**

| Key | Example Value | Description |
|-----|---------------|-------------|
| `PAYSTACK_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Paystack secret key (never exposed to browser) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service role key (Project Settings → API) |
| `ADMIN_PASSWORD` | `your_custom_password` | Passkey used to log into `/admin.html` |

For local testing with `npx netlify dev`:
Copy `.env.example` in the project root to `.env` and fill in your keys.

---

## 2. Supabase Database Setup
Open your **Supabase Dashboard → SQL Editor → New Query**, paste the entire content of [`tinuskitchen/supabase-setup.sql`](./supabase-setup.sql), and click **Run**.

This script sets up:
1. **`orders` table**: Reference, customer details, items, amounts, statuses, delivery zones, and timestamps.
2. **`delivery_zones` table**: Name, time estimates, delivery fee rates, active switches, and display order. Pre-populated with default Lagos delivery zones.
3. **Row-Level Security (RLS)**: Public select access for customer tracking & checkout calculation; secure write/update access restricted to the backend service role key.
4. **Indexes**: High-speed lookup indexes on `reference`, `status`, and `created_at`.
5. **Realtime Replication**: Optional realtime publication on `orders` for live kitchen boards.

---

## 3. Storefront Paystack Public Key
When you are ready to switch from testing to live payments, update line 1330 in [`tinuskitchen/js/script.js`](./js/script.js):
```javascript
const PAYSTACK_PUBLIC_KEY = 'pk_live_YOUR_LIVE_KEY_HERE';
```
*(During testing, the default test key `pk_test_...` is already configured)*

---

## 4. Paystack Webhook Configuration
Once your site is deployed to Netlify (e.g. `https://your-site-name.netlify.app`):
1. Go to your **Paystack Dashboard → Settings → API Keys & Webhooks**.
2. Set the **Webhook URL** to:
   ```text
   https://your-site-name.netlify.app/.netlify/functions/paystack-webhook
   ```
3. Click **Save Changes**. This ensures instant order recording even if the customer accidentally closes their browser tab right after payment.
