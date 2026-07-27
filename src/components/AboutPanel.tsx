'use client';

import { useEffect, useRef } from 'react';
import { useHubStore } from '@/store/hub';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useSwipeToClose } from '@/lib/useSwipeToClose';
import { about, identite } from '@/content/site';

export default function AboutPanel() {
  const mode = useHubStore((s) => s.mode);
  const setMode = useHubStore((s) => s.setMode);
  const isOpen = mode === 'about';
  const sectionRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useFocusTrap(sectionRef, isOpen);
  useSwipeToClose(sectionRef, isOpen, 'right', () => setMode('hub'));

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
      aria-labelledby="about-title"
      aria-hidden={!isOpen}
      style={{ backdropFilter: isOpen ? undefined : 'none' }}
      className={`absolute inset-y-0 right-0 z-25 w-full md:w-[560px] bg-ink/90 backdrop-blur-md border-l border-fog transition-all duration-700 ease-out ${
        isOpen
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Decorative vertical rail with section number */}
      <div className="hidden md:flex absolute inset-y-0 left-0 w-10 flex-col items-center justify-between py-10 pointer-events-none border-r border-fog/30">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/50 [writing-mode:vertical-rl] rotate-180">
          Section · About
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/40">
          01/04
        </span>
      </div>

      <div className="h-full overflow-y-auto px-6 md:px-14 md:pl-20 py-24 md:py-32">
        {/* ID CARD */}
        <div className="mb-10 md:mb-12">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-mist/70 pb-3 border-b border-fog/40">
            <span>{identite.nom}</span>
            <span className="text-magentaglitch">{about.reference}</span>
            <span>{about.lieuEtAnnee}</span>
          </div>
          <div className="flex items-center gap-3 pt-3 font-mono text-[9px] uppercase tracking-[0.3em] text-magentaglitch">
            <span className="h-px w-6 bg-magentaglitch" />
            About
            <span className="ml-auto text-mist/40">{about.version}</span>
          </div>
        </div>

        {/* HEADING */}
        <h2
          id="about-title"
          className="font-display text-5xl sm:text-6xl md:text-[5.25rem] leading-[0.92] tracking-tight mb-2"
        >
          {about.titreLigne1}
          <br />
          <span className="inline-flex items-baseline gap-3">
            <span className="text-chrome">{about.titreLigne2}</span>
            <span aria-hidden className="hidden sm:inline-block h-[1px] w-12 bg-fog translate-y-[-0.6em]" />
          </span>
          <br />
          <span className="italic text-pearl">{about.titreLigne3}</span>
        </h2>
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/50 mb-10 md:mb-14">
          {about.sousTitre}
        </div>

        {/* QUOTE — magazine block */}
        <figure className="relative mb-12 md:mb-16 pl-5 md:pl-6">
          <span
            aria-hidden
            className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-magentaglitch via-magentaglitch/60 to-transparent"
          />
          <span
            aria-hidden
            className="absolute -left-[3px] top-1 h-[2px] w-2 bg-magentaglitch"
          />
          <span
            aria-hidden
            className="absolute -left-[3px] bottom-1 h-[2px] w-2 bg-magentaglitch/40"
          />
          <blockquote className="font-display italic text-xl md:text-[1.7rem] text-pearl/95 leading-[1.25]">
            {about.citation}
          </blockquote>
          <figcaption className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-mist/60">
            {about.citationLegende}
          </figcaption>
        </figure>

        {/* APPROACH — numbered editorial blocks */}
        <div className="mb-14 md:mb-16">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyanglitch">
              ⎯ Approach
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/40">
              {String(about.approche.length).padStart(2, '0')} entrées
            </span>
          </div>
          <div className="divide-y divide-fog/40 border-y border-fog/40">
            {about.approche.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-[auto_1fr] gap-4 md:gap-6 py-5 md:py-6"
              >
                <div className="flex flex-col items-start min-w-[44px]">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-magentaglitch">
                    #{String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-mist/60">
                    {p.tag}
                  </span>
                </div>
                <p className="text-mist text-base leading-relaxed">{p.texte}</p>
              </div>
            ))}
          </div>
        </div>

        {/* INDEX — vertical colophon */}
        <div className="mb-14 md:mb-16">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyanglitch">
              ⎯ Index
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/40">
              {about.indexPeriode}
            </span>
          </div>
          <dl className="border-t border-fog/60">
            {about.index.map((s) => (
              <div
                key={s.idx}
                className="group flex items-baseline justify-between gap-6 py-5 border-b border-fog/40 transition-colors hover:bg-fog/5"
              >
                <dt className="flex items-baseline gap-4 min-w-0">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-magentaglitch">
                    {s.idx}
                  </span>
                  <span className="font-display text-5xl md:text-6xl text-chrome leading-none tabular-nums transition-colors group-hover:text-pearl">
                    {s.valeur}
                  </span>
                </dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist text-right whitespace-pre-line leading-relaxed">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* CLIENTS — editorial table */}
        <div className="mb-14 md:mb-16">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyanglitch">
              ⎯ Clients & studios
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/40">
              Sélection
            </span>
          </div>
          <ul className="border-t border-fog/60">
            {about.clients.map((c, i) => (
              <li
                key={c}
                className="group flex items-baseline gap-4 border-b border-fog/40 py-3 md:py-4"
              >
                <span className="font-mono text-[9px] tracking-[0.3em] text-mist/50 tabular-nums w-7">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-2xl md:text-3xl text-pearl tracking-tight">
                  {c}
                </span>
                <span
                  aria-hidden
                  className="flex-1 mx-2 border-b border-dotted border-fog/50 translate-y-[-0.35em]"
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/50">
                  {about.clientsMention}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-16 md:mt-20 pt-8 border-t border-fog/60">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/50 mb-4">
            ⎯ Prochaine étape
          </div>
          <button
            type="button"
            onClick={() => setMode('contact')}
            className="group w-full flex items-center justify-between gap-6 border border-fog hover:border-cyanglitch px-5 md:px-6 py-5 md:py-6 transition-colors"
          >
            <span className="flex flex-col items-start text-left">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyanglitch mb-1">
                {about.ctaSurtitre}
              </span>
              <span className="font-display italic text-2xl md:text-3xl text-chrome group-hover:text-cyanglitch transition-colors">
                {about.ctaTexte}
              </span>
            </span>
            <span className="font-mono text-2xl text-chrome group-hover:text-cyanglitch transition-all group-hover:translate-x-1">
              →
            </span>
          </button>

          {/* Footer slug */}
          <div className="mt-10 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-mist/40">
            <span>END · About</span>
            <span aria-hidden>— · — · —</span>
            <span>01 / 04</span>
          </div>
        </div>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={() => setMode('hub')}
        aria-label="Fermer"
        className="absolute top-6 right-6 md:top-10 md:right-10 h-11 w-11 flex items-center justify-center border border-fog rounded-full text-chrome hover:border-magentaglitch hover:text-magentaglitch transition-colors"
      >
        <span className="font-mono text-sm">×</span>
      </button>
    </section>
  );
}
