"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import { mergeAttributes } from "@tiptap/core";
import {
  FiBold,
  FiChevronDown,
  FiCode,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiType,
  FiUnderline,
  FiX,
} from "react-icons/fi";
import { GiCardDraw } from "react-icons/gi";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { getCardByIdAction, getDeckById, searchCardsAction } from "@/actions";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { Modal } from "../modal/modal";
import { getPlainTextLengthFromMarkdown } from "@/utils/markdown";
import { useToastStore } from "@/store";
import { MarkdownContent } from "./MarkdownContent";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  initialPreview?: boolean;
  enablePreviewToggle?: boolean;
  readOnly?: boolean;
};

const UnderlineHtml = Underline.extend({
  renderMarkdown: (node, helpers) => {
    return `<u>${helpers.renderChildren(node)}</u>`;
  },
});

const CardImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      preview: {
        default: null,
        renderHTML: (attributes) =>
          attributes.preview ? { "data-preview": attributes.preview } : {},
        parseHTML: (element) => element.getAttribute("data-preview") ?? null,
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { src, "data-preview": dataPreview, ...rest } = HTMLAttributes;
    const resolvedSrc = dataPreview || src;

    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, rest, {
        src: resolvedSrc,
        "data-src": src,
        ...(dataPreview ? { "data-preview": dataPreview } : {}),
        style: "max-width: 190px; width: 100%; height: auto;",
      }),
    ];
  },
});

type CardSearchResult = {
  id: string;
  idd: string;
  code: string;
  name: string;
};

type CardSearchResponse = {
  cards: CardSearchResult[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
};

const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;
const isCardReference = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("http")) return false;
  if (trimmed.includes("/")) return false;
  if (trimmed.includes(".")) return false;
  if (!/^[0-9a-zA-Z]+$/.test(trimmed)) return false;
  return true;
};

