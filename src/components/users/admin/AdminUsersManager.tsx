"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  adjustUserVictoryPointsAction,
  bulkAdjustUserVictoryPointsAction,
  getAdminUsersAction,
  getUserPvAdjustmentsAction,
  resendAdminVerificationEmailAction,
  sendAdminPasswordResetEmailAction,
  setAdminUserActiveStatusAction,
  updateAdminUserRoleStatusAction,
  type AdminUserListItem,
  type UserPvAdjustmentLog,
} from "@/actions";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import {
  IoAddCircleOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoEyeOutline,
  IoRemoveCircleOutline,
  IoSearchOutline,
} from "react-icons/io5";

const BULK_PV_MAX_USERS = 100;

type RoleValue = "all" | "player" | "admin" | "store" | "news";
type StatusValue = "all" | "active" | "inactive" | "banned";
type PerPageValue = 10 | 20 | 50 | 100;
type OrderValue =
  | "recent"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "pv-desc"
  | "pv-asc"
  | "elo-desc"
  | "elo-asc";

const ROLE_OPTIONS: Array<{ value: RoleValue; label: string }> = [
  { value: "all", label: "Todos los roles" },
  { value: "player", label: "Jugador" },
  { value: "admin", label: "Admin" },
  { value: "store", label: "Tienda" },
  { value: "news", label: "Noticias" },
];

const STATUS_OPTIONS: Array<{ value: StatusValue; label: string }> = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "banned", label: "Baneado" },
];

const ORDER_OPTIONS: Array<{ value: OrderValue; label: string }> = [
  { value: "recent", label: "Mas recientes" },
  { value: "oldest", label: "Mas antiguos" },
  { value: "name-asc", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "pv-desc", label: "Mas PV" },
  { value: "pv-asc", label: "Menos PV" },
  { value: "elo-desc", label: "Mas ELO" },
  { value: "elo-asc", label: "Menos ELO" },
];

const PER_PAGE_OPTIONS: Array<{ value: PerPageValue; label: string }> = [
  { value: 10, label: "10 por pagina" },
  { value: 20, label: "20 por pagina" },
  { value: 50, label: "50 por pagina" },
  { value: 100, label: "100 por pagina" },
];

const roleLabels: Record<string, string> = {
  player: "Jugador",
  admin: "Admin",
  store: "Tienda",
  news: "Noticias",
};

const statusLabels: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  banned: "Baneado",
};

const statusClasses: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30",
  inactive:
    "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-600/30",
  banned:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-500/30",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getSafeErrorMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  if (!message || message.startsWith("[") || message.length > 180)
    return fallback;
  return message;
};

const getDisplayName = (user: AdminUserListItem) => {
  const fullName = [user.name, user.lastname].filter(Boolean).join(" ").trim();
  return fullName || user.nickname;
};

type UserDetailModalProps = {
  user: AdminUserListItem;
  history: UserPvAdjustmentLog[];
  historyLoading: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (role: string, status: string) => void;
  onAdjustPv: () => void;
  onSetActiveStatus: (active: boolean) => void;
  onSendPasswordReset: () => void;
  onResendVerification: () => void;
};

