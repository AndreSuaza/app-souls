import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Noticias | Souls In Xtinction TCG",
  description:
    "Gestiona las noticias del panel administrativo de Souls In Xtinction TCG.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
