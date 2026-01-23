import { PikingosHeroSection } from "@/components/productos/pikingos/PikingosHeroSection";

export default function Page() {
  return (
    <main className="relative isolate min-h-screen bg-[url('/products/pikingos/Fondo.webp')] bg-cover bg-center text-slate-900 dark:text-white before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-purple-200/70 before:via-purple-200/40 before:to-purple-500/30 before:content-[''] dark:before:from-purple-950/80 dark:before:via-purple-950/60 dark:before:to-tournament-dark-bg/80">
      <div className="relative z-10">
        <PikingosHeroSection />
      </div>
    </main>
  );
}
