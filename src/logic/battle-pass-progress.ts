export const calculateBattlePassProgress = ({
  automaticProgress,
  manualOffset,
  maxLevel,
}: {
  automaticProgress: number;
  manualOffset: number;
  maxLevel: number;
}) => {
  const rawProgress = automaticProgress + manualOffset;

  return Math.max(0, Math.min(rawProgress, Math.max(0, maxLevel)));
};

export const isPhysicalRewardPending = ({
  rewardType,
  levelNumber,
  progress,
  claimStatus,
}: {
  rewardType: string;
  levelNumber: number;
  progress: number;
  claimStatus?: string | null;
}) =>
  rewardType === "MANUAL" &&
  levelNumber <= progress &&
  claimStatus !== "FULFILLED";
