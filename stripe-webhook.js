// api/stripe-webhook.js — receives Stripe events, writes to KV
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kv(cmd) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const r = await fetch(KV_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmd)
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.result;
  } catch (_) { return null; }
}

// Read raw body from the request stream (body parser disabled below)
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (_) {
    return res.status(400).json({ error: 'Cannot read body' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(401).json({ error: `Signature verification failed: ${err.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const data = {
        paid: true,
        refunded: false,
        email: s.customer_details?.email || null,
        amount: s.amount_total || 0,
        currency: s.currency || 'cad',
        plan: (s.amount_total || 0) >= 1500 ? 'pro' : 'starter',
        payment_intent: s.payment_intent || null,
        paid_at: Date.now()
      };
      await kv(['SET', `sess:${s.id}`, JSON.stringify(data), 'EX', 60 * 60 * 24 * 30]); // 30 days
      // Cross-reference: payment_intent -> session_id (so refund webhook can find it)
      if (s.payment_intent) {
        await kv(['SET', `pi:${s.payment_intent}`, s.id, 'EX', 60 * 60 * 24 * 30]);
      }
      // Append to a log list (for later analytics)
      await kv(['LPUSH', 'log:paid', `${Date.now()}|${s.id}|${s.amount_total}|${data.email || ''}`]);
      console.log(`PAID: ${s.id} ${s.amount_total} ${data.email || 'no-email'}`);
    }

    if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created') {
      const charge = event.data.object;
      const pi = charge.payment_intent;
      let sessionId = await kv(['GET', `pi:${pi}`]);

      // Fallback: query Stripe if we don't have the cross-reference
      if (!sessionId && pi) {
        const lookupRes = await fetch(`https://api.stripe.com/v1/checkout/sessions?payment_intent=${pi}`, {
          headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` }
        });
        if (lookupRes.ok) {
          const lookup = await lookupRes.json();
          sessionId = lookup.data?.[0]?.id;
        }
      }

      if (sessionId) {
        const existing = await kv(['GET', `sess:${sessionId}`]);
        const data = existing ? JSON.parse(existing) : { paid: true };
        data.refunded = true;
        data.refunded_at = Date.now();
        data.refund_reason = event.type === 'charge.dispute.created' ? 'dispute' : 'refund';
        await kv(['SET', `sess:${sessionId}`, JSON.stringify(data), 'EX', 60 * 60 * 24 * 30]);
        await kv(['LPUSH', 'log:refunded', `${Date.now()}|${sessionId}|${data.refund_reason}`]);
        console.log(`REFUNDED/DISPUTED: ${sessionId} reason=${data.refund_reason}`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('Webhook handler error:', e.message);
    // Return 200 so Stripe doesn't retry indefinitely (we'll see the log and fix)
    return res.status(200).json({ received: true, warning: e.message });
  }
};

// Tell Vercel to NOT parse the body — we need raw bytes for Stripe signature verification
module.exports.config = {
  api: { bodyParser: false }
};
