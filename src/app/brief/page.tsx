import Image from 'next/image';
import HubScene from '@/components/HubScene';

export const metadata = {
  title: 'Brief — Mélancolie électrique · Emeric Ressy',
  description:
    'Direction créative et architecture du portfolio Three.js d\'Emeric Ressy.',
};

const palette = [
  {
    tier: 'Base',
    role: 'Profondeur, vide, fond du sanctuaire',
    swatches: [
      { name: 'Ink', hex: '#08070C' },
      { name: 'Fog', hex: '#2A2730' },
    ],
  },
  {
    tier: 'Mid',
    role: 'Chrome liquide du logo, glaçage rosé',
    swatches: [
      { name: 'Pearl', hex: '#F4D8E2' },
      { name: 'Chrome', hex: '#E8E6EC' },
    ],
  },
  {
    tier: 'Accent fluo',
    role: 'Tension, glitch, énergie anime/esport',
    swatches: [
      { name: 'Cyan glitch', hex: '#00F0FF' },
      { name: 'Magenta acid', hex: '#FF2D9C' },
    ],
  },
  {
    tier: 'Texte',
    role: 'Lecture sur fond profond',
    swatches: [
      { name: 'Mist', hex: '#B8B0BE' },
      { name: 'Chrome', hex: '#E8E6EC' },
    ],
  },
];

const tensions = [
  {
    a: 'Gaming AAA',
    b: 'Poésie française',
    note: 'Zenless × Gentle Mates ↔ Douce Mélancolie des Choses',
  },
  {
    a: 'Chrome lumineux',
    b: 'Noirceur narrative',
    note: 'Logo brillant rosé ↔ titres « Torment », « Mélancolie »',
  },
  {
    a: 'Lent / atmosphérique',
    b: 'Pop / agressif',
    note: 'L\'oscillation EST la signature.',
  },
];

const states = [
  {
    code: '01 — HUB',
    title: 'Ambient',
    body: 'Brouillard volumétrique, particules suspendues, le logo flotte au centre comme une relique. Caméra orbitale lente. Son discret, basses, drone. État de défaut, méditatif.',
    palette: ['#08070C', '#2A2730', '#F4D8E2'],
  },
  {
    code: '02 — HOVER',
    title: 'Tension',
    body: 'Au survol d\'un projet, le brouillard se déchire localement. Glitch RGB léger, accents fluo qui percent. Une sub-bass monte. C\'est la promesse de ce qui va arriver.',
    palette: ['#2A2730', '#00F0FF', '#FF2D9C'],
  },
  {
    code: '03 — PROJECT',
    title: 'Pop',
    body: 'Clic = explosion. Caméra plonge, le fog se dégage, vidéo plein écran, accents fluo électriques, typo agressive, énergie anime/esport. Le contraste avec le hub est la dramaturgie.',
    palette: ['#08070C', '#FF2D9C', '#00F0FF', '#E8E6EC'],
  },
];

const corpus = [
  {
    title: 'Gentle Mates × Zenless Zone Zero',
    year: '2026',
    tag: 'Gaming · Esport',
  },
  {
    title: "DOFUS — C'est ici que tout commence",
    year: '2025',
    tag: 'Animation · Ankama',
  },
  {
    title: 'Douce Mélancolie des Choses',
    year: '2025',
    tag: 'Personnel · Poétique',
  },
  { title: 'Come, Torment', year: '2024', tag: 'Personnel · Dark' },
];

const inspirations = [
  {
    name: 'Active Theory',
    note: 'Architecture de scènes WebGL narratives, transitions cinématiques.',
    href: 'https://activetheory.net',
  },
  {
    name: 'Resn',
    note: 'Ambiances volumétriques, post-processing organique.',
    href: 'https://resn.co.nz',
  },
  {
    name: 'HoYoverse / Zenless',
    note: 'Pop urbaine anime, chrome, accent néon.',
    href: 'https://zenless.hoyoverse.com',
  },
  {
    name: 'Awwwards FWA récents',
    note: 'Galerie de patterns 2025-2026, R3F + drei à grande échelle.',
    href: 'https://www.awwwards.com',
  },
  {
    name: 'Ghibli — pluies, vents',
    note: 'Atmosphère mélancolique, lenteur, brouillard.',
    href: null,
  },
  {
    name: 'Beeple early / glitch art',
    note: 'Distorsions chromatiques, énergie brute en hover/transition.',
    href: null,
  },
];

