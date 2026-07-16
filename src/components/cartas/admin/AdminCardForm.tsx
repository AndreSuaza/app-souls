"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createCardAction,
  updateCardAction,
  uploadCardImageAction,
  type getAdminCardByIdAction,
  type getAdminCardPropertiesAction,
} from "@/actions/cards/admin-cards.action";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { toAssetUrl } from "@/utils/blob-path";

type Properties = Awaited<ReturnType<typeof getAdminCardPropertiesAction>>;
type AdminCard = NonNullable<
  Awaited<ReturnType<typeof getAdminCardByIdAction>>
>;

type FormValues = {
  idd: string;
  code: string;
  limit: string;
  rotation: string;
  cost: string;
  force: string;
  defense: string;
  name: string;
  effect: string;
  price: string;
  productId: string;
  typeIds: string[];
  archetypesIds: string[];
  keywordsIds: string[];
  raritiesIds: string[];
  imageUrl: string;
};

type Props = {
  mode: "create" | "edit";
  properties: Properties;
  card?: AdminCard;
  cancelHref: string;
};

const defaultValues: FormValues = {
  idd: "",
  code: "",
  limit: "3",
  rotation: "0",
  cost: "0",
  force: "",
  defense: "",
  name: "",
  effect: "",
  price: "",
  productId: "",
  typeIds: [],
  archetypesIds: [],
  keywordsIds: [],
  raritiesIds: [],
  imageUrl: "",
};

const toInitialValues = (card?: AdminCard): FormValues => {
  if (!card) return defaultValues;

  return {
    idd: card.idd,
    code: card.code,
    limit: card.limit,
    rotation: String(card.rotation),
    cost: String(card.cost),
    force: card.force,
    defense: card.defense,
    name: card.name,
    effect: card.effect,
    price: card.price == null ? "" : String(card.price),
    productId: card.productId,
    typeIds: card.typeIds,
    archetypesIds: card.archetypesIds,
    keywordsIds: card.keywordsIds,
    raritiesIds: card.raritiesIds,
    imageUrl: card.imageUrl ?? "",
  };
};

