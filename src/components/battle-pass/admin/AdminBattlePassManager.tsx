"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  IoAddCircleOutline,
  IoArchiveOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoGiftOutline,
  IoImagesOutline,
  IoMedalOutline,
  IoStorefrontOutline,
  IoTrashOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { createProfileMediaAction } from "@/actions/profile/admin-profile-media.action";
import {
  deleteBattlePassAction,
  deleteBattlePassLevelAction,
  fulfillStoreBattlePassDeliveriesAction,
  getAdminBattlePassClaimsAction,
  getAdminBattlePassDetailAction,
  getAdminBattlePassesAction,
  getBattlePassRewardOptionsAction,
  reorderBattlePassLevelsAction,
  upsertBattlePassWithBackgroundAction,
  upsertBattlePassLevelWithImageAction,
  type AdminBattlePassClaim,
  type AdminBattlePassDetail,
  type AdminBattlePassLevel,
  type AdminBattlePassListItem,
  type BattlePassRewardOption,
} from "@/actions/battle-pass/admin-battle-pass.action";
import { getMediaImagesAction } from "@/actions/media/get-media-images.action";
import { BattlePassDeliveryGroups } from "./BattlePassDeliveryGroups";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { AVATAR_AVAILABILITIES, AVATAR_RARITIES } from "@/models/avatar.models";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { toAssetStorageUrl } from "@/utils/asset-path";

type PassFormState = {
  id: string;
  title: string;
  description: string;
  seasonNumber: string;
  startsAt: string;
  endsAt: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  backgroundImageUrl: string;
};

type LevelFormState = {
  id: string;
  levelNumber: string;
  title: string;
  description: string;
  imageUrl: string;
  rewardType: "AVATAR" | "BANNER" | "PV" | "MANUAL";
  rewardAvatarId: string;
  victoryPointsReward: string;
  manualRewardLabel: string;
};

type QuickCosmeticFormState = {
  name: string;
  rarity: string;
  availability: string;
  type: "AVATAR" | "BANNER";
};

type MobileView = "levels" | "deliveries";

type DrawerProps = {
  children: ReactNode;
  isOpen: boolean;
  title: string;
  onClose: () => void;
};

type FieldProps = {
  children: ReactNode;
  label: string;
};

type PassSummaryPanelProps = {
  detail: AdminBattlePassDetail | null;
  levelItems: AdminBattlePassLevel[];
  selectedManualClaimsCount: number;
  onEditPass: () => void;
};

type DeliveriesPanelProps = {
  claims: AdminBattlePassClaim[];
  onDeliverClaims: (userId: string, claimIds: string[]) => Promise<void>;
};

type LevelsPanelProps = {
  canReorder: boolean;
  detail: AdminBattlePassDetail | null;
  isOrderDirty: boolean;
  isSavingOrder: boolean;
  levelItems: AdminBattlePassLevel[];
  reorderHelp: string;
  selectedPassId: string | null;
  onCreateLevel: () => void;
  onDeleteLevel: (level: AdminBattlePassLevel) => void;
  onEditLevel: (level: AdminBattlePassLevel) => void;
  onMoveLevel: (index: number, direction: "up" | "down") => void;
  onSaveOrder: () => void;
};

type LevelReorderCardProps = {
  canReorder: boolean;
  isFirst: boolean;
  isLast: boolean;
  index: number;
  level: AdminBattlePassLevel;
  onDeleteLevel: (level: AdminBattlePassLevel) => void;
  onEditLevel: (level: AdminBattlePassLevel) => void;
  onMoveLevel: (index: number, direction: "up" | "down") => void;
};

const EMPTY_PASS_FORM: PassFormState = {
  id: "",
  title: "",
  description: "",
  seasonNumber: "1",
  startsAt: "",
  endsAt: "",
  status: "DRAFT",
  backgroundImageUrl: "",
};

const EMPTY_LEVEL_FORM: LevelFormState = {
  id: "",
  levelNumber: "1",
  title: "",
  description: "",
  imageUrl: "",
  rewardType: "PV",
  rewardAvatarId: "",
  victoryPointsReward: "1",
  manualRewardLabel: "",
};

const EMPTY_QUICK_COSMETIC_FORM: QuickCosmeticFormState = {
  name: "",
  rarity: AVATAR_RARITIES[0]?.value ?? "COMMON",
  availability: "BATTLE_PASS",
  type: "AVATAR",
};

const BATTLE_PASS_PV_IMAGE = "/battle-pass/victory-points.png";

const statusLabels: Record<PassFormState["status"], string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  ARCHIVED: "Archivado",
};

const rewardTypeLabels: Record<LevelFormState["rewardType"], string> = {
  AVATAR: "Avatar",
  BANNER: "Banner",
  PV: "Puntos de victoria",
  MANUAL: "Entrega en tienda",
};

const inputClassName =
  "w-full rounded-lg border border-[#4d4354] bg-[#130a1c] px-3 py-2 text-sm text-[#edddf7] outline-none transition placeholder:text-[#988d9f] focus:border-[#ddb7ff]";

const panelClassName =
  "rounded-xl border border-[#4d4354]/70 bg-[#251c2e] shadow-[0_18px_40px_rgba(0,0,0,0.22)]";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-CO").format(value);

const toDateInput = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const orderedIds = (levels: AdminBattlePassLevel[]) =>
  levels.map((level) => level.id).join("|");

const getLevelRewardLabel = (level: AdminBattlePassLevel) => {
  if (level.rewardType === "PV") {
    return `${level.victoryPointsReward ?? 0} PV`;
  }

  if (level.rewardType === "MANUAL") {
    return level.manualRewardLabel ?? "Entrega en tienda";
  }

  return level.rewardAvatar?.name ?? rewardTypeLabels[level.rewardType];
};

const getRewardToneClassName = (rewardType: LevelFormState["rewardType"]) => {
  if (rewardType === "MANUAL") {
    return "bg-[#3b3144] text-[#ddb8ff]";
  }

  if (rewardType === "PV") {
    return "bg-[#ddb7ff] text-[#490080]";
  }

  return "bg-[#3b3144] text-[#edddf7]";
};

const getStatusBadgeClassName = (status: PassFormState["status"]) => {
  if (status === "ACTIVE") {
    return "bg-[#003824] text-[#4edea3]";
  }

  if (status === "ARCHIVED") {
    return "bg-[#130a1c] text-[#988d9f]";
  }

  return "bg-[#130a1c] text-[#ddb7ff]";
};

