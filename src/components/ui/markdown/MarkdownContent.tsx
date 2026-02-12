"use client";

import clsx from "clsx";
import Image from "next/image";
import React, { isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";
import { MarkdownDeckPreview } from "./MarkdownDeckPreview";
import { MarkdownCardImage } from "./MarkdownCardImage";

type Props = {
  content: string;
  className?: string;
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

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white md:text-xl">
      {children}
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
        isDecklistHref(child.properties?.href)) ||
      (child?.type === "link" && isDecklistHref(child.url));
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
            {inlineBuffer}
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

    return (
      <p className={paragraphClass}>
        {children}
      </p>
    );
  },
  a: ({ children, href }) => {
    const isDecklist =
      typeof href === "string" &&
      href.length > 0 &&
      !href.startsWith("http") &&
      href.includes("%2C");

    if (isDecklist) {
      // Renderiza el mazo embebido cuando el link es un decklist.
      return <MarkdownDeckPreview decklist={href} />;
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
    const isCardImage =
      typeof src === "string" &&
      src.toLowerCase().includes("cards/") &&
      src.toLowerCase().endsWith(".webp");

    if (isCardImage) {
      return <MarkdownCardImage src={src} alt={alt} />;
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
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
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
  return (
    <ReactMarkdown
      className={clsx("space-y-3", className)}
      remarkPlugins={[remarkGfm]}
      // Se sanitiza el HTML para evitar inyecciones cuando el contenido viene de usuarios.
      rehypePlugins={[rehypeSanitize]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
