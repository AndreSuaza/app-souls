import type { CosmeticStoreData, CosmeticStoreItem } from "@/actions";
import { CosmeticStoreView } from "../tienda/CosmeticStoreView";

type Props = {
  storeData: CosmeticStoreData;
  onPurchase: (cosmetic: CosmeticStoreItem, nextVictoryPoints: number) => void;
};

export const ProfileStoreSection = ({ storeData, onPurchase }: Props) => {
  return <CosmeticStoreView initialData={storeData} onPurchase={onPurchase} />;
};
