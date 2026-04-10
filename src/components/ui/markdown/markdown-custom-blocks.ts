"use client";

import { Node, mergeAttributes, type JSONContent } from "@tiptap/core";
import type {
  MarkdownParseHelpers,
  MarkdownRendererHelpers,
  MarkdownToken,
  MarkdownTokenizer,
  RenderContext,
} from "@tiptap/core";

type IndentSize = "sm" | "md" | "lg" | "xl";

const INDENT_LEFT_CLASS: Record<IndentSize, string> = {
  sm: "ml-4",
  md: "ml-8",
  lg: "ml-12",
  xl: "ml-16",
};

const INDENT_RIGHT_CLASS: Record<IndentSize, string> = {
  sm: "mr-4",
  md: "mr-8",
  lg: "mr-12",
  xl: "mr-16",
};

const INDENT_SIZES: IndentSize[] = ["sm", "md", "lg", "xl"];

const normalizeIndentSize = (value?: string | null): IndentSize | null => {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();
  return INDENT_SIZES.includes(normalized as IndentSize)
    ? (normalized as IndentSize)
    : null;
};

const parseAttribute = (attrs: string, name: string) => {
  const match = new RegExp(`${name}\\s*=\\s*(sm|md|lg|xl)`, "i").exec(attrs);
  return match?.[1] ?? null;
};

const parseTitle = (attrs: string) => {
  const double = /title\s*=\s*"(.*?)"/i.exec(attrs);
  if (double?.[1]) return double[1];
  const single = /title\s*=\s*'(.*?)'/i.exec(attrs);
  return single?.[1] ?? null;
};

// Tokenizador custom para soportar [indent]...[/indent] como bloque en el editor.
const indentTokenizer: MarkdownTokenizer = {
  name: "indent_block",
  level: "block",
  start: (src) => {
    const index = src.search(/\[indent\b/i);
    return index < 0 ? -1 : index;
  },
  tokenize: (src, _tokens, lexer) => {
    const match = /^\[indent([^\]]*)\]([\s\S]*?)\[\/indent\]/i.exec(src);
    if (!match) return undefined;

    const attrs = match[1] ?? "";
    const content = (match[2] ?? "").trim();
    const left = normalizeIndentSize(parseAttribute(attrs, "left"));
    const right = normalizeIndentSize(parseAttribute(attrs, "right"));

    return {
      type: "indent_block",
      raw: match[0],
      left,
      right,
      tokens: lexer.blockTokens(content),
    } satisfies MarkdownToken;
  },
};

// Tokenizador custom para soportar [card title="..."]...[/card].
const cardTokenizer: MarkdownTokenizer = {
  name: "card_block",
  level: "block",
  start: (src) => {
    const index = src.search(/\[card\b/i);
    return index < 0 ? -1 : index;
  },
  tokenize: (src, _tokens, lexer) => {
    const match = /^\[card([^\]]*)\]([\s\S]*?)\[\/card\]/i.exec(src);
    if (!match) return undefined;

    const attrs = match[1] ?? "";
    const content = (match[2] ?? "").trim();
    const title = parseTitle(attrs)?.trim() || null;

    return {
      type: "card_block",
      raw: match[0],
      title,
      tokens: lexer.blockTokens(content),
    } satisfies MarkdownToken;
  },
};

