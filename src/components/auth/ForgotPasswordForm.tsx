"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import Link from "next/link";
import { requestPasswordReset } from "@/actions";

export const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = ({ email }: { email: string }) => {
    setErrorMsg(null);

    startTransition(async () => {
      const resp = await requestPasswordReset(email);

      if (!resp.success) {
        setErrorMsg("Hubo un error enviando el correo. Intenta nuevamente.");
      } else {
        setSuccess(true);
      }
    });
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
          }
        )}
        type="email"
        placeholder="Ingresa tu correo electrónico"
        disabled={isPending}
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
          }
        )}
        aria-busy={isPending}
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {isPending ? "Enviando..." : "Enviar enlace"}
      </button>

      <Link
        href="/auth/login"
        className="mt-3 text-center text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  );
};
