const isDecklistHref = (href: string) =>
  href.length > 0 && !href.startsWith("http") && href.includes("%2C");

export const getPlainTextFromMarkdown = (markdown: string) => {
  if (!markdown) return "";

  let plain = markdown;

  // Elimina las imagenes porque no aportan texto visible en el render.
  plain = plain.replace(/!\[[^\]]*]\([^)]*\)/g, " ");

  // Remueve los links de decklist completos para evitar contar texto no visible.
  plain = plain.replace(/\[([^\]]*?)\]\(([^)]+)\)/g, (_match, text, href) => {
    if (typeof href === "string" && isDecklistHref(href)) {
      return " ";
    }
    return text;
  });

  // Mantiene el contenido de bloques y codigo inline sin los delimitadores.
  plain = plain.replace(/```([\s\S]*?)```/g, "$1");
  plain = plain.replace(/`([^`]+)`/g, "$1");

  // Limpia etiquetas HTML que pudieran quedar.
  plain = plain.replace(/<\/?[^>]+>/g, "");

  // Quita prefijos de markdown manteniendo el texto.
  plain = plain.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  plain = plain.replace(/^\s{0,3}>\s?/gm, "");
  plain = plain.replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, "");

  // Quita marcas de enfasis simples.
  plain = plain.replace(/(\*\*|__|\*|_|~~)/g, "");

  return plain.replace(/\s+/g, " ").trim();
};

export const getPlainTextLengthFromMarkdown = (markdown: string) =>
  getPlainTextFromMarkdown(markdown).length;