export const IndentBlock = Node.create({
  name: "indentBlock",
  group: "block",
  // Permitimos contenido vacio para que el bloque pueda eliminarse facilmente.
  content: "block*",
  defining: true,
  isolating: false,
  selectable: true,

  addAttributes() {
    return {
      left: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-left"),
        renderHTML: (attributes) =>
          attributes.left ? { "data-left": attributes.left } : {},
      },
      right: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-right"),
        renderHTML: (attributes) =>
          attributes.right ? { "data-right": attributes.right } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-indent-block]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const left = normalizeIndentSize(node.attrs.left);
    const right = normalizeIndentSize(node.attrs.right);
    const classes = [
      "my-3",
      left ? INDENT_LEFT_CLASS[left] : null,
      right ? INDENT_RIGHT_CLASS[right] : null,
    ]
      .filter(Boolean)
      .join(" ");

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-indent-block": "true",
        class: classes,
      }),
      0,
    ];
  },

  addKeyboardShortcuts() {
    const shouldLiftIndent = (direction: "backward" | "forward") => {
      const { state } = this.editor;
      const { selection } = state;
      if (!selection.empty) return false;

      const { $from } = selection;
      let indentDepth: number | null = null;

      for (let depth = $from.depth; depth > 0; depth -= 1) {
        if ($from.node(depth).type.name === this.name) {
          indentDepth = depth;
          break;
        }
      }

      if (indentDepth === null) return false;

      const indentNode = $from.node(indentDepth);
      const childDepth = indentDepth + 1;
      if (childDepth > $from.depth) return false;

      const childIndex = $from.index(childDepth);
      const isFirstChild = childIndex === 0;
      const isLastChild = childIndex === indentNode.childCount - 1;
      const isAtStart =
        $from.parentOffset === 0 && isFirstChild && direction === "backward";
      const isAtEnd =
        $from.parentOffset === $from.parent.content.size &&
        isLastChild &&
        direction === "forward";

      if (isAtStart || isAtEnd) {
        // Levantamos el contenido para eliminar la sangria sin perder el texto.
        return this.editor.commands.lift(this.name);
      }

      return false;
    };

    return {
      Backspace: () => shouldLiftIndent("backward"),
      Delete: () => shouldLiftIndent("forward"),
    };
  },

  markdownTokenName: "indent_block",
  markdownTokenizer: indentTokenizer,

  parseMarkdown: (token: MarkdownToken, helpers: MarkdownParseHelpers) => {
    const left = normalizeIndentSize(token.left);
    const right = normalizeIndentSize(token.right);
    const content = helpers.parseChildren(token.tokens ?? []);
    return helpers.createNode("indentBlock", { left, right }, content);
  },

  renderMarkdown: (
    node: {
      attrs?: { left?: string | null; right?: string | null };
      content?: JSONContent[];
    },
    helpers: MarkdownRendererHelpers,
    _ctx: RenderContext,
  ) => {
    void _ctx;
    const left = normalizeIndentSize(node.attrs?.left ?? null);
    const right = normalizeIndentSize(node.attrs?.right ?? null);
    const attrs: string[] = [];
    if (left) attrs.push(`left=${left}`);
    if (right) attrs.push(`right=${right}`);
    const attrsString = attrs.length ? ` ${attrs.join(" ")}` : "";
    const content = helpers.renderChildren(node.content ?? []);

    return `[indent${attrsString}]\n${content}\n[/indent]`;
  },
});

export const CardBlock = Node.create({
  name: "cardBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) =>
          attributes.title ? { "data-title": attributes.title } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-card-block]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const title = typeof node.attrs.title === "string" ? node.attrs.title : "";

    const wrapperAttrs = mergeAttributes(HTMLAttributes, {
      "data-card-block": "true",
      class: "mx-auto w-full sm:w-4/5",
    });

    const children = [];
    if (title) {
      children.push([
        "div",
        {
          class:
            "inline-flex w-fit max-w-full items-center rounded-t-md rounded-b-none border border-b-0 border-tournament-dark-accent bg-white px-3 py-1 text-[0.95rem] font-semibold text-purple-700 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-purple-200 md:text-[1.05rem]",
          contenteditable: "false",
        },
        title,
      ]);
    }

    children.push([
      "div",
      {
        class:
          "rounded-lg rounded-tl-none border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface -mt-px",
      },
      0,
    ]);

    return ["div", wrapperAttrs, ...children];
  },

  markdownTokenName: "card_block",
  markdownTokenizer: cardTokenizer,

  parseMarkdown: (token: MarkdownToken, helpers: MarkdownParseHelpers) => {
    const title = typeof token.title === "string" ? token.title : null;
    const content = helpers.parseChildren(token.tokens ?? []);
    return helpers.createNode("cardBlock", { title }, content);
  },

  renderMarkdown: (
    node: { attrs?: { title?: string | null }; content?: JSONContent[] },
    helpers: MarkdownRendererHelpers,
    _ctx: RenderContext,
  ) => {
    void _ctx;
    const rawTitle = node.attrs?.title ?? "";
    const safeTitle =
      typeof rawTitle === "string" && rawTitle.trim().length > 0
        ? rawTitle.replace(/"/g, '\\"')
        : "";
    const titleAttr = safeTitle ? ` title="${safeTitle}"` : "";
    const content = helpers.renderChildren(node.content ?? []);

    return `[card${titleAttr}]\n${content}\n[/card]`;
  },
});
