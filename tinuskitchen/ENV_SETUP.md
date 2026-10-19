# Netlify Environment Variables Setup

Go to: Netlify Dashboard → Your Site → Site Settings → Environment Variables → Add Variable

Add these 3 variables:

| Key | Value |
|-----|-------|
| `PAYSTACK_SECRET_KEY` | `sk_live_...` (your Paystack secret key) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` (your project URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (your service role key from Supabase → Settings → API) |

Also update in js/script.js line 9:
`const PAYSTACK_PUBLIC_KEY = 'pk_live_REPLACE_WITH_YOUR_PUBLIC_KEY';`
Replace with your actual Paystack public key.

# Supabase Setup
Run the file `supabase-setup.sql` in your Supabase SQL editor:
Supabase Dashboard → SQL Editor → New Query → paste file → Run
