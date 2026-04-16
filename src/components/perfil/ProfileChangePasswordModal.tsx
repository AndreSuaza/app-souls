"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IoCloseOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { Modal } from "../ui/modal/modal";
import { changePassword, verifyCurrentPassword } from "@/actions";
import { useToastStore, useUIStore } from "@/store";

type Step = "verify" | "new";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const ProfileChangePasswordModal = ({ open, onClose }: Props) => {
  const [step, setStep] = useState<Step>("verify");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);

  const isVerifyDisabled = currentPassword.trim().length < 8;
  const isChangeDisabled =
    newPassword.trim().length === 0 || confirmPassword.trim().length === 0;

  const subtitle = useMemo(() => {
    if (step === "verify") {
      return "Verifica tu contraseña actual para continuar.";
    }
    return "Define tu nueva contraseña y confírmala.";
  }, [step]);

  useEffect(() => {
    if (!open) {
      setStep("verify");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    onClose();
    setStep("verify");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleVerify = async () => {
    setErrorMessage(null);
    showLoading("Verificando contraseña...");
    try {
      const result = await verifyCurrentPassword({ currentPassword });
      if (!result.success) {
        const message =
          result.message ?? "La contraseña actual no es correcta.";
        setErrorMessage(message);
        showToast(message, "error");
        return;
      }
      // Se desbloquea el segundo paso solo si la contraseña actual es válida.
      setStep("new");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo verificar la contraseña.";
      setErrorMessage(message);
      showToast(message, "error");
    } finally {
      hideLoading();
    }
  };

  const handleChangePassword = async () => {
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
        const message =
          result.message ?? "No se pudo cambiar la contraseña.";
        setErrorMessage(message);
        showToast(
          message,
          "error",
        );
        return;
      }
      showToast("Contraseña actualizada correctamente.", "success");
      handleClose();
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

  return (
    <Modal
      className="inset-0 flex items-center justify-center p-4"
      close={handleClose}
      hideCloseButton
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            <IoCloseOutline className="h-5 w-5" />
          </button>

          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-700 shadow dark:bg-purple-500/20 dark:text-purple-100">
            <IoShieldCheckmarkOutline className="h-6 w-6" />
          </div>
          <h2 className="text-center text-2xl font-semibold text-slate-800 dark:text-purple-100">
            {step === "verify" ? "Verificar identidad" : "Nueva contraseña"}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-purple-200">
            {subtitle}
          </p>

          <div className="mt-6 space-y-4">
            {step === "verify" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-purple-200">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-purple-300" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-slate-100 dark:focus:border-purple-400 dark:focus:ring-purple-500/30"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-500 dark:text-purple-300"
                      aria-label={
                        showCurrentPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showCurrentPassword ? (
                        <IoEyeOffOutline className="h-5 w-5" />
                      ) : (
                        <IoEyeOutline className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p className="rounded-lg bg-red-100 px-4 py-2 text-xs text-red-700 dark:bg-red-500/15 dark:text-red-200">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifyDisabled}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continuar
                </button>
              </div>
            )}

            {step === "new" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-purple-200">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-slate-100 dark:focus:border-purple-400 dark:focus:ring-purple-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-500 dark:text-purple-300"
                      aria-label={
                        showNewPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showNewPassword ? (
                        <IoEyeOffOutline className="h-5 w-5" />
                      ) : (
                        <IoEyeOutline className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-purple-200">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-slate-100 dark:focus:border-purple-400 dark:focus:ring-purple-500/30"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-500 dark:text-purple-300"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showConfirmPassword ? (
                        <IoEyeOffOutline className="h-5 w-5" />
                      ) : (
                        <IoEyeOutline className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-purple-200">
                  Debe incluir mayúsculas, números y un símbolo especial.
                </div>

                {errorMessage && (
                  <p className="rounded-lg bg-red-100 px-4 py-2 text-xs text-red-700 dark:bg-red-500/15 dark:text-red-200">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isChangeDisabled}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Actualizar contraseña
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
