"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import Link from "next/link";
import { requestPasswordReset } from "@/actions";

type ForgotPasswordFormValues = {
  email: string;
};

export const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>();

  const [success, setSuccess] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!success || cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds, success]);

  const sendResetRequest = (email: string) => {
    setErrorMsg(null);

    startTransition(async () => {
      const resp = await requestPasswordReset(email);

      if (!resp.success) {
        setErrorMsg(
          resp.message ?? "Hubo un error enviando el correo. Intenta nuevamente.",
        );
        if (resp.retryAfterSeconds) {
          setCooldownSeconds(resp.retryAfterSeconds);
        }
        return;
      }

      setSuccess(true);
      setCooldownSeconds(resp.retryAfterSeconds ?? 60);
    });
  };

  const onSubmit = ({ email }: ForgotPasswordFormValues) => {
    sendResetRequest(email);
  };

  const onResend = () => {
    if (cooldownSeconds > 0) return;
    sendResetRequest(getValues("email"));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-center text-slate-900">
        Recuperar contraseña
      </h2>

      {success && (
        <p className="text-center text-green-600 text-sm">
          Enviamos un enlace de recuperación a tu correo electrónico.
        </p>
      )}

      {!success && errorMsg && (
        <span className="text-red-500 text-sm">
          <p>
            <i>{errorMsg}</i>
          </p>
        </span>
      )}

      <label
        htmlFor="email"
        className="text-xs font-semibold tracking-[0.12em] text-slate-600"
      >
        Correo electrónico
      </label>
      <input
        className={clsx(
          "px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
          {
            "border-red-500": errors.email,
            "border-slate-200": !errors.email,
          },
        )}
        type="email"
        placeholder="Ingresa tu correo electrónico"
        disabled={isPending || success}
        {...register("email", {
          required: "es requerido.",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "correo no válido.",
          },
        })}
      />

      <button
        disabled={isPending || success}
        className={clsx(
          "mt-2 py-3 rounded-lg text-sm font-semibold tracking-wide transition inline-flex items-center justify-center gap-2",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_12px_30px_rgba(79,70,229,0.35)]":
              !success && !isPending,
            "bg-gray-300 cursor-not-allowed text-gray-500":
              success || isPending,
          },
        )}
        aria-busy={isPending}
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {isPending ? "Enviando..." : "Enviar enlace"}
      </button>

      {success && (
        <button
          type="button"
          onClick={onResend}
          disabled={isPending || cooldownSeconds > 0}
          className={clsx(
            "py-2 text-sm font-semibold transition",
            cooldownSeconds > 0 || isPending
              ? "text-slate-400 cursor-not-allowed"
              : "text-indigo-600 hover:text-indigo-700",
          )}
        >
          {cooldownSeconds > 0
            ? `Reenviar enlace en ${cooldownSeconds}s`
            : "Reenviar enlace"}
        </button>
      )}

      <Link
        href="/auth/login"
        className="mt-3 text-center text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  );
};
