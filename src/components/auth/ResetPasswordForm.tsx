"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdCheckCircle, MdError } from "react-icons/md";
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-center text-slate-900">
        Cambiar contraseña
      </h2>

      {successMsg && (
        <div className="flex items-center gap-2 text-green-600 text-xs my-2 px-2 py-2 bg-green-50 border border-green-200 rounded">
          <MdCheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {!successMsg && errorMsg && (
        <div className="flex items-center gap-2 text-red-500 text-xs my-2 px-2 py-2 bg-red-50 border border-red-200 rounded">
          <MdError size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col">
        <label
          htmlFor="password"
          className="text-sm font-semibold tracking-[0.12em] text-slate-600"
        >
          Nueva contraseña
        </label>
        <div className="relative mt-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={String.fromCharCode(8226).repeat(8)}
            disabled={isPending}
            className={clsx(
              "w-full px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
              {
                "border-red-500": errors.password,
                "border-slate-200": !errors.password,
              }
            )}
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
                  "Debe contener un caracter especial.",
              },
            })}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 inset-y-0 flex items-center text-slate-500"
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
          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
            <MdError size={14} />
            <span>{errors.password.message}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="confirm"
          className="text-sm font-semibold tracking-[0.12em] text-slate-600"
        >
          Confirmar contraseña
        </label>
        <div className="relative mt-2">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder={String.fromCharCode(8226).repeat(8)}
            disabled={isPending}
            className={clsx(
              "w-full px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
              {
                "border-red-500": errors.confirm,
                "border-slate-200": !errors.confirm,
              }
            )}
            {...register("confirm", {
              required: "La confirmacion es obligatoria.",
            })}
          />

          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-3 inset-y-0 flex items-center text-slate-500"
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
          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
            <MdError size={14} />
            <span>{errors.confirm.message}</span>
          </div>
        )}
      </div>

      <button
        disabled={isPending || !!successMsg}
        className={clsx(
          "mt-3 py-3 rounded-lg text-sm font-semibold tracking-wide transition",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_12px_30px_rgba(79,70,229,0.35)]":
              !successMsg && !isPending,
            "bg-gray-300 text-gray-500": isPending || successMsg,
          }
        )}
      >
        {isPending ? "Guardando..." : "Restablecer contraseña"}
      </button>

      <Link
        href="/auth/login"
        className="mt-0.5 text-center text-sm font-semibold text-slate-500"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  );
};
