'use client';

import { useEffect, useState } from 'react';
import {
  getDetectedTier,
  getGPURenderer,
  tierBudget,
  type PerfTier,
} from '@/lib/usePerformanceTier';

type Nav = Navigator & {
  deviceMemory?: number;
  userAgentData?: { platform?: string };
};

export default function PerfDebug() {
  const [show, setShow] = useState(false);
  const [info, setInfo] = useState<{
    tier: PerfTier;
    gpu: string;
    cores: number;
    ram: number;
    dpr: number;
    platform: string;
    fps: number;
  } | null>(null);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('perf')) return;
    setShow(true);

    const nav = navigator as Nav;
    const tier = getDetectedTier();
    const gpu = getGPURenderer();
    const cores = nav.hardwareConcurrency ?? 0;
    const ram = nav.deviceMemory ?? 0;
    const dpr = window.devicePixelRatio ?? 1;
    const platform = nav.userAgentData?.platform ?? 'unknown';

    setInfo({ tier, gpu, cores, ram, dpr, platform, fps: 0 });

    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        const fps = Math.round((frames * 1000) / (now - last));
        setInfo((prev) => (prev ? { ...prev, fps } : prev));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!show || !info) return null;

  const budget = tierBudget[info.tier];

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none rounded-md border border-fog bg-ink/90 backdrop-blur px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-chrome leading-relaxed max-w-[80vw]">
      <div className="text-magentaglitch mb-1">perf debug</div>
      <div>tier · <span className="text-cyanglitch">{info.tier}</span></div>
      <div>fps · <span className={info.fps < 40 ? 'text-magentaglitch' : 'text-cyanglitch'}>{info.fps}</span></div>
      <div>dpr · {info.dpr} → cap [{budget.dpr[0]}, {budget.dpr[1]}]</div>
      <div>cores · {info.cores} · ram · {info.ram} gb</div>
      <div>platform · {info.platform}</div>
      <div className="mt-1 normal-case tracking-normal text-mist truncate" title={info.gpu}>
        gpu · {info.gpu || '(masked)'}
      </div>
      <div className="mt-1">
        postfx · {budget.postFX} · sparkles {budget.sparkles} · fireflies {budget.fireflies}
      </div>
    </div>
  );
}
