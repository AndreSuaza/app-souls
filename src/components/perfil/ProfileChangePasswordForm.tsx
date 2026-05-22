"use client";

import { useState } from "react";
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { changePassword } from "@/actions";
import { useToastStore, useUIStore } from "@/store";

type PasswordFieldProps = {
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
};

const PasswordField = ({
  label,
  value,
  visible,
  onChange,
  onToggle,
}: PasswordFieldProps) => {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-purple-200">
        {label}
      </span>
      <span className="relative block">
        <IoLockClosedOutline className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-purple-300" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="********"
          className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-slate-100 dark:focus:border-purple-400 dark:focus:ring-purple-500/30"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-500 dark:text-purple-300"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <IoEyeOffOutline className="h-5 w-5" />
          ) : (
            <IoEyeOutline className="h-5 w-5" />
          )}
        </button>
      </span>
    </label>
  );
};

type Props = {
  disabled?: boolean;
};

export const ProfileChangePasswordForm = ({ disabled = false }: Props) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);

  const clearFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    showLoading("Actualizando contraseña...");
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.success) {
        const message = result.message ?? "No se pudo cambiar la contraseña.";
        setErrorMessage(message);
        showToast(message, "error");
        return;
      }

      showToast("Contraseña actualizada correctamente.", "success");
      clearFields();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la contraseña.";
      setErrorMessage(message);
      showToast(message, "error");
    } finally {
      hideLoading();
    }
  };

  const hasPendingValues = Boolean(
    currentPassword || newPassword || confirmPassword,
  );
  const canSave =
    !disabled &&
    currentPassword.trim().length > 0 &&
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0;

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-100">
            <IoShieldCheckmarkOutline className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
            Cambio de contraseña
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Ingresa tu contraseña actual y define la nueva contraseña.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <PasswordField
              label="Contraseña actual"
              value={currentPassword}
              visible={showCurrentPassword}
              onChange={setCurrentPassword}
              onToggle={() => setShowCurrentPassword((value) => !value)}
            />
          </div>
          <PasswordField
            label="Nueva contraseña"
            value={newPassword}
            visible={showNewPassword}
            onChange={setNewPassword}
            onToggle={() => setShowNewPassword((value) => !value)}
          />
          <PasswordField
            label="Confirmar contraseña"
            value={confirmPassword}
            visible={showConfirmPassword}
            onChange={setConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-purple-200">
          Debe incluir mayúsculas, números y un símbolo especial.
        </div>

        {disabled && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
            Inicia sesión para cambiar la contraseña.
          </p>
        )}

        {errorMessage && (
          <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-200">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-wrap justify-start gap-3 border-t border-slate-200 pt-5 dark:border-tournament-dark-border">
          <button
            type="button"
            onClick={clearFields}
            disabled={!hasPendingValues}
            className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:border-purple-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-900/40 disabled:text-slate-400"
          >
            Guardar
          </button>
        </div>
      </div>
    </section>
  );
};