const stack = [
  'Next.js 16 · App Router',
  'React 19 + TypeScript',
  'Tailwind v4 (theme tokens)',
  'three.js + @react-three/fiber',
  '@react-three/drei (Environment, Float, Sparkles)',
  '@react-three/postprocessing (bloom, chromatic aberration)',
  'GSAP ou Framer Motion (timelines DOM)',
  'Howler.js (sound design discret, optionnel)',
];

const sceneComposition = [
  ['Logo / relique', 'Mesh chromé central. Plan ou volume basé sur le glyphe. MeshTransmissionMaterial ou metalness=1 + envMap.'],
  ['Fog volumétrique', 'fog scene-level + plans de bruit additifs. Densité dynamique selon état.'],
  ['Particules', 'Sparkles (drei) — tailles variables, drift lent, color shift selon état.'],
  ['Cartouches projets', 'Plans 3D en orbite lente autour du logo. Hover = mise au premier plan + glitch UV.'],
  ['Caméra rigs', 'Cinematic dolly. États HUB/HOVER/PROJECT = positions et FOV cibles, lerp.'],
  ['Post-processing', 'Bloom doux constant, chromatic aberration en hover, RGB split en transitions.'],
];

const roadmap = [
  {
    phase: 'Phase 1',
    title: 'Sanctuaire statique',
    body: 'HubScene complète avec relique, fog, particules, lighting final. Aucune nav encore. On bloque l\'identité visuelle.',
  },
  {
    phase: 'Phase 2',
    title: 'État machine + transitions',
    body: 'HUB → HOVER → PROJECT. Caméra rigs, post-processing dynamique, premiers cartouches projets en orbite.',
  },
  {
    phase: 'Phase 3',
    title: 'Pages projets & contenu',
    body: 'Vidéos, textes, crédits. Mode pop full screen. Index / About / Contact comme sous-modes du hub.',
  },
  {
    phase: 'Phase 4',
    title: 'Polish & perf',
    body: 'Sound design, micro-interactions, optimisations DPR/draw calls, SEO, opengraph, analytics, déploiement Vercel.',
  },
];

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.2em] text-mist mb-6 flex items-center gap-3">
      <span className="text-magentaglitch">{index}</span>
      <span className="h-px flex-1 bg-fog" />
      <span>{children}</span>
    </div>
  );
}