const UserDetailModal = ({
  user,
  history,
  historyLoading,
  saving,
  onClose,
  onSave,
  onAdjustPv,
  onSetActiveStatus,
  onSendPasswordReset,
  onResendVerification,
}: UserDetailModalProps) => {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);

  useEffect(() => {
    setRole(user.role);
    setStatus(user.status);
  }, [user]);

  const hasChanges = role !== user.role || status !== user.status;
  const canDeactivate = user.status === "active" && !user.isCurrentAdmin;
  const canActivate = user.status === "inactive";
  const canSendPasswordReset = Boolean(user.email) && user.status === "active";
  const canResendVerification = Boolean(user.email) && !user.emailVerified;
  const hasAccountActions =
    canDeactivate ||
    canActivate ||
    canSendPasswordReset ||
    canResendVerification;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="max-h-[84vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-tournament-dark-accent bg-white shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
        onWheel={(event) => {
          event.currentTarget.scrollTop += event.deltaY;
        }}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-tournament-dark-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
              Usuario
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {user.nickname}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getDisplayName(user)} · {user.email ?? "Sin correo"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white"
            aria-label="Cerrar detalle de usuario"
          >
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="PV" value={user.victoryPoints} />
              <MetricCard label="ELO" value={user.eloPoints} />
              <MetricCard label="Torneos" value={user.tournamentsPlayed} />
              <MetricCard label="Partidas" value={user.matchesPlayed} />
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 dark:border-tournament-dark-border">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Gestion de cuenta
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Rol
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900 focus:border-purple-500 focus:outline-none dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
                  >
                    {ROLE_OPTIONS.filter((item) => item.value !== "all").map(
                      (item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Estado
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900 focus:border-purple-500 focus:outline-none dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
                  >
                    {STATUS_OPTIONS.filter((item) => item.value !== "all").map(
                      (item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              {user.isCurrentAdmin && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                  No puedes quitarte el rol admin ni desactivar tu cuenta.
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!hasChanges || saving}
                  onClick={() => onSave(role, status)}
                  className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={onAdjustPv}
                  className="rounded-xl border border-amber-400/50 px-4 py-2 text-sm font-semibold text-amber-600 transition hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-900/20"
                >
                  Ajustar PV
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/30">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Acciones de cuenta
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {canDeactivate && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => onSetActiveStatus(false)}
                    className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/40 dark:text-red-200 dark:hover:bg-red-900/20"
                  >
                    Desactivar usuario
                  </button>
                )}
                {canActivate && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => onSetActiveStatus(true)}
                    className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/40 dark:text-emerald-200 dark:hover:bg-emerald-900/20"
                  >
                    Activar usuario
                  </button>
                )}
                {canSendPasswordReset && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={onSendPasswordReset}
                    className="rounded-xl border border-purple-300 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-900/20"
                  >
                    Enviar recuperación
                  </button>
                )}
                {canResendVerification && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={onResendVerification}
                    className="rounded-xl border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-500/40 dark:text-sky-200 dark:hover:bg-sky-900/20"
                  >
                    Reenviar verificacion
                  </button>
                )}
                {!hasAccountActions && (
                  <p className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500 dark:border-tournament-dark-border dark:text-slate-400">
                    No hay acciones de cuenta disponibles para este usuario.
                  </p>
                )}
              </div>
              {!user.email && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  El usuario no tiene correo registrado.
                </p>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              <p>Creado: {formatDate(user.createdAt)}</p>
              <p>Actualizado: {formatDate(user.updatedAt)}</p>
            </div>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-tournament-dark-border">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Historial reciente de PV
            </h3>
            <div className="mt-4 space-y-3">
              {historyLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Cargando historial...
                </p>
              )}
              {!historyLoading && history.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-tournament-dark-border dark:text-slate-400">
                  Este usuario no tiene ajustes manuales registrados.
                </p>
              )}
              {!historyLoading &&
                history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={clsx(
                          "text-sm font-bold",
                          item.amount > 0
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "text-red-600 dark:text-red-300",
                        )}
                      >
                        {item.amount > 0 ? "+" : ""}
                        {item.amount} PV
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                      {item.previousBalance} → {item.nextBalance} PV
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.reason}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Admin:{" "}
                      {item.admin.nickname ?? item.admin.email ?? item.admin.id}
                    </p>
                  </div>
                ))}
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
};

type PvAdjustmentModalProps = {
  user: AdminUserListItem;
  saving: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => void;
};

