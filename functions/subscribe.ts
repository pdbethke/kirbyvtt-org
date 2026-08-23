// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
//
// Cloudflare Pages Function backing the notify form's POST /subscribe.
//
// Order of operations, deliberately in this sequence:
//   1. Honeypot check — free, and catches naive bots before a Turnstile
//      challenge is even asked for.
//   2. Turnstile verification — fails closed: a missing token, a failed
//      verification, or a network error while calling siteverify all
//      reject the submission. Nobody gets through on a token nobody
//      checked.
//   3. Write to D1 (store of record) — an INSERT ... ON CONFLICT DO NOTHING
//      into the pre-provisioned `signups` table.
//   4. Forwarding to a mailing-list provider — NOT YET WIRED, additive on
//      top of the D1 write, not a replacement for it. See the single
//      marked block below.
//
// This function only runs under a real Cloudflare Pages deployment (or
// `wrangler pages dev`). `astro preview`, and therefore the e2e suite that
// runs against it, does not execute Pages Functions and doesn't bind D1 —
// see tests/subscribe-wiring.spec.ts for what is and isn't covered
// statically, and the report for what's only exercised in a real deploy.

interface D1Result {
  success: boolean;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  TURNSTILE_SECRET_KEY: string;
  SIGNUPS: D1Database;
  // Set this once a mailing-list provider is chosen. Its absence is what
  // currently keeps forwarding disabled — see the block below. D1 is the
  // store of record regardless of whether this is set.
  LIST_ENDPOINT?: string;
}

interface CfProperties {
  country?: string;
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** A 200 that looks like success to a bot that filled the honeypot, without
 * telling it anything was detected. Does no work beyond returning it. */
function silentNoOpSuccess(): Response {
  return jsonResponse(200, { ok: true });
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse(400, { ok: false, error: 'invalid form submission' });
  }

  // 1. Honeypot first. A filled "website" field never gets a real answer.
  const honeypot = form.get('website');
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return silentNoOpSuccess();
  }

  // 2. Turnstile verification. Fail closed on every branch.
  const token = form.get('cf-turnstile-response');
  if (typeof token !== 'string' || token.trim() === '') {
    return jsonResponse(400, { ok: false, error: 'verification required' });
  }

  const verifyBody = new URLSearchParams();
  verifyBody.set('secret', env.TURNSTILE_SECRET_KEY);
  verifyBody.set('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) verifyBody.set('remoteip', ip);

  let verified = false;
  try {
    const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: verifyBody,
    });
    // A non-2xx from siteverify is treated the same as a failed challenge —
    // fail closed rather than assume success.
    if (verifyResponse.ok) {
      const result = (await verifyResponse.json()) as { success?: boolean };
      verified = result.success === true;
    }
  } catch {
    // Network error talking to Cloudflare's own verification endpoint:
    // fail closed. Never surface the raw error or response to the client.
    verified = false;
  }

  if (!verified) {
    return jsonResponse(403, { ok: false, error: 'verification failed' });
  }

  const email = form.get('email');
  if (typeof email !== 'string' || email.trim() === '') {
    return jsonResponse(400, { ok: false, error: 'email required' });
  }

  // 3. Write to D1 — the store of record. A duplicate email is still a
  // success to the caller (ON CONFLICT DO NOTHING): telling someone "you're
  // already signed up" is an account-enumeration tell, and it's just rude.
  // A genuine D1 failure, unlike a duplicate, must NOT report success — a
  // form that says "done" while silently dropping the address is exactly
  // the failure this table exists to prevent.
  const userAgent = request.headers.get('User-Agent');
  const cf = (request as Request & { cf?: CfProperties }).cf;
  const country = cf?.country ?? request.headers.get('CF-IPCountry');

  try {
    const result = await env.SIGNUPS.prepare(
      `INSERT INTO signups (email, source, user_agent, country)
       VALUES (?, 'kirbyvtt.org', ?, ?)
       ON CONFLICT(email) DO NOTHING`
    )
      .bind(email, userAgent, country)
      .run();
    if (!result.success) {
      // Never log the email address itself — only that a write failed.
      console.error('subscribe: D1 insert reported failure');
      return jsonResponse(500, { ok: false, error: 'could not save signup' });
    }
  } catch {
    console.error('subscribe: D1 insert threw');
    return jsonResponse(500, { ok: false, error: 'could not save signup' });
  }

  // 4. Forwarding to a mailing-list provider.
  //
  // THIS IS THE SINGLE PLACE TO WIRE ONE IN. There is no provider chosen
  // yet, so this block is guarded on LIST_ENDPOINT being present in the
  // environment. D1 (above) is already the durable store of record — this
  // is additive, not a replacement for it, for whenever a provider is
  // chosen. When that happens: set LIST_ENDPOINT (and whatever auth it
  // needs) as a Pages env var, and replace this block with the real
  // forwarding call.
  if (env.LIST_ENDPOINT) {
    try {
      await fetch(env.LIST_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Forwarding failure shouldn't unwind a verified, saved submission
      // into an error the visitor sees as their fault — it's already
      // durably in D1.
    }
  }

  return jsonResponse(200, { ok: true });
};
