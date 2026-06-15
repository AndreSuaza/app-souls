import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Cartas | Souls In Xtinction TCG",
  description:
    "Panel de administracion de cartas para importar y registrar cartas en bloque mediante archivos Excel.",
};

export default function AdminCardsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
