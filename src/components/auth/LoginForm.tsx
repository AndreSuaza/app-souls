"use client";

import clsx from "clsx";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdError, MdCheckCircle } from "react-icons/md";
import { authenticate } from "@/actions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type FormInputs = {
  email: string;
  password: string;
};

interface FormLoginProps {
  isVerified: boolean;
  callbackUrl?: string;
}

export const LoginForm = ({ isVerified, callbackUrl }: FormLoginProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    startTransition(async () => {
      const resp = await authenticate(data);
      if (!resp.success && resp.message) {
        setError(resp.message);
      } else {
        await update();
        const nextUrl = callbackUrl && callbackUrl.trim() ? callbackUrl : "/";
        // Mantiene el flujo normal si no se recibe callbackUrl.
        router.push(nextUrl);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {isVerified && (
        <div className="flex items-center gap-2 text-green-600 text-xs my-4 px-2 py-2 bg-green-50 border border-green-200 rounded">
          <MdCheckCircle size={18} />
          <span>
            Correo electrónico verificado, ahora puedes iniciar sesión.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs my-4 px-2 py-2 bg-red-50 border border-red-200 rounded">
          <MdError size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col">
        <label
          htmlFor="email"
          className="text-sm font-semibold tracking-[0.12em] text-slate-600"
        >
          Correo electrónico
        </label>

        <input
          className={clsx(
            "mt-2 px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
            {
              "border-red-500": errors.email,
              "border-slate-200": !errors.email,
            }
          )}
          type="email"
          placeholder="Ingresa tu correo electrónico"
          {...register("email", {
            required: {
              value: true,
              message: "El campo 'email' es requerido",
            },
            pattern: {
              value: /^\S+@\S+$/i,
              message:
                "El correo ingresado no es válido. Verifica e inténtalo nuevamente.",
            },
          })}
        />

        {errors.email && (
          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
            <MdError size={14} />
            <span>{errors.email.message}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="password"
          className="text-sm font-semibold tracking-[0.12em] text-slate-600"
        >
          Contraseña
        </label>

        <div className="relative mt-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={clsx(
              "w-full px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
              {
                "border-red-500": errors.password,
                "border-slate-200": !errors.password,
              }
            )}
            {...register("password", {
              required: {
                value: true,
                message: "El campo 'contraseña' es requerido.",
              },
              minLength: {
                value: 6,
                message: "La contraseña debe tener un mínimo de 6 caracteres",
              },
            })}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
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

      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm font-semibold text-slate-500 hover:text-slate-700 inline-block"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        className={clsx(
          "mt-3 py-3 rounded-lg text-sm font-semibold tracking-wide transition inline-flex items-center justify-center gap-2",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_12px_30px_rgba(79,70,229,0.35)]":
              !isPending,
            "bg-gray-300 text-gray-500": isPending,
          }
        )}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {isPending ? "Ingresando..." : "Iniciar Sesión"}
      </button>

      {/* divisor line */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-slate-300"></div>
        <div className="px-2 text-sm font-semibold text-slate-500">O</div>
        <div className="flex-1 border-t border-slate-300"></div>
      </div>

      <Link
        href="/auth/register"
        className="bg-yellow-500 hover:bg-yellow-600 text-center text-sm font-semibold tracking-wide transition shadow-[0_12px_30px_rgba(79,70,229,0.35)] py-3 rounded-lg"
      >
        Crear una nueva cuenta
      </Link>
    </form>
  );
};
