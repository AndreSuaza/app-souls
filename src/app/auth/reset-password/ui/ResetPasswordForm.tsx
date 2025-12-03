"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { resetPassword } from "@/actions/auth/reset-password";

interface Props {
  token: string;
}

interface ResetPasswordFormValues {
  password: string;
  confirm: string;
}

export const ResetPasswordForm = ({ token }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = ({ password, confirm }: ResetPasswordFormValues) => {
    setErrorMsg(null);

    if (password !== confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      const resp = await resetPassword(token, password);

      if (!resp.success) {
        setErrorMsg(resp.message ?? "Error al restablecer la contraseña.");
      } else {
        setSuccessMsg("Contraseña restablecida correctamente. Redirigiendo...");

        setTimeout(() => {
          router.push("/auth/login");
        }, 1800);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <h2 className="text-xl font-bold mb-2 text-center">
        Crear nueva contraseña
      </h2>

      {successMsg && (
        <p className="text-center text-green-500 mb-5 text-sm">{successMsg}</p>
      )}

      {!successMsg && errorMsg && (
        <span className="text-red-500 my-2 text-sm">
          <p>
            <i>{errorMsg}</i>
          </p>
        </span>
      )}

      <label>Nueva contraseña</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Ingresa tu nueva contraseña"
          disabled={isPending}
          className={clsx("px-5 py-2 border bg-gray-200 rounded w-full pr-12", {
            "border-red-500": errors.password,
          })}
          {...register("password", {
            required: "La contraseña es obligatoria.",
            minLength: {
              value: 8,
              message: "Debe tener al menos 8 caracteres.",
            },
            validate: {
              hasUpper: (v) =>
                /[A-Z]/.test(v) || "Debe contener una mayúscula.",
              hasNumber: (v) =>
                /\d.*\d/.test(v) || "Debe contener al menos dos números.",
              hasSpecial: (v) =>
                /[!@#$%^&*(),.?\":{}|<>]/.test(v) ||
                "Debe contener un carácter especial.",
            },
          })}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          tabIndex={-1}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible size={22} />
          ) : (
            <AiOutlineEye size={22} />
          )}
        </button>
      </div>

      {errors.password && (
        <p className="text-xs text-red-500 mb-3">{errors.password.message}</p>
      )}

      <label>Confirmar contraseña</label>
      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Repite tu nueva contraseña"
          disabled={isPending}
          className={clsx("px-5 py-2 border bg-gray-200 rounded w-full pr-12", {
            "border-red-500": errors.confirm,
          })}
          {...register("confirm", {
            required: "La confirmación es obligatoria.",
          })}
        />

        <button
          type="button"
          onClick={() => setShowConfirm((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          tabIndex={-1}
        >
          {showConfirm ? (
            <AiOutlineEyeInvisible size={22} />
          ) : (
            <AiOutlineEye size={22} />
          )}
        </button>
      </div>

      {errors.confirm && (
        <p className="text-xs text-red-500 mb-3">{errors.confirm.message}</p>
      )}

      <button
        disabled={isPending || !!successMsg}
        className={clsx("mt-2 py-2 rounded transition", {
          "bg-indigo-500 text-white hover:bg-indigo-600":
            !successMsg && !isPending,
          "bg-gray-300 cursor-not-allowed": isPending || successMsg,
        })}
      >
        {isPending ? "Guardando..." : "Restablecer contraseña"}
      </button>

      <Link
        href="/auth/login"
        className="mt-2 font-bold text-center text-slate-500"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  );
};
