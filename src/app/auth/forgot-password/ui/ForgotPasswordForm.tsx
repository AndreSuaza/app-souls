"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth/request-password-reset";

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-center">
        Recuperar contraseña
      </h2>

      {success && (
        <p className="text-center text-green-500 mb-5 text-sm">
          Enviamos un enlace de recuperación a tu correo electrónico.
        </p>
      )}

      {!success && errorMsg && (
        <span className="text-red-500 my-2 text-sm">
          <p>
            <i>{errorMsg}</i>
          </p>
        </span>
      )}

      <label htmlFor="email">Correo electrónico</label>
      <input
        className={clsx("px-5 py-2 border bg-gray-200 rounded mb-5", {
          "border-red-500": errors.email,
        })}
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
        className={clsx("py-2 rounded transition", {
          "bg-indigo-500 text-white hover:bg-indigo-600":
            !success && !isPending,
          "bg-gray-300 cursor-not-allowed": success || isPending,
        })}
      >
        {isPending ? "Enviando..." : "Enviar enlace"}
      </button>

      <Link
        href="/auth/login"
        className="mt-6 font-bold text-center text-slate-500"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  );
};
