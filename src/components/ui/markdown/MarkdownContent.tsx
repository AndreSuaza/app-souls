"use client";

import clsx from "clsx";
/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import React, { isValidElement, useCallback, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Components } from "react-markdown";
import { MarkdownDeckPreview } from "./MarkdownDeckPreview";
import { MarkdownCardPreview } from "./MarkdownCardPreview";
import { MarkdownProductPreview } from "./MarkdownProductPreview";

type Props = {
  content: string;
  className?: string;
  enableInstagramEmbeds?: boolean;
  enableCustomBlocks?: boolean;
};

const normalizeImageParagraphs = (value: string) => {
  if (!value) return value;
  // Junta imagenes separadas por lineas en blanco para renderizarlas en una sola fila.
  return value.replace(
    /(!\[[^\]]*]\([^)]*\))\s*\n\s*\n(?=\s*!\[[^\]]*]\([^)]*\))/g,
    "$1\n",
  );
};

const renderInlineWithUnderline = (children: React.ReactNode) => {
  let keyIndex = 0;
  const regex = /\+\+([^+]+)\+\+/g;

  const splitUnderline = (text: string) => {
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before) {
        result.push(before);
      }
      result.push(
        <u key={`underline-${keyIndex}-${match.index}`}>{match[1]}</u>,
      );
      keyIndex += 1;
      lastIndex = match.index + match[0].length;
    }

    const after = text.slice(lastIndex);
    if (after) {
      result.push(after);
    }

    return result;
  };

  const processNode = (node: React.ReactNode): React.ReactNode[] => {
    if (typeof node === "string") {
      return splitUnderline(node);
    }

    if (typeof node === "number" || typeof node === "boolean") {
      return [node];
    }

    if (Array.isArray(node)) {
      return node.flatMap(processNode);
    }

    if (isValidElement(node)) {
      const element = node as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      if (typeof element.type === "string" && element.props?.children) {
        const processedChildren = processNode(element.props.children);
        return [
          React.cloneElement(element, {
            ...element.props,
            children: processedChildren,
          }),
        ];
      }
      return [element];
    }

    if (node == null) {
      return [];
    }

    return [node];
  };

  return processNode(children);
};

const isInstagramUrl = (href: string) =>
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[^/?#]+/i.test(href);

const normalizeInstagramUrl = (href: string) => {
  const cleaned = href.split("?")[0];
  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
};

const InstagramEmbed = ({ url }: { url: string }) => {
  const permalink = useMemo(() => normalizeInstagramUrl(url), [url]);

  useEffect(() => {
    // Carga el script de Instagram una sola vez y reprocesa el embed.
    const existingScript = document.getElementById("instagram-embed-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      script.onload = () => {
        (
          window as { instgrm?: { Embeds?: { process: () => void } } }
        ).instgrm?.Embeds?.process();
      };
      document.body.appendChild(script);
    } else {
      (
        window as { instgrm?: { Embeds?: { process: () => void } } }
      ).instgrm?.Embeds?.process();
    }
  }, [permalink]);

  return (
    <div className="my-6 flex w-full justify-center">
      <div className="w-full max-w-[560px] rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface/60 p-3 shadow-lg shadow-black/10 backdrop-blur">
        <blockquote
          className="instagram-media w-full"
          data-instgrm-permalink={permalink}
          data-instgrm-version="14"
        >
          <a
            href={permalink}
            target="_blank"
            rel="noreferrer"
            title="Ver publicación en Instagram"
          >
            {permalink}
          </a>
        </blockquote>
      </div>
    </div>
  );
};

// Permite <u> para el subrayado sin abrir el resto del HTML arbitrario.
const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
};

type IndentSize = "sm" | "md" | "lg" | "xl";

type CustomBlock =
  | {
      type: "markdown";
      content: string;
    }
  | {
      type: "indent";
      left?: IndentSize;
      right?: IndentSize;
      content: string;
    }
  | {
      type: "card";
      title?: string;
      content: string;
    };

