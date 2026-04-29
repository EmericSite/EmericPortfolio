'use client';

import { useEffect, useRef } from 'react';
import { useHubStore } from '@/store/hub';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useSwipeToClose } from '@/lib/useSwipeToClose';

const EMAIL = 'hello@emericressy.com';

const SOCIALS = [
  {
    label: 'Instagram',
    handle: '@fumir._o',
    href: 'https://www.instagram.com/fumir._o/?hl=fr',
  },
  { label: 'X', handle: '@fumir_o', href: 'https://x.com/fumir_o' },
  {
    label: 'LinkedIn',
    handle: 'emeric-ressy',
    href: 'https://www.linkedin.com/in/emeric-ressy-a05b0a194/',
  },
];

export default function ContactPanel() {
  const mode = useHubStore((s) => s.mode);
  const setMode = useHubStore((s) => s.setMode);
  const isOpen = mode === 'contact';
  const sectionRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useFocusTrap(sectionRef, isOpen);
  useSwipeToClose(sectionRef, isOpen, 'left', () => setMode('hub'));

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => {
        closeButtonRef.current?.focus();
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
      className={`absolute inset-y-0 left-0 z-25 w-full md:w-[560px] bg-ink/90 backdrop-blur-md border-r border-fog transition-all duration-700 ease-out ${
        isOpen
          ? 'translate-x-0 opacity-100'
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-full overflow-y-auto px-8 md:px-14 py-28 md:py-32">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyanglitch mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-cyanglitch" />
          Contact
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist mb-4 inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyanglitch animate-pulse" />
          Disponible · 2026
        </div>

        <h2
          id="contact-title"
          className="font-display text-5xl md:text-6xl leading-[0.95] mb-10"
        >
          Parlons d&rsquo;un
          <br />
          <span className="italic text-pearl">projet.</span>
        </h2>

        <p className="text-mist text-base leading-relaxed mb-10 max-w-md">
          Direction artistique, motion 3D, identité visuelle. Pour les briefs
          gaming/esport, anime, ou les pièces plus narratives — écris-moi
          directement.
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

        <div className="space-y-px bg-fog/40 border border-fog/40 mb-10">
          {SOCIALS.map((s) => (
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
          Paris · UTC+1
        </div>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={() => setMode('hub')}
        aria-label="Fermer"
        className="absolute top-6 right-6 md:top-10 md:right-10 h-10 w-10 flex items-center justify-center border border-fog rounded-full text-chrome hover:border-cyanglitch hover:text-cyanglitch transition-colors"
      >
        <span className="font-mono text-sm">×</span>
      </button>
    </section>
  );
}
