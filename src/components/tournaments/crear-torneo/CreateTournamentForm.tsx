"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createTournamentAction } from "@/actions";
import { MarkdownEditor } from "@/components";
import { FormField, FormInput } from "@/components/ui/form";
import { getPlainTextFromMarkdown } from "@/utils/markdown";
import {
  useCatalogStore,
  useAlertConfirmationStore,
  useUIStore,
  useToastStore,
} from "@/store";
import { DateTimeFields } from "./DateTimeFields";
import { TournamentTypeSelect } from "./TournamentTypeSelect";
import { TournamentFormatSelect } from "./TournamentFormatSelect";
import { StoreSelect } from "./StoreSelect";

type CreateTournamentInputs = {
  title: string;
  description: string;
  typeTournamentId: string;
  storeId?: string;
};

export const CreateTournamentForm = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const userStoreId = session?.user?.storeId;

  const router = useRouter();

  const { tournamentTypes, stores, fetchTournamentTypes, fetchStores } =
    useCatalogStore();
  const openConfirmation = useAlertConfirmationStore(
    (s) => s.openAlertConfirmation,
  );
  const showToast = useToastStore((s) => s.showToast);
  const showLoading = useUIStore((s) => s.showLoading);
  const hideLoading = useUIStore((s) => s.hideLoading);

  // inicializar formulario con validaciones tipadas
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<CreateTournamentInputs>({
    defaultValues: {
      description: "",
    },
  });

  const [format, setFormat] = useState<"Masters">("Masters");
  const selectedTypeId = useWatch({
    control,
    name: "typeTournamentId",
  });
  // Ajusta el limite segun el tier seleccionado.
  const maxDescriptionLength = useMemo(() => {
    const selectedType = tournamentTypes.find(
      (type) => type.id === selectedTypeId,
    );
    const typeName = selectedType?.name?.toLowerCase() ?? "";
    const isTierOneOrTwo =
      typeName.includes("tier 1") || typeName.includes("tier 2");

    return isTierOneOrTwo ? 500 : 300;
  }, [selectedTypeId, tournamentTypes]);

  // Traer los tipos de torneos
  useEffect(() => {
    fetchTournamentTypes();
  }, [fetchTournamentTypes]);

  useEffect(() => {
    if (role === "admin") {
      fetchStores();
    }
  }, [role, fetchStores]);

  // Inicializar por defecto los datos
  useEffect(() => {
    if (tournamentTypes.length > 0) {
      const defaultType = tournamentTypes.find((t) => t.name === "Tier 3");
      if (defaultType) {
        setValue("typeTournamentId", defaultType.id);
      }
    }
  }, [tournamentTypes, setValue]);

  // Fecha base inmutable
  const now = useMemo(() => new Date(), []);

  const [date, setDate] = useState<string>(now.toISOString().split("T")[0]);

  // Definir hora inicial
  const getInitialTime = () => {
    const h = now.getHours().toString().padStart(2, "0");
    const m = Math.ceil(now.getMinutes() / 15) * 15;
    return `${h}:${m === 60 ? "00" : m.toString().padStart(2, "0")}`;
  };

  const [time, setTime] = useState<string>(getInitialTime());

  // Construye la fecha final en formato ISO para backend
  const buildISODate = () => {
    const iso = new Date(`${date}T${time}:00`);
    return iso.toISOString();
  };

  // Crear el torneo
  const onSubmit = handleSubmit((data) => {
    const resolvedStoreId = role === "admin" ? data.storeId : userStoreId;

    if (!resolvedStoreId) {
      showToast("No se pudo determinar la tienda", "error");
      return;
    }

    openConfirmation({
      text: "¿Deseas crear este torneo?",
      action: async () => {
        try {
          showLoading("Creando torneo...");

          const tournamentId = await createTournamentAction({
            title: data.title,
            description: data.description,
            format,
            lat: 0,
            lgn: 0,
            maxRounds: 1,
            storeId: resolvedStoreId,
            typeTournamentId: data.typeTournamentId,
            date: buildISODate(),
          });

          router.push(`/admin/torneos/${tournamentId}`);

          return true;
        } catch (error) {
          hideLoading(); // Si falla, se desbloquea la UI
          throw error;
        }
      },
      onSuccess: () => {
        showToast("Torneo creado correctamente", "success");
      },
      onError: () => {
        showToast("No se pudo crear el torneo", "error");
      },
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-tournament-dark-accent bg-white p-6 shadow-sm space-y-4 dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
    >
      <FormField
        label="Nombre del torneo"
        labelFor="tournament-title"
        error={errors.title?.message}
      >
        <FormInput
          id="tournament-title"
          maxLength={50}
          placeholder="Ej. Torneo Verano 2025"
          hasError={!!errors.title}
          {...register("title", {
            required: "El nombre del torneo es obligatorio",
            minLength: {
              value: 3,
              message: "Debe tener al menos 3 caracteres",
            },
            maxLength: {
              value: 50,
              message: "No puede superar los 50 caracteres",
            },
          })}
        />
      </FormField>

      <Controller
        name="description"
        control={control}
        rules={{
          validate: (value) => {
            const plainText = getPlainTextFromMarkdown(value ?? "");
            const trimmed = plainText.trim();

            if (trimmed.length === 0) {
              return "La descripción es obligatoria";
            }

            if (trimmed.length < 10) {
              return "Debe tener al menos 10 caracteres";
            }

            if (trimmed.length > maxDescriptionLength) {
              return `No puede superar los ${maxDescriptionLength} caracteres`;
            }

            return true;
          },
        }}
        render={({ field }) => (
          <MarkdownEditor
            label="Descripción"
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder="Describe el torneo usando markdown"
            maxLength={maxDescriptionLength}
            error={errors.description?.message}
            enableCardInsert={false}
            enableDeckInsert={false}
            enableProductInsert={false}
          />
        )}
      />

      <DateTimeFields
        date={date}
        time={time}
        minDate={now.toISOString().split("T")[0]}
        minTime={time}
        onDateChange={setDate}
        onTimeChange={setTime}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {role === "admin" && (
          <StoreSelect<CreateTournamentInputs>
            register={register}
            errors={errors}
            name="storeId"
            stores={stores}
          />
        )}

        {role === "admin" && (
          <TournamentTypeSelect<CreateTournamentInputs>
            register={register}
            errors={errors}
            name="typeTournamentId"
            tournamentTypes={tournamentTypes}
          />
        )}

        <TournamentFormatSelect value={format} onChange={setFormat} />
      </div>

      <div className="flex gap-3 pt-4 justify-end">
        <Link
          href="/admin/torneos"
          className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white shadow-lg shadow-purple-600/20 transition-colors hover:bg-purple-600/90"
        >
          Crear torneo
        </button>
      </div>
    </form>
  );
};
