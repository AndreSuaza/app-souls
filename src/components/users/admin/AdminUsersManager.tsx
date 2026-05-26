"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  adjustUserVictoryPointsAction,
  getAdminUsersAction,
  getUserPvAdjustmentsAction,
  updateAdminUserRoleStatusAction,
  type AdminUserListItem,
  type UserPvAdjustmentLog,
} from "@/actions";
import { PaginationLine } from "@/components/ui";
import { useToastStore, useUIStore } from "@/store";
import {
  IoAddCircleOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoEyeOutline,
  IoRemoveCircleOutline,
  IoSearchOutline,
} from "react-icons/io5";

type RoleValue = "all" | "player" | "admin" | "store" | "news";
type StatusValue = "all" | "active" | "inactive" | "banned";
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
  if (!message || message.startsWith("[") || message.length > 180) return fallback;
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
};

const UserDetailModal = ({
  user,
  history,
  historyLoading,
  saving,
  onClose,
  onSave,
  onAdjustPv,
}: UserDetailModalProps) => {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);

  useEffect(() => {
    setRole(user.role);
    setStatus(user.status);
  }, [user]);

  const hasChanges = role !== user.role || status !== user.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-tournament-dark-accent bg-white shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-tournament-dark-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
              Usuario
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
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

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="PV" value={user.victoryPoints} />
              <MetricCard label="ELO" value={user.eloPoints} />
              <MetricCard label="Torneos" value={user.tournamentsPlayed} />
              <MetricCard label="Partidas" value={user.matchesPlayed} />
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-tournament-dark-border">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Rol y estado
              </h3>
              <div className="mt-4 grid gap-4">
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

            <div className="text-xs text-slate-500 dark:text-slate-400">
              <p>Creado: {formatDate(user.createdAt)}</p>
              <p>Actualizado: {formatDate(user.updatedAt)}</p>
            </div>
          </section>

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
                      Admin: {item.admin.nickname ?? item.admin.email ?? item.admin.id}
                    </p>
                  </div>
                ))}
            </div>
          </section>
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
  const canSubmit = Number.isInteger(numericAmount) && numericAmount > 0 && reason.trim().length >= 5;

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
      onClick={() => onView(user)}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-purple-300 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-purple-300"
    >
      <IoEyeOutline className="h-4 w-4" />
      Ver
    </button>
    <button
      type="button"
      onClick={() => onAdjustPv(user)}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [pvUser, setPvUser] = useState<AdminUserListItem | null>(null);
  const [history, setHistory] = useState<UserPvAdjustmentLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
        perPage: 10,
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
  }, [hideLoading, order, page, query, roleFilter, showLoading, statusFilter]);

  useEffect(() => {
    loadUsers();

    return () => {
      hideLoading();
    };
  }, [loadUsers, hideLoading]);

  const updateUserInList = (userId: string, patch: Partial<AdminUserListItem>) => {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, ...patch } : user)),
    );
    setSelectedUser((current) =>
      current?.id === userId ? { ...current, ...patch } : current,
    );
    setPvUser((current) => (current?.id === userId ? { ...current, ...patch } : current));
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

  const handleRoleStatusSave = async (role: string, status: string) => {
    if (!selectedUser) return;

    const confirmed = window.confirm(
      "¿Confirmas el cambio de rol/estado para este usuario?",
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      const result = await updateAdminUserRoleStatusAction({
        userId: selectedUser.id,
        role,
        status,
      });
      updateUserInList(selectedUser.id, {
        role: result.user.role,
        status: result.user.status,
        updatedAt: result.user.updatedAt,
      });
      showToast("Usuario actualizado correctamente.", "success");
    } catch (error) {
      showToast(
        getSafeErrorMessage(error, "No se pudo actualizar el usuario."),
        "error",
      );
    } finally {
      setSaving(false);
    }
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

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[680px]">
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
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredLabel}
          </p>
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
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-tournament-dark-border lg:block">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-tournament-dark-border">
                <thead className="bg-slate-50 dark:bg-tournament-dark-muted">
                  <tr>
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
                      className="bg-white transition hover:bg-slate-50 dark:bg-tournament-dark-surface dark:hover:bg-tournament-dark-muted/60"
                    >
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
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {user.nickname}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {getDisplayName(user)}
                      </p>
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
    </section>
  );
};

type FilterSelectProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

const FilterSelect = ({ label, value, options, onChange }: FilterSelectProps) => (
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
