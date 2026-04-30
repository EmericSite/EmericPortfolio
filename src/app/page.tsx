import HomeHub from '@/components/HomeHub';
import HubOverlay from '@/components/HubOverlay';
import NavBar from '@/components/NavBar';
import AboutPanel from '@/components/AboutPanel';
import ContactPanel from '@/components/ContactPanel';
import Loader from '@/components/Loader';
import ScrollNav from '@/components/ScrollNav';
import AccessibleProjectList from '@/components/AccessibleProjectList';
import MarqueeBackground from '@/components/MarqueeBackground';

export default function Home() {
  return (
    <main id="main" className="relative h-screen min-h-[700px] w-full overflow-hidden bg-ink text-chrome">
      <Loader />

      <MarqueeBackground />

      <div className="absolute inset-0 z-10">
        <HomeHub />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink/70 pointer-events-none" />

      <NavBar />
      <HubOverlay />
      <AboutPanel />
      <ContactPanel />
      <ScrollNav />
      <AccessibleProjectList />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-12 pointer-events-none">
        <div className="max-w-3xl animate-fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-magentaglitch mb-4">
            Mélancolie électrique
          </p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Motion · 3D ·
            <br />
            <span className="italic text-pearl">Direction artistique.</span>
          </h1>
          <p className="mt-6 max-w-xl text-mist text-base md:text-lg leading-relaxed animate-fade-up-slow">
            Survole une relique en orbite. Clique pour entrer.
          </p>
        </div>
      </div>
    </main>
  );
}
