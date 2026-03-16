import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Productos | Souls In Xtinction TCG",
  description:
    "Administra el catalogo de productos desde el panel de Souls In Xtinction TCG.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
