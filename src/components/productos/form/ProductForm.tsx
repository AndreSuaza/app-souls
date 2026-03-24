"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import { MarkdownEditor } from "@/components";
import { searchAdminDecksAction } from "@/actions";
import { FormField, FormInput, FormSelect } from "@/components/ui/form";
import type { AdminProductDetail } from "@/interfaces";
import { MarkdownDeckModal } from "@/components/ui/markdown/MarkdownDeckModal";
import { ProductImageModal } from "./ProductImageModal";
import { toBlobPath } from "@/utils/blob-path";

type ProductFormValues = {
  name: string;
  imageUrl: string;
  code: string;
  index?: number;
  releaseDate: string;
  description: string;
  url: string;
  show: boolean;
  deckId: string;
  numberCards: number;
};

export type ProductSubmitValues = {
  name: string;
  imageUrl: string;
  code: string;
  index?: number;
  releaseDate: string;
  description: string;
  url: string;
  show: boolean;
  deckId: string;
  numberCards: number;
};

type DeckSearchResult = {
  id: string;
  name: string;
  imagen: string;
  userNickname: string;
  cardsNumber: number;
};

type Props = {
  images: string[];
  initialValues?: Partial<AdminProductDetail>;
  submitLabel?: string;
  onSubmit: (values: ProductSubmitValues) => void;
  onDelete?: () => void;
  cancelHref?: string;
  readOnly?: boolean;
};

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const stripExtension = (filename: string) => filename.replace(/\.[^/.]+$/, "");
const getLabelFromUrl = (url: string) => {
  const clean = toBlobPath(url);
  return clean.split("/").pop() ?? url;
};

const parseReleaseDate = (value?: string | null) => {
  if (!value) return { month: "", year: "" };
  const parts = value.trim().split(" ");
  if (parts.length < 2) return { month: "", year: "" };
  const year = parts[parts.length - 1];
  const month = parts.slice(0, -1).join(" ");
  return { month, year };
};

