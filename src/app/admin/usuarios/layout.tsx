import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Usuarios | Souls In Xtinction TCG",
  description:
    "Administracion de usuarios, roles, estados y ajustes manuales de PV.",
};

export default function AdminUsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