type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  url?: string;
  properties?: {
    href?: string;
  };
  children?: HastNode[];
};

const isCardReference = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("http")) return false;
  if (trimmed.includes("/")) return false;
  if (trimmed.includes(".")) return false;
  if (!/^[0-9a-zA-Z]+$/.test(trimmed)) return false;
  return true;
};

const INDENT_MAP: Record<IndentSize, string> = {
  sm: "ml-4",
  md: "ml-8",
  lg: "ml-12",
  xl: "ml-16",
};

const INDENT_RIGHT_MAP: Record<IndentSize, string> = {
  sm: "mr-4",
  md: "mr-8",
  lg: "mr-12",
  xl: "mr-16",
};

const parseIndentSize = (
  attrs: string,
  side: "left" | "right",
): IndentSize | undefined => {
  const match = new RegExp(`${side}\\s*=\\s*(sm|md|lg|xl)`, "i").exec(attrs);
  if (!match) return undefined;
  return match[1].toLowerCase() as IndentSize;
};

const parseCustomBlocks = (value: string): CustomBlock[] => {
  const blocks: CustomBlock[] = [];
  if (!value) return [{ type: "markdown", content: value }];

  const openTagRegex = /\[(card|indent)([^\]]*)\]/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = openTagRegex.exec(value)) !== null) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      blocks.push({
        type: "markdown",
        content: value.slice(lastIndex, matchIndex),
      });
    }

    const blockType = match[1]?.toLowerCase() ?? "";
    const attrs = match[2] ?? "";
    const openEnd = matchIndex + match[0].length;

    const closeRegex = new RegExp(
      `\\[${blockType}[^\\]]*\\]|\\[\\/${blockType}\\]`,
      "gi",
    );
    closeRegex.lastIndex = openEnd;

    let depth = 1;
    let closeMatch: RegExpExecArray | null;
    while ((closeMatch = closeRegex.exec(value)) !== null) {
      const token = closeMatch[0];
      if (token.toLowerCase().startsWith(`[/${blockType}`)) {
        depth -= 1;
      } else {
        depth += 1;
      }

      if (depth === 0) {
        break;
      }
    }

    if (!closeMatch) {
      // Si no hay cierre, tratamos el resto como markdown plano.
      blocks.push({ type: "markdown", content: value.slice(matchIndex) });
      return blocks;
    }

    const contentStart = openEnd;
    const contentEnd = closeMatch.index ?? contentStart;
    const rawContent = value.slice(contentStart, contentEnd).trim();

    if (blockType === "card") {
      const titleMatch = /title\s*=\s*"(.*?)"/i.exec(attrs);
      const altTitleMatch = /title\s*=\s*'(.*?)'/i.exec(attrs);
      const title =
        titleMatch?.[1]?.trim() ||
        altTitleMatch?.[1]?.trim() ||
        undefined;
      blocks.push({ type: "card", title, content: rawContent });
    } else if (blockType === "indent") {
      const left = parseIndentSize(attrs, "left");
      const right = parseIndentSize(attrs, "right");
      blocks.push({ type: "indent", left, right, content: rawContent });
    } else {
      blocks.push({ type: "markdown", content: value.slice(matchIndex, openEnd) });
    }

    lastIndex = (closeMatch.index ?? 0) + closeMatch[0].length;
    openTagRegex.lastIndex = lastIndex;
  }

  if (lastIndex < value.length) {
    blocks.push({ type: "markdown", content: value.slice(lastIndex) });
  }

  return blocks;
};

