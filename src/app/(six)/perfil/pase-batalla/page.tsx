import { getActiveBattlePassAction } from "@/actions/battle-pass/player-battle-pass.action";
import { ProfileBattlePassSection } from "@/components/perfil/ProfileBattlePassSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pase de batalla | Souls In Xtinction TCG",
  description:
    "Sube niveles en el pase de batalla de Souls In Xtinction TCG, desbloquea recompensas y reclama premios por participar en torneos.",
  keywords: [
    "Souls In Xtinction",
    "pase de batalla",
    "recompensas",
    "TCG",
    "torneos",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/perfil/pase-batalla",
  },
  openGraph: {
    title: "Pase de batalla | Souls In Xtinction TCG",
    description:
      "Sube niveles, desbloquea recompensas y reclama premios en el pase de batalla de Souls In Xtinction TCG.",
    url: "https://soulsinxtinction.com/perfil/pase-batalla",
    siteName: "Souls In Xtinction TCG",
    images: [
      {
        url: "https://soulsinxtinction.com/battle-pass/pase-de-batalla.jpg",
        width: 800,
        height: 600,
        alt: "Pase de batalla de Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pase de batalla | Souls In Xtinction TCG",
    description:
      "Sube niveles, desbloquea recompensas y reclama premios en el pase de batalla de Souls In Xtinction TCG.",
    images: ["https://soulsinxtinction.com/battle-pass/pase-de-batalla.jpg"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PerfilBattlePassPage() {
  const battlePassData = await getActiveBattlePassAction();

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-slate-50 text-slate-900 dark:bg-[#130a1c] dark:text-[#edddf7]">
      <div className="w-full">
        <ProfileBattlePassSection
          initialData={battlePassData}
          showBackLink
        />
      </div>
    </main>
  );
}
