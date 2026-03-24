import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Torneos | Souls In Xtinction TCG",
  description:
    "Gestiona torneos, rondas y resultados desde el panel de Souls In Xtinction TCG.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
