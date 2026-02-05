"use client";

import clsx from "clsx";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDeck } from "@/actions";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { MdError } from "react-icons/md";

type FormInputs = {
  name: string;
  description: string;
  cards: string;
  visible: boolean;
  image: string;
  deckId?: string;
};

interface InitialValues {
  name?: string;
  description?: string | null;
  isPrivate?: boolean;
}

interface Props {
  deck: string;
  imgDeck: string;
  mainDeckCount?: number;
  onClose?: () => void;
  deckId?: string;
  initialValues?: InitialValues;
  mode?: "create" | "edit" | "clone";
  autoArchetypeId?: string;
  archetypeName?: string | null;
  hideVisibilityToggle?: boolean;
}

const SIN_ARQUETIPO_ID = "67c5d1595d56151173f8f23b";

export const SaveDeckForm = ({
  deck,
  imgDeck,
  mainDeckCount = 0,
  onClose,
  deckId,
  initialValues,
  mode = "create",
  autoArchetypeId,
  archetypeName,
  hideVisibilityToggle = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormInputs>({
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      // "visible" en el form representa el checkbox de privado.
      visible: initialValues?.isPrivate ?? false,
    },
  });
  const [error, setError] = useState<string | null>(null);
  const openAlertConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const router = useRouter();
  const isPrivate = watch("visible");
  const shouldWarnPublic = !isPrivate && mainDeckCount < 40;

  useEffect(() => {
    if (!initialValues) return;
    reset({
      name: initialValues.name ?? "",
      description: initialValues.description ?? "",
      visible: initialValues.isPrivate ?? false,
    });
  }, [initialValues, reset]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (shouldWarnPublic) {
      setError(
        "Para publicar un mazo debe tener 40 cartas en el mazo principal.",
      );
      showToast(
        "Para publicar el mazo debes tener 40 cartas en el mazo principal.",
        "warning",
      );
      return;
    }

    const confirmationText =
      mode === "edit"
        ? "¿Deseas guardar los cambios del mazo?"
        : mode === "clone"
          ? "¿Deseas clonar este mazo?"
          : "¿Deseas guardar este mazo?";
    const confirmationDescription =
      mode === "edit"
        ? "Se guardará la información y las cartas que acabas de modificar."
        : mode === "clone"
          ? "Se creará un nuevo mazo con las mismas cartas."
          : "Se guardará el mazo con la configuración actual.";

    const resolvedArchetypeId = autoArchetypeId ?? SIN_ARQUETIPO_ID;

    openAlertConfirmation({
      text: confirmationText,
      description: confirmationDescription,
      action: async () => {
        showLoading("Guardando mazo...");
        const resp = await saveDeck({
          ...data,
          archetypesId: resolvedArchetypeId,
          deckList: deck,
          imgDeck,
          cardsNumber: mainDeckCount,
          visible: !data.visible,
          deckId,
        });

        if (resp && resp?.message) {
          setError(resp.message);
          showToast(resp.message, "warning");
          onClose?.();
          hideLoading();
          return false;
        }

        showToast("Mazo guardado correctamente.", "success");
        onClose?.();
        if ((mode === "clone" || mode === "create") && resp?.deckId) {
          showLoading("Cargando mazo...");
          router.push(`/laboratorio?id=${resp.deckId}`);
          router.refresh();
          return true;
        }
        hideLoading();
        return true;
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <p>{error}</p>
        </div>
      )}
      {shouldWarnPublic && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Para publicar el mazo debe tener 40 cartas en el mazo principal.
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-[0.12em] text-slate-500">
          Nombre del Mazo
        </label>
        <input
          className={clsx(
            "w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500",
            {
              "border-red-500": errors.name,
              "border-tournament-dark-accent": !errors.name,
            },
          )}
          type="text"
          placeholder="Ej. Mazo control"
          maxLength={20}
          {...register("name", {
            required: { value: true, message: "El campo 'Nombre' es requerido" },
            maxLength: {
              value: 20,
              message: "El nombre no puede superar 20 caracteres",
            },
          })}
        />
        {errors.name && (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <MdError size={14} />
            <span>{errors.name.message}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-[0.12em] text-slate-500">
          Arquetipo
        </label>
        <input
          value={
            archetypeName && archetypeName.trim().length > 0
              ? archetypeName
              : "Sin arquetipo"
          }
          readOnly
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 p-2 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-[0.12em] text-slate-500">
          Descripción
        </label>
        <textarea
          {...register("description", {
            maxLength: {
              value: 500,
              message: "La Descripción no puede superar 500 caracteres",
            },
          })}
          rows={4}
          maxLength={500}
          placeholder="Describe tu mazo o tus estrategias..."
          className="w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
        />
        {errors.description && (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <MdError size={14} />
            <span>{errors.description.message}</span>
          </div>
        )}
      </div>

      {!hideVisibilityToggle && (
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            {...register("visible")}
            className="h-5 w-5 rounded accent-purple-600"
          />
          Deseo mantener mi mazo privado.
        </label>
      )}

      <button className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500">
        Guardar
      </button>
    </form>
  );
};