const PvAdjustmentModal = ({
  user,
  saving,
  onClose,
  onSubmit,
}: PvAdjustmentModalProps) => {
  const [mode, setMode] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const numericAmount = Number(amount);
  const signedAmount = mode === "add" ? numericAmount : -numericAmount;
  const canSubmit =
    Number.isInteger(numericAmount) &&
    numericAmount > 0 &&
    reason.trim().length >= 5;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
          onSubmit(signedAmount, reason);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
              Ajuste de PV
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {user.nickname}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Saldo actual: {user.victoryPoints} PV
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white"
            aria-label="Cerrar ajuste de PV"
          >
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("add")}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition",
              mode === "add"
                ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "border-slate-200 text-slate-600 dark:border-tournament-dark-border dark:text-slate-300",
            )}
          >
            <IoAddCircleOutline /> Sumar
          </button>
          <button
            type="button"
            onClick={() => setMode("subtract")}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition",
              mode === "subtract"
                ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                : "border-slate-200 text-slate-600 dark:border-tournament-dark-border dark:text-slate-300",
            )}
          >
            <IoRemoveCircleOutline /> Restar
          </button>
        </div>

        <label className="mt-5 flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Cantidad
          <input
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm normal-case tracking-normal text-slate-900 focus:border-purple-500 focus:outline-none dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
            placeholder="Ej: 10"
          />
        </label>

        <label className="mt-5 flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Motivo
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm normal-case tracking-normal text-slate-900 focus:border-purple-500 focus:outline-none dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
            placeholder="Describe por que se realiza este ajuste."
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Guardar ajuste
          </button>
        </div>
      </form>
    </div>
  );
};

type BulkPvAdjustmentModalProps = {
  selectedUsers: AdminUserListItem[];
  amount: string;
  reason: string;
  saving: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onAmountChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
};

