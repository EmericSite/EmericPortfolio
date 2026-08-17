// Emericfolio — created by Tomi-Tom, 2026
// Top bar with the logo; switches the hub between work, about and contact
'use client';

import { memo } from 'react';
import Image from 'next/image';
import { useHubStore, type HubMode } from '@/store/hub';
import { identite, navigation } from '@/content/site';

const NAV_ITEMS: readonly { label: string; mode: HubMode }[] = navigation;

function NavBar() {
  const mode = useHubStore((s) => s.mode);
  const setMode = useHubStore((s) => s.setMode);

  if (mode === 'project') return null;

  const activeNav: HubMode = mode === 'hover' ? 'hub' : mode;

  return (
    <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 md:px-12 md:py-8 pointer-events-none">
      <button
        type="button"
        onClick={() => setMode('hub')}
        className="pointer-events-auto flex items-center gap-3 group"
      >
        <div className="relative h-10 w-10 md:h-10 md:w-10 transition-transform group-hover:rotate-12">
          <Image
            src="/logo-mark.png"
            alt={identite.nom}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 40px, 56px"
            priority
          />
        </div>
        <div className="text-left font-mono text-[10px] sm:text-xs uppercase tracking-[0.18em] text-mist">
          {identite.nom}
          <br className="hidden sm:inline" />
          <span className="hidden sm:inline text-chrome/50">
            {identite.metier}
          </span>
        </div>
      </button>

      <nav className="pointer-events-auto flex items-center gap-1 border border-fog rounded-full p-1 bg-ink/40 backdrop-blur">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.mode;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setMode(item.mode)}
              className={`inline-flex min-h-[44px] items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors ${
                isActive
                  ? 'bg-chrome text-ink'
                  : 'text-mist hover:text-chrome'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

export default memo(NavBar);
