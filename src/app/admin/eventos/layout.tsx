import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eventos | Admin Souls In Xtinction TCG",
  description:
    "Gestiona el calendario de eventos de Souls In Xtinction TCG.",
};

export default function AdminEventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
