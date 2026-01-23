import { PikingosHeroSection } from "@/components/productos/pikingos/PikingosHeroSection";
import { PikingosShowcaseSection } from "@/components/productos/pikingos/PikingosShowcaseSection";

export default function Page() {
  return (
    <main className="relative isolate min-h-screen bg-[url('/products/pikingos/Fondo.webp')] bg-cover bg-center bg-fixed text-slate-900 dark:text-white before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-slate-50/70 before:via-slate-100/70 before:to-slate-200/70 before:content-[''] dark:before:from-tournament-dark-bg/75 dark:before:via-tournament-dark-muted/75 dark:before:to-tournament-dark-bg/75">
      <div className="relative z-10">
        <PikingosHeroSection />
        <PikingosShowcaseSection />
      </div>
    </main>
  );
}
