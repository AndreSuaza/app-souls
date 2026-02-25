const isDecklistHref = (href: string) =>
  href.length > 0 && !href.startsWith("http") && href.includes("%2C");
const isDeckIdHref = (href: string) =>
  href.length > 0 && /^[0-9a-fA-F]{24}$/.test(href.trim());

export const getPlainTextFromMarkdown = (markdown: string) => {
  if (!markdown) return "";

  let plain = markdown;

  // Elimina las imagenes porque no aportan texto visible en el render.
  plain = plain.replace(/!\[[^\]]*]\([^)]*\)/g, " ");

  // Remueve los links de mazo embebido para evitar contar texto no visible.
  plain = plain.replace(/\[([^\]]*?)\]\(([^)]+)\)/g, (_match, text, href) => {
    if (typeof href === "string" && (isDecklistHref(href) || isDeckIdHref(href))) {
      return " ";
    }
    return text;
  });

  // Mantiene el contenido de bloques y codigo inline sin los delimitadores.
  plain = plain.replace(/```([\s\S]*?)```/g, "$1");
  plain = plain.replace(/`([^`]+)`/g, "$1");

  // Limpia etiquetas HTML que pudieran quedar.
  plain = plain.replace(/<\/?[^>]+>/g, "");

  // Normaliza espacios no visibles que pueden venir del editor.
  plain = plain.replace(/&nbsp;/gi, " ");
  plain = plain.replace(/\u00a0/g, " ");
  plain = plain.replace(/[\u200B-\u200D\uFEFF]/g, "");

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
