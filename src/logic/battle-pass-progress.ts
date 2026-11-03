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
