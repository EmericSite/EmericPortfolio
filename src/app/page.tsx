// Emericfolio — created by Tomi-Tom, 2026
// The one and only page: 3D hub, side panels, and the big headline over them
import HomeHub from '@/components/HomeHub';
import ProjectPanel from '@/components/ProjectPanel';
import NavBar from '@/components/NavBar';
import AboutPanel from '@/components/AboutPanel';
import ContactPanel from '@/components/ContactPanel';
import Loader from '@/components/Loader';
import ScrollNav from '@/components/ScrollNav';
import AccessibleProjectList from '@/components/AccessibleProjectList';
import MarqueeBackground from '@/components/MarqueeBackground';
import VideoOverlay from '@/components/VideoOverlay';
import { accueil } from '@/content/site';

export default function Home() {
  return (
    <main id="main" className="relative isolate h-dvh min-h-[560px] w-full overflow-hidden text-chrome">
      <Loader />

      <MarqueeBackground />

      <div className="absolute inset-0 z-10">
        <HomeHub />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink/70 pointer-events-none" />

      <NavBar />
      <ProjectPanel />
      <AboutPanel />
      <ContactPanel />
      <ScrollNav />
      <AccessibleProjectList />
      <VideoOverlay />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 pb-10 md:p-12 md:pb-20 pointer-events-none">
        <div className="max-w-3xl animate-fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-magentaglitch mb-4">
            {accueil.surtitre}
          </p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
            {accueil.titreLigne1}
            <br />
            <span className="italic text-pearl">{accueil.titreLigne2}</span>
          </h1>
        </div>
      </div>
    </main>
  );
}
