'use client';

import { useEffect, useRef } from 'react';
import { useHubStore } from '@/store/hub';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useSwipeToClose } from '@/lib/useSwipeToClose';

const STATS = [
  { value: '04', label: 'Projets phares\n2024 — 2026' },
  { value: '02', label: 'Registres\nGaming · Poétique' },
  { value: '01', label: 'Studio\nParis' },
];

const APPROACH = [
  'Je construis des images qui ne s\'oublient pas. Chaque pièce part d\'une atmosphère, d\'un grain, d\'une intuition narrative — la 3D n\'est qu\'un moyen.',
  'Je travaille en direction artistique sur le motion : composition, lumière, rythme, sound design. La technique sert le sentiment, jamais l\'inverse.',
];

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
      aria-labelledby="about-title"
      aria-hidden={!isOpen}
      style={{ backdropFilter: isOpen ? undefined : 'none' }}
      className={`absolute inset-y-0 right-0 z-25 w-full md:w-[560px] bg-ink/90 backdrop-blur-md border-l border-fog transition-all duration-700 ease-out ${
        isOpen
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-full overflow-y-auto px-8 md:px-14 py-28 md:py-32">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-magentaglitch mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-magentaglitch" />
          About
        </div>

        <h2
          id="about-title"
          className="font-display text-5xl md:text-6xl leading-[0.95] mb-10"
        >
          Motion Designer,
          <br />
          <span className="italic text-pearl">based in Paris.</span>
        </h2>

        <p className="font-display italic text-2xl text-pearl/90 leading-snug mb-10">
          « Through motion design, I explore narrative, atmosphere, and visual
          identity to create striking and memorable imagery. »
        </p>

        <div className="space-y-5 text-mist text-base leading-relaxed mb-12">
          {APPROACH.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-px bg-fog/40 border border-fog/40 mb-12">
          {STATS.map((s) => (
            <div key={s.value} className="bg-ink p-5">
              <div className="font-display text-4xl text-pearl mb-2">
                {s.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist whitespace-pre-line leading-relaxed">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyanglitch">
            Clients & studios
          </div>
          <div className="flex flex-wrap gap-2">
            {['Ankama', 'Gentle Mates', 'HoYoverse'].map((c) => (
              <span
                key={c}
                className="border border-fog rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMode('contact')}
          className="group inline-flex items-center gap-3 border border-fog rounded-full px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-chrome hover:border-cyanglitch hover:text-cyanglitch transition-colors"
        >
          Discuter d&rsquo;un projet
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={() => setMode('hub')}
        aria-label="Fermer"
        className="absolute top-6 right-6 md:top-10 md:right-10 h-10 w-10 flex items-center justify-center border border-fog rounded-full text-chrome hover:border-magentaglitch hover:text-magentaglitch transition-colors"
      >
        <span className="font-mono text-sm">×</span>
      </button>
    </section>
  );
}
