"use client";

import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";

type Props = {
  content: string;
  className?: string;
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
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 md:text-base">
      {children}
    </p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-purple-600 underline decoration-purple-300 transition hover:text-purple-700 dark:text-purple-300"
    >
      {children}
    </a>
  ),
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
