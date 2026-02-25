"use client";

import clsx from "clsx";
import Image from "next/image";
import React, { isValidElement, useMemo } from "react";
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
      const element = node as React.ReactElement<{ children?: React.ReactNode }>;
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

// Permite <u> para el subrayado sin abrir el resto del HTML arbitrario.
const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
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

const components: Components = {
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
      href.includes("%2C");
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
    const meaningfulNodes = nodeChildren.filter(
      (child) => !isBlankTextNode(child),
    );
    const onlyImages =
      meaningfulNodes.length > 0 &&
      meaningfulNodes.every((child) => isImageNode(child));
    const onlyDeckPreview =
      meaningfulNodes.length === 1 && isDecklistNode(meaningfulNodes[0]);
    const hasBlockElement = meaningfulNodes.some(
      (child) => isImageNode(child) || isDecklistNode(child),
    );

    const paragraphClass =
      "text-sm leading-relaxed text-slate-700 dark:text-slate-200 md:text-base";

    if (onlyImages) {
      const imageChildren = childrenArray.filter((child, index) => {
        const nodeChild = nodeChildren[index];
        if (isImageNode(nodeChild)) return true;
        return !(typeof child === "string" && child.trim().length === 0);
      });
      // Centra y agrupa imagenes para que ocupen la misma fila mientras haya espacio.
      return (
        <div className="flex flex-wrap justify-center gap-4">{imageChildren}</div>
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

    if (hasBlockElement) {
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
          isImageNode(nodeChild) || isDecklistNode(nodeChild) || false;
        if (isBlock) {
          // Separamos los elementos en bloque para evitar <div>/<section> dentro de <p>.
          flushInline();
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

    return <p className={paragraphClass}>{renderInlineWithUnderline(children)}</p>;
  },
  a: ({ children, href }) => {
    const isDecklist =
      typeof href === "string" &&
      href.length > 0 &&
      !href.startsWith("http") &&
      href.includes("%2C");
    const isDeckId =
      typeof href === "string" && /^[0-9a-fA-F]{24}$/.test(href.trim());

    if (isDecklist) {
      // Renderiza el mazo embebido cuando el link es un decklist.
      return <MarkdownDeckPreview decklist={href} />;
    }

    if (isDeckId) {
      return <MarkdownDeckPreview deckId={href.trim()} />;
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
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

    return (
      <Image
        src={src}
        alt={alt ?? "Imagen"}
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
};

export function MarkdownContent({ content, className }: Props) {
  const normalizedContent = useMemo(
    () => normalizeImageParagraphs(content),
    [content],
  );

  return (
    <ReactMarkdown
      className={clsx("space-y-3", className)}
      remarkPlugins={[remarkGfm]}
      // Se sanitiza el HTML para evitar inyecciones cuando el contenido viene de usuarios.
      rehypePlugins={[[rehypeSanitize, markdownSchema]]}
      components={components}
    >
      {normalizedContent}
    </ReactMarkdown>
  );
}
