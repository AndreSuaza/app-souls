"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdError } from "react-icons/md";
import { createTournamentAction } from "@/actions";
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
    (s) => s.openAlertConfirmation
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
  } = useForm<CreateTournamentInputs>();

  const [format, setFormat] = useState<"Masters">("Masters");

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
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Nombre del torneo
        </label>
        <input
          maxLength={50}
          className={clsx(
            "w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500",
            {
              "border-red-500": errors.title,
            }
          )}
          placeholder="Ej. Torneo Verano 2025"
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

        {errors.title && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
            <MdError size={14} />
            <span>{errors.title.message}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Descripción
        </label>
        <textarea
          maxLength={300}
          className={clsx(
            "w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500",
            {
              "border-red-500": errors.description,
            }
          )}
          placeholder="Describe el torneo"
          rows={3}
          {...register("description", {
            required: "La descripción es obligatoria",
            minLength: {
              value: 10,
              message: "Debe tener al menos 10 caracteres",
            },
            maxLength: {
              value: 300,
              message: "No puede superar los 300 caracteres",
            },
          })}
        />

        {errors.description && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
            <MdError size={14} />
            <span>{errors.description.message}</span>
          </div>
        )}
      </div>

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
