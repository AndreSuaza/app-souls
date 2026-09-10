"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getActiveBattlePassAction,
  syncEndedBattlePassRewardsAction,
  type PlayerBattlePassData,
  type SyncedBattlePassReward,
} from "@/actions/battle-pass/player-battle-pass.action";
import { BattlePassSyncedRewardsOverlay } from "@/components/battle-pass/BattlePassSyncedRewardsOverlay";
import { ProfileBattlePassSection } from "@/components/perfil/ProfileBattlePassSection";

export const HomeBattlePassSection = () => {
  const { status } = useSession();
  const [data, setData] = useState<PlayerBattlePassData | null>(null);
  const [syncedRewards, setSyncedRewards] = useState<
    SyncedBattlePassReward[]
  >([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setData(null);
      setHasLoaded(false);
      return;
    }

    let isMounted = true;

    const loadPass = async () => {
      try {
        const syncResult = await syncEndedBattlePassRewardsAction().catch(
          () => null,
        );

        if (isMounted && syncResult && syncResult.rewards.length > 0) {
          setSyncedRewards(syncResult.rewards);
        }

        const pass = await getActiveBattlePassAction();
        if (!isMounted) return;
        setData(pass);
      } finally {
        if (isMounted) setHasLoaded(true);
      }
    };

    loadPass();

    return () => {
      isMounted = false;
    };
  }, [status]);

  if (status !== "authenticated" || !hasLoaded) {
    return null;
  }

  return (
    <>
      {data && (
        <ProfileBattlePassSection
          initialData={data}
          variant="embedded"
          enableClaims={false}
          runAutoSync={false}
        />
      )}
      <BattlePassSyncedRewardsOverlay
        rewards={syncedRewards}
        onClose={() => setSyncedRewards([])}
      />
    </>
  );
};
