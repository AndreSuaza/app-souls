import type { Metadata } from "next";
import "./globals.scss";
import {titleFont, geistMono} from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    template: '%s - Souls In Xtinction | TGC',
    default: 'Home - Souls In Xtinction | TGC'
  },
  description: 'Nuevo juego de cartas coleccionable Colombiano',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${titleFont.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