export const MarkdownEditor = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  initialPreview = false,
  enablePreviewToggle = true,
  readOnly = false,
}: Props) => {
  const headingMenuRef = useRef<HTMLDivElement | null>(null);
  const listMenuRef = useRef<HTMLDivElement | null>(null);
  const previewCacheRef = useRef(new Map<string, string>());
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isHeadingMenuOpen, setIsHeadingMenuOpen] = useState(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const [cardSearch, setCardSearch] = useState("");
  const [manualCardId, setManualCardId] = useState("");
  const [manualCardError, setManualCardError] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<CardSearchResult[]>([]);
  const [cardResults, setCardResults] = useState<CardSearchResult[]>([]);
  const [cardPage, setCardPage] = useState(1);
  const [cardTotalPages, setCardTotalPages] = useState(1);
  const [cardTotalCount, setCardTotalCount] = useState(0);
  const [isCardSearchLoading, setIsCardSearchLoading] = useState(false);
  const [cardSearchError, setCardSearchError] = useState<string | null>(null);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [deckIdValue, setDeckIdValue] = useState("");
  const [, setEditorTick] = useState(0);
  const [isPublicPreview, setIsPublicPreview] = useState(initialPreview);
  const showToast = useToastStore((state) => state.showToast);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      UnderlineHtml,
      Link.configure({
        openOnClick: false,
        autolink: false,
        HTMLAttributes: {
          class:
            "text-purple-600 underline decoration-purple-300 dark:text-purple-300",
        },
      }),
      CardImageExtension.configure({
        HTMLAttributes: {
          class:
            "my-2 inline-block h-auto w-[140px] max-w-full rounded-lg border border-slate-200 shadow-sm sm:w-[170px] md:w-[190px] dark:border-tournament-dark-border",
        },
      }),
      Markdown,
    ],
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] outline-none text-sm leading-relaxed text-slate-700 dark:text-slate-200" +
          " space-y-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold" +
          " [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5" +
          " [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:font-semibold" +
          " [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5" +
          " dark:[&_code]:bg-tournament-dark-muted",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const markdown = currentEditor.getMarkdown();
      if (markdown !== value) {
        onChange(markdown);
      }
    },
  });

  const updateCardPreview = useCallback(
    (cardId: string, preview: string) => {
      if (!editor) return;
      editor.commands.command(({ tr }) => {
        let updated = false;

        tr.doc.descendants((node, pos) => {
          if (node.type.name !== "image") return;
          if (node.attrs?.src !== cardId) return;
          if (node.attrs?.preview === preview) return;

          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            preview,
          });
          updated = true;
        });

        return updated;
      });
    },
    [editor],
  );

  useEffect(() => {
    if (!editor) return;
    const current = editor.getMarkdown();
    if (value !== current) {
      editor.commands.setContent(value, {
        emitUpdate: false,
        contentType: "markdown",
      });
    }
  }, [editor, value, updateCardPreview]);

  useEffect(() => {
    if (!editor) return;
    const originalCreateNodeViews = editor.createNodeViews.bind(editor);

    editor.createNodeViews = () => {
      // Evitamos flushSync en ciclos de vida de React al diferir el montaje de NodeViews.
      setTimeout(() => {
        if (!editor.isDestroyed) {
          originalCreateNodeViews();
        }
      }, 0);
    };

    return () => {
      editor.createNodeViews = originalCreateNodeViews;
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    let isActive = true;

    const resolveCardPreviews = async () => {
      const ids = new Set<string>();

      editor.state.doc.descendants((node) => {
        if (node.type.name !== "image") return;
        const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
        const preview = node.attrs?.preview;
        if (!isCardReference(src) || preview) return;
        ids.add(src);
      });

      for (const id of ids) {
        if (!isActive) return;
        const cached = previewCacheRef.current.get(id);
        if (cached) {
          updateCardPreview(id, cached);
          continue;
        }
        try {
          const card = await getCardByIdAction({ cardId: id });
          if (!card) continue;
          const preview = `/cards/${card.code}-${card.idd}.webp`;
          previewCacheRef.current.set(id, preview);
          updateCardPreview(id, preview);
        } catch {
          // Si falla, dejamos el id para reintentar luego.
        }
      }
    };

    void resolveCardPreviews();

    return () => {
      isActive = false;
    };
  }, [editor, value, updateCardPreview]);

  useEffect(() => {
    if (readOnly) {
      setIsPublicPreview(true);
      return;
    }
    setIsPublicPreview(initialPreview);
  }, [initialPreview, readOnly]);

  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      // Fuerza el render para reflejar el estado de los botones aunque no cambie el texto.
      setEditorTick((prev) => prev + 1);
    };

    editor.on("transaction", handleTransaction);
    return () => {
      editor.off("transaction", handleTransaction);
    };
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Cierra los menús si el click no ocurre dentro de cada contenedor.
      if (headingMenuRef.current && !headingMenuRef.current.contains(target)) {
        setIsHeadingMenuOpen(false);
      }
      if (listMenuRef.current && !listMenuRef.current.contains(target)) {
        setIsListMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isCardModalOpen) return;

    let isActive = true;
    const searchTerm = cardSearch.trim();

    // Limpia la lista al abrir/buscar para evitar mostrar resultados anteriores.
    setCardResults([]);
    setCardSearchError(null);
    setCardTotalCount(0);
    setCardTotalPages(1);
    setIsCardSearchLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = (await searchCardsAction({
          text: searchTerm.length > 0 ? searchTerm : undefined,
          take: 30,
          page: cardPage,
        })) as CardSearchResponse;
        if (!isActive) return;
        setCardResults(results.cards);
        setCardTotalCount(results.totalCount);
        setCardTotalPages(results.totalPages);
        setCardPage(results.currentPage);
      } catch {
        if (!isActive) return;
        setCardSearchError("No se pudieron cargar las cartas.");
        setCardResults([]);
        setCardTotalCount(0);
        setCardTotalPages(1);
      } finally {
        if (!isActive) return;
        setIsCardSearchLoading(false);
      }
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [cardSearch, isCardModalOpen, cardPage]);

  useEffect(() => {
    if (!isCardModalOpen) return;
    setCardPage(1);
  }, [cardSearch, isCardModalOpen]);

  const visibleCards = useMemo(() => cardResults, [cardResults]);
  const selectedCardIds = useMemo(
    () => new Set(selectedCards.map((card) => card.id)),
    [selectedCards],
  );

  const toggleCardSelection = (card: CardSearchResult) => {
    setSelectedCards((prev) =>
      prev.some((item) => item.id === card.id)
        ? prev.filter((item) => item.id !== card.id)
        : [...prev, card],
    );
  };

  const handleAddManualCard = async () => {
    const trimmedId = manualCardId.trim();
    if (!trimmedId) return;

    setManualCardError(null);
    try {
      const card = await getCardByIdAction({ cardId: trimmedId });
      if (!card) {
        setManualCardError("No se encontro la carta con ese id.");
        return;
      }
      setSelectedCards((prev) =>
        prev.some((item) => item.id === card.id) ? prev : [...prev, card],
      );
      setCardResults((prev) =>
        prev.some((item) => item.id === card.id) ? prev : [card, ...prev],
      );
      setManualCardId("");
    } catch {
      setManualCardError("No se pudo cargar la carta.");
    }
  };

  const handleInsertCards = () => {
    if (!editor || selectedCards.length === 0) return;

    const nodes = selectedCards.map((card) => ({
      type: "image",
      attrs: {
        src: card.id,
        alt: card.name ?? "Carta",
        preview: `/cards/${card.code}-${card.idd}.webp`,
      },
    }));

    // Insertamos todas las cartas como bloques consecutivos para mantener el flujo visual.
    editor.chain().focus().insertContent(nodes).run();
    selectedCards.forEach((card) => {
      previewCacheRef.current.set(card.id, `/cards/${card.code}-${card.idd}.webp`);
    });
    setSelectedCards([]);
    setIsCardModalOpen(false);
  };

  const openLinkModal = () => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    const selectedText = empty
      ? ""
      : editor.state.doc.textBetween(from, to, " ");
    const currentHref = editor.getAttributes("link").href ?? "";

    setLinkText(selectedText);
    setLinkUrl(currentHref);
    setIsLinkModalOpen(true);
  };

  const handleInsertLink = () => {
    if (!editor) return;
    const href = linkUrl.trim();
    if (!href) return;

    const { empty } = editor.state.selection;
    const text = linkText.trim() || href;

    if (!empty && linkText.trim().length === 0) {
      editor.chain().focus().setLink({ href }).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    }

    setIsLinkModalOpen(false);
  };

  const handleInsertDecklist = async () => {
    if (!editor) return;
    const deckId = deckIdValue.trim();
    if (!deckId) return;
    if (!/^[0-9a-fA-F]{24}$/.test(deckId)) {
      showToast("El id del mazo no es valido.", "error");
      return;
    }

    try {
      const deck = await getDeckById(deckId);
      if (!deck) {
        showToast("No se encontro ningun mazo con ese id.", "error");
        return;
      }
    } catch {
      showToast("No se pudo validar el mazo.", "error");
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: "Mazo embebido",
        marks: [{ type: "link", attrs: { href: deckId } }],
      })
      .run();

    setDeckIdValue("");
    setIsDeckModalOpen(false);
  };

  const currentHeadingLevel = [1, 2, 3].find((level) =>
    editor?.isActive("heading", { level }),
  );

  const handleSelectHeading = (level?: 1 | 2 | 3) => {
    if (!editor) return;

    if (!level) {
      editor.chain().focus().setParagraph().run();
      setIsHeadingMenuOpen(false);
      return;
    }

    editor.chain().focus().toggleHeading({ level }).run();
    setIsHeadingMenuOpen(false);
  };

  const handleSelectList = (type: "bullet" | "ordered") => {
    if (!editor) return;
    if (type === "bullet") {
      editor.chain().focus().toggleBulletList().run();
    } else {
      editor.chain().focus().toggleOrderedList().run();
    }
    setIsListMenuOpen(false);
  };

  const toolbarButtonClass = (active = false) =>
    clsx(
      "inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300",
      active &&
        "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200",
    );

  const dropdownButtonClass = (active = false) =>
    clsx(
      "inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300",
      active &&
        "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200",
    );

  const textLength = useMemo(
    () => getPlainTextLengthFromMarkdown(value),
    [value],
  );
  const isEmpty = value.trim().length === 0;
  const isOverLimit = maxLength !== undefined && textLength > maxLength;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}

      <div className="rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tournament-dark-accent px-3 py-2 dark:border-tournament-dark-border">
          <div
            className={clsx(
              "flex flex-wrap items-center gap-1",
              (isPublicPreview || readOnly) && "pointer-events-none opacity-60",
            )}
          >
            <div className="relative" ref={headingMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsHeadingMenuOpen((prev) => !prev);
                  setIsListMenuOpen(false);
                }}
                className={dropdownButtonClass(
                  Boolean(currentHeadingLevel) || isHeadingMenuOpen,
                )}
                title="Titulos"
              >
                <FiType className="h-4 w-4" />
                <FiChevronDown className="h-3 w-3" />
              </button>

              {isHeadingMenuOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-lg border border-tournament-dark-accent bg-white p-2 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                  <button
                    type="button"
                    onClick={() => handleSelectHeading()}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-tournament-dark-muted",
                      !currentHeadingLevel &&
                        "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200",
                    )}
                  >
                    <span>Texto normal</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Ctrl+Alt+0
                    </span>
                  </button>
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleSelectHeading(level as 1 | 2 | 3)}
                      className={clsx(
                        "mt-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-tournament-dark-muted",
                        currentHeadingLevel === level &&
                          "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200",
                      )}
                    >
                      <span
                        className={clsx(
                          "font-semibold",
                          level === 1 && "text-lg",
                          level === 2 && "text-base",
                          level === 3 && "text-sm",
                        )}
                      >
                        Titulo {level}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Ctrl+Alt+{level}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={toolbarButtonClass(editor?.isActive("bold") ?? false)}
              title="Negrilla"
            >
              <FiBold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={toolbarButtonClass(
                editor?.isActive("italic") ?? false,
              )}
              title="Cursiva"
            >
              <FiItalic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={toolbarButtonClass(
                editor?.isActive("underline") ?? false,
              )}
              title="Subrayado"
            >
              <FiUnderline className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={openLinkModal}
              className={toolbarButtonClass(editor?.isActive("link") ?? false)}
              title="Link"
            >
              <FiLink className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCardModalOpen(true)}
              className={toolbarButtonClass(false)}
              title="Insertar carta"
            >
              <FiImage className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsDeckModalOpen(true)}
              className={toolbarButtonClass(false)}
              title="Insertar mazo"
            >
              <GiCardDraw className="h-4 w-4" />
            </button>

            <div className="relative" ref={listMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsListMenuOpen((prev) => !prev);
                  setIsHeadingMenuOpen(false);
                }}
                className={dropdownButtonClass(
                  (editor?.isActive("bulletList") ||
                    editor?.isActive("orderedList")) ??
                    false,
                )}
                title="Listas"
              >
                <FiList className="h-4 w-4" />
                <FiChevronDown className="h-3 w-3" />
              </button>

              {isListMenuOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-lg border border-tournament-dark-accent bg-white p-2 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                  <button
                    type="button"
                    onClick={() => handleSelectList("bullet")}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-tournament-dark-muted",
                      editor?.isActive("bulletList") &&
                        "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200",
                    )}
                  >
                    <span>Lista de viñetas</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Ctrl+Shift+8
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectList("ordered")}
                    className={clsx(
                      "mt-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-tournament-dark-muted",
                      editor?.isActive("orderedList") &&
                        "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200",
                    )}
                  >
                    <span>Lista numerada</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Ctrl+Shift+7
                    </span>
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              className={toolbarButtonClass(
                editor?.isActive("codeBlock") ?? false,
              )}
              title="Codigo"
            >
              <FiCode className="h-4 w-4" />
            </button>
          </div>
          {enablePreviewToggle && (
            <button
              type="button"
              onClick={() => {
                if (readOnly) return;
                setIsPublicPreview((prev) => !prev);
              }}
              className={clsx(
                "rounded-md px-3 py-1 text-xs font-semibold transition",
                isPublicPreview
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "text-purple-600 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10",
                readOnly && "cursor-not-allowed opacity-60",
              )}
            >
              {isPublicPreview ? "Edición" : "Vista pública"}
            </button>
          )}
        </div>

        <div className="p-3">
          <div className="relative rounded-lg border border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
            {isPublicPreview ? (
              isEmpty ? (
                <div className="text-sm text-slate-400 dark:text-slate-500">
                  {placeholder ?? "Escribe la descripcion del torneo"}
                </div>
              ) : (
                <MarkdownContent content={value} />
              )
            ) : (
              <>
                {isEmpty && (
                  <div className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400 dark:text-slate-500">
                    {placeholder ?? "Escribe la descripcion del torneo"}
                  </div>
                )}
                <EditorContent editor={editor} />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-3 pb-3 text-xs">
          <span
            className={clsx(
              "text-xs",
              error
                ? "text-red-500 dark:text-red-400"
                : "text-slate-500 dark:text-slate-400",
            )}
          >
            {error}
          </span>
          {maxLength !== undefined && (
            <span
              className={clsx(
                "text-slate-500 dark:text-slate-400",
                isOverLimit && "text-red-500 dark:text-red-400",
              )}
            >
              {textLength}/{maxLength}
            </span>
          )}
        </div>
      </div>

      {isCardModalOpen && (
        <Modal
          className="inset-0 flex items-center justify-center p-4"
          close={() => setIsCardModalOpen(false)}
        >
          <div className="w-full max-w-4xl rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Seleccionar cartas
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Selecciona una o varias cartas, o agrega el id de la carta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-tournament-dark-accent text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <input
                  value={cardSearch}
                  onChange={(event) => setCardSearch(event.target.value)}
                  placeholder="Buscar por nombre o codigo"
                  className="w-full min-w-0 rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
                />
                <span className="whitespace-nowrap text-end text-xs text-slate-400 dark:text-slate-500">
                  {cardTotalCount} resultados
                </span>
                <input
                  value={manualCardId}
                  onChange={(event) => setManualCardId(event.target.value)}
                  placeholder="ID de la carta"
                  className="w-full min-w-0 rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddManualCard}
                  className="rounded-lg border border-purple-300 px-4 py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-500/10"
                >
                  Agregar id
                </button>
              </div>
              {manualCardError && (
                <p className="text-xs text-rose-500 dark:text-rose-400">
                  {manualCardError}
                </p>
              )}

              <div className="relative max-h-[360px] min-h-[360px] overflow-y-auto rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {visibleCards.map((card) => {
                    const src = `/cards/${card.code}-${card.idd}.webp`;
                    const isSelected = selectedCardIds.has(card.id);

                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => toggleCardSelection(card)}
                        className={clsx(
                          "relative rounded-lg border bg-white p-2 text-left transition hover:border-purple-400 dark:bg-tournament-dark-surface",
                          isSelected
                            ? "border-purple-500 ring-2 ring-purple-400/40"
                            : "border-transparent",
                        )}
                      >
                        <Image
                          src={src}
                          alt={card.name}
                          width={160}
                          height={230}
                          className="h-auto w-full rounded-md"
                        />
                        <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">
                          {card.name}
                        </span>
                        <span className="block truncate text-[10px] text-slate-400 dark:text-slate-500">
                          {card.code}-{card.idd}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {isCardSearchLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 text-sm text-slate-500 backdrop-blur-sm dark:bg-tournament-dark-muted-strong/80 dark:text-slate-300">
                    Buscando cartas...
                  </div>
                )}
                {cardSearchError && !isCardSearchLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-rose-500 dark:text-rose-300">
                    {cardSearchError}
                  </div>
                )}
              </div>
              {cardTotalPages > 1 && (
                <PaginationLine
                  currentPage={cardPage}
                  totalPages={cardTotalPages}
                  searchParams={EMPTY_SEARCH_PARAMS}
                  pathname=""
                  onPageChange={setCardPage}
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedCards.length} seleccionadas
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCardModalOpen(false)}
                    className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertCards}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
                    disabled={selectedCards.length === 0}
                  >
                    Insertar cartas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {isLinkModalOpen && (
        <Modal
          className="inset-0 flex items-center justify-center p-4"
          close={() => setIsLinkModalOpen(false)}
        >
          <div className="w-full max-w-lg rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Insertar link
            </h3>
            <div className="mt-4 space-y-3">
              <input
                value={linkText}
                onChange={(event) => setLinkText(event.target.value)}
                placeholder="Texto del link"
                className="w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
              />
              <input
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://"
                className="w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
              >
                Insertar link
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isDeckModalOpen && (
        <Modal
          className="inset-0 flex items-center justify-center p-4"
          close={() => setIsDeckModalOpen(false)}
        >
          <div className="w-full max-w-lg rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Insertar mazo embebido
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Pega el id del mazo para mostrarlo dentro del markdown.
            </p>
            <input
              value={deckIdValue}
              onChange={(event) => setDeckIdValue(event.target.value)}
              placeholder="ID del mazo"
              className="mt-4 w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeckModalOpen(false)}
                className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInsertDecklist}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
              >
                Insertar mazo
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
