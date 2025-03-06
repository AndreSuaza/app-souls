import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  i18n: {
    locales: ['es', 'en'], // Lista de idiomas
    defaultLocale: 'es',   // Idioma por defecto
  },
};

export default nextConfig;