const LevelReorderCard = ({
  canReorder,
  isFirst,
  isLast,
  index,
  level,
  onDeleteLevel,
  onEditLevel,
  onMoveLevel,
}: LevelReorderCardProps) => {
  const image =
    level.rewardType === "PV"
      ? BATTLE_PASS_PV_IMAGE
      : level.imageUrl || level.rewardAvatar?.imageUrl;
  const visualLevelNumber = index + 1;

  return (
    <article
      className={clsx(
        "group grid min-w-0 grid-cols-[38px_48px_56px_minmax(0,1fr)_32px] items-center gap-2 rounded-xl border bg-[#302639] p-2 shadow-sm transition sm:grid-cols-[42px_52px_64px_minmax(0,1fr)_auto] sm:gap-3 sm:p-2.5",
        canReorder ? "border-[#4d4354]/80" : "border-[#4d4354]/50",
      )}
    >
      <div className="grid gap-1">
        <button
          type="button"
          onClick={() => onMoveLevel(index, "up")}
          className="inline-flex h-5 w-9 items-center justify-center rounded-md bg-[#3b3144] text-[#cfc2d6] transition hover:bg-[#463a50] hover:text-[#ddb7ff] disabled:cursor-not-allowed disabled:bg-[#21182a] disabled:text-[#988d9f]/40"
          aria-label={`Subir nivel ${level.levelNumber}`}
          disabled={!canReorder || isFirst}
          title="Subir nivel"
        >
          <IoChevronUpOutline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onMoveLevel(index, "down")}
          className="inline-flex h-5 w-9 items-center justify-center rounded-md bg-[#3b3144] text-[#cfc2d6] transition hover:bg-[#463a50] hover:text-[#ddb7ff] disabled:cursor-not-allowed disabled:bg-[#21182a] disabled:text-[#988d9f]/40"
          aria-label={`Bajar nivel ${level.levelNumber}`}
          disabled={!canReorder || isLast}
          title="Bajar nivel"
        >
          <IoChevronDownOutline className="h-4 w-4" />
        </button>
      </div>

      <span className="inline-flex h-14 min-w-0 flex-col items-center justify-center rounded-lg bg-[#130a1c] px-1.5 py-1.5">
        <span className="text-[9px] font-semibold uppercase text-[#988d9f] sm:text-[10px]">
          Nvl
        </span>
        <span className="text-base font-black leading-none text-[#ddb7ff]">
          {String(visualLevelNumber).padStart(2, "0")}
        </span>
      </span>

      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-[#130a1c] sm:h-16 sm:w-16">
        {image ? (
          <Image
            src={toAssetStorageUrl(image)}
            alt={level.title}
            width={96}
            height={96}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <IoGiftOutline className="h-8 w-8 text-[#ddb8ff]" />
        )}
      </div>

      <div className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={clsx(
              "max-w-full truncate rounded px-1.5 py-0.5 text-[9px] font-semibold sm:text-[11px]",
              getRewardToneClassName(level.rewardType),
            )}
          >
            {rewardTypeLabels[level.rewardType]}
          </span>
          <span className="hidden font-mono text-[11px] text-[#988d9f] min-[420px]:inline">
            {formatNumber(level.claimsCount)} reclamos
          </span>
          {level.levelNumber !== visualLevelNumber && (
            <span className="rounded bg-[#003824] px-1.5 py-0.5 text-[11px] font-semibold text-[#4edea3]">
              Sera nivel {visualLevelNumber}
            </span>
          )}
        </div>
        <h3 className="mt-1 truncate text-sm font-semibold text-[#edddf7]">
          {level.title}
        </h3>
        <p className="truncate font-mono text-[11px] text-[#4edea3] sm:text-xs">
          {level.levelNumber} torneos requeridos - {getLevelRewardLabel(level)}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 sm:flex-row">
        <button
          type="button"
          onClick={() => onEditLevel(level)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#3b3144] text-[#cfc2d6] transition hover:bg-[#251c2e] hover:text-[#edddf7] sm:h-8 sm:w-8"
          title={`Editar nivel ${level.levelNumber}`}
          aria-label={`Editar nivel ${level.levelNumber}`}
        >
          <IoCreateOutline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDeleteLevel(level)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#93000a]/20 text-[#ffb4ab] transition hover:bg-[#93000a] hover:text-[#ffdad6] sm:h-8 sm:w-8"
          title="Eliminar nivel"
          aria-label={`Eliminar nivel ${level.levelNumber}`}
        >
          <IoTrashOutline className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

const Field = ({ children, label }: FieldProps) => (
  <label className="grid gap-1.5 text-xs font-semibold text-[#cfc2d6]">
    {label}
    {children}
  </label>
);

const Drawer = ({ children, isOpen, onClose, title }: DrawerProps) => {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex min-h-dvh justify-end bg-[#130a1c]/75 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="hidden flex-1 cursor-default lg:block"
        onClick={onClose}
      />
      <aside className="flex h-dvh w-full min-w-0 flex-col overflow-hidden border-l border-[#4d4354] bg-[#21182a] shadow-2xl sm:max-w-[448px]">
        <div className="flex items-center justify-between gap-3 border-b border-[#4d4354] px-5 py-4">
          <h2 className="text-lg font-bold text-[#edddf7]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#4d4354] text-[#cfc2d6] transition hover:border-[#ddb7ff] hover:bg-[#302639] hover:text-[#edddf7]"
          >
            <IoCloseOutline className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </aside>
    </div>
  );
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-[#130a1c]">
    <div
      className="h-full rounded-full bg-gradient-to-r from-[#7c03d3] via-[#ddb7ff] to-[#4edea3] transition-all"
      style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
    />
  </div>
);

const PassSummaryPanel = ({
  detail,
  levelItems,
  onEditPass,
  selectedManualClaimsCount,
}: PassSummaryPanelProps) => {
  const stats = detail?.stats;

  return (
    <section className={clsx(panelClassName, "min-w-0 p-4 lg:p-5")}>
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <IoTrophyOutline className="h-5 w-5 shrink-0 text-[#ddb7ff]" />
          <h2 className="truncate text-base font-semibold text-[#edddf7]">
            Detalles del pase
          </h2>
        </div>
        <button
          type="button"
          onClick={onEditPass}
          disabled={!detail}
          title="Editar configuracion general"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#cfc2d6] transition hover:bg-[#302639] hover:text-[#edddf7] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IoCreateOutline className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-lg bg-[#130a1c] p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#4edea3]" />
            <span className="truncate text-xs font-semibold text-[#edddf7]">
              Estado operativo
            </span>
          </div>
          <span
            className={clsx(
              "shrink-0 rounded px-2 py-0.5 text-[10px] font-black uppercase",
              detail ? getStatusBadgeClassName(detail.status) : "bg-[#130a1c]",
            )}
          >
            {detail ? statusLabels[detail.status] : "Sin pase"}
          </span>
        </div>
        <h3 className="mt-3 truncate text-xl font-bold text-[#edddf7]">
          {detail?.title ?? "Selecciona un pase"}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-[#cfc2d6]">
          {detail?.description || "Crea o selecciona una temporada para empezar."}
        </p>
      </div>

      <div className="mt-4 grid gap-1.5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-[#cfc2d6]">Progreso global real</span>
          <span className="font-mono font-bold text-[#ddb7ff]">
            {stats?.globalProgressPercent ?? 0}%
          </span>
        </div>
        <ProgressBar value={stats?.globalProgressPercent ?? 0} />
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#988d9f]">
          <span>{detail ? formatDate(detail.startsAt) : "--"}</span>
          <span>{detail ? formatDate(detail.endsAt) : "--"}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[#21182a] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#988d9f]">
            Niveles totales
          </span>
          <p className="mt-1 text-2xl font-black text-[#edddf7]">
            {levelItems.length}
          </p>
          <p className="mt-1 text-[10px] text-[#4edea3]">
            Max. nivel {stats?.maxLevelNumber ?? 0}
          </p>
        </div>
        <div className="rounded-lg bg-[#21182a] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#988d9f]">
            Jugadores con progreso
          </span>
          <p className="mt-1 text-2xl font-black text-[#edddf7]">
            {formatNumber(stats?.playersWithProgress ?? 0)}
          </p>
          <p className="mt-1 text-[10px] text-[#ddb7ff]">
            Torneos en rango
          </p>
        </div>
        <div className="rounded-lg bg-[#21182a] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#988d9f]">
            Recompensas reclamadas
          </span>
          <p className="mt-1 text-2xl font-black text-[#edddf7]">
            {formatNumber(detail?.claimsCount ?? 0)}
          </p>
          <p className="mt-1 text-[10px] text-[#cfc2d6]">
            {stats?.claimRatioPercent ?? 0}% ratio real
          </p>
        </div>
        <div className="rounded-lg bg-[#21182a] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#988d9f]">
            Pendientes tienda
          </span>
          <p className="mt-1 text-2xl font-black text-[#ddb8ff]">
            {formatNumber(
              stats?.pendingStoreDeliveriesCount ?? selectedManualClaimsCount,
            )}
          </p>
          <p className="mt-1 text-[10px] text-[#ddb8ff]">Despacho local</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[#130a1c] p-3">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#988d9f]">
          Mix de recompensas
        </span>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between gap-2 rounded bg-[#21182a] px-2 py-1.5 text-[#edddf7]">
            <span>Avatares</span>
            <strong>{stats?.rewardMix.AVATAR ?? 0}</strong>
          </div>
          <div className="flex items-center justify-between gap-2 rounded bg-[#21182a] px-2 py-1.5 text-[#edddf7]">
            <span>Banners</span>
            <strong>{stats?.rewardMix.BANNER ?? 0}</strong>
          </div>
          <div className="flex items-center justify-between gap-2 rounded bg-[#21182a] px-2 py-1.5 text-[#edddf7]">
            <span>PV</span>
            <strong>{stats?.rewardMix.PV ?? 0}</strong>
          </div>
          <div className="flex items-center justify-between gap-2 rounded bg-[#21182a] px-2 py-1.5 text-[#edddf7]">
            <span>Tienda</span>
            <strong>{stats?.rewardMix.MANUAL ?? 0}</strong>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between rounded bg-[#21182a] px-2 py-1.5 text-xs text-[#4edea3]">
          <span>PV total configurado</span>
          <strong>{formatNumber(stats?.totalPvReward ?? 0)}</strong>
        </div>
      </div>
    </section>
  );
};

const MobileSummaryPanel = ({
  detail,
  levelItems,
  onEditPass,
  selectedManualClaimsCount,
}: PassSummaryPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const stats = detail?.stats;
  const mobileMetrics = [
    {
      label: "Niveles totales",
      value: formatNumber(levelItems.length),
      caption: `Max. nivel ${stats?.maxLevelNumber ?? 0}`,
      icon: <IoMedalOutline className="h-5 w-5 shrink-0 text-[#ddb7ff]" />,
      valueClassName: "text-[#edddf7]",
    },
    {
      label: "Jugadores con progreso",
      value: formatNumber(stats?.playersWithProgress ?? 0),
      caption: "Torneos en rango",
      icon: <IoTrophyOutline className="h-5 w-5 shrink-0 text-[#4edea3]" />,
      valueClassName: "text-[#edddf7]",
    },
    {
      label: "Recompensas reclamadas",
      value: formatNumber(detail?.claimsCount ?? 0),
      caption: `${stats?.claimRatioPercent ?? 0}% ratio real`,
      icon: <IoGiftOutline className="h-5 w-5 shrink-0 text-[#ddb7ff]" />,
      valueClassName: "text-[#edddf7]",
    },
    {
      label: "Pendientes tienda",
      value: formatNumber(
        stats?.pendingStoreDeliveriesCount ?? selectedManualClaimsCount,
      ),
      caption: "Despacho local",
      icon: <IoStorefrontOutline className="h-5 w-5 shrink-0 text-[#ddb8ff]" />,
      valueClassName: "text-[#ddb8ff]",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-xl bg-[#251c2e] p-4 shadow-lg xl:hidden">
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[#ddb7ff]/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase",
                detail ? getStatusBadgeClassName(detail.status) : "bg-[#130a1c]",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" />
              {detail ? statusLabels[detail.status] : "Sin pase"}
            </span>
            <h2 className="truncate text-base font-bold text-[#edddf7]">
              {detail?.title ?? "Pases"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#cfc2d6]">
            {levelItems.length} niveles -{" "}
            {formatNumber(stats?.pendingStoreDeliveriesCount ?? 0)} en tienda
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEditPass}
            disabled={!detail}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#302639] text-[#cfc2d6] transition hover:text-[#edddf7] disabled:opacity-40"
            aria-label="Editar pase"
          >
            <IoCreateOutline className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#302639] text-[#cfc2d6] transition hover:text-[#edddf7]"
            aria-label="Alternar resumen"
          >
            <IoChevronDownOutline
              className={clsx("h-4 w-4 transition", isOpen && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="relative mt-3 grid gap-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-[#cfc2d6]">Progreso global</span>
              <span className="font-mono text-[#4edea3]">
                {stats?.globalProgressPercent ?? 0}%
              </span>
            </div>
            <ProgressBar value={stats?.globalProgressPercent ?? 0} />
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#988d9f]">
              <span>{detail ? formatDate(detail.startsAt) : "--"}</span>
              <span>{detail ? formatDate(detail.endsAt) : "--"}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mobileMetrics.map((metric) => (
              <div
                key={metric.label}
                className="flex min-w-0 items-center gap-2.5 rounded-lg bg-[#302639]/60 p-2.5"
              >
                {metric.icon}
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#988d9f]">
                    {metric.label}
                  </p>
                  <p
                    className={clsx(
                      "truncate text-base font-black",
                      metric.valueClassName,
                    )}
                  >
                    {metric.value}
                  </p>
                  <p className="truncate text-[10px] text-[#cfc2d6]">
                    {metric.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-[#130a1c] p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#988d9f]">
              Mix de recompensas
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between gap-2 rounded bg-[#21182a] px-2 py-1.5 text-[#edddf7]">
                <span>Avatares</span>
                <strong>{stats?.rewardMix.AVATAR ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between gap-2 rounded bg-[#21182a] px-2 py-1.5 text-[#edddf7]">
                <span>Banners</span>
                <strong>{stats?.rewardMix.BANNER ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between gap-2 rounded bg-[#21182a] px-2 py-1.5 text-[#edddf7]">
                <span>PV</span>
                <strong>{stats?.rewardMix.PV ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between gap-2 rounded bg-[#21182a] px-2 py-1.5 text-[#edddf7]">
                <span>Tienda</span>
                <strong>{stats?.rewardMix.MANUAL ?? 0}</strong>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between rounded bg-[#21182a] px-2 py-1.5 text-xs text-[#4edea3]">
              <span>PV total configurado</span>
              <strong>{formatNumber(stats?.totalPvReward ?? 0)}</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const DeliveriesPanel = ({ claims, onDeliverClaims }: DeliveriesPanelProps) => (
  <section className={clsx(panelClassName, "min-w-0 p-4 lg:p-5")}>
    <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <IoStorefrontOutline className="h-5 w-5 text-[#ddb8ff]" />
          <h2 className="text-lg font-semibold text-[#edddf7]">
            Entregas en tienda
          </h2>
        </div>
        <p className="mt-1 text-xs text-[#cfc2d6]">
          Sobres, promos, playmats u otros premios que requieren gestion.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <span className="rounded-lg bg-[#3b3144] px-3 py-1 text-xs font-black uppercase text-[#ddb8ff]">
          {claims.length} pendientes
        </span>
        <Link
          href="/admin/pase-batalla/entregas-tienda"
          className="inline-flex items-center justify-center rounded-lg bg-[#302639] px-3 py-1 text-xs font-bold uppercase text-[#ddb7ff] transition hover:bg-[#3b3144]"
        >
          Vista tienda
        </Link>
      </div>
    </div>

    <BattlePassDeliveryGroups
      claims={claims}
      onDeliverClaims={onDeliverClaims}
    />
  </section>
);

const LevelsPanel = ({
  canReorder,
  detail,
  isOrderDirty,
  isSavingOrder,
  levelItems,
  onCreateLevel,
  onDeleteLevel,
  onEditLevel,
  onMoveLevel,
  onSaveOrder,
  reorderHelp,
  selectedPassId,
}: LevelsPanelProps) => (
  <section className={clsx(panelClassName, "min-w-0 p-4 lg:p-5")}>
    <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <IoMedalOutline className="h-5 w-5 text-[#ddb7ff]" />
          <h2 className="text-lg font-semibold text-[#edddf7]">
            Escalafon de niveles
          </h2>
        </div>
        <p className="mt-1 text-xs text-[#cfc2d6]">{reorderHelp}</p>
        {detail && (
          <p className="mt-1 truncate text-xs text-[#988d9f]">
            {detail.title} - {formatDate(detail.startsAt)} /{" "}
            {formatDate(detail.endsAt)}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 sm:shrink-0">
        {isOrderDirty && (
          <button
            type="button"
            onClick={onSaveOrder}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#ddb7ff]/30 bg-[#302639] px-3 py-2 text-xs font-bold uppercase text-[#ddb7ff] transition hover:bg-[#3b3144] hover:text-[#edddf7] disabled:cursor-wait disabled:opacity-70"
            disabled={isSavingOrder}
          >
            {isSavingOrder ? "Guardando..." : "Guardar orden"}
          </button>
        )}
        <button
          type="button"
          onClick={onCreateLevel}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7c03d3] px-3 py-2 text-xs font-bold uppercase text-[#edddf7] shadow-[0_0_16px_-2px_rgba(183,109,255,0.45)] transition hover:bg-[#b76dff] hover:text-[#400071] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedPassId}
        >
          <IoAddCircleOutline className="h-4 w-4" />
          Nuevo nivel
        </button>
      </div>
    </div>

    {selectedPassId && levelItems.length > 0 && (
      <div className="grid min-w-0 gap-2.5">
        {levelItems.map((level, index) => (
          <LevelReorderCard
            key={level.id}
            canReorder={canReorder}
            isFirst={index === 0}
            isLast={index === levelItems.length - 1}
            index={index}
            level={level}
            onDeleteLevel={onDeleteLevel}
            onEditLevel={onEditLevel}
            onMoveLevel={onMoveLevel}
          />
        ))}
      </div>
    )}

    {selectedPassId && levelItems.length === 0 && (
      <div className="rounded-xl border border-dashed border-[#4d4354] bg-[#21182a] p-5 text-sm text-[#cfc2d6]">
        <p>No hay niveles configurados para este pase.</p>
        <button
          type="button"
          onClick={onCreateLevel}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-[#7c03d3] px-3 py-2 text-xs font-bold uppercase text-[#edddf7] transition hover:bg-[#b76dff] hover:text-[#400071]"
        >
          <IoAddCircleOutline className="h-4 w-4" />
          Crear primer nivel
        </button>
      </div>
    )}

    {!selectedPassId && (
      <div className="rounded-xl border border-dashed border-[#4d4354] bg-[#21182a] p-5 text-sm text-[#cfc2d6]">
        Crea o selecciona un pase para administrar sus niveles.
      </div>
    )}
  </section>
);

export const AdminBattlePassManager = () => {
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const showToast = useToastStore((state) => state.showToast);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  const [passes, setPasses] = useState<AdminBattlePassListItem[]>([]);
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminBattlePassDetail | null>(null);
  const [rewardOptions, setRewardOptions] = useState<BattlePassRewardOption[]>(
    [],
  );
  const [manualRewardImages, setManualRewardImages] = useState<string[]>([]);
  const [passBackgroundImages, setPassBackgroundImages] = useState<string[]>(
    [],
  );
  const [manualClaims, setManualClaims] = useState<AdminBattlePassClaim[]>([]);
  const [levelItems, setLevelItems] = useState<AdminBattlePassLevel[]>([]);
  const [passForm, setPassForm] = useState<PassFormState>(EMPTY_PASS_FORM);
  const [passBackgroundFile, setPassBackgroundFile] = useState<File | null>(
    null,
  );
  const [passBackgroundPreviewUrl, setPassBackgroundPreviewUrl] = useState<
    string | null
  >(null);
  const [levelForm, setLevelForm] = useState<LevelFormState>(EMPTY_LEVEL_FORM);
  const [levelImageFile, setLevelImageFile] = useState<File | null>(null);
  const [levelImagePreviewUrl, setLevelImagePreviewUrl] = useState<
    string | null
  >(null);
  const [quickCosmeticForm, setQuickCosmeticForm] =
    useState<QuickCosmeticFormState>(EMPTY_QUICK_COSMETIC_FORM);
  const [quickCosmeticFile, setQuickCosmeticFile] = useState<File | null>(null);
  const [quickCosmeticPreviewUrl, setQuickCosmeticPreviewUrl] = useState<
    string | null
  >(null);
  const [isPassDrawerOpen, setIsPassDrawerOpen] = useState(false);
  const [isLevelDrawerOpen, setIsLevelDrawerOpen] = useState(false);
  const [isCosmeticDrawerOpen, setIsCosmeticDrawerOpen] = useState(false);
  const [isOrderDirty, setIsOrderDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("levels");
  const [error, setError] = useState<string | null>(null);

  const latestOrderRef = useRef<AdminBattlePassLevel[]>([]);
  const savedOrderRef = useRef("");

  const selectedPass = useMemo(
    () => passes.find((pass) => pass.id === selectedPassId) ?? null,
    [passes, selectedPassId],
  );

  const filteredRewardOptions = useMemo(
    () =>
      rewardOptions.filter((option) =>
        levelForm.rewardType === "AVATAR" || levelForm.rewardType === "BANNER"
          ? option.type === levelForm.rewardType
          : false,
      ),
    [levelForm.rewardType, rewardOptions],
  );

  const selectedRewardOption = useMemo(
    () =>
      rewardOptions.find((option) => option.id === levelForm.rewardAvatarId) ??
      null,
    [levelForm.rewardAvatarId, rewardOptions],
  );

  const levelPreviewSrc = useMemo(() => {
    if (levelForm.rewardType === "PV") return BATTLE_PASS_PV_IMAGE;
    if (levelForm.rewardType === "AVATAR" || levelForm.rewardType === "BANNER") {
      return selectedRewardOption?.imageUrl
        ? toAssetStorageUrl(selectedRewardOption.imageUrl)
        : "";
    }
    if (levelImagePreviewUrl) return levelImagePreviewUrl;
    return levelForm.imageUrl ? toAssetStorageUrl(levelForm.imageUrl) : "";
  }, [
    levelForm.imageUrl,
    levelForm.rewardType,
    levelImagePreviewUrl,
    selectedRewardOption,
  ]);

  const levelPreviewLabel =
    levelForm.rewardType === "PV"
      ? `${levelForm.victoryPointsReward || 0} PV`
      : levelForm.rewardType === "MANUAL"
        ? levelForm.manualRewardLabel || "Entrega en tienda"
        : selectedRewardOption?.name || "Selecciona un cosmetico";

  const passBackgroundPreviewSrc = passBackgroundPreviewUrl
    ? passBackgroundPreviewUrl
    : passForm.backgroundImageUrl
      ? toAssetStorageUrl(passForm.backgroundImageUrl)
      : "";

  const selectedManualClaims = useMemo(
    () =>
      manualClaims.filter((claim) => claim.battlePass.id === selectedPassId),
    [manualClaims, selectedPassId],
  );

  const canReorder =
    detail?.status === "DRAFT" && detail.claimsCount === 0 && levelItems.length > 1;

  const reorderHelp = !detail
    ? "Selecciona un pase para ordenar niveles."
    : detail.status !== "DRAFT"
      ? "Solo los pases en borrador permiten reordenar niveles."
      : detail.claimsCount > 0
        ? "Este pase tiene reclamos y su orden esta bloqueado."
        : levelItems.length > 1
          ? "Usa las flechas para subir o bajar recompensas."
          : "Agrega mas niveles para habilitar el ordenamiento.";

  const loadPasses = useCallback(async () => {
    const list = await getAdminBattlePassesAction();
    setPasses(list);

    const nextSelected =
      selectedPassId && list.some((pass) => pass.id === selectedPassId)
        ? selectedPassId
        : (list[0]?.id ?? null);
    setSelectedPassId(nextSelected);
  }, [selectedPassId]);

  const loadDetail = useCallback(async () => {
    if (!selectedPassId) {
      setDetail(null);
      setLevelItems([]);
      latestOrderRef.current = [];
      savedOrderRef.current = "";
      setIsOrderDirty(false);
      return;
    }

    const nextDetail = await getAdminBattlePassDetailAction({
      battlePassId: selectedPassId,
    });
    setDetail(nextDetail);
    setLevelItems(nextDetail.levels);
    latestOrderRef.current = nextDetail.levels;
    savedOrderRef.current = orderedIds(nextDetail.levels);
    setIsOrderDirty(false);
  }, [selectedPassId]);

  const loadManualClaims = useCallback(async () => {
    const claims = await getAdminBattlePassClaimsAction({
      status: "PENDING_FULFILLMENT",
    });
    setManualClaims(claims);
  }, []);

  const loadManualRewardImages = useCallback(async () => {
    try {
      const images = await getMediaImagesAction("battle-pass-rewards");
      setManualRewardImages(images);
    } catch (err) {
      setManualRewardImages([]);
      showToast(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las imagenes del pase.",
        "error",
      );
    }
  }, [showToast]);

  const loadPassBackgroundImages = useCallback(async () => {
    try {
      const images = await getMediaImagesAction("battle-pass-backgrounds");
      setPassBackgroundImages(images);
    } catch (err) {
      setPassBackgroundImages([]);
      showToast(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los fondos del pase.",
        "error",
      );
    }
  }, [showToast]);

  const loadInitialData = useCallback(async () => {
    try {
      setError(null);
      showLoading("Cargando pase de batalla...");
      const [passList, options, claims] = await Promise.all([
        getAdminBattlePassesAction(),
        getBattlePassRewardOptionsAction(),
        getAdminBattlePassClaimsAction({ status: "PENDING_FULFILLMENT" }),
      ]);

      setPasses(passList);
      setRewardOptions(options);
      setManualClaims(claims);
      setSelectedPassId(passList[0]?.id ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el modulo de pase.",
      );
    } finally {
      hideLoading();
    }
  }, [hideLoading, showLoading]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadManualRewardImages();
  }, [loadManualRewardImages]);

  useEffect(() => {
    loadPassBackgroundImages();
  }, [loadPassBackgroundImages]);

  useEffect(() => {
    if (!passBackgroundFile) {
      setPassBackgroundPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(passBackgroundFile);
    setPassBackgroundPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [passBackgroundFile]);

  useEffect(() => {
    if (!levelImageFile) {
      setLevelImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(levelImageFile);
    setLevelImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [levelImageFile]);

  useEffect(() => {
    if (!quickCosmeticFile) {
      setQuickCosmeticPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(quickCosmeticFile);
    setQuickCosmeticPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [quickCosmeticFile]);

  useEffect(() => {
    loadDetail().catch((err) => {
      setDetail(null);
      setLevelItems([]);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el detalle del pase.",
      );
    });
  }, [loadDetail]);

  const persistLatestLevelOrder = useCallback(
    async () => {
      if (!selectedPassId || !detail || !canReorder) return;

      const orderToSave = latestOrderRef.current;
      const orderKey = orderedIds(orderToSave);

      if (!orderKey || orderKey === savedOrderRef.current) {
        setIsOrderDirty(false);
        return;
      }

      try {
        setIsSavingOrder(true);

        await reorderBattlePassLevelsAction({
          battlePassId: selectedPassId,
          levelIds: orderToSave.map((level) => level.id),
        });

        const normalizedSavedOrder = orderToSave.map((level, index) => ({
          ...level,
          levelNumber: index + 1,
        }));
        const currentOrderKey = orderedIds(latestOrderRef.current);
        const orderChangedWhileSaving = currentOrderKey !== orderKey;

        savedOrderRef.current = orderedIds(normalizedSavedOrder);

        if (!orderChangedWhileSaving) {
          latestOrderRef.current = normalizedSavedOrder;
          setLevelItems(normalizedSavedOrder);
          setDetail((prev) =>
            prev
              ? {
                  ...prev,
                  levels: normalizedSavedOrder,
                }
              : prev,
          );
        }

        setIsOrderDirty(orderChangedWhileSaving);
        await loadPasses();
        showToast("Orden de niveles actualizado.", "success");
      } catch (err) {
        setLevelItems(detail.levels);
        latestOrderRef.current = detail.levels;
        savedOrderRef.current = orderedIds(detail.levels);
        setIsOrderDirty(false);
        showToast(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el orden de niveles.",
          "error",
        );
      } finally {
        setIsSavingOrder(false);
      }
    },
    [canReorder, detail, loadPasses, selectedPassId, showToast],
  );

  const moveLevel = (index: number, direction: "up" | "down") => {
    if (!canReorder) return;

    const currentLevels =
      latestOrderRef.current.length > 0 ? latestOrderRef.current : levelItems;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentLevels.length) {
      return;
    }

    const nextLevels = [...currentLevels];
    const currentLevel = nextLevels[index];
    const targetLevel = nextLevels[targetIndex];

    if (!currentLevel || !targetLevel) return;

    nextLevels[index] = targetLevel;
    nextLevels[targetIndex] = currentLevel;
    latestOrderRef.current = nextLevels;
    setLevelItems(nextLevels);
    setIsOrderDirty(orderedIds(nextLevels) !== savedOrderRef.current);
  };

  const resetPassForm = () => {
    setPassForm(EMPTY_PASS_FORM);
    setPassBackgroundFile(null);
    setIsPassDrawerOpen(true);
  };

  const resetLevelForm = () => {
    if (!selectedPassId) {
      showToast("Selecciona un pase antes de crear niveles.", "error");
      return;
    }

    const nextLevelNumber =
      levelItems.reduce(
        (highest, level) => Math.max(highest, level.levelNumber),
        0,
      ) ?? 0;

    setLevelForm({
      ...EMPTY_LEVEL_FORM,
      levelNumber: String(nextLevelNumber + 1),
    });
    setLevelImageFile(null);
    setIsLevelDrawerOpen(true);
  };

  const editPass = (pass: AdminBattlePassListItem) => {
    setPassForm({
      id: pass.id,
      title: pass.title,
      description: pass.description ?? "",
      seasonNumber: String(pass.seasonNumber),
      startsAt: toDateInput(pass.startsAt),
      endsAt: toDateInput(pass.endsAt),
      status: pass.status,
      backgroundImageUrl: pass.backgroundImageUrl ?? "",
    });
    setPassBackgroundFile(null);
    setIsPassDrawerOpen(true);
  };

  const editSelectedPass = () => {
    if (!selectedPass) return;
    editPass(selectedPass);
  };

  const editLevel = (level: AdminBattlePassLevel) => {
    setLevelForm({
      id: level.id,
      levelNumber: String(level.levelNumber),
      title: level.title,
      description: level.description ?? "",
      imageUrl: level.imageUrl ?? "",
      rewardType: level.rewardType,
      rewardAvatarId: level.rewardAvatarId ?? "",
      victoryPointsReward: String(level.victoryPointsReward ?? 1),
      manualRewardLabel: level.manualRewardLabel ?? level.title,
    });
    setLevelImageFile(null);
    setIsLevelDrawerOpen(true);
  };

  const submitPass = async () => {
    try {
      showLoading(passForm.id ? "Actualizando pase..." : "Creando pase...");
      const payload = new FormData();
      payload.append("id", passForm.id);
      payload.append("title", passForm.title);
      payload.append("description", passForm.description);
      payload.append("seasonNumber", passForm.seasonNumber);
      payload.append("startsAt", passForm.startsAt);
      payload.append("endsAt", passForm.endsAt);
      payload.append("status", passForm.status);
      payload.append("backgroundImageUrl", passForm.backgroundImageUrl);

      if (passBackgroundFile) {
        payload.append("backgroundImageFile", passBackgroundFile);
      }

      const saved = await upsertBattlePassWithBackgroundAction(payload);

      setIsPassDrawerOpen(false);
      setPassForm(EMPTY_PASS_FORM);
      setPassBackgroundFile(null);
      const [passList, nextDetail] = await Promise.all([
        getAdminBattlePassesAction(),
        getAdminBattlePassDetailAction({ battlePassId: saved.id }),
      ]);
      setPasses(passList);
      setSelectedPassId(saved.id);
      setDetail(nextDetail);
      setLevelItems(nextDetail.levels);
      latestOrderRef.current = nextDetail.levels;
      savedOrderRef.current = orderedIds(nextDetail.levels);
      setIsOrderDirty(false);
      await loadPassBackgroundImages();
      showToast("Pase guardado correctamente.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo guardar el pase.",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const submitLevel = async () => {
    if (!selectedPassId) {
      showToast("Selecciona un pase antes de crear niveles.", "error");
      return;
    }

    try {
      showLoading(levelForm.id ? "Actualizando nivel..." : "Creando nivel...");
      const resolvedLevelTitle =
        levelForm.rewardType === "PV"
          ? `${Number(levelForm.victoryPointsReward) || 0} PV`
          : levelForm.rewardType === "AVATAR" ||
              levelForm.rewardType === "BANNER"
            ? selectedRewardOption?.name || levelForm.title
            : levelForm.manualRewardLabel;
      const payload = new FormData();
      payload.append("id", levelForm.id);
      payload.append("battlePassId", selectedPassId);
      payload.append("levelNumber", levelForm.levelNumber);
      payload.append("title", resolvedLevelTitle);
      payload.append("description", levelForm.description);
      payload.append(
        "imageUrl",
        levelForm.rewardType === "MANUAL" ? levelForm.imageUrl : "",
      );
      payload.append("rewardType", levelForm.rewardType);
      payload.append("rewardAvatarId", levelForm.rewardAvatarId);
      payload.append("victoryPointsReward", levelForm.victoryPointsReward);
      payload.append("manualRewardLabel", levelForm.manualRewardLabel);

      if (levelForm.rewardType === "MANUAL" && levelImageFile) {
        payload.append("imageFile", levelImageFile);
      }

      await upsertBattlePassLevelWithImageAction(payload);

      setIsLevelDrawerOpen(false);
      setLevelForm(EMPTY_LEVEL_FORM);
      setLevelImageFile(null);
      await Promise.all([loadPasses(), loadDetail(), loadManualRewardImages()]);
      showToast("Nivel guardado correctamente.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo guardar el nivel.",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const openQuickCosmeticDrawer = (type: "AVATAR" | "BANNER") => {
    setQuickCosmeticForm({
      ...EMPTY_QUICK_COSMETIC_FORM,
      type,
    });
    setQuickCosmeticFile(null);
    setIsCosmeticDrawerOpen(true);
  };

  const submitQuickCosmetic = async () => {
    if (!quickCosmeticFile) {
      showToast("Selecciona una imagen para crear el cosmetico.", "error");
      return;
    }

    try {
      showLoading(
        quickCosmeticForm.type === "AVATAR"
          ? "Creando avatar..."
          : "Creando banner...",
      );

      const payload = new FormData();
      payload.append("file", quickCosmeticFile);
      payload.append("name", quickCosmeticForm.name);
      payload.append("rarity", quickCosmeticForm.rarity);
      payload.append("availability", quickCosmeticForm.availability);
      payload.append("price", "0");
      payload.append("type", quickCosmeticForm.type);
      payload.append("storeVisible", "false");
      payload.append("isSeasonal", "false");
      payload.append("seasonNumber", "");
      payload.append("seasonEndsAt", "");
      payload.append("featured", "false");
      payload.append("featuredOrder", "0");

      const created = await createProfileMediaAction(payload);
      const options = await getBattlePassRewardOptionsAction();

      setRewardOptions(options);
      setLevelForm((prev) => ({
        ...prev,
        rewardType: quickCosmeticForm.type,
        rewardAvatarId: created.id,
        title: created.name,
        imageUrl: "",
      }));
      setQuickCosmeticFile(null);
      setQuickCosmeticForm(EMPTY_QUICK_COSMETIC_FORM);
      setIsCosmeticDrawerOpen(false);
      showToast("Cosmetico creado y seleccionado.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo crear el cosmetico.",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const confirmDeletePass = (pass: AdminBattlePassListItem) => {
    openConfirmation({
      text: "Eliminar pase de batalla",
      description: `Se eliminara "${pass.title}" solo si no tiene reclamos.`,
      action: async () => {
        try {
          showLoading("Eliminando pase...");
          await deleteBattlePassAction({ battlePassId: pass.id });
          await loadPasses();
          if (selectedPassId === pass.id) {
            setSelectedPassId(null);
          }
          showToast("Pase eliminado.", "success");
          return true;
        } catch (err) {
          showToast(
            err instanceof Error ? err.message : "No se pudo eliminar el pase.",
            "error",
          );
          return false;
        } finally {
          hideLoading();
        }
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  const confirmDeleteLevel = (level: AdminBattlePassLevel) => {
    openConfirmation({
      text: "Eliminar nivel",
      description: `Se eliminara el nivel ${level.levelNumber} solo si no tiene reclamos.`,
      action: async () => {
        try {
          showLoading("Eliminando nivel...");
          await deleteBattlePassLevelAction({ levelId: level.id });
          await Promise.all([loadPasses(), loadDetail()]);
          showToast("Nivel eliminado.", "success");
          return true;
        } catch (err) {
          showToast(
            err instanceof Error
              ? err.message
              : "No se pudo eliminar el nivel.",
            "error",
          );
          return false;
        } finally {
          hideLoading();
        }
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  const fulfillClaims = async (userId: string, claimIds: string[]) => {
    try {
      showLoading("Marcando recompensas...");
      await fulfillStoreBattlePassDeliveriesAction({ userId, claimIds });
      await Promise.all([loadManualClaims(), loadDetail()]);
      showToast("Recompensas marcadas como entregadas.", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "No se pudieron actualizar los reclamos.",
        "error",
      );
      throw err;
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="bp-admin min-w-0 overflow-hidden rounded-2xl bg-slate-50 text-slate-900 dark:bg-[#180f21] dark:text-[#edddf7]">
      <div className="flex min-w-0 flex-col gap-4 pb-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-[#93000a] dark:bg-[#93000a]/20 dark:text-[#ffb4ab]">
            {error}
          </div>
        )}

        <header className="hidden min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-transparent dark:bg-[#251c2e] dark:shadow-lg md:flex lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#edddf7]">
                Pase de Batalla
              </h1>
              {detail && (
                <span
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase",
                    getStatusBadgeClassName(detail.status),
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" />
                  T{detail.seasonNumber}: {detail.title}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-[#cfc2d6]">
              Administra temporadas, progresion dinamica de niveles y despacho
              de recompensas fisicas y digitales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedPass && (
              <>
                <button
                  type="button"
                  onClick={() => editPass(selectedPass)}
                  className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 dark:bg-[#302639] dark:text-[#edddf7] dark:hover:bg-[#3b3144]"
                >
                  <IoCreateOutline className="h-4 w-4" />
                  Editar pase
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeletePass(selectedPass)}
                  className="inline-flex items-center gap-1.5 rounded bg-[#93000a]/20 px-3 py-1.5 text-xs font-semibold text-[#ffb4ab] shadow-sm transition hover:bg-[#93000a] hover:text-[#ffdad6]"
                >
                  <IoTrashOutline className="h-4 w-4" />
                  Eliminar
                </button>
              </>
            )}
            <button
              type="button"
              onClick={resetPassForm}
              className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 dark:bg-[#302639] dark:text-[#edddf7] dark:hover:bg-[#3b3144]"
            >
              <IoAddCircleOutline className="h-4 w-4" />
              Nuevo pase
            </button>
            <button
              type="button"
              onClick={resetLevelForm}
              disabled={!selectedPassId}
              className="inline-flex items-center gap-1.5 rounded bg-[#7c03d3] px-3.5 py-1.5 text-xs font-bold text-[#edddf7] shadow-md transition hover:bg-[#b76dff] hover:text-[#400071] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IoAddCircleOutline className="h-4 w-4" />
              Nuevo nivel
            </button>
          </div>
        </header>

        <section className="-mx-4 min-w-0 overflow-x-auto border-y border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-transparent dark:bg-[#21182a] sm:-mx-0 sm:rounded-xl sm:border">
          <div className="flex w-max min-w-full items-center gap-2">
            {passes.map((pass) => (
              <button
                key={pass.id}
                type="button"
                onClick={() => setSelectedPassId(pass.id)}
                className={clsx(
                  "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-left transition active:scale-[0.98]",
                  selectedPassId === pass.id
                    ? "bg-purple-100 text-purple-950 shadow-md dark:bg-[#302639] dark:text-[#edddf7]"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-[#251c2e] dark:text-[#cfc2d6] dark:hover:bg-[#302639]",
                )}
              >
                <span
                  className={clsx(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    selectedPassId === pass.id
                      ? "bg-[#130a1c] text-[#4edea3]"
                      : "bg-[#130a1c] text-[#988d9f]",
                  )}
                >
                  {pass.status === "ARCHIVED" ? (
                    <IoArchiveOutline className="h-4 w-4" />
                  ) : (
                    <IoTrophyOutline className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="max-w-[180px] truncate text-xs font-bold sm:max-w-[260px]">
                      {pass.title}
                    </span>
                    <span
                      className={clsx(
                        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                        getStatusBadgeClassName(pass.status),
                      )}
                    >
                      {statusLabels[pass.status]}
                    </span>
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-slate-500 dark:text-[#988d9f]">
                    T{pass.seasonNumber} - {pass.levelsCount} niveles -{" "}
                    {pass.claimsCount} reclamos
                  </span>
                </span>
              </button>
            ))}

            {passes.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-[#4d4354] dark:text-[#cfc2d6]">
                No hay pases creados.
              </div>
            )}

            <button
              type="button"
              onClick={resetPassForm}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-purple-50 px-3 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 dark:bg-[#251c2e] dark:text-[#ddb7ff] dark:hover:bg-[#302639]"
            >
              <IoAddCircleOutline className="h-4 w-4" />
              Crear pase
            </button>
          </div>
        </section>

        <MobileSummaryPanel
          detail={detail}
          levelItems={levelItems}
          onEditPass={editSelectedPass}
          selectedManualClaimsCount={selectedManualClaims.length}
        />

        <div className="flex rounded-xl bg-slate-200 p-1 dark:bg-[#21182a] xl:hidden">
          <button
            type="button"
            onClick={() => setMobileView("levels")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-xs font-bold transition",
              mobileView === "levels"
                ? "bg-white text-purple-700 shadow-sm dark:bg-[#251c2e] dark:text-[#ddb7ff]"
                : "text-slate-600 hover:text-slate-900 dark:text-[#cfc2d6] dark:hover:text-[#edddf7]",
            )}
          >
            Escalafon de niveles
          </button>
          <button
            type="button"
            onClick={() => setMobileView("deliveries")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-xs font-bold transition",
              mobileView === "deliveries"
                ? "bg-white text-purple-700 shadow-sm dark:bg-[#251c2e] dark:text-[#ddb7ff]"
                : "text-slate-600 hover:text-slate-900 dark:text-[#cfc2d6] dark:hover:text-[#edddf7]",
            )}
          >
            Canjes fisicos ({manualClaims.length})
          </button>
        </div>

        <div className="hidden min-w-0 grid-cols-1 gap-4 xl:grid xl:grid-cols-12">
          <div className="xl:col-span-4">
            <PassSummaryPanel
              detail={detail}
              levelItems={levelItems}
              onEditPass={editSelectedPass}
              selectedManualClaimsCount={selectedManualClaims.length}
            />
          </div>
          <div className="xl:col-span-8">
            <LevelsPanel
              canReorder={canReorder}
              detail={detail}
              isOrderDirty={isOrderDirty}
              isSavingOrder={isSavingOrder}
              levelItems={levelItems}
              onCreateLevel={resetLevelForm}
              onDeleteLevel={confirmDeleteLevel}
              onEditLevel={editLevel}
              onMoveLevel={moveLevel}
              onSaveOrder={persistLatestLevelOrder}
              reorderHelp={reorderHelp}
              selectedPassId={selectedPassId}
            />
          </div>
        </div>

        <div className="xl:hidden">
          {mobileView === "levels" ? (
            <LevelsPanel
              canReorder={canReorder}
              detail={detail}
              isOrderDirty={isOrderDirty}
              isSavingOrder={isSavingOrder}
              levelItems={levelItems}
              onCreateLevel={resetLevelForm}
              onDeleteLevel={confirmDeleteLevel}
              onEditLevel={editLevel}
              onMoveLevel={moveLevel}
              onSaveOrder={persistLatestLevelOrder}
              reorderHelp={reorderHelp}
              selectedPassId={selectedPassId}
            />
          ) : (
            <DeliveriesPanel
              claims={manualClaims}
              onDeliverClaims={fulfillClaims}
            />
          )}
        </div>

        <div className="hidden xl:block">
          <DeliveriesPanel
            claims={manualClaims}
            onDeliverClaims={fulfillClaims}
          />
        </div>
      </div>

      <Drawer
        isOpen={isPassDrawerOpen}
        onClose={() => setIsPassDrawerOpen(false)}
        title={passForm.id ? "Editar pase" : "Crear pase"}
      >
        <div className="grid gap-3">
          <Field label="Titulo">
            <input
              value={passForm.title}
              onChange={(event) =>
                setPassForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </Field>
          <Field label="Descripcion">
            <textarea
              value={passForm.description}
              onChange={(event) =>
                setPassForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={3}
              className={inputClassName}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Temporada">
              <input
                type="number"
                min={1}
                value={passForm.seasonNumber}
                onChange={(event) =>
                  setPassForm((prev) => ({
                    ...prev,
                    seasonNumber: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </Field>
            <Field label="Estado">
              <select
                value={passForm.status}
                onChange={(event) =>
                  setPassForm((prev) => ({
                    ...prev,
                    status: event.target.value as PassFormState["status"],
                  }))
                }
                className={inputClassName}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Inicio">
              <input
                type="date"
                value={passForm.startsAt}
                onChange={(event) =>
                  setPassForm((prev) => ({
                    ...prev,
                    startsAt: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </Field>
            <Field label="Cierre">
              <input
                type="date"
                value={passForm.endsAt}
                onChange={(event) =>
                  setPassForm((prev) => ({
                    ...prev,
                    endsAt: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </Field>
          </div>
          <div className="grid gap-3 rounded-xl border border-[#4d4354] bg-[#130a1c] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#cfc2d6]">
                Fondo del pase
              </span>
              <span className="truncate text-xs text-[#988d9f]">
                Vista jugador
              </span>
            </div>
            <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-[#4d4354] bg-[#21182a]">
              {passBackgroundPreviewSrc ? (
                <Image
                  src={passBackgroundPreviewSrc}
                  alt="Fondo del pase"
                  fill
                  sizes="448px"
                  unoptimized={passBackgroundPreviewSrc.startsWith("blob:")}
                  className="object-cover"
                />
              ) : (
                <IoImagesOutline className="h-10 w-10 text-[#988d9f]" />
              )}
            </div>
            <Field label="Fondo existente">
              <select
                value={passBackgroundFile ? "" : passForm.backgroundImageUrl}
                onChange={(event) => {
                  setPassBackgroundFile(null);
                  setPassForm((prev) => ({
                    ...prev,
                    backgroundImageUrl: event.target.value,
                  }));
                }}
                className={inputClassName}
              >
                <option value="">Usar fondo por defecto</option>
                {passBackgroundImages.map((image) => (
                  <option key={image} value={image}>
                    {image.split("/").pop() ?? image}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subir fondo al guardar">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setPassBackgroundFile(file);
                  if (file) {
                    setPassForm((prev) => ({
                      ...prev,
                      backgroundImageUrl: "",
                    }));
                  }
                }}
                className="w-full rounded-lg border border-[#4d4354] bg-[#130a1c] px-3 py-2 text-sm text-[#edddf7] file:mr-3 file:rounded-md file:border-0 file:bg-[#302639] file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-[#ddb7ff] hover:file:bg-[#3b3144]"
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={submitPass}
            className="mt-2 rounded-xl bg-[#7c03d3] px-4 py-3 text-sm font-black uppercase text-[#edddf7] transition hover:bg-[#b76dff] hover:text-[#400071]"
          >
            Guardar pase
          </button>
        </div>
      </Drawer>

      <Drawer
        isOpen={isLevelDrawerOpen}
        onClose={() => setIsLevelDrawerOpen(false)}
        title={levelForm.id ? "Editar nivel" : "Crear nivel"}
      >
        <div className="grid gap-3">
          <Field label="Nivel">
            <input
              type="number"
              min={1}
              value={levelForm.levelNumber}
              onChange={(event) =>
                setLevelForm((prev) => ({
                  ...prev,
                  levelNumber: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </Field>
          <Field label="Descripcion">
            <textarea
              value={levelForm.description}
              onChange={(event) =>
                setLevelForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={3}
              className={inputClassName}
            />
          </Field>
          <Field label="Tipo de recompensa">
            <select
              value={levelForm.rewardType}
              onChange={(event) => {
                const rewardType = event.target
                  .value as LevelFormState["rewardType"];
                setLevelImageFile(null);
                setLevelForm((prev) => ({
                  ...prev,
                  rewardType,
                  rewardAvatarId: "",
                  title:
                    rewardType === "PV"
                      ? `${Number(prev.victoryPointsReward) || 0} PV`
                      : rewardType === "MANUAL"
                        ? prev.manualRewardLabel
                        : "",
                  imageUrl: rewardType === "MANUAL" ? prev.imageUrl : "",
                }));
              }}
              className={inputClassName}
            >
              {Object.entries(rewardTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          {(levelForm.rewardType === "AVATAR" ||
            levelForm.rewardType === "BANNER") && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#cfc2d6]">
                  Cosmetico
                </span>
                <button
                  type="button"
                  onClick={() =>
                    openQuickCosmeticDrawer(
                      levelForm.rewardType === "AVATAR" ? "AVATAR" : "BANNER",
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-[#302639] px-2.5 py-1.5 text-[11px] font-bold uppercase text-[#ddb7ff] transition hover:bg-[#3b3144] hover:text-[#edddf7]"
                >
                  <IoAddCircleOutline className="h-3.5 w-3.5" />
                  Crear{" "}
                  {levelForm.rewardType === "AVATAR" ? "avatar" : "banner"}
                </button>
              </div>
              <select
                value={levelForm.rewardAvatarId}
                onChange={(event) => {
                  const selectedOption = rewardOptions.find(
                    (option) => option.id === event.target.value,
                  );
                  setLevelForm((prev) => ({
                    ...prev,
                    rewardAvatarId: event.target.value,
                    title: selectedOption?.name ?? "",
                    imageUrl: "",
                  }));
                }}
                className={inputClassName}
              >
                <option value="">Selecciona cosmetico</option>
                {filteredRewardOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} - {option.rarity}
                  </option>
                ))}
              </select>
            </div>
          )}

          {levelForm.rewardType === "PV" && (
            <Field label="PV a entregar">
              <input
                type="number"
                min={1}
                value={levelForm.victoryPointsReward}
                onChange={(event) => {
                  const value = event.target.value;
                  setLevelForm((prev) => ({
                    ...prev,
                    victoryPointsReward: value,
                    title: `${Number(value) || 0} PV`,
                  }));
                }}
                className={inputClassName}
              />
            </Field>
          )}

          {levelForm.rewardType === "MANUAL" && (
            <Field label="Premio manual">
              <input
                value={levelForm.manualRewardLabel}
                onChange={(event) => {
                  const value = event.target.value;
                  setLevelForm((prev) => ({
                    ...prev,
                    title: value,
                    manualRewardLabel: value,
                  }));
                }}
                placeholder="Ej: Sobre promo, playmat"
                className={inputClassName}
              />
            </Field>
          )}

          <div className="grid gap-2 rounded-xl border border-[#4d4354] bg-[#130a1c] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#cfc2d6]">
                Vista previa
              </span>
              <span className="truncate text-xs text-[#988d9f]">
                {levelPreviewLabel}
              </span>
            </div>
            <div>
              <div
                className={clsx(
                  "relative flex shrink-0 items-center justify-center overflow-hidden border border-[#4d4354] bg-[#21182a]",
                  levelForm.rewardType === "BANNER"
                    ? "h-28 w-full rounded-lg"
                    : "h-24 w-24 rounded-xl",
                )}
              >
                {levelPreviewSrc ? (
                  <Image
                    src={levelPreviewSrc}
                    alt={levelPreviewLabel}
                    fill
                    sizes={
                      levelForm.rewardType === "BANNER" ? "448px" : "96px"
                    }
                    unoptimized={levelPreviewSrc.startsWith("blob:")}
                    className="object-cover"
                  />
                ) : (
                  <IoGiftOutline className="h-10 w-10 text-[#ddb7ff]" />
                )}
              </div>
            </div>
          </div>

          {levelForm.rewardType === "MANUAL" && (
            <div className="grid gap-3">
              <Field label="Imagen existente">
                <select
                  value={levelImageFile ? "" : levelForm.imageUrl}
                  onChange={(event) => {
                    setLevelImageFile(null);
                    setLevelForm((prev) => ({
                      ...prev,
                      imageUrl: event.target.value,
                    }));
                  }}
                  className={inputClassName}
                >
                  <option value="">Usar icono de regalo</option>
                  {manualRewardImages.map((image) => (
                    <option key={image} value={image}>
                      {image.split("/").pop() ?? image}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Subir imagen al guardar">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setLevelImageFile(file);
                    if (file) {
                      setLevelForm((prev) => ({
                        ...prev,
                        imageUrl: "",
                      }));
                    }
                  }}
                  className="w-full rounded-lg border border-[#4d4354] bg-[#130a1c] px-3 py-2 text-sm text-[#edddf7] file:mr-3 file:rounded-md file:border-0 file:bg-[#302639] file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-[#ddb7ff] hover:file:bg-[#3b3144]"
                />
              </Field>
            </div>
          )}
          <button
            type="button"
            onClick={submitLevel}
            className="mt-2 rounded-xl bg-[#7c03d3] px-4 py-3 text-sm font-black uppercase text-[#edddf7] transition hover:bg-[#b76dff] hover:text-[#400071]"
          >
            Guardar nivel
          </button>
        </div>
      </Drawer>

      <Drawer
        isOpen={isCosmeticDrawerOpen}
        onClose={() => setIsCosmeticDrawerOpen(false)}
        title={
          quickCosmeticForm.type === "AVATAR" ? "Crear avatar" : "Crear banner"
        }
      >
        <div className="grid gap-3">
          <Field label="Tipo">
            <select
              value={quickCosmeticForm.type}
              onChange={(event) =>
                setQuickCosmeticForm((prev) => ({
                  ...prev,
                  type: event.target.value as QuickCosmeticFormState["type"],
                }))
              }
              className={inputClassName}
            >
              <option value="AVATAR">Avatar</option>
              <option value="BANNER">Banner</option>
            </select>
          </Field>
          <Field label="Nombre">
            <input
              value={quickCosmeticForm.name}
              onChange={(event) =>
                setQuickCosmeticForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </Field>
          <Field label="Rareza">
            <select
              value={quickCosmeticForm.rarity}
              onChange={(event) =>
                setQuickCosmeticForm((prev) => ({
                  ...prev,
                  rarity: event.target.value,
                }))
              }
              className={inputClassName}
            >
              {AVATAR_RARITIES.map((rarity) => (
                <option key={rarity.value} value={rarity.value}>
                  {rarity.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Disponibilidad">
            <select
              value={quickCosmeticForm.availability}
              onChange={(event) =>
                setQuickCosmeticForm((prev) => ({
                  ...prev,
                  availability: event.target.value,
                }))
              }
              className={inputClassName}
            >
              {AVATAR_AVAILABILITIES.map((availability) => (
                <option key={availability.value} value={availability.value}>
                  {availability.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Imagen">
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setQuickCosmeticFile(event.target.files?.[0] ?? null)
              }
              className="w-full rounded-lg border border-[#4d4354] bg-[#130a1c] px-3 py-2 text-sm text-[#edddf7] file:mr-3 file:rounded-md file:border-0 file:bg-[#302639] file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-[#ddb7ff] hover:file:bg-[#3b3144]"
            />
          </Field>
          <div className="rounded-xl border border-[#4d4354] bg-[#130a1c] p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#cfc2d6]">
              <IoImagesOutline className="h-4 w-4 text-[#ddb7ff]" />
              Vista previa
            </div>
            <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-[#21182a]">
              {quickCosmeticPreviewUrl ? (
                <Image
                  src={quickCosmeticPreviewUrl}
                  alt={quickCosmeticForm.name || "Nuevo cosmetico"}
                  fill
                  sizes="448px"
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <IoImagesOutline className="h-10 w-10 text-[#988d9f]" />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={submitQuickCosmetic}
            className="mt-2 rounded-xl bg-[#7c03d3] px-4 py-3 text-sm font-black uppercase text-[#edddf7] transition hover:bg-[#b76dff] hover:text-[#400071]"
          >
            Crear y seleccionar
          </button>
        </div>
      </Drawer>
    </div>
  );
};