export const AdminCardForm = ({
  mode,
  properties,
  card,
  cancelHref,
}: Props) => {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<FormValues>(() => toInitialValues(card));
  const [file, setFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  const isCreate = mode === "create";
  const previewUrl =
    localPreviewUrl || (values.imageUrl ? toAssetUrl(values.imageUrl) : "");

  useEffect(() => {
    if (!file) {
      setLocalPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const updateValue = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleMultiChange = (
    key: keyof FormValues,
    selected: HTMLSelectElement,
  ) => {
    const next = Array.from(selected.selectedOptions).map(
      (option) => option.value,
    );
    updateValue(key, next as never);
  };

  const saveCard = async () => {
    try {
      if (isCreate && !file) {
        showToast("Selecciona una imagen para crear la carta", "error");
        return false;
      }

      setIsSaving(true);
      showLoading(isCreate ? "Creando carta..." : "Actualizando carta...");
      let imageUrl = values.imageUrl;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("code", values.code);
        formData.append("idd", values.idd);
        const uploaded = await uploadCardImageAction(formData);
        imageUrl = uploaded.pathname;
      }

      const payload = {
        idd: values.idd,
        code: values.code,
        limit: values.limit,
        rotation: Number(values.rotation),
        cost: Number(values.cost),
        force: values.force,
        defense: values.defense,
        name: values.name,
        effect: values.effect,
        price: values.price.trim() ? Number(values.price) : null,
        productId: values.productId,
        typeIds: values.typeIds,
        archetypesIds: values.archetypesIds,
        keywordsIds: values.keywordsIds,
        raritiesIds: values.raritiesIds,
        imageUrl,
      };

      if (isCreate) {
        const id = await createCardAction(payload);
        showToast("Carta creada correctamente", "success");
        router.push(`/admin/cartas/${id}`);
        return true;
      }

      if (!card) throw new Error("Carta no encontrada");
      await updateCardAction({ ...payload, cardId: card.id });
      showToast("Carta actualizada correctamente", "success");
      setValues((current) => ({ ...current, imageUrl }));
      setFile(null);
      router.refresh();
      return true;
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo guardar la carta",
        "error",
      );
      return false;
    } finally {
      setIsSaving(false);
      hideLoading();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreate && !file) {
      showToast("Selecciona una imagen para crear la carta", "error");
      return;
    }

    openConfirmation({
      text: isCreate ? "Crear carta" : "Guardar cambios",
      description: isCreate
        ? `Se creara la carta ${values.code || values.name || ""} con su imagen en R2.`
        : `Se actualizaran los datos${file ? " y la imagen" : ""} de la carta ${values.code || card?.code || ""}.`,
      action: saveCard,
    });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {isCreate ? "Crear carta" : "Editar carta"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Actualiza atributos, relaciones e imagen publica en R2.
          </p>
        </div>
        <Link
          href={cancelHref}
          className="inline-flex w-fit rounded-lg border border-tournament-dark-accent px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
        >
          Volver
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="space-y-6">
          <div className="grid gap-4 rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:grid-cols-2">
            <TextInput
              label="Nombre"
              value={values.name}
              onChange={(value) => updateValue("name", value)}
              required
            />
            <TextInput
              label="Código"
              value={values.code}
              onChange={(value) => updateValue("code", value)}
              required
            />
            <TextInput
              label="Numeración"
              value={values.idd}
              onChange={(value) => updateValue("idd", value)}
              required
            />
            <TextInput
              label="ímite"
              value={values.limit}
              onChange={(value) => updateValue("limit", value)}
              required
            />
            <TextInput
              label="Rotación"
              type="number"
              value={values.rotation}
              onChange={(value) => updateValue("rotation", value)}
              required
            />
            <TextInput
              label="Coste"
              type="number"
              value={values.cost}
              onChange={(value) => updateValue("cost", value)}
              required
            />
            <TextInput
              label="Fuerza"
              value={values.force}
              onChange={(value) => updateValue("force", value)}
            />
            <TextInput
              label="Defensa"
              value={values.defense}
              onChange={(value) => updateValue("defense", value)}
            />
            <TextInput
              label="Precio"
              type="number"
              value={values.price}
              onChange={(value) => updateValue("price", value)}
            />
            <Select
              label="Producto"
              value={values.productId}
              onChange={(value) => updateValue("productId", value)}
              required
            >
              <option value="">Selecciona producto</option>
              {properties.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:grid-cols-2">
            <MultiSelect
              label="Tipos"
              value={values.typeIds}
              options={properties.types}
              onChange={(target) => handleMultiChange("typeIds", target)}
              required
            />
            <MultiSelect
              label="Rarezas"
              value={values.raritiesIds}
              options={properties.rarities}
              onChange={(target) => handleMultiChange("raritiesIds", target)}
              required
            />
            <MultiSelect
              label="Arquetipos"
              value={values.archetypesIds}
              options={properties.archetypes}
              onChange={(target) => handleMultiChange("archetypesIds", target)}
            />
            <MultiSelect
              label="Keywords"
              value={values.keywordsIds}
              options={properties.keywords}
              onChange={(target) => handleMultiChange("keywordsIds", target)}
            />
          </div>

          <label className="block rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Efecto
            </span>
            <textarea
              value={values.effect}
              onChange={(event) => updateValue("effect", event.target.value)}
              rows={8}
              className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
            />
          </label>
        </div>

        <aside className="space-y-4 rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface lg:sticky lg:top-6 lg:self-start">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Imagen
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Se subira como WebP a `cards/{values.code || "CODIGO"}-
              {values.idd || "000"}.webp`.
            </p>
          </div>

          <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={values.name || "Imagen de carta"}
                width={280}
                height={392}
                unoptimized
                className="max-h-[420px] w-auto rounded-md object-contain"
              />
            ) : (
              <span className="text-sm text-slate-400">Sin imagen</span>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Archivo de imagen {isCreate ? "*" : ""}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? "Guardando..."
              : isCreate
                ? "Crear carta"
                : "Guardar cambios"}
          </button>
        </aside>
      </form>
    </section>
  );
};

const fieldClass =
  "w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200";

const TextInput = ({
  label,
  value,
  type = "text",
  required,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
    </span>
    <input
      type={type}
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClass}
    />
  </label>
);

const Select = ({
  label,
  value,
  required,
  children,
  onChange,
}: {
  label: string;
  value: string;
  required?: boolean;
  children: React.ReactNode;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
    </span>
    <select
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClass}
    >
      {children}
    </select>
  </label>
);

const MultiSelect = ({
  label,
  value,
  options,
  required,
  onChange,
}: {
  label: string;
  value: string[];
  options: Array<{ id: string; name: string }>;
  required?: boolean;
  onChange: (target: HTMLSelectElement) => void;
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
    </span>
    <select
      multiple
      required={required}
      value={value}
      onChange={(event) => onChange(event.target)}
      className={`${fieldClass} min-h-[136px]`}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  </label>
);