export default function BriefPage() {
  return (
    <main className="bg-ink text-chrome">
      {/* HERO */}
      <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <HubScene showCartouches={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink pointer-events-none" />
        <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo.png"
                  alt="Emeric Ressy logo"
                  fill
                  className="object-contain"
                  sizes="40px"
                  priority
                />
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
                Emeric Ressy<br />
                <span className="text-chrome/50">Brief créatif · v0.1</span>
              </div>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
              Paris · 2026
            </div>
          </header>

          <div className="max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-magentaglitch mb-4">
              Direction créative
            </p>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.95] tracking-tight">
              Mélancolie
              <br />
              <span className="italic text-pearl">électrique</span>
            </h1>
            <p className="mt-6 max-w-xl text-mist text-lg leading-relaxed">
              Un sanctuaire chromé, lent et brumeux, fracturé par l&rsquo;énergie pop
              de l&rsquo;esport et de l&rsquo;anime. La tension entre les deux est la
              signature.
            </p>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist/70 flex items-center gap-3">
            <span className="h-px w-8 bg-mist/40" />
            scroll
          </div>
        </div>
      </section>

      {/* L'ARTISTE */}
      <section className="px-6 md:px-12 py-24 md:py-32 max-w-6xl mx-auto">
        <SectionLabel index="01">L&rsquo;artiste</SectionLabel>
        <p className="font-display text-3xl md:text-5xl leading-tight">
          <span className="text-pearl italic">
            « Through motion design, I explore narrative, atmosphere, and visual
            identity to create striking and memorable imagery. »
          </span>
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-widest">
          {['Motion Designer', '3D & Art Direction', 'Paris', 'emericressy.com'].map(
            (p) => (
              <span
                key={p}
                className="border border-fog rounded-full px-4 py-2 text-mist"
              >
                {p}
              </span>
            ),
          )}
        </div>
      </section>

      {/* CORPUS */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <SectionLabel index="02">Corpus actuel</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog/40 border border-fog/40">
          {corpus.map((p) => (
            <div
              key={p.title}
              className="bg-ink p-8 hover:bg-fog/30 transition-colors"
            >
              <div className="font-mono text-xs uppercase tracking-widest text-mist mb-3">
                {p.year} · {p.tag}
              </div>
              <div className="font-display text-2xl md:text-3xl leading-tight">
                {p.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TENSIONS */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <SectionLabel index="03">Tensions créatives</SectionLabel>
        <p className="text-mist max-w-2xl mb-12">
          Trois polarités qui parcourent l&rsquo;œuvre. Le site doit les jouer
          simultanément — pas en choisir une.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tensions.map((t, i) => (
            <div
              key={i}
              className="border border-fog p-8 rounded-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 h-px w-1/2 bg-magentaglitch" />
              <div className="absolute bottom-0 right-0 h-px w-1/2 bg-cyanglitch" />
              <div className="font-display text-3xl text-pearl leading-tight">
                {t.a}
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-magentaglitch my-4">
                ↔
              </div>
              <div className="font-display text-3xl text-chrome italic leading-tight">
                {t.b}
              </div>
              <p className="mt-6 text-sm text-mist">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIRECTION — 3 ÉTATS */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <SectionLabel index="04">Direction · 3 états</SectionLabel>
        <h2 className="font-display text-4xl md:text-6xl leading-tight mb-4">
          Une scène, <span className="italic text-pearl">trois souffles</span>.
        </h2>
        <p className="text-mist max-w-2xl mb-16">
          Le portfolio n&rsquo;est pas un assemblage de pages. C&rsquo;est une scène 3D
          unique qui respire entre trois états. La transition entre eux est la
          dramaturgie.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {states.map((s) => (
            <div
              key={s.code}
              className="border border-fog rounded-sm p-8 flex flex-col gap-6"
            >
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-cyanglitch">
                {s.code}
              </div>
              <div className="font-display text-4xl">
                <span className="italic">{s.title}</span>
              </div>
              <p className="text-mist text-sm leading-relaxed flex-1">{s.body}</p>
              <div className="flex gap-2">
                {s.palette.map((c) => (
                  <div
                    key={c}
                    className="h-10 w-10 rounded-sm border border-fog/60"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PALETTE */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <SectionLabel index="05">Palette</SectionLabel>
        <h2 className="font-display text-4xl md:text-6xl leading-tight mb-12">
          Quatre couches.
        </h2>
        <div className="space-y-px bg-fog/40 border border-fog/40">
          {palette.map((tier) => (
            <div
              key={tier.tier}
              className="bg-ink grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-6 p-6 items-center"
            >
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-cyanglitch">
                  {tier.tier}
                </div>
                <div className="text-mist text-sm mt-1">{tier.role}</div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {tier.swatches.map((s) => (
                  <div
                    key={s.hex}
                    className="flex items-center gap-3 border border-fog/60 rounded-sm pr-4"
                  >
                    <div
                      className="h-14 w-14"
                      style={{ background: s.hex }}
                    />
                    <div>
                      <div className="text-sm">{s.name}</div>
                      <div className="font-mono text-xs text-mist">{s.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TYPOGRAPHIE */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <SectionLabel index="06">Typographie</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-fog p-8 rounded-sm">
            <div className="font-mono text-xs uppercase tracking-widest text-mist mb-4">
              Display
            </div>
            <div className="font-display text-5xl italic text-pearl">
              Mélancolie
            </div>
            <div className="text-mist text-sm mt-4">
              Instrument Serif · italic. Pour les moments poétiques, titres,
              respiration.
            </div>
          </div>
          <div className="border border-fog p-8 rounded-sm">
            <div className="font-mono text-xs uppercase tracking-widest text-mist mb-4">
              Sans
            </div>
            <div className="font-sans text-3xl">Geist Sans</div>
            <div className="text-mist text-sm mt-4">
              Body, lecture longue, navigation. Neutre, technique, contemporain.
            </div>
          </div>
          <div className="border border-fog p-8 rounded-sm">
            <div className="font-mono text-xs uppercase tracking-widest text-mist mb-4">
              Mono
            </div>
            <div className="font-mono text-2xl text-cyanglitch">
              GEIST_MONO
            </div>
            <div className="text-mist text-sm mt-4">
              Labels, codes, numéros de section, métadonnées. Donne le ton
              technique/UI gaming.
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <SectionLabel index="07">Architecture Three.js</SectionLabel>
        <h2 className="font-display text-4xl md:text-6xl leading-tight mb-12">
          Une seule scène, beaucoup d&rsquo;<span className="italic text-pearl">états</span>.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-cyanglitch mb-4">
              Composition
            </div>
            <div className="space-y-4">
              {sceneComposition.map(([name, desc]) => (
                <div
                  key={name}
                  className="border-l border-fog pl-4 py-1"
                >
                  <div className="font-display text-xl text-pearl">{name}</div>
                  <div className="text-mist text-sm mt-1">{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-cyanglitch mb-4">
              Stack
            </div>
            <div className="flex flex-wrap gap-2">
              {stack.map((s) => (
                <span
                  key={s}
                  className="font-mono text-xs uppercase tracking-wider border border-fog rounded-sm px-3 py-2 text-mist"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="font-mono text-xs uppercase tracking-widest text-cyanglitch mt-12 mb-4">
              Machine d&rsquo;état
            </div>
            <pre className="font-mono text-xs text-mist border border-fog rounded-sm p-4 overflow-x-auto leading-relaxed">
{`HUB ──hover──▶ HOVER ──click──▶ PROJECT
 ▲                ▲                  │
 │                └──leave───────────┘
 └──escape / back───────────────────┘

About / Index / Contact = sous-modes du HUB
(le fog s'épaissit, le logo se déplace, la caméra change de cadre)`}
            </pre>
          </div>
        </div>
      </section>

      {/* INSPIRATIONS */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <SectionLabel index="08">Inspirations</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog/40 border border-fog/40">
          {inspirations.map((i) => (
            <div key={i.name} className="bg-ink p-6">
              <div className="flex items-baseline justify-between gap-4">
                <div className="font-display text-2xl text-pearl">{i.name}</div>
                {i.href && (
                  <a
                    href={i.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs uppercase tracking-widest text-cyanglitch hover:text-magentaglitch transition-colors"
                  >
                    visit ↗
                  </a>
                )}
              </div>
              <p className="text-mist text-sm mt-2">{i.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <SectionLabel index="09">Roadmap de build</SectionLabel>
        <div className="space-y-6">
          {roadmap.map((r) => (
            <div
              key={r.phase}
              className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 border-t border-fog pt-6"
            >
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-magentaglitch">
                {r.phase}
              </div>
              <div>
                <div className="font-display text-3xl text-pearl mb-2">
                  {r.title}
                </div>
                <p className="text-mist max-w-2xl">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 py-16 max-w-6xl mx-auto border-t border-fog mt-24">
        <div className="flex flex-col md:flex-row justify-between gap-6 font-mono text-xs uppercase tracking-widest text-mist">
          <div>Brief créatif · v0.1 · 2026-04-29</div>
          <div className="flex gap-6">
            <span>Direction · Mélancolie électrique</span>
            <span className="text-cyanglitch">en attente de validation</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
