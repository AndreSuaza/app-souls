import { getActiveBattlePassAction } from "@/actions/battle-pass/player-battle-pass.action";
import { ProfileBattlePassSection } from "@/components/perfil/ProfileBattlePassSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pase de batalla | Souls In Xtinction TCG",
  description:
    "Consulta tu progreso del pase de batalla, revisa niveles y reclama recompensas gratuitas por jugar torneos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PerfilBattlePassPage() {
  const battlePassData = await getActiveBattlePassAction();

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[#130a1c] text-[#edddf7]">
      <div className="w-full">
        <ProfileBattlePassSection
          initialData={battlePassData}
          showBackLink
        />
      </div>
    </main>
  );
}
