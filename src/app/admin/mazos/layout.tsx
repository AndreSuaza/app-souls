import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Mazos | Souls In Xtinction TCG",
  description:
    "Administra los mazos estructurados desde el panel de Souls In Xtinction TCG.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