const BulkPvAdjustmentModal = ({
  selectedUsers,
  amount,
  reason,
  saving,
  canSubmit,
  onClose,
  onAmountChange,
  onReasonChange,
  onSubmit,
}: BulkPvAdjustmentModalProps) => {
  const targetCount = selectedUsers.length;
  const exceedsMaxUsers = targetCount > BULK_PV_MAX_USERS;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-2xl rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
          onSubmit();
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
              Asignacion masiva de PV
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              Sumar puntos de victoria
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Define la cantidad y deja un motivo de auditoria.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white"
            aria-label="Cerrar asignacion masiva de PV"
          >
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Usuarios seleccionados
            </p>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
              {targetCount}/{BULK_PV_MAX_USERS}
            </span>
          </div>

          <div className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1">
            {selectedUsers.length > 0 ? (
              selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user.nickname}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getDisplayName(user)}
                    {user.email ? ` - ${user.email}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 dark:border-tournament-dark-border dark:text-slate-400">
                No hay usuarios seleccionados.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[160px_1fr]">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            PV a sumar
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm normal-case tracking-normal text-slate-900 focus:border-purple-500 focus:outline-none dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
              placeholder="Ej: 10"
            />
          </label>

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Motivo
            <input
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm normal-case tracking-normal text-slate-900 focus:border-purple-500 focus:outline-none dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
              placeholder="Ej: Recompensa por evento regional"
            />
          </label>
        </div>

        {exceedsMaxUsers && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
            Solo puedes asignar PV masivamente a un maximo de{" "}
            {BULK_PV_MAX_USERS} usuarios.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Asignar PV
          </button>
        </div>
      </form>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
      {value}
    </p>
  </div>
);

const RoleBadge = ({ role }: { role: string }) => (
  <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:ring-purple-500/30">
    {roleLabels[role] ?? role}
  </span>
);

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={clsx(
      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
      statusClasses[status] ?? statusClasses.inactive,
    )}
  >
    {statusLabels[status] ?? status}
  </span>
);

type UserActionsProps = {
  user: AdminUserListItem;
  onView: (user: AdminUserListItem) => void;
  onAdjustPv: (user: AdminUserListItem) => void;
};

const UserActions = ({ user, onView, onAdjustPv }: UserActionsProps) => (
  <div className="flex justify-end gap-2">
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onView(user);
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-purple-300 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-purple-300"
    >
      <IoEyeOutline className="h-4 w-4" />
      Ver
    </button>
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onAdjustPv(user);
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-amber-400/50 px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-900/20"
    >
      <IoCreateOutline className="h-4 w-4" />
      PV
    </button>
  </div>
);

export const AdminUsersManager = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const showToast = useToastStore((state) => state.showToast);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleValue>("all");
  const [statusFilter, setStatusFilter] = useState<StatusValue>("all");
  const [order, setOrder] = useState<OrderValue>("recent");
  const [perPage, setPerPage] = useState<PerPageValue>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(
    null,
  );
  const [pvUser, setPvUser] = useState<AdminUserListItem | null>(null);
  const [history, setHistory] = useState<UserPvAdjustmentLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsersById, setSelectedUsersById] = useState<
    Record<string, AdminUserListItem>
  >({});
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  useBodyScrollLock(Boolean(selectedUser || pvUser || bulkModalOpen));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setQuery(queryInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [queryInput]);

  const loadUsers = useCallback(async () => {
    try {
      setError(null);
      showLoading("Cargando usuarios...");
      const result = await getAdminUsersAction({
        page,
        perPage,
        query,
        role: roleFilter,
        status: statusFilter,
        order,
      });

      setUsers(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      if (result.currentPage !== page) {
        setPage(result.currentPage);
      }
    } catch (error) {
      setError(
        getSafeErrorMessage(error, "No se pudieron cargar los usuarios."),
      );
    } finally {
      setLoading(false);
      hideLoading();
    }
  }, [
    hideLoading,
    order,
    page,
    perPage,
    query,
    roleFilter,
    showLoading,
    statusFilter,
  ]);

  useEffect(() => {
    loadUsers();

    return () => {
      hideLoading();
    };
  }, [loadUsers, hideLoading]);

  useEffect(() => {
    setSelectedUserIds([]);
    setSelectedUsersById({});
  }, [order, perPage, query, roleFilter, statusFilter]);

  const updateUserInList = (
    userId: string,
    patch: Partial<AdminUserListItem>,
  ) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, ...patch } : user,
      ),
    );
    setSelectedUser((current) =>
      current?.id === userId ? { ...current, ...patch } : current,
    );
    setPvUser((current) =>
      current?.id === userId ? { ...current, ...patch } : current,
    );
    setSelectedUsersById((current) => {
      const selectedUser = current[userId];
      if (!selectedUser) return current;

      return {
        ...current,
        [userId]: { ...selectedUser, ...patch },
      };
    });
  };

  const loadHistory = async (userId: string) => {
    try {
      setHistoryLoading(true);
      const result = await getUserPvAdjustmentsAction({ userId, limit: 10 });
      setHistory(result);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenUser = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setHistory([]);
    void loadHistory(user.id);
  };

  const handleRoleStatusSave = (role: string, status: string) => {
    if (!selectedUser) return;

    const user = selectedUser;
    openConfirmation({
      text: "¿Confirmas el cambio de rol/estado?",
      description: `${user.nickname} quedara con rol "${roleLabels[role] ?? role}" y estado "${statusLabels[status] ?? status}".`,
      action: async () => {
        try {
          setSaving(true);
          const result = await updateAdminUserRoleStatusAction({
            userId: user.id,
            role,
            status,
          });
          updateUserInList(user.id, {
            role: result.user.role,
            status: result.user.status,
            updatedAt: result.user.updatedAt,
          });
          return true;
        } catch (error) {
          showToast(
            getSafeErrorMessage(error, "No se pudo actualizar el usuario."),
            "error",
          );
          return false;
        } finally {
          setSaving(false);
        }
      },
      onSuccess: () => {
        showToast("Usuario actualizado correctamente.", "success");
      },
    });
  };

  const handleSetActiveStatus = (active: boolean) => {
    if (!selectedUser) return;

    const user = selectedUser;
    openConfirmation({
      text: active ? "Confirmar activacion" : "Confirmar desactivacion",
      description: active
        ? `${user.nickname} podra iniciar sesion nuevamente.`
        : `${user.nickname} no podra iniciar sesion mientras este inactivo.`,
      action: async () => {
        try {
          setSaving(true);
          showLoading(
            active ? "Activando usuario..." : "Desactivando usuario...",
          );
          const result = await setAdminUserActiveStatusAction({
            userId: user.id,
            active,
          });
          updateUserInList(user.id, {
            status: result.user.status,
            updatedAt: result.user.updatedAt,
          });
          return true;
        } catch (error) {
          showToast(
            getSafeErrorMessage(
              error,
              active
                ? "No se pudo activar el usuario."
                : "No se pudo desactivar el usuario.",
            ),
            "error",
          );
          return false;
        } finally {
          setSaving(false);
          hideLoading();
        }
      },
      onSuccess: () => {
        showToast(
          active
            ? "Usuario activado correctamente."
            : "Usuario desactivado correctamente.",
          "success",
        );
      },
    });
  };

  const handleSendPasswordReset = () => {
    if (!selectedUser) return;

    const user = selectedUser;
    openConfirmation({
      text: "Enviar recuperación de contraseña",
      description: `Se enviara un correo de recuperación a ${user.email}.`,
      action: async () => {
        try {
          setSaving(true);
          showLoading("Enviando recuperación...");
          await sendAdminPasswordResetEmailAction({ userId: user.id });
          return true;
        } catch (error) {
          showToast(
            getSafeErrorMessage(
              error,
              "No se pudo enviar el correo de recuperación.",
            ),
            "error",
          );
          return false;
        } finally {
          setSaving(false);
          hideLoading();
        }
      },
      onSuccess: () => {
        showToast("Correo de recuperación enviado.", "success");
      },
    });
  };

  const handleResendVerification = () => {
    if (!selectedUser) return;

    const user = selectedUser;
    openConfirmation({
      text: "Reenviar verificacion",
      description: `Se enviara un correo de verificacion a ${user.email}.`,
      action: async () => {
        try {
          setSaving(true);
          showLoading("Enviando verificacion...");
          await resendAdminVerificationEmailAction({ userId: user.id });
          return true;
        } catch (error) {
          showToast(
            getSafeErrorMessage(
              error,
              "No se pudo reenviar el correo de verificacion.",
            ),
            "error",
          );
          return false;
        } finally {
          setSaving(false);
          hideLoading();
        }
      },
      onSuccess: () => {
        showToast("Correo de verificacion enviado.", "success");
      },
    });
  };

  const handlePvSubmit = async (amount: number, reason: string) => {
    if (!pvUser) return;

    try {
      setSaving(true);
      const result = await adjustUserVictoryPointsAction({
        userId: pvUser.id,
        amount,
        reason,
      });
      updateUserInList(pvUser.id, {
        victoryPoints: result.victoryPoints,
        updatedAt: result.updatedAt,
      });
      showToast("PV ajustados correctamente.", "success");
      setPvUser(null);
      if (selectedUser?.id === pvUser.id) {
        await loadHistory(pvUser.id);
      }
    } catch (error) {
      showToast(
        getSafeErrorMessage(error, "No se pudo ajustar el saldo de PV."),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const currentPageUserIds = useMemo(
    () => users.map((user) => user.id),
    [users],
  );
  const selectedUsersCount = selectedUserIds.length;
  const selectedUsersForBulkModal = useMemo(
    () =>
      selectedUserIds
        .map((userId) => selectedUsersById[userId])
        .filter((user): user is AdminUserListItem => Boolean(user)),
    [selectedUserIds, selectedUsersById],
  );
  const allCurrentPageSelected =
    currentPageUserIds.length > 0 &&
    currentPageUserIds.every((userId) => selectedUserIds.includes(userId));
  const bulkNumericAmount = Number(bulkAmount);
  const canSubmitBulk =
    selectedUsersCount > 0 &&
    selectedUsersCount <= BULK_PV_MAX_USERS &&
    Number.isInteger(bulkNumericAmount) &&
    bulkNumericAmount > 0 &&
    bulkReason.trim().length >= 5;

  const toggleUserSelection = (user: AdminUserListItem) => {
    if (
      !selectedUserIds.includes(user.id) &&
      selectedUserIds.length >= BULK_PV_MAX_USERS
    ) {
      showToast(
        `Solo puedes seleccionar hasta ${BULK_PV_MAX_USERS} usuarios.`,
        "error",
      );
      return;
    }

    setSelectedUserIds((current) =>
      current.includes(user.id)
        ? current.filter((id) => id !== user.id)
        : [...current, user.id],
    );
    setSelectedUsersById((current) => {
      if (current[user.id]) {
        const next = { ...current };
        delete next[user.id];
        return next;
      }

      return {
        ...current,
        [user.id]: user,
      };
    });
  };

  const toggleCurrentPageSelection = () => {
    const pageUserIdsToAdd = currentPageUserIds.filter(
      (userId) => !selectedUserIds.includes(userId),
    );

    if (
      !allCurrentPageSelected &&
      selectedUserIds.length + pageUserIdsToAdd.length > BULK_PV_MAX_USERS
    ) {
      showToast(
        `Solo puedes seleccionar hasta ${BULK_PV_MAX_USERS} usuarios.`,
        "error",
      );
      return;
    }

    setSelectedUserIds((current) => {
      if (allCurrentPageSelected) {
        return current.filter((id) => !currentPageUserIds.includes(id));
      }

      return Array.from(new Set([...current, ...currentPageUserIds]));
    });
    setSelectedUsersById((current) => {
      if (allCurrentPageSelected) {
        const next = { ...current };
        currentPageUserIds.forEach((userId) => {
          delete next[userId];
        });
        return next;
      }

      return users.reduce<Record<string, AdminUserListItem>>(
        (next, user) => ({
          ...next,
          [user.id]: user,
        }),
        current,
      );
    });
  };

  const handleBulkPvSubmit = () => {
    if (!canSubmitBulk) return;

    const userIds = [...selectedUserIds];
    const amount = bulkNumericAmount;
    const reason = bulkReason.trim();
    if (userIds.length > BULK_PV_MAX_USERS) {
      showToast(
        `Solo puedes asignar PV masivamente a ${BULK_PV_MAX_USERS} usuarios.`,
        "error",
      );
      return;
    }

    openConfirmation({
      text: "¿Confirmas la asignacion masiva de PV?",
      description: `Vas a sumar ${amount} PV a ${userIds.length} usuarios seleccionados. Esta accion quedara registrada en el historial de cada usuario.`,
      action: async () => {
        try {
          setBulkSaving(true);
          const result = await bulkAdjustUserVictoryPointsAction({
            selection: { mode: "selected", userIds },
            amount,
            reason,
          });

          showToast(
            `Se sumaron ${result.amount} PV a ${result.affectedCount} usuarios.`,
            "success",
          );
          setSelectedUserIds([]);
          setSelectedUsersById({});
          setBulkAmount("");
          setBulkReason("");
          setBulkModalOpen(false);
          await loadUsers();
          return true;
        } catch (error) {
          showToast(
            getSafeErrorMessage(
              error,
              "No se pudieron asignar los PV masivos.",
            ),
            "error",
          );
          return false;
        } finally {
          setBulkSaving(false);
        }
      },
    });
  };

  const filteredLabel = useMemo(
    () => `Mostrando ${users.length} de ${totalCount} usuarios`,
    [totalCount, users.length],
  );

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
          Administracion de usuarios
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gestiona roles, estados y ajustes manuales de PV con auditoria.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="flex flex-1 flex-col gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Buscar
            <div className="relative">
              <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
                placeholder="Nickname, email, nombre o apellido"
              />
            </div>
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[900px] lg:grid-cols-4">
            <FilterSelect
              label="Rol"
              value={roleFilter}
              options={ROLE_OPTIONS}
              onChange={(value) => {
                setRoleFilter(value as RoleValue);
                setPage(1);
              }}
            />
            <FilterSelect
              label="Estado"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(value) => {
                setStatusFilter(value as StatusValue);
                setPage(1);
              }}
            />
            <FilterSelect
              label="Orden"
              value={order}
              options={ORDER_OPTIONS}
              onChange={(value) => {
                setOrder(value as OrderValue);
                setPage(1);
              }}
            />
            <FilterSelect
              label="Por pagina"
              value={perPage}
              options={PER_PAGE_OPTIONS}
              onChange={(value) => {
                setPerPage(Number(value) as PerPageValue);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredLabel}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={users.length === 0}
              onClick={toggleCurrentPageSelection}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-purple-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300"
            >
              {allCurrentPageSelected
                ? "Quitar seleccion de esta pagina"
                : "Seleccionar usuarios de esta pagina"}
            </button>
            <button
              type="button"
              onClick={() => setBulkModalOpen(true)}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
            >
              Asignar PV masivo
            </button>
          </div>
        </div>

        {!loading && error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:text-slate-400">
            No hay usuarios que coincidan con los filtros actuales.
          </div>
        )}

        {!error && users.length > 0 && (
          <>
            <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-slate-200 dark:border-tournament-dark-border lg:block">
              <table className="w-full min-w-[1040px] divide-y divide-slate-200 dark:divide-tournament-dark-border">
                <thead className="bg-slate-50 dark:bg-tournament-dark-muted">
                  <tr>
                    <TableHead>
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={toggleCurrentPageSelection}
                        className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                        aria-label="Seleccionar usuarios de esta pagina"
                      />
                    </TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>PV / ELO</TableHead>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Actualizado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-tournament-dark-border">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleOpenUser(user)}
                      className={clsx(
                        "cursor-pointer bg-white transition hover:bg-slate-50 dark:bg-tournament-dark-surface dark:hover:bg-tournament-dark-muted/60",
                        selectedUser?.id === user.id &&
                          "bg-purple-50 dark:bg-tournament-dark-muted/80",
                      )}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => toggleUserSelection(user)}
                          className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          aria-label={`Seleccionar a ${user.nickname}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {user.nickname}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getDisplayName(user)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {user.email ?? "Sin correo"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                        <p className="font-semibold text-amber-600 dark:text-amber-200">
                          {user.victoryPoints} PV
                        </p>
                        <p>{user.eloPoints} ELO</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                        <p>{user.tournamentsPlayed} torneos</p>
                        <p>{user.matchesPlayed} partidas</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(user.updatedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <UserActions
                          user={user}
                          onView={handleOpenUser}
                          onAdjustPv={setPvUser}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 lg:hidden">
              {users.map((user) => (
                <article
                  key={user.id}
                  onClick={() => handleOpenUser(user)}
                  className={clsx(
                    "cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-purple-300 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:hover:border-purple-500/50",
                    selectedUser?.id === user.id &&
                      "border-purple-300 dark:border-purple-500/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleUserSelection(user)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                        aria-label={`Seleccionar a ${user.nickname}`}
                      />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {user.nickname}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getDisplayName(user)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <MetricCard label="PV" value={user.victoryPoints} />
                    <MetricCard label="ELO" value={user.eloPoints} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <RoleBadge role={user.role} />
                    <UserActions
                      user={user}
                      onView={handleOpenUser}
                      onAdjustPv={setPvUser}
                    />
                  </div>
                </article>
              ))}
            </div>

            <PaginationLine
              totalPages={totalPages}
              currentPage={page}
              searchParams={searchParams}
              pathname={pathname}
              onPageChange={setPage}
              className="mt-8"
            />
          </>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          history={history}
          historyLoading={historyLoading}
          saving={saving}
          onClose={() => setSelectedUser(null)}
          onSave={handleRoleStatusSave}
          onAdjustPv={() => setPvUser(selectedUser)}
          onSetActiveStatus={handleSetActiveStatus}
          onSendPasswordReset={handleSendPasswordReset}
          onResendVerification={handleResendVerification}
        />
      )}

      {pvUser && (
        <PvAdjustmentModal
          user={pvUser}
          saving={saving}
          onClose={() => setPvUser(null)}
          onSubmit={handlePvSubmit}
        />
      )}

      {bulkModalOpen && (
        <BulkPvAdjustmentModal
          selectedUsers={selectedUsersForBulkModal}
          amount={bulkAmount}
          reason={bulkReason}
          saving={bulkSaving}
          canSubmit={canSubmitBulk}
          onClose={() => setBulkModalOpen(false)}
          onAmountChange={setBulkAmount}
          onReasonChange={setBulkReason}
          onSubmit={handleBulkPvSubmit}
        />
      )}
    </section>
  );
};

type FilterSelectProps = {
  label: string;
  value: string | number;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string) => void;
};

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) => (
  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const TableHead = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <th
    scope="col"
    className={clsx(
      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
      className,
    )}
  >
    {children}
  </th>
);
