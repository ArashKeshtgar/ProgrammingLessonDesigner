import { createHmac, timingSafeEqual } from 'node:crypto';
import express, { Router } from 'express';

const TOLERANCE_SECONDS = 300;

export class SignatureError extends Error {}

// #region verify
export function sign(secret: string, timestamp: number, body: Buffer): string {
  // Stripe-style: HMAC-SHA256 over "<timestamp>.<raw body>".
  return createHmac('sha256', secret).update(`${timestamp}.`).update(body).digest('hex');
}

export function verify(body: Buffer, header: string, secrets: string[], now: number): { id: string } {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=', 2) as [string, string]));
  const timestamp = Number(parts.t);
  if (!Number.isInteger(timestamp)) throw new SignatureError('No timestamp in the signature header.');
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) throw new SignatureError('Timestamp outside the tolerance (replayed?).');
  const given = Buffer.from(parts.v1 ?? '', 'hex');
  for (const secret of secrets) {
    const expected = Buffer.from(sign(secret, timestamp, body), 'hex');
    // timingSafeEqual takes the same time whatever matches; it throws on different lengths, so check first.
    if (given.length === expected.length && timingSafeEqual(given, expected)) return JSON.parse(body.toString('utf8'));
  }
  throw new SignatureError('No matching signature.');
}
// #endregion

// #region route
export function webhookRouter(
  secrets: string[],
  handle: (event: { id: string }) => Promise<void>,
  seen: Set<string>,
  clock = () => Date.now() / 1000,
): Router {
  const router = Router();
  // express.raw, not express.json: the raw bytes are what was signed. Mount before express.json().
  router.post('/webhooks/payments', express.raw({ type: 'application/json' }), async (req, res) => {
    let event: { id: string };
    try {
      event = verify(req.body as Buffer, req.header('stripe-signature') ?? '', secrets, clock());
    } catch (err) {
      return res.status(400).json({ error: `Signature verification failed: ${(err as Error).message}` });
    }
    // Providers retry: the same event can arrive twice. Handle it once.
    if (seen.has(event.id)) return res.json({ received: true, duplicate: true });
    await handle(event);
    seen.add(event.id);
    res.json({ received: true });
  });
  return router;
}
// #endregion
