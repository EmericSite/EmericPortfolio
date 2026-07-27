import { NextResponse } from 'next/server';

// Envoi du formulaire de contact par mail, via l'API HTTP de Resend (appel
// direct en fetch : pas de SDK à installer pour une seule requête).
//
// Variables d'environnement attendues (cf. .env.example) :
//   RESEND_API_KEY      clé API Resend
//   CONTACT_TO_EMAIL    destinataire réel des messages
//   CONTACT_FROM_EMAIL  expéditeur, doit appartenir à un domaine vérifié
//                       chez Resend (sinon onboarding@resend.dev en test)
export const runtime = 'nodejs';

// Surchargeable pour pointer un serveur factice en test local.
const RESEND_ENDPOINT =
  process.env.RESEND_API_URL ?? 'https://api.resend.com/emails';

const MAX_LENGTHS = { name: 120, email: 200, message: 5000 } as const;

// Limite de débit en mémoire. L'instance étant réutilisée entre requêtes sur
// Vercel, cela freine les envois répétés depuis une même adresse. Ce n'est pas
// une protection absolue, juste un garde-fou contre le spam basique.
const RATE_WINDOW_MS = 10 * 60 * 1000; // fenêtre glissante
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
  // Purge opportuniste pour que la Map ne grossisse pas indéfiniment.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

// Un saut de ligne dans un en-tête permettrait d'en injecter d'autres.
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
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;

  // Honeypot : un vrai visiteur ne remplit jamais ce champ, il est masqué.
  // On répond 200 pour ne pas renseigner le robot sur la détection.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Merci de remplir le nom, l’email et le message.' },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: 'Cette adresse email ne semble pas valide.' },
      { status: 400 },
    );
  }
  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    message.length > MAX_LENGTHS.message
  ) {
    return NextResponse.json({ error: 'Message trop long.' }, { status: 400 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnu';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de messages envoyés. Réessaie dans quelques minutes.' },
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
      { error: "L'envoi est momentanément indisponible." },
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
        // Répondre au message écrit directement au visiteur.
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
        { error: "Le message n'a pas pu être envoyé." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error('[contact] Échec de l’appel à Resend', err);
    return NextResponse.json(
      { error: "Le message n'a pas pu être envoyé." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
