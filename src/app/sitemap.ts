import type { MetadataRoute } from "next";

const baseUrl = "https://soulsinxtinction.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/cartas",
    "/boveda",
    "/productos",
    "/eventos",
    "/torneos",
    "/tiendas",
    "/noticias",
    "/como-jugar",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
