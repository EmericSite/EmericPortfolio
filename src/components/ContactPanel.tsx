'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useHubStore } from '@/store/hub';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useSwipeToClose } from '@/lib/useSwipeToClose';
import { contact } from '@/content/site';

const EMAIL = contact.email;

export default function ContactPanel() {
  const mode = useHubStore((s) => s.mode);
  const setMode = useHubStore((s) => s.setMode);
  const isOpen = mode === 'contact';
  const sectionRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  // Champ piège pour les robots : masqué, jamais rempli par un visiteur.
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusTrap(sectionRef, isOpen);
  useSwipeToClose(sectionRef, isOpen, 'left', () => setMode('hub'));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Le message n'a pas pu être envoyé.");
        return;
      }

      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
      window.setTimeout(() => setSent(false), 6000);
    } catch {
      setError('Connexion impossible. Réessaie ou écris-moi directement.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => {
        closeButtonRef.current?.focus({ preventScroll: true });
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  return (
    <section
      ref={sectionRef}
      role="dialog"
      aria-modal={isOpen}
      aria-labelledby="contact-title"
      aria-hidden={!isOpen}
      style={{ backdropFilter: isOpen ? undefined : 'none' }}
      className={`absolute inset-y-0 left-0 z-25 w-full md:w-[560px] bg-ink/90 backdrop-blur-md border-r border-fog transition-all duration-700 ease-out ${
        isOpen
          ? 'translate-x-0 opacity-100'
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-full overflow-y-auto px-6 md:px-14 py-24 md:py-32">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyanglitch mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-cyanglitch" />
          Contact
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist mb-4 inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyanglitch animate-pulse" />
          {contact.disponibilite}
        </div>

        <h2
          id="contact-title"
          className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95] mb-8 md:mb-10"
        >
          {contact.titreLigne1}
          <br />
          <span className="italic text-pearl">{contact.titreLigne2}</span>
        </h2>

        <p className="text-mist text-base leading-relaxed mb-10 max-w-md">
          {contact.accroche}
        </p>

        <a
          href={`mailto:${EMAIL}`}
          className="block group border border-fog rounded-sm p-5 mb-3 hover:border-cyanglitch transition-colors"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist mb-2">
            Email
          </div>
          <div className="font-display text-2xl md:text-3xl text-pearl group-hover:text-cyanglitch transition-colors">
            {EMAIL}
          </div>
        </a>

        <form
          onSubmit={handleSubmit}
          noValidate={false}
          className="border border-fog rounded-sm p-5 mb-10 space-y-5"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyanglitch" />
            {contact.formulaireIntro}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-name"
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist inline-flex items-center gap-2"
            >
              <span className="h-1 w-1 rounded-full bg-cyanglitch" />
              Nom
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={sending}
              autoComplete="name"
              className="block w-full bg-ink/40 border border-fog rounded-sm px-4 py-3 font-mono text-sm text-pearl placeholder:text-mist/50 focus:outline-none focus:border-cyanglitch focus:ring-1 focus:ring-cyanglitch transition-colors disabled:opacity-50"
              placeholder="Ton nom"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-email"
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist inline-flex items-center gap-2"
            >
              <span className="h-1 w-1 rounded-full bg-cyanglitch" />
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
              autoComplete="email"
              className="block w-full bg-ink/40 border border-fog rounded-sm px-4 py-3 font-mono text-sm text-pearl placeholder:text-mist/50 focus:outline-none focus:border-cyanglitch focus:ring-1 focus:ring-cyanglitch transition-colors disabled:opacity-50"
              placeholder="toi@exemple.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-message"
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist inline-flex items-center gap-2"
            >
              <span className="h-1 w-1 rounded-full bg-cyanglitch" />
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              className="block w-full bg-ink/40 border border-fog rounded-sm px-4 py-3 font-mono text-sm text-pearl placeholder:text-mist/50 focus:outline-none focus:border-cyanglitch focus:ring-1 focus:ring-cyanglitch transition-colors disabled:opacity-50 resize-none"
              placeholder="Parle-moi de ton projet…"
            />
          </div>

          {/* Honeypot : hors flux visuel mais pas display:none, que les robots
              qui remplissent tout le formulaire tombent dedans. */}
          <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor="contact-website">Site web</label>
            <input
              id="contact-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            {sent ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyanglitch animate-pulse" />
                Envoyé. Merci.
              </span>
            ) : error ? (
              <span
                role="alert"
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-magentaglitch inline-flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-magentaglitch" />
                {error}
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={sending}
              className="group inline-flex items-center gap-3 border border-fog rounded-full px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-chrome hover:border-cyanglitch hover:text-cyanglitch transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Envoi…' : 'Envoyer'}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </form>

        <div className="space-y-px bg-fog/40 border border-fog/40 mb-10">
          {contact.reseaux.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between bg-ink p-5 hover:bg-fog/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist w-20">
                  {s.label}
                </span>
                <span className="font-display text-xl text-chrome group-hover:text-cyanglitch transition-colors">
                  {s.handle}
                </span>
              </div>
              <span className="font-mono text-xs text-mist/60 group-hover:text-cyanglitch transition-all group-hover:translate-x-1">
                ↗
              </span>
            </a>
          ))}
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist/60">
          {contact.fuseau}
        </div>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={() => setMode('hub')}
        aria-label="Fermer"
        className="absolute top-6 right-6 md:top-10 md:right-10 h-11 w-11 flex items-center justify-center border border-fog rounded-full text-chrome hover:border-cyanglitch hover:text-cyanglitch transition-colors"
      >
        <span className="font-mono text-sm">×</span>
      </button>
    </section>
  );
}
