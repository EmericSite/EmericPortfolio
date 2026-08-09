// Emericfolio — created by Tomi-Tom, 2026
// Receives what a visitor writes in the contact form and mails it to Emeric

// Sent through Resend's HTTP API directly: one request is not worth an SDK.
// Needs RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL, see .env.example.

import { NextResponse } from 'next/server';
import { formulaire } from '@/content/site';

export const runtime = 'nodejs';

// Overridable to send through another Resend-compatible endpoint.
const RESEND_ENDPOINT =
  process.env.RESEND_API_URL ?? 'https://api.resend.com/emails';

const MAX_LENGTHS = { name: 120, email: 200, message: 5000 } as const;

// In-memory rate limit. The instance is reused between requests on Vercel, so it
// slows down repeat senders. A basic spam guard, not real protection.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Opportunistic purge so the Map does not grow forever.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

// A newline inside a header would let other headers be injected.
const sanitizeHeader = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: formulaire.erreurRequete }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;

  // Honeypot: the field is hidden, a real visitor never fills it. Answer 200 so
  // the bot learns nothing about the detection.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: formulaire.erreurChampsManquants },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: formulaire.erreurEmailInvalide },
      { status: 400 },
    );
  }
  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    message.length > MAX_LENGTHS.message
  ) {
    return NextResponse.json({ error: formulaire.erreurMessageLong }, { status: 400 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnu';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: formulaire.erreurTropDeMessages },
      { status: 429 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error(
      '[contact] Configuration manquante : RESEND_API_KEY, CONTACT_TO_EMAIL et CONTACT_FROM_EMAIL doivent être définies.',
    );
    return NextResponse.json(
      { error: formulaire.erreurIndisponible },
      { status: 500 },
    );
  }

  const safeName = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        // A reply goes straight to the visitor.
        reply_to: safeEmail,
        subject: `Portfolio — message de ${safeName}`,
        text: `Nom: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<p><strong>Nom :</strong> ${escapeHtml(name)}<br>
<strong>Email :</strong> ${escapeHtml(email)}</p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    });

    if (!res.ok) {
      console.error('[contact] Resend a répondu', res.status, await res.text());
      return NextResponse.json(
        { error: formulaire.erreurEnvoi },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error('[contact] Échec de l’appel à Resend', err);
    return NextResponse.json(
      { error: formulaire.erreurEnvoi },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