export const ProductForm = ({
  images,
  initialValues,
  submitLabel = "Guardar",
  onSubmit,
  onDelete,
  cancelHref,
  readOnly = false,
}: Props) => {
  const isEditing = Boolean(initialValues?.id);
  const defaultValues = useMemo<ProductFormValues>(
    () => ({
      name: initialValues?.name ?? "",
      imageUrl: initialValues?.imageUrl ?? "",
      code: initialValues?.code ?? "",
      index: initialValues?.index,
      releaseDate: initialValues?.releaseDate ?? "",
      description: initialValues?.description ?? "",
      url: initialValues?.url ?? "",
      show: initialValues?.show ?? true,
      deckId: initialValues?.deckId ?? "",
      numberCards: initialValues?.numberCards ?? 0,
    }),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({ defaultValues });

  const codeValue = watch("code") ?? "";
  const imageUrlValue = watch("imageUrl") ?? "";
  const deckIdValue = watch("deckId") ?? "";
  const numberCardsValue = watch("numberCards") ?? 0;
  const releaseDateValue = watch("releaseDate");

  const initialRelease = useMemo(
    () => parseReleaseDate(initialValues?.releaseDate),
    [initialValues?.releaseDate],
  );

  const [releaseMonth, setReleaseMonth] = useState(initialRelease.month);
  const [releaseYear, setReleaseYear] = useState(initialRelease.year);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const baseYears = Array.from({ length: 11 }, (_, index) =>
      String(currentYear - 5 + index),
    );
    const merged = new Set(baseYears);
    if (initialRelease.year) {
      merged.add(initialRelease.year);
    }
    return Array.from(merged).sort();
  }, [initialRelease.year]);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [deckSearch, setDeckSearch] = useState("");
  const [deckResults, setDeckResults] = useState<DeckSearchResult[]>([]);
  const [deckPage, setDeckPage] = useState(1);
  const [deckTotalPages, setDeckTotalPages] = useState(1);
  const [deckTotalCount, setDeckTotalCount] = useState(0);
  const [deckLoading, setDeckLoading] = useState(false);
  const [deckError, setDeckError] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(
    initialValues?.deckId ?? null,
  );
  const [selectedDeckName, setSelectedDeckName] = useState(
    initialValues?.deckName ?? "",
  );

  useEffect(() => {
    setReleaseMonth(initialRelease.month);
    setReleaseYear(initialRelease.year);
  }, [initialRelease.month, initialRelease.year]);

  useEffect(() => {
    if (!releaseMonth || !releaseYear) {
      setValue("releaseDate", "", { shouldValidate: false });
      return;
    }
    // Sincroniza el string de lanzamiento con los selects de mes y año.
    setValue("releaseDate", `${releaseMonth} ${releaseYear}`, {
      shouldValidate: false,
    });
  }, [releaseMonth, releaseYear, setValue]);

  useEffect(() => {
    if (!initialValues?.deckId) return;
    setSelectedDeckId(initialValues.deckId);
    setSelectedDeckName(initialValues.deckName ?? "");
    setValue("deckId", initialValues.deckId, { shouldValidate: true });
    setValue("numberCards", initialValues.numberCards ?? 0, {
      shouldValidate: true,
    });
  }, [
    initialValues?.deckId,
    initialValues?.deckName,
    initialValues?.numberCards,
    setValue,
  ]);

  useEffect(() => {
    if (!initialValues?.imageUrl && !initialValues?.code) return;
    const initialPath = initialValues?.imageUrl
      ? toBlobPath(initialValues.imageUrl)
      : "";
    const match =
      (initialPath ? images.find((image) => image === initialPath) : null) ??
      images.find(
        (image) => stripExtension(getLabelFromUrl(image)) === initialValues.code,
      ) ??
      null;
    setSelectedImage(match);
  }, [images, initialValues?.code, initialValues?.imageUrl]);

  useEffect(() => {
    if (!isDeckModalOpen) return;
    let active = true;

    const loadDecks = async () => {
      try {
        setDeckLoading(true);
        const searchTerm = deckSearch.trim();
        const result = await searchAdminDecksAction({
          text: searchTerm.length > 0 ? searchTerm : undefined,
          page: deckPage,
        });

        if (!active) return;
        setDeckResults(result.decks);
        setDeckTotalPages(result.totalPages);
        setDeckTotalCount(result.totalCount);
        setDeckError(null);
      } catch {
        if (!active) return;
        setDeckResults([]);
        setDeckTotalPages(1);
        setDeckTotalCount(0);
        setDeckError("No se pudieron cargar los mazos.");
      } finally {
        if (active) {
          setDeckLoading(false);
        }
      }
    };

    loadDecks();

    return () => {
      active = false;
    };
  }, [deckPage, deckSearch, isDeckModalOpen]);

  useEffect(() => {
    if (!isDeckModalOpen) return;
    setDeckPage(1);
  }, [deckSearch, isDeckModalOpen]);

  const handleConfirmImage = () => {
    if (!pendingImage) return;
    const label = getLabelFromUrl(pendingImage);
    const code = stripExtension(label).toUpperCase();
    setValue("code", code, { shouldValidate: true });
    setValue("imageUrl", pendingImage, { shouldValidate: true });
    setSelectedImage(pendingImage);
    setIsImageModalOpen(false);
  };

  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setValue("deckId", deckId, { shouldValidate: true });
    const deck = deckResults.find((item) => item.id === deckId);
    if (deck) {
      setSelectedDeckName(deck.name);
      setValue("numberCards", deck.cardsNumber, { shouldValidate: true });
    }
  };

  const handleInvalidSubmit = () => {
    // Fuerza la validación en campos controlados externamente.
    if (!codeValue) {
      setValue("code", codeValue, { shouldValidate: true });
    }
    if (!imageUrlValue) {
      setValue("imageUrl", imageUrlValue, { shouldValidate: true });
    }
    if (!deckIdValue) {
      setValue("deckId", deckIdValue, { shouldValidate: true });
    }
    if (!releaseDateValue) {
      setValue("releaseDate", releaseDateValue, { shouldValidate: true });
    }
  };

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(values);
  }, handleInvalidSubmit);

  return (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-5 rounded-xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
    >
      <input
        type="hidden"
        {...register("imageUrl", { required: "La imagen es obligatoria" })}
      />
      <input
        type="hidden"
        {...register("code", { required: "La imagen es obligatoria" })}
      />
      <input
        type="hidden"
        {...register("releaseDate", {
          required: "La fecha de lanzamiento es obligatoria",
        })}
      />
      <input
        type="hidden"
        {...register("deckId", { required: "Debes seleccionar un mazo" })}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          label="Nombre"
          labelFor="product-name"
          error={errors.name?.message}
        >
          <FormInput
            id="product-name"
            placeholder="Ej. Memorias Olvidadas"
            hasError={!!errors.name}
            disabled={readOnly}
            {...register("name", { required: "El nombre es obligatorio" })}
          />
        </FormField>

        <FormField
          label="URL"
          labelFor="product-url"
          error={errors.url?.message}
        >
          <FormInput
            id="product-url"
            placeholder="memorias-olvidadas"
            hasError={!!errors.url}
            disabled={readOnly}
            {...register("url", { required: "La URL es obligatoria" })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          label="Imagen del producto"
          labelFor="product-code"
          error={errors.imageUrl?.message ?? errors.code?.message}
        >
          <div className="flex flex-wrap gap-2">
            <FormInput
              id="product-code"
              placeholder="Selecciona una imagen"
              readOnly
              value={codeValue}
              hasError={!!errors.code}
              onClick={
                readOnly
                  ? undefined
                  : () => {
                      setPendingImage(selectedImage);
                      setIsImageModalOpen(true);
                    }
              }
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  setPendingImage(selectedImage);
                  setIsImageModalOpen(true);
                }}
                className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
              >
                Seleccionar
              </button>
            )}
          </div>
        </FormField>

        <FormField
          label="Índice"
          labelFor="product-index"
          error={errors.index?.message}
        >
          {isEditing ? (
            <FormInput
              id="product-index"
              type="number"
              min={1}
              hasError={!!errors.index}
              readOnly
              {...register("index", {
                required: "El índice es obligatorio",
                valueAsNumber: true,
              })}
            />
          ) : (
            <FormInput
              id="product-index"
              placeholder="Se asigna automáticamente"
              readOnly
              disabled
            />
          )}
        </FormField>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          label="Fecha de lanzamiento"
          error={errors.releaseDate?.message}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <FormSelect
              value={releaseMonth}
              onChange={(event) => setReleaseMonth(event.target.value)}
              hasError={!!errors.releaseDate}
              disabled={readOnly}
            >
              <option value="">Mes</option>
              {MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              value={releaseYear}
              onChange={(event) => setReleaseYear(event.target.value)}
              hasError={!!errors.releaseDate}
              disabled={readOnly}
            >
              <option value="">Año</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </FormSelect>
          </div>
        </FormField>

        <FormField label="Visible" labelFor="product-show">
          <Controller
            name="show"
            control={control}
            render={({ field }) => (
              <FormSelect
                id="product-show"
                value={field.value ? "true" : "false"}
                onChange={(event) =>
                  field.onChange(event.target.value === "true")
                }
                disabled={readOnly}
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </FormSelect>
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          label="Mazo vinculado"
          labelFor="product-deck"
          error={errors.deckId?.message}
        >
          <div className="flex flex-wrap gap-2">
            <FormInput
              id="product-deck"
              placeholder="Selecciona un mazo"
              readOnly
              value={selectedDeckName}
              hasError={!!errors.deckId}
              onClick={readOnly ? undefined : () => setIsDeckModalOpen(true)}
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsDeckModalOpen(true)}
                className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
              >
                Vincular mazo
              </button>
            )}
          </div>
        </FormField>

        <FormField
          label="Número de cartas"
          labelFor="product-number-cards"
          error={errors.numberCards?.message}
        >
          <FormInput
            id="product-number-cards"
            readOnly
            value={numberCardsValue}
            hasError={!!errors.numberCards}
          />
          <input
            type="hidden"
            {...register("numberCards", {
              valueAsNumber: true,
              required: "El número de cartas es obligatorio",
            })}
          />
        </FormField>
      </div>

      <Controller
        name="description"
        control={control}
        rules={{
          validate: (value) =>
            value && value.trim().length >= 10
              ? true
              : "La descripción es obligatoria",
        }}
        render={({ field }) => (
          <MarkdownEditor
            label="Descripción"
            value={field.value}
            onChange={field.onChange}
            placeholder="Describe el producto..."
            error={errors.description?.message}
            readOnly={readOnly}
          />
        )}
      />

      <div
        className={clsx(
          "flex flex-wrap items-center gap-3",
          onDelete ? "justify-between" : "justify-end",
        )}
      >
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-red-500 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Eliminar producto
          </button>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {cancelHref && (
            <Link
              href={cancelHref}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
            >
              Cancelar
            </Link>
          )}
          <button
            type="submit"
            disabled={readOnly}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </div>

      <ProductImageModal
        isOpen={isImageModalOpen}
        images={images}
        selectedImage={pendingImage}
        onSelect={setPendingImage}
        onClose={() => setIsImageModalOpen(false)}
        onConfirm={handleConfirmImage}
      />

      <MarkdownDeckModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        searchValue={deckSearch}
        onSearchChange={setDeckSearch}
        decks={deckResults}
        selectedDeckId={selectedDeckId}
        onSelectDeck={handleSelectDeck}
        isLoading={deckLoading}
        error={deckError}
        totalCount={deckTotalCount}
        totalPages={deckTotalPages}
        currentPage={deckPage}
        onPageChange={setDeckPage}
        onInsert={() => setIsDeckModalOpen(false)}
        title="Seleccionar mazo"
        description="Busca por id, nombre del mazo o nickname del jugador."
        confirmLabel="Vincular mazo"
      />
    </form>
  );
};