const buildComponents = (enableInstagramEmbeds: boolean): Components => ({
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
      {renderInlineWithUnderline(children)}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
      {renderInlineWithUnderline(children)}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white md:text-xl">
      {renderInlineWithUnderline(children)}
    </h3>
  ),
  p: ({ children, node }) => {
    const nodeChildren = ((node as HastNode | undefined)?.children ?? []).slice(
      0,
    );
    const childrenArray = React.Children.toArray(children);
    const isDecklistHref = (href?: string) =>
      typeof href === "string" &&
      href.length > 0 &&
      !href.startsWith("http") &&
      (href.includes("%2C") || (href.includes(";") && href.includes(":")));
    const isDeckIdHref = (href?: string) =>
      typeof href === "string" && /^[0-9a-fA-F]{24}$/.test(href.trim());
    const isBlankTextNode = (child?: HastNode) =>
      child?.type === "text" &&
      typeof child.value === "string" &&
      child.value.trim().length === 0;
    const isImageNode = (child?: HastNode) =>
      (child?.type === "element" && child.tagName === "img") ||
      child?.type === "image";
    const isDecklistNode = (child?: HastNode) =>
      (child?.type === "element" &&
        child.tagName === "a" &&
        (isDecklistHref(child.properties?.href) ||
          isDeckIdHref(child.properties?.href))) ||
      (child?.type === "link" &&
        (isDecklistHref(child.url) || isDeckIdHref(child.url)));
    const isInstagramNode = (child?: HastNode) =>
      (child?.type === "element" &&
        child.tagName === "a" &&
        typeof child.properties?.href === "string" &&
        isInstagramUrl(child.properties.href)) ||
      (child?.type === "link" &&
        typeof child.url === "string" &&
        isInstagramUrl(child.url));
    const meaningfulNodes = nodeChildren.filter(
      (child) => !isBlankTextNode(child),
    );
    const onlyImages =
      meaningfulNodes.length > 0 &&
      meaningfulNodes.every((child) => isImageNode(child));
    const onlyDeckPreview =
      meaningfulNodes.length === 1 && isDecklistNode(meaningfulNodes[0]);
    const onlyInstagram =
      enableInstagramEmbeds &&
      meaningfulNodes.length === 1 &&
      isInstagramNode(meaningfulNodes[0]);
    const isCustomElement = (child: React.ReactNode) =>
      isValidElement(child) && typeof child.type !== "string";
    const isInstagramLinkElement = (child: React.ReactNode) =>
      isValidElement(child) &&
      typeof (child.props as { href?: string } | undefined)?.href ===
        "string" &&
      isInstagramUrl(
        (child.props as { href?: string } | undefined)?.href ?? "",
      );
    const hasBlockElement = meaningfulNodes.some(
      (child) =>
        isImageNode(child) || isDecklistNode(child) || isInstagramNode(child),
    );
    const hasBlockChild = childrenArray.some(
      (child) => isCustomElement(child) || isInstagramLinkElement(child),
    );

    const paragraphClass =
      "text-sm break-words break-all leading-relaxed text-slate-700 dark:text-slate-200 md:text-base";
    const hasInstagramElement = childrenArray.some(
      (child) =>
        (isValidElement(child) && child.type === InstagramEmbed) ||
        isInstagramLinkElement(child),
    );

    if (onlyImages) {
      const imageChildren = childrenArray.filter((child, index) => {
        const nodeChild = nodeChildren[index];
        if (isImageNode(nodeChild)) return true;
        return !(typeof child === "string" && child.trim().length === 0);
      });
      // Centra y agrupa imagenes para que ocupen la misma fila mientras haya espacio.
      return (
        <div className="flex flex-wrap justify-center gap-4">
          {imageChildren}
        </div>
      );
    }

    if (onlyDeckPreview) {
      const deckChildren = childrenArray.filter((child) => {
        if (typeof child === "string" && child.trim().length === 0) {
          return false;
        }
        return true;
      });
      return <div className="w-full">{deckChildren}</div>;
    }

    if (hasInstagramElement) {
      return <div className="w-full">{childrenArray}</div>;
    }

    if (onlyInstagram) {
      const node = meaningfulNodes[0];
      const url =
        node?.type === "element"
          ? (node.properties?.href as string)
          : (node?.url as string);
      return <InstagramEmbed url={url} />;
    }

    if (hasBlockElement || hasBlockChild) {
      const chunks: React.ReactNode[] = [];
      let inlineBuffer: React.ReactNode[] = [];

      const flushInline = () => {
        if (inlineBuffer.length === 0) return;
        chunks.push(
          <p
            key={`markdown-inline-${chunks.length}`}
            className={paragraphClass}
          >
            {renderInlineWithUnderline(inlineBuffer)}
          </p>,
        );
        inlineBuffer = [];
      };

      childrenArray.forEach((child, index) => {
        const nodeChild = nodeChildren[index];
        const isBlock =
          isImageNode(nodeChild) ||
          isDecklistNode(nodeChild) ||
          isInstagramNode(nodeChild) ||
          isCustomElement(child) ||
          isInstagramLinkElement(child);
        if (isBlock) {
          // Separamos los elementos en bloque para evitar <div>/<section> dentro de <p>.
          flushInline();
          if (isInstagramNode(nodeChild)) {
            const url =
              nodeChild?.type === "element"
                ? (nodeChild.properties?.href as string)
                : (nodeChild?.url as string);
            chunks.push(
              <InstagramEmbed
                key={`markdown-block-${chunks.length}`}
                url={url}
              />,
            );
            return;
          }

          if (isValidElement(child)) {
            chunks.push(
              React.cloneElement(child, {
                key: `markdown-block-${chunks.length}`,
              }),
            );
          } else {
            chunks.push(child);
          }
          return;
        }

        inlineBuffer.push(child);
      });

      flushInline();

      return <>{chunks}</>;
    }

    return (
      <p className={paragraphClass}>{renderInlineWithUnderline(children)}</p>
    );
  },
  a: ({ children, href }) => {
    const isDecklist =
      typeof href === "string" &&
      href.length > 0 &&
      !href.startsWith("http") &&
      (href.includes("%2C") || (href.includes(";") && href.includes(":")));
    const isDeckId =
      typeof href === "string" && /^[0-9a-fA-F]{24}$/.test(href.trim());

    if (isDecklist) {
      // Renderiza el mazo embebido cuando el link es un decklist.
      return <MarkdownDeckPreview decklist={href} />;
    }

    if (isDeckId) {
      return <MarkdownDeckPreview deckId={href.trim()} />;
    }

    if (
      enableInstagramEmbeds &&
      typeof href === "string" &&
      isInstagramUrl(href)
    ) {
      return <InstagramEmbed url={href} />;
    }

    const anchorText = React.Children.toArray(children)
      .filter((child) => typeof child === "string" || typeof child === "number")
      .map((child) => String(child))
      .join(" ")
      .trim();
    // Usamos el texto visible como title para mejorar SEO; si no hay texto, cae al href.
    const anchorTitle =
      anchorText || (typeof href === "string" ? href : "Enlace externo");

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={anchorTitle}
        className="font-semibold text-purple-600 underline decoration-purple-300 transition hover:text-purple-700 dark:text-purple-300"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => {
    const isProductImage =
      typeof src === "string" &&
      src.toLowerCase().includes("/products/") &&
      src.toLowerCase().endsWith(".webp");
    const isCardImage =
      typeof src === "string" &&
      (isCardReference(src) ||
        (src.toLowerCase().includes("cards/") &&
          src.toLowerCase().endsWith(".webp")));

    if (isProductImage) {
      return <MarkdownProductPreview src={src} alt={alt} />;
    }

    if (isCardImage) {
      return <MarkdownCardPreview src={src} alt={alt} />;
    }

    if (!src) return null;
    const isExternal = typeof src === "string" && /^https?:\/\//i.test(src);

    if (isExternal) {
      return (
        <img
          src={src}
          alt={alt ?? "Imagen"}
          title={alt ?? "Imagen"}
          className="h-auto w-[240px] max-w-full rounded-lg border border-slate-200 shadow-sm dark:border-tournament-dark-border"
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt ?? "Imagen"}
        title={alt ?? "Imagen"}
        width={800}
        height={600}
        sizes="(max-width: 640px) 240px, 320px"
        className="h-auto w-[240px] max-w-full rounded-lg border border-slate-200 shadow-sm dark:border-tournament-dark-border"
      />
    );
  },
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200 md:text-base">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200 md:text-base">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{renderInlineWithUnderline(children)}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-purple-300 pl-4 italic text-slate-600 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900 dark:text-white">
      {children}
    </strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.85em] text-slate-700 dark:bg-tournament-dark-muted dark:text-slate-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
      {children}
    </pre>
  ),
});

