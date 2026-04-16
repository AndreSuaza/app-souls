import { Cinzel, Inter } from "next/font/google";
import { MaintenanceView } from "@/components/maintenance/MaintenanceView";

export const metadata = {
  title: "Souls In Xtinction | En Mantenimiento",
  description: "Portal temporalmente fuera de servicio.",
};

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function Page() {
  return (
    <MaintenanceView
      cinzelClassName={cinzel.className}
      interClassName={inter.className}
    />
  );
}