export function MarkdownContent({
  content,
  className,
  enableInstagramEmbeds = true,
  enableCustomBlocks = true,
}: Props) {
  const normalizedContent = useMemo(
    () => normalizeImageParagraphs(content),
    [content],
  );
  const components = useMemo(
    () => buildComponents(enableInstagramEmbeds),
    [enableInstagramEmbeds],
  );
  const inlineComponents = useMemo<Components>(() => {
    // Mantiene el markdown inline del titulo sin renderizar bloques grandes.
    return {
      ...components,
      h1: ({ children }) => (
        <span className="font-semibold">
          {renderInlineWithUnderline(children)}
        </span>
      ),
      h2: ({ children }) => (
        <span className="font-semibold">
          {renderInlineWithUnderline(children)}
        </span>
      ),
      h3: ({ children }) => (
        <span className="font-semibold">
          {renderInlineWithUnderline(children)}
        </span>
      ),
      p: ({ children }) => (
        <span>{renderInlineWithUnderline(children)}</span>
      ),
    };
  }, [components]);

  const toCustomBlocks = useCallback(
    (value: string): CustomBlock[] =>
      enableCustomBlocks
        ? parseCustomBlocks(value)
        : [{ type: "markdown", content: value }],
    [enableCustomBlocks],
  );

  const blocks = useMemo(
    () => toCustomBlocks(normalizedContent),
    [normalizedContent, toCustomBlocks],
  );

  const renderMarkdown = (value: string, key: string) => (
    <ReactMarkdown
      key={key}
      className="space-y-3"
      remarkPlugins={[remarkGfm]}
      // Se sanitiza el HTML para evitar inyecciones cuando el contenido viene de usuarios.
      rehypePlugins={[[rehypeSanitize, markdownSchema]]}
      components={components}
    >
      {value}
    </ReactMarkdown>
  );

  const renderInlineMarkdown = (value: string, key: string) => (
    <ReactMarkdown
      key={key}
      className="space-y-0"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, markdownSchema]]}
      components={inlineComponents}
    >
      {value}
    </ReactMarkdown>
  );

  const renderBlockList = (blockList: CustomBlock[], keyPrefix: string) => {
    return blockList.map((block, index) => {
      if (block.type === "markdown") {
        return renderMarkdown(block.content, `${keyPrefix}-markdown-${index}`);
      }

      if (block.type === "indent") {
        const leftClass = block.left ? INDENT_MAP[block.left] : null;
        const rightClass = block.right ? INDENT_RIGHT_MAP[block.right] : null;

        return (
          <div
            key={`${keyPrefix}-indent-${index}`}
            className={clsx(leftClass, rightClass)}
          >
            {renderBlockList(
              toCustomBlocks(block.content),
              `${keyPrefix}-indent-${index}-content`,
            )}
          </div>
        );
      }

      return (
        <div key={`${keyPrefix}-card-${index}`} className="mx-auto w-full sm:w-4/5">
          {block.title && (
            <div className="text-left">
              <div className="inline-flex w-fit max-w-full items-center rounded-t-md rounded-b-none border border-b-0 border-tournament-dark-accent bg-white px-3 py-1 text-[0.95rem] font-semibold text-purple-700 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-purple-200 md:text-[1.05rem]">
                {renderInlineMarkdown(
                  block.title,
                  `${keyPrefix}-card-${index}-title`,
                )}
              </div>
            </div>
          )}
          <div className="rounded-lg rounded-tl-none border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface -mt-px">
            {renderBlockList(
              toCustomBlocks(block.content),
              `${keyPrefix}-card-${index}-body`,
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className={clsx("space-y-3 break-words break-all", className)}>
      {renderBlockList(blocks, "root")}
    </div>
  );
}
